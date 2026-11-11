# API-OP-001 — Validate a flight window with 6 hours 30 minutes lead time

## ID
API-OP-001

## Doc ref
- [06 — Business Rules](https://mishunya4.atlassian.net/wiki/spaces/SD/pages/360471/06+Business+Rules) — §1.4 `TIME_WINDOW`, minimum lead time.
- [03 — API Contract](https://mishunya4.atlassian.net/wiki/spaces/SD/pages/360450/03+API+Contract) — Authentication & authorisation; Flight requests; Gate pipeline.
- [08 — UML Diagrams](https://mishunya4.atlassian.net/wiki/spaces/SD/pages/65998/08+UML+Diagrams) — Gate Pipeline: validate response and no state change.

## Priority
High

## Precondition
- An active operator has a valid session and owns an existing flight request in `DRAFT`, identified by `{id}`.
- At validation, the request has the UTC window specified below; its pilot, aircraft, zone, altitude, operator authorisation, duration, curfew and schedule satisfy all other gate conditions.
- The test environment's current time at evaluation is `2030-01-15T12:00:00Z`.

## Test data
- `window_start`: `2030-01-15T18:30:00Z` (6 hours 30 minutes after evaluation time).
- `window_end`: `2030-01-15T19:00:00Z` (30-minute duration).

## Steps
1. Send `POST /api/v1/flight-requests/{id}/validate` for the existing request, using the owning operator's session; request body: none.

## Expected result
- The response status is `200` and its per-gate results show that `TIME_WINDOW` passes.
- Validation does not change the request's `DRAFT` state.
