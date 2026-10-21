# Roadmap Phorocket

Plan por fases. Cada fase se implementa por bloques revisables. Los precios/infra se detallan en [budget.md](budget.md).

## Fase 0 — Monorepo y base ✅ (en curso)
- [x] Estructura pnpm workspaces: `frontend/`, `backend/`, `database/`, `tests/api/`
- [x] Frontend limpio (solo SPA; proxy `/api` → `localhost:4000`)
- [x] Colección Bruno (health, ai, auth)
- [x] Docs base + borradores legales + budget
- [x] `.agents/` + `AGENTS.md`
- [ ] Eliminar `frontend/server.ts` (backend migrado y verificado)

## Fase 1 — Backend base y auth ✅
- [x] Express modular (routes/controller/service/schema)
- [x] Health, módulo AI migrado (validación zod, catálogo acotado a 50)
- [x] Seguridad: helmet, CORS whitelist, rate-limit, validación, logs pino, errores centralizados
- [x] Prisma: `User`, `RefreshToken`, `UserLegalAcceptance`
- [x] Auth JWT: register (acepta términos legales versionados), login, refresh con rotación, me
- [ ] Aplicar migración inicial en MySQL local (pendiente: MySQL activo + credenciales)
- [ ] Verificar suite Bruno completa con BD

**Criterio de aceptación:** `pnpm dev:api` arranca, `pnpm dev:web` sirve la SPA, suite Bruno de health/ai pasa sin BD y auth pasa con BD.

## Fase 2 — Dominio musical
- Entidades: `Track`, `Playlist`, `PlaylistTrack`, `Favorite`, `HistoryItem`, `UserSettings`
- CRUD + seed del catálogo legal curado
- Pipeline de subida server-side: magic bytes, SHA-256 dedupe, ffprobe, cuotas, procedencia (ver [content-governance.md](content-governance.md))
- Blobs en R2 (nube) / carpeta filesystem (local)
- Frontend: capa de servicios API con fallback offline; migración desde localStorage
- i18n: infraestructura i18next + traducción es/en/pt/fr

## Fase 3 — Modo local
- Schema SQLite generado desde el canónico MySQL (`pnpm db:gen-sqlite`)
- `MODE=local`: SQLite + storage filesystem + sin paywall duro
- Scripts de instalación: `scripts/install.ps1` y `install.sh`
- Auto-update: manifiesto en GitHub Releases + backup automático de BD antes de migrar
- Docs: `self-hosting.md`

## Fase 4 — SaaS / Billing
- Stripe (núcleo) + PayPal + Ko-fi (donaciones/claves de soporte)
- Planes Free/Pro/Patron con entitlements
- Módulo admin de precios: histórico `plan_price` con `valid_from/valid_to`, promos, grandfathering
- Webhooks firmados; checkout hosteado (sin datos de tarjeta propios)
- Aceptación legal re-verificada al cambiar versión de documentos

## Fase 5 — Admin / Observabilidad
- Panel `/admin` (rol ADMIN) en la misma app
- Dashboard de métricas, error ingestion con fingerprints, audit_log
- AI-Ops: asistente IA con errores anonimizados → diagnóstico
- Feature flags por plan/rol/porcentaje
- Herramientas de storage: purga de huérfanos, cuotas, reportes/takedown
- Módulo admin de traducciones con IA (resto de idiomas)

## Fase 6 — QA / CI
- Vitest (unit/integration con supertest), Playwright (E2E)
- GitHub Actions: lint, typecheck, tests, Bruno smoke, migrate check
- Automatización de releases (changeset + changelog)

## Fase 7 — Despliegue producción
- Frontend → Vercel Pro · API + MySQL → Railway · Blobs → R2
- Dominio, monitoreo, staging, backups automáticos de BD
- Proceso de release según [updates.md](updates.md)

## Fase 8 — Distribución desktop
- Empaquetado Tauri de `frontend/` + backend embebido
- Auto-updater con firma de código (Windows OV / Apple Developer)
- Tiendas / página de descargas

## Reglas transversales
1. Migraciones destructivas nunca en el mismo release (expand-contract).
2. Nueva feature ⇒ detrás de feature flag hasta verificación.
3. Cambios de API ⇒ actualizar `docs/api.md` y Bruno en el mismo PR.
4. Secrets nunca en el repo; solo `.env.example`.
