"use client"

import { cva, type VariantProps } from "class-variance-authority"
import type { LucideIcon as LucideIconComponent } from "lucide-react"
import type * as React from "react"

import { cn } from "../lib/utils.js"

/* 크기는 자유 값이 아니라 타이포 스케일에 물린 축이다(스토리 10) — 아이콘이
 * 텍스트 옆에 놓였을 때 눈으로 어긋나지 않아야 한다. sm은 text-sm(14px)과,
 * md는 text-base(16px, Button이 자기 svg에 이미 쓰는 기본값)와, lg는
 * text-lg(18px)와 짝을 맞췄다. Tailwind의 `size-*`는 --spacing(4px)의
 * 배수라 18px가 정수 배수로 안 떨어지지만, Tailwind v4의 spacing 스케일은
 * 소수 배수를 그대로 받는다 — `size-4.5` = 0.25rem × 4.5 = 18px. */
export const iconVariants = cva("shrink-0", {
  variants: {
    size: {
      sm: "size-3.5",
      md: "size-4",
      lg: "size-4.5",
    },
  },
  defaultVariants: { size: "md" },
})

export interface IconProps
  extends Omit<React.SVGProps<SVGSVGElement>, "children" | "className">,
    VariantProps<typeof iconVariants> {
  /** lucide-react 아이콘 컴포넌트. `import { Save } from "lucide-react"` 뒤 `icon={Save}` */
  icon: LucideIconComponent
  className?: string
}

/**
 * lucide 아이콘을 크기 토큰으로 감싼다.
 *
 * `lucide-react`는 peer다 — Icon을 쓰지 않는 소비처는 그 무게를 지지 않는다
 * (package.json의 `peerDependenciesMeta.lucide-react.optional`, ADR-0017 바닥값).
 *
 * 이름은 언제나 Icon 밖에 있다: 여기서는 기본으로 `aria-hidden`을 건다.
 * 아이콘이 유일한 이름인 자리(아이콘 전용 버튼 등)는 감싸는 요소가
 * `aria-label`을 진다 — Button의 `size="icon"` 스토리가 그 계약을 보여준다.
 */
export function Icon({ icon: LucideIconTag, size, className, ...props }: IconProps) {
  return (
    <LucideIconTag aria-hidden="true" className={cn(iconVariants({ size }), className)} {...props} />
  )
}
