// =============================================================================
// server/src/types/express.d.ts
// Augment Express's Request interface with the authenticated user.
//
// Since we use both passport (for Google OAuth) and our own JWT middleware,
// req.user can be either:
//   - JwtPayload (set by auth.middleware after JWT verification)
//   - A Prisma User object (set by passport during Google OAuth callback)
//
// We keep JwtPayload as the primary type and cast in the Google callback.
// =============================================================================

import type { JwtPayload } from '../utils/jwt';

declare global {
  namespace Express {
    // Override passport's empty User interface with our JwtPayload
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface User extends JwtPayload {}

    interface Request {
      /**
       * Set by auth.middleware after a valid JWT is verified.
       * Or by passport during OAuth callbacks (cast required).
       * Undefined on public routes.
       */
      user?: JwtPayload;

      /** Optional request correlation ID (set by a request-id middleware) */
      requestId?: string;
    }
  }
}

export {};
