---
name: story-to-api-tests
description: Orchestrate one API Jira story through requirement and implementation review, verified API cases, user approval, Testomat, Postman collection review, execution, and result reporting. Not for UI issues.
argument-hint: "<Jira issue key, e.g. SKY-2>"
disable-model-invocation: true
allowed-tools:
  - Skill
  - Agent
  - AskUserQuestion
  - Read
  - Grep
  - Glob
  - Write(test-cases/api/**)
  - Read(../skypermit/public/openapi.yaml)
  - Bash(postman collection run:*)
  - Bash(mkdir -p api-automation/runs)
  - Read(api-automation/runs/**)
  - mcp__atlassian__getJiraIssue
  - mcp__atlassian__getJiraIssueRemoteIssueLinks
  - mcp__atlassian__searchConfluenceUsingCql
  - mcp__atlassian__search
  - mcp__atlassian__getConfluencePage
  - mcp__testomatio__suites_list
  - mcp__testomatio__suites_create
  - mcp__testomatio__tests_list
  - mcp__testomatio__tests_create
  - mcp__testomatio__tests_update
  - mcp__testomatio__project_info
  - mcp__testomatio__runs_create
  - mcp__testomatio__runs_get
  - mcp__testomatio__runs_update
  - mcp__testomatio__testruns_list
  - mcp__testomatio__testruns_create
  - mcp__testomatio__testruns_update
  - mcp__postman__getCollections
  - mcp__postman__getEnvironments
  - mcp__postman__createCollection
  - mcp__postman__createEnvironment
  - mcp__postman__getCollection
  - mcp__postman__getEnvironment
---

# Story to approved API tests

Take one Jira API issue through documentation and implementation review, create and independently verify API cases, obtain approval, sync them to Testomat, and create a run. Build one Postman collection and environment, pause for review, then execute and report results only after the user explicitly says «запускай».

Use `jira-intake`, `story-doc-check`, `api-test-case-creator`, `testomat-sync`, `postman-collection-builder`, and `postman-cli-run` for their defined responsibilities, and the `implementation-check` and `tc-verifier` agents for independent reviews. Pass the same unmodified Jira intake JSON between applicable stages. Do not duplicate their procedures or weaken their evidence, safety, or approval rules. If a required skill, agent, tool, or input is unavailable, report the blocker and stop at that stage; do not substitute an unapproved write path.

## Workflow and approval gates

### 1. Jira intake and API routing

1. Require a Jira issue key and run `jira-intake` to obtain its JSON record. Preserve it as the source for the issue title, acceptance criteria, check type, and linked Confluence URL; do not infer or supplement criteria.
2. Continue only when `check_type` is exactly `api`. If `ui`, stop and direct the user to `/story-to-tests`. If `null` or ambiguous, stop and report the intake caveat; do not infer the type from issue content.
3. If there are no explicit acceptance criteria, report that fact and stop rather than deriving criteria from the title or description.

### 2. Documentation and implementation report gate

1. Run `story-doc-check` and the `implementation-check` agent on the same intake JSON. The documentation check must use only SkyPermit Docs in Confluence space `SD`; the implementation check must inspect `../skypermit` read-only.
2. Present both reports together, preserving per-criterion statuses and cited evidence. Summarize documented gaps or conflicts and implementation gaps without changing their verdicts.
3. Ask whether to continue to case creation and wait for an explicit affirmative answer. Do not draft cases, write local case files, or sync Testomat records before that answer. If the user declines or does not authorize continuation, stop.

### 3. Author and independently verify cases

1. After authorization, identify the distinct business rules within the acceptance criteria and invoke `api-test-case-creator` separately for each one. Create the complete applicable set of API cases for criteria with sufficient, non-conflicting requirement evidence. Follow its ID, template, request, coverage, and citation rules; preserve each case's criterion and rule mapping.
2. Read authoritative behavior from relevant Confluence pages in `SD`, reconciling the data model, state machine, API contract, business rules, clarifications, and open questions as needed. A Jira link is only a locator, not requirement evidence. Do not use implementation or local application docs to invent expected results.
3. If a criterion is undocumented, ambiguous, or contradicted without a governing resolution, do not invent a case for the unsupported behavior. Record the open question with Confluence page, section, and link. Continue for other sufficiently documented behavior.
4. After each case is written, submit it to `tc-verifier` with `mode: api`, its exact path, the intake criterion it covers, and relevant Confluence links. Keep a case in the approved candidate set only when the primary verdict is `Відповідає`. Correct case-authoring defects and resubmit. Never change a case to match implementation where it conflicts with requirements. If `Не відповідає` reflects an implementation conflict, or the verdict is `Документація мовчить`, exclude the case and report the blocker and evidence. Never overwrite or delete a pre-existing case.
5. If no verified cases remain, report blockers and stop; do not proceed to the Testomat approval gate.

### 4. User approval gate

Show the full content or readable links/paths for every `Відповідає` case, with ID, title, priority, criterion mapping, and verifier verdict. List excluded cases and open questions. Ask explicitly whether the user approves syncing this exact set to Testomat, creating its run, and building its Postman collection and environment.

Wait for explicit approval. If the user declines, stop without Testomat or Postman changes. If revisions are requested, revise the local cases, rerun `tc-verifier` in API mode for changed cases, and present the updated set for approval again. Approval applies only to the displayed, verified set. It does not authorize execution.

### 5. Sync and create a run

Only after approval, use `testomat-sync`:

1. Upsert the approved cases into the matching file suite titled `<issue key>: <issue title>`. Preserve complete case descriptions, priorities, manual state, and task-key tags; follow duplicate handling and verify the records.
2. Create and verify a run titled `<KEY> · API` containing only the Testomat test IDs returned for the approved cases. Retain the Testomat run ID, complete included Testomat test IDs, and case-ID-to-test-ID mapping for reporting.
3. Report suite and case IDs, duplicates, run ID, URL, inclusion list, and initial status. Do not record outcomes or claim the run passed.

### 6. Build and review the Postman collection

Use `postman-collection-builder` with the issue key, exact approved case file paths, collection name `<KEY> · API`, and the target base URL. Obtain missing required inputs from the user; do not guess the target or credentials. Follow the builder's collision checks, OpenAPI mapping, assertion, secret, and resource-safety rules. Create exactly one new collection and one new environment and retain their IDs. If tools are unavailable, inputs are missing, or a case-to-contract conflict prevents a reliable collection, report the blocker and stop.

Present the builder's full review handoff, including collection and environment IDs, requests in order, status and body assertions, missing configuration, and unresolved issues. Stop for the user's review in Postman. Do not execute or report results at this gate. If changes are requested, do not silently alter the collection or cases; resolve them within the relevant skill's boundaries and repeat any affected verification and approval gates.

### 7. Execute and report

Proceed only after the review and the user explicitly says **«запускай»** in this conversation. A general approval is not execution authorization. Use `postman-cli-run` with the reviewed collection and environment IDs; confirm those IDs with the user as required by that skill. Follow its prerequisite checks, reporting, secret handling, and no-repair rules. If prerequisites are missing or execution cannot proceed, report the blocker and leave the Testomat run open. Do not retry or resume without the explicit authorization required by that skill.

Pass the actual case-level results unchanged to `testomat-sync report`, separately supplying the retained Testomat run ID, complete Testomat inclusion list, and case-to-test mapping. The Postman run ID or local report prefix is not the Testomat run ID. Preserve `passed`, `failed`, and `skipped` statuses and failure messages; ensure failures are recorded as `failed`. Never infer results for unmapped, missing, or unexecuted cases. Follow `testomat-sync` verification and run-closing rules; leave the run open when results are missing, ambiguous, pending, or failed to save. Report per-case outcomes, unresolved items, and the verified Testomat run status.

## Boundaries

- Jira, Confluence, and `../skypermit` are read-only throughout. Local case authoring is limited to `test-cases/api/`; Postman CLI artifacts are limited to `api-automation/runs/` as specified by its skill.
- Testomat and Postman creation is permitted only after approval of the exact verified case set. Postman execution requires the separate explicit «запускай» gate.
- At every approval or review gate, pause until the user responds; do not treat elapsed time or general approval as permission to execute.
- On failed external writes, use each skill's safe-retry rules. Do not blindly repeat writes or delete uncertain records.
