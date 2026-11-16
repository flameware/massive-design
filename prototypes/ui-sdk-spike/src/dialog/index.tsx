"use client"

import {
  Dialog as SdkDialog,
  DialogBackdrop as SdkDialogBackdrop,
  DialogClose as SdkDialogClose,
  DialogContent as SdkDialogContent,
  DialogDescription as SdkDialogDescription,
  DialogTitle as SdkDialogTitle,
  DialogTrigger as SdkDialogTrigger,
} from "@ui-sdk/react/dialog"
import { CloseIcon, closeButtonClassName } from "@flameware/ui/dialog/close-icon"
import { cn } from "@flameware/ui/lib/utils"
import type * as React from "react"

/* #496 스파이크 — packages/ui/src/dialog/{dialog,shared}.tsx를 UI SDK 위에 다시 세운다.
 *
 * 파트 이름은 평면형이고 UI SDK의 해부를 그대로 따른다(#496 결정 2):
 *
 *   Dialog
 *   ├── DialogTrigger
 *   ├── DialogBackdrop
 *   └── DialogContent
 *       ├── DialogHeader   (우리 것 — 레이아웃 div)
 *       ├── DialogTitle
 *       ├── DialogDescription
 *       ├── DialogFooter   (우리 것 — 레이아웃 div)
 *       └── DialogClose
 *
 * 원본과 갈리는 것:
 *   - `Portal`·`Viewport`가 없다. UI SDK는 포털 대신 브라우저의 top layer를 쓴다 —
 *     Content와 Backdrop이 각각 `popover="manual"`로 제자리에서 열린다.
 *   - 그래서 가운데 정렬을 Viewport의 flex가 아니라 **Content 자신**이 진다
 *     (`fixed inset-0 m-auto h-fit`). 원본의 Viewport가 지던 바깥 여백 `p-4`는
 *     폭·높이 상한의 `2rem`으로 옮겼다.
 *   - 화면보다 긴 내용은 원본에서 Viewport가 스크롤했고(팝업이 통째로 움직인다)
 *     여기서는 Content 안쪽이 스크롤한다(테두리는 그대로 있고 안이 움직인다).
 *   - `z-50`은 뺐다. top layer에는 z-index가 닿지 않고 연 순서가 곧 쌓임 순서다.
 *   - `Popup` → `Content`, `Root` → `Dialog`.
 *
 * 포커스 트랩·스크롤 잠금·Esc 닫기는 UI SDK의 일이다(`modal` 기본값 `true`). */

export const Dialog = SdkDialog

/* 원본과 같은 이유로 스타일이 없다 — `render`로 Button을 합성한다 */
export const DialogTrigger = SdkDialogTrigger

export type DialogBackdropProps = Omit<React.ComponentProps<typeof SdkDialogBackdrop>, "className"> & {
  className?: string
}

export function DialogBackdrop({ className, ...props }: DialogBackdropProps) {
  return (
    <SdkDialogBackdrop
      className={cn(
        "fixed inset-0 bg-scrim transition-opacity duration-150",
        "data-[starting-style]:opacity-0 data-[ending-style]:opacity-0",
        className
      )}
      {...props}
    />
  )
}

export type DialogContentProps = Omit<React.ComponentProps<typeof SdkDialogContent>, "className"> & {
  className?: string
}

export function DialogContent({ className, ...props }: DialogContentProps) {
  return (
    <SdkDialogContent
      className={cn(
        /* 원본의 Viewport(`fixed inset-0 flex items-center justify-center overflow-y-auto p-4`)가
         * 하던 가운데 정렬·바깥 여백·스크롤을 top layer의 한 요소가 진다 */
        "fixed inset-0 m-auto h-fit max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] overflow-y-auto",
        "max-w-md rounded-lg border bg-overlay p-6 shadow-lg outline-none",
        "transition-[opacity,transform] duration-150",
        "data-[starting-style]:scale-95 data-[starting-style]:opacity-0",
        "data-[ending-style]:scale-95 data-[ending-style]:opacity-0",
        className
      )}
      {...props}
    />
  )
}

export type DialogTitleProps = Omit<React.ComponentProps<typeof SdkDialogTitle>, "className"> & {
  className?: string
}

export function DialogTitle({ className, ...props }: DialogTitleProps) {
  return <SdkDialogTitle className={cn("text-lg font-semibold text-default", className)} {...props} />
}

export type DialogDescriptionProps = Omit<React.ComponentProps<typeof SdkDialogDescription>, "className"> & {
  className?: string
}

export function DialogDescription({ className, ...props }: DialogDescriptionProps) {
  return <SdkDialogDescription className={cn("mt-1 text-sm text-muted", className)} {...props} />
}

/* Header·Footer는 UI SDK에도 대응 파트가 없다 — 원본과 같은 평범한 `<div>`다 */
export function DialogHeader({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  return <div className={cn("flex flex-col gap-1", className)} {...props} />
}

export function DialogFooter({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn("mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)}
      {...props}
    />
  )
}

export type DialogCloseProps = Omit<React.ComponentProps<typeof SdkDialogClose>, "className"> & {
  className?: string
}

/* 원본의 `OverlayClose`와 같다 — 자식이 없으면 우상단 X 아이콘 버튼이다.
 * `render`로 Button을 합성하면 `cn`(tailwind-merge)이 아니라 UI SDK의 `mergeProps`가
 * 클래스를 **이어 붙인다**. 원본(Base UI)도 이어 붙였으므로 결과는 같다. */
export function DialogClose({ className, children, "aria-label": ariaLabel, ...props }: DialogCloseProps) {
  return (
    <SdkDialogClose aria-label={ariaLabel ?? "닫기"} className={cn(closeButtonClassName, className)} {...props}>
      {children ?? <CloseIcon />}
    </SdkDialogClose>
  )
}
