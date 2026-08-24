import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const itemVariantsConfig = {
  variants: {
    variant: { default: "", outline: "border", muted: "bg-muted" },
    size: { default: "gap-4 px-4 py-3", sm: "gap-3 px-3 py-2" },
  },
  defaultVariants: { variant: "default", size: "default" },
} as const
const itemVariants = cva("state [--ds-state-base:var(--background)] group/item flex min-w-0 items-center rounded-lg text-sm outline-none transition-colors focus-visible:border-focus-contrast focus-visible:ring-[3px] focus-visible:ring-ring data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 data-[state=selected]:[--ds-state-base:var(--accent)]", itemVariantsConfig)

const staticPart = (className: string) => ({
  config: { variants: {}, defaultVariants: {} } as const,
  className: () => className,
})

function Item({ className, variant = "default", size = "default", ...props }: React.ComponentProps<"div"> & VariantProps<typeof itemVariants>) { return <div data-slot="item" className={cn(itemVariants({ variant, size, className }))} {...props} /> }
function ItemMedia({ className, ...props }: React.ComponentProps<"div">) { return <div data-slot="item-media" className={cn("flex shrink-0 items-center justify-center text-muted-foreground [&_svg]:size-5", className)} {...props} /> }
function ItemContent({ className, ...props }: React.ComponentProps<"div">) { return <div data-slot="item-content" className={cn("flex min-w-0 flex-1 flex-col gap-1", className)} {...props} /> }
function ItemTitle({ className, ...props }: React.ComponentProps<"div">) { return <div data-slot="item-title" className={cn("line-clamp-1 font-medium", className)} {...props} /> }
function ItemDescription({ className, ...props }: React.ComponentProps<"p">) { return <p data-slot="item-description" className={cn("line-clamp-2 text-sm text-muted-foreground", className)} {...props} /> }
function ItemActions({ className, ...props }: React.ComponentProps<"div">) { return <div data-slot="item-actions" className={cn("flex shrink-0 items-center gap-2", className)} {...props} /> }
function ItemHeader({ className, ...props }: React.ComponentProps<"div">) { return <div data-slot="item-header" className={cn("flex w-full items-center justify-between gap-2", className)} {...props} /> }
function ItemFooter({ className, ...props }: React.ComponentProps<"div">) { return <div data-slot="item-footer" className={cn("flex w-full items-center justify-between gap-2", className)} {...props} /> }
function ItemGroup({ className, ...props }: React.ComponentProps<"div">) { return <div data-slot="item-group" className={cn("flex flex-col", className)} {...props} /> }
function ItemSeparator({ className, ...props }: React.ComponentProps<"div">) { return <div data-slot="item-separator" role="separator" className={cn("mx-4 border-t", className)} {...props} /> }

const componentContract = {
  name: "item", source: "src/components/ui/item.tsx",
  publicExports: ["Item", "ItemMedia", "ItemContent", "ItemTitle", "ItemDescription", "ItemActions", "ItemHeader", "ItemFooter", "ItemGroup", "ItemSeparator", "itemVariants", "itemVariantsConfig"],
  config: itemVariantsConfig, className: (props: Record<string, string>) => cn(itemVariants(props)),
  anatomy: ["Item", "ItemMedia?", "ItemContent", "ItemTitle", "ItemDescription?", "ItemActions?", "ItemHeader?", "ItemFooter?", "ItemGroup?", "ItemSeparator?"], configurationStates: { item: ["default", "selected"] },
  parts: {
    ItemMedia: staticPart("flex shrink-0 items-center justify-center text-muted-foreground [&_svg]:size-5"),
    ItemContent: staticPart("flex min-w-0 flex-1 flex-col gap-1"),
    ItemTitle: staticPart("line-clamp-1 font-medium"),
    ItemDescription: staticPart("line-clamp-2 text-sm text-muted-foreground"),
    ItemActions: staticPart("flex shrink-0 items-center gap-2"),
    ItemHeader: staticPart("flex w-full items-center justify-between gap-2"),
    ItemFooter: staticPart("flex w-full items-center justify-between gap-2"),
    ItemGroup: staticPart("flex flex-col"),
    ItemSeparator: staticPart("mx-4 border-t"),
  },
  reference: { example: "item", guidance: { use: "미디어, 주 정보, 보조 설명과 행동을 재배치 가능한 한 항목으로 조립한다.", evidence: "검색 결과, 선택 목록, 설정 행처럼 같은 정보 위계를 공유하지만 제품 의미가 다른 반복 항목이 필요하다.", limits: "탐색·선택·버튼 역할을 자동으로 부여하지 않으며 도메인 필드와 상호작용 의미는 소비처가 명시한다." } },
} as const

export { Item, ItemMedia, ItemContent, ItemTitle, ItemDescription, ItemActions, ItemHeader, ItemFooter, ItemGroup, ItemSeparator, itemVariants, itemVariantsConfig, componentContract }
