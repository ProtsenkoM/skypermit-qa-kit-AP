# E2E-OP-TIMEWINDOW-005 — Reject a flight window shorter than 15 minutes

## ID
E2E-OP-TIMEWINDOW-005

## Doc ref
- `../skypermit/docs/06-business-rules.md` — §1.4 (duration), §6 (`TIME_WINDOW` rule reference)
- `../skypermit/docs/03-api-contract.md` — Flight requests, Endpoint 13 (`validate`), The `422` body

## Priority
High

## Precondition
- An authenticated Operator owns a `DRAFT` flight request whose pilot, aircraft, zone, and other time-window values pass all earlier checks.
- The request window is 14 minutes long and starts within the permitted booking horizon.

## Test data
- `window_start`: `2026-10-30T18:00:00Z`
- `window_end`: `2026-10-30T18:14:00Z`

## Steps
1. Send `POST /api/v1/flight-requests/{id}/validate` for the request.

## Expected result
Validation reports the `TIME_WINDOW` gate as failed with `rule_reference` `TSD-4 §3`; the request remains in `DRAFT` because `validate` does not change state.

## Business rule
- Gate: `TIME_WINDOW`
- Condition: Duration out of range
- rule_reference: `TSD-4 §3`
