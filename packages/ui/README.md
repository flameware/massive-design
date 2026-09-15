# @flameware/ui

massive-design의 React 컴포넌트예요. Base UI 위에 Tailwind v4와 cva로 얹었고,
컴포넌트마다 서브패스 하나로 들어와요.

DS를 앱에 처음 붙인다면 [온보딩 가이드](../../docs/consumer-onboarding.md)를 먼저
읽으세요. 환경 변수, CSS 순서, 다크 모드, 브랜드 색, 서버 컴포넌트 경계, Next 16,
shadcn 대조표를 한 장에 담았어요. 이 문서는 설치 방법과 컴포넌트 API를 다뤄요.

## 설치

GitHub Packages에 있어서 `.npmrc`에 레지스트리를 한 줄 적어야 해요.

```
# .npmrc
@flameware:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${FLAMEWARE_PACKAGES_TOKEN}
```

```sh
bun add @flameware/ui @flameware/tokens
```

`FLAMEWARE_PACKAGES_TOKEN`은 `read:packages` 권한을 가진 개인 토큰이에요. Vercel 같은
빌드 환경에서도 같은 이름의 환경 변수로 넣어요.

## 쓰기

스타일은 한 줄이에요. 이 파일이 Tailwind와 토큰과 유틸리티를 모두 끌고 와요.

```css
/* app/globals.css */
@import "@flameware/ui/styles.css";
```

컴포넌트는 저마다의 서브패스로 들어와요.

```tsx
import { Button } from "@flameware/ui/button"

<Button>저장</Button>
<Button variant="secondary" size="sm">취소</Button>
<Button loading>보내는 중</Button>
<Button render={<a href="/signup" />}>회원가입</Button>
```

`"use client"`는 패키지가 붙여요. 앱이 서버와 클라이언트 경계를 고민하지 않아도 돼요.

루트(`@flameware/ui`)에는 `cn`만 있어요. 컴포넌트를 하나도 쓰지 않을 때 번들에
들어가는 바이트를 바닥값이라고 부르는데, 루트를 비워 두는 것이 그 바닥값을 정직하게
유지하는 방법이에요([ADR-0017](../../docs/adr/0017-dependency-weight-is-a-floor-cost.md)).

## Button

| 옵션 | 값 | 기본 |
| --- | --- | --- |
| `variant` | `default` · `destructive` · `outline` · `secondary` · `ghost` · `link` | `default` |
| `size` | `sm` · `md` · `lg` · `icon` | `md` |
| `loading` | `boolean` | `false` |

`loading`은 포인터를 끄고 `aria-busy`를 켜요. 요소를 네이티브 `disabled`로 만들지는
않아요. 진행 중에 포커스가 사라지면 스크린 리더 사용자가 읽던 위치를 잃기 때문이에요.
대신 Base UI에 `focusableWhenDisabled`로 내려가 `aria-disabled`가 돼요. Base UI는
네이티브 `disabled`와 `aria-disabled` 둘 다에서 `data-disabled`를 내므로, 흐려짐
(`opacity-50`)과 상태 층을 끄는 처리는 그 속성 하나로 걸어요.

`render`로 다른 요소를 받을 수 있어요(Base UI). 링크 버튼은 `render={<a href="…" />}`로
써요.

### 배경색은 `className`으로 덧대지 마세요

배경이 있는 variant는 `bg-X` 유틸리티를 쓰지 않아요. `state.css`의 `.state`
유틸리티가 `background-color`를 쓰는 유일한 선언이고, 쉬는 상태에서는
`--ds-state-base` 값을 그대로 칠해요.

그래서 `className="bg-emerald-500"`처럼 배경을 덧대면 그 색이 상태 층을 덮어 hover와
pressed가 보이지 않아요. `tailwind-merge`가 걷어낼 상대가 없기 때문이에요. 배경을
바꾸고 싶으면 같은 변수를 겨눠요.

```tsx
<Button style={{ "--ds-state-base": "var(--ds-bg-accent-soft)" }}>저장</Button>
```

## Icon

```tsx
import { Icon } from "@flameware/ui/icon"
import { Save } from "lucide-react"

<Icon icon={Save} size="md" />
```

`lucide-react`를 감싸 크기를 타이포 스케일에 맞춘 세 값(`sm`, `md`, `lg` = 14, 16,
18px)으로만 받아요. `lucide-react`는 peer 의존성이고 `optional`이라, Icon을 쓰지
않는 앱은 이 무게를 지지 않아요.

Icon은 `aria-hidden`이 기본이에요. 이름은 항상 Icon 밖(`aria-label`이나 곁의 텍스트)에
두세요.

Card, Alert와 마찬가지로 자체 스타일 컴포넌트라 훅도 컨텍스트도 이벤트 핸들러도
없어요. `"use client"`가 없어서 서버 컴포넌트에서 `<Icon icon={CircleAlert} />`를
직접 써도 돼요. 헷갈리기 쉬운 경우와 근거는
[온보딩 가이드 §6](../../docs/consumer-onboarding.md#6-서버-컴포넌트에서-쓸-때)에 있어요.

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

Base UI를 쓰지 않는 자체 스타일 컴포넌트예요. 상태도 이벤트 핸들러도 없어서 서버
컴포넌트로 남아요(`"use client"`가 없어요). `Header`, `Body`, `Footer` 셋 다
선택이라 `Body` 하나만 있는 카드도 유효해요. 그림자 토큰(`shadow-xs`부터
`shadow-xl`까지)은 있지만 `Root`가 강제하지 않아요. 필요하면 `className`으로 얹어요.

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

Card와 마찬가지로 자체 스타일 컴포넌트이고 서버 컴포넌트로 남아요. `tone`은
`neutral`(기본)과 `danger` 둘이에요. 색은 대비 검사를 이미 통과한 조합만 써요.
`danger`는 `bg.danger.soft` 위의 `fg.danger`, `neutral`은 `bg.neutral.soft` 위의
`fg.default`와 `fg.muted`예요.

`role`은 톤을 따라 갈려요. `danger`는 `role="alert"`이라 화면에 나타나는 즉시 읽고,
`neutral`은 `role="status"`라 읽던 것을 끊지 않아요.

앞머리 아이콘은 Alert이 스스로 만들지 않아요. `@flameware/ui/icon`을 `Root`의 첫
자식으로 두세요. 없어도 유효해요.

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

`Root`, `Trigger`, `Popup`, `Group`, `GroupLabel`(별칭 `Label`), `Item`,
`CheckboxItem`, `Separator`를 하나의 이름 아래 둔 묶음이에요. `Popup`이 Base UI의
`Portal`과 `Positioner`를 안에서 함께 열어서 매번 세 겹을 조립하지 않아도 돼요.
화살표 이동, Enter 선택, Esc 닫기는 모두 Base UI가 처리해요.

`variant`(`default`, `destructive`) 옵션은 `Menu.Item`에만 있어요. 배경색은 Button과
같은 이유로 `--ds-state-base` 한 곳에서만 나와요.

`Menu.CheckboxItem`은 `checked`와 `onCheckedChange`(제어), `defaultChecked`(비제어)
둘 다로 동작해요. 기본값으로는 눌러도 메뉴가 닫히지 않아요(`closeOnClick` 기본값
`false`). 여러 옵션을 연달아 켜고 끄는 경우가 많기 때문이에요.

### `Menu.GroupLabel`은 `Menu.Group` 안에 둬야 해요

`Menu.GroupLabel`은 그룹의 제목이에요. 로그인한 계정 주소처럼 누를 수 없는 글을
`Menu.Item`으로 그리지 않기 위한 것이에요. 포커스를 받지 않고 화살표 이동의 걸음도
먹지 않으며, 자기 `id`가 감싼 `Menu.Group`의 `aria-labelledby`가 돼요.

`Menu.Group` 밖에 두면 Base UI가 에러를 내요. 손으로 조립한 `<div><p>`를 팝업 바로
아래에서 그대로 갈아끼울 때 만나기 쉬워요. 제목을 옮길 때는 그 제목이 설명하는
항목까지 함께 `Menu.Group`으로 묶어 주세요.

`Menu.Label`은 같은 컴포넌트의 짧은 별칭이에요. 공식 이름은 `Select.GroupLabel`과
대칭인 `GroupLabel`이니 새로 쓰는 코드는 그쪽을 쓰세요.

## Avatar

```tsx
import { Avatar } from "@flameware/ui/avatar"

<Avatar.Root size="md">
  <Avatar.Image src={user.photoUrl} alt={user.name} />
  <Avatar.Fallback>김서</Avatar.Fallback>
</Avatar.Root>
```

`Root`, `Image`, `Fallback`으로 조립해요. 이미지가 없거나 불러오지 못하면
`Fallback`이 대신 그려져요(Base UI가 로딩 상태를 관리해요). 이니셜을 이름에서 뽑는
규칙은 앱마다 달라서 DS가 계산하지 않아요. `Fallback`의 children으로 문자열을 그대로
주세요. `size`는 `sm`(24px), `md`(32px), `lg`(40px)이고 `sm`이 포인터 하한과 같은
크기예요.

## Separator

```tsx
import { Separator } from "@flameware/ui/separator"

<Separator />
<Separator orientation="vertical" />
```

파트가 없는 컴포넌트라 Button과 같은 모양으로 들어와요. 옵션은
`orientation`(`horizontal`, `vertical`) 하나예요. 선은 `border-*`로 그어요.
`border.default`는 border-color 이름 공간에만 등록돼 있어서 `bg-border-default`
같은 클래스는 `@theme`에 없는 유틸리티라 아무 CSS도 내지 않아요.

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

`Root`, `Trigger`, `Popup`으로 조립해요. `Popup`이 `Portal`과 `Positioner`를 안에서
함께 열어요. 호버(기본 지연 600ms)와 포커스(지연 없음) 둘 다 기본으로 열려요.

아이콘만 있는 트리거는 이름이 그림에만 있으므로 `aria-label`이 필요해요. Tooltip의
내용이 그 이름을 대신하지 않아요.

## 색 유틸리티

`bg-*`, `text-*`, `border-*`는 semantic 이름만 받아요. 팔레트 변수(`--ds-palette-*`)는
`@theme`에 없어서 유틸리티로 직접 쓰면 아무 CSS도 나오지 않아요. 전체 이름 표는
Storybook의 **Foundations/색** 챕터에 있어요.

## 배경

이 패키지는 1세대 shadcn 기반 컴포넌트를 Base UI 위로 다시 지은 2세대예요. 그 결정
전부는 [ADR-0023](../../docs/adr/0023-second-generation-base-ui.md)에 있어요.

Button의 배경이 `--ds-state-base` 한 곳에서만 나오게 된 것은
[#299](https://github.com/flameware/massive-design/issues/299) 때문이에요. 예전에는
`bg-X`와 `--ds-state-base`가 둘 다 있었는데, 같은 property와 같은 우선순위를 두고
Tailwind의 클래스 방출 순서가 결과를 갈랐어요. `bg-X`가 `.state` 뒤에 나오면 hover와
pressed가 아무 효과도 내지 않았어요.

Icon에 `"use client"`가 없는 것도 되돌린 결정이에요
([#412](https://github.com/flameware/massive-design/issues/412)). 근거 없이 붙어
있던 지시어를 걷어내 서버 컴포넌트로 옮겼어요.
