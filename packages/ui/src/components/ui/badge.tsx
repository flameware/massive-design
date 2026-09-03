import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/* `variant`는 의미 계열만 채운다 — 이것은 upstream과의 어긋남이 아니다. 이 축은 루트
 * 자신이 어떤 표면으로 서는가를 이름하고 의미·강조·형태 세 차원 중 해당하는 것만 채우면
 * 되며(ADR-0019), 의미만 채운 것은 `Alert`·`Toast`와 같다. upstream의 `outline`·`ghost`·
 * `link`(채움 종류)를 더하지 않는 근거는 성질이 다른 값이라서가 아니라 실측 수요가
 * 없어서다 — `Button`이 이미 한 축에 의미와 강조를 함께 담고 있어 섞는 것 자체는 금지되지
 * 않는다(#123, #118 규칙 2, #173). 수요가 확인되면 여는 것이 기본값이고, 같은 축에 올지
 * 두 번째 축이 될지는 그때 정한다 — 파생 채널이 두 차원을 곱해야 하면 별도 축이고
 * 실제로는 하나만 고르는 것이면 같은 축이다(ADR-0019). */
const badgeVariantsConfig = {
  variants: { variant: {
    neutral: "bg-secondary text-secondary-foreground",
    accent: "bg-primary-soft text-primary-text",
    success: "bg-success-soft text-success-text",
    danger: "bg-destructive-soft text-destructive-text",
  } },
  defaultVariants: { variant: "neutral" },
} as const
const badgeVariants = cva("inline-flex w-fit shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-medium", badgeVariantsConfig)
function Badge({ className, variant = "neutral", ...props }: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span data-slot="badge" data-variant={variant} className={cn(badgeVariants({ variant, className }))} {...props} />
}
const componentContract = {
  name: "badge", source: "src/components/ui/badge.tsx",
  publicExports: ["Badge", "badgeVariants", "badgeVariantsConfig"],
  config: badgeVariantsConfig, className: (props: Record<string, string>) => cn(badgeVariants(props)),
  anatomy: ["Badge"], configurationStates: {},
  behaviors: {},
  reference: { example: "badge", guidance: { use: "짧은 분류와 상태를 보조한다.", evidence: "매수·매도, 시장, 손익 의미를 neutral·accent·success·danger에 소비처가 매핑한다.", limits: "도메인 값을 variant 이름으로 추가하지 않는다 — 매수·매도·손익 같은 의미는 소비처가 neutral·accent·success·danger에 매핑한다. `variant`는 의미 계열만 채우고, upstream의 `outline`·`ghost`·`link`는 실측 수요가 확인되면 연다 — 근거: ADR-0019" } },
} as const
export { Badge, badgeVariants, badgeVariantsConfig, componentContract }
