"use client"

import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip"
import type * as React from "react"

import { cn } from "../lib/utils.js"

/* 네임스페이스형 — Root·Trigger·Portal·Positioner·Popup(ADR-0023 §5). Root는
 * 자기 엘리먼트가 없으므로 그대로 통과한다.
 *
 * 열림은 Base UI가 진다: 호버(delay 기본 600ms)와 포커스(지연 없음) 둘 다
 * 기본으로 연다 — 트리거에 손으로 onMouseEnter/onFocus를 달지 않는다. */
const Root = BaseTooltip.Root

export interface TooltipTriggerProps<Payload = unknown>
  extends Omit<React.ComponentPropsWithoutRef<typeof BaseTooltip.Trigger<Payload>>, "className"> {
  className?: string
}

/* 기본 모양은 고스트 버튼과 같은 자리다 — 상태 레이어만 쓰고 `bg-*`는 내지
 * 않는다(#299). Tooltip은 흔히 아이콘 하나만 감싸므로 `hit-area`로 24px
 * 하한을 진다. 소비처가 `render`로 이미 `Button`을 씌우면 그쪽이 하한을
 * 지므로 여기 겹쳐도 무해하다 — hit-area는 중심 대칭으로 넓히기만 한다. */
function Trigger<Payload = unknown>({ className, ...props }: TooltipTriggerProps<Payload>) {
  return (
    <BaseTooltip.Trigger
      className={cn(
        "hit-area inline-flex items-center justify-center rounded-sm outline-offset-2",
        "state transition-[background-color] focus-visible:outline-2",
        className
      )}
      {...props}
    />
  )
}

export interface TooltipPopupProps
  extends Omit<React.ComponentPropsWithoutRef<typeof BaseTooltip.Popup>, "className"> {
  className?: string
  /** Popup을 트리거 기준 어느 쪽에 둘지. Positioner로 그대로 넘어간다 */
  side?: React.ComponentPropsWithoutRef<typeof BaseTooltip.Positioner>["side"]
  sideOffset?: React.ComponentPropsWithoutRef<typeof BaseTooltip.Positioner>["sideOffset"]
}

/**
 * 말풍선 하나. `Positioner`·`Portal`을 소비처가 매번 조립하지 않도록 `Popup`
 * 안에서 함께 연다 — Menu·Dialog와 달리 Tooltip은 팝업이 언제나 하나뿐이라
 * 조립을 나눌 이유가 없다.
 *
 * 배경은 반전색(`bg-inverse`/`text-on-inverse`)이다 — 툴팁은 순간적으로 뜨는
 * 정보라 주위 표면과 구별되는 대비가 필요하고, `bg-surface`는 그 대비를
 * 만들지 못한다.
 */
function Popup({ className, side, sideOffset = 8, children, ...props }: TooltipPopupProps) {
  return (
    <BaseTooltip.Portal>
      {/* z-50은 Positioner가 진다 — Base UI의 TooltipPopup은 스스로
       * position을 걸지 않는 평범한 `<div>`라(node_modules/@base-ui/react/
       * tooltip/popup/TooltipPopup.js) z-index를 Popup에 얹으면 아무 효과가
       * 없다. 실제로 `position: absolute`로 배치되는 쪽은 Positioner다 —
       * Menu.Popup도 같은 이유로 Positioner에 건다(menu.tsx). */}
      <BaseTooltip.Positioner side={side} sideOffset={sideOffset} className="z-50">
        <BaseTooltip.Popup
          className={cn(
            "rounded-sm bg-inverse px-2 py-1 text-xs text-on-inverse shadow-md",
            "origin-[var(--transform-origin)] transition-[transform,opacity]",
            "data-[starting-style]:scale-95 data-[starting-style]:opacity-0",
            "data-[ending-style]:scale-95 data-[ending-style]:opacity-0",
            className
          )}
          {...props}
        >
          {children}
        </BaseTooltip.Popup>
      </BaseTooltip.Positioner>
    </BaseTooltip.Portal>
  )
}

export const Tooltip = { Root, Trigger, Popup }
