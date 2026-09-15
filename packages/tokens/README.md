# @flameware/tokens

massive-design의 색과 크기 토큰이에요. 한 색에서 만든 12단계 색 배열(램프)로
CSS 한 장을 내고, semantic 토큰 타입을 함께 제공해요.

DS를 앱에 처음 붙인다면 [온보딩 가이드](../../docs/consumer-onboarding.md)를 먼저
읽으세요. 환경 변수, CSS 순서, 다크 모드, 브랜드 색, `@theme inline` 이름 충돌을
한 장에 담았어요. 이 문서는 설치 방법과 토큰 API를 다뤄요.

## 설치

GitHub Packages에 있어서 `.npmrc`에 레지스트리를 한 줄 적어야 해요.

```
# .npmrc
@flameware:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${FLAMEWARE_PACKAGES_TOKEN}
```

```sh
bun add @flameware/tokens
```

## CSS 불러오기

```css
/* app/globals.css */
@import "tailwindcss";
@import "@flameware/tokens/tokens.css";
```

Tailwind가 먼저, 토큰이 나중이에요. 이 파일은 변수만 내지 않고 규칙도 내요.
`body`의 배경색과 글자색, `*`의 테두리색과 outline 색이 여기서 나와요. 라이트
모드와 다크 모드는 루트의 `dark` 클래스 하나로 갈려요.

`@flameware/ui`를 함께 쓴다면 `@flameware/ui/styles.css` 한 줄이 이 파일까지
끌고 오니 따로 적지 않아도 돼요.

## 색 이름

색 이름은 역할이 접두사예요. `bg.accent.solid`는 `bg-accent-solid`, `fg.default`는
`text-default`, `border.default`는 `border-default`로 써요. `bg`, `fg`, `border`
아래 semantic 색은 지금 41개이고, 그 41개가 빠짐없이 유틸리티로 열려 있어요. 전체 이름과 지금 모드의
실제 값은 Storybook의 **Foundations/색** 챕터에서 볼 수 있어요.

semantic 색 중 유틸리티가 없는 것은 `state.layer` 하나예요. 이 값은 칠하는 색이
아니라 `@flameware/ui`의 `state.css`가 hover와 pressed를 합성할 때 읽는 입력이라
`@theme`에 등록하지 않아요.

팔레트 변수(`--ds-palette-*`)는 devtools에서 값을 따라가 볼 때 쓰는 것이에요.
직접 쓰지 마세요. 라이트와 다크 전환이 semantic 층에서만 일어나서, 팔레트를 직접
쓰면 모드 전환이 동작하지 않아요.

### 배경색 고르기

무언가를 그 위에 올리는 색이에요.

| 이름 | 역할 | light | dark |
|---|---|---|---|
| `bg-canvas` | 페이지 바닥 | neutral 2 | neutral 1 |
| `bg-surface` | 올라온 면, 카드와 패널 | neutral 1 | neutral 2 |
| `bg-subtle` | 2차 그룹핑, 테이블 헤더와 hover와 Skeleton | neutral 3 | neutral 3 |
| `bg-inset` | 파묻힌 면, 코드 블록과 입력 안쪽 | neutral 3 | neutral 3 |
| `bg-overlay` | 떠 있는 면, 다이얼로그와 팝오버 | neutral 1 | neutral 3 |

`bg-subtle`과 `bg-inset`은 같은 값을 가리키는 두 이름이에요. 다크 모드에서는
`bg-overlay`까지 같은 값이에요. DS는 `bg-subtle`보다 더 파인 배경을 제공하지
않아서, 이 셋 사이를 오가는 변경은 화면을 바꾸지 않아요. 이름을 나눠 둔 것은 앱이
어떤 의도였는지 코드에 적어 두기 위해서예요. 배경을 더 나누고 싶으면 색이 아니라
테두리와 그림자와 여백으로 나눠요.

### 채움색 고르기

배경 위에 얹는 덩어리 색이에요. 패밀리마다 세 단계가 있어요.

| 이름 | 역할 | light | dark | 그 위 전경 |
|---|---|---|---|---|
| `bg-<family>-soft` | 조용한 틴트, 배너와 배지 배경과 잔여 트랙 | step 3 | step 3 | `text-<family>` 또는 `text-default` |
| `bg-<family>-muted` | 면으로 읽혀야 하는 채움, 미터의 칸 | step 7 | step 6 | `text-default` 고정 |
| `bg-<family>-solid` | 강조 덩어리, primary 버튼과 destructive | step 9 | step 9 | `text-on-solid` |

`*-soft`는 조용한 배경(`bg-subtle`, `bg-inset`) 위에서 보이지 않아요. 대비가
1.00:1이에요. 채움색의 step 3과 배경색의 neutral 3이 같은 밝기 단계라서 그래요.
결함이 아니라 `soft`의 정의예요. 배경과 구별되지 않을 만큼 조용한 틴트라는 뜻이에요.

칸이 보여야 하면 `muted`를 쓰세요. 배경에 대해 1.35:1 이상을 보장하고, 그 위 전경은
`text-default`로 고정이에요. 유채색 전경은 이 단계 위에서 WCAG AA 기준을 넘지
못해요. 단계가 모드마다 다른 것(라이트 7, 다크 6)도 의도예요. 한 단계로 맞추면 한쪽이
하한 아래로 내려가요.

## 새 색 패밀리 만들기

DS는 `brand`, `neutral`, `danger`, `success`, `warning` 다섯 패밀리를 가져요.
수익과 손실 색처럼 여기 없는 색이 필요하면 `./ramp` 서브패스의 `createRamp`로
직접 만들어요. DS의 다섯 패밀리를 만든 것과 같은 생성기예요.

```ts
import { createRamp, rampToCssVariables, contrastRatio } from "@flameware/tokens/ramp"

const profit = createRamp("profit", { key: "#db2931" }) // 상승을 뜻하는 빨강
profit.light[8].hex   // '#db2931', 넘긴 색이 9단계에 그대로 들어가요
profit.issues         // [], 비어 있으면 lint 규칙군 A를 통과해요

rampToCssVariables(profit) // ':root { --profit-1: …; } .dark { --profit-1: …; }'
contrastRatio(profit.light[9].hex, '#ffffff') // WCAG 2 대비비, DS 검사와 같은 공식이에요
```

`createRamp`는 DS 다섯 패밀리와 같은 알고리즘, 같은 기본 파라미터를 써요. 같은 대비
경향을 물려받지만 대비 검사를 대신 통과시켜 주지는 않아요. 확인은 `contrastRatio`로
직접 해요. Storybook 문서는
[Foundations/자기 패밀리 만들기](../../apps/storybook/stories/foundations/RampGenerator.mdx)에
있어요.

`./ramp`를 import하지 않는 앱은 이 API가 쓰는 `culori`를 번들에 넣지 않아요. 번들
무게는 서브패스 단위로 갈려요([ADR-0017](https://github.com/flameware/massive-design/blob/main/docs/adr/0017-dependency-weight-is-a-floor-cost.md)).

## 브랜드 색으로 DS 강조색 바꾸기

`createRamp`가 DS에 없는 새 패밀리를 만든다면, `createBrandOverride`는 DS가 이미
가진 `brand` 패밀리를 앱의 브랜드 색으로 바꿔요. 버튼 primary, 링크, 포커스 링,
강조 텍스트처럼 `accent`를 쓰는 곳이 모두 따라와요.

```ts
import { createBrandOverride } from "@flameware/tokens/ramp"

const css = createBrandOverride("oklch(0.52 0.11 155)") // 녹색 브랜드
writeFileSync("app/brand.css", css)
```

```css
/* app/globals.css */
@import "tailwindcss";
@import "@flameware/tokens/tokens.css";
@import "./brand.css"; /* 반드시 tokens.css 다음에 둬요 */
```

같은 이름의 변수는 나중에 선언한 값이 적용되므로, `brand.css`가 `tokens.css`보다
앞에 오면 색이 바뀌지 않아요. 설치와 CSS 순서를 포함한 사용법은
[온보딩 가이드 §5](../../docs/consumer-onboarding.md#5-브랜드-색-입히기)에 있어요.

### 브랜드 색은 하나만 받아요

라이트 모드용과 다크 모드용 색을 따로 넘길 수는 없어요. 넘긴 색 하나에서 두 모드의
램프가 각각 만들어져요. 이유는 아래 [배경](#배경)에 있어요.

### 너무 밝은 색은 에러가 나요

`createBrandOverride`는 경고를 출력하고 넘어가지 않고 에러를 내요. DS가 자기
`accent` 조합을 검사할 때와 같은 조합, 같은 판정 공식으로 새 팔레트를 다시 재요.
기준에 못 미치는 조합이 있으면 어느 조합이 몇 대 몇으로 떨어졌는지 에러 메시지에
담아요.

```ts
try {
  createBrandOverride("#eab308") // 너무 밝아서 흰 글자와 4.5:1을 못 넘어요
} catch (e) {
  // createBrandOverride: 브랜드 색의 대비가 기준에 못 미쳐서 글자와 테두리가 잘 보이지 않아요.
  //   light fg.accent ↔ bg.canvas 대비 2.81, 기준 4.5
  //   …
  //   light fg.on-solid ↔ bg.accent.solid 대비 1.92, 기준 4.5
  //   …
  // 브랜드 색을 조금 어둡게 조정한 뒤 다시 실행해 보세요.
  console.error(e.message)
}
```

| 검사하는 조합 | 기준 |
| --- | --- |
| 강조 배경(`bg.accent.solid`) 위의 흰 글자(`fg.on-solid`) | 4.5:1 |
| 강조 텍스트와 링크(`fg.accent`, `fg.link`)와 그 아래 배경 | 4.5:1 |
| 강조 테두리와 포커스 링(`border.accent`, `border.focus`)과 배경 | 3:1 |
| 옅은 강조 배경(`bg.accent.muted`)과 배경 | 1.35:1 |

브랜드 색을 아예 넘기지 않으면 DS 기본 브랜드 색(`#0f5fed`)이 그대로 쓰여요. 기존
화면은 바뀌지 않아요.

### `createRamp`와 무엇이 다른가요

| | `createRamp` | `createBrandOverride` |
| --- | --- | --- |
| 하는 일 | 앱이 소유하는 새 패밀리를 만들어요 | DS의 `brand` 패밀리를 바꿔요 |
| 변수 이름 | `--{prefix}-{step}` (앱 소유) | `--ds-palette-brand-{mode}-{step}` (DS 이름 공간) |
| 대비 검사 | 하지 않아요. `contrastRatio`로 직접 확인해요 | 자동으로 하고, 기준에 못 미치면 에러가 나요 |
| 받는 색 | hex(`#rrggbb`) | culori가 읽는 CSS 색 표기(`oklch(...)` 포함) |

## 차트 계열색 정하기

DS는 차트 본체를 제공하지 않아요. 차트 라이브러리와 컴포넌트는 앱이 골라요. 대신
차트의 계열색을 브랜드 색에서 뽑는 규칙을 DS가 줘요. 여기서 계열은 차트가 한 화면에
함께 그리는 데이터 묶음이에요.

| 계열 | 라이트 | 다크 |
| --- | --- | --- |
| 계열 1 | brand **9** (= `bg-accent-solid`) | brand **9** |
| 계열 2 | brand **7** | brand **6** |

```css
:root {
  --chart-1: var(--ds-bg-accent-solid);
  --chart-2: var(--ds-palette-brand-light-7);
}

.dark {
  --chart-2: var(--ds-palette-brand-dark-6);
}
```

계열 2는 언제나 계열 1보다 배경 쪽에 가까운 색이에요. 부차적인 계열이 주된 계열보다
튀면 의미가 뒤집혀요. 라이트에서 2단, 다크에서 3단으로 내려가는 차이는 램프의 모양
때문이에요. 다크 램프는 9단계 아래가 더 눌려 있어서, 같은 2단으로는 계열 1과 갈리지
않아요.

### 여기서만 팔레트 변수를 직접 써요

위에서 팔레트 변수를 직접 쓰지 말라고 한 것은 모드 전환이 죽는 경우를 막기
위해서예요. 이 절은 `:root`와 `.dark`에 라이트와 다크를 각각 못박으므로 그 함정에
걸리지 않아요. `--ds-palette-brand-light-7`만 쓰고 `.dark` 줄을 빠뜨리면 그때는
모드 전환이 죽어요.

### 지켜야 하는 대비 기준

| 조합 | 하한 |
| --- | --- |
| 계열 ↔ `bg-surface` | **1.5:1** |
| 계열 1 ↔ 계열 2 | **1.9:1** |

`bg-surface`(라이트 `#fdfdfd` · 다크 `#151515`) 기준으로 잰 실제 값이에요. 마지막 두
줄은 이 규칙이 나오기 전에 눈으로 고른 `color-mix(… 42%, …)`의 값이에요.

| | 계열 2 | 계열 2 ↔ 배경 | 계열 1 ↔ 계열 2 |
| --- | --- | --- | --- |
| 규칙 · 라이트 | `#97b8f2` | 1.97 | 2.69 |
| 규칙 · 다크 | `#073891` | 1.72 | 1.96 |
| 42% · 라이트 | 없음 | 1.85 | 2.87 |
| 42% · 다크 | 없음 | 1.52 | 2.21 |

두 기준을 정한 근거는 아래 [배경](#배경)에 있어요.

### 계열은 둘까지예요

셋 이상은 이 규칙이 답하지 않아요. 지금까지 필요했던 구분(미국과 한국, 개별주와 ETF,
매수와 매도)은 모두 한 전체를 둘로 나눈 것이라 둘째가 대조색이 아니라 같은 색의 옅은
단계여야 했어요. 서로 경쟁하는 범주를 셋 이상 나눠야 한다면 그것은 단계를 고르는
문제가 아니라 정성 팔레트 문제이고, DS는 아직 답을 제공하지 않아요.

### 직접 만든 패밀리에서 뽑을 때

같은 단계 규칙(9, 라이트 7, 다크 6)을 `createRamp`로 만든 패밀리에도 쓸 수 있지만
기준을 넘는다고 보장하지는 않아요. 기준 색이 밝으면 무너져요. DS의
`warning`(`#eab308`)으로 재면 라이트의 계열 1과 계열 2 대비가 **1.19**예요. 램프의
옅은 쪽이 기준 색 자신과 밝기가 가깝기 때문이에요. 그래서 확인은 직접 해요.

```ts
import { createRamp, contrastRatio } from "@flameware/tokens/ramp"

const r = createRamp("profit", { key: "#db2931" })
contrastRatio(r.light[6].hex, "#fdfdfd") // 계열 2 ↔ 배경, 1.5 이상
contrastRatio(r.light[8].hex, r.light[6].hex) // 계열 1 ↔ 계열 2, 1.9 이상
```

두 기준을 못 넘으면 그 색에서는 계열 둘을 한 램프로 만들 수 없어요.

## 배경

브랜드 색을 하나만 받는 이유는 램프의 9단계가 라이트와 다크에서 같은 값을 갖기
때문이에요. 넘긴 색은 두 모드의 램프 모두 9단계에 그대로 들어가요. 모드마다 다른
색을 받으면 이 규칙을 지킬 수 없어요. 대비 검사를 `createBrandOverride`에서만
강제하는 이유는 DS 컴포넌트 전체가 이 색을 버튼, 링크, 포커스 링에 쓰기 때문이에요.

차트 계열색의 하한 1.5:1은 DS가 배경 위에서 보인다고 이미 선언한 테두리 색들이 걸쳐
있는 범위의 가운데예요.
`border.default`(라이트 1.49 · 다크 1.31)에서 `border.field`(라이트 1.95 · 다크 1.56)까지가
그 범위예요. 계열색은 테두리보다 면적이 크므로 범위의 아래 끝이 아니라 가운데를 하한으로 잡았어요. 계열 사이의 1.9:1을 WCAG
1.4.11의 3:1로 두지 않은 이유는 계열 2가 가는 방향에 그 값이 없기 때문이에요. 계열 1과
3:1을 넘는 단계는 배경과 1.5:1을 못 넘어요. 라이트는 brand 6이 3.61 · **1.48**이고,
다크는 brand 3이 3.09 · 1.09예요.
그리고 계열색은 누르는 컨트롤이 아니라 의미를 나르는 채움이라 1.4.11의 3:1을 지킬
의무가 없어요.

이 규칙이 나온 경위와 실측 근거는
[#334](https://github.com/flameware/massive-design/issues/334)와
[#336](https://github.com/flameware/massive-design/issues/336)에 있고, 표의 수치는
`test/chart-series.test.mjs`가 지켜요. `brand` 패밀리를 앱 색으로 바꾸는 API는
[#398](https://github.com/flameware/massive-design/issues/398)이,
`createRamp` 서브패스는
[ADR-0023](https://github.com/flameware/massive-design/blob/main/docs/adr/0023-second-generation-base-ui.md) §10이 열었어요.
