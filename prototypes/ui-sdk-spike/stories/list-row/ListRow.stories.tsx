import {
  ListRow,
  ListRowGroup,
  ListRowList,
  ListRowOption,
  ListRowPrimary,
  ListRowSecondary,
  ListRowValue,
} from "@spike/ui/list-row"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"

import type { KeyboardContract } from "../../../../apps/storybook/stories/keyboard"
import type { ComponentMeta } from "../../../../apps/storybook/stories/meta"

/* 앞의 세 스토리는 원본(apps/storybook/stories/list-row)에서 마크업만 평면형
 * 이름으로 바꾼 것이다. 정적 ListRow는 여전히 role·tabIndex를 갖지 않는다.
 *
 * 뒤의 셋은 스파이크에만 있다 — UI SDK의 behavior를 조립해 직접 만든 primitive
 * (`ListRowList`·`ListRowOption`)가 WAI-ARIA listbox 패턴을 지키는지 잰다. */
const meta = {
  title: "Data display/ListRow",
  component: ListRow,
  parameters: { ds: { status: "stable", since: "0.2.0" } },
} satisfies Meta<typeof ListRow> & ComponentMeta

export default meta

type Story = StoryObj<typeof meta>

/* 세 파트를 모두 쓴 자리 — 문서의 기본 그림이다. 거래 이력의 한 줄을 흉내 낸다. */
export const Playground: Story = {
  render: () => (
    <ListRow style={{ maxWidth: "24rem", borderBottom: "1px solid var(--ds-border-default)" }}>
      <ListRowGroup>
        <ListRowPrimary>삼성전자</ListRowPrimary>
        <ListRowSecondary>2026-09-10 · 10주</ListRowSecondary>
      </ListRowGroup>
      <ListRowValue>+128,000원</ListRowValue>
    </ListRow>
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
        <ListRow key={row.name} style={{ borderBottom: "1px solid var(--ds-border-default)" }}>
          <ListRowGroup>
            <ListRowPrimary>{row.name}</ListRowPrimary>
            <ListRowSecondary>{row.meta}</ListRowSecondary>
          </ListRowGroup>
          <ListRowValue>{row.value}</ListRowValue>
        </ListRow>
      ))}
    </div>
  ),
}

/* Secondary 없이 Primary만, Value 없이 Group만 — 셋 다 옵셔널이다. */
export const PartsOptional: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxWidth: "24rem" }}>
      <ListRow style={{ borderBottom: "1px solid var(--ds-border-default)" }}>
        <ListRowGroup>
          <ListRowPrimary>보조 텍스트 없음</ListRowPrimary>
        </ListRowGroup>
        <ListRowValue>0원</ListRowValue>
      </ListRow>
      <ListRow style={{ borderBottom: "1px solid var(--ds-border-default)" }}>
        <ListRowGroup>
          <ListRowPrimary>값 없음</ListRowPrimary>
          <ListRowSecondary>우측 값이 없는 행</ListRowSecondary>
        </ListRowGroup>
      </ListRow>
    </div>
  ),
}

/* ---------- 스파이크에만 있는 스토리: 고를 수 있는 목록 ---------- */

const holdings = [
  { id: "samsung", name: "삼성전자", meta: "2026-09-10 · 10주", value: "+128,000원" },
  { id: "kakao", name: "카카오", meta: "2026-09-08 · 3주", value: "-9,300원" },
  { id: "naver", name: "NAVER", meta: "2026-09-05 · 1주", value: "+2,150원" },
  { id: "coupang", name: "쿠팡", meta: "거래 정지", value: "0원" },
  { id: "skhynix", name: "SK하이닉스", meta: "2026-09-01 · 2주", value: "+41,000원" },
]

function HoldingRows({ disabled = [], prefix }: { disabled?: string[]; prefix?: string }) {
  return holdings.map((row) => (
    <ListRowOption
      key={row.id}
      value={row.id}
      disabled={disabled.includes(row.id)}
      data-testid={prefix ? `${prefix}-${row.id}` : undefined}
    >
      <ListRowGroup>
        <ListRowPrimary>{row.name}</ListRowPrimary>
        <ListRowSecondary>{row.meta}</ListRowSecondary>
      </ListRowGroup>
      <ListRowValue>{row.value}</ListRowValue>
    </ListRowOption>
  ))
}

/* 단일 선택. 누르거나 Space·Enter로 고른다 — 화살표는 포커스만 옮긴다. */
export const SelectablePlayground: Story = {
  name: "고를 수 있는 목록",
  render: () => (
    <ListRowList aria-label="보유 종목" defaultValue={["kakao"]} style={{ maxWidth: "24rem" }}>
      <HoldingRows />
    </ListRowList>
  ),
}

/* 비활성 행은 포커스는 받지만 고를 수 없다 — 화살표가 건너뛰지 않는다. APG가
 * listbox의 option에 권하는 쪽이다(스크린 리더가 그 행이 있다는 것을 알 수 있다). */
export const SelectableDisabled: Story = {
  name: "고를 수 있는 목록 — 비활성 행",
  render: () => (
    <ListRowList aria-label="보유 종목" defaultValue={["samsung"]} style={{ maxWidth: "24rem" }}>
      <HoldingRows disabled={["coupang"]} />
    </ListRowList>
  ),
}

/* 계약은 WAI-ARIA Authoring Practices의 listbox 패턴에서 먼저 적고 primitive를
 * 거기에 맞췄다 — behavior가 마침 하는 일에 맞춰 적은 것이 아니다.
 *
 * 패턴이 정한 것:
 *   - 목록은 탭 정지 하나다. 포커스를 받으면 선택된 행(다중이면 첫 선택 행)이,
 *     선택이 없으면 첫 행이 받는다
 *   - Down·Up이 다음·이전 행으로, Home·End가 처음·끝으로 옮긴다
 *   - 타이핑하면 그 글자로 시작하는 다음 행으로 간다 (권장)
 *   - 다중 선택(권장 모델): Space가 포커스된 행을 켜고 끈다. Shift+Down이 다음
 *     행으로 가며 그 행을 고른다
 * 패턴이 고르라고 남긴 것, 그리고 이 목록이 고른 쪽:
 *   - 단일 선택에서 선택이 포커스를 따라가는가 → 따라가지 않는다. 화살표는
 *     포커스만 옮기고 Space·Enter가 고른다
 *   - 비활성 행 → 포커스는 받고 고를 수는 없다
 *   - 끝에서 도는가 → 돌지 않는다 */
const single = (id: string) => `[data-testid=single-${id}]`
const multi = (id: string) => `[data-testid=multi-${id}]`
const SINGLE_ECHO = "[data-testid=single-echo]"
const MULTI_ECHO = "[data-testid=multi-echo]"

const keyboard: KeyboardContract[] = [
  {
    name: "Tab이 목록에 들어오면 선택된 행이 포커스를 받는다",
    focus: "[data-testid=before]",
    press: ["Tab"],
    expect: { focused: single("kakao") },
  },
  {
    name: "선택이 없으면 Tab이 첫 행에 닿는다",
    focus: "[data-testid=between]",
    press: ["Tab"],
    expect: { focused: multi("samsung") },
  },
  {
    name: "목록은 탭 정지 하나다 — 어느 행에서든 Tab이 목록을 떠난다",
    focus: "[data-testid=before]",
    press: ["Tab", "ArrowDown", "ArrowDown", "Tab"],
    expect: { focused: "[data-testid=between]" },
  },
  {
    name: "어느 행에서든 Shift+Tab이 목록 앞으로 떠난다",
    focus: "[data-testid=before]",
    press: ["Tab", "ArrowDown", "ArrowDown", "Shift+Tab"],
    expect: { focused: "[data-testid=before]" },
  },
  {
    name: "떠났다 돌아오면 마지막으로 포커스된 행이 아니라 선택된 행이 받는다",
    focus: "[data-testid=before]",
    press: ["Tab", "ArrowDown", "Tab", "Shift+Tab"],
    expect: { focused: single("kakao") },
  },
  {
    name: "ArrowDown이 다음 행으로 옮긴다",
    focus: single("kakao"),
    press: ["ArrowDown"],
    expect: { focused: single("naver") },
  },
  {
    name: "ArrowUp이 이전 행으로 옮긴다",
    focus: single("kakao"),
    press: ["ArrowUp"],
    expect: { focused: single("samsung") },
  },
  {
    name: "Home이 첫 행으로 옮긴다",
    focus: single("naver"),
    press: ["Home"],
    expect: { focused: single("samsung") },
  },
  {
    name: "End가 마지막 행으로 옮긴다",
    focus: single("kakao"),
    press: ["End"],
    expect: { focused: single("skhynix") },
  },
  {
    name: "마지막 행에서 ArrowDown은 돌지 않고 머문다",
    focus: single("skhynix"),
    press: ["ArrowDown"],
    expect: { focused: single("skhynix") },
  },
  {
    name: "화살표는 포커스만 옮기고 선택은 그대로다",
    focus: single("kakao"),
    press: ["ArrowDown"],
    expect: { focused: single("naver"), text: { [SINGLE_ECHO]: "kakao" } },
  },
  {
    name: "Space가 포커스된 행을 고른다",
    focus: single("kakao"),
    press: ["ArrowDown", "Space"],
    expect: { text: { [SINGLE_ECHO]: "naver" } },
  },
  {
    name: "Enter가 포커스된 행을 고른다",
    focus: single("kakao"),
    press: ["ArrowUp", "Enter"],
    expect: { text: { [SINGLE_ECHO]: "samsung" } },
  },
  {
    name: "단일 선택에서 선택된 행의 Space는 선택을 지우지 않는다",
    focus: single("kakao"),
    press: ["Space"],
    expect: { text: { [SINGLE_ECHO]: "kakao" } },
  },
  {
    name: "비활성 행은 화살표로 닿는다 — 건너뛰지 않는다",
    focus: single("naver"),
    press: ["ArrowDown"],
    expect: { focused: single("coupang") },
  },
  {
    name: "비활성 행은 Space·Enter로 고를 수 없다",
    focus: single("naver"),
    press: ["ArrowDown", "Space", "Enter"],
    expect: { focused: single("coupang"), text: { [SINGLE_ECHO]: "kakao" } },
  },
  {
    name: "글자를 치면 그 글자로 시작하는 행으로 간다",
    focus: single("samsung"),
    press: ["n"],
    expect: { focused: single("naver") },
  },
  {
    name: "글자로 옮겨도 선택은 그대로다",
    focus: single("kakao"),
    press: ["s"],
    expect: { focused: single("skhynix"), text: { [SINGLE_ECHO]: "kakao" } },
  },
  {
    name: "다중 선택에서 Space가 행을 켠다 — 앞의 선택은 남는다",
    focus: multi("samsung"),
    press: ["Space", "ArrowDown", "Space"],
    expect: { text: { [MULTI_ECHO]: "samsung,kakao" } },
  },
  {
    name: "다중 선택에서 Space를 다시 누르면 꺼진다",
    focus: multi("samsung"),
    press: ["Space", "Space"],
    expect: { text: { [MULTI_ECHO]: "(없음)" } },
  },
  {
    name: "다중 선택에서 Shift+ArrowDown이 옮기며 범위를 고른다",
    focus: multi("samsung"),
    press: ["Space", "Shift+ArrowDown", "Shift+ArrowDown"],
    expect: { focused: multi("naver"), text: { [MULTI_ECHO]: "samsung,kakao,naver" } },
  },
  {
    name: "다중 선택의 범위는 비활성 행을 고르지 않는다",
    focus: multi("naver"),
    press: ["Space", "Shift+ArrowDown", "Shift+ArrowDown"],
    expect: { focused: multi("skhynix"), text: { [MULTI_ECHO]: "naver,skhynix" } },
  },
]

export const Keyboard: Story = {
  name: "키보드 계약",
  parameters: { keyboard },
  render: () => <KeyboardFixture />,
}

/* 목록 둘 — 앞은 단일 선택(카카오가 골라져 있다), 뒤는 다중 선택(선택 없음).
 * 둘 다 쿠팡이 비활성이다. 버튼 셋은 Tab이 어디서 들어오고 어디로 나가는지
 * 재기 위한 자리다. 값은 제어한다 — echo가 `onValueChange`를 거친 값이다. */
function KeyboardFixture() {
  const [one, setOne] = useState<string[]>(["kakao"])
  const [many, setMany] = useState<string[]>([])
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxWidth: "24rem" }}>
      <button type="button" data-testid="before" style={buttonStyle}>
        목록 앞
      </button>
      <ListRowList aria-label="보유 종목 (하나)" value={one} onValueChange={setOne}>
        <HoldingRows disabled={["coupang"]} prefix="single" />
      </ListRowList>
      <output data-testid="single-echo">{one.join(",") || "(없음)"}</output>
      <button type="button" data-testid="between" style={buttonStyle}>
        목록 사이
      </button>
      <ListRowList aria-label="보유 종목 (여럿)" multiple value={many} onValueChange={setMany}>
        <HoldingRows disabled={["coupang"]} prefix="multi" />
      </ListRowList>
      <output data-testid="multi-echo">{many.join(",") || "(없음)"}</output>
      <button type="button" data-testid="after" style={buttonStyle}>
        목록 뒤
      </button>
    </div>
  )
}

const buttonStyle = { alignSelf: "flex-start", minHeight: 32, padding: "0 0.75rem" } as const
