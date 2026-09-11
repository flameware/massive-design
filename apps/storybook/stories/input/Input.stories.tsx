import { Field } from "@flameware/ui/field"
import { Input } from "@flameware/ui/input"
import type { Meta, StoryObj } from "@storybook/react-vite"

import type { ComponentMeta } from "../meta"

const meta = {
  title: "Forms/Input",
  component: Input,
  parameters: { ds: { status: "stable", since: "0.2.0" } },
  args: { type: "text", placeholder: "저장할 값" },
  argTypes: {
    type: { control: "select", options: ["text", "email", "password", "number", "tel", "url"] },
    disabled: { control: "boolean" },
  },
  decorators: [
    (Story) => (
      <Field.Root name="playground" style={{ maxWidth: "20rem" }}>
        <Field.Label>라벨</Field.Label>
        <Story />
      </Field.Root>
    ),
  ],
} satisfies Meta<typeof Input> & ComponentMeta

export default meta

type Story = StoryObj<typeof meta>

/* Field 밖의 args 표 + Controls가 이 스토리에서 나므로, 문서 페이지의 props 표는
 * 여기를 가리킨다. 렌더 자체는 위 decorator가 Field.Root로 감싼다 — Input
 * 혼자서는 라벨이 없어 axe가 문다 */
export const Playground: Story = {}

export const Types: Story = {
  decorators: [],
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "20rem" }}>
      <Field.Root name="text">
        <Field.Label>text</Field.Label>
        <Input type="text" placeholder="text" />
      </Field.Root>
      <Field.Root name="email-type">
        <Field.Label>email</Field.Label>
        <Input type="email" placeholder="you@example.com" />
      </Field.Root>
      <Field.Root name="password-type">
        <Field.Label>password</Field.Label>
        <Input type="password" placeholder="password" />
      </Field.Root>
    </div>
  ),
}

export const States: Story = {
  decorators: [],
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "20rem" }}>
      <Field.Root name="disabled-state" disabled>
        <Field.Label>비활성</Field.Label>
        <Input placeholder="편집 불가" />
      </Field.Root>
      <Field.Root name="invalid-state" invalid touched>
        <Field.Label>오류</Field.Label>
        <Input defaultValue="잘못된 값" />
        <Field.Error match>형식이 올바르지 않습니다</Field.Error>
      </Field.Root>
    </div>
  ),
}
