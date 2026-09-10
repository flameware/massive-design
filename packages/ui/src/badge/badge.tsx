import { cva, type VariantProps } from "class-variance-authority"
import type * as React from "react"

import { cn } from "../lib/utils.js"

/* Base UI 뒤에 없다 — Badge는 자체 스타일 primitive다(#290). 서버 컴포넌트로
 * 남는다: 상태도 이벤트 핸들러도 없어 `"use client"`가 필요 없다.
 * test/package.test.mjs가 "./badge"를 SERVER_SUBPATHS로 재고 지킨다.
 *
 * 톤은 다섯이고, 색은 **대비 게이트가 이미 검증한 조합만** 쓴다
 * (packages/tokens/scripts/contrast.mjs TEXT_PAIRS) — `fg.default`는
 * `bg.neutral.soft` 위에서, `fg.{accent,danger,success,warning}`은 각자의
 * `bg.{family}.soft` 위에서 검증됐다. 검증 밖의 조합(예: `fg.muted` × 유채
 * soft)은 만들지 않는다. 도메인 값(매수·매도 등)을 톤 이름으로 추가하지
 * 않는다 — 소비처가 다섯 톤에 자기 의미를 매핑한다(rules.md 축과 이름 공간). */
export const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium",
  {
    variants: {
      tone: {
        neutral: "bg-neutral-soft text-default",
        accent: "bg-accent-soft text-accent",
        danger: "bg-danger-soft text-danger",
        success: "bg-success-soft text-success",
        warning: "bg-warning-soft text-warning",
      },
    },
    defaultVariants: { tone: "neutral" },
  }
)

export interface BadgeProps
  extends React.ComponentPropsWithoutRef<"span">,
    VariantProps<typeof badgeVariants> {}

/**
 * 짧은 분류·상태를 보조하는 태그.
 *
 * 이름을 나르지 않는다 — 곁에 놓인 텍스트가 이미 뜻을 말하는 자리에 쓴다.
 * Badge 혼자 정보의 유일한 출처가 되면(예: 아이콘만 있는 톤 표시) 스크린
 * 리더는 그 뜻을 읽지 못한다.
 */
export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />
}
