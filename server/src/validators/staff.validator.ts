// =============================================================================
// server/src/validators/staff.validator.ts
// Zod validation schemas for staff management endpoints.
// =============================================================================

import { z } from 'zod';

export const createStaffSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  role: z.string().min(2, 'Role must be at least 2 characters').max(50).trim(),
  shift: z.string().min(2, 'Shift must be at least 2 characters').max(50).trim(),
});

export const updateStaffSchema = z.object({
  role: z.string().min(2).max(50).trim().optional(),
  shift: z.string().min(2).max(50).trim().optional(),
});

export const staffIdParamsSchema = z.object({
  id: z.string().uuid('Invalid staff ID'),
});

export const getStaffQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().optional().default(20),
});

export type CreateStaffInput = z.infer<typeof createStaffSchema>;
export type UpdateStaffInput = z.infer<typeof updateStaffSchema>;
export type GetStaffQuery = z.infer<typeof getStaffQuerySchema>;
