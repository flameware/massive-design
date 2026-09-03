import * as React from "react"
import { cn } from "@/lib/utils"

const listRowVariantsConfig = { variants: {}, defaultVariants: {} } as const
const listRowVariants = (options?: { className?: string }) => cn("state [--ds-state-base:var(--background)] flex min-w-0 items-center gap-3 rounded-md px-3 py-3 data-[state=selected]:bg-primary-soft", options?.className)

const LEADING = "shrink-0"
const CONTENT = "min-w-0 flex-1"
const TITLE = "truncate text-sm font-medium"
const DESCRIPTION = "truncate text-sm text-muted-foreground"
const META = "ml-auto shrink-0 text-sm text-muted-foreground"
const TRAILING = "shrink-0"

function ListRow({ className, ...props }: React.ComponentProps<"div">) { return <div data-slot="list-row" className={listRowVariants({ className })} {...props} /> }
function ListRowLeading({ className, ...props }: React.ComponentProps<"div">) { return <div data-slot="list-row-leading" className={cn(LEADING, className)} {...props} /> }
function ListRowContent({ className, ...props }: React.ComponentProps<"div">) { return <div data-slot="list-row-content" className={cn(CONTENT, className)} {...props} /> }
function ListRowTitle({ className, ...props }: React.ComponentProps<"div">) { return <div data-slot="list-row-title" className={cn(TITLE, className)} {...props} /> }
function ListRowDescription({ className, ...props }: React.ComponentProps<"div">) { return <div data-slot="list-row-description" className={cn(DESCRIPTION, className)} {...props} /> }
function ListRowMeta({ className, ...props }: React.ComponentProps<"div">) { return <div data-slot="list-row-meta" className={cn(META, className)} {...props} /> }
function ListRowTrailing({ className, ...props }: React.ComponentProps<"div">) { return <div data-slot="list-row-trailing" className={cn(TRAILING, className)} {...props} /> }

const staticPart = (className: string) => ({
  config: { variants: {}, defaultVariants: {} } as const,
  className: () => className,
})

const componentContract = {
  name: "list-row", source: "src/components/ui/list-row.tsx",
  publicExports: ["ListRow", "ListRowLeading", "ListRowContent", "ListRowTitle", "ListRowDescription", "ListRowMeta", "ListRowTrailing", "listRowVariants", "listRowVariantsConfig"],
  config: listRowVariantsConfig, className: (props: Record<string, string>) => cn(listRowVariants(props)),
  anatomy: ["ListRow", "ListRowLeading?", "ListRowContent", "ListRowTitle", "ListRowDescription?", "ListRowMeta?", "ListRowTrailing?"],
  configurationStates: { row: ["default", "selected"] }, drawnBy: { row: { attribute: "data-state", values: { selected: "selected" } } },
  parts: {
    ListRowLeading: staticPart(LEADING),
    ListRowContent: staticPart(CONTENT),
    ListRowTitle: staticPart(TITLE),
    ListRowDescription: staticPart(DESCRIPTION),
    ListRowMeta: staticPart(META),
    ListRowTrailing: staticPart(TRAILING),
  },
  behaviors: {},
  reference: { example: "list-row", guidance: { use: "모바일 폭에서 한 항목의 우선 정보와 보조 동작을 조립한다.", evidence: "데스크톱 Table과 같은 투자 이력을 모바일에서 긴 종목명·날짜·금액·손익으로 표현한다.", limits: "투자 도메인과 breakpoint 전환을 내장하지 않는다." } },
} as const
export { ListRow, ListRowLeading, ListRowContent, ListRowTitle, ListRowDescription, ListRowMeta, ListRowTrailing, listRowVariants, listRowVariantsConfig, componentContract }
