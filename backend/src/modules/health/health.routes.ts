import { Router } from 'express';

export const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'phorocket-api',
    version: process.env.npm_package_version ?? '0.1.0',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});
