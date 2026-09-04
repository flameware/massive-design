# massive-design

Standing instructions. Everything that happened lives behind a pointer, not here.

## Rules that bind later work

The twenty rules the catalog maps left, grouped by subject: what earns its own component, what a contract carries and what a gate may claim, axis and value name spaces, contrast by role, the dependency base, and how a population is measured. **Read before opening a surface, adding an axis, registering `parts`, or changing a contract** — most of these exist because a generation did one of those without them. See [`docs/agents/rules.md`](docs/agents/rules.md).

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

**No map is live.** The catalog (51 components), tokens and Storybook are complete; open issues are individual bugs and packaging, not maps. Before opening a new map, read [`docs/handoff/repo-review-2026-09.md`](docs/handoff/repo-review-2026-09.md) — it names what kind of issue earns a ticket here.

**Figma is an on-request snapshot** ([ADR-0002, amended](docs/adr/0002-separate-repo-verification-from-figma-sync.md)). The last snapshot holds 43 component sets (`verification/figma-baseline.json`) against 51 in code; that gap is the normal state, not a defect. Take a new snapshot only when the owner asks, following `docs/agents/design-system-sync.md` §2.

Closed maps, with their records:

| Map | Record |
| --- | --- |
| 토큰 파운데이션 · 컴포넌트 맵 · P0 · P1 · P2 | [`docs/handoff/catalog-maps.md`](docs/handoff/catalog-maps.md) |
| 표면 층위 공백 닫기 (#139) | [`docs/handoff/surface-gap-map.md`](docs/handoff/surface-gap-map.md) |
| 종류 ② 표면 닫기 (#165) | [`docs/handoff/kind-2-surface-map.md`](docs/handoff/kind-2-surface-map.md) |
| parts 공백 닫기 (#221) | [`docs/handoff/parts-gap-map.md`](docs/handoff/parts-gap-map.md) |
| 터치 대상 크기 규칙과 검증 규약 개정 (#111) | [`docs/handoff/pointer-target-map.md`](docs/handoff/pointer-target-map.md) |
| 파생 채널이 담지 못하는 계약 (#140) | [`docs/handoff/derived-channel-contract-map.md`](docs/handoff/derived-channel-contract-map.md) |
| primitive·의존성 기반 확정 (#141) | [`docs/handoff/primitive-dependency-map.md`](docs/handoff/primitive-dependency-map.md) |

[`docs/handoff/component-map.md`](docs/handoff/component-map.md) is the historical handoff *into* the completed component map, not a completion record.

## Syncing derived channels

A code change is done when `bun run check` and `bun run test` pass (CI) and the PR is reviewed. If the change touches a contract's `behaviors`·`gestures` or a pointer-target slot, run `bun run sync:checklist` and do the human checks in `docs/agents/design-system-sync.md` §1, recording the result in the PR. Figma snapshots are §2 of that runbook and happen only on request.

## Keeping this file

This file holds standing instructions and what is **open**. It is not the project's memory — that is what `docs/handoff/` and the issues are for. When a map closes:

1. Write its completion record as a new file in `docs/handoff/`, moving its narrative there verbatim.
2. Move the rules it leaves into [`docs/agents/rules.md`](docs/agents/rules.md), under the subject they belong to.
3. **Delete its paragraph from here** and add its row to the closed-maps table.

**Keep this file under 80 lines.** It reached 69 lines and 25,891 characters once, 97% of it a work log nobody deleted, and by then the three lines that said what was actually in flight were wrong.
