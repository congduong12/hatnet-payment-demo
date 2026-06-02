#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const BOT_MARKER = "<!-- ai-review-bot -->";
const ALLOWED_ASSOCIATIONS = new Set(["OWNER", "MEMBER", "COLLABORATOR"]);
const DEFAULT_MODEL = "gpt-5.5";
class SkipRun extends Error {}
const REVIEW_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["summary", "riskLevel", "findings", "requiredChecks", "harnessNotes"],
  properties: {
    summary: { type: "string" },
    riskLevel: { type: "string", enum: ["low", "medium", "high"] },
    findings: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "severity",
          "category",
          "file",
          "line",
          "title",
          "evidence",
          "impact",
          "recommendation",
          "confidence"
        ],
        properties: {
          severity: { type: "string", enum: ["P0", "P1", "P2", "P3"] },
          category: {
            type: "string",
            enum: [
              "hidden_bug",
              "security",
              "anti_pattern",
              "missing_test",
              "contract_drift"
            ]
          },
          file: { type: "string" },
          line: { type: ["integer", "null"] },
          title: { type: "string" },
          evidence: { type: "string" },
          impact: { type: "string" },
          recommendation: { type: "string" },
          confidence: { type: "number", minimum: 0, maximum: 1 }
        }
      }
    },
    requiredChecks: { type: "array", items: { type: "string" } },
    harnessNotes: { type: "array", items: { type: "string" } }
  }
};

const args = parseArgs(process.argv.slice(2));

main().catch((error) => {
  if (error instanceof SkipRun) {
    console.log(error.message);
    return;
  }
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

async function main() {
  if (args["self-test"]) {
    await runSelfTest();
    return;
  }

  if (args["dry-run"]) {
    const fixture = await readFixture(args.fixture);
    const context = await readHarnessContext();
    const filtered = filterFiles(fixture.files ?? []);
    const review = fixture.mockReview ?? buildNoFindingReview(filtered);
    validateReviewResult(review);
    console.log(renderComment({ review, pullRequest: fixture.pullRequest, filtered, context }));
    return;
  }

  const env = process.env;
  const token = requireEnv(env.GITHUB_TOKEN, "GITHUB_TOKEN");
  const repository = requireEnv(env.GITHUB_REPOSITORY, "GITHUB_REPOSITORY");
  const [owner, repo] = repository.split("/");
  if (!owner || !repo) {
    throw new Error(`Invalid GITHUB_REPOSITORY: ${repository}`);
  }

  const event = await readGitHubEvent(env);
  const prNumber = getPullRequestNumber(event, env);
  enforceCommentGuard(event);

  const pullRequest = await githubJson(token, `/repos/${owner}/${repo}/pulls/${prNumber}`);
  if (isForkPullRequest(pullRequest) && env.AI_REVIEW_ALLOW_FORKS !== "true") {
    const skipBody = `${BOT_MARKER}\n\n## AI Review\n\nSkipped: this pull request comes from a fork. Set \`AI_REVIEW_ALLOW_FORKS=true\` only after explicitly accepting fork-review cost and data-flow behavior.`;
    await upsertBotComment({ token, owner, repo, prNumber, body: skipBody });
    console.log("Skipped fork pull request.");
    return;
  }

  const openaiKey = requireEnv(env.OPENAI_API_KEY, "OPENAI_API_KEY");
  const files = await listPullRequestFiles({ token, owner, repo, prNumber });
  const filtered = filterFiles(files);
  const context = await readHarnessContext();
  const review = await callOpenAIReview({
    apiKey: openaiKey,
    model: env.OPENAI_MODEL || DEFAULT_MODEL,
    reasoningEffort: env.OPENAI_REASONING_EFFORT,
    pullRequest,
    filtered,
    context
  });
  validateReviewResult(review);

  const body = renderComment({ review, pullRequest, filtered, context });
  await upsertBotComment({ token, owner, repo, prNumber, body });
  console.log(`AI review completed for PR #${prNumber}.`);
}

function parseArgs(argv) {
  const parsed = {};
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (!value.startsWith("--")) {
      continue;
    }
    const key = value.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      parsed[key] = true;
    } else {
      parsed[key] = next;
      index += 1;
    }
  }
  return parsed;
}

async function runSelfTest() {
  const good = await readFixture("scripts/github-review-bot/fixtures/small-diff.json");
  const filtered = filterFiles(good.files);
  if (filtered.included.length !== 1) {
    throw new Error(`Expected one included file, got ${filtered.included.length}.`);
  }
  validateReviewResult(good.mockReview);

  const invalid = await readFixture(
    "scripts/github-review-bot/fixtures/invalid-openai-output.json"
  );
  let invalidFailed = false;
  try {
    validateReviewResult(invalid);
  } catch {
    invalidFailed = true;
  }
  if (!invalidFailed) {
    throw new Error("Invalid fixture unexpectedly passed validation.");
  }

  const comment = renderComment({
    review: good.mockReview,
    pullRequest: good.pullRequest,
    filtered,
    context: await readHarnessContext()
  });
  if (!comment.includes(BOT_MARKER) || !comment.includes("Checkout can snapshot")) {
    throw new Error("Rendered comment did not include expected marker or finding.");
  }

  console.log("AI review bot self-test passed.");
}

async function readFixture(path) {
  if (!path) {
    throw new Error("Missing --fixture path.");
  }
  return JSON.parse(await readFile(path, "utf8"));
}

async function readGitHubEvent(env) {
  if (!env.GITHUB_EVENT_PATH) {
    return {};
  }
  return JSON.parse(await readFile(env.GITHUB_EVENT_PATH, "utf8"));
}

function getPullRequestNumber(event, env) {
  if (env.WORKFLOW_DISPATCH_PR_NUMBER) {
    return Number(env.WORKFLOW_DISPATCH_PR_NUMBER);
  }
  const number = event?.issue?.number;
  if (!number) {
    throw new Error("No pull request number found in event.");
  }
  return Number(number);
}

function enforceCommentGuard(event) {
  if (!event?.comment) {
    return;
  }
  const association = event.comment.author_association;
  const body = event.comment.body ?? "";
  if (!event.issue?.pull_request) {
    throw new SkipRun("Ignoring comment because it is not on a pull request.");
  }
  if (!body.startsWith("/improve")) {
    throw new SkipRun("Ignoring comment because it is not an /improve command.");
  }
  if (!ALLOWED_ASSOCIATIONS.has(association)) {
    throw new SkipRun(`Ignoring /improve from unauthorized association: ${association}`);
  }
}

function isForkPullRequest(pullRequest) {
  return pullRequest?.head?.repo?.full_name !== pullRequest?.base?.repo?.full_name;
}

async function listPullRequestFiles({ token, owner, repo, prNumber }) {
  const files = [];
  let page = 1;
  while (page <= 10) {
    const chunk = await githubJson(
      token,
      `/repos/${owner}/${repo}/pulls/${prNumber}/files?per_page=100&page=${page}`
    );
    files.push(...chunk);
    if (chunk.length < 100) {
      break;
    }
    page += 1;
  }
  return files;
}

function filterFiles(files) {
  const maxFiles = Number(process.env.AI_REVIEW_MAX_FILES || 30);
  const maxPatchBytes = Number(process.env.AI_REVIEW_MAX_PATCH_BYTES || 20_000);
  const maxTotalPatchBytes = Number(process.env.AI_REVIEW_MAX_TOTAL_PATCH_BYTES || 120_000);
  const ignored = [];
  const included = [];
  let totalPatchBytes = 0;

  for (const file of files) {
    const filename = file.filename ?? "";
    const patch = file.patch ?? "";
    const patchBytes = Buffer.byteLength(patch, "utf8");
    const reason = ignoreReason(filename, patchBytes, maxPatchBytes);
    if (reason) {
      ignored.push({ filename, reason });
      continue;
    }
    if (included.length >= maxFiles) {
      ignored.push({ filename, reason: "max file budget reached" });
      continue;
    }
    if (totalPatchBytes + patchBytes > maxTotalPatchBytes) {
      ignored.push({ filename, reason: "max total patch budget reached" });
      continue;
    }
    totalPatchBytes += patchBytes;
    included.push({
      filename,
      status: file.status,
      additions: file.additions,
      deletions: file.deletions,
      patch
    });
  }

  return { included, ignored, totalPatchBytes, totalFiles: files.length };
}

function ignoreReason(filename, patchBytes, maxPatchBytes) {
  if (!filename) {
    return "missing filename";
  }
  if (patchBytes === 0) {
    return "no text patch";
  }
  if (patchBytes > maxPatchBytes) {
    return "patch too large";
  }
  if (
    /(^|\/)(dist|coverage|build|generated)\//.test(filename) ||
    /\.(png|jpg|jpeg|gif|webp|ico|pdf|zip|gz|wasm)$/i.test(filename) ||
    /(^|\/)(pnpm-lock\.yaml|package-lock\.json|yarn\.lock)$/.test(filename)
  ) {
    return "generated, binary, or lockfile";
  }
  return "";
}

async function readHarnessContext() {
  const files = [
    "AGENTS.md",
    "docs/agents/github-review-bot.md",
    "docs/HARNESS.md",
    "docs/FEATURE_INTAKE.md",
    "docs/ARCHITECTURE.md",
    "docs/TEST_MATRIX.md",
    "package.json"
  ];
  const context = [];
  for (const file of files) {
    try {
      const text = await readFile(file, "utf8");
      context.push({ file, text: trimForPrompt(text, 12_000) });
    } catch {
      context.push({ file, text: "[missing]" });
    }
  }
  return context;
}

function trimForPrompt(text, limit) {
  if (text.length <= limit) {
    return text;
  }
  return `${text.slice(0, limit)}\n\n[truncated]`;
}

async function callOpenAIReview({ apiKey, model, reasoningEffort, pullRequest, filtered, context }) {
  const requestBody = {
    model,
    input: [
      {
        role: "system",
        content: [
          {
            type: "input_text",
            text: [
              "You are a Codex-style senior code reviewer for a Harness-managed repository.",
              "Focus on hidden bugs, security vulnerabilities, counterproductive design patterns, missing tests, and contract drift.",
              "Do not nitpick formatting. Do not invent findings without diff or context evidence.",
              "Return only the requested structured JSON."
            ].join("\n")
          }
        ]
      },
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: buildPrompt({ pullRequest, filtered, context })
          }
        ]
      }
    ],
    text: {
      format: {
        type: "json_schema",
        name: "github_review_bot_result",
        strict: true,
        schema: REVIEW_SCHEMA
      }
    }
  };
  if (reasoningEffort) {
    requestBody.reasoning = { effort: reasoningEffort };
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json"
    },
    body: JSON.stringify(requestBody)
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(`OpenAI request failed: ${response.status} ${JSON.stringify(payload)}`);
  }
  const text = extractResponseText(payload);
  const review = JSON.parse(text);
  validateReviewResult(review);
  return review;
}

function buildPrompt({ pullRequest, filtered, context }) {
  return JSON.stringify(
    {
      pullRequest: {
        number: pullRequest.number,
        title: pullRequest.title,
        author: pullRequest.user?.login,
        base: pullRequest.base?.ref,
        head: pullRequest.head?.ref,
        fork: isForkPullRequest(pullRequest)
      },
      diffBudget: {
        totalFiles: filtered.totalFiles,
        includedFiles: filtered.included.length,
        ignoredFiles: filtered.ignored
      },
      harnessContext: context,
      changedFiles: filtered.included
    },
    null,
    2
  );
}

function extractResponseText(payload) {
  if (typeof payload.output_text === "string") {
    return payload.output_text;
  }
  const parts = [];
  for (const item of payload.output ?? []) {
    for (const content of item.content ?? []) {
      if (content.type === "output_text" && typeof content.text === "string") {
        parts.push(content.text);
      }
    }
  }
  if (!parts.length) {
    throw new Error("OpenAI response did not include output_text.");
  }
  return parts.join("");
}

function validateReviewResult(value) {
  if (!value || typeof value !== "object") {
    throw new Error("Review result must be an object.");
  }
  if (typeof value.summary !== "string" || !value.summary.trim()) {
    throw new Error("Review result missing summary.");
  }
  if (!["low", "medium", "high"].includes(value.riskLevel)) {
    throw new Error("Review result has invalid riskLevel.");
  }
  if (!Array.isArray(value.findings)) {
    throw new Error("Review result missing findings array.");
  }
  for (const finding of value.findings) {
    validateFinding(finding);
  }
  if (!Array.isArray(value.requiredChecks) || !Array.isArray(value.harnessNotes)) {
    throw new Error("Review result missing requiredChecks or harnessNotes.");
  }
}

function validateFinding(finding) {
  const severities = ["P0", "P1", "P2", "P3"];
  const categories = [
    "hidden_bug",
    "security",
    "anti_pattern",
    "missing_test",
    "contract_drift"
  ];
  if (!severities.includes(finding.severity)) {
    throw new Error(`Invalid finding severity: ${finding.severity}`);
  }
  if (!categories.includes(finding.category)) {
    throw new Error(`Invalid finding category: ${finding.category}`);
  }
  for (const key of ["file", "title", "evidence", "impact", "recommendation"]) {
    if (typeof finding[key] !== "string") {
      throw new Error(`Finding missing string field: ${key}`);
    }
  }
  if (!(Number.isInteger(finding.line) || finding.line === null)) {
    throw new Error("Finding line must be an integer or null.");
  }
  if (typeof finding.confidence !== "number" || finding.confidence < 0 || finding.confidence > 1) {
    throw new Error("Finding confidence must be a number from 0 to 1.");
  }
}

function buildNoFindingReview(filtered) {
  return {
    summary: "No model review was provided; dry-run rendered filtered diff metadata only.",
    riskLevel: filtered.ignored.length ? "medium" : "low",
    findings: [],
    requiredChecks: [],
    harnessNotes: filtered.ignored.length
      ? ["Some files were ignored by diff budget; human review may still be needed."]
      : []
  };
}

function renderComment({ review, pullRequest, filtered }) {
  const lines = [
    BOT_MARKER,
    "",
    "## AI Review",
    "",
    `PR: #${pullRequest?.number ?? "unknown"} ${pullRequest?.title ?? ""}`.trim(),
    `Risk: **${review.riskLevel}**`,
    "",
    review.summary,
    ""
  ];

  if (review.findings.length) {
    lines.push("### Findings", "");
    for (const finding of review.findings) {
      const location = finding.file
        ? `${finding.file}${finding.line ? `:${finding.line}` : ""}`
        : "unknown location";
      lines.push(
        `- **${finding.severity} ${finding.category}** ${finding.title}`,
        `  - Location: \`${location}\``,
        `  - Evidence: ${finding.evidence}`,
        `  - Impact: ${finding.impact}`,
        `  - Recommendation: ${finding.recommendation}`,
        `  - Confidence: ${finding.confidence.toFixed(2)}`
      );
    }
    lines.push("");
  } else {
    lines.push("No high-confidence findings were reported.", "");
  }

  if (review.requiredChecks.length) {
    lines.push("### Required Checks", "");
    for (const check of review.requiredChecks) {
      lines.push(`- ${check}`);
    }
    lines.push("");
  }

  if (review.harnessNotes.length) {
    lines.push("### Harness Notes", "");
    for (const note of review.harnessNotes) {
      lines.push(`- ${note}`);
    }
    lines.push("");
  }

  lines.push(
    "### Diff Budget",
    "",
    `Reviewed ${filtered.included.length}/${filtered.totalFiles} changed files (${filtered.totalPatchBytes} patch bytes).`
  );
  if (filtered.ignored.length) {
    lines.push("", "<details><summary>Ignored files</summary>", "");
    for (const file of filtered.ignored) {
      lines.push(`- \`${file.filename}\`: ${file.reason}`);
    }
    lines.push("", "</details>");
  }

  return `${lines.join("\n")}\n`;
}

async function upsertBotComment({ token, owner, repo, prNumber, body }) {
  const comments = await githubJson(
    token,
    `/repos/${owner}/${repo}/issues/${prNumber}/comments?per_page=100`
  );
  const existing = comments.find((comment) => comment.body?.includes(BOT_MARKER));
  if (existing) {
    await githubJson(token, `/repos/${owner}/${repo}/issues/comments/${existing.id}`, {
      method: "PATCH",
      body: { body }
    });
    console.log(`Updated existing AI review comment ${existing.id}.`);
    return;
  }
  await githubJson(token, `/repos/${owner}/${repo}/issues/${prNumber}/comments`, {
    method: "POST",
    body: { body }
  });
  console.log("Created AI review comment.");
}

async function githubJson(token, path, options = {}) {
  const response = await fetch(`https://api.github.com${path}`, {
    method: options.method ?? "GET",
    headers: {
      accept: "application/vnd.github+json",
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
      "x-github-api-version": "2022-11-28"
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new Error(`GitHub request failed ${response.status}: ${text}`);
  }
  return payload;
}

function requireEnv(value, name) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}
