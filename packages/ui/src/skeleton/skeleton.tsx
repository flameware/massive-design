import { cva } from "class-variance-authority"
import type * as React from "react"

import { cn } from "../lib/utils.js"

/* Base UI 뒤에 없다 — Skeleton은 자체 스타일 primitive다(#290). `animate-pulse`
 * 하나뿐이라 이벤트 핸들러도 상태도 없다. 서버 컴포넌트로 남는다 —
 * test/package.test.mjs가 "./skeleton"을 SERVER_SUBPATHS로 재고 지킨다.
 *
 * 크기와 모양은 전부 소비처의 className이 진다 — `<Skeleton className="h-4
 * w-32" />`. Skeleton 자신은 모양을 하나도 정하지 않는다(원·사각·줄 모두
 * 같은 컴포넌트) — 최종 콘텐츠의 레이아웃을 흉내 내는 것이 소비처의 일이기
 * 때문이다. */
export const skeletonVariants = cva("animate-pulse rounded-md bg-subtle")

export interface SkeletonProps extends React.ComponentPropsWithoutRef<"div"> {
  /** 스크린 리더가 읽을 이름. 로딩 구간 전체를 대표하는 Skeleton 하나에만 준다
   * — 여러 개를 늘어놓았으면 나머지는 기본값 그대로 두 번 읽히지 않게 한다. */
  "aria-label"?: string
}

/**
 * 콘텐츠 구조를 예측할 수 있는 로딩 구간의 자리표시자.
 *
 * `role="status"` + `aria-busy="true"`를 스스로 낸다 — 감싸는 영역이 로딩을
 * 알리길 기다리지 않는다. 실제 콘텐츠를 그대로 복제하는 접근성 이름은 주지
 * 않는다(`aria-label`은 "불러오는 중" 기본값을 그대로 둔다).
 */
export function Skeleton({ className, "aria-label": ariaLabel = "불러오는 중", ...props }: SkeletonProps) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={ariaLabel}
      className={cn(skeletonVariants(), className)}
      {...props}
    />
  )
}
