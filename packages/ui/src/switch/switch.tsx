"use client"

import { Switch as BaseSwitch } from "@base-ui/react/switch"
import { cva } from "class-variance-authority"
import type * as React from "react"

import { cn } from "../lib/utils.js"

/* Base UI Switch는 Checkbox와 같은 자리에 선다 — `checked`/`defaultChecked`
 * (제어/비제어)와 `name`·`value`·`uncheckedValue`(폼 제출)를 스스로 지고,
 * `Field.Root` 안에 두면 `useRegisterFieldControl`로 Form의 필드 registry에도
 * 스스로 등록된다(checkbox·select·switch 셋만 이 훅을 부른다 — toggle.tsx
 * 주석, node_modules/@base-ui/react/switch/root/SwitchRoot.mjs). 그래서 이
 * 컴포넌트도 상태 배선을 새로 놓지 않고 색과 치수만 입힌다.
 *
 * ADR-0026의 기본 폼 컨트롤이라 착지 자리 지명 없이 만든다. #374가 그은
 * 경계("즉시 반영되는 이진 설정"만 이 컴포넌트의 자리이고, 폼 제출을 기다리는
 * 이진값은 이름 있는 상호 배타적 선택지라 ToggleGroup이 맞다)는 지우지
 * 않는다 — 그 설명은 Switch.mdx로 옮긴다.
 *
 * off 트랙은 컨트롤 어포던스다(ADR-0026, CONTEXT.md 계열/컨트롤 어포던스) —
 * 잡는 대상 자체가 앉는 면에 대해 비텍스트 대비 3:1(WCAG 1.4.11)을 져야 하므로
 * `bg.neutral.solid`를 쓴다(Scroll Area의 thumb과 같은 이유, rules.md 토큰과
 * 대비). on 트랙은 Checkbox의 체크·Toggle의 눌림과 같은 이유로 브랜드
 * 솔리드다. 손잡이(Thumb)는 대비 요건이 걸리는 자리가 아니지만 — 켜짐/꺼짐
 * 두 솔리드 트랙 위에서 항상 읽혀야 해서, 정확히 그 용도로 정의된
 * `fg.on-solid`("neutral/accent/… solid 위 전경")를 배경으로 재사용한다.
 * 새 토큰을 열지 않는 판단이다(rules.md "이미 토큰인 것을 컴포넌트로
 * 재포장하지 않는다"와 같은 결) — Tailwind가 fg 토큰에 `bg-*` 유틸리티를
 * 내지 않으므로 임의값으로 그 변수를 직접 가리킨다. */
export const switchVariants = cva([
  "peer inline-flex shrink-0 cursor-pointer items-center rounded-full p-0.5",
  "h-5 w-9",
  "outline-offset-2 focus-visible:outline-2",
  "state transition-colors",
  "hit-area",
  "data-unchecked:[--ds-state-base:var(--ds-bg-neutral-solid)]",
  "data-checked:[--ds-state-base:var(--ds-bg-accent-solid)]",
  "data-disabled:pointer-events-none data-disabled:opacity-50",
])

export interface SwitchProps
  extends Omit<React.ComponentPropsWithoutRef<typeof BaseSwitch.Root>, "className"> {
  className?: string
}

/**
 * 즉시 반영되는 이진 설정의 손잡이. `checked`/`onCheckedChange`로 제어,
 * `defaultChecked`로 비제어 — 어느 쪽도 안 주면 꺼진 채 비제어로 동작한다.
 * `Field.Root` 안에서 `name`을 주면 Form의 제출 맵에 그대로 잡힌다.
 *
 * 폼 제출을 기다리는 이진값(예: 거래 유형 매수/매도)에는 쓰지 않는다 — 그건
 * 이름 있는 상호 배타적 선택지라 ToggleGroup이 맞는 모양이다(Switch.mdx).
 */
export function Switch({ className, ...props }: SwitchProps) {
  return (
    <BaseSwitch.Root className={cn(switchVariants(), className)} {...props}>
      <BaseSwitch.Thumb
        className={cn(
          "block size-4 rounded-full bg-[var(--ds-fg-on-solid)]",
          "transition-transform data-checked:translate-x-4 data-unchecked:translate-x-0"
        )}
      />
    </BaseSwitch.Root>
  )
}
