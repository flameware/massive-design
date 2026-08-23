import * as React from "react"
import { Label as LabelPrimitive } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// Card와 같은 이유로 variant 축이 없다(#51) — card.tsx 상단 주석 참고.
const labelVariantsConfig = {
  variants: {},
  defaultVariants: {},
} as const

const labelVariants = cva(
  "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
  labelVariantsConfig
)

function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root> &
  VariantProps<typeof labelVariants>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(labelVariants({ className }))}
      {...props}
    />
  )
}

const componentContract = {
  name: "label", source: "src/components/ui/label.tsx",
  publicExports: ["Label", "labelVariants", "labelVariantsConfig"],
  config: labelVariantsConfig, className: (props: Record<string, string>) => cn(labelVariants(props)),
  anatomy: [], configurationStates: {},
} as const

export { Label, labelVariants, labelVariantsConfig, componentContract }
