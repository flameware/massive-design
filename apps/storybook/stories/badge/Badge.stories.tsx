import { Badge } from "@flameware/ui/badge"
import type { Meta, StoryObj } from "@storybook/react-vite"

import type { ComponentMeta } from "../meta"

/* Badge는 Base UI 뒤가 없는 자체 스타일 primitive다(#290) — 눌리는 것이 없어
 * 키보드 계약 스토리는 두지 않는다. 면이 있는 다섯 톤은 전부 대비 게이트가
 * 검증한 조합만 쓴다(packages/tokens/scripts/contrast.mjs TEXT_PAIRS) — 아래
 * Tones 스토리가 그 다섯을 나란히 보여준다. `outline`은 면이 없어(#293) 그
 * 게이트 밖이고 `fg.default` 하나만 쓴다. */
const meta = {
  title: "Data display/Badge",
  component: Badge,
  parameters: { ds: { status: "preview", since: "0.2.0" } },
  args: { children: "완료", tone: "neutral" },
  argTypes: {
    tone: { control: "select", options: ["neutral", "accent", "danger", "success", "warning", "outline"] },
  },
} satisfies Meta<typeof Badge> & ComponentMeta

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/* 다섯 톤을 나란히 — 전부 대비 게이트가 검증한 [전경, 배경] 조합이다. */
export const Tones: Story = {
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
      <Badge tone="neutral">중립</Badge>
      <Badge tone="accent">강조</Badge>
      <Badge tone="danger">위험</Badge>
      <Badge tone="success">성공</Badge>
      <Badge tone="warning">주의</Badge>
    </div>
  ),
}

/* 면 없이 테두리만 — 분류가 아니라 밀도 낮은 배지가 필요한 자리(#293). */
export const Outline: Story = {
  args: { tone: "outline", children: "한국" },
}
