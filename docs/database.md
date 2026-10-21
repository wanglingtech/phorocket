# Base de datos

## Proveedores

| Modo | Proveedor | Origen del schema |
|---|---|---|
| Web/nube | **MySQL 8** | `database/prisma/schema.prisma` (canónico) |
| Local (Fase 3) | **SQLite** | Generado desde el canónico (`pnpm db:gen-sqlite`) |

Los blobs de audio **nunca** se guardan en la BD — van a R2 (nube) o filesystem (local). La BD guarda solo metadatos.

## Modelos actuales (Fase 1)

- **User**: email único, passwordHash (argon2), role (USER/ADMIN), language
- **RefreshToken**: tokenHash SHA-256, expiración, rotación/revocación, userAgent, ip
- **UserLegalAcceptance**: aceptación versionada de documentos legales (terms/privacy/copyright/content)

Fase 2+: Track, Playlist, Favorite, HistoryItem, UserSettings, storage_objects, plan/plan_price/subscription (Fase 4).

## Comandos

```bash
pnpm db:generate   # regenera el client Prisma
pnpm db:migrate    # migrate dev (desarrollo; crea migración)
pnpm db:deploy     # migrate deploy (producción; aplica sin crear)
pnpm db:studio     # UI de inspección
pnpm db:seed       # seed (ADMIN_EMAIL/ADMIN_PASSWORD opcionales)
```

## Reglas de migración

1. **Expand-contract**: separar cambios incompatibles en 2+ releases (añadir → migrar datos → contratar).
2. Nunca borrar columnas en el mismo release que dejen de usarse en el código.
3. Producción solo con `prisma migrate deploy` (nunca `migrate dev`).
4. Antes de cada deploy de BD: backup (mysqldump en nube; copia de archivo en SQLite local).
5. Seeds solo con datos idempotentes (upserts).

## Charset

`utf8mb4` / `utf8mb4_unicode_ci` (soporta emojis y acentos de todos los idiomas).

## Backup (nube)

Railway/PlanetScale: activar backups automáticos del proveedor. Adicional: dump diario programado a R2 (`scripts/backup-db.sh` — Fase 7).
