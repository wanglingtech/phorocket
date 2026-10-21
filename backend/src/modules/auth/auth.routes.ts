import { Router } from 'express';
import { authController } from './auth.controller.js';
import { validate } from '../../common/middlewares/validate.js';
import { authLimiter } from '../../common/middlewares/rateLimit.js';
import { authenticate } from '../../common/middlewares/authenticate.js';
import { loginSchema, refreshSchema, registerSchema } from './auth.schema.js';

export const authRouter = Router();

authRouter.post('/register', authLimiter, validate(registerSchema), authController.register);
authRouter.post('/login', authLimiter, validate(loginSchema), authController.login);
authRouter.post('/refresh', authLimiter, validate(refreshSchema), authController.refresh);
authRouter.get('/me', authenticate, authController.me);
