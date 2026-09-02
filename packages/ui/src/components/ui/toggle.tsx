import * as React from "react"
import { Toggle as TogglePrimitive } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const toggleVariantsConfig = {
  variants: {
    variant: {
      default: "state data-[state=on]:[--ds-state-base:var(--accent)] data-[state=on]:text-accent-foreground",
      outline: "state [--ds-state-base:var(--background)] border shadow-xs data-[state=on]:[--ds-state-base:var(--accent)] data-[state=on]:text-accent-foreground",
    },
    size: {
      sm: "h-8 min-w-8 px-1.5",
      default: "h-9 min-w-9 px-2",
      lg: "h-10 min-w-10 px-2.5",
    },
  },
  defaultVariants: { variant: "default", size: "default" },
} as const

const toggleVariants = cva("inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:border-focus-contrast focus-visible:ring-[3px] focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", toggleVariantsConfig)
type ToggleStyleProps = VariantProps<typeof toggleVariants>

function Toggle({ className, variant = "default", size = "default", ...props }: React.ComponentProps<typeof TogglePrimitive.Root> & ToggleStyleProps) {
  return <TogglePrimitive.Root data-slot="toggle" data-variant={variant} data-size={size} className={cn(toggleVariants({ variant, size, className }))} {...props} />
}

const componentContract = {
  name: "toggle", source: "src/components/ui/toggle.tsx",
  publicExports: ["Toggle", "toggleVariants", "toggleVariantsConfig"],
  config: toggleVariantsConfig, className: (props: Record<string, string>) => cn(toggleVariants(props)),
  anatomy: ["Toggle"], configurationStates: { pressed: ["unpressed", "pressed"] }, drawnBy: { pressed: { attribute: "data-state", values: { pressed: "on" } } },
  behaviors: {},
  reference: { example: "toggle", guidance: { use: "한 항목의 켜짐 상태를 눌러 전환하며 현재 pressed 상태를 즉시 드러낸다.", evidence: "투자 차트의 비교선이나 표시 옵션처럼 독립적으로 켜고 끄는 도구가 필요하다.", limits: "즉시 적용되는 설정에는 Switch를, 제출할 복수 선택에는 Checkbox를 사용한다." } },
} as const

export { Toggle, toggleVariants, toggleVariantsConfig, type ToggleStyleProps, componentContract }
