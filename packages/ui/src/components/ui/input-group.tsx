import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input, inputVariants } from "@/components/ui/input"

/* Input Group은 **필드의 껍데기**를 소유하고, 값은 여전히 Input이 소유한다(#98).
 *
 * 자식 조합  두 종류만 허용한다. ① 부가물(addon) — 아이콘·단위·버튼처럼 값을
 *            갖지 않는 것. ② 컨트롤 — InputGroupInput 하나. 컨트롤이 둘 이상
 *            들어오면 라벨 연결이 어느 쪽을 가리키는지 말할 수 없어 계약 밖이다.
 * 경계 ①  기존 Input과의 이음매: 껍데기(테두리·radius·그림자·포커스 링)를 그룹이
 *          가져가므로 안쪽 컨트롤은 자기 껍데기를 벗어야 한다. 벗기는 일은 Input의
 *          **공개 className prop**으로만 한다 — Input의 시그니처는 그대로다.
 *          그래서 additive이고, Input 단독 사용도 예전과 똑같다.
 * 경계 ②  Field와의 이음매: Field는 라벨·설명·오류를 묶는 **세로 축**이고 Input
 *          Group은 컨트롤 한 줄 안의 **가로 축**이다. 겹치지 않으므로 Field 안에
 *          InputGroup을 넣는 조합이 정상 사용이며, InputGroup은 라벨을 만들지도
 *          오류 문구를 만들지도 않는다.
 * orientation  두지 않는다. 부가물은 컨트롤과 같은 baseline 위에 서야 의미가 있고,
 *          세로로 쌓인 라벨·설명은 이미 Field의 orientation이 담당한다.
 * 포커스   그룹은 포커스를 받지 않는다(탭 정지 없음). 안쪽 컨트롤이 focus-visible이
 *          되면 `has-[:focus-visible]`로 껍데기가 링을 그린다 — Input 단독일 때와
 *          같은 focus-contrast + ring 두 겹이다.
 * disabled·invalid  전파는 CSS로만 한다. 컨트롤의 `disabled`/`aria-invalid`를
 *          `has-[…]`가 읽어 껍데기를 낮추거나 붉힌다. 그룹이 자식에게 prop을
 *          주입하지 않는다는 뜻이고, 접근성 상태의 정본은 언제나 컨트롤이다. */
const inputGroupVariantsConfig = { variants: {}, defaultVariants: {} } as const

const inputGroupVariants = cva(
  "flex h-9 w-full min-w-0 items-center gap-2 rounded-md border bg-background px-3 text-sm shadow-xs outline-none has-[:focus-visible]:border-focus-contrast has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring has-[:disabled]:pointer-events-none has-[:disabled]:opacity-50 has-[[aria-invalid=true]]:border-destructive has-[[aria-invalid=true]]:ring-destructive/20",
  inputGroupVariantsConfig
)

const staticPart = (className: string) => ({
  config: { variants: {}, defaultVariants: {} } as const,
  className: () => className,
})

const ADDON = "flex shrink-0 items-center gap-2 text-sm text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"

/* 부가물이 컨트롤의 **어느 쪽에** 서는가는 축이다(#144).
 *
 * 오늘 그것을 정하는 것은 DOM 순서뿐이다 — 앞에 쓰면 앞, 뒤에 쓰면 뒤. 그러면
 * 배치 결정이 파생 채널에 아무 자국도 남기지 않는다: addon 셀이 하나뿐이라
 * Figma는 부가물을 한 모양으로만 그린다. **보이는 선인데 파생 채널에 없는**
 * 상태이고 ADR-0006이 닫으려는 침묵이다. 축으로 두면 셀이 늘고 `data-placement`가
 * DOM에 선다.
 *
 * **이름이 `align`이 아닌 이유.** 우리 카탈로그에서 `align`은 이미 뜻이 있다 —
 * Radix가 소유하는 prop 이름 공간으로 `DropdownMenuContent`·`PopoverContent`·
 * `MenubarContent`에서 **떠 있는 표면이 트리거의 어느 모서리에 붙는가**를 말한다.
 * 여기에는 충돌할 서드파티가 없지만, 한 카탈로그 안에서 같은 이름이 다른 뜻이
 * 되는 것은 피한다. `placement`는 #125가 `ChartLegendContent`에 같은 이유로 세운
 * 이름이다.
 *
 * **기본값이 `auto`인 이유.** `start`를 기본으로 두면 `order-first`가 붙어,
 * 컨트롤 **뒤에** 쓴 기존 부가물이 앞으로 튄다 — 발행된 인스턴스의 재해석이다.
 * `auto`는 클래스를 내지 않아 오늘의 렌더를 그대로 지키고, 그래서 이 축은
 * additive다. `avatarVariants`의 `knockout: none`이 선 자리와 같다(#143).
 *
 * **값이 넷이 아닌 이유.** upstream은 `inline-start`·`inline-end`·`block-start`·
 * `block-end` 넷이다. 뒤의 둘은 껍데기 위·아래에 **한 줄을 통째로** 두는 배치인데,
 * 우리 껍데기는 `h-9`의 한 줄이고 좌우 패딩(`px-3`)을 루트가 소유한다. 그 둘을
 * 열려면 루트가 줄바꿈하는 auto 높이 컨테이너가 되어야 하고, 그건 기존 인스턴스의
 * 높이와 `h-full` 컨트롤을 재해석하는 breaking이다. `has-[[data-placement^=block]]`
 * 조건부로 피하면 그 선언이 `unresolved`가 되어 파생 채널이 못 그린다 — 같은
 * 침묵이다. 근거는 `limits`에 남는다(ADR-0006). */
const inputGroupAddonVariantsConfig = {
  variants: {
    placement: { auto: "", start: "order-first", end: "order-last" },
  },
  defaultVariants: { placement: "auto" },
} as const

const inputGroupAddonVariants = cva(ADDON, inputGroupAddonVariantsConfig)

const CONTROL = "h-full flex-1 rounded-none border-0 bg-transparent px-0 shadow-none focus-visible:border-0 focus-visible:ring-0 aria-invalid:border-0 aria-invalid:ring-0"

function InputGroup({ className, ...props }: React.ComponentProps<"div">) {
  return <div role="group" data-slot="input-group" className={cn(inputGroupVariants({ className }))} {...props} />
}

/** 값을 갖지 않는 부가물. 아이콘·단위·접두 텍스트 자리다. */
function InputGroupAddon({ className, placement = "auto", ...props }: React.ComponentProps<"div"> & VariantProps<typeof inputGroupAddonVariants>) {
  return <div data-slot="input-group-addon" data-placement={placement} className={cn(inputGroupAddonVariants({ placement, className }))} {...props} />
}

/** 그룹 안의 유일한 컨트롤. 기존 Input을 className으로만 벗겨 쓴다. */
function InputGroupInput({ className, ...props }: React.ComponentProps<typeof Input>) {
  return <Input data-slot="input-group-input" className={cn(CONTROL, className)} {...props} />
}

/** 부가물 자리의 버튼. 기존 Button을 기본 variant/size만 바꿔 쓴다. */
function InputGroupButton({ className, variant = "ghost", size = "icon-xs", ...props }: React.ComponentProps<typeof Button>) {
  return <Button data-slot="input-group-button" variant={variant} size={size} className={cn("shrink-0", className)} {...props} />
}

const componentContract = {
  name: "input-group", source: "src/components/ui/input-group.tsx",
  publicExports: ["InputGroup", "InputGroupAddon", "InputGroupInput", "InputGroupButton", "inputGroupVariants", "inputGroupVariantsConfig"],
  config: inputGroupVariantsConfig, className: (props: Record<string, string>) => cn(inputGroupVariants(props)),
  anatomy: ["InputGroup", "InputGroupAddon?", "InputGroupInput", "InputGroupButton?"],
  configurationStates: { validity: ["valid", "invalid"], disabled: ["enabled", "disabled"] }, drawnBy: { validity: { modifiers: ["has-[[aria-invalid=true]]", "aria-invalid"], carriedBy: "none" }, disabled: "루트의 `has-[:disabled]`가 그리는데 조립이 담을 자리가 없다 — 그 셀에 상태 사다리가 없어 불투명도가 버려진다. `InputGroupButton`의 `state.disabled`는 Button base가 낸 별개 값이다(#184)" },
  parts: {
    InputGroupAddon: { config: inputGroupAddonVariantsConfig, className: (props: Record<string, string>) => cn(inputGroupAddonVariants(props)) },
    InputGroupInput: staticPart(cn(inputVariants(), CONTROL)),
    InputGroupButton: staticPart(cn(buttonVariants({ variant: "ghost", size: "icon-xs" }), "shrink-0")),
  },
  behaviors: {},
  reference: { example: "input-group", guidance: { use: "한 줄 입력 컨트롤 하나와 아이콘·단위·버튼 같은 부가물을 하나의 필드 껍데기 안에 붙이고, 포커스·비활성·오류 표시를 껍데기가 대신 그린다.", evidence: "투자 이력 검색은 앞에 검색 아이콘이, 금액 입력은 뒤에 통화 단위와 초기화 버튼이 필드 안에 붙어야 한다.", limits: "값을 가진 컨트롤을 둘 이상 담지 않으며, 라벨·설명·오류 문구는 여전히 Field가 소유하고 접근성 상태의 정본은 안쪽 컨트롤의 disabled·aria-invalid다. `InputGroupAddon`의 배치는 `placement` 축이 진다 — `auto`(DOM 순서가 정한다, 기본값)·`start`·`end` 셋이다. 이름이 `align`이 아닌 것은 우리 카탈로그에서 `align`이 이미 Radix의 prop 이름 공간에 속해 **떠 있는 표면이 트리거의 어느 모서리에 붙는가**를 뜻하기 때문이고, `placement`는 #125가 `ChartLegendContent`에 같은 이유로 세운 이름이다. 기본값이 `start`가 아닌 `auto`인 것은 `order-first`가 컨트롤 뒤에 쓴 기존 부가물을 앞으로 옮겨 발행된 인스턴스를 재해석하기 때문이다(#143의 `knockout: none`과 같은 자리). **upstream의 `block-start`·`block-end`는 계약하지 않는다** — 껍데기 위·아래에 한 줄을 통째로 두는 배치라 루트가 줄바꿈하는 auto 높이 컨테이너가 되어야 하고, 그건 `h-9` 한 줄과 `h-full` 컨트롤을 재해석하는 breaking이다. 조건부 클래스로 피하면 그 선언이 매니페스트에서 `unresolved`가 되어 파생 채널이 못 그린다(#144). 위·아래 줄이 필요하면 Field의 세로 축을 쓴다. 부가물 안의 버튼·`Kbd`를 필드 가장자리에 광학 정렬하는 음수 마진(upstream의 `has-[>button]:ml-*`)도 계약하지 않는다 — 부가물의 **자식**에 걸리는 조건부라 셀이 아니라 수식자가 되고, 필요하면 소비처가 그 자리에서 준다. `InputGroupButton`의 variant·size는 열지 않는다 — 소비처가 `Button`의 축을 그대로 쓰면 되고 우리 스타일 결정을 복제하지 않는다(#121)." } },
} as const

export { InputGroup, InputGroupAddon, InputGroupInput, InputGroupButton, inputGroupVariants, inputGroupVariantsConfig, componentContract }
