# Phase 3 — 2세대 Base UI 맵 완료 기록

맵 [#365](https://github.com/flameware/massive-design/issues/365) · 종결 [#378](https://github.com/flameware/massive-design/issues/378) · 결정은 [ADR-0023](../adr/0023-second-generation-base-ui.md) §11 · 규칙은 [`../agents/rules.md`](../agents/rules.md) · 선행 [`phase-2-base-ui-map.md`](phase-2-base-ui-map.md)

## Problem Statement (#365에서 그대로 옮김)

Phase 2가 닫혔다. 앱은 `@flameware/ui@0.3.4`로 돌고, #317이 센 손조립 여덟 자리는 여섯이 0, 둘은 판단으로 남았다. 그래서 Phase 3를 "ADR-0023이 남긴 후보 목록"으로 열면 열 것이 없었다 — 2026-09-12 실측(invest diary `main` `5b72c0b`, `@flameware/ui@0.3.4`)이 후보(Popover·Toast·Radio·Switch·Accordion·Collapsible·Meter·ScrollArea·모션 토큰·NavigationMenu 등 스물한 개) 전부에서 앱 자리 **0**을 보였다(DatePicker만 네이티브 `type="date"` 4곳이 결함 없이 돈다).

대신 같은 실측이 **DS 컴포넌트에 얹힌 `className` 234자리 · 436토큰**을 셌고, 그중 **103토큰이 축의 결손**이었다 — 소비처가 DS에 이름이 없는 것을 손으로 그리고 있었다:

| 자리 | 토큰 | DS의 당시 모양 | 소비처가 얹던 것 |
| --- | --- | --- | --- |
| `Table.Head`·`Table.Cell` | 28 | `text-left` 하드코딩, 정렬 축 없음. 숫자 서체 규약 없음 | `text-right` 18 · `text-center` 4 · `font-mono` 6 |
| `Text`·`Heading` | 26 | `size` 아홉 개뿐. `tone` 없음, `weight`는 `font-semibold` 하드코딩 | `text-muted` 10 · `text-danger` 4 · `text-default` 3 · `font-bold` 3 · `text-center` 3 · 기타 3 |
| `Badge` | 23 | `tone` 여섯 값 전부 채운 배지. 조용한 값이 없다 | `text-muted` 12 · `font-normal` 2 · `text-xs` 9(무효) |
| `Spinner` | 6 | `size` 넷뿐. `tone` 없음 | `text-accent` 3 · `text-muted` 3 |
| `Toggle` | 5 | 크기 고정(`h-8 px-2.5 text-sm`). `size` 축 자체가 없다 | `h-auto px-2 py-1 text-xs` 5자리 |

나머지 333토큰(치수 151·레이아웃 63·여백 55 등)은 소비처의 몫으로 판정됐다(레이아웃·여백은 #375·#376이 재확인, 아래).

## Solution (#365에서 그대로 옮김)

Phase 3의 범위는 둘이었다.

1. **축 결손 103토큰을 닫는다** — 새 컴포넌트가 아니라 이미 `stable`인 다섯 컴포넌트(Table·Text/Heading·Badge·Spinner·Toggle)에 축을 더한다. 각 축의 기본값은 게시된 인스턴스를 보존하는 값이고([#139](https://github.com/flameware/massive-design/issues/139)), 축 이름은 카탈로그에서 이미 다른 뜻이면 안 된다([ADR-0008](../adr/0008-axis-and-value-name-spaces.md)).
2. **자리 0인 후보 넷을 선제로 세운다** — Toast·Popover·Switch·Stack/Grid. 이것은 맵이 스스로 낸 예외였다: 넷 다 앱 자리가 0이라 "자리가 있는 것만 만든다"는 기준을 만족하지 않으므로, 넷은 *만드는 것*이 아니라 **자리를 만들어 착지시키는 것**까지가 티켓이었다 — 착지 없는 컴포넌트는 `preview`에서 내려오지 못한다.

완료 조건은 셋이었다: **103토큰이 재실측에서 사라지는 것, 선제 넷이 앱에 착지해 `stable`이 되는 것, 앱이 `@flameware/ui`의 새 minor로 도는 것.**

## Decisions-so-far (#365에서 그대로 옮김, 순서대로)

- **선제 구축 넷의 착지는 컴포넌트 티켓 안이 아니라 착지 하나로 모으는 티켓([#377](https://github.com/flameware/massive-design/issues/377))이 진다** — 그 티켓을 넷보다 먼저 세웠다. #322의 "범프는 맵 끝에 한 번" 규칙과 #317이 배운 것("착지 티켓을 처음부터 같이 열어야 한다")을 동시에 지키는 모양이다. 같은 근거로 축 결손 다섯의 착지도 [#370](https://github.com/flameware/massive-design/issues/370) 하나가 지되 #368·#369와 같이 열려 있었다. 첫 슬라이스([#367](https://github.com/flameware/massive-design/issues/367))만은 컴포넌트·게시·앱 착지를 한 티켓에 뒀다(#320이 증명한 모양, 맵의 시작에서만 필요).
- **#367의 정렬 축 이름은 `align`이 아니라 `textAlign`이다** — code-review가 잡았다: `align`은 카탈로그에서 이미 다른 뜻이다(`Menu.Popup`·`Combobox`가 Base UI `Positioner`의 "떠 있는 표면이 트리거의 어느 모서리에 붙는가"로 쓴다, `menu.tsx:44`·`combobox.tsx:126`). [ADR-0008](../adr/0008-axis-and-value-name-spaces.md)이 정확히 이 충돌 때문에 `align`을 한 번 버린 전례이고, `rules.md` "축 이름은 카탈로그에서 이미 다른 뜻을 갖지 않는다"가 스펙 문서의 `align` 선택보다 우선한다고 판정했다. 값·기본값(`start`)·적용 범위는 스펙 그대로다 — 바뀐 것은 이름 하나뿐이다.
- **선제 구축 넷 중 둘(Popover·Switch)이 자리를 지명하지 못해 맵이 자기 예외를 철회했다**(#372). Popover는 클릭으로 여닫히는, Menu·Tooltip·Combobox·Dialog·Drawer·Select 어디에도 속하지 않는 떠 있는 표면이 0곳. Switch는 네이티브 `type="radio"`/`role="switch"` 손조립이 0건이고, 유일한 즉시-이진 자리(`ThemeToggle`)는 이미 ADR-0017 근거가 있는 의도적 선택이라 잘못 고른 모양이 아니다. #373·#374 둘 다 컴포넌트를 만들지 않고 닫혔다.
- **#375의 판정: 레이아웃은 간격 척도만 DS다 — Stack·Grid 컴포넌트는 열지 않는다.** 재실측(레이아웃 63·여백 45)에서 최대 단일 조합(`flex-1` 19자리)은 부모가 소유한 flex 컨테이너의 성질이라 컴포넌트 하나가 이름 붙일 층위가 아니고, 반복 조합(`space-y-4`·`space-y-6` 등)은 rules.md의 "3자리 이상" 문턱은 넘지만 전부 `--spacing` 토큰의 정수 배수만 쓰고 임의 간격 값이 0건이라 `Stack`이라는 이름이 막을 위반이 없다. 간격 척도 자체는 Phase 1부터 이미 토큰(`--spacing`)이라 새로 할 일이 없다. #376은 컴포넌트를 만들지 않고 ADR-0023 §11 갱신으로 닫혔다.

## 재실측 — 103토큰, 자리별 전/후 (2026-09-12, `investmentdiary` `main` `6d8d45c`, `@flameware/ui@0.5.0`)

`scripts/phase3-bypass.sh`·`scripts/phase3-count.sh`를 **그대로**(rules.md 방법론: 재실측은 그 세대의 스크립트를 다시 쓴다) 재실행했다.

| 자리 | #365 원 실측 | 종결 실측 | 판정 |
| --- | --- | --- | --- |
| `Table.Head`·`Table.Cell` (align 22 + numeric 6) | 28 | **0** | #367 — `textAlign`·`numeric`으로 완전히 닫힘 |
| `Text`·`Heading` (tone·weight·기타) | 26 | **3** | #368이 연 `tone`·`weight`가 전부 흡수했다. 남은 3은 **정렬**(`text-center` — Heading 2·Text 1, `signup`·`login` 페이지)로, 애초에 이 축(`tone`/`weight`)의 범위가 아니었다 — #370이 이미 "티켓 범위 밖"으로 판정한 자리다. `align`/`textAlign` 축은 Table에만 열렸고 Text/Heading에 열 계획이 #365에 없었다(정렬은 문단 배치이지 톤·굵기가 아니다). |
| `Badge` | 23 | **2** | `font-normal` 2자리(`stock-detail-view.tsx:350`·`history-container.tsx:158`). `tone.muted`·무효 `text-xs` 9는 #370이 전부 닫았다. |
| `Spinner` | 6 | **0** | #369 — `tone`이 전부 흡수 |
| `Toggle` | 5 | **0** | #369 — `size="sm"`이 전부 흡수 |
| **합계** | **103** | **5** | |

후보 자리 표(`phase3-count.sh`)는 처음부터 전부 0이었고 지금도 그렇다 — `popover(hand)` raw hits=1·`command palette` raw hits=2는 회고 주석뿐(실사용 0), Toast만 착지 후 `toast/snackbar files=6 hits=38`로 이동했다(자리 있음 → 컴포넌트 있음 → 소비됨).

### 0이 아닌 자리 — 판정이지 미완이 아니다

- **`Text`/`Heading`의 `text-center` 3자리** — `tone`·`weight` 축이 답하는 문제가 아니다. 정렬은 문단·제목의 배치 축(어느 값으로도 톤·굵기와 독립)이고, #365 스펙 어디에도 Text/Heading에 정렬 축을 열라는 AC가 없었다 — Table의 `align`(→`textAlign`)만 스펙 대상이었다. `Card.Body`의 `text-center` 1자리를 더하면 align 계열 재실측 합계가 4로, `phase3-bypass.sh`의 "정렬" 카운트(4)와 정확히 일치한다. **문**: Text/Heading에 정렬 축 수요가 이 하나의 화면(로그인·회원가입 타이틀) 밖으로 반복되면(3자리 이상, 같은 조합) 그때 연다.
- **`Badge`의 `font-normal` 2자리** — #370이 이미 이 티켓 안에서 판정했다: Badge는 `weight` 축을 얻지 않았다(#365가 연 것은 `tone`의 새 값 `muted` 하나뿐). `rules.md` "adding a dimension needs measured demand"의 문턱(3자리)에 2자리는 못 미친다. **문**: 셋째 자리가 나오면 `weight` 축을 여는 근거가 된다.

## `stable` 승격

승격의 근거는 CI green이 아니라 **실제 소비**다([#349](https://github.com/flameware/massive-design/issues/349)가 세운 기준). 선제 구축 넷 중 만들어진 것은 Toast 하나뿐이다(Popover·Switch·Stack/Grid는 컴포넌트를 만들지 않고 닫혔다 — 아래 "예외 장치" 절).

| 컴포넌트 | 착지 | 증거 | 승격 |
| --- | --- | --- | --- |
| Toast | #371 → #377 | 앱 5자리(루트 `Toast.Provider`/`Viewport` + `data-management-modal.tsx`·`edit-transaction-dialog.tsx`·`add-transaction-dialog.tsx`·`change-password-dialog.tsx`), `phase3-count.sh`가 `toast files=6 hits=38`로 확인 | **`preview` → `stable`**(이 티켓, `Toast.stories.tsx`) |

Popover·Switch·Stack/Grid는 애초에 컴포넌트가 서지 않아 `preview`조차 없다 — 승격 대상 자체가 없다.

## since 확인 — 축이 열린 다섯

`git log -p`로 확인: `Table`·`Text`(Heading 포함)·`Badge`·`Spinner`·`Toggle` 다섯 스토리 모두 `parameters.ds.since`가 **`"0.2.0"`**(Phase 3 이전 값) 그대로다 — 축이 이 세대에 새로 자란 것이지 컴포넌트가 새로 선 것이 아니므로 건드리지 않는다는 규칙(#365 User Story 32)이 지켜졌다. Toast는 `since: "0.5.0"`(#371에서 처음 선 버전) 그대로다.

## 예외 장치의 판정 — 착지를 못 박는 장치가 작동했는가

맵이 자기 기준에 낸 예외(자리 0인 넷을 선제 구축)에는 스스로 건 방어가 있었다 — "자리 없는 컴포넌트를 만드는 것이 1세대의 실수"라는 장치를 각 티켓 앞에 세워 뒀다(#372·#375 그릴링). 결과는 **장치가 작동했다**: 넷 중

- **셋(Popover·Switch·Stack/Grid)은 만들지 않는 것으로 걸러졌다.** Popover·Switch는 착지 자리 지명 실패(#372, 재실측 결과 0), Stack/Grid는 판정 자체가 "소비처의 몫"(#375·#376)으로 나온, 서로 다른 두 모양의 실패였지만 둘 다 이 맵이 미리 예상해 둔 결과다.
- **하나(Toast)만 만들어져 착지했다**(#371 → #377, 다섯 자리).

1세대의 실수(소비처 없는 51개 컴포넌트)가 이 세대에서 반복되지 않았다 — 예외를 낸 순간 예외의 실패 조건까지 같이 정의해 둔 것이 그 이유다. 넷 중 셋을 만들지 않은 것은 계획의 미달이 아니라 장치의 정상 작동이다.

## 게시 이력

| 버전 | 종류 | 무엇 | 상태 |
| --- | --- | --- | --- |
| `0.4.0` | minor | Table `textAlign`·`numeric`(#367) | **첫 태그(`e018050`) 게시 실패** — `bun install --frozen-lockfile`이 `@flameware/tokens@^0.3.0 failed to resolve`(404)로 죽었다. 원인: `packages/tokens`를 0.4.0으로 올리면서 `packages/ui/package.json`의 내부 의존 범위(`^0.3.0`)를 같이 올리지 않아 ui가 요구하는 범위가 실제 tokens 버전을 벗어났다. 태그를 고친 커밋으로 재조준해 재게시 성공(run 34672742040). |
| `0.4.1` | patch | Text/Heading `tone`·`weight`, Badge `tone.muted`, Spinner `tone`, Toggle `size`(#368·#369 누적, #370이 게시) | 성공(run 34674875895). `#367 게시 함정`을 반영해 `dependencies["@flameware/tokens"]`를 같은 minor로 함께 올리는 절차가 이때부터 정착 |
| `0.5.0` | minor | Toast(`./toast` 서브패스 신설, #371, #377이 게시) | 성공(run 34677552476) |

앱(invest diary)은 `@flameware/ui@0.5.0`·`@flameware/tokens@0.5.0`으로 돈다(PR #387·#388·#389). **이 티켓(#378)은 status 메타만 바꾸므로 버전을 올리지 않는다** — Phase 2 선례(PR #357, stable 승격 다섯 건에 버전 범프 없음)와 같은 판단이다.

## 스펙에서 바뀐 판정

- **`align` → `textAlign`**(#367) — 카탈로그에서 `align`이 이미 Base UI Positioner의 배치 방향을 뜻해 ADR-0008 위반. 값·기본값·범위는 스펙 그대로.
- **`default` → `neutral`**(#368) — Badge·Alert가 이미 이 자리를 `neutral`이라 부른다. 같은 축이 컴포넌트마다 다른 어휘를 가지면 안 된다는 티켓의 목적 자체가 `default`라는 동의어를 막는다.
- **Badge `muted`의 면**(#368) — `bg-neutral-soft` 위 `text-muted`가 아니라 `bg-neutral-muted`(#337이 이미 열어 둔 토큰) + `fg.default`. 실측 12자리 전부가 `tone="outline"` + `text-muted`(테두리, 투명 배경) 모양이었고, 스펙이 가정한 "soft 면 위 muted 글자"와 실제 앱의 모양이 달랐다 — 축이 열린 목적(조용한 채움)과 더 맞는 면으로 갔다.
- **Toggle `md` 32px**(#369) — 이름은 `Button`과 같은 공간(`sm`·`md`·`lg`)이지만 치수는 `Button.md`(36px)가 아니라 `Button.sm`과 같은 높이(32px, `h-8`)로 갔다 — 게시 인스턴스 보존(rules.md 승계 규칙)이 이름 대칭보다 우선했다.

## 별도 문서 사이트 — 재판단, 세우지 않는다 (변경 없음)

ADR-0023 §9의 답이 그대로 유지된다. 소비처는 여전히 invest diary 하나뿐이고, Phase 3 전체에서 앱을 만드는 사람이 아닌 독자가 새로 생긴 증거는 없다 — Storybook이 이미 Foundations·MDX·상태 표를 갖고 있다. **재판단 계기는 그대로다**: 둘째 소비처, 또는 앱 개발자가 아닌 독자.

## 넘기는 것

Phase 3 하위 이슈(#366~#377)는 전부 닫혔다(`gh issue list --state open`이 이 티켓(#378)과 맵(#365) 둘만 보인다 — 둘 다 이 PR 머지 뒤 닫는다). 새로 여는 이슈는 없다 — 위 "0이 아닌 자리" 절의 둘(Text/Heading 정렬 3자리, Badge `weight` 2자리)은 각각 재판단 계기(문)가 이미 서술돼 있고, `rules.md` 방법론 절의 "이슈는 셋 중 하나가 막혔을 때만 연다"는 규칙대로 지금은 그 문턱에 못 미쳐 이슈를 열지 않는다.

## What outlives the map

- **`textAlign`처럼, 축 이름은 스펙 문서에 적혀 있어도 카탈로그 전체와 다시 대조한다** — `rules.md` 축과 이름 공간 절.
- **이름을 주는 것이 규율을 더하는가 시험** — 반복이 문턱(3자리)을 수로 넘어도 이미 토큰 척도 안에서만 벌어지고 있으면 이름을 열 근거가 없다(Stack/Grid, #375).
- **이미 토큰인 것을 컴포넌트로 재포장하지 않는다** — 간격 척도(`--spacing`)처럼 이미 강제되는 값 집합 위에 이름 하나를 얹어도 소비처가 새로 지킬 규율이 생기지 않는다(Stack/Grid, #375).
- **버전 범프 시 `packages/ui`의 `@flameware/tokens` 의존 범위를 같은 minor로 함께 올린다** — 안 올리면 `bun install --frozen-lockfile`이 워크스페이스를 못 찾아 publish가 404로 죽는다(#367의 게시 실패가 원인).
- **컴파운드 객체 export(`{ Provider, Viewport }`)를 Next.js 서버 컴포넌트에서 직접 destructure하지 않는다** — RSC의 클라이언트 레퍼런스 치환이 객체 전체를 감싸 프로퍼티 접근이 undefined가 된다. DS API는 컴파운드 객체 그대로 두고, 서버 컴포넌트에서 쓸 때는 앱 쪽 클라이언트 래퍼를 한 번 거친다(Toast, #377).
