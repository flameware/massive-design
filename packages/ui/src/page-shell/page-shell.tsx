"use client"

import type * as React from "react"

import { cn } from "../lib/utils.js"
import { Tabs } from "../tabs/tabs.js"

/* Patterns 층의 첫 조립이다(ADR-0023 §7·Phase 표) — 상단 헤더(좌우 슬롯) + 탭
 * 내비 + 본문 폭. 탭 내비는 새로 그리지 않고 `Tabs`를 그대로 쓴다: 조립은
 * 원본을 그대로 쓴다는 규칙(rules.md "composed component consumes the
 * original")이 1세대 문항이긴 하지만 여기서도 같은 이유로 성립한다 — 자동
 * 활성화 키보드 계약을 복제하면 갈라질 자리가 생긴다.
 *
 * 소비처의 탭 내비가 라우트 링크면 `item.render`로 `<Link href="…" />`를
 * 넘긴다 — `Tabs.Tab`이 `Button`과 같은 자리에서 그것을 받는다(Base UI
 * `render` prop, tabs.tsx 참고). */
export interface PageShellNavItem {
  /** `Tabs.Root`의 value와 같은 이름 공간. 라우트라면 보통 경로 문자열 */
  value: string
  label: React.ReactNode
  /** 라우트 링크로 렌더할 때 넘긴다. 예: `<Link href="/portfolio" />` */
  render?: React.ReactElement
  disabled?: boolean
}

export interface PageShellNav {
  items: PageShellNavItem[]
  /** 지금 활성 탭의 값. 제어 컴포넌트다 — 라우팅 상태를 소비처가 쥔다 */
  value: string
  onValueChange: (value: string) => void
}

export interface PageShellProps {
  /** 헤더 좌우 슬롯. 왼쪽은 보통 로고·타이틀, 오른쪽은 테마 토글·사용자 메뉴 */
  header?: {
    left?: React.ReactNode
    right?: React.ReactNode
  }
  nav: PageShellNav
  children: React.ReactNode
  className?: string
  /** 헤더·탭·본문이 공유하는 최대 폭. 기본은 `max-w-6xl`(대시보드 표준 폭) */
  contentWidthClassName?: string
}

/**
 * 대시보드 셸 — 상단 헤더 + 탭 내비 + 본문 폭.
 *
 * 헤더·탭·본문이 같은 최대 폭 안에서 정렬된다. 좁은 화면(모바일)에서는 탭이
 * 가로 스크롤로 넘어가고 헤더 슬롯은 줄바꿈 없이 줄어든다 — 데스크톱·모바일
 * 둘 다 한 스토리에서 본다(PageShell.stories의 Responsive).
 */
export function PageShell({ header, nav, children, className, contentWidthClassName }: PageShellProps) {
  const widthClass = contentWidthClassName ?? "max-w-6xl"

  return (
    <div className={cn("flex min-h-screen flex-col bg-surface", className)}>
      <header className="border-b bg-surface">
        <div className={cn("mx-auto flex w-full items-center justify-between gap-4 px-4 py-3", widthClass)}>
          <div className="flex min-w-0 items-center gap-3">{header?.left}</div>
          <div className="flex shrink-0 items-center gap-2">{header?.right}</div>
        </div>
        <Tabs.Root value={nav.value} onValueChange={(value) => nav.onValueChange(String(value))}>
          <Tabs.List className={cn("mx-auto w-full overflow-x-auto border-b-0 px-4", widthClass)}>
            {nav.items.map((item) => (
              <Tabs.Tab key={item.value} value={item.value} disabled={item.disabled} render={item.render}>
                {item.label}
              </Tabs.Tab>
            ))}
            <Tabs.Indicator />
          </Tabs.List>
        </Tabs.Root>
      </header>
      <main className={cn("mx-auto w-full flex-1 px-4 py-6", widthClass)}>{children}</main>
    </div>
  )
}
