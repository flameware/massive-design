import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Separator, separatorVariants } from "@/components/ui/separator"

/* Button Group은 **모양만** 소유한다(#98).
 *
 * 경계 ①  기존 Button과의 이음매: 그룹은 자식의 props를 건드리지 않는다. 붙은
 *         모서리와 겹친 테두리는 전부 자식 선택자(`[&>*:not(:first-child)]`)로
 *         바깥에서 얹는다. Button의 공개 표면(variant·size·asChild·disabled)은
 *         그대로다 — 그래서 이 컴포넌트는 additive다.
 * 경계 ②  Toggle Group과의 이음매: Toggle Group은 **선택 상태**를 가진 하나의
 *         위젯이라 roving tabindex 한 칸과 화살표 키 이동을 갖는다(Radix). Button
 *         Group은 **서로 무관한 동작**을 시각적으로만 묶으므로 자식마다 탭 정지가
 *         하나씩 남고 화살표 키를 가로채지 않는다. 즉 role="group"이고
 *         role="radiogroup"/"toolbar"가 아니다.
 * 경계 ③  disabled: 그룹 단위 disabled를 만들지 않는다. 각 Button이 자기
 *         `disabled`를 소유하고 Button base의 `disabled:opacity-50`이 그대로
 *         표현한다. 그룹이 자식에게 prop을 주입하면 asChild로 들어온 링크·
 *         Select 트리거에서 계약이 깨진다.
 * 포커스  겹친 테두리 때문에 포커스 링이 이웃에 잘린다. `focus-visible:z-10`과
 *         `relative`로 포커스된 자식만 위로 올린다. */
const buttonGroupVariantsConfig = {
  variants: {
    orientation: {
      horizontal:
        "flex-row [&>*:not(:first-child)]:rounded-l-none [&>*:not(:first-child)]:border-l-0 [&>*:not(:last-child)]:rounded-r-none",
      vertical:
        "flex-col [&>*:not(:first-child)]:rounded-t-none [&>*:not(:first-child)]:border-t-0 [&>*:not(:last-child)]:rounded-b-none",
    },
  },
  defaultVariants: { orientation: "horizontal" },
} as const

const buttonGroupVariants = cva(
  "flex w-fit items-stretch [&>*]:relative [&>*:focus-visible]:z-10 [&>*:focus-within]:z-10",
  buttonGroupVariantsConfig
)

const staticPart = (className: string) => ({
  config: { variants: {}, defaultVariants: {} } as const,
  className: () => className,
})

function ButtonGroup({ className, orientation = "horizontal", ...props }: React.ComponentProps<"div"> & VariantProps<typeof buttonGroupVariants>) {
  return <div role="group" data-slot="button-group" data-orientation={orientation} className={cn(buttonGroupVariants({ orientation, className }))} {...props} />
}

/** 그룹 안의 비대화형 라벨(단위·접두 텍스트). 탭 정지를 만들지 않는다. */
function ButtonGroupText({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="button-group-text" className={cn("flex items-center gap-2 rounded-md border bg-muted px-4 text-sm font-medium text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", className)} {...props} />
}

/* 구분선이 어느 방향으로 서는가가 `ButtonGroupSeparator`의 축이다(#171).
 *
 * **기본값이 `vertical`인 것은 오늘 이 파트가 실제로 그리는 모양이기 때문이다.**
 * 발행된 인스턴스는 `orientation="vertical"`로 `Separator`에 들어가 `h-full w-0
 * self-stretch border-l` — 가로로 늘어선 버튼 사이에 서는 **세로 하이라인**을 그린다.
 * upstream도 `vertical`을 기본값으로 두지만 그것은 근거가 아니다(#139의 규칙,
 * #145의 `EmptyMedia frame: icon`이 선 자리) — 우리 코드가 그리는 것을 먼저 재고
 * 그 모양에 이름을 붙였고, 두 값이 우연히 같았을 뿐이다. 기본값이 오늘의 문자열을
 * 한 글자도 바꾸지 않으므로 이 축은 **additive**다.
 *
 * **루트의 `orientation`을 물려받지 않는다.** 물려받으면 축 값과 기본값이 root의
 * 것 그대로 와서(`horizontal`) 기본 인스턴스가 가로 선으로 뒤집힌다. 게다가 뜻이
 * **반대다** — 가로 그룹에는 세로 선이 선다. 같은 이름이 한 컴포넌트 안에서 두 뜻을
 * 갖지 않도록 파트가 자기 축을 지고, 소비처가 짝을 맞춘다(참조 스토리가 그 짝이다).
 * `ResizableHandleGrip`이 root의 방향을 **그대로** 물려받는 것과 갈리는 자리다.
 *
 * **축 이름은 `orientation`이 맞다.** ADR-0008 규칙 1은 이 이름이 카탈로그에서
 * *다른 것*을 뜻하는지 묻는데, `Separator`·`Carousel`·`Resizable`·`Field`·`Tabs`·
 * `Slider`·`ScrollArea`·`ButtonGroup` 자신까지 전부 "이것이 어느 방향으로 서는가"
 * 하나로 쓴다. `align`이 두 뜻으로 겹쳐 `placement`가 된 #144와 반대 결과다 —
 * 겹침이 아니라 일치라서 이름을 바꾸면 오히려 어휘가 갈린다.
 *
 * **선은 `border`가 그린다.** `Separator`가 이미 `border-t`/`border-l`로 그리므로
 * `--ds-border-default`가 `border-color`에 앉는다 — `bg-*`로 그리는 upstream을
 * 복사하면 #154가 `DropdownMenuSeparator`에서 잡은 계열 위반이 그대로 온다.
 * 여백(upstream의 `mx-px`/`my-px`)은 얹지 않는다: 그룹이 이미 이웃 테두리를
 * `border-l-0`으로 접었고, 새 여백은 발행된 인스턴스를 움직인다. */
const buttonGroupSeparatorVariantsConfig = {
  variants: {
    /* 두 칸이 빈 문자열인 것은 Resizable의 root와 같은 이유다 — 축은 계약에 있어야
     * 하지만 그리는 자리는 우리가 **소비하는** `Separator`의 cva다(#91). */
    orientation: { horizontal: "", vertical: "" },
  },
  defaultVariants: { orientation: "vertical" },
} as const

/** 구분선이 그룹의 교차축을 꽉 채우게 하는 한 칸. `h-full`은 flex 아이템에서 서지 않는다. */
const BUTTON_GROUP_SEPARATOR = "self-stretch"

/** 겹친 테두리 대신 명시적 구분선이 필요할 때 쓴다. 항상 decorative다. */
function ButtonGroupSeparator({ className, orientation = "vertical", ...props }: React.ComponentProps<typeof Separator>) {
  return <Separator data-slot="button-group-separator" orientation={orientation} className={cn(BUTTON_GROUP_SEPARATOR, className)} {...props} />
}

const componentContract = {
  name: "button-group", source: "src/components/ui/button-group.tsx",
  publicExports: ["ButtonGroup", "ButtonGroupText", "ButtonGroupSeparator", "buttonGroupVariants", "buttonGroupVariantsConfig", "buttonGroupSeparatorVariantsConfig"],
  config: buttonGroupVariantsConfig, className: (props: Record<string, string>) => cn(buttonGroupVariants(props)),
  anatomy: ["ButtonGroup", "Button*", "ButtonGroupText?", "ButtonGroupSeparator?"],
  configurationStates: { disabled: ["enabled", "disabled"] }, drawnBy: { disabled: "각 `Button`이 자기 `disabled`를 소유하고 Button base의 `disabled:opacity-50`이 그린다 — 그룹은 그리지 않는다(경계 ③)" },
  parts: {
    ButtonGroupText: staticPart("flex items-center gap-2 rounded-md border bg-muted px-4 text-sm font-medium text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"),
    /* 셀은 이 노드가 **실제로 다는 문자열 전부**여야 한다 — 지금까지 `self-stretch`
     * 하나만 실려서 파생 채널에는 `align-self`밖에 없었고, 선 자체(두께·색·치수)가
     * 어느 채널에도 없었다. `separatorVariants`를 **불러** 합친다: 복사가 아니라
     * 소비이고(#91), 그래서 `Separator`가 선을 다시 정하면 여기도 따라 움직인다. */
    ButtonGroupSeparator: {
      config: buttonGroupSeparatorVariantsConfig,
      className: (props: Record<string, string>) => cn(separatorVariants({ orientation: props.orientation as "horizontal" | "vertical" }), BUTTON_GROUP_SEPARATOR),
    },
  },
  behaviors: {},
  reference: { example: "button-group", guidance: { use: "서로 무관한 동작 버튼을 같은 맥락에서 하나의 덩어리로 붙여 보여 주고, 자식마다 탭 정지와 각자의 disabled를 남기며, 명시적 구분선이 설 방향은 `ButtonGroupSeparator`의 `orientation` 축이 정한다.", evidence: "투자 이력의 행 도구 모음처럼 내보내기·인쇄·행 메뉴가 나란히 서야 하고, 그중 하나만 비활성이 되는 자리가 있다.", limits: "하나의 값을 고르는 선택 위젯에는 쓰지 않는다 — 그 자리는 화살표 키 이동과 선택 상태를 가진 Toggle Group이며, 이 컴포넌트는 Button의 공개 props를 주입하거나 대체하지 않는다. 붙은 모서리와 겹친 테두리를 얹는 `[&>*:not(:first-child)]` 계열은 셀에 나타나지 않고 매니페스트의 `elsewhere`가 진다 — 그 모서리는 Figma에 실재하되 이 컨테이너 자산이 아니라 **조립된 그룹**에 그려진다(ADR-0012). Toggle Group은 같은 일을 항목의 셀에서 하는데, 그쪽으로 옮길 자리가 여기엔 없다 — 경계 ①이 자식의 props를 건드리지 않기로 했고 자식은 남의 컴포넌트다. `ButtonGroupSeparator`가 설 방향은 `orientation` 축이 진다 — `vertical`(가로 그룹 사이에 서는 세로 하이라인, 기본값)·`horizontal`(세로 그룹 사이에 서는 가로 하이라인) 둘이다. **기본값을 `vertical`로 둔 것은 오늘 이 파트가 그리는 모양이 그것이기 때문이다**: 발행된 인스턴스는 `h-full w-0 self-stretch border-l`을 달고 있고 `vertical`이 그 문자열을 한 글자도 바꾸지 않으므로 이 축은 additive다(#143의 `knockout: none`, #144의 `placement: auto`, #145의 `frame`과 같은 자리). upstream의 기본값도 `vertical`이지만 그것을 근거로 삼지 않았다 — 근거는 우리 코드이고, 두 값이 같은 것은 결과다. **루트의 `orientation`을 물려받지 않는다**: 물려받으면 축 값과 기본값이 root의 것(`horizontal`)으로 와 기본 인스턴스가 뒤집히고, 무엇보다 뜻이 반대다 — 가로 그룹에는 세로 선이 선다. 그래서 어긋난 짝(가로 그룹에 가로 선)을 계약이 막지 못하며, 짝을 맞추는 것은 소비처의 일이다(참조 스토리가 그 짝을 보인다). 축 이름이 `orientation`인 것은 카탈로그에서 이 이름이 이미 **같은 뜻**으로만 쓰이기 때문이다(`Separator`·`Carousel`·`Resizable`·`Field`·`Tabs`·`Slider`·`ScrollArea`, 그리고 이 컴포넌트의 루트) — `align`이 두 뜻으로 겹쳐 `placement`가 된 #144의 반대 결과다(ADR-0008 규칙 1). 선의 색은 `Separator`가 `border-t`/`border-l`로 그려 `--ds-border-default`가 `border-color`에 앉는다 — upstream이 `bg-*`로 그리는 것을 복사하면 #154가 `DropdownMenuSeparator`에서 잡은 계열 위반이 온다. upstream이 방향마다 더하는 `mx-px`/`my-px` 여백은 옮기지 않는다: 겹친 테두리를 이미 `border-l-0`으로 접었고, 새 여백은 발행된 인스턴스를 움직여 additive가 아니게 된다. 이 선은 언제나 decorative다 — `Separator`의 기본값이 `decorative`이므로 `role=\"none\"`이 되어 `role=\"group\"`인 그룹의 자식 목록에 의미 노드를 더하지 않는다. 그룹이 뜻으로 갈린다면 그것은 구분선이 아니라 두 개의 `ButtonGroup`이다." } },
} as const

export { ButtonGroup, ButtonGroupText, ButtonGroupSeparator, buttonGroupVariants, buttonGroupVariantsConfig, buttonGroupSeparatorVariantsConfig, componentContract }
