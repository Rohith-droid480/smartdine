// =============================================================================
// server/src/routes/v1/inventory.route.ts
// Inventory endpoints — mounted at /api/v1/inventory
// =============================================================================

import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireStaff, requireAdmin } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import {
  createInventoryItemSchema,
  updateInventoryItemSchema,
  inventoryIdParamsSchema,
  getInventoryQuerySchema,
} from '../../validators/inventory.validator';
import * as inventoryController from '../../controllers/inventory.controller';

const router = Router();

// All inventory endpoints require authentication and staff/admin role
router.use(authenticate, requireStaff);

router.get('/low-stock', inventoryController.getLowStockItems);

router.get(
  '/',
  validate({ query: getInventoryQuerySchema }),
  inventoryController.listInventoryItems,
);

router.get(
  '/:id',
  validate({ params: inventoryIdParamsSchema }),
  inventoryController.getInventoryItem,
);

router.post(
  '/',
  validate({ body: createInventoryItemSchema }),
  inventoryController.createInventoryItem,
);

router.patch(
  '/:id',
  validate({ params: inventoryIdParamsSchema, body: updateInventoryItemSchema }),
  inventoryController.updateInventoryItem,
);

router.delete(
  '/:id',
  requireAdmin,
  validate({ params: inventoryIdParamsSchema }),
  inventoryController.deleteInventoryItem,
);

export default router;
