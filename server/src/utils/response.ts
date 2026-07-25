// =============================================================================
// server/src/utils/response.ts
// Standardised response formatters.
// Every API response is wrapped in ApiResponse<T> (see shared/types).
// Controllers should ONLY use these helpers — never call res.json() directly.
// =============================================================================

import type { Response } from 'express';
import type { ApiResponse, PaginatedResponse } from '@smartdine/shared/types';
import { HTTP_STATUS } from '@smartdine/shared/constants';

// ---------------------------------------------------------------------------
// Success responses
// ---------------------------------------------------------------------------

/**
 * Send a successful response.
 */
export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode: number = HTTP_STATUS.OK,
  message?: string,
): Response {
  const body: ApiResponse<T> = {
    success: true,
    data,
    ...(message && { message }),
  };
  return res.status(statusCode).json(body);
}

/**
 * Send a 201 Created response.
 */
export function sendCreated<T>(res: Response, data: T, message?: string): Response {
  return sendSuccess(res, data, HTTP_STATUS.CREATED, message);
}

/**
 * Send a 204 No Content response.
 */
export function sendNoContent(res: Response): Response {
  return res.status(HTTP_STATUS.NO_CONTENT).send();
}

/**
 * Send a paginated list response.
 */
export function sendPaginated<T>(
  res: Response,
  data: T[],
  pagination: PaginatedResponse<T>['pagination'],
  statusCode = HTTP_STATUS.OK,
): Response {
  const body: PaginatedResponse<T> = {
    success: true,
    data,
    pagination,
  };
  return res.status(statusCode).json(body);
}

// ---------------------------------------------------------------------------
// Error responses
// ---------------------------------------------------------------------------

/**
 * Send an error response.
 * Prefer throwing AppError — this is a low-level escape hatch.
 */
export function sendError(
  res: Response,
  statusCode: number,
  error: string,
  message?: string,
): Response {
  const body: ApiResponse<never> = {
    success: false,
    error,
    ...(message && { message }),
  };
  return res.status(statusCode).json(body);
}
