# Validation

## Proof Strategy

Phase 0 is done when both app surfaces can install, typecheck/build, and start
locally with documented commands, and the backend health endpoint can be
verified without secrets.

## Test Plan

| Layer | Cases |
| --- | --- |
| Unit | Environment parsing rejects missing required non-secret config when validation exists |
| Integration | `GET /health` returns the expected smoke response from NestJS |
| E2E | React app loads the first meaningful screen and does not show a framework error overlay |
| Platform | Local env template exists; no secrets are committed; dev commands are documented |
| Performance | Not required for Phase 0 |
| Logs/Audit | Request logging follow-up is recorded if not implemented |

## Fixtures

- No authenticated users.
- No products.
- No payment provider payloads.
- No LLM payloads.

## Commands

Run from the repository root:

```text
pnpm install
pnpm check
pnpm test
pnpm build
pnpm dev:api
curl -s http://localhost:3000/health
```

## Acceptance Evidence

- `pnpm install` completed successfully with dependencies installed.
- `pnpm check` passed for `@hatnet/api` and `@hatnet/web`.
- `pnpm test` passed: API 1 file / 1 test, web 1 file / 1 test.
- `pnpm build` passed: API TypeScript build and web Vite production build.
- `pnpm dev:api` started NestJS and mapped `GET /health`.
- `curl -s http://localhost:3000/health` returned `{"status":"ok","service":"hatnet-api","timestamp":"2026-05-31T17:26:39.882Z"}`.
