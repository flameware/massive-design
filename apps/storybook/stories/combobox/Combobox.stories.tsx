import { Combobox } from "@flameware/ui/combobox"
import { Field } from "@flameware/ui/field"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { useEffect, useState } from "react"

import type { KeyboardContract } from "../keyboard"
import type { ComponentMeta } from "../meta"

/* 앱의 종목 검색(Command + Popover 조립)이 여기로 온다(이슈 #289) — Base UI
 * `Combobox`가 입력·필터·목록·키보드 탐색을 하나로 내므로 DS는 Portal·
 * Positioner·Popup 셋을 Combobox.Popup 하나로 접어 소비처에게는 입력·목록·항목·
 * 빈 상태 넷만 남긴다(combobox.tsx 상단 주석). Field 안에 두면 라벨·오류가
 * Input과 같은 방식으로 연결된다(field.tsx). */

interface StockItem {
  symbol: string
  name: string
}

const STOCKS: StockItem[] = [
  { symbol: "AAPL", name: "애플" },
  { symbol: "MSFT", name: "마이크로소프트" },
  { symbol: "GOOG", name: "알파벳" },
  { symbol: "AMZN", name: "아마존" },
  { symbol: "TSLA", name: "테슬라" },
]

/* 종목명·코드 둘 다로 찾게 하는 자리 — 기본 필터는 이 문자열에 대해
 * 대소문자·발음 구별 없이 부분일치를 본다(combobox.tsx 상단 주석). */
const stockLabel = (item: StockItem) => `${item.name} ${item.symbol}`

function StockItemRow({ item }: { item: StockItem }) {
  return (
    <>
      {item.name} <span style={{ opacity: 0.6 }}>{item.symbol}</span>
    </>
  )
}

const meta = {
  title: "Forms/Combobox",
  component: Combobox.Root,
  parameters: { ds: { status: "preview", since: "0.2.0" } },
} satisfies Meta<typeof Combobox.Root> & ComponentMeta

export default meta

type Story = StoryObj<typeof meta>

/* 문서의 기본 그림 — 동기 목록, Field 라벨과 함께. props 표는 여기를 가리킨다 */
export const Playground: Story = {
  render: () => (
    <Field.Root name="symbol" style={{ maxWidth: "20rem" }}>
      <Field.Label>종목 검색</Field.Label>
      <Combobox.Root items={STOCKS} itemToStringLabel={stockLabel}>
        <Combobox.Input placeholder="종목명 또는 코드" />
        <Combobox.Popup>
          <Combobox.Empty>검색 결과가 없습니다</Combobox.Empty>
          <Combobox.List>
            {(item: StockItem) => (
              <Combobox.Item key={item.symbol} value={item}>
                <StockItemRow item={item} />
              </Combobox.Item>
            )}
          </Combobox.List>
        </Combobox.Popup>
      </Combobox.Root>
      <Field.Description>종목명 또는 코드로 찾을 수 있습니다</Field.Description>
    </Field.Root>
  ),
}

/* `Combobox.Status`가 로딩 문구를 스크린 리더에 polite로 알린다 — `open`을
 * 직접 켜서 상호작용 없이 팝업이 열린 그림을 문서에 고정한다. */
export const Loading: Story = {
  render: () => (
    <Field.Root name="symbol-loading" style={{ maxWidth: "20rem" }}>
      <Field.Label>종목 검색</Field.Label>
      <Combobox.Root items={[]} open itemToStringLabel={stockLabel}>
        <Combobox.Input placeholder="종목명 또는 코드" />
        <Combobox.Popup>
          <Combobox.Status>불러오는 중…</Combobox.Status>
          {/* List는 비어 있어도 마운트한다 — `role=combobox`의 `aria-controls`가
           * 가리킬 listbox가 있어야 한다. 빈 채로 두는 것과 렌더하지 않는 것은
           * 다르다(axe aria-required-attr). */}
          <Combobox.List>{() => null}</Combobox.List>
        </Combobox.Popup>
      </Combobox.Root>
    </Field.Root>
  ),
}

/* 빈 결과는 로딩과 다른 문구다 — `Combobox.Empty`는 `items`가 있고 필터 결과가
 * 0일 때만 스스로 렌더한다(combobox.tsx). */
export const EmptyResult: Story = {
  render: () => (
    <Field.Root name="symbol-empty" style={{ maxWidth: "20rem" }}>
      <Field.Label>종목 검색</Field.Label>
      <Combobox.Root items={STOCKS} open defaultInputValue="ZZZ" itemToStringLabel={stockLabel}>
        <Combobox.Input placeholder="종목명 또는 코드" />
        <Combobox.Popup>
          <Combobox.Empty>검색 결과가 없습니다</Combobox.Empty>
          <Combobox.List>
            {(item: StockItem) => (
              <Combobox.Item key={item.symbol} value={item}>
                <StockItemRow item={item} />
              </Combobox.Item>
            )}
          </Combobox.List>
        </Combobox.Popup>
      </Combobox.Root>
    </Field.Root>
  ),
}

/* 진짜 비동기 흐름 — 마운트 뒤 500ms를 기다려 항목이 채워진다. `items`는
 * 로딩 중엔 빈 배열이다(Combobox.Empty가 "결과 없음"을 들고 있으므로, 그 문구를
 * 로딩 중엔 `Combobox.Status`로 가린다 — 두 컴포넌트 다 마운트 상태는 유지하고
 * children만 조건부로 바꾼다, combobox.tsx의 각 주석 참고). */
export const AsyncItems: Story = {
  name: "비동기 항목",
  render: () => <AsyncFixture />,
}

function AsyncFixture() {
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<StockItem[]>([])

  useEffect(() => {
    const id = setTimeout(() => {
      setItems(STOCKS)
      setLoading(false)
    }, 500)
    return () => clearTimeout(id)
  }, [])

  return (
    <Field.Root name="symbol-async" style={{ maxWidth: "20rem" }}>
      <Field.Label>종목 검색 (비동기)</Field.Label>
      <Combobox.Root items={items} itemToStringLabel={stockLabel}>
        <Combobox.Input placeholder="종목명 또는 코드" />
        <Combobox.Popup>
          <Combobox.Status>{loading ? "불러오는 중…" : null}</Combobox.Status>
          <Combobox.Empty>{loading ? null : "검색 결과가 없습니다"}</Combobox.Empty>
          <Combobox.List>
            {(item: StockItem) => (
              <Combobox.Item key={item.symbol} value={item}>
                <StockItemRow item={item} />
              </Combobox.Item>
            )}
          </Combobox.List>
        </Combobox.Popup>
      </Combobox.Root>
    </Field.Root>
  )
}

/* 키보드 계약: 타이핑 필터, 화살표 이동, Enter 선택, Esc 닫힘(이슈 #289
 * acceptance criteria 그대로). 선택 결과는 화면에 적어 밖에서 보이게 한다 —
 * Button·Field의 관례와 같다. */
const keyboard: KeyboardContract[] = [
  {
    name: "Tab이 입력에 닿는다",
    press: ["Tab"],
    expect: { focused: "[data-testid=combobox-input]" },
  },
  {
    name: "ArrowDown이 첫 항목을 하이라이트하고 Enter가 선택한다",
    focus: "[data-testid=combobox-input]",
    press: ["ArrowDown", "Enter"],
    expect: {
      focused: "[data-testid=combobox-input]",
      text: { "[data-testid=selected]": "선택됨: 애플 (AAPL)" },
    },
  },
  {
    name: "타이핑이 목록을 필터하고, 필터된 항목을 Enter로 선택한다",
    focus: "[data-testid=combobox-input]",
    press: ["M", "S", "F", "T", "ArrowDown", "Enter"],
    expect: {
      focused: "[data-testid=combobox-input]",
      text: { "[data-testid=selected]": "선택됨: 마이크로소프트 (MSFT)" },
    },
  },
  {
    name: "Esc는 팝업을 닫고 선택하지 않는다",
    focus: "[data-testid=combobox-input]",
    press: ["A", "A", "P", "L", "Escape"],
    expect: {
      focused: "[data-testid=combobox-input]",
      text: { "[data-testid=selected]": "선택됨: 없음" },
    },
  },
]

export const Keyboard: Story = {
  name: "키보드 계약",
  parameters: { keyboard },
  render: () => <KeyboardFixture />,
}

function KeyboardFixture() {
  const [value, setValue] = useState<StockItem | null>(null)
  return (
    <div style={{ maxWidth: "20rem" }}>
      <Field.Root name="symbol-keyboard">
        <Field.Label>종목 검색</Field.Label>
        <Combobox.Root
          items={STOCKS}
          itemToStringLabel={stockLabel}
          value={value}
          onValueChange={(next) => setValue(next)}
        >
          <Combobox.Input data-testid="combobox-input" placeholder="종목명 또는 코드" />
          <Combobox.Popup>
            <Combobox.Empty>검색 결과가 없습니다</Combobox.Empty>
            <Combobox.List>
              {(item: StockItem) => (
                <Combobox.Item key={item.symbol} value={item}>
                  <StockItemRow item={item} />
                </Combobox.Item>
              )}
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Root>
      </Field.Root>
      <p data-testid="selected">선택됨: {value ? `${value.name} (${value.symbol})` : "없음"}</p>
    </div>
  )
}
