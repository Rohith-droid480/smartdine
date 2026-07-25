// =============================================================================
// server/src/controllers/auth.controller.ts
// Thin controllers — parse request, call service, send response.
// Zero business logic here.
// =============================================================================

import type { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess, sendCreated } from '../utils/response';
import { AppError } from '../utils/AppError';
import { HTTP_STATUS } from '@smartdine/shared/constants';
import { env } from '../config/env';

export const signup = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = await authService.signup(req.body);
  sendCreated(res, result, result.message);
});

export const verifyOtp = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = await authService.verifyOtp(req.body);
  sendSuccess(res, result, HTTP_STATUS.OK, 'Email verified successfully');
});

export const login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = await authService.login(req.body);
  sendSuccess(res, result, HTTP_STATUS.OK, 'Login successful');
});

export const getMe = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  // req.user is guaranteed to exist — authenticate middleware runs first
  const user = await authService.getMe(req.user!.sub);
  sendSuccess(res, user);
});

export const logout = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.body as { refreshToken?: string };
  if (refreshToken) {
    await authService.logout(refreshToken);
  }
  sendSuccess(res, null, HTTP_STATUS.OK, 'Logged out successfully');
});

export const googleCallback = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  // Passport attaches the authenticated user to req.user via the strategy's done() callback.
  // However, passport's user is the Prisma User model, not our JwtPayload.
  // We access it through req.user (which passport populates).
  const googleUser = req.user as unknown as {
    id: string;
    email: string;
    name: string;
    role: string;
    createdAt: Date;
  };

  if (!googleUser) {
    throw AppError.unauthorized('Google authentication failed');
  }

  const authResponse = await authService.handleGoogleCallback(googleUser);

  // Redirect to frontend with tokens as query params
  // The frontend will extract these and store them
  const redirectUrl = new URL('/auth/callback', env.CUSTOMER_WEB_URL);
  redirectUrl.searchParams.set('accessToken', authResponse.tokens.accessToken);
  redirectUrl.searchParams.set('refreshToken', authResponse.tokens.refreshToken);
  redirectUrl.searchParams.set('expiresIn', String(authResponse.tokens.expiresIn));

  res.redirect(redirectUrl.toString());
});

