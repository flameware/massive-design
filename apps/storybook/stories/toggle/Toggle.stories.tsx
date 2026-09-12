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
  parameters: { ds: { status: "stable", since: "0.2.0" } },
  args: { children: "굵게", disabled: false, size: "md" },
  argTypes: {
    disabled: { control: "boolean" },
    size: { control: "select", options: ["sm", "md", "lg"] },
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

/* #369 — `size` 축. 값 이름은 `Button`의 것과 같다(`sm`·`md`·`lg`). `md`는
 * 지금까지 고정이던 모양 그대로다(게시 인스턴스 보존, toggle.tsx). `sm`은
 * 소비처(invest diary) 필터 칩이 손으로 얹던 `h-auto px-2 py-1 text-xs`를
 * 대신한다 — 시각 높이가 24px 밑이므로 hit-area가 실제로 24×24 하한을
 * 진다(다음 Size24 스토리가 그것을 재게 한다). */
export const Sizes: Story = {
  name: "크기",
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
      <Toggle aria-label="작게" size="sm">
        작게
      </Toggle>
      <Toggle aria-label="보통" size="md">
        보통
      </Toggle>
      <Toggle aria-label="크게" size="lg">
        크게
      </Toggle>
    </div>
  ),
}

/* `size="sm"`이 24×24 하한을 실제로 넘는지는 판단이 아니라 계기가 잰다
 * (stories.test.mjs — Playwright가 이 스토리를 열어 `elementFromPoint`로
 * hit-area의 실효 히트 영역을 잰다). 시각 치수(`h-auto px-2 py-1 text-xs`,
 * 24px 밑)는 그대로 두고 `hit-area`가 하한을 지는 것을 보이는 것이 이
 * 스토리의 유일한 목적이다 — 선택이 아니라 필수(ADR-0020, Button/Spinner의
 * 24px 스토리 선례). */
export const Size24: Story = {
  name: "size=sm — 24×24 하한",
  render: () => (
    <Toggle aria-label="필터 칩" size="sm">
      2026
    </Toggle>
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
