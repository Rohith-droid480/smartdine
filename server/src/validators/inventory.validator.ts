// =============================================================================
// server/src/validators/inventory.validator.ts
// Zod validation schemas for inventory endpoints.
// =============================================================================

import { z } from 'zod';

export const createInventoryItemSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).trim(),
  quantity: z.number().min(0, 'Quantity cannot be negative'),
  unit: z.string().min(1, 'Unit is required').max(20).trim(),
  reorderThreshold: z.number().min(0, 'Reorder threshold cannot be negative'),
});

export const updateInventoryItemSchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  quantity: z.number().min(0, 'Quantity cannot be negative').optional(),
  unit: z.string().min(1).max(20).trim().optional(),
  reorderThreshold: z.number().min(0, 'Reorder threshold cannot be negative').optional(),
});

export const inventoryIdParamsSchema = z.object({
  id: z.string().uuid('Invalid inventory item ID'),
});

export const getInventoryQuerySchema = z.object({
  search: z.string().optional(),
  lowStockOnly: z
    .string()
    .optional()
    .transform((val) => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      return undefined;
    }),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().optional().default(20),
});

export type CreateInventoryItemInput = z.infer<typeof createInventoryItemSchema>;
export type UpdateInventoryItemInput = z.infer<typeof updateInventoryItemSchema>;
export type GetInventoryQuery = z.infer<typeof getInventoryQuerySchema>;
