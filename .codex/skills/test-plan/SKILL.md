---
name: test-plan
description: Generate a concise, evidence-based one-page manual test plan from a supplied file or directory. Use when the user wants scope, risks, manual test strategy, entry and exit criteria, and open questions summarized in an English Markdown plan.
---

# Test Plan

Create a risk-focused manual test plan from the file or directory supplied by the user.

## Inputs and evidence

1. Require a path to one file or directory. If it is missing, ask for it.
2. For a directory, inspect relevant files recursively. Exclude version-control metadata, dependencies, generated output, caches, and unrelated binary assets.
3. Support source material in different formats. Read text, code, and structured text directly; use an available format-specific tool or skill for PDF, DOCX, spreadsheets, presentations, or images when extraction or visual inspection is needed.
4. Treat the supplied path as the evidence boundary. Do not inspect unrelated locations unless the user asks or the repository instructions identify required authoritative sources.
5. Follow the repository's `AGENTS.md` and all read-only boundaries. Requirements documentation outranks implementation details when the repository defines an authority order.
6. Do not invent expected behavior. Record missing, ambiguous, or contradictory requirements as concise open questions.

## Output

- Write in English.
- Save as `test-cases/<feature>-test-plan.md` unless the user specifies another destination.
- Derive `<feature>` as a short `kebab-case` name from the source and its subject. Ask only when the feature cannot be determined reliably.
- Keep the entire Markdown document at or below 700 words, including headings and tables.
- Keep it at planning level. Do not expand it into detailed test cases, step-by-step scripts, or an automation plan unless the user requests them.
- Cite evidence inline in parentheses, using human-readable references such as `(Source: docs/04-business-rules.md — Approval gates)`. Prefer a section or heading when available; otherwise cite the file.

Use this compact structure:

```markdown
# <Feature> Test Plan

## Scope
### In Scope
### Out of Scope

## Key Risks

## Manual Test Strategy

## Readiness Criteria
### Entry Criteria
### Exit Criteria

## Open Questions
```

Omit `Out of Scope` only when the evidence provides no defensible boundary. Keep `Open Questions` present; write `None identified` when the reviewed sources are sufficiently clear.

## Content guidance

- **Scope:** State the behaviors, interfaces, roles, and flows covered. Separate explicit exclusions from assumptions.
- **Key Risks:** Prioritize a small set of product or delivery risks by impact and likelihood. Connect every risk to evidence or label it as an assumption requiring confirmation.
- **Manual Test Strategy:** Explain what will be tested manually and how coverage will be varied. Include only relevant positive, negative, boundary, role/permission, state-transition, data-integrity, integration, compatibility, accessibility, and recovery scenarios. Verify gate checks in their documented order when sequencing affects behavior.
- **Entry Criteria:** Define the minimum requirements, build, environment, access, roles, test data, and dependency conditions needed to start useful testing.
- **Exit Criteria:** Define observable completion conditions, required coverage, acceptable defect status, regression expectations, and resolution of release-blocking questions.
- **Open Questions:** Capture only gaps that can change scope, expected results, risk, or readiness. Include the conflicting or missing source references in parentheses.

## Workflow

1. Inventory the supplied source and identify the authoritative requirements, data model, state machine, API contract, frontend scope, business rules, and clarifications that are present.
2. Reconcile related statements across sources. Distinguish documented requirements from implementation observations and assumptions.
3. Draft the plan in risk order, with concise source references beside material claims.
4. Remove duplication and low-value detail until the document is no more than 700 words.
5. Before finishing, verify the output path and filename, required sections, English language, word limit, manual-testing focus, and traceability of each expected behavior to reviewed evidence.
6. Run the repository-required non-destructive checks, including `git diff --check` and `git status --short` when applicable. Report the created or updated file and unresolved open questions.
