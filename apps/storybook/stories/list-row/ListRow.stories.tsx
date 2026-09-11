import { ListRow } from "@flameware/ui/list-row"
import type { Meta, StoryObj } from "@storybook/react-vite"

import type { ComponentMeta } from "../meta"

/* ListRow는 Base UI 뒤가 없는 자체 스타일 primitive다(#290) — 눌리는 것이 없어
 * 키보드 계약 스토리는 두지 않는다. 행 전체가 눌려야 하면 소비처가 조립한다
 * (Card의 같은 판단, #283) — ListRow는 role·tabIndex를 스스로 갖지 않는다. */
const meta = {
  title: "Data display/ListRow",
  component: ListRow.Root,
  parameters: { ds: { status: "stable", since: "0.2.0" } },
} satisfies Meta<typeof ListRow.Root> & ComponentMeta

export default meta

type Story = StoryObj<typeof meta>

/* 세 파트를 모두 쓴 자리 — 문서의 기본 그림이다. 거래 이력의 한 줄을 흉내 낸다. */
export const Playground: Story = {
  render: () => (
    <ListRow.Root style={{ maxWidth: "24rem", borderBottom: "1px solid var(--ds-border-default)" }}>
      <ListRow.Group>
        <ListRow.Primary>삼성전자</ListRow.Primary>
        <ListRow.Secondary>2026-09-10 · 10주</ListRow.Secondary>
      </ListRow.Group>
      <ListRow.Value>+128,000원</ListRow.Value>
    </ListRow.Root>
  ),
}

/* 여러 줄을 쌓은 목록 — 실제 쓰임에 가까운 그림이다. */
export const List: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", maxWidth: "24rem" }}>
      {[
        { name: "삼성전자", meta: "2026-09-10 · 10주", value: "+128,000원" },
        { name: "카카오", meta: "2026-09-08 · 3주", value: "-9,300원" },
        { name: "NAVER", meta: "2026-09-05 · 1주", value: "+2,150원" },
      ].map((row) => (
        <ListRow.Root key={row.name} style={{ borderBottom: "1px solid var(--ds-border-default)" }}>
          <ListRow.Group>
            <ListRow.Primary>{row.name}</ListRow.Primary>
            <ListRow.Secondary>{row.meta}</ListRow.Secondary>
          </ListRow.Group>
          <ListRow.Value>{row.value}</ListRow.Value>
        </ListRow.Root>
      ))}
    </div>
  ),
}

/* Secondary 없이 Primary만, Value 없이 Group만 — 셋 다 옵셔널이다. */
export const PartsOptional: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxWidth: "24rem" }}>
      <ListRow.Root style={{ borderBottom: "1px solid var(--ds-border-default)" }}>
        <ListRow.Group>
          <ListRow.Primary>보조 텍스트 없음</ListRow.Primary>
        </ListRow.Group>
        <ListRow.Value>0원</ListRow.Value>
      </ListRow.Root>
      <ListRow.Root style={{ borderBottom: "1px solid var(--ds-border-default)" }}>
        <ListRow.Group>
          <ListRow.Primary>값 없음</ListRow.Primary>
          <ListRow.Secondary>우측 값이 없는 행</ListRow.Secondary>
        </ListRow.Group>
      </ListRow.Root>
    </div>
  ),
}
