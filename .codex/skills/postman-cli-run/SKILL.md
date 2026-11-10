---
name: postman-cli-run
description: Run ONE Postman collection through Postman CLI and return pass/fail for each case in testomat-sync report format. Only after the user explicitly says “запускай”. Do NOT build or edit collections, fix tests, or write to Testomat.
argument-hint: '{"key": "SKY-2", "collection_id": "<uid>", "environment_id": "<uid>"}'
allowed-tools:
  - mcp__postman__getCollection
  - mcp__postman__getEnvironment
  - Bash(postman collection run:*)
  - Bash(mkdir -p api-automation/runs)
  - Read(api-automation/runs/**)
---

# Run a reviewed collection with Postman CLI

Use this skill when the user asks to execute one Postman collection and requests results by API case. Use only the collection and environment IDs supplied by the user and the enabled Postman MCP and Postman CLI tools. Do not read or write application repository files.

## Authorization gate

- Do not start, retry, or resume a collection run until the user has explicitly said **«запускай»** in this conversation. A general approval such as «ок», a prior authorization from another conversation, or a request to prepare the run is not run authorization.
- Confirm the collection and its intended environment, and inspect required variables without printing secret values. If a required secret is empty or the target API is clearly unavailable, stop and report what must be configured before running; do not knowingly run with missing prerequisites.
- Do not modify or repair the collection, its scripts, the environment, or the application to make a run pass. Do not alter request data or expected assertions. Report failures as observed.

## Execution and artifacts

1. Run the specified collection using Postman CLI with the specified environment. Preserve collection order and the configured iteration count unless the user explicitly requested different run settings.
2. Create `api-automation/runs/` if needed, then write the CLI run report there using a unique run-specific prefix so prior reports are not overwritten. Do not write artifacts into `../skypermit`.
3. Capture each request's actual HTTP status and each failed Postman test assertion. Include transport errors or requests that did not execute as errors/skipped; never infer a status or pass result that the CLI did not report.
4. Map request names beginning `<case id>:` back to case IDs. A case passes only if all its executed requests returned the expected statuses and all its assertions passed. If a case has multiple requests, report their individual outcomes and the aggregate case outcome. Identify requests without a matching case ID as unmapped.
5. Never include credentials or secret environment values in the user-facing summary or result messages. Inspect available run output without reproducing secret values; if a value appears secret, omit it from the analysis. Do not alter the collection or environment to redact or otherwise change test inputs.

## Result format

Return a concise summary and a result object compatible with the `testomat-sync` skill's `report` input. Do not call Testomat or record results there unless the user separately asks for that action. Use observed statuses only (`passed`, `failed`, or `skipped`) and include concrete failure details in `message`:

```json
{
  "run_id": "<Postman CLI run identifier or local report prefix>",
  "test_ids": ["<case id>", "..."],
  "results": [
    {
      "test_id": "<case id>",
      "status": "failed",
      "message": "POST /path returned HTTP 500 (expected 422); failed assertion: HTTP status is 422."
    }
  ]
}
```

Also show per request: case ID, request name, actual status (or transport error/not executed), passed assertions, and failed assertions. For each failure, explain what was observed and how it differs from the case/contract expectation. Keep analysis evidence-based; do not edit anything to make the test pass.
