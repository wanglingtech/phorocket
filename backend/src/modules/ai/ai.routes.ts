import { Router } from 'express';
import { aiController } from './ai.controller.js';
import { validate } from '../../common/middlewares/validate.js';
import { aiLimiter } from '../../common/middlewares/rateLimit.js';
import { aiCommandSchema, aiVerifySchema } from './ai.schema.js';

export const aiRouter = Router();

aiRouter.get('/status', aiController.status);
aiRouter.post('/verify', aiLimiter, validate(aiVerifySchema), aiController.verify);
aiRouter.post('/command', aiLimiter, validate(aiCommandSchema), aiController.command);
