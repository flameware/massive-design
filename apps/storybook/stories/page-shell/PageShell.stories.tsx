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

/* Desktop·Mobile 스토리 전용 뷰포트. 스토리 테스트(stories.test.mjs)가 재는
 * `viewport:mobile` 태그의 375×812와 폭을 맞춘다 — 뷰포트 애드온은 매니저의
 * 미리보기 iframe 크기만 바꾸고, 테스트는 Playwright 페이지 자체의 뷰포트를
 * 별도로 설정하므로 둘은 같은 숫자를 가리키되 서로 의존하지 않는다. */
const DS_DESKTOP_VIEWPORT = "dsDesktop"
const DS_MOBILE_VIEWPORT = "dsMobile"

const meta = {
  title: "Patterns/Page shell",
  component: PageShell,
  parameters: {
    ds: { status: "stable", since: "0.2.0" },
    viewport: {
      options: {
        [DS_DESKTOP_VIEWPORT]: { name: "데스크톱 (1200)", styles: { width: "1200px", height: "900px" }, type: "desktop" },
        [DS_MOBILE_VIEWPORT]: { name: "모바일 (375)", styles: { width: "375px", height: "812px" }, type: "mobile" },
      },
    },
  },
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
 * 폭을 그린다"). 이제 뷰포트 애드온이 Storybook 앱 안에서 실제 미리보기
 * iframe을 그 폭으로 그리므로 고정 폭 컨테이너로 흉내 낼 필요가 없다 — 좁은
 * 폭에서 탭은 가로 스크롤로 넘어가고 헤더 오른쪽 슬롯은 줄지 않는다
 * (shrink-0). */
export const Desktop: Story = {
  globals: { viewport: { value: DS_DESKTOP_VIEWPORT } },
  render: () => <Shell />,
}

/* 뷰포트 애드온은 Storybook 매니저 안에서만 미리보기 iframe 크기를 바꾼다 —
 * 스토리 테스트는 iframe.html을 매니저 없이 직접 열므로 애드온이 닿지
 * 않는다. `viewport:mobile` 태그가 그 자리를 진짜 Playwright 페이지
 * 뷰포트(375×812)로 채운다 — 375px 고정폭 div를 흉내 내던 자리를 실제
 * 뷰포트가 대신한다. */
export const Mobile: Story = {
  tags: ["viewport:mobile"],
  globals: { viewport: { value: DS_MOBILE_VIEWPORT } },
  render: () => <Shell />,
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
