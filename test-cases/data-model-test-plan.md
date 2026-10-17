# Data Model Test Plan

## Scope

### In Scope

- Manual verification of the seven entities, fields, primary/foreign keys, uniqueness, nullability, enumerations, and relationships across the API and database (`Operator`, `Pilot`, `Aircraft`, `Zone`, `FlightRequest`, `ReviewAction`, `AuditLog`). (Source: `docs/01-data-model.md` — Entities; Enumerations)
- Operator identity integrity: `Operator.id` equals the Supabase Auth user ID, registration creates both records, and deleting the auth user cascades to the profile. Operator-scoped resources must derive ownership from the session; owner/reviewer reads and cross-operator denial are covered. (Source: `docs/01-data-model.md` — Operator; `docs/03-api-contract.md` — Authentication & authorisation)
- Derived pilot currency and aircraft weight band on single and list reads, including immediate recalculation after source-data correction and no retroactive change to issued authorisations. (Source: `docs/01-data-model.md` — Derived, never stored; `docs/06-business-rules.md` §§2–3)
- Flight-request temporal and text constraints: UTC persistence, `window_end > window_start`, zone-local curfew evaluation, and `flight_purpose` lengths 0, 1, 1,999, 2,000, and 2,001 characters at API and database layers. (Source: `docs/01-data-model.md` — Time handling)
- State-dependent data integrity: synchronous submit outcome; rejection metadata; reviewer decision metadata and `ReviewAction`; append-only `AuditLog` for every transition. (Source: `docs/01-data-model.md` — FlightRequest, ReviewAction, AuditLog; `docs/02-state-machine.md` — Request Lifecycle)
- Read-only zone catalogue and absence of AuditLog update/delete paths in API and UI. (Source: `docs/01-data-model.md` — Zone; AuditLog)

### Out of Scope

- Visual styling, selector conformance, performance, and automation implementation. Detailed gate permutations are covered only where needed to verify stored/derived data and first-failure metadata. (Source: `docs/04-frontend-spec.md`; `docs/06-business-rules.md` — Evaluation order)

## Key Risks

- Referential or tenant-integrity defects could associate a pilot/aircraft/request with the wrong operator or expose another operator's data.
- Persisting derived values could return stale currency or weight bands, especially at the 18-month and 900/3,500/12,000/30,000 g boundaries.
- UTC/local-time conversion or missing timezone metadata could produce incorrect curfew decisions.
- Partial registration or decision writes could leave Auth/profile, request/action, or state/audit records inconsistent.
- Rejection fields could be populated for reviewer rejection as though it were a gate failure, or fail to persist the first failing gate and rule citation.

## Manual Test Strategy

Exercise creation and retrieval of valid records for every entity through documented endpoints, then verify persisted rows and relationships with read-only database queries. Submit invalid UUIDs, missing required relationships, duplicate national IDs/emails/serial numbers, unsupported enum values, cross-operator IDs, and deleted parents; confirm atomic failure and documented `400/401/403/404/409/422` semantics. (Source: `docs/03-api-contract.md` — Error semantics)

Use boundary datasets for certification dates, weight bands, timestamps, request duration, altitude, and text length. Correct `certified_on` and `mtom_grams`, then re-read both list and detail endpoints to prove derivation rather than storage. Run multi-failure requests to confirm `PILOT → AIRCRAFT → ZONE → TIME_WINDOW`, and compare `validate` with `submit`; only submit may write state, rejection metadata, or audit rows. (Source: `docs/03-api-contract.md` — Gate pipeline)

For every legal and representative illegal transition, verify state, timestamps, actor fields, one reviewer action where applicable, and append-only audit history. Attempt zone writes and AuditLog mutation through exposed interfaces and confirm no path exists.

## Readiness Criteria

### Entry Criteria

- Deployed build with migrations `0001`–`0004`, known test database access, seeded zones, operator sessions, reviewer header identity, and isolated operators with boundary pilot/aircraft/request data.
- Test clock/timezone behavior is controllable or submission times are recorded precisely.

### Exit Criteria

- All entities, constraints, boundaries, ownership roles, legal/illegal transitions, gate order, derived fields, and append-only behavior are exercised with requirement-linked evidence.
- No unresolved Critical/High data-integrity or authorization defect; regression passes after fixes; release-blocking open questions are resolved or explicitly accepted.

## Open Questions

1. What status code and response body apply when a `SUSPENDED` operator attempts create, submit, or approve? It is a write precondition, not a gate failure. (Source: `docs/05-open-questions.md` §1)
2. Is `ZC-2026.1 §4` the authoritative `rule_reference` for an inactive zone failure? (Source: `docs/05-open-questions.md` §2)
3. Where is each zone's IANA timezone defined, and how should DST ambiguity/nonexistent local times be evaluated? `Zone` has no timezone field although curfews require zone-local conversion. (Source: `docs/01-data-model.md` — Zone; Time handling)
4. Should same-aircraft overlap return structured `422` as a `TIME_WINDOW` gate failure or `409` as a scheduling conflict? Both are specified. (Source: `docs/03-api-contract.md` — Error semantics; `docs/06-business-rules.md` §1.4)
