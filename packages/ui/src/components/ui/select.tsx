import * as React from "react"
import { Select as SelectPrimitive } from "radix-ui"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const selectVariantsConfig = { variants: {}, defaultVariants: {} } as const
const selectVariants = cva("flex h-9 w-full items-center justify-between gap-2 rounded-md border bg-background px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-focus-contrast focus-visible:ring-[3px] focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50", selectVariantsConfig)
function Select(props: React.ComponentProps<typeof SelectPrimitive.Root>) { return <SelectPrimitive.Root {...props} /> }
function SelectValue(props: React.ComponentProps<typeof SelectPrimitive.Value>) { return <SelectPrimitive.Value data-slot="select-value" {...props} /> }
function SelectTrigger({ className, children, ...props }: React.ComponentProps<typeof SelectPrimitive.Trigger>) { return <SelectPrimitive.Trigger data-slot="select" className={cn(selectVariants({ className }))} {...props}>{children}<SelectPrimitive.Icon aria-hidden="true">⌄</SelectPrimitive.Icon></SelectPrimitive.Trigger> }
function SelectContent({ className, children, position = "popper", ...props }: React.ComponentProps<typeof SelectPrimitive.Content>) { return <SelectPrimitive.Portal><SelectPrimitive.Content data-slot="select-content" position={position} className={cn("z-50 max-h-60 min-w-32 overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md", className)} {...props}><SelectPrimitive.Viewport>{children}</SelectPrimitive.Viewport></SelectPrimitive.Content></SelectPrimitive.Portal> }
function SelectItem({ className, children, ...props }: React.ComponentProps<typeof SelectPrimitive.Item>) { return <SelectPrimitive.Item data-slot="select-item" className={cn("state [--ds-state-base:var(--popover)] relative flex w-full cursor-default items-center rounded-sm py-1.5 pr-8 pl-2 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className)} {...props}><SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText><SelectPrimitive.ItemIndicator className="absolute right-2">✓</SelectPrimitive.ItemIndicator></SelectPrimitive.Item> }
function SelectLabel({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Label>) { return <SelectPrimitive.Label data-slot="select-label" className={cn("px-2 py-1.5 text-xs font-medium text-muted-foreground", className)} {...props} /> }
function SelectSeparator({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Separator>) { return <SelectPrimitive.Separator data-slot="select-separator" className={cn("-mx-1 my-1 h-px bg-border", className)} {...props} /> }
function SelectGroup(props: React.ComponentProps<typeof SelectPrimitive.Group>) { return <SelectPrimitive.Group data-slot="select-group" {...props} /> }
const componentContract = {
  name: "select", source: "src/components/ui/select.tsx",
  publicExports: ["Select", "SelectValue", "SelectTrigger", "SelectContent", "SelectItem", "SelectLabel", "SelectSeparator", "SelectGroup", "selectVariants", "selectVariantsConfig"],
  config: selectVariantsConfig, className: (props: Record<string, string>) => cn(selectVariants(props)),
  anatomy: ["Select", "SelectTrigger", "SelectValue", "SelectContent", "SelectGroup*", "SelectLabel?", "SelectItem*", "SelectSeparator?"],
  configurationStates: { open: ["closed", "open"] }, drawnBy: { open: "표면의 존재가 곧 열림이다 — 닫힌 상태에는 그릴 노드가 없다" },
  behaviors: {
    closedTypeahead: { kind: "implicit-change", surface: "SelectTrigger", origin: "inherited", why: "radix-ui Select가 트리거에 typeahead를 걸어 갖고 오는 상속 표면이다 — **닫힌 트리거에 초점이 있을 때 글자를 치면 목록이 열리지 않은 채 값이 그 글자로 시작하는 항목으로 바뀐다**(트리거의 typeahead가 `onValueChange`를 직접 부른다. 열린 콘텐츠 안의 typeahead는 초점만 옮기므로 이쪽이 아니다). 표면이 열리지 않으므로 사용자가 무엇이 바뀌었는지 보는 것은 `SelectValue`뿐이고, 생성된 스토리는 값을 고정해 렌더하므로 이 경로를 한 번도 밟지 않는다. **끄는 자리가 없다**(#187)." },
  },
  reference: { example: "select", guidance: { use: "제한된 값 하나를 선택한다.", evidence: "계좌·시장 등 투자 이력 필터의 closed·open 구성 상태가 필요하다.", limits: "필터 모델과 화면 전용 라벨을 내장하지 않는다. 열린 목록의 위치 계산(upstream의 `alignItemWithTrigger`)은 계약하지 않는다 — 동작이라 파생 채널에 실리지 않는다(#121)." } },
} as const
export { Select, SelectValue, SelectTrigger, SelectContent, SelectItem, SelectLabel, SelectSeparator, SelectGroup, selectVariants, selectVariantsConfig, componentContract }
