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
semantic 색 36개 전부가 유틸리티로 열려 있다([#280](https://github.com/flameware/massive-design/issues/280) —
그 전에는 Button이 쓰는 8개뿐이었다). 전체 이름과 지금 모드의 실제 값은
Storybook의 **Foundations/색** 챕터에서 본다.

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
