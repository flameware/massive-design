import * as React from "react"
import { Switch as SwitchPrimitive } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/* 히트 영역  가로(36/28)는 이미 24를 넘어 그대로 두고, 세로만 `after:`로 중심 대칭
 * 확장한다(#111 결정 2·5, #230) — `border`가 padding box를 먹으므로 목표 24에서
 * 그 몫을 더한다: `default`(20px)는 ±3px, `sm`(16px)는 ±5px, 둘 다 24까지(재실측이
 * 잡아낸 값). 가로로 촘촘한 Switch 목록에서는 안 겹치지만 세로로 쌓이면 이웃과 겹칠
 * 수 있다 — 해소하지 않고 여기 선언한다. */
const switchVariantsConfig = {
  variants: {
    size: {
      sm: "h-4 w-7 after:-inset-y-[5px] [&_[data-slot=switch-thumb]]:size-3 [&_[data-slot=switch-thumb]]:data-[state=checked]:translate-x-3",
      default: "h-5 w-9 after:-inset-y-[3px] [&_[data-slot=switch-thumb]]:size-4 [&_[data-slot=switch-thumb]]:data-[state=checked]:translate-x-4",
    },
  },
  defaultVariants: { size: "default" },
} as const
/* off 트랙은 **컨트롤 어포던스**다 — 켜고 끄려고 누르는 면 자체라 앉는 면과 갈려
 * 보여야 한다. 그래서 상태 층이 얹히는 base가 중립 soft가 아니라 solid다(#109). */
const switchVariants = cva("state [--ds-state-base:var(--neutral-solid)] relative inline-flex shrink-0 items-center rounded-full border border-transparent shadow-xs outline-none transition-all after:absolute after:inset-x-0 focus-visible:border-focus-contrast focus-visible:ring-[3px] focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:[--ds-state-base:var(--primary)]", switchVariantsConfig)

function Switch({ className, size = "default", ...props }: React.ComponentProps<typeof SwitchPrimitive.Root> & VariantProps<typeof switchVariants>) {
  return <SwitchPrimitive.Root data-slot="switch" data-size={size} className={cn(switchVariants({ size, className }))} {...props}><SwitchPrimitive.Thumb data-slot="switch-thumb" className="pointer-events-none block translate-x-0 rounded-full bg-background ring-0 transition-transform" /></SwitchPrimitive.Root>
}

const componentContract = {
  name: "switch", source: "src/components/ui/switch.tsx",
  publicExports: ["Switch", "switchVariants", "switchVariantsConfig"],
  config: switchVariantsConfig, className: (props: Record<string, string>) => cn(switchVariants(props)),
  anatomy: ["Switch", "Thumb"], configurationStates: { checked: ["unchecked", "checked"] }, drawnBy: { checked: { attribute: "data-state", values: { checked: "checked" } } },
  behaviors: {},
  reference: { example: "switch", guidance: { use: "즉시 적용되는 이진 설정을 켜거나 끈다.", evidence: "배당 재투자나 알림처럼 현재 활성 여부가 중요한 설정이 필요하다.", limits: "확인이 필요한 위험 동작이나 세 값 이상의 선택에는 쓰지 않는다. off 트랙은 누르는 컨트롤 어포던스이므로 자기가 앉는 면에 대해 비텍스트 대비 3:1(WCAG 1.4.11)을 만족해야 하고, Progress·Slider의 잔여 트랙과 같은 중립 soft를 쓰지 않는다." } },
} as const

export { Switch, switchVariants, switchVariantsConfig, componentContract }
