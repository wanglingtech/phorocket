# Despliegue (modo web)

## Stack de producción

| Pieza | Proveedor | Plan | Coste |
|---|---|---|---|
| Frontend | Vercel | Pro ($20/mes — Hobby prohíbe uso comercial) | ver [budget.md](budget.md) |
| API + MySQL | Railway | Hobby ($5/mes + uso) | idem |
| Archivos de audio | Cloudflare R2 | Free (10GB) → pay-as-you-go | idem |
| Dominio | registrador | ~$12/año | |

## Flujo de release

Ver [updates.md](updates.md). Resumen: merge a main → CI gates → Vercel (atómico, rollback) → Railway rolling deploy → `prisma migrate deploy` automático al arrancar.

## Variables de entorno (producción)

**Vercel (frontend):** `VITE_API_URL=https://api.tudominio.com`

**Railway (API):** todas las de `backend/.env.example` con valores reales:
`NODE_ENV=production`, `PORT` (Railway lo inyecta), `CORS_ORIGINS=https://tudominio.com`, `DATABASE_URL` (MySQL de Railway), `JWT_*` (secretos fuertes únicos), `GEMINI_API_KEY`.

**R2:** bucket + API token con permisos de escritura; variables `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET` (Fase 2).

## Pasos Vercel

1. Importar repo → proyecto apuntando a `frontend/`
2. Build: `pnpm build` · Output: `frontend/dist`
3. Env: `VITE_API_URL`
4. Dominio + SSL automático

## Pasos Railway

1. Nuevo proyecto → Service desde repo (root: `backend/`)
2. Build: `pnpm install --frozen-lockfile && pnpm --filter @phorocket/api build`
3. Start: `pnpm --filter @phorocket/api start`
4. Add-on: MySQL → copiar `DATABASE_URL`
5. Al primer arranque ejecuta `pnpm db:deploy` (job o en el start)
6. Dominio privado + env vars

## Monitoreo

- Logs: pines de Railway/Vercel + (Fase 5) error ingestion propia
- Health check: `GET /health` cada 5 min (cron o UptimeRobot free)
- Alertas: correo por fallos de health y por tasa de errores 5xx

## Rollback

- Frontend: Vercel → deployments → Promote anterior (segundos)
- API: Railway → redeploy del commit anterior
- BD: solo migraciones expand-contract; restore desde backup del proveedor si hace falta
