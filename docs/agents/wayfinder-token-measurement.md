# Wayfinder token measurement

Use this procedure for every session that invokes Wayfinder, including sessions started with fresh context. The ledger is [`docs/research/wayfinder-token-sessions.tsv`](../research/wayfinder-token-sessions.tsv). The rationale and baseline plan are in [`docs/research/wayfinder-token-efficiency.md`](../research/wayfinder-token-efficiency.md).

## Start

1. Count data rows in the ledger, excluding its header.
2. At 10 rows, leave the ledger unchanged and tell the user that the sample is ready for analysis.
3. Below 10 rows, note the active map, ticket and work type. Continue the Wayfinder session normally.

This measurement does not replace the Wayfinder map or resolution comment. It records one row per agent session, even when the session ends blocked or handed off. A session spanning context compaction is one session; a deliberately fresh conversation is a new session.

## Finish

After the session outcome is known, append one tab-separated row with these rules:

- Use ISO 8601 with timezone for `ended_at`.
- Use the map and ticket URLs; use `n/a` when no ticket was selected.
- Choose one `work_type`: `grilling`, `prototype`, `research`, `task`, or `figma-sync`.
- Choose one `outcome`: `resolved`, `handed-off`, or `blocked`.
- Copy token counts only when the runtime exposes exact usage. Record `n/a` when unavailable; never estimate tokens from bytes.
- Record `tool_output_bytes`, `skill_bytes`, and `repo_context_bytes` only when directly measured. Otherwise use `n/a`.
- Count completed human question rounds, tool retries after failure, and subagents used. Use `0` when none and `n/a` only when unknowable.
- Keep `notes` to one short phrase without tabs or newlines.

The session is measured when exactly one valid row has been appended and the ledger has no more than 10 data rows. In the final response, state the new sample count and which exact token fields were unavailable.

## After row 10

Treat the ledger as frozen evidence. Tell the user to run the analysis described in `docs/research/wayfinder-token-efficiency.md` §6–7. Changing Wayfinder rules or deleting rows requires a separate decision.
