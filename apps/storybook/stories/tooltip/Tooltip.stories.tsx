import { Tooltip } from "@flameware/ui/tooltip"
import type { Meta, StoryObj } from "@storybook/react-vite"

import type { KeyboardContract } from "../keyboard"
import type { ComponentMeta } from "../meta"

const meta = {
  title: "Overlays/Tooltip",
  component: Tooltip.Trigger,
  parameters: { ds: { status: "stable", since: "0.2.0" } },
} satisfies Meta<typeof Tooltip.Trigger> & ComponentMeta

export default meta

type Story = StoryObj<typeof meta>

/* 아이콘 전용 트리거다 — 이름은 툴팁의 문장에만 있으므로 `aria-label`이
 * 필수다. Button의 IconOnly 스토리와 같은 이유(axe가 문다). */
export const Playground: Story = {
  render: () => (
    <Tooltip.Root>
      <Tooltip.Trigger aria-label="저장">
        <SaveIcon />
      </Tooltip.Trigger>
      <Tooltip.Popup>저장</Tooltip.Popup>
    </Tooltip.Root>
  ),
}

export const Sides: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "2rem", padding: "2rem" }}>
      {(["top", "right", "bottom", "left"] as const).map((side) => (
        <Tooltip.Root key={side}>
          <Tooltip.Trigger aria-label={`${side} 방향 설명`}>
            <SaveIcon />
          </Tooltip.Trigger>
          <Tooltip.Popup side={side}>{side}</Tooltip.Popup>
        </Tooltip.Root>
      ))}
    </div>
  ),
}

/* 호버·포커스 둘 다 여는 것이 계약이다(#285 AC) — 열림 자체는 Base UI가 지므로
 * 여기서는 포커스로 여는 절반만 키보드로 잰다(호버는 포인터 이벤트라 Playwright
 * `keyboard.press`로 재는 대상이 아니다). Esc가 닫고 포커스는 트리거에
 * 남는다 — 다이얼로그와 달리 포커스가 트리거를 떠나지 않는다. */
const keyboard: KeyboardContract[] = [
  {
    name: "포커스가 호버 없이 툴팁을 연다",
    focus: "[data-testid=tooltip-trigger]",
    press: [],
    expect: { text: { "[data-testid=tooltip-content]": "저장" } },
  },
  {
    name: "Esc가 닫고 포커스는 트리거에 남는다",
    focus: "[data-testid=tooltip-trigger]",
    press: ["Escape"],
    expect: { focused: "[data-testid=tooltip-trigger]" },
  },
]

export const Keyboard: Story = {
  name: "키보드 계약",
  parameters: { keyboard },
  render: () => (
    <Tooltip.Root>
      <Tooltip.Trigger data-testid="tooltip-trigger" aria-label="저장">
        <SaveIcon />
      </Tooltip.Trigger>
      <Tooltip.Popup>
        <span data-testid="tooltip-content">저장</span>
      </Tooltip.Popup>
    </Tooltip.Root>
  ),
}

function SaveIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none">
      <path
        d="M3 2h8l3 3v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M5 2v4h5V2" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}
