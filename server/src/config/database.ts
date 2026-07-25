// =============================================================================
// server/src/config/database.ts
// Prisma client singleton — prevents multiple PrismaClient instances
// across module hot-reloads in development.
// =============================================================================

import { PrismaClient } from '@prisma/client';
import { env } from './env';

declare global {
  // Allow the global var to persist across hot-reloads in dev
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log:
      env.NODE_ENV === 'development'
        ? ['query', 'warn', 'error']
        : ['warn', 'error'],
    errorFormat: 'pretty',
  });
}

// In development, reuse the existing global instance if it exists.
// In production, always create a fresh instance (global is not set).
export const prisma: PrismaClient =
  env.NODE_ENV === 'production'
    ? createPrismaClient()
    : (globalThis.__prisma ??= createPrismaClient());

/**
 * Connect to the database. Call this once at server startup.
 * Throws if the connection cannot be established.
 */
export async function connectDatabase(): Promise<void> {
  await prisma.$connect();
}

/**
 * Gracefully disconnect from the database. Call this during shutdown.
 */
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}
