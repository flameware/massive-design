import * as React from "react"
import { Checkbox as CheckboxPrimitive } from "radix-ui"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const checkboxVariantsConfig = { variants: {}, defaultVariants: {} } as const
const checkboxVariants = cva("state [--ds-state-base:var(--background)] size-4 shrink-0 rounded border shadow-xs outline-none focus-visible:border-focus-contrast focus-visible:ring-[3px] focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[state=checked]:[--ds-state-base:var(--primary)] data-[state=checked]:text-primary-foreground data-[state=indeterminate]:[--ds-state-base:var(--primary)] data-[state=indeterminate]:text-primary-foreground", checkboxVariantsConfig)
function Checkbox({ className, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return <CheckboxPrimitive.Root data-slot="checkbox" className={cn(checkboxVariants({ className }))} {...props}><CheckboxPrimitive.Indicator data-slot="checkbox-indicator" className="flex items-center justify-center text-current">●</CheckboxPrimitive.Indicator></CheckboxPrimitive.Root>
}
const componentContract = {
  name: "checkbox", source: "src/components/ui/checkbox.tsx",
  publicExports: ["Checkbox", "checkboxVariants", "checkboxVariantsConfig"],
  config: checkboxVariantsConfig, className: (props: Record<string, string>) => cn(checkboxVariants(props)),
  anatomy: ["Checkbox", "Indicator"],
  configurationStates: { checked: ["unchecked", "checked", "indeterminate"] }, drawnBy: { checked: { attribute: "data-state", values: { checked: "checked", indeterminate: "indeterminate" } } },
  reference: { example: "checkbox", guidance: { use: "복수 행 선택과 불확정 전체 선택을 표현한다.", evidence: "투자 이력 Table의 checked·unchecked·indeterminate 구성 상태가 필요하다.", limits: "선택 모델과 일괄 동작은 소비처 책임이다." } },
} as const
export { Checkbox, checkboxVariants, checkboxVariantsConfig, componentContract }
