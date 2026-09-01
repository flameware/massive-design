import * as React from "react"
import { RadioGroup as RadioGroupPrimitive } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const radioGroupVariantsConfig = {
  variants: {
    orientation: {
      vertical: "grid gap-3",
      horizontal: "flex flex-wrap items-center gap-4",
    },
  },
  defaultVariants: { orientation: "vertical" },
} as const
const radioGroupVariants = cva("outline-none", radioGroupVariantsConfig)

function RadioGroup({ className, orientation = "vertical", ...props }: React.ComponentProps<typeof RadioGroupPrimitive.Root> & VariantProps<typeof radioGroupVariants>) {
  return <RadioGroupPrimitive.Root data-slot="radio-group" orientation={orientation} className={cn(radioGroupVariants({ orientation, className }))} {...props} />
}

function RadioGroupItem({ className, ...props }: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return <RadioGroupPrimitive.Item data-slot="radio-group-item" className={cn("state [--ds-state-base:var(--background)] size-4 shrink-0 rounded-full border shadow-xs outline-none focus-visible:border-focus-contrast focus-visible:ring-[3px] focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[state=checked]:[--ds-state-base:var(--primary)] data-[state=checked]:text-primary-foreground", className)} {...props}><RadioGroupPrimitive.Indicator data-slot="radio-group-indicator" className="flex items-center justify-center text-[8px] leading-none">●</RadioGroupPrimitive.Indicator></RadioGroupPrimitive.Item>
}

const componentContract = {
  name: "radio-group", source: "src/components/ui/radio-group.tsx",
  publicExports: ["RadioGroup", "RadioGroupItem", "radioGroupVariants", "radioGroupVariantsConfig"],
  config: radioGroupVariantsConfig, className: (props: Record<string, string>) => cn(radioGroupVariants(props)),
  anatomy: ["RadioGroup", "RadioGroupItem*", "Indicator"], configurationStates: { checked: ["unchecked", "checked"] }, drawnBy: { checked: "`RadioGroupItem`이 `data-[state=checked]`로 그리지만 그 파트가 아직 계약에 없다(#155)" },
  reference: { example: "radio-group", guidance: { use: "서로 배타적인 선택지에서 값 하나를 고른다.", evidence: "투자 계좌와 거래 유형처럼 한 번에 하나만 유효한 선택이 필요하다.", limits: "선택지 데이터와 제출 모델은 소비처가 소유한다." } },
} as const

export { RadioGroup, RadioGroupItem, radioGroupVariants, radioGroupVariantsConfig, componentContract }
