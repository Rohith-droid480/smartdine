// =============================================================================
// server/src/routes/v1/order.route.ts
// Order endpoints — mounted at /api/v1/orders
// =============================================================================

import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireStaff } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import {
  createOrderSchema,
  updateOrderStatusSchema,
  orderIdParamsSchema,
  getOrdersQuerySchema,
} from '../../validators/order.validator';
import * as orderController from '../../controllers/order.controller';

const router = Router();

// All order endpoints require authentication
router.use(authenticate);

router.post(
  '/',
  validate({ body: createOrderSchema }),
  orderController.createOrder,
);

router.get(
  '/',
  validate({ query: getOrdersQuerySchema }),
  orderController.listOrders,
);

router.get(
  '/:id',
  validate({ params: orderIdParamsSchema }),
  orderController.getOrder,
);

router.patch(
  '/:id/status',
  requireStaff,
  validate({ params: orderIdParamsSchema, body: updateOrderStatusSchema }),
  orderController.updateOrderStatus,
);

router.post(
  '/:id/cancel',
  validate({ params: orderIdParamsSchema }),
  orderController.cancelOrder,
);

export default router;
