# @flameware/ui

massive-design의 2세대 컴포넌트. Base UI 위에 Tailwind v4 + cva로 얹는다
([ADR-0023](../../docs/adr/0023-second-generation-base-ui.md)).

## 설치

GitHub Packages에 있으므로 스코프의 레지스트리를 한 줄 적어야 한다.

```
# .npmrc
@flameware:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

```sh
bun add @flameware/ui @flameware/tokens
```

`GITHUB_TOKEN`은 `read:packages` 스코프의 개인 토큰이다. Vercel 같은 빌드
환경에서도 같은 이름의 환경 변수로 준다.

## 쓰기

스타일은 한 줄이다. 이 파일이 Tailwind와 토큰과 유틸리티를 다 끌고 온다.

```css
/* app/globals.css */
@import "@flameware/ui/styles.css";
```

컴포넌트는 저마다의 서브패스로 들어온다.

```tsx
import { Button } from "@flameware/ui/button"

<Button>저장</Button>
<Button variant="secondary" size="sm">취소</Button>
<Button loading>보내는 중</Button>
<Button render={<a href="/signup" />}>회원가입</Button>
```

`"use client"`는 패키지가 박는다 — 소비처가 경계를 고민하지 않는다.

루트(`@flameware/ui`)에는 `cn`만 있다. 컴포넌트를 하나도 쓰지 않을 때 무는
바이트가 **바닥값**이고([ADR-0017](../../docs/adr/0017-dependency-weight-is-a-floor-cost.md)),
루트를 비워 두는 것이 그 저울을 정직하게 유지하는 방법이다.

## Button

| 축 | 값 | 기본 |
| --- | --- | --- |
| `variant` | `default` · `destructive` · `outline` · `secondary` · `ghost` · `link` | `default` |
| `size` | `sm` · `md` · `lg` · `icon` | `md` |
| `loading` | `boolean` | `false` |

`loading`은 포인터를 끄고 `aria-busy`를 켠다. 요소를 `disabled`로 만들지는
않는다 — 진행 중에 포커스가 튀면 스크린 리더가 자리를 잃는다.

`render`로 다른 요소를 받는다(Base UI). 링크 버튼은 `render={<a href="…" />}`.
