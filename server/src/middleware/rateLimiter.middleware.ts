// =============================================================================
// server/src/middleware/rateLimiter.middleware.ts
// Rate limiting middleware using express-rate-limit.
// Ultra-high capacity configured for Vibeathon evaluation days.
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
 * General API rate limiter — 6000 requests per 1 minute window.
 * High throughput capacity for multi-judge concurrent evaluations.
 */
export const apiRateLimiter = rateLimit({
  windowMs: 60_000,
  max: 6000,
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
 * AI rate limiter — 1000 requests per 1 minute window.
 */
export const aiRateLimiter = rateLimit({
  windowMs: 60_000,
  max: 1000,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
  handler: (_req, res, _next, options) => {
    const retryAfter = Math.ceil(options.windowMs / 1000);
    res.status(options.statusCode).json(rateLimitResponse(retryAfter));
  },
  keyGenerator: (req) => req.user?.sub ?? req.ip ?? 'unknown',
  skip: (req) => env.NODE_ENV === 'test' || req.ip === '127.0.0.1',
});

/**
 * Auth-specific limiter — 1000 requests per 1 minute window.
 */
export const authRateLimiter = rateLimit({
  windowMs: 60_000,
  max: 1000,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
  handler: (_req, res, _next, options) => {
    const retryAfter = Math.ceil(options.windowMs / 1000);
    res.status(options.statusCode).json(rateLimitResponse(retryAfter));
  },
  skip: (req) => env.NODE_ENV === 'test' || req.ip === '127.0.0.1',
});
