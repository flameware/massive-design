import * as React from "react"
import * as ResizablePrimitive from "react-resizable-panels"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/* 크기를 조절할 수 있는 패널 묶음. 레이아웃 계산과 키보드는 `react-resizable-panels`가
 * 지고, 우리는 anatomy와 토큰만 얹는다(#124).
 *
 * anatomy  ResizablePanelGroup → ResizablePanel*, 그 사이의 ResizableHandle*, 그리고
 *   손잡이 표식인 ResizableHandleGrip?. 손잡이 표식은 **파트이지 축이 아니다** —
 *   축으로 두면 두 칸의 클래스가 똑같아 파생 채널이 구분하지 못하는 variant가
 *   생기지만, 파트로 두면 자기 클래스를 가진 노드가 하나 는다(#121의 두 관문).
 *
 * orientation  이름이 `direction`이 아닌 이유는 upstream v4가 그렇게 바꿨기
 *   때문이고, 우리 카탈로그도 Scroll Area·Slider·Tabs가 이미 같은 이름을 쓴다.
 *   root의 두 칸이 빈 문자열인 것은 Slider의 size와 같은 이유다 — 축은 계약에
 *   있어야 하지만 그리는 자리는 part다. 게다가 그룹의 `flex-direction`은
 *   라이브러리가 인라인으로 쥐고 있어 우리 클래스가 이길 자리가 아니다.
 *   upstream shadcn이 그룹에 붙이는 `aria-[orientation=…]` 선택자는 **죽은
 *   코드**라 옮기지 않는다 — v4에서 `aria-orientation`은 핸들에만 붙는다.
 *
 * 접근성  `role="separator"`·`tabIndex`·`aria-valuenow/min/max`·`aria-controls`는
 *   라이브러리가 계산해 붙이고 타입이 우리 재정의를 막는다. 키보드도 upstream이
 *   준다 — 화살표 ±5, Home/End로 끝까지, collapsible 패널에서 Enter로 접기·펴기,
 *   F6로 핸들 순회. 남는 하나가 **접근 가능한 이름**이고 그건 소비처가 준다.
 *
 * 제스처  핸들을 끄는 것은 **컨트롤 제스처**다. 값(패널 크기)만 바뀌고 표면은
 *   그대로 남으며, 키보드 동등 경로가 이미 위에 있다. dismiss 제스처가 아니므로
 *   `gestures`를 선언하지 않는다. */
const resizableVariantsConfig = {
  variants: {
    orientation: { horizontal: "", vertical: "" },
  },
  defaultVariants: { orientation: "horizontal" },
} as const
const resizableVariants = cva("h-full w-full", resizableVariantsConfig)

type ResizableOrientation = NonNullable<VariantProps<typeof resizableVariants>["orientation"]>

const resizableHandleVariantsConfig = {
  variants: {
    orientation: {
      horizontal: "h-full w-0 border-l after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2",
      vertical: "h-0 w-full border-t after:inset-x-0 after:top-1/2 after:h-1 after:-translate-y-1/2",
    },
  },
  defaultVariants: { orientation: "horizontal" },
} as const
/* upstream은 하이라인을 `bg-border`로 그린다. 우리는 border로 그린다.
 *
 * `--ds-border-default`가 `background-color`에 오면 `check`가 문다 — 배경은 `--ds-bg-*`여야
 * 한다. 이건 회피가 아니라 이미 있는 답이다: `separator.tsx`도 1px 선을 `border-t`/`border-l`로
 * 그려 토큰이 제 자리(`border-color`)에 가게 한다. 폭은 border가 만들므로 `w-px`가 `w-0`이 된다.
 *
 * 잡는 자리는 `after:`의 투명한 히트 영역이 넓히고, 그 수식자는 `MODIFIER_POLICY`에서
 * `ignore`다 — 그릴 것이 없는 영역이라 Figma에 영영 가지 않는다. */
const resizableHandleVariants = cva(
  "relative flex items-center justify-center outline-none after:absolute focus-visible:ring-[3px] focus-visible:ring-ring",
  resizableHandleVariantsConfig
)

const resizableHandleGripVariantsConfig = {
  variants: {
    orientation: { horizontal: "h-4 w-3", vertical: "h-3 w-4" },
  },
  defaultVariants: { orientation: "horizontal" },
} as const
/* 손잡이 표식은 사용자가 잡는 자리라 컨트롤 어포던스다 — 앉는 면에 대해 3:1이
 * 필요하므로 하이라인이 쓰는 border 계열이 아니라 채움을 집는다. */
const resizableHandleGripVariants = cva(
  "z-10 flex items-center justify-center rounded-sm border bg-secondary",
  resizableHandleGripVariantsConfig
)

const PANEL = "min-h-0 min-w-0"

/* 축을 두 곳에 손으로 적지 않도록 그룹이 자기 orientation을 핸들에 넘긴다 —
 * Scroll Area가 ScrollBar에 넘기는 것과 같은 이유다. 핸들이 그룹 밖에서 쓰이는 일은
 * 없지만(라이브러리가 직계 자식을 요구한다) 소비처가 원하면 prop으로 덮을 수 있다. */
const ResizableOrientationContext = React.createContext<ResizableOrientation>("horizontal")

function ResizablePanelGroup({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.Group> & VariantProps<typeof resizableVariants>) {
  return (
    <ResizableOrientationContext.Provider value={orientation ?? "horizontal"}>
      <ResizablePrimitive.Group
        data-slot="resizable-panel-group"
        orientation={orientation ?? "horizontal"}
        className={cn(resizableVariants({ orientation, className }))}
        {...props}
      />
    </ResizableOrientationContext.Provider>
  )
}

function ResizablePanel({ className, ...props }: React.ComponentProps<typeof ResizablePrimitive.Panel>) {
  return <ResizablePrimitive.Panel data-slot="resizable-panel" className={cn(PANEL, className)} {...props} />
}

/** 손잡이 표식. `withHandle`이 그리는 파트이고, 축은 그룹에서 내려온다. */
function ResizableHandleGrip({ className, orientation, ...props }: React.ComponentProps<"div"> & VariantProps<typeof resizableHandleGripVariants>) {
  const inherited = React.useContext(ResizableOrientationContext)
  return <div data-slot="resizable-handle-grip" className={cn(resizableHandleGripVariants({ orientation: orientation ?? inherited, className }))} {...props} />
}

function ResizableHandle({
  className,
  orientation,
  withHandle,
  children,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.Separator> & VariantProps<typeof resizableHandleVariants> & { withHandle?: boolean }) {
  const inherited = React.useContext(ResizableOrientationContext)
  const axis = orientation ?? inherited
  return (
    <ResizablePrimitive.Separator
      data-slot="resizable-handle"
      className={cn(resizableHandleVariants({ orientation: axis, className }))}
      {...props}
    >
      {children ?? (withHandle ? <ResizableHandleGrip orientation={axis}/> : null)}
    </ResizablePrimitive.Separator>
  )
}

const componentContract = {
  name: "resizable", source: "src/components/ui/resizable.tsx",
  publicExports: ["ResizablePanelGroup", "ResizablePanel", "ResizableHandle", "ResizableHandleGrip", "resizableVariants", "resizableVariantsConfig", "resizableHandleVariants", "resizableHandleVariantsConfig"],
  config: resizableVariantsConfig, className: (props: Record<string, string>) => cn(resizableVariants(props)),
  anatomy: ["ResizablePanelGroup", "ResizablePanel*", "ResizableHandle*", "ResizableHandleGrip?"],
  /* 패널 크기는 연속값이라 조합으로 나오지 않는다. 계약이 나르는 이산 상태는
   * 라이브러리가 실제로 구현하는 접힘 하나뿐이다. */
  configurationStates: { panel: ["expanded", "collapsed"] }, drawnBy: { panel: "react-resizable-panels가 패널 크기를 인라인 flex 값으로 쓴다 — `externalSurfaces`가 이미 그 자리를 남의 것으로 적었다" },
  parts: {
    ResizablePanel: { config: { variants: {}, defaultVariants: {} } as const, className: () => PANEL },
    ResizableHandle: { config: resizableHandleVariantsConfig, className: (props: Record<string, string>) => cn(resizableHandleVariants(props)) },
    ResizableHandleGrip: { config: resizableHandleGripVariantsConfig, className: (props: Record<string, string>) => cn(resizableHandleGripVariants(props)) },
  },
  externalSurfaces: {
    "패널 바깥 flex 래퍼": "react-resizable-panels가 Panel의 바깥 div를 스스로 만들고 우리 className은 그 안쪽 div로 간다 — flex 계산을 지키기 위한 라이브러리의 결정이다",
    "패널 크기의 인라인 flex 값": "레이아웃이 flex-grow·flex-basis 인라인 값으로 쓰여 우리 클래스가 닿지 않는다 — 노드는 우리 것이지만 그 자리의 크기는 라이브러리 것이다",
    "드래그 중 전역 커서 스타일시트": "react-resizable-panels가 문서에 adoptedStyleSheet를 얹어 `*, *:hover`의 커서를 !important로 덮는다",
    "핸들의 role·tabIndex·ARIA": "react-resizable-panels가 role=separator와 tabIndex, aria-valuenow·valuemin·valuemax·aria-controls·aria-orientation을 스스로 계산해 붙이고 타입이 우리 재정의를 막는다",
  },
  reference: { example: "resizable", guidance: { use: "한 화면 안에서 두 영역의 넓이를 사용자가 직접 나눠 갖게 하고, 그 경계를 포인터와 키보드 양쪽으로 옮길 수 있게 한다.", evidence: "투자 이력은 목록과 상세를 나란히 보는 자리가 있고, 종목 이름이 긴 사용자와 숫자를 넓게 보려는 사용자가 원하는 경계가 서로 다르다.", limits: "고정 비율 레이아웃에는 쓰지 않으며 패널 크기는 계약하지 않는다 — 크기는 연속값이라 조합으로 나오지 않고 defaultSize·minSize·maxSize는 소비처의 값이다. 핸들은 초점을 받는 컨트롤이므로 접근 가능한 이름은 소비처가 aria-label로 준다. 키보드는 upstream이 준다 — 화살표로 ±5, Home/End로 끝까지, collapsible 패널에서 Enter로 접기·펴기, F6로 핸들 순회. 핸들을 끄는 것은 컨트롤 제스처라 표면이 사라지지 않고 위 키보드 경로가 이미 동등 경로이며, 터치 히트 영역의 크기(upstream 기본값은 coarse 20px·fine 10px)는 터치 대상 크기 규칙(#111)이 정한 뒤에 다시 본다. 레이아웃 저장(useDefaultLayout)과 명령형 API는 소비처가 소유한다." } },
} as const

export { ResizablePanelGroup, ResizablePanel, ResizableHandle, ResizableHandleGrip, resizableVariants, resizableVariantsConfig, resizableHandleVariants, resizableHandleVariantsConfig, componentContract }
