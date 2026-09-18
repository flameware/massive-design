# 게시 이력

`v*` 태그로 [`publish.yml`](../.github/workflows/publish.yml)이 게시한 버전들. **왜 그 등급인지**를 함께 적는다 — 등급의 잣대는 언제나 "공개 API 형태가 바뀌는가"이고, 체감의 크기가 아니다.

최신 버전만 [`AGENTS.md`](../AGENTS.md)에 한 줄로 남는다. 새 게시는 이 문서 맨 위에 절을 하나 더한다 — 게시 범프 커밋이 그 일을 같이 한다.

## 0.7.0

게시 전 — `publish.yml` run 링크는 태그를 민 뒤 더한다.

**소비처 화면의 높이가 움직인다.** 올리기 전에 Toggle·ToggleGroup이 있는 화면을 확인한다:

| 무엇 | 전 | 후 |
| --- | --- | --- |
| ToggleGroup 겉 (기본 `md`) | 42 | 36 |
| ToggleGroup 겉 `sm` · `lg` (새 값) | — | 32 · 40 |
| ToggleGroup 안 항목 (md) | 32 | 30 |
| 낱개 Toggle `md` (기본) | 32 | 36 |
| 낱개 Toggle `sm` (필터 칩) | ≈24 | 32 |
| 낱개 Toggle `lg` | 40 | 40 |

한 줄에 서는 컨트롤이 같은 `size` 이름에서 같은 겉 높이(sm 32 · md 36 · lg 40)를 지는 **컨트롤 높이** 척도를 세웠다(#466, [ADR-0027](adr/0027-control-height-is-shared-and-a-group-bears-it-on-its-outside.md)). 필터 줄에서 ToggleGroup(42)이 Select 트리거(36) 옆에 어긋나 서던 것이 계기다. ToggleGroup에 `size` 축(`sm`·`md`·`lg`, 기본 `md`)이 새로 열리고 안의 Toggle은 그룹의 크기를 따른다(항목 자신의 `size`는 무시된다). 낱개 Toggle은 #369가 `md`를 32로 보존했던 판정을 뒤집어 Button과 같은 높이가 됐다. 새 공개 API(`ToggleGroup`의 `size`)를 더하고 기존 props·타입은 그대로 컴파일되므로 minor다 — 등급의 잣대는 API 형태이지 화면이 움직이는 크기가 아니다. Button과 필드 컨트롤(Input·Select·Combobox·NumberField)은 이미 척도였으므로 바뀌지 않는다.

## 0.6.4

`publish.yml` [run 35211472740](https://github.com/flameware/massive-design/actions/runs/35211472740)

소비처 화면의 입력 대부분이 `bg.inset`(중립 램프 step 3 `#eeeeee`)을 쉬는 면으로 써서 쓸 수 있는 컨트롤이 무력화처럼 보이던 것을, 입력 계열의 쉬는 면을 `bg.surface`로 옮기고 회색은 무력화된 입력에만 남기는 것으로 고쳤다(#463). `fieldControlBase` 한 곳이 입력 다섯(Input·Textarea·Select 트리거·Combobox 입력·NumberField 그룹)을 덮고, ToggleGroup 루트와 NumberField의 ± 버튼이 같은 판정을 받았다 — 묶음과 층을 나르고 있던 것은 면이 아니라 이미 테두리였다(`border.field`가 회색 면 위 1.71:1에서 흰 면 위 1.95:1로 세진다). 토큰 값·semantic 매핑·램프·대비 게이트 표가 하나도 바뀌지 않고 props·타입·서브패스도 그대로라 patch다. 면↔면은 어떤 게이트도 재지 않으므로(`contrast.mjs`가 명시적으로 제외한다) `packages/ui/test/field-surface.test.mjs`가 이 결정을 문자열로 고정한다.

## 0.6.3

`publish.yml` [run 35204849600](https://github.com/flameware/massive-design/actions/runs/35204849600)

Badge의 `tone="muted"`가 중립 계열에서 유일하게 "면으로 읽혀야" 하는 단계(`bg.neutral.muted`, `FILL_GATE` 1.35가 지킨다)를 골라 가장 조용해야 할 톤이 `neutral`보다 진한 배지로 그려지던 것을, 이름이 약속한 대로 `neutral`과 같은 조용한 면 위 옅은 글자(`bg-neutral-soft` × `fg.muted`)로 다시 정의했다(#434, #458). `['fg.muted', 'bg.neutral.soft']`는 `TEXT_PAIRS`에 이미 있는 쌍이라(실측 5.34:1 라이트 · 5.15:1 다크) 새 토큰도 게이트 표 수정도 없고, props·타입·서브패스·`tone` 일곱 값이 그대로라 patch다.

## 0.6.2

`publish.yml` [run 34884309684](https://github.com/flameware/massive-design/actions/runs/34884309684)

앱 개발자가 공개 API를 잘못 썼을 때 받는 한국어 에러 메시지를 해요체로 바꾸고 원인·수치·해결 방법 순서로 다시 썼다(#425, #433). 함수 이름·토큰 조합·대비 수치는 그대로 남고 API 형태는 손대지 않아 patch다.

## 0.6.1

`publish.yml` [run 34857092307](https://github.com/flameware/massive-design/actions/runs/34857092307)

토스트 닫기 버튼의 포지셔닝 기준(`relative`)이 카드 루트가 아니라 콘텐츠 영역에 있어 X가 제목 아래로 처지던 것을 루트로 옮겼다(#419, #420).

## 0.6.0

`publish.yml` [run 34787069584](https://github.com/flameware/massive-design/actions/runs/34787069584)

소비처가 brand 키 컬러 하나로 자기 브랜드를 입히는 `@flameware/tokens/ramp`의 `createBrandOverride`(#398), [ADR-0026](adr/0026-baseline-form-controls-need-no-consumer-evidence.md)이 연 기본 폼 컨트롤 Switch·Slider·Radio/RadioGroup(#399·#400·#401), 근거 없던 `"use client"`를 걷어 Icon을 서버 컴포넌트로 옮긴 것(#412), 온보딩 가이드([`docs/consumer-onboarding.md`](consumer-onboarding.md), #403)까지 새 서브패스·새 API만 더하고 기존 계약은 그대로라 minor로 올랐다. brand 키를 주지 않으면 기존 brand(`#0f5fed`) 그대로라 기존 소비처 화면은 바뀌지 않는다(`v0.5.2..v0.6.0`의 `dist/tokens.css` diff가 비어 있다).

`0.6.0`보다 앞선 버전들은 이 문서가 만들어질 때 AGENTS.md에 남아 있지 않았다(#461·#462가 걷었다) — 태그와 `publish.yml`의 run 목록이 정본이다.
