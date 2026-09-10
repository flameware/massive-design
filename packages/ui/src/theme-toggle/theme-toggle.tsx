"use client"

import type { LucideIcon } from "lucide-react"
import type * as React from "react"

import { Button, type ButtonProps } from "../button/button.js"
import { Icon } from "../icon/icon.js"
import { cn } from "../lib/utils.js"

export type Theme = "light" | "dark"

export interface ThemeToggleProps
  extends Omit<ButtonProps, "variant" | "size" | "children" | "onClick" | "render"> {
  /** 지금 켜진 테마. `next-themes`의 `theme`(또는 `resolvedTheme`)를 그대로 넘긴다 */
  theme: Theme
  /** 테마를 바꾸는 setter. `next-themes`의 `setTheme`과 시그니처가 같다 */
  onThemeChange: (theme: Theme) => void
  /** 라이트로 전환할 때 그릴 아이콘. 기본은 lucide `Sun` */
  lightIcon?: LucideIcon
  /** 다크로 전환할 때 그릴 아이콘. 기본은 lucide `Moon` */
  darkIcon?: LucideIcon
  className?: string
}

/**
 * 라이트/다크 전환 버튼.
 *
 * Toggle 프리미티브(#288)를 쓰지 않는다 — 상태가 두 값(라이트/다크) 중 하나를
 * **바꿔 부르는** 동작이지 눌린 채로 남는 폼 값이 아니고, 겨우 아이콘 버튼
 * 하나를 위해 컴포넌트 경계를 넘어 의존을 지지 않는다(ADR-0017 바닥값). 대신
 * `Button`에 `aria-pressed`를 얹는다 — WAI-ARIA의 토글 버튼 패턴 그대로다.
 *
 * `next-themes`를 peer로 두지 않는다 — `theme`과 `onThemeChange`만 받는
 * 좁은 자리이므로 `next-themes`의 `useTheme()`이 반환하는 `theme`(또는
 * `resolvedTheme`)·`setTheme`을 그대로 꽂으면 된다:
 *
 * ```tsx
 * const { resolvedTheme, setTheme } = useTheme()
 * <ThemeToggle theme={resolvedTheme === "dark" ? "dark" : "light"} onThemeChange={setTheme} />
 * ```
 *
 * `dark` 클래스 전환(#280)과 별개다 — 이 컴포넌트는 클래스를 만지지 않고
 * 상태만 읽고 알린다. 클래스를 `<html>`에 앉히는 것은 `next-themes`(또는
 * 그것과 같은 자리에 선 소비처 코드)의 몫이다.
 */
export function ThemeToggle({
  theme,
  onThemeChange,
  lightIcon: LightIcon = DefaultSunIcon,
  darkIcon: DarkIcon = DefaultMoonIcon,
  className,
  "aria-label": ariaLabel,
  ...props
}: ThemeToggleProps) {
  const isDark = theme === "dark"
  const label = ariaLabel ?? (isDark ? "라이트 모드로 전환" : "다크 모드로 전환")

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={label}
      aria-pressed={isDark}
      onClick={() => onThemeChange(isDark ? "light" : "dark")}
      className={cn(className)}
      {...props}
    >
      <Icon icon={isDark ? DarkIcon : LightIcon} />
    </Button>
  )
}

/* 기본 아이콘. lucide-react는 optional peer(icon.tsx와 같은 이유, ADR-0017)라
 * 여기서 직접 `lucide-react`를 import하지 않는다 — svg를 인라인으로 둔다.
 * Icon 래퍼(`aria-hidden`)로 감싸 이름이 오직 버튼의 `aria-label`에만 있게
 * 한다. 소비처가 `lightIcon`·`darkIcon`으로 lucide 아이콘 컴포넌트를 직접
 * 넘기면 그쪽이 우선한다. */
const DefaultSunIcon: LucideIcon = Object.assign(
  function SunGlyph(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...props}>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      </svg>
    )
  },
  { displayName: "Sun" }
) as LucideIcon

const DefaultMoonIcon: LucideIcon = Object.assign(
  function MoonGlyph(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401" />
      </svg>
    )
  },
  { displayName: "Moon" }
) as LucideIcon
