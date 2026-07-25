// =============================================================================
// server/src/validators/order.validator.ts
// Zod validation schemas for order endpoints.
// =============================================================================

import { z } from 'zod';

export const createOrderItemSchema = z.object({
  menuItemId: z.string().uuid('Invalid menu item ID'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
});

export const createOrderSchema = z.object({
  tableId: z.string().uuid('Invalid table ID').optional(),
  items: z
    .array(createOrderItemSchema)
    .min(1, 'Order must contain at least one menu item'),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['placed', 'preparing', 'ready', 'served', 'billed']),
});

export const updateOrderSchema = z.object({
  tableId: z.string().uuid('Invalid table ID').optional().nullable(),
  status: z.enum(['placed', 'preparing', 'ready', 'served', 'billed']).optional(),
});

export const orderIdParamsSchema = z.object({
  id: z.string().uuid('Invalid order ID'),
});

export const getOrdersQuerySchema = z.object({
  userId: z.string().uuid().optional(),
  tableId: z.string().uuid().optional(),
  status: z.enum(['placed', 'preparing', 'ready', 'served', 'billed']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().optional().default(20),
});

export type CreateOrderItemInput = z.infer<typeof createOrderItemSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;
export type GetOrdersQuery = z.infer<typeof getOrdersQuerySchema>;
