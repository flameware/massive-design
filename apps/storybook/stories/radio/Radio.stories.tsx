import { Radio } from "@flameware/ui/radio"
import { RadioGroup } from "@flameware/ui/radio-group"
import type { Meta, StoryObj } from "@storybook/react-vite"

import type { ComponentMeta } from "../meta"

/* Radio 혼자서는 값을 갖지 못한다 — `checked`는 감싸는 `RadioGroup`의 값과
 * 자기 `value`가 같은가로 정해진다(radio.tsx 주석, RadioRoot.mjs). 그래서 이
 * 스토리들도 전부 `RadioGroup` 안에서 Radio를 보여준다. 제어/비제어·Field·
 * Form·키보드 계약은 그룹 축이라 `../radio-group/RadioGroup.stories.tsx`가
 * 진다 — 여기는 항목 자체의 모양(16px 상자·상태·hit-area)만 보인다. */
const meta = {
  title: "Forms/Radio",
  component: Radio,
  parameters: { ds: { status: "preview", since: "0.6.0" } },
  args: { disabled: false },
  argTypes: {
    disabled: { control: "boolean" },
  },
  decorators: [
    (Story) => (
      <RadioGroup aria-label="playground" defaultValue="a">
        <Story />
      </RadioGroup>
    ),
  ],
} satisfies Meta<typeof Radio> & ComponentMeta

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {
  args: { value: "a", "aria-label": "항목 A" },
}

/* 시각 상자는 16px지만 히트 영역은 hit-area가 24px까지 넓힌다(radio.tsx,
 * ADR-0020) — 스토리 테스트가 이 스토리를 열어 그대로 잰다. */
export const States: Story = {
  args: { value: "a" },
  decorators: [],
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <RadioGroup aria-label="선택 안 됨">
        <Row value="a" label="선택 안 됨" />
      </RadioGroup>
      <RadioGroup aria-label="선택됨" defaultValue="a">
        <Row value="a" label="선택됨" />
      </RadioGroup>
      <RadioGroup aria-label="비활성" disabled>
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
