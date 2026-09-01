import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

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

/** 겹친 테두리 대신 명시적 구분선이 필요할 때 쓴다. 항상 decorative다. */
function ButtonGroupSeparator({ className, orientation = "vertical", ...props }: React.ComponentProps<typeof Separator>) {
  return <Separator data-slot="button-group-separator" orientation={orientation} className={cn("self-stretch", className)} {...props} />
}

const componentContract = {
  name: "button-group", source: "src/components/ui/button-group.tsx",
  publicExports: ["ButtonGroup", "ButtonGroupText", "ButtonGroupSeparator", "buttonGroupVariants", "buttonGroupVariantsConfig"],
  config: buttonGroupVariantsConfig, className: (props: Record<string, string>) => cn(buttonGroupVariants(props)),
  anatomy: ["ButtonGroup", "Button*", "ButtonGroupText?", "ButtonGroupSeparator?"],
  configurationStates: { disabled: ["enabled", "disabled"] }, drawnBy: { disabled: "각 `Button`이 자기 `disabled`를 소유하고 Button base의 `disabled:opacity-50`이 그린다 — 그룹은 그리지 않는다(경계 ③)" },
  parts: {
    ButtonGroupText: staticPart("flex items-center gap-2 rounded-md border bg-muted px-4 text-sm font-medium text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"),
    ButtonGroupSeparator: staticPart("self-stretch"),
  },
  reference: { example: "button-group", guidance: { use: "서로 무관한 동작 버튼을 같은 맥락에서 하나의 덩어리로 붙여 보여 주고, 자식마다 탭 정지와 각자의 disabled를 남긴다.", evidence: "투자 이력의 행 도구 모음처럼 내보내기·인쇄·행 메뉴가 나란히 서야 하고, 그중 하나만 비활성이 되는 자리가 있다.", limits: "하나의 값을 고르는 선택 위젯에는 쓰지 않는다 — 그 자리는 화살표 키 이동과 선택 상태를 가진 Toggle Group이며, 이 컴포넌트는 Button의 공개 props를 주입하거나 대체하지 않는다." } },
} as const

export { ButtonGroup, ButtonGroupText, ButtonGroupSeparator, buttonGroupVariants, buttonGroupVariantsConfig, componentContract }
