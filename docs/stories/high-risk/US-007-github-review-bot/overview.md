# Overview

## Current Behavior

The repository has Harness guidance, story packets, a test matrix, and local
validation commands. Human reviewers need an additional review pass that
applies repo-specific rules such as Harness source hierarchy, checkout/cart
concurrency risk, and security-sensitive constraints.

## Target Behavior

The repository uses:

- deterministic pull-request checks that run without AI secrets
- the official Codex GitHub integration for `@codex review`
- optional Automatic reviews configured in Codex settings
- repo-specific review guidelines in `AGENTS.md`

The bot is focused on hidden bugs, security vulnerabilities, counterproductive
design patterns, missing tests, and contract drift.

## Affected Users

- Repository owner.
- Maintainers reviewing pull requests.
- Future agents working from Harness context.

## Affected Product Docs

- `docs/agents/github-review-bot.md`
- `docs/TEST_MATRIX.md`
- `.github/workflows/pr-checks.yml`
- `AGENTS.md`

## Non-Goals

- No auto-merge.
- No auto-fix commits.
- No automatic approval or `REQUEST_CHANGES`.
- No inline comments in MVP.
- No GitHub App in MVP.
- No execution of untrusted pull-request code inside the AI review workflow.
