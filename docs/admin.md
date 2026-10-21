# Panel de administración (Fase 5)

Rutas bajo `/admin` en la misma app React, protegidas por `role === 'ADMIN'` (redirect a home para el resto).

## Módulos

### Dashboard
- Usuarios activos (7d/30d), altas, errores/24h, latencia media, llamadas IA, suscripciones por plan, storage usado.

### Errores
- El frontend y el backend envían errores a `POST /api/admin/errors/ingest` (con fingerprint del stack).
- Vista agrupada: fingerprint, ocurrencias, último visto, contexto (user agent, ruta, userId), estado (nuevo/investigado/resuelto).
- **AI-Ops**: botón "Diagnosticar con IA" → Gemini recibe el error anonimizado + contexto → propone causa y fix sugerido. Nunca envía secretos ni datos personales.

### Auditoría
- Tabla `audit_log`: actor, acción, entidad, id de entidad, metadata JSON, ip, timestamp.
- Acciones registradas: login, cambio de rol, cambio de precio, refund, purga de storage, cambio de flag, takedown.

### Usuarios
- Buscar, ver plan e historial, cambiar rol, ban/desban, forzar logout (revoca refresh tokens), ver aceptaciones legales.

### Facturación
- Suscripciones, pagos, reembolsos, claves Ko-fi canjeadas. Editor de precios con fechas (ver [billing.md](billing.md)).

### Feature flags
- `{ key, description, enabled, rules: { plan?, role?, percentage?, userIds? } }`.
- Evaluados en backend; el frontend los recibe en bootstrap (`GET /api/bootstrap`).

### Storage
- Uso por usuario, cuotas, purga de archivos huérfanos/tmp, cola de reportes de contenido (takedown).

### Traducciones
- Cobertura por idioma (% keys), keys faltantes, propuesta IA con glosario, revisión y publicación.

## Seguridad del panel

- `authorize('ADMIN')` en todas las rutas admin API.
- CSP más estricta para rutas admin.
- Toda acción sensible → audit_log.
- Rate-limit propio en endpoints admin.
