import { Button } from "@flameware/ui/button"
import { Card } from "@flameware/ui/card"
import { Collapsible } from "@flameware/ui/collapsible"
import { ListRow } from "@flameware/ui/list-row"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"

import type { KeyboardContract } from "../keyboard"
import type { ComponentMeta } from "../meta"

/* Collapsible(#486) — Base UI `Collapsible` 위의 Root·Trigger·Panel. 주 seam이
 * 재는 것: 열고 닫는 키보드 동작과 제어형의 `onOpenChange`(키보드 계약), 닫힌
 * Panel 안이 탭 순서에 없는 것(키보드 계약), 목록 카드 안 Trigger가
 * `Card.Header`(list)와 같은 머리인 것(같은 치수 계약), 펼친 행이 카드 여백에
 * 서는 것(여백 계약), 다크 모드 대비(axe). */
const meta = {
  title: "Layout/Collapsible",
  component: Collapsible.Root,
  parameters: { ds: { status: "preview", since: "0.9.0" } },
} satisfies Meta<typeof Collapsible.Root> & ComponentMeta

export default meta

type Story = StoryObj<typeof meta>

const muted = { margin: 0, color: "var(--ds-fg-muted)", fontSize: "0.875rem" }

/* 홀로 선 모양 — 문서의 기본 그림이다. 기본은 접혀 있다. */
export const Playground: Story = {
  render: () => (
    <Collapsible.Root style={{ maxWidth: "24rem" }}>
      <Collapsible.Trigger>수수료 계산 방법</Collapsible.Trigger>
      <Collapsible.Panel>
        <p style={{ ...muted, padding: "0.5rem" }}>매수와 매도 금액에 각각 0.015%를 곱해 더해요.</p>
      </Collapsible.Panel>
    </Collapsible.Root>
  ),
}

/* `defaultOpen`으로 펼친 채 시작한다 — 비제어형. chevron이 90° 돌아 있다. */
export const DefaultOpen: Story = {
  render: () => (
    <Collapsible.Root defaultOpen style={{ maxWidth: "24rem" }}>
      <Collapsible.Trigger>수수료 계산 방법</Collapsible.Trigger>
      <Collapsible.Panel>
        <p style={{ ...muted, padding: "0.5rem" }}>매수와 매도 금액에 각각 0.015%를 곱해 더해요.</p>
      </Collapsible.Panel>
    </Collapsible.Root>
  ),
}

export const Disabled: Story = {
  render: () => (
    <Collapsible.Root disabled style={{ maxWidth: "24rem" }}>
      <Collapsible.Trigger>수수료 계산 방법</Collapsible.Trigger>
      <Collapsible.Panel>
        <p style={muted}>열리지 않아요.</p>
      </Collapsible.Panel>
    </Collapsible.Root>
  ),
}

/* ---------- 제어형 ----------
 * 앱이 검색 이벤트에서 그룹을 여는 경우를 흉내 낸다. 밖에서 `open`을 바꾼 것은
 * `onOpenChange`를 부르지 않고, Trigger를 누른 것만 부른다 — 불린 횟수와 마지막
 * 값을 화면에 적어 계약이 그것을 읽는다. */
function ControlledFixture() {
  const [open, setOpen] = useState(false)
  const [calls, setCalls] = useState<boolean[]>([])
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxWidth: "24rem" }}>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <Button data-testid="open-outside" variant="outline" size="sm" onClick={() => setOpen(true)}>
          검색으로 열기
        </Button>
        <Button data-testid="close-outside" variant="outline" size="sm" onClick={() => setOpen(false)}>
          닫기
        </Button>
      </div>
      <Collapsible.Root
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          setCalls((prev) => [...prev, next])
        }}
      >
        <Collapsible.Trigger data-testid="controlled-trigger">노트 없는 종목 20</Collapsible.Trigger>
        <Collapsible.Panel>
          <p style={{ ...muted, padding: "0.5rem" }}>삼성전자, 카카오, NAVER …</p>
        </Collapsible.Panel>
      </Collapsible.Root>
      <p style={muted}>
        상태 <span data-testid="state">{open ? "열림" : "닫힘"}</span> · onOpenChange{" "}
        <span data-testid="calls">{calls.length}</span>번 · 마지막 값{" "}
        <span data-testid="last">{calls.length === 0 ? "없음" : String(calls.at(-1))}</span>
      </p>
    </div>
  )
}

const controlledKeyboard: KeyboardContract[] = [
  {
    name: "밖에서 open을 바꾸면 펼쳐지고 onOpenChange는 불리지 않는다",
    focus: "[data-testid=open-outside]",
    press: ["Enter"],
    expect: { text: { "[data-testid=state]": "열림", "[data-testid=calls]": "0" } },
  },
  {
    name: "Trigger의 Enter가 onOpenChange(true)를 한 번 부르고 aria-expanded가 따라온다",
    focus: "[data-testid=controlled-trigger]",
    press: ["Enter"],
    expect: {
      focused: "[data-testid=controlled-trigger][aria-expanded=true]",
      text: { "[data-testid=state]": "열림", "[data-testid=calls]": "1", "[data-testid=last]": "true" },
    },
  },
  {
    name: "Space가 다시 닫는다 — onOpenChange(false)",
    focus: "[data-testid=controlled-trigger]",
    press: ["Enter", "Space"],
    expect: {
      focused: "[data-testid=controlled-trigger][aria-expanded=false]",
      text: { "[data-testid=state]": "닫힘", "[data-testid=calls]": "2", "[data-testid=last]": "false" },
    },
  },
]

export const Controlled: Story = {
  parameters: { keyboard: controlledKeyboard },
  render: () => <ControlledFixture />,
}

/* ---------- 탭 순서 ----------
 * 닫힌 Panel은 DOM에서 빠지므로 안의 버튼에 Tab이 닿지 않는다. 펼치면 Trigger
 * 다음 Tab이 Panel 안으로 들어간다. */
const tabOrderKeyboard: KeyboardContract[] = [
  {
    name: "닫혀 있으면 Tab이 Panel 안을 건너뛴다",
    focus: "[data-testid=tab-trigger]",
    press: ["Tab"],
    expect: { focused: "[data-testid=after]" },
  },
  {
    name: "펼치면 Tab이 Panel 안의 버튼에 닿는다",
    focus: "[data-testid=tab-trigger]",
    press: ["Enter", "Tab"],
    expect: { focused: "[data-testid=inside]" },
  },
]

export const TabOrder: Story = {
  parameters: { keyboard: tabOrderKeyboard },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "0.75rem" }}>
      <Collapsible.Root>
        <Collapsible.Trigger data-testid="tab-trigger">고급 설정</Collapsible.Trigger>
        <Collapsible.Panel>
          <div style={{ padding: "0.5rem" }}>
            <Button data-testid="inside" variant="outline" size="sm">
              기본값으로 되돌리기
            </Button>
          </div>
        </Collapsible.Panel>
      </Collapsible.Root>
      <Button data-testid="after" size="sm">
        저장
      </Button>
    </div>
  ),
}

/* ---------- 목록 카드 안 ----------
 * 노트가 있는 종목을 먼저 보이고, 노트가 없는 종목은 카드 아래 접힌 그룹으로
 * 둔다. Trigger와 Header가 같은 `data-same-box`를 달아 같은 머리(높이·폭·좌우
 * 여백)임을 선언하고, 펼친 행의 첫 글자는 `data-inset`이 잰다. Header 안의 글자를
 * Trigger와 같은 14px medium muted로 두어야 높이를 견줄 수 있다. */
const WITH_NOTES = [
  { name: "삼성전자", meta: "노트 3개 · 2026-09-10" },
  { name: "카카오", meta: "노트 1개 · 2026-09-08" },
]
const WITHOUT_NOTES = ["NAVER", "현대차", "LG에너지솔루션"]

/* 행 사이 구분선은 앱이 그린다(Card.Rows는 그리지 않는다) */
const divider = (i: number) => (i === 0 ? undefined : { borderTop: "1px solid var(--ds-border-subtle)" })

const notesCard = (inset: number, defaultOpen: boolean) => (
  <Card.Root variant="list" data-inset={inset} style={{ maxWidth: "24rem" }}>
    <Card.Header data-same-box="head">
      <span data-inset-text className="text-sm font-medium text-muted">
        노트 있는 종목 {WITH_NOTES.length}
      </span>
    </Card.Header>
    <Card.Rows>
      {WITH_NOTES.map((row, i) => (
        <ListRow.Root key={row.name} style={divider(i)}>
          <ListRow.Group>
            <ListRow.Primary data-inset-text>{row.name}</ListRow.Primary>
            <ListRow.Secondary>{row.meta}</ListRow.Secondary>
          </ListRow.Group>
        </ListRow.Root>
      ))}
    </Card.Rows>
    <Collapsible.Root defaultOpen={defaultOpen}>
      <Collapsible.Trigger data-same-box="head">노트 없는 종목 {WITHOUT_NOTES.length}</Collapsible.Trigger>
      <Collapsible.Panel>
        <Card.Rows>
          {WITHOUT_NOTES.map((name, i) => (
            <ListRow.Root key={name} style={divider(i)}>
              <ListRow.Group>
                <ListRow.Primary data-inset-text>{name}</ListRow.Primary>
              </ListRow.Group>
            </ListRow.Root>
          ))}
        </Card.Rows>
      </Collapsible.Panel>
    </Collapsible.Root>
  </Card.Root>
)

export const InListCard: Story = {
  render: () => notesCard(24, false),
}

export const InListCardOpen: Story = {
  render: () => notesCard(24, true),
}

/* 좁은 화면(375px)에서는 카드 여백이 16이다 — Trigger도 Header와 함께 따라온다. */
export const InListCardNarrow: Story = {
  tags: ["viewport:mobile"],
  render: () => notesCard(16, true),
}

/* 다크 모드에서 muted 글자와 구분선 — axe가 대비를 잰다. */
export const InListCardDark: Story = {
  render: () => (
    <div className="dark bg-canvas" style={{ padding: "1rem" }}>
      {notesCard(24, true)}
    </div>
  ),
}
