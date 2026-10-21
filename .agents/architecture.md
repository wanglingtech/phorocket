# Arquitectura — notas para agentes

Ver `docs/architecture.md` para la versión completa. Puntos que un agente debe recordar:

## Mapa rápido

- `frontend/` → SPA; **no** contiene backend (se migró a `backend/`).
- `backend/src/app.ts` → registrar aquí cada router nuevo.
- `backend/src/config/env.ts` → si necesitas una env nueva, añadirla al schema zod (falla rápido si falta).
- `database/prisma/schema.prisma` → fuente de verdad del modelo de datos (MySQL).
- `tests/api/` → colección Bruno; mantener sincronizada con `docs/api.md`.

## Decisiones vigentes

| Tema | Decisión |
|---|---|
| BD web | MySQL (Railway/PlanetScale) |
| BD local | SQLite generada del canónico (Fase 3) |
| Blobs | Cloudflare R2 (nube) / filesystem (local) — nunca en la BD |
| Pagos | Stripe + PayPal + Ko-fi (Fase 4) |
| Admin | `/admin` en la misma app (Fase 5) |
| i18n | i18next; es/en/pt/fr al lanzar |
| Desktop | Tauri (Fase 8) |
| YouTube | Solo IFrame oficial |

## Modo de entrega por bloques

El trabajo avanza por fases de `docs/roadmap.md`. Al empezar una tarea: identifica la fase, trabaja solo en lo que ella cubre, actualiza docs + Bruno, corre `pnpm typecheck`.
