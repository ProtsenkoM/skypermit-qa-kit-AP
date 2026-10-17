---
name: test-case-creator
description: Create exactly one evidence-based, low-level manual test case as a Markdown file when the user asks for an atomic verification from requirements. Do not use for test plans, checklists, multi-check scenarios, or batches of test cases.
---

# Test Case Creator

Create one test case that verifies one observable rule or outcome.

## Evidence

1. Require a source file or directory and one behavior to verify. Infer the behavior only when the request and source make it unambiguous.
2. Follow the repository's `AGENTS.md`, authority order, and read-only boundaries. Inspect related authoritative sources when repository instructions require reconciliation.
3. Do not invent expected behavior. If a conflict or gap changes the expected result, ask one concise question instead of writing the case.
4. Cite the exact requirement file and section in `Doc ref`. Implementation may confirm behavior but does not replace documented requirements.

## Example

Before drafting, inspect the files in [`example/`](example/) when that directory contains an example. Follow the example's granularity, field presentation, and writing style. Treat it only as a format and atomicity reference: authoritative requirements still govern test data and expected results.

## Atomicity

- Test one condition, boundary, permission, transition, or response outcome.
- Keep setup in `Precondition`; do not test setup as part of the case.
- Use only the steps needed to trigger the verification.
- State one primary observable outcome in `Expected result`. Include coupled effects from the same action only when separating them would make the check invalid.
- Do not combine positive and negative variants, roles, transitions, or boundaries. Create only the requested case; mention additional case ideas without creating them when useful.

## Output

Write one English Markdown file to:

`test-cases/<area>/<feature>/<test-case-id>.md`

- Choose `<area>` from the repository's functional areas, such as `api`, `business-rules`, or `ui`.
- Derive `<feature>` from the tested behavior. Use `kebab-case` directories and filenames.
- Format every ID as `E2E-<ROLE>-<MODULE>-<NNN>`, for example `E2E-OP-LOGIN-006`.
- `<ROLE>` is the stable uppercase code for the acting role (`OP` for Operator). `<MODULE>` is a concise uppercase code derived from the operation tested, such as `REGISTRATION`, `LOGIN`, `LOGOUT`, or `SUBMIT`. Use the same module code consistently for the same operation type.
- Use a supplied valid ID when provided. Otherwise inspect all existing test cases and assign the next unused zero-padded three-digit number for that role, regardless of module. If the role or module code is ambiguous, ask the user instead of inventing it.
- Use the lowercase ID as the filename, for example `e2e-op-login-006.md`.
- Do not overwrite an existing case unless the user asks to update it.

Start every case from [`template/test-case.md`](template/test-case.md). Preserve its headings and replace every placeholder with requirement-backed content; do not leave placeholder text in the completed case.

`Priority` and `Test data` are required by this repository's `AGENTS.md`. Keep test data concrete and preserve exact boundary values.

## Validation

Confirm that the file contains one verification, every step contributes to it, the expected result is directly supported by `Doc ref`, the path follows the agreed structure, and the ID is unique. Run `git diff --check` and `git status --short`, then report the created file or the requirement gap that prevented creation.
