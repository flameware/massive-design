"use client"

import { Field as BaseField } from "@base-ui/react/field"
import { ToggleGroup as BaseToggleGroup } from "@base-ui/react/toggle-group"
import { cva } from "class-variance-authority"
import type * as React from "react"

import { useControllableState } from "../lib/use-controllable-state.js"
import { cn } from "../lib/utils.js"

/* 여러 Toggle을 한 판에 묶어 화살표 이동·(기본) 단일 선택을 준다. 항목은 이
 * 컴포넌트의 파트가 아니라 그냥 `Toggle`이다 — Base UI 자신의 anatomy가
 * 그렇다(node_modules/@base-ui/react/toggle-group에 Item 파트가 없다,
 * ToggleGroup.d.ts). 그래서 여기 API도 Base UI와 1:1로 평평하다:
 *
 *   <ToggleGroup value={value} onValueChange={setValue}>
 *     <Toggle value="a">A</Toggle>
 *     <Toggle value="b">B</Toggle>
 *   </ToggleGroup>
 *
 * `name`을 주면 폼에 값을 낸다 — Toggle과 같은 이유로 직접 만든다(Base UI
 * ToggleGroup도 useRegisterFieldControl을 부르지 않는다, 폼 등록이 없다).
 * `multiple`이 기본값 false일 때는 선택된 한 값을 그대로 낸다. `multiple`이
 * true면 네이티브 `<input>` 하나의 `value`는 문자열 하나뿐이라 여러 값을
 * 그대로 담을 수 없다 — 그래서 쉼표로 이어 낸다. 이 필터가 정말로 다중
 * 선택을 요구하게 되면(지금 히스토리 필터는 단일 선택 세그먼트다) 그때
 * 소비처가 그 문자열을 나눠 쓰거나, 이 컴포넌트가 그때 다시 설계된다 —
 * 지금은 확인되지 않은 요구를 앞서 풀지 않는다(rules.md 방법론). */
export const toggleGroupVariants = cva([
  "inline-flex items-center gap-1 rounded-md border bg-inset p-1",
  "data-[orientation=vertical]:flex-col",
  "data-disabled:pointer-events-none data-disabled:opacity-50",
])

export interface ToggleGroupProps<Value extends string = string>
  extends Omit<React.ComponentPropsWithoutRef<typeof BaseToggleGroup<Value>>, "className"> {
  className?: string
  /**
   * 폼 제출 이름. 주면 선택된 값을 숨은 입력 하나로 낸다 — `multiple`이면
   * 값들을 쉼표로 이어 낸다(위 설명 참고).
   */
  name?: string
}

/**
 * Toggle 여럿을 한 판으로 묶는다. `value`/`onValueChange`로 제어,
 * `defaultValue`로 비제어 — 선택된 값들의 배열이다(`multiple`이 기본
 * false라 실제로는 원소가 0개 또는 1개다).
 */
export function ToggleGroup<Value extends string = string>({
  className,
  value,
  defaultValue,
  onValueChange,
  disabled,
  multiple,
  name,
  ...props
}: ToggleGroupProps<Value>) {
  const [values, setValues] = useControllableState<readonly Value[]>({
    prop: value,
    defaultProp: defaultValue ?? [],
  })

  const group = (
    <BaseToggleGroup<Value>
      value={values}
      onValueChange={(next, eventDetails) => {
        setValues(next)
        onValueChange?.(next, eventDetails)
      }}
      disabled={disabled}
      multiple={multiple}
      className={cn(toggleGroupVariants(), className)}
      {...props}
    />
  )

  if (!name) return group

  // 아무것도 안 눌렸으면 필드 자체를 마운트하지 않는다 — Toggle과 같은 이유로
  // (toggle.tsx) 값을 ""로 두는 것만으로는 제출 맵에서 키가 안 빠진다
  if (values.length === 0) {
    return <BaseField.Root name={name}>{group}</BaseField.Root>
  }

  const formValue = multiple ? values.join(",") : values[0]

  return (
    <BaseField.Root name={name}>
      {group}
      <BaseField.Control render={<input type="hidden" />} value={formValue} />
    </BaseField.Root>
  )
}
