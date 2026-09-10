"use client"

import { Field as BaseField } from "@base-ui/react/field"
import { cva } from "class-variance-authority"
import type * as React from "react"

import { fieldControlBase } from "../lib/field-control.js"
import { cn } from "../lib/utils.js"

/* Base UI에 독립 Textarea가 없다. `Input`이 실은 `Field.Control`이 `<input>`을
 * 그리는 것뿐이듯(input.tsx), Textarea는 같은 `Field.Control`에 `render`로
 * `<textarea>`를 앉힌다 — Button이 `render`로 `<a>`를 받는 것과 같은 자리다
 * (button.tsx). `Field.Root` 안에서는 Input과 똑같이 라벨·설명·오류가 자동으로
 * 연결되고, `value`·`onValueChange`·`onBlur`·`ref`도 그대로 받는다.
 *
 * `Field.Control`의 타입은 `<input>` 기준이라 `rows`·`cols`가 없다. 실제로는
 * `render`가 무엇을 그리든 `useRenderElement`가 남은 props를 그 요소에 그대로
 * 얹으므로(FieldControl.js), 타입만 한 번 잘라낸다 — 런타임 배선은 그대로다.
 *
 * 밑그림은 Input과 공유한다(lib/field-control.ts) — 여기 남는 것은 여러 줄
 * 입력만의 치수(최소 높이·리사이즈)뿐이다. */
export const textareaVariants = cva([
  "flex min-h-20 w-full rounded-md border px-3 py-2 text-sm resize-y",
  ...fieldControlBase,
])

export interface TextareaProps extends Omit<React.ComponentPropsWithoutRef<"textarea">, "className"> {
  className?: string
  render?: React.ComponentPropsWithoutRef<typeof BaseField.Control>["render"]
}

/**
 * `Field.Root` 안의 여러 줄 입력. Input과 짝인 컨트롤 — 라벨·설명·오류는
 * Field가 aria로 잇는다.
 */
export function Textarea({ className, render, ...props }: TextareaProps) {
  return (
    <BaseField.Control
      render={render ?? <textarea />}
      className={cn(textareaVariants(), className)}
      {...(props as React.ComponentPropsWithoutRef<"input">)}
    />
  )
}
