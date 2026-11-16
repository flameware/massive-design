import { Button } from "@flameware/ui/button"
import {
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@spike/ui/dialog"
import type { Meta, StoryObj } from "@storybook/react-vite"
import type * as React from "react"

import type { KeyboardContract } from "../../../../apps/storybook/stories/keyboard"
import type { ComponentMeta } from "../../../../apps/storybook/stories/meta"

/* Dialog는 자기 HTML 요소가 없어 `component`로 가리킬 화면 요소가 없다.
 * Icon 스토리처럼 실제로 렌더하는 파츠를 대신 가리킨다 — 여기서는 표면인 Popup. */
const meta = {
  title: "Overlays/Dialog",
  component: DialogContent,
  parameters: { ds: { status: "stable", since: "0.2.0" } },
} satisfies Meta<typeof DialogContent> & ComponentMeta

export default meta

type Story = StoryObj<typeof meta>

/* 앱의 실제 자리 — 인증 헤더의 비밀번호 변경(#284)을 그대로 옮겼다. `DialogTrigger`와
 * `DialogClose`는 일부러 스타일이 없다: `render`로 Button을 합성한다
 * (button.tsx가 이미 보여준 조립이 여기서도 통한다). */
export const Playground: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger render={<Button variant="outline">비밀번호 변경</Button>} />
      <DialogBackdrop />
      <DialogContent>
        <DialogClose />
        <DialogTitle>비밀번호 변경</DialogTitle>
        <DialogDescription>현재 비밀번호와 새 비밀번호를 입력하세요.</DialogDescription>
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
            <DialogClose render={<Button variant="outline">취소</Button>} />
            <Button type="submit">저장</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
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
    <Dialog>
      <DialogTrigger data-testid="dialog-trigger" render={<Button variant="outline">비밀번호 변경</Button>} />
      <DialogBackdrop />
      <DialogContent>
        <DialogClose data-testid="dialog-close" />
        <DialogTitle>비밀번호 변경</DialogTitle>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1rem" }}>
          <input type="password" aria-label="현재 비밀번호" style={inputStyle} />
          <input type="password" aria-label="새 비밀번호" style={inputStyle} />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "0.5rem" }}>
            <DialogClose render={<Button variant="outline">취소</Button>} />
            <Button>저장</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  ),
}

/* Header·Footer 프리셋 — 소비처(auth·history·portfolio) 6자리에서 반복된
 * "Title 다음 세로 간격"과 "버튼 줄"을 대신 진다(#293). */
export const HeaderFooter: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger render={<Button variant="outline">데이터 관리</Button>} />
      <DialogBackdrop />
      <DialogContent>
        <DialogClose />
        <DialogHeader>
          <DialogTitle>데이터 관리</DialogTitle>
          <DialogDescription>거래 내역을 내보내거나 가져옵니다.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline">취소</Button>} />
          <Button>내보내기</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}

/* **스파이크 전용(#496)** — 원본에 없는 스토리다. 모달 안에서 모달을 연다:
 * Esc가 맨 위 하나만 닫는지, 포커스가 안쪽 트리거로 돌아오는지를
 * runs/ 아래의 일회용 Playwright 스크립트가 잰다. 키보드 계약은 달지 않는다 —
 * 합격선은 원본 스토리의 계약이고, 이 스토리는 axe·24px만 같이 통과한다. */
export const SpikeNested: Story = {
  name: "스파이크 전용 — 중첩 모달",
  render: () => (
    <Dialog>
      <DialogTrigger data-testid="outer-trigger" render={<Button variant="outline">계정</Button>} />
      <DialogBackdrop data-testid="outer-backdrop" />
      <DialogContent data-testid="outer-content">
        <DialogClose data-testid="outer-close" />
        <DialogHeader>
          <DialogTitle>계정</DialogTitle>
          <DialogDescription>로그인 방법을 관리합니다.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Dialog>
            <DialogTrigger data-testid="inner-trigger" render={<Button variant="outline">비밀번호 변경</Button>} />
            <DialogBackdrop data-testid="inner-backdrop" />
            <DialogContent data-testid="inner-content">
              <DialogClose data-testid="inner-close" />
              <DialogHeader>
                <DialogTitle>비밀번호 변경</DialogTitle>
                <DialogDescription>12자 이상으로 입력하세요.</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button>저장</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button>완료</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
