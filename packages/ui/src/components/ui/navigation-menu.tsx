import * as React from "react"
import { NavigationMenu as NavigationMenuPrimitive } from "radix-ui"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

/* 화면을 이동하는 **사이트 탐색** 막대. shadcn 원본을 제자리에서 편집한다.
 *
 * ── Menubar와 갈리는 자리 ───────────────────────────────────────────────────
 * #119가 둘을 가른 근거는 anatomy다 — 여기는 `Link`를 갖고 저기는 `CheckboxItem`·
 * `RadioItem`·`Sub`를 갖는다. 그 경계를 구현이 그대로 진다: 이 컴포넌트에는 체크·
 * 라디오·서브메뉴가 없고, Menubar에는 `Link`도 `aria-current`도 없다. 여기 항목은
 * **URL을 갖는 목적지**이고 저기 항목은 **명령**이다.
 *
 * ── Viewport와 Indicator를 공개하지 않는다 ──────────────────────────────────
 * 티켓이 요구한 대로 **정적 시안에서 무엇으로 나타나는지**를 먼저 봤다.
 *
 * `NavigationMenuViewport`는 열린 항목의 콘텐츠가 옮겨 앉는 **공유 상자**다. 그 상자가
 * 정하는 것은 위치와 치수뿐이고 둘 다 실행 중 측정에서 온다
 * (`--radix-navigation-menu-viewport-width/height`). 내용은 열린 항목의 `Content`가
 * 정한다. 그러면 정적 시안에는 **같은 한 장의 카드를 그리는 노드가 둘** 생긴다 —
 * 파생 채널이 가르지 못하는 자산을 만들지 않는다는 #97·#119의 자리에 정확히 걸린다.
 * 그래서 Viewport를 렌더하지 않고(upstream shadcn의 `viewport={false}` 경로다) 카드를
 * `NavigationMenuContent` 자신이 그린다. Radix는 Viewport가 없으면 콘텐츠를 항목
 * 안에서 제자리 렌더한다 — 우회가 아니라 primitive가 문서화한 두 경로 중 하나다.
 *
 * `NavigationMenuIndicator`는 활성 트리거의 `offsetLeft`·`offsetWidth`를 재서 자기
 * 좌표를 만드는 삼각형이다. 정적 시안이 받을 좌표가 없고, 가리키는 대상인 **열린
 * 트리거는 이미 자기 열림 면을 갖는다** — 같은 사실을 두 번 그리는 표식이다.
 * 둘 다 나중에 여는 것은 additive이고 지금 닫는 근거를 `limits`에 남긴다.
 *
 * ── `Link`의 활성 상태는 #92 현재 위치 계약을 따른다 ────────────────────────
 * Breadcrumb·Pagination이 세운 계약과 **같은 의미의 같은 자리**다: 이 링크가 현재
 * 화면을 가리키면 `aria-current="page"`다. Radix가 `active`일 때 정확히 그 속성을
 * 내므로 우리가 다시 붙이지 않고, 구성 상태 이름도 그쪽 어휘(`currentLocation`)를
 * 그대로 쓴다. prop 이름만 upstream을 따라 `active`다 — Pagination이 `isActive`인
 * 것은 그쪽 upstream이 그래서이고, 이름은 각자의 원본을 따르되 **의미는 하나**다.
 *
 * ── `render` 확장점 ────────────────────────────────────────────────────────
 * upstream이 Next.js `Link`를 끼우는 자리로 안내하는 확장점은 계약에 넣되 **이름은
 * `render`가 아니라 `asChild`**다. `render`는 Base UI의 어휘이고 우리 24개 primitive는
 * 전부 `radix-ui`이며, 카탈로그가 이미 `BreadcrumbLink`·`PaginationLink`·
 * `DropdownMenuTrigger`에서 `asChild`를 쓴다. Base UI 이행은 #118의 "Not yet
 * specified"이므로 그 어휘를 지금 선취하지 않는다. 확장점 자체는 클래스도 노드도
 * 아니라 파생 채널에 자리가 없어 `limits` 산문이 값을 낸다 — 라우터 배선은 소비처가
 * 소유한다.
 *
 * ── 접근성 ──────────────────────────────────────────────────────────────────
 * 목록 안 좌우 화살표·Home/End 이동과 트리거의 `aria-expanded`·`aria-controls`는
 * Radix가 준다. 루트는 `<nav>`라 **랜드마크**이고 랜드마크에는 이름이 필요하므로
 * `aria-label`을 필수 prop으로 받는다(Sidebar와 같은 근거 — 한 화면에 탐색이 여럿이면
 * 이름 없이는 구분되지 않는다).
 *
 * ── 두 필드를 두지 않는다 ───────────────────────────────────────────────────
 *   - `gestures` — Radix NavigationMenu에 스와이프가 없다(ADR-0005).
 *   - `externalSurfaces` — 클래스를 내는 노드가 전부 우리 것이다(#122).
 *
 * ── 원본에서 바꾼 것 ────────────────────────────────────────────────────────
 *   - `hover:bg-accent`·`data-[state=open]:bg-accent`·`data-[active=true]:bg-accent/50`을
 *     state layer의 base 교체로 바꿨다. 불투명도를 색에 얹지 않는다.
 *   - `lucide-react` 대신 인라인 SVG.
 *   - 애니메이션 클래스(`data-[motion^=from-]:animate-in` 등)를 가져오지 않았다 —
 *     우리 카탈로그에 그 유틸리티가 없고, 동작이라 파생 채널이 나르지도 않는다. */

const navigationMenuVariantsConfig = { variants: {}, defaultVariants: {} } as const
const navigationMenuVariants = cva("relative flex w-max max-w-full items-center", navigationMenuVariantsConfig)

/* 막대 위의 항목 표면. 트리거가 입고, 자식 메뉴가 없는 최상위 링크도 이것을 입는다 —
 * upstream이 `navigationMenuTriggerStyle`을 따로 내보내는 이유이며 그래서 cva다. */
const navigationMenuTriggerVariantsConfig = { variants: {}, defaultVariants: {} } as const
const navigationMenuTriggerVariants = cva(
  "state [--ds-state-base:var(--background)] data-[state=open]:[--ds-state-base:var(--accent)] data-[active=true]:[--ds-state-base:var(--accent)] inline-flex h-9 w-max items-center justify-center gap-1 rounded-md px-3 py-2 text-sm font-medium outline-none focus-visible:border-focus-contrast focus-visible:ring-[3px] focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180",
  navigationMenuTriggerVariantsConfig
)

const LIST = "flex list-none items-center gap-1"
const ITEM = "relative"
/* Viewport가 없으므로 이 노드가 곧 열린 카드다. 자리를 잡는 것은 항목의 `relative`이고
 * 폭은 내용이 정한다 — 측정으로 계산되는 치수를 우리가 계약하지 않는다. */
const CONTENT = "absolute left-0 top-full z-50 mt-1.5 w-max rounded-md border bg-popover p-2 text-popover-foreground shadow-md"
/* 카드 안의 한 줄. `data-active`는 Radix가 `active`에서 내고 `aria-current="page"`와
 * 짝이다(#92). 최상위 막대에 놓는 링크는 이 클래스가 아니라
 * `navigationMenuTriggerVariants()`를 입는다. */
const LINK = "state [--ds-state-base:var(--popover)] data-[active=true]:[--ds-state-base:var(--accent)] flex flex-col gap-1 rounded-sm p-2 text-sm outline-none focus-visible:border-focus-contrast focus-visible:ring-[3px] focus-visible:ring-ring data-[active=true]:font-medium"

function NavigationMenu({ className, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.Root> & { "aria-label": string }) {
  return <NavigationMenuPrimitive.Root data-slot="navigation-menu" className={cn(navigationMenuVariants({ className }))} {...props} />
}

function NavigationMenuList({ className, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.List>) {
  return <NavigationMenuPrimitive.List data-slot="navigation-menu-list" className={cn(LIST, className)} {...props} />
}

function NavigationMenuItem({ className, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.Item>) {
  return <NavigationMenuPrimitive.Item data-slot="navigation-menu-item" className={cn(ITEM, className)} {...props} />
}

function NavigationMenuTrigger({ className, children, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.Trigger>) {
  return <NavigationMenuPrimitive.Trigger data-slot="navigation-menu-trigger" className={cn(navigationMenuTriggerVariants({ className }))} {...props}>
    {children}
    <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4 shrink-0 transition-transform"><path d="m4 6 4 4 4-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"/></svg>
  </NavigationMenuPrimitive.Trigger>
}

function NavigationMenuContent({ className, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.Content>) {
  return <NavigationMenuPrimitive.Content data-slot="navigation-menu-content" className={cn(CONTENT, className)} {...props} />
}

/** 목적지 링크. `active`면 Radix가 `aria-current="page"`와 `data-active`를 낸다(#92). */
function NavigationMenuLink({ className, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.Link>) {
  return <NavigationMenuPrimitive.Link data-slot="navigation-menu-link" className={cn(LINK, className)} {...props} />
}

const staticPart = (className: string) => ({
  config: { variants: {}, defaultVariants: {} } as const,
  className: () => className,
})

const componentContract = {
  name: "navigation-menu", source: "src/components/ui/navigation-menu.tsx",
  publicExports: ["NavigationMenu", "NavigationMenuList", "NavigationMenuItem", "NavigationMenuTrigger", "NavigationMenuContent", "NavigationMenuLink", "navigationMenuVariants", "navigationMenuVariantsConfig", "navigationMenuTriggerVariants", "navigationMenuTriggerVariantsConfig"],
  config: navigationMenuVariantsConfig, className: (props: Record<string, string>) => cn(navigationMenuVariants(props)),
  anatomy: ["NavigationMenu", "NavigationMenuList", "NavigationMenuItem*", "NavigationMenuTrigger?", "NavigationMenuContent?", "NavigationMenuLink*"],
  configurationStates: { open: ["closed", "open"], currentLocation: ["other", "current"] }, drawnBy: { open: { attribute: "data-state", values: { open: "open" } }, currentLocation: { attribute: "data-active", values: { current: "true" } } },
  parts: {
    NavigationMenuList: staticPart(LIST),
    NavigationMenuItem: staticPart(ITEM),
    NavigationMenuTrigger: { config: navigationMenuTriggerVariantsConfig, className: (props: Record<string, string>) => cn(navigationMenuTriggerVariants(props)) },
    NavigationMenuContent: staticPart(CONTENT),
    NavigationMenuLink: staticPart(LINK),
  },
  reference: { example: "navigation-menu", guidance: { use: "화면 상단에서 사이트의 주요 목적지를 가로로 늘어놓고, 하위 목적지가 여럿인 항목만 카드로 펼친다. 현재 화면을 가리키는 링크는 `active`로 표시하고, 하위가 없는 항목은 `NavigationMenuLink`에 `navigationMenuTriggerVariants()`를 입혀 막대에 직접 놓는다.", evidence: "투자 기록은 포트폴리오·거래·회고가 각각 URL로 직접 열려야 하는 별개 화면이고, 포트폴리오 아래에는 보유 현황·비중 같은 하위 목적지가 더 있어 막대에서 한 겹 펼쳐 보여야 한다.", limits: "Tabs가 *\"URL로 직접 접근해야 하는 화면 탐색에는 링크나 내비게이션을 사용한다\"*고 가리킨 자리가 여기다 — 같은 화면 안에서 패널만 갈아 끼우는 전환은 Tabs이고, 주소가 바뀌는 이동은 이쪽이다. Menubar와도 갈린다: 저기 항목은 실행하는 명령이라 `Link`도 `aria-current`도 없고 `CheckboxItem`·`RadioItem`·`Sub`를 갖는 반면, 여기 항목은 목적지라 그 셋을 갖지 않는다. 진입점 하나에 달린 보조 동작 묶음은 Dropdown Menu다. `NavigationMenuViewport`와 `NavigationMenuIndicator`는 공개하지 않는다 — 둘 다 실행 중 측정으로 자기 위치와 치수를 얻는 파생 노드이고, Viewport를 열면 열린 카드를 그리는 노드가 `Content`와 둘이 되어 파생 채널이 가르지 못하며(#97·#119) Indicator는 이미 열림 면을 가진 트리거를 한 번 더 가리키는 표식이다. 나중에 여는 것은 additive다. 열린 카드의 위치·치수도 계약하지 않는다: 자리는 항목이 잡고 폭은 내용이 정한다. 라우터 링크는 `NavigationMenuLink`의 `asChild`로 끼운다 — upstream이 `render`로 부르는 확장점과 같은 자리이며, 우리는 카탈로그가 이미 쓰는 `asChild` 어휘를 쓴다(Base UI 이행은 #118의 미확정 항목이라 그 어휘를 선취하지 않는다). 활성 판정 자체와 라우팅은 소비처가 소유한다. 탐색 랜드마크의 접근 가능한 이름은 소비처가 `aria-label`로 준다." } },
} as const

export { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuTrigger, NavigationMenuContent, NavigationMenuLink, navigationMenuVariants, navigationMenuVariantsConfig, navigationMenuTriggerVariants, navigationMenuTriggerVariantsConfig, componentContract }
