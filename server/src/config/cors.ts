// =============================================================================
// server/src/config/cors.ts
// CORS configuration. Supports wildcards (*), Vercel deployments, and env whitelist.
// =============================================================================

import type { CorsOptions } from 'cors';
import { env } from './env';

const allowedOrigins: string[] = env.CORS_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean);

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) {
      callback(null, true);
      return;
    }

    // Allow wildcard '*', Vercel deployment subdomains, or exact whitelist matches
    if (
      allowedOrigins.includes('*') ||
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      origin.includes('localhost')
    ) {
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
