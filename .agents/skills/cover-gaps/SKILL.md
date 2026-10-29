---
model: GPT-6-Sol
name: cover-gaps
description: Finds SkyPermit business rules without test cases, generates cases through test-case-creator, and accepts only those verified by tc-verifier.
argument-hint: "[max-rules] [gates]"
---

# Cover SkyPermit business-rule gaps

Use GPT-6-Sol for this workflow. Work in the QA-kit repository and treat `../skypermit` as read-only.

## Arguments

Interpret the optional arguments as `[max-rules] [gates]`:

- `max-rules` is an optional positive integer limiting the total selected rules across all requested gates. Omit it to process all uncovered rules.
- `gates` is an optional comma-separated list of `PILOT`, `AIRCRAFT`, `ZONE`, `TIME_WINDOW`, and/or `REGISTRATION`. Omit it to include all gates. `REGISTRATION` covers the `OH-1 §3` aircraft registration precondition, outside the four-gate pipeline.
- When gates are supplied, run the gap script once per gate using `--gate GATE`, with `--max N` when a limit is supplied. Merge the returned groups in canonical order (`PILOT`, `AIRCRAFT`, `ZONE`, `TIME_WINDOW`, `REGISTRATION`) and apply `max-rules` to the combined list. Without a gate filter, run the script once. The script's CLI accepts one gate per invocation.

## Workflow

1. Run `node scripts/uncovered-rules.mjs [--max N] [--gate GATE]` according to the arguments above. The script reads `../skypermit/docs/06-business-rules.md` §6, applies `07-clarifications.md`, and checks Markdown cases under `test-cases/`. Treat every selected row as a distinct rule identified by its exact `gate`, `condition`, and `rule_reference`; `ZC-2026.1 §2` appears under both `AIRCRAFT` and `ZONE`.
2. For each selected row, invoke the local `test-case-creator` skill as a separate one-case task. Provide the row, `../skypermit/docs/` as the source directory, and the relevant gate or registration operation. Reconcile the data model, state machine, API contract, frontend scope, business rules, clarifications, and current open questions as needed. Do not infer requirements from implementation alone. If a documentation gap prevents a supported expected result, do not fabricate a case; record the unresolved question with its source file and section.
3. In every created case, add the following section after the template sections, substituting the row's exact values:

   ```markdown
   ## Business rule
   - Gate: `PILOT`
   - Condition: Rating doesn't cover zone class
   - rule_reference: `OH-1 §2.1`
   ```

   This section is the gap script's coverage key, not requirement evidence. The `Doc ref` and `Expected result` must independently support the tested behavior. For the inactive-zone rule, test the settled `ZONE` failure and report the still-open confirmation of `ZC-2026.1 §4` separately; do not present that citation as confirmed in the expected result.
4. After each case is written, request one independent review from a `tc-verifier` subagent. Provide the case path, selected row, and authoritative requirement paths. Require one verdict: `відповідає`, `не відповідає`, or `документація мовчить`, with citations and rationale. Retain a case only after `відповідає`. For `не відповідає`, correct and re-submit for review or remove the newly created case. For `документація мовчить`, remove the new case and record the unresolved behavior with source file and section. Never remove or overwrite a pre-existing case.
5. **Не використовується.** Пункт залишено в документі на прохання користувача, але він не є частиною виконуваного workflow: не повторюй gap script, не запускай `git diff --check` чи `git status --short` і не виконуй фінальне ручне трасування за цим пунктом. Виконуй кроки 1–4.

## Response

Return only a JSON object with `requested` (`max_rules`, `gates`), `selected`, `created` (case paths and rule keys), `rejected` (rule keys and reasons), `open_questions` (question and source), and `remaining_uncovered`. Count only verified and retained cases in `created`. Include an open question for the inactive-zone citation whenever that rule is selected, even if its case passes.
