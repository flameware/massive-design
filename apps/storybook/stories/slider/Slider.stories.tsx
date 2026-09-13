import { Button } from "@flameware/ui/button"
import { Field } from "@flameware/ui/field"
import { Form } from "@flameware/ui/form"
import { Slider } from "@flameware/ui/slider"
import type { Meta, StoryObj } from "@storybook/react-vite"
import type { ReactNode } from "react"
import { useState } from "react"

import type { KeyboardContract } from "../keyboard"
import type { ComponentMeta } from "../meta"

/* Base UI Slider는 Checkbox·Switch와 같은 자리에 선다 — `value`/`defaultValue`
 * (제어/비제어)와 `name`(폼 제출)을 스스로 지고, Field.Root 안에서 Form의 필드
 * registry에도 스스로 등록된다(slider.tsx 주석). Progress와 달리 눌리고
 * 끌리는 컨트롤이라 키보드 계약 스토리를 둔다. */
const meta = {
  title: "Forms/Slider",
  component: Slider.Root,
  parameters: { ds: { status: "preview", since: "0.6.0" } },
  args: { disabled: false, defaultValue: 40 },
  argTypes: {
    disabled: { control: "boolean" },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: "20rem" }}>
        <Field.Root name="playground" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <Field.Label>거래 수수료율</Field.Label>
          <Story />
        </Field.Root>
      </div>
    ),
  ],
} satisfies Meta<typeof Slider.Root> & ComponentMeta

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: (args) => (
    <Slider.Root {...args}>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Slider.Value />
      </div>
      <Slider.Control>
        <Slider.Track>
          <Slider.Indicator />
        </Slider.Track>
        <Slider.Thumb />
      </Slider.Control>
    </Slider.Root>
  ),
}

/* 값과 범위 둘 다 같은 조립이다 — `value`가 배열이면 thumb이 여럿인 범위
 * 슬라이더가 된다(slider.tsx 주석). 각 thumb은 `index`와 `getAriaLabel`로
 * 스스로를 구분한다 — Field.Label 하나로는 두 thumb을 구분해 알리지 못하기
 * 때문이다(Base UI 문서의 범위 슬라이더 권고). */
export const Range: Story = {
  decorators: [],
  args: {},
  render: () => (
    <div style={{ maxWidth: "20rem" }}>
      <Slider.Root defaultValue={[20, 80]}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>가격 범위 (만 원)</span>
          <Slider.Value />
        </div>
        <Slider.Control>
          <Slider.Track>
            <Slider.Indicator />
          </Slider.Track>
          <Slider.Thumb index={0} getAriaLabel={() => "최소 가격"} />
          <Slider.Thumb index={1} getAriaLabel={() => "최대 가격"} />
        </Slider.Control>
      </Slider.Root>
    </div>
  ),
}

/* 시각 지름은 16px지만 히트 영역은 hit-area가 24px까지 넓힌다(slider.tsx,
 * ADR-0020) — 스토리 테스트가 이 스토리를 열어 그대로 잰다. 채워지지 않은
 * 트랙은 잔여 트랙(`bg.neutral.soft`), thumb은 컨트롤 어포던스
 * (`bg.neutral.solid`)라 같은 토큰을 쓰지 않는다(CONTEXT.md). */
export const States: Story = {
  decorators: [],
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <Row label="기본">
        <Slider.Root defaultValue={40} style={{ maxWidth: "16rem" }}>
          <Slider.Control>
            <Slider.Track>
              <Slider.Indicator />
            </Slider.Track>
            <Slider.Thumb getAriaLabel={() => "기본"} />
          </Slider.Control>
        </Slider.Root>
      </Row>
      <Row label="비활성">
        <Slider.Root defaultValue={40} disabled style={{ maxWidth: "16rem" }}>
          <Slider.Control>
            <Slider.Track>
              <Slider.Indicator />
            </Slider.Track>
            <Slider.Thumb getAriaLabel={() => "비활성"} />
          </Slider.Control>
        </Slider.Root>
      </Row>
    </div>
  ),
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
      <span>{label}</span>
      {children}
    </div>
  )
}

/* Field·Form과 결합 — 라벨·설명·오류(#400 acceptance criteria). Slider는
 * Base UI가 스스로 Form의 필드 registry에 등록하므로(slider.tsx 주석) DS가
 * 배선을 새로 놓지 않는다. */
export const WithFieldAndForm: Story = {
  name: "Field·Form",
  decorators: [],
  render: () => <FieldFormFixture />,
}

function FieldFormFixture() {
  const [submitted, setSubmitted] = useState<Record<string, unknown> | null>(null)
  return (
    <Form style={{ maxWidth: "20rem" }} onFormSubmit={(values) => setSubmitted(values)}>
      <Field.Root name="fee-rate" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <Field.Label>거래 수수료율</Field.Label>
        <Slider.Root data-testid="fee-rate" defaultValue={25}>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Slider.Value />
          </div>
          <Slider.Control>
            <Slider.Track>
              <Slider.Indicator />
            </Slider.Track>
            <Slider.Thumb />
          </Slider.Control>
        </Slider.Root>
        <Field.Description>매도 체결 시 적용되는 수수료율입니다</Field.Description>
      </Field.Root>
      <Field.Root
        name="risk-tolerance"
        invalid
        touched
        style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
      >
        <Field.Label>위험 허용도</Field.Label>
        <Slider.Root defaultValue={10}>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Slider.Value />
          </div>
          <Slider.Control>
            <Slider.Track>
              <Slider.Indicator />
            </Slider.Track>
            <Slider.Thumb />
          </Slider.Control>
        </Slider.Root>
        <Field.Error match>값을 다시 확인해 주세요</Field.Error>
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
    name: "Tab이 thumb의 입력에 닿는다",
    press: ["Tab"],
    expect: { focused: "[data-testid=key-slider] input[type=range]" },
  },
  {
    name: "ArrowRight가 값을 올린다",
    focus: "[data-testid=key-slider] input[type=range]",
    press: ["ArrowRight"],
    expect: { text: { "[data-testid=key-value]": "41" } },
  },
  {
    name: "ArrowLeft가 값을 내린다",
    focus: "[data-testid=key-slider] input[type=range]",
    press: ["ArrowRight", "ArrowLeft"],
    expect: { text: { "[data-testid=key-value]": "40" } },
  },
]

export const Keyboard: Story = {
  name: "키보드 계약",
  decorators: [],
  parameters: { keyboard },
  render: () => <KeyboardFixture />,
}

function KeyboardFixture() {
  const [value, setValue] = useState(40)
  return (
    <div style={{ maxWidth: "16rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span>키보드 계약</span>
        <span data-testid="key-value">{value}</span>
      </div>
      <Slider.Root data-testid="key-slider" value={value} onValueChange={setValue}>
        <Slider.Control>
          <Slider.Track>
            <Slider.Indicator />
          </Slider.Track>
          <Slider.Thumb getAriaLabel={() => "키보드 계약"} />
        </Slider.Control>
      </Slider.Root>
    </div>
  )
}
