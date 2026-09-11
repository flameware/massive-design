# @flameware/tokens

massive-design의 토큰. OKLCH 램프에서 생성한 CSS 한 장과 semantic 토큰 타입.

## 설치

```
# .npmrc
@flameware:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

```sh
bun add @flameware/tokens
```

## 쓰기

```css
/* app/globals.css */
@import "tailwindcss";
@import "@flameware/tokens/tokens.css";
```

순서가 규약이다 — Tailwind가 먼저, 토큰이 나중이다. 이 파일은 변수만이 아니라
**규칙**도 낸다(`body`의 배경·글자색, `*`의 테두리·outline 색). 라이트/다크는
루트의 `dark` 클래스 하나로 갈린다.

`@flameware/ui`를 함께 쓴다면 `@flameware/ui/styles.css` 한 줄이 이것까지
끌고 오므로 따로 적지 않는다.

색 이름은 역할이 접두사다 — `bg.accent.solid`는 `bg-accent-solid`, `fg.default`는
`text-default`, `border.default`는 `border-default`. `bg`·`fg`·`border` 아래
semantic 색은 지금 35개이고, 그 35개가 빠짐없이 유틸리티로
열려 있다([#280](https://github.com/flameware/massive-design/issues/280) — 그 전에는
Button이 쓰는 8개뿐이었다). semantic 색 토큰 중 유틸리티가 없는 것은 `state.layer`
하나뿐이다 — 색이 아니라 `@flameware/ui`의 `state.css`가 hover·pressed를 합성할 때
읽는 입력이라 세 역할 밖에 살고, 그래서 `@theme`에 등록되지 않는다. 전체 이름과
지금 모드의 실제 값은 Storybook의 **Foundations/색** 챕터에서 본다.

팔레트(`--ds-palette-*`)는 devtools 추적용이다. 직접 집지 않는다 — 라이트/다크
전환이 semantic 층에서만 일어나기 때문에, 팔레트를 집으면 모드가 죽는다.

## 램프 생성기 — 자기 패밀리 만들기

DS는 `brand`·`neutral`·`danger`·`success`·`warning` 다섯 패밀리만 갖는다.
도메인 색(예: 한국 관행 상승 빨강·하락 파랑 같은 손익 색)은 DS가 소유하지
않는다 — 그래서 그 패밀리들을 만든 것과 같은 램프 생성기를 `./ramp` 서브패스로
낸다([ADR-0023](https://github.com/flameware/massive-design/blob/main/docs/adr/0023-second-generation-base-ui.md) §10).

```ts
import { createRamp, rampToCssVariables, contrastRatio } from "@flameware/tokens/ramp"

const profit = createRamp("profit", { key: "#db2931" }) // 상승 — 빨강
profit.light[8].hex   // '#db2931' — 키 컬러가 step 9에 그대로 앉는다
profit.issues         // [] — 비어 있으면 lint(규칙군 A) 통과

rampToCssVariables(profit) // ':root { --profit-1: …; } .dark { --profit-1: …; }'
contrastRatio(profit.light[9].hex, '#ffffff') // WCAG 2 대비비 — DS 게이트와 같은 공식
```

`createRamp`는 DS 5패밀리를 만든 것과 같은 알고리즘·같은 기본 파라미터를
쓴다 — 같은 대비 경향을 물려받지만 게이트를 대신 통과시켜 주지는 않는다.
확인은 `contrastRatio`로 스스로 한다. Storybook 문서는
[Foundations/자기 패밀리 만들기](../../apps/storybook/stories/foundations/RampGenerator.mdx)에 있다.

`./ramp`를 import하지 않는 소비처는 이 API가 쓰는 `culori`를 번들에 물지
않는다 — 바닥값은 서브패스가 정한다([ADR-0017](https://github.com/flameware/massive-design/blob/main/docs/adr/0017-dependency-weight-is-a-floor-cost.md)).

## 차트 계열색 — 브랜드에서 둘을 뽑는다

차트 **본체**는 DS가 갖지 않는다([ADR-0017](https://github.com/flameware/massive-design/blob/main/docs/adr/0017-dependency-weight-is-a-floor-cost.md) §2 — 라이브러리도 컴포넌트도 소비처 것이다). 그러나 계열색을 **브랜드에서 뽑는 규칙**은 DS가 준다. 규칙이 없으면 소비처마다 `color-mix(… 42%, …)` 같은 눈대중이 한 벌씩 생기고, 소비처가 둘이 되는 순간 "우리 차트 파랑"이 두 색이 되기 때문이다([#334](https://github.com/flameware/massive-design/issues/334)).

여기서 **계열**은 차트가 한 면 위에 함께 그리는 데이터 묶음이다 — `CONTEXT.md`의 토큰 이름 앞자리(`bg`·`fg`·`border`)를 가리키는 `계열`과 다른 축이고, 이 절 안에서만 이 뜻으로 쓴다.

### 규약

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

계열 2는 언제나 계열 1보다 **면 쪽**이다 — 부차적인 몫이 주된 몫보다 튀면 의미가 뒤집힌다. 라이트 2단·다크 3단으로 내려가는 **비대칭은 램프의 모양**이다 — 다크 램프는 키 앵커(step 9) 아래가 더 눌려 있어, 같은 2단으로는 계열 1과 갈리지 않는다.

이 절은 팔레트 변수를 직접 집는 **유일한 자리**다. 위의 "직접 집지 않는다"가 막는 것은 *모드가 죽는 소비*이고, 여기는 `:root`와 `.dark`에 라이트·다크를 각각 못박으므로 그 함정에 걸리지 않는다. `--ds-palette-brand-light-7`만 쓰고 `.dark` 줄을 빠뜨리면 그때는 죽는다.

### 기준

| 쌍 | 하한 |
| --- | --- |
| 계열 ↔ `bg-surface` | **1.5:1** |
| 계열 1 ↔ 계열 2 | **1.9:1** |

- **1.5:1** — DS가 "면 위에서 보인다"고 이미 선언한 표식들이 `border.default`(라이트 1.49 · 다크 1.31)에서 `border.field`(라이트 1.95 · 다크 1.56)에 걸쳐 있다. 계열은 테두리보다 면적이 크므로 하한을 그 범위의 아래 끝이 아니라 가운데에 둔다.
- **1.9:1** — 두 계열은 서로가 서로의 배경이라 면 기준 하나로는 모자라고, 면 기준보다 높아야 한다. 위를 3:1(WCAG 1.4.11)로 두지 않는 이유는 **계열 2가 가는 방향에 그 값이 없기 때문**이다. 계열 2는 부차적인 몫이므로 계열 1보다 **면 쪽**이어야 하는데(반대로 가면 둘째가 첫째보다 튀어 의미가 뒤집힌다), 그 방향에서 계열 1과 3:1을 넘는 단계는 면과 1.5를 못 넘는다 — 라이트는 brand 6이 3.61 · **1.48**로 아슬아슬하게 떨어지고, 다크는 brand 3이 3.09 · 1.09로 한참 떨어진다. 두 기준은 한 램프의 그 방향에서 동시에 서지 않는다. 그리고 계열색은 **컨트롤 어포던스가 아니다**(`CONTEXT.md` 역할 어휘) — 잡는 자리가 아니라 의미를 나르는 채움이라, 1.4.11의 3:1을 빚지지 않는다.

### 실측

`bg-surface`(라이트 `#fdfdfd` · 다크 `#151515`) 기준. 마지막 두 줄은 이 규약이 나오기 전 소비처([invest diary #368](https://github.com/flameware/investmentdiary/pull/368))가 눈으로 고른 `color-mix(… 42%, …)`의 값이다.

| | 계열 2 | 계열 2 ↔ 면 | 계열 1 ↔ 계열 2 |
| --- | --- | --- | --- |
| 규약 · 라이트 | `#97b8f2` | 1.97 | 2.69 |
| 규약 · 다크 | `#073891` | 1.72 | 1.96 |
| 42% · 라이트 | — | 1.85 | 2.87 |
| 42% · 다크 | — | 1.52 | 2.21 |

소비처의 두 줄은 신고된 수다 — `color-mix(in oklch, #0f5fed 42%, 면)`을 다시 재면 라이트 `#9cbffc`(1.83 · 2.90) · 다크 `#1a3568`(1.52 · 2.21)로 같은 자리에 앉는다.

눈대중은 **틀리지 않았다** — 네 수 모두 위 하한을 넘고, 다크는 brand 6과 5 사이에 앉아 있었다(brand 5는 1.52 · 2.23으로 소수점까지 같다). 규약이 바꾸는 것은 값이 아니라 **그 값이 괜찮은지를 누가 아는가**이다. 이 수들은 `test/chart-series.test.mjs`가 지킨다.

### 계열은 둘이다

셋 이상은 이 규약이 답하지 않는다. 지금 실측된 수요(미국/한국 · 개별주/ETF · 매수/매도)는 전부 **한 전체의 두 몫**이라 둘째가 대조색이 아니라 같은 색의 옅은 단계여야 했다. 서로 경쟁하는 범주를 셋 이상 나눠야 하는 자리가 실제로 나오면 그것은 단계 선택 문제가 아니라 **정성 팔레트** 문제이고, 그때 이 절을 다시 연다.

### 자기 패밀리에서 뽑을 때

같은 단계 규칙(9 / 라이트 7 · 다크 6)을 `createRamp`로 만든 패밀리에도 쓸 수 있지만, **보장되지는 않는다.** 키 컬러가 밝으면 무너진다 — DS의 `warning`(`#eab308`)으로 재면 라이트의 계열 1 ↔ 계열 2가 **1.19**다. 램프의 옅은 쪽이 키 자신과 밝기가 가깝기 때문이다. 그래서 확인은 스스로 한다:

```ts
import { createRamp, contrastRatio } from "@flameware/tokens/ramp"

const r = createRamp("profit", { key: "#db2931" })
contrastRatio(r.light[6].hex, "#fdfdfd") // 계열 2 ↔ 면 — 1.5 이상
contrastRatio(r.light[8].hex, r.light[6].hex) // 계열 1 ↔ 계열 2 — 1.9 이상
```

두 기준을 못 넘으면 그 키에서는 계열 둘을 한 램프로 만들 수 없다.
