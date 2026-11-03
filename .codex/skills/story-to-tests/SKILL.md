---
name: story-to-tests
description: Orchestrate one UI Jira story through jira-intake, story-doc-check, implementation-check (pause for report review), ui-test-case-creator, tc-verifier, user approval, and testomat-sync to deliver approved cases in Testomat.io. Not for API issues.
argument-hint: "<Jira issue key, e.g. SKY-1>"
disable-model-invocation: true
allowed-tools:
  - Skill
  - Agent
  - AskUserQuestion
  - Read
  - Grep
  - Glob
  - Write(test-cases/**)
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
---

# Story to approved UI tests

Take a Jira UI issue through requirement and implementation review, author and independently verify its manual UI/E2E cases, obtain the user's approval, then sync the approved cases to Testomat.io and create a run containing those cases.

Use the existing `jira-intake`, `story-doc-check`, `ui-test-case-creator`, and `testomat-sync` skills, and the `implementation-check` and `tc-verifier` agents for their defined responsibilities. Pass the same unmodified Jira intake JSON between the applicable stages. Do not duplicate their procedures or weaken their evidence rules.

## Workflow and approval gates

### 1. Jira intake and UI routing

1. Require a Jira issue key and run `jira-intake` to obtain its JSON record. Preserve that record as the source for issue title, acceptance criteria, issue type, and linked Confluence URL; do not infer or supplement acceptance criteria.
2. Continue only when `check_type` is exactly `ui`. If it is `api`, stop and tell the user that API issues will have a separate flow. If it is `null` or otherwise ambiguous, stop and report the intake caveat; do not infer the type from issue content.
3. If there are no explicit acceptance criteria, report that fact and stop rather than deriving criteria from the title or description.

### 2. Documentation and implementation report gate

1. Run `story-doc-check` and the `implementation-check` agent on the same intake JSON. The documentation check must use only SkyPermit Docs in Confluence space `SD`; the implementation check must inspect `../skypermit` read-only.
2. Present both reports together, preserving the per-criterion statuses and cited evidence. Summarize documented gaps or conflicts and implementation gaps without changing their verdicts.
3. Ask the user whether to continue to case creation and wait for an explicit affirmative answer. Do not draft cases, write local case files, or sync Testomat records before that answer. If the user declines or does not authorize continuation, stop.

### 3. Author and independently verify cases

1. After the user authorizes continuation, use `ui-test-case-creator` to create the complete applicable set of atomic UI/E2E cases for the supplied acceptance criteria that have sufficient, non-conflicting requirement evidence. Follow its ID, template, folder, selector, coverage, and citation rules.
2. Read authoritative behavior from the relevant Confluence pages in `SkyPermit Docs` (`SD`), reconciling related data model, state machine, API contract, frontend scope, business rules, clarifications, and open questions as needed. A Jira link is only a locator; it is not requirement evidence. Do not use implementation or local application docs to invent expected results.
3. If a criterion is undocumented, ambiguous, or contradicted without a governing resolution, do not invent a case for the unsupported behavior. Record the open question with the Confluence page, section, and link. Continue only for other criteria whose behavior is sufficiently documented.
4. After each case is written, submit it to the `tc-verifier` agent for independent review. Provide the exact case path, intake criterion it covers, and relevant Confluence page links. Keep a case only when the primary verdict is `Відповідає`. If the verifier identifies a case-authoring defect, correct the case and resubmit it. Never change a case to match implementation where implementation conflicts with requirements. If the verdict is `Не відповідає` because implementation conflicts, or `Документація мовчить`, exclude that case from the approved set and report the blocker and evidence. Never overwrite or delete a pre-existing case.
5. If no verified cases remain, report the blockers and stop; do not proceed to the Testomat approval gate.

### 4. User approval gate for Testomat

Show the user the full content or readable links/paths for every `Відповідає` case, along with its ID, title, priority, criterion mapping, and verifier verdict. Also list excluded cases and open questions, if any. Ask explicitly whether the user approves syncing these cases to Testomat.io and creating a run containing them.

Wait for explicit approval. If the user declines, stop without making Testomat changes. If the user requests revisions, revise the local cases, rerun `tc-verifier` for changed cases, then present the updated set and ask again. Approval applies only to the displayed, verified set.

### 5. Sync and create a run

Only after explicit approval, use `testomat-sync` for the approved cases:

1. Use `<issue key>: <issue title>` as the suite title and upsert into the matching Testomat file suite, reusing it when present. Use the canonical test title `<case_id>: <title>`, preserve the complete case description, priority, and manual state, and tag each case with the Jira issue key. Follow `testomat-sync` duplicate handling and verify the resulting records.
2. Create a run containing only the Testomat test IDs returned for the approved cases; do not include unrelated suite cases. Verify the run and its case count.
3. Report the suite, each case's Testomat ID, any duplicate IDs, and the run ID, URL, included test IDs, and initial status. Do not record results or claim that the run passed.

If a Testomat write reports an error, first inspect whether the intended record was persisted before retrying. Do not blindly repeat writes or delete uncertain records.

## Boundaries

- Jira, Confluence, and `../skypermit` are read-only throughout this workflow.
- Local case authoring is limited to `test-cases/`; do not edit other repository files as part of the workflow.
- Testomat writes and run creation are permitted only after the user approves the exact verified case set shown at the final approval gate.
- At either approval gate, a question is a real pause: do not proceed until the user answers affirmatively.
