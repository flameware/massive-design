import * as React from "react"
import { Tabs as TabsPrimitive } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const tabsVariantsConfig = {
  variants: {
    orientation: {
      horizontal: "flex flex-col gap-2",
      vertical: "flex flex-row gap-4",
    },
  },
  defaultVariants: { orientation: "horizontal" },
} as const

const tabsVariants = cva("w-full", tabsVariantsConfig)

function Tabs({ className, orientation = "horizontal", ...props }: React.ComponentProps<typeof TabsPrimitive.Root> & VariantProps<typeof tabsVariants>) {
  return <TabsPrimitive.Root data-slot="tabs" orientation={orientation} className={cn(tabsVariants({ orientation, className }))} {...props} />
}

function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return <TabsPrimitive.List data-slot="tabs-list" className={cn("inline-flex h-9 w-fit items-center justify-center rounded-lg bg-muted p-[3px] text-muted-foreground", className)} {...props} />
}

function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return <TabsPrimitive.Trigger data-slot="tabs-trigger" className={cn("state [--ds-state-base:var(--muted)] inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap outline-none focus-visible:border-focus-contrast focus-visible:ring-[3px] focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[state=active]:[--ds-state-base:var(--background)] data-[state=active]:text-foreground data-[state=active]:shadow-sm", className)} {...props} />
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return <TabsPrimitive.Content data-slot="tabs-content" className={cn("flex-1 outline-none", className)} {...props} />
}

const componentContract = {
  name: "tabs", source: "src/components/ui/tabs.tsx",
  publicExports: ["Tabs", "TabsList", "TabsTrigger", "TabsContent", "tabsVariants", "tabsVariantsConfig"],
  config: tabsVariantsConfig, className: (props: Record<string, string>) => cn(tabsVariants(props)),
  anatomy: ["Tabs", "TabsList", "TabsTrigger*", "TabsContent*"], configurationStates: { selected: ["inactive", "active"] },
  reference: { example: "tabs", guidance: { use: "같은 맥락의 콘텐츠 패널을 한 번에 하나씩 전환하며 가로 또는 세로로 조립한다.", evidence: "투자 상세에서 보유 현황과 거래 내역처럼 동일 대상의 병렬 보기를 화면 이동 없이 전환해야 한다.", limits: "서로 독립된 작업 흐름이나 URL로 직접 접근해야 하는 화면 탐색에는 링크나 내비게이션을 사용한다." } },
} as const

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsVariants, tabsVariantsConfig, componentContract }
