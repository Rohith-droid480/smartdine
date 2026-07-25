// =============================================================================
// server/src/middleware/validate.middleware.ts
// Zod schema validation middleware.
// Validates req.body, req.params, and req.query against provided schemas.
// =============================================================================

import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { AppError } from '../utils/AppError';

interface ValidateSchemas {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
}

/**
 * Validate request data against Zod schemas.
 * Replaces req.body / req.params / req.query with the parsed (coerced) values.
 *
 * @example
 * router.post('/login', validate({ body: loginSchema }), authController.login);
 */
export function validate(schemas: ValidateSchemas): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.params) {
        req.params = schemas.params.parse(req.params) as Record<string, string>;
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query) as Record<string, string>;
      }
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const message = err.errors
          .map((e) => `${e.path.join('.')}: ${e.message}`)
          .join('; ');
        next(AppError.badRequest(message, 'VALIDATION_ERROR'));
      } else {
        next(err);
      }
    }
  };
}
