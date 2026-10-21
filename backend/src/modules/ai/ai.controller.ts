import type { Request, Response } from 'express';
import { aiService } from './ai.service.js';
import type { AiCommandInput, AiVerifyInput } from './ai.schema.js';

function userKeyFromRequest(req: Request): string | undefined {
  const headerKey = (req.headers['x-api-key'] || req.headers['x-gemini-api-key']) as string | undefined;
  return headerKey || (req.body as { apiKey?: string })?.apiKey;
}

export const aiController = {
  status(_req: Request, res: Response) {
    res.json(aiService.status());
  },

  async verify(req: Request, res: Response) {
    const input = req.body as AiVerifyInput;
    res.json(await aiService.verify(input));
  },

  async command(req: Request, res: Response) {
    const input = req.body as AiCommandInput;
    res.json(await aiService.command(input, userKeyFromRequest(req)));
  },
};
