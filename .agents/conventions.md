# Convenciones Phorocket

Detalle de convenciones (resumen en `AGENTS.md`).

## Backend (Express modular)

```
modules/<nombre>/
├─ <n>.routes.ts      # Router + rate-limit + validate(schema)
├─ <n>.controller.ts  # req/res únicamente; llama al service
├─ <n>.service.ts     # negocio; lanza AppError.*; sin Express
├─ <n>.schema.ts      # zod schemas + tipos inferidos
└─ <n>.repository.ts  # Prisma (si el módulo tiene datos)
```

- Respuestas exitosas: JSON plano o `{ data: ... }`; errores SIEMPRE `{ error: { code, message, details? } }`.
- Validar TODO input con zod (`validate(schema)` en routes).
- Rate-limit en endpoints sensibles (`authLimiter`, `aiLimiter`).

## Base de datos

- IDs: `cuid()` por defecto.
- Timestamps: `createdAt`/`updatedAt` en todas las entidades.
- Mapas snake_case: `@@map("tabla")`.
- Monedas: enteros en centavos (`amount_minor`).
- Charset utf8mb4.

## Frontend

- Tailwind 4 + clases del sistema de diseño cyberpunk (acentos `--accent-primary`, fondos `#07060c`).
- Estados de UI en `MusicContext` (a dividir por slices cuando crezca).
- Accesibilidad: `aria-*` en controles del player; shortcuts globales documentados en README.

## i18n

- Claves namespaces: `common.*`, `player.*`, `library.*`, `settings.*`, `ai.*`, `admin.*`, `billing.*`, `legal.*`, `errors.*`.
- Placeholders: `{{variable}}`.

## Seguridad

- argon2 para contraseñas; JWT access 15m / refresh 7d rotatorio.
- Nunca persistir API keys de usuarios en texto plano.
- Logs sin PII ni secretos.
