"use client"

import { Input as SdkInput } from "@ui-sdk/react/input"
import { fieldControlBase } from "@flameware/ui/lib/field-control"
import { cn } from "@flameware/ui/lib/utils"
import type * as React from "react"

/* #496 스파이크 — packages/ui/src/input/input.tsx를 UI SDK 위에 다시 세운다.
 * 클래스는 원본과 같다. `value`·`onValueChange`·`onBlur`·`ref`를 그대로 받으므로
 * React Hook Form의 Controller가 넘기는 props를 꽂는 통로도 그대로다. */
export type InputProps = Omit<React.ComponentProps<typeof SdkInput>, "className"> & { className?: string }

export function Input({ className, ...props }: InputProps) {
  return (
    <SdkInput
      className={cn("flex h-9 w-full min-w-0 rounded-md border px-3 text-sm", ...fieldControlBase, className)}
      {...props}
    />
  )
}
