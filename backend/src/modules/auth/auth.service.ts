import * as argon2 from 'argon2';
import { createHash, randomBytes } from 'node:crypto';
import { prisma } from '@phorocket/db';
import { AppError } from '../../common/errors/AppError.js';
import { signAccessToken, type JwtPayload } from '../../common/utils/jwt.js';
import { LEGAL_DOC_VERSIONS } from '../../config/legal.js';
import type { LoginInput, RegisterInput, RefreshInput } from './auth.schema.js';

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

async function issueRefreshToken(userId: string, userAgent?: string, ip?: string) {
  const token = randomBytes(48).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 días
  await prisma.refreshToken.create({
    data: { userId, tokenHash: sha256(token), expiresAt, userAgent, ip },
  });
  return token;
}

function publicUser(user: { id: string; email: string; displayName: string; role: string; language: string; createdAt: Date }) {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    role: user.role,
    language: user.language,
    createdAt: user.createdAt,
  };
}

export const authService = {
  async register(input: RegisterInput, ip?: string) {
    const existing = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
    if (existing) {
      throw AppError.conflict('Ya existe una cuenta con este email', 'EMAIL_TAKEN');
    }

    const passwordHash = await argon2.hash(input.password);
    const user = await prisma.user.create({
      data: {
        email: input.email.toLowerCase(),
        passwordHash,
        displayName: input.displayName,
        language: input.language,
        legalAcceptances: {
          create: Object.entries(LEGAL_DOC_VERSIONS).map(([docType, docVersion]) => ({
            docType,
            docVersion,
            ip,
          })),
        },
      },
    });

    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role, lang: user.language };
    const accessToken = signAccessToken(payload);
    const refreshToken = await issueRefreshToken(user.id, undefined, ip);

    return { user: publicUser(user), accessToken, refreshToken };
  },

  async login(input: LoginInput, ip?: string, userAgent?: string) {
    const user = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
    if (!user) {
      throw AppError.unauthorized('Credenciales inválidas', 'INVALID_CREDENTIALS');
    }

    const valid = await argon2.verify(user.passwordHash, input.password);
    if (!valid) {
      throw AppError.unauthorized('Credenciales inválidas', 'INVALID_CREDENTIALS');
    }

    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role, lang: user.language };
    const accessToken = signAccessToken(payload);
    const refreshToken = await issueRefreshToken(user.id, userAgent, ip);

    return { user: publicUser(user), accessToken, refreshToken };
  },

  async refresh(input: RefreshInput, ip?: string, userAgent?: string) {
    const stored = await prisma.refreshToken.findUnique({ where: { tokenHash: sha256(input.refreshToken) } });

    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw AppError.unauthorized('Refresh token inválido o expirado', 'INVALID_REFRESH_TOKEN');
    }

    // Rotación: revocar el usado y emitir uno nuevo
    await prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    const user = await prisma.user.findUnique({ where: { id: stored.userId } });
    if (!user) {
      throw AppError.unauthorized('Usuario no encontrado', 'INVALID_REFRESH_TOKEN');
    }

    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role, lang: user.language };
    const accessToken = signAccessToken(payload);
    const refreshToken = await issueRefreshToken(user.id, userAgent, ip);

    return { user: publicUser(user), accessToken, refreshToken };
  },

  async me(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw AppError.notFound('Usuario no encontrado', 'USER_NOT_FOUND');
    }
    return publicUser(user);
  },
};
