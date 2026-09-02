import * as React from "react"
import { Switch as SwitchPrimitive } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const switchVariantsConfig = {
  variants: {
    size: {
      sm: "h-4 w-7 [&_[data-slot=switch-thumb]]:size-3 [&_[data-slot=switch-thumb]]:data-[state=checked]:translate-x-3",
      default: "h-5 w-9 [&_[data-slot=switch-thumb]]:size-4 [&_[data-slot=switch-thumb]]:data-[state=checked]:translate-x-4",
    },
  },
  defaultVariants: { size: "default" },
} as const
const switchVariants = cva("state [--ds-state-base:var(--secondary)] inline-flex shrink-0 items-center rounded-full border border-transparent shadow-xs outline-none transition-all focus-visible:border-focus-contrast focus-visible:ring-[3px] focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:[--ds-state-base:var(--primary)]", switchVariantsConfig)

function Switch({ className, size = "default", ...props }: React.ComponentProps<typeof SwitchPrimitive.Root> & VariantProps<typeof switchVariants>) {
  return <SwitchPrimitive.Root data-slot="switch" data-size={size} className={cn(switchVariants({ size, className }))} {...props}><SwitchPrimitive.Thumb data-slot="switch-thumb" className="pointer-events-none block translate-x-0 rounded-full bg-background ring-0 transition-transform" /></SwitchPrimitive.Root>
}

const componentContract = {
  name: "switch", source: "src/components/ui/switch.tsx",
  publicExports: ["Switch", "switchVariants", "switchVariantsConfig"],
  config: switchVariantsConfig, className: (props: Record<string, string>) => cn(switchVariants(props)),
  anatomy: ["Switch", "Thumb"], configurationStates: { checked: ["unchecked", "checked"] }, drawnBy: { checked: { attribute: "data-state", values: { checked: "checked" } } },
  behaviors: {},
  reference: { example: "switch", guidance: { use: "즉시 적용되는 이진 설정을 켜거나 끈다.", evidence: "배당 재투자나 알림처럼 현재 활성 여부가 중요한 설정이 필요하다.", limits: "확인이 필요한 위험 동작이나 세 값 이상의 선택에는 쓰지 않는다." } },
} as const

export { Switch, switchVariants, switchVariantsConfig, componentContract }
