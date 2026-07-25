// =============================================================================
// server/src/server.ts
// Process entry point — creates the app, connects to DB, starts listening.
// Handles graceful shutdown on SIGTERM/SIGINT.
// =============================================================================

// Load env validation first — will exit(1) on invalid config
import './config/env';

import { createApp } from './app';
import { connectDatabase, disconnectDatabase } from './config/database';
import { logger } from './config/logger';
import { env } from './config/env';

const PORT = env.PORT;

async function main(): Promise<void> {
  logger.info(`Starting SmartDine API in ${env.NODE_ENV} mode...`);

  // 1. Establish database connection
  try {
    await connectDatabase();
    logger.info('✅  Database connected');
  } catch (err) {
    logger.error('❌  Failed to connect to database', { error: (err as Error).message });
    process.exit(1);
  }

  // 2. Create Express app (all middleware registered here)
  const app = createApp();

  // 3. Start HTTP server
  const server = app.listen(PORT, () => {
    logger.info(`✅  Server listening on http://localhost:${PORT}`);
    logger.info(`   Health: http://localhost:${PORT}/api/v1/health`);
  });

  // -----------------------------------------------------------------------
  // Graceful shutdown
  // -----------------------------------------------------------------------
  let isShuttingDown = false;

  async function shutdown(signal: string): Promise<void> {
    if (isShuttingDown) return;
    isShuttingDown = true;

    logger.info(`${signal} received — starting graceful shutdown`);

    // Stop accepting new connections
    server.close(async () => {
      logger.info('HTTP server closed');

      // Disconnect Prisma
      await disconnectDatabase();
      logger.info('Database disconnected');

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
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled rejection', { reason, promise });
    // In production, crash and let the process manager restart
    if (env.NODE_ENV === 'production') {
      shutdown('unhandledRejection');
    }
  });

  process.on('uncaughtException', (err) => {
    logger.error('Uncaught exception', { error: err.message, stack: err.stack });
    shutdown('uncaughtException');
  });
}

main().catch((err: unknown) => {
  logger.error('Fatal startup error', { error: (err as Error).message });
  process.exit(1);
});
