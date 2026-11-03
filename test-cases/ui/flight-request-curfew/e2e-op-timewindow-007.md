# E2E-OP-TIMEWINDOW-007 — Allow a window outside the amended KBP curfew

## ID
E2E-OP-TIMEWINDOW-007

## Doc ref
- [SKY-1](https://mishunya4.atlassian.net/browse/SKY-1) — Acceptance criterion 5
- [06 — Business Rules](https://mishunya4.atlassian.net/wiki/spaces/SD/pages/360471/06+Business+Rules) — §§1.1–1.4 (gate preconditions, curfew and KBP-CTR-3 value), §6 (`TIME_WINDOW` rule reference)
- [04 — Frontend Spec](https://mishunya4.atlassian.net/wiki/spaces/SD/pages/98332/04+Frontend+Spec) — Operator request creation form; “Check before submitting”
- [02 — State Machine](https://mishunya4.atlassian.net/wiki/spaces/SD/pages/65977/02+State+Machine) — `DRAFT`
- [01 — Data Model](https://mishunya4.atlassian.net/wiki/spaces/SD/pages/196833/01+Data+Model) — Zone and time handling

## Priority
High

## Precondition
- An authenticated Operator owns a current pilot and active aircraft that pass `PILOT`, `AIRCRAFT`, and `ZONE` for `KBP-CTR-3`.
- The Operator's authorisation level is `L3`; the pilot rating is `R_BVLOS` and is current for the request window; aircraft MTOM is `500 g` (`C0`); requested altitude is `50 m`.
- `KBP-CTR-3` is active, permits `C0`, requires no more than `L2`, and has a 120 m ceiling. No `APPROVED` or `UNDER_REVIEW` request for the same aircraft overlaps the test window.
- The browser's `datetime-local` values represent the local-time basis used for `KBP-CTR-3`. Confluence does not specify the zone's IANA timezone; confirm the test environment mapping before execution.

## Test data
- `zone_code`: `KBP-CTR-3`
- `window_start` (KBP local time): `2026-11-05T22:00`
- `window_end` (KBP local time): `2026-11-05T22:45`
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
5. On the request detail panel, click `flight-request-validate-button` (“Check before submitting”).
6. Inspect `flight-request-gate-result-PILOT`, `flight-request-gate-result-AIRCRAFT`, `flight-request-gate-result-ZONE`, `flight-request-gate-result-TIME_WINDOW`, and `flight-request-detail-state`.

## Expected result
- The four gates display `PASS`.
- The request remains in `DRAFT` after validation.
