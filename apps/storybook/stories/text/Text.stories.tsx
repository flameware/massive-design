import { Heading, Text } from "@flameware/ui/text"
import type { Meta, StoryObj } from "@storybook/react-vite"

import type { ComponentMeta } from "../meta"

const SIZES = ["xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl", "5xl"] as const

/* Text·Heading은 Base UI 뒤가 없는 자체 스타일 primitive다(#290) — 눌리는 것이
 * 없어 키보드 계약 스토리는 두지 않는다. 크기 이름은 Foundations 타이포
 * 챕터(../foundations/Typography.mdx)의 아홉 이름과 같다. */
const meta = {
  title: "Typography/Text",
  component: Text,
  parameters: { ds: { status: "preview", since: "0.2.0" } },
  args: { children: "본문 텍스트", size: "sm" },
  argTypes: {
    size: { control: "select", options: SIZES },
    as: { control: "select", options: ["p", "span", "div", "label"] },
  },
} satisfies Meta<typeof Text> & ComponentMeta

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/* 아홉 크기를 모두 나란히 — Foundations 타이포 챕터와 같은 이름이다. */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
      {SIZES.map((size) => (
        <Text key={size} size={size}>
          text-{size} — massive-design 디자인 시스템
        </Text>
      ))}
    </div>
  ),
}

/* Heading은 level(태그)과 size(시각)를 따로 정한다 — size를 생략하면 level의
 * 기본 크기를 쓴다. */
export const HeadingLevels: Story = {
  name: "Heading — 레벨별 기본 크기",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <Heading level={1}>h1 제목</Heading>
      <Heading level={2}>h2 제목</Heading>
      <Heading level={3}>h3 제목</Heading>
      <Heading level={4}>h4 제목</Heading>
      <Heading level={5}>h5 제목</Heading>
      <Heading level={6}>h6 제목</Heading>
    </div>
  ),
}

/* 문서 구조상 h3여야 하지만 시각적으로는 더 커야 하는 자리 — level과 size를
 * 갈라 둔 이유가 이 그림이다. */
export const HeadingSizeOverride: Story = {
  name: "Heading — level과 size를 분리",
  render: () => (
    <Heading level={3} size="3xl">
      h3인데 3xl 크기
    </Heading>
  ),
}
