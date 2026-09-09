# massive-design

Standing instructions. Everything that happened lives behind a pointer, not here.

이 프로젝트의 질문과 출력은 한국어를 기본으로 한다.

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

**2세대가 결정됐고, 아직 코드는 1세대다.** [ADR-0023](docs/adr/0023-second-generation-base-ui.md)이 2026-09-09 그릴링의 결정 전부를 담는다 — Base UI 기반으로 `packages/ui`를 새로 쓰고, 계약·매니페스트·Figma 파생 툴링을 삭제하며, Phase 1의 완료 조건은 리포 밖 소비처 invest diary가 `@massive/ui`로 돌아가는 것이다. Phase 1 스펙은 [#275](https://github.com/flameware/massive-design/issues/275)이고, 다음 행위는 그것을 `/to-tickets`로 수직 슬라이스 티켓으로 자르는 것이다. 그 전까지 1세대 코드에 이슈를 열지 않는다 — 소비 앱에서 난 결함만 예외다.

**규칙 원장과 아래 표준 지시 중 계약·`parts`·`sync:checklist`·매니페스트를 말하는 것은 1세대의 것이다.** Phase 1이 그 툴링을 지우는 PR에서 함께 고친다. 그때까지는 읽되 새 코드에 적용하지 않는다.

**Figma는 보류다** (ADR-0023 §9). 마지막 스냅숏 [#273](https://github.com/flameware/massive-design/issues/273)의 `verification/figma-baseline.json`은 1세대의 기록으로만 남는다. 스냅숏 툴링이 삭제되므로 요청이 와도 만들 수 없다.

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
