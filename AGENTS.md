# massive-design

Standing instructions. Everything that happened lives behind a pointer, not here.

## Rules that bind later work

The sixteen rules the catalog maps left, grouped by subject: what earns its own component, what a contract carries and what a gate may claim, axis and value name spaces, contrast by role, the dependency base, and how a population is measured. **Read before opening a surface, adding an axis, registering `parts`, or changing a contract** — most of these exist because a generation did one of those without them. See [`docs/agents/rules.md`](docs/agents/rules.md).

## Agent skills

### Issue tracker

Issues live in this repo's GitHub Issues (`flameware/massive-design`), managed via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical triage roles, used verbatim as label strings. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context — `CONTEXT.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.

### Re-measuring against upstream

Any claim about how many upstream surfaces we are missing is produced by a mechanical set difference, never read off a table by eye. See [`docs/agents/upstream-surface-recount.md`](docs/agents/upstream-surface-recount.md).

## Where the work stands

`gh issue list --label wayfinder:map --state open` is the authority; this block is a summary of it and may lag by a day.

Two maps are live:

- **터치 대상 크기 규칙과 검증 규약 개정** ([#111](https://github.com/flameware/massive-design/issues/111)) — the catalog never set a minimum pointer target size. [ADR-0020](docs/adr/0020-pointer-target-size-is-borne-by-the-hit-area.md) put the floor at WCAG 2.5.8's 24×24 CSS px and on the **hit area**, so no published visual dimension moves. Tickets [#228](https://github.com/flameware/massive-design/issues/228)–[#233](https://github.com/flameware/massive-design/issues/233).
- **parts 공백 닫기** ([#221](https://github.com/flameware/massive-design/issues/221)) — the six surfaces [#177](https://github.com/flameware/massive-design/issues/177) measured as still open, plus the contracts standing without `parts`; population machine-produced per the recount runbook. Tickets [#222](https://github.com/flameware/massive-design/issues/222)–[#227](https://github.com/flameware/massive-design/issues/227), grilling [#195](https://github.com/flameware/massive-design/issues/195). It absorbs [#130](https://github.com/flameware/massive-design/issues/130) and [#155](https://github.com/flameware/massive-design/issues/155), still filed separately as `needs-triage`.

Outside both maps: **Figma Sync 51개 세대** ([#138](https://github.com/flameware/massive-design/issues/138)) — the published baseline is 43 component sets (`verification/figma-baseline.json`) against 51 in code. Figma Sync runs only on an explicit request, in its own issue.

Not yet filed as a map: **`reference.guidance` rationale decomposition** ([ADR-0022](docs/adr/0022-guidance-is-for-the-consumer.md)) — `bun run check` now enforces the length caps and prints the population (30 components, 74 violations as of this writing); `@massive/ui check` is red until each `limits` is split into a consumer-facing boundary plus a source comment or ADR pointer for the rationale.

Closed maps, with their records:

| Map | Record |
| --- | --- |
| 토큰 파운데이션 · 컴포넌트 맵 · P0 · P1 · P2 | [`docs/handoff/catalog-maps.md`](docs/handoff/catalog-maps.md) |
| 표면 층위 공백 닫기 (#139) | [`docs/handoff/surface-gap-map.md`](docs/handoff/surface-gap-map.md) |
| 종류 ② 표면 닫기 (#165) | [`docs/handoff/kind-2-surface-map.md`](docs/handoff/kind-2-surface-map.md) |
| 파생 채널이 담지 못하는 계약 (#140) | [`docs/handoff/derived-channel-contract-map.md`](docs/handoff/derived-channel-contract-map.md) |
| primitive·의존성 기반 확정 (#141) | [`docs/handoff/primitive-dependency-map.md`](docs/handoff/primitive-dependency-map.md) |

[`docs/handoff/component-map.md`](docs/handoff/component-map.md) is the historical handoff *into* the completed component map, not a completion record.

## Syncing derived channels

When updating code-derived Storybook or Figma channels, start with `bun run sync:preflight`, then `bun run sync:checklist` for the human behaviour checks the contracts declare, then follow `docs/agents/design-system-sync.md` for Figma and human checkpoints.

## Keeping this file

This file holds standing instructions and what is **open**. It is not the project's memory — that is what `docs/handoff/` and the issues are for. When a map closes:

1. Write its completion record as a new file in `docs/handoff/`, moving its narrative there verbatim.
2. Move the rules it leaves into [`docs/agents/rules.md`](docs/agents/rules.md), under the subject they belong to.
3. **Delete its paragraph from here** and add its row to the closed-maps table.

**Keep this file under 80 lines.** It reached 69 lines and 25,891 characters once, 97% of it a work log nobody deleted, and by then the three lines that said what was actually in flight were wrong.
