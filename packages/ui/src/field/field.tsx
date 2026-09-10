"use client"

import { Field as BaseField } from "@base-ui/react/field"
import { cva } from "class-variance-authority"
import type * as React from "react"

import { cn } from "../lib/utils.js"

/* 독립 Label은 없다 — `Field.Label`만 있다(ADR-0023 §2, rules.md 의존성과 base).
 *
 * `Field.Root`가 라벨·설명·오류를 컨트롤에 aria로 자동 연결한다: Label의
 * `htmlFor`/컨트롤의 `aria-labelledby`, Description의 `aria-describedby`, 그리고
 * invalid일 때만 Error가 `aria-describedby`에 더해지는 것까지 전부 Base UI
 * `Field.Root`의 컨텍스트가 만든다 — DS는 자리마다 색·간격만 입힌다. Input과
 * Textarea 둘 다 Base UI가 이미 Field와 짝지어 두었으므로(Control 참고) 이
 * 파일은 배선을 새로 놓지 않는다.
 *
 * `Field.Control`은 여기서 열지 않는다 — 컨트롤은 Input·Textarea가 각자의
 * 서브패스로 낸다(ADR-0023 §5, 네임스페이스형 API. 한 컴포넌트는 하나의
 * 서브패스에서 하나의 이름으로 나간다). */

const rootVariants = cva("flex flex-col gap-1.5")

export type FieldRootProps = Omit<React.ComponentPropsWithoutRef<typeof BaseField.Root>, "className"> & {
  className?: string
}

function FieldRoot({ className, ...props }: FieldRootProps) {
  return <BaseField.Root className={cn(rootVariants(), className)} {...props} />
}

const labelVariants = cva([
  "text-sm font-medium text-default select-none",
  "data-disabled:cursor-not-allowed data-disabled:opacity-50",
])

export type FieldLabelProps = Omit<React.ComponentPropsWithoutRef<typeof BaseField.Label>, "className"> & {
  className?: string
}

function FieldLabel({ className, ...props }: FieldLabelProps) {
  return <BaseField.Label className={cn(labelVariants(), className)} {...props} />
}

const descriptionVariants = cva("text-sm text-muted")

export type FieldDescriptionProps = Omit<
  React.ComponentPropsWithoutRef<typeof BaseField.Description>,
  "className"
> & {
  className?: string
}

function FieldDescription({ className, ...props }: FieldDescriptionProps) {
  return <BaseField.Description className={cn(descriptionVariants(), className)} {...props} />
}

/* Field.Error는 invalid가 아니면 스스로 아무것도 렌더하지 않는다(Base UI 내부
 * transition status) — DS는 그 위에 색만 얹는다. `match`를 소비처가 넘기지
 * 않으면 네이티브 ValidityState를 따른다(required 등), 넘기면(RHF의 `!!error`
 * 처럼) 외부 라이브러리가 표시 여부를 쥔다. */
const errorVariants = cva("text-sm text-danger")

export type FieldErrorProps = Omit<React.ComponentPropsWithoutRef<typeof BaseField.Error>, "className"> & {
  className?: string
}

function FieldError({ className, ...props }: FieldErrorProps) {
  return <BaseField.Error className={cn(errorVariants(), className)} {...props} />
}

export const Field = {
  Root: FieldRoot,
  Label: FieldLabel,
  Description: FieldDescription,
  Error: FieldError,
}
