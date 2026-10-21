# Arquitectura

## Monorepo (pnpm workspaces)

```
phorocket/
├─ frontend/     @phorocket/web   SPA React 19 + Vite + Tailwind 4
├─ backend/      @phorocket/api   Express 4 + TypeScript (arquitectura modular)
├─ database/     @phorocket/db    Prisma (MySQL canónico / SQLite local futuro)
├─ tests/api/    Colección Bruno
├─ docs/         Esta documentación
└─ .agents/      Contexto para agentes de IA
```

**Por qué workspaces:** tipos compartidos sin duplicar, scripts unificados en la raíz (`pnpm dev`, `pnpm db:migrate`), instalación única con lockfile único.

## Backend: monolito modular

Capas por módulo (suficiente escala actual; escalable sin sobreingeniería):

```
src/
├─ server.ts              bootstrap (listen, shutdown)
├─ app.ts                 factory de Express (middleware + rutas)
├─ config/env.ts          env validada con zod (falla rápido si falta algo)
├─ config/legal.ts        versiones de documentos legales
├─ common/
│  ├─ errors/AppError.ts  errores con statusCode + code + details
│  ├─ middlewares/        errorHandler, notFound, validate(zod), authenticate, rateLimit
│  └─ utils/              logger (pino), jwt
└─ modules/<nombre>/
   ├─ <n>.routes.ts       definición + rate-limit + validación
   ├─ <n>.controller.ts   parsea HTTP → llama service → responde
   ├─ <n>.service.ts      lógica de negocio (sin Express)
   ├─ <n>.schema.ts       contratos zod (entrada/salida)
   └─ <n>.repository.ts   acceso a datos Prisma (cuando aplique)
```

**Reglas:**
- `common/` nunca importa de `modules/` (las utilidades van en common).
- Los services no conocen `req`/`res`.
- Los errores de negocio se lanzan con `AppError.*`; el `errorHandler` central los formatea.
- Errores responden `{ error: { code, message, details? } }` — códigos estables, textos traducibles por el cliente.

## Datos

- **Fuente de verdad:** MySQL en nube (schema canónico en `database/prisma/schema.prisma`).
- **Modo local:** SQLite generado desde el canónico (Fase 3); `MODE=local` en env.
- **Blobs de audio:** nunca en la BD. R2 (nube) / carpeta filesystem (local).
- **Client-side actual (legacy):** localStorage + IndexedDB se migran a API en Fase 2 con fallback offline.

## Flujo de una petición

```
Cliente → helmet → cors → express.json → pino-http → rate-limit
        → router (validate zod) → controller → service → (repository/prisma)
        → respuesta JSON | errorHandler
```

## Despliegue

| Pieza | Modo web | Modo local |
|---|---|---|
| Frontend | Vercel (estático) | Tauri (Fase 8) o `vite preview` |
| API | Railway (Express larga duración) | proceso embebido en el dispositivo |
| BD | MySQL (Railway/PlanetScale) | SQLite embebido |
| Archivos | Cloudflare R2 | carpeta del usuario |

## Decisiones clave (ADR cortos)

1. **Express sobre Fastify/Nest:** el tamaño actual no justifica Nest; la estructura modular deja la puerta abierta a migrar sin reescribir.
2. **Prisma sobre TypeORM/Knex:** tipado fuerte, migraciones maduras, soporte MySQL+SQLite.
3. **JWT access/refresh con rotación:** stateless + revocación efectiva vía refresh tokens.
4. **Vite proxy en dev:** evita CORS en desarrollo; en prod el frontend usa `VITE_API_URL`.
5. **YouTube solo IFrame oficial:** sin extracción de streams (ToS de Google); ver [content-governance.md](content-governance.md).
