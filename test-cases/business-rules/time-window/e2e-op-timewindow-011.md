# E2E-OP-TIMEWINDOW-011 — Reject a window overlapping another request for the same aircraft

## ID
E2E-OP-TIMEWINDOW-011

## Doc ref
- `../skypermit/docs/06-business-rules.md` — §1.4 (no overlap), §6 (`TIME_WINDOW` rule reference)
- `../skypermit/docs/02-state-machine.md` — Rules that affect the state machine but live elsewhere (states counted by the overlap check)
- `../skypermit/docs/03-api-contract.md` — Flight requests, Endpoint 13 (`validate`), The `422` body

## Priority
High

## Precondition
- An authenticated Operator owns a `DRAFT` request and an `APPROVED` request for the same aircraft.
- All checks before `TIME_WINDOW` pass for the draft request.
- The evaluation clock is fixed at `2026-10-27T12:00:00Z`.

## Test data
- Existing approved request: `2026-11-15T14:00:00Z`–`2026-11-15T14:30:00Z`
- Draft request: `2026-11-15T14:29:00Z`–`2026-11-15T14:44:00Z`
- Both requests use the same `aircraft_id`.

## Steps
1. Send `POST /api/v1/flight-requests/{draft-id}/validate` for the draft request.

## Expected result
Validation reports the `TIME_WINDOW` gate as failed with `rule_reference` `TSD-4 §5`; the draft request remains in `DRAFT` because `validate` does not change state.

## Business rule
- Gate: `TIME_WINDOW`
- Condition: Overlaps another request
- rule_reference: `TSD-4 §5`
