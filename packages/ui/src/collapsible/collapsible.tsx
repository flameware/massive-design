"use client"

import { Collapsible as BaseCollapsible } from "@base-ui/react/collapsible"
import type * as React from "react"

import { cn } from "../lib/utils.js"

/* 네임스페이스형(ADR-0023 §5) — Base UI `Collapsible`의 Root·Trigger·Panel과
 * 1:1이다. 열림 상태(제어·비제어), `aria-expanded`·`aria-controls`, Enter·Space
 * 토글, 닫힌 Panel을 DOM에서 빼는 일은 전부 Base UI가 지고 여기는 스타일과
 * chevron만 진다(#486). `onOpenChange`는 사용자 조작에서만 불린다 — `open` prop이
 * 바뀐 것만으로는 불리지 않는다(Base UI 기본 동작).
 *
 * 목록 카드 안에 놓였을 때의 치수는 축이 아니라 card.css의 부모 선택자 규칙이다.
 * 그래서 Trigger의 여백·radius는 유틸리티로 내지 않고 collapsible.css의
 * `@layer components`에 둔다 — utilities 층이면 card.css 규칙을 이긴다. */

/* 면은 `.state`가 칠한다(#299) — 바탕이 없는 고스트라 쉬는 상태는 투명이다.
 * 글자는 목록 카드 머리와 같은 14px medium muted다. */
const TRIGGER = cn(
  "inline-flex items-center gap-2 text-start text-sm font-medium text-muted",
  "outline-offset-2 focus-visible:outline-2",
  "state transition-[background-color]",
  "data-disabled:pointer-events-none data-disabled:opacity-50"
)

/* 열린 Trigger는 `data-panel-open`을 낸다(Base UI CollapsibleTriggerDataAttributes).
 * `in-data-*`는 조상 선택자지만 chevron의 조상 중 그 속성을 내는 것은 자기
 * Trigger뿐이다 — 중첩된 Collapsible의 Panel은 바깥 Trigger의 형제라 새지 않는다. */
const ICON = cn(
  "size-4 shrink-0 transition-transform duration-150 ease-out",
  "in-data-panel-open:rotate-90 motion-reduce:transition-none"
)

/* 높이 전환은 Base UI가 재 주는 `--collapsible-panel-height`를 쓴다. 열린 뒤에는
 * Base UI가 그 값을 `auto`로 돌려 놓아 안의 내용이 바뀌어도 잘리지 않는다.
 * 시간은 scale.json의 duration.fast(150ms)를 `duration-150`으로 적고, 이징은
 * 승인된 ease-out이다(Tabs 인디케이터와 같은 방식). reduced-motion이면 전환 없이 바로 열리고 닫힌다. */
const PANEL = cn(
  "h-(--collapsible-panel-height) overflow-hidden",
  "transition-[height] duration-150 ease-out motion-reduce:transition-none",
  "data-starting-style:h-0 data-ending-style:h-0"
)

/** 파트 클래스 — cva 뒤에 있지 않아 test/collapsible.test.mjs가 여기서 직접 읽는다. */
export const collapsiblePartClassNames = { TRIGGER, ICON, PANEL }

export type CollapsibleRootProps = Omit<
  React.ComponentPropsWithoutRef<typeof BaseCollapsible.Root>,
  "className"
> & {
  className?: string
}

/** 열림 상태를 쥔다. `open`·`onOpenChange`로 앱이 관리하거나 `defaultOpen`으로
 * 맡긴다. 목록 카드(`Card.Root variant="list"`)의 직계 자식이면 card.css가 위
 * 구분선을 준다. */
function Root({ className, ...props }: CollapsibleRootProps) {
  return <BaseCollapsible.Root data-slot="collapsible" className={cn(className)} {...props} />
}

export type CollapsibleTriggerProps = Omit<
  React.ComponentPropsWithoutRef<typeof BaseCollapsible.Trigger>,
  "className"
> & {
  className?: string
}

/* chevron은 인라인 svg다 — Pagination·Menu와 같은 이유로 optional peer인
 * `lucide-react`를 끌어오지 않는다(ADR-0017 바닥값). 바꾸거나 끄는 축은 없다
 * (#486 범위 밖 — DS가 그린 장식을 끄는 축은 끄려는 앱이 실측될 때 연다). */
function ChevronIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className={ICON}>
      <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** 펼치고 접는 버튼. chevron을 직접 그리고 그 뒤에 children(라벨)을 둔다. 열리면
 * chevron이 90° 돈다. 목록 카드 안에서는 card.css가 `Card.Header`(list)와 같은
 * 위아래 12px · 좌우 카드 여백 · 폭 전체를 준다. */
function Trigger({ className, children, ...props }: CollapsibleTriggerProps) {
  return (
    <BaseCollapsible.Trigger data-slot="collapsible-trigger" className={cn(TRIGGER, className)} {...props}>
      <ChevronIcon />
      {children}
    </BaseCollapsible.Trigger>
  )
}

export type CollapsiblePanelProps = Omit<
  React.ComponentPropsWithoutRef<typeof BaseCollapsible.Panel>,
  "className"
> & {
  className?: string
}

/** 펼친 내용. 닫혀 있으면 DOM에서 빠져 접근성 트리와 탭 순서에 없다. 목록 카드
 * 안에서는 안의 `Card.Rows`가 위 구분선으로 머리와 나뉜다(card.css). */
function Panel({ className, ...props }: CollapsiblePanelProps) {
  return <BaseCollapsible.Panel data-slot="collapsible-panel" className={cn(PANEL, className)} {...props} />
}

/** `Collapsible.Root`·`Collapsible.Trigger`·`Collapsible.Panel` — 네임스페이스형
 * API(ADR-0023 §5). */
export const Collapsible = { Root, Trigger, Panel }
