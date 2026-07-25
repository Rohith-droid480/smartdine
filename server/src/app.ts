// =============================================================================
// server/src/app.ts
// Express application factory.
//
// Separating app creation from server.listen() allows:
// - Clean unit testing (import app without binding a port)
// - Multiple entry points (e.g., serverless adapter)
// =============================================================================

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import passport from 'passport';

import { corsOptions } from './config/cors';
import { morganStream } from './config/logger';
import { env } from './config/env';
import { configurePassport } from './config/passport';
import { globalErrorHandler, notFoundHandler } from './middleware/error.middleware';
import apiRouter from './routes/index';

export function createApp(): express.Application {
  const app = express();

  // Initialize Google OAuth strategy (no-op if credentials not configured)
  configurePassport();

  // -----------------------------------------------------------------------
  // Trust proxy — required when running behind Vercel/Railway/Render reverse proxy
  // -----------------------------------------------------------------------
  app.set('trust proxy', 1);

  // -----------------------------------------------------------------------
  // Security headers
  // -----------------------------------------------------------------------
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    crossOriginEmbedderPolicy: false,
  }));

  // -----------------------------------------------------------------------
  // CORS
  // -----------------------------------------------------------------------
  app.use(cors(corsOptions));
  app.options('*', cors(corsOptions));

  // -----------------------------------------------------------------------
  // Body parsing
  // -----------------------------------------------------------------------
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(cookieParser());

  // -----------------------------------------------------------------------
  // Passport (stateless — no sessions, JWT only)
  // -----------------------------------------------------------------------
  app.use(passport.initialize());

  // -----------------------------------------------------------------------
  // Compression
  // -----------------------------------------------------------------------
  app.use(compression());

  // -----------------------------------------------------------------------
  // HTTP request logging
  // -----------------------------------------------------------------------
  if (env.NODE_ENV !== 'test') {
    app.use(
      morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev', {
        stream: morganStream,
      }),
    );
  }

  // -----------------------------------------------------------------------
  // API routes
  // -----------------------------------------------------------------------
  app.use('/api', apiRouter);

  // -----------------------------------------------------------------------
  // 404 & global error handler (MUST be last)
  // -----------------------------------------------------------------------
  app.use(notFoundHandler);
  app.use(globalErrorHandler);

  return app;
}
