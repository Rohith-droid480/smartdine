// =============================================================================
// server/src/validators/notification.validator.ts
// Zod validation schemas for notification endpoints.
// =============================================================================

import { z } from 'zod';

export const createNotificationSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  message: z.string().min(1, 'Message is required').max(500).trim(),
  channel: z.enum(['in_app', 'email']).optional().default('in_app'),
});

export const notificationIdParamsSchema = z.object({
  id: z.string().uuid('Invalid notification ID'),
});

export const getNotificationsQuerySchema = z.object({
  userId: z.string().uuid().optional(),
  read: z
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

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
export type GetNotificationsQuery = z.infer<typeof getNotificationsQuerySchema>;
