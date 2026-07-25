// =============================================================================
// server/src/services/auth.service.ts
// Authentication business logic.
// Orchestrates: user repository, OTP, JWT, email delivery.
// Controllers call services — services never touch req/res.
// =============================================================================

import bcrypt from 'bcryptjs';
import { AppError } from '../utils/AppError';
import { generateTokenPair } from '../utils/jwt';
import { generateOtp } from '@smartdine/shared/utils';
import * as userRepo from '../repositories/user.repository';
import { env } from '../config/env';
import { logger } from '../config/logger';
import type { AuthResponse, User as SharedUser } from '@smartdine/shared/types';
import type { SignupInput, LoginInput, VerifyOtpInput } from '../validators/auth.validator';

const BCRYPT_ROUNDS = 12;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toSharedUser(user: { id: string; email: string; name: string; role: string; createdAt: Date }): SharedUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as SharedUser['role'],
    createdAt: user.createdAt.toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Signup
// ---------------------------------------------------------------------------

export async function signup(input: SignupInput): Promise<{ message: string; userId: string }> {
  const existing = await userRepo.findUserByEmail(input.email);
  if (existing) {
    throw AppError.conflict('An account with this email already exists', 'EMAIL_IN_USE');
  }

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  const user = await userRepo.createUser({
    email: input.email,
    name: input.name,
    passwordHash,
  });

  // Generate and send OTP for email verification
  await sendVerificationOtp(user.id, user.email);

  logger.info('New user registered', { userId: user.id, email: user.email });
  return { message: 'Account created. Please verify your email with the OTP sent.', userId: user.id };
}

// ---------------------------------------------------------------------------
// OTP delivery (shared by signup + resend)
// ---------------------------------------------------------------------------

export async function sendVerificationOtp(userId: string, email: string): Promise<void> {
  const otp = generateOtp(6);
  const expiresAt = new Date(Date.now() + env.OTP_EXPIRY_MINUTES * 60 * 1000);

  await userRepo.createOtp(userId, otp, expiresAt);

  // TODO (H6): Replace with real email via nodemailer
  logger.info(`[DEV] OTP for ${email}: ${otp}  (expires in ${env.OTP_EXPIRY_MINUTES} min)`);
}

// ---------------------------------------------------------------------------
// Verify OTP
// ---------------------------------------------------------------------------

export async function verifyOtp(input: VerifyOtpInput): Promise<AuthResponse> {
  const user = await userRepo.findUserByEmail(input.email);
  if (!user) {
    throw AppError.notFound('User');
  }

  const otpRecord = await userRepo.findValidOtp(user.id, input.otp);
  if (!otpRecord) {
    throw AppError.badRequest('Invalid or expired OTP', 'INVALID_OTP');
  }

  await userRepo.consumeOtp(otpRecord.id);
  const verifiedUser = await userRepo.updateUser(user.id, { isVerified: true });

  const tokens = generateTokenPair({ sub: verifiedUser.id, email: verifiedUser.email, role: verifiedUser.role });
  await userRepo.saveRefreshToken(
    verifiedUser.id,
    tokens.refreshToken,
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  );

  logger.info('User verified', { userId: verifiedUser.id });
  return { user: toSharedUser(verifiedUser), tokens };
}

// ---------------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------------

export async function login(input: LoginInput): Promise<AuthResponse> {
  const user = await userRepo.findUserByEmail(input.email);
  if (!user || !user.passwordHash) {
    // Use same message to prevent user enumeration
    throw AppError.unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');
  }

  const passwordMatch = await bcrypt.compare(input.password, user.passwordHash);
  if (!passwordMatch) {
    throw AppError.unauthorized('Invalid email or password', 'INVALID_CREDENTIALS');
  }

  if (!user.isVerified) {
    // Re-send OTP and tell the client to verify
    await sendVerificationOtp(user.id, user.email);
    throw AppError.unauthorized(
      'Email not verified. A new OTP has been sent to your email.',
      'EMAIL_NOT_VERIFIED',
    );
  }

  const tokens = generateTokenPair({ sub: user.id, email: user.email, role: user.role });
  await userRepo.saveRefreshToken(
    user.id,
    tokens.refreshToken,
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  );

  logger.info('User logged in', { userId: user.id });
  return { user: toSharedUser(user), tokens };
}

// ---------------------------------------------------------------------------
// Get current user
// ---------------------------------------------------------------------------

export async function getMe(userId: string): Promise<SharedUser> {
  const user = await userRepo.findUserById(userId);
  if (!user) {
    throw AppError.notFound('User');
  }
  return toSharedUser(user);
}

// ---------------------------------------------------------------------------
// Logout
// ---------------------------------------------------------------------------

export async function logout(refreshToken: string): Promise<void> {
  try {
    await userRepo.deleteRefreshToken(refreshToken);
  } catch {
    // Silently ignore — token may already be gone
  }
}

// ---------------------------------------------------------------------------
// Google OAuth callback
// ---------------------------------------------------------------------------

export async function handleGoogleCallback(googleUser: {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: Date;
}): Promise<AuthResponse> {
  const tokens = generateTokenPair({
    sub: googleUser.id,
    email: googleUser.email,
    role: googleUser.role,
  });

  await userRepo.saveRefreshToken(
    googleUser.id,
    tokens.refreshToken,
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  );

  logger.info('User logged in via Google OAuth', { userId: googleUser.id });
  return { user: toSharedUser(googleUser), tokens };
}

