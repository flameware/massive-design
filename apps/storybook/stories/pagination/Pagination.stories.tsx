import { Pagination } from "@flameware/ui/pagination"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"

import type { KeyboardContract } from "../keyboard"
import type { ComponentMeta } from "../meta"

/* Pagination은 Base UI 뒤가 없는 자체 스타일 패턴이다(#317 Implementation
 * Decisions, #329) — 페이지 상태를 갖지 않고 `page`·`pageCount`·
 * `onPageChange`로만 그린다. `component`는 유일한 노출 표면인 `Pagination`
 * 자신이다 — 파트로 나뉘지 않는다(pagination.tsx 주석). */
const meta = {
  title: "Navigation/Pagination",
  component: Pagination,
  // 기본 args — 상태 없는 컴포넌트라 각 스토리가 자기 `render`로 대신
  // 제어하지만, `page`·`pageCount`·`onPageChange`가 필수 prop이라 메타에
  // 채워 두지 않으면 스토리마다 타입이 args를 요구한다.
  args: { page: 1, pageCount: 1, onPageChange: () => {} },
  parameters: { ds: { status: "stable", since: "0.3.2" } },
} satisfies Meta<typeof Pagination> & ComponentMeta

export default meta

type Story = StoryObj<typeof meta>

/* 기본 조립 — 소비처의 거래 데이터 테이블이 쓸 모양(#329 "What to build").
 * 제어 컴포넌트이므로 스토리도 `page`를 상태로 쥔다. */
export const Playground: Story = {
  render: () => <PlaygroundFixture />,
}

function PlaygroundFixture() {
  const [page, setPage] = useState(1)
  return <Pagination page={page} pageCount={10} onPageChange={setPage} />
}

/* 첫 페이지 — 이전 버튼이 disabled다(#329 AC "앞뒤 경계에서 버튼이 올바르게
 * 비활성된다"). */
export const FirstPage: Story = {
  name: "첫 페이지",
  render: () => <Pagination page={1} pageCount={10} onPageChange={() => {}} />,
}

/* 마지막 페이지 — 다음 버튼이 disabled다. */
export const LastPage: Story = {
  name: "마지막 페이지",
  render: () => <Pagination page={10} pageCount={10} onPageChange={() => {}} />,
}

/* 페이지 수가 적으면 줄임표 없이 전부 보인다 — 거래 내역이 몇 페이지뿐인
 * 계좌. */
export const FewPages: Story = {
  name: "적은 페이지 수",
  render: () => <Pagination page={2} pageCount={4} onPageChange={() => {}} />,
}

/* 한 페이지뿐이면 이전·다음 둘 다 disabled — 페이지 이동이 무의미한 자리도
 * 무너지지 않는다. */
export const SinglePage: Story = {
  name: "페이지 하나",
  render: () => <Pagination page={1} pageCount={1} onPageChange={() => {}} />,
}

/* TanStack Table 위에 얹는 자리 — 패키지는 TanStack을 의존하지 않는다(#329
 * "DS 패키지는 TanStack을 의존하지 않는다"). `table.getState().pagination`이
 * 내는 `pageIndex`는 0부터 시작하므로 `page`로 보낼 때 1을 더하고,
 * `onPageChange`가 받은 1부터인 페이지 번호를 `table.setPageIndex`로 보낼 때
 * 1을 뺀다 — 앱이 실제로 지는 변환은 이 둘뿐이다. 여기서는 `useTanStackTable`
 * 없이 같은 모양의 평범한 상태로 흉내 낸다. */
export const OnTanStackTable: Story = {
  name: "TanStack Table 위에서",
  render: () => <TanStackFixture />,
}

function TanStackFixture() {
  // table.getState().pagination.pageIndex(0부터)를 흉내 낸다.
  const [pageIndex, setPageIndex] = useState(0)
  const pageCount = 7

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <p style={{ fontSize: "0.8125rem", color: "var(--ds-fg-muted)" }}>
        table.getState().pagination.pageIndex = {pageIndex}
      </p>
      <Pagination
        page={pageIndex + 1}
        pageCount={pageCount}
        onPageChange={(page) => setPageIndex(page - 1)}
      />
    </div>
  )
}

/* 키보드 계약 — Tab 순회와 Enter 이동(#317 Testing Decisions "Pagination(Tab
 * 순회)", #329 AC "Tab 순회와 Enter 이동"). 모든 버튼이 `Button`이라 Tab이
 * 순서대로 닿고 Enter가 그 자리에서 활성화한다 — 재는 것은 밖에서 보이는
 * 결과(포커스가 놓인 자리, 화면에 적힌 현재 페이지)다. 선택자는 `aria-label`을
 * 쓴다 — 이전/다음·각 페이지 번호 버튼이 저마다 고유한 이름을 이미 지고
 * 있어(pagination.tsx) 별도의 `data-testid`가 필요 없다. 초기 페이지를 3으로
 * 둔 이유는 이전·다음 버튼이 **둘 다** 활성 상태여야 Tab 순회 전체(이전 →
 * 페이지 1..5 → 다음)를 잴 수 있어서다 — 1페이지에서 시작하면 이전 버튼이
 * disabled라 순회에서 빠진다. */
const keyboard: KeyboardContract[] = [
  {
    name: "Tab이 이전 버튼에 닿는다",
    press: ["Tab"],
    expect: { focused: "[aria-label='이전 페이지']" },
  },
  {
    name: "Tab을 한 번 더 누르면 페이지 1로 옮긴다",
    focus: "[aria-label='이전 페이지']",
    press: ["Tab"],
    expect: { focused: "[aria-label='1 페이지로 이동']" },
  },
  {
    name: "Tab을 거듭 누르면 다음 버튼에 닿는다",
    focus: "[aria-label='1 페이지로 이동']",
    press: ["Tab", "Tab", "Tab", "Tab", "Tab"],
    expect: { focused: "[aria-label='다음 페이지']" },
  },
  {
    name: "Enter가 초점이 놓인 페이지로 이동한다",
    focus: "[aria-label='4 페이지로 이동']",
    press: ["Enter"],
    expect: { text: { "[data-testid=key-state]": "4" } },
  },
]

export const Keyboard: Story = {
  name: "키보드 계약",
  parameters: { keyboard },
  render: () => <KeyboardFixture />,
}

function KeyboardFixture() {
  const [page, setPage] = useState(3)
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
      <Pagination page={page} pageCount={5} onPageChange={setPage} />
      <span data-testid="key-state">{page}</span>
    </div>
  )
}
