# E2E-OP-VALIDATE-014 — Pass a KBP window outside the amended curfew

## ID
E2E-OP-VALIDATE-014

## Doc ref
- [SKY-1](https://mishunya4.atlassian.net/browse/SKY-1) — Acceptance criterion 5
- [01 — Data Model](https://mishunya4.atlassian.net/wiki/spaces/SD/pages/196833/01+Data+Model) — FlightRequest; Time handling
- [03 — API Contract](https://mishunya4.atlassian.net/wiki/spaces/SD/pages/360450/03+API+Contract) — Flight requests, endpoint 13; gate pipeline
- [04 — Frontend Spec](https://mishunya4.atlassian.net/wiki/spaces/SD/pages/98332/04+Frontend+Spec) — Operator portal; “Check before submitting”
- [06 — Business Rules](https://mishunya4.atlassian.net/wiki/spaces/SD/pages/360471/06+Business+Rules) — Evaluation order; §1.4; §§3–4

## Priority
High

## Precondition
- An authenticated Operator with authorisation level `L2` owns an active `R_ADVANCED` pilot, certified on `2026-01-01`, and an active aircraft with `mtom_grams` of `12,000 g` (`C2`).
- `KBP-CTR-3` is active, permits `C0`–`C2`, has a ceiling of `120 m`, and has the amended curfew `23:00–05:00` local time.
- No `APPROVED` or `UNDER_REVIEW` request for the selected aircraft overlaps the test window.
- The browser's `datetime-local` input is configured to represent the zone's local time for this test.

## Test data
- `zone_code`: `KBP-CTR-3`
- `pilot rating`: `R_ADVANCED`
- `pilot certified_on`: `2026-01-01`
- `aircraft serial_number`: `SKY1-CURFEW-C2-014`
- `aircraft mtom_grams`: `12,000` (`C2`)
- `window_start` (KBP local time): `2026-11-15T22:00`
- `window_end` (KBP local time): `2026-11-15T22:45`
- `requested_altitude_metres`: `50`
- `flight_purpose`: `SKY-1 outside-curfew validation`

## Steps
1. Open the Operator's new flight request form.
2. Select `KBP-CTR-3` using `flight-request-zone-select`, the `R_ADVANCED` pilot using `flight-request-pilot-select`, and aircraft `SKY1-CURFEW-C2-014` using `flight-request-aircraft-select`.
3. Enter the test window using `flight-request-window-start-input` and `flight-request-window-end-input`; enter `50` using `flight-request-altitude-input` and the purpose using `flight-request-purpose-textarea`.
4. Click `flight-request-create-submit-button` to create the request.
5. Click `flight-request-validate-button` (“Check before submitting”).
6. Inspect `flight-request-gate-result-TIME_WINDOW`.

## Expected result
- `TIME_WINDOW` is shown as passed for the `2026-11-15T22:00`–`2026-11-15T22:45` KBP-local window, which is outside the amended `23:00–05:00` curfew.
