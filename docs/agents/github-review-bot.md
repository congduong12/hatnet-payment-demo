# Codex GitHub Review

This document describes the repository contract for the official Codex GitHub
code review integration.

## Goal

Codex helps human reviewers find high-risk issues that are easy to miss in a
normal pull-request scan:

- hidden bugs
- security vulnerabilities
- counterproductive design patterns
- missing tests around real risk
- drift between code, product docs, story packets, and the Harness matrix

The review is advisory. Repository maintainers remain responsible for merge
decisions.

## Operating Modes

### Pull Request Checks

The `pr-checks` workflow runs deterministic repository checks on pull requests:

- `pnpm check`
- `pnpm test`
- `pnpm build`

This workflow may check out and execute pull-request code. It must not receive
the OpenAI API key.

### Codex Review

Codex Cloud reviews pull requests through the official GitHub integration:

- comment `@codex review` on a pull request to request a review
- enable Automatic reviews in Codex settings to review new pull requests
- keep repository-specific guidance in `AGENTS.md`

The repository does not store an OpenAI API key for this review flow.

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

## Human Review Setup Plan

1. Confirm Codex Cloud is connected to this repository.
2. Enable Code review in Codex settings for the repository.
3. Enable Automatic reviews when maintainers want every new PR reviewed.
4. Review `.github/workflows/pr-checks.yml` and keep deterministic checks
   independent from Codex review.
5. Open a small docs-only PR and comment `@codex review`.
6. Confirm Codex reacts and posts a standard GitHub review.
7. Open a second PR touching API, security, payment, or checkout code and verify
   that the review focuses on serious risks rather than formatting.
