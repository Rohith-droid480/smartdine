// =============================================================================
// server/src/validators/billing.validator.ts
// Zod validation schemas for billing endpoints.
// =============================================================================

import { z } from 'zod';

export const generateBillSchema = z.object({
  orderId: z.string().uuid('Invalid order ID'),
  discountPercentage: z.number().min(0).max(100).optional(),
  discountAmount: z.number().min(0).optional(),
  includeServiceCharge: z.boolean().optional().default(true),
});

export const orderIdParamsSchema = z.object({
  orderId: z.string().uuid('Invalid order ID'),
});

export type GenerateBillInput = z.infer<typeof generateBillSchema>;
