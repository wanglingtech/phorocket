# Política de Privacidad — Phorocket

> **BORRADOR v1.0.0** — Requiere revisión jurídica antes de publicar.

Última actualización: [fecha]

## 1. Responsable

[Nombre/entidad], contacto: privacidad@phorocket.dev

## 2. Datos que recabamos

**Modo web (cuenta):**
- Email, nombre de visualización, hash de contraseña (argon2), idioma preferido
- Contenido que subes (archivos de audio y metadatos) en almacenamiento Cloudflare R2
- Registros técnicos: IP, user-agent, errores de aplicación (anonimizados cuando es posible)
- Datos de facturación vía Stripe/PayPal (no guardamos números de tarjeta)

**Modo local:**
- Los datos permanecen en tu dispositivo. Solo salen: llamadas explícitas a Gemini (si configuras tu API key) y la comprobación de actualizaciones.

## 3. Finalidad

Prestar el servicio (reproducción, biblioteca, sync), gestionar cuentas y pagos, prevenir abuso, mejorar el producto con métricas agregadas.

## 4. Base legal

Ejecución de contrato (servicio solicitado), consentimiento (cookies no esenciales, marketing) e interés legítimo (seguridad, fraude).

## 5. Encargados (sub-procesadores)

| Proveedor | Servicio | Ubicación |
|---|---|---|
| Cloudflare | R2 (archivos), CDN | global |
| Stripe / PayPal | pagos | [según proveedor] |
| Google (Gemini) | procesamiento de comandos de IA (cuando se usa) | [según Google] |
| Railway | hosting de API y BD | [región elegida] |
| Vercel | hosting de frontend | global |

## 6. Conservación

- Cuenta: mientras esté activa + 30 días tras borrado (backups).
- Borrado de cuenta: elimina perfil, biblioteca y archivos en ≤30 días (salvo obligación legal de retener facturas).

## 7. Tus derechos

Acceso, rectificación, portabilidad, oposición y supresión: solicitar a privacidad@phorocket.dev. Derecho a reclamar ante la autoridad de protección de datos de tu país.

## 8. Seguridad

Hash de contraseñas, JWT con rotación, TLS, cifrado en reposo del proveedor de storage, rate-limiting. Ningún sistema es 100% seguro; actuamos ante incidentes con notificación razonable.

## 9. Cookies

Esenciales (sesión/preferencias). Analíticas solo con consentimiento (Fase 7: configurables).

## 10. Menores

El servicio no está dirigido a menores de 13 años (o la edad local aplicable).

## 11. Cambios

Publicaremos la nueva versión con fecha y notificaremos a usuarios activos por material.
