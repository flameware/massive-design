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

`loading`은 포인터를 끄고 `aria-busy`를 켠다. 요소를 네이티브 `disabled`로
만들지는 않는다 — 진행 중에 포커스가 튀면 스크린 리더가 자리를 잃는다. 대신
Base UI에 `focusableWhenDisabled`로 내려가 `aria-disabled`가 되는데, Base UI는
네이티브 `disabled`와 `aria-disabled`(loading) **둘 다에서** `data-disabled`를
낸다 — 흐려짐(`opacity-50`)과 상태 층 무력화는 그 속성 하나로 건다.

`render`로 다른 요소를 받는다(Base UI). 링크 버튼은 `render={<a href="…" />}`.

### 면은 상태 바탕(`--ds-state-base`) 한 곳에서만 나온다

면을 가진 variant는 `bg-X` 유틸리티를 쓰지 않는다. `state.css`의 `.state`
유틸리티가 hover/pressed의 `background-color`를 유일하게 쓰는 선언이고, 쉬는
상태에서는 `--ds-state-base` 값을 그대로 칠한다 — 그래서 `bg-X`가 따로
필요 없다. 예전에는 `bg-X`와 `--ds-state-base` 둘 다 있었는데, 같은
property·같은 specificity를 놓고 Tailwind의 클래스 방출 순서가 결과를
갈랐다 — `bg-X`가 `.state` 뒤에 나오면 hover·pressed가 시각적으로 아무
효과도 내지 않았다([#299](https://github.com/flameware/massive-design/issues/299)).

`className`으로 소비처가 면을 덧대면(`className="bg-emerald-500"`) 그 면이
다시 상태 레이어를 이긴다 — `bg-X`가 사라졌으니 `tailwind-merge`가 걷어낼
상대가 없다. 면을 바꾸고 싶으면 `className`이 아니라 `style={{ "--ds-state-base": "var(--ds-bg-accent-soft)" }}`처럼 같은 변수를 겨눠야 상태 레이어가
계속 맞물린다.

## Icon

```tsx
import { Icon } from "@flameware/ui/icon"
import { Save } from "lucide-react"

<Icon icon={Save} size="md" />
```

`lucide-react`를 감싸 크기를 타이포 스케일에 물린 세 값(`sm`·`md`·`lg` = 14 ·
16 · 18px)으로만 받는다. `lucide-react`는 **peer**이고 `optional`이다 — Icon을
쓰지 않는 소비처는 이 무게를 지지 않는다. Icon 자신은 `aria-hidden`이
기본이다: 이름은 항상 Icon 밖(`aria-label`이나 곁의 텍스트)에 있어야 한다.

## 색 — semantic 유틸리티

`bg-*`·`text-*`·`border-*`는 semantic 이름만 받는다. primitive 팔레트
(`--ds-palette-*`)는 `@theme`에 없어서 유틸리티로 직접 쓰면 조용히 아무 CSS도
나오지 않는다 — Storybook의 **Foundations/색** 챕터가 전체 이름 표를 보여준다.
