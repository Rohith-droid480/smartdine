// =============================================================================
// server/src/utils/jwt.ts
// JWT sign / verify helpers.
// Keeps all JWT logic in one place — never import jsonwebtoken directly
// in controllers or services.
// =============================================================================

import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from './AppError';

export interface JwtPayload {
  sub: string;      // user id
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// ---------------------------------------------------------------------------
// Access token
// ---------------------------------------------------------------------------

/**
 * Sign a new access token for a user.
 */
export function signAccessToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  const options: jwt.SignOptions = {
    algorithm: 'HS256',
    // StringValue is a branded type from `ms` — double-cast is the strict-mode safe pattern
    expiresIn: env.JWT_EXPIRES_IN as unknown as jwt.SignOptions['expiresIn'],
  };
  return jwt.sign(payload, env.JWT_SECRET, options);
}

/**
 * Verify and decode an access token.
 * Throws AppError.unauthorized on failure.
 */
export function verifyAccessToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw AppError.unauthorized('Access token has expired', 'TOKEN_EXPIRED');
    }
    throw AppError.unauthorized('Invalid access token', 'TOKEN_INVALID');
  }
}

// ---------------------------------------------------------------------------
// Refresh token
// ---------------------------------------------------------------------------

/**
 * Sign a new refresh token.
 */
export function signRefreshToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  const options: jwt.SignOptions = {
    algorithm: 'HS256',
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as unknown as jwt.SignOptions['expiresIn'],
  };
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, options);
}

/**
 * Verify and decode a refresh token.
 * Throws AppError.unauthorized on failure.
 */
export function verifyRefreshToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;
  } catch {
    throw AppError.unauthorized('Invalid or expired refresh token', 'REFRESH_TOKEN_INVALID');
  }
}

// ---------------------------------------------------------------------------
// Token pair helper
// ---------------------------------------------------------------------------

/**
 * Generate both access and refresh tokens for a user.
 */
export function generateTokenPair(payload: Omit<JwtPayload, 'iat' | 'exp'>): TokenPair {
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  // Decode to get actual expiry
  const decoded = jwt.decode(accessToken) as JwtPayload;
  const now = Math.floor(Date.now() / 1000);
  const expiresIn = (decoded.exp ?? now + 3600) - now;

  return { accessToken, refreshToken, expiresIn };
}

/**
 * Extract a raw bearer token from an Authorization header.
 * Returns null if the header is missing or not a Bearer token.
 */
export function extractBearerToken(authHeader: string | undefined): string | null {
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7).trim();
  return token.length > 0 ? token : null;
}
