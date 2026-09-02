import * as React from "react"
import useEmblaCarousel, { type UseEmblaCarouselType } from "embla-carousel-react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"

/* 슬라이드를 한 자리에서 차례로 보여주는 표면. 트랜스폼과 스냅 계산은
 * `embla-carousel-react`가 지고, 우리는 anatomy와 토큰만 얹는다(#125).
 *
 * anatomy  Carousel → CarouselContent → CarouselTrack → CarouselItem*, 그리고
 *   CarouselPrevious?·CarouselNext?. `CarouselTrack`은 공개 export가 아니라
 *   **이름 붙인 내부 노드**다 — Embla는 뷰포트와 트랙 두 겹을 요구하고 우리가
 *   둘 다에 className을 주므로, 이름을 안 붙이면 트랙의 클래스가 매니페스트에서
 *   **없는 것이 아니라 침묵**이 된다(#122). `InputOTPControl`이 같은 자리다.
 *   upstream은 소비처의 className을 트랙으로 보내지만 우리는 뷰포트로 보낸다 —
 *   `data-slot="carousel-content"`가 앉은 노드와 className이 앉는 노드가 갈리면
 *   계약이 설명하는 자리와 소비처가 만지는 자리가 어긋난다.
 *
 * orientation  축이다. 트랙의 flex 방향, 아이템의 사이 간격, 이전·다음 버튼이
 *   앉는 변이 전부 갈린다. root의 두 칸이 빈 문자열인 것은 Resizable·Slider와
 *   같은 이유다 — 축은 계약에 있어야 하지만 그리는 자리는 part다.
 *
 * 현재 슬라이드 위치  구성 상태로 계약하되 **버튼의 경계로** 계약한다.
 *   Breadcrumb·Pagination의 현재 위치 계약(#92)은 현재 자리가 **표식을 가진
 *   노드**로 나타나기 때문에 성립한다(`BreadcrumbPage`, `aria-current`가 붙은
 *   `PaginationLink`). Carousel의 현재 슬라이드에는 그런 표식이 없다 — 위치를
 *   나르는 것은 Embla가 트랙에 쓰는 인라인 transform이고 우리 클래스가 아니라,
 *   슬라이드 노드만 보면 첫 장과 가운데 장이 완전히 같다. 파생 채널이 구분하지
 *   못하는 것은 구성 상태로 두지 않는다(#97·#121의 관문 ⓐ).
 *
 *   그러나 위치가 **실제로 그려지는 자리**가 하나 있다: 처음이면 이전 버튼이,
 *   끝이면 다음 버튼이 비활성이다. 그래서 `currentSlide: first|middle|last`를
 *   구성 상태로 둔다. 이 값이 만들어 내는 disabled는 상호작용 상태가 아니라
 *   **위치에서 파생된 의미 상태**다 — 지금 사용자가 무엇을 하고 있는지가 아니라
 *   정적 화면이 몇 번째 장을 보여줄지를 고르는 값이다.
 *
 * 접근성  루트는 `role="region"`·`aria-roledescription="carousel"`이고 접근 가능한
 *   이름은 소비처가 준다. 각 장은 `role="group"`·`aria-roledescription="slide"`다.
 *   이전·다음 버튼은 `sr-only` 이름을 스스로 갖는다 — Pagination이 이미 같은
 *   방식으로 영문 기본 이름을 쥔다. 키보드는 우리가 준다: 가로면 ←/→, 세로면
 *   ↑/↓가 한 장씩 옮긴다. upstream은 가로 두 키만 걸어 두어 세로 축에서 키보드
 *   경로가 아예 없었다.
 *
 * 자동 재생  없다. Embla의 autoplay 플러그인을 넣지 않았으므로 스스로 움직이는
 *   것이 없고, 따라서 정지 수단을 계약할 것도 없다.
 *
 * 제스처  드래그는 **컨트롤 제스처**다(ADR 0005). 값(보이는 장)만 바뀌고 표면은
 *   그대로 남으며 키보드 동등 경로가 위에 있다. dismiss 제스처가 아니므로
 *   `gestures`를 선언하지 않는다. 다만 Embla의 `watchDrag` 기본값이 `true`라
 *   **우리가 켜지 않아도 우리 이름으로 출하되는** 상속 표면이다 — 끄거나
 *   선언하거나 둘 중 하나이고, 여기서는 **켠 채로 선언한다**. 컨트롤 제스처는
 *   이 컴포넌트의 기능 그 자체이고 끄면 터치에서 캐러셀이 캐러셀이 아니게 된다.
 *   같은 이유로 `watchFocus` 기본값도 켠 채로 둔다 — 그쪽은 접근성에 이롭다. */
const carouselVariantsConfig = {
  variants: {
    orientation: { horizontal: "", vertical: "" },
  },
  defaultVariants: { orientation: "horizontal" },
} as const
const carouselVariants = cva("relative", carouselVariantsConfig)

type CarouselOrientation = NonNullable<VariantProps<typeof carouselVariants>["orientation"]>

const VIEWPORT = "overflow-hidden"

const carouselTrackVariantsConfig = {
  variants: {
    orientation: { horizontal: "-ml-4", vertical: "-mt-4 flex-col" },
  },
  defaultVariants: { orientation: "horizontal" },
} as const
const carouselTrackVariants = cva("flex", carouselTrackVariantsConfig)

const carouselItemVariantsConfig = {
  variants: {
    orientation: { horizontal: "pl-4", vertical: "pt-4" },
  },
  defaultVariants: { orientation: "horizontal" },
} as const
/* `basis-full`은 한 번에 한 장이라는 **기본값**이지 계약이 아니다 — 실제 스냅
 * 지점은 Embla가 뷰포트와 슬라이드를 실측해 정하고, 소비처가 `basis-1/3`으로
 * 덮으면 그 측정이 이긴다. */
const carouselItemVariants = cva("min-w-0 shrink-0 grow-0 basis-full", carouselItemVariantsConfig)

const carouselNavVariantsConfig = {
  variants: {
    orientation: {
      horizontal: "top-1/2 -translate-y-1/2",
      vertical: "left-1/2 -translate-x-1/2 rotate-90",
    },
  },
  defaultVariants: { orientation: "horizontal" },
} as const
const carouselNavVariants = cva("absolute size-8 rounded-full", carouselNavVariantsConfig)

const NAV_EDGE = {
  previous: { horizontal: "-left-12", vertical: "-top-12" },
  next: { horizontal: "-right-12", vertical: "-bottom-12" },
} as const

type CarouselApi = UseEmblaCarouselType[1]
type CarouselOptions = NonNullable<Parameters<typeof useEmblaCarousel>[0]>
type CarouselPlugins = NonNullable<Parameters<typeof useEmblaCarousel>[1]>

type CarouselContextValue = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0]
  api: CarouselApi
  orientation: CarouselOrientation
  scrollPrev: () => void
  scrollNext: () => void
  canScrollPrev: boolean
  canScrollNext: boolean
}

const CarouselContext = React.createContext<CarouselContextValue | null>(null)

function useCarousel() {
  const context = React.useContext(CarouselContext)
  if (!context) throw new Error("Carousel의 하위 컴포넌트는 <Carousel> 안에서 써야 한다")
  return context
}

function Carousel({
  className,
  orientation = "horizontal",
  opts,
  plugins,
  setApi,
  children,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof carouselVariants> & {
    opts?: CarouselOptions
    plugins?: CarouselPlugins
    setApi?: (api: CarouselApi) => void
  }) {
  const axis: CarouselOrientation = orientation ?? "horizontal"
  const [carouselRef, api] = useEmblaCarousel({ ...opts, axis: axis === "horizontal" ? "x" : "y" }, plugins)
  const [canScrollPrev, setCanScrollPrev] = React.useState(false)
  const [canScrollNext, setCanScrollNext] = React.useState(false)

  const onSelect = React.useCallback((instance: NonNullable<CarouselApi>) => {
    setCanScrollPrev(instance.canScrollPrev())
    setCanScrollNext(instance.canScrollNext())
  }, [])

  const scrollPrev = React.useCallback(() => { api?.scrollPrev() }, [api])
  const scrollNext = React.useCallback(() => { api?.scrollNext() }, [api])

  React.useEffect(() => {
    if (!api) return
    setApi?.(api)
    onSelect(api)
    api.on("reInit", onSelect).on("select", onSelect)
    return () => { api.off("reInit", onSelect).off("select", onSelect) }
  }, [api, onSelect, setApi])

  /* 키보드 동등 경로. 컨트롤 제스처의 짝이므로 여기 없으면 드래그가 유일한
   * 이동 수단이 된다. 세로 축에서 ↑/↓가 함께 걸리는 것이 upstream과 다르다. */
  const onKeyDown = React.useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    const prevKey = axis === "horizontal" ? "ArrowLeft" : "ArrowUp"
    const nextKey = axis === "horizontal" ? "ArrowRight" : "ArrowDown"
    if (event.key === prevKey) { event.preventDefault(); scrollPrev() }
    else if (event.key === nextKey) { event.preventDefault(); scrollNext() }
  }, [axis, scrollPrev, scrollNext])

  return (
    <CarouselContext.Provider value={{ carouselRef, api, orientation: axis, scrollPrev, scrollNext, canScrollPrev, canScrollNext }}>
      <div
        data-slot="carousel"
        role="region"
        aria-roledescription="carousel"
        onKeyDown={onKeyDown}
        className={cn(carouselVariants({ orientation, className }))}
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  )
}

/** 뷰포트. Embla가 잡는 노드이고 넘치는 부분을 잘라 낸다. 안쪽 트랙은 우리가
 * className을 주는 우리 노드이지만 Embla가 그 자리의 transform을 쥔다. */
function CarouselContent({ className, children, ...props }: React.ComponentProps<"div">) {
  const { carouselRef, orientation } = useCarousel()
  return (
    <div ref={carouselRef} data-slot="carousel-content" className={cn(VIEWPORT, className)} {...props}>
      <div data-slot="carousel-track" className={cn(carouselTrackVariants({ orientation }))}>
        {children}
      </div>
    </div>
  )
}

/** 장 하나. */
function CarouselItem({ className, ...props }: React.ComponentProps<"div">) {
  const { orientation } = useCarousel()
  return (
    <div
      data-slot="carousel-item"
      role="group"
      aria-roledescription="slide"
      className={cn(carouselItemVariants({ orientation, className }))}
      {...props}
    />
  )
}

function CarouselPrevious({ className, variant = "outline", size = "icon", ...props }: React.ComponentProps<typeof Button>) {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel()
  return (
    <Button
      data-slot="carousel-previous"
      variant={variant}
      size={size}
      className={cn(carouselNavVariants({ orientation }), NAV_EDGE.previous[orientation], className)}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4"><path d="m10 3-5 5 5 5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"/></svg>
      <span className="sr-only">Previous slide</span>
    </Button>
  )
}

function CarouselNext({ className, variant = "outline", size = "icon", ...props }: React.ComponentProps<typeof Button>) {
  const { orientation, scrollNext, canScrollNext } = useCarousel()
  return (
    <Button
      data-slot="carousel-next"
      variant={variant}
      size={size}
      className={cn(carouselNavVariants({ orientation }), NAV_EDGE.next[orientation], className)}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4"><path d="m6 3 5 5-5 5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"/></svg>
      <span className="sr-only">Next slide</span>
    </Button>
  )
}

const staticPart = (className: string) => ({
  config: { variants: {}, defaultVariants: {} } as const,
  className: () => className,
})

const navPart = (edge: Record<CarouselOrientation, string>) => ({
  config: carouselNavVariantsConfig,
  className: (props: Record<string, string>) => {
    const orientation = (props.orientation as CarouselOrientation) ?? "horizontal"
    return cn(buttonVariants({ variant: "outline", size: "icon" }), carouselNavVariants({ orientation }), edge[orientation])
  },
})

const componentContract = {
  name: "carousel", source: "src/components/ui/carousel.tsx",
  publicExports: ["Carousel", "CarouselContent", "CarouselItem", "CarouselPrevious", "CarouselNext", "carouselVariants", "carouselVariantsConfig", "carouselItemVariants", "carouselItemVariantsConfig"],
  config: carouselVariantsConfig, className: (props: Record<string, string>) => cn(carouselVariants(props)),
  anatomy: ["Carousel", "CarouselContent", "CarouselTrack", "CarouselItem*", "CarouselPrevious?", "CarouselNext?"],
  configurationStates: { currentSlide: ["first", "middle", "last"] }, drawnBy: { currentSlide: "Embla가 트랙에 인라인 `transform`을 쓴다 — `externalSurfaces`가 이미 그 자리를 남의 것으로 적었다" },
  parts: {
    CarouselContent: staticPart(VIEWPORT),
    CarouselTrack: { config: carouselTrackVariantsConfig, className: (props: Record<string, string>) => cn(carouselTrackVariants(props)) },
    CarouselItem: { config: carouselItemVariantsConfig, className: (props: Record<string, string>) => cn(carouselItemVariants(props)) },
    CarouselPrevious: navPart(NAV_EDGE.previous),
    CarouselNext: navPart(NAV_EDGE.next),
  },
  externalSurfaces: {
    "슬라이드 트랙의 인라인 transform": "embla-carousel이 트랙의 style.transform을 직접 쓴다 — 노드는 우리 것이지만 그 자리의 위치는 라이브러리 것이다. 클래스 소유로 그은 경계가 노드는 갈라 주지만 인라인 스타일까지 갈라 주지 않는다는 #124의 겹이 여기서도 그대로 나온다",
    "스냅 지점과 슬라이드 그룹 계산": "embla-carousel이 뷰포트와 슬라이드를 실측해 스냅 지점·정렬·그룹을 정한다 — 우리 basis-full은 그 계산의 입력일 뿐이고 결과는 계약에 나타나지 않는다",
    "드래그 중 포인터·클릭 억제": "embla-carousel이 트랙에 dragstart·touchmove·contextmenu와 캡처 단계 click 리스너를 걸어 드래그 직후의 클릭을 삼킨다 — 우리 노드 위에서 일어나지만 우리가 구현하지도 끄지도 않는다",
    "포커스 진입 시 루트 스크롤 되돌림": "embla-carousel의 watchFocus 기본값이 켜져 있어 Tab으로 슬라이드 안 요소에 초점이 가면 라이브러리가 루트의 scrollLeft를 0으로 되돌리고 그 장으로 스크롤한다 — 루트 노드의 스크롤 위치를 라이브러리가 쓴다",
  },
  behaviors: {
    focusScroll: { kind: "implicit-change", surface: "CarouselContent", origin: "inherited", control: "opts.watchFocus", why: "Embla가 `watchFocus` 기본값 `true`로 갖고 오는 상속 표면이다 — **슬라이드 안의 요소가 초점을 받으면 캐러셀이 그 슬라이드로 스크롤한다.** ADR-0010이 셋째 종류가 필요할 것으로 예고한 자리이고, 끌지도 열지도 않으므로 앞의 두 종류가 담지 못한다. Tab으로 훑는 사용자에게는 이것이 유일한 이동 수단이기도 하고 동시에 의도하지 않은 이동이기도 하다 — 되돌림은 이전·다음 버튼이다. `limits` 산문에만 적혀 있던 사실을 계약으로 옮긴다. 소비처가 `opts`로 끈다(#187)." },
    slideDrag: { kind: "control-gesture", surface: "CarouselContent", origin: "inherited", control: "opts.watchDrag", why: "Embla가 `watchDrag` 기본값 `true`로 갖고 오는 상속 표면이다 — 포인터로 끌면 슬라이드가 넘어간다. 드래그가 컨트롤의 기능 자체라 표면이 사라지지 않고 키보드 동등 경로(가로 ←/→, 세로 ↑/↓)가 이미 계약 안에 있으므로 `gestures`가 아니다(ADR-0005). 임계값과 관성은 Embla가 실측으로 정하므로 계약하지 않는다." },
  },
  reference: { example: "carousel", guidance: { use: "같은 무게의 항목 여럿을 한 자리에서 몇 개씩만 보여주고 나머지는 이전·다음으로 넘겨 보게 한다.", evidence: "투자 이력의 요약 화면은 보유 종목 카드와 월별 회고 카드를 좁은 폭에 나란히 놓아야 하고, 세로로 다 펼치면 그 아래의 거래 목록이 화면 밖으로 밀린다.", limits: "목록을 전부 봐야 하는 자리에는 쓰지 않는다 — 넘겨야만 보이는 항목은 훑기의 대상이 되지 못한다. 접근 가능한 이름은 소비처가 루트에 aria-label로 준다. 자동 재생은 없다: Embla autoplay 플러그인을 넣지 않았으므로 스스로 움직이는 것이 없고 정지 수단을 계약할 것도 없다. 드래그는 컨트롤 제스처라 표면이 사라지지 않고 키보드 동등 경로(가로 ←/→, 세로 ↑/↓)가 계약 안에 있으므로 gestures를 선언하지 않는다(ADR 0005) — 다만 Embla의 watchDrag·watchFocus 기본값이 켜진 채로 출하되는 상속 표면이라 여기 적는다. 끄려면 소비처가 opts로 끈다. 한 번에 몇 장을 보일지(basis-*)와 loop·align·slidesToScroll은 소비처가 소유한다 — 스냅 지점은 Embla가 실측으로 정하고 우리 계약에 나타나지 않는다. 슬라이드 위치 표시기(dots)는 열지 않았다: 현재 위치를 표식 있는 노드로 그리는 표면이라 열 근거는 있으나 upstream에 없고 리포에 수요가 0건이라, 지금 열면 우리가 정한 적 없는 표시기 스케일을 떠안는다(#123이 Kbd의 크기 축을 닫은 것과 같은 근거). 터치 히트 영역의 크기는 터치 대상 크기 규칙(#111)이 정한 뒤에 다시 본다. **`CarouselApi`는 `publicExports`에 올리지 않는다**(#162가 종류 ②로 찾았고 #175가 판정했다) — upstream이 export하는 그 이름을 이 파일도 같은 이름으로 이미 내보내고 있지만(`export type { CarouselApi }`), 타입은 노드도 축도 아니라 anatomy에 이름을 얻을 수도 파트 셀을 가질 수도 없고 매니페스트가 나를 것이 없다. Embla 인스턴스를 밖으로 꺼내는 통로는 `Carousel`의 `setApi` prop으로 이미 서 있으므로 여기 있던 것은 표면의 공백이 아니라 기록의 공백이었다." } },
} as const

export { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext, carouselVariants, carouselVariantsConfig, carouselItemVariants, carouselItemVariantsConfig, componentContract }
export type { CarouselApi }
