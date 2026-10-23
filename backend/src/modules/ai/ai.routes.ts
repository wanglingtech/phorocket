import { Router } from 'express';
import { aiController } from './ai.controller.js';
import { validate } from '../../common/middlewares/validate.js';
import { aiLimiter } from '../../common/middlewares/rateLimit.js';
import { asyncHandler } from '../../common/utils/asyncHandler.js';
import { aiCommandSchema, aiVerifySchema } from './ai.schema.js';

export const aiRouter = Router();

aiRouter.get('/status', aiController.status);
aiRouter.post('/verify', aiLimiter, validate(aiVerifySchema), asyncHandler(aiController.verify));
aiRouter.post('/command', aiLimiter, validate(aiCommandSchema), asyncHandler(aiController.command));
