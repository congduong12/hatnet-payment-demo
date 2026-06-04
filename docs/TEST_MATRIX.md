# Test Matrix

This file maps product behavior to proof.

Initial product behavior has been derived from `SPEC.md`. Do not mark a row
implemented until tests or validation evidence exist.

## Status Values

| Status | Meaning |
| --- | --- |
| planned | Accepted as intended behavior, not implemented |
| in_progress | Actively being built |
| implemented | Implemented and proof exists |
| changed | Contract changed after earlier implementation |
| retired | No longer part of the product contract |

## Matrix

| Story | Contract | Unit | Integration | E2E | Platform | Status | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| US-001 | Project foundation: NestJS API and React app can start and expose smoke proof | yes | yes | no | yes | implemented | `pnpm check`; `pnpm test`; `pnpm build`; `curl -s http://localhost:3000/health`; web shell covered by component test/build, browser E2E not yet run; `docs/stories/high-risk/US-001-project-foundation/` |
| US-002 | Auth and internal user sync: React Clerk UI and NestJS verified user boundary | yes | yes | no | yes | implemented | `pnpm check`; `pnpm test`; `pnpm build`; `curl http://localhost:3000/me` returned `401` without token; live Clerk browser login not run because no real keys in repo; `docs/stories/high-risk/US-002-auth-user-sync/` |
| US-003 | Database and repository foundation: Docker Postgres, TypeORM migrations, BaseRepository, and persisted users | yes | yes | no | yes | implemented | `docker compose up -d postgres`; `pnpm db:migrate`; `pnpm check`; `pnpm test`; `pnpm build`; `curl -s http://localhost:3000/health/db`; `docker compose exec -T postgres psql -U hatnet -d hatnet_demo -c "\\dt" -c "\\d users"`; no browser E2E required for DB foundation; `docs/stories/high-risk/US-003-database-repository-foundation/` |
| US-004 | Product catalog foundation: seeded products, API list/detail, and React catalog display | yes | yes | no | yes | implemented | `docker compose up -d postgres`; `pnpm db:migrate`; `pnpm check`; `pnpm test`; `pnpm build`; `curl -s http://localhost:3000/products`; `curl -s http://localhost:3000/products/pro-plan`; `psql` confirmed 5 active seeded products; browser E2E deferred to product/cart slice; `docs/stories/high-risk/US-004-product-catalog-foundation/` |
| US-005 | Server-side cart foundation: authenticated active cart, add/update/remove/clear, quantity rules, DB totals | yes | yes | no | yes | implemented | `pnpm check`; `pnpm test` (API 14 tests, web 2 tests); `pnpm build`; `pnpm db:migrate`; API boot mapped cart routes; malformed `productId`/`itemId` UUIDs are rejected before DB lookup; rollback `psql` smoke confirmed active-cart upsert, atomic cart-item increment, and over-limit increment preserving quantity; browser E2E with real Clerk deferred; `docs/stories/high-risk/US-005-server-side-cart-foundation/` |
| US-006 | Checkout and currency foundation: immutable order snapshots, integer-safe USD-to-VND conversion, rounding, transactional cart close | yes | yes | no | yes | implemented | `pnpm --filter @hatnet/api test`; `pnpm --filter @hatnet/api check`; `pnpm --filter @hatnet/api build`; `pnpm check`; `pnpm test`; `pnpm build`; cart repository tests verify add/update/remove/clear lock and re-check the active cart before mutating `cart_items`; `docker compose up -d postgres`; `pnpm db:migrate`; PostgreSQL smoke verified `pro-plan` checkout creates a `249000` VND order snapshot and closes the active cart; public `POST /checkout`, points, payOS, and browser UI deferred; `docs/stories/high-risk/US-006-checkout-currency-foundation/` |
| US-007 | Codex GitHub review integration: `@codex review` and optional Automatic reviews apply repo guidance for hidden bugs, security vulnerabilities, anti-patterns, missing tests, and contract drift | yes | yes | no | yes | implemented | `pnpm check`; `pnpm test`; `pnpm build`; PR #2 confirmed `Pull Request Checks / checks (pull_request)` passed and `chatgpt-codex-connector` posted `Codex Review: Didn't find any major issues.`; PR #2 closed without merge after smoke; `docs/stories/high-risk/US-007-github-review-bot/` |

## Evidence Rules

- Unit proof covers pure domain and application rules.
- Integration proof covers backend enforcement, data integrity, provider
  behavior, jobs, or service contracts.
- E2E proof covers user-visible browser flows.
- Platform proof covers only shell, deployment, mobile, desktop, or runtime
  behavior that cannot be proven in lower layers.
- A story can be implemented without every proof column if the story packet
  explains why.
