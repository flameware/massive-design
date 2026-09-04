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
/* thumb은 **컨트롤 어포던스**다 — 잡아 끄는 대상이라 앉는 면과 갈려 보여야 하고
 * (자기가 앉는 면에 대해 비텍스트 대비 3:1, WCAG 1.4.11), 그래서 잔여 트랙과 같은
 * 중립 soft로 낮추지 않고 solid 중립을 집는다(#109, ADR-0003). */
const scrollAreaThumbClassName = "relative flex-1 rounded-full bg-neutral-solid"

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
  configurationStates: { overflow: ["fits", "overflowing"] }, drawnBy: { overflow: "Radix가 넘칠 때만 스크롤바 노드를 붙인다 — 존재가 그린다" },
  parts: {
    ScrollBar: { config: scrollBarVariantsConfig, className: (props: Record<string, string>) => cn(scrollBarVariants(props)) },
    ScrollAreaThumb: { config: { variants: {}, defaultVariants: {} } as const, className: () => scrollAreaThumbClassName },
    // 뷰포트는 초점을 받는 노드라 포커스 링 자체가 셀에 실려야 한다(#245) — 킨 이래
    // `parts`에 둘만 있었고 뷰포트가 빠져 있었다.
    ScrollAreaViewport: { config: { variants: {}, defaultVariants: {} } as const, className: () => "size-full rounded-[inherit] outline-none focus-visible:ring-[3px] focus-visible:ring-ring" },
  },
  behaviors: {
    hoverReveal: { kind: "open-cause", surface: "ScrollBar", origin: "inherited", control: "type", why: "`ScrollAreaPrimitive.Root`의 `type` 기본값이 `\"hover\"`이고 우리는 그것을 타이핑하지 않는다 — **스크롤바 자체가 포인터가 영역에 들어와야 나타나고 나가면 `scrollHideDelay` 기본값 600ms 뒤에 사라진다.** 계약이 anatomy에 `ScrollBar?`를 두고 매니페스트가 그 셀을 발행하지만 파생 채널은 그것이 hover에 걸려 있다는 사실을 나르지 않으므로, 정적 시안과 생성된 스토리는 늘 보이는 스크롤바를 그린다. 포인터가 없는 사용자에게는 나타날 계기 자체가 없고 뷰포트의 키보드 스크롤만 남는다 — 값은 계약하지 않는다(ADR-0005). 소비처가 `type=\"always\"`로 바꾼다(#187)." },
    thumbDrag: { kind: "control-gesture", surface: "ScrollAreaThumb", origin: "inherited", why: "radix-ui ScrollArea가 갖고 오는 상속 표면이다 — thumb을 끌면 뷰포트가 스크롤된다. 컨트롤 제스처라 표면이 사라지지 않고 동등 경로(뷰포트 자체의 키보드·휠 스크롤)가 이미 있으므로 `gestures`가 아니다(ADR-0005)." },
  },
  reference: { example: "scroll-area", guidance: { use: "크기가 고정된 영역 안에서 넘치는 콘텐츠를 한 축으로만 스크롤하게 하고, 브라우저 기본 대신 디자인 시스템 스크롤바를 그린다. 뷰포트가 초점을 받아 키보드만으로도 굴러간다.", evidence: "투자 이력의 긴 거래 목록이나 Sheet 안의 필터 묶음처럼, 바깥 화면은 그대로 두고 한 영역만 굴려야 하는 자리가 반복된다.", limits: "페이지 전체 스크롤을 대신하지 않고, 축 없는 자유 스크롤이나 가상 스크롤 목록은 소비처가 자기 뷰포트로 푼다. 영역에 크기 제약이 없으면 스크롤바도 생기지 않는다. 스크롤이 콘텐츠에 닿는 유일한 통로가 되지 않게 하고, 초점을 받는 영역에는 aria-label로 이름을 준다." } },
} as const

export { ScrollArea, ScrollAreaViewport, ScrollBar, ScrollAreaThumb, ScrollAreaCorner, scrollAreaVariants, scrollAreaVariantsConfig, scrollBarVariants, scrollBarVariantsConfig, componentContract }
