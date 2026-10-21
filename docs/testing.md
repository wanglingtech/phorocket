# Pruebas

## Ahora (Fase 1): Bruno

Colección en `tests/api/` — abrir en [Bruno](https://usebruno.com), entorno `local`.

| Orden | Requests | Requiere BD |
|---|---|---|
| 1 | health/01 | no |
| 2 | ai/01–03 | no (200 solo con API key) |
| 3 | auth/01–04 | sí |

Los scripts `.bru` guardan `accessToken`/`refreshToken` automáticamente tras register/login/refresh.

CLI (Fase 6): `npx @usebruno/cli run tests/api -e local --env-var baseUrl=http://localhost:4000`.

## Futuro (Fase 6)

| Nivel | Herramienta | Qué cubre |
|---|---|---|
| Unit | Vitest | services, utils, schemas |
| Integration | Vitest + supertest | controllers+rutas contra BD de test |
| E2E | Playwright | flujos: registro→reproducir→playlist |
| Smoke API | Bruno CLI en CI | todos los endpoints |
| Regresión | GitHub Actions | lint, typecheck, tests en cada PR |

## Convenciones

- BD de test separada (`phorocket_test`); migración antes de la suite.
- Tests sin dependencia de Gemini real (mock del cliente).
- Cada bug fix ⇒ test que lo reproduce.
