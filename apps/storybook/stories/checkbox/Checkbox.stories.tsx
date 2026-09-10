import { Button } from "@flameware/ui/button"
import { Checkbox } from "@flameware/ui/checkbox"
import { Field } from "@flameware/ui/field"
import { Form } from "@flameware/ui/form"
import type { Meta, StoryObj } from "@storybook/react-vite"
import type { ReactNode } from "react"
import { useState } from "react"

import type { KeyboardContract } from "../keyboard"
import type { ComponentMeta } from "../meta"

const meta = {
  title: "Forms/Checkbox",
  component: Checkbox,
  parameters: { ds: { status: "preview", since: "0.2.0" } },
  args: { disabled: false },
  argTypes: {
    disabled: { control: "boolean" },
  },
  decorators: [
    (Story) => (
      <Field.Root name="playground" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Story />
        <Field.Label>알림 받기</Field.Label>
      </Field.Root>
    ),
  ],
} satisfies Meta<typeof Checkbox> & ComponentMeta

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/* 시각 상자는 16px지만 히트 영역은 hit-area가 24px까지 넓힌다(checkbox.tsx,
 * ADR-0020) — 스토리 테스트가 이 스토리를 열어 그대로 잰다. */
export const States: Story = {
  decorators: [],
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <Row label="꺼짐">
        <Checkbox aria-label="꺼짐" />
      </Row>
      <Row label="켜짐">
        <Checkbox aria-label="켜짐" defaultChecked />
      </Row>
      <Row label="indeterminate">
        <Checkbox aria-label="indeterminate" indeterminate />
      </Row>
      <Row label="비활성">
        <Checkbox aria-label="비활성" disabled />
      </Row>
      <Row label="비활성 + 켜짐">
        <Checkbox aria-label="비활성 켜짐" disabled defaultChecked />
      </Row>
    </div>
  ),
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      {children}
      <span>{label}</span>
    </div>
  )
}

/* 제어와 비제어가 나란히 — 제어 쪽은 `checked`/`onCheckedChange`를 밖에서
 * 쥐고, 비제어 쪽은 `defaultChecked`만 주고 나머지는 Base UI Checkbox
 * 자신에게 맡긴다. 둘 다 같은 컴포넌트, 같은 props 이름이다. */
export const ControlledVsUncontrolled: Story = {
  name: "제어 vs 비제어",
  decorators: [],
  render: () => <ControlledFixture />,
}

function ControlledFixture() {
  const [checked, setChecked] = useState(false)
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Checkbox
          data-testid="controlled"
          aria-label="제어"
          checked={checked}
          onCheckedChange={setChecked}
        />
        <span>제어 — 지금 {checked ? "켜짐" : "꺼짐"}</span>
        <Button size="sm" variant="outline" onClick={() => setChecked((c) => !c)}>
          밖에서 뒤집기
        </Button>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Checkbox data-testid="uncontrolled" aria-label="비제어" defaultChecked />
        <span>비제어 — 초기값만 주고 나머지는 Checkbox 자신의 상태</span>
      </div>
    </div>
  )
}

/* Form 안에서 제출 맵에 값이 잡히는 자리 — 이 티켓의 seam이다(#288). Checkbox는
 * Base UI가 스스로 Form의 필드 registry에 등록하므로(checkbox.tsx 주석) DS가
 * 배선을 새로 놓지 않는다. */
export const InForm: Story = {
  name: "Form 안에서 제출",
  decorators: [],
  render: () => <FormFixture />,
}

function FormFixture() {
  const [submitted, setSubmitted] = useState<Record<string, unknown> | null>(null)
  return (
    <Form style={{ maxWidth: "20rem" }} onFormSubmit={(values) => setSubmitted(values)}>
      <Field.Root name="agree-terms" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Checkbox data-testid="agree" required />
        <Field.Label>약관에 동의합니다</Field.Label>
      </Field.Root>
      <Button type="submit" data-testid="submit">
        제출
      </Button>
      {submitted ? <p data-testid="submitted">{JSON.stringify(submitted)}</p> : null}
    </Form>
  )
}

const keyboard: KeyboardContract[] = [
  {
    name: "Tab이 체크박스에 닿는다",
    press: ["Tab"],
    expect: { focused: "[data-testid=key-checkbox]" },
  },
  {
    name: "Space가 켠다",
    focus: "[data-testid=key-checkbox]",
    press: ["Space"],
    expect: { text: { "[data-testid=key-state]": "켜짐" } },
  },
  {
    name: "Space가 다시 끈다",
    focus: "[data-testid=key-checkbox]",
    press: ["Space", "Space"],
    expect: { text: { "[data-testid=key-state]": "꺼짐" } },
  },
]

export const Keyboard: Story = {
  name: "키보드 계약",
  decorators: [],
  parameters: { keyboard },
  render: () => <KeyboardFixture />,
}

function KeyboardFixture() {
  const [checked, setChecked] = useState(false)
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <Checkbox data-testid="key-checkbox" aria-label="키보드 계약" checked={checked} onCheckedChange={setChecked} />
      <span data-testid="key-state">{checked ? "켜짐" : "꺼짐"}</span>
    </div>
  )
}
