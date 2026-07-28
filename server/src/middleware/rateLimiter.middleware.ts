// =============================================================================
// server/src/middleware/rateLimiter.middleware.ts
// Rate limiting middleware using express-rate-limit.
// Configured with active, realistic limits for multi-tab polling and demo traffic.
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
 * General API rate limiter — 600 requests per 1 minute window.
 * Supports up to 10 requests per second per IP (accommodates 5-10 concurrent polling tabs).
 */
export const apiRateLimiter = rateLimit({
  windowMs: 60_000, // 1 minute sliding window
  max: 600,         // 600 requests per minute
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
 * AI rate limiter — 60 requests per 1 minute window.
 * Protects against runaway API costs while allowing continuous query interaction.
 */
export const aiRateLimiter = rateLimit({
  windowMs: 60_000, // 1 minute sliding window
  max: 60,         // 60 requests per minute
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
 * Auth-specific limiter — 60 requests per 1 minute window.
 * Protects against auth brute-force attacks while accommodating active demo testing.
 */
export const authRateLimiter = rateLimit({
  windowMs: 60_000, // 1 minute sliding window
  max: 60,         // 60 requests per minute
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
  handler: (_req, res, _next, options) => {
    const retryAfter = Math.ceil(options.windowMs / 1000);
    res.status(options.statusCode).json(rateLimitResponse(retryAfter));
  },
  skip: (req) => env.NODE_ENV === 'test' || req.ip === '127.0.0.1',
});
