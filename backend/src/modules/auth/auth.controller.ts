import type { Request, Response } from 'express';
import { authService } from './auth.service.js';
import type { LoginInput, RefreshInput, RegisterInput } from './auth.schema.js';

export const authController = {
  async register(req: Request, res: Response) {
    const input = req.body as RegisterInput;
    const result = await authService.register(input, req.ip);
    res.status(201).json(result);
  },

  async login(req: Request, res: Response) {
    const input = req.body as LoginInput;
    const result = await authService.login(input, req.ip, req.headers['user-agent']);
    res.json(result);
  },

  async refresh(req: Request, res: Response) {
    const input = req.body as RefreshInput;
    const result = await authService.refresh(input, req.ip, req.headers['user-agent']);
    res.json(result);
  },

  async me(req: Request, res: Response) {
    const user = await authService.me(req.user!.sub);
    res.json({ user });
  },
};
