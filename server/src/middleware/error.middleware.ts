// =============================================================================
// server/src/middleware/error.middleware.ts
// Global error handler. Must be registered LAST in app.ts.
//
// Handles:
//  - AppError (operational errors → clean JSON response)
//  - ZodError  (validation errors → 400)
//  - Prisma errors (known codes → mapped responses)
//  - Unhandled errors (programmer bugs → 500, full stack in dev)
// =============================================================================

import type { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { AppError } from '../utils/AppError';
import { logger } from '../config/logger';
import { env } from '../config/env';
import { sendError } from '../utils/response';
import { HTTP_STATUS } from '@smartdine/shared/constants';

export const globalErrorHandler: ErrorRequestHandler = (
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void => {
  // ----------------------------------------------------------------
  // 1. AppError — operational, user-facing
  // ----------------------------------------------------------------
  if (err instanceof AppError) {
    if (!err.isOperational) {
      logger.error('Programmer error', { error: err.message, stack: err.stack, url: req.url });
    } else {
      logger.warn('Operational error', { error: err.message, code: err.code, url: req.url });
    }

    sendError(res, err.statusCode, err.message, err.code);
    return;
  }

  // ----------------------------------------------------------------
  // 2. ZodError — shouldn't reach here if using validate middleware,
  //    but handle defensively
  // ----------------------------------------------------------------
  if (err instanceof ZodError) {
    const message = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
    logger.warn('Unhandled ZodError', { message, url: req.url });
    sendError(res, HTTP_STATUS.BAD_REQUEST, message, 'VALIDATION_ERROR');
    return;
  }

  // ----------------------------------------------------------------
  // 3. Prisma known errors
  // ----------------------------------------------------------------
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    logger.warn('Prisma known error', { code: err.code, meta: err.meta, url: req.url });

    switch (err.code) {
      case 'P2002':
        sendError(
          res,
          HTTP_STATUS.CONFLICT,
          `A record with this ${String((err.meta?.['target'] as string[])?.join(', '))} already exists`,
          'UNIQUE_CONSTRAINT',
        );
        return;
      case 'P2025':
        sendError(res, HTTP_STATUS.NOT_FOUND, 'Record not found', 'NOT_FOUND');
        return;
      case 'P2003':
        sendError(res, HTTP_STATUS.BAD_REQUEST, 'Foreign key constraint failed', 'FK_CONSTRAINT');
        return;
      default:
        sendError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Database error', `PRISMA_${err.code}`);
        return;
    }
  }

  // ----------------------------------------------------------------
  // 4. Unknown / programmer error
  // ----------------------------------------------------------------
  const error = err instanceof Error ? err : new Error(String(err));
  logger.error('Unhandled error', { error: error.message, stack: error.stack, url: req.url });

  sendError(
    res,
    HTTP_STATUS.INTERNAL_SERVER_ERROR,
    env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    'INTERNAL_ERROR',
  );
};

// ----------------------------------------------------------------
// 404 handler — catch-all for unregistered routes
// ----------------------------------------------------------------
export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
  next(AppError.notFound(`Route ${req.method} ${req.path}`));
};
