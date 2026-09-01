import * as React from "react"
import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { toggleVariants, type ToggleStyleProps } from "@/components/ui/toggle"

/* 항목이 **떨어져 서는가 붙어 서는가**는 축이다(#146).
 *
 * **이름이 `spacing`인 이유.** upstream의 이름이고, 우리 카탈로그에서 `spacing`은
 * 아직 아무 뜻도 갖고 있지 않다 — #144가 `align`을 버린 것은 그 이름이 이미 Radix의
 * prop 이름 공간에서 **떠 있는 표면이 트리거의 어느 모서리에 붙는가**를 뜻했기
 * 때문이고, 여기에는 그런 충돌이 없다. 값만 우리 어휘로 바꾼다: upstream은
 * `spacing={0}`/`{1}`이지만 숫자는 이름이 아니라 값이라 Figma가 "1"을 그리지 못한다.
 *
 * **`TabsList`의 밑줄 축과 같은 개념이 아니다**(#146의 전제). 둘 다 "붙은 것과
 * 떨어진 것" 계열로 보이지만 갈리는 자리가 다르다 — 여기서 바뀌는 것은 **항목끼리의
 * 간격과 모서리 연속성**(`gap`·`border-radius`·`border-width`)이고, 저기서 바뀌는 것은
 * **활성 항목을 무엇이 표시하는가**(`background-color`·`box-shadow` ↔ `border-color`)다.
 * 붙은 Toggle Group은 여전히 알약으로 눌린 항목을 표시하고, 밑줄 Tabs는 붙여도
 * 밑줄이 생기지 않는다. 파생 채널이 집는 속성 집합부터 겹치지 않으므로 어휘를
 * 공유하지 않는다 — 한 이름이 두 뜻이 되는 것을 피하는 것과 같은 이유로,
 * **두 개념을 한 이름에 넣지도 않는다.**
 *
 * **기본값이 `separate`인 이유.** `attached`를 기본으로 두면 발행된 모든 그룹이
 * 하루아침에 `gap-0`과 테두리를 얻는다 — 인스턴스의 재해석이다. `separate`는 클래스를
 * 내지 않아 오늘의 렌더를 그대로 지키고, 그래서 이 축은 additive다(#143의
 * `knockout: none`, #144의 `placement: auto`가 선 자리와 같다).
 *
 * **바깥 모서리는 새 토큰을 요구하지 않는다**(맵 규칙 4). 붙은 형태가 필요로 하는 것은
 * 안쪽 모서리를 **없애는 것**(`rounded-none`, 0)과 바깥 모서리에 `Toggle`이 이미 쓰는
 * `rounded-md`(radius.md)를 남기는 것뿐이라, 요구되는 값이 전부 기존 스케일 안에 있다.
 * 새 radius 단계를 만들 자리가 아니다. */
const toggleGroupVariantsConfig = {
  variants: {
    variant: { default: "", outline: "" },
    size: { sm: "", default: "", lg: "" },
    orientation: {
      horizontal: "flex-row",
      vertical: "flex-col",
    },
    spacing: { separate: "", attached: "gap-0" },
  },
  defaultVariants: { variant: "default", size: "default", orientation: "horizontal", spacing: "separate" },
} as const

const toggleGroupVariants = cva("flex w-fit items-center gap-1", toggleGroupVariantsConfig)
type ToggleGroupStyleProps = VariantProps<typeof toggleGroupVariants>
type ToggleGroupOrientation = NonNullable<ToggleGroupStyleProps["orientation"]>
type ToggleGroupSpacing = NonNullable<ToggleGroupStyleProps["spacing"]>

/* **붙이는 것은 컨테이너가 정하고 그리는 것은 항목이다.** 컨테이너가 지는 것은
 * `gap-0` 하나뿐이고, 모서리 평탄화·경계선·포커스 링 겹침은 전부 항목의 셀 안에서
 * 끝난다. Button Group은 같은 일을 컨테이너의 자식 선택자
 * (`[&>*:not(:first-child)]:rounded-l-none`)로 하는데, 그 선언은 매니페스트에서
 * 전부 `unresolved`로 떨어진다 — 실제로 `button-group.gen.json`의 두 셀이 그 여덟
 * 항목을 지고 있다. 항목에 두면 `border-radius`·`border-width`·`position`이 제 셀에서
 * 해결된 값으로 나르고, 남는 `unresolved`는 첫·마지막 항목의 바깥 모서리를 지목하는
 * `first:`·`last:` 여섯 개뿐이다. 그 여섯은 **이미 카탈로그가 지고 있는 것과 같은
 * 관용구**다 — `InputOTPSlot`이 `border-y border-r first:rounded-l-md first:border-l
 * last:rounded-r-md`로 붙은 칸을 그린다. 붙은 형태를 두 번째 방식으로 다시 발명하지
 * 않는다(#140이 그 더미를 소유한다).
 *
 * **`border`가 붙는 이유는 카탈로그가 붙은 칸을 그리는 방식이 그것이기 때문이다.**
 * `variant: default`의 항목에는 테두리가 없어 간격을 0으로 만들면 이웃과의 경계가
 * 남지 않는다. 붙은 형태에서만 `border`를 얹어 칸을 나누고, 맞닿는 변은
 * `border-l-0`(세로면 `border-t-0`)로 한 번만 그린다. `variant: outline`은 이미
 * 테두리가 있어 이 축이 겹치는 변만 걷어낸다.
 *
 * ⚠️ **이 선은 접근성 근거가 아니다.** 색은 `@layer base`의 `--ds-border-default`이고
 * 그 값은 canvas 위에서 약 1.4:1이라 비텍스트 3:1 아래다 — `packages/tokens`의
 * `tokens:contrast`가 `border.strong`·`accent`·`danger`·`focus`만 조합표에 올리고
 * `border.default`를 **의도적으로 뺀** 이유가 그것이다(`border.field`·`knockout`과 같은
 * 자리다). 여기서 이 선이 지는 것은 **형태의 판독**이지 대비 기준의 충족이 아니다:
 * 붙은 칸의 경계를 이 색으로 그리는 것은 `InputOTPSlot`과 `ButtonGroup`의 붙은 형태가
 * 이미 하고 있는 일이고, 여기만 다른 색을 쓰면 한 카탈로그 안에서 "붙었다"가 두 모양이
 * 된다. 3:1을 지는 구분선이 필요하면 `border.strong`이 그 자리인데 그 토큰에는 Tailwind
 * 유틸리티가 없어 `--border-strong`·`--color-border-strong` 별칭을 새로 내야 하고,
 * 그건 `tokens.css`를 움직여 51개 전부의 `tokenArtifactHash`를 옮기는 일이라 맵 규칙 4의
 * 선제 토큰 금지에 정면으로 걸린다(#109가 사는 동네다). 지금은 소비처가 그 자리에서
 * `className`으로 덮는다.
 *
 * **`relative`·`focus-visible:z-10`은 포커스 링을 지키기 위한 것이다.** 붙으면 이웃의
 * 면과 테두리가 링 위를 덮는다. Button Group이 컨테이너에서 같은 일을 하지만 여기서는
 * 항목이 자기 것을 진다 — 그리고 `focus-visible`은 `MODIFIER_POLICY`에서 `ignore`라
 * 이 두 줄은 `unresolved`를 하나도 더하지 않는다.
 *
 * **`orientation`이 항목에도 있는 이유**는 어느 변을 평탄하게 만들지가 축에 따라
 * 갈리기 때문이다. `separate`에서는 두 칸이 모두 빈 문자열이라 오늘의 렌더가 그대로다 —
 * Carousel이 `CarouselItem`에 같은 축을 둔 것과 같은 모양이다. */
const toggleGroupItemVariantsConfig = {
  variants: {
    variant: { default: "", outline: "" },
    size: { sm: "", default: "", lg: "" },
    orientation: { horizontal: "", vertical: "" },
    spacing: { separate: "", attached: "relative rounded-none border focus-visible:z-10" },
  },
  defaultVariants: { variant: "default", size: "default", orientation: "horizontal", spacing: "separate" },
  compoundVariants: [
    { orientation: "horizontal", spacing: "attached", class: "border-l-0 first:rounded-l-md first:border-l last:rounded-r-md" },
    { orientation: "vertical", spacing: "attached", class: "border-t-0 first:rounded-t-md first:border-t last:rounded-b-md" },
  ],
} as const

/* `as const`가 `compoundVariants`까지 readonly로 얼려 cva의 시그니처와 어긋난다.
 * 축 목록(`variants`)은 계약이 그대로 내보내야 하므로 얼린 채 두고, cva에 넘기는
 * 순간에만 조합 배열을 복사한다 — 값은 하나이고 두 소비처의 요구가 다를 뿐이다. */
const toggleGroupItemVariants = cva("min-w-0 px-3", { ...toggleGroupItemVariantsConfig, compoundVariants: [...toggleGroupItemVariantsConfig.compoundVariants] })

/** 항목의 조합 클래스. `Toggle`의 면을 소비하고 그 위에 그룹의 결정만 얹는다(#91). */
const toggleGroupItemClassName = (props: Record<string, string>) =>
  cn(toggleVariants({ variant: props.variant as ToggleStyleProps["variant"], size: props.size as ToggleStyleProps["size"] }), toggleGroupItemVariants(props))

/* 축을 두 곳에 손으로 적지 않도록 그룹이 자기 축을 항목에 넘긴다 — Resizable의
 * 그룹→핸들, Avatar의 그룹→링과 같은 자리다. 항목이 prop으로 덮을 수 있다. */
type ToggleGroupItemContext = ToggleStyleProps & { orientation: ToggleGroupOrientation; spacing: ToggleGroupSpacing }
const ToggleGroupContext = React.createContext<ToggleGroupItemContext>({ variant: "default", size: "default", orientation: "horizontal", spacing: "separate" })

function ToggleGroup({ className, variant = "default", size = "default", orientation = "horizontal", spacing = "separate", children, ...props }: React.ComponentProps<typeof ToggleGroupPrimitive.Root> & ToggleGroupStyleProps) {
  return <ToggleGroupPrimitive.Root data-slot="toggle-group" data-variant={variant} data-size={size} data-spacing={spacing} orientation={orientation} className={cn(toggleGroupVariants({ variant, size, orientation, spacing, className }))} {...props}><ToggleGroupContext.Provider value={{ variant, size, orientation: orientation ?? "horizontal", spacing: spacing ?? "separate" }}>{children}</ToggleGroupContext.Provider></ToggleGroupPrimitive.Root>
}

function ToggleGroupItem({ className, variant, size, orientation, spacing, ...props }: React.ComponentProps<typeof ToggleGroupPrimitive.Item> & ToggleStyleProps & VariantProps<typeof toggleGroupItemVariants>) {
  const context = React.useContext(ToggleGroupContext)
  const resolved = { variant: variant ?? context.variant, size: size ?? context.size, orientation: orientation ?? context.orientation, spacing: spacing ?? context.spacing }
  return <ToggleGroupPrimitive.Item data-slot="toggle-group-item" data-variant={resolved.variant} data-size={resolved.size} className={cn(toggleVariants({ variant: resolved.variant, size: resolved.size }), toggleGroupItemVariants(resolved), className)} {...props} />
}

const componentContract = {
  name: "toggle-group", source: "src/components/ui/toggle-group.tsx",
  publicExports: ["ToggleGroup", "ToggleGroupItem", "toggleGroupVariants", "toggleGroupVariantsConfig"],
  config: toggleGroupVariantsConfig, className: (props: Record<string, string>) => cn(toggleGroupVariants(props)),
  anatomy: ["ToggleGroup", "ToggleGroupItem*"], configurationStates: { selection: ["single", "multiple"], pressed: ["unpressed", "pressed"] }, drawnBy: { selection: "`type` prop이 고르는 조립이 그린다 — 하나만 눌리는지 여럿인지는 primitive의 동작이다", pressed: { attribute: "data-state", values: { pressed: "on" } } },
  parts: {
    ToggleGroupItem: { config: toggleGroupItemVariantsConfig, className: toggleGroupItemClassName },
  },
  behaviors: {},
  reference: { example: "toggle-group", guidance: { use: "관련된 토글을 묶어 하나 또는 여러 값을 선택하고 화살표 키로 항목 사이를 이동하며, 항목을 떨어뜨려 둘지 하나의 덩어리로 붙일지 `spacing`으로 고른다.", evidence: "차트 기간은 하나만, 비교 지표는 여러 개를 고르는 조밀한 도구 모음이 필요하고, 좁은 도구 막대에서는 그 묶음이 한 덩어리로 붙어야 한다.", limits: "서로 무관한 동작을 시각적으로 붙이는 Button Group이나 제출형 선택 필드를 대신하지 않는다. 붙은 형태는 `spacing` 축이 진다 — `separate`(기본값)·`attached` 둘이고, 이름은 upstream을 따르되 값은 우리 어휘다(upstream의 `spacing={0}`은 숫자라 파생 채널이 그릴 이름이 되지 못한다). 기본값이 `separate`인 것은 `attached`를 기본으로 두면 발행된 모든 그룹이 `gap-0`과 테두리를 얻어 인스턴스가 재해석되기 때문이다(#144의 `placement: auto`와 같은 자리). **`TabsList`의 밑줄 축과 같은 개념이 아니다** — 여기서 갈리는 것은 항목끼리의 간격과 모서리 연속성이고 저기서 갈리는 것은 활성 항목을 무엇이 표시하는가라, 파생 채널이 집는 속성 집합부터 겹치지 않는다(#146). 붙은 형태에서 각 항목의 경계는 `border`가 진다 — `variant: default`에는 테두리가 없어 간격만 0으로 만들면 이웃과의 경계가 남지 않으므로, 이 축이 붙을 때만 테두리를 세우고 맞닿는 변은 한 번만 그린다. **이 선은 대비 기준을 지는 구분선이 아니다**: 색이 `--ds-border-default`라 canvas 위에서 약 1.4:1이고, 그 토큰은 `tokens:contrast`의 비텍스트 3:1 조합표에서 의도적으로 빠져 있다(`border.field`·`knockout`과 같은 자리). 이 선이 지는 것은 형태의 판독이며, `InputOTPSlot`과 `ButtonGroup`의 붙은 형태가 같은 색으로 같은 일을 하므로 여기만 다르게 그리지 않는다. 3:1을 지는 구분선은 `border.strong`의 자리인데 그 토큰에는 Tailwind 유틸리티가 없어 별칭을 새로 내야 하고 그건 `tokens.css`를 움직이는 일이라 맵 규칙 4가 금한다 — 필요하면 소비처가 `className`으로 덮는다. 바깥 모서리는 `Toggle`이 이미 쓰는 `rounded-md`를 그대로 남기므로 새 radius 단계를 요구하지 않는다. 첫·마지막 항목을 지목하는 `first:`·`last:` 수식자는 매니페스트에서 `unresolved`로 남는다 — `InputOTPSlot`이 붙은 칸을 그리는 것과 같은 관용구이고 그 더미는 #140이 소유한다. 붙은 형태에서도 이 컴포넌트는 여전히 선택 위젯이다: roving tabindex 한 칸과 화살표 키 이동은 Radix가 지며, 모양이 Button Group과 같아 보여도 자식마다 탭 정지가 남는 그쪽과 갈린다." } },
} as const

export { ToggleGroup, ToggleGroupItem, toggleGroupVariants, toggleGroupVariantsConfig, componentContract }
