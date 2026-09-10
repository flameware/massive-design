"use client"

import { Field as BaseField } from "@base-ui/react/field"
import { Toggle as BaseToggle } from "@base-ui/react/toggle"
import { cva } from "class-variance-authority"
import type * as React from "react"

import { useControllableState } from "../lib/use-controllable-state.js"
import { cn } from "../lib/utils.js"

/* 눌림이 남는 버튼. `pressed`/`onPressedChange`로 제어, `defaultPressed`로
 * 비제어 — Base UI Toggle 자체가 그 둘을 받는다. 그런데 Checkbox·Select와
 * 달리 Toggle은 스스로 폼에 등록하지 않는다: `useRegisterFieldControl`을
 * 부르는 곳이 checkbox·select·switch뿐이다(node_modules/@base-ui/react의
 * 세 root 파일에서만 그 훅을 쓴다 — Toggle에는 없다). Base UI 쪽에 `name`
 * prop 자체가 없다.
 *
 * 그래서 "폼 안에서는 name으로 값을 낸다"는 이 티켓의 계약을 이 컴포넌트가
 * 직접 만든다: `name`을 주면 지금 눌린 값을 그대로 미러링하는 숨은
 * `Field.Control`(`render`로 `<input type="hidden">`을 그린) 하나를 곁에
 * 세운다. `Field.Control`은 Base UI가 공개한 컴포넌트다(internals가
 * 아니다) — Field 문서가 "Input·Checkbox·Select 대신 다른 걸 써도 된다"고
 * 적은 그 확장점을 그대로 쓴다. 값이 항상 필요해서(비제어일 때도 지금 눌린
 * 값을 읽어야 미러 입력을 채운다) `useControllableState`로 제어/비제어를
 * 한곳에서 겸한다 — 소비처가 보는 API는 그대로 두 갈래다. */
export const toggleVariants = cva([
  "inline-flex shrink-0 items-center justify-center gap-1.5",
  "h-8 min-w-8 px-2.5 rounded-md text-sm font-medium",
  "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  "outline-offset-2 focus-visible:outline-2",
  "state transition-[background-color,color,box-shadow]",
  // 32px 높이라 24px 하한은 이미 넘지만, 아이콘 전용으로 더 좁게 쓰는 소비처가
  // 있을 수 있어 Checkbox와 같은 이유로 hit-area를 같이 건다(#288, ADR-0020)
  "hit-area",
  // 꺼진 상태는 ghost와 같다 — --ds-state-base를 안 주면 상태 층이 transparent에
  // 섞인다(state.css, Button의 ghost variant와 같은 이유)
  "text-default",
  "data-pressed:text-on-solid data-pressed:[--ds-state-base:var(--ds-bg-accent-solid)]",
  "data-disabled:pointer-events-none data-disabled:opacity-50",
])

export interface ToggleProps<Value extends string = string>
  extends Omit<React.ComponentPropsWithoutRef<typeof BaseToggle<Value>>, "className"> {
  className?: string
  /**
   * 폼 제출 이름. 주면 눌린 값을 숨은 입력 하나로 낸다 — 안 주면(그룹 밖
   * 단독 사용의 기본) 폼에 아무것도 내지 않는다.
   */
  name?: string
}

/**
 * 눌림이 남는 버튼 — Button의 `variant="ghost"`와 다른 점은 누른 뒤에도
 * 상태가 유지된다는 것 하나다(즐겨찾기·굵게 같은 토글 자체). 켜고 끄는
 * 자리가 아니라 **누르면 무언가 일어나는** 자리는 Button이다.
 */
export function Toggle<Value extends string = string>({
  className,
  pressed,
  defaultPressed,
  onPressedChange,
  disabled,
  name,
  value,
  ...props
}: ToggleProps<Value>) {
  const [isPressed, setPressed] = useControllableState({
    prop: pressed,
    defaultProp: defaultPressed ?? false,
  })

  const toggle = (
    <BaseToggle<Value>
      pressed={isPressed}
      onPressedChange={(next, eventDetails) => {
        setPressed(next)
        onPressedChange?.(next, eventDetails)
      }}
      disabled={disabled}
      value={value}
      className={cn(toggleVariants(), className)}
      {...props}
    />
  )

  if (!name) return toggle

  // 폼에 내는 값은 "on"이 기본이다 — 꺼진 네이티브 체크박스가 아무 값도 내지
  // 않는 것과 같은 모양이다(checkbox.tsx가 그대로 쓰는 Base UI의 uncheckedValue
  // 규약). `value`를 Toggle 자신의 식별자로 이미 받았으면 그 값을 그대로 쓴다.
  return (
    <BaseField.Root name={name}>
      {toggle}
      <BaseField.Control render={<input type="hidden" />} value={isPressed ? (value ?? "on") : ""} />
    </BaseField.Root>
  )
}
