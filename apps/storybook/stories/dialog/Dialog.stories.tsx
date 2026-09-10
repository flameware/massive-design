import { Button } from "@flameware/ui/button"
import { Dialog } from "@flameware/ui/dialog"
import type { Meta, StoryObj } from "@storybook/react-vite"
import type * as React from "react"

import type { KeyboardContract } from "../keyboard"
import type { ComponentMeta } from "../meta"

/* Dialog.Root는 자기 HTML 요소가 없어 `component`로 가리킬 화면 요소가 없다.
 * Icon 스토리처럼 실제로 렌더하는 파츠를 대신 가리킨다 — 여기서는 표면인 Popup. */
const meta = {
  title: "Overlays/Dialog",
  component: Dialog.Popup,
  parameters: { ds: { status: "preview", since: "0.2.0" } },
} satisfies Meta<typeof Dialog.Popup> & ComponentMeta

export default meta

type Story = StoryObj<typeof meta>

/* 앱의 실제 자리 — 인증 헤더의 비밀번호 변경(#284)을 그대로 옮겼다. `Dialog.Trigger`와
 * `Dialog.Close`는 일부러 스타일이 없다: `render`로 Button을 합성한다
 * (button.tsx가 이미 보여준 조립이 여기서도 통한다). */
export const Playground: Story = {
  render: () => (
    <Dialog.Root>
      <Dialog.Trigger render={<Button variant="outline">비밀번호 변경</Button>} />
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Viewport>
          <Dialog.Popup>
            <Dialog.Close />
            <Dialog.Title>비밀번호 변경</Dialog.Title>
            <Dialog.Description>현재 비밀번호와 새 비밀번호를 입력하세요.</Dialog.Description>
            <form
              style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1rem" }}
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
                <Dialog.Close render={<Button variant="outline">취소</Button>} />
                <Button type="submit">저장</Button>
              </div>
            </form>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  ),
}

/* 키보드 계약을 **재는** 스토리 — Button.stories.tsx의 Keyboard와 같은 자리다.
 * data-testid로 파츠를 고정해 Playground의 문구가 바뀌어도 계약이 안 깨진다.
 *
 * 초점 이동은 Base UI `Popup`의 기본값 그대로다: 열리면 포커스가 팝업 안
 * 첫 탭 대상(여기서는 Close)으로 들어가고, 마지막 대상(Save)에서 Tab을 한 번
 * 더 누르면 처음(Close)으로 돌아온다 — 트랩이 밖으로 새지 않는다는 뜻이다.
 * 닫히면(Esc) 포커스가 트리거로 돌아온다. 포커스 트랩·스크롤 잠금·Esc 자체는
 * Base UI가 지고(`modal` 기본값 `true`), 이 스토리는 그 결과만 밖에서 잰다. */
const keyboard: KeyboardContract[] = [
  {
    name: "Tab이 트리거에 닿는다",
    press: ["Tab"],
    expect: { focused: "[data-testid=dialog-trigger]" },
  },
  {
    name: "Enter가 열고 포커스가 팝업 안으로 들어간다",
    focus: "[data-testid=dialog-trigger]",
    press: ["Enter"],
    expect: { focused: "[data-testid=dialog-close]" },
  },
  {
    name: "Tab이 밖으로 새지 않는다 — 마지막 요소에서 한 번 더 누르면 처음으로 돌아온다",
    focus: "[data-testid=dialog-trigger]",
    press: ["Enter", "Tab", "Tab", "Tab", "Tab", "Tab"],
    expect: { focused: "[data-testid=dialog-close]" },
  },
  {
    name: "Esc가 닫고 포커스가 트리거로 돌아온다",
    focus: "[data-testid=dialog-trigger]",
    press: ["Enter", "Escape"],
    expect: { focused: "[data-testid=dialog-trigger]" },
  },
]

export const Keyboard: Story = {
  name: "키보드 계약",
  parameters: { keyboard },
  render: () => (
    <Dialog.Root>
      <Dialog.Trigger data-testid="dialog-trigger" render={<Button variant="outline">비밀번호 변경</Button>} />
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Viewport>
          <Dialog.Popup>
            <Dialog.Close data-testid="dialog-close" />
            <Dialog.Title>비밀번호 변경</Dialog.Title>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1rem" }}>
              <input type="password" aria-label="현재 비밀번호" style={inputStyle} />
              <input type="password" aria-label="새 비밀번호" style={inputStyle} />
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "0.5rem" }}>
                <Dialog.Close render={<Button variant="outline">취소</Button>} />
                <Button>저장</Button>
              </div>
            </div>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
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
