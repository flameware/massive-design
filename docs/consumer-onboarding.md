# 소비처 온보딩 가이드

`@flameware/ui`·`@flameware/tokens`를 처음 붙이는 소비처가 밟는 순서 한 장.
두 패키지의 README는 컴포넌트·API 레퍼런스로 남고, 소비처가 매번 반복하는
설치·환경·경계 이야기는 여기 한 곳에만 있다. 여기 담긴 함정은 전부 실제
온보딩([#396](https://github.com/flameware/massive-design/issues/396) 숲마루)이
드러낸 것이고, 각 절에서 그 근거 이슈를 가리킨다.

## 1. 설치

GitHub Packages는 스코프가 리포 소유자를 따른다
([ADR-0024](adr/0024-package-scope-follows-the-registry-owner.md)) — `.npmrc`에
레지스트리를 한 줄 적어야 `bun add`/`npm install`이 `@flameware/*`를 찾는다.

```
# .npmrc
@flameware:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

```sh
bun add @flameware/ui @flameware/tokens
```

`GITHUB_TOKEN`은 `read:packages` 스코프의 개인 액세스 토큰이다. 로컬에서는
쉘 환경 변수로, Vercel 같은 빌드 환경에서는 **같은 이름**의 프로젝트 환경
변수로 넣는다 — 이름이 다르면 `.npmrc`의 `${GITHUB_TOKEN}` 치환이 비어
레지스트리 인증이 조용히 실패한다.

## 2. CSS

```css
/* app/globals.css */
@import "tailwindcss";
@import "@flameware/tokens/tokens.css";
```

순서가 규약이다 — Tailwind가 먼저, 토큰이 나중이다. `@flameware/ui`를 같이
쓰면 `styles.css` 한 줄이 `tokens.css`·`state.css`·`hit-area.css`를 전부 끌고
오므로 `tokens.css`를 따로 적지 않는다.

```css
/* app/globals.css — @flameware/ui를 쓸 때 */
@import "tailwindcss";
@import "@flameware/ui/styles.css";
```

기존에 `@theme inline` 블록을 가진 소비처(shadcn 스타터 등)는 `@import`를
그 블록보다 먼저 두면 된다 — DS도 자기 `@layer base`에서 `body`의 배경·글자색,
`*`의 테두리·outline 색을 내므로, 소스 순서상 더 뒤에 있는 소비처의
`@layer base` 블록이 이긴다(§9의 `--font-sans`·`--radius-*` 충돌도 같은
"더 뒤 선언이 이긴다" 규칙으로 풀린다).

## 3. 폰트

`--font-sans`는 다음 스택을 가리킨다(`packages/tokens/tokens/primitive/scale.json`):

```
"Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont,
system-ui, "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", sans-serif
```

DS는 **이름만 정한다** — Pretendard를 실제로 받아오는 것은 소비처 몫이다.
숲마루는 jsDelivr가 서빙하는 Pretendard dynamic subset(실제 쓰인 한글
유니코드 범위만 내려받는 빌드)을 `<head>`에서 `<link rel="stylesheet">`로
받는다:

```tsx
<head>
  <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="" />
  <link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
  />
</head>
```

(flameware/apt-finder `src/app/layout.tsx`). `next/font`로 자체 호스팅하는
쪽을 선호하면 그래도 된다 — DS는 폰트 파일을 갖고 있지 않으므로 로딩 방식을
강제하지 않는다.

## 4. 다크 모드

DS는 `<html class="dark">` **클래스만** 본다. `prefers-color-scheme`을 CSS가
직접 보지 않는다 — 문서가 로드될 때 클래스로 한 번 번역해서 넣어주는 것이
소비처 몫이다. 우선순위는 **명시 선택(로컬스토리지 등) > OS 설정**이고,
소비처가 자기만의 예외(예: 지도 화면처럼 다크가 있으면 안 되는 화면)를 두고
싶으면 그 판정도 이 우선순위 위에 한 칸 더 끼워 넣으면 된다.

### `<head>` 인라인 스크립트 (일반형)

```js
(function () {
  function resolveThemeClass(explicit, prefersDark) {
    if (explicit === "light" || explicit === "dark") return explicit;
    return prefersDark ? "dark" : "light";
  }

  function readExplicit() {
    try {
      var v = window.localStorage.getItem("theme");
      return v === "light" || v === "dark" ? v : null;
    } catch (e) {
      return null;
    }
  }

  function apply(cls) {
    var root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(cls);
  }

  var mql = window.matchMedia("(prefers-color-scheme: dark)");

  function update() {
    apply(resolveThemeClass(readExplicit(), mql.matches));
  }

  update();
  mql.addEventListener("change", update);
})();
```

React(App Router 기준)에서는 이걸 **동기 `<script dangerouslySetInnerHTML>`로
`<head>` 맨 앞**에 둔다. `next/script`는 기본 전략(`afterInteractive`)이 첫
페인트 뒤에 실행돼 다크 사용자에게 라이트가 한 프레임 보였다 바뀌는 깜빡임이
생기므로 쓰지 않는다.

```tsx
<html lang="ko" suppressHydrationWarning>
  <head>
    <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
    {/* ...다른 head 태그들... */}
  </head>
  ...
```

`suppressHydrationWarning`이 왜 필요한가 — 서버는 항상 같은 기본 클래스(예:
`"light"`)로 렌더하고, 위 스크립트가 하이드레이션 전에 그 클래스를
바꿔치기한다. React 입장에선 서버 마크업과 클라이언트 첫 렌더가 어긋나
보이지만, 이건 의도된 동작이다(다크 판정 자체가 서버가 알 수 없는 클라이언트
정보 — OS 설정·로컬스토리지 — 에 달려 있다).

### 걸린 함정 둘

1. **판정 함수를 여러 개로 쪼개 서로 부르게 하면 프로덕션에서 죽는다.**
   판정 로직을 앱 코드(TS 모듈)와 `<head>` 스크립트 양쪽에서 같은 소스로
   쓰려고 `Function.prototype.toString()`으로 함수 본문을 문자열에 박아
   넣으면, `next build`의 프로덕션 압축기가 모듈 스코프의 지역 함수 이름을
   자유롭게 바꿔버린다. `toString()`은 **압축된 소스**를 돌려주므로, 압축된
   이름으로 다른 함수를 부르는 코드가 그대로 박히고 스크립트 쪽엔 그 이름의
   변수가 없어 `ReferenceError`로 조용히 죽는다 — 그 뒤로는 `matchMedia`
   리스너도 안 걸리므로 다크 모드 기능 전체가 죽은 채로 배포된다. **`<head>`에
   박아 넣을 판정 함수는 다른 top-level 함수를 부르지 않는, self-contained
   함수 하나로 짜야 한다.**
2. **SPA 내비게이션은 이 스크립트를 다시 안 돌린다.** App Router는 같은
   레이아웃 트리 안에서 페이지를 오갈 때 `<html>`/`<head>`를 다시 그리지
   않는다. 소비처가 화면마다 다른 강제 규칙(예: 지도 화면은 항상 라이트)을
   둔다면, OS 설정이 안 바뀐 채 그 화면들 사이를 클라이언트 내비게이션으로만
   오간 경우 클래스가 stale해진다. 라우트가 바뀔 때마다(`usePathname()` 등으로)
   같은 판정 함수를 다시 불러 클래스를 재적용하는 작은 클라이언트 컴포넌트를
   하나 더 두는 걸 권한다.

위 코드와 두 함정은 실제로 숲마루가 겪고 고친 것이다(`src/lib/theme.ts`·
`src/lib/theme-script.ts`·`src/lib/theme-route-sync.tsx`,
flameware/apt-finder#41). 이 절 전체가 숲마루의 실측 예시다 — DS가 강제하는
것은 "`.dark` 클래스만 본다"는 한 줄뿐이고, 위 스크립트는 권장형이다.

## 5. 브랜드 키 입히기

DS의 `brand` 패밀리 기본값은 `#0f5fed`다. 소비처가 자기 브랜드로 바꾸고
싶으면 `createBrandOverride`에 키 컬러 하나를 준다
([#398](https://github.com/flameware/massive-design/issues/398)) — 모드별이
아니라 **키 하나**(램프의 step 9 앵커, light/dark가 같은 값을 갖는 유일한
단계)다.

```ts
import { createBrandOverride } from "@flameware/tokens/ramp"

const css = createBrandOverride("oklch(0.52 0.11 155)") // 숲마루 — forest
```

CSS는 **빌드 타임에** 파일로 내보내 커밋한다(런타임에 매번 계산할 이유가
없다 — 키 컬러는 배포 사이에 바뀌지 않는다):

```ts
writeFileSync("app/brand.css", css)
```

```css
/* app/globals.css */
@import "tailwindcss";
@import "@flameware/tokens/tokens.css";
@import "./brand.css"; /* 반드시 tokens.css 뒤 — 나중 선언이 이긴다 */
```

`createBrandOverride`는 **에러를 던진다 — 경고가 아니다.** `tokens:contrast`가
DS 자신의 `accent` 조합에 거는 것과 같은 쌍·같은 공식으로 새 팔레트를 다시
재고, 못 넘으면 에러 메시지에 어느 쌍이 몇 대 몇으로 떨어졌는지 담는다:

```
Error: createBrandOverride: 대비 게이트 실패 —
  light fg.on-solid ↔ bg.accent.solid: 1.92 < 4.5:1, …
```

키를 아예 주지 않으면 기존 소비처는 DS 기본 brand 그대로다 — 영향 없음.
전체 API·게이트 대상 쌍 표는
[`packages/tokens/README.md` §브랜드 키 컬러로 DS 색을 입힌다](../packages/tokens/README.md#브랜드-키-컬러로-ds-색을-입힌다)와
Storybook [Foundations/브랜드 색 입히기](../apps/storybook/stories/foundations/BrandOverride.mdx)에 있다.

## 6. RSC 주의

### 컴파운드 객체 export를 서버 컴포넌트에서 직접 destructure하지 않는다

`Toast.Provider`/`Toast.Viewport`처럼 네임스페이스형 export는 Client
Component 참조로 치환될 때 **객체 전체가** 감싸이므로, `"use client"`가 없는
서버 컴포넌트(대개 루트 레이아웃)에서 `<Toast.Provider>`로 직접 쓰면 property
접근이 `undefined`가 되어 `next build`가 `/_not-found` 프리렌더에서
"Element type is invalid… got: undefined"로 깨진다
([#377](https://github.com/flameware/massive-design/issues/377), invest diary,
Next 15/16 공통으로 재현 확인 — [#402](https://github.com/flameware/massive-design/issues/402)).

DS API는 바꾸지 않는다 — 우회는 소비처 쪽에 얇은 client 래퍼를 하나 두는
것이다(기존 `ThemeProvider` 래퍼와 같은 모양):

```tsx
// app/toast-provider.tsx
"use client"
import { Toast } from "@flameware/ui/toast"

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <Toast.Provider>
      {children}
      <Toast.Viewport />
    </Toast.Provider>
  )
}
```

`app/layout.tsx`(서버 컴포넌트)는 이 래퍼만 부른다. 네임스페이스형 export를
쓰는 컴포넌트(`Menu`·`Dialog`·`Tabs` 등) 전부가 같은 규칙을 진다 — Client
Component **안에서** 쓰는 것은 아무 문제가 없고, 함정은 서버 컴포넌트에서
직접 destructure할 때만 있다.

### `Icon`은 서버 컴포넌트다 — 함수를 prop으로 넘길 때 방향을 헷갈리지 않는다

`Icon`은 `"use client"`가 없다([#412](https://github.com/flameware/massive-design/issues/412)·
[#413](https://github.com/flameware/massive-design/pull/413) — 이전 버전은 근거
없이 박혀 있던 `"use client"`를 걷어내 서버 컴포넌트로 옮겼다). `icon={Save}`처럼
넘기는 lucide 아이콘 **함수 레퍼런스**는 서버→클라이언트 경계를 넘는 값이
아니므로, 서버 컴포넌트에서 `<Icon icon={CircleAlert} />`를 직접 써도 된다.

반대로 걸리는 자리는 **Icon이 아니라 함수를 prop으로 받는 다른 Client
Component**다 — 예를 들어 README의 Alert 예시를 그대로 서버 컴포넌트 페이지에
옮기면서 아이콘 함수를 다른 `"use client"` 컴포넌트의 prop으로 통과시키면,
React가 "Functions cannot be passed directly to Client Components…"로
빌드를 깬다. 서버/클라이언트 분류의 정본은
`packages/ui/test/package.test.mjs`의 `CLIENT_SUBPATHS`/`SERVER_SUBPATHS`다 —
어느 서브패스가 어느 쪽인지 헷갈리면 그 두 배열을 확인한다.

## 7. Next 16 / Turbopack

Next 16.2 · React 19.2 · Turbopack에서 실측한 결과([#402](https://github.com/flameware/massive-design/issues/402)):

- **실제 소비 경로(호이스팅 설치) — 통과.** `bun add`/`npm install`이 만드는
  실디렉터리(심링크 아님) 레이아웃에서는 서브패스 35개 전부, `@source`
  스캔, `"use client"` 경계 모두 Next 15와 동일하게 동작한다.
- **`bun link`/`file:` 심링크 레이아웃 — Turbopack에서 서브패스 해석이 통째로
  깨진다.** 아직 게시하지 않은 로컬 DS 변경을 미리 붙여보려고
  `bun link`(또는 `file:` 디렉터리 의존성)로 진짜 심링크를 만들면,
  `@flameware/ui/<subpath>` import가 예외 없이
  `Module not found: Can't resolve '@flameware/ui/<subpath>'`로 Turbopack
  빌드를 깬다. **같은 심링크 레이아웃에서 `next build --webpack`은 문제없이
  성공한다** — Turbopack만의 결함이고 DS 코드 문제가 아니다.
  **로컬에서 아직 게시 안 된 DS 변경을 미리 붙여볼 때는 `npm pack`이 만드는
  tarball을 설치하라 — `bun link`는 Next 16 Turbopack에서 쓰지 말 것.**
- `@source "../src"` 스캔은 심링크 여부와 무관하게 빠짐없다(단, 위 이유로
  Turbopack 기본 빌드는 심링크 레이아웃에 애초에 도달하지 못한다).

## 8. shadcn에서 오는 소비처 — 이름이 같아도 뜻은 다르다

shadcn 스타터를 쓰던 소비처가 DS로 옮겨 올 때, 두 체계의 CSS 변수 이름은
**어휘가 겹치지만 뜻이 겹치지 않는다.** 대표적인 거짓 친구는 `--accent`다 —
shadcn의 `--accent`는 브랜드색이 아니라 hover용 연회색이고(`--muted`와 같은
값), shadcn에서 브랜드는 `--primary`다. `--input`도 이름과 달리 면이 아니라
테두리다.

전체 대조표와 각 항목의 근거는 [ADR-0025](adr/0025-reference-words-carry-meaning-not-spelling.md)에
있다 — 옮길 때 물을 것은 "DS에 같은 이름이 있나"가 아니라 "shadcn의 그
이름이 그 자리에서 무슨 일을 하나"다.

## 9. `@theme inline` 이름 충돌

`@flameware/ui/styles.css`(→ `@flameware/tokens/tokens.css`)가 내는 대부분의
CSS 커스텀 프로퍼티는 접두사가 달라(`--background-color-*`·`--text-color-*`·
`--border-color-*` 등) shadcn 스타터의 `--color-*` 이름공간과 충돌하지
않는다. 겹치는 이름은 지금 둘뿐이다:

- `--font-sans`
- `--radius-sm` ~ `--radius-4xl`

소비처가 이미 같은 이름을 `@theme inline`에서 쓰고 있으면 **소스 순서상
나중에 오는 `@import`가 이긴다**(§2). 값이 실질적으로 같으면(숲마루가 그
경우였다 — 둘 다 Pretendard Variable 스택, 둘 다 0.625rem 기반 7단 radius)
화면에 영향이 없다. 값이 다른 소비처는 이 두 이름이 조용히 화면을 바꿀 수
있으니 `@import` 순서를 먼저 확인한다([#402](https://github.com/flameware/massive-design/issues/402)).
