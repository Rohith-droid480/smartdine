// =============================================================================
// server/src/controllers/auth.controller.ts
// Thin controllers — parse request, call service, send response.
// Zero business logic here.
// =============================================================================

import type { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess, sendCreated } from '../utils/response';
import { HTTP_STATUS } from '@smartdine/shared/constants';

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

export const googleCallback = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  // TODO (H6): Implement Google OAuth callback
  sendSuccess(res, null, HTTP_STATUS.OK, 'Google OAuth not yet implemented');
});
