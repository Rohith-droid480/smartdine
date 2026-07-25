// =============================================================================
// SmartDine — Shared Utilities
// Pure functions only — no Node.js/browser-specific imports allowed here.
// =============================================================================

import { PAGINATION } from '../constants';

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------

/**
 * Format a Date (or ISO string) to a human-readable string.
 * e.g. "25 Jul 2026, 14:30"
 */
export function formatDate(date: Date | string, locale = 'en-IN'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Return the ISO date-only string (YYYY-MM-DD) from a Date or ISO string.
 */
export function toDateString(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0] ?? '';
}

/**
 * Check if a given Date (or string) is in the past.
 */
export function isPast(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d < new Date();
}

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

/**
 * Validate an email address format.
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validate a password meets minimum requirements.
 * At least 8 characters, one uppercase, one lowercase, one digit.
 */
export function isStrongPassword(password: string): boolean {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password)
  );
}

// ---------------------------------------------------------------------------
// Pagination helper
// ---------------------------------------------------------------------------

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  offset: number;
  total: number;
  totalPages: number;
}

/**
 * Calculate pagination metadata from query params and total count.
 */
export function paginate(params: PaginationParams, total: number): PaginationMeta {
  const page = Math.max(1, params.page ?? PAGINATION.DEFAULT_PAGE);
  const limit = Math.min(
    Math.max(1, params.limit ?? PAGINATION.DEFAULT_LIMIT),
    PAGINATION.MAX_LIMIT,
  );
  const offset = (page - 1) * limit;
  const totalPages = Math.ceil(total / limit);

  return { page, limit, offset, total, totalPages };
}

// ---------------------------------------------------------------------------
// Currency helpers
// ---------------------------------------------------------------------------

/**
 * Format a number as INR currency string.
 * e.g. 1234.5 → "₹1,234.50"
 */
export function formatCurrency(amount: number, locale = 'en-IN', currency = 'INR'): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
}

// ---------------------------------------------------------------------------
// String helpers
// ---------------------------------------------------------------------------

/**
 * Capitalize the first letter of each word.
 */
export function titleCase(str: string): string {
  return str.replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Generate a random n-digit numeric OTP string.
 */
export function generateOtp(length = 6): string {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  return otp;
}
