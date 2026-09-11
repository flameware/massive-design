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

## Card

```tsx
import { Card } from "@flameware/ui/card"

<Card.Root>
  <Card.Header>
    <strong>포트폴리오 요약</strong>
  </Card.Header>
  <Card.Body>평가액 12,450,000원</Card.Body>
  <Card.Footer>5분 전 갱신</Card.Footer>
</Card.Root>
```

Base UI 뒤가 없는 자체 스타일 primitive다 — 상태도 이벤트 핸들러도 없어
서버 컴포넌트로 남는다(`"use client"`가 없다). `Header`·`Body`·`Footer` 셋 다
옵셔널이라 `Body` 하나만 있는 카드도 유효하다. 그림자 토큰(`shadow-xs`~
`shadow-xl`)은 있지만 Root가 강제하지 않는다 — 필요하면 `className`으로 얹는다.

## Alert

```tsx
import { Alert } from "@flameware/ui/alert"
import { Icon } from "@flameware/ui/icon"
import { CircleAlert } from "lucide-react"

<Alert.Root tone="danger">
  <Icon icon={CircleAlert} />
  <Alert.Title>로그인하지 못했습니다</Alert.Title>
  <Alert.Description>이메일 또는 비밀번호를 확인해 주세요.</Alert.Description>
</Alert.Root>
```

Card와 마찬가지로 자체 스타일 primitive이고 서버 컴포넌트로 남는다. `tone`은
`neutral`(기본)·`danger` 둘뿐이다(Phase 1). 색은 대비 게이트
(`packages/tokens/scripts/contrast.mjs`)가 이미 검증한 조합만 쓴다 — `danger`는
`fg.danger` on `bg.danger.soft`, `neutral`은 `fg.default`/`fg.muted` on
`bg.neutral.soft`.

`role`은 톤을 따라 갈린다 — `danger`는 `role="alert"`(assertive, 삽입 즉시
읽는다), `neutral`은 `role="status"`(polite, 읽던 것을 끊지 않는다). 앞머리
아이콘은 Alert이 스스로 만들지 않는다 — `@flameware/ui/icon`을 `Root`의 첫
자식으로 둔다. 없어도 유효하다.

## Menu

```tsx
import { Menu } from "@flameware/ui/menu"

<Menu.Root>
  <Menu.Trigger>사용자 메뉴</Menu.Trigger>
  <Menu.Popup>
    <Menu.Group>
      <Menu.GroupLabel>seongki@example.com</Menu.GroupLabel>
      <Menu.Item>프로필</Menu.Item>
      <Menu.Item>설정</Menu.Item>
    </Menu.Group>
    <Menu.Separator />
    <Menu.Item variant="destructive">로그아웃</Menu.Item>
    <Menu.CheckboxItem checked={notify} onCheckedChange={setNotify}>
      알림 표시
    </Menu.CheckboxItem>
  </Menu.Popup>
</Menu.Root>
```

네임스페이스형이다(ADR-0023 §5) — `Root`·`Trigger`·`Popup`·`Group`·`GroupLabel`
(별칭 `Label`)·`Item`·`CheckboxItem`·`Separator`를 하나의 이름 아래 둔다. `Popup`이 Base UI의
`Portal`·`Positioner`를 안에서 함께 열어 소비처가 매번 세 겹을 조립하지 않는다.
화살표 이동·Enter 선택·Esc 닫기는 전부 Base UI가 진다.

`Menu.Item`만 자기 축(`variant: "default" | "destructive"`)을 갖는다 — root에는
그런 축이 없어서 규칙이 허용하는 자리다(rules.md 축과 이름 공간). 면은 Button과
같은 이유로 상태 바탕(`--ds-state-base`) 한 곳에서만 나온다.

`Menu.GroupLabel`은 그룹의 제목이다 — 누를 수 없는 글(로그인한 계정 주소 같은
것)을 `Menu.Item`으로 그리지 않기 위한 자리다. 포커스를 받지 않고 화살표 이동의
걸음도 먹지 않으며, 자기 `id`가 감싼 `Menu.Group`의 `aria-labelledby`가 된다.
**`Menu.Group` 밖에 두면 Base UI가 던진다** — 개발 빌드에서 바로 드러나는
오류이고, 손조립 `<div><p>`를 팝업 바로 아래에서 그대로 갈아끼우면 그것을 만난다.
제목을 옮길 때 감쌀 항목까지 함께 `Menu.Group`으로 묶어야 한다.

`Menu.Label`은 같은 컴포넌트의 짧은 별칭이다. 정본 이름은 `Select.GroupLabel`과
대칭인 `GroupLabel`이고, 새로 쓰는 코드는 그쪽을 쓰는 편이 낫다.

`Menu.CheckboxItem`은 `checked`/`onCheckedChange`(제어)와 `defaultChecked`(비제어)
둘 다로 동작한다. 기본은 눌러도 메뉴가 닫히지 않는다(`closeOnClick` 기본값
`false`) — 여러 옵션을 연달아 켜고 끄는 자리이기 때문이다.

## Avatar

```tsx
import { Avatar } from "@flameware/ui/avatar"

<Avatar.Root size="md">
  <Avatar.Image src={user.photoUrl} alt={user.name} />
  <Avatar.Fallback>김서</Avatar.Fallback>
</Avatar.Root>
```

네임스페이스형 — `Root`·`Image`·`Fallback`. 이미지가 없거나 실패하면
`Fallback`이 대신 그려진다(Base UI가 로딩 상태를 관리). 이니셜을 이름에서
뽑는 규칙은 소비처마다 달라 DS가 계산하지 않는다 — `Fallback`의 children으로
문자열을 그대로 준다. `size`는 `sm`(24px)·`md`(32px)·`lg`(40px)이고 `sm`은
포인터 하한과 같은 값이다.

## Separator

```tsx
import { Separator } from "@flameware/ui/separator"

<Separator />
<Separator orientation="vertical" />
```

파트가 없는 primitive라 Button과 같은 모양으로 나간다(네임스페이스가 아니다).
`orientation`(`horizontal`·`vertical`) 하나뿐이다. 선은 `border-*`로 긋는다 —
`border.default`는 border-color 이름공간에만 등록돼 있어서 `bg-border-default`
같은 클래스는 `@theme`에 없는 유틸리티라 조용히 무효가 된다.

## Tooltip

```tsx
import { Tooltip } from "@flameware/ui/tooltip"

<Tooltip.Root>
  <Tooltip.Trigger aria-label="저장">
    <SaveIcon />
  </Tooltip.Trigger>
  <Tooltip.Popup>저장</Tooltip.Popup>
</Tooltip.Root>
```

네임스페이스형 — `Root`·`Trigger`·`Popup`(`Popup`이 `Portal`·`Positioner`를
안에서 함께 연다). 호버(기본 지연 600ms)와 포커스(지연 없음) 둘 다 기본으로
연다. 아이콘 전용 트리거는 이름이 그림에만 있으므로 `aria-label`이 필수다 —
Tooltip이 그것을 대신하지 않는다.

## 색 — semantic 유틸리티

`bg-*`·`text-*`·`border-*`는 semantic 이름만 받는다. primitive 팔레트
(`--ds-palette-*`)는 `@theme`에 없어서 유틸리티로 직접 쓰면 조용히 아무 CSS도
나오지 않는다 — Storybook의 **Foundations/색** 챕터가 전체 이름 표를 보여준다.
