import { Alert } from "@flameware/ui/alert"
import { Icon } from "@flameware/ui/icon"
import { CircleAlert, Info } from "lucide-react"
import type { Meta, StoryObj } from "@storybook/react-vite"

import type { ComponentMeta } from "../meta"

/* Alert는 Base UI 뒤가 없는 자체 스타일 primitive다(#283) — 눌리는 것이 없어
 * 키보드 계약 스토리는 두지 않는다. 주 seam이 재는 axe가 role=alert/status의
 * 접근성 트리 정합성을 잡는다 — 아래 Tones 스토리가 그 대상이다. */
const meta = {
  title: "Feedback/Alert",
  component: Alert.Root,
  parameters: { ds: { status: "preview", since: "0.2.0" } },
  args: { tone: "neutral" },
  argTypes: {
    tone: { control: "select", options: ["neutral", "danger"] },
  },
} satisfies Meta<typeof Alert.Root> & ComponentMeta

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: (args) => (
    <Alert.Root {...args} style={{ maxWidth: "28rem" }}>
      <Icon icon={args.tone === "danger" ? CircleAlert : Info} />
      <Alert.Title>{args.tone === "danger" ? "저장하지 못했습니다" : "알아 두세요"}</Alert.Title>
      <Alert.Description>
        {args.tone === "danger" ? "다시 시도하거나 나중에 다시 시도해 주세요." : "세션이 30분 뒤 만료됩니다."}
      </Alert.Description>
    </Alert.Root>
  ),
}

/* 톤 둘을 나란히 — 색뿐 아니라 role도 갈린다(danger=alert, neutral=status). */
export const Tones: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxWidth: "28rem" }}>
      <Alert.Root tone="neutral">
        <Icon icon={Info} />
        <Alert.Title>알아 두세요</Alert.Title>
        <Alert.Description>세션이 30분 뒤 만료됩니다.</Alert.Description>
      </Alert.Root>
      <Alert.Root tone="danger">
        <Icon icon={CircleAlert} />
        <Alert.Title>로그인하지 못했습니다</Alert.Title>
        <Alert.Description>이메일 또는 비밀번호를 확인해 주세요.</Alert.Description>
      </Alert.Root>
    </div>
  ),
}

/* 아이콘 없이도, 제목 없이 설명만으로도 유효하다. */
export const WithoutIcon: Story = {
  render: () => (
    <Alert.Root tone="danger" style={{ maxWidth: "28rem" }}>
      <Alert.Description>이메일 형식이 올바르지 않습니다.</Alert.Description>
    </Alert.Root>
  ),
}
