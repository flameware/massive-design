# 온보딩 가이드

`@flameware/ui`와 `@flameware/tokens`를 앱에 처음 붙일 때 밟는 순서예요. 설치부터
CSS 순서, 다크 모드, 브랜드 색, 서버 컴포넌트 경계까지 한 번에 다뤄요. 컴포넌트와
토큰의 API는 두 패키지의 README에 있어요.

## 1. 설치

GitHub Packages에 있어서 `.npmrc`에 레지스트리를 한 줄 적어야 `bun add`와
`npm install`이 `@flameware/*`를 찾아요.

```
# .npmrc
@flameware:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

```sh
bun add @flameware/ui @flameware/tokens
```

`GITHUB_TOKEN`은 `read:packages` 권한을 가진 개인 액세스 토큰이에요. 로컬에서는 셸
환경 변수로, Vercel 같은 빌드 환경에서는 같은 이름의 프로젝트 환경 변수로 넣어요.
이름이 다르면 `.npmrc`의 `${GITHUB_TOKEN}` 치환이 비어서 레지스트리 인증이 아무
메시지 없이 실패해요.

## 2. CSS

```css
/* app/globals.css */
@import "tailwindcss";
@import "@flameware/tokens/tokens.css";
```

Tailwind가 먼저, 토큰이 나중이에요. `@flameware/ui`를 같이 쓴다면 `styles.css` 한
줄이 `tokens.css`와 `state.css`와 `hit-area.css`를 전부 끌고 오니 `tokens.css`를 따로
적지 않아요.

```css
/* app/globals.css, @flameware/ui를 쓸 때 */
@import "tailwindcss";
@import "@flameware/ui/styles.css";
```

이미 `@theme inline` 블록을 가진 앱(shadcn 스타터 등)은 `@import`를 그 블록보다 먼저
두면 돼요. DS도 자기 `@layer base`에서 `body`의 배경색과 글자색, `*`의 테두리색과
outline 색을 내는데, 소스 순서상 더 뒤에 있는 앱의 `@layer base` 블록이 이겨요.
[§9](#9-theme-inline-이름-충돌)의 `--font-sans`와 `--radius-*` 충돌도 같은 규칙으로
풀려요.

## 3. 폰트

`--font-sans`는 다음 스택을 가리켜요.

```
"Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont,
system-ui, "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", sans-serif
```

DS는 이름만 정해요. Pretendard를 실제로 받아 오는 것은 앱이 해요. jsDelivr가 서빙하는
Pretendard dynamic subset(실제 쓰인 한글 유니코드 범위만 내려받는 빌드)을 `<head>`에서
받는 방법이에요.

```tsx
<head>
  <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="" />
  <link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
  />
</head>
```

`next/font`로 직접 호스팅해도 돼요. DS는 폰트 파일을 갖고 있지 않아서 로딩 방식을
강제하지 않아요.

## 4. 다크 모드

DS는 `<html class="dark">` 클래스만 봐요. `prefers-color-scheme`을 CSS가 직접 보지
않으니, 문서가 로드될 때 그 값을 클래스로 한 번 번역해 넣는 것은 앱이 해요. 우선순위는
사용자가 직접 고른 값(로컬스토리지 등)이 OS 설정보다 앞이에요. 지도 화면처럼 다크가
있으면 안 되는 화면이 있다면 그 판정을 이 우선순위 위에 한 칸 더 끼워 넣으면 돼요.

### `<head>` 인라인 스크립트

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

React(App Router 기준)에서는 이것을 동기 `<script dangerouslySetInnerHTML>`로
`<head>` 맨 앞에 둬요. `next/script`는 기본 전략(`afterInteractive`)이 첫 페인트
뒤에 실행돼서, 다크 모드 사용자에게 라이트 화면이 한 프레임 보였다 바뀌는 깜빡임이
생겨요.

```tsx
<html lang="ko" suppressHydrationWarning>
  <head>
    <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
    {/* ...다른 head 태그들... */}
  </head>
  ...
```

`suppressHydrationWarning`이 필요한 이유는 이래요. 서버는 항상 같은 기본 클래스(예:
`"light"`)로 렌더하고, 위 스크립트가 하이드레이션 전에 그 클래스를 바꿔요. React가
보기에는 서버 마크업과 클라이언트 첫 렌더가 어긋나지만 의도한 동작이에요. 다크 판정
자체가 서버는 알 수 없는 클라이언트 정보(OS 설정, 로컬스토리지)에 달려 있기 때문이에요.

### 판정 함수를 여러 개로 쪼개면 프로덕션에서 죽어요

판정 로직을 앱 코드(TS 모듈)와 `<head>` 스크립트 양쪽에서 같은 소스로 쓰려고
`Function.prototype.toString()`으로 함수 본문을 문자열에 넣으면, `next build`의
프로덕션 압축기가 모듈 스코프의 지역 함수 이름을 자유롭게 바꿔요. `toString()`은
압축된 소스를 돌려주므로 압축된 이름으로 다른 함수를 부르는 코드가 그대로 들어가고,
스크립트 쪽에는 그 이름의 변수가 없어서 `ReferenceError`로 조용히 죽어요. 그 뒤로는
`matchMedia` 리스너도 걸리지 않아 다크 모드 기능 전체가 죽은 채로 배포돼요.

`<head>`에 넣을 판정 함수는 다른 top-level 함수를 부르지 않는 함수 하나로 짜세요.

### 화면 사이를 이동할 때 클래스가 낡을 수 있어요

App Router는 같은 레이아웃 트리 안에서 페이지를 오갈 때 `<html>`과 `<head>`를 다시
그리지 않아요. 그래서 위 스크립트도 다시 실행되지 않아요. 화면마다 다른 강제 규칙(예:
지도 화면은 항상 라이트)을 두고 있다면, OS 설정이 그대로인 채 그 화면들 사이를
클라이언트 내비게이션으로만 오갈 때 클래스가 낡은 값으로 남아요. 라우트가 바뀔
때마다(`usePathname()` 등으로) 같은 판정 함수를 다시 불러 클래스를 다시 적용하는 작은
클라이언트 컴포넌트를 하나 더 두는 것을 권해요.

위 스크립트는 권장형이에요. DS가 강제하는 것은 `.dark` 클래스만 본다는 한 줄뿐이에요.

## 5. 브랜드 색 입히기

DS의 `brand` 패밀리 기본값은 `#0f5fed`예요. 앱의 브랜드 색으로 바꾸고 싶으면
`createBrandOverride`에 색 하나를 주세요. 라이트와 다크 모드용 색을 따로 받지 않고
하나만 받아요.

```ts
import { createBrandOverride } from "@flameware/tokens/ramp"

const css = createBrandOverride("oklch(0.52 0.11 155)") // 녹색 브랜드
```

CSS는 빌드할 때 파일로 내보내 커밋해요. 브랜드 색은 배포 사이에 바뀌지 않으니 런타임에
매번 계산할 이유가 없어요.

```ts
writeFileSync("app/brand.css", css)
```

```css
/* app/globals.css */
@import "tailwindcss";
@import "@flameware/tokens/tokens.css";
@import "./brand.css"; /* 반드시 tokens.css 다음에 둬요 */
```

`createBrandOverride`는 경고를 출력하고 넘어가지 않고 에러를 내요. DS가 자기 `accent`
조합을 검사할 때와 같은 조합, 같은 공식으로 새 팔레트를 다시 재고, 기준에 못 미치면
어느 조합이 몇 대 몇으로 떨어졌는지 에러 메시지에 담아요.

```
Error: createBrandOverride: 브랜드 색의 대비가 기준에 못 미쳐서 글자와 테두리가 잘 보이지 않아요.
  light fg.accent ↔ bg.canvas 대비 2.81, 기준 4.5
  …
  light fg.on-solid ↔ bg.accent.solid 대비 1.92, 기준 4.5
  …
브랜드 색을 조금 어둡게 조정한 뒤 다시 실행해 보세요.
```

브랜드 색을 아예 넘기지 않으면 DS 기본 색이 그대로 쓰여서 기존 화면은 바뀌지 않아요.
전체 API와 검사하는 조합 표는
[`@flameware/tokens` README](../packages/tokens/README.md#브랜드-색으로-ds-강조색-바꾸기)와
Storybook [Foundations/브랜드 색 입히기](../apps/storybook/stories/foundations/BrandOverride.mdx)에
있어요.

## 6. 서버 컴포넌트에서 쓸 때

### 네임스페이스형 컴포넌트는 서버 컴포넌트에서 직접 꺼내 쓰지 않아요

`Toast.Provider`나 `Toast.Viewport`처럼 하나의 이름 아래 묶인 export는 클라이언트
컴포넌트 참조로 치환될 때 객체 전체가 감싸여요. 그래서 `"use client"`가 없는 서버
컴포넌트(대개 루트 레이아웃)에서 `<Toast.Provider>`로 직접 쓰면 property 접근이
`undefined`가 되고, `next build`가 `/_not-found` 프리렌더에서 "Element type is
invalid… got: undefined"로 깨져요.

DS API는 그대로 두고, 앱 쪽에 얇은 클라이언트 래퍼를 하나 두면 돼요.

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

서버 컴포넌트인 `app/layout.tsx`는 이 래퍼만 불러요. `Menu`, `Dialog`, `Tabs`처럼
네임스페이스형 export를 쓰는 컴포넌트 전부가 같은 규칙을 따라요. 클라이언트 컴포넌트
안에서 쓰는 것은 아무 문제가 없고, 서버 컴포넌트에서 직접 꺼내 쓸 때만 걸려요.

### `Icon`은 서버 컴포넌트예요

`Icon`에는 `"use client"`가 없어요. `icon={Save}`처럼 넘기는 lucide 아이콘 함수
레퍼런스는 서버와 클라이언트 경계를 넘는 값이 아니라서, 서버 컴포넌트에서
`<Icon icon={CircleAlert} />`를 직접 써도 돼요.

걸리는 곳은 Icon이 아니라 함수를 prop으로 받는 다른 클라이언트 컴포넌트예요. 아이콘
함수를 `"use client"` 컴포넌트의 prop으로 통과시키면 React가 "Functions cannot be
passed directly to Client Components…"로 빌드를 깨요.

어느 서브패스가 서버이고 어느 서브패스가 클라이언트인지는
`packages/ui/test/package.test.mjs`의 `CLIENT_SUBPATHS`와 `SERVER_SUBPATHS`에 적혀
있어요.

## 7. Next 16과 Turbopack

Next 16.2, React 19.2, Turbopack에서 실제로 재 본 결과예요.

- **`bun add`와 `npm install`로 설치한 경우 통과해요.** 실제 디렉터리로 설치되는
  레이아웃에서는 서브패스 35개 전부, `@source` 스캔, `"use client"` 경계가 모두
  Next 15와 똑같이 동작해요.
- **`bun link`와 `file:` 심링크 레이아웃은 Turbopack에서 서브패스 해석이 통째로
  깨져요.** 아직 게시하지 않은 로컬 DS 변경을 미리 붙여 보려고 심링크를 만들면
  `@flameware/ui/<subpath>` import가 예외 없이
  `Module not found: Can't resolve '@flameware/ui/<subpath>'`로 빌드를 깨요. 같은
  레이아웃에서 `next build --webpack`은 문제없이 성공해요. Turbopack만의 결함이고 DS
  코드 문제가 아니에요.
- 게시 전 변경을 미리 붙여 볼 때는 `npm pack`이 만드는 tarball을 설치하세요.
  `bun link`는 Next 16 Turbopack에서 쓰지 마세요.
- `@source "../src"` 스캔은 심링크 여부와 관계없이 빠짐없어요. 다만 위 이유로
  Turbopack 기본 빌드는 심링크 레이아웃에 애초에 도달하지 못해요.

## 8. shadcn에서 옮겨 올 때

shadcn 스타터를 쓰던 앱이 DS로 옮겨 올 때, 두 체계의 CSS 변수는 이름이 겹쳐도 뜻이
겹치지 않아요. 대표적인 것이 `--accent`예요. shadcn의 `--accent`는 브랜드 색이 아니라
hover용 연회색이고(`--muted`와 같은 값), shadcn에서 브랜드 색은 `--primary`예요.
`--input`도 이름과 달리 배경이 아니라 테두리예요.

옮길 때 물어볼 것은 "DS에 같은 이름이 있나"가 아니라 "shadcn의 그 이름이 거기서 무슨
일을 하나"예요. 전체 대조표와 각 항목의 근거는
[ADR-0025](adr/0025-reference-words-carry-meaning-not-spelling.md)에 있어요.

## 9. `@theme inline` 이름 충돌

`@flameware/ui/styles.css`가 내는 CSS 커스텀 프로퍼티는 대부분 접두사가 달라서
(`--background-color-*`, `--text-color-*`, `--border-color-*` 등) shadcn 스타터의
`--color-*` 이름 공간과 충돌하지 않아요. 겹치는 이름은 지금 둘이에요.

- `--font-sans`
- `--radius-sm`부터 `--radius-4xl`까지

이미 같은 이름을 `@theme inline`에서 쓰고 있다면 소스 순서상 나중에 오는 `@import`가
이겨요([§2](#2-css)). 값이 실질적으로 같으면 화면에 영향이 없어요. 값이 다르면 이 두
이름이 조용히 화면을 바꿀 수 있으니 `@import` 순서를 먼저 확인하세요.

## 배경

이 문서에 적힌 함정은 모두 실제 온보딩에서 드러난 것이에요. 다크 모드 스크립트의 두
함정은 flameware/apt-finder#41,
Next 16 실측은 [#402](https://github.com/flameware/massive-design/issues/402), 서버
컴포넌트 경계는 [#377](https://github.com/flameware/massive-design/issues/377)과
[#412](https://github.com/flameware/massive-design/issues/412),
브랜드 색 API는 [#398](https://github.com/flameware/massive-design/issues/398)이
근거예요. 레지스트리 스코프가 리포 소유자를 따르는 이유는
[ADR-0024](adr/0024-package-scope-follows-the-registry-owner.md)에 있어요.
