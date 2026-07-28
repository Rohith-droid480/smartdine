// =============================================================================
// server/src/routes/v1/health.route.ts
// GET /api/v1/health — liveness + readiness check for Render/Vercel proxies.
// =============================================================================

import { Router } from 'express';
import type { Request, Response } from 'express';
import { prisma } from '../../config/database';
import { sendSuccess } from '../../utils/response';
import { logger } from '../../config/logger';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  const start = Date.now();

  let dbStatus: 'ok' | 'degraded' = 'ok';
  let dbLatencyMs: number | null = null;

  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatencyMs = Date.now() - dbStart;
  } catch (err) {
    dbStatus = 'degraded';
    logger.warn('Health check: DB connection check warning', { error: (err as Error).message });
  }

  res.status(200).json(
    sendSuccess(res, {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      version: process.env['npm_package_version'] ?? '1.0.0',
      environment: process.env['NODE_ENV'] ?? 'production',
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
