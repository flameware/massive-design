# Phase 2 — 2세대 Base UI 맵 완료 기록

맵 [#317](https://github.com/flameware/massive-design/issues/317) · 종결 [#333](https://github.com/flameware/massive-design/issues/333) · 결정은 [ADR-0023](../adr/0023-second-generation-base-ui.md) · 규칙은 [`../agents/rules.md`](../agents/rules.md) · 선행 [`phase-1-base-ui-map.md`](phase-1-base-ui-map.md)

## What the map reached

#317의 완료 조건은 둘이었다: invest diary의 손조립 자리가 사라지는 것, 앱이 `@flameware/ui`의 새 minor로 도는 것. 둘째는 진작 됐다(`@flameware/ui@0.3.3`·`@flameware/tokens@0.3.3`). 첫째는 이 티켓이 닫았다 — #353(Alert `tone="warning"`)·#354(ConfirmDialog)·#355(Progress·Pagination·NumberField) 세 착지 티켓이 모두 앱 `main`에 들어간 뒤, 이 티켓이 여덟 자리를 #317·#327·#332와 같은 스크립트로 다시 쟀다.

## #317 여덟 자리 — 종결 실측 (2026-09-11, `/Users/seongki/Documents/01_Projects/investmentdiary` `main` `fb50e1a`, `@flameware/ui@0.3.3`)

| 자리 | #317 원 실측 | 종결 실측 | 비고 |
| --- | --- | --- | --- |
| 빈 상태 | 13파일 32줄 | **0** | #327 스크립트 재사용. raw `grep`은 34줄이지만 손으로 걸러 보면 전부 `EmptyState.Title` 안(이미 채택), 삭제확인 문구(그 행이 센다), `Combobox.Empty`(DS 슬롯), 조회 실패 문구(Alert 몫) — 손조립 0. |
| 회전 스피너 | 5파일 7곳 | **0** | #332 스크립트 재사용(`animate-spin`). |
| 1px 구분선 | 2파일 6곳 | **0** | #332 스크립트 재사용(`h-px bg-`). |
| 경고 표식 | 4파일 16줄 | **0** | #353 스크립트(`TriangleAlert` + `text-muted` ±3줄, `Alert.Root` 밖) 재실행 — 4파일 9곳 → 0. 차단형 3곳은 `Alert tone="danger"`, 비차단형 3곳은 `Alert tone="warning"`, 인라인 3곳은 `Badge tone="warning"`(1곳)·`text-warning`(2곳)으로 갔다 — Alert가 블록 레벨이라 안 맞는 자리였다. |
| 삭제·되돌리기 확인 | 4파일 84줄 | **4→1파일, 46→14곳**(판단) | #354 스크립트(`AlertDialog.*` 파트 참조) 재실행. 3자리(`transaction-list.tsx`·`note-detail-view.tsx`·`stock-detail-view.tsx`)는 `ConfirmDialog`로 갔다. 남은 14곳은 전부 `data-management-modal.tsx`이고 **의도적으로 `AlertDialog`에 남았다** — 가져오기 모드는 행동이 셋(취소·병합·교체), 전체 삭제는 본문이 두 문단인 데다 확인 즉시 닫고 진행률을 다이얼로그 밖에서 보이는 자리라 프리셋의 "resolve까지 열려 있다" 전제와 맞지 않는다. |
| 진행 표시 | 2파일 7줄 | **2→3파일**(판단) | #355 스크립트 재실행. `data-management-modal.tsx`가 `Progress`로 새로 배선됐다(JSON 가져오기, 실제 카운트가 있는 자리). `portfolio-container.tsx`·`use-refresh-holdings.ts`는 **의도적으로 그대로다** — 시세 일괄 갱신이 배치 한 요청이라 진행값이 이진(0 아니면 완료)이고, 채우면 뜻 없이 움직이는 가짜 진행률이 된다. Spinner(#332가 이미 채택)가 정직한 모양이다. |
| 페이지 이동 | 1파일 8줄 | **0** | #355 스크립트 재실행. `table.previousPage/nextPage/setPageIndex` 손조립 버튼 0 — 남은 유일한 `setPageIndex` 호출은 `Pagination`의 `onPageChange` 콜백 안(DS 컴포넌트가 요구하는 배선)이다. |
| 수량·단가 입력 | 2파일 6줄 | **0** | #355 스크립트 재실행(`type="number"`). `add-transaction-dialog.tsx`·`edit-transaction-dialog.tsx` 6곳 전부 `NumberField`로 갔다. |

**여덟 중 여섯이 바로 0이고, 둘(삭제·되돌리기 확인·진행 표시)은 바로 0이 아니지만 실패가 아니다.** 삭제·되돌리기 확인의 14곳은 프리셋 경계 규칙("행동 둘 이상·본문이 풍부·초기 초점이 다르면 `AlertDialog`로 내려간다")이 실제로 작동한 자리다 — `ConfirmDialog`가 파트를 숨기지 않는다는 #330의 조건이 여기서 코드로 증명됐다. 진행 표시의 시세 갱신 자리는 결정적 진행값이 없는데 값을 지어내지 않은 판단이다 — 이 판단은 아래 "종결의 두 자리" 절에서 다시 다룬다.

## `stable` 승격 — 다섯 전부

Phase 2가 새로 만든 다섯 컴포넌트(EmptyState·Progress·Pagination·NumberField·ConfirmDialog) 모두 이제 앱에서 실제로 소비된다 — 승격의 근거가 요구하는 증거(#349가 세운 기준: "CI green이 아니라 실제 소비")가 다섯 다 갖춰졌다.

| 컴포넌트 | 착지 | 증거 |
| --- | --- | --- |
| EmptyState | #327 | `aria-describedby` 무조건 결함을 앱 착지가 냈고 #349가 고쳤다 |
| Progress | #355 | JSON 가져오기에 결정적 진행값으로 배선됨(`data-management-modal.tsx`) |
| Pagination | #355 | 거래 데이터 테이블 TanStack 위에 직결됨 |
| NumberField | #355 | 거래 입력 6자리, `Field` 배선이 그대로 작동함을 확인 |
| ConfirmDialog | #354 | 3자리 착지가 삭제 핸들러의 에러 삼킴 결함을 드러내고 고쳤다 — 프리셋의 계약(엄격한 `onConfirm` 프로미스)이 손조립이 숨기던 버그를 찾아냈다 |

다섯 스토리 모두 `status: "stable"`·`since: "0.3.2"`(실제 게시 버전)로 올렸다. Alert `tone="warning"`은 새 컴포넌트가 아니라 이미 `stable`(`since 0.2.0`)인 Alert에 더한 축이라 별도 승격이 없다.

## 종결의 두 자리 — 판단이지 미완이 아니다

**삭제·되돌리기 확인의 14곳**은 #330이 그은 프리셋 경계 그대로다. 강제로 `ConfirmDialog`에 욱여넣으려면 UX를 바꿔야 했는데(전체 삭제는 확인 뒤 바로 닫고 백그라운드로 진행하는 동작을 갖고 있다), #317의 Out of Scope("이행은 컴포넌트 교체와 채택뿐")를 어기는 일이었다. 남은 14곳이 `AlertDialog`에 있는 것 자체가 프리셋이 파트를 숨기지 않는다는 증거다.

**진행 표시의 시세 일괄 갱신 자리**는 Progress를 의도적으로 쓰지 않았다. `Progress`는 결정적 컴포넌트(`role="progressbar"` + 값)이고, `/api/kis/sync`가 배치를 한 요청으로 처리해 `progress.current`가 시작 시 0에서 끝나야 `total`로 뛰는 이진 값이라 채우면 의미 없이 움직이는 가짜 진행률이 된다. Spinner(#332)가 정직한 모양이고, 그대로 뒀다. **결정적 진행 컴포넌트에 가짜 값을 주지 않는다**는 판단은 `rules.md`로 옮겼다.

## 게시 — 규칙의 예외를 두 번 썼다

맵의 결정(#317 Decisions-so-far, #322에서 확정)은 "버전 범프는 티켓마다 하지 않고 맵 끝에서 한 번에 한다 — 예외는 앱을 막는 결함 하나뿐"이었다. **이 예외를 정직하게 두 번 썼다**: `0.3.2`(EmptyState 없이는 설치조차 못했다, #327)와 `0.3.3`(설치해도 axe가 걸렸다, #349). #333이 열릴 시점엔 그 둘 이후로 거둘 누적분이 없었다 — "맵 끝에 한 번" 규칙은 지켜지지 않았고, 지켜지지 않은 이유(둘 다 같은 명시된 예외 조항)가 정직한 서술이다. #353·#354·#355의 앱 착지 자체는 리포 게시를 새로 열지 않았다 — 셋 다 `0.3.2`에 이미 있던 컴포넌트를 소비했을 뿐이다.

## `stable` 판정의 근거 — Phase 1과 다른 사다리를 밟았다

Phase 1의 사다리는 `preview` → 앱 착지 → `stable`(story 16)이었다. Phase 2는 그 사다리를 다섯 개 전부에서 완주했다 — #333의 첫 통과(2026-09-11)에서는 착지 증거가 EmptyState 하나뿐이라 나머지 넷을 `preview`로 남겼고, 그 판단이 맵을 닫지 못하게 했다. 이번 통과가 나머지 넷의 착지(#353·#354·#355)를 기다려 같은 사다리를 마저 밟았다.

## 별도 문서 사이트 — 세우지 않는다 (변경 없음)

ADR-0023 §9이 물은 질문의 답은 그대로다. 소비처가 invest diary 하나뿐이고 Storybook이 이미 Foundations·MDX·상태 표를 갖고 있어, 별도 사이트는 같은 내용의 두 번째 사본과 유지할 배포 경로만 늘린다. 재판단 계기: 두 번째 소비처, 또는 앱 개발자가 아닌 독자.

## Decisions-so-far (#317에서 옮김, 순서대로)

- **버전 범프는 티켓마다 하지 않는다 — 맵 끝에 #333이 한 번에 올린다** (#322). 예외는 두 번 쓰였다(위 "게시" 절).
- **Badge의 기본 nowrap은 깨는 변경이 아니다** ([#322](https://github.com/flameware/massive-design/issues/322)). → [#340](https://github.com/flameware/massive-design/pull/340) → `bcff781`.
- **`Menu.Group`·`Menu.GroupLabel`이 이메일 줄을 항목 위장에서 벗긴다** ([#320](https://github.com/flameware/massive-design/issues/320)). 세 seam(컴포넌트·게시`0.3.0`·앱)을 한 번에 세웠다. → [#338](https://github.com/flameware/massive-design/pull/338) → `bdc8251`.
- **Skeleton의 `announce`, tokens README가 35를 말한다** ([#321](https://github.com/flameware/massive-design/issues/321)). → [#339](https://github.com/flameware/massive-design/pull/339) → `88bda7a`·`1f71771`.
- **Combobox의 `onFreeformSubmit`** ([#323](https://github.com/flameware/massive-design/issues/323)). → [#341](https://github.com/flameware/massive-design/pull/341) → `24cb477`.
- **warning은 Alert의 축, 새 토큰 없음** ([#324](https://github.com/flameware/massive-design/issues/324)). → [#343](https://github.com/flameware/massive-design/pull/343) → `eb849c1`. 앱 착지 → [#353](https://github.com/flameware/massive-design/issues/353) → flameware/investmentdiary#374 → `b3fe202`.
- **Base UI Progress가 접근성 배선 전부를 이미 낸다** ([#325](https://github.com/flameware/massive-design/issues/325)). → [#344](https://github.com/flameware/massive-design/pull/344) → `88bc6e4`.
- **Empty state는 파트 조립, `role="group"`** ([#326](https://github.com/flameware/massive-design/issues/326)). → [#345](https://github.com/flameware/massive-design/pull/345) → `d8b5562`. 앱 착지·결함 발견 → [#327](https://github.com/flameware/massive-design/issues/327) → [#349](https://github.com/flameware/massive-design/pull/349) → `3d5043f`.
- **뷰포트 애드온·Foundations 표 공유** ([#331](https://github.com/flameware/massive-design/issues/331)). → [#342](https://github.com/flameware/massive-design/pull/342) → `ff2dd9e`.
- **NumberField는 `Field`와 새로 배선하지 않는다** ([#328](https://github.com/flameware/massive-design/issues/328)). → [#346](https://github.com/flameware/massive-design/pull/346) → `6b310de`.
- **Pagination은 파트 조립이 아니라 단일 무상태 계산** ([#329](https://github.com/flameware/massive-design/issues/329)). → [#347](https://github.com/flameware/massive-design/pull/347) → `6676572`.
- **프리셋의 첫 사례 — `AlertDialog`는 파트 하나 잃지 않았다** ([#330](https://github.com/flameware/massive-design/issues/330)). → [#348](https://github.com/flameware/massive-design/pull/348) → `5601dd2`.
- **채택은 Separator에 판단을 요구하지 않았다 — 스피너·구분선 7+6곳 → 0** ([#332](https://github.com/flameware/massive-design/issues/332)). → flameware/investmentdiary#373 → `27081aa`. 축이 부족한 신호(Spinner 32px) → [#351](https://github.com/flameware/massive-design/issues/351)로 분리(열림).
- **Progress·Pagination·NumberField 착지** ([#355](https://github.com/flameware/massive-design/issues/355)). → flameware/investmentdiary#376 → `fb50e1a`. 시세 갱신에는 의도적으로 쓰지 않았다(가짜 진행값 금지).
- **ConfirmDialog 착지 — 프리셋이 삼킨 에러 결함을 드러냈다** ([#354](https://github.com/flameware/massive-design/issues/354)). → flameware/investmentdiary#375 → `1b12e9c`. 46→14곳, 남은 14곳은 경계 판단. 초기 초점 의심 → [#356](https://github.com/flameware/massive-design/issues/356)으로 분리(열림).
- **Alert `tone="warning"` 착지 — 인라인 자리는 Alert가 아니라 Badge·`text-warning`이었다** ([#353](https://github.com/flameware/massive-design/issues/353)). → flameware/investmentdiary#374 → `b3fe202`. 9→0곳, danger 3·warning 3·인라인 3(Badge 1·text-warning 2).

## Phase 3로 내려간 후보 (변경 없음)

ADR-0023 Phase 표의 후보 중 앱에 자리가 0인 것: **Popover·Toast·Radio·Switch·Accordion·Collapsible·Meter·ScrollArea·Stack/Grid·모션 토큰.** 이슈를 여는 조건은 `rules.md` 방법론 절의 셋 중 하나다.

## 이 맵이 넘긴 것 — 아직 열려 있다

- **[#351](https://github.com/flameware/massive-design/issues/351)** — Spinner의 `size` 척도(14·16·18px)가 인라인 전용이고, 앱이 전체 화면 대기 3곳에 `className="size-8"`로 우회한다. `xl`을 더할지, 자리의 문제인지는 별도 판단.
- **[#356](https://github.com/flameware/massive-design/issues/356)** — ConfirmDialog가 확인 버튼에 초기 초점을 준다. `transaction-list.tsx`의 모바일 다건 삭제처럼 피해 범위가 넓은 확인에서 "확인 우선"이 항상 옳은지 재고할 여지.

## What outlives the map

- **재사용 가능한 스크립트가 있으면 재실측은 그 스크립트를 다시 쓴다** — `rules.md` 방법론 절.
- **옵셔널 파트가 n개면 스토리가 밟아야 할 조합도 n개다** — `rules.md` 방법론 절.
- **ConfirmDialog의 프리셋 경계**와 **게시되는 DOM에 테스트 훅을 넣지 않는다** — `rules.md` "무엇이 컴포넌트가 되는가"·방법론 절.
- **축이 있는데 소비처가 우회하면 축이 부족한 신호다** — `rules.md` 축과 이름 공간 절.
- **컴포넌트가 자리에 안 맞으면 DS의 다른 컴포넌트로 간다, 손조립으로 남기지 않는다** — `rules.md`에 새로 추가(#353).
- **결정적 진행 컴포넌트에 가짜 값을 주지 않는다 — 값을 모르면 스피너다** — `rules.md`에 새로 추가(#355).
- **프리셋 착지는 손조립이 숨기던 결함을 드러낸다, 프리셋의 계약이 더 엄격하기 때문이다** — `rules.md`에 새로 추가(#354).
