# E2E-OP-TIMEWINDOW-010 — Fail validation when a window overlaps the end of the KBP curfew

## ID
E2E-OP-TIMEWINDOW-010

## Doc ref
- [SKY-1](https://mishunya4.atlassian.net/browse/SKY-1) — Acceptance criteria 1–4
- [06 — Business Rules](https://mishunya4.atlassian.net/wiki/spaces/SD/pages/360471/06+Business+Rules) — §§1.1–1.4 (gate preconditions, minute-by-minute curfew evaluation and KBP-CTR-3 value), §6 (`A-7 §1`)
- [03 — API Contract](https://mishunya4.atlassian.net/wiki/spaces/SD/pages/360450/03+API+Contract) — Endpoint 13, Error semantics, `422` body, Gate pipeline
- [04 — Frontend Spec](https://mishunya4.atlassian.net/wiki/spaces/SD/pages/98332/04+Frontend+Spec) — Operator request creation form; “Check before submitting”
- [02 — State Machine](https://mishunya4.atlassian.net/wiki/spaces/SD/pages/65977/02+State+Machine) — `DRAFT`

## Priority
High

## Precondition
- An authenticated Operator owns a current pilot and active aircraft that pass `PILOT`, `AIRCRAFT`, and `ZONE` for `KBP-CTR-3`.
- The Operator's authorisation level is `L3`; the pilot rating is `R_BVLOS` and is current for the request window; aircraft MTOM is `500 g` (`C0`); requested altitude is `50 m`.
- `KBP-CTR-3` is active, permits `C0`, requires no more than `L2`, and has a 120 m ceiling. No `APPROVED` or `UNDER_REVIEW` request for the same aircraft overlaps the test window.
- The browser's `datetime-local` values represent the local-time basis used for `KBP-CTR-3`.

## Test data
- `zone_code`: `KBP-CTR-3`
- `window_start` (KBP local time): `2026-11-06T04:59`
- `window_end` (KBP local time): `2026-11-06T05:14`
- `requested_altitude_metres`: `50`
- `operator authorisation_level`: `L3`
- `pilot rating`: `R_BVLOS`
- `pilot certified_on`: `2026-01-01`
- `aircraft MTOM`: `500 g` (`C0`)

## Steps
1. Open the Operator's new flight request form.
2. Select `KBP-CTR-3` using `flight-request-zone-select`; select the eligible pilot using `flight-request-pilot-select` and aircraft using `flight-request-aircraft-select`.
3. Enter the start and end values using `flight-request-window-start-input` and `flight-request-window-end-input`; enter `50` using `flight-request-altitude-input`.
4. Click `flight-request-create-submit-button` to create the request.
5. Open the browser's Network panel and clear the captured requests.
6. On the request detail panel, click `flight-request-validate-button` (“Check before submitting”).
7. Inspect the response to `POST /api/v1/flight-requests/{id}/validate`, the four gate result elements, and `flight-request-detail-state`.

## Expected result
- The UI-triggered `POST /api/v1/flight-requests/{id}/validate` returns HTTP `422`. Its JSON body contains `failing_gate: "TIME_WINDOW"` and `rule_reference: "A-7 §1"`.
- The UI shows `PILOT`, `AIRCRAFT`, and `ZONE` as `PASS`, and `TIME_WINDOW` as `FAIL` with rule reference `A-7 §1`.
- The request remains in `DRAFT` after validation.
