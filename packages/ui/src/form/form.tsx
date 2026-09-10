"use client"

import { Form as BaseForm, type FormProps as BaseFormProps } from "@base-ui/react/form"
import { cva } from "class-variance-authority"

import { cn } from "../lib/utils.js"

/* Field들을 묶고 제출·서버 오류 표시를 맡는다. `errors`는 필드 이름 → 오류
 * 문자열(들)의 맵이다 — 이름은 그 Field.Root의 `name`과 맞아야 하고, 맞는
 * 이름의 `Field.Error`가 그 문자열을 그대로 보여준다. DS는 매핑을 그대로
 * 통과시킬 뿐이고, 표시 자체는 Base UI Field가 진다(server-error 스토리 참고).
 *
 * 제출은 `onSubmit`(네이티브 이벤트) 또는 `onFormSubmit`(필드 이름→값 맵을
 * 직접 받는, `noValidate`와 자체 검증을 이미 거친 콜백) 둘 다 그대로 연다 —
 * 어느 쪽을 쓸지는 소비처가 고른다. */
export const formVariants = cva("flex flex-col gap-4")

export type FormProps<FormValues extends Record<string, unknown> = Record<string, unknown>> = Omit<
  BaseFormProps<FormValues>,
  "className"
> & {
  className?: string
}

/**
 * Field들을 묶는 `<form>`. RHF 등 DS 밖 라이브러리와는 `Field`의 `render`·
 * 제어 props 통로로 결합하고(field.tsx), Form은 제출과 서버 오류 표시만 진다.
 */
export function Form<FormValues extends Record<string, unknown> = Record<string, unknown>>({
  className,
  ...props
}: FormProps<FormValues>) {
  return <BaseForm className={cn(formVariants(), className)} {...props} />
}
