# Gobernanza de contenido

Principio: **Phorocket vende software, no música.** El contenido lo aporta el usuario o terceros proveedores con licencia clara.

## Subida de archivos (Fase 2)

Endpoint: `POST /api/library/tracks/upload` (multipart). Validación **server-side**, en este orden:

1. **Magic bytes reales** (no solo extensión): mp3, wav, flac, ogg, aac, m4a.
2. **Tamaño máximo por plan** y **duración máxima** (configurable desde admin).
3. **Dedupe por SHA-256** del contenido (mismo archivo ⇒ 409 `DUPLICATE`).
4. **Metadatos reales** vía ffprobe (título/artista se confirman, no se inventan).
5. **Procedencia requerida**: `sourceType` (user_upload | provider_import | download) + `sourceUrl`/proveedor.
6. **Declaración de derechos**: checkbox obligatorio — el usuario garantiza titularidad/licencia. El sistema **no** otorga licencia sobre archivos ajenos (corrige el bug del importador legacy).
7. Flujo: carpeta `tmp/` del storage → validar → mover a `users/{id}/tracks/{hash}` → registrar metadatos en BD. Si falla, se limpia tmp.

## Cuotas por plan (editables en admin)

| Plan | Storage |
|---|---|
| Free | 500 MB |
| Pro | 20 GB |
| Patron | 100 GB |

## Proveedores externos

| Proveedor | Reproducción | Descarga |
|---|---|---|
| YouTube | **Solo IFrame oficial embed** | ❌ nunca (ToS Google; prohibida extracción tipo yt-dlp) |
| Internet Archive | stream directo | ✅ dominio público |
| Jamendo (CC) | stream directo | ✅ CC |
| Free Music Archive | stream directo | ✅ según licencia del track |

- Cada track externo muestra proveedor + tipo de licencia + autoría.
- La UI indica siempre la fuente ("Reproducido desde YouTube (IFrame oficial)").

## Herramientas admin (Fase 5)

- Purga de archivos `tmp/` y huérfanos (BD ↔ storage).
- Reportes de contenido infractor → cola de takedown (política en `docs/legal/politica-de-copyright-dmca.md`).
- Ajuste de cuotas por plan y por usuario.
- Métrica de storage por usuario y total.

## Prevención de basura

- Nada llega a la BD sin pasar las 6 validaciones.
- Archivos rechazados se eliminan del tmp inmediatamente.
- Rate-limit en el endpoint de subida.
- Dedupe evita duplicados deliberados.
