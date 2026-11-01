---
name: story-doc-check
description: Check a Jira story's acceptance criteria against SkyPermit Docs in Confluence and report documentation coverage, conflicts, or gaps. Use when the user provides a Jira issue key and asks whether its acceptance criteria are documented; do not use for creating test cases, checking implementation, or auditing requirements outside Confluence.
argument-hint: "<issue key, e.g. SKY-1>"
allowed-tools:
  - mcp__atlassian__getJiraIssue
  - mcp__atlassian__searchConfluenceUsingCql
  - mcp__atlassian__getConfluencePage
---

# Story documentation check

For a Jira issue key, map every acceptance criterion to evidence in the **SkyPermit Docs** Confluence space and report whether the documentation covers it, contradicts it, or does not describe it.

## When to use

Use this skill when the requested source of truth is the SkyPermit Docs Confluence space and the task is to trace a Jira story's acceptance criteria to that documentation.

Do not use it to create or update test cases, evaluate whether the application implements a criterion, review source code or tests, infer product behavior, or assess requirements from another space. Use a more specific QA skill for those tasks.

## Evidence and boundaries

- Read the Jira issue using `mcp__atlassian__getJiraIssue` and capture its acceptance criteria verbatim. The issue key is the required input.
- Search and read pages only in Confluence space key `SD` (SkyPermit Docs), using `mcp__atlassian__searchConfluenceUsingCql` and `mcp__atlassian__getConfluencePage`.
- Use documentation as the only evidence for behavior. Do not use application code, tests, local docs, prior conversation answers, or general domain knowledge to fill gaps or resolve ambiguity.
- This is a read-only workflow. Do not edit Jira, Confluence, or local files; do not add comments, create artifacts, or change external state.
- Search for each criterion's distinctive terms, rule identifiers, and relevant page titles. Read the matching page content and inspect the cited section before assigning a status. If the evidence is absent or too ambiguous after relevant searches, report `не описано` rather than guessing.
- Prefer the governing requirement and source sections when available. If one Confluence page summarizes another, cite the source page/section where possible and use the summary only to help locate it.
- Cite each page with its Confluence URL, section heading, and a brief exact quotation for `покрито`. Keep quotations short. For a conflict, identify both conflicting statements and their page sections. If the docs specify precedence, report it without hiding the conflict.

## Status rules

Assign exactly one status to every acceptance criterion:

- **покрито** — documentation explicitly supports the full criterion. Include page, section, and a short quotation.
- **суперечить** — a current Confluence statement conflicts with the criterion or two applicable documentation statements conflict. State what conflicts and cite both locations. If the documentation resolves the conflict by precedence, explain which statement governs while retaining this status for the documented conflict.
- **не описано** — no adequate documentation evidence was found for the criterion, or an essential part remains unspecified. Briefly name the missing part and the relevant searches/pages checked when useful. Do not turn an inference into coverage.

If a criterion has both supported and missing parts, use `не описано` and identify the supported part and the uncovered part in the evidence cell. If it contains a documented contradiction, use `суперечить` and make the conflicting parts explicit.

## Output

Respond in the user's language. Return one table row per acceptance criterion with these columns:

| # | Acceptance criterion | Статус | Докази в Confluence |
|---|---|---|---|

Link page titles to their Confluence URLs. Preserve each criterion's meaning; concise paraphrase is acceptable, but do not combine or omit criteria. End with exactly one summary line stating the counts or overall outcome, for example: `Підсумок: покрито — 3, суперечить — 1, не описано — 1.`
