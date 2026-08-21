import type { Meta, StoryObj } from "@storybook/react-vite"
import { Label } from "@massive/ui"

const meta = {
  title: "Label",
  component: Label,
  args: {
    children: "이메일",
  },
} satisfies Meta<typeof Label>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
