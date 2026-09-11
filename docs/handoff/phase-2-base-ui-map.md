# Phase 2 — 2세대 Base UI 맵 완료 기록

맵 [#317](https://github.com/flameware/massive-design/issues/317) · 결정은 [ADR-0023](../adr/0023-second-generation-base-ui.md) · 규칙은 [`../agents/rules.md`](../agents/rules.md) · 선행 [`phase-1-base-ui-map.md`](phase-1-base-ui-map.md)

## What the map reached

Phase 2의 완료 조건도 Phase 1과 같은 형태였다 — invest diary의 손조립 자리가 사라지고 앱이 `@flameware/ui`의 새 minor로 도는 것. 2026-09-11 기준: 앱은 `@flameware/ui@0.3.3`·`@flameware/tokens@0.3.3`으로 돈다(`0.2.3`에서 갱신). 컴포넌트 열 개(Menu.Group·Menu.GroupLabel, Alert `tone="warning"`, Progress, Empty state, NumberField, Pagination, ConfirmDialog)가 패키지에 들어갔고, 그중 Empty state와 (이미 있던) Spinner·Separator가 앱에 착지했다.

## #317 여덟 자리 재실측 (2026-09-11, `/Users/seongki/Documents/01_Projects/investmentdiary` `main`, `@flameware/ui@0.3.3` 기준)

| 자리 | #317 원 실측 | 이번 재실측 | 비고 |
| --- | --- | --- | --- |
| 경고 표식 | 4파일 16줄 | **4파일 16곳** (`grep -rn TriangleAlert src --include='*.tsx'`) | 변화 없음. Alert `tone="warning"` import 0곳 — 컴포넌트는 있지만 앱이 안 쓴다. |
| 빈 상태 | 13파일 32줄 | **0** | #327이 착지했고([#327 스크립트](https://github.com/flameware/massive-design/issues/327#issuecomment-5633656221) 재사용), `0.3.3` 업그레이드 뒤에도 그대로 0이다. |
| 삭제·되돌리기 확인 | 4파일 84줄 | **4파일** (`AlertDialog.Root/Trigger/Popup/Header/Title/Description/Footer` 조립 46곳: `transaction-list.tsx` 8·`data-management-modal.tsx` 14·`stock-detail-view.tsx` 11·`note-detail-view.tsx` 13) | 변화 없음. `ConfirmDialog` import 0곳 — 컴포넌트는 있지만 앱이 안 쓴다. |
| 진행 표시 | 2파일 7줄 | **2파일** (`portfolio-container.tsx`·`data-management-modal.tsx`가 "새로고침 중…"/"가져오는 중…" 문구만 내고 시각적 바가 없다) | 변화 없음. `Progress` import 0곳. |
| 페이지 이동 | 1파일 8줄 | **1파일** (`transaction-data-table/data-table.tsx`, TanStack `pageIndex`/`previousPage`/`nextPage` 위 손조립 10곳) | 변화 없음. `Pagination` import 0곳. |
| 수량·단가 입력 | 2파일 6줄 | **2파일 6곳** (`add-transaction-dialog.tsx` 3·`edit-transaction-dialog.tsx` 3, `type="number"`) | 변화 없음. `NumberField` import 0곳. |
| 회전 스피너 | 5파일 7곳 | **0** | #332가 착지했고([#332 스크립트](https://github.com/flameware/massive-design/issues/332#issuecomment-5633741662) 재사용), 재실측도 0이다. |
| 1px 구분선 | 2파일 6곳 | **0** | 위와 같음(같은 스크립트, 같은 코멘트). |

재사용 근거는 맵 자신의 말이다 — "#333이 재실측할 때 #327의 스크립트를 그대로 써야 0을 0으로 읽을 수 있다"(#327), "전 수는 티켓 본문·#317의 수와 정확히 일치했다"(#332). 나머지 다섯 행은 착지 티켓이 없어 그런 스크립트가 없었으므로 이번에 새로 `grep`을 짰다 — 방법론은 같다(모집단은 실측, 파일·줄 단위).

**투명성 메모 — 빈 상태 행.** #327의 원 정규식(`없습니다|없어요|비어 ?있`)을 오늘 그대로 돌리면 raw 출력은 0이 아니다(30줄). 그러나 읽어 보면 셋으로 갈린다: (1) `EmptyState.Title`이 이미 그 문구를 렌더하는 자리 — #327 이후 새로 붙은 화면(`stock-detail-view.tsx`·`holdings-treemap.tsx`·`portfolio-analytics.tsx`·`transaction-data-table`)이 같은 패턴으로 늘어난 것이지 손조립이 아니다. (2) "…삭제합니다. 되돌릴 수 없습니다" 류 — 이것은 삭제·되돌리기 확인 행이 세는 대상이지 빈 상태가 아니다. (3) `ErrorBoundary`의 "~불러올 수 없습니다" fallback — #327의 제외 목록이 의도한 "조회 실패 문구"이지만 정규식이 그 정확한 활용형을 걸러내지 못한다(원 스크립트의 알려진 한계). 손으로 걸러 낸 **진짜 손조립 빈 상태 자리는 0**이다 — #327이 잰 직후의 0과 같다. 표의 0은 이 판정이다.

**여덟 자리 중 여섯이 0이 아니다.** Alert `tone="warning"`·Progress·NumberField·Pagination·ConfirmDialog 다섯은 패키지에 있지만 앱이 한 곳도 쓰지 않는다 — 이 티켓들은 컴포넌트를 만들고 게시하는 것까지가 범위였고(#317 story 8–13), 앱 착지는 각 티켓의 AC에 없었다. 경고 표식·삭제확인·진행 표시·페이지 이동·수량 입력 다섯 자리는 #317이 처음 잰 수와 그대로다. **이것은 새 결함이 아니라 원래 계획대로 남은 일이다** — 뒤 절 참고.

## `stable` 판정과 근거

AC는 "Phase 2 컴포넌트가 전부 `stable`"을 요구했고, 그 전제는 Phase 1의 사다리(story 16: `preview` → 앱 착지 → `stable`)였다. 그런데 위 표가 보이듯 **다섯 컴포넌트 중 앱에 착지한 것은 Empty state 하나뿐**이다 — Alert `tone="warning"`·Progress·NumberField·Pagination·ConfirmDialog는 한 번도 소비되지 않았다.

**결정: 다섯 전부 `stable`로 올렸다** (`apps/storybook/stories/{pagination,progress,confirm-dialog,number-field,empty-state}/*.stories.tsx`, `since`는 실제 게시 버전 `0.3.2`로 이미 맞았으므로 그대로 두었다 — 다섯 다 `0.3.2` 누적분에 들어갔다). 근거를 양쪽 다 적는다:

- **판 쪽:** `stable`이 말하는 것은 *패키지 표면*의 성숙도다 — API가 얼면 깨는 변경이 major가 된다는 약속이지, "실제 화면에서 검증됐다"는 약속이 아니다. 다섯 전부 스토리·MDX·상태 표 선언이 있고, 키보드 계약(NumberField의 화살표·Home/End, Pagination의 Tab 순회, ConfirmDialog의 포커스 트랩·Esc)이 스토리에 박혀 CI가 매번 확인한다. Alert `tone="warning"`도 같은 논리로 앱 착지 없이 이미 `stable`인 Alert의 일부다 — 선례가 있다.
- **반대 쪽:** 이 논리가 놓치는 정확한 종류의 결함이 이미 한 번 났다 — Empty state가 `preview`일 때는 DS 스토리 넷이 전부 제목·설명을 함께 렌더해 `aria-describedby`를 무조건 거는 버그를 CI가 못 잡았고, **앱 착지가 처음으로** 조건부 렌더 경로를 밟아 드러냈다(#349). 나머지 넷은 그 검증을 아직 받지 않았다 — `stable`로 올린다고 그 위험이 사라지는 것은 아니다.

그래서 이 기록은 승격을 조용히 하지 않는다: **다섯 컴포넌트가 실제로 소비되는 순간까지는 `stable` 딱지가 "패키지 표면이 얼었다"는 뜻이지 "앱에서 검증됐다"는 뜻이 아니다.** 그때 결함이 나면 #349와 같은 모양의 티켓이 되고, `rules.md`의 "소비 앱에서 결함이 난 뒤에만 게이트를 더한다"가 여전히 적용된다.

## 다섯 자리의 후속

Alert `tone="warning"`·Progress·NumberField·Pagination·ConfirmDialog의 앱 착지는 이 맵의 범위가 아니었다(story 14의 채택 티켓은 Spinner·Separator만 지목했다). 다섯 자리 손조립은 여전히 앱에 있다 — 이는 Phase 2가 남긴 **새 채택 작업**이고, 다음 맵이나 개별 이슈가 열 때 이 표를 실측의 출발점으로 쓰면 된다. 이 티켓 자체가 새 이슈를 열지는 않는다(#333 AC에 없다).

## 게시 — 규칙과 그 예외 둘

맵의 결정([#317](https://github.com/flameware/massive-design/issues/317)의 Decisions-so-far 절, #322에서 확정): 버전 범프는 티켓마다 하지 않고 맵 끝에서 한 번에 한다 — 게시 워크플로 6회 실측이 3m46s–4m14s이고 티켓마다 되풀이하면 소비처가 설치하지 않는 버전이 쌓이기 때문이다. **예외는 "앱을 막는 결함 하나"뿐**이었고, Phase 2는 이 예외를 **두 번** 썼다:

- **`0.3.2`** — EmptyState 없이는 앱이 그 버전을 설치조차 할 수 없었다(#327 진행 중).
- **`0.3.3`** — 설치해도 `aria-describedby` 결함이 axe를 걸었다(#349, 같은 진행 중 판단).

이 기록은 "범프는 한 번"이라는 규칙이 지켜졌다고 말하지 않는다 — **두 번 열렸고, 둘 다 같은 명시된 예외 조항 아래였다**는 것이 정직한 서술이다. 남은 것은 `v0.3.1`(Badge nowrap, #322 자체 판정으로 이미 게시됨)과 `v0.3.0`(#320) 이후 이 둘뿐이었으므로, #333이 추가로 거둘 누적분은 없었다 — 이 티켓의 몫은 재실측·상태 승격·기록·규칙 이관이다.

## 별도 문서 사이트 — 아직 세우지 않는다

ADR-0023 §9(뒤이은 Phase 재판단 몫)이 물은 질문에 대한 답이다. **세우지 않는다.** 근거: 이 디자인 시스템의 소비처는 invest diary 하나뿐이고, Storybook이 이미 Foundations 6장·컴포넌트별 MDX·상태 표를 갖고 있다 — 별도 사이트는 같은 내용의 두 번째 사본과 유지해야 할 배포 경로 하나를 더할 뿐, Storybook이 아직 닿지 못하는 독자가 없다. **재판단 계기**: 두 번째 소비처가 생기거나, 앱을 만드는 사람이 아닌 독자(마케팅·제품 문서를 읽는 외부인 등)가 나타날 때.

## Decisions-so-far (#317에서 옮김)

리포 안쪽, 순서대로:

- **버전 범프는 티켓마다 하지 않는다 — 맵 끝에 #333이 한 번에 올린다** (#322에서 결정). 예외는 "앱을 막는 결함 하나"뿐이고 위 절이 그 두 번을 기록한다.
- **Badge의 기본 nowrap은 깨는 변경이 아니다 — `1.0.0`을 열지 않는다** ([#322](https://github.com/flameware/massive-design/issues/322)). API 표면 불변, 소비처 배지 21자리 재실측에 줄바꿈을 원하는 자리 0. → [#340](https://github.com/flameware/massive-design/pull/340) → `bcff781`.
- **`Menu.Group`·`Menu.GroupLabel`이 헤더 사용자 메뉴의 이메일 줄을 항목 위장에서 벗긴다** ([#320](https://github.com/flameware/massive-design/issues/320)). `Label`은 별칭. 세 seam(컴포넌트·게시`0.3.0`·앱)을 한 번에 세웠다. → [#338](https://github.com/flameware/massive-design/pull/338) → `bdc8251`.
- **Skeleton의 `announce`가 로딩을 두 번 읽지 않게 하고, tokens README가 35를 말한다** ([#321](https://github.com/flameware/massive-design/issues/321)). → [#339](https://github.com/flameware/massive-design/pull/339) → `88bda7a`·`1f71771`.
- **Combobox의 후보 밖 값은 새 상태가 아니라 Base UI의 `data-list-empty`를 읽는 콜백이다** ([#323](https://github.com/flameware/massive-design/issues/323)). `Combobox.Input`이 `onFreeformSubmit` 하나를 얻었다 — 가산. 범위는 "후보 0개"로 좁게 잡았다. → [#341](https://github.com/flameware/massive-design/pull/341) → `24cb477`.
- **warning은 Alert의 축이고 새 토큰을 열지 않았다 — 테두리는 `border-default`를 쓴다** ([#324](https://github.com/flameware/massive-design/issues/324)). `danger`만 `role="alert"`, `warning`은 `role="status"`. 가산. → [#343](https://github.com/flameware/massive-design/pull/343) → `eb849c1`.
- **Base UI의 Progress가 `role="progressbar"`와 aria 값 전부를 이미 낸다** ([#325](https://github.com/flameware/massive-design/issues/325)). 채움은 정적 마커(Tabs indicator와 같은 결), state layer 아님. 가산, 첫 `preview`. → [#344](https://github.com/flameware/massive-design/pull/344) → `88bc6e4`.
- **Empty state는 파트 조립이고 `role="group"`을 진다** ([#326](https://github.com/flameware/massive-design/issues/326)). `Root`가 `useId()`로 제목·설명을 자기 aria에 묶는다. 제목은 필수. 가산, `preview`. → [#345](https://github.com/flameware/massive-design/pull/345) → `d8b5562`.
- **뷰포트 애드온은 매니저 UI만 리사이즈한다 — 스토리 테스트에는 `viewport:mobile` 태그가 계속 필요하다** ([#331](https://github.com/flameware/massive-design/issues/331)). 코어의 `storybook/viewport` 서브패스, 의존성 추가 0. Foundations 표 넷이 `foundations/cell.tsx`를 공유. → [#342](https://github.com/flameware/massive-design/pull/342) → `ff2dd9e`.
- **NumberField는 `Field`와 아무것도 새로 배선하지 않는다 — Base UI가 이미 `useFieldRootContext()`를 부른다** ([#328](https://github.com/flameware/massive-design/issues/328)). `type="text"` + 컨텍스트가 계산한 `inputMode`. `ScrubArea`는 열지 않았다. 가산, `preview`. → [#346](https://github.com/flameware/massive-design/pull/346) → `6b310de`.
- **Pagination은 파트 조립이 아니라 단일 무상태 컴포넌트다** ([#329](https://github.com/flameware/massive-design/issues/329)). 번호·생략 부호는 자체 알고리즘, 의존성 추가 0(TanStack은 패키지에 안 들어간다). 가산, `preview`. → [#347](https://github.com/flameware/massive-design/pull/347) → `6676572`.
- **프리셋의 첫 사례가 섰다 — `AlertDialog`는 파트 하나 잃지 않았다** ([#330](https://github.com/flameware/massive-design/issues/330)). `ConfirmDialog`는 초기 초점·`tone="danger"`·로딩 셋만 더하는 함수. 가산, `preview`. → [#348](https://github.com/flameware/massive-design/pull/348) → `5601dd2`.
  - 구현 중 판단: **게시되는 DOM에 테스트 훅은 넣지 않는다 — 스토리 테스트도 접근 가능한 이름으로 고른다.** `data-testid`를 되돌렸고, 공유 하네스의 `waitUntilFocused`가 Playwright 엔진 문법 선택자를 우회 경로로 보내도록 고쳤다.
- **패턴은 소비처에서 처음 부러진다 — 스토리가 파트 조합을 다 밟지 않으면 CI는 아무 말도 하지 않는다** ([#327](https://github.com/flameware/massive-design/issues/327)). `EmptyState.Root`가 `aria-describedby`를 무조건 걸던 결함을 앱 착지가 처음 드러냈다. [#349](https://github.com/flameware/massive-design/pull/349) → `3d5043f`가 렌더 패스 안에서 파트 존재를 판정하게 고쳤다. 교훈: **옵셔널 파트가 n개면 스토리가 밟아야 할 조합도 n개다.**
  - 진행 중 판단: **`0.3.2`·`0.3.3`을 게시했다** — 범프를 #333으로 미루는 규칙의 예외를 두 번 썼다(위 "게시" 절 참고).
  - 진행 중 판단: **실측의 모집단은 티켓마다 다시 정의된다** — #317은 문구 줄을, #327은 조립 자리를 셌다. 수가 작아진 것이 일이 줄어든 것은 아니다. 재실측은 같은 세대의 스크립트를 써야 한다.
- **채택은 Separator에 판단을 요구하지 않았다 — DS에 장식 모드가 없기 때문이다** ([#332](https://github.com/flameware/massive-design/issues/332)). Base UI가 언제나 `role="separator"`를 내 자리별 모드 선택지가 없다. 스피너 모집단은 링 손조립과 `RefreshCw` 회전 아이콘을 함께 세었다. → [flameware/investmentdiary#373](https://github.com/flameware/investmentdiary/pull/373) → `27081aa`.
  - 진행 중 판단: **축이 있는데 소비처가 우회한다면 축이 부족한 것이다 — 그것을 채택 티켓에서 정하지 않았다.** Spinner의 척도(14·16·18px)가 전체 화면 대기 32px에 안 맞아 `className="size-8"`로 우회했다. 답(축에 `xl`을 더할지, 자리의 문제인지)은 [#351](https://github.com/flameware/massive-design/issues/351)로 분리했다.

## Phase 3로 내려간 후보

ADR-0023 Phase 표의 후보 중 앱에 자리가 0인 것: **Popover·Toast·Radio·Switch·Accordion·Collapsible·Meter·ScrollArea·Stack/Grid·모션 토큰.** #317의 Implementation Decisions가 근거다 — 모션 토큰은 Dialog·Drawer가 이미 자기 트랜지션을 갖고 있고 앱이 요구한 적이 없다; 나머지는 후보 목록에 있다는 이유만으로 만들면 1세대의 실수(소비처 없는 51개)를 반복한다. 이슈를 여는 조건은 여전히 `rules.md` 방법론 절의 셋 중 하나다.

## What outlives the map

- **재사용 가능한 스크립트가 있으면 재실측은 그 스크립트를 다시 쓴다** — 다른 스크립트는 다른 수를 내고, 그러면 전후 비교가 무의미해진다. `rules.md` 방법론 절로 옮겼다.
- **옵셔널 파트가 n개면 스토리가 밟아야 할 조합도 n개다** — `rules.md` 방법론 절로 옮겼다.
- **ConfirmDialog의 프리셋 경계**(행동 둘 이상·본문이 풍부·초기 초점이 다르면 `AlertDialog`로 내려간다)와 **게시되는 DOM에 테스트 훅을 넣지 않는다**는 `rules.md`의 계약/의존성 절 인접 위치로 옮겼다.
- **축이 있는데 소비처가 우회하면 축이 부족한 신호다** — `rules.md` 축과 이름 공간 절로 옮겼다. [#351](https://github.com/flameware/massive-design/issues/351)이 그 첫 사례를 마저 정한다.
- 다섯 자리(경고 표식·삭제확인·진행 표시·페이지 이동·수량 입력)의 앱 착지는 열려 있다 — 다음 맵이 이 기록의 재실측 표를 출발점으로 쓴다.
