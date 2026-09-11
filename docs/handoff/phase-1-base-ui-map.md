# Phase 1 — 2세대 Base UI 맵 완료 기록

맵 [#275](https://github.com/flameware/massive-design/issues/275) · 결정은 [ADR-0023](../adr/0023-second-generation-base-ui.md) · 규칙은 [`../agents/rules.md`](../agents/rules.md)

## What the map reached

Phase 1의 완료 조건은 리포 밖에 있었다 — 소비처 invest diary가 `@flameware/ui`로 돌아가고, 앱의 `components/ui/`가 비는 것(ADR-0023 §10). 2026-09-11, [investmentdiary#362](https://github.com/flameware/investmentdiary/pull/362)가 그 상태를 만들었다: `src/components/ui/`가 없고, `@radix-ui/*`·`cmdk`·`class-variance-authority`가 `package.json`에 없으며, shadcn 규약 색의 사본 `tokens.css`가 사라져 `globals.css`에는 `@flameware/ui/styles.css` 한 줄과 앱 고유 축(손익·island·레이아웃 폭·차트 강조색·글꼴)만 남는다. 앱의 수동 복사 규약(ADR-0012·0013)은 앱 ADR-0017(npm 의존)·ADR-0018(토큰은 패키지로만 온다)로 대체됐다. 이쪽에서는 [#295](https://github.com/flameware/massive-design/issues/295)가 Phase 1 컴포넌트 전부의 상태를 `preview`에서 `stable`로 올렸다 — 이제부터 깨는 변경은 major다. 게시된 마지막 버전은 `v0.2.3`이고 상태 표는 Storybook만 읽으므로 이 승격에 새 태그는 없다.

## 남긴 상태 (AGENTS.md에서 옮김, 2026-09-11)

**2세대가 결정됐고, 1세대 코드는 지워졌다.** [ADR-0023](../adr/0023-second-generation-base-ui.md)이 2026-09-09 그릴링의 결정 전부를 담는다 — Base UI 기반으로 `packages/ui`를 새로 쓰고, Phase 1의 완료 조건은 리포 밖 소비처 invest diary가 `@flameware/ui`로 돌아가는 것이다. Phase 1 스펙은 [#275](https://github.com/flameware/massive-design/issues/275)이고, 그 sub-issue 19개(#277–#295)가 수직 슬라이스 티켓이다. 리포 안쪽 슬라이스 14개(#277–#286, #288–#291)는 전부 닫혔다 — 티켓별 결정과 PR은 #275의 Decisions-so-far 절에 있다. 남은 것은 전부 리포 밖이다: `v0.2.0` 태그로 두 패키지를 게시하고(`publish.yml`이 `v*` 태그로 돈다), invest diary를 화면 단위로 컷오버한다 — [#287](https://github.com/flameware/massive-design/issues/287) 인증 → [#292](https://github.com/flameware/massive-design/issues/292) 히스토리 → [#293](https://github.com/flameware/massive-design/issues/293) 포트폴리오 → [#294](https://github.com/flameware/massive-design/issues/294) 노트 → [#295](https://github.com/flameware/massive-design/issues/295) 종료. 그 밖의 이슈는 열지 않는다 — 소비 앱에서 난 결함만 예외다(#299가 그 첫 사례였고 #280과 함께 닫혔다).

**지금 리포에 있는 것**: `@flameware/tokens`(램프 생성기·`lint`·`contrast`·`verify`, 그리고 소비처용 `./ramp` API), `@flameware/ui`의 서브패스 29개 — `cn`·`icon`·Button·Field/Input/Textarea/Form·Card/Alert·Dialog/AlertDialog/Drawer·Menu/Avatar/Separator/Tooltip·Tabs/PageShell/ThemeToggle·Checkbox/Select/Toggle/ToggleGroup·Badge/ListRow/Text/Heading/Skeleton/Spinner·Table·Combobox — 와 `styles.css`·`state.css`·`hit-area.css`, 그리고 Foundations 6장·컴포넌트별 MDX·상태 표·DS 매니저 테마를 갖춘 Storybook과 그것을 여는 Playwright 스토리 테스트(axe·24px·키보드 계약·`viewport:mobile`). semantic 색은 `@theme`에 전부 자동 노출된다. 면을 가진 컴포넌트는 `bg-*` 대신 `--ds-state-base` 한 곳만 칠한다 — 상태 레이어가 `background-color`의 유일한 작성자이며, 이를 어기면 hover·누름이 조용히 사라진다(#299). 1세대 51개 컴포넌트·매니페스트·계약·Figma 툴링·shadcn alias 층은 태그 `v1-shadcn`에만 있다.

## Decisions so far (#275에서 옮김)

리포 안쪽:

- #277 (PR #297) — 1세대 삭제. 태그 `v1-shadcn`에만 남는다.
- #278 (PR #298) — 빌드·서브패스·게시 워크플로·Button. 리포 밖 몫(실제 게시·로그인 화면 컷오버)은 #287로 이월.
- #279 (PR #300) — Storybook 문서 계층과 주 seam(axe·24px·키보드 계약).
- #280 + #299 (PR #302) — `@theme`에 semantic 색 전부를 자동 노출, `@flameware/ui/icon`, Foundations 6페이지. 면을 가진 컴포넌트는 `bg-*` 대신 `--ds-state-base` 한 곳만 칠한다 — #299의 캐스케이드 버그를 없앤 규약. 무력화는 `[data-disabled]`.
- #281 (PR #301) — `@flameware/tokens/ramp`: `createRamp`·`rampToCssVariables`·`contrastRatio`. 손익 램프는 앱이 이 API로 만든다.
- #282 (PR #304) — `field`·`input`·`textarea`·`form`. 독립 Label 없음(`Field.Label`). DS는 RHF를 모르고 `value`/`onValueChange`/`onBlur`/`ref`가 결합 seam이다.
- #283 (PR #303) — `card`·`alert`, 서버 컴포넌트. Alert `tone`은 `neutral`(role=status)·`danger`(role=alert).
- #284 (PR #306) — `dialog`·`alert-dialog`·`drawer`. 데스크톱 Dialog ↔ 모바일 Drawer 전환은 앱의 몫. `viewport:mobile` 태그(375×812) 경로.
- #285 (PR #305) — `menu`·`avatar`·`separator`·`tooltip`. `.state`가 `[data-highlighted]`도 그린다.
- #286 (PR #308) — `tabs`(자동 활성화 기본)·`page-shell`·`theme-toggle`(`theme`/`onThemeChange`만 받음, next-themes peer 아님).
- #288 (PR #310) — `checkbox`·`select`·`toggle`·`toggle-group`. Toggle/ToggleGroup은 숨은 미러 입력으로 `name`을 낸다. ToggleGroup `multiple` 폼 제출은 쉼표-join.
- #290 (PR #309) — `badge`·`list-row`·`text`·`heading`·`skeleton`·`spinner`, 서버 컴포넌트.
- #291 (PR #307) — `table`(Root/Header/Body/Row/Head/Cell), TanStack 비의존.
- #289 (PR #311) — `combobox`: Base UI Combobox 하나가 Command+Popover 조립을 대체한다. 포인터 계기가 Base UI의 sr-only 도우미를 측정에서 뺀다.

리포 밖 컷오버(invest diary, `@flameware/*`로 게시):

- #287 (investmentdiary#357) — 인증 4파일. `v0.2.0` 게시. `lucide-react` peer `^1`이라 0.x 소비처는 함께 올려야 한다.
- #292 (investmentdiary#359) — 히스토리 9파일 + 메모 아이콘. Combobox 팝업 z-50을 Positioner로 옮겨 `v0.2.1`(#313). 결손 기록: Menu Label 없음, Skeleton role 못 끔, Base UI `Select`는 `string | null`.
- #293 (investmentdiary#360) — 포트폴리오 7파일. 손익 색은 `createRamp` step 10. 반복 확인된 결손 셋(`Card.Title`·Dialog/AlertDialog `Header`/`Footer`·`Badge tone="outline"`)을 `v0.2.2`(#314)로 닫았다.
- #294 (investmentdiary#361) — 노트 3파일; Textarea·Tabs·Field·Combobox 첫 착지. Combobox Empty·Status 래퍼의 무조건 여백을 `empty:py-0`으로 `v0.2.3`(#315). 기록: Combobox는 닫힐 때 `input-clear`를 낸다, Badge에 nowrap 없음(#240), "후보에 없는 값" 콤보박스 API 없음.
- #295 (investmentdiary#362) — 앱의 `components/ui/`·`tokens.css`·radix/cmdk/cva 삭제, shadcn 이름 → DS semantic 이름 대응표는 앱 ADR-0018. 이쪽은 상태 표 `stable` 승격과 이 기록. 앱에서 확인된 것: 테두리 색을 면에 칠하는 유틸리티(`bg-border` 자리)가 DS에 없어 `bg-(--ds-border-default)`로 썼다; Chart 계열은 DS에 없으므로 앱이 `--chart-1`·`2`를 소유한다.

리뷰가 남긴 범위 밖 메모: `packages/tokens/README.md`의 semantic 색 개수(36)가 실제 `@theme` 등록(35)과 다르다; Foundations 표 컴포넌트 넷이 셀 스타일을 반복한다; Storybook 뷰포트 애드온이 없어 PageShell 데스크톱/모바일 스토리는 고정폭 컨테이너다.

## What outlives the map

- **면을 가진 컴포넌트는 `--ds-state-base` 한 곳만 칠한다** — `rules.md` 토큰과 대비 절로 옮겼다.
- **새 게이트는 소비 앱에서 결함이 난 뒤에만 더한다** (#275 Testing Decisions). Phase 1에서 실제로 그렇게 생긴 것은 #299 → `@flameware/ui`의 primitive-leak·state-ladder grep 게이트 하나다.
- Phase 2 후보는 ADR-0023 Phase 표에 있다. 스펙은 아직 열리지 않았고, 여는 조건은 `rules.md` 방법론 절의 셋 중 하나(소비처가 쓰는 모양·소비 앱의 결함·패키징)다.
