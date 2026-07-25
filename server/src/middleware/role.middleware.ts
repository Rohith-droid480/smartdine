// =============================================================================
// server/src/middleware/role.middleware.ts
// Role-based access control middleware.
// Must be used AFTER authenticate middleware.
// =============================================================================

import type { Request, Response, NextFunction } from 'express';
import type { RequestHandler } from 'express';
import type { UserRole } from '@smartdine/shared/types';
import { AppError } from '../utils/AppError';

/**
 * Require the authenticated user to have one of the specified roles.
 *
 * @example
 * // Restrict a route to staff and admins only
 * router.get('/orders', authenticate, requireRole('staff', 'admin'), ordersController.getAll);
 */
export function requireRole(...roles: UserRole[]): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(AppError.unauthorized('Authentication required'));
      return;
    }

    if (!roles.includes(req.user.role as UserRole)) {
      next(
        AppError.forbidden(
          `This action requires one of the following roles: ${roles.join(', ')}`,
          'INSUFFICIENT_ROLE',
        ),
      );
      return;
    }

    next();
  };
}

/**
 * Require admin role. Convenience wrapper around requireRole.
 */
export const requireAdmin: RequestHandler = requireRole('admin');

/**
 * Require staff or admin role.
 */
export const requireStaff: RequestHandler = requireRole('staff', 'admin');
