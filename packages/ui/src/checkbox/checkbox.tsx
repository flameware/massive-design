"use client"

import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox"
import { cva } from "class-variance-authority"
import type * as React from "react"

import { cn } from "../lib/utils.js"

/* Base UI Checkbox는 `checked`/`defaultChecked`(제어/비제어)와
 * `name`·`value`·`uncheckedValue`(폼 제출)를 이미 스스로 진다 — Field.Root 안에
 * 두면 `useRegisterFieldControl`로 Form의 필드 registry에도 스스로 등록된다
 * (node_modules/@base-ui/react/checkbox/root/CheckboxRoot.mjs). 그래서 이
 * 컴포넌트는 상태 배선을 새로 놓지 않고 색과 치수만 입힌다.
 *
 * 시각 상자는 16px다 — 포인터 하한 24px 아래이므로 `hit-area`가 진다
 * (ADR-0020 결정 1·2, Button의 link variant와 같은 자리). 부모가
 * `overflow-hidden`을 걸면 `after:` 의사요소가 잘리므로(#285의 발견) 이
 * 컴포넌트는 자기 바깥에 그런 래퍼를 두지 않는다 — 소비처가 감싸면 그 감싼
 * 요소의 몫이다.
 *
 * `group`을 Root에 걸어 두는 이유는 Indicator 안 두 아이콘(체크·인디터미네이트
 * 대시)이 Root의 `data-checked`/`data-indeterminate`를 각자 읽어 갈리게
 * 보이려는 것 하나다 — Indicator 자신도 같은 data-* 속성을 갖지만(Base UI가
 * 부모 상태를 그대로 내려보낸다), `group-data-*`로 루트를 직접 겨누는 쪽이
 * 두 아이콘의 관계를 한곳에서 읽게 한다. */
export const checkboxVariants = cva([
  "group peer inline-flex shrink-0 items-center justify-center",
  "size-4 rounded-sm border text-on-solid",
  "outline-offset-2 focus-visible:outline-2",
  "state transition-[background-color,border-color,box-shadow]",
  "hit-area",
  "data-unchecked:border-field data-unchecked:[--ds-state-base:var(--ds-bg-inset)]",
  "data-checked:border-transparent data-checked:[--ds-state-base:var(--ds-bg-accent-solid)]",
  "data-indeterminate:border-transparent data-indeterminate:[--ds-state-base:var(--ds-bg-accent-solid)]",
  "data-invalid:border-danger",
  "data-disabled:pointer-events-none data-disabled:opacity-50",
])

export interface CheckboxProps
  extends Omit<React.ComponentPropsWithoutRef<typeof BaseCheckbox.Root>, "className"> {
  className?: string
}

/**
 * 체크박스. `checked`/`onCheckedChange`로 제어, `defaultChecked`로 비제어 —
 * 어느 쪽도 안 주면 꺼진 채 비제어로 동작한다. `Field.Root` 안에서 `name`을
 * 주면 Form의 제출 맵에 그대로 잡힌다(form/Form.stories.tsx의 스토리 참고).
 */
export function Checkbox({ className, ...props }: CheckboxProps) {
  return (
    <BaseCheckbox.Root className={cn(checkboxVariants(), className)} {...props}>
      <BaseCheckbox.Indicator
        className="flex items-center justify-center"
        keepMounted={false}
      >
        <CheckGlyph />
        <IndeterminateGlyph />
      </BaseCheckbox.Indicator>
    </BaseCheckbox.Root>
  )
}

/* 인라인이다 — Icon 래퍼는 lucide-react를 감싸는 자리이고(icon.tsx), 이
 * 글리프 둘은 체크박스 자체의 고정 모양이라 소비처가 바꿀 일이 없다. Button의
 * Spinner와 같은 이유로 lucide-react를 무는 대신 인라인 svg를 쓴다
 * (button.tsx, ADR-0017 바닥값 — Checkbox를 쓰지 않는 소비처가 아이콘
 * 라이브러리 무게를 지지 않는다). */
function CheckGlyph() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="none"
      className="hidden size-3 group-data-checked:block"
    >
      <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IndeterminateGlyph() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      fill="none"
      className="hidden size-3 group-data-indeterminate:block"
    >
      <path d="M3.5 8h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
