import { cva, type VariantProps } from "class-variance-authority"
import type * as React from "react"

import { cn } from "../lib/utils.js"

/* Base UI 뒤에 없다 — Card는 자체 스타일 primitive다(스펙 #283). 서버 컴포넌트로
 * 남는다: 상태도 이벤트 핸들러도 없어 `"use client"`가 필요 없다. 이 경계는
 * test/package.test.mjs가 "./card"를 SERVER_SUBPATHS로 재고 지킨다.
 *
 * 그림자는 강제하지 않는다(ADR-0023 §11 "그림자 토큰은 있되 강제하지 않는다" —
 * 스토리 12). `border`와 `bg-surface`만으로 면을 뗀다 — shadow-* 유틸리티는
 * 여기서 내지 않고, 필요하면 소비처가 className으로 얹는다. */
export const cardVariants = cva(
  "flex flex-col gap-6 rounded-xl border border-default bg-surface py-6 text-default",
  { variants: {}, defaultVariants: {} }
)

export interface CardRootProps
  extends React.ComponentPropsWithoutRef<"div">,
    VariantProps<typeof cardVariants> {}

function Root({ className, ...props }: CardRootProps) {
  return <div className={cn(cardVariants(), className)} {...props} />
}

const HEADER = "flex flex-col gap-1.5 px-6"
const BODY = "px-6"
const FOOTER = "flex items-center gap-2 px-6"

export interface CardPartProps extends React.ComponentPropsWithoutRef<"div"> {}

/** 제목·설명 같은 안내문이 놓이는 자리. 세로 간격은 Root의 `gap-6`이 다른
 * 파트와의 사이를 벌리고, Header 안에서는 `gap-1.5`로 더 좁게 묶는다. */
function Header({ className, ...props }: CardPartProps) {
  return <div className={cn(HEADER, className)} {...props} />
}

/** 카드의 본문. 파트를 하나만 쓰는 카드(Header 없이 Body만)도 흔하므로 세로
 * 여백은 Root가 지고 Body는 가로 여백만 진다. */
function Body({ className, ...props }: CardPartProps) {
  return <div className={cn(BODY, className)} {...props} />
}

/** 동작이 놓이는 자리 — 대개 Button. Button을 여기서 import해 기본 variant를
 * 먹이지 않는다: 그 결정은 소비처의 몫이고, 먹이면 Button의 상태 사다리가
 * 이 자리에서만 갈린다(rules.md 의존성과 base, Button의 같은 판단 참고). */
function Footer({ className, ...props }: CardPartProps) {
  return <div className={cn(FOOTER, className)} {...props} />
}

/** `Card.Root`·`Card.Header`·`Card.Body`·`Card.Footer` — 네임스페이스형
 * API(ADR-0023 §5)다. 셋 다 옵셔널이라 Body 하나만 쓰는 카드도 유효하다. */
export const Card = { Root, Header, Body, Footer }
