import { Skeleton } from "@flameware/ui/skeleton"
import type { Meta, StoryObj } from "@storybook/react-vite"

import type { ComponentMeta } from "../meta"

/* Skeleton은 Base UI 뒤가 없는 자체 스타일 primitive다(#290) — 눌리는 것이
 * 없어 키보드 계약 스토리는 두지 않는다. axe가 재는 것은 role=status +
 * aria-busy의 접근성 트리 정합성이다 — 스스로 이름을 내므로 감싸는 영역이
 * 로딩을 알리길 기다리지 않는다. 그 자기 선언을 끈 쪽은 `부모가 알리는 자리`가
 * 잰다(#321) — 부모가 지고 자리표시자는 이름 없는 div로 남는 모양이다. */
const meta = {
  title: "Feedback/Skeleton",
  component: Skeleton,
  parameters: { ds: { status: "stable", since: "0.2.0" } },
  args: { className: "h-4 w-40" },
} satisfies Meta<typeof Skeleton> & ComponentMeta

export default meta

type Story = StoryObj<typeof meta>

/* 목록 행 자리표시자를 세로로 쌓는 모양 — 두 스토리가 같은 자리를 그린다. */
const column = {
  display: "flex",
  flexDirection: "column",
  gap: "0.375rem",
  maxWidth: "20rem",
} as const

export const Playground: Story = {}

/* 크기·모양은 전부 className이 진다 — 최종 콘텐츠의 레이아웃을 흉내 낸다. */
export const ListRowShape: Story = {
  name: "ListRow 자리표시자",
  render: () => (
    <div style={column}>
      <Skeleton className="h-4 w-32" aria-label="종목명 불러오는 중" />
      <Skeleton className="h-3 w-24" aria-label="거래 정보 불러오는 중" />
    </div>
  ),
}

/* 원형 자리표시자 — 아바타·아이콘 자리도 같은 컴포넌트로 그린다. */
export const CircleShape: Story = {
  name: "원형 자리표시자",
  render: () => <Skeleton className="size-10 rounded-full" aria-label="아바타 불러오는 중" />,
}

/* 부모가 이미 로딩을 알리는 자리 — 감싸는 영역이 `role="status"`+`aria-busy`를
 * 지므로 안의 Skeleton은 `announce={false}`로 자기 선언을 끈다. 끄지 않으면
 * 같은 로딩을 말하는 라이브 리전이 부모 하나·자리표시자마다 하나씩 겹쳐 선다. */
export const AnnouncedByParent: Story = {
  name: "부모가 알리는 자리",
  render: () => (
    <section
      role="status"
      aria-busy="true"
      aria-label="보유 종목 불러오는 중"
      style={column}
    >
      <Skeleton announce={false} className="h-4 w-32" />
      <Skeleton announce={false} className="h-3 w-24" />
    </section>
  ),
}
