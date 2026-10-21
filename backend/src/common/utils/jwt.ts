import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { AppError } from '../errors/AppError.js';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  lang: string;
}

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_TTL as jwt.SignOptions['expiresIn'],
    issuer: 'phorocket-api',
  });
}

export function verifyAccessToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, env.JWT_ACCESS_SECRET, { issuer: 'phorocket-api' }) as JwtPayload;
  } catch {
    throw AppError.unauthorized('Token de acceso inválido o expirado', 'INVALID_TOKEN');
  }
}
