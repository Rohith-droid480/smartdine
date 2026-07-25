// =============================================================================
// server/src/middleware/auth.middleware.ts
// JWT authentication middleware.
// Attaches the decoded token payload to req.user.
// =============================================================================

import type { Request, Response, NextFunction } from 'express';
import { extractBearerToken, verifyAccessToken } from '../utils/jwt';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';

/**
 * Require a valid JWT access token.
 * Reads the token from Authorization: Bearer <token> header.
 * Populates req.user on success.
 */
export const authenticate = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const token = extractBearerToken(req.headers.authorization);

    if (!token) {
      throw AppError.unauthorized('No access token provided');
    }

    req.user = verifyAccessToken(token);
    next();
  },
);

/**
 * Optional authentication — attaches req.user if a valid token is present
 * but does NOT reject the request if no token exists.
 * Useful for routes that behave differently for authenticated vs anonymous users.
 */
export const optionalAuthenticate = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const token = extractBearerToken(req.headers.authorization);

    if (token) {
      try {
        req.user = verifyAccessToken(token);
      } catch {
        // Silently ignore invalid token for optional auth
      }
    }

    next();
  },
);
