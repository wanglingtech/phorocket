import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './common/utils/logger.js';

const app = createApp();

const server = app.listen(env.PORT, '0.0.0.0', () => {
  logger.info(`🚀 Phorocket API escuchando en http://localhost:${env.PORT}`);
  logger.info(`   Health: http://localhost:${env.PORT}/health`);
  logger.info(`   Entorno: ${env.NODE_ENV}`);
});

function shutdown(signal: string) {
  logger.info(`${signal} recibido, cerrando servidor...`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
