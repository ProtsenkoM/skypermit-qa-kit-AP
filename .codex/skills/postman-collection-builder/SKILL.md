---
name: postman-collection-builder
description: Build ONE Postman collection and its environment from API case files and openapi.yaml through Postman MCP. Name requests “<case id>: …”, add status and 422 body tests, and keep secrets only in the environment. Stop for review after creation. Do NOT run collections (postman-cli-run) or write cases.
argument-hint: '{"key": "SKY-2", "files": ["test-cases/api/..."], "collection_name": "SKY-2 · API", "base_url": "..."}'
allowed-tools:
  - Read(test-cases/**)
  - Read(../skypermit/public/openapi.yaml)
  - mcp__postman__getCollections
  - mcp__postman__getEnvironments
  - mcp__postman__createCollection
  - mcp__postman__createEnvironment
  - mcp__postman__getCollection
---

# Build a Postman collection from API cases

Use this skill when the user asks to turn SkyPermit API cases into exactly one Postman collection and its environment. Read only the user-specified files under `test-cases/` and `../skypermit/public/openapi.yaml`; do not read or write case files outside the supplied scope. The application repository is read-only.

## Sources and assertions

1. Read the requested API case files and the OpenAPI document. Extract each case ID, request steps, preconditions, test data, expected status, and observable response-body requirements.
2. Map operations, parameters, request schemas, response codes, and response schemas to OpenAPI. A case's documented expected result determines the behavior under test; use OpenAPI to build and validate the request and response shape. Do not invent expected values. If the case and contract conflict or do not establish an expected status/body assertion, flag that item for review instead of guessing.
3. Build the request sequence needed by each case. Use collection variables only for non-secret values that must be carried between requests (for example, a resource ID returned by an earlier request). Set each request name to `<case id>: <short step or purpose>` so run results map to their source case.
4. Add Postman test scripts to every request: assert the documented HTTP status and assert the response body's documented fields, types, values, or schema constraints that can be derived from the case and OpenAPI. For each documented `422` response, assert its documented body, including the `GateFailure` required fields (`failing_gate`, `rule_reference`, and `message`) when that response schema applies. Keep assertions specific to evidence; do not add speculative assertions.

## Secrets and resource safety

- Store credentials, tokens, API keys, and other secret test data only as secret variables in the Postman environment. Never place secret values in collection variables, request examples, scripts, iteration data, names, descriptions, or review output.
- If a required secret is absent, create the environment variable as an empty secret placeholder when supported and mark the environment as needing user configuration. Do not substitute a sample secret.
- Create a new collection and a new environment through Postman MCP. Check for naming collisions first and choose a distinct name rather than overwriting an existing resource. Do not update, replace, duplicate over, or delete an existing collection or environment. Do not edit case files or the OpenAPI file.
- Create exactly one new collection and exactly one new environment for this invocation. The builder does not execute requests, start Postman CLI, create a run, or write or edit API case files.

## Review handoff

After creating the resources, stop and present:

- The collection and environment names and IDs, and any required environment variables, with secret values omitted.
- Every request in execution order, including its `<case id>:` name, method, path, and expected status assertion.
- The response-body assertions configured for each request.
- Any unresolved case-to-contract conflicts, missing inputs, or secrets the user must supply.

Wait for the user's review. Do not run the collection as part of this skill.
