import * as React from "react"
import { Checkbox as CheckboxPrimitive } from "radix-ui"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const checkboxVariantsConfig = { variants: {}, defaultVariants: {} } as const
/* 히트 영역  시각 16px는 그대로 두고(#111 결정 2) `after:`의 투명 의사 요소로 중심
 * 대칭으로 넓혀 24까지 채운다(#230, 실측 `docs/research/pointer-targets-2026-09.md`
 * §4.1·§4.4). 의사 요소의 위치 기준은 `border`가 걸린 **padding box**라 `border`(1px)
 * 만큼 더 밀어야 한다 — 4px가 아니라 5px씩(재실측이 잡아낸 값). `relative`는 의사
 * 요소의 기준을 이 노드로 고정하기 위해서고, 정책표는 `after`를 `ignore:`로 이미
 * 갖고 있다(`classify.mjs`, 선례 `resizable.tsx`). 촘촘한 목록에서 이웃 Checkbox와
 * 24px 히트 영역이 겹칠 수 있다 — 해소하지 않고 여기 선언한다(#111 결정 5). */
const checkboxVariants = cva("state [--ds-state-base:var(--background)] relative size-4 shrink-0 rounded border shadow-xs outline-none after:absolute after:-inset-[5px] focus-visible:border-focus-contrast focus-visible:ring-[3px] focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[state=checked]:[--ds-state-base:var(--primary)] data-[state=checked]:text-primary-foreground data-[state=indeterminate]:[--ds-state-base:var(--primary)] data-[state=indeterminate]:text-primary-foreground", checkboxVariantsConfig)
const INDICATOR = "flex items-center justify-center text-current"
function Checkbox({ className, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return <CheckboxPrimitive.Root data-slot="checkbox" className={cn(checkboxVariants({ className }))} {...props}><CheckboxPrimitive.Indicator data-slot="checkbox-indicator" className={INDICATOR}>●</CheckboxPrimitive.Indicator></CheckboxPrimitive.Root>
}
const staticPart = (className: string) => ({
  config: { variants: {}, defaultVariants: {} } as const,
  className: () => className,
})
const componentContract = {
  name: "checkbox", source: "src/components/ui/checkbox.tsx",
  publicExports: ["Checkbox", "checkboxVariants", "checkboxVariantsConfig"],
  config: checkboxVariantsConfig, className: (props: Record<string, string>) => cn(checkboxVariants(props)),
  anatomy: ["Checkbox", "Indicator"],
  configurationStates: { checked: ["unchecked", "checked", "indeterminate"] }, drawnBy: { checked: { attribute: "data-state", values: { checked: "checked", indeterminate: "indeterminate" } } },
  parts: {
    Indicator: staticPart(INDICATOR),
  },
  behaviors: {},
  reference: { example: "checkbox", guidance: { use: "복수 행 선택과 불확정 전체 선택을 표현한다.", evidence: "투자 이력 Table의 checked·unchecked·indeterminate 구성 상태가 필요하다.", limits: "선택 모델과 일괄 동작은 소비처 책임이다." } },
} as const
export { Checkbox, checkboxVariants, checkboxVariantsConfig, componentContract }
