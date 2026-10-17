# SkyPermit Application Test Plan

## Scope

### In Scope

- End-to-end operator registration, login, logout, session restoration, and least-privilege `L1` profile creation; authenticated ownership of pilots, aircraft, and flight requests. (Source: `docs/03-api-contract.md` — Authentication & authorisation; `docs/04-frontend-spec.md` — Operator portal)
- Registry creation, listing, and detail retrieval for operators, pilots, and aircraft; field constraints, uniqueness, relationships, enumerations, and derived pilot currency/aircraft weight band. (Source: `docs/01-data-model.md` — Entities; Derived, never stored)
- Read-only six-zone catalogue, seeded values, local curfews, permitted bands, ceilings, authorisation levels, and active status. (Source: `docs/01-data-model.md` — Zone; `docs/06-business-rules.md` §4)
- Flight-request creation, validation, submission, listing/filtering, detail, cancellation, reviewer approval/rejection, and maintenance completion across all seven states. (Source: `docs/02-state-machine.md`; `docs/03-api-contract.md` — Flight requests; Reviewer)
- Fixed gate pipeline `PILOT → AIRCRAFT → ZONE → TIME_WINDOW`, including first-failure response, rule references, boundaries, and identical side-effect-free validation logic. (Source: `docs/03-api-contract.md` — Gate pipeline; `docs/06-business-rules.md` §§1–6; `docs/07-clarifications.md`)
- Operator portal and reviewer queue behavior, stable `data-testid` selectors, role switching, unfiltered request pickers, and displayed gate/rejection details. (Source: `docs/04-frontend-spec.md`)
- Persistence integrity, reviewer actions, state-transition audit history, UTC storage, and append-only AuditLog behavior. (Source: `docs/01-data-model.md`; `docs/08-uml-diagrams.md`)

### Out of Scope

- Administration of operator authorisation/status, zone maintenance, visual polish, load/security penetration testing, and unadopted `CR-1` or superseded `OH-1` v1.4 rules. (Source: `docs/03-api-contract.md`; `docs/06-business-rules.md` — Sources used)

## Key Risks

- Broken tenant isolation could expose or mutate another operator's resources.
- Incorrect gate order, classification, or citation could reject valid flights or provide misleading regulatory evidence.
- Date, weight, duration, curfew, overlap, and cancellation boundary errors could authorise unsafe flights.
- Non-atomic auth/profile, request/state/audit, or reviewer decision writes could corrupt history.
- UI/API drift could hide gate outcomes, mutate during validation, or break stable automation selectors.

## Manual Test Strategy

Run role-based end-to-end journeys for anonymous users, two operators, and multiple reviewer identities. Verify `401` without identity, `403` for cross-operator access, reviewer-or-owner reads, reviewer-wide queues, session-derived ownership, and required `X-Reviewer-Id`. Confirm malformed, missing, duplicate, unknown, and unsupported values produce documented `400/404` behavior without partial writes. (Source: `docs/03-api-contract.md` — Error semantics)

Cover every legal transition and representative illegal `(state, action)` pairs, expecting `409`; confirm `SUBMITTED` is never observable at rest, terminal states remain terminal, cancellation succeeds exactly two hours before start and fails closer, and completion occurs only through maintenance. Verify ReviewAction and AuditLog actor/timestamp/state data after each decision. (Source: `docs/02-state-machine.md`)

Use pairwise valid combinations and focused negative/boundary data: rating by zone class; certification at and one day beyond 18 months; weights at 0/900/901/3,500/3,501/12,000/12,001/30,000/30,001 g; altitude at/above ceiling; auth levels L1–L3; active/inactive zones; lead time at six hours; booking at 60 days; duration at 15/240 minutes and outside; UTC-to-local curfews crossing midnight; touching versus overlapping windows; purpose at 2,000/2,001 characters. For multi-failure requests, assert only the first gate fails and exact `rule_reference` persists on submit. `validate` must return all gate results repeatedly without state, audit, or decision writes. (Source: `docs/06-business-rules.md`; `docs/04-frontend-spec.md`)

Exercise both UI and direct API paths; compare list/detail representations and inspect persisted records read-only. Confirm zones expose no write flow, AuditLog exposes no mutation, and request pickers do not pre-filter ineligible combinations.

## Readiness Criteria

### Entry Criteria

- Test build uses migrations `0001`–`0004`, seeded zones, controllable test accounts/roles, isolated database, reviewer identities, boundary fixtures, and known clock/timezone behavior.
- All eight requirements documents are version-aligned and release changes are identified.

### Exit Criteria

- All scoped roles, endpoints, screens, states, gates, boundaries, permissions, and integrity checks pass with traceable evidence.
- No open Critical/High defect; affected regression passes; unresolved requirement questions are answered or explicitly accepted as release risks.

## Open Questions

1. What exact status/body applies when a `SUSPENDED` operator attempts create, submit, or approve? (Source: `docs/05-open-questions.md` §1)
2. Is `ZC-2026.1 §4` confirmed for inactive-zone `rule_reference`? (Source: `docs/05-open-questions.md` §2)
3. Where are zone IANA timezones and DST handling defined? (Source: `docs/01-data-model.md` — Time handling)
4. Does aircraft overlap return `422` as a gate failure or `409` as a scheduling conflict? (Source: `docs/03-api-contract.md` — Error semantics; `docs/06-business-rules.md` §1.4)
