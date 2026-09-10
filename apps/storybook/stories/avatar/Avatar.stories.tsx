import { Avatar } from "@flameware/ui/avatar"
import type { Meta, StoryObj } from "@storybook/react-vite"

import type { ComponentMeta } from "../meta"

/* 데이터 URI다 — 스토리 테스트는 로컬이 아닌 요청을 전부 끊는다
 * (apps/storybook/test/stories.test.mjs). 원격 이미지를 쓰면 테스트 환경에서
 * 언제나 실패로 떨어져 Playground가 우연히 Fallback 스토리와 같아진다. */
const SAMPLE_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect width='80' height='80' fill='%230f5fed'/%3E%3Ccircle cx='40' cy='32' r='14' fill='%23fff'/%3E%3Cellipse cx='40' cy='72' rx='24' ry='18' fill='%23fff'/%3E%3C/svg%3E"

const meta = {
  title: "Data display/Avatar",
  component: Avatar.Root,
  parameters: { ds: { status: "preview", since: "0.2.0" } },
  args: { size: "md" },
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg"] },
  },
} satisfies Meta<typeof Avatar.Root> & ComponentMeta

export default meta

type Story = StoryObj<typeof meta>

/* 이미지가 있는 자리. 폴백도 함께 둔다 — 불러오는 동안이나 실패했을 때
 * 비는 자리가 없도록. */
export const Playground: Story = {
  render: (args) => (
    <Avatar.Root {...args}>
      <Avatar.Image src={SAMPLE_IMAGE} alt="김서연" />
      <Avatar.Fallback>김서</Avatar.Fallback>
    </Avatar.Root>
  ),
}

/* 이미지가 없거나(빈 src) 실패하면 이니셜로 떨어진다 — Base UI가 로딩 상태를
 * 관리하고, 우리는 `Fallback`의 children으로 이니셜 문자열만 준다(avatar.tsx).
 * 인증 헤더의 사용자 메뉴 트리거가 바로 이 모양이다(#285). */
export const Fallback: Story = {
  render: (args) => (
    <Avatar.Root {...args}>
      <Avatar.Image src="/broken-image-url.png" alt="이서준" />
      <Avatar.Fallback>이서</Avatar.Fallback>
    </Avatar.Root>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
      <Avatar.Root size="sm">
        <Avatar.Fallback>SK</Avatar.Fallback>
      </Avatar.Root>
      <Avatar.Root size="md">
        <Avatar.Fallback>SK</Avatar.Fallback>
      </Avatar.Root>
      <Avatar.Root size="lg">
        <Avatar.Fallback>SK</Avatar.Fallback>
      </Avatar.Root>
    </div>
  ),
}
