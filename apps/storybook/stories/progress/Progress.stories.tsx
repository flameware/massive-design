import { Progress } from "@flameware/ui/progress"
import type { Meta, StoryObj } from "@storybook/react-vite"

import type { ComponentMeta } from "../meta"

/* Progress는 Base UI 뒤에 있다(#325) — role="progressbar"·aria-valuenow·
 * aria-valuemin·aria-valuemax·aria-valuetext 전부를 Root가 스스로 낸다. 값이
 * 있는(결정적) 진행률만 다룬다 — 비결정적 모양은 Spinner의 자리다(#317 스토리 9).
 * 눌리는 것이 없어 키보드 계약 스토리는 두지 않는다 — 주 seam이 재는 axe가
 * 접근성 트리 정합성을 잡는다. */
const meta = {
  title: "Feedback/Progress",
  component: Progress.Root,
  parameters: { ds: { status: "stable", since: "0.3.2" } },
  args: { value: 40 },
} satisfies Meta<typeof Progress.Root> & ComponentMeta

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: (args) => (
    <Progress.Root {...args} style={{ maxWidth: "24rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Progress.Label>시세 갱신 중</Progress.Label>
        <Progress.Value />
      </div>
      <Progress.Track>
        <Progress.Indicator />
      </Progress.Track>
    </Progress.Root>
  ),
}

/* 0%·중간·100%를 나란히 — 시세 일괄 갱신·CSV 가져오기가 지나는 세 지점이다
 * (#317 스토리 9). 100%에서 Base UI가 `data-complete`를 낸다. */
export const Stages: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", maxWidth: "24rem" }}>
      <Progress.Root value={0}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Progress.Label>CSV 가져오는 중</Progress.Label>
          <Progress.Value />
        </div>
        <Progress.Track>
          <Progress.Indicator />
        </Progress.Track>
      </Progress.Root>
      <Progress.Root value={62}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Progress.Label>CSV 가져오는 중</Progress.Label>
          <Progress.Value />
        </div>
        <Progress.Track>
          <Progress.Indicator />
        </Progress.Track>
      </Progress.Root>
      <Progress.Root value={100}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Progress.Label>CSV 가져오는 중</Progress.Label>
          <Progress.Value />
        </div>
        <Progress.Track>
          <Progress.Indicator />
        </Progress.Track>
      </Progress.Root>
    </div>
  ),
}

/* Label·Value 없이 Track·Indicator만으로도 유효하다 — 진행률이 무엇의
 * 진행인지가 이미 화면 다른 곳(모달 제목 등)에 있는 자리. */
export const TrackOnly: Story = {
  render: (args) => (
    <Progress.Root {...args} style={{ maxWidth: "24rem" }} aria-label="시세 갱신 중">
      <Progress.Track>
        <Progress.Indicator />
      </Progress.Track>
    </Progress.Root>
  ),
}
