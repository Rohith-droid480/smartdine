// =============================================================================
// server/src/validators/menu.validator.ts
// Zod validation schemas for menu endpoints.
// =============================================================================

import { z } from 'zod';

export const createMenuItemSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).trim(),
  description: z.string().min(2, 'Description must be at least 2 characters').max(1000).trim(),
  price: z.number().positive('Price must be a positive number'),
  category: z.string().min(2, 'Category must be at least 2 characters').max(50).trim(),
  available: z.boolean().optional().default(true),
  imageUrl: z.string().url('Invalid image URL').optional().or(z.literal('')),
});

export const updateMenuItemSchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  description: z.string().min(2).max(1000).trim().optional(),
  price: z.number().positive().optional(),
  category: z.string().min(2).max(50).trim().optional(),
  available: z.boolean().optional(),
  imageUrl: z.string().url('Invalid image URL').optional().or(z.literal('')),
});

export const menuIdParamsSchema = z.object({
  id: z.string().uuid('Invalid menu item ID'),
});

export const getMenuItemsQuerySchema = z.object({
  category: z.string().optional(),
  available: z
    .string()
    .optional()
    .transform((val) => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      return undefined;
    }),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().optional().default(20),
});

export type CreateMenuItemInput = z.infer<typeof createMenuItemSchema>;
export type UpdateMenuItemInput = z.infer<typeof updateMenuItemSchema>;
export type GetMenuItemsQuery = z.infer<typeof getMenuItemsQuerySchema>;
