// =============================================================================
// server/src/validators/reservation.validator.ts
// Zod validation schemas for reservation endpoints.
// =============================================================================

import { z } from 'zod';

export const createReservationSchema = z.object({
  time: z.string().datetime({ message: 'Invalid ISO datetime string' }),
  partySize: z.number().int().min(1, 'Party size must be at least 1'),
  tableId: z.string().uuid('Invalid table ID').optional(),
});

export const updateReservationSchema = z.object({
  time: z.string().datetime().optional(),
  partySize: z.number().int().min(1).optional(),
  tableId: z.string().uuid().optional(),
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']).optional(),
});

export const reservationIdParamsSchema = z.object({
  id: z.string().uuid('Invalid reservation ID'),
});

export const getReservationsQuerySchema = z.object({
  userId: z.string().uuid().optional(),
  tableId: z.string().uuid().optional(),
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']).optional(),
  date: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().optional().default(20),
});

export type CreateReservationInput = z.infer<typeof createReservationSchema>;
export type UpdateReservationInput = z.infer<typeof updateReservationSchema>;
export type GetReservationsQuery = z.infer<typeof getReservationsQuerySchema>;
