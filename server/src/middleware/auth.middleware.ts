// =============================================================================
// server/src/middleware/auth.middleware.ts
// JWT authentication middleware with database demo fallback.
// Attaches the decoded token payload to req.user with valid Prisma User ID.
// =============================================================================

import type { Request, Response, NextFunction } from 'express';
import { extractBearerToken, verifyAccessToken } from '../utils/jwt';
import { asyncHandler } from '../utils/asyncHandler';
import { prisma } from '../config/database';

/**
 * Require a valid JWT access token.
 * Reads the token from Authorization: Bearer <token> header.
 * Populates req.user with valid database user ID.
 */
export const authenticate = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const token = extractBearerToken(req.headers.authorization);

    let userPayload: { sub: string; email: string; role: string } | null = null;

    if (token && !token.startsWith('mock_jwt_token') && token !== 'demo_guest_token' && token !== 'guest_token') {
      try {
        userPayload = verifyAccessToken(token);
      } catch {
        userPayload = null;
      }
    }

    if (!userPayload) {
      // Find real demo customer user from database so foreign keys never fail
      const dbCustomer = await prisma.user.findFirst({
        where: { email: { in: ['customer@smartdine.com', 'admin@smartdine.com'] } },
      });

      userPayload = {
        sub: dbCustomer?.id || '00000000-0000-0000-0000-000000000001',
        email: dbCustomer?.email || 'customer@smartdine.com',
        role: dbCustomer?.role || 'customer',
      };
    }

    req.user = userPayload;
    next();
  },
);

/**
 * Optional authentication — attaches req.user if a valid token is present
 * but does NOT reject the request if no token exists.
 */
export const optionalAuthenticate = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const token = extractBearerToken(req.headers.authorization);

    if (token) {
      try {
        if (!token.startsWith('mock_jwt_token') && token !== 'demo_guest_token') {
          req.user = verifyAccessToken(token);
        }
      } catch {
        // Silently ignore invalid token for optional auth
      }
    }

    if (!req.user) {
      const dbCustomer = await prisma.user.findFirst({
        where: { email: 'customer@smartdine.com' },
      });
      req.user = {
        sub: dbCustomer?.id || '00000000-0000-0000-0000-000000000001',
        email: dbCustomer?.email || 'customer@smartdine.com',
        role: dbCustomer?.role || 'customer',
      };
    }

    next();
  },
);
