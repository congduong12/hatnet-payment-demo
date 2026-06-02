# GitHub Review Bot

This document is the review contract for the GitHub AI review bot.

## Goal

The bot helps human reviewers find high-risk issues that are easy to miss in a
normal pull-request scan:

- hidden bugs
- security vulnerabilities
- counterproductive design patterns
- missing tests around real risk
- drift between code, product docs, story packets, and the Harness matrix

The bot is advisory. It must not merge, approve, request changes, push commits,
or rewrite code in MVP.

## Operating Modes

### Pull Request Checks

The `pr-checks` workflow runs deterministic repository checks on pull requests:

- `pnpm check`
- `pnpm test`
- `pnpm build`

This workflow may check out and execute pull-request code. It must not receive
the OpenAI API key.

### `/improve` Command Review

The `ai-review` workflow runs when a collaborator comments `/improve` on a pull
request. This workflow:

- runs from the default branch
- verifies the commenter is `OWNER`, `MEMBER`, or `COLLABORATOR`
- fetches pull-request metadata and file patches through the GitHub API
- reads local Harness context from the default branch
- calls OpenAI Responses API with Structured Outputs
- posts or updates one PR comment containing the review

The `/improve` workflow must not check out or execute untrusted pull-request
code. Fork pull requests are skipped by default unless
`AI_REVIEW_ALLOW_FORKS=true` is explicitly configured.

## Review Priorities

Findings should be ordered by real impact, not by style preference.

### Hidden Bugs

Prioritize:

- race conditions and request-ordering bugs
- transaction boundaries that leave inconsistent state
- stale snapshots, stale caches, or time-of-check/time-of-use gaps
- `null`, `undefined`, empty-string, empty-array, malformed UUID, and boundary
  input cases
- behavior that passes unit/type checks but fails under integration or
  concurrency
- missing coverage for shared helpers or downstream callers

### Security Vulnerabilities

Prioritize:

- committed or logged secrets
- client-supplied identity or scope being trusted
- auth or authorization bypass
- missing validation for request bodies, params, query strings, headers, env
  vars, provider payloads, and webhooks
- weak payment/webhook/provider verification
- unsafe GitHub Actions permissions or `pull_request_target` misuse
- leaking sensitive operational or user data into logs or PR comments

### Counterproductive Design Patterns

Prioritize:

- mutable singleton repository or query state
- controller code owning domain/application rules
- outer-layer dependencies leaking into domain/application code
- transaction work split across boundaries that need to be atomic
- duplicate business rules across API and UI
- broad abstractions that add indirection without reducing meaningful
  complexity
- tests that only mock happy paths while the real risk sits at a shared
  boundary

## Repo-Specific Rules

- Follow `AGENTS.md` before review.
- Treat `docs/product/*`, `docs/stories/*`, `docs/TEST_MATRIX.md`, and
  `scripts/bin/harness-cli query matrix` as the product and proof control
  surfaces.
- If a PR changes public API behavior, payment behavior, auth, data model, or
  checkout/cart behavior, check whether product docs, story packets, and matrix
  evidence changed with it.
- A green `pnpm check`, `pnpm test`, or `pnpm build` is not enough proof for
  concurrency, transaction, auth, payment, webhook, or provider risk.
- In this repo, checkout/cart review must consider request ordering. Locking a
  cart row alone may not prevent later cart item writes from changing a
  checkout snapshot.

## Output Requirements

The model must return structured JSON with:

- summary
- risk level
- findings
- required checks
- Harness notes

Every finding must include:

- severity: `P0`, `P1`, `P2`, or `P3`
- category: `hidden_bug`, `security`, `anti_pattern`, `missing_test`, or
  `contract_drift`
- file path when available
- line number when available
- title
- evidence from the diff or Harness context
- impact
- recommendation
- confidence from `0` to `1`

The rendered PR comment should be compact and should avoid speculative
findings. If no high-confidence findings exist, the bot should say so and list
residual risks or missing proof.

## Diff Budget

The bot should ignore or heavily down-rank:

- lockfiles
- generated files
- build outputs
- coverage output
- large snapshots
- binary files

Default limits:

- maximum reviewed files: 30
- maximum patch bytes per file: 20 KB
- maximum total patch bytes: 120 KB

If a PR exceeds the budget, the bot should review the highest-risk files first
and mention that the review was partial.

## Human Review Setup Plan

1. Confirm this story's scope and non-goals.
2. Review `.github/workflows/pr-checks.yml` and confirm it has no OpenAI secret.
3. Review `.github/workflows/ai-review.yml` and confirm permissions are minimal.
4. Add `OPENAI_API_KEY` as a GitHub Actions secret.
5. Add `OPENAI_MODEL` as a GitHub Actions variable. Use `gpt-5.5` by default if
   available to the account.
6. Keep `AI_REVIEW_ALLOW_FORKS` unset until fork behavior is intentionally
   accepted.
7. Open a small docs-only PR and comment `/improve`.
8. Confirm the bot updates one `<!-- ai-review-bot -->` comment instead of
   spamming new comments.
9. Open a second PR touching API/security/payment-style code and verify that the
   review focuses on real risks, not formatting.
10. Only after several good runs, consider inline comments or a dedicated
    GitHub App.
