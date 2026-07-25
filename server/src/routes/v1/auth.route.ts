// =============================================================================
// server/src/routes/v1/auth.route.ts
// Auth endpoints — all under /api/v1/auth
// =============================================================================

import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { authRateLimiter } from '../../middleware/rateLimiter.middleware';
import {
  signupSchema,
  loginSchema,
  verifyOtpSchema,
  refreshTokenSchema,
} from '../../validators/auth.validator';
import * as authController from '../../controllers/auth.controller';

const router = Router();

// Public routes (with auth rate limiting)
router.post('/signup', authRateLimiter, validate({ body: signupSchema }), authController.signup);
router.post('/verify-otp', authRateLimiter, validate({ body: verifyOtpSchema }), authController.verifyOtp);
router.post('/login', authRateLimiter, validate({ body: loginSchema }), authController.login);
router.post('/logout', validate({ body: refreshTokenSchema }), authController.logout);

// Protected routes
router.get('/me', authenticate, authController.getMe);

// Google OAuth (skeleton — full implementation in H6)
router.get('/google', (_req, res) => res.status(501).json({ success: false, error: 'Google OAuth coming in H6' }));
router.get('/google/callback', authController.googleCallback);

export default router;
