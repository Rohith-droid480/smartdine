// =============================================================================
// server/src/routes/v1/menu.route.ts
// Menu endpoints — mounted at /api/v1/menu
// =============================================================================

import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireStaff } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import {
  createMenuItemSchema,
  updateMenuItemSchema,
  menuIdParamsSchema,
  getMenuItemsQuerySchema,
} from '../../validators/menu.validator';
import * as menuController from '../../controllers/menu.controller';

const router = Router();

// Public routes
router.get('/', validate({ query: getMenuItemsQuerySchema }), menuController.listMenuItems);
router.get('/:id', validate({ params: menuIdParamsSchema }), menuController.getMenuItem);

// Protected routes (Staff/Admin only)
router.post(
  '/',
  authenticate,
  requireStaff,
  validate({ body: createMenuItemSchema }),
  menuController.createMenuItem,
);

router.patch(
  '/:id',
  authenticate,
  requireStaff,
  validate({ params: menuIdParamsSchema, body: updateMenuItemSchema }),
  menuController.updateMenuItem,
);

router.delete(
  '/:id',
  authenticate,
  requireStaff,
  validate({ params: menuIdParamsSchema }),
  menuController.deleteMenuItem,
);

export default router;
