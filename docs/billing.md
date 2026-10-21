# Facturación y planes (Fase 4)

## Planes

| Plan | Precio sugerido | Incluye |
|---|---|---|
| **Free** | $0 | Core, IA limitada, storage 500MB |
| **Pro** | $4.99/mes | IA completa, sync nube, storage 20GB, playlists ilimitadas |
| **Patron** | $9.99/mes | Todo Pro + badge, acceso anticipado, storage 100GB |

> Los precios **no están fijos en código**: se gestionan desde el módulo admin (abajo). Los de arriba son los iniciales sugeridos.

## Proveedores

- **Stripe** (núcleo): suscripciones, impuestos, webhooks, invoicing. Comisión ~2.9% + $0.30.
- **PayPal**: gateway alternativo (Subscriptions API). ~3.5% + fijo.
- **Ko-fi**: donaciones puntuales + claves de soporte para modo local. 4% (0% con Gold).
- Arquitectura: interfaz `PaymentProvider` con adapters `StripeProvider`, `PayPalProvider`, `KoFiProvider`.

## Módulo admin de precios

- Tabla `plan_price` (histórico): monto en centavos, moneda única configurable, intervalo, **`valid_from` / `valid_to`**, activo, nota, autor.
- UI `/admin/billing/prices`: precios vigentes y programados, editor con fechas, vista previa del precio efectivo, historial.
- **Sincronización**: al crear precio programado → se crea `Price` en Stripe (inactivo) y un job lo activa en `valid_from`. El checkout lee siempre la DB.
- **Grandfathering**: suscriptores existentes conservan su precio hasta renovación (regla configurable).
- **Promociones**: tabla `promotion` con % dto., ventana de fechas, límite de canjes.
- Todo cambio queda en `audit_log`.

## Entitlements

- Tabla `plan` con JSON de features; middleware `requirePlan('pro')` en rutas protegidas.
- Feature flags (Fase 5) pueden combinar con plan (ej. flag "nuevo visualizer" solo Pro).

## Webhooks

- `POST /api/billing/webhook/stripe` (firma verificada), `POST /api/billing/webhook/paypal`.
- Manejar: `checkout.session.completed`, `invoice.paid`, `customer.subscription.updated/deleted`, PayPal `BILLING.SUBSCRIPTION.ACTIVATED|CANCELLED`.
- Idempotencia por `event.id`.

## Modo local

- Sin paywall duro: todas las funciones core disponibles.
- Clave de soporte Ko-fi → activa badge Patron + reconocimiento en About.
- EULA en `docs/legal/eula-modo-local.md`.

## Reembolsos

Política en T&C: reembolso prorrateado a petición dentro de los 14 días primeros; admin puede reembolsar desde el panel (Stripe API).
