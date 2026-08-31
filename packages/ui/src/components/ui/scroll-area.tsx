import * as React from "react"
import { ScrollArea as ScrollAreaPrimitive } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/* orientation은 이 영역이 **어느 축으로만 넘치도록 허용되는지**를 정한다. 그 축을
 * 컨테이너 크기에 묶는 제약(max-h/max-w)이 스크롤을 만들고, 같은 값이 렌더되는
 * 스크롤바의 축이 된다 — 축 하나를 두 곳에 손으로 적지 않도록 ScrollArea가 자기
 * orientation을 ScrollBar에 그대로 넘긴다. */
const scrollAreaVariantsConfig = {
  variants: {
    orientation: {
      vertical: "max-h-full",
      horizontal: "max-w-full",
    },
  },
  defaultVariants: { orientation: "vertical" },
} as const

const scrollAreaVariants = cva("relative overflow-hidden", scrollAreaVariantsConfig)
type ScrollAreaOrientation = NonNullable<VariantProps<typeof scrollAreaVariants>["orientation"]>
type ScrollAreaStyleProps = { orientation?: ScrollAreaOrientation }

const scrollBarVariantsConfig = {
  variants: {
    orientation: {
      vertical: "h-full w-2.5",
      horizontal: "h-2.5 w-full flex-col",
    },
  },
  defaultVariants: { orientation: "vertical" },
} as const

const scrollBarVariants = cva("flex touch-none select-none p-px", scrollBarVariantsConfig)
const scrollAreaThumbClassName = "relative flex-1 rounded-full bg-secondary"

/* 스크롤 영역은 키보드만 쓰는 사람에게도 굴러가야 한다 — 뷰포트가 초점을 받는 자리다.
 * 초점을 받는 순간 이름 없는 generic 요소가 되지 않도록 role을 명시하고, 루트에 준
 * aria-label/aria-labelledby를 이름이 실제로 필요한 뷰포트로 옮긴다. */
function ScrollAreaViewport({ className, ...props }: React.ComponentProps<typeof ScrollAreaPrimitive.Viewport>) {
  return <ScrollAreaPrimitive.Viewport data-slot="scroll-area-viewport" role="group" tabIndex={0} className={cn("size-full rounded-[inherit] outline-none focus-visible:ring-[3px] focus-visible:ring-ring", className)} {...props} />
}

function ScrollAreaThumb({ className, ...props }: React.ComponentProps<typeof ScrollAreaPrimitive.Thumb>) {
  return <ScrollAreaPrimitive.Thumb data-slot="scroll-area-thumb" className={cn(scrollAreaThumbClassName, className)} {...props} />
}

function ScrollBar({ className, orientation = "vertical", children, ...props }: React.ComponentProps<typeof ScrollAreaPrimitive.Scrollbar> & ScrollAreaStyleProps) {
  return <ScrollAreaPrimitive.Scrollbar data-slot="scroll-area-scrollbar" orientation={orientation} className={cn(scrollBarVariants({ orientation, className }))} {...props}>{children ?? <ScrollAreaThumb/>}</ScrollAreaPrimitive.Scrollbar>
}

function ScrollAreaCorner(props: React.ComponentProps<typeof ScrollAreaPrimitive.Corner>) { return <ScrollAreaPrimitive.Corner data-slot="scroll-area-corner" {...props} /> }

function ScrollArea({ className, orientation = "vertical", children, "aria-label": ariaLabel, "aria-labelledby": ariaLabelledby, ...props }: React.ComponentProps<typeof ScrollAreaPrimitive.Root> & ScrollAreaStyleProps) {
  return <ScrollAreaPrimitive.Root data-slot="scroll-area" data-orientation={orientation} className={cn(scrollAreaVariants({ orientation, className }))} {...props}>
    <ScrollAreaViewport aria-label={ariaLabel} aria-labelledby={ariaLabelledby}>{children}</ScrollAreaViewport>
    <ScrollBar orientation={orientation}/>
    <ScrollAreaCorner/>
  </ScrollAreaPrimitive.Root>
}

const componentContract = {
  name: "scroll-area", source: "src/components/ui/scroll-area.tsx",
  publicExports: ["ScrollArea", "ScrollAreaViewport", "ScrollBar", "ScrollAreaThumb", "ScrollAreaCorner", "scrollAreaVariants", "scrollAreaVariantsConfig", "scrollBarVariants", "scrollBarVariantsConfig"],
  config: scrollAreaVariantsConfig, className: (props: Record<string, string>) => cn(scrollAreaVariants(props)),
  anatomy: ["ScrollArea", "ScrollAreaViewport", "ScrollBar?", "ScrollAreaThumb", "ScrollAreaCorner?"],
  configurationStates: { overflow: ["fits", "overflowing"] },
  parts: {
    ScrollBar: { config: scrollBarVariantsConfig, className: (props: Record<string, string>) => cn(scrollBarVariants(props)) },
    ScrollAreaThumb: { config: { variants: {}, defaultVariants: {} } as const, className: () => scrollAreaThumbClassName },
  },
  reference: { example: "scroll-area", guidance: { use: "높이나 너비가 고정된 영역 안에서 넘치는 콘텐츠를 한 축으로만 스크롤하게 하고, 브라우저 기본 스크롤바 대신 디자인 시스템 스크롤바를 그린다. 뷰포트가 초점을 받으므로 포인터 없이 키보드만으로도 스크롤할 수 있고, 콘텐츠가 넘치지 않으면 스크롤바는 나타나지 않는다.", evidence: "투자 이력의 긴 거래 목록이나 Sheet 안의 필터 묶음처럼, 바깥 화면은 그대로 두고 한 영역만 굴려야 하는 자리가 반복된다.", limits: "페이지 전체 스크롤을 대신하지 않으며, 축을 정하지 않은 자유 스크롤이나 가상 스크롤 목록에는 쓰지 않는다. 영역에 크기 제약이 없으면 아무것도 넘치지 않으므로 스크롤도 스크롤바도 생기지 않는다. 스크롤이 콘텐츠를 가리는 유일한 통로가 되어서는 안 되며, 초점을 받는 영역에는 aria-label로 이름을 준다." } },
} as const

export { ScrollArea, ScrollAreaViewport, ScrollBar, ScrollAreaThumb, ScrollAreaCorner, scrollAreaVariants, scrollAreaVariantsConfig, scrollBarVariants, scrollBarVariantsConfig, componentContract }
