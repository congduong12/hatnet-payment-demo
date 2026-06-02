# Validation

## Proof Strategy

Local proof covers deterministic repository checks. GitHub proof must confirm
both the PR checks workflow and the official Codex review integration.

The MVP is considered implemented when:

- `pnpm check` still passes.
- `pnpm test` still passes.
- `pnpm build` still passes.
- Codex Cloud is connected to the repository.
- Commenting `@codex review` on a small PR causes Codex to post a review.

## Test Plan

| Layer | Cases |
| --- | --- |
| Unit | Existing app unit tests remain green. |
| Integration | Existing app integration tests remain green. |
| E2E | Manual `@codex review` smoke on a GitHub PR. |
| Platform | `Pull Request Checks` runs without OpenAI API secrets. |

## Commands

```text
pnpm check
pnpm test
pnpm build
```

## Acceptance Evidence

Local proof completed:

- `pnpm check` passed.
- `pnpm test` passed outside the sandbox after the first sandboxed attempt
  failed with `listen EPERM 0.0.0.0` in the existing supertest integration
  path.
- `pnpm build` passed.

Platform proof completed:

- PR #2 confirmed `Pull Request Checks / checks (pull_request)` passed.
- PR #2 comment `@codex review` was received by `chatgpt-codex-connector`.
- `chatgpt-codex-connector` posted `Codex Review: Didn't find any major
  issues.`
- PR #2 was closed without merge and the smoke branch was deleted to avoid
  adding test-only files to `master`.
