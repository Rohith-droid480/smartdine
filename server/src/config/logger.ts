// =============================================================================
// server/src/config/logger.ts
// Winston structured logger.
// - In development: colourised console output
// - In production:  JSON lines to stdout (picked up by Railway/Render log drain)
// =============================================================================

import winston from 'winston';
import { env } from './env';

const { combine, timestamp, errors, json, colorize, printf } = winston.format;

const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp: ts, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
    return `${ts} [${level}]: ${stack ?? message}${metaStr}`;
  }),
);

const prodFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json(),
);

export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: env.NODE_ENV === 'production' ? prodFormat : devFormat,
  defaultMeta: { service: 'smartdine-api' },
  transports: [
    new winston.transports.Console({
      handleExceptions: true,
      handleRejections: true,
    }),
  ],
  exitOnError: false,
});

// Morgan stream adapter — pipes Morgan HTTP logs through Winston
export const morganStream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};
