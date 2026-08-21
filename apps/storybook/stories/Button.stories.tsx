import type { Meta, StoryObj } from "@storybook/react-vite"
import { Button, buttonVariantsConfig } from "@massive/ui"

/* variant·size 옵션은 buttonVariantsConfig(cva)에서 뽑는다 — 매니페스트나
 * 손으로 옮겨 적은 목록이 아니라 원본에서 직접 읽는다(핸드오프 §2.5). */
const meta = {
  title: "Button",
  component: Button,
  argTypes: {
    variant: { control: "select", options: Object.keys(buttonVariantsConfig.variants.variant) },
    size: { control: "select", options: Object.keys(buttonVariantsConfig.variants.size) },
  },
  args: {
    children: "Button",
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const AllVariants: Story = {
  render: (args) => (
    <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
      {Object.keys(buttonVariantsConfig.variants.variant).map((variant) => (
        <Button key={variant} {...args} variant={variant as never}>
          {variant}
        </Button>
      ))}
    </div>
  ),
}
