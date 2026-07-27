// =============================================================================
// server/src/routes/v1/ai.route.ts
// AI Endpoints — mounted at /api/v1/ai
// =============================================================================

import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireStaff } from '../../middleware/role.middleware';
import { aiRateLimiter } from '../../middleware/rateLimiter.middleware';
import * as aiController from '../../controllers/ai.controller';

const router = Router();

// Apply AI rate limiter to all AI endpoints
router.use(aiRateLimiter);

// ---------------------------------------------------------------------------
// Live Sprint 1 Endpoint: Operational Insights
// Protected with authentication and staff role requirement
// ---------------------------------------------------------------------------
router.get('/insights', authenticate, requireStaff, aiController.getInsights);

// ---------------------------------------------------------------------------
// Sprint 2 Placeholders (Return HTTP 501 Not Implemented)
// ---------------------------------------------------------------------------
router.get('/recommendations', authenticate, aiController.getRecommendations);
router.get('/forecast', authenticate, requireStaff, aiController.getForecast);
router.post('/assistant', authenticate, requireStaff, aiController.getAssistant);

export default router;
