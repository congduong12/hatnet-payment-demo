# Exec Plan

## Goal

Create the smallest stable NestJS + React project foundation that future
payment, auth, cart, points, subscription, and LLM stories can build on safely.

## Scope

In scope:

- Monorepo/package-manager setup.
- NestJS backend scaffold.
- React frontend scaffold.
- Health/smoke endpoint.
- Environment template and validation shape.
- Quick local checks.
- Harness matrix/story updates.

Out of scope:

- Clerk auth.
- payOS payment.
- Product/cart/order/payment/points/subscription schema.
- Gemini search.
- Deployment.

## Risk Classification

Risk flags:

- Public contracts: introduces initial app and health endpoint shape.
- Weak proof: repo currently has no app validation commands.
- External systems: prepares env/deployment/provider shape, but does not call providers yet.

Hard gates:

- None implemented in Phase 0, but later stories will hit auth, data model, payment provider, and audit/security gates.

Lane: high-risk because it establishes the architecture foundation for several future high-risk domains.

## Work Phases

1. Confirm package manager and monorepo shape.
2. Scaffold backend and frontend.
3. Add minimal env template and ignore rules.
4. Add health endpoint and frontend shell.
5. Add quick validation commands.
6. Update Harness matrix/story evidence.
7. Record trace.

## Stop Conditions

Pause for human confirmation if:

- The scaffold wants to select Next.js instead of React + Vite.
- The backend deployment target forces a major architecture change.
- Provider setup requires real secret values.
- A database migration for product domains becomes necessary before Phase 0 acceptance.
