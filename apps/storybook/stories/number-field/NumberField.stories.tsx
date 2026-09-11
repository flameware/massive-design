import { Field } from "@flameware/ui/field"
import { NumberField } from "@flameware/ui/number-field"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"

import type { KeyboardContract } from "../keyboard"
import type { ComponentMeta } from "../meta"

/* NumberField는 Base UI 뒤에 있다(#328) — Root가 `Field.Root`의 컨텍스트를
 * 읽으므로(number-field.tsx 주석) Input·Field.Label·Field.Description·
 * Field.Error가 Field.Root 안에서 그대로 연결된다. 증감 버튼·`inputMode`·
 * 로케일 서식 전부 Base UI가 낸다. `component`는 Root다 — Group·Input·
 * Increment·Decrement는 anatomy를 이루는 조각이라(Select.Root와 같은 이유)
 * 독립된 스토리를 갖지 않는다. */
const meta = {
  title: "Forms/NumberField",
  component: NumberField.Root,
  parameters: { ds: { status: "stable", since: "0.3.2" } },
  decorators: [
    (Story) => (
      <Field.Root name="playground" style={{ maxWidth: "12rem" }}>
        <Field.Label>수량</Field.Label>
        <Story />
      </Field.Root>
    ),
  ],
} satisfies Meta<typeof NumberField.Root> & ComponentMeta

export default meta

type Story = StoryObj<typeof meta>

/* Field 안의 기본 조립 — 소비처의 수량·단가 자리가 쓸 모양(#328 "Field 안에서
 * 라벨·설명·오류와 aria로 연결된다"). */
export const Playground: Story = {
  render: (args) => (
    <NumberField.Root {...args} defaultValue={1} min={0}>
      <NumberField.Group>
        <NumberField.Decrement />
        <NumberField.Input />
        <NumberField.Increment />
      </NumberField.Group>
    </NumberField.Root>
  ),
}

/* 소수 단가 — invest diary의 두 번째 자리(#328 "소수 단가 입력과 로케일
 * 서식"). `format`의 `maximumFractionDigits`가 소수점 이하를 자르고,
 * 로케일은 Root가 런타임 기본값(브라우저)을 그대로 쓰거나 `locale`로 고정한다. */
export const DecimalPrice: Story = {
  name: "소수 단가",
  decorators: [
    (Story) => (
      <Field.Root name="price" style={{ maxWidth: "12rem" }}>
        <Field.Label>단가</Field.Label>
        <Story />
        <Field.Description>원 단위, 소수점 둘째 자리까지</Field.Description>
      </Field.Root>
    ),
  ],
  render: () => (
    <NumberField.Root
      defaultValue={71234.5}
      min={0}
      step={0.5}
      locale="ko-KR"
      format={{ maximumFractionDigits: 2, minimumFractionDigits: 0 }}
    >
      <NumberField.Group>
        <NumberField.Decrement />
        <NumberField.Input />
        <NumberField.Increment />
      </NumberField.Group>
    </NumberField.Root>
  ),
}

/* min·max에 닿으면 그쪽 버튼이 disabled — 거래 수량은 0 아래로 못 내려간다. */
export const MinMax: Story = {
  name: "min·max 경계",
  render: () => (
    <NumberField.Root defaultValue={0} min={0} max={5}>
      <NumberField.Group>
        <NumberField.Decrement />
        <NumberField.Input />
        <NumberField.Increment />
      </NumberField.Group>
    </NumberField.Root>
  ),
}

export const States: Story = {
  name: "상태",
  decorators: [],
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "12rem" }}>
      <Field.Root name="disabled-state" disabled>
        <Field.Label>비활성</Field.Label>
        <NumberField.Root defaultValue={3}>
          <NumberField.Group>
            <NumberField.Decrement />
            <NumberField.Input />
            <NumberField.Increment />
          </NumberField.Group>
        </NumberField.Root>
      </Field.Root>
      <Field.Root name="invalid-state" invalid touched>
        <Field.Label>오류</Field.Label>
        <NumberField.Root defaultValue={-1} min={0}>
          <NumberField.Group>
            <NumberField.Decrement />
            <NumberField.Input />
            <NumberField.Increment />
          </NumberField.Group>
        </NumberField.Root>
        <Field.Error match>0 이상이어야 합니다</Field.Error>
      </Field.Root>
    </div>
  ),
}

/* 키보드 계약 — ArrowUp/Down 증감·Home/End(#317 스토리 11 "NumberField(화살표
 * 증감·Home/End)"). 재는 것은 밖에서 보이는 결과다(keyboard.ts) — `<input>`의
 * 값은 `textContent`가 아니라 `value` 프로퍼티라 querySelector의 textContent로는
 * 안 잡힌다(toggle-group.tsx의 `key-state` span과 같은 이유로 `onValueChange`가
 * 옆의 읽기 전용 span에 값을 반영하고 그것을 잰다). */
const keyboard: KeyboardContract[] = [
  {
    name: "Tab이 Input에 닿는다",
    press: ["Tab"],
    expect: { focused: "[data-testid=key-input]" },
  },
  {
    name: "ArrowUp이 step만큼 올린다",
    focus: "[data-testid=key-input]",
    press: ["ArrowUp"],
    expect: { text: { "[data-testid=key-state]": "6" } },
  },
  {
    name: "ArrowDown이 step만큼 내린다",
    focus: "[data-testid=key-input]",
    press: ["ArrowDown", "ArrowDown"],
    expect: { text: { "[data-testid=key-state]": "3" } },
  },
  {
    name: "Home이 min으로 보낸다",
    focus: "[data-testid=key-input]",
    press: ["Home"],
    expect: { text: { "[data-testid=key-state]": "0" } },
  },
  {
    name: "End가 max로 보낸다",
    focus: "[data-testid=key-input]",
    press: ["End"],
    expect: { text: { "[data-testid=key-state]": "10" } },
  },
]

export const Keyboard: Story = {
  name: "키보드 계약",
  parameters: { keyboard },
  decorators: [],
  render: () => <KeyboardFixture />,
}

function KeyboardFixture() {
  const [value, setValue] = useState<number | null>(5)
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
      <NumberField.Root value={value} onValueChange={setValue} min={0} max={10}>
        <NumberField.Group>
          <NumberField.Decrement data-testid="key-decrement" />
          <NumberField.Input data-testid="key-input" aria-label="키보드 계약" />
          <NumberField.Increment data-testid="key-increment" />
        </NumberField.Group>
      </NumberField.Root>
      <span data-testid="key-state">{value ?? ""}</span>
    </div>
  )
}
