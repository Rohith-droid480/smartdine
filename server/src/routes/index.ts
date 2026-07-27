// =============================================================================
// server/src/routes/index.ts
// Central router — mounts all versioned sub-routers.
// Adding a new domain = one import + one router.use() call here.
// =============================================================================

import { Router } from 'express';
import { apiRateLimiter } from '../middleware/rateLimiter.middleware';
import healthRouter from './v1/health.route';
import authRouter from './v1/auth.route';
import menuRouter from './v1/menu.route';
import reservationRouter from './v1/reservation.route';
import orderRouter from './v1/order.route';
import inventoryRouter from './v1/inventory.route';
import staffRouter from './v1/staff.route';
import notificationRouter from './v1/notification.route';
import billingRouter from './v1/billing.route';
import aiRouter from './v1/ai.route';

const router = Router();

// Apply general rate limiter to all API routes
router.use(apiRateLimiter);

// ---------------------------------------------------------------------------
// v1 Routes
// ---------------------------------------------------------------------------
router.use('/v1/health', healthRouter);
router.use('/v1/auth', authRouter);
router.use('/v1/menu', menuRouter);
router.use('/v1/reservations', reservationRouter);
router.use('/v1/orders', orderRouter);
router.use('/v1/inventory', inventoryRouter);
router.use('/v1/staff', staffRouter);
router.use('/v1/notifications', notificationRouter);
router.use('/v1/billing', billingRouter);
router.use('/v1/ai', aiRouter);

export default router;
