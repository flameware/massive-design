# Domain docs

Single-context repo. Before working in an area, read:

- **`CONTEXT.md`** at the repo root — the glossary. Use its terms verbatim in issue titles, contract fields and commit messages; do not drift to synonyms it avoids.
- **`docs/adr/`** — the decisions that touch the area. Start from the index [`docs/adr/README.md`](../adr/README.md): it separates the ADRs that bind now from those superseded by ADR-0023. If your change contradicts an ADR, say so explicitly and reopen the decision instead of silently overriding it.

If a concept you need is not in the glossary, that is a signal: either the project does not use that language (reconsider), or there is a real gap — add the term to `CONTEXT.md` in the same change that introduces it.

## Writing ADRs

ADRs are an immutable log. Never delete or merge one; a superseded ADR gets a banner under its title naming what replaced it.

- **Open a new ADR only when all three hold** — hard to reverse, surprising without context, the result of a real trade-off. If any is missing, add a one-line rule with the issue link to [`rules.md`](rules.md) instead.
- **Adjusting an existing decision is an amendment, not a new ADR** — add an amendment section to the original ADR (as ADR-0002 and ADR-0019 did). A new ADR is for a decision that replaces or is independent of the old one.
- **Update [`docs/adr/README.md`](../adr/README.md) in the same commit** whenever an ADR is written, superseded or amended.
