# massive-design

Standing instructions. Everything that happened lives behind a pointer, not here.

이 프로젝트의 질문과 출력은 한국어를 기본으로 한다.

## Rules that bind later work

The rules the first generation left, grouped by subject. **Read the 축·이름 공간, 토큰과 대비, 포인터 기하, 의존성과 base, 방법론 subjects before opening a component, adding an axis, or touching a token** — those survived ADR-0023. Sections marked 1세대 (계약·`parts`·파생 채널·radix) are history and do not bind new code. See [`docs/agents/rules.md`](docs/agents/rules.md).

## Agent skills

### Issue tracker

Issues live in this repo's GitHub Issues (`flameware/massive-design`), managed via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical triage roles, used verbatim as label strings. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context — `CONTEXT.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.

### First-generation runbooks

`design-system-sync.md` · `figma-injection.md` · `figma-components.md` · `pointer-target-measure.md` · `upstream-surface-recount.md` under `docs/agents/` describe tools that no longer exist. Each carries a banner; read them as history, never as instructions. The code they drove is at tag `v1-shadcn`.

## Where the work stands

`gh issue list --label wayfinder:map --state open` is the authority; this block is a summary of it and may lag by a day.

**2세대가 결정됐고, 1세대 코드는 지워졌다.** [ADR-0023](docs/adr/0023-second-generation-base-ui.md)이 2026-09-09 그릴링의 결정 전부를 담는다 — Base UI 기반으로 `packages/ui`를 새로 쓰고, Phase 1의 완료 조건은 리포 밖 소비처 invest diary가 `@flameware/ui`로 돌아가는 것이다. Phase 1 스펙은 [#275](https://github.com/flameware/massive-design/issues/275)이고, 그 sub-issue 19개(#277–#295)가 수직 슬라이스 티켓이다. **리포 안쪽 슬라이스 14개(#277–#286, #288–#291)는 전부 닫혔다** — 티켓별 결정과 PR은 #275의 Decisions-so-far 절에 있다. 남은 것은 전부 리포 밖이다: **`v0.2.0` 태그로 두 패키지를 게시**하고(`publish.yml`이 `v*` 태그로 돈다; 버전은 이미 0.2.0), invest diary를 화면 단위로 컷오버한다 — [#287](https://github.com/flameware/massive-design/issues/287) 인증 → [#292](https://github.com/flameware/massive-design/issues/292) 히스토리 → [#293](https://github.com/flameware/massive-design/issues/293) 포트폴리오 → [#294](https://github.com/flameware/massive-design/issues/294) 노트 → [#295](https://github.com/flameware/massive-design/issues/295) 종료. 그 밖의 이슈는 열지 않는다 — 소비 앱에서 난 결함만 예외다(#299가 그 첫 사례였고 #280과 함께 닫혔다).

**지금 리포에 있는 것**: `@flameware/tokens`(램프 생성기·`lint`·`contrast`·`verify`, 그리고 소비처용 `./ramp` API), `@flameware/ui`의 서브패스 29개 — `cn`·`icon`·Button·Field/Input/Textarea/Form·Card/Alert·Dialog/AlertDialog/Drawer·Menu/Avatar/Separator/Tooltip·Tabs/PageShell/ThemeToggle·Checkbox/Select/Toggle/ToggleGroup·Badge/ListRow/Text/Heading/Skeleton/Spinner·Table·Combobox — 와 `styles.css`·`state.css`·`hit-area.css`, 그리고 Foundations 6장·컴포넌트별 MDX·상태 표·DS 매니저 테마를 갖춘 Storybook과 그것을 여는 Playwright 스토리 테스트(axe·24px·키보드 계약·`viewport:mobile`). semantic 색은 `@theme`에 전부 자동 노출된다. **면을 가진 컴포넌트는 `bg-*` 대신 `--ds-state-base` 한 곳만 칠한다** — 상태 레이어가 `background-color`의 유일한 작성자이며, 이를 어기면 hover·누름이 조용히 사라진다(#299). 1세대 51개 컴포넌트·매니페스트·계약·Figma 툴링·shadcn alias 층은 태그 `v1-shadcn`에만 있다.

**패키지 스코프는 `@flameware`다**([ADR-0024](docs/adr/0024-package-scope-follows-the-registry-owner.md)) — GitHub Packages가 리포 소유자와 같은 스코프만 받는다. 1세대를 서술하는 문서의 `@massive/*`는 기록이므로 고치지 않는다.

**Figma는 보류다** (ADR-0023 §9). 마지막 스냅숏 [#273](https://github.com/flameware/massive-design/issues/273)의 `verification/figma-baseline.json`은 1세대의 기록으로만 남는다. 스냅숏 툴링이 삭제됐으므로 요청이 와도 만들 수 없다.

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

## Definition of done

A code change is done when `bun run check` and `bun run test` pass (CI) and the PR is reviewed. `check` runs the tokens gates (`lint` → `contrast` → `verify`), the `@flameware/ui` primitive-leak and state-ladder gate (the grep test ADR-0023 §12 keeps), the `ui` build (`tsc` emitting `dist`, which is where the `.d.ts` for every subpath comes from) and `tsc` on `storybook`; `test` runs `node --test` in `tokens`, `ui` and `storybook`. The `ui` tests are the package smoke (subpath resolution, types, `"use client"` boundary, floor-cost cap) plus the Tailwind emission test — the one that catches a class name that silently produces no CSS. **The storybook test is the main seam** (#279): it builds Storybook, opens every story in Chromium and measures axe violations, the 24×24 pointer floor and each story's declared keyboard contract — so CI needs Chromium (`bunx playwright install --with-deps chromium`, already a step in both workflows). There is no derived channel to sync.

## Keeping this file

This file holds standing instructions and what is **open**. It is not the project's memory — that is what `docs/handoff/` and the issues are for. When a map closes:

1. Write its completion record as a new file in `docs/handoff/`, moving its narrative there verbatim.
2. Move the rules it leaves into [`docs/agents/rules.md`](docs/agents/rules.md), under the subject they belong to.
3. **Delete its paragraph from here** and add its row to the closed-maps table.

**Keep this file under 80 lines.** It reached 69 lines and 25,891 characters once, 97% of it a work log nobody deleted, and by then the three lines that said what was actually in flight were wrong.
