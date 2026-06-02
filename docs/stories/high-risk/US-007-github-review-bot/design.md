# Design

## Domain Model

The bot models a pull-request review as:

- repository context: Harness docs, matrix, package scripts, and review rules
- pull-request metadata: number, title, author, base, head, fork status
- file patches: filtered changed-file records from GitHub API
- review result: structured findings plus required checks and Harness notes

Findings are advisory and ranked by severity.

## Application Flow

```text
PR comment `/improve`
  -> GitHub Actions `issue_comment`
  -> verify comment is on a PR
  -> verify commenter association
  -> fetch PR metadata
  -> skip fork PR unless explicitly allowed
  -> fetch changed files
  -> filter diff budget
  -> read Harness context from default branch checkout
  -> call OpenAI Responses API with Structured Outputs
  -> validate structured result
  -> render markdown
  -> update existing bot comment or create one
```

The deterministic `pr-checks` workflow is separate:

```text
pull_request
  -> checkout PR code
  -> pnpm install
  -> pnpm check
  -> pnpm test
  -> pnpm build
```

## Interface Contract

### Command

`/improve`

Only these commenter associations may run the command:

- `OWNER`
- `MEMBER`
- `COLLABORATOR`

### Environment

Required in GitHub Actions:

- `GITHUB_TOKEN`
- `OPENAI_API_KEY`

Recommended:

- `OPENAI_MODEL`

Optional:

- `OPENAI_REASONING_EFFORT`
- `AI_REVIEW_ALLOW_FORKS`
- `AI_REVIEW_MAX_FILES`
- `AI_REVIEW_MAX_PATCH_BYTES`
- `AI_REVIEW_MAX_TOTAL_PATCH_BYTES`

## Data Model

No application database changes.

GitHub stores the review output as an issue comment on the pull request. The
comment contains the marker:

```md
<!-- ai-review-bot -->
```

The marker lets subsequent runs update the same comment instead of creating
noise.

## UI / Platform Impact

- GitHub Actions gains two workflows.
- GitHub pull requests gain one updateable review comment after `/improve`.
- Repository maintainers must configure `OPENAI_API_KEY` and `OPENAI_MODEL` in
  GitHub repository settings.

## Observability

The script logs:

- trigger mode
- PR number
- filtered file counts
- skip reasons
- whether a comment was created or updated

The script must not log `OPENAI_API_KEY` or raw GitHub tokens.

## Alternatives Considered

1. GitHub App: better for multi-repo installation but too much setup for MVP.
2. `pull_request_target`: useful for commenting on fork PRs but risky if mixed
   with checkout/build of untrusted code.
3. Inline comments: more useful but requires exact diff-position mapping and
   should wait until summary-comment quality is proven.
