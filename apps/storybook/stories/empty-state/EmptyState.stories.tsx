import { Button } from "@flameware/ui/button"
import { EmptyState } from "@flameware/ui/empty-state"
import { Icon } from "@flameware/ui/icon"
import { Inbox, Plus, Search } from "lucide-react"
import type { Meta, StoryObj } from "@storybook/react-vite"

import type { ComponentMeta } from "../meta"

/* EmptyState는 Base UI 뒤가 없는 자체 스타일 패턴이다(#317 Implementation
 * Decisions, #326) — "…없습니다" 자리를 아이콘·제목·설명·행동 버튼 슬롯으로
 * 묶는다. 눌리는 것은 슬롯에 놓인 Button뿐이고 그 키보드 계약은 Button 자신의
 * 스토리가 이미 진다 — 여기서는 키보드 계약 스토리를 새로 두지 않는다. 주 seam이
 * 재는 axe가 Root의 aria-labelledby·aria-describedby 정합성을 잡는다. */
const meta = {
  title: "Patterns/EmptyState",
  component: EmptyState.Root,
  parameters: { ds: { status: "preview", since: "0.3.2" } },
} satisfies Meta<typeof EmptyState.Root> & ComponentMeta

export default meta

type Story = StoryObj<typeof meta>

/* 아이콘·제목·설명·행동 버튼 넷 다 있는 기본 조립 — 히스토리 화면의 거래 목록이
 * 빈 자리(#326 "히스토리 화면이 첫 소비처")가 쓰는 모양이다. */
export const Playground: Story = {
  render: () => (
    <EmptyState.Root style={{ maxWidth: "24rem" }}>
      <EmptyState.Icon>
        <Icon icon={Inbox} />
      </EmptyState.Icon>
      <EmptyState.Title>아직 거래 내역이 없습니다</EmptyState.Title>
      <EmptyState.Description>종목을 매수하면 여기에 거래 내역이 쌓입니다.</EmptyState.Description>
      <EmptyState.Action>
        <Button>
          <Icon icon={Plus} />
          거래 추가
        </Button>
      </EmptyState.Action>
    </EmptyState.Root>
  ),
}

/* 행동 버튼 없이 — 아이콘·제목·설명만으로도 무너지지 않는다(#326 AC). 필터
 * 결과가 비어 소비처가 행동을 제안할 것이 없는 자리(거래 데이터 테이블의
 * 필터 결과 없음). */
export const NoAction: Story = {
  render: () => (
    <EmptyState.Root style={{ maxWidth: "24rem" }}>
      <EmptyState.Icon>
        <Icon icon={Search} />
      </EmptyState.Icon>
      <EmptyState.Title>검색 결과가 없습니다</EmptyState.Title>
      <EmptyState.Description>다른 검색어나 기간으로 다시 시도해 주세요.</EmptyState.Description>
    </EmptyState.Root>
  ),
}

/* 아이콘 없이 — 제목·설명·행동 버튼만으로도 무너지지 않는다(#326 AC). 이미
 * 아이콘이 있는 컨테이너(카드 헤더 등) 안에 놓이는 자리. */
export const NoIcon: Story = {
  render: () => (
    <EmptyState.Root style={{ maxWidth: "24rem" }}>
      <EmptyState.Title>아직 거래 내역이 없습니다</EmptyState.Title>
      <EmptyState.Description>종목을 매수하면 여기에 거래 내역이 쌓입니다.</EmptyState.Description>
      <EmptyState.Action>
        <Button variant="outline">거래 추가</Button>
      </EmptyState.Action>
    </EmptyState.Root>
  ),
}

/* 제목·설명만 — 아이콘도 행동 버튼도 없는 가장 좁은 자리도 유효하다. */
export const TitleAndDescriptionOnly: Story = {
  render: () => (
    <EmptyState.Root style={{ maxWidth: "24rem" }}>
      <EmptyState.Title>아직 거래 내역이 없습니다</EmptyState.Title>
      <EmptyState.Description>종목을 매수하면 여기에 거래 내역이 쌓입니다.</EmptyState.Description>
    </EmptyState.Root>
  ),
}

/* #327: Description 없이 Title만 — 소비처(투자 다이어리 거래 목록)가
 * `onEdit`가 있을 때만 Description을 붙이는 실제 경로다. Root는 이 자리에서
 * `aria-describedby`를 아예 걸지 않는다(매달린 IDREF 금지) — axe가 이를
 * 잡아낸다. 이 스토리가 없어서 #327의 결함이 소비처에서 먼저 발견됐다. */
export const TitleOnly: Story = {
  render: () => (
    <EmptyState.Root style={{ maxWidth: "24rem" }}>
      <EmptyState.Icon>
        <Icon icon={Inbox} />
      </EmptyState.Icon>
      <EmptyState.Title>아직 거래 내역이 없습니다</EmptyState.Title>
    </EmptyState.Root>
  ),
}

/* #327: Title 없이 Description만 — Root는 `aria-labelledby`도 같은 규칙으로
 * 옵셔널이다. Title은 이 패턴이 존재하는 이유라 문서·관례상 거의 항상 쓰지만
 * (컴포넌트 코멘트 참고), 타입이 막지 않으므로 이 조합도 매달린 IDREF 없이
 * 유효해야 한다. */
export const DescriptionOnly: Story = {
  render: () => (
    <EmptyState.Root style={{ maxWidth: "24rem" }}>
      <EmptyState.Icon>
        <Icon icon={Inbox} />
      </EmptyState.Icon>
      <EmptyState.Description>종목을 매수하면 여기에 거래 내역이 쌓입니다.</EmptyState.Description>
    </EmptyState.Root>
  ),
}
