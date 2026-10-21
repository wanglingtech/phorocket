# Seguridad

## Implementado (Fase 1)

| Medida | Detalle |
|---|---|
| Helmet | Headers de seguridad HTTP (CSP, HSTS en prod, etc.) |
| CORS | Whitelist desde `CORS_ORIGINS`; sin `*` con credenciales |
| Rate limiting | Global 300/15min · IA 20/min · Auth 30/15min (draft-7) |
| Validación | Zod en todos los inputs; bodies limitados a 2MB |
| Contraseñas | argon2 (hash); validación de fortaleza en registro |
| JWT | Access 15 min + Refresh 7 días **con rotación**; hash SHA-256 del refresh en BD |
| Errores | Mensajes genéricos en prod; códigos estables; sin stack traces al cliente |
| Logs | pino estructurado; sin secretos ni bodies con contraseñas |
| Env | Validada con zod al arrancar; secretos ≥32 chars obligatorios |

## Pendiente por fase

- [ ] Fase 2: validación de uploads (magic bytes, dedupe, cuotas) — ver [content-governance.md](content-governance.md)
- [ ] Fase 4: webhooks firmados (Stripe/PayPal), sin datos de tarjeta propios
- [ ] Fase 5: audit_log de acciones sensibles
- [ ] Fase 7: CSP ajustada a producción, IP blocking si hace falta

## Amenazas y mitigaciones

| Amenaza | Mitigación |
|---|---|
| Fuerza bruta login | Rate-limit por IP (+ futuro: lockout por email, CAPTCHA tras N fallos) |
| Robo de JWT | TTL corto + refresh rotatorio; revocar sesión desde admin (Fase 5) |
| Inyección SQL | Prisma (queries parametrizadas); sin SQL crudo |
| XSS | React escapa por defecto; helmet CSP; sin `dangerouslySetInnerHTML` |
| Subida maliciosa | Fase 2: magic bytes, límites, hash, sin ejecución de archivos |
| CORS | Whitelist estricta |
| Secretos en repo | `.env` gitignored; solo `.env.example` |

## Reglas para desarrolladores

1. Nunca loguear passwords, tokens ni API keys.
2. Nunca commitear `.env`.
3. Toda ruta nueva: rate-limit si es sensible + zod + documentar en api.md.
4. Claves de API de usuarios: solo en tránsito request→Gemini; nunca persistir en texto plano (Fase 4: cifrar o usar la del servidor).

## Reporte de vulnerabilidades

Contacto privado: `security@phorocket.dev` (configurar antes de producción). Política de divulgación coordinada: 90 días.
