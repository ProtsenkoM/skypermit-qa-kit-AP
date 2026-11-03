---
name: jira-intake
description: Read a Jira issue by key and return a compact JSON intake record with its title, explicit UI/API label, acceptance criteria, and linked Confluence URL. Use when a user needs structured Jira issue details; do not use for Confluence requirement analysis, implementation review, or creating or editing Jira content.
argument-hint: "<issue key, e.g. SKY-123>"
allowed-tools:
  - mcp__atlassian__getJiraIssue
  - mcp__atlassian__getJiraIssueRemoteIssueLinks
---

# Jira intake

Given one Jira issue key, read the issue and return the fields needed for QA intake. This is a read-only workflow: do not create, edit, transition, comment on, or otherwise change Jira data. Do not read Confluence pages; only collect a Confluence URL explicitly linked from the Jira issue.

## When to use

Use this skill when the user provides a Jira issue key and wants a structured summary suitable for downstream QA work.

Do not use it to check whether acceptance criteria are documented in Confluence, derive test cases, assess implementation, or update Jira. Use a documentation-check or test-case skill for those tasks.

## Workflow

1. Read the issue with `mcp__atlassian__getJiraIssue`. Set `updateHistory` to `false` and request `fields: ["*all"]` so custom acceptance-criteria fields are available. Treat the issue key as the only required input.
2. Read Jira remote issue links with `mcp__atlassian__getJiraIssueRemoteIssueLinks` to identify any explicitly linked Confluence URL. Do not follow the link or read Confluence.
3. Extract the summary as `title`. Extract acceptance criteria only from content explicitly identified as acceptance criteria (for example, an “Acceptance Criteria” heading or a dedicated AC field). Preserve each criterion as a separate list item and retain its meaning; do not infer criteria from general description text. If none are explicitly present, return `[]` and say so in `notes`.
4. Set `check_type` only from the Jira issue's labels: exact label `ui` means `ui`; exact label `api` means `api`. If neither is present, or both are present, use `null` and explain the missing or conflicting labels in `notes`. Do not infer the type from title, description, components, issue type, or linked pages.
5. Set `confluence_url` to the single explicit Confluence URL found in Jira issue data or its Jira remote links. If none is present, use `null`. If multiple distinct Confluence URLs are linked, use `null` and list the candidates in `notes`.
6. Return only valid JSON, with exactly the keys and value types shown below. Use `null` for an unavailable scalar, `[]` when no explicit acceptance criteria are present, and an empty string for `notes` when there is no caveat. Do not wrap the JSON in Markdown fences or add prose.

```json
{
  "key": "SKY-123",
  "title": "Issue summary",
  "check_type": "ui",
  "acceptance_criteria": [
    "An explicitly stated acceptance criterion"
  ],
  "confluence_url": "https://example.atlassian.net/wiki/...",
  "notes": ""
}
```

If the issue cannot be read, return the same JSON shape with the requested key, `title`, `check_type`, and `confluence_url` as `null`, `acceptance_criteria` as `[]`, and a concise explanation in `notes`. Do not fabricate or silently omit unavailable data.
