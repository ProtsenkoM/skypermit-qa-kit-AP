---
model: GPT-6-Sol
name: ui-test-case-creator
description: Create the complete set of evidence-based, low-level manual UI/E2E test cases for documented behavior, exercising the product through forms and verified data-testid selectors. Apply equivalence partitioning (EP), boundary value analysis (BV), and state transition testing where the requirements make them applicable. Do not use for API test cases; a separate API test-case skill handles those. Do not use for test plans or checklists.
---

# UI Test Case Creator

Use GPT-6-Sol for this workflow.

Create the complete set of atomic UI/E2E test cases needed to cover the requested documented behavior. Every case must operate through the user interface forms and use verified `data-testid` selectors where available. Apply equivalence partitioning (EP), boundary value analysis (BV), and state transition testing wherever the documented behavior supports them. Do not omit applicable valid/invalid partitions, boundaries, or legal/representative illegal transitions merely to reduce the case count. Keep each case focused on one condition or outcome.

## Evidence

1. Require a Confluence source page or link and one behavior to verify. Infer the behavior only when the request and source make it unambiguous.
2. Follow the repository's `AGENTS.md`, authority order, and read-only boundaries. Read requirements from Confluence space `SkyPermit Docs` (key `SD`) using `mcp__atlassian__search` to locate pages and `mcp__atlassian__getConfluencePage` to read them. Reconcile related pages: data model, state machine, API contract, frontend scope, business rules, open questions, and clarifications.
3. Do not invent expected behavior. If a conflict or gap changes the expected result, ask one concise question instead of writing the case.
4. Cite the exact Confluence page, section, and link in `Doc ref`. Implementation may confirm behavior but does not replace documented requirements. The local `../skypermit/docs/` files are not the source for case requirements.
5. Keep every scenario UI/E2E: enter or change data through the documented form and verify visible outcomes through the UI. Read `data-testid` selectors from `../skypermit/app/` and `../skypermit/components/` and use them to identify form fields and controls in the steps when available. Do not call API endpoints or assert API-only responses; use the separate API test-case skill for that coverage.

## Example

Before drafting, inspect the files in [`example/`](example/) when that directory contains an example. Follow the example's granularity, field presentation, and writing style. Treat it only as a format and atomicity reference: authoritative requirements still govern test data and expected results.

## Test design and atomicity

- Test one condition, boundary, permission, transition, or response outcome.
- Keep setup in `Precondition`; do not test setup as part of the case.
- Use only the steps needed to trigger the verification.
- State one primary observable outcome in `Expected result`. Include coupled effects from the same action only when separating them would make the check invalid.
- Do not combine positive and negative variants, roles, transitions, or boundaries in one case.
- Build the set systematically: identify equivalence partitions, derive boundary values for ordered/numeric/date-time constraints, and enumerate applicable state transitions. Create a separate case for each distinct observable outcome needed to cover those techniques. Do not force a technique onto behavior where it does not apply.
- If the request explicitly limits scope to a single case or a subset of the behavior, honor that limit and state which applicable coverage is outside scope.

## Output

Write one English Markdown file per test case to:

`test-cases/<area>/<feature>/<test-case-id>.md`

- Choose `<area>` as `ui` for this skill. API cases belong to the separate API test-case skill.
- Derive `<feature>` from the tested behavior. Use `kebab-case` directories and filenames.
- Format every ID as `E2E-<ROLE>-<MODULE>-<NNN>`, for example `E2E-OP-LOGIN-006`.
- `<ROLE>` is the stable uppercase code for the acting role (`OP` for Operator). `<MODULE>` is a concise uppercase code derived from the operation tested, such as `REGISTRATION`, `LOGIN`, `LOGOUT`, or `SUBMIT`. Use the same module code consistently for the same operation type.
- Use supplied valid IDs when provided. Otherwise inspect all existing test cases and assign the next unused zero-padded three-digit number for that role, regardless of module, then allocate sequential unique IDs to the rest of the set. If the role or module code is ambiguous, ask the user instead of inventing it.
- Use the lowercase ID as the filename, for example `e2e-op-login-006.md`.
- Do not overwrite an existing case unless the user asks to update it.

Start every case from [`template/test-case.md`](template/test-case.md). Preserve its headings and replace every placeholder with requirement-backed content; do not leave placeholder text in the completed case.

`Priority` and `Test data` are required by this repository's `AGENTS.md`. Keep test data concrete and preserve exact boundary values.

## Validation

Confirm that each file contains one verification, every step contributes to it, every expected result is directly supported by `Doc ref`, paths follow the agreed structure, and IDs are unique. Review the set against applicable EP, BV, and state transition coverage; explain any technique that does not apply or any requirement gap that prevents a case. Run `git diff --check` and `git status --short`, then report all created files or the requirement gap that prevented creation.
