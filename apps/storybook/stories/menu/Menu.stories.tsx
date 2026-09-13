import { Avatar } from "@flameware/ui/avatar"
import { Menu } from "@flameware/ui/menu"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"

import type { KeyboardContract } from "../keyboard"
import type { ComponentMeta } from "../meta"

/* 문서 페이지의 props 표는 `Menu.Item`에서 난다 — 네임스페이스 전체(`Menu`)는
 * 함수 컴포넌트가 아니라 조립을 위한 이름 다발이라 `component`가 될 수 없다.
 * Item이 유일하게 자기 축(`variant`)을 갖는 파트다(menu.tsx). */
const meta = {
  title: "Overlays/Menu",
  component: Menu.Item,
  parameters: { ds: { status: "stable", since: "0.2.0" } },
} satisfies Meta<typeof Menu.Item> & ComponentMeta

export default meta

type Story = StoryObj<typeof meta>

/* 기본 조립 — 트리거·항목·구분선·파괴적 항목. 트리거는 Avatar다: 인증 헤더의
 * 사용자 메뉴가 이 모양 그대로다(#285 AC). `render`로 트리거의 실제 엘리먼트를
 * Avatar.Root(`<span>`)로 바꾸므로 `nativeButton={false}`를 함께 준다 — 그래야
 * Base UI가 버튼 고유 동작(native activation) 대신 role·키보드 처리를 직접
 * 붙인다(Button의 같은 판단, button.tsx).
 *
 * `size="md"`(32px)를 쓴다 — `sm`(24px)은 Avatar의 `overflow-hidden`(이미지
 * 클리핑용, avatar.tsx)이 Trigger의 `hit-area` 유사요소까지 함께 잘라, 시각
 * 치수와 정확히 같은 경계에서 히트 영역 계기가 1px 오차로 하한 미달을 읽는다
 * (#285에서 발견). 트리거로 쓰는 Avatar는 애초에 24px보다 크게 두는 편이
 * 안전하다 — sm은 목록 안에서 장식으로만 쓴다(Avatar 스토리 참고).
 *
 * 맨 위 이메일 줄이 `Menu.GroupLabel`이다 (#320). 소비처(invest diary)의 헤더
 * 사용자 메뉴가 이 줄을 `Menu.Item`처럼 생긴 손조립 `<div><p>`로 그리고 있었다 —
 * 눌리지도 않는 것이 항목으로 보이고, 화살표로 옮겨 다닐 때만 아니라는 게
 * 드러났다. Label은 포커스 대상이 아니고 자기를 감싼 `Menu.Group`의 이름이 된다. */
export const Playground: Story = {
  render: () => (
    <Menu.Root>
      <Menu.Trigger
        data-testid="menu-trigger"
        aria-label="사용자 메뉴"
        nativeButton={false}
        render={
          <Avatar.Root size="md">
            <Avatar.Fallback>SK</Avatar.Fallback>
          </Avatar.Root>
        }
      />
      <Menu.Popup>
        <Menu.Group>
          <Menu.GroupLabel>seongki@example.com</Menu.GroupLabel>
          <Menu.Item>프로필</Menu.Item>
          <Menu.Item>설정</Menu.Item>
        </Menu.Group>
        <Menu.Separator />
        <Menu.Item variant="destructive">로그아웃</Menu.Item>
      </Menu.Popup>
    </Menu.Root>
  ),
}

/* 팝업을 `open`으로 강제해 항목이 실제로 그려진 그림을 문서에 고정한다 — Select·
 * Combobox의 `펼친 목록`과 같은 이유(#386): 닫힌 트리거만 렌더하는 스토리로는
 * 항목의 면·여백·체크 표시가 어떤 대조에도 잡히지 않는다. `GroupLabel`·`Item`·
 * `CheckboxItem`(켜진 것과 꺼진 것)·`Separator`·파괴적 항목이 한 팝업에 다 있다.
 * 트리거는 Playground의 Avatar가 아니라 글자 버튼이다 — 이 그림의 대상은 팝업
 * 안의 항목이고, 트리거 모양은 이미 Playground가 고정한다.
 *
 * `modal={false}`는 계기를 위한 것이다 — 모달이면 Base UI가 문서 전체를 덮는
 * 내부 백드롭을 깔아 트리거가 `elementFromPoint`에 잡히지 않는다(Select의
 * `펼친 목록`과 같은 판단). */
export const Expanded: Story = {
  name: "펼친 메뉴",
  render: () => (
    <div style={{ minHeight: "16rem" }}>
      <Menu.Root open modal={false}>
        <Menu.Trigger>보기 옵션</Menu.Trigger>
        <Menu.Popup>
          <Menu.Group>
            <Menu.GroupLabel>seongki@example.com</Menu.GroupLabel>
            <Menu.Item>프로필</Menu.Item>
            <Menu.Item>설정</Menu.Item>
          </Menu.Group>
          <Menu.Separator />
          <Menu.Group>
            <Menu.GroupLabel>보기</Menu.GroupLabel>
            <Menu.CheckboxItem defaultChecked>알림 표시</Menu.CheckboxItem>
            <Menu.CheckboxItem>보관함 표시</Menu.CheckboxItem>
          </Menu.Group>
          <Menu.Separator />
          <Menu.Item variant="destructive">로그아웃</Menu.Item>
        </Menu.Popup>
      </Menu.Root>
    </div>
  ),
}

/* 체크 항목 — 비제어. `defaultChecked`만 주면 Menu가 자기 상태를 스스로 든다.
 * 화면에 상태를 글자로 적어 밖에서 보이게 한다(스토리 테스트가 그것을 잰다). */
export const CheckboxUncontrolled: Story = {
  name: "체크 항목 — 비제어",
  render: () => {
    function Fixture() {
      const [count, setCount] = useState(0)
      return (
        <Menu.Root>
          <Menu.Trigger data-testid="uncontrolled-trigger">보기 옵션</Menu.Trigger>
          <Menu.Popup>
            <Menu.CheckboxItem
              data-testid="uncontrolled-item"
              onCheckedChange={() => setCount((n) => n + 1)}
            >
              알림 표시
            </Menu.CheckboxItem>
          </Menu.Popup>
          <span data-testid="uncontrolled-count">{count}</span>
        </Menu.Root>
      )
    }
    return <Fixture />
  },
}

/* 체크 항목 — 제어. 체크 여부를 Menu 밖의 state가 들고, 그 값을 다시 화면에
 * 적어 리렌더가 실제로 반영됐는지 보여준다 — 제어 컴포넌트의 요점이다. */
export const CheckboxControlled: Story = {
  name: "체크 항목 — 제어",
  render: () => {
    function Fixture() {
      const [checked, setChecked] = useState(true)
      return (
        <Menu.Root>
          <Menu.Trigger data-testid="controlled-trigger">보기 옵션</Menu.Trigger>
          <Menu.Popup>
            <Menu.CheckboxItem
              data-testid="controlled-item"
              checked={checked}
              onCheckedChange={setChecked}
            >
              알림 표시
            </Menu.CheckboxItem>
          </Menu.Popup>
          <span data-testid="controlled-state">{checked ? "켜짐" : "꺼짐"}</span>
        </Menu.Root>
      )
    }
    return <Fixture />
  },
}

/* 그룹과 제목 (#320) — `Menu.Group`이 관련 항목을 묶고 `Menu.GroupLabel`이 그
 * 묶음의 이름이 된다. Base UI가 Label의 `id`를 Group의 `aria-labelledby`에 잇고
 * Label 자신은 `aria-hidden`으로 접근성 트리에서 내린다 — 그래서 스크린 리더가
 * "seongki@example.com 그룹, 프로필 메뉴 항목"처럼 한 번만 읽는다. Label을
 * Group 밖에 두면 Base UI가 던진다(`MenuGroupContext` 없음): 제목은 언제나
 * 무언가의 제목이고, 그 무언가가 Group이다.
 *
 * 두 번째 묶음이 `Menu.Label`을 쓴다 — `GroupLabel`의 짧은 별칭이고 같은
 * 컴포넌트다. 이 리포에서 별칭을 적는 자리는 **여기 하나뿐**이다: 정본 철자가
 * 하나여야 나중에 이 파트를 훑는 사람이 절반을 놓치지 않는다(menu.tsx 주석). */
export const Groups: Story = {
  name: "그룹과 제목",
  render: () => (
    <Menu.Root>
      <Menu.Trigger data-testid="groups-trigger">사용자 메뉴</Menu.Trigger>
      <Menu.Popup>
        <Menu.Group>
          <Menu.GroupLabel>seongki@example.com</Menu.GroupLabel>
          <Menu.Item>프로필</Menu.Item>
          <Menu.Item>설정</Menu.Item>
        </Menu.Group>
        <Menu.Separator />
        <Menu.Group>
          <Menu.Label>작업 공간</Menu.Label>
          <Menu.Item>팀 초대</Menu.Item>
          <Menu.Item>청구</Menu.Item>
        </Menu.Group>
        <Menu.Separator />
        <Menu.Item variant="destructive">로그아웃</Menu.Item>
      </Menu.Popup>
    </Menu.Root>
  ),
}

/* 키보드 계약을 재는 스토리 (#285 AC) — 트리거에서 Enter/Space/ArrowDown으로
 * 열고, ArrowDown/Up으로 항목 사이를 옮기고, Esc로 닫으면 포커스가 트리거로
 * 돌아온다. Base UI가 실제 DOM 포커스를 항목에 옮기므로(roving focus) 매 계약이
 * `focused`로 잰다 — 계기는 test/stories.test.mjs가 공유한다. */
const keyboard: KeyboardContract[] = [
  {
    name: "Enter가 트리거에서 메뉴를 열고 첫 항목에 포커스를 둔다",
    focus: "[data-testid=kb-trigger]",
    press: ["Enter"],
    expect: { focused: "[data-testid=kb-profile]" },
  },
  {
    name: "Space가 트리거에서 메뉴를 연다",
    focus: "[data-testid=kb-trigger]",
    press: ["Space"],
    expect: { focused: "[data-testid=kb-profile]" },
  },
  {
    /* #320의 계약이다 — 팝업이 열리고 포커스가 그룹 제목을 **건너** 첫 항목에
     * 간다. 아래 픽스처의 첫 자식이 `Menu.GroupLabel`이므로, 제목이 항목으로
     * 등록되는 순간 이 계약이 깨진다 */
    name: "ArrowDown이 메뉴를 열고 그룹 제목을 건너 첫 항목에 포커스를 둔다",
    focus: "[data-testid=kb-trigger]",
    press: ["ArrowDown"],
    expect: { focused: "[data-testid=kb-profile]" },
  },
  {
    /* 위 계약만으로는 "제목이 첫 걸음을 먹었지만 두 번째 걸음이 마침 첫 항목에
     * 닿았다"와 구분되지 않는다. 걸음 수를 세어 끝까지 간다 — 제목 둘이 항목으로
     * 등록되면 셋째 ArrowDown은 kb-logout이 아니라 kb-notify에 선다 */
    name: "ArrowDown 셋이 그룹 제목 둘을 건너 마지막 항목에 닿는다",
    focus: "[data-testid=kb-trigger]",
    press: ["ArrowDown", "ArrowDown", "ArrowDown"],
    expect: { focused: "[data-testid=kb-logout]" },
  },
  {
    name: "ArrowDown이 다음 항목으로 옮긴다",
    focus: "[data-testid=kb-trigger]",
    press: ["ArrowDown", "ArrowDown"],
    expect: { focused: "[data-testid=kb-notify]" },
  },
  {
    name: "ArrowUp이 이전 항목으로 옮긴다",
    focus: "[data-testid=kb-trigger]",
    press: ["ArrowDown", "ArrowDown", "ArrowUp"],
    expect: { focused: "[data-testid=kb-profile]" },
  },
  {
    name: "Enter가 체크 항목을 토글한다 — 메뉴는 열린 채로 남는다",
    focus: "[data-testid=kb-trigger]",
    press: ["ArrowDown", "ArrowDown", "Enter"],
    expect: { text: { "[data-testid=kb-notify-state]": "켜짐" } },
  },
  {
    name: "Esc가 닫고 포커스를 트리거로 되돌린다",
    focus: "[data-testid=kb-trigger]",
    press: ["ArrowDown", "Escape"],
    expect: { focused: "[data-testid=kb-trigger]" },
  },
]

export const Keyboard: Story = {
  name: "키보드 계약",
  parameters: { keyboard },
  render: () => <KeyboardFixture />,
}

function KeyboardFixture() {
  const [notify, setNotify] = useState(false)
  return (
    <Menu.Root>
      <Menu.Trigger data-testid="kb-trigger">사용자 메뉴</Menu.Trigger>
      <Menu.Popup>
        <Menu.Group>
          <Menu.GroupLabel>seongki@example.com</Menu.GroupLabel>
          <Menu.Item data-testid="kb-profile">프로필</Menu.Item>
          <Menu.CheckboxItem
            data-testid="kb-notify"
            checked={notify}
            onCheckedChange={setNotify}
          >
            알림 표시 <span data-testid="kb-notify-state">{notify ? "켜짐" : "꺼짐"}</span>
          </Menu.CheckboxItem>
        </Menu.Group>
        <Menu.Separator />
        <Menu.Group>
          <Menu.GroupLabel>세션</Menu.GroupLabel>
          <Menu.Item variant="destructive" data-testid="kb-logout">
            로그아웃
          </Menu.Item>
        </Menu.Group>
      </Menu.Popup>
    </Menu.Root>
  )
}
