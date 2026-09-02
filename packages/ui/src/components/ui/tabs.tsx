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
 * **밑줄은 색만으로 활성을 말하지 않는다**(#146의 접근성 조건). 갈리는 것은 색조가
 * 아니라 **폭**이다 — 색은 네 변에 늘 `border-focus-contrast`로 앉아 있고 아래 변의
 * 폭이 `0`에서 `2px`로 바뀐다. 쉬는 트리거에는 획이 **아예 없다.** WCAG 1.4.1이
 * 링크의 밑줄을 색 외의 구분 수단으로 인정하는 것과 같은 자리이고, 여기에
 * `data-[state=active]:text-foreground`의 대비 상승과 Radix가 내는 `aria-selected`가
 * 겹친다.
 *
 * **색이 아니라 폭을 상태에 매단 두 번째 이유는 포커스다.** base의
 * `focus-visible:border-focus-contrast`는 **색만** 바꾼다. 색을 상태에 매달았다면
 * 초점을 받은 비활성 탭이 활성 탭과 똑같은 2px 밑줄을 그려, `activationMode="manual"`
 * 에서 활성이 둘로 보였을 것이다. 폭이 상태를 지면 그 자리에서 사라진다 —
 * 초점만 받은 탭의 아래 변은 여전히 `0`이다.
 *
 * **선 색은 `border-focus-contrast`다.** `--ds-border-*` 계열에서 Tailwind 유틸리티를
 * 가진 것은 `border`·`input`·`knockout`·`ring`·`focus-contrast` 다섯이고, 활성 표식이
 * 요구하는 최대 대비 중립색은 그중 하나뿐이다. `InputOTPSlot`이 이미
 * `data-[active=true]:border-focus-contrast`로 **활성 칸의 테두리**를 그리고 있어
 * 카탈로그 안에서 새 뜻이 아니다. 새 토큰을 세우지 않은 이유가 여기 있다 — 맵 규칙 4가
 * 금하기도 하지만, 세울 자리도 아니다.
 *
 * 색을 **수식자 없는** `border-color`에 두는 것은 그래야 `manifest/lint.mjs`의 계열
 * 규칙이 이 결정을 실제로 보기 때문이다. 그 규칙은 `PROPERTY_FAMILY`에 있는 맨
 * 속성 이름의 `tier: "token"` 항목만 읽는다 — `data-[state=active]:border-focus-contrast`
 * 로 적었다면 키가 `data-[state=active]:border-color`가 되고 수식자 때문에
 * `unresolved`로 떨어져 **두 겹으로** 검사 밖이었을 것이고, `border-b-*`로 적었다면
 * `border-bottom-color`라는, 그 표에 애초에 없는 이름이 되었을 것이다. 셋 중 하나만
 * 게이트가 본다.
 *
 * ⚠️ 대신 **폭 쪽은 게이트가 못 본다.** `data-[state=active]:border-b-2`는
 * `MODIFIER_POLICY`에 그 수식자가 없어 `unresolved`이고, 활성일 때 실제로 획이 서는지는
 * 사람이 Storybook에서 본다. 없는 것을 있다고 적지 않는다(ADR-0006) — 이 자리는
 * `data-[state=*]` 수식자 더미를 소유하는 [#140]의 몫이다.
 *
 * **상태 면(`--ds-state-base`)을 주지 않는다.** 알약은 트랙 위에 앉으므로 `--muted`를
 * 깔아야 hover 층이 옳게 섞이지만, 밑줄은 **깔 면이 없다.** 여기에 `--background`를
 * 주면 `state`가 그 값을 불투명 `background-color`로 컴파일해 트리거마다
 * `--ds-bg-canvas` 사각형이 깔린다 — 이 축이 없애려는 그 트랙을 다시 그리는 것이고,
 * Card·Dialog·Sidebar 면 위에서는 면색까지 어긋난다(Storybook은 canvas 위에 그려
 * 사람 확인이 이걸 못 본다). `state.css`가 적어 둔 대로 base를 안 주면 `transparent`에
 * 섞여 ghost와 같은 경로가 되고, hover 8% · pressed 12% 사다리는 그대로다. */
const tabsListVariantsConfig = {
  variants: {
    indicator: {
      pill: "rounded-lg bg-muted p-[3px]",
      /* `items-stretch`는 트리거를 목록의 내용 높이까지 늘려 밑줄을 기준선에 앉힌다.
       * base의 `items-center`와 트리거의 `h-[calc(100%-1px)]`는 알약의 `p-[3px]` 트랙에
       * 맞춰 잡은 값이라 여기서는 밑줄을 기준선 위 0.5px에 띄운다 — 머리카락만 한
       * 틈과 두 겹의 선이 남는다. 늘려서 붙이고, 트리거의 `-mb-px`가 기준선을 덮는다. */
      line: "gap-4 border-b items-stretch",
    },
  },
  defaultVariants: { indicator: "pill" },
} as const

const tabsListVariants = cva("inline-flex h-9 w-fit items-center justify-center text-muted-foreground", tabsListVariantsConfig)

const tabsTriggerVariantsConfig = {
  variants: {
    indicator: {
      pill: "[--ds-state-base:var(--muted)] rounded-md border data-[state=active]:[--ds-state-base:var(--background)] data-[state=active]:shadow-sm",
      line: "h-auto -mb-px rounded-none border-focus-contrast border-b-0 data-[state=active]:border-b-2",
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
  anatomy: ["Tabs", "TabsList", "TabsTrigger*", "TabsContent*"], configurationStates: { selected: ["inactive", "active"] }, drawnBy: { selected: { attribute: "data-state", values: { active: "active" } } },
  parts: {
    TabsList: { config: tabsListVariantsConfig, className: (props: Record<string, string>) => cn(tabsListVariants(props)) },
    TabsTrigger: { config: tabsTriggerVariantsConfig, className: (props: Record<string, string>) => cn(tabsTriggerVariants(props)) },
    TabsContent: staticPart(CONTENT),
  },
  behaviors: {
    focusActivates: { kind: "implicit-change", surface: "TabsTrigger", origin: "inherited", control: "activationMode", why: "`TabsPrimitive.Root`의 `activationMode` 기본값이 `\"automatic\"`이고 우리는 그것을 타이핑하지 않는다 — **화살표로 초점만 옮겨도 그 자리에서 패널이 바뀐다.** 활성화한 것이 없는데 `selected` 구성 상태가 움직이므로 우발 변경이다. 이 계약의 산문은 몇 세대 동안 `activationMode=\"manual\"`을 가정하고 밑줄 색 판단을 설명해 왔는데 출하되는 것은 automatic이었다 — 그 문장이 참인 것은 초점과 활성이 갈리는 경우를 가정했기 때문이고, automatic에서는 둘이 함께 움직여 갈릴 자리가 애초에 없다(#187). 소비처가 `activationMode=\"manual\"`로 바꾼다." },
  },
  reference: { example: "tabs", guidance: { use: "같은 맥락의 콘텐츠 패널을 한 번에 하나씩 전환하며 가로 또는 세로로 조립하고, 활성 탭을 알약으로 표시할지 밑줄로 표시할지 `TabsList`의 `indicator`로 고른다.", evidence: "투자 상세에서 보유 현황과 거래 내역처럼 동일 대상의 병렬 보기를 화면 이동 없이 전환해야 하고, 본문 위에 얹히는 탭 막대는 트랙 없이 기준선 하나로 서야 한다.", limits: "서로 독립된 작업 흐름이나 URL로 직접 접근해야 하는 화면 탐색에는 링크나 내비게이션을 사용한다 — 그 내비게이션이 Navigation Menu다(#127). 이 문장이 가리키던 자리가 카탈로그에 실제로 생겼으므로 경계가 닫혔다: 주소가 바뀌면 Navigation Menu, 같은 화면 안에서 패널만 갈아 끼우면 Tabs다. 활성 표식은 `indicator` 축이 진다 — `pill`(기본값)·`line` 둘이며 축은 `TabsList`에 앉고 `TabsTrigger`가 context로 받아 그린다(#125의 `ChartTooltipIndicator`가 선 자리와 같다). 이름이 upstream의 `variant`가 아닌 것은 우리 카탈로그에서 `variant`가 Button·Badge·Alert·Toggle의 **면의 계열** 이름이라 한 이름이 두 뜻을 갖기 때문이다(#144가 `align`을 버린 것과 같은 판정). 기본값이 `pill`인 것은 `line`을 기본으로 두면 발행된 탭이 트랙을 잃어 인스턴스가 재해석되기 때문이다. **Toggle Group의 `spacing`과 같은 개념이 아니다** — 저기서 갈리는 것은 항목끼리의 간격과 모서리 연속성이고 여기서 갈리는 것은 활성 표식의 정체라, 파생 채널이 집는 속성 집합부터 겹치지 않는다(#146). 밑줄은 색만으로 활성을 말하지 않는다: 갈리는 것은 색조가 아니라 아래 변의 **폭**(`0` → `2px`)이라 쉬는 트리거에는 획이 아예 없고, 여기에 `text-foreground`의 대비 상승과 Radix의 `aria-selected`가 겹친다. 색이 아니라 폭이 상태를 지는 두 번째 이유는 포커스다 — `focus-visible:border-focus-contrast`가 색만 바꾸므로, 색을 상태에 매달았다면 초점만 받은 비활성 탭이 `activationMode=\"manual\"`에서 활성 탭과 같은 밑줄을 그렸을 것이다. 선 색은 `--ds-border-focus-contrast`이고 `InputOTPSlot`이 활성 칸의 테두리에 쓰는 것과 같은 토큰이다 — 새 토큰은 세우지 않았다(맵 규칙 4). 색을 수식자 없는 `border-color`에 둔 덕에 그 토큰 선택은 `manifest/lint.mjs`의 계열 규칙이 실제로 보지만, **폭 쪽은 게이트가 보지 못한다** — `data-[state=active]`가 `MODIFIER_POLICY`에 없어 `unresolved`로 떨어지므로 활성일 때 획이 실제로 서는지는 사람이 Storybook에서 판정하며, 그 더미는 #140이 소유한다. 밑줄 형태의 트리거는 상태 면(`--ds-state-base`)을 갖지 않는다 — 깔 트랙이 없는 형태에 `--background`를 주면 트리거마다 `--ds-bg-canvas` 사각형이 깔려 이 축이 없애려는 트랙을 되그리고 Card·Dialog·Sidebar 면 위에서 면색이 어긋난다. 밑줄 형태에서도 목록은 가로로 늘어선다 — `orientation: vertical`이 옮기는 것은 목록과 패널의 관계이지 목록 안의 방향이 아니므로 기준선은 두 축 모두에서 목록의 아래 변이다. 목록의 폭은 계약하지 않는다(`w-fit`이 두 형태에 같다) — 기준선을 본문 폭까지 늘리는 것은 소비처가 `className`으로 정한다." } },
} as const

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsVariants, tabsVariantsConfig, componentContract }
