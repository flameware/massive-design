"use client"

import { Input as BaseInput } from "@base-ui/react/input"
import { cva } from "class-variance-authority"
import type * as React from "react"

import { cn } from "../lib/utils.js"

/* Base UI의 `Input`은 `Field.Control`이 `<input>`을 그리는 것과 같다(공식
 * 소스: `Field.Control`에 `ref`·나머지 props를 그대로 전달) — 그래서 Field 밖에
 * 홀로 두어도 동작하고, `Field.Root` 안에 두면 라벨·설명·오류가 자동으로
 * 연결된다. `value`·`onValueChange`·`onBlur`·`ref`를 그대로 받으므로 React
 * Hook Form의 `Controller`가 넘기는 필드 props를 그대로 펼쳐 꽂을 수 있다 —
 * DS는 RHF를 의존하지 않고, 이 통로만 열어 둔다(ADR-0023 §11). */
export const inputVariants = cva([
  "flex h-9 w-full min-w-0 rounded-md border border-field bg-inset px-3 text-sm text-default",
  "placeholder:text-muted",
  "outline-offset-2 focus-visible:outline-2",
  "transition-[border-color,box-shadow]",
  // Field.Root 안에서만 의미가 있다 — 밖에서는 이 data 속성이 없어 걸리지 않는다
  "data-invalid:border-danger",
  "data-disabled:pointer-events-none data-disabled:opacity-50",
])

export interface InputProps extends Omit<React.ComponentPropsWithoutRef<typeof BaseInput>, "className"> {
  className?: string
}

/**
 * `Field.Root` 안의 텍스트 입력. 라벨·설명·오류는 Field가 aria로 잇는다 — 이
 * 컴포넌트는 색과 상태 테두리만 진다.
 */
export function Input({ className, ...props }: InputProps) {
  return <BaseInput className={cn(inputVariants(), className)} {...props} />
}
