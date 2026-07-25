// =============================================================================
// server/src/routes/v1/staff.route.ts
// Staff endpoints — mounted at /api/v1/staff
// Strictly Admin-only.
// =============================================================================

import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireAdmin } from '../../middleware/role.middleware';
import { validate } from '../../middleware/validate.middleware';
import {
  createStaffSchema,
  updateStaffSchema,
  staffIdParamsSchema,
  getStaffQuerySchema,
} from '../../validators/staff.validator';
import * as staffController from '../../controllers/staff.controller';

const router = Router();

// All staff endpoints require authentication and Admin role
router.use(authenticate, requireAdmin);

router.get(
  '/',
  validate({ query: getStaffQuerySchema }),
  staffController.listStaff,
);

router.get(
  '/:id',
  validate({ params: staffIdParamsSchema }),
  staffController.getStaff,
);

router.post(
  '/',
  validate({ body: createStaffSchema }),
  staffController.createStaff,
);

router.patch(
  '/:id',
  validate({ params: staffIdParamsSchema, body: updateStaffSchema }),
  staffController.updateStaff,
);

router.delete(
  '/:id',
  validate({ params: staffIdParamsSchema }),
  staffController.deleteStaff,
);

export default router;
