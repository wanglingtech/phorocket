# Desarrollo

## Requisitos

- Node.js ≥ 20 (recomendado 24 — ver `.nvmrc`)
- pnpm 12 (`corepack enable` o `npm i -g pnpm`)
- MySQL 8+ (solo para Fase 1+: `database/.env` con credenciales)

## Setup

```bash
git clone <repo> && cd phorocket
pnpm install

# Configurar entornos
cp backend/.env.example backend/.env        # completar JWT secrets y DATABASE_URL
cp database/.env.example database/.env      # credenciales MySQL
cp frontend/.env.example frontend/.env      # opcional en dev

# Generar cliente Prisma
pnpm db:generate

# Migrar BD (requiere MySQL activo y base de datos creada)
# CREATE DATABASE phorocket CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
pnpm db:migrate
```

## Comandos (raíz)

| Comando | Acción |
|---|---|
| `pnpm dev` | API (4000) + Web (5173) en paralelo |
| `pnpm dev:api` | Solo backend |
| `pnpm dev:web` | Solo frontend |
| `pnpm build` | Build de todos los packages |
| `pnpm lint` / `pnpm typecheck` | `tsc` en todos los packages |
| `pnpm db:migrate` | `prisma migrate dev` |
| `pnpm db:deploy` | `prisma migrate deploy` (producción) |
| `pnpm db:studio` | Prisma Studio |
| `pnpm db:seed` | Seed (admin si `ADMIN_EMAIL`/`ADMIN_PASSWORD` en entorno) |

## Puertos

| Servicio | Puerto |
|---|---|
| API | 4000 |
| Web (Vite) | 5173 (proxy `/api` → 4000) |

## Estructura del backend

Ver [architecture.md](architecture.md). Al añadir un módulo nuevo:

1. `src/modules/<nombre>/<nombre>.{schema,routes,controller,service}.ts`
2. Registrar rutas en `src/app.ts`
3. Añadir requests a `tests/api/collections/<nombre>/`
4. Documentar en `docs/api.md`

## Pruebas API (Bruno)

Abrir `tests/api/` como colección en [Bruno](https://usebruno.com) (selección local `local`). Ejecutar en orden: health → ai → auth. Los tokens se guardan automáticamente en variables de la colección.

## Seed admin

```bash
# Windows (PowerShell)
$env:ADMIN_EMAIL="admin@phorocket.dev"; $env:ADMIN_PASSWORD="TuPass123!"; pnpm db:seed
```
