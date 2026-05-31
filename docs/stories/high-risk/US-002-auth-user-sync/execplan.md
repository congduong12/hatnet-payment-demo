# Exec Plan

## Goal

Create the first real auth boundary so later cart, checkout, billing, points,
and admin stories can derive user identity from verified Clerk sessions.

## Scope

In scope:

- Clerk React SDK setup.
- Cross-origin bearer-token API helper.
- NestJS auth service/guard/decorator.
- In-memory internal user sync service.
- `GET /me`.
- `POST /auth/sync-user`.
- Tests for missing auth and internal user sync.
- Harness matrix/story updates.

Out of scope:

- Database persistence.
- RBAC.
- Clerk webhooks.
- Checkout/cart/billing/points.
- Real browser login proof with live Clerk keys.

## Risk Classification

Risk flags:

- Auth.
- Public contracts.
- Weak proof until live Clerk env exists.

Hard gates:

- Auth.

Lane: high-risk.

## Work Phases

1. Verify current Clerk docs and package versions.
2. Create story packet and durable Harness story.
3. Add backend auth guard, service, and user sync.
4. Add frontend Clerk provider and signed-in API controls.
5. Add tests.
6. Run validation commands.
7. Update matrix/story evidence and trace.

## Stop Conditions

Pause for human confirmation if:

- Real Clerk secret values are needed.
- Clerk docs require a different architecture than cross-origin bearer tokens.
- Database persistence becomes necessary before endpoint behavior can be proven.
