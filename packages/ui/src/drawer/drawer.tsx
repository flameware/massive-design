"use client"

import { Drawer as BaseDrawer } from "@base-ui/react/drawer"
import type * as React from "react"

import { CloseIcon, closeButtonClassName } from "../dialog/close-icon.js"
import { cn } from "../lib/utils.js"

/* Dialog의 데스크톱 대체가 아니라 모바일의 **바닥 시트**다(#284) — Base UI
 * v1.8이 `@base-ui/react/drawer`로 별도 프리미티브를 준다: Dialog의 파츠를
 * 재수출하는 AlertDialog와 달리, Drawer는 자기 파츠(Popup·Content·Handle…)를
 * 따로 갖고 스와이프 닫기·스냅 포인트를 스스로 다룬다 — 그래서 dialog/shared.tsx를
 * 끌어오지 않고 여기서 다시 칠한다. `swipeDirection` 기본값이 `'down'`이라
 * 바닥에서 내려서 닫는 동작이 기본으로 켜진다.
 *
 * Phase 1은 `Root`·`Trigger`·`Portal`·`Backdrop`·`Viewport`·`Popup`·`Title`·
 * `Description`·`Close`만 편다. `Provider`·`Indent`·`IndentBackground`(열린
 * 동안 뒤 페이지를 밀어 넣는 iOS식 효과)와 `SwipeArea`(가장자리를 쓸어 여는
 * 제스처)는 소비처(invest diary)가 아직 요구하지 않아 빼뒀다 — 필요가 확인되면
 * 더한다. */

export const Drawer = {
  Root: BaseDrawer.Root,
  /* Dialog.Trigger와 같은 이유로 스타일이 없다 — `render`로 Button을 합성한다 */
  Trigger: BaseDrawer.Trigger,
  Portal: BaseDrawer.Portal,
  Backdrop: DrawerBackdrop,
  Viewport: DrawerViewport,
  Popup: DrawerPopup,
  Title: DrawerTitle,
  Description: DrawerDescription,
  Close: DrawerClose,
}

function DrawerBackdrop({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof BaseDrawer.Backdrop>) {
  return (
    <BaseDrawer.Backdrop
      className={cn(
        "fixed inset-0 z-50 bg-scrim transition-opacity duration-150",
        "data-[starting-style]:opacity-0 data-[ending-style]:opacity-0",
        className
      )}
      {...props}
    />
  )
}

/* 가운데로 모으는 Dialog.Viewport와 다르게 바닥으로 붙인다 — `justify-end`가
 * Popup을 화면 아래 가장자리에 놓고, Popup의 `w-full`이 폭을 채운다. */
function DrawerViewport({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof BaseDrawer.Viewport>) {
  return (
    <BaseDrawer.Viewport
      className={cn("fixed inset-0 z-50 flex flex-col justify-end", className)}
      {...props}
    />
  )
}

function DrawerPopup({
  className,
  children,
  initialFocus = true,
  ...props
}: React.ComponentPropsWithoutRef<typeof BaseDrawer.Popup>) {
  return (
    <BaseDrawer.Popup
      // Base UI의 실제 기본값(구현 확인, DrawerPopup.mjs)은 `initialFocus`가
      // `undefined`일 때 **팝업 자신**에 포커스를 준다 — 가상 키보드가 열자마자
      // 뜨는 것을 막으려는 선택으로 보인다. Dialog는 "첫 탭 대상"이 기본이라
      // 둘의 기본값이 다르다. #284의 키보드 계약("열면 포커스가 안으로")은
      // Dialog·Drawer가 같은 모양이길 요구하므로, 여기서 명시적으로 `true`를
      // 줘 첫 탭 대상으로 통일한다 — 소비처가 다른 값을 넘기면 그대로 이긴다.
      initialFocus={initialFocus}
      className={cn(
        "relative flex max-h-[85vh] w-full flex-col rounded-t-xl border bg-overlay shadow-lg outline-none",
        "pb-[max(1rem,env(safe-area-inset-bottom))]",
        "transition-transform duration-200",
        "data-[starting-style]:translate-y-full data-[ending-style]:translate-y-full",
        className
      )}
      {...props}
    >
      {/* 잡는 손잡이 — 장식이다. 실제 스와이프 닫기는 Root의 swipeDirection이
       * Popup 전체에 이미 걸어 둔다 */}
      <div aria-hidden="true" className="mx-auto mt-2 h-1.5 w-10 shrink-0 rounded-full bg-neutral-solid/40" />
      {children}
    </BaseDrawer.Popup>
  )
}

function DrawerTitle({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof BaseDrawer.Title>) {
  return <BaseDrawer.Title className={cn("px-4 pt-3 text-lg font-semibold text-default", className)} {...props} />
}

function DrawerDescription({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof BaseDrawer.Description>) {
  return <BaseDrawer.Description className={cn("mt-1 px-4 text-sm text-muted", className)} {...props} />
}

function DrawerClose({
  className,
  children,
  "aria-label": ariaLabel,
  ...props
}: React.ComponentPropsWithoutRef<typeof BaseDrawer.Close>) {
  return (
    // top-3 — Popup의 손잡이 바(mt-2 h-1.5)만큼 Dialog보다 한 칸 낮춘다.
    // `cn`이 tailwind-merge라 뒤에 온 `top-3`가 closeButtonClassName의
    // `top-4`를 정상적으로 덮는다
    <BaseDrawer.Close
      aria-label={ariaLabel ?? "닫기"}
      className={cn(closeButtonClassName, "top-3", className)}
      {...props}
    >
      {children ?? <CloseIcon />}
    </BaseDrawer.Close>
  )
}
