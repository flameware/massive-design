import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariantsConfig = {
  variants: {
    variant: {
      default: "bg-background text-foreground",
      success: "bg-success-soft text-success-text",
      warning: "bg-warning-soft text-warning-text",
      destructive: "bg-destructive-soft text-destructive-text",
    },
  },
  defaultVariants: { variant: "default" },
} as const

const alertVariants = cva("relative grid w-full gap-1 rounded-lg border p-4 text-sm", alertVariantsConfig)

function Alert({ className, variant = "default", ...props }: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return <div data-slot="alert" role="alert" className={cn(alertVariants({ variant, className }))} {...props} />
}
function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="alert-title" className={cn("font-medium", className)} {...props} />
}
function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="alert-description" className={cn("text-sm", className)} {...props} />
}

const componentContract = {
  name: "alert", source: "src/components/ui/alert.tsx",
  publicExports: ["Alert", "AlertTitle", "AlertDescription", "alertVariants", "alertVariantsConfig"],
  config: alertVariantsConfig, className: (props: Record<string, string>) => cn(alertVariants(props)),
  anatomy: ["Alert", "AlertTitle?", "AlertDescription"], configurationStates: {},
  reference: { example: "alert", guidance: { use: "화면 안에서 사용자가 알아야 할 지속적인 피드백이나 주의 사항을 의미별로 전달한다.", evidence: "투자 데이터 동기화 결과와 가격 지연 경고를 성공·warning·danger 의미로 구별해야 한다.", limits: "잠깐 나타나는 작업 결과에는 Toast를 사용하고, 모든 안내를 role=alert로 반복해 쌓지 않는다. upstream의 `AlertAction`과 아이콘 슬롯은 계약하지 않는다 — `AlertAction`은 열 근거가 있으나 별도 effort로 미뤘고, 아이콘 컬럼은 이 Alert이 1열 그리드라 도입하면 기존 인스턴스의 격자를 재해석하는 breaking이다(#121)." } },
} as const

export { Alert, AlertTitle, AlertDescription, alertVariants, alertVariantsConfig, componentContract }
