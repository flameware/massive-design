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
