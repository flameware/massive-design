import * as React from "react"
import { Checkbox as CheckboxPrimitive } from "radix-ui"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const checkboxVariantsConfig = { variants: {}, defaultVariants: {} } as const
const checkboxVariants = cva("state [--ds-state-base:var(--background)] size-4 shrink-0 rounded border shadow-xs outline-none focus-visible:border-focus-contrast focus-visible:ring-[3px] focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[state=checked]:[--ds-state-base:var(--primary)] data-[state=checked]:text-primary-foreground data-[state=indeterminate]:[--ds-state-base:var(--primary)] data-[state=indeterminate]:text-primary-foreground", checkboxVariantsConfig)
function Checkbox({ className, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return <CheckboxPrimitive.Root data-slot="checkbox" className={cn(checkboxVariants({ className }))} {...props}><CheckboxPrimitive.Indicator data-slot="checkbox-indicator" className="flex items-center justify-center text-current">●</CheckboxPrimitive.Indicator></CheckboxPrimitive.Root>
}
export { Checkbox, checkboxVariants, checkboxVariantsConfig }
