import { cva, type VariantProps } from "class-variance-authority"
import type * as React from "react"

import { cn } from "../lib/utils.js"

/* Base UI 뒤에 없다 — Spinner는 자체 스타일 primitive다(#290). 회전은
 * `animate-spin`(순수 CSS)뿐이라 이벤트 핸들러도 상태도 없다. 서버 컴포넌트로
 * 남는다 — test/package.test.mjs가 "./spinner"를 SERVER_SUBPATHS로 재고 지킨다.
 *
 * `sm`·`md`·`lg`는 Icon(icon.tsx)과 같은 스케일이다 — 텍스트·아이콘 옆에
 * 놓여도 눈으로 어긋나지 않는다. `xl`(size-8 = 32px)은 그 셋과 다른 자리를
 * 위한 것이다: 전체 화면 대기(#351, invest diary가 손조립하며 드러난 자리
 * 3곳)는 글자 곁이 아니라 화면 한가운데 혼자 서므로, 타이포 스케일에 물리지
 * 않는다. 기존 세 값과 기본값은 바꾸지 않는다 — 가산이다.
 *
 * `tone`은 #369가 연다 — 소비처(invest diary)가 `text-accent` 3 · `text-muted`
 * 3자리로 색을 손으로 얹던 자리다. 값 이름은 `Badge`·`Text`·`Alert`와 같은
 * 이름 공간을 쓴다(ADR-0008 — 축 이름이 카탈로그에서 이미 뜻이 있으면 값
 * 이름도 그 축을 따른다). 실측 수요가 `accent`·`muted` 둘뿐이라 그 둘만 연다
 * (rules.md: 차원을 더하는 데는 실측된 수요가 필요하다). 기본값 `inherit`는
 * #366이 이미 판정했다 — `<Spinner>`가 `stroke="currentColor"`로 그리므로
 * 지금 색 클래스가 전혀 없는 것 자체가 "부모 색 상속"이라는 값이고, 톤을
 * 명시하지 않은 게시 인스턴스 전부가 그대로 유지된다. */
export const spinnerVariants = cva("shrink-0 animate-spin", {
  variants: {
    size: {
      sm: "size-3.5",
      md: "size-4",
      lg: "size-4.5",
      xl: "size-8",
    },
    tone: {
      inherit: "",
      accent: "text-accent",
      muted: "text-muted",
    },
  },
  defaultVariants: { size: "md", tone: "inherit" },
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
  tone,
  "aria-label": ariaLabel = "로딩 중",
  ...props
}: SpinnerProps) {
  return (
    <svg
      role="status"
      aria-label={ariaLabel}
      viewBox="0 0 16 16"
      fill="none"
      className={cn(spinnerVariants({ size, tone }), className)}
      {...props}
    >
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
      <path d="M14.5 8A6.5 6.5 0 0 0 8 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
