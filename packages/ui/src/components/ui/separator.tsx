import * as React from "react"
import { Separator as SeparatorPrimitive } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const separatorVariantsConfig = {
  variants: {
    orientation: {
      horizontal: "h-0 w-full border-t",
      vertical: "h-full w-0 self-stretch border-l",
    },
  },
  defaultVariants: { orientation: "horizontal" },
} as const

const separatorVariants = cva("shrink-0", separatorVariantsConfig)

function Separator({ className, orientation = "horizontal", decorative = true, ...props }: React.ComponentProps<typeof SeparatorPrimitive.Root> & VariantProps<typeof separatorVariants>) {
  return <SeparatorPrimitive.Root data-slot="separator" decorative={decorative} orientation={orientation} className={cn(separatorVariants({ orientation, className }))} {...props} />
}

const componentContract = {
  name: "separator", source: "src/components/ui/separator.tsx",
  publicExports: ["Separator", "separatorVariants", "separatorVariantsConfig"],
  config: separatorVariantsConfig, className: (props: Record<string, string>) => cn(separatorVariants(props)),
  anatomy: ["Separator"], configurationStates: {},
  behaviors: {},
  reference: { example: "separator", guidance: { use: "서로 관련된 콘텐츠 묶음 사이의 시각적 경계를 가로 또는 세로 방향으로 표시한다.", evidence: "투자 요약의 지표 묶음과 거래 상세의 정보 그룹을 구획하되 별도 컨테이너를 추가할 필요는 없다.", limits: "의미 있는 구역 제목이나 레이아웃 간격을 대신하지 않으며, 보조 기술에 경계를 알려야 할 때만 decorative를 false로 지정한다." } },
} as const

export { Separator, separatorVariants, separatorVariantsConfig, componentContract }
