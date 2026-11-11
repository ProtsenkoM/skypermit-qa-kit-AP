---
name: api-test-case-creator
description: Write API test cases for ONE SkyPermit business rule in test-cases/api/, with HTTP requests to /api/v1 in Steps and status codes and 422 response bodies in Expected result. Apply BV and EP through validate checks and state transition testing through request chains. Do NOT use for UI cases (ui-test-case-creator) or executing requests (postman-cli-run).
argument-hint: '{"gate": "TIME_WINDOW", "rule_reference": "TSD-4 §2.1", "story": "SKY-2"}'
model: GPT-6-Sol
allowed-tools:
  - Read(test-cases/**)
  - Grep(test-cases/**)
  - Glob(test-cases/**)
  - Write(test-cases/api/**)
  - mcp__atlassian__getConfluencePage
  - mcp__atlassian__searchConfluenceUsingCql
---

# API Test Case Creator

Use GPT-6-Sol for this workflow. Create the complete set of API test cases for one requested SkyPermit business rule. Keep each case focused on one condition or outcome, except for dependent requests needed to verify a state transition. For UI cases use ui-test-case-creator. Do not execute requests or create or run Postman collections; postman-cli-run handles authorized collection execution, and postman-collection-builder can later turn request chains into a collection.

## Evidence

1. Interpret the input as one business rule: `gate` and `rule_reference` identify it, and `story` provides context when supplied. These fields are optional if the rule is otherwise unambiguous. If the input identifies multiple rules or does not identify one unambiguously, ask which single rule to cover. Do not fetch or update the Jira story.
2. Follow the repository's `AGENTS.md` and read-only boundaries. Locate and read `03 — API Contract` and `06 — Business Rules` in Confluence space `SkyPermit Docs` (`SD`) using `mcp__atlassian__searchConfluenceUsingCql` and `mcp__atlassian__getConfluencePage`. Use 03 for endpoints, request/response contracts and status codes, and 06 for the rule. Reconcile other relevant Confluence pages, including the data model, state machine and clarifications, when needed.
3. Cite the exact Confluence page, section and link for each rule and contract assertion in `Doc ref`. Use Confluence as the source of requirements; do not read application implementation or local `../skypermit/docs/`. Do not use `data-testid` selectors.
4. Do not invent endpoints, status codes, response values, state transitions or expected behavior. Record conflicts or missing information as open questions with the source page and section; do not create an unsupported assertion. If a gap prevents a case, report it.

## Test design

- Apply equivalence partitioning (EP) and boundary value analysis (BV) where applicable. Make each valid or invalid partition and each boundary a separate case using `POST /api/v1/flight-requests/{id}/validate`. Provide concrete input values and document the expected response from the sources.
- Cover applicable state transitions with end-to-end chains of HTTP requests in execution order, including the response expected for each request and values carried forward. For example, where supported by documentation, verify `validate → GET` and `submit → REJECTED → repeated submit → 409`. `REJECTED` is a state to verify, not a request. Include documented prerequisites and intermediate responses; do not assume these example outcomes apply to every rule.
- Keep setup in `Precondition`, identify the initial state and role, and use only requests necessary to verify the outcome. Do not combine unrelated partitions, boundaries, roles, or transitions. If scope is explicitly limited, honor it and report excluded applicable coverage.

## Output

Write one English Markdown file per case under `test-cases/api/<feature>/`, using a kebab-case feature directory and lowercase ID filename, for example `api-op-001.md`. Use IDs `API-OP-001`, `API-OP-002`, and so on. Inspect existing case IDs under `test-cases/` and assign the next unused number, sequentially; do not overwrite existing cases unless asked.

Use the following template for every case and replace every placeholder. Specify concrete test data, including exact boundary values.

```markdown
# <ID> — <Title>

## ID
<ID>

## Doc ref
<Confluence page, section and link>

## Priority
<Priority>

## Precondition
- <Precondition>

## Test data
- <Field>: <Value>

## Steps
1. <HTTP request>

## Expected result
<Expected result for each request>
```

Each numbered step is an HTTP request under `/api/v1`: specify the method, full path, request body (or explicitly state none), and authorization. Use either an operator session or `X-Reviewer-Id` for a request, never both. Specify any required path parameters and values passed between requests; do not put secrets in the case. If the documented operation requires another authorization scheme or no authorization, flag the conflict instead of inventing credentials.

For each request, give its documented HTTP status in `Expected result`. For every expected `422`, also give the response body fields `failing_gate`, `rule_reference`, and `message` with values supported by the documentation. If exact values are not documented, do not guess: identify the missing values as an open question. Include documented state or response assertions needed to verify a transition, and associate each expected result with its request.

## Validation

Use the frontmatter tools for case discovery, Confluence evidence, and writing only under `test-cases/api/`. Check unique IDs, paths, complete template fields, request order, mutually exclusive authorization and traceability of every expected result to Confluence. Review applicable EP, BV and state transitions, and report any inapplicable technique or requirement gap. Run `git diff --check` and `git status --short`; report the created files and open questions.
