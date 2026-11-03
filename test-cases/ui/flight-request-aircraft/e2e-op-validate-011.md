# E2E-OP-VALIDATE-011 — Show the AIRCRAFT failure for a C3 aircraft in KBP-CTR-3

## ID
E2E-OP-VALIDATE-011

## Doc ref
- [SKY-3](https://mishunya4.atlassian.net/browse/SKY-3) — Acceptance criteria 1–3 and 5
- [04 — Frontend Spec](https://mishunya4.atlassian.net/wiki/spaces/SD/pages/98332/04+Frontend+Spec) — Operator request creation form; “The form does not pre-filter”; “Check before submitting”
- [06 — Business Rules](https://mishunya4.atlassian.net/wiki/spaces/SD/pages/360471/06+Business+Rules) — Evaluation order; §§1.1–1.2, 3–4, and 6
- [07 — Clarifications](https://mishunya4.atlassian.net/wiki/spaces/SD/pages/196854/07+Clarifications) — §1, AIRCRAFT gate assignment
- [03 — API Contract](https://mishunya4.atlassian.net/wiki/spaces/SD/pages/360450/03+API+Contract) — Endpoint 13; error semantics; gate evaluation order
- [02 — State Machine](https://mishunya4.atlassian.net/wiki/spaces/SD/pages/65977/02+State+Machine) — `DRAFT`; validation does not submit the request

## Priority
High

## Precondition
- An authenticated Operator with authorisation level `L2` owns the listed pilot and aircraft.
- The Operator has a pilot with rating `R_ADVANCED` and certification current for the test flight window.
- The test aircraft is registered at `12,001 g` and appears in the Operator's aircraft picker.
- `KBP-CTR-3` is available, active, has a 120 m ceiling, and permits bands `C0`–`C2`.
- No `APPROVED` or `UNDER_REVIEW` request for this aircraft overlaps the test window.

## Test data
- `zone_code`: `KBP-CTR-3`
- `pilot rating`: `R_ADVANCED`
- `pilot certified_on`: `2026-01-01`
- `aircraft serial_number`: `SKY3-C3-0001`
- `aircraft mtom_grams`: `12,001` (`C3`)
- `window_start` (KBP local time): `2026-11-05T12:00`
- `window_end` (KBP local time): `2026-11-05T12:30`
- `requested_altitude_metres`: `50`
- `flight_purpose`: `SKY-3 C3 aircraft gate check`

## Steps
1. Open the Operator's new flight request form.
2. Select `KBP-CTR-3` using `flight-request-zone-select`, the `R_ADVANCED` pilot using `flight-request-pilot-select`, and aircraft `SKY3-C3-0001` using `flight-request-aircraft-select`. Confirm the form allows the C3 aircraft and zone to be selected together.
3. Enter the window start and end using `flight-request-window-start-input` and `flight-request-window-end-input`; enter `50` using `flight-request-altitude-input` and the purpose using `flight-request-purpose-textarea`.
4. Click `flight-request-create-submit-button` to create the request.
5. Click `flight-request-validate-button` (“Check before submitting”).
6. Inspect `flight-request-gate-result-PILOT`, `flight-request-gate-result-AIRCRAFT`, `flight-request-gate-result-ZONE`, `flight-request-gate-result-TIME_WINDOW`, and `flight-request-detail-state`.

## Expected result
- The form accepts the selected C3 aircraft and `KBP-CTR-3` without filtering or blocking the combination, and the request is created in `DRAFT`.
- Validation shows `PILOT` as passed and `AIRCRAFT` as failed with rule reference `ZC-2026.1 §2`.
- `ZONE` and `TIME_WINDOW` are shown as not evaluated because evaluation stops at the first failure.
- The request remains in `DRAFT` after validation.
