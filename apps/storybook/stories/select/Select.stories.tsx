import { Button } from "@flameware/ui/button"
import { Field } from "@flameware/ui/field"
import { Form } from "@flameware/ui/form"
import { Select } from "@flameware/ui/select"
import type { Meta, StoryObj } from "@storybook/react-vite"
import type { ComponentProps } from "react"
import { useState } from "react"

import type { KeyboardContract } from "../keyboard"
import type { ComponentMeta } from "../meta"

/* Select.Root가 진짜 컴포넌트다 — 나머지 파트는 anatomy를 이루는 조각이라
 * Field.Label처럼 독립된 스토리를 갖지 않는다(field/Field.stories.tsx와
 * 같은 이유). `component`를 Root로 잡으면 Controls가 제어/비제어·name 같은
 * Root의 축을 그대로 보여준다. */
const meta = {
  title: "Forms/Select",
  component: Select.Root,
  parameters: { ds: { status: "stable", since: "0.2.0" } },
  args: { disabled: false },
  argTypes: {
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof Select.Root> & ComponentMeta

export default meta

type Story = StoryObj<typeof meta>

/* `items`를 Select.Root에 주면 `Select.Value`가 고른 항목의 원값(value) 대신
 * 이 라벨을 보여준다(Select.d.ts, SelectRootProps.items) — 안 주면 트리거에
 * "week" 같은 원값이 그대로 뜬다. 항목 리스트(`Select.Item`)는 그래도 손으로
 * 그린다 — `items`는 Value·typeahead의 라벨 조회표일 뿐 리스트를 자동으로
 * 그리지 않는다. */
const PERIOD_ITEMS = { week: "1주", month: "1개월", year: "1년" }

function PeriodSelect(props: ComponentProps<typeof Select.Root<string>>) {
  return (
    <Select.Root items={PERIOD_ITEMS} {...props}>
      <Select.Trigger aria-label="기간">
        <Select.Value placeholder="기간 선택" />
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner>
          <Select.Popup>
            <Select.List>
              <Select.Item value="week">1주</Select.Item>
              <Select.Item value="month">1개월</Select.Item>
              <Select.Item value="year">1년</Select.Item>
            </Select.List>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  )
}

export const Playground: Story = {
  render: (args) => <PeriodSelect disabled={args.disabled} />,
}

/* 항목·그룹·구분선 파트 — 티켓이 명시한 Select의 모양이다(#288 "항목·그룹·
 * 구분선 파트를 갖는다"). */
export const GroupsAndSeparator: Story = {
  name: "그룹과 구분선",
  render: () => (
    <Select.Root>
      <Select.Trigger aria-label="자산">
        <Select.Value placeholder="자산 선택" />
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner>
          <Select.Popup>
            <Select.List>
              <Select.Group>
                <Select.GroupLabel>자주 씀</Select.GroupLabel>
                <Select.Item value="krw-stock">국내 주식</Select.Item>
                <Select.Item value="us-stock">미국 주식</Select.Item>
              </Select.Group>
              <Select.Separator />
              <Select.Group>
                <Select.GroupLabel>그 외</Select.GroupLabel>
                <Select.Item value="bond">채권</Select.Item>
                <Select.Item value="cash">현금</Select.Item>
              </Select.Group>
            </Select.List>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  ),
}

export const Disabled: Story = {
  render: () => <PeriodSelect disabled defaultValue="month" />,
}

/* 제어와 비제어가 나란히 — 제어 쪽은 `value`/`onValueChange`를 밖에서 쥔다. */
export const ControlledVsUncontrolled: Story = {
  name: "제어 vs 비제어",
  render: () => <ControlledFixture />,
}

function ControlledFixture() {
  const [value, setValue] = useState<string | null>("month")
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
      <PeriodSelect data-testid="controlled" value={value} onValueChange={setValue} />
      <span>지금 선택 — {value ?? "없음"}</span>
      <Button size="sm" variant="outline" onClick={() => setValue("week")}>
        밖에서 "1주"로
      </Button>
      <PeriodSelect data-testid="uncontrolled" defaultValue="year" />
    </div>
  )
}

/* Form 안에서 제출 맵에 값이 잡히는 자리(#288). Select는 Base UI가 스스로
 * Form의 필드 registry에 등록하므로(select.tsx 주석) DS가 배선을 새로 놓지
 * 않는다. */
export const InForm: Story = {
  name: "Form 안에서 제출",
  render: () => <FormFixture />,
}

function FormFixture() {
  const [submitted, setSubmitted] = useState<Record<string, unknown> | null>(null)
  return (
    <Form style={{ maxWidth: "20rem" }} onFormSubmit={(values) => setSubmitted(values)}>
      <Field.Root name="period" style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
        <Field.Label>기간</Field.Label>
        <Select.Root items={PERIOD_ITEMS} defaultValue="month">
          <Select.Trigger data-testid="period-trigger">
            <Select.Value placeholder="기간 선택" />
          </Select.Trigger>
          <Select.Portal>
            <Select.Positioner>
              <Select.Popup>
                <Select.List>
                  <Select.Item value="week">1주</Select.Item>
                  <Select.Item value="month">1개월</Select.Item>
                  <Select.Item value="year">1년</Select.Item>
                </Select.List>
              </Select.Popup>
            </Select.Positioner>
          </Select.Portal>
        </Select.Root>
      </Field.Root>
      <Button type="submit" data-testid="submit">
        제출
      </Button>
      {submitted ? <p data-testid="submitted">{JSON.stringify(submitted)}</p> : null}
    </Form>
  )
}

/* 키보드 계약 — 열기·화살표 이동·Enter 선택·타이핑 점프(#288 "Select 화살표
 * 이동·Enter 선택·타이핑 점프"). Esc 닫기도 같이 잰다. 재는 것은 언제나 밖에서
 * 보이는 결과다(keyboard.ts) — 선택된 값이 트리거의 `Select.Value` 텍스트로
 * 그대로 드러나므로 그것을 잰다. */
const keyboard: KeyboardContract[] = [
  {
    name: "Tab이 트리거에 닿는다",
    press: ["Tab"],
    expect: { focused: "[data-testid=key-trigger]" },
  },
  {
    name: "ArrowDown이 열고 다음 항목(1개월)으로 옮긴다 — Enter가 그것을 고른다",
    focus: "[data-testid=key-trigger]",
    press: ["ArrowDown", "ArrowDown", "Enter"],
    expect: { focused: "[data-testid=key-trigger]", text: { "[data-testid=key-trigger]": "1개월" } },
  },
  {
    name: "Escape가 고르지 않고 닫는다 — 값은 그대로다",
    focus: "[data-testid=key-trigger]",
    press: ["Enter", "ArrowDown", "Escape"],
    expect: { focused: "[data-testid=key-trigger]", text: { "[data-testid=key-trigger]": "1주" } },
  },
  {
    name: "타이핑이 그 글자로 시작하는 항목으로 건너뛴다 — Enter가 고른다",
    focus: "[data-testid=key-trigger]",
    press: ["Enter", "y", "Enter"],
    expect: { text: { "[data-testid=key-trigger]": "1년" } },
  },
]

export const Keyboard: Story = {
  name: "키보드 계약",
  parameters: { keyboard },
  render: () => (
    <Select.Root items={PERIOD_ITEMS} defaultValue="week">
      <Select.Trigger data-testid="key-trigger" aria-label="기간">
        <Select.Value placeholder="기간 선택" />
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner>
          <Select.Popup>
            <Select.List>
              {/* `label`이 타이핑 점프가 읽는 글자다(Base UI typeahead, SelectItem.d.ts
               * "Defaults to the item text content" — 화면 글자는 한글이라 영문
               * 타이핑과 못 맞으므로 여기서만 명시로 준다) */}
              <Select.Item value="week" label="week">
                1주
              </Select.Item>
              <Select.Item value="month" label="month">
                1개월
              </Select.Item>
              <Select.Item value="year" label="year">
                1년
              </Select.Item>
            </Select.List>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  ),
}
