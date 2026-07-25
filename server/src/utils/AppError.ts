// =============================================================================
// server/src/utils/AppError.ts
// Custom operational error class.
//
// Operational errors (AppError) are expected, user-facing errors like
// "not found" or "unauthorized". They are distinguished from programmer
// errors (TypeError, ReferenceError, etc.) in the global error handler
// so we only log stack traces for unexpected failures.
// =============================================================================

export class AppError extends Error {
  /** HTTP status code to send in the response */
  public readonly statusCode: number;

  /** Whether this is an operational error (true) or a programmer bug (false) */
  public readonly isOperational: boolean;

  /** Optional machine-readable error code for clients */
  public readonly code: string;

  constructor(
    message: string,
    statusCode: number,
    code = '',
    isOperational = true,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;

    // Restore the prototype chain (required when extending built-in classes in TS)
    Object.setPrototypeOf(this, new.target.prototype);

    // Capture a clean stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  /** 400 Bad Request */
  static badRequest(message: string, code?: string): AppError {
    return new AppError(message, 400, code);
  }

  /** 401 Unauthorized */
  static unauthorized(message = 'Authentication required', code?: string): AppError {
    return new AppError(message, 401, code);
  }

  /** 403 Forbidden */
  static forbidden(message = 'Insufficient permissions', code?: string): AppError {
    return new AppError(message, 403, code);
  }

  /** 404 Not Found */
  static notFound(resource = 'Resource', code?: string): AppError {
    return new AppError(`${resource} not found`, 404, code);
  }

  /** 409 Conflict */
  static conflict(message: string, code?: string): AppError {
    return new AppError(message, 409, code);
  }

  /** 422 Unprocessable Entity */
  static unprocessable(message: string, code?: string): AppError {
    return new AppError(message, 422, code);
  }

  /** 500 Internal Server Error — marks as non-operational (bug) */
  static internal(message = 'Internal server error'): AppError {
    return new AppError(message, 500, 'INTERNAL_ERROR', false);
  }
}
