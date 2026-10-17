# E2E-OP-LOGIN-002 — Log in an operator with valid credentials

## ID
E2E-OP-LOGIN-002

## Doc ref
- `../skypermit/docs/03-api-contract.md` — Authentication & authorisation
- `../skypermit/docs/04-frontend-spec.md` — Operator portal

## Priority
High

## Precondition
- An Operator account exists for `olena.koval.qa@example.com` with password `SkyPermit-QA-2026!`.
- No operator session is active.

## Test data
- `email`: `olena.koval.qa@example.com`
- `password`: `SkyPermit-QA-2026!`

## Steps
1. Send `POST /api/v1/auth/login` with the test email and password.

## Expected result
Login succeeds and the response sets a session cookie for the Operator.
