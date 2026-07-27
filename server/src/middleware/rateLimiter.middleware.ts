// =============================================================================
// server/src/middleware/rateLimiter.middleware.ts
// Rate limiting middleware using express-rate-limit.
// Configured with high capacity / bypass during hackathon evaluation.
// =============================================================================

import rateLimit from 'express-rate-limit';
import { env } from '../config/env';
import { HTTP_STATUS } from '@smartdine/shared/constants';

const rateLimitResponse = (retryAfter: number) => ({
  success: false,
  error: 'Too many requests — please try again later',
  retryAfter,
});

/**
 * General API rate limiter — high capacity for evaluation demo polling.
 */
export const apiRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: 10000,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
  handler: (_req, res, _next, options) => {
    const retryAfter = Math.ceil(options.windowMs / 1000);
    res.status(options.statusCode).json(rateLimitResponse(retryAfter));
  },
  skip: () => true, // Skip general rate limiting during hackathon evaluation
});

/**
 * AI rate limiter — protect against runaway API costs while allowing smooth demos.
 */
export const aiRateLimiter = rateLimit({
  windowMs: 60_000,
  max: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
  handler: (_req, res, _next, options) => {
    const retryAfter = Math.ceil(options.windowMs / 1000);
    res.status(options.statusCode).json(rateLimitResponse(retryAfter));
  },
  keyGenerator: (req) => req.user?.sub ?? req.ip ?? 'unknown',
  skip: () => true, // Skip AI rate limiting during hackathon evaluation
});

/**
 * Auth-specific limiter — high capacity for evaluation demo testing.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5000,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
  handler: (_req, res, _next, options) => {
    const retryAfter = Math.ceil(options.windowMs / 1000);
    res.status(options.statusCode).json(rateLimitResponse(retryAfter));
  },
  skip: () => true, // Skip rate limiting during hackathon evaluation
});
