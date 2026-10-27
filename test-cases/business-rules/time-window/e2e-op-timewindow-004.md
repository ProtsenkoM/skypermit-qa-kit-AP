# E2E-OP-TIMEWINDOW-004 — Reject a request booked more than 60 days ahead

## ID
E2E-OP-TIMEWINDOW-004

## Doc ref
- `../skypermit/docs/06-business-rules.md` — §1.4 (maximum advance booking), §6 (`TIME_WINDOW` rule reference)
- `../skypermit/docs/03-api-contract.md` — Flight requests, Endpoint 13 (`validate`), The `422` body

## Priority
High

## Precondition
- An authenticated Operator owns a `DRAFT` flight request whose pilot, aircraft, zone, and other time-window values pass all earlier checks.
- The request's `window_start` is 60 days and 1 minute after the current submission/evaluation time.

## Test data
- `window_start`: evaluation time + 60 days 1 minute
- `window_end`: `window_start` + 15 minutes

## Steps
1. Send `POST /api/v1/flight-requests/{id}/validate` for the request.

## Expected result
Validation reports the `TIME_WINDOW` gate as failed with `rule_reference` `TSD-4 §2.2`; the request remains in `DRAFT` because `validate` does not change state.

## Business rule
- Gate: `TIME_WINDOW`
- Condition: Booked too far in advance
- rule_reference: `TSD-4 §2.2`
