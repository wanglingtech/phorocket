# Modo local (self-hosting)

Objetivo: cualquier usuario descarga Phorocket y lo usa en su equipo **sin costes de infraestructura y sin instalar MySQL**.

## Cómo funcionará (Fase 3)

1. Descarga el instalador/paquete (Windows/macOS/Linux) o clona el repo.
2. Ejecuta `scripts/install.ps1` (o `install.sh`): verifica Node, instala dependencias, crea **SQLite** local, aplica migraciones, siembra catálogo, compila y arranca.
3. La app abre el navegador en `http://localhost:4000` (API + SPA servidas juntas en modo local).

## Diferencias respecto al modo web

| Aspecto | Local | Web |
|---|---|---|
| BD | SQLite (archivo del usuario) | MySQL en nube |
| Archivos de audio | Carpeta del usuario | Cloudflare R2 |
| Pagos | Sin paywall duro; clave de soporte Ko-fi opcional (badge Patron) | Stripe/PayPal planes |
| IA | Requiere API key de Gemini del usuario (hay tier gratuito) | Clave del servidor +/o del usuario |
| Actualizaciones | Auto-update desde GitHub Releases con backup previo | CI/CD del admin |

## Actualizaciones (auto-update)

1. El cliente consulta el manifiesto de versión (`releases/latest` en GitHub).
2. Descarga el paquete nuevo.
3. **Backup automático** de la BD (copia del archivo SQLite) y de la carpeta de audio.
4. Aplica migraciones (`prisma db push` local).
5. Reemplaza binario y reinicia. Si algo falla → restaura backup y reporta.

## Backups manuales

- BD: copiar `database/phorocket.db` (ruta final en Fase 3)
- Audio: carpeta de usuarios configurada
- Preferencias: export/import JSON desde Ajustes (ya existe exportación de presets)

## Privacidad

En modo local **nada sale del dispositivo** salvo: llamadas explícitas a Gemini (si el usuario configura clave) y la comprobación de actualizaciones. Documentado en Política de Privacidad (modo local).

## Coste para el usuario final

$0 de infraestructura. Opcional: su propia API key de Gemini para Aura AI.
