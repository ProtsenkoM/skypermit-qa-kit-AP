# E2E-OP-TIMEWINDOW-006 — Reject a window that enters the amended KBP curfew

## ID
E2E-OP-TIMEWINDOW-006

## Doc ref
- `../skypermit/docs/06-business-rules.md` — §1.4 (curfew and zone values), §6 (`TIME_WINDOW` rule reference)
- `../skypermit/docs/03-api-contract.md` — Flight requests, Endpoint 13 (`validate`), The `422` body

## Priority
High

## Precondition
- An authenticated Operator owns a `DRAFT` flight request whose pilot, aircraft, zone, and other time-window values pass all earlier checks.
- The selected zone is `KBP-CTR-3`.

## Test data
- `zone_code`: `KBP-CTR-3`
- `window_start` (UTC): `2026-10-30T20:55:00Z`
- `window_end` (UTC): `2026-10-30T21:10:00Z`

## Steps
1. Send `POST /api/v1/flight-requests/{id}/validate` for the request.

## Expected result
Validation reports the `TIME_WINDOW` gate as failed with `rule_reference` `A-7 §1`; the request remains in `DRAFT` because `validate` does not change state.

## Business rule
- Gate: `TIME_WINDOW`
- Condition: Falls within curfew — KBP-CTR-3/ODS-CTR-5
- rule_reference: `A-7 §1`
