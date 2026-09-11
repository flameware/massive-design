import { Icon } from "@flameware/ui/icon"
import { Save } from "lucide-react"
import type { Meta, StoryObj } from "@storybook/react-vite"

import type { ComponentMeta } from "../meta"

const meta = {
  title: "Foundations/아이콘",
  component: Icon,
  parameters: { ds: { status: "stable", since: "0.2.0" } },
  args: { icon: Save, size: "md" },
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg"] },
  },
} satisfies Meta<typeof Icon> & ComponentMeta

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/* 세 크기가 곧 타이포 스케일과의 짝이다 — sm=text-sm, md=text-base, lg=text-lg */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: "1rem", color: "var(--ds-fg-default)" }}>
      <span style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.875rem" }}>
        <Icon icon={Save} size="sm" /> sm
      </span>
      <span style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "1rem" }}>
        <Icon icon={Save} size="md" /> md
      </span>
      <span style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "1.125rem" }}>
        <Icon icon={Save} size="lg" /> lg
      </span>
    </div>
  ),
}
