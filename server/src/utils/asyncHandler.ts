// =============================================================================
// server/src/utils/asyncHandler.ts
// Wraps an async route handler so uncaught errors are forwarded to
// Express's next(err) error handler instead of causing unhandled rejections.
//
// Usage:
//   router.get('/example', asyncHandler(async (req, res) => {
//     const data = await someAsyncOperation();
//     sendSuccess(res, data);
//   }));
// =============================================================================

import type { Request, Response, NextFunction, RequestHandler } from 'express';

type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<void | Response>;

/**
 * Wraps an async Express handler and forwards errors to next().
 */
export function asyncHandler(fn: AsyncRequestHandler): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
