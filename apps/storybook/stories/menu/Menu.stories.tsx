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
  parameters: { ds: { status: "preview", since: "0.2.0" } },
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
 * 안전하다 — sm은 목록 안에서 장식으로만 쓴다(Avatar 스토리 참고). */
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
        <Menu.Item>프로필</Menu.Item>
        <Menu.Item>설정</Menu.Item>
        <Menu.Separator />
        <Menu.Item variant="destructive">로그아웃</Menu.Item>
      </Menu.Popup>
    </Menu.Root>
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
    name: "ArrowDown이 트리거에서 메뉴를 연다",
    focus: "[data-testid=kb-trigger]",
    press: ["ArrowDown"],
    expect: { focused: "[data-testid=kb-profile]" },
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
        <Menu.Item data-testid="kb-profile">프로필</Menu.Item>
        <Menu.CheckboxItem
          data-testid="kb-notify"
          checked={notify}
          onCheckedChange={setNotify}
        >
          알림 표시 <span data-testid="kb-notify-state">{notify ? "켜짐" : "꺼짐"}</span>
        </Menu.CheckboxItem>
        <Menu.Separator />
        <Menu.Item variant="destructive" data-testid="kb-logout">
          로그아웃
        </Menu.Item>
      </Menu.Popup>
    </Menu.Root>
  )
}
