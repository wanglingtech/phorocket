import type { Request, Response } from 'express';
import { AppError } from '../errors/AppError.js';

export function notFound(_req: Request, _res: Response) {
  throw AppError.notFound('Ruta no encontrada');
}
