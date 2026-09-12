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

### Repo context graph (graft)

`graft/` indexes this repo as linked nodes with exact file:line spans. Get context from it — `graft ask`, `graft grep`, `graft callers` — before grepping or opening source files. See `docs/agents/graft.md`.

### Domain docs

Single-context — `CONTEXT.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.

### First-generation runbooks

`design-system-sync.md` · `figma-injection.md` · `figma-components.md` · `pointer-target-measure.md` · `upstream-surface-recount.md` under `docs/agents/` describe tools that no longer exist. Each carries a banner; read them as history, never as instructions. The code they drove is at tag `v1-shadcn`.

## Where the work stands

`gh issue list --label wayfinder:map --state open` is the authority; this block is a summary of it and may lag by a day.

**Phase 1·Phase 2가 모두 닫혔다.** [ADR-0023](docs/adr/0023-second-generation-base-ui.md)이 2세대(Base UI)의 결정 전부를 담는다. 완료 기록은 [`docs/handoff/phase-1-base-ui-map.md`](docs/handoff/phase-1-base-ui-map.md)·[`docs/handoff/phase-2-base-ui-map.md`](docs/handoff/phase-2-base-ui-map.md)다. Phase 1·2 컴포넌트는 상태 표에서 전부 `stable`이다 — **깨는 변경은 major다.**

**게시된 최신은 `0.4.1`다** — #368·#369가 연 `Text`·`Heading`·`Badge`의 `tone`/`weight`, `Spinner`의 `tone`, `Toggle`의 `size` 축 누적분이 가산이라 patch로 올랐다(#370). 소비처 invest diary는 `@flameware/ui@0.4.1`·`@flameware/tokens@0.4.1`로 돈다. Phase 3의 나머지 진행은 #365를 본다. Phase 2가 새로 만든 다섯 컴포넌트(EmptyState·Progress·Pagination·NumberField·ConfirmDialog) 모두 상태 표에서 `stable`이다 — 다섯 다 앱에 착지한 증거가 있다.

**지금 리포에 있는 것**: `@flameware/tokens`(램프 생성기·`lint`·`contrast`·`verify`, 그리고 소비처용 `./ramp` API), `@flameware/ui`의 서브패스 34개 — `cn`·`icon`·Button·Field/Input/Textarea/Form·Card/Alert·Dialog/AlertDialog/Drawer·Menu/Avatar/Separator/Tooltip·Tabs/PageShell/ThemeToggle·Checkbox/Select/Toggle/ToggleGroup·Badge/ListRow/Text/Heading/Skeleton/Spinner·Table·Combobox·Progress·EmptyState·NumberField·Pagination·ConfirmDialog — 와 `styles.css`·`state.css`·`hit-area.css`, 그리고 Foundations 6장·컴포넌트별 MDX·상태 표·DS 매니저 테마를 갖춘 Storybook과 그것을 여는 Playwright 스토리 테스트(axe·24px·키보드 계약·`viewport:mobile`). semantic 색은 `@theme`에 전부 자동 노출된다. 게시는 `v*` 태그로 `publish.yml`이 한다. 1세대 51개 컴포넌트·매니페스트·계약·Figma 툴링·shadcn alias 층은 태그 `v1-shadcn`에만 있다.

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
| Phase 1 — 2세대 Base UI (#275) | [`docs/handoff/phase-1-base-ui-map.md`](docs/handoff/phase-1-base-ui-map.md) |
| Phase 2 — 2세대 Base UI, 앱 자리로 넓히기 (#317) | [`docs/handoff/phase-2-base-ui-map.md`](docs/handoff/phase-2-base-ui-map.md) |

[`docs/handoff/component-map.md`](docs/handoff/component-map.md) is the historical handoff *into* the completed component map, not a completion record.

## Definition of done

A code change is done when `bun run check` and `bun run test` pass (CI) and the PR is reviewed. `check` runs the tokens gates (`lint` → `contrast` → `verify`), the `@flameware/ui` primitive-leak and state-ladder gate (the grep test ADR-0023 §12 keeps), the `ui` build (`tsc` emitting `dist`, which is where the `.d.ts` for every subpath comes from) and `tsc` on `storybook`; `test` runs `node --test` in `tokens`, `ui` and `storybook`. The `ui` tests are the package smoke (subpath resolution, types, `"use client"` boundary, floor-cost cap) plus the Tailwind emission test — the one that catches a class name that silently produces no CSS. **The storybook test is the main seam** (#279): it builds Storybook, opens every story in Chromium and measures axe violations, the 24×24 pointer floor and each story's declared keyboard contract — so CI needs Chromium (`bunx playwright install --with-deps chromium`, already a step in both workflows). There is no derived channel to sync.

## Keeping this file

This file holds standing instructions and what is **open**. It is not the project's memory — that is what `docs/handoff/` and the issues are for. When a map closes:

1. Write its completion record as a new file in `docs/handoff/`, moving its narrative there verbatim.
2. Move the rules it leaves into [`docs/agents/rules.md`](docs/agents/rules.md), under the subject they belong to.
3. **Delete its paragraph from here** and add its row to the closed-maps table.

**Keep this file under 80 lines.** It reached 69 lines and 25,891 characters once, 97% of it a work log nobody deleted, and by then the three lines that said what was actually in flight were wrong.
