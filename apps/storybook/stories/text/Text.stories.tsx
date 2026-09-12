import { Heading, Text } from "@flameware/ui/text"
import type { Meta, StoryObj } from "@storybook/react-vite"

import type { ComponentMeta } from "../meta"

const SIZES = ["xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl", "5xl"] as const

/* tone 어휘는 Badge·Alert의 tone과 같다(#368) — neutral·danger·muted 셋을 열었다
 * (accent·success·warning·outline은 Text·Heading에 실측 수요가 없다). 기본값
 * `inherit`는 클래스를 하나도 안 낸다(#366). */
const TONES = ["inherit", "neutral", "danger", "muted"] as const

/* Text·Heading은 Base UI 뒤가 없는 자체 스타일 primitive다(#290) — 눌리는 것이
 * 없어 키보드 계약 스토리는 두지 않는다. 크기 이름은 Foundations 타이포
 * 챕터(../foundations/Typography.mdx)의 아홉 이름과 같다. */
const meta = {
  title: "Typography/Text",
  component: Text,
  parameters: { ds: { status: "stable", since: "0.2.0" } },
  args: { children: "본문 텍스트", size: "sm" },
  argTypes: {
    size: { control: "select", options: SIZES },
    tone: { control: "select", options: TONES },
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

/* tone 네 값 — Badge·Alert와 같은 어휘(#368). `inherit`는 부모 색을 물려받고
 * (여기선 배경 위 기본 검정), 나머지 셋은 자기 색을 낸다. */
export const Tones: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
      {TONES.map((tone) => (
        <Text key={tone} tone={tone}>
          tone={tone}
        </Text>
      ))}
    </div>
  ),
}

/* Heading의 tone — Text와 같은 값을 받는다. */
export const HeadingTones: Story = {
  name: "Heading — tone",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      {TONES.map((tone) => (
        <Heading key={tone} level={3} tone={tone}>
          tone={tone}
        </Heading>
      ))}
    </div>
  ),
}

/* Heading의 weight — 기본은 하드코딩돼 있던 semibold, 실측 수요(3자리)로 연
 * bold. Text에는 없다(수요 0). */
export const HeadingWeights: Story = {
  name: "Heading — weight",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <Heading level={3} weight="semibold">
        weight=semibold(기본)
      </Heading>
      <Heading level={3} weight="bold">
        weight=bold
      </Heading>
    </div>
  ),
}
