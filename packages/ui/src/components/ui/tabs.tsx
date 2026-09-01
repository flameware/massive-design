import * as React from "react"
import { Tabs as TabsPrimitive } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const tabsVariantsConfig = {
  variants: {
    orientation: {
      horizontal: "flex flex-col gap-2",
      vertical: "flex flex-row gap-4",
    },
  },
  defaultVariants: { orientation: "horizontal" },
} as const

const tabsVariants = cva("w-full", tabsVariantsConfig)

const staticPart = (className: string) => ({
  config: { variants: {}, defaultVariants: {} } as const,
  className: () => className,
})

/* **활성 탭을 무엇이 표시하는가**는 축이다(#146).
 *
 * **이름이 `indicator`인 이유.** 이 축이 고르는 것은 알약이냐 선이냐가 아니라
 * **활성 표식의 정체**다 — 알약 형태에서 활성을 나르는 것은 트리거의 면과 그림자이고,
 * 밑줄 형태에서는 아래 변의 2px 선이다. #125가 `ChartTooltipIndicator`에 세운
 * `indicator`가 정확히 그 뜻이고 값 어휘까지 겹친다(`dot`·`line`·`dashed`의 `line`은
 * 여기 `line`과 같은 모양을 말한다). upstream은 이 자리를 `variant`라 부르지만,
 * 우리 카탈로그에서 `variant`는 Button·Badge·Alert·Toggle이 쓰는 **면의 계열**
 * 이름이라 그 이름을 여기 쓰면 한 이름이 두 뜻을 갖는다 — #144가 `align`을 버린 것과
 * 같은 판정이다.
 *
 * **Toggle Group의 `spacing`과 같은 개념이 아니다**(#146의 전제). 저쪽에서 바뀌는
 * 것은 항목끼리의 `gap`과 모서리 연속성이고 여기서 바뀌는 것은 활성 표식의 속성
 * (`background-color`·`box-shadow` ↔ `border-color`·`border-width`)이다. 붙인 Tabs에
 * 밑줄이 생기지 않고 밑줄 Tabs가 항목을 붙이지 않으므로, 같은 이름을 나눠 쓰면
 * 파생 채널에서 뜻이 갈라진다. 어휘를 공유하지 않는다.
 *
 * **축이 `TabsList`에 앉고 `TabsTrigger`가 그린다.** 고르는 것은 목록이다 — 알약
 * 형태에서 트랙(`bg-muted`·`rounded-lg`·`p-[3px]`)을 소유한 것이 목록이고, 밑줄
 * 형태는 그 트랙을 기준선 하나로 바꾸는 일이라 목록의 결정 없이는 성립하지 않는다.
 * 그러나 활성 표식을 실제로 그리는 자리는 트리거다. #125의 `indicator`가 컨테이너에
 * 앉고 part가 그린 선례를 그대로 따르고, 값은 Resizable의 그룹→핸들처럼 context로
 * 내려간다 — 트리거가 prop으로 덮을 수 있다.
 *
 * **기본값이 `pill`인 이유.** 오늘의 렌더가 알약이다. `line`을 기본으로 두면 발행된
 * 모든 탭이 트랙을 잃는다 — 인스턴스의 재해석이다(#144의 `placement: auto`,
 * #143의 `knockout: none`이 선 자리와 같다).
 *
 * **밑줄은 색만으로 활성을 말하지 않는다**(#146의 접근성 조건). 비활성 트리거의 아래
 * 변은 `border-transparent`라 **선이 없고**, 활성 트리거에서만 2px 선이 나타난다 —
 * 색조가 바뀌는 것이 아니라 **획이 생긴다.** WCAG 1.4.1이 링크의 밑줄을 색 외의
 * 구분 수단으로 인정하는 것과 같은 자리이고, 여기에 `data-[state=active]:text-foreground`의
 * 대비 상승과 Radix가 내는 `aria-selected`가 겹친다.
 *
 * **선 색은 `border-focus-contrast`다.** `--ds-border-*` 계열에서 Tailwind 유틸리티를
 * 가진 것은 `border`·`input`·`knockout`·`ring`·`focus-contrast` 다섯이고, 활성 표식이
 * 요구하는 최대 대비 중립색은 그중 하나뿐이다. `InputOTPSlot`이 이미
 * `data-[active=true]:border-focus-contrast`로 **활성 칸의 테두리**를 그리고 있어
 * 카탈로그 안에서 새 뜻이 아니다. 새 토큰을 세우지 않은 이유가 여기 있다 — 맵 규칙 4가
 * 금하기도 하지만, 세울 자리도 아니다.
 *
 * ⚠️ 이 클래스는 `border-color`(shorthand longhand)에 오므로 `manifest/lint.mjs`의
 * 계열 규칙이 실제로 본다. `border-b-*`로 적었다면 `border-bottom-color`가 되어 그
 * 규칙의 표(`PROPERTY_FAMILY`)에 없는 속성이 되고, 통과가 아니라 **침묵**이었을
 * 것이다(ADR-0006). 폭만 아래 변에 주고 색은 네 변에 준다. */
const tabsListVariantsConfig = {
  variants: {
    indicator: {
      pill: "rounded-lg bg-muted p-[3px]",
      line: "gap-4 border-b",
    },
  },
  defaultVariants: { indicator: "pill" },
} as const

const tabsListVariants = cva("inline-flex h-9 w-fit items-center justify-center text-muted-foreground", tabsListVariantsConfig)

const tabsTriggerVariantsConfig = {
  variants: {
    indicator: {
      pill: "[--ds-state-base:var(--muted)] rounded-md border data-[state=active]:[--ds-state-base:var(--background)] data-[state=active]:shadow-sm",
      line: "[--ds-state-base:var(--background)] rounded-none border-b-2 data-[state=active]:border-focus-contrast",
    },
  },
  defaultVariants: { indicator: "pill" },
} as const

const tabsTriggerVariants = cva("state inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap outline-none focus-visible:border-focus-contrast focus-visible:ring-[3px] focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-foreground", tabsTriggerVariantsConfig)

const CONTENT = "flex-1 outline-none"

type TabsIndicator = NonNullable<VariantProps<typeof tabsListVariants>["indicator"]>
const TabsIndicatorContext = React.createContext<TabsIndicator>("pill")

function Tabs({ className, orientation = "horizontal", ...props }: React.ComponentProps<typeof TabsPrimitive.Root> & VariantProps<typeof tabsVariants>) {
  return <TabsPrimitive.Root data-slot="tabs" orientation={orientation} className={cn(tabsVariants({ orientation, className }))} {...props} />
}

function TabsList({ className, indicator = "pill", children, ...props }: React.ComponentProps<typeof TabsPrimitive.List> & VariantProps<typeof tabsListVariants>) {
  return <TabsPrimitive.List data-slot="tabs-list" data-indicator={indicator} className={cn(tabsListVariants({ indicator, className }))} {...props}><TabsIndicatorContext.Provider value={indicator ?? "pill"}>{children}</TabsIndicatorContext.Provider></TabsPrimitive.List>
}

function TabsTrigger({ className, indicator, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger> & VariantProps<typeof tabsTriggerVariants>) {
  const inherited = React.useContext(TabsIndicatorContext)
  return <TabsPrimitive.Trigger data-slot="tabs-trigger" className={cn(tabsTriggerVariants({ indicator: indicator ?? inherited, className }))} {...props} />
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return <TabsPrimitive.Content data-slot="tabs-content" className={cn(CONTENT, className)} {...props} />
}

const componentContract = {
  name: "tabs", source: "src/components/ui/tabs.tsx",
  publicExports: ["Tabs", "TabsList", "TabsTrigger", "TabsContent", "tabsVariants", "tabsVariantsConfig"],
  config: tabsVariantsConfig, className: (props: Record<string, string>) => cn(tabsVariants(props)),
  anatomy: ["Tabs", "TabsList", "TabsTrigger*", "TabsContent*"], configurationStates: { selected: ["inactive", "active"] },
  parts: {
    TabsList: { config: tabsListVariantsConfig, className: (props: Record<string, string>) => cn(tabsListVariants(props)) },
    TabsTrigger: { config: tabsTriggerVariantsConfig, className: (props: Record<string, string>) => cn(tabsTriggerVariants(props)) },
    TabsContent: staticPart(CONTENT),
  },
  reference: { example: "tabs", guidance: { use: "같은 맥락의 콘텐츠 패널을 한 번에 하나씩 전환하며 가로 또는 세로로 조립하고, 활성 탭을 알약으로 표시할지 밑줄로 표시할지 `TabsList`의 `indicator`로 고른다.", evidence: "투자 상세에서 보유 현황과 거래 내역처럼 동일 대상의 병렬 보기를 화면 이동 없이 전환해야 하고, 본문 위에 얹히는 탭 막대는 트랙 없이 기준선 하나로 서야 한다.", limits: "서로 독립된 작업 흐름이나 URL로 직접 접근해야 하는 화면 탐색에는 링크나 내비게이션을 사용한다 — 그 내비게이션이 Navigation Menu다(#127). 이 문장이 가리키던 자리가 카탈로그에 실제로 생겼으므로 경계가 닫혔다: 주소가 바뀌면 Navigation Menu, 같은 화면 안에서 패널만 갈아 끼우면 Tabs다. 활성 표식은 `indicator` 축이 진다 — `pill`(기본값)·`line` 둘이며 축은 `TabsList`에 앉고 `TabsTrigger`가 context로 받아 그린다(#125의 `ChartTooltipIndicator`가 선 자리와 같다). 이름이 upstream의 `variant`가 아닌 것은 우리 카탈로그에서 `variant`가 Button·Badge·Alert·Toggle의 **면의 계열** 이름이라 한 이름이 두 뜻을 갖기 때문이다(#144가 `align`을 버린 것과 같은 판정). 기본값이 `pill`인 것은 `line`을 기본으로 두면 발행된 탭이 트랙을 잃어 인스턴스가 재해석되기 때문이다. **Toggle Group의 `spacing`과 같은 개념이 아니다** — 저기서 갈리는 것은 항목끼리의 간격과 모서리 연속성이고 여기서 갈리는 것은 활성 표식의 정체라, 파생 채널이 집는 속성 집합부터 겹치지 않는다(#146). 밑줄은 색만으로 활성을 말하지 않는다: 비활성 트리거의 아래 변에는 선이 아예 없고 활성에서만 2px 획이 나타나며, 여기에 `text-foreground`의 대비 상승과 Radix의 `aria-selected`가 겹친다. 선 색은 `--ds-border-focus-contrast`이고 `InputOTPSlot`이 활성 칸의 테두리에 쓰는 것과 같은 토큰이다 — 새 토큰은 세우지 않았다(맵 규칙 4). 밑줄 형태에서도 목록은 가로로 늘어선다 — `orientation: vertical`이 옮기는 것은 목록과 패널의 관계이지 목록 안의 방향이 아니므로 기준선은 두 축 모두에서 목록의 아래 변이다. 목록의 폭은 계약하지 않는다(`w-fit`이 두 형태에 같다) — 기준선을 본문 폭까지 늘리는 것은 소비처가 `className`으로 정한다." } },
} as const

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsVariants, tabsVariantsConfig, componentContract }
