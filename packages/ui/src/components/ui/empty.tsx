import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const emptyVariantsConfig = {
  variants: { variant: { default: "", outline: "border border-dashed" } },
  defaultVariants: { variant: "default" },
} as const
const emptyVariants = cva("flex min-w-0 flex-1 flex-col items-center justify-center gap-6 rounded-lg p-6 text-center md:p-12", emptyVariantsConfig)

function Empty({ className, variant = "default", ...props }: React.ComponentProps<"div"> & VariantProps<typeof emptyVariants>) {
  return <div data-slot="empty" className={cn(emptyVariants({ variant, className }))} {...props} />
}
function EmptyHeader({ className, ...props }: React.ComponentProps<"div">) { return <div data-slot="empty-header" className={cn("flex max-w-sm flex-col items-center gap-2 text-center", className)} {...props} /> }
function EmptyMedia({ className, ...props }: React.ComponentProps<"div">) { return <div data-slot="empty-media" className={cn("flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground [&_svg]:size-6", className)} {...props} /> }
function EmptyTitle({ className, ...props }: React.ComponentProps<"h3">) { return <h3 data-slot="empty-title" className={cn("text-lg font-medium", className)} {...props} /> }
function EmptyDescription({ className, ...props }: React.ComponentProps<"p">) { return <p data-slot="empty-description" className={cn("text-sm text-muted-foreground [&>a:hover]:text-foreground [&>a]:underline [&>a]:underline-offset-4", className)} {...props} /> }
function EmptyContent({ className, ...props }: React.ComponentProps<"div">) { return <div data-slot="empty-content" className={cn("flex w-full max-w-sm min-w-0 flex-col items-center gap-4 text-sm", className)} {...props} /> }

const componentContract = {
  name: "empty", source: "src/components/ui/empty.tsx",
  publicExports: ["Empty", "EmptyHeader", "EmptyMedia", "EmptyTitle", "EmptyDescription", "EmptyContent", "emptyVariants", "emptyVariantsConfig"],
  config: emptyVariantsConfig, className: (props: Record<string, string>) => cn(emptyVariants(props)),
  anatomy: ["Empty", "EmptyHeader", "EmptyMedia?", "EmptyTitle", "EmptyDescription?", "EmptyContent?"], configurationStates: {},
  reference: { example: "empty", guidance: { use: "표시할 내용이 없는 영역에 상태 설명과 선택적인 다음 행동을 조립한다.", evidence: "검색 결과나 아직 생성되지 않은 목록에서 빈 영역의 이유와 회복 경로를 함께 보여줘야 한다.", limits: "오류·권한·온보딩 의미를 자체 판단하지 않으며 문구, 일러스트, 행동의 제품 의미는 소비처가 제공한다." } },
} as const

export { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent, emptyVariants, emptyVariantsConfig, componentContract }
