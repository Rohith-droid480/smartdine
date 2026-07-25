// =============================================================================
// server/src/repositories/user.repository.ts
// Data access layer for the User model.
// All Prisma calls related to users go here — services never import prisma directly.
// =============================================================================

import { prisma } from '../config/database';
import type { User, OtpCode } from '@prisma/client';

export type CreateUserData = {
  email: string;
  name: string;
  passwordHash?: string;
  googleId?: string;
};

export type UpdateUserData = Partial<{
  name: string;
  passwordHash: string;
  isVerified: boolean;
  role: User['role'];
}>;

// ---------------------------------------------------------------------------
// User CRUD
// ---------------------------------------------------------------------------

export async function findUserById(id: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { id } });
}

export async function findUserByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { email } });
}

export async function findUserByGoogleId(googleId: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { googleId } });
}

export async function createUser(data: CreateUserData): Promise<User> {
  return prisma.user.create({ data });
}

export async function updateUser(id: string, data: UpdateUserData): Promise<User> {
  return prisma.user.update({ where: { id }, data });
}

export async function deleteUser(id: string): Promise<User> {
  return prisma.user.delete({ where: { id } });
}

// ---------------------------------------------------------------------------
// OTP management
// ---------------------------------------------------------------------------

export async function createOtp(userId: string, code: string, expiresAt: Date): Promise<OtpCode> {
  // Invalidate any existing unused OTPs for this user before creating a new one
  await prisma.otpCode.updateMany({
    where: { userId, used: false },
    data: { used: true },
  });

  return prisma.otpCode.create({
    data: { userId, code, expiresAt },
  });
}

export async function findValidOtp(userId: string, code: string): Promise<OtpCode | null> {
  return prisma.otpCode.findFirst({
    where: {
      userId,
      code,
      used: false,
      expiresAt: { gt: new Date() },
    },
  });
}

export async function consumeOtp(otpId: string): Promise<void> {
  await prisma.otpCode.update({
    where: { id: otpId },
    data: { used: true },
  });
}

// ---------------------------------------------------------------------------
// Refresh token management
// ---------------------------------------------------------------------------

export async function saveRefreshToken(
  userId: string,
  token: string,
  expiresAt: Date,
): Promise<void> {
  await prisma.refreshToken.create({ data: { userId, token, expiresAt } });
}

export async function findRefreshToken(token: string) {
  return prisma.refreshToken.findUnique({
    where: { token },
    include: { user: true },
  });
}

export async function deleteRefreshToken(token: string): Promise<void> {
  await prisma.refreshToken.delete({ where: { token } });
}

export async function deleteAllRefreshTokensForUser(userId: string): Promise<void> {
  await prisma.refreshToken.deleteMany({ where: { userId } });
}
