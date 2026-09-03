import * as React from "react"
import { Collapsible as CollapsiblePrimitive } from "radix-ui"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

const collapsibleVariantsConfig = { variants: {}, defaultVariants: {} } as const
const collapsibleVariants = cva("w-full", collapsibleVariantsConfig)

function Collapsible({ className, ...props }: React.ComponentProps<typeof CollapsiblePrimitive.Root>) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" className={cn(collapsibleVariants({ className }))} {...props} />
}

function CollapsibleTrigger(props: React.ComponentProps<typeof CollapsiblePrimitive.Trigger>) {
  return <CollapsiblePrimitive.Trigger data-slot="collapsible-trigger" {...props} />
}

const CONTENT = "overflow-hidden text-sm data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down"

function CollapsibleContent({ className, ...props }: React.ComponentProps<typeof CollapsiblePrimitive.Content>) {
  return <CollapsiblePrimitive.Content data-slot="collapsible-content" className={cn(CONTENT, className)} {...props} />
}

const staticPart = (className: string) => ({
  config: { variants: {}, defaultVariants: {} } as const,
  className: () => className,
})

const componentContract = {
  name: "collapsible", source: "src/components/ui/collapsible.tsx",
  publicExports: ["Collapsible", "CollapsibleTrigger", "CollapsibleContent", "collapsibleVariants", "collapsibleVariantsConfig"],
  config: collapsibleVariantsConfig, className: (props: Record<string, string>) => cn(collapsibleVariants(props)),
  anatomy: ["Collapsible", "CollapsibleTrigger", "CollapsibleContent"], configurationStates: { open: ["closed", "open"] }, drawnBy: { open: { attribute: "data-state", values: { open: "open" } } },
  parts: {
    CollapsibleContent: staticPart(CONTENT),
  },
  behaviors: {},
  reference: { example: "collapsible", guidance: { use: "한 덩어리의 보조 내용을 명시적인 트리거로 펼치거나 접는다.", evidence: "필터의 고급 조건이나 부가 설명처럼 기본 흐름을 방해하지 않아야 하는 한 영역이 필요하다.", limits: "여러 형제 섹션의 상호 배타적 펼침은 Accordion을 사용하고 트리거의 레이블과 접근 가능한 이름은 소비처가 제공한다." } },
} as const

export { Collapsible, CollapsibleTrigger, CollapsibleContent, collapsibleVariants, collapsibleVariantsConfig, componentContract }
