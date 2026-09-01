import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

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
  reference: { example: "badge", guidance: { use: "짧은 분류와 상태를 보조한다.", evidence: "매수·매도, 시장, 손익 의미를 neutral·accent·success·danger에 소비처가 매핑한다.", limits: "도메인 값을 variant 이름으로 추가하지 않는다." } },
} as const
export { Badge, badgeVariants, badgeVariantsConfig, componentContract }
