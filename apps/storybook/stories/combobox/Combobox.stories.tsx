import { Combobox } from "@flameware/ui/combobox"
import { Dialog } from "@flameware/ui/dialog"
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
      {item.name} <span className="text-muted">{item.symbol}</span>
    </>
  )
}

const meta = {
  title: "Forms/Combobox",
  component: Combobox.Root,
  parameters: { ds: { status: "stable", since: "0.2.0" } },
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

/* 팝업을 `open`으로 강제해 실제 항목이 그려진 그림을 문서에 고정한다 — 포인터
 * 대상 히트 영역 테스트가 재는 것은 스토리가 보여 주기로 한 것뿐이므로
 * (test/stories.test.mjs 상단 주석, ADR-0023 §12), Playground처럼 팝업이 닫힌
 * 스토리만 있으면 `Combobox.Item`의 24px 하한은 한 번도 재지 않는다. 선택된
 * 항목(`defaultValue`)을 하나 두어 `data-selected` 스타일도 같은 그림에서 보인다. */
export const Expanded: Story = {
  name: "펼친 목록",
  render: () => (
    <Field.Root name="symbol-expanded" style={{ maxWidth: "20rem" }}>
      <Field.Label>종목 검색</Field.Label>
      <Combobox.Root items={STOCKS} itemToStringLabel={stockLabel} open defaultValue={STOCKS[0]}>
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

/* 소비처(invest diary)의 실제 자리 — 콤보박스는 거래 추가·수정 **다이얼로그
 * 안**에 있다. 이 스토리가 없는 동안 `z-50`이 Popup(정적 요소라 z-index가 아무
 * 것도 하지 않는다)에 붙어 있어 팝업이 Dialog.Viewport 뒤로 깔렸고, 항목을
 * 누를 수 없었다. 히트 영역 테스트가 `document.elementFromPoint`로 재므로
 * (test/stories.test.mjs) 가려진 항목은 hit 0으로 잡힌다 — 이 스토리가 그
 * 회귀의 계기다. */
export const InsideDialog: Story = {
  name: "다이얼로그 안",
  render: () => (
    <Dialog.Root open modal={false}>
      <Dialog.Portal>
        <Dialog.Viewport>
          <Dialog.Popup>
            <Dialog.Title>거래 추가</Dialog.Title>
            <Field.Root name="symbol-in-dialog" style={{ marginTop: "1rem" }}>
              <Field.Label>종목 검색</Field.Label>
              <Combobox.Root items={STOCKS} itemToStringLabel={stockLabel} open defaultValue={STOCKS[0]}>
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
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
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

/* 후보 밖 값 — 종목 검색이 미상장 종목명을 그대로 받는 자리(이슈 #323). 앱은
 * 지금 후보 배열 끝에 "manual" 판별자를 가진 가짜 항목을 끼워 넣고
 * `onValueChange` 한 곳에서 두 종류를 가르는 우회를 쓰고 있다 — DS가 이름을
 * 주면 그 우회가 사라진다. `Value`를 `StockItem | ManualEntry`로 열어
 * 후보와 직접 입력을 같은 상태 하나로 받는다. */
interface ManualEntry {
  manual: true
  name: string
}

function isManualEntry(value: StockItem | ManualEntry | null): value is ManualEntry {
  return value !== null && "manual" in value
}

const freeformLabel = (value: StockItem | ManualEntry) => (isManualEntry(value) ? value.name : stockLabel(value))

export const Freeform: Story = {
  name: "후보 밖 값",
  render: () => <FreeformFixture />,
}

function FreeformFixture() {
  const [value, setValue] = useState<StockItem | ManualEntry | null>(null)
  return (
    <div style={{ maxWidth: "20rem" }}>
      <Field.Root name="symbol-freeform">
        <Field.Label>종목 검색</Field.Label>
        <Combobox.Root<StockItem | ManualEntry>
          items={STOCKS}
          itemToStringLabel={freeformLabel}
          value={value}
          onValueChange={setValue}
        >
          <Combobox.Input
            data-testid="combobox-freeform-input"
            placeholder="종목명 또는 코드 (미상장 종목명도 가능)"
            onFreeformSubmit={(name) => setValue({ manual: true, name })}
          />
          <Combobox.Popup>
            <Combobox.Empty>후보에 없습니다 — Enter로 직접 입력한 이름을 쓸 수 있습니다</Combobox.Empty>
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
      <p data-testid="freeform-selected">
        선택됨:{" "}
        {value === null ? "없음" : isManualEntry(value) ? `직접 입력 · ${value.name}` : `${value.name} (${value.symbol})`}
      </p>
    </div>
  )
}

const freeformKeyboard: KeyboardContract[] = [
  {
    name: "후보가 없을 때 Enter가 입력값을 제출한다",
    focus: "[data-testid=combobox-freeform-input]",
    press: ["Z", "Z", "Z", "Enter"],
    expect: {
      focused: "[data-testid=combobox-freeform-input]",
      text: { "[data-testid=freeform-selected]": "선택됨: 직접 입력 · ZZZ" },
    },
  },
  {
    name: "후보가 있을 때는 평소대로 하이라이트한 항목을 Enter로 선택한다",
    focus: "[data-testid=combobox-freeform-input]",
    press: ["ArrowDown", "Enter"],
    expect: {
      focused: "[data-testid=combobox-freeform-input]",
      text: { "[data-testid=freeform-selected]": "선택됨: 애플 (AAPL)" },
    },
  },
]

export const FreeformKeyboard: Story = {
  name: "후보 밖 값 · 키보드 계약",
  parameters: { keyboard: freeformKeyboard },
  render: () => <FreeformFixture />,
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
