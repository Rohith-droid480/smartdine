// =============================================================================
// server/src/routes/v1/notification.route.ts
// Notification endpoints — mounted at /api/v1/notifications
// =============================================================================

import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireStaff } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import {
  createNotificationSchema,
  notificationIdParamsSchema,
  getNotificationsQuerySchema,
} from '../../validators/notification.validator';
import * as notificationController from '../../controllers/notification.controller';

const router = Router();

// All notification endpoints require authentication
router.use(authenticate);

router.get(
  '/',
  validate({ query: getNotificationsQuerySchema }),
  notificationController.listNotifications,
);

router.post(
  '/',
  requireStaff,
  validate({ body: createNotificationSchema }),
  notificationController.createNotification,
);

router.patch('/read-all', notificationController.markAllNotificationsRead);

router.patch(
  '/:id/read',
  validate({ params: notificationIdParamsSchema }),
  notificationController.markNotificationRead,
);

export default router;
