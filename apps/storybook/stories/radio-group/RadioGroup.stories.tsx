import { Button } from "@flameware/ui/button"
import { Field } from "@flameware/ui/field"
import { Form } from "@flameware/ui/form"
import { Radio } from "@flameware/ui/radio"
import { RadioGroup } from "@flameware/ui/radio-group"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"

import type { KeyboardContract } from "../keyboard"
import type { ComponentMeta } from "../meta"

/* 항목은 이 컴포넌트의 파트가 아니라 옆 서브패스의 `Radio`다 — Base UI 자신의
 * anatomy가 `RadioGroup`(값을 쥔다)과 `Radio.Root`+`Radio.Indicator`(항목)로
 * 갈린다(radio-group.tsx 주석, Toggle/ToggleGroup과 같은 짝). 그래서 `component`는
 * RadioGroup 하나이고, args 표는 그룹 축(orientation·disabled 등)만 보여준다. */
const meta = {
  title: "Forms/RadioGroup",
  component: RadioGroup,
  parameters: { ds: { status: "preview", since: "0.6.0" } },
  args: { disabled: false },
  argTypes: {
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof RadioGroup> & ComponentMeta

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: (args) => (
    <RadioGroup {...args} defaultValue="month" aria-label="구독 주기">
      <Row value="week" label="1주" />
      <Row value="month" label="1개월" />
      <Row value="year" label="1년" />
    </RadioGroup>
  ),
}

/* 선택 안 됨·선택됨·비활성 — Radio 자체는 Checkbox와 같은 자리다(radio.tsx).
 * 시각 상자는 16px지만 히트 영역은 hit-area가 24px까지 넓힌다(ADR-0020). */
export const States: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <RadioGroup aria-label="선택 안 됨" defaultValue={undefined}>
        <Row value="a" label="선택 안 됨" />
      </RadioGroup>
      <RadioGroup aria-label="선택됨" defaultValue="a">
        <Row value="a" label="선택됨" />
      </RadioGroup>
      <RadioGroup aria-label="비활성" disabled defaultValue={undefined}>
        <Row value="a" label="비활성" />
      </RadioGroup>
      <RadioGroup aria-label="비활성 + 선택됨" disabled defaultValue="a">
        <Row value="a" label="비활성 + 선택됨" />
      </RadioGroup>
    </div>
  ),
}

function Row({ value, label }: { value: string; label: string }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <Radio value={value} />
      <span>{label}</span>
    </label>
  )
}

/* 제어와 비제어가 나란히 — 제어 쪽은 `value`/`onValueChange`를 밖에서 쥐고,
 * 비제어 쪽은 `defaultValue`만 주고 나머지는 Base UI RadioGroup 자신에게
 * 맡긴다. 둘 다 같은 컴포넌트, 같은 props 이름이다. */
export const ControlledVsUncontrolled: Story = {
  name: "제어 vs 비제어",
  render: () => <ControlledFixture />,
}

function ControlledFixture() {
  const [value, setValue] = useState<string | undefined>("month")
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
        <RadioGroup data-testid="controlled" aria-label="제어" value={value} onValueChange={setValue}>
          <Row value="week" label="1주" />
          <Row value="month" label="1개월" />
          <Row value="year" label="1년" />
        </RadioGroup>
        <Button size="sm" variant="outline" onClick={() => setValue("week")}>
          밖에서 "1주"로
        </Button>
      </div>
      <RadioGroup data-testid="uncontrolled" aria-label="비제어" defaultValue="month">
        <Row value="week" label="1주" />
        <Row value="month" label="1개월" />
        <Row value="year" label="1년" />
      </RadioGroup>
    </div>
  )
}

/* Field·Form과 결합 — 라벨·설명·오류(#401 acceptance criteria). RadioGroup은
 * Base UI가 스스로 Form의 필드 registry에 등록하므로(radio-group.tsx 주석) DS가
 * 배선을 새로 놓지 않는다. Field.Root 하나가 그룹 전체를 감싸 `Field.Label`을
 * 그룹의 aria-labelledby로 배선한다(RadioGroup.mjs의 `ariaLabelledby`) — 항목별
 * 텍스트는 각 Radio를 감싸는 네이티브 `<label>`이 진다(Radio 자신의 hidden
 * input과 암묵적으로 연결된다). */
export const WithFieldAndForm: Story = {
  name: "Field·Form",
  render: () => <FieldFormFixture />,
}

function FieldFormFixture() {
  const [submitted, setSubmitted] = useState<Record<string, unknown> | null>(null)
  return (
    <Form style={{ maxWidth: "24rem" }} onFormSubmit={(values) => setSubmitted(values)}>
      <Field.Root
        name="shipping"
        style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
      >
        <Field.Label>배송 방법</Field.Label>
        <Field.Description>주문 후 도착까지 걸리는 시간이 다릅니다</Field.Description>
        <RadioGroup data-testid="shipping" defaultValue="standard" required>
          <Row value="standard" label="일반 배송 (3~5일)" />
          <Row value="express" label="빠른 배송 (1~2일)" />
        </RadioGroup>
      </Field.Root>
      <Field.Root
        name="plan"
        invalid
        touched
        style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
      >
        <Field.Label>요금제</Field.Label>
        <RadioGroup>
          <Row value="free" label="무료" />
          <Row value="pro" label="프로" />
        </RadioGroup>
        <Field.Error match>요금제를 선택해 주세요</Field.Error>
      </Field.Root>
      <Button type="submit" data-testid="submit">
        제출
      </Button>
      {submitted ? <p data-testid="submitted">{JSON.stringify(submitted)}</p> : null}
    </Form>
  )
}

/* 화살표 이동 — Base UI가 roving focus로 준다. Tab은 그룹에 한 번만 닿고
 * (선택된 항목 — RadioRoot.mjs가 `firstEnabledInputRef`를 선택된 항목으로
 * 재지정한다), 화살표는 옮기는 즉시 그 항목을 선택한다(RadioRoot.mjs의
 * `onFocus`가 `touched`일 때 자기 hidden input을 클릭한다) — ToggleGroup과
 * 달리 Enter/Space가 따로 필요 없다. 마지막 계약은 Tab이 그룹을 떠나 다음
 * 컨트롤로 넘어가는 것을 잰다. */
const keyboard: KeyboardContract[] = [
  {
    name: "Tab이 선택된 항목에 닿는다",
    press: ["Tab"],
    expect: { focused: "[data-testid=key-month]" },
  },
  {
    name: "ArrowRight가 다음 항목으로 옮기고 즉시 선택한다",
    focus: "[data-testid=key-month]",
    press: ["ArrowRight"],
    expect: { focused: "[data-testid=key-year]", text: { "[data-testid=key-state]": "year" } },
  },
  {
    name: "ArrowLeft가 이전 항목으로 옮기고 즉시 선택한다",
    focus: "[data-testid=key-year]",
    press: ["ArrowLeft"],
    expect: { focused: "[data-testid=key-month]", text: { "[data-testid=key-state]": "month" } },
  },
  {
    name: "Tab이 그룹을 떠나 다음 컨트롤로 넘어간다",
    focus: "[data-testid=key-month]",
    press: ["Tab"],
    expect: { focused: "[data-testid=key-after]" },
  },
]

export const Keyboard: Story = {
  name: "키보드 계약",
  parameters: { keyboard },
  render: () => <KeyboardFixture />,
}

function KeyboardFixture() {
  const [value, setValue] = useState("month")
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
      <RadioGroup aria-label="키보드 계약" value={value} onValueChange={setValue}>
        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Radio data-testid="key-week" value="week" />
          1주
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Radio data-testid="key-month" value="month" />
          1개월
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Radio data-testid="key-year" value="year" />
          1년
        </label>
      </RadioGroup>
      <span data-testid="key-state">{value}</span>
      <Button data-testid="key-after" size="sm" variant="outline">
        다음 컨트롤
      </Button>
    </div>
  )
}
