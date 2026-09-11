"use client"

import { NumberField as BaseNumberField } from "@base-ui/react/number-field"
import { cva } from "class-variance-authority"
import type * as React from "react"

import { fieldControlBase } from "../lib/field-control.js"
import { cn } from "../lib/utils.js"

/* Base UI의 NumberField는 Input과 같은 자리다 — Root가 `useFieldRootContext()`로
 * `Field.Root`의 컨텍스트를 읽으므로(number-field/root/NumberFieldRoot.mjs),
 * `Field.Root` 안에 두면 라벨·설명·오류가 자동으로 연결되고 밖에 홀로 둬도
 * 동작한다(#317 스토리 11, input.tsx와 같은 근거). 증감 버튼·`inputMode`·
 * 로케일 서식은 전부 Base UI가 진다 — DS는 새 배선을 놓지 않는다(#317
 * Implementation Decisions "NumberField는 Base UI가 주는 것을 쓴다").
 *
 * 네임스페이스형 API다(ADR-0023 §5, Select·Progress와 같은 모양). Base UI의
 * anatomy 중 `ScrubArea`·`ScrubAreaCursor`(포인터 드래그로 값을 스크럽하는
 * 파트)는 열지 않는다 — 티켓의 AC가 증감 버튼·키보드·로케일 서식만 요구하고,
 * 앱의 수량·단가 자리(#328)에 스크럽 요구가 없다(방법론 — 실측 없는 축은
 * 열지 않는다, rules.md 방법론). */

export type NumberFieldRootProps = Omit<
  React.ComponentPropsWithoutRef<typeof BaseNumberField.Root>,
  "className"
> & {
  className?: string
}

/** 값·증감·서식·폼 등록을 쥔다 — Input·Group·Increment·Decrement가 이
 * 컨텍스트를 읽는다. 시각 치수는 없다(Select.Root와 같은 이유로 그대로
 * 넘긴다). */
const Root = BaseNumberField.Root

/* Input·트리거와 같은 밑그림을 Group이 진다(lib/field-control.ts) — "Field
 * 안의 컨트롤"이라는 같은 역할이기 때문이다(number-field.tsx가 select.tsx를
 * 따라간다). Input 자신은 테두리·배경을 다시 칠하지 않는다 — 테두리가 둘이면
 * 증감 버튼과 Input 사이의 구분선이 이중으로 보인다. */
export const numberFieldGroupVariants = cva([
  "flex h-9 w-full items-stretch overflow-hidden rounded-md border",
  ...fieldControlBase,
])

export type NumberFieldGroupProps = Omit<
  React.ComponentPropsWithoutRef<typeof BaseNumberField.Group>,
  "className"
> & {
  className?: string
}

function Group({ className, ...props }: NumberFieldGroupProps) {
  return <BaseNumberField.Group className={cn(numberFieldGroupVariants(), className)} {...props} />
}

export const numberFieldInputVariants = cva(
  "h-full min-w-0 flex-1 border-0 bg-transparent px-3 text-center text-sm text-default outline-none placeholder:text-muted"
)

export type NumberFieldInputProps = Omit<
  React.ComponentPropsWithoutRef<typeof BaseNumberField.Input>,
  "className"
> & {
  className?: string
}

/** `aria-roledescription`의 기본값을 한국어로 둔다 — Base UI 기본값("Number
 * field")은 영어라 한국어 화면마다 소비처가 새로 옮겨야 하는 자리였다. 이름을
 * 대신하지 않는다(Base UI 문서: role description이지 accessible name이 아니다) —
 * 이름은 그대로 `Field.Label`이나 `aria-label`이 진다. */
function Input({ className, "aria-roledescription": roleDescription, ...props }: NumberFieldInputProps) {
  return (
    <BaseNumberField.Input
      aria-roledescription={roleDescription ?? "숫자 입력"}
      className={cn(numberFieldInputVariants(), className)}
      {...props}
    />
  )
}

/* 증감 버튼 둘의 밑그림 — 36×36(`size-9`, Button의 `size="icon"`과 같은 치수,
 * button.tsx)이라 24px 포인터 하한을 시각 치수만으로 이미 넘는다(ADR-0020
 * 결정 1·2) — `hit-area` 유사요소를 더 얹지 않는다. `.state`가
 * background-color의 유일한 작성자다(state.css, #299) — SelectItem의
 * `data-highlighted`와 같은 8% 층을 누르는 동안·hover 때 쓴다. Base UI가
 * min/max에 닿거나 disabled/readOnly일 때 `disabled`를 버튼에 낸다 — 그 값은
 * `data-disabled`로 오므로 fieldControlBase가 이미 무력화를 진다. */
const numberFieldStepperVariants = cva([
  "flex size-9 shrink-0 items-center justify-center border-field text-muted outline-none",
  "state transition-[background-color,color]",
  "[--ds-state-base:var(--ds-bg-neutral-soft)]",
  "data-disabled:pointer-events-none data-disabled:opacity-50",
])

function StepperIcon({ variant }: { variant: "increment" | "decrement" }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className="size-3.5">
      <path
        d={variant === "increment" ? "M8 3v10M3 8h10" : "M3 8h10"}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

export type NumberFieldIncrementProps = Omit<
  React.ComponentPropsWithoutRef<typeof BaseNumberField.Increment>,
  "className"
> & {
  className?: string
}

/** 값을 올린다 — 화살표 위·클릭 다 같은 자리(#317 스토리 11 "ArrowUp/Down
 * 증감"). 이름표는 밖에 없으므로 `aria-label` 기본값을 한국어로 둔다. */
function Increment({ className, "aria-label": ariaLabel, children, ...props }: NumberFieldIncrementProps) {
  return (
    <BaseNumberField.Increment
      aria-label={ariaLabel ?? "값 올리기"}
      className={cn(numberFieldStepperVariants(), "border-s", className)}
      {...props}
    >
      {children ?? <StepperIcon variant="increment" />}
    </BaseNumberField.Increment>
  )
}

export type NumberFieldDecrementProps = Omit<
  React.ComponentPropsWithoutRef<typeof BaseNumberField.Decrement>,
  "className"
> & {
  className?: string
}

/** 값을 내린다 — Increment와 짝이다. */
function Decrement({ className, "aria-label": ariaLabel, children, ...props }: NumberFieldDecrementProps) {
  return (
    <BaseNumberField.Decrement
      aria-label={ariaLabel ?? "값 내리기"}
      className={cn(numberFieldStepperVariants(), "border-e", className)}
      {...props}
    >
      {children ?? <StepperIcon variant="decrement" />}
    </BaseNumberField.Decrement>
  )
}

/**
 * 네임스페이스형 NumberField(`Root`·`Group`·`Decrement`·`Input`·`Increment`).
 * `Field.Root` 안에 두면 라벨·설명·오류가 aria로 자동 연결된다(input.tsx와
 * 같은 조립).
 *
 * 키보드는 Base UI가 준다: `ArrowUp`/`ArrowDown`이 `step`만큼(Shift는
 * `largeStep`, Alt는 `smallStep`), `Home`/`End`가 각각 `min`/`max`로
 * 보낸다 — 단 그 경계가 정의된 경우에만(NumberFieldInput.mjs). 이 계약을
 * 선언하는 자리는 NumberField.stories.tsx다.
 */
export const NumberField = {
  Root,
  Group,
  Decrement,
  Input,
  Increment,
}
