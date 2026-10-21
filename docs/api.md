# API

Base URL local: `http://localhost:4000` · Prefijo: `/api` · JSON en todas las respuestas de error: `{ "error": { "code", "message", "details?" } }`

## Salud

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/health` · `/api/health` | no | Estado del servicio |

## Auth (`/api/auth`)

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/register` | no | Registro. Body: `email`, `password` (≥8, letra+número), `displayName`, `acceptTerms: true`, `language?`. → 201 `{ user, accessToken, refreshToken }` |
| POST | `/login` | no | Body: `email`, `password` → 200 `{ user, accessToken, refreshToken }` |
| POST | `/refresh` | no | Body: `refreshToken` → 200 tokens rotados (el anterior queda revocado) |
| GET | `/me` | Bearer | Perfil del usuario autenticado |

- Access token: JWT 15 min. Header: `Authorization: Bearer <token>`.
- Refresh token: 7 días, rotación obligatoria, hash SHA-256 en BD.
- Rate-limit auth: 30 req / 15 min por IP.

## IA (`/api/ai`)

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/status` | no | `{ hasServerKey, defaultModel, supportedModels[] }` |
| POST | `/verify` | no | Verifica API Key (header `x-api-key` o body `apiKey`) → `{ valid, model, message }` |
| POST | `/command` | no | `{ prompt, model?, catalog? (≤50), playbackState? }` → `{ success, model, data }` |

- Rate-limit IA: 20 req/min por IP.
- El catálogo va acotado a 50 items (id/title/artist/genre) para limitar tokens.
- Sin `GEMINI_API_KEY` en servidor ni clave del usuario → 401 `MISSING_API_KEY`.

## Códigos de error comunes

| Código | HTTP | Significado |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Entrada inválida (details con paths) |
| `INVALID_CREDENTIALS` | 401 | Login incorrecto |
| `INVALID_TOKEN` | 401 | JWT ausente/expirado |
| `MISSING_API_KEY` | 401 | Sin clave Gemini |
| `FORBIDDEN_ROLE` | 403 | Rol insuficiente |
| `NOT_FOUND` | 404 | Ruta o recurso inexistente |
| `EMAIL_TAKEN` | 409 | Email ya registrado |
| `RATE_LIMITED` | 429 | Límite de peticiones |
| `INTERNAL_ERROR` | 500 | Error no controlado |

> Fase 2+: endpoints de catálogo, playlists, uploads, billing y admin se añadirán aquí.
