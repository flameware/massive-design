import { Button } from "@flameware/ui/button"
import { Form } from "@flameware/ui/form"
import { Toggle } from "@flameware/ui/toggle"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"

import type { KeyboardContract } from "../keyboard"
import type { ComponentMeta } from "../meta"

const meta = {
  title: "Actions/Toggle",
  component: Toggle,
  parameters: { ds: { status: "preview", since: "0.2.0" } },
  args: { children: "굵게", disabled: false },
  argTypes: {
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof Toggle> & ComponentMeta

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const States: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "0.75rem" }}>
      <Toggle aria-label="꺼짐">꺼짐</Toggle>
      <Toggle aria-label="켜짐" defaultPressed>
        켜짐
      </Toggle>
      <Toggle aria-label="비활성" disabled>
        비활성
      </Toggle>
    </div>
  ),
}

/* 제어와 비제어가 나란히 — Button처럼 누르면 즉시 끝나는 것이 아니라 눌린
 * 상태가 남는다는 것이 Toggle과 Button의 차이다(toggle.tsx). */
export const ControlledVsUncontrolled: Story = {
  name: "제어 vs 비제어",
  render: () => <ControlledFixture />,
}

function ControlledFixture() {
  const [pressed, setPressed] = useState(false)
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
      <Toggle data-testid="controlled" aria-label="제어" pressed={pressed} onPressedChange={setPressed}>
        제어 — {pressed ? "켜짐" : "꺼짐"}
      </Toggle>
      <Button size="sm" variant="outline" onClick={() => setPressed((p) => !p)}>
        밖에서 뒤집기
      </Button>
      <Toggle data-testid="uncontrolled" aria-label="비제어" defaultPressed>
        비제어
      </Toggle>
    </div>
  )
}

/* `name`을 주면 눌린 값을 숨은 입력 하나로 폼에 낸다 — Base UI Toggle 자체는
 * 폼에 등록하지 않으므로 이 컴포넌트가 직접 만든 배선이다(toggle.tsx). */
export const InForm: Story = {
  name: "Form 안에서 제출",
  render: () => <FormFixture />,
}

function FormFixture() {
  const [submitted, setSubmitted] = useState<Record<string, unknown> | null>(null)
  return (
    <Form style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxWidth: "20rem" }} onFormSubmit={(values) => setSubmitted(values)}>
      <Toggle data-testid="notify" name="notify" value="on">
        알림 켜기
      </Toggle>
      <Button type="submit" data-testid="submit">
        제출
      </Button>
      {submitted ? <p data-testid="submitted">{JSON.stringify(submitted)}</p> : null}
    </Form>
  )
}

const keyboard: KeyboardContract[] = [
  {
    name: "Tab이 Toggle에 닿는다",
    press: ["Tab"],
    expect: { focused: "[data-testid=key-toggle]" },
  },
  {
    name: "Enter가 누른다",
    focus: "[data-testid=key-toggle]",
    press: ["Enter"],
    expect: { text: { "[data-testid=key-state]": "켜짐" } },
  },
  {
    // 계약마다 새로 열므로(stories.test.mjs) 이 계약은 자체적으로 Enter로
    // 먼저 켠 뒤 Space로 다시 뗀다 — "Enter가 누른다" 계약의 결과를 물려받지
    // 않는다
    name: "Space가 다시 뗀다",
    focus: "[data-testid=key-toggle]",
    press: ["Enter", "Space"],
    expect: { text: { "[data-testid=key-state]": "꺼짐" } },
  },
]

export const Keyboard: Story = {
  name: "키보드 계약",
  parameters: { keyboard },
  render: () => <KeyboardFixture />,
}

function KeyboardFixture() {
  const [pressed, setPressed] = useState(false)
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <Toggle data-testid="key-toggle" aria-label="키보드 계약" pressed={pressed} onPressedChange={setPressed}>
        토글
      </Toggle>
      <span data-testid="key-state">{pressed ? "켜짐" : "꺼짐"}</span>
    </div>
  )
}
