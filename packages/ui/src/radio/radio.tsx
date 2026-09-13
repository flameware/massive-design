"use client"

import { Radio as BaseRadio } from "@base-ui/react/radio"
import { cva } from "class-variance-authority"
import type * as React from "react"

import { cn } from "../lib/utils.js"

/* Base UI Radio는 anatomy가 `Radio.Root`(`<span>` + 숨은 `<input type="radio"
 * aria-hidden>`)와 `Radio.Indicator`(선택됨을 보여주는 `<span>`) 둘로 갈린다
 * (packages/ui/node_modules/@base-ui/react/radio/root/RadioRoot.d.ts) — Checkbox와
 * 같은 모양이다. 그래서 이 컴포넌트도 Checkbox처럼 그 둘을 하나로 접어 평평한
 * 단일 export로 낸다. 차이는 Radio 혼자서는 값을 갖지 못한다는 것 하나다 — 항상
 * `RadioGroup`(../radio-group/radio-group.tsx) 밖의 컨텍스트가 있어야 `checked`가
 * 정해진다(RadioRoot.mjs: `groupContext`가 없으면 `checked = value === ''`).
 *
 * 값·선택 상태·폼 등록은 새로 놓지 않는다 — `RadioGroup`이 `value`/
 * `defaultValue`·`name`을 스스로 지고 `useRegisterFieldControl`로 Form의 필드
 * registry에 등록되며(radio-group.tsx 주석), 각 `Radio`는 그 컨텍스트를 읽어
 * `checked`만 계산한다. 이 컴포넌트는 색과 치수만 입힌다.
 *
 * ADR-0026의 기본 폼 컨트롤이라 착지 자리 지명 없이 만든다.
 *
 * 대비: 선택 안 된 테두리는 Checkbox의 꺼짐 테두리와 같은 자리라 `border-field`,
 * 선택된 테두리는 Checkbox의 체크와 같은 이유로 `bg.accent.solid`(컨트롤
 * 어포던스, CONTEXT.md·ADR-0026). 안쪽 점(Indicator)은 그 솔리드 위에서 항상
 * 읽혀야 하므로 Checkbox의 체크 글리프와 같은 이유로 `currentColor`를
 * `text-on-solid`로 정해 재사용한다 — 새 토큰을 열지 않는다. */
export const radioVariants = cva([
  "peer inline-flex shrink-0 items-center justify-center",
  "size-4 rounded-full border text-on-solid",
  "outline-offset-2 focus-visible:outline-2",
  "state transition-[background-color,border-color,box-shadow]",
  "hit-area",
  "data-unchecked:border-field data-unchecked:[--ds-state-base:var(--ds-bg-inset)]",
  "data-checked:border-transparent data-checked:[--ds-state-base:var(--ds-bg-accent-solid)]",
  "data-invalid:border-danger",
  "data-disabled:pointer-events-none data-disabled:opacity-50",
])

export interface RadioProps
  extends Omit<React.ComponentPropsWithoutRef<typeof BaseRadio.Root>, "className"> {
  className?: string
}

/**
 * 라디오 그룹의 항목 하나. `RadioGroup` 안에서만 뜻이 있다 — 혼자 두면
 * 선택된다는 것을 나타낼 값이 없다(`RadioGroup.stories.tsx` 참고). 시각 상자는
 * 16px다 — 포인터 하한 24px 아래라 `hit-area`가 진다(Checkbox와 같은 자리,
 * ADR-0020).
 */
export function Radio({ className, ...props }: RadioProps) {
  return (
    <BaseRadio.Root className={cn(radioVariants(), className)} {...props}>
      <BaseRadio.Indicator className="flex items-center justify-center" keepMounted={false}>
        <span aria-hidden="true" className="block size-1.5 rounded-full bg-current" />
      </BaseRadio.Indicator>
    </BaseRadio.Root>
  )
}
