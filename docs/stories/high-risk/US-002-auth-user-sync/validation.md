# Validation

## Proof Strategy

The story is done when protected endpoints reject missing auth, accept mocked
verified auth in tests, sync an internal user without trusting client user IDs,
and the React app compiles with Clerk provider/UI integration.

## Test Plan

| Layer | Cases |
| --- | --- |
| Unit | `UsersService` creates, returns, and updates users from verified auth |
| Integration | `GET /me` and `POST /auth/sync-user` reject missing auth and accept a test auth guard |
| E2E | Not required until real Clerk keys and browser session are available |
| Platform | `.env.example` documents Clerk key names and allowed origin |
| Performance | Not required |
| Logs/Audit | Ensure tests/code do not log token or secret values |

## Fixtures

- Clerk subject: `user_test_123`.
- Email: `demo@example.com`.
- Name: `Demo User`.

## Commands

```text
pnpm install
pnpm check
pnpm test
pnpm build
```

## Acceptance Evidence

- `pnpm install` completed after adding Clerk/Nest testing dependencies.
- `pnpm check` passed for API and web.
- `pnpm test` passed: API 3 files / 6 tests, web 1 file / 1 test.
- `pnpm build` passed for API TypeScript build and web Vite production build.
- `pnpm dev:api` mapped `POST /auth/sync-user` and `GET /me`.
- `curl -s -o /tmp/hatnet-me.out -w "%{http_code}" http://localhost:3000/me` returned `401` with `Missing Authorization header`.
- `curl -s http://localhost:3000/health` still returned `{"status":"ok","service":"hatnet-api",...}`.
