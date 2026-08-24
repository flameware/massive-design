import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const inputVariantsConfig = { variants: {}, defaultVariants: {} } as const
const inputVariants = cva("h-9 w-full min-w-0 rounded-md border bg-background px-3 py-1 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-focus-contrast focus-visible:ring-[3px] focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20", inputVariantsConfig)
function Input({ className, type, ...props }: React.ComponentProps<"input">) { return <input data-slot="input" type={type} className={cn(inputVariants({ className }))} {...props} /> }
const componentContract = {
  name: "input", source: "src/components/ui/input.tsx",
  publicExports: ["Input", "inputVariants", "inputVariantsConfig"],
  config: inputVariantsConfig, className: (props: Record<string, string>) => cn(inputVariants(props)),
  anatomy: ["Input"], configurationStates: {},
  reference: { example: "input", guidance: { use: "한 줄 텍스트 값을 입력하거나 검색어를 받는다.", evidence: "투자 이력 검색의 접근 가능한 기본 필드가 필요하다.", limits: "SearchField, 검색 아이콘, debounce는 소비처가 조립한다." } },
} as const
export { Input, inputVariants, inputVariantsConfig, componentContract }
