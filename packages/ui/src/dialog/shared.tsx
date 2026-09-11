"use client"

import { Dialog as BaseDialog } from "@base-ui/react/dialog"
import type * as React from "react"

import { cn } from "../lib/utils.js"
import { CloseIcon, closeButtonClassName } from "./close-icon.js"

/* Dialog와 AlertDialog가 공유하는 표면. Base UI 자신이 이렇게 짠다 —
 * `@base-ui/react/alert-dialog`의 Backdrop·Popup·Title·Description·Viewport는
 * `@base-ui/react/dialog`의 같은 이름을 **그대로 재수출**한다(둘의
 * index.parts.mjs로 확인). Root와 Trigger만 진짜로 다르다(모달 강제, 포인터
 * 무력화 없음 — AlertDialogRoot.Props가 `modal`·`disablePointerDismissal`을
 * 아예 생략한다). 그래서 스타일도 Base UI를 따라 한 자리에서만 적는다: 여기를
 * 고치면 Dialog와 AlertDialog가 같이 바뀐다.
 *
 * 포커스 트랩·스크롤 잠금·Esc 닫기는 여기서 손대지 않는다 — Base UI의 일이다
 * (Root의 `modal` 기본값 `true`가 셋 다 켠다). 이 파일은 표면(배경·테두리·
 * 그림자·여백)과 열림/닫힘 전환(`data-starting-style`·`data-ending-style`)만
 * 칠한다. */

export function OverlayBackdrop({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof BaseDialog.Backdrop>) {
  return (
    <BaseDialog.Backdrop
      className={cn(
        "fixed inset-0 z-50 bg-scrim transition-opacity duration-150",
        "data-[starting-style]:opacity-0 data-[ending-style]:opacity-0",
        className
      )}
      {...props}
    />
  )
}

export function OverlayViewport({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof BaseDialog.Viewport>) {
  return (
    <BaseDialog.Viewport
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4",
        className
      )}
      {...props}
    />
  )
}

export function OverlayPopup({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof BaseDialog.Popup>) {
  return (
    <BaseDialog.Popup
      className={cn(
        "relative w-full max-w-md rounded-lg border bg-overlay p-6 shadow-lg outline-none",
        "transition-[opacity,transform] duration-150",
        "data-[starting-style]:scale-95 data-[starting-style]:opacity-0",
        "data-[ending-style]:scale-95 data-[ending-style]:opacity-0",
        className
      )}
      {...props}
    />
  )
}

export function OverlayTitle({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof BaseDialog.Title>) {
  return <BaseDialog.Title className={cn("text-lg font-semibold text-default", className)} {...props} />
}

export function OverlayDescription({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof BaseDialog.Description>) {
  return <BaseDialog.Description className={cn("mt-1 text-sm text-muted", className)} {...props} />
}

/* Header·Footer는 Base UI에 대응 파트가 없다 — 순수 레이아웃 그룹이라 평범한
 * `<div>`다. 소비처(auth·history·portfolio) 6자리에서 `Title`(+`Description`)
 * 다음 세로 간격과 버튼 줄(`mt-4 flex justify-end gap-2`)을 매번 손으로
 * 반복해 프리셋으로 올린다(ADR-0023 §5 "반복이 확인된 뒤"). Dialog·AlertDialog
 * 둘 다 이 표면을 공유하므로(위 주석) 여기 한 자리에 둔다. */

export function OverlayHeader({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  return <div className={cn("flex flex-col gap-1", className)} {...props} />
}

/** 모바일에서는 세로로 쌓고 주 동작(대개 마지막 자식)이 위로 오게
 * `flex-col-reverse`, 데스크톱은 오른쪽 정렬 가로 줄. shadcn `DialogFooter`와
 * 같은 관례다. */
export function OverlayFooter({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn("mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)}
      {...props}
    />
  )
}

/* Dialog 전용이다 — AlertDialog는 쓰지 않는다. Alert 계열은 "X로 닫기"를 두지
 * 않고 명시적 선택(취소/확인)만 받는 것이 관례라, alert-dialog.tsx는 Base UI의
 * `AlertDialog.Close`를 취소 버튼 합성(`render={<Button variant="outline" />}`)
 * 용으로 그대로 넘기고 이 모양을 쓰지 않는다. */
export function OverlayClose({
  className,
  children,
  "aria-label": ariaLabel,
  ...props
}: React.ComponentPropsWithoutRef<typeof BaseDialog.Close>) {
  return (
    <BaseDialog.Close aria-label={ariaLabel ?? "닫기"} className={cn(closeButtonClassName, className)} {...props}>
      {children ?? <CloseIcon />}
    </BaseDialog.Close>
  )
}
