# E2E-OP-REGISTRATION-001 — Register an operator successfully

## ID
E2E-OP-REGISTRATION-001

## Doc ref
- `../skypermit/docs/03-api-contract.md` — Authentication & authorisation
- `../skypermit/docs/01-data-model.md` — Entities / Operator
- `../skypermit/docs/04-frontend-spec.md` — Operator portal

## Priority
High

## Precondition
- No operator session is active.
- No Auth user or Operator profile exists with email `olena.koval.qa@example.com` or national ID `UA-TEST-OP-0001`.

## Test data
- `email`: `olena.koval.qa@example.com`
- `password`: `SkyPermit-QA-2026!`
- `legal_name`: `Olena Koval Aviation`
- `national_id`: `UA-TEST-OP-0001`
- `phone`: `+380501234567`
- `address_line`: `1 Testna Street`
- `city`: `Kyiv`
- `postal_code`: `01001`

## Steps
1. Open `/register`, complete the combined registration form with the test data, and submit it without supplying `authorisation_level`.

## Expected result
Registration succeeds as one operation: a Supabase Auth user and matching Operator profile are created with the same UUID, the Operator has `authorisation_level` `L1`, and the caller receives an authenticated session.
