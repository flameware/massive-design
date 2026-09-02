import * as React from "react"
import { Tooltip as TooltipPrimitive } from "radix-ui"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const tooltipVariantsConfig = { variants: {}, defaultVariants: {} } as const
const tooltipVariants = cva("max-w-xs rounded-md bg-[var(--ds-bg-inverse)] px-3 py-1.5 text-xs text-[var(--ds-fg-on-inverse)] shadow-sm", tooltipVariantsConfig)

function TooltipProvider({ delayDuration = 300, ...props }: React.ComponentProps<typeof TooltipPrimitive.Provider>) { return <TooltipPrimitive.Provider delayDuration={delayDuration} {...props} /> }
function Tooltip(props: React.ComponentProps<typeof TooltipPrimitive.Root>) { return <TooltipPrimitive.Root {...props} /> }
function TooltipTrigger(props: React.ComponentProps<typeof TooltipPrimitive.Trigger>) { return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} /> }
function TooltipContent({ className, sideOffset = 4, ...props }: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return <TooltipPrimitive.Portal><TooltipPrimitive.Content data-slot="tooltip-content" sideOffset={sideOffset} className={cn(tooltipVariants({ className }))} {...props} /></TooltipPrimitive.Portal>
}

const componentContract = {
  name: "tooltip", source: "src/components/ui/tooltip.tsx",
  publicExports: ["TooltipProvider", "Tooltip", "TooltipTrigger", "TooltipContent", "tooltipVariants", "tooltipVariantsConfig"],
  config: tooltipVariantsConfig, className: (props: Record<string, string>) => cn(tooltipVariants(props)),
  anatomy: ["TooltipProvider", "Tooltip", "TooltipTrigger", "TooltipContent"],
  configurationStates: { open: ["closed", "open"] }, drawnBy: { open: "표면의 존재가 곧 열림이다 — 닫힌 상태에는 그릴 노드가 없다" },
  behaviors: {
    hoverOpen: { kind: "open-cause", surface: "TooltipContent", origin: "ours", control: "delayDuration", why: "포인터를 얹으면 지연 후 열린다. 지연은 `TooltipProvider`가 `delayDuration = 300`으로 **우리가 정해** 통과시키므로 상속이 아니다 — 그러나 그 값이 계약 어디에도 적힌 적 없다는 점은 상속 표면과 같다(#149). 소비처가 provider prop으로 바꾼다." },
  },
  reference: { example: "tooltip", guidance: { use: "아이콘이나 축약된 컨트롤의 의미를 짧은 텍스트로 보충한다.", evidence: "투자 테이블의 아이콘 전용 작업 버튼이 가리키는 행동을 포인터와 키보드 포커스 모두에 설명해야 한다.", limits: "필수 정보나 상호작용 요소를 Tooltip 안에만 두지 않는다." } },
} as const

export { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent, tooltipVariants, tooltipVariantsConfig, componentContract }
