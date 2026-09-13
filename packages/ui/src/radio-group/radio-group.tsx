"use client"

import { RadioGroup as BaseRadioGroup } from "@base-ui/react/radio-group"
import type * as React from "react"

import { cn } from "../lib/utils.js"

/* Base UI가 Radio의 anatomy를 `RadioGroup`(값을 쥐는 컨테이너) + `Radio`(항목,
 * ../radio/radio.tsx)로 가른다 — Toggle/ToggleGroup과 같은 짝 모양이다(#399/
 * #408 PR이 남긴 판단: "Radio는 Base UI가 Radio.Root+RadioGroup으로 나뉘므로
 * Checkbox 모양이 그대로 가지 않는다"). 하지만 배선은 ToggleGroup이 아니라
 * Checkbox·Switch·Slider 쪽에 가깝다: Base UI `RadioGroup`이 `value`/
 * `defaultValue`(제어/비제어)와 `name`·`form`(폼 제출)을 스스로 지고,
 * `Field.Root` 안에 두면 `useRegisterFieldControl`로 Form의 필드 registry에도
 * 스스로 등록된다(packages/ui/node_modules/@base-ui/react/radio-group/
 * RadioGroup.mjs — `useRegisterFieldControl(controlRef, id, checkedValue ?? null,
 * getFormValue, !disabled, nameProp)`). ToggleGroup처럼 숨은 미러 입력을 직접
 * 세우지 않는 이유가 여기 있다 — Base UI ToggleGroup은 그 훅을 부르지 않지만
 * RadioGroup은 부른다. 그래서 이 컴포넌트도 Checkbox·Switch·Slider처럼 상태
 * 배선을 새로 놓지 않고 레이아웃만 입힌다.
 *
 * ADR-0026의 기본 폼 컨트롤이라 착지 자리 지명 없이 만든다.
 *
 * 키보드: Base UI가 `CompositeRoot`로 화살표 로빙 포커스를 주고, 화살표로
 * 옮겨진 항목은 포커스를 받는 즉시 스스로를 선택한다(RadioRoot.mjs의
 * `onFocus`가 `touched`일 때 자기 hidden input을 클릭한다) — ToggleGroup처럼
 * Enter/Space로 따로 누를 필요가 없다. 네이티브 라디오 그룹과 같은 동작이다. */
export interface RadioGroupProps<Value = unknown>
  extends Omit<React.ComponentPropsWithoutRef<typeof BaseRadioGroup<Value>>, "className"> {
  className?: string
}

/**
 * `Radio` 여럿을 한 값 아래 묶는다. `value`/`onValueChange`로 제어,
 * `defaultValue`로 비제어 — 어느 쪽도 안 주면 아무것도 선택되지 않은 채
 * 비제어로 시작한다. `Field.Root` 안에서 `name`을 주면 Form의 제출 맵에
 * 그대로 잡힌다.
 */
export function RadioGroup<Value = unknown>({ className, ...props }: RadioGroupProps<Value>) {
  return (
    <BaseRadioGroup<Value>
      className={cn("flex flex-col gap-2 data-disabled:opacity-50", className)}
      {...props}
    />
  )
}
