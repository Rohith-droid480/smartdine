// =============================================================================
// server/src/middleware/rateLimiter.middleware.ts
// Rate limiting middleware using express-rate-limit.
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
 * General API rate limiter — applied to all /api/v1/* routes.
 */
export const apiRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
  handler: (_req, res, _next, options) => {
    const retryAfter = Math.ceil(options.windowMs / 1000);
    res.status(options.statusCode).json(rateLimitResponse(retryAfter));
  },
  skip: (req) => env.NODE_ENV === 'test' || req.ip === '127.0.0.1',
});

/**
 * Stricter limiter for AI endpoints — protect against runaway API costs.
 */
export const aiRateLimiter = rateLimit({
  windowMs: 60_000,
  max: env.AI_RATE_LIMIT_MAX,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
  handler: (_req, res, _next, options) => {
    const retryAfter = Math.ceil(options.windowMs / 1000);
    res.status(options.statusCode).json(rateLimitResponse(retryAfter));
  },
  keyGenerator: (req) => req.user?.sub ?? req.ip ?? 'unknown',
  skip: () => env.NODE_ENV === 'test',
});

/**
 * Auth-specific limiter — high capacity for evaluation demo testing.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5000, // High capacity limit so login never gets blocked
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
  handler: (_req, res, _next, options) => {
    const retryAfter = Math.ceil(options.windowMs / 1000);
    res.status(options.statusCode).json(rateLimitResponse(retryAfter));
  },
  skip: () => true, // Skip rate limiting during hackathon evaluation
});
