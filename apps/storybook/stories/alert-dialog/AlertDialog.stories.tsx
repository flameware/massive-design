import { AlertDialog } from "@flameware/ui/alert-dialog"
import { Button } from "@flameware/ui/button"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"

import type { KeyboardContract } from "../keyboard"
import type { ComponentMeta } from "../meta"

const meta = {
  title: "Overlays/AlertDialog",
  component: AlertDialog.Popup,
  parameters: { ds: { status: "preview", since: "0.2.0" } },
} satisfies Meta<typeof AlertDialog.Popup> & ComponentMeta

export default meta

type Story = StoryObj<typeof meta>

/* 되돌릴 수 없는 결정을 확인받는 자리 — 거래 삭제 확인(#284, 히스토리·포트폴리오
 * 컷오버에서 같은 셋을 쓴다). `Close`는 alert-dialog.tsx가 스타일을 주지 않으므로
 * 취소 버튼은 `render`로 Button을 합성한다. 확인 버튼은 `Close`가 아니다 — 실제
 * 동작(여기서는 삭제 카운트)을 먼저 하고 **직접** 닫는다: 이것이 "명시적
 * 선택만 닫는다"는 Alert 계열의 약속이다. `Header`·`Footer`는 소비처가 반복해서
 * 손으로 짜던 세로 간격·버튼 줄을 대신 진다(#293). */
export const Playground: Story = {
  render: () => {
    function DeleteConfirm() {
      const [open, setOpen] = useState(false)
      const [deleted, setDeleted] = useState(0)
      return (
        <AlertDialog.Root open={open} onOpenChange={setOpen}>
          <AlertDialog.Trigger render={<Button variant="destructive">거래 삭제</Button>} />
          <AlertDialog.Portal>
            <AlertDialog.Backdrop />
            <AlertDialog.Viewport>
              <AlertDialog.Popup>
                <AlertDialog.Header>
                  <AlertDialog.Title>거래를 삭제할까요?</AlertDialog.Title>
                  <AlertDialog.Description>
                    삭제한 거래는 되돌릴 수 없습니다. 삭제됨: {deleted}건
                  </AlertDialog.Description>
                </AlertDialog.Header>
                <AlertDialog.Footer>
                  <AlertDialog.Close render={<Button variant="outline">취소</Button>} />
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setDeleted((n) => n + 1)
                      setOpen(false)
                    }}
                  >
                    삭제
                  </Button>
                </AlertDialog.Footer>
              </AlertDialog.Popup>
            </AlertDialog.Viewport>
          </AlertDialog.Portal>
        </AlertDialog.Root>
      )
    }
    return <DeleteConfirm />
  },
}

/* 초점 이동은 Dialog와 같은 규칙이다 — 여는 순간 팝업 안 첫 탭 대상(취소)으로
 * 들어가고, 마지막(삭제)에서 Tab을 한 번 더 누르면 처음으로 돌아온다. AlertDialog는
 * 바깥을 눌러 닫히지 않지만 Esc는 그대로 닫는다(`AlertDialogRoot`가
 * `disablePointerDismissal`만 없앤다 — 키보드 탈출구는 남긴다). */
const keyboard: KeyboardContract[] = [
  {
    name: "Tab이 트리거에 닿는다",
    press: ["Tab"],
    expect: { focused: "[data-testid=alert-trigger]" },
  },
  {
    name: "Enter가 열고 포커스가 팝업 안으로 들어간다",
    focus: "[data-testid=alert-trigger]",
    press: ["Enter"],
    expect: { focused: "[data-testid=alert-cancel]" },
  },
  {
    name: "Tab이 밖으로 새지 않는다 — 마지막 요소에서 한 번 더 누르면 처음으로 돌아온다",
    focus: "[data-testid=alert-trigger]",
    press: ["Enter", "Tab", "Tab"],
    expect: { focused: "[data-testid=alert-cancel]" },
  },
  {
    name: "Esc가 닫고 포커스가 트리거로 돌아온다",
    focus: "[data-testid=alert-trigger]",
    press: ["Enter", "Escape"],
    expect: { focused: "[data-testid=alert-trigger]" },
  },
]

export const Keyboard: Story = {
  name: "키보드 계약",
  parameters: { keyboard },
  render: () => (
    <AlertDialog.Root>
      <AlertDialog.Trigger data-testid="alert-trigger" render={<Button variant="destructive">거래 삭제</Button>} />
      <AlertDialog.Portal>
        <AlertDialog.Backdrop />
        <AlertDialog.Viewport>
          <AlertDialog.Popup>
            <AlertDialog.Title>거래를 삭제할까요?</AlertDialog.Title>
            <AlertDialog.Description>삭제한 거래는 되돌릴 수 없습니다.</AlertDialog.Description>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "1.5rem" }}>
              <AlertDialog.Close
                data-testid="alert-cancel"
                render={<Button variant="outline">취소</Button>}
              />
              <Button data-testid="alert-confirm" variant="destructive">
                삭제
              </Button>
            </div>
          </AlertDialog.Popup>
        </AlertDialog.Viewport>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  ),
}
