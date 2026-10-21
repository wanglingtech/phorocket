import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Email inválido').max(190),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(128)
    .regex(/[a-zA-Z]/, 'Debe contener al menos una letra')
    .regex(/[0-9]/, 'Debe contener al menos un número'),
  displayName: z.string().min(2, 'Nombre demasiado corto').max(80),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: 'Debes aceptar los Términos y Condiciones' }),
  }),
  language: z.enum(['es', 'en', 'pt', 'fr']).default('es'),
});

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Contraseña requerida').max(128),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(20, 'Refresh token inválido'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;
