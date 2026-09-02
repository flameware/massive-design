import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const itemVariantsConfig = {
  variants: {
    variant: { default: "", outline: "border", muted: "bg-muted" },
    size: { default: "gap-4 px-4 py-3", sm: "gap-3 px-3 py-2" },
  },
  defaultVariants: { variant: "default", size: "default" },
} as const
const itemVariants = cva("state [--ds-state-base:var(--background)] group/item flex min-w-0 items-center rounded-lg text-sm outline-none transition-colors focus-visible:border-focus-contrast focus-visible:ring-[3px] focus-visible:ring-ring data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 data-[state=selected]:[--ds-state-base:var(--accent)]", itemVariantsConfig)

const staticPart = (className: string) => ({
  config: { variants: {}, defaultVariants: {} } as const,
  className: () => className,
})

/* 미디어 슬롯이 **자기 안의 것을 담을 틀을 그리는가**가 축이다(#145).
 *
 * 갈리는 것이 실제로 셋이다 — **지름**(없음 / `size-8` / `size-10`), **면**(없음 /
 * `bg-muted`), **자르기**(없음 / `overflow-hidden`). 셋 다 셀 안의 속성으로 떨어져
 * 파생 채널이 그대로 나르므로 #97·ADR-0006 ⓐ를 통과한다. 소비처가 스스로 하면
 * 지름·모서리·면색을 손으로 다시 정해야 해서 ⓑ도 통과한다. **갈리는 것이 없었다면
 * 축을 열지 않았다**(맵 규칙 3) — 여기서는 갈린다.
 *
 * **이름이 `variant`가 아닌 이유.** upstream은 이 축을 `variant`라 부르지만 우리
 * 카탈로그에서 `variant`는 **루트의 의미·강조 축**이다(`Item` 자신의
 * default·outline·muted, `Empty`·`Alert`·`Badge`·`Button` 전부). 파트 축 열일곱 개
 * 중 `variant`를 쓰는 것은 하나도 없고, `ChartTooltipIndicator`의 `indicator`처럼
 * **그 파트가 무엇을 지는가**로 이름 붙는다. `ItemMedia`에 `variant`를 얹으면 한
 * 파일 안에서 한 단계 떨어진 두 축이 같은 이름으로 다른 뜻이 된다 — #144가
 * `align`을 버리고 `placement`를 세운 바로 그 자리다(#125의 선례).
 * `frame`은 갈리는 셋(지름·면·자르기)을 한 낱말로 부른다.
 *
 * **기본값이 `none`인 이유.** 오늘의 `ItemMedia`는 틀 없이 글리프만 놓는다.
 * `none`이 그 문자열을 한 글자도 바꾸지 않아 발행된 인스턴스를 재해석하지 않고,
 * 그래서 이 축이 additive다(#143의 `knockout: none`, #144의 `placement: auto`).
 *
 * **모서리와 면을 `EmptyMedia`에서 그대로 가져온다.** 두 미디어 슬롯이 한 축을
 * 공유하므로 틀의 모서리도 한 번만 정해야 하고, 그 결정은 이미
 * `EmptyMedia`의 `rounded-lg`·`bg-muted`로 우리 카탈로그에 서 있다. upstream은
 * `rounded-sm`에 `border`를 두르지만 그걸 따르면 **같은 축의 두 파트가 다른 틀을
 * 그린다.** 새 반지름·새 테두리 결정 0개다(맵 규칙 4).
 *
 * **`[&_img]` 두 유틸리티는 `MODIFIER_POLICY`가 `ignore:`로 닫았다**(#181). 여기
 * 걸리는 것은 **HTML에서 그림이 틀을 채우게 하는 배관**뿐이고, Figma는 자식 노드가
 * 아니라 **틀 자신의 clip과 image fill**로 같은 일을 하므로 옮길 자식이 없다 —
 * 그 틀(지름·모서리·자르기)은 이 셀이 이미 해결된 속성으로 담고 있다. 슬롯으로
 * 담으려면 역할 어휘를 늘려야 하는데 소비처가 넣는 `<img>`에 역할을 주는 것은
 * **계약을 여는** 방향이라 #140의 destination과 반대다(ADR-0013). */
const itemMediaVariantsConfig = {
  variants: {
    frame: {
      none: "[&_svg]:size-5",
      icon: "size-8 rounded-lg bg-muted [&_svg]:size-4",
      image: "size-10 overflow-hidden rounded-lg [&_img]:size-full [&_img]:object-cover",
    },
  },
  defaultVariants: { frame: "none" },
} as const

const itemMediaVariants = cva("flex shrink-0 items-center justify-center text-muted-foreground", itemMediaVariantsConfig)

function Item({ className, variant = "default", size = "default", ...props }: React.ComponentProps<"div"> & VariantProps<typeof itemVariants>) { return <div data-slot="item" className={cn(itemVariants({ variant, size, className }))} {...props} /> }
function ItemMedia({ className, frame = "none", ...props }: React.ComponentProps<"div"> & VariantProps<typeof itemMediaVariants>) { return <div data-slot="item-media" data-frame={frame} className={cn(itemMediaVariants({ frame, className }))} {...props} /> }
function ItemContent({ className, ...props }: React.ComponentProps<"div">) { return <div data-slot="item-content" className={cn("flex min-w-0 flex-1 flex-col gap-1", className)} {...props} /> }
function ItemTitle({ className, ...props }: React.ComponentProps<"div">) { return <div data-slot="item-title" className={cn("line-clamp-1 font-medium", className)} {...props} /> }
function ItemDescription({ className, ...props }: React.ComponentProps<"p">) { return <p data-slot="item-description" className={cn("line-clamp-2 text-sm text-muted-foreground", className)} {...props} /> }
function ItemActions({ className, ...props }: React.ComponentProps<"div">) { return <div data-slot="item-actions" className={cn("flex shrink-0 items-center gap-2", className)} {...props} /> }
function ItemHeader({ className, ...props }: React.ComponentProps<"div">) { return <div data-slot="item-header" className={cn("flex w-full items-center justify-between gap-2", className)} {...props} /> }
function ItemFooter({ className, ...props }: React.ComponentProps<"div">) { return <div data-slot="item-footer" className={cn("flex w-full items-center justify-between gap-2", className)} {...props} /> }
function ItemGroup({ className, ...props }: React.ComponentProps<"div">) { return <div data-slot="item-group" className={cn("flex flex-col", className)} {...props} /> }
function ItemSeparator({ className, ...props }: React.ComponentProps<"div">) { return <div data-slot="item-separator" role="separator" className={cn("mx-4 border-t", className)} {...props} /> }

const componentContract = {
  name: "item", source: "src/components/ui/item.tsx",
  publicExports: ["Item", "ItemMedia", "ItemContent", "ItemTitle", "ItemDescription", "ItemActions", "ItemHeader", "ItemFooter", "ItemGroup", "ItemSeparator", "itemVariants", "itemVariantsConfig"],
  config: itemVariantsConfig, className: (props: Record<string, string>) => cn(itemVariants(props)),
  anatomy: ["Item", "ItemMedia?", "ItemContent", "ItemTitle", "ItemDescription?", "ItemActions?", "ItemHeader?", "ItemFooter?", "ItemGroup?", "ItemSeparator?"], configurationStates: { item: ["default", "selected"] }, drawnBy: { item: { attribute: "data-state", values: { selected: "selected" } } },
  parts: {
    ItemMedia: { config: itemMediaVariantsConfig, className: (props: Record<string, string>) => cn(itemMediaVariants(props)) },
    ItemContent: staticPart("flex min-w-0 flex-1 flex-col gap-1"),
    ItemTitle: staticPart("line-clamp-1 font-medium"),
    ItemDescription: staticPart("line-clamp-2 text-sm text-muted-foreground"),
    ItemActions: staticPart("flex shrink-0 items-center gap-2"),
    ItemHeader: staticPart("flex w-full items-center justify-between gap-2"),
    ItemFooter: staticPart("flex w-full items-center justify-between gap-2"),
    ItemGroup: staticPart("flex flex-col"),
    ItemSeparator: staticPart("mx-4 border-t"),
  },
  behaviors: {},
  reference: { example: "item", guidance: { use: "미디어, 주 정보, 보조 설명과 행동을 재배치 가능한 한 항목으로 조립하고, 미디어 자리가 그릴 틀은 `ItemMedia`의 `frame` 축이 정한다.", evidence: "검색 결과, 선택 목록, 설정 행처럼 같은 정보 위계를 공유하지만 제품 의미가 다른 반복 항목이 필요하고, 같은 목록 안에서 통화 기호 같은 글리프와 종목 로고 이미지가 같은 자리에 번갈아 선다.", limits: "탐색·선택·버튼 역할을 자동으로 부여하지 않으며 도메인 필드와 상호작용 의미는 소비처가 명시한다. `ItemMedia`가 그리는 틀은 `frame` 축이 진다 — `none`(틀 없음, 기본값)·`icon`(글리프용 `size-8` 면)·`image`(그림용 `size-10` 자르기 틀) 셋이다. 값 이름은 upstream을 그대로 쓰지만(#121) **축 이름은 `variant`가 아니다** — 우리 카탈로그에서 `variant`는 루트의 의미·강조 축이고 `Item` 자신이 이미 그 이름을 쓰므로, 한 파일 안에서 한 단계 떨어진 두 축이 같은 이름으로 다른 뜻이 된다(#144가 `align`을 버린 자리). 기본값이 `none`인 것은 오늘의 `ItemMedia`가 틀 없이 글리프만 놓기 때문이고, 그래서 이 축은 additive다. 틀의 모서리·면은 `EmptyMedia`가 이미 세운 `rounded-lg`·`bg-muted`를 그대로 쓴다 — 두 미디어 슬롯이 한 축을 공유하는데 틀이 갈리면 축을 공유한 뜻이 없다(upstream의 `rounded-sm`+`border`는 따르지 않는다). **아바타는 `frame`의 값이 아니다** — upstream에도 없고, 원형 틀·지름·겹침 링은 우리 `Avatar`가 이미 지는 결정이라 값으로 열면 그 결정을 복제한다(#91). `<ItemMedia frame=\"none\"><Avatar/></ItemMedia>`로 **소비한다**: `Avatar`가 자기 틀을 그리므로 `image` 안에 넣으면 틀이 겹친다. **`image`의 `[&_img]:size-full`·`[&_img]:object-cover` 두 유틸리티는 `ignore:`로 닫혀 있다**(#181) — HTML에서 그림이 틀을 채우게 하는 배관이고 Figma는 자식 노드가 아니라 틀 자신의 clip과 image fill로 같은 일을 하므로, 옮길 자식이 없다. 틀 자체의 결정은 전부 해결된 속성으로 떨어지므로 축이 침묵하지는 않는다. 대체 텍스트는 계약이 지지 않는다 — 장식이면 `ItemMedia`에 `aria-hidden`을 걸고, 뜻이 있으면 소비처가 안쪽 `<img>`의 `alt`에 넣는다. 슬롯은 자기가 담은 것이 장식인지 알 수 없다. **`size`의 `xs` 값은 열지 않는다 — 실측 수요가 없기 때문이고(#123), `Card`의 근거로 닫는 것이 아니다.** `Card`·`AlertDialog`가 `size`를 닫은 문장(*축은 늘지만 간격은 소비처가 유틸리티로 정하면 된다*)은 둘 다 **축이 아예 없는** 자리라 성립했다. 여기는 축이 이미 있고 우리가 `default`·`sm` 두 단의 간격을 정해 발행했으므로, 소비처는 유틸리티를 **더하는** 것이 아니라 계약이 낸 `gap-4 px-4 py-3`을 **덮어써야** 하고 그렇게 덮어쓴 값은 매니페스트에 닿지 않는다 — 파생 채널에 없는 크기가 코드에 돌아다니는 모양이라 침묵보다 한 걸음 나쁘다(ADR-0006). **그래서 이 자리는 수요가 확인되면 여는 것이 기본값이다**(#174). 그때 비용은 축 신설이 아니라 루트 셀 6 → 9이고 파트 아홉은 `size`를 상속하지 않아 늘지 않는다. 값 이름은 upstream 그대로 `xs`이며 `Button`이 이미 쓰고 있어 어휘가 갈리지 않는다 — 값 이름은 축 지역이므로 충돌 자체가 물을 것이 아니다(ADR-0008)." } },
} as const

export { Item, ItemMedia, ItemContent, ItemTitle, ItemDescription, ItemActions, ItemHeader, ItemFooter, ItemGroup, ItemSeparator, itemVariants, itemVariantsConfig, componentContract }
