import { cva, type VariantProps } from "class-variance-authority"
import type * as React from "react"

import { cn } from "../lib/utils.js"

/* Base UI 뒤에 없다 — Spinner는 자체 스타일 primitive다(#290). 회전은
 * `animate-spin`(순수 CSS)뿐이라 이벤트 핸들러도 상태도 없다. 서버 컴포넌트로
 * 남는다 — test/package.test.mjs가 "./spinner"를 SERVER_SUBPATHS로 재고 지킨다.
 *
 * 크기는 Icon(icon.tsx)과 같은 스케일이다 — 텍스트·아이콘 옆에 놓여도 눈으로
 * 어긋나지 않는다. */
export const spinnerVariants = cva("shrink-0 animate-spin", {
  variants: {
    size: {
      sm: "size-3.5",
      md: "size-4",
      lg: "size-4.5",
    },
  },
  defaultVariants: { size: "md" },
})

export interface SpinnerProps
  extends Omit<React.SVGProps<SVGSVGElement>, "children">,
    VariantProps<typeof spinnerVariants> {}

/**
 * 완료량을 알 수 없는 짧은 대기 상태.
 *
 * 기본은 `role="status"` + `aria-label="로딩 중"`이라 혼자 놓여도 스크린
 * 리더가 읽는다. 이미 `aria-busy`를 스스로 내는 자리(Button의 `loading`처럼)에
 * 얹을 때는 `aria-hidden` 하나만 넘기면 된다 — role·aria-label은 그대로 두되
 * `aria-hidden="true"`가 접근성 트리에서 통째로 빼 두 번 읽히는 것을 막는다.
 */
export function Spinner({
  className,
  size,
  "aria-label": ariaLabel = "로딩 중",
  ...props
}: SpinnerProps) {
  return (
    <svg
      role="status"
      aria-label={ariaLabel}
      viewBox="0 0 16 16"
      fill="none"
      className={cn(spinnerVariants({ size }), className)}
      {...props}
    >
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
      <path d="M14.5 8A6.5 6.5 0 0 0 8 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
