import * as React from "react"
import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const dropdownMenuVariantsConfig = { variants: {}, defaultVariants: {} } as const
const dropdownMenuVariants = cva("min-w-32 rounded-md border bg-popover p-1 text-popover-foreground shadow-md", dropdownMenuVariantsConfig)
function DropdownMenu(props: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) { return <DropdownMenuPrimitive.Root {...props} /> }
function DropdownMenuTrigger(props: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>) { return <DropdownMenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} /> }
function DropdownMenuContent({ className, sideOffset = 4, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) { return <DropdownMenuPrimitive.Portal><DropdownMenuPrimitive.Content data-slot="dropdown-menu" sideOffset={sideOffset} className={cn(dropdownMenuVariants({ className }))} {...props} /></DropdownMenuPrimitive.Portal> }
function DropdownMenuItem({ className, inset, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & { inset?: boolean }) { return <DropdownMenuPrimitive.Item data-slot="dropdown-menu-item" data-inset={inset} className={cn("state [--ds-state-base:var(--popover)] relative flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset=true]:pl-8", className)} {...props} /> }
function DropdownMenuLabel({ className, inset, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & { inset?: boolean }) { return <DropdownMenuPrimitive.Label data-slot="dropdown-menu-label" data-inset={inset} className={cn("px-2 py-1.5 text-xs font-medium data-[inset=true]:pl-8", className)} {...props} /> }
function DropdownMenuSeparator({ className, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) { return <DropdownMenuPrimitive.Separator data-slot="dropdown-menu-separator" className={cn("-mx-1 my-1 h-px bg-border", className)} {...props} /> }
function DropdownMenuGroup(props: React.ComponentProps<typeof DropdownMenuPrimitive.Group>) { return <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} /> }
const componentContract = {
  name: "dropdown-menu", source: "src/components/ui/dropdown-menu.tsx",
  publicExports: ["DropdownMenu", "DropdownMenuTrigger", "DropdownMenuContent", "DropdownMenuItem", "DropdownMenuLabel", "DropdownMenuSeparator", "DropdownMenuGroup", "dropdownMenuVariants", "dropdownMenuVariantsConfig"],
  config: dropdownMenuVariantsConfig, className: (props: Record<string, string>) => cn(dropdownMenuVariants(props)),
  anatomy: ["DropdownMenu", "DropdownMenuTrigger", "DropdownMenuContent", "DropdownMenuGroup*", "DropdownMenuLabel?", "DropdownMenuItem*", "DropdownMenuSeparator?"],
  configurationStates: { open: ["closed", "open"] },
  reference: { example: "dropdown-menu", guidance: { use: "현재 맥락에 속하는 보조 동작을 묶는다.", evidence: "각 투자 행의 수정·삭제 같은 행 메뉴 진입점에 필요하다.", limits: "삭제 확인과 실제 동작 로직은 포함하지 않는다." } },
} as const
export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuGroup, dropdownMenuVariants, dropdownMenuVariantsConfig, componentContract }
