# E2E-OP-VALIDATE-012 — Allow the 12,000 g C2 aircraft through AIRCRAFT in KBP-CTR-3

## ID
E2E-OP-VALIDATE-012

## Doc ref
- [SKY-3](https://mishunya4.atlassian.net/browse/SKY-3) — Acceptance criterion 4
- [06 — Business Rules](https://mishunya4.atlassian.net/wiki/spaces/SD/pages/360471/06+Business+Rules) — §§1.1–1.2, 3–4, and 6
- [07 — Clarifications](https://mishunya4.atlassian.net/wiki/spaces/SD/pages/196854/07+Clarifications) — §1, AIRCRAFT gate assignment
- [04 — Frontend Spec](https://mishunya4.atlassian.net/wiki/spaces/SD/pages/98332/04+Frontend+Spec) — Operator request creation form; “Check before submitting”
- [03 — API Contract](https://mishunya4.atlassian.net/wiki/spaces/SD/pages/360450/03+API+Contract) — Endpoint 13; gate evaluation order

## Priority
High

## Precondition
- An authenticated Operator with authorisation level `L2` owns the listed pilot and aircraft.
- The Operator has a pilot with rating `R_ADVANCED` and certification current for the test flight window.
- The test aircraft is registered at exactly `12,000 g` and appears in the Operator's aircraft picker.
- `KBP-CTR-3` is available, active, has a 120 m ceiling, and permits bands `C0`–`C2`.
- No `APPROVED` or `UNDER_REVIEW` request for this aircraft overlaps the test window.
- The test window is outside the KBP curfew and meets the documented lead-time, booking-horizon, and duration limits. Confirm the test environment's `datetime-local` to KBP-local-time mapping before execution; the Confluence docs do not name an IANA timezone.

## Test data
- `zone_code`: `KBP-CTR-3`
- `pilot rating`: `R_ADVANCED`
- `pilot certified_on`: `2026-01-01`
- `aircraft serial_number`: `SKY3-C2-0001`
- `aircraft mtom_grams`: `12,000` (`C2`)
- `window_start` (KBP local time): `2026-11-06T12:00`
- `window_end` (KBP local time): `2026-11-06T12:30`
- `requested_altitude_metres`: `50`
- `flight_purpose`: `SKY-3 C2 upper-bound aircraft gate check`

## Steps
1. Open the Operator's new flight request form.
2. Select `KBP-CTR-3` using `flight-request-zone-select`, the `R_ADVANCED` pilot using `flight-request-pilot-select`, and aircraft `SKY3-C2-0001` using `flight-request-aircraft-select`.
3. Enter the window start and end using `flight-request-window-start-input` and `flight-request-window-end-input`; enter `50` using `flight-request-altitude-input` and the purpose using `flight-request-purpose-textarea`.
4. Click `flight-request-create-submit-button` to create the request.
5. Click `flight-request-validate-button` (“Check before submitting”).
6. Inspect `flight-request-gate-result-AIRCRAFT` in the gate results panel.

## Expected result
- The `AIRCRAFT` gate is shown as passed for the aircraft weighing exactly `12,000 g` (`C2`) in `KBP-CTR-3`.
- This case asserts the `AIRCRAFT` result only; it does not assert outcomes for later gates.
