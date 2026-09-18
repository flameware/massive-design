# 리포의 현재 상태 — 상세

[`AGENTS.md`](../../AGENTS.md)의 *Where the work stands*가 요약하는 내용의 상세다. 정본은 언제나 코드·`package.json`·이슈이고, 이 문서는 그 요약이다.

## 2세대가 닫힌 자리

Phase 1·Phase 2·Phase 3가 모두 닫혔다. [ADR-0023](../adr/0023-second-generation-base-ui.md)이 2세대(Base UI)의 결정 전부를 담는다. 완료 기록은 [`phase-1-base-ui-map.md`](../handoff/phase-1-base-ui-map.md)·[`phase-2-base-ui-map.md`](../handoff/phase-2-base-ui-map.md)·[`phase-3-base-ui-map.md`](../handoff/phase-3-base-ui-map.md)다. Phase 1·2 컴포넌트, Phase 3가 축을 더한 다섯(Table·Text/Heading·Badge·Spinner·Toggle), 그리고 Toast(#371, 앱 착지로 `stable` 승격)까지 상태 표에서 전부 `stable`이다 — **깨는 변경은 major다.**

다음 맵을 열 계기는 ADR-0023 §8·§9 포인터에 적힌 재판단 계기(문서 사이트·Figma) 또는 소비처 화면이 새로 드러내는 결손이다.

## 지금 리포에 있는 것

`@flameware/tokens`(램프 생성기·`lint`·`contrast`·`verify`, 그리고 소비처용 `./ramp` API — brand 키 오버라이드 포함), `@flameware/ui`의 서브패스 39개 — `cn`·`icon`·Button·Field/Input/Textarea/Form·Card/Alert·Dialog/AlertDialog/Drawer·Menu/Avatar/Separator/Tooltip·Tabs/PageShell/ThemeToggle·Checkbox/Select/Toggle/ToggleGroup·Badge/ListRow/Text/Heading/Skeleton/Spinner·Table·Combobox·Progress·EmptyState/NumberField/Pagination/ConfirmDialog·Toast·Switch/Slider/Radio/RadioGroup — 와 `styles.css`·`state.css`·`hit-area.css`, 그리고 Foundations 6장·컴포넌트별 MDX·상태 표·DS 매니저 테마를 갖춘 Storybook과 그것을 여는 Playwright 스토리 테스트(axe·24px·키보드 계약·`viewport:mobile`), 그리고 방문자용 루트 [`README.md`](../../README.md). semantic 색은 `@theme`에 전부 자동 노출된다. 게시는 `v*` 태그로 `publish.yml`이 한다.

1세대 51개 컴포넌트·매니페스트·계약·Figma 툴링·shadcn alias 층은 태그 `v1-shadcn`에만 있다.

## 패키지 스코프

`@flameware`다([ADR-0024](../adr/0024-package-scope-follows-the-registry-owner.md)) — GitHub Packages가 리포 소유자와 같은 스코프만 받는다. 1세대를 서술하는 문서의 `@massive/*`는 기록이므로 고치지 않는다.

## Figma

보류다(ADR-0023 §9). 마지막 스냅숏 [#273](https://github.com/flameware/massive-design/issues/273)의 `verification/figma-baseline.json`은 1세대의 기록으로만 남는다. 스냅숏 툴링이 삭제됐으므로 요청이 와도 만들 수 없다.

## 1세대 런북

`docs/agents/`의 `design-system-sync.md` · `figma-injection.md` · `figma-components.md` · `pointer-target-measure.md` · `upstream-surface-recount.md`는 더는 없는 툴을 서술한다. 각각 배너를 달고 있고, 지시가 아니라 기록으로 읽는다. 그 툴이 몰던 코드는 태그 `v1-shadcn`에 있다.
