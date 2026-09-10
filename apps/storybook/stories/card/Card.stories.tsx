import { Card } from "@flameware/ui/card"
import type { Meta, StoryObj } from "@storybook/react-vite"

import type { ComponentMeta } from "../meta"

/* Card는 Base UI 뒤가 없는 자체 스타일 primitive다(#283) — 상태도 상호작용도
 * 없어 키보드 계약 스토리는 두지 않는다. 주 seam이 재는 것은 axe와 히트
 * 영역뿐이고 Card는 어느 쪽도 스스로 만들지 않는다(누르는 요소가 없다). */
const meta = {
  title: "Layout/Card",
  component: Card.Root,
  parameters: { ds: { status: "preview", since: "0.2.0" } },
} satisfies Meta<typeof Card.Root> & ComponentMeta

export default meta

type Story = StoryObj<typeof meta>

/* Header·Body·Footer 셋을 모두 쓴 자리 — 문서의 기본 그림이다. */
export const Playground: Story = {
  render: () => (
    <Card.Root style={{ maxWidth: "24rem" }}>
      <Card.Header>
        <strong>포트폴리오 요약</strong>
        <span style={{ color: "var(--ds-fg-muted)", fontSize: "0.875rem" }}>이번 달 평가액과 수익률</span>
      </Card.Header>
      <Card.Body>
        <p style={{ margin: 0 }}>평가액 12,450,000원 · 수익률 +3.2%</p>
      </Card.Body>
      <Card.Footer>
        <span style={{ color: "var(--ds-fg-muted)", fontSize: "0.75rem" }}>5분 전 갱신</span>
      </Card.Footer>
    </Card.Root>
  ),
}

/* 파트를 하나만 쓰는 카드도 흔하다 — Body만으로도 유효하다. */
export const BodyOnly: Story = {
  render: () => (
    <Card.Root style={{ maxWidth: "24rem" }}>
      <Card.Body>
        <p style={{ margin: 0 }}>헤더·푸터 없이 본문만 있는 카드.</p>
      </Card.Body>
    </Card.Root>
  ),
}

/* 그림자를 강제하지 않는다는 것을 눈으로 보여주는 자리 — Root는 border·bg만으로
 * 면을 뗀다. 그림자가 필요하면 className으로 얹는다(토큰은 있되 강제하지 않는다). */
export const FlatByDefault: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "1rem" }}>
      <Card.Root style={{ width: "12rem" }}>
        <Card.Body>기본 — 그림자 없음</Card.Body>
      </Card.Root>
      <Card.Root className="shadow-md" style={{ width: "12rem" }}>
        <Card.Body>className으로 얹은 그림자</Card.Body>
      </Card.Root>
    </div>
  ),
}
