"use client"

import {
  Drawer as SdkDrawer,
  DrawerBackdrop as SdkDrawerBackdrop,
  DrawerClose as SdkDrawerClose,
  DrawerContent as SdkDrawerContent,
  DrawerDescription as SdkDrawerDescription,
  DrawerTitle as SdkDrawerTitle,
  DrawerTrigger as SdkDrawerTrigger,
} from "@ui-sdk/react/drawer"
import { CloseIcon, closeButtonClassName } from "@flameware/ui/dialog/close-icon"
import { cn } from "@flameware/ui/lib/utils"
import type * as React from "react"

/* #496 스파이크 — packages/ui/src/drawer/drawer.tsx를 UI SDK 위에 다시 세운다.
 *
 * 파트 이름은 평면형이고 UI SDK의 해부를 그대로 따른다(#496 결정 2):
 *
 *   Drawer
 *   ├── DrawerTrigger
 *   ├── DrawerBackdrop
 *   └── DrawerContent
 *       ├── DrawerTitle
 *       ├── DrawerDescription
 *       └── DrawerClose
 *
 * 원본과 갈리는 것:
 *   - `Portal`·`Viewport`가 없다. 뷰포트(`[data-slot=drawer-viewport]`)는 UI SDK가
 *     Content 바깥에 스스로 그리고 top layer(`popover="manual"`)에 올린다. 바닥 정렬도
 *     그 뷰포트가 진다 — 우리가 클래스를 줄 자리가 없다.
 *   - 열림/닫힘 전환(`translate-y-full`)을 뺐다. UI SDK Drawer는 시트를 **스스로**
 *     `translate`로 움직이고(스프링, 끌기와 같은 축) 배경의 opacity도 스스로 다룬다.
 *     Tailwind v4의 `translate-y-*`는 같은 `translate` 속성을 쓰므로 겹치면 싸운다.
 *     문서도 "translate와 backdrop opacity는 drawer에 맡겨라"고 적는다.
 *   - `initialFocus`를 강제하지 않는다. UI SDK의 기본값 `"auto"`가 이미 "첫 탭 대상"
 *     이다(터치로 열면 시트 자신 — 가상 키보드를 띄우지 않으려는 선택).
 *   - `Popup` → `Content`, `Root` → `Drawer`, `swipeDirection` → `side`.
 *
 * UI SDK에는 `DrawerHandle`이 있지만 **쓰지 않는다**. 그것은 스냅 포인트를 옮기는
 * 진짜 `<button>`이라(이름이 필요하고 탭 순서에 든다) 원본의 장식 손잡이와 다른
 * 물건이다. 원본처럼 `aria-hidden` div를 그린다 — 손잡이 축을 열지 않는다는 #455
 * 판정도 그대로다. */

export const Drawer = SdkDrawer

/* DialogTrigger와 같은 이유로 스타일이 없다 — `render`로 Button을 합성한다 */
export const DrawerTrigger = SdkDrawerTrigger

export type DrawerBackdropProps = Omit<React.ComponentProps<typeof SdkDrawerBackdrop>, "className"> & {
  className?: string
}

/* 색만 준다. opacity는 UI SDK가 시트의 진행(`--drawer-dim`)에 맞춰 직접 쓴다 */
export function DrawerBackdrop({ className, ...props }: DrawerBackdropProps) {
  return <SdkDrawerBackdrop className={cn("fixed inset-0 bg-scrim", className)} {...props} />
}

export type DrawerContentProps = Omit<React.ComponentProps<typeof SdkDrawerContent>, "className" | "children"> & {
  className?: string
  children?: React.ReactNode
}

export function DrawerContent({ className, children, ...props }: DrawerContentProps) {
  return (
    <SdkDrawerContent
      className={cn(
        "relative flex max-h-[85vh] w-full flex-col rounded-t-lg border bg-overlay shadow-lg outline-none",
        "pb-[max(1rem,env(safe-area-inset-bottom))]",
        className
      )}
      {...props}
    >
      {/* 잡는 손잡이 — 장식이다. 끌어서 닫기는 UI SDK가 Content 전체에 건다 */}
      <div aria-hidden="true" className="mx-auto mt-2 h-1.5 w-10 shrink-0 rounded-full bg-neutral-solid/40" />
      {children}
    </SdkDrawerContent>
  )
}

export type DrawerTitleProps = Omit<React.ComponentProps<typeof SdkDrawerTitle>, "className"> & {
  className?: string
}

export function DrawerTitle({ className, ...props }: DrawerTitleProps) {
  return <SdkDrawerTitle className={cn("px-4 pt-3 text-lg font-semibold text-default", className)} {...props} />
}

export type DrawerDescriptionProps = Omit<React.ComponentProps<typeof SdkDrawerDescription>, "className"> & {
  className?: string
}

export function DrawerDescription({ className, ...props }: DrawerDescriptionProps) {
  return <SdkDrawerDescription className={cn("mt-1 px-4 text-sm text-muted", className)} {...props} />
}

export type DrawerCloseProps = Omit<React.ComponentProps<typeof SdkDrawerClose>, "className"> & {
  className?: string
}

export function DrawerClose({ className, children, "aria-label": ariaLabel, ...props }: DrawerCloseProps) {
  return (
    // top-3 — 손잡이 바(mt-2 h-1.5)만큼 Dialog보다 한 칸 낮춘다(원본과 같다)
    <SdkDrawerClose
      aria-label={ariaLabel ?? "닫기"}
      className={cn(closeButtonClassName, "top-3", className)}
      {...props}
    >
      {children ?? <CloseIcon />}
    </SdkDrawerClose>
  )
}
