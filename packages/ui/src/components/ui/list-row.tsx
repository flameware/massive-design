import * as React from "react"
import { cn } from "@/lib/utils"

const listRowVariantsConfig = { variants: {}, defaultVariants: {} } as const
const listRowVariants = (options?: { className?: string }) => cn("state [--ds-state-base:var(--background)] flex min-w-0 items-center gap-3 rounded-md px-3 py-3 data-[state=selected]:bg-primary-soft", options?.className)

function ListRow({ className, ...props }: React.ComponentProps<"div">) { return <div data-slot="list-row" className={listRowVariants({ className })} {...props} /> }
function ListRowLeading({ className, ...props }: React.ComponentProps<"div">) { return <div data-slot="list-row-leading" className={cn("shrink-0", className)} {...props} /> }
function ListRowContent({ className, ...props }: React.ComponentProps<"div">) { return <div data-slot="list-row-content" className={cn("min-w-0 flex-1", className)} {...props} /> }
function ListRowTitle({ className, ...props }: React.ComponentProps<"div">) { return <div data-slot="list-row-title" className={cn("truncate text-sm font-medium", className)} {...props} /> }
function ListRowDescription({ className, ...props }: React.ComponentProps<"div">) { return <div data-slot="list-row-description" className={cn("truncate text-sm text-muted-foreground", className)} {...props} /> }
function ListRowMeta({ className, ...props }: React.ComponentProps<"div">) { return <div data-slot="list-row-meta" className={cn("ml-auto shrink-0 text-sm text-muted-foreground", className)} {...props} /> }
function ListRowTrailing({ className, ...props }: React.ComponentProps<"div">) { return <div data-slot="list-row-trailing" className={cn("shrink-0", className)} {...props} /> }

const componentContract = {
  name: "list-row", source: "src/components/ui/list-row.tsx",
  publicExports: ["ListRow", "ListRowLeading", "ListRowContent", "ListRowTitle", "ListRowDescription", "ListRowMeta", "ListRowTrailing", "listRowVariants", "listRowVariantsConfig"],
  config: listRowVariantsConfig, className: (props: Record<string, string>) => cn(listRowVariants(props)),
  anatomy: ["ListRow", "ListRowLeading?", "ListRowContent", "ListRowTitle", "ListRowDescription?", "ListRowMeta?", "ListRowTrailing?"],
  configurationStates: { row: ["default", "selected"] },
} as const
export { ListRow, ListRowLeading, ListRowContent, ListRowTitle, ListRowDescription, ListRowMeta, ListRowTrailing, listRowVariants, listRowVariantsConfig, componentContract }
