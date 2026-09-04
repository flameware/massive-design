# Domain docs

Single-context repo. Before working in an area, read:

- **`CONTEXT.md`** at the repo root — the glossary. Use its terms verbatim in issue titles, contract fields and commit messages; do not drift to synonyms it avoids.
- **`docs/adr/`** — the decisions that touch the area. If your change contradicts an ADR, say so explicitly and reopen the decision instead of silently overriding it.

If a concept you need is not in the glossary, that is a signal: either the project does not use that language (reconsider), or there is a real gap — add the term to `CONTEXT.md` in the same change that introduces it.
