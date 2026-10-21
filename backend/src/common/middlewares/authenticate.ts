import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../errors/AppError.js';
import { verifyAccessToken, type JwtPayload } from '../utils/jwt.js';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw AppError.unauthorized('Falta el token de acceso', 'MISSING_TOKEN');
  }
  req.user = verifyAccessToken(header.slice(7));
  next();
}

export function authorize(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw AppError.unauthorized('Falta el token de acceso', 'MISSING_TOKEN');
    }
    if (roles.length && !roles.includes(req.user.role)) {
      throw AppError.forbidden('No tienes permisos para esta acción', 'FORBIDDEN_ROLE');
    }
    next();
  };
}
