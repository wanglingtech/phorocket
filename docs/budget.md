# Presupuesto de infraestructura

> Precios verificados: **octubre 2026** (fuentes: páginas oficiales de Vercel, Railway, Cloudflare). Re-verificar antes de contratar.

## Principio

- **Modo local para el usuario final: $0** de infraestructura (todo corre en su equipo).
- **Modo web: costes fijos mensuales** + comisiones por cobro.

## Costes fijos (modo web productivo)

| Servicio | Uso | Coste | Notas |
|---|---|---|---|
| Vercel Pro | Frontend | $20/mes | Hobby ($0) prohíbe uso comercial |
| Railway Hobby | API + MySQL | $5–15/mes | Mínimo $5 con $5 de uso incluido; RAM $10/GB-mes, CPU $20/vCPU-mes, egress $0.05/GB |
| Cloudflare R2 | Blobs de audio | $0 (≤10GB) | 10GB + 1M escrituras + 10M lecturas gratis; egress siempre gratis; después $0.015/GB-mes |
| Dominio | marca | ~$1/mes | $10–15/año |
| Email transaccional | recibos, verificación | $0 | Resend free: 3.000/mes |
| GitHub | repo, CI, releases | $0 | |
| Gemini API | Aura AI, admin IA | $0 (tier gratuito bajo volumen) | Escala con uso real |

**Total estimado lanzamiento (0–50 usuarios): ≈ $27–37 USD/mes**

## Escenarios de crecimiento

| Escenario | Usuarios | Total/mes |
|---|---|---|
| Lanzamiento | 0–50 | $27–37 |
| Crecimiento | 50–500 | $50–110 (R2 + más RAM + ancho de banda) |
| Escala | 500+ | $150+ (Railway Pro, réplicas, posible PlanetScale MySQL desde $39/mes) |

## Comisiones de pago (descuentan de ingresos)

| Proveedor | Comisión |
|---|---|
| Stripe | ~2.9% + $0.30 por cobro |
| PayPal | ~3.5% + fijo según país |
| Ko-fi | 4% por donación (0% con Ko-fi Gold ~$8/mes) |

El precio de Pro debe absorber comisiones (Pro $4.99 → Stripe ≈ $0.44).

## Costes del administrador (no del usuario local)

| Concepto | Coste | Cuándo |
|---|---|---|
| Firma de código Windows (OV) | ~$100–200/año | Fase 8, si se distribuyen instaladores firmados |
| Apple Developer | $99/año | Fase 8 (macOS) |
| Ko-fi Gold | ~$8/mes | Solo si conviene anular el 4% de donaciones |

## Modo local: ¿qué paga el usuario?

Nada de infraestructura. Solo, opcionalmente, su propia API key de Gemini para Aura AI (tier gratuito disponible). Sin paywall duro (ver [billing.md](billing.md)).
