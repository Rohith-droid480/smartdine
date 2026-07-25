// =============================================================================
// server/src/config/cors.ts
// CORS configuration. Origins are read from env (comma-separated list)
// so you can whitelist both frontend apps without touching code.
// =============================================================================

import type { CorsOptions } from 'cors';
import { env } from './env';

const allowedOrigins: string[] = env.CORS_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean);

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, Postman)
    if (!origin) {
      callback(null, true);
      return;
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin "${origin}" is not allowed`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  exposedHeaders: ['X-Request-ID'],
  maxAge: 86_400, // 24 h preflight cache
};
