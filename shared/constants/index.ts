// =============================================================================
// SmartDine — Shared Constants
// =============================================================================

// ---------------------------------------------------------------------------
// HTTP Status Codes
// ---------------------------------------------------------------------------

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

export type HttpStatus = (typeof HTTP_STATUS)[keyof typeof HTTP_STATUS];

// ---------------------------------------------------------------------------
// User Roles
// ---------------------------------------------------------------------------

export const USER_ROLES = {
  CUSTOMER: 'customer',
  STAFF: 'staff',
  ADMIN: 'admin',
} as const;

// ---------------------------------------------------------------------------
// Order Statuses (in lifecycle order)
// ---------------------------------------------------------------------------

export const ORDER_STATUS = {
  PLACED: 'placed',
  PREPARING: 'preparing',
  READY: 'ready',
  SERVED: 'served',
  BILLED: 'billed',
} as const;

/** Valid next statuses for a given current status */
export const ORDER_STATUS_TRANSITIONS: Record<string, string[]> = {
  placed: ['preparing', 'billed'],
  preparing: ['ready'],
  ready: ['served'],
  served: ['billed'],
  billed: [],
};

// ---------------------------------------------------------------------------
// Reservation Statuses
// ---------------------------------------------------------------------------

export const RESERVATION_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
} as const;

// ---------------------------------------------------------------------------
// Table Statuses
// ---------------------------------------------------------------------------

export const TABLE_STATUS = {
  FREE: 'free',
  RESERVED: 'reserved',
  OCCUPIED: 'occupied',
} as const;

// ---------------------------------------------------------------------------
// Notification Channels
// ---------------------------------------------------------------------------

export const NOTIFICATION_CHANNEL = {
  IN_APP: 'in-app',
  EMAIL: 'email',
} as const;

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------

export const API_VERSION = 'v1' as const;
export const API_PREFIX = `/api/${API_VERSION}` as const;

// ---------------------------------------------------------------------------
// Pagination defaults
// ---------------------------------------------------------------------------

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;
