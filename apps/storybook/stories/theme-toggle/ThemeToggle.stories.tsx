import { ThemeToggle } from "@flameware/ui/theme-toggle"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"

import type { KeyboardContract } from "../keyboard"
import type { ComponentMeta } from "../meta"

const meta = {
  title: "Patterns/Theme toggle",
  component: ThemeToggle,
  parameters: { ds: { status: "preview", since: "0.2.0" } },
  args: { theme: "light", onThemeChange: () => {} },
} satisfies Meta<typeof ThemeToggle> & ComponentMeta

export default meta

type Story = StoryObj<typeof meta>

/* 제어 컴포넌트다 — `theme`과 `onThemeChange`를 소비처가 쥔다. 스토리도
 * 그대로 상태를 들고 누를 때마다 바뀌는 것을 보여준다. */
export const Playground: Story = {
  render: () => <Controlled />,
}

export const Light: Story = {
  args: { theme: "light", onThemeChange: () => {} },
}

export const Dark: Story = {
  args: { theme: "dark", onThemeChange: () => {} },
  decorators: [
    (Story) => (
      <div className="dark bg-surface p-4">
        <Story />
      </div>
    ),
  ],
}

function Controlled() {
  const [theme, setTheme] = useState<"light" | "dark">("light")
  return (
    <div className={theme === "dark" ? "dark bg-surface p-4" : "p-4"}>
      <ThemeToggle theme={theme} onThemeChange={setTheme} />
    </div>
  )
}

/* 키보드 계약. Button 위에 얹혀 있으므로 Tab·Enter·Space는 Button이 이미
 * 보장하지만, ThemeToggle 자신의 계약(눌렀을 때 `aria-pressed`와 상태가
 * 함께 바뀐다)을 여기서 선언한다. */
const keyboard: KeyboardContract[] = [
  {
    name: "Tab이 토글에 닿는다",
    press: ["Tab"],
    expect: { focused: "[data-testid=toggle]" },
  },
  {
    name: "Enter가 테마를 바꾼다",
    focus: "[data-testid=toggle]",
    press: ["Enter"],
    expect: { focused: "[data-testid=toggle]", text: { "[data-testid=theme]": "dark" } },
  },
  {
    name: "Space도 활성화한다 — Enter·Space 둘 다로 다시 라이트로 되돌린다",
    focus: "[data-testid=toggle]",
    press: ["Enter", "Space"],
    expect: { focused: "[data-testid=toggle]", text: { "[data-testid=theme]": "light" } },
  },
]

export const Keyboard: Story = {
  name: "키보드 계약",
  parameters: { keyboard },
  render: () => <KeyboardFixture />,
}

function KeyboardFixture() {
  const [theme, setTheme] = useState<"light" | "dark">("light")
  return (
    <div>
      지금 테마: <span data-testid="theme">{theme}</span>
      <div className="mt-2">
        <ThemeToggle data-testid="toggle" theme={theme} onThemeChange={setTheme} />
      </div>
    </div>
  )
}
