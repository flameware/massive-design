import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const spinnerVariantsConfig = {
  variants: { size: { sm: "size-4", default: "size-5", lg: "size-6" } },
  defaultVariants: { size: "default" },
} as const
const spinnerVariants = cva("animate-spin", spinnerVariantsConfig)
function Spinner({ className, size = "default", ...props }: React.ComponentProps<"svg"> & VariantProps<typeof spinnerVariants>) {
  return <svg data-slot="spinner" role="status" aria-label="로딩 중" viewBox="0 0 24 24" className={cn(spinnerVariants({ size, className }))} {...props}><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3"/><path d="M21 12a9 9 0 0 0-9-9" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3"/></svg>
}

const componentContract = {
  name: "spinner", source: "src/components/ui/spinner.tsx",
  publicExports: ["Spinner", "spinnerVariants", "spinnerVariantsConfig"],
  config: spinnerVariantsConfig, className: (props: Record<string, string>) => cn(spinnerVariants(props)),
  anatomy: ["Spinner"], configurationStates: {},
  behaviors: {},
  reference: { example: "spinner", guidance: { use: "완료량을 알 수 없는 짧은 대기 상태를 간결하게 표시한다.", evidence: "거래 저장처럼 소요 시간을 예측할 수 없는 비동기 동작에 즉각적인 대기 피드백이 필요하다.", limits: "완료량을 알 수 있으면 Progress를 쓰고, 장시간 대기의 설명과 취소 동작은 소비처가 별도로 제공한다." } },
} as const
export { Spinner, spinnerVariants, spinnerVariantsConfig, componentContract }
