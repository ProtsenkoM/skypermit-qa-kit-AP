---
name: testomat-sync
description: Sync cases from test-cases/ to Testomat.io: upsert without duplicates, create runs, and report results. Shared by story-to-tests and story-to-api-tests. Not for authoring or reviewing cases.
argument-hint: "upsert <suite> <key> <files...> | run <title> <test_ids> | report <run_id> <results>"
allowed-tools:
  - Read
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
---

# Testomat Sync

Use this skill as the single Testomat.io write path for both UI and API QA orchestration. The UI or API workflow owns requirement analysis and case content; this skill owns suite/test synchronization, run creation, and result reporting.

Use the configured `mcp__testomatio__*` tools. They act on the current Testomat project. Check `mcp__testomatio__project_info` when project scope is unclear. Do not use Jira links as a substitute for task tags: new tests must receive a Testomat tag equal to the task key (for example, `SKY-1`).

## `upsert`

Input: task key, suite title, and cases with a stable `case_id`, human-readable title, full description, priority, and manual/automated state.

1. List suites with `mcp__testomatio__suites_list` and find the exact suite title. Reuse a matching file-type suite. If none exists, create one with `mcp__testomatio__suites_create` and `file_type: "file"`; tests cannot be stored directly in a folder suite. Do not create a second suite when a matching file suite already exists.
2. List tests with `mcp__testomatio__tests_list`, following pagination. Restrict matches to the selected suite ID. For each case, find a title beginning exactly with `<case_id>:` (for example, `E2E-OP-TIMEWINDOW-007: Allow a window outside the curfew`).
3. If a matching test exists, reuse its ID and update its title/description/priority/state with `mcp__testomatio__tests_update` when supplied case content has changed. Do not create another test for that case ID. If more than one matching test exists, reuse one deterministic match and report the extra IDs as duplicates; do not silently delete tests.
4. If no matching test exists, create it with `mcp__testomatio__tests_create`, using the selected file suite and canonical title `<case_id>: <title>`. Add the task key as a tag using `link: [{ action: "add", type: "tag", value: "<task_key>" }]`. Do not use the Jira link type for this requirement.
5. Return the suite ID and one Testomat test ID per case, plus any duplicate IDs that need cleanup. Verify the resulting suite/test records before reporting success.

## `run`

Input: run title, the test IDs returned by `upsert`, and optional run kind/environment.

1. Create a run with `mcp__testomatio__runs_create`. Pass the selected IDs in `test_ids` so the run contains only the requested cases; do not pass the whole suite when it may include unrelated tests.
2. Read the returned run `id` as `run_id`, then verify with `mcp__testomatio__runs_get` that the run exists and its test count matches the selected IDs.
3. Return `run_id`, the full included `test_ids` list, run URL when available, and the run's initial status. The caller must retain this inclusion list for reporting. Do not record pass/fail outcomes at creation time.

## `report`

Input: `run_id`, the complete `test_ids` inclusion list returned by `run`, and actual results for those tests. Each result must include the test ID and an observed status (`passed`, `failed`, or `skipped`); include the user's failure details in `message` for failures. Never infer or invent outcomes.

1. Read the run and list existing records with `mcp__testomatio__testruns_list` for that `run_id`. Match by test ID. Update an existing result with `mcp__testomatio__testruns_update`; otherwise append it with `mcp__testomatio__testruns_create`. Preserve failure messages and include failed results.
2. Verify that every test in the run has a reported, non-pending result. If any result is missing, pending, or failed to save, leave the run open and report what is missing or failed.
3. Once all results are recorded, close a manual run with `mcp__testomatio__runs_update` and `status_event: "finish_manual"` (use the appropriate finish event for another run kind). Read the run again and verify its finished status.
4. Return the `run_id`, each test's final status, failure messages, and the closed run status.

## Safe retries and cleanup

Testomat may persist a record even when a write call reports an error. After a failed create/update, inspect suites/tests/runs for the intended record before retrying; do not blindly repeat a write. Delete a duplicate only when the extra record is confirmed and its identity is unambiguous. For uncertain or unrelated records, report the IDs instead of deleting them.
