import { Button } from "@flameware/ui/button"
import { Drawer } from "@flameware/ui/drawer"
import type { Meta, StoryObj } from "@storybook/react-vite"
import type * as React from "react"

import type { KeyboardContract } from "../keyboard"
import type { ComponentMeta } from "../meta"

/* Dialog의 바닥 시트 짝 — 768px 미만에서 앱이 고르는 쪽이다(#284). 두 스토리
 * 모두 `tags: ["viewport:mobile"]`를 단다 — `test/stories.test.mjs`가 이
 * 태그를 보고 Playwright 뷰포트를 375px로 바꿔서 연다. 데스크톱 폭에서도
 * 렌더 자체는 되지만(바닥 시트는 뷰포트로 갈리는 별도 컴포넌트이지 미디어
 * 쿼리 스위치가 아니다), 모바일 폭에서 실제로 쓰이는 모양으로 재는 것이
 * 이 스토리의 요점이다. */
const meta = {
  title: "Overlays/Drawer",
  component: Drawer.Popup,
  parameters: { ds: { status: "preview", since: "0.2.0" } },
} satisfies Meta<typeof Drawer.Popup> & ComponentMeta

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {
  tags: ["viewport:mobile"],
  render: () => (
    <Drawer.Root>
      <Drawer.Trigger render={<Button variant="outline">비밀번호 변경</Button>} />
      <Drawer.Portal>
        <Drawer.Backdrop />
        <Drawer.Viewport>
          <Drawer.Popup>
            <Drawer.Close />
            <Drawer.Title>비밀번호 변경</Drawer.Title>
            <Drawer.Description>현재 비밀번호와 새 비밀번호를 입력하세요.</Drawer.Description>
            <form
              style={{ display: "flex", flexDirection: "column", gap: "0.75rem", padding: "1rem" }}
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="password"
                aria-label="현재 비밀번호"
                placeholder="현재 비밀번호"
                style={inputStyle}
              />
              <input type="password" aria-label="새 비밀번호" placeholder="새 비밀번호" style={inputStyle} />
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "0.5rem" }}>
                <Drawer.Close render={<Button variant="outline">취소</Button>} />
                <Button type="submit">저장</Button>
              </div>
            </form>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  ),
}

/* 계약은 Dialog와 같은 모양이다 — 파츠만 Drawer 것으로 바꿨다. 열림·트랩·Esc는
 * 여기서도 Base UI(`modal` 기본값 `true`)의 몫이고, 스와이프로 내려서 닫는
 * 동작은 포인터 전용이라 키보드 계약에는 없다(`swipeDirection: 'down'` 기본값,
 * drawer.tsx). */
const keyboard: KeyboardContract[] = [
  {
    name: "Tab이 트리거에 닿는다",
    press: ["Tab"],
    expect: { focused: "[data-testid=drawer-trigger]" },
  },
  {
    name: "Enter가 열고 포커스가 시트 안으로 들어간다",
    focus: "[data-testid=drawer-trigger]",
    press: ["Enter"],
    expect: { focused: "[data-testid=drawer-close]" },
  },
  {
    name: "Tab이 밖으로 새지 않는다 — 마지막 요소에서 한 번 더 누르면 처음으로 돌아온다",
    focus: "[data-testid=drawer-trigger]",
    press: ["Enter", "Tab", "Tab", "Tab", "Tab", "Tab"],
    expect: { focused: "[data-testid=drawer-close]" },
  },
  {
    name: "Esc가 닫고 포커스가 트리거로 돌아온다",
    focus: "[data-testid=drawer-trigger]",
    press: ["Enter", "Escape"],
    expect: { focused: "[data-testid=drawer-trigger]" },
  },
]

export const Keyboard: Story = {
  name: "키보드 계약",
  tags: ["viewport:mobile"],
  parameters: { keyboard },
  render: () => (
    <Drawer.Root>
      <Drawer.Trigger data-testid="drawer-trigger" render={<Button variant="outline">비밀번호 변경</Button>} />
      <Drawer.Portal>
        <Drawer.Backdrop />
        <Drawer.Viewport>
          <Drawer.Popup>
            <Drawer.Close data-testid="drawer-close" />
            <Drawer.Title>비밀번호 변경</Drawer.Title>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", padding: "1rem" }}>
              <input type="password" aria-label="현재 비밀번호" style={inputStyle} />
              <input type="password" aria-label="새 비밀번호" style={inputStyle} />
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "0.5rem" }}>
                <Drawer.Close render={<Button variant="outline">취소</Button>} />
                <Button>저장</Button>
              </div>
            </div>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  ),
}

const inputStyle: React.CSSProperties = {
  height: "2.25rem",
  borderRadius: "0.375rem",
  border: "1px solid var(--ds-border-field)",
  padding: "0 0.75rem",
  fontSize: "0.875rem",
  color: "var(--ds-fg-default)",
  background: "var(--ds-bg-surface)",
}
