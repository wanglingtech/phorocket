import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { env } from './config/env.js';
import { logger } from './common/utils/logger.js';
import { errorHandler } from './common/middlewares/errorHandler.js';
import { notFound } from './common/middlewares/notFound.js';
import { globalLimiter } from './common/middlewares/rateLimit.js';
import { healthRouter } from './modules/health/health.routes.js';
import { aiRouter } from './modules/ai/ai.routes.js';
import { authRouter } from './modules/auth/auth.routes.js';

export function createApp() {
  const app = express();

  app.set('trust proxy', 1);
  app.use(helmet());
  app.use(
    cors({
      origin(origin, cb) {
        if (!origin || env.corsOrigins.includes(origin) || env.corsOrigins.includes('*')) {
          return cb(null, true);
        }
        cb(new Error('Origen no permitido por CORS'));
      },
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '2mb' }));
  app.use(
    pinoHttp({
      logger,
      autoLogging: !env.isTest,
      customLogLevel: (_req, res, err) =>
        err || res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info',
    }),
  );
  app.use(globalLimiter);

  app.use('/health', healthRouter);
  app.use('/api/health', healthRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/ai', aiRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
