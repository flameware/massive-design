import { Button } from "@flameware/ui/button"
import { Form } from "@flameware/ui/form"
import { Toggle } from "@flameware/ui/toggle"
import { ToggleGroup } from "@flameware/ui/toggle-group"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"

import type { KeyboardContract } from "../keyboard"
import type { ComponentMeta } from "../meta"

/* 항목은 이 컴포넌트의 파트가 아니라 그냥 `Toggle`이다 — Base UI 자신의
 * anatomy가 평평하다(toggle-group.tsx). 그래서 `component`는 ToggleGroup
 * 하나이고, args 표는 그룹 축(orientation·multiple 등)만 보여준다. */
const meta = {
  title: "Actions/ToggleGroup",
  component: ToggleGroup,
  parameters: { ds: { status: "preview", since: "0.2.0" } },
  args: { orientation: "horizontal", disabled: false },
  argTypes: {
    orientation: { control: "select", options: ["horizontal", "vertical"] },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof ToggleGroup> & ComponentMeta

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: (args) => (
    <ToggleGroup {...args} defaultValue={["month"]} aria-label="기간">
      <Toggle value="week">1주</Toggle>
      <Toggle value="month">1개월</Toggle>
      <Toggle value="year">1년</Toggle>
    </ToggleGroup>
  ),
}

export const Multiple: Story = {
  name: "다중 선택",
  render: () => (
    <ToggleGroup multiple defaultValue={["bold"]} aria-label="서식">
      <Toggle value="bold">B</Toggle>
      <Toggle value="italic">I</Toggle>
      <Toggle value="underline">U</Toggle>
    </ToggleGroup>
  ),
}

/* 히스토리 필터가 바로 이 모양이다 — 기간 하나를 세그먼트로 고른다(#288, 앱:
 * 히스토리 화면의 필터). 제어는 선택된 값 배열을 밖에서 쥐고, 비제어는
 * `defaultValue`만 준다. */
export const ControlledVsUncontrolled: Story = {
  name: "제어 vs 비제어",
  render: () => <ControlledFixture />,
}

function ControlledFixture() {
  const [value, setValue] = useState<string[]>(["month"])
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <ToggleGroup data-testid="controlled" aria-label="제어" value={value} onValueChange={setValue}>
          <Toggle value="week">1주</Toggle>
          <Toggle value="month">1개월</Toggle>
          <Toggle value="year">1년</Toggle>
        </ToggleGroup>
        <Button size="sm" variant="outline" onClick={() => setValue(["week"])}>
          밖에서 "1주"로
        </Button>
      </div>
      <ToggleGroup data-testid="uncontrolled" aria-label="비제어" defaultValue={["month"]}>
        <Toggle value="week">1주</Toggle>
        <Toggle value="month">1개월</Toggle>
        <Toggle value="year">1년</Toggle>
      </ToggleGroup>
    </div>
  )
}

/* `name`을 주면 선택된 값을 숨은 입력 하나로 폼에 낸다 — Toggle과 같은 이유로
 * 직접 만든 배선이다(toggle-group.tsx). */
export const InForm: Story = {
  name: "Form 안에서 제출",
  render: () => <FormFixture />,
}

function FormFixture() {
  const [submitted, setSubmitted] = useState<Record<string, unknown> | null>(null)
  return (
    <Form
      style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxWidth: "20rem" }}
      onFormSubmit={(values) => setSubmitted(values)}
    >
      <ToggleGroup data-testid="period" name="period" defaultValue={["month"]} aria-label="기간">
        <Toggle value="week">1주</Toggle>
        <Toggle value="month">1개월</Toggle>
        <Toggle value="year">1년</Toggle>
      </ToggleGroup>
      <Button type="submit" data-testid="submit">
        제출
      </Button>
      {submitted ? <p data-testid="submitted">{JSON.stringify(submitted)}</p> : null}
    </Form>
  )
}

/* 화살표 이동 — Base UI가 roving focus로 준다. Tab은 그룹에 한 번만 닿고
 * (첫 항목 — 눌린 항목이 아니다, roving tabindex의 초기값), 화살표가 항목
 * 사이를 옮긴다. */
const keyboard: KeyboardContract[] = [
  {
    name: "Tab이 첫 항목에 닿는다",
    press: ["Tab"],
    expect: { focused: "[data-testid=key-week]" },
  },
  {
    name: "ArrowRight가 다음 항목으로 옮긴다",
    focus: "[data-testid=key-month]",
    press: ["ArrowRight"],
    expect: { focused: "[data-testid=key-year]" },
  },
  {
    name: "ArrowLeft가 이전 항목으로 옮긴다",
    focus: "[data-testid=key-year]",
    press: ["ArrowLeft"],
    expect: { focused: "[data-testid=key-month]" },
  },
  {
    name: "Enter가 초점 항목을 누른다",
    focus: "[data-testid=key-week]",
    press: ["Enter"],
    expect: { text: { "[data-testid=key-state]": "week" } },
  },
]

export const Keyboard: Story = {
  name: "키보드 계약",
  parameters: { keyboard },
  render: () => <KeyboardFixture />,
}

function KeyboardFixture() {
  const [value, setValue] = useState<string[]>(["month"])
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <ToggleGroup aria-label="키보드 계약" value={value} onValueChange={setValue}>
        <Toggle data-testid="key-week" value="week">
          1주
        </Toggle>
        <Toggle data-testid="key-month" value="month">
          1개월
        </Toggle>
        <Toggle data-testid="key-year" value="year">
          1년
        </Toggle>
      </ToggleGroup>
      <span data-testid="key-state">{value[0] ?? ""}</span>
    </div>
  )
}
