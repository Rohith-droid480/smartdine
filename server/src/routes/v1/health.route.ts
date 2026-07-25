// =============================================================================
// server/src/routes/v1/health.route.ts
// GET /api/v1/health — liveness + readiness check.
// =============================================================================

import { Router } from 'express';
import type { Request, Response } from 'express';
import { prisma } from '../../config/database';
import { sendSuccess } from '../../utils/response';
import { logger } from '../../config/logger';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  const start = Date.now();

  // Check database connectivity
  let dbStatus: 'ok' | 'error' = 'ok';
  let dbLatencyMs: number | null = null;

  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatencyMs = Date.now() - dbStart;
  } catch (err) {
    dbStatus = 'error';
    logger.warn('Health check: DB connection failed', { error: (err as Error).message });
  }

  const healthy = dbStatus === 'ok';
  const statusCode = healthy ? 200 : 503;

  res.status(statusCode).json(
    sendSuccess(res, {
      status: healthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      version: process.env['npm_package_version'] ?? '1.0.0',
      environment: process.env['NODE_ENV'] ?? 'unknown',
      responseTimeMs: Date.now() - start,
      services: {
        database: {
          status: dbStatus,
          latencyMs: dbLatencyMs,
        },
      },
    }),
  );
});

export default router;
