# Spec Intake

Date: 2026-06-01

## Source

- User prompt: build the application from `SPEC.md` with a NestJS backend and React frontend.
- Attached file: `SPEC.md`.
- Supporting guide: `docs/templates/inp-base-repository-agent-guide.md`.

## Project Summary

VN Payment Learning Lab is a demo web application for learning an end-to-end
Vietnam ecommerce and payment flow. The MVP should prove authenticated product
purchase, server-side cart, VND checkout, payOS payment link/webhook handling,
reward point reservation and confirmation, simulated Pro subscription renewal,
Gemini-assisted product search with deterministic fallback, and a local/dev
inspection surface.

The app is a learning system, but the backend must still treat money, payment
status, reward ledger state, and subscription state as real contracts. Frontend
state is never the source of truth for prices, payment status, reward balances,
or entitlement changes.

## Candidate Product Docs

| File | Purpose | Source sections |
| --- | --- | --- |
| `docs/product/overview.md` | Current product summary, MVP scope, non-goals, product surfaces | 1, 2, 18, 19, 20 |
| `docs/product/domain-contract.md` | Stable domains and domain invariants | 3, 5, 6, 7, 8, 9, 11, 12, 15 |
| `docs/product/api-contract.md` | Draft API surface and boundary rules | 4, 10, 11, 12, 13, 14, 16 |
| `docs/product/validation-contract.md` | Behavior-to-proof expectations before implementation | 18, 21 |

## Candidate Epics

| Epic | Description | Status |
| --- | --- | --- |
| E01 Project Foundation | Scaffold NestJS backend, React frontend, Postgres config, env validation, smoke checks | selected |
| E02 Auth and User | Clerk Google OAuth, NestJS token verification, internal user sync | unsliced |
| E03 Product and Cart | Product catalog seed, product list/detail, server-side cart | unsliced |
| E04 Checkout and Currency | Order creation, price snapshots, USD to VND conversion, rounding | unsliced |
| E05 Points and Ledger | Point account, append-only ledger, reserve/confirm/release/expire rules | unsliced |
| E06 payOS Payment | Adapter, create payment link/QR, webhook verification, idempotent transitions | unsliced |
| E07 Subscription | Free/Pro state, simulated 30-day Pro, renewal and lazy expiry | unsliced |
| E08 LLM Search | Deterministic DB search, Gemini ranking, schema validation, fallback logs | unsliced |
| E09 Admin/Dev Inspection | Debug screens for orders, payments, events, points, subscription, LLM logs | unsliced |

## Architecture Questions

- Runtime stack: NestJS backend, React frontend, TypeScript throughout.
- Product surfaces: browser app, HTTP API, webhook endpoint, admin/dev browser surface.
- Storage: PostgreSQL for app data; TypeORM is preferred to match the INP-style repository guide unless a future decision supersedes it.
- External providers: Clerk, payOS, Gemini; Vercel is a candidate deployment and env/resource management target.
- Deployment target: not implemented yet; Vercel may host the frontend, while backend hosting needs an explicit deployment decision because this is a separate NestJS service.
- Security model: Clerk-authenticated users; dev/admin surface local or protected; webhook signature verification required; RBAC can be phased after MVP.

## Validation Shape

| Layer | Expected proof |
| --- | --- |
| Unit | Money conversion and rounding, redeem limits, ledger transitions, subscription renewal rules, LLM response validation |
| Integration | Auth guard/token verification, checkout transaction, payment webhook idempotency, repository queries, DB constraints |
| E2E | Login, product list, cart, checkout start, payment pending/success UX, billing, search fallback, dev inspection views |
| Platform | Env validation, local dev smoke, deployment config checks when Vercel or another platform is selected |
| Release | Harness matrix rows, story evidence, trace, and no secret leakage in docs/logs |

## Open Decisions

- Whether the repo should use a monorepo layout such as `apps/api` and `apps/web`.
- Whether the backend should deploy to Vercel Functions, a long-running Node host, or another service.
- Whether to use TypeORM immediately or keep the persistence abstraction thin until the first DB story.
- Exact payOS sandbox setup and callback domain workflow.
- Exact Gemini SDK/API path and whether to route through Vercel AI SDK/Gateway later.

## First Story Candidates

- `US-001-project-foundation`: scaffold backend/frontend, env validation, basic health/smoke checks, and initial validation commands.
- `US-002-auth-user-sync`: integrate Clerk login and verified NestJS user sync.
- `US-003-product-cart`: seed products and implement product/cart vertical slice.

## Harness Delta

- The spec is now represented by product docs and candidate epics instead of extending a monolithic `SPEC.md`.
- The first selected story is high-risk because future work will touch auth, payment, data model, external providers, and public contracts.
