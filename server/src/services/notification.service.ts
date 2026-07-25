// =============================================================================
// server/src/services/notification.service.ts
// Notification business logic.
// =============================================================================

import { AppError } from '../utils/AppError';
import * as notificationRepo from '../repositories/notification.repository';
import * as userRepo from '../repositories/user.repository';
import { paginate } from '@smartdine/shared/utils';
import type { Notification as SharedNotification, NotificationChannel } from '@smartdine/shared/types';
import type { Notification as PrismaNotification } from '@prisma/client';
import type {
  CreateNotificationInput,
  GetNotificationsQuery,
} from '../validators/notification.validator';

function toSharedNotification(n: PrismaNotification): SharedNotification {
  return {
    id: n.id,
    userId: n.userId,
    message: n.message,
    read: n.read,
    channel: (n.channel === 'in_app' ? 'in-app' : 'email') as NotificationChannel,
    createdAt: n.createdAt.toISOString(),
  };
}

export async function createNotification(input: CreateNotificationInput): Promise<SharedNotification> {
  const user = await userRepo.findUserById(input.userId);
  if (!user) {
    throw AppError.notFound('User');
  }

  const notification = await notificationRepo.createNotification({
    userId: input.userId,
    message: input.message,
    channel: input.channel === 'email' ? 'email' : 'in_app',
  });

  return toSharedNotification(notification);
}

export async function markNotificationRead(
  id: string,
  currentUserId: string,
  userRole: string,
): Promise<SharedNotification> {
  const existing = await notificationRepo.findNotificationById(id);
  if (!existing) {
    throw AppError.notFound('Notification');
  }

  if (userRole === 'customer' && existing.userId !== currentUserId) {
    throw AppError.forbidden('You can only modify your own notifications');
  }

  const updated = await notificationRepo.markNotificationRead(id);
  return toSharedNotification(updated);
}

export async function markAllNotificationsRead(currentUserId: string): Promise<{ count: number }> {
  const count = await notificationRepo.markAllNotificationsRead(currentUserId);
  return { count };
}

export async function listNotifications(
  query: GetNotificationsQuery,
  currentUserId: string,
  userRole: string,
) {
  const targetUserId = userRole === 'customer' ? currentUserId : (query.userId ?? currentUserId);

  const total = await notificationRepo.countNotificationsByUser(targetUserId, query.read);
  const paginationMeta = paginate({ page: query.page, limit: query.limit }, total);

  const notifications = await notificationRepo.findNotificationsByUser(
    targetUserId,
    query.read,
    paginationMeta.offset,
    paginationMeta.limit,
  );

  return {
    items: notifications.map(toSharedNotification),
    pagination: {
      page: paginationMeta.page,
      limit: paginationMeta.limit,
      total: paginationMeta.total,
      totalPages: paginationMeta.totalPages,
    },
  };
}
