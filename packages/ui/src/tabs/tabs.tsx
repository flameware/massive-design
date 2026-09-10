"use client"

import { Tabs as BaseTabs } from "@base-ui/react/tabs"
import { cva } from "class-variance-authority"
import type * as React from "react"

import { cn } from "../lib/utils.js"

/* Base UI의 기본값은 수동 활성화다 — 화살표로 초점만 옮기고 Enter·Space가
 * 선택한다(`activateOnFocus` 기본 `false`). 1세대와 소비처(invest diary)의
 * 기대는 자동 활성화(초점 이동 = 선택)이므로 여기서 기본값을 뒤집는다
 * (ADR-0023 §2, rules.md 의존성과 base — "Tabs' `activateOnFocus` defaulting
 * to manual against our shipped `automatic`"가 승계 손실로 적힌 바로 그 항목).
 * 소비처가 수동 활성화를 원하면 `activateOnFocus={false}`를 직접 넘긴다. */

const listVariants = cva([
  "inline-flex items-center gap-1 border-b",
  // 인디케이터가 목록 기준으로 절대 배치되므로 목록 자신이 기준선이 된다
  "relative",
])

export type TabsListProps = Omit<React.ComponentPropsWithoutRef<typeof BaseTabs.List>, "className"> & {
  className?: string
}

function TabsList({ className, activateOnFocus = true, ...props }: TabsListProps) {
  return <BaseTabs.List activateOnFocus={activateOnFocus} className={cn(listVariants(), className)} {...props} />
}

/* 면은 Button과 같은 규약을 따른다 — `.state`가 background-color의 유일한
 * 작성자다(#299). 선택 여부는 `data-active`(TabsTabDataAttributes)로 글자색만
 * 바꾼다: 밑줄은 Indicator가 그리므로 탭 자신은 색으로만 "선택됨"을 더 말한다. */
const tabVariants = cva([
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap",
  "px-3 py-2 text-sm font-medium text-muted rounded-t-md",
  "outline-offset-2 focus-visible:outline-2",
  "state transition-[background-color,color]",
  "data-active:text-default",
  "data-disabled:pointer-events-none data-disabled:opacity-50",
])

export type TabsTabProps = Omit<React.ComponentPropsWithoutRef<typeof BaseTabs.Tab>, "className"> & {
  className?: string
}

function TabsTab({ className, ...props }: TabsTabProps) {
  return <BaseTabs.Tab className={cn(tabVariants(), className)} {...props} />
}

const panelVariants = cva(["outline-offset-2 focus-visible:outline-2"])

export type TabsPanelProps = Omit<React.ComponentPropsWithoutRef<typeof BaseTabs.Panel>, "className"> & {
  className?: string
}

function TabsPanel({ className, ...props }: TabsPanelProps) {
  return <BaseTabs.Panel className={cn(panelVariants(), className)} {...props} />
}

/* 활성 탭의 위치·크기를 Base UI가 CSS 변수(--active-tab-left 등, TabsIndicatorCssVars)로
 * 계산해 준다 — DS는 그 변수를 읽어 밑줄만 그린다. `List`가 `relative`라
 * `absolute` 기준이 목록 자신이다. */
const indicatorVariants = cva([
  "absolute bottom-0 h-0.5 rounded-full bg-accent-solid",
  "transition-[translate,width] duration-150",
])

export type TabsIndicatorProps = Omit<React.ComponentPropsWithoutRef<typeof BaseTabs.Indicator>, "className"> & {
  className?: string
}

function TabsIndicator({ className, style, ...props }: TabsIndicatorProps) {
  return (
    <BaseTabs.Indicator
      className={cn(indicatorVariants(), className)}
      style={{
        left: 0,
        translate: "var(--active-tab-left) 0",
        width: "var(--active-tab-width)",
        ...style,
      }}
      {...props}
    />
  )
}

export type TabsRootProps = Omit<React.ComponentPropsWithoutRef<typeof BaseTabs.Root>, "className"> & {
  className?: string
}

function TabsRoot({ className, ...props }: TabsRootProps) {
  return <BaseTabs.Root className={cn(className)} {...props} />
}

/**
 * 탭. Base UI 위에서 기본값 하나만 뒤집는다 — 화살표 이동이 곧 선택이다
 * (자동 활성화). `Tab`은 `render`로 다른 요소를 받는다: 소비처의 탭 내비가
 * 라우트 링크면 `render={<Link href="/a" />}`로 앵커를 낸다(Button.render와
 * 같은 자리, PageShell이 이 통로를 쓴다).
 */
export const Tabs = {
  Root: TabsRoot,
  List: TabsList,
  Tab: TabsTab,
  Panel: TabsPanel,
  Indicator: TabsIndicator,
}
