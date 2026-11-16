"use client"

import {
  Field as SdkField,
  FieldDescription as SdkFieldDescription,
  FieldError as SdkFieldError,
  FieldLabel as SdkFieldLabel,
} from "@ui-sdk/react/field"
import { cn } from "@flameware/ui/lib/utils"
import { createContext, useContext, useEffect, useState } from "react"
import type * as React from "react"

import { FormErrorsContext } from "../form/context"

/* #496 스파이크 — packages/ui/src/field/field.tsx를 UI SDK 위에 다시 세운다.
 *
 * 파트 이름은 평면형이다(#496 결정 2): `Field`·`FieldLabel`·`FieldDescription`·
 * `FieldError`. 클래스 문자열은 원본과 글자 그대로 같다.
 *
 * 원본과 갈리는 것:
 *   - `touched`·`dirty`·`validationMode`·`validate` prop이 없다. UI SDK Field가
 *     받는 것은 `name`·`disabled`·`invalid` 셋뿐이다.
 *   - 서버 오류(Form의 `errors`)를 이 파일이 직접 잇는다. UI SDK에는 Form이
 *     없으므로 "이름이 맞는 Field가 그 문자열을 보여 준다"는 배선이 기반에 없다.
 */

/* Form이 내려 준 이 필드의 서버 오류 문구. 없으면 undefined다 */
const ServerErrorContext = createContext<string | undefined>(undefined)

type SdkFieldProps = React.ComponentProps<typeof SdkField>

export type FieldProps = Omit<SdkFieldProps, "className"> & { className?: string }

export function Field({ className, name, invalid, onInput, ...props }: FieldProps) {
  const errors = useContext(FormErrorsContext)
  const raw = name === undefined ? undefined : errors?.[name]
  const message = Array.isArray(raw) ? raw.join(" ") : raw

  /* 사용자가 값을 고치면 서버 오류를 걷는다 — Base UI Form이 하던 일이다.
   * `errors` 객체가 바뀌면(다음 제출의 응답) 다시 보인다 */
  const [dismissedFor, setDismissedFor] = useState<unknown>(null)
  useEffect(() => setDismissedFor(null), [errors])
  const serverError = message && dismissedFor !== errors ? message : undefined

  return (
    <ServerErrorContext.Provider value={serverError}>
      <SdkField
        name={name}
        invalid={invalid ?? (serverError ? true : undefined)}
        className={cn("flex flex-col gap-1.5", className)}
        onInput={(event) => {
          onInput?.(event)
          if (message) setDismissedFor(errors)
        }}
        {...props}
      />
    </ServerErrorContext.Provider>
  )
}

export type FieldLabelProps = Omit<React.ComponentProps<typeof SdkFieldLabel>, "className"> & {
  className?: string
}

export function FieldLabel({ className, ...props }: FieldLabelProps) {
  return (
    <SdkFieldLabel
      className={cn(
        "text-sm font-medium text-default select-none",
        "data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export type FieldDescriptionProps = Omit<React.ComponentProps<typeof SdkFieldDescription>, "className"> & {
  className?: string
}

export function FieldDescription({ className, ...props }: FieldDescriptionProps) {
  return <SdkFieldDescription className={cn("text-sm text-muted", className)} {...props} />
}

export type FieldErrorProps = Omit<React.ComponentProps<typeof SdkFieldError>, "className"> & {
  className?: string
}

/* `match`도 자식도 없는 `<FieldError />`는 원본에서 "무슨 오류든 보여 준다"였고
 * 서버 오류가 그 자리로 왔다. UI SDK의 빈 FieldError는 브라우저의 문구만 알기
 * 때문에, 서버 오류가 있으면 그 문구를 자식으로 넣고 `match`를 켠다. */
export function FieldError({ className, match, children, ...props }: FieldErrorProps) {
  const serverError = useContext(ServerErrorContext)
  const takesServerError = serverError !== undefined && match === undefined && children === undefined
  return (
    <SdkFieldError
      match={takesServerError ? true : match}
      className={cn("text-sm text-danger", className)}
      {...props}
    >
      {takesServerError ? serverError : children}
    </SdkFieldError>
  )
}
