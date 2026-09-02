import * as React from "react"
import { RadioGroup as RadioGroupPrimitive } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const radioGroupVariantsConfig = {
  variants: {
    orientation: {
      vertical: "grid gap-3",
      horizontal: "flex flex-wrap items-center gap-4",
    },
  },
  defaultVariants: { orientation: "vertical" },
} as const
const radioGroupVariants = cva("outline-none", radioGroupVariantsConfig)

function RadioGroup({ className, orientation = "vertical", ...props }: React.ComponentProps<typeof RadioGroupPrimitive.Root> & VariantProps<typeof radioGroupVariants>) {
  return <RadioGroupPrimitive.Root data-slot="radio-group" orientation={orientation} className={cn(radioGroupVariants({ orientation, className }))} {...props} />
}

function RadioGroupItem({ className, ...props }: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return <RadioGroupPrimitive.Item data-slot="radio-group-item" className={cn("state [--ds-state-base:var(--background)] size-4 shrink-0 rounded-full border shadow-xs outline-none focus-visible:border-focus-contrast focus-visible:ring-[3px] focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[state=checked]:[--ds-state-base:var(--primary)] data-[state=checked]:text-primary-foreground", className)} {...props}><RadioGroupPrimitive.Indicator data-slot="radio-group-indicator" className="flex items-center justify-center text-[8px] leading-none">●</RadioGroupPrimitive.Indicator></RadioGroupPrimitive.Item>
}

const componentContract = {
  name: "radio-group", source: "src/components/ui/radio-group.tsx",
  publicExports: ["RadioGroup", "RadioGroupItem", "radioGroupVariants", "radioGroupVariantsConfig"],
  config: radioGroupVariantsConfig, className: (props: Record<string, string>) => cn(radioGroupVariants(props)),
  anatomy: ["RadioGroup", "RadioGroupItem*", "Indicator"], configurationStates: { checked: ["unchecked", "checked"] }, drawnBy: { checked: "`RadioGroupItem`이 `data-[state=checked]`로 그리지만 그 파트가 아직 계약에 없다(#155)" },
  behaviors: {
    focusChecks: { kind: "implicit-change", surface: "RadioGroupItem", origin: "inherited", why: "radix-ui RadioGroup이 갖고 오는 상속 표면이다 — **화살표로 초점이 도착하는 것만으로 그 항목이 선택된다**(초점 핸들러가 스스로 `click()`을 부른다). APG가 라디오 그룹에 요구하는 동작이지만 계기가 명시적 활성화가 아니라 초점 도착이고, `checked` 구성 상태가 그 자리에서 움직이므로 사람이 확인해야 한다. **끄는 자리가 없다** — upstream에 스위치가 없으므로 목록을 훑기만 하려는 사용자도 값을 바꾸게 되고, 그 되돌림 경로는 반대 방향 화살표뿐이다(#187)." },
  },
  reference: { example: "radio-group", guidance: { use: "서로 배타적인 선택지에서 값 하나를 고른다.", evidence: "투자 계좌와 거래 유형처럼 한 번에 하나만 유효한 선택이 필요하다.", limits: "선택지 데이터와 제출 모델은 소비처가 소유한다." } },
} as const

export { RadioGroup, RadioGroupItem, radioGroupVariants, radioGroupVariantsConfig, componentContract }
