# Patrones reutilizables

Patrones genéricos, **sin acoplamiento a Phorocket**, candidatos a migrarse a skills globales (`~/.config/opencode/`) cuando se validen en 2+ proyectos.

## 1. Env validada con zod (backend Express/TS)

```ts
// config/env.ts
import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  // ...más variables
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error(parsed.error.issues);
  process.exit(1);
}
export const env = parsed.data;
```

## 2. AppError + errorHandler central

```ts
export class AppError extends Error {
  constructor(public readonly statusCode: number, public readonly code: string, message: string, public readonly details?: unknown) {
    super(message);
  }
  static badRequest(m: string, d?: unknown) { return new AppError(400, 'BAD_REQUEST', m, d); }
  static unauthorized(m = 'No autorizado', c = 'UNAUTHORIZED') { return new AppError(401, c, m); }
  static notFound(m = 'No encontrado', c = 'NOT_FOUND') { return new AppError(404, c, m); }
}
// errorHandler middleware: AppError → su status; ZodError → 400; resto → 500 genérico en prod
```

## 3. JWT access/refresh con rotación

- Access: 15 min, payload mínimo (`sub`, rol).
- Refresh: token aleatorio, se guarda solo el hash SHA-256; en cada uso se revoca y emite uno nuevo.
- `authenticate` middleware verifica Bearer; `authorize(...roles)` para roles.

## 4. Módulo Express completo

```
<n>.routes.ts    Router + validate(schema) + rateLimit
<n>.controller.ts  req.body typed → service → res.json
<n>.service.ts   lógica + AppError; inyectar deps si es testable
<n>.schema.ts    zod + export type Infer
```

## 5. Validación de uploads (concepto)

magic bytes → tamaño/duración → dedupe SHA-256 → metadatos (ffprobe) → campos requeridos (procedencia/derechos) → tmp → mover a destino → registrar. Limpiar tmp en cualquier fallo.
