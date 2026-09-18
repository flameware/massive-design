import { Button } from "@flameware/ui/button"
import { Combobox } from "@flameware/ui/combobox"
import { Form } from "@flameware/ui/form"
import { Input } from "@flameware/ui/input"
import { NumberField } from "@flameware/ui/number-field"
import { Select } from "@flameware/ui/select"
import { Toggle } from "@flameware/ui/toggle"
import { ToggleGroup, type ToggleGroupProps } from "@flameware/ui/toggle-group"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { SlidersHorizontal } from "lucide-react"
import { type CSSProperties, useState } from "react"

import type { KeyboardContract } from "../keyboard"
import type { ComponentMeta } from "../meta"

/* 항목은 이 컴포넌트의 파트가 아니라 그냥 `Toggle`이다 — Base UI 자신의
 * anatomy가 평평하다(toggle-group.tsx). 그래서 `component`는 ToggleGroup
 * 하나이고, args 표는 그룹 축(orientation·multiple 등)만 보여준다. */
const meta = {
  title: "Actions/ToggleGroup",
  component: ToggleGroup,
  parameters: { ds: { status: "stable", since: "0.2.0" } },
  args: { orientation: "horizontal", disabled: false, size: "md" },
  argTypes: {
    orientation: { control: "select", options: ["horizontal", "vertical"] },
    size: { control: "select", options: ["sm", "md", "lg"] },
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

/* #466 — 컨트롤 높이. 같은 `size` 이름을 준 컨트롤을 한 줄에 두면 겉 높이가
 * 같다(sm 32 · md 36 · lg 40, CONTEXT.md §컨트롤 높이). ToggleGroup은 **판의
 * 겉**이 그 높이를 지고 안의 Toggle은 판의 여백·테두리만큼 작다 — 그래서 그룹
 * 안 Toggle과 낱개 Toggle의 높이는 다르다. 필드 컨트롤(Input·Select·Combobox·
 * NumberField)에는 `size` 축이 없고 md 36 하나다.
 *
 * 줄마다 단 `data-control-height`가 선언이다 — 스토리 테스트가 그 줄의 컨트롤
 * 높이를 렌더링된 치수로 재어 척도 값과 대조한다(stories.test.mjs). md 줄의
 * ToggleGroup은 일부러 `size`를 주지 않는다: 기본값만으로 필드와 맞아야 한다. */
const ROW: CSSProperties = { display: "flex", alignItems: "center", gap: "0.5rem" }
const FIELD_WIDTH: CSSProperties = { width: "9rem" }

type ControlSize = NonNullable<ToggleGroupProps["size"]>

/* `itemSize`는 그룹 안 Toggle 하나에 일부러 다른 `size`를 준다 — 그래도 판의 겉
 * 높이가 그룹의 `size`를 따르는지를 sm 줄이 잰다(그룹이 context로 이긴다) */
function HoldingFilter({ size, itemSize }: { size?: ControlSize; itemSize?: ControlSize }) {
  return (
    <ToggleGroup size={size} defaultValue={["all"]} aria-label={`보유 필터 ${size ?? "기본"}`}>
      <Toggle value="all">전체</Toggle>
      <Toggle value="holding">보유</Toggle>
      <Toggle value="sold" size={itemSize}>
        매도 완료
      </Toggle>
    </ToggleGroup>
  )
}

export const ControlHeight: Story = {
  name: "컨트롤 높이",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div data-testid="row-sm" data-control-height="sm" style={ROW}>
        <Button size="sm" variant="outline">
          버튼
        </Button>
        <Toggle size="sm" aria-label="토글 sm">
          토글
        </Toggle>
        <HoldingFilter size="sm" itemSize="lg" />
      </div>
      <div data-testid="row-md" data-control-height="md" style={ROW}>
        <Button variant="outline">버튼</Button>
        <Button size="icon" variant="outline" aria-label="필터">
          <SlidersHorizontal />
        </Button>
        <Toggle aria-label="토글 md">토글</Toggle>
        <HoldingFilter />
        <Input aria-label="검색" placeholder="종목 검색" style={FIELD_WIDTH} />
        <Select.Root items={{ recent: "최근 순", name: "이름 순" }} defaultValue="recent">
          <Select.Trigger aria-label="정렬" style={FIELD_WIDTH}>
            <Select.Value />
          </Select.Trigger>
          <Select.Portal>
            <Select.Positioner>
              <Select.Popup>
                <Select.List>
                  <Select.Item value="recent">최근 순</Select.Item>
                  <Select.Item value="name">이름 순</Select.Item>
                </Select.List>
              </Select.Popup>
            </Select.Positioner>
          </Select.Portal>
        </Select.Root>
        <Combobox.Root items={["애플", "테슬라"]}>
          <Combobox.Input aria-label="종목" placeholder="종목" style={FIELD_WIDTH} />
          <Combobox.Popup>
            <Combobox.List>
              {(item: string) => (
                <Combobox.Item key={item} value={item}>
                  {item}
                </Combobox.Item>
              )}
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Root>
        <NumberField.Root defaultValue={1} min={0} style={FIELD_WIDTH}>
          <NumberField.Group>
            <NumberField.Decrement />
            <NumberField.Input aria-label="수량" />
            <NumberField.Increment />
          </NumberField.Group>
        </NumberField.Root>
      </div>
      <div data-testid="row-lg" data-control-height="lg" style={ROW}>
        <Button size="lg" variant="outline">
          버튼
        </Button>
        <Toggle size="lg" aria-label="토글 lg">
          토글
        </Toggle>
        <HoldingFilter size="lg" />
      </div>
    </div>
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
