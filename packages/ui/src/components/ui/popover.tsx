import * as React from "react"
import { Popover as PopoverPrimitive } from "radix-ui"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const popoverVariantsConfig = { variants: {}, defaultVariants: {} } as const
const popoverVariants = cva("w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none", popoverVariantsConfig)

function Popover(props: React.ComponentProps<typeof PopoverPrimitive.Root>) { return <PopoverPrimitive.Root {...props} /> }
function PopoverTrigger(props: React.ComponentProps<typeof PopoverPrimitive.Trigger>) { return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} /> }
function PopoverAnchor(props: React.ComponentProps<typeof PopoverPrimitive.Anchor>) { return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} /> }
function PopoverContent({ className, align = "center", sideOffset = 4, ...props }: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  return <PopoverPrimitive.Portal><PopoverPrimitive.Content data-slot="popover-content" align={align} sideOffset={sideOffset} className={cn(popoverVariants({ className }))} {...props} /></PopoverPrimitive.Portal>
}

const componentContract = {
  name: "popover", source: "src/components/ui/popover.tsx",
  publicExports: ["Popover", "PopoverTrigger", "PopoverAnchor", "PopoverContent", "popoverVariants", "popoverVariantsConfig"],
  config: popoverVariantsConfig, className: (props: Record<string, string>) => cn(popoverVariants(props)),
  anatomy: ["Popover", "PopoverTrigger", "PopoverAnchor?", "PopoverContent"],
  configurationStates: { open: ["closed", "open"] },
  reference: { example: "popover", guidance: { use: "트리거와 가까운 곳에서 짧은 보조 정보나 설정을 제공한다.", evidence: "투자 기록의 필터 설명과 빠른 설정을 원래 화면 맥락을 떠나지 않고 보여줘야 한다.", limits: "핵심 작업 흐름이나 긴 양식은 Dialog로 옮기고, 행동 없는 짧은 설명은 Tooltip을 사용한다." } },
} as const

export { Popover, PopoverTrigger, PopoverAnchor, PopoverContent, popoverVariants, popoverVariantsConfig, componentContract }
