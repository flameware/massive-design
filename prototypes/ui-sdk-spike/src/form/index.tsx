"use client"

import { cn } from "@flameware/ui/lib/utils"
import { useEffect, useRef } from "react"
import type * as React from "react"

import { FormErrorsContext, type FormErrors } from "./context"

/* #496 스파이크 — **UI SDK에는 Form이 없다.** 그래서 이 파일은 옮긴 것이 아니라
 * 새로 쓴 것이다(#496 판정 규칙: 대응 파트가 없으면 직접 만든다).
 *
 * Base UI Form이 지던 것 중 여기서 다시 지는 것은 셋이다.
 *   1. `errors` — 필드 이름 → 서버 오류. context로 내리고 Field가 읽는다.
 *   2. `onFormSubmit` — 필드 이름 → 값 맵을 받는 콜백. FormData에서 만든다.
 *   3. 서버 오류가 오면 첫 오류 컨트롤로 포커스를 옮기고 글자를 고른다. 원본을
 *      재어 보니 Base UI가 그렇게 했다(checks/form-behavior.mjs).
 *
 * 지지 않는 것: 네이티브 검증의 표시·첫 오류 포커스는 UI SDK Field가 스스로 한다.
 *
 * 원본과 갈리는 것: `onFormSubmit`의 값이 전부 FormData의 것(문자열·File)이다.
 * Base UI는 필드가 쥔 값(숫자·불리언·객체)을 그대로 넘겼다. `validationMode`·
 * `actionsRef`도 없다. */
export type FormProps = Omit<React.ComponentProps<"form">, "className"> & {
  className?: string
  errors?: FormErrors
  onFormSubmit?: (values: Record<string, FormDataEntryValue>, event: React.FormEvent<HTMLFormElement>) => void
}

export function Form({ className, errors, onFormSubmit, onSubmit, ...props }: FormProps) {
  const ref = useRef<HTMLFormElement>(null)
  useEffect(() => {
    if (!errors || Object.keys(errors).length === 0) return
    const control = ref.current?.querySelector<HTMLElement>("[aria-invalid=true]")
    control?.focus()
    if (control instanceof HTMLInputElement || control instanceof HTMLTextAreaElement) control.select()
  }, [errors])
  return (
    <FormErrorsContext.Provider value={errors}>
      <form
        ref={ref}
        className={cn("flex flex-col gap-4", className)}
        onSubmit={(event) => {
          onSubmit?.(event)
          if (!onFormSubmit || event.defaultPrevented) return
          event.preventDefault()
          onFormSubmit(Object.fromEntries(new FormData(event.currentTarget)), event)
        }}
        {...props}
      />
    </FormErrorsContext.Provider>
  )
}
