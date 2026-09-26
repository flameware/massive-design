import { Card } from "@flameware/ui/card"
import { ListRow } from "@flameware/ui/list-row"
import type { Meta, StoryObj } from "@storybook/react-vite"

import type { ComponentMeta } from "../meta"

/* Card는 Base UI 뒤가 없는 자체 스타일 primitive다(#283) — 상태도 상호작용도
 * 없어 키보드 계약 스토리는 두지 않는다. 주 seam이 재는 것은 axe와 히트
 * 영역뿐이고 Card는 어느 쪽도 스스로 만들지 않는다(누르는 요소가 없다). */
const meta = {
  title: "Layout/Card",
  component: Card.Root,
  parameters: { ds: { status: "stable", since: "0.2.0" } },
} satisfies Meta<typeof Card.Root> & ComponentMeta

export default meta

type Story = StoryObj<typeof meta>

/* Header·Body·Footer 셋을 모두 쓴 자리 — 문서의 기본 그림이다. Header 안의
 * 제목은 `strong`이 아니라 `Card.Title`이다(#293) — 소비처 세 곳에서 14번
 * 반복된 조립을 프리셋으로 올린 것.
 *
 * `data-inset`은 주 seam의 여백 계약이다(#469) — 기본 뷰포트(데스크톱)에서
 * 세 파트의 글자가 카드 안쪽 가장자리에서 24px에 선다. */
const summary = (inset: number) => (
  <Card.Root data-inset={inset} style={{ maxWidth: "24rem" }}>
    <Card.Header>
      <Card.Title data-inset-text>포트폴리오 요약</Card.Title>
      <span style={{ color: "var(--ds-fg-muted)", fontSize: "0.875rem" }}>이번 달 평가액과 수익률</span>
    </Card.Header>
    <Card.Body>
      <p data-inset-text style={{ margin: 0 }}>
        평가액 12,450,000원 · 수익률 +3.2%
      </p>
    </Card.Body>
    <Card.Footer>
      <span data-inset-text style={{ color: "var(--ds-fg-muted)", fontSize: "0.75rem" }}>
        5분 전 갱신
      </span>
    </Card.Footer>
  </Card.Root>
)

export const Playground: Story = {
  render: () => summary(24),
}

/* 같은 카드를 좁은 화면(375px)에서 연다 — `sm`(640px)보다 좁으면 여백이 16이다. */
export const Narrow: Story = {
  tags: ["viewport:mobile"],
  render: () => summary(16),
}

/* Root에서 `--ds-card-padding` 하나만 바꾸면 파트 전체의 여백이 따라온다.
 * 기본 뷰포트(sm 이상)에서 재는 것이 요점이다 — 기본값의 sm 규칙이 앱의 값을
 * 이기지 않는다는 것을 여기서 본다. */
export const CustomPadding: Story = {
  render: () => (
    <Card.Root data-inset={12} className="[--ds-card-padding:--spacing(3)]" style={{ maxWidth: "24rem" }}>
      <Card.Header>
        <Card.Title data-inset-text>조밀한 카드</Card.Title>
      </Card.Header>
      <Card.Body>
        <p data-inset-text style={{ margin: 0 }}>
          여백 12px
        </p>
      </Card.Body>
    </Card.Root>
  ),
}

/* 목록 카드(#469) — 헤더 아래 행 목록이 카드 가장자리까지 붙는다. `Card.Rows`가
 * 행마다 카드 여백을 좌우에 줘서 행의 첫 글자가 제목과 같은 세로선에 선다.
 * 행 사이 구분선은 앱이 그린다. */
const HOLDINGS = [
  { name: "삼성전자", meta: "2026-09-10 · 10주", value: "+128,000원" },
  { name: "카카오", meta: "2026-09-08 · 3주", value: "-9,300원" },
  { name: "NAVER", meta: "2026-09-05 · 1주", value: "+2,150원" },
]

const listCard = (inset: number) => (
  <Card.Root variant="list" data-inset={inset} style={{ maxWidth: "24rem" }}>
    <Card.Header>
      <Card.Title data-inset-text>보유 종목</Card.Title>
    </Card.Header>
    <Card.Rows>
      {HOLDINGS.map((row, i) => (
        <ListRow.Root
          key={row.name}
          style={i === 0 ? undefined : { borderTop: "1px solid var(--ds-border-subtle)" }}
        >
          <ListRow.Group>
            <ListRow.Primary data-inset-text>{row.name}</ListRow.Primary>
            <ListRow.Secondary>{row.meta}</ListRow.Secondary>
          </ListRow.Group>
          <ListRow.Value>{row.value}</ListRow.Value>
        </ListRow.Root>
      ))}
    </Card.Rows>
  </Card.Root>
)

export const ListCard: Story = {
  render: () => listCard(24),
}

export const ListCardNarrow: Story = {
  tags: ["viewport:mobile"],
  render: () => listCard(16),
}

/* 목록 카드의 Body는 네 방향 모두 카드 여백을 가진다 — 행이 아닌 내용(빈 상태,
 * 경고, 타일 격자)이 들어가는 곳이다. */
export const ListCardBody: Story = {
  render: () => (
    <Card.Root variant="list" data-inset={24} style={{ maxWidth: "24rem" }}>
      <Card.Header>
        <Card.Title data-inset-text>보유 종목</Card.Title>
      </Card.Header>
      <Card.Body>
        <p data-inset-text style={{ margin: 0, color: "var(--ds-fg-muted)" }}>
          아직 보유한 종목이 없어요.
        </p>
      </Card.Body>
    </Card.Root>
  ),
}

/* `level`(접근성 트리)과 `size`(시각)를 따로 준 자리 — 문서 구조상 h4가
 * 맞지만 카드 제목이라 더 커야 하는 경우. */
export const TitleLevel: Story = {
  render: () => (
    <Card.Root style={{ maxWidth: "24rem" }}>
      <Card.Header>
        <Card.Title level={4} size="xl">
          커스텀 레벨·크기
        </Card.Title>
      </Card.Header>
      <Card.Body>
        <p style={{ margin: 0 }}>기본값은 h3·lg다.</p>
      </Card.Body>
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

/* 목록 카드에서 부분을 모두 쓴 경우 — Rows 아래에 Body(행이 아닌 안내)와
 * Footer가 이어진다. Footer는 Header와 대칭으로 위아래 12px과 위쪽 구분선을
 * 가진다(#476). */
export const ListCardAllParts: Story = {
  render: () => (
    <Card.Root variant="list" data-inset={24} style={{ maxWidth: "24rem" }}>
      <Card.Header>
        <Card.Title data-inset-text>보유 종목</Card.Title>
      </Card.Header>
      <Card.Rows>
        {HOLDINGS.slice(0, 2).map((row, i) => (
          <ListRow.Root
            key={row.name}
            style={i === 0 ? undefined : { borderTop: "1px solid var(--ds-border-subtle)" }}
          >
            <ListRow.Group>
              <ListRow.Primary data-inset-text>{row.name}</ListRow.Primary>
            </ListRow.Group>
            <ListRow.Value>{row.value}</ListRow.Value>
          </ListRow.Root>
        ))}
      </Card.Rows>
      <Card.Body>
        <p data-inset-text style={{ margin: 0, color: "var(--ds-fg-muted)", fontSize: "0.875rem" }}>
          평가액은 전일 종가 기준이에요.
        </p>
      </Card.Body>
      <Card.Footer>
        <span data-inset-text style={{ color: "var(--ds-fg-muted)", fontSize: "0.75rem" }}>
          5분 전 갱신
        </span>
      </Card.Footer>
    </Card.Root>
  ),
}
