// =============================================================================
// server/src/types/express.d.ts
// Augment Express's Request interface with the authenticated user.
// This allows req.user to be typed throughout the codebase.
// =============================================================================

import type { JwtPayload } from '../utils/jwt';

declare global {
  namespace Express {
    interface Request {
      /**
       * Set by auth.middleware after a valid JWT is verified.
       * Undefined on public routes.
       */
      user?: JwtPayload;

      /** Optional request correlation ID (set by a request-id middleware) */
      requestId?: string;
    }
  }
}

export {};
