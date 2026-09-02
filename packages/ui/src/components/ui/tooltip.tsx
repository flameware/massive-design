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
    skipDelayOpen: { kind: "open-cause", surface: "TooltipContent", origin: "inherited", control: "skipDelayDuration", why: "`TooltipProvider`의 `skipDelayDuration` 기본값 300ms를 상속한다 — **직전에 툴팁이 열렸다 닫힌 뒤 그 시간 안이면 다음 툴팁은 지연 없이 즉시 열린다.** 같은 트리거를 두 번째로 지날 때의 반응이 첫 번째와 다르다는 뜻이고, 우리가 정한 `delayDuration = 300`과 달리 이 값은 타이핑한 적이 없다 — #127의 `delayDuration` 상속과 같은 모양이다(#187)." },
    hoverableContent: { kind: "open-cause", surface: "TooltipContent", origin: "inherited", control: "disableHoverableContent", why: "`disableHoverableContent` 기본값 `false`를 상속한다 — **열린 툴팁 위로 포인터를 옮겨도 닫히지 않고, 트리거와 콘텐츠 사이의 빈틈을 건너는 동안도 열림이 유지된다.** 툴팁 안에는 초점 받을 것을 두지 않으므로 이것은 읽는 시간을 버는 수단이지 상호작용 경로가 아니다. 소비처가 `Tooltip`·`TooltipProvider`의 prop으로 끈다(#187)." },
    hoverOpen: { kind: "open-cause", surface: "TooltipContent", origin: "ours", control: "delayDuration", why: "포인터를 얹으면 지연 후 열린다. 지연은 `TooltipProvider`가 `delayDuration = 300`으로 **우리가 정해** 통과시키므로 상속이 아니다 — 그러나 그 값이 계약 어디에도 적힌 적 없다는 점은 상속 표면과 같다(#149). 소비처가 provider prop으로 바꾼다." },
  },
  reference: { example: "tooltip", guidance: { use: "아이콘이나 축약된 컨트롤의 의미를 짧은 텍스트로 보충한다.", evidence: "투자 테이블의 아이콘 전용 작업 버튼이 가리키는 행동을 포인터와 키보드 포커스 모두에 설명해야 한다.", limits: "필수 정보나 상호작용 요소를 Tooltip 안에만 두지 않는다." } },
} as const

export { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent, tooltipVariants, tooltipVariantsConfig, componentContract }
