import { Tabs } from "@flameware/ui/tabs"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"

import type { KeyboardContract } from "../keyboard"
import type { ComponentMeta } from "../meta"

const meta = {
  title: "Navigation/Tabs",
  component: Tabs.Root,
  parameters: { ds: { status: "stable", since: "0.2.0" } },
} satisfies Meta<typeof Tabs.Root> & ComponentMeta

export default meta

type Story = StoryObj<typeof meta>

/* 기본 모양 — 세 탭·세 패널. 자동 활성화가 기본이므로 화살표로 탭 사이를
 * 옮기면 그 자리에서 패널까지 바뀐다(아래 Keyboard 스토리가 그 계약을 잰다). */
export const Basic: Story = {
  render: () => (
    <Tabs.Root defaultValue="portfolio">
      <Tabs.List>
        <Tabs.Tab value="portfolio">포트폴리오</Tabs.Tab>
        <Tabs.Tab value="history">히스토리</Tabs.Tab>
        <Tabs.Tab value="notes">노트</Tabs.Tab>
        <Tabs.Indicator />
      </Tabs.List>
      <Tabs.Panel value="portfolio" className="pt-4 text-sm">
        보유 종목 요약이 여기 온다.
      </Tabs.Panel>
      <Tabs.Panel value="history" className="pt-4 text-sm">
        거래 내역이 여기 온다.
      </Tabs.Panel>
      <Tabs.Panel value="notes" className="pt-4 text-sm">
        메모가 여기 온다.
      </Tabs.Panel>
    </Tabs.Root>
  ),
}

/* disabled 탭은 자동 활성화에서도 건너뛴다 — Base UI가 이미 보장하는 동작을
 * 그림으로 확인하는 자리 */
export const WithDisabled: Story = {
  render: () => (
    <Tabs.Root defaultValue="a">
      <Tabs.List>
        <Tabs.Tab value="a">A</Tabs.Tab>
        <Tabs.Tab value="b" disabled>
          B (비활성)
        </Tabs.Tab>
        <Tabs.Tab value="c">C</Tabs.Tab>
        <Tabs.Indicator />
      </Tabs.List>
      <Tabs.Panel value="a" className="pt-4 text-sm">
        A 내용
      </Tabs.Panel>
      <Tabs.Panel value="c" className="pt-4 text-sm">
        C 내용
      </Tabs.Panel>
    </Tabs.Root>
  ),
}

/* `render`로 다른 요소를 받는다 — 탭 내비가 라우트 링크일 때 PageShell이 쓰는
 * 통로와 같다(Button.render와 같은 자리). 여기서는 `<a>`로 대신한다. */
export const AsLinks: Story = {
  render: () => (
    <Tabs.Root defaultValue="/portfolio">
      <Tabs.List>
        <Tabs.Tab value="/portfolio" render={<a href="#portfolio" />}>
          포트폴리오
        </Tabs.Tab>
        <Tabs.Tab value="/history" render={<a href="#history" />}>
          히스토리
        </Tabs.Tab>
        <Tabs.Indicator />
      </Tabs.List>
    </Tabs.Root>
  ),
}

/* 키보드 계약을 재는 스토리. 화살표 이동이 곧 선택인 것(자동 활성화)이
 * 이 티켓의 핵심 계약이다 — `parameters.keyboard`가 선언하고
 * `test/stories.test.mjs`가 그대로 실행한다. */
const keyboard: KeyboardContract[] = [
  {
    name: "Tab이 활성 탭(첫 탭)에 닿는다",
    press: ["Tab"],
    expect: { focused: "[data-testid=tab-a]" },
  },
  {
    name: "ArrowRight가 다음 탭으로 초점을 옮기고 곧바로 선택한다",
    focus: "[data-testid=tab-a]",
    press: ["ArrowRight"],
    expect: { focused: "[data-testid=tab-b]", text: { "[data-testid=selected]": "b" } },
  },
  {
    name: "ArrowRight를 한 번 더 누르면 다음 탭이 선택된다",
    focus: "[data-testid=tab-a]",
    press: ["ArrowRight", "ArrowRight"],
    expect: { focused: "[data-testid=tab-c]", text: { "[data-testid=selected]": "c" } },
  },
  {
    name: "ArrowLeft가 이전 탭으로 초점을 옮기고 곧바로 선택한다",
    focus: "[data-testid=tab-c]",
    press: ["ArrowLeft"],
    expect: { focused: "[data-testid=tab-b]", text: { "[data-testid=selected]": "b" } },
  },
]

export const Keyboard: Story = {
  name: "키보드 계약",
  parameters: { keyboard },
  render: () => <KeyboardFixture />,
}

function KeyboardFixture() {
  const [value, setValue] = useState("a")
  return (
    <div>
      {/* 선택 표시는 패널 밖 한 곳에 둔다 — 각 Panel 안에 두면 테스트가 값을
       * 바꿀 때마다 이전 패널이 언마운트되기 전 한 프레임 동안 같은
       * data-testid가 둘 존재할 수 있어 셀렉터가 더는 하나를 가리키지 않는다 */}
      선택됨: <span data-testid="selected">{value}</span>
      <Tabs.Root value={value} onValueChange={(v) => setValue(String(v))}>
        <Tabs.List>
          <Tabs.Tab data-testid="tab-a" value="a">
            A
          </Tabs.Tab>
          <Tabs.Tab data-testid="tab-b" value="b">
            B
          </Tabs.Tab>
          <Tabs.Tab data-testid="tab-c" value="c">
            C
          </Tabs.Tab>
          <Tabs.Indicator />
        </Tabs.List>
        <Tabs.Panel value="a" className="pt-4 text-sm">
          A 내용
        </Tabs.Panel>
        <Tabs.Panel value="b" className="pt-4 text-sm">
          B 내용
        </Tabs.Panel>
        <Tabs.Panel value="c" className="pt-4 text-sm">
          C 내용
        </Tabs.Panel>
      </Tabs.Root>
    </div>
  )
}
