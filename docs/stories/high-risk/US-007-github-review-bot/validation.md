# Validation

## Proof Strategy

Local proof covers deterministic script behavior without secrets. GitHub proof
must be performed after repository secrets and variables are configured.

The MVP is considered implemented when:

- `pnpm ai-review:self-test` passes.
- `pnpm ai-review:dry-run` renders a comment from the fixture.
- `pnpm check` still passes.
- `pnpm test` still passes.
- A human configures `OPENAI_API_KEY` and `OPENAI_MODEL` in GitHub.
- Commenting `/improve` on a small PR creates or updates one PR comment.

## Test Plan

| Layer | Cases |
| --- | --- |
| Unit | Validate good review JSON; reject invalid model output; filter noisy files. |
| Integration | Dry-run fixture renders a markdown review comment. |
| E2E | Manual GitHub PR smoke after secrets are configured. |
| Platform | GitHub Actions permissions are minimal; no OpenAI key in PR check workflow. |
| Performance | Diff budget caps max files and patch bytes. |
| Logs/Audit | Script logs counts and skip reasons, never secrets. |

## Fixtures

- `scripts/github-review-bot/fixtures/small-diff.json`
- `scripts/github-review-bot/fixtures/invalid-openai-output.json`

## Commands

```text
pnpm ai-review:self-test
pnpm ai-review:dry-run
pnpm check
pnpm test
```

## Acceptance Evidence

Local proof completed:

- `node --check scripts/github-review-bot/review-pr.mjs` passed.
- `pnpm ai-review:self-test` passed.
- `pnpm ai-review:dry-run` passed and rendered one `<!-- ai-review-bot -->`
  comment from the fixture.
- `pnpm check` passed.
- `pnpm test` passed outside the sandbox after the first sandboxed attempt
  failed with `listen EPERM 0.0.0.0` in the existing supertest integration
  path.
- `pnpm build` passed.

Pending platform proof:

- Configure `OPENAI_API_KEY` as a GitHub Actions secret.
- Configure `OPENAI_MODEL` as a GitHub Actions variable.
- Open a small PR and comment `/improve`.
- Confirm the workflow creates or updates one bot comment and does not expose
  secrets in logs.
