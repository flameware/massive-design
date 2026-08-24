import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const textareaVariantsConfig = {
  variants: {
    size: {
      sm: "min-h-16 px-2.5 py-1.5 text-xs",
      default: "min-h-24 px-3 py-2 text-sm",
      lg: "min-h-32 px-4 py-3 text-base",
    },
  },
  defaultVariants: { size: "default" },
} as const

const textareaVariants = cva(
  "flex w-full resize-y rounded-md border bg-background shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-focus-contrast focus-visible:ring-[3px] focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20",
  textareaVariantsConfig,
)

function Textarea({ className, size = "default", ...props }: React.ComponentProps<"textarea"> & VariantProps<typeof textareaVariants>) {
  return <textarea data-slot="textarea" data-size={size} className={cn(textareaVariants({ size, className }))} {...props} />
}

const componentContract = {
  name: "textarea", source: "src/components/ui/textarea.tsx",
  publicExports: ["Textarea", "textareaVariants", "textareaVariantsConfig"],
  config: textareaVariantsConfig, className: (props: Record<string, string>) => cn(textareaVariants(props)),
  anatomy: ["Textarea"], configurationStates: {},
  reference: { example: "textarea", guidance: { use: "여러 줄 메모나 설명을 입력받는다.", evidence: "투자 거래의 근거와 회고를 남기는 가변 길이 메모가 필요하다.", limits: "리치 텍스트 편집, 자동 저장, 글자 수 정책은 소비처가 조립한다." } },
} as const

export { Textarea, textareaVariants, textareaVariantsConfig, componentContract }
