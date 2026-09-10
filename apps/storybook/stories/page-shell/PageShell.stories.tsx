import { Button } from "@flameware/ui/button"
import { PageShell } from "@flameware/ui/page-shell"
import { ThemeToggle } from "@flameware/ui/theme-toggle"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"

import type { ComponentMeta } from "../meta"

const NAV_ITEMS = [
  { value: "portfolio", label: "포트폴리오" },
  { value: "history", label: "히스토리" },
  { value: "notes", label: "노트" },
]

const meta = {
  title: "Patterns/Page shell",
  component: PageShell,
  parameters: { ds: { status: "preview", since: "0.2.0" } },
  // 모든 스토리가 render로 자기 상태를 들기 때문에 여기서 쓰이지는 않지만,
  // PageShell의 필수 prop(nav·children)을 meta에서 채워야 CSF3 타입이
  // 각 스토리에 args를 다시 요구하지 않는다
  args: { nav: { items: NAV_ITEMS, value: "portfolio", onValueChange: () => {} }, children: null },
} satisfies Meta<typeof PageShell> & ComponentMeta

export default meta

type Story = StoryObj<typeof meta>

/* 대시보드 셸 전체 — 헤더 좌우 슬롯(로고·테마 토글) + 탭 내비 + 본문. 앱의
 * 대시보드 셸이 그대로 이 모양으로 돈다(#286 완료 조건). */
export const Basic: Story = {
  render: () => <Shell />,
}

/* 데스크톱·모바일 뷰포트 둘 다에서 헤더·탭·본문 폭이 그려지는지 보는 자리
 * (완료 조건 — "PageShell 스토리가 데스크톱·모바일 뷰포트에서 헤더·탭·본문
 * 폭을 그린다"). 뷰포트 애드온이 없으므로 고정 폭 컨테이너로 두 뷰포트를
 * 직접 흉내 낸다 — Button.stories의 `Row`처럼 문서 껍데기라 인라인 스타일을
 * 쓴다. 좁은 폭에서 탭은 가로 스크롤로 넘어가고 헤더 오른쪽 슬롯은 줄지
 * 않는다(shrink-0). */
export const Desktop: Story = {
  render: () => (
    <div style={{ width: 1200, border: "1px solid var(--ds-border-default)" }}>
      <Shell />
    </div>
  ),
}

export const Mobile: Story = {
  render: () => (
    <div style={{ width: 375, border: "1px solid var(--ds-border-default)" }}>
      <Shell />
    </div>
  ),
}

function Shell() {
  const [tab, setTab] = useState("portfolio")
  const [theme, setTheme] = useState<"light" | "dark">("light")

  return (
    <div className={theme === "dark" ? "dark" : undefined}>
      <PageShell
        header={{
          left: <span className="text-sm font-semibold">invest diary</span>,
          right: (
            <>
              <ThemeToggle theme={theme} onThemeChange={setTheme} />
              <Button size="sm" variant="outline">
                로그아웃
              </Button>
            </>
          ),
        }}
        nav={{ items: NAV_ITEMS, value: tab, onValueChange: setTab }}
      >
        <p className="text-sm text-muted">지금 화면: {tab}</p>
      </PageShell>
    </div>
  )
}
