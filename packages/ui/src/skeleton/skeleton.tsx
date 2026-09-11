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

/* `announce`가 끄는 것은 role·aria-busy·이름 셋 전부다. 그래서 끈 채로 이름을
 * 주는 것은 뜻이 없고, 그 모순은 런타임에 조용히 버려지는 대신 **타입이** 잡는다
 * — `announce={false}`와 `aria-label`은 함께 설 수 없다. */
type Announcing = {
  /** 이 Skeleton이 로딩을 **스스로** 알릴지. 기본 `true` — `role="status"` +
   * `aria-busy="true"` + 접근성 이름을 낸다(#321 전에 나간 인스턴스가 그리던
   * 바로 그것이라, 축을 여는 것이 가산 변경이다). */
  announce?: true
  /** 스크린 리더가 읽을 이름. 로딩 구간 전체를 대표하는 Skeleton 하나에만 준다
   * — 여러 개를 늘어놓았으면 나머지는 기본값 그대로 두 번 읽히지 않게 한다. */
  "aria-label"?: string
}

type Silent = {
  /** 감싸는 영역이 이미 로딩을 알리는 자리에서 `false`로 끈다 — role·aria-busy·
   * 이름을 하나도 내지 않아 접근성 트리에서 이름 없는 `div`로 남고, 스크린
   * 리더가 로딩을 두 번 읽지 않는다.
   *
   * Spinner는 같은 중복을 소비처가 `aria-hidden="true"`를 넘겨 푼다. 여기서
   * 축을 여는 이유는 둘이다: Skeleton은 콘텐츠가 없는 `div`라 선언을 **끄면**
   * 감출 것이 남지 않아 `aria-hidden`이 덮을 대상 자체가 없고(라이브 리전을
   * 선언한 채 감추는 모순도 피한다), 자리표시자는 보통 한 자리에 여럿이라
   * 소비처가 같은 속성을 개수만큼 되풀이하게 된다(#321). */
  announce: false
  "aria-label"?: never
}

export type SkeletonProps = Omit<React.ComponentPropsWithoutRef<"div">, "aria-label"> &
  (Announcing | Silent)

/**
 * 콘텐츠 구조를 예측할 수 있는 로딩 구간의 자리표시자.
 *
 * 기본은 `role="status"` + `aria-busy="true"`를 스스로 낸다 — 감싸는 영역이
 * 로딩을 알리길 기다리지 않는다. 실제 콘텐츠를 그대로 복제하는 접근성 이름은
 * 주지 않는다(`aria-label`은 "불러오는 중" 기본값을 그대로 둔다). 부모가 이미
 * 로딩을 알리는 자리는 `announce={false}`로 그 선언을 통째로 끈다.
 */
export function Skeleton({
  className,
  announce = true,
  "aria-label": ariaLabel = "불러오는 중",
  ...props
}: SkeletonProps) {
  return (
    <div
      role={announce ? "status" : undefined}
      aria-busy={announce ? true : undefined}
      aria-label={announce ? ariaLabel : undefined}
      className={cn(skeletonVariants(), className)}
      {...props}
    />
  )
}
