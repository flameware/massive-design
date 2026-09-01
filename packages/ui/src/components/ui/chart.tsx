import * as React from "react"
import * as RechartsPrimitive from "recharts"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/* 차트의 **주변 자산만** 소유한다(#119의 축소 판정, #125).
 *
 * 우리 것  `ChartTooltipContent`와 `ChartLegendContent`. 디자이너가 실제로 집어
 *   쓰는 툴팁 카드와 범례이고, 우리 클래스와 우리 토큰으로 그려진다.
 *
 * 공개하되 자산이 아닌 것  `ChartContainer`. 계열 색을 `--color-<key>`로 내려
 *   보내는 **테마 주입 통로**이고 자기 축도 구성 상태도 없다. anatomy의 뿌리로
 *   있는 것은 우리가 className을 주는 노드이기 때문이지 그릴 것이 있어서가
 *   아니다 — Figma가 이 자리에서 얻는 것은 빈 프레임 하나다. Aspect Ratio를
 *   "표면이 없는 항목은 카탈로그 자산이 아니다"로 닫은 판정(#119)과 같은 성질의
 *   노드이며, 여기서는 툴팁과 범례가 앉을 집이 필요해 같이 실려 온다.
 *
 * 우리 것이 아닌 것  차트 본체 — 축·격자·데이터 마크. Recharts가 SVG 트리 전체를
 *   만들고 우리 className이 닿는 노드가 하나도 없다. **자손 선택자로 남의 노드를
 *   칠하지 않는다**: upstream chart는 컨테이너에 `[&_.recharts-cartesian-grid_line]`
 *   같은 규칙을 스무 줄 얹지만, 그러면 매니페스트는 그 선언을 우리 것으로 담고
 *   Figma는 그 노드를 그릴 수 없어 **자산의 공백이 아니라 거짓 자산**이 된다.
 *   #122가 클래스 소유로 경계를 그은 것은 노드에 대한 규칙이고, 자손 선택자는
 *   그 경계의 뒷문이다. 본체 스타일은 소비처가 Recharts prop(`stroke`·`tick`·
 *   `fill`)으로 준다.
 *
 * `ChartTooltip`·`ChartLegend`를 재수출하지 않는다  upstream은 Recharts의
 *   `Tooltip`·`Legend`를 그 이름으로 다시 내보낸다. 우리는 안 한다 — 그것은 우리
 *   클래스를 하나도 내지 않으면서 **우리 공개 이름으로 나가는** 노드라, 게이트가
 *   요구하는 "공개 컴포넌트는 anatomy에 있어야 한다"(#121)와 "외부 소유 표면은
 *   anatomy와 겹칠 수 없다"(#122)가 정면으로 부딪친다. 한 표면이 우리 것이면서
 *   남의 것일 수는 없으므로, 이름을 내주지 않는 쪽으로 푼다. 소비처는 `Tooltip`·
 *   `Legend`를 recharts에서 직접 가져와 `content`에 우리 카드를 꽂는다.
 *
 * 데이터 계열 색 — semantic도 alias도 아니라 **소비처가 주입하는 입력**이다.
 *   `--chart-1`~`5` alias는 이미 있고 전부 neutral 팔레트 단계를 가리키는 무채색
 *   플레이스홀더다(`docs/tokens/semantic-tokens.md` §7.2). 이 티켓은 그 자리앉힘을
 *   재판정했고 **바꾸지 않는다**: 의미 패밀리(danger/success/warning)에서 범주형
 *   5색을 뽑으면 상태 의미가 데이터에 실리고, 소비처는 손익 색을 스스로 소유한다
 *   (invest diary ADR-0008). 그래서 계열 색을 semantic으로 열지 않는다.
 *
 *   대신 이 티켓이 **줄인 것**이 있다. 우리 `cva`는 견본의 **모양만** 소유하고
 *   (점·선·파선의 크기와 테두리 형태) 색은 하나도 갖지 않는다 — 색은 payload에서
 *   인라인 스타일로 온다. 그래서 `--chart-*`의 palette 직참조 예외(#72가 표시한
 *   "chart의 semantic 우회")는 **우리 계약 안에서 소비처가 0개**이고, 폭발 반경이
 *   없다. 예외를 없애려면 시각화 팔레트를 확정해야 하는데 그건 이 맵 밖이다.
 *
 * 다크 모드 — 컴포넌트가 모드를 알지 않는다. upstream `ChartContainer`는
 *   `theme: {light, dark}`를 받아 `.light … / .dark …` 두 블록을 **컴포넌트가**
 *   주입한다. 그러면 라이트/다크 전환이 semantic 계층이 아니라 컴포넌트 안에서
 *   일어나 CONTEXT.md의 규칙이 세 번째 자리에서 깨진다. 그래서 `theme` 키를 받지
 *   않고 `color` 하나만 받아 `--color-<key>` **한 벌만** 낸다. 모드에 따라 달라져야
 *   하는 색은 소비처가 **모드 전환이 이미 끝난 변수**(`var(--chart-1)`, alias,
 *   자기 토큰)를 값으로 주면 되고, 그러면 전환 자리는 토큰 계층에 남는다.
 *
 *   "Recharts에는 계산된 값이 필요할 수 있다"는 전제는 성립하지 않았다. Recharts는
 *   `fill`·`stroke`에 받은 문자열을 SVG presentation attribute로 그대로 넘기고,
 *   presentation attribute는 CSS 선언으로 파싱되므로 `var(--color-buy)`가 그 자리에서
 *   해석된다. 계산된 hex가 필요한 것은 Figma 쪽이고(색 합성을 표현하지 못한다),
 *   그건 이미 `state-colors.gen.json`이 지고 있는 별개의 문제다. */
const chartVariantsConfig = {
  variants: {
    indicator: { dot: "", line: "", dashed: "" },
  },
  defaultVariants: { indicator: "dot" },
} as const
/* `indicator`가 컨테이너의 축으로 앉아 있는 것은 Resizable의 `orientation`,
 * Slider의 `size`와 같은 이유다 — 축은 계약(그리고 참조 스토리의 컨트롤)에 있어야
 * 하지만 그리는 자리는 part다. 컨테이너 자신의 세 칸은 같다. */
const chartVariants = cva("flex aspect-video justify-center text-xs", chartVariantsConfig)

const chartTooltipIndicatorVariantsConfig = {
  variants: {
    indicator: {
      dot: "size-2.5 rounded-[2px]",
      line: "h-full w-1 rounded-[2px]",
      dashed: "w-0 border-[1.5px] border-dashed",
    },
  },
  defaultVariants: { indicator: "dot" },
} as const
/* 색이 없다. 견본의 색은 **데이터 계열 색**이고 그건 소비처가 주입하는 입력이라
 * 우리 토큰이 아니다 — payload의 값이 인라인 스타일로 온다. 우리가 소유하는 것은
 * 모양뿐이다. 이렇게 두면 매니페스트에 `--chart-*`가 한 번도 나타나지 않고,
 * 계열 색 예외가 계약 안으로 새지 않는다. */
const chartTooltipIndicatorVariants = cva("shrink-0 self-center", chartTooltipIndicatorVariantsConfig)

const chartLegendContentVariantsConfig = {
  variants: {
    placement: { top: "pb-3", bottom: "pt-3" },
  },
  defaultVariants: { placement: "bottom" },
} as const
/* 축 이름이 `align`이 아닌 이유: Recharts `Legend`는 `content`로 받은 요소를
 * 자기 props(`align`·`verticalAlign`·`payload`)로 복제한다. `align`을 우리 축
 * 이름으로 쓰면 라이브러리가 그 자리에 `center`를 밀어 넣어 우리 축이 조용히
 * 덮인다 — 외부 소유는 노드만이 아니라 **prop 이름 공간**에도 있다. */
const chartLegendContentVariants = cva("flex items-center justify-center gap-4", chartLegendContentVariantsConfig)

const TOOLTIP_CONTENT =
  "grid min-w-32 items-start gap-1.5 rounded-lg border bg-popover px-2.5 py-1.5 text-xs text-popover-foreground shadow-md"
const TOOLTIP_LABEL = "font-medium"
const TOOLTIP_ITEM = "flex w-full items-center gap-2"
const TOOLTIP_VALUE = "ml-auto font-mono font-medium tabular-nums"
const LEGEND_ITEM = "flex items-center gap-1.5 text-muted-foreground"
const LEGEND_SWATCH = "size-2 shrink-0 rounded-[2px]"

type ChartSeries = {
  label?: React.ReactNode
  /** 계열 색. 소비처가 주입하는 입력이고 우리 토큰이 아니다. */
  color?: string
}

type ChartConfig = Record<string, ChartSeries>

const ChartContext = React.createContext<{ config: ChartConfig } | null>(null)

/* 컨텍스트가 없어도 던지지 않는다. 툴팁 카드와 범례는 **우리가 소유하는 두 자산**
 * 이고 Figma는 그 둘을 차트 없이 홀로 그린다 — 참조 스토리도 같은 자리에서 홀로
 * 렌더한다. 컨텍스트는 계열 이름을 사람이 읽는 라벨로 바꿔 주는 보탬이지 렌더의
 * 전제가 아니다. */
function useChartConfig(): ChartConfig {
  return React.useContext(ChartContext)?.config ?? {}
}

/** `--color-<key>` 한 벌. 모드 분기가 없는 것이 이 통로의 계약이다. */
function ChartStyle({ id, config }: { id: string; config: ChartConfig }) {
  const declarations = Object.entries(config)
    .filter(([, series]) => series.color)
    .map(([key, series]) => `  --color-${key}: ${series.color};`)
  if (!declarations.length) return null
  return <style dangerouslySetInnerHTML={{ __html: `[data-chart="${id}"] {\n${declarations.join("\n")}\n}` }}/>
}

function ChartContainer({
  id,
  className,
  indicator,
  config,
  children,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof chartVariants> & {
    config: ChartConfig
    children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>["children"]
  }) {
  const reactId = React.useId()
  const chartId = `chart-${id ?? reactId.replace(/:/g, "")}`
  return (
    <ChartContext.Provider value={{ config }}>
      <div data-slot="chart" data-chart={chartId} className={cn(chartVariants({ indicator, className }))} {...props}>
        <ChartStyle id={chartId} config={config}/>
        <RechartsPrimitive.ResponsiveContainer>{children}</RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
}

/** Recharts `Tooltip`이 `content`로 복제하며 넘기는 항목. 값의 정본은 라이브러리다. */
type ChartPayloadItem = {
  dataKey?: string | number
  name?: string | number
  value?: string | number
  color?: string
}

/** 툴팁 카드. 우리가 소유하는 두 자산 중 하나다. */
function ChartTooltipContent({
  active,
  payload,
  label,
  indicator = "dot",
  hideLabel = false,
  hideIndicator = false,
  className,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof chartTooltipIndicatorVariants> & {
    active?: boolean
    payload?: ChartPayloadItem[]
    label?: React.ReactNode
    hideLabel?: boolean
    hideIndicator?: boolean
  }) {
  const config = useChartConfig()
  if (!active || !payload?.length) return null
  return (
    <div data-slot="chart-tooltip-content" className={cn(TOOLTIP_CONTENT, className)} {...props}>
      {!hideLabel && label !== undefined && (
        <div data-slot="chart-tooltip-label" className={TOOLTIP_LABEL}>{label}</div>
      )}
      {payload.map((item, index) => {
        const key = String(item.dataKey ?? item.name ?? index)
        return (
          <div key={key} data-slot="chart-tooltip-item" className={TOOLTIP_ITEM}>
            {!hideIndicator && (
              <span
                data-slot="chart-tooltip-indicator"
                aria-hidden="true"
                className={cn(chartTooltipIndicatorVariants({ indicator }))}
                style={{ backgroundColor: indicator === "dashed" ? undefined : item.color, borderColor: item.color }}
              />
            )}
            <span>{config[key]?.label ?? item.name ?? key}</span>
            {item.value !== undefined && (
              <span data-slot="chart-tooltip-value" className={TOOLTIP_VALUE}>{item.value}</span>
            )}
          </div>
        )
      })}
    </div>
  )
}

/** 범례. 우리가 소유하는 두 자산 중 나머지 하나다. */
function ChartLegendContent({
  payload,
  placement,
  verticalAlign,
  hideSwatch = false,
  className,
  ...props
}: Omit<React.ComponentProps<"div">, "color"> &
  VariantProps<typeof chartLegendContentVariants> & {
    payload?: ChartPayloadItem[]
    /** Recharts `Legend`가 복제하며 넘기는 값. `placement` 기본값을 여기서 읽는다. */
    verticalAlign?: "top" | "middle" | "bottom"
    hideSwatch?: boolean
  }) {
  const config = useChartConfig()
  if (!payload?.length) return null
  const resolved = placement ?? (verticalAlign === "top" ? "top" : "bottom")
  return (
    <div data-slot="chart-legend-content" className={cn(chartLegendContentVariants({ placement: resolved, className }))} {...props}>
      {payload.map((item, index) => {
        const key = String(item.dataKey ?? item.name ?? index)
        return (
          <div key={key} data-slot="chart-legend-item" className={LEGEND_ITEM}>
            {!hideSwatch && (
              <span data-slot="chart-legend-swatch" aria-hidden="true" className={LEGEND_SWATCH} style={{ backgroundColor: item.color }}/>
            )}
            {config[key]?.label ?? item.name ?? key}
          </div>
        )
      })}
    </div>
  )
}

const staticPart = (className: string) => ({
  config: { variants: {}, defaultVariants: {} } as const,
  className: () => className,
})

const componentContract = {
  name: "chart", source: "src/components/ui/chart.tsx",
  publicExports: ["ChartContainer", "ChartTooltipContent", "ChartLegendContent", "chartVariants", "chartVariantsConfig", "chartTooltipIndicatorVariants", "chartTooltipIndicatorVariantsConfig", "chartLegendContentVariants", "chartLegendContentVariantsConfig"],
  config: chartVariantsConfig, className: (props: Record<string, string>) => cn(chartVariants(props)),
  /* ChartTooltipLabel·Item·Indicator·Value와 ChartLegendItem·Swatch는 공개 export가
   * 아니라 **이름 붙인 내부 노드**다. 두 자산이 Figma에서 그려질 때 실제로 필요한
   * 노드들이고, 우리가 className을 주는 이상 계약이 설명해야 한다(#122). */
  anatomy: [
    "ChartContainer",
    "ChartTooltipContent?", "ChartTooltipLabel?", "ChartTooltipItem*", "ChartTooltipIndicator?", "ChartTooltipValue?",
    "ChartLegendContent?", "ChartLegendItem*", "ChartLegendSwatch?",
  ],
  parts: {
    ChartTooltipContent: staticPart(TOOLTIP_CONTENT),
    ChartTooltipLabel: staticPart(TOOLTIP_LABEL),
    ChartTooltipItem: staticPart(TOOLTIP_ITEM),
    ChartTooltipIndicator: { config: chartTooltipIndicatorVariantsConfig, className: (props: Record<string, string>) => cn(chartTooltipIndicatorVariants(props)) },
    ChartTooltipValue: staticPart(TOOLTIP_VALUE),
    ChartLegendContent: { config: chartLegendContentVariantsConfig, className: (props: Record<string, string>) => cn(chartLegendContentVariants(props)) },
    ChartLegendItem: staticPart(LEGEND_ITEM),
    ChartLegendSwatch: staticPart(LEGEND_SWATCH),
  },
  externalSurfaces: {
    "차트 본체(축·격자·데이터 마크)": "recharts가 SVG 트리 전체를 만들고 우리 className이 닿는 노드가 하나도 없다 — 계약할 자리가 아니라 소비처가 Recharts prop으로 소유하는 자리다. 자손 선택자로 칠하지 않는 것이 이 경계를 지키는 방식이다",
    "반응형 컨테이너의 인라인 크기": "recharts ResponsiveContainer가 ChartContainer 안쪽에 자기 div를 만들고 width·height를 인라인으로 쓴다 — 그 한 겹은 우리 노드가 아니다",
    "툴팁·범례 래퍼의 배치": "recharts Tooltip·Legend가 우리 카드를 감싸는 래퍼 div를 만들고 위치·transform·표시 여부를 인라인 스타일로 소유한다 — 우리가 그리는 것은 그 안의 카드뿐이고 어디에 뜨는지는 라이브러리 것이다",
    "차트의 키보드 탐색과 ARIA": "recharts가 accessibilityLayer로 차트 본체의 tabIndex·role·aria를 스스로 정한다 — 우리 계약에 그 노드가 없어 켜고 끌 자리도 없다",
    "Legend가 복제하며 넣는 prop 이름": "recharts Legend가 content 요소를 align·verticalAlign·payload로 복제한다 — 외부 소유는 노드만이 아니라 prop 이름 공간에도 있고, 그래서 우리 축 이름을 placement로 피했다",
  },
  configurationStates: {},
  reference: { example: "chart", guidance: { use: "시계열이나 범주 비교를 Recharts로 그리면서, 툴팁 카드와 범례만 카탈로그의 면·글자·모서리 규칙에 맞춰 통일한다.", evidence: "투자 이력은 월별 매수·매도 금액과 평가금액 추이를 같은 화면에서 보여주고, 그 위에 뜨는 툴팁과 범례가 카드·팝오버와 다른 면으로 보이면 같은 앱으로 읽히지 않는다.", limits: "차트 본체(축·격자·데이터 마크)는 계약하지 않는다 — Recharts 소유이고 우리 className이 닿는 노드가 없다. 자손 선택자로 그 노드를 칠하지도 않는다: 매니페스트에는 담기지만 Figma가 그리지 못해 자산의 공백이 아니라 거짓 자산이 되기 때문이며, 본체 스타일은 소비처가 stroke·tick·fill prop으로 준다. ChartTooltip·ChartLegend를 재수출하지 않는다 — Recharts의 Tooltip·Legend를 우리 이름으로 내보내면 우리 클래스가 하나도 없는 노드가 공개 anatomy에 들어가고, 그건 외부 소유 표면과 겹칠 수 없다는 규칙과 정면으로 부딪친다. 소비처가 recharts에서 직접 가져와 content에 우리 카드를 꽂는다. 데이터 계열 색은 우리 토큰이 아니라 소비처가 ChartConfig의 color로 주입하는 입력이고, 우리 cva는 견본의 모양만 소유한다 — --chart-1~5 alias는 무채색 플레이스홀더로 남으며(semantic-tokens.md §7.2) 시각화 팔레트 확정은 이 맵 밖이다. 다크 모드 분기는 컨테이너가 하지 않는다: theme 키를 받지 않고 --color-<key> 한 벌만 내며, 모드에 따라 갈려야 하는 색은 소비처가 이미 모드 전환이 끝난 변수를 값으로 준다 — 라이트/다크 전환은 오직 semantic 계층에서만 일어난다. ChartContainer는 공개하되 Figma 자산으로 내지 않는다: 테마 주입 통로라 자기 축도 구성 상태도 없고 그 자리에서 얻는 것은 빈 프레임 하나다. 데이터 표를 대신하지 않는다 — 값 자체를 읽어야 하는 자리에는 Table을 쓴다." } },
} as const

export { ChartContainer, ChartTooltipContent, ChartLegendContent, chartVariants, chartVariantsConfig, chartTooltipIndicatorVariants, chartTooltipIndicatorVariantsConfig, chartLegendContentVariants, chartLegendContentVariantsConfig, componentContract }
export type { ChartConfig }
