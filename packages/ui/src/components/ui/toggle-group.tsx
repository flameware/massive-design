import * as React from "react"
import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { toggleVariants, type ToggleStyleProps } from "@/components/ui/toggle"

const toggleGroupVariantsConfig = {
  variants: {
    variant: { default: "", outline: "" },
    size: { sm: "", default: "", lg: "" },
    orientation: {
      horizontal: "flex-row",
      vertical: "flex-col",
    },
  },
  defaultVariants: { variant: "default", size: "default", orientation: "horizontal" },
} as const

const toggleGroupVariants = cva("flex w-fit items-center gap-1", toggleGroupVariantsConfig)
type ToggleGroupStyleProps = VariantProps<typeof toggleGroupVariants>
const ToggleGroupContext = React.createContext<ToggleStyleProps>({ variant: "default", size: "default" })

function ToggleGroup({ className, variant = "default", size = "default", orientation = "horizontal", children, ...props }: React.ComponentProps<typeof ToggleGroupPrimitive.Root> & ToggleGroupStyleProps) {
  return <ToggleGroupPrimitive.Root data-slot="toggle-group" data-variant={variant} data-size={size} orientation={orientation} className={cn(toggleGroupVariants({ variant, size, orientation, className }))} {...props}><ToggleGroupContext.Provider value={{ variant, size }}>{children}</ToggleGroupContext.Provider></ToggleGroupPrimitive.Root>
}

function ToggleGroupItem({ className, variant, size, ...props }: React.ComponentProps<typeof ToggleGroupPrimitive.Item> & ToggleStyleProps) {
  const context = React.useContext(ToggleGroupContext)
  return <ToggleGroupPrimitive.Item data-slot="toggle-group-item" data-variant={variant ?? context.variant} data-size={size ?? context.size} className={cn(toggleVariants({ variant: variant ?? context.variant, size: size ?? context.size }), "min-w-0 px-3", className)} {...props} />
}

const componentContract = {
  name: "toggle-group", source: "src/components/ui/toggle-group.tsx",
  publicExports: ["ToggleGroup", "ToggleGroupItem", "toggleGroupVariants", "toggleGroupVariantsConfig"],
  config: toggleGroupVariantsConfig, className: (props: Record<string, string>) => cn(toggleGroupVariants(props)),
  anatomy: ["ToggleGroup", "ToggleGroupItem*"], configurationStates: { selection: ["single", "multiple"], pressed: ["unpressed", "pressed"] },
  reference: { example: "toggle-group", guidance: { use: "관련된 토글을 묶어 하나 또는 여러 값을 선택하고 화살표 키로 항목 사이를 이동한다.", evidence: "차트 기간은 하나만, 비교 지표는 여러 개를 고르는 조밀한 도구 모음이 필요하다.", limits: "서로 무관한 동작을 시각적으로 붙이는 Button Group이나 제출형 선택 필드를 대신하지 않는다." } },
} as const

export { ToggleGroup, ToggleGroupItem, toggleGroupVariants, toggleGroupVariantsConfig, componentContract }
