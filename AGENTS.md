# AGENTS.md

Contexto del proyecto para agentes de IA. Lee también `docs/` (índice en `docs/README.md`).

## Qué es Phorocket

Plataforma musical cyberpunk: SPA React 19 + backend Express modular + Prisma (MySQL nube / SQLite local). **No proveemos música**: el contenido lo aportan usuarios o proveedores con licencia.

## Comandos clave

```bash
pnpm install            # workspace completo
pnpm dev                # API (4000) + Web (5173)
pnpm dev:api            # solo backend
pnpm dev:web            # solo frontend
pnpm typecheck          # tsc en todos los packages
pnpm db:generate        # regenerar Prisma client
pnpm db:migrate         # migraciones dev (requiere MySQL activo)
```

## Reglas no negociables

1. **YouTube solo IFrame oficial** — jamás implementar extracción de streams (yt-dlp, etc.).
2. **Secretos solo en `.env`** — nunca commitear; solo `.env.example`.
3. **Errores de API** → `{ error: { code, message, details? } }` con código estable (el cliente traduce).
4. **Migraciones expand-contract** — nunca destructiva en el mismo release.
5. **Sin música en la BD** — blobs en R2/filesystem; solo metadatos.
6. **Subidas validadas server-side** (magic bytes, SHA-256, cuotas, procedencia, declaración de derechos).
7. Nueva feature ⇒ detrás de feature flag (Fase 5) + docs + Bruno en el mismo cambio.
8. `common/` no importa de `modules/`.

## Convenciones de código

- TypeScript estricto, ESM (`.js` en imports relativos del backend).
- Módulos backend: `routes → controller → service → repository`; schemas zod en `<n>.schema.ts`.
- Nombres: kebab-case archivos, camelCase funciones, PascalCase tipos/clases.
- Frontend: componentes en `frontend/src/components/`, contexto en `context/`, servicios en `services/`.
- i18n: **no** hardcodear strings en UI nueva; usar claves i18next (es/en/pt/fr).

## Glosario de marca (no traducir)

Phorocket · Aura AI · presets: Flat, Bass Boost, Cyber Synth, Vocal Clarity, Club Master, Treble Boost · temas: Vacío Cuántico, OLED Puro, Azul Neo-Tokyo, Terminal Matrix, Carmesí Void.

## Patrones reutilizables en otros proyectos

En `.agents/reusable/` se aíslan patrones genéricos (módulo Express con zod, env validada, JWT rotatorio). Si validan en 2+ proyectos → candidatos a skill global en `~/.config/opencode/`.
