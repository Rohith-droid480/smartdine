// =============================================================================
// server/src/routes/index.ts
// Central router — mounts all versioned sub-routers.
// Adding a new domain = one import + one router.use() call here.
// =============================================================================

import { Router } from 'express';
import { apiRateLimiter } from '../middleware/rateLimiter.middleware';
import healthRouter from './v1/health.route';
import authRouter from './v1/auth.route';

const router = Router();

// Apply general rate limiter to all API routes
router.use(apiRateLimiter);

// ---------------------------------------------------------------------------
// v1 Routes
// ---------------------------------------------------------------------------
router.use('/v1/health', healthRouter);
router.use('/v1/auth', authRouter);

// ---------------------------------------------------------------------------
// Future routes (uncomment as they are built in subsequent hours)
// ---------------------------------------------------------------------------
// router.use('/v1/menu', menuRouter);
// router.use('/v1/reservations', reservationRouter);
// router.use('/v1/orders', orderRouter);
// router.use('/v1/inventory', inventoryRouter);
// router.use('/v1/staff', staffRouter);
// router.use('/v1/notifications', notificationRouter);
// router.use('/v1/ai', aiRouter);
// router.use('/v1/analytics', analyticsRouter);

export default router;
