# Actualizaciones sin pérdida de datos

## Web (tú publicas → todos reciben)

1. **Merge a `main`** → CI gates: lint, typecheck, tests, Bruno smoke.
2. **Frontend** → Vercel: deploy atómico; si falla, rollback instantáneo desde el panel.
3. **API** → Railway: rolling deploy (cero downtime con ≥1 réplica; con 1 réplica, corte <30s).
4. **BD** → `prisma migrate deploy` al arrancar el nuevo proceso. Solo migraciones compatibles con la versión anterior de la API (regla expand-contract).
5. **Features nuevas** → detrás de feature flag; se activan desde `/admin` cuando esté verificada (por plan/rol/porcentaje).
6. Si el frontend rompe compat con la API vieja: desplegar API primero, o mantener rutas viejas un release.

### Expand-contract (ejemplo)

Release N (expand): añade columna `users.nickname` nullable → API empieza a escribirla.
Release N+1: frontend/otros consumidores ya la leen.
Release N+2 (contract): eliminar columna antigua `users.name` en migración separada.

**Nunca** en un mismo release: borrar columna + dejar de usarla.

## Local (el usuario recibe tu release)

1. La app consulta el manifiesto de versiones (GitHub Releases) al iniciar y cada 24h.
2. Hay actualización → notificación no intrusiva; el usuario acepta (o auto-update configurable).
3. **Backup**: copia de SQLite + carpeta de audio a `backups/<fecha>/`.
4. Aplicar migraciones locales (`db push`).
5. Reemplazar binario y reiniciar. Fallo → restaurar backup + mensaje de error con reporte.

## Versionado

Semántico: `MAJOR.MINOR.PATCH`. El frontend y la API comparten versión de release (monorepo). Changelog generado por cambiosets (Fase 6).

## Checklist de release

- [ ] CI verde en main
- [ ] Migraciones revisadas (compat + backup ok)
- [ ] Flags listos para features nuevas
- [ ] `docs/api.md` y Bruno actualizados
- [ ] Tag `vX.Y.Z` + GitHub Release con manifiesto
