import { Separator } from "@flameware/ui/separator"
import type { Meta, StoryObj } from "@storybook/react-vite"

import type { ComponentMeta } from "../meta"

const meta = {
  title: "Layout/Separator",
  component: Separator,
  parameters: { ds: { status: "stable", since: "0.2.0" } },
  args: { orientation: "horizontal" },
  argTypes: {
    orientation: { control: "select", options: ["horizontal", "vertical"] },
  },
} satisfies Meta<typeof Separator> & ComponentMeta

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: (args) => (
    <div style={{ width: "16rem" }}>
      <p>위 문단</p>
      <Separator {...args} />
      <p>아래 문단</p>
    </div>
  ),
}

export const Vertical: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", height: "1.5rem" }}>
      <span>메뉴</span>
      <Separator orientation="vertical" />
      <span>설정</span>
      <Separator orientation="vertical" />
      <span>로그아웃</span>
    </div>
  ),
}
