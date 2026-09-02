import * as React from "react"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

const skeletonVariantsConfig = { variants: {}, defaultVariants: {} } as const
const skeletonVariants = cva("animate-pulse rounded-md bg-muted", skeletonVariantsConfig)
function Skeleton({ className, ...props }: React.ComponentProps<"div">) { return <div data-slot="skeleton" aria-hidden="true" className={cn(skeletonVariants({ className }))} {...props} /> }

const componentContract = {
  name: "skeleton", source: "src/components/ui/skeleton.tsx",
  publicExports: ["Skeleton", "skeletonVariants", "skeletonVariantsConfig"],
  config: skeletonVariantsConfig, className: (props: Record<string, string>) => cn(skeletonVariants(props)),
  anatomy: ["Skeleton"], configurationStates: {},
  behaviors: {},
  reference: { example: "skeleton", guidance: { use: "콘텐츠 구조를 예측할 수 있는 로딩 구간에서 최종 레이아웃과 닮은 자리표시자를 보여준다.", evidence: "투자 요약 카드와 이력 행을 불러오는 동안 레이아웃 이동을 줄여야 한다.", limits: "실제 콘텐츠를 그대로 복제하거나 접근성 이름을 부여하지 말고, 로딩 상태는 감싸는 영역이 알린다." } },
} as const
export { Skeleton, skeletonVariants, skeletonVariantsConfig, componentContract }
