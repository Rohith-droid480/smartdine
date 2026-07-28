// =============================================================================
// server/src/server.ts
// Process entry point — starts HTTP server immediately for Render health checks.
// Handles graceful shutdown on SIGTERM/SIGINT.
// =============================================================================

import './config/env';

import { createApp } from './app';
import { connectDatabase, disconnectDatabase } from './config/database';
import { logger } from './config/logger';
import { env } from './config/env';

const PORT = env.PORT || 4000;

async function main(): Promise<void> {
  logger.info(`Starting SmartDine API in ${env.NODE_ENV} mode...`);

  // 1. Create Express app instance
  const app = createApp();

  // 2. Start listening on HTTP PORT immediately so Render proxy binds successfully
  const server = app.listen(PORT, () => {
    logger.info(`✅  Server listening on port ${PORT}`);
    logger.info(`   Health endpoint: /api/v1/health`);
  });

  // 3. Connect database in background without blocking port binding
  try {
    await connectDatabase();
    logger.info('✅  Database connected successfully');
  } catch (err) {
    logger.error('⚠️ Database initial connection warning', { error: (err as Error).message });
  }

  // -----------------------------------------------------------------------
  // Graceful shutdown
  // -----------------------------------------------------------------------
  let isShuttingDown = false;

  async function shutdown(signal: string): Promise<void> {
    if (isShuttingDown) return;
    isShuttingDown = true;

    logger.info(`${signal} received — starting graceful shutdown`);

    server.close(async () => {
      logger.info('HTTP server closed');
      try {
        await disconnectDatabase();
        logger.info('Database disconnected');
      } catch (err) {
        logger.error('Error during database disconnect', { error: (err as Error).message });
      }
      logger.info('Shutdown complete');
      process.exit(0);
    });

    // Force shutdown after 10 seconds if something hangs
    setTimeout(() => {
      logger.error('Shutdown timeout — forcing exit');
      process.exit(1);
    }, 10_000);
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // -----------------------------------------------------------------------
  // Unhandled rejection / exception safety nets
  // -----------------------------------------------------------------------
  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled rejection caught', { reason });
  });

  process.on('uncaughtException', (err) => {
    logger.error('Uncaught exception caught', { error: err.message, stack: err.stack });
  });
}

main().catch((err: unknown) => {
  logger.error('Fatal startup error', { error: (err as Error).message });
});
