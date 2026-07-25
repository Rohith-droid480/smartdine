// =============================================================================
// server/src/routes/v1/auth.route.ts
// Auth endpoints — all under /api/v1/auth
// =============================================================================

import { Router } from 'express';
import passport from 'passport';
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
import { env } from '../../config/env';

const router = Router();

// ---------------------------------------------------------------------------
// Public routes (with auth rate limiting)
// ---------------------------------------------------------------------------
router.post('/signup', authRateLimiter, validate({ body: signupSchema }), authController.signup);
router.post('/verify-otp', authRateLimiter, validate({ body: verifyOtpSchema }), authController.verifyOtp);
router.post('/login', authRateLimiter, validate({ body: loginSchema }), authController.login);
router.post('/logout', validate({ body: refreshTokenSchema }), authController.logout);

// ---------------------------------------------------------------------------
// Protected routes
// ---------------------------------------------------------------------------
router.get('/me', authenticate, authController.getMe);

// ---------------------------------------------------------------------------
// Google OAuth
// ---------------------------------------------------------------------------
if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
  // Initiate Google OAuth flow — redirects user to Google's consent screen
  router.get(
    '/google',
    passport.authenticate('google', {
      scope: ['profile', 'email'],
      session: false,
    }),
  );

  // Google OAuth callback — handles the redirect from Google
  router.get(
    '/google/callback',
    passport.authenticate('google', {
      session: false,
      failureRedirect: `${env.CUSTOMER_WEB_URL}/login?error=google_auth_failed`,
    }),
    authController.googleCallback,
  );
} else {
  // Google OAuth not configured — return 501 on both routes
  router.get('/google', (_req, res) => {
    res.status(501).json({
      success: false,
      error: 'Google OAuth not configured. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_CALLBACK_URL in .env',
    });
  });
  router.get('/google/callback', (_req, res) => {
    res.status(501).json({
      success: false,
      error: 'Google OAuth not configured',
    });
  });
}

export default router;
