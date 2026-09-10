import { cva, type VariantProps } from "class-variance-authority"
import type * as React from "react"

import { cn } from "../lib/utils.js"

/* Base UI 뒤에 없다 — Text·Heading은 자체 스타일 primitive다(#290). 상태도
 * 이벤트 핸들러도 없어 서버 컴포넌트로 남는다 — test/package.test.mjs가
 * "./text"를 SERVER_SUBPATHS로 재고 지킨다.
 *
 * 크기 축의 값 이름은 Foundations 타이포 챕터(apps/storybook/stories/
 * foundations/Typography.mdx)의 이름과 같다 — Tailwind 정본 사이즈 이름
 * 그대로이고 신규 어휘는 0개다. 줄 높이·자간은 tokens.css의 `--text-*--
 * line-height`·`--text-*--letter-spacing`가 이미 튜닝해 뒀으므로(#280)
 * `text-{size}` 하나가 셋을 같이 옮긴다. **여기 아홉 개가 소비처가 가질 수
 * 있는 크기 전부다** — 임의 `text-*`가 앱에 흩어지는 것을 막는 것이 이
 * 컴포넌트의 존재 이유이므로, `className`으로 다른 `text-*`를 얹어도
 * twMerge가 마지막 값을 이기게 두지 않는다(ADR-0023 §6은 선언을 검증하는
 * 도구를 만들지 말라고 하지만, 이 축만은 코드 자체가 값을 아홉 개로 좁혀
 * 검증이 필요 없다 — 타입이 막는다). */
const SIZES = ["xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl", "5xl"] as const

export type TypeSize = (typeof SIZES)[number]

const sizeVariants = {
  xs: "text-xs",
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
  "3xl": "text-3xl",
  "4xl": "text-4xl",
  "5xl": "text-5xl",
} as const

export const textVariants = cva("", {
  variants: { size: sizeVariants },
  defaultVariants: { size: "sm" },
})

type TextTag = "p" | "span" | "div" | "label"

/* 네 태그의 이벤트 핸들러 시그니처가 갈려서(label만 HTMLLabelElement) 하나의
 * ComponentPropsWithoutRef<T>로 합치면 타입이 좁혀지지 않는다. 여기서 받는
 * 것은 태그 무관 공통 속성(className·id·children·aria-* 등)뿐이므로
 * HTMLAttributes<HTMLElement>로 충분하다 — 태그별 전용 속성(label의
 * `htmlFor` 등)이 필요하면 `as="label"`이 아니라 Field.Label을 쓴다. */
export interface TextProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof textVariants> {
  /** 렌더할 태그. 문단이 아닌 자리(목록 행의 값 등)는 `span`을 쓴다. 기본 `p` */
  as?: TextTag
}

/** 본문 텍스트. 기본 크기는 `sm`(14px) — 본문 UI에서 가장 흔한 크기다. */
export function Text({ as: Tag = "p", size, className, ...props }: TextProps) {
  return <Tag className={cn(textVariants({ size }), className)} {...props} />
}

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6

/** 레벨마다의 기본 크기 — 소비처가 `size`를 안 주면 이 값을 쓴다. 레벨(접근성
 * 트리의 제목 순서)과 크기(시각)를 갈라 둔 것이 이 매핑이 존재하는 이유다:
 * 문서 구조상 h3여야 하지만 시각적으로는 더 커야 하는 자리가 실제로 있다
 * (예: 카드 안의 단독 제목). */
const LEVEL_DEFAULT_SIZE: Record<HeadingLevel, TypeSize> = {
  1: "3xl",
  2: "2xl",
  3: "xl",
  4: "lg",
  5: "base",
  6: "sm",
}

export interface HeadingProps
  extends React.ComponentPropsWithoutRef<"h1">,
    VariantProps<typeof textVariants> {
  /** 문서 구조상의 제목 레벨(h1~h6). 기본 2 — 페이지 제목(h1)은 Page shell이 진다 */
  level?: HeadingLevel
}

/**
 * 제목. `level`이 태그(h1~h6, 접근성 트리)를, `size`가 크기(시각)를 따로
 * 정한다 — 보통은 같이 움직이므로 `size`를 생략하면 `level`의 기본 크기를
 * 쓴다.
 */
export function Heading({ level = 2, size, className, ...props }: HeadingProps) {
  const Tag = `h${level}` as const
  return (
    <Tag className={cn(textVariants({ size: size ?? LEVEL_DEFAULT_SIZE[level] }), "font-semibold", className)} {...props} />
  )
}
