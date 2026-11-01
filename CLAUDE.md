# SkyPermit QA Kit

Follow `AGENTS.md` for repository structure, read-only boundaries, and QA conventions.

## Requirements source

Use the `SkyPermit Docs` Confluence space (key `SD`) as the authoritative source for the data model, state machine, API contract, frontend specification, open questions, business rules, clarifications, and UML diagrams. Find pages with `mcp__atlassian__search` and read them with `mcp__atlassian__getConfluencePage`. Cite the Confluence page title, section, and link in `Doc ref`.

Exception: `scripts/uncovered-rules.mjs` cannot read MCP. It continues to read the local `../skypermit/docs/` files for rule selection only. Do not treat those files as the authoritative source when creating or verifying cases; confirm requirements in Confluence.

Search `data-testid` selectors in the read-only app repository under `app/` and `components/`. Keep QA artifacts in this repository.
