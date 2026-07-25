// =============================================================================
// server/src/routes/v1/billing.route.ts
// Billing endpoints — mounted at /api/v1/billing
// =============================================================================

import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import {
  generateBillSchema,
  orderIdParamsSchema,
} from '../../validators/billing.validator';
import * as billingController from '../../controllers/billing.controller';

const router = Router();

// All billing endpoints require authentication
router.use(authenticate);

router.post(
  '/generate',
  validate({ body: generateBillSchema }),
  billingController.generateBill,
);

router.get(
  '/receipt/:orderId',
  validate({ params: orderIdParamsSchema }),
  billingController.getReceipt,
);

export default router;
