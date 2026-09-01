import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

const fieldVariantsConfig = {
  variants: {
    orientation: {
      vertical: "flex flex-col gap-2",
      horizontal: "flex items-center gap-3",
      responsive: "flex flex-col gap-2 @md/field-group:flex-row @md/field-group:items-center @md/field-group:gap-3",
    },
  },
  defaultVariants: { orientation: "vertical" },
} as const
const fieldVariants = cva("group/field w-full data-[invalid=true]:text-destructive-text", fieldVariantsConfig)

function Field({ className, orientation = "vertical", ...props }: React.ComponentProps<"div"> & VariantProps<typeof fieldVariants>) {
  return <div role="group" data-slot="field" data-orientation={orientation} className={cn(fieldVariants({ orientation, className }))} {...props} />
}
function FieldLabel({ className, ...props }: React.ComponentProps<typeof Label>) { return <Label data-slot="field-label" className={cn("w-fit", className)} {...props} /> }
function FieldContent({ className, ...props }: React.ComponentProps<"div">) { return <div data-slot="field-content" className={cn("flex flex-1 flex-col gap-1", className)} {...props} /> }
function FieldDescription({ className, ...props }: React.ComponentProps<"p">) { return <p data-slot="field-description" className={cn("text-sm text-muted-foreground", className)} {...props} /> }
function FieldError({ className, ...props }: React.ComponentProps<"p">) { return <p data-slot="field-error" role="alert" className={cn("text-sm text-destructive-text", className)} {...props} /> }
function FieldGroup({ className, ...props }: React.ComponentProps<"div">) { return <div data-slot="field-group" className={cn("@container/field-group flex flex-col gap-6", className)} {...props} /> }
function FieldSet({ className, ...props }: React.ComponentProps<"fieldset">) { return <fieldset data-slot="field-set" className={cn("flex flex-col gap-4", className)} {...props} /> }
function FieldLegend({ className, ...props }: React.ComponentProps<"legend">) { return <legend data-slot="field-legend" className={cn("text-base font-semibold", className)} {...props} /> }

const componentContract = {
  name: "field", source: "src/components/ui/field.tsx",
  publicExports: ["Field", "FieldLabel", "FieldContent", "FieldDescription", "FieldError", "FieldGroup", "FieldSet", "FieldLegend", "fieldVariants", "fieldVariantsConfig"],
  config: fieldVariantsConfig, className: (props: Record<string, string>) => cn(fieldVariants(props)),
  anatomy: ["Field", "FieldLabel", "Control", "FieldDescription?", "FieldError?", "FieldContent?", "FieldGroup?", "FieldSet?", "FieldLegend?"], configurationStates: { validity: ["valid", "invalid"] }, drawnBy: { validity: { attribute: "data-invalid", values: { invalid: "true" } } },
  reference: { example: "field", guidance: { use: "라벨, 컨트롤, 도움말과 오류를 접근 가능한 한 필드로 조립한다.", evidence: "투자 입력 화면의 라벨·메모·검증 메시지를 일관된 구조로 묶어야 한다.", limits: "폼 상태 관리, 검증 규칙, 제출 동작은 소비처가 소유한다. `FieldLegend`의 legend/label 표현 축(upstream의 `variant`)은 계약하지 않는다 — 파트에 축이 생기고 label 모양이 `FieldLabel` 클래스를 복제하게 되는 진짜 표면이라 열 근거는 있으나 별도 effort로 미뤘다(#121)." } },
} as const

export { Field, FieldLabel, FieldContent, FieldDescription, FieldError, FieldGroup, FieldSet, FieldLegend, fieldVariants, fieldVariantsConfig, componentContract }
