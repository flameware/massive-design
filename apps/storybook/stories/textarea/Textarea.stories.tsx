import { Field } from "@flameware/ui/field"
import { Textarea } from "@flameware/ui/textarea"
import type { Meta, StoryObj } from "@storybook/react-vite"

import type { ComponentMeta } from "../meta"

const meta = {
  title: "Forms/Textarea",
  component: Textarea,
  parameters: { ds: { status: "preview", since: "0.2.0" } },
  args: { placeholder: "여러 줄로 적으세요", rows: 4 },
  decorators: [
    (Story) => (
      <Field.Root name="playground" style={{ maxWidth: "24rem" }}>
        <Field.Label>메모</Field.Label>
        <Story />
      </Field.Root>
    ),
  ],
} satisfies Meta<typeof Textarea> & ComponentMeta

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const States: Story = {
  decorators: [],
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "24rem" }}>
      <Field.Root name="disabled-state" disabled>
        <Field.Label>비활성</Field.Label>
        <Textarea placeholder="편집 불가" />
      </Field.Root>
      <Field.Root name="invalid-state" invalid touched>
        <Field.Label>오류</Field.Label>
        <Textarea defaultValue="너무 짧음" />
        <Field.Error match>최소 10자 이상 적어 주세요</Field.Error>
      </Field.Root>
    </div>
  ),
}
