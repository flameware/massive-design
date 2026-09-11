"use client"

import * as React from "react"

import { AlertDialog } from "../alert-dialog/alert-dialog.js"
import { Button } from "../button/button.js"

/* Phase 1의 "프리셋은 없다" 결정을 여기서 처음 뒤집는다(#317 Implementation
 * Decisions "프리셋의 첫 사례는 ConfirmDialog 하나다"). 프리셋은 파트 조립을
 * 대체하되 파트를 숨기지 않는다 — `AlertDialog`는 그대로 남고(파일 하나
 * 위, alert-dialog.tsx) `ConfirmDialog`는 그 위의 함수다: `Root`·`Trigger`·
 * `Portal`·`Backdrop`·`Viewport`·`Popup`·`Header`·`Title`·`Description`·
 * `Footer`·`Close`를 그대로 불러 조립한다. 새 표면·새 Tailwind 클래스는
 * 하나도 없다 — 이 파일이 진 것은 배선(초점·로딩·열림 상태)뿐이다.
 *
 * 앱의 84줄(#330 "What to build")이 반복한 모양: 트리거 버튼 하나, 제목·
 * 설명, 취소·확인 버튼 둘. 제어(`open`/`onOpenChange`)와 비제어
 * (`defaultOpen`)를 둘 다 받는 이유는 AlertDialog.Root 자신이 둘 다 받고,
 * 네 파일 중 일부는 트리거가 다이얼로그 밖(표의 행 메뉴 등)에 있어 열림
 * 상태를 소비처가 쥐어야 하기 때문이다 — `trigger`를 생략하면 그 자리다. */

export interface ConfirmDialogProps {
  /** 다이얼로그를 여는 트리거. `AlertDialog.Trigger`에 `render`로 합성된다.
   * 생략하면 트리거를 그리지 않는다 — `open`·`onOpenChange`로 소비처가 직접
   * 연다(트리거가 다이얼로그 밖에 있는 자리, 표의 행 메뉴 등). */
  trigger?: React.ReactElement
  /** 제어 컴포넌트로 쓸 때의 열림 상태. */
  open?: boolean
  /** 비제어로 쓸 때의 초기 열림 상태. */
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  title: React.ReactNode
  description?: React.ReactNode
  /** 확인 버튼 글자. 기본 "확인". */
  confirmLabel?: string
  /** 취소 버튼 글자. 기본 "취소". */
  cancelLabel?: string
  /** 확인 버튼의 색 — `danger`는 삭제처럼 되돌릴 수 없는 동작. 기본 `neutral`. */
  tone?: "neutral" | "danger"
  /** 확인을 눌렀을 때 실행한다. Promise를 반환하면 그동안 로딩 상태가 되고
   * 확인 버튼이 잠긴다 — 취소는 잠기지 않는다(Esc·취소 버튼 둘 다 그대로
   * 닫는다). 해결되면 다이얼로그가 닫히고, 거부되면 열린 채로 남아 다시
   * 시도할 수 있다. */
  onConfirm: () => void | Promise<void>
}

const toneToVariant = {
  neutral: "default",
  danger: "destructive",
} as const satisfies Record<NonNullable<ConfirmDialogProps["tone"]>, "default" | "destructive">

/**
 * 되돌릴 수 없는 결정을 확인받는 호출 한 번 — `AlertDialog` 조립을 대신한다.
 *
 * 열리면 초점이 곧바로 확인 버튼에 놓인다(취소가 아니다 — `AlertDialog`
 * 자신의 기본값과 다른 점이고, 이 프리셋이 존재하는 이유 중 하나다: 삭제
 * 확인은 보통 확인을 누르길 기대하는 자리다). 포커스 트랩·Esc 닫기는
 * `AlertDialog.Root`가 그대로 진다. 로딩 중에도 다이얼로그가 열린 채로
 * 남으므로 트랩이 풀리지 않는다.
 *
 * 확인 버튼은 `Button`의 `loading`을 쓴다 — 포인터뿐 아니라 키보드
 * 활성화(Enter·Space)도 막으므로 더블클릭이나 빠른 재입력으로 `onConfirm`이
 * 두 번 불릴 수 없다(button.tsx 참고). 여기서도 `pendingRef`로 한 번 더
 * 막는다 — React 상태 갱신이 다음 렌더까지 반영되지 않는 사이의 클릭까지
 * 막기 위해서다.
 */
export function ConfirmDialog({
  trigger,
  open,
  defaultOpen = false,
  onOpenChange,
  title,
  description,
  confirmLabel = "확인",
  cancelLabel = "취소",
  tone = "neutral",
  onConfirm,
}: ConfirmDialogProps) {
  const isControlled = open !== undefined
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen)
  const resolvedOpen = isControlled ? open : internalOpen

  const [pending, setPending] = React.useState(false)
  const pendingRef = React.useRef(false)
  const confirmId = React.useId()

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (!isControlled) setInternalOpen(next)
      onOpenChange?.(next)
    },
    [isControlled, onOpenChange]
  )

  async function handleConfirm() {
    if (pendingRef.current) return
    const result = onConfirm()
    if (result && typeof (result as Promise<void>).then === "function") {
      pendingRef.current = true
      setPending(true)
      try {
        await result
        setOpen(false)
      } finally {
        pendingRef.current = false
        setPending(false)
      }
    } else {
      setOpen(false)
    }
  }

  return (
    <AlertDialog.Root open={resolvedOpen} onOpenChange={setOpen}>
      {trigger ? <AlertDialog.Trigger render={trigger} /> : null}
      <AlertDialog.Portal>
        <AlertDialog.Backdrop />
        <AlertDialog.Viewport>
          <AlertDialog.Popup initialFocus={() => document.getElementById(confirmId)}>
            <AlertDialog.Header>
              <AlertDialog.Title>{title}</AlertDialog.Title>
              {description ? <AlertDialog.Description>{description}</AlertDialog.Description> : null}
            </AlertDialog.Header>
            <AlertDialog.Footer>
              <AlertDialog.Close render={<Button variant="outline">{cancelLabel}</Button>} />
              <Button id={confirmId} variant={toneToVariant[tone]} loading={pending} onClick={handleConfirm}>
                {confirmLabel}
              </Button>
            </AlertDialog.Footer>
          </AlertDialog.Popup>
        </AlertDialog.Viewport>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}
