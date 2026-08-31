import * as React from "react"
import { cva } from "class-variance-authority"

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
const CONTROL = "h-full flex-1 rounded-none border-0 bg-transparent px-0 shadow-none focus-visible:border-0 focus-visible:ring-0 aria-invalid:border-0 aria-invalid:ring-0"

function InputGroup({ className, ...props }: React.ComponentProps<"div">) {
  return <div role="group" data-slot="input-group" className={cn(inputGroupVariants({ className }))} {...props} />
}

/** 값을 갖지 않는 부가물. 아이콘·단위·접두 텍스트 자리다. */
function InputGroupAddon({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="input-group-addon" className={cn(ADDON, className)} {...props} />
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
  configurationStates: { validity: ["valid", "invalid"], disabled: ["enabled", "disabled"] },
  parts: {
    InputGroupAddon: staticPart(ADDON),
    InputGroupInput: staticPart(cn(inputVariants(), CONTROL)),
    InputGroupButton: staticPart(cn(buttonVariants({ variant: "ghost", size: "icon-xs" }), "shrink-0")),
  },
  reference: { example: "input-group", guidance: { use: "한 줄 입력 컨트롤 하나와 아이콘·단위·버튼 같은 부가물을 하나의 필드 껍데기 안에 붙이고, 포커스·비활성·오류 표시를 껍데기가 대신 그린다.", evidence: "투자 이력 검색은 앞에 검색 아이콘이, 금액 입력은 뒤에 통화 단위와 초기화 버튼이 필드 안에 붙어야 한다.", limits: "값을 가진 컨트롤을 둘 이상 담지 않으며, 라벨·설명·오류 문구는 여전히 Field가 소유하고 접근성 상태의 정본은 안쪽 컨트롤의 disabled·aria-invalid다." } },
} as const

export { InputGroup, InputGroupAddon, InputGroupInput, InputGroupButton, inputGroupVariants, inputGroupVariantsConfig, componentContract }
