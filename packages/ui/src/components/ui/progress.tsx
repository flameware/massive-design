import * as React from "react"
import { Progress as ProgressPrimitive } from "radix-ui"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

const progressVariantsConfig = { variants: {}, defaultVariants: {} } as const
const progressVariants = cva("relative h-2 w-full overflow-hidden rounded-full bg-secondary", progressVariantsConfig)

function Progress({ className, value, ...props }: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  const percent = Math.max(0, Math.min(100, value ?? 0))
  return <ProgressPrimitive.Root data-slot="progress" className={cn(progressVariants({ className }))} value={value} {...props}>
    <ProgressPrimitive.Indicator data-slot="progress-indicator" className="h-full w-full bg-primary transition-transform" style={{ transform: `translateX(-${100 - percent}%)` }} />
  </ProgressPrimitive.Root>
}

const componentContract = {
  name: "progress", source: "src/components/ui/progress.tsx",
  publicExports: ["Progress", "progressVariants", "progressVariantsConfig"],
  config: progressVariantsConfig, className: (props: Record<string, string>) => cn(progressVariants(props)),
  anatomy: ["Progress", "ProgressIndicator"], configurationStates: { value: ["empty", "partial", "complete"] }, drawnBy: { value: "`ProgressIndicator`의 인라인 `transform`이 그린다 — 계산된 값이라 클래스가 아니고 그 파트도 아직 계약에 없다(#155)" },
  behaviors: {},
  reference: { example: "progress", guidance: { use: "완료량을 알 수 있는 작업의 진행 정도를 0에서 100 사이 값으로 보여준다.", evidence: "투자 내역 가져오기처럼 처리할 전체 항목 수를 아는 작업에 진행률 피드백이 필요하다.", limits: "완료량을 모르는 대기에는 Spinner를 사용하고 value의 계산이나 진행 상태 문구는 소비처가 제공한다." } },
} as const

export { Progress, progressVariants, progressVariantsConfig, componentContract }
