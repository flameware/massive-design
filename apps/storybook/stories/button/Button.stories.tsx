import { Button } from "@flameware/ui/button"
import type { Meta, StoryObj } from "@storybook/react-vite"
import type * as React from "react"
import { useState } from "react"

import type { KeyboardContract } from "../keyboard"
import type { ComponentMeta } from "../meta"

/* title의 첫 마디가 분류이고 사이드바의 묶음이 거기서 난다. `satisfies`가 그
 * 첫 마디를 열 개 분류로 묶는다 — 오타는 컴파일에서 죽는다(stories/meta.ts). */
const meta = {
  title: "Actions/Button",
  component: Button,
  parameters: { ds: { status: "preview", since: "0.1.0" } },
  args: { children: "저장", variant: "default", size: "md", loading: false, disabled: false },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "destructive", "outline", "secondary", "ghost", "link"],
    },
    size: { control: "select", options: ["sm", "md", "lg", "icon"] },
    loading: { control: "boolean" },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof Button> & ComponentMeta

export default meta

type Story = StoryObj<typeof meta>

/* 축을 하나씩 돌려 보는 자리. 문서 페이지의 props 표가 이 스토리의 argTypes에서 난다 */
export const Playground: Story = {}

/* 아래 세 스토리가 문서의 "변형" 절이다. 한 스토리가 한 축을 통째로 보여주는
 * 이유는 값을 나란히 놓고 비교하는 것이 문서의 일이기 때문이다 — 값마다 스토리를
 * 하나씩 두면 사이드바만 길어지고 비교는 못 한다. */
export const Variants: Story = {
  render: () => (
    <Row>
      <Button variant="default">기본</Button>
      <Button variant="destructive">삭제</Button>
      <Button variant="outline">테두리</Button>
      <Button variant="secondary">보조</Button>
      <Button variant="ghost">고스트</Button>
      <Button variant="link">링크</Button>
    </Row>
  ),
}

export const Sizes: Story = {
  render: () => (
    <Row>
      <Button size="sm">작게</Button>
      <Button size="md">보통</Button>
      <Button size="lg">크게</Button>
      <Button size="icon" aria-label="새로 고침">
        <RefreshIcon />
      </Button>
    </Row>
  ),
}

/* `loading`은 포인터만 막는 것이 아니라 **활성화 자체**를 막는다. 그래서 옆에
 * `disabled`를 같이 둔다 — 둘의 차이(포커스를 남기는가)가 이 그림의 요점이다. */
export const States: Story = {
  render: () => (
    <Row>
      <Button loading>저장 중</Button>
      <Button disabled>비활성</Button>
      <Button variant="outline" loading>
        불러오는 중
      </Button>
    </Row>
  ),
}

/* 아이콘 전용 버튼은 이름이 그림에만 있으므로 `aria-label`이 필수다. 빠뜨리면
 * 스토리 테스트의 axe가 문다 — 그것이 이 스토리가 여기 있는 이유의 절반이다.
 * 나머지 절반은 히트 영역이다: `size="icon"`은 36px이라 하한을 이미 넘는다. */
export const IconOnly: Story = {
  render: () => (
    <Row>
      <Button size="icon" aria-label="새로 고침">
        <RefreshIcon />
      </Button>
      <Button size="icon" variant="outline" aria-label="새로 고침">
        <RefreshIcon />
      </Button>
      <Button size="icon" variant="ghost" aria-label="새로 고침">
        <RefreshIcon />
      </Button>
    </Row>
  ),
}

/* `render`로 다른 요소를 받는다. `nativeButton`을 끄라고 소비처에 시키지 않는
 * 것이 계약이다 — Button이 넘어온 요소를 보고 스스로 끈다. */
export const AsLink: Story = {
  render: () => (
    <Row>
      <Button render={<a href="#login" />}>로그인</Button>
      <Button variant="link" render={<a href="#help" />}>
        도움말
      </Button>
    </Row>
  ),
}

/* 키보드 계약을 **재는** 스토리. 아래 parameters.keyboard가 계약의 선언이고,
 * test/stories.test.mjs가 그것을 그대로 실행한다. 활성화는 횟수를 화면에 적어
 * 밖에서 보이게 만든다 — 핸들러가 불렸는지를 안에서 들여다보지 않기 위해서다. */
const keyboard: KeyboardContract[] = [
  {
    name: "Tab이 첫 버튼에 닿는다",
    press: ["Tab"],
    expect: { focused: "[data-testid=save]" },
  },
  {
    name: "Enter가 활성화한다",
    focus: "[data-testid=save]",
    press: ["Enter"],
    expect: { focused: "[data-testid=save]", text: { "[data-testid=save-count]": "1" } },
  },
  {
    name: "Space가 활성화한다",
    focus: "[data-testid=save]",
    press: ["Space"],
    expect: { text: { "[data-testid=save-count]": "1" } },
  },
  {
    name: "loading은 포커스를 남기고 활성화만 막는다",
    focus: "[data-testid=loading]",
    press: ["Enter", "Space"],
    expect: { focused: "[data-testid=loading]", text: { "[data-testid=loading-count]": "0" } },
  },
  {
    name: "disabled는 Tab이 건너뛴다 — loading 다음은 뒤쪽 링크다",
    focus: "[data-testid=loading]",
    press: ["Tab"],
    expect: { focused: "[data-testid=after]" },
  },
]

export const Keyboard: Story = {
  name: "키보드 계약",
  parameters: { keyboard },
  render: () => <KeyboardFixture />,
}

function KeyboardFixture() {
  const [save, setSave] = useState(0)
  const [loading, setLoading] = useState(0)
  return (
    <Row>
      <Button data-testid="save" onClick={() => setSave((n) => n + 1)}>
        저장 <span data-testid="save-count">{save}</span>
      </Button>
      <Button data-testid="loading" loading onClick={() => setLoading((n) => n + 1)}>
        저장 중 <span data-testid="loading-count">{loading}</span>
      </Button>
      <Button data-testid="off" disabled>
        비활성
      </Button>
      <a data-testid="after" href="#end">
        뒤쪽 링크
      </a>
    </Row>
  )
}

/* 스토리들이 값을 나란히 놓는 줄. 문서 껍데기라 DS 컴포넌트가 아니고,
 * Layout 층(#288)이 생겨도 여기로 내려오지 않는다 */
function Row({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", alignItems: "center" }}>
      {children}
    </div>
  )
}

function RefreshIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none">
      <path
        d="M13.5 8a5.5 5.5 0 1 1-1.6-3.9M13 2v3h-3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
