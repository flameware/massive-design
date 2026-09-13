import { Button } from "@flameware/ui/button"
import { Field } from "@flameware/ui/field"
import { Form } from "@flameware/ui/form"
import { Switch } from "@flameware/ui/switch"
import type { Meta, StoryObj } from "@storybook/react-vite"
import type { ReactNode } from "react"
import { useState } from "react"

import type { KeyboardContract } from "../keyboard"
import type { ComponentMeta } from "../meta"

const meta = {
  title: "Forms/Switch",
  component: Switch,
  parameters: { ds: { status: "preview", since: "0.6.0" } },
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
} satisfies Meta<typeof Switch> & ComponentMeta

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/* 트랙 높이는 20px다 — 포인터 하한 24px 아래로 내려가므로 `hit-area`가 진다
 * (switch.tsx, ADR-0020). 꺼짐 트랙은 `bg.neutral.solid`라 컨트롤 어포던스로서
 * 앉는 면에 대해 3:1을 진다(ADR-0026). */
export const States: Story = {
  decorators: [],
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <Row label="꺼짐">
        <Switch aria-label="꺼짐" />
      </Row>
      <Row label="켜짐">
        <Switch aria-label="켜짐" defaultChecked />
      </Row>
      <Row label="비활성">
        <Switch aria-label="비활성" disabled />
      </Row>
      <Row label="비활성 + 켜짐">
        <Switch aria-label="비활성 켜짐" disabled defaultChecked />
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

/* 제어와 비제어가 나란히 — Checkbox.stories.tsx와 같은 모양이다. */
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
        <Switch
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
        <Switch data-testid="uncontrolled" aria-label="비제어" defaultChecked />
        <span>비제어 — 초기값만 주고 나머지는 Switch 자신의 상태</span>
      </div>
    </div>
  )
}

/* Field·Form과 결합 — 라벨·설명·오류(#399 acceptance criteria). Switch는 Base UI가
 * 스스로 Form의 필드 registry에 등록하므로(switch.tsx 주석) DS가 배선을 새로
 * 놓지 않는다. */
export const WithFieldAndForm: Story = {
  name: "Field·Form",
  decorators: [],
  render: () => <FieldFormFixture />,
}

function FieldFormFixture() {
  const [submitted, setSubmitted] = useState<Record<string, unknown> | null>(null)
  return (
    <Form style={{ maxWidth: "20rem" }} onFormSubmit={(values) => setSubmitted(values)}>
      <Field.Root
        name="marketing-emails"
        style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
      >
        <Switch data-testid="marketing" />
        <Field.Label>마케팅 이메일 수신</Field.Label>
      </Field.Root>
      <Field.Root
        name="two-factor"
        style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Switch required />
          <Field.Label>2단계 인증</Field.Label>
        </div>
        <Field.Description>로그인할 때마다 추가 인증을 요구합니다</Field.Description>
      </Field.Root>
      <Field.Root
        name="beta-features"
        invalid
        touched
        style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Switch />
          <Field.Label>베타 기능</Field.Label>
        </div>
        <Field.Error match>지금은 켤 수 없습니다</Field.Error>
      </Field.Root>
      <Button type="submit" data-testid="submit">
        저장
      </Button>
      {submitted ? <p data-testid="submitted">{JSON.stringify(submitted)}</p> : null}
    </Form>
  )
}

const keyboard: KeyboardContract[] = [
  {
    name: "Tab이 스위치에 닿는다",
    press: ["Tab"],
    expect: { focused: "[data-testid=key-switch]" },
  },
  {
    name: "Space가 켠다",
    focus: "[data-testid=key-switch]",
    press: ["Space"],
    expect: { text: { "[data-testid=key-state]": "켜짐" } },
  },
  {
    name: "Space가 다시 끈다",
    focus: "[data-testid=key-switch]",
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
      <Switch data-testid="key-switch" aria-label="키보드 계약" checked={checked} onCheckedChange={setChecked} />
      <span data-testid="key-state">{checked ? "켜짐" : "꺼짐"}</span>
    </div>
  )
}
