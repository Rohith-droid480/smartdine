// =============================================================================
// server/src/controllers/notification.controller.ts
// Thin controller for notification routes.
// =============================================================================

import type { Request, Response } from 'express';
import * as notificationService from '../services/notification.service';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/response';

export const createNotification = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = await notificationService.createNotification(req.body);
  sendCreated(res, result, 'Notification sent successfully');
});

export const markNotificationRead = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params as { id: string };
  const result = await notificationService.markNotificationRead(id, req.user!.sub, req.user!.role);
  sendSuccess(res, result, 200, 'Notification marked as read');
});

export const markAllNotificationsRead = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = await notificationService.markAllNotificationsRead(req.user!.sub);
  sendSuccess(res, result, 200, 'All notifications marked as read');
});

export const listNotifications = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { items, pagination } = await notificationService.listNotifications(
    req.query as any,
    req.user!.sub,
    req.user!.role,
  );
  sendPaginated(res, items, pagination);
});
