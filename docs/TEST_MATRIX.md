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

## Evidence Rules

- Unit proof covers pure domain and application rules.
- Integration proof covers backend enforcement, data integrity, provider
  behavior, jobs, or service contracts.
- E2E proof covers user-visible browser flows.
- Platform proof covers only shell, deployment, mobile, desktop, or runtime
  behavior that cannot be proven in lower layers.
- A story can be implemented without every proof column if the story packet
  explains why.
