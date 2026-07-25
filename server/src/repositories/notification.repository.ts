// =============================================================================
// server/src/repositories/notification.repository.ts
// Data access layer for the Notification model.
// =============================================================================

import { prisma } from '../config/database';
import type { Notification, NotificationChannel } from '@prisma/client';

export type CreateNotificationData = {
  userId: string;
  message: string;
  channel?: NotificationChannel;
};

export async function findNotificationById(id: string): Promise<Notification | null> {
  return prisma.notification.findUnique({ where: { id } });
}

export async function findNotificationsByUser(
  userId: string,
  read?: boolean,
  skip?: number,
  take?: number,
): Promise<Notification[]> {
  const where: any = { userId };
  if (read !== undefined) {
    where.read = read;
  }

  return prisma.notification.findMany({
    where,
    skip,
    take,
    orderBy: { createdAt: 'desc' },
  });
}

export async function countNotificationsByUser(userId: string, read?: boolean): Promise<number> {
  const where: any = { userId };
  if (read !== undefined) {
    where.read = read;
  }

  return prisma.notification.count({ where });
}

export async function createNotification(data: CreateNotificationData): Promise<Notification> {
  return prisma.notification.create({
    data: {
      userId: data.userId,
      message: data.message,
      channel: data.channel ?? 'in_app',
    },
  });
}

export async function markNotificationRead(id: string): Promise<Notification> {
  return prisma.notification.update({
    where: { id },
    data: { read: true },
  });
}

export async function markAllNotificationsRead(userId: string): Promise<number> {
  const result = await prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });
  return result.count;
}
