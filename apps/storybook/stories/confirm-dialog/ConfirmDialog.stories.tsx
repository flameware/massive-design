import { Button } from "@flameware/ui/button"
import { ConfirmDialog } from "@flameware/ui/confirm-dialog"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"

import type { KeyboardContract } from "../keyboard"
import type { ComponentMeta } from "../meta"

/* ConfirmDialog는 AlertDialog(Overlays/AlertDialog)를 대신 조립하는 프리셋이다
 * — Phase 1의 "프리셋은 없다"를 처음 뒤집은 자리다(#317 Implementation
 * Decisions, #330). `component`는 유일한 노출 표면인 `ConfirmDialog` 자신이다
 * — AlertDialog처럼 파트로 나뉘지 않는다(confirm-dialog.tsx 주석). 표면·
 * 포커스 트랩·Esc 닫기는 AlertDialog가 그대로 지므로 여기서 다시 재지
 * 않는다 — 이 스토리가 재는 것은 프리셋이 얹은 것: 초기 초점이 확인
 * 버튼으로 가는 것, 로딩 중 확인이 잠기고 취소는 살아 있는 것이다. */
const meta = {
  title: "Patterns/ConfirmDialog",
  component: ConfirmDialog,
  // 기본 args — 각 스토리가 자기 render로 실제 조립을 대신하지만, `title`·
  // `onConfirm`이 필수 prop이라 메타에 채워 두지 않으면 스토리마다 타입이
  // args를 요구한다(Pagination.stories.tsx와 같은 이유).
  args: { title: "제목", onConfirm: () => {} },
  parameters: { ds: { status: "preview", since: "0.3.2" } },
} satisfies Meta<typeof ConfirmDialog> & ComponentMeta

export default meta

type Story = StoryObj<typeof meta>

/* 기본 조립 — 거래 삭제 확인(AlertDialog.mdx의 Playground와 같은 자리를
 * 프리셋 호출 한 번으로 그린다). `tone="danger"`가 확인 버튼을 destructive로
 * 칠한다. */
export const Playground: Story = {
  render: () => {
    function DeleteConfirm() {
      const [deleted, setDeleted] = useState(0)
      return (
        <ConfirmDialog
          trigger={<Button variant="destructive">거래 삭제</Button>}
          title="거래를 삭제할까요?"
          description={`삭제한 거래는 되돌릴 수 없습니다. 삭제됨: ${deleted}건`}
          tone="danger"
          confirmLabel="삭제"
          onConfirm={() => setDeleted((n) => n + 1)}
        />
      )
    }
    return <DeleteConfirm />
  },
}

/* 로딩 상태 — `onConfirm`이 Promise를 반환하면 그동안 확인 버튼이 잠기고
 * 스피너를 보인다(#330 AC "확인 중 로딩 상태에서 확인 버튼이 잠기고 취소가
 * 살아 있다"). 빠르게 두 번 눌러도 `onConfirm`은 한 번만 불린다 — Button의
 * `loading`이 포인터·키보드 활성화를 함께 막는다(button.tsx). 취소 버튼은
 * 로딩 중에도 그대로 눌린다. */
export const Loading: Story = {
  name: "로딩 상태",
  render: () => <LoadingFixture />,
}

function LoadingFixture() {
  const [confirmCount, setConfirmCount] = useState(0)
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <ConfirmDialog
        trigger={<Button variant="destructive">계좌 되돌리기</Button>}
        title="이 되돌리기를 확정할까요?"
        description="서버 응답까지 1초 정도 걸립니다 — 그동안 확인 버튼은 잠기고 취소는 그대로 눌립니다."
        tone="danger"
        confirmLabel="되돌리기"
        onConfirm={() =>
          new Promise<void>((resolve) => {
            setTimeout(() => {
              setConfirmCount((n) => n + 1)
              resolve()
            }, 1000)
          })
        }
      />
      <span data-testid="confirm-count">확정 횟수: {confirmCount}</span>
    </div>
  )
}

/* 키보드 계약 — 포커스 트랩(마지막에서 Tab이 첫 자리로) · Esc 닫기 · 열릴 때
 * 확인 버튼 초점(#317 Testing Decisions "ConfirmDialog(포커스 트랩·Esc·확인
 * 버튼 초점)", #330 AC). AlertDialog의 기본값(취소에 초점)과 다른 점이
 * 여기서 재는 것이다 — 삭제 확인은 보통 확인을 기대하는 자리이기 때문이다
 * (confirm-dialog.tsx 참고). */
const keyboard: KeyboardContract[] = [
  {
    name: "Tab이 트리거에 닿는다",
    press: ["Tab"],
    expect: { focused: "[data-testid=confirm-dialog-trigger]" },
  },
  {
    name: "Enter가 열고 초점이 확인 버튼으로 간다 — 취소가 아니다",
    focus: "[data-testid=confirm-dialog-trigger]",
    press: ["Enter"],
    expect: { focused: "[data-testid=confirm-dialog-confirm]" },
  },
  {
    name: "Tab이 밖으로 새지 않는다 — 확인에서 한 번 더 누르면 취소로 돌아온다",
    focus: "[data-testid=confirm-dialog-trigger]",
    press: ["Enter", "Tab"],
    expect: { focused: "[data-testid=confirm-dialog-cancel]" },
  },
  {
    name: "Esc가 닫고 초점이 트리거로 돌아온다",
    focus: "[data-testid=confirm-dialog-trigger]",
    press: ["Enter", "Escape"],
    expect: { focused: "[data-testid=confirm-dialog-trigger]" },
  },
]

export const Keyboard: Story = {
  name: "키보드 계약",
  parameters: { keyboard },
  render: () => (
    <ConfirmDialog
      trigger={
        <Button data-testid="confirm-dialog-trigger" variant="destructive">
          거래 삭제
        </Button>
      }
      title="거래를 삭제할까요?"
      description="삭제한 거래는 되돌릴 수 없습니다."
      tone="danger"
      confirmLabel="삭제"
      onConfirm={() => {}}
    />
  ),
}
