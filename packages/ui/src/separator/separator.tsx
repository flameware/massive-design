"use client"

import { Separator as BaseSeparator } from "@base-ui/react/separator"
import { cva, type VariantProps } from "class-variance-authority"
import type * as React from "react"

import { cn } from "../lib/utils.js"

/* 파트가 없는 primitive라 네임스페이스를 열지 않는다 — Button과 같은 모양이다
 * (ADR-0023 §5는 "파트가 있는" 컴포넌트에 네임스페이스를 요구한다). 축은
 * `orientation` 하나이고 Base UI가 그대로 내려보낸다. */
/* 선은 `bg-*`가 아니라 `border-*`로 긋는다 — `border.default`는 border-color
 * 이름공간에만 등록돼 있어서(tokens.css `@theme inline`) `bg-border-default`
 * 같은 클래스는 @theme에 없는 유틸리티라 조용히 무효가 된다(Color.mdx의
 * `border border-default` 예시가 같은 이유로 그 모양이다). */
export const separatorVariants = cva("shrink-0 border-default", {
  variants: {
    orientation: {
      horizontal: "h-0 w-full border-t",
      vertical: "h-full w-0 border-l",
    },
  },
  defaultVariants: { orientation: "horizontal" },
})

export interface SeparatorProps
  extends Omit<React.ComponentPropsWithoutRef<typeof BaseSeparator>, "className" | "orientation">,
    VariantProps<typeof separatorVariants> {
  className?: string
}

/**
 * 내용을 가르는 줄. 기본은 장식이라 스크린 리더가 읽지 않는다 — 의미가 있는
 * 구분(다른 절로 넘어간다는 것을 전해야 하는 자리)이면 소비처가 `role="separator"`가
 * 아니라 `aria-orientation`과 함께 실제 의미를 문서로 남긴다. Base UI가 렌더하는
 * `<div>` 자체는 장식 요소이지 대화형이 아니므로 포인터 하한(24px)이 걸리지 않는다.
 */
export function Separator({ className, orientation, ...props }: SeparatorProps) {
  return (
    <BaseSeparator
      orientation={orientation ?? undefined}
      className={cn(separatorVariants({ orientation }), className)}
      {...props}
    />
  )
}
