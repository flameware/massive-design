import { Badge, type BadgeProps } from "@flameware/ui/badge"
import type { Meta, StoryObj } from "@storybook/react-vite"

import type { ComponentMeta } from "../meta"

/* Badge는 Base UI 뒤가 없는 자체 스타일 primitive다(#290) — 눌리는 것이 없어
 * 키보드 계약 스토리는 두지 않는다. 면이 있는 다섯 톤은 전부 대비 게이트가
 * 검증한 조합만 쓴다(packages/tokens/scripts/contrast.mjs TEXT_PAIRS) — 아래
 * Tones 스토리가 그 다섯을 나란히 보여준다. `outline`은 면이 없어(#293) 그
 * 게이트 밖이고 `fg.default` 하나만 쓴다. */
const meta = {
  title: "Data display/Badge",
  component: Badge,
  parameters: { ds: { status: "stable", since: "0.2.0" } },
  args: { children: "완료", tone: "neutral" },
  argTypes: {
    tone: { control: "select", options: ["neutral", "accent", "danger", "success", "warning", "outline"] },
  },
} satisfies Meta<typeof Badge> & ComponentMeta

export default meta

type Story = StoryObj<typeof meta>

interface Trade {
  date: string
  label: string
  tone: BadgeProps["tone"]
  quantity: string
  amount: string
}

/* 좁은 셀 스토리의 행 — 값은 앱의 종목 상세 거래 내역과 같은 모양이다. */
const TRADES: Trade[] = [
  { date: "8/4", label: "매수", tone: "accent", quantity: "10주", amount: "712,000원" },
  { date: "8/12", label: "매도", tone: "neutral", quantity: "3주", amount: "643,500원" },
]

export const Playground: Story = {}

/* 다섯 톤을 나란히 — 전부 대비 게이트가 검증한 [전경, 배경] 조합이다. */
export const Tones: Story = {
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
      <Badge tone="neutral">중립</Badge>
      <Badge tone="accent">강조</Badge>
      <Badge tone="danger">위험</Badge>
      <Badge tone="success">성공</Badge>
      <Badge tone="warning">주의</Badge>
    </div>
  ),
}

/* 면 없이 테두리만 — 분류가 아니라 밀도 낮은 배지가 필요한 자리(#293). */
export const Outline: Story = {
  args: { tone: "outline", children: "한국" },
}

/* 좁은 셀 — 배지는 줄바꿈하지 않는다(#322). 배지 열을 `width: 1px`로 두어 표가 그 열을
 * min-content까지 누르게 한다: 그 min-content가 "한 글자"가 아니라 "한 줄"인 것이 이
 * 기본값이다. 실측으로 갈린다 — nowrap이면 23.2px 한 줄, `white-space: normal`이면
 * 42.4px 두 줄("매/수"). 그것이 #240의 증상이었다(390px 종목 상세의 5열 표가 구분 칸을
 * 두 글자 폭으로 눌렀다, flameware/investmentdiary#240).
 *
 * DS `Table.Root`를 쓰지 않는 것이 의도다 — `Root`는 `overflow-x-auto`로 눌림을
 * 흡수해서 이 조건을 아예 만들지 않는다(앱의 그 화면도 DS 표가 아니라 반응형 처리가
 * 없는 맨 `<table className="w-full">`이었다). 여기서 재는 것은 표가 아니라 배지가
 * 혼자 자기를 지키는가다. */
export const NarrowCell: Story = {
  name: "좁은 셀",
  render: () => (
    <table style={{ width: "13rem", borderCollapse: "collapse", fontSize: "0.75rem" }}>
      <tbody>
        {TRADES.map((trade) => (
          <tr key={trade.date}>
            <td style={{ padding: "0.25rem 0" }}>{trade.date}</td>
            <td style={{ padding: "0.25rem 0", width: "1px" }}>
              <Badge tone={trade.tone}>{trade.label}</Badge>
            </td>
            <td style={{ padding: "0.25rem 0", textAlign: "right" }}>{trade.quantity}</td>
            <td style={{ padding: "0.25rem 0", textAlign: "right" }}>{trade.amount}</td>
          </tr>
        ))}
      </tbody>
    </table>
  ),
}

/* 길이를 소비처가 모르는 값 — 줄바꿈을 되돌리는 대신 말줄임을 건다. 배지에
 * `max-w-full min-w-0`, 자식 텍스트에 `min-w-0 truncate`다 — 112px 컨테이너에서 배지가
 * 컨테이너를 넘지 않고 글자만 말줄임되는 것을 실측했다. 줄바꿈을 되돌리는 것도 한 클래스로
 * 되지만(`cn`이 tailwind-merge다, badge.tsx 주석) 이 자리에서 원하는 것은 두 줄이 아니다. */
export const Truncated: Story = {
  name: "긴 값은 말줄임",
  render: () => (
    <div style={{ display: "flex", width: "7rem" }}>
      <Badge tone="outline" className="max-w-full min-w-0">
        <span className="min-w-0 truncate">검색: 반도체 소재·부품·장비</span>
      </Badge>
    </div>
  ),
}
