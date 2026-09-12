import { Spinner } from "@flameware/ui/spinner"
import type { Meta, StoryObj } from "@storybook/react-vite"

import type { ComponentMeta } from "../meta"

/* Spinner는 Base UI 뒤가 없는 자체 스타일 primitive다(#290) — 눌리는 것이
 * 없어 키보드 계약 스토리는 두지 않는다. axe가 재는 것은 role=status의
 * 접근성 이름이다. Button의 loading 상태가 이 컴포넌트를 그대로 쓴다
 * (button.tsx) — 둘이 같은 그림이라는 것을 AsButtonLoading 스토리가 보여준다. */
const meta = {
  title: "Feedback/Spinner",
  component: Spinner,
  parameters: { ds: { status: "stable", since: "0.2.0" } },
  args: { size: "md" },
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg", "xl"] },
  },
} satisfies Meta<typeof Spinner> & ComponentMeta

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: "1rem", color: "var(--ds-fg-default)" }}>
      <Spinner size="sm" />
      <Spinner size="md" />
      <Spinner size="lg" />
      <Spinner size="xl" />
    </div>
  ),
}

/* xl(32px)은 sm·md·lg와 자리가 다르다 — 글자 곁이 아니라 화면 한가운데
 * 혼자 선다(전체 화면 대기, #351). */
export const FullScreenWait: Story = {
  name: "전체 화면 대기",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", color: "var(--ds-fg-default)" }}>
      <Spinner size="xl" aria-hidden="true" />
      <span>불러오는 중…</span>
    </div>
  ),
}

/* 혼자 놓이면 스스로 이름을 낸다 — 곁의 글줄이 이미 "불러오는 중"을 말하는
 * 자리는 aria-hidden으로 중복 안내를 끈다(Button이 이렇게 쓴다). */
export const WithLabel: Story = {
  name: "곁에 텍스트가 있을 때",
  render: () => (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--ds-fg-default)" }}>
      <Spinner aria-hidden="true" />
      불러오는 중…
    </span>
  ),
}
