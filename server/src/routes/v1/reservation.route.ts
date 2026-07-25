// =============================================================================
// server/src/routes/v1/reservation.route.ts
// Reservation endpoints — mounted at /api/v1/reservations
// =============================================================================

import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import {
  createReservationSchema,
  updateReservationSchema,
  reservationIdParamsSchema,
  getReservationsQuerySchema,
} from '../../validators/reservation.validator';
import * as reservationController from '../../controllers/reservation.controller';

const router = Router();

// All reservation endpoints require authentication
router.use(authenticate);

router.get('/tables', reservationController.listTables);

router.post(
  '/',
  validate({ body: createReservationSchema }),
  reservationController.createReservation,
);

router.get(
  '/',
  validate({ query: getReservationsQuerySchema }),
  reservationController.listReservations,
);

router.get(
  '/:id',
  validate({ params: reservationIdParamsSchema }),
  reservationController.getReservation,
);

router.patch(
  '/:id',
  validate({ params: reservationIdParamsSchema, body: updateReservationSchema }),
  reservationController.updateReservation,
);

router.post(
  '/:id/cancel',
  validate({ params: reservationIdParamsSchema }),
  reservationController.cancelReservation,
);

export default router;
