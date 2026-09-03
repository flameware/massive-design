import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input, inputVariants } from "@/components/ui/input"
import { Textarea, textareaVariants } from "@/components/ui/textarea"

/* Input Group은 **필드의 껍데기**를 소유하고, 값은 여전히 Input이 소유한다(#98).
 *
 * 자식 조합  두 종류만 허용한다. ① 부가물(addon) — 아이콘·단위·버튼처럼 값을
 *            갖지 않는 것. ② 컨트롤 — InputGroupInput 또는 InputGroupTextarea
 *            **하나**. 둘 중 어느 쪽인지는 줄 수의 문제이고 개수의 문제가 아니다:
 *            컨트롤이 둘 이상 들어오면 라벨 연결이 어느 쪽을 가리키는지 말할 수
 *            없어 계약 밖이라는 선은 그대로다(#170).
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
  "flex min-h-9 w-full min-w-0 items-center gap-2 rounded-md border bg-background px-3 text-sm shadow-xs outline-none has-[:focus-visible]:border-focus-contrast has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring has-[:disabled]:pointer-events-none has-[:disabled]:opacity-50 has-[[aria-invalid=true]]:border-destructive has-[[aria-invalid=true]]:ring-destructive/20",
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
 * 우리 껍데기는 컨트롤 한 줄이고 좌우 패딩(`px-3`)을 루트가 소유한다. 그 둘을
 * 열려면 루트가 **줄바꿈하는** 컨테이너가 되어야 하는데, `min-h-9`가 연 것은 컨트롤
 * 하나가 세로로 자라는 길이지 부가물이 자기 줄을 갖는 길이 아니다 — `items-center`
 * 한 줄 배치는 그대로다(#170). `has-[[data-placement^=block]]`
 * 조건부로 피하면 그 선언이 `unresolved`가 되어 파생 채널이 못 그린다 — 같은
 * 침묵이다(#144, ADR-0006). 위·아래 줄이 필요하면 Field의 세로 축을 쓴다.
 *
 * 부가물 안의 버튼·`Kbd`를 필드 가장자리에 광학 정렬하는 음수 마진(upstream의
 * `has-[>button]:ml-*`)도 계약하지 않는다 — 부가물의 **자식**에 걸리는 조건부라 셀이
 * 아니라 수식자가 되고, 필요하면 소비처가 그 자리에서 준다. */
const inputGroupAddonVariantsConfig = {
  variants: {
    placement: { auto: "", start: "order-first", end: "order-last" },
  },
  defaultVariants: { placement: "auto" },
} as const

const inputGroupAddonVariants = cva(ADDON, inputGroupAddonVariantsConfig)

/* 껍데기 안에서 컨트롤이 자기 껍데기를 벗는 결정이다. 한 줄과 여러 줄이 **무력화는
 * 공유하고 높이만 갈린다**(#170).
 *
 * 공유하는 것은 `rounded-none border-0 bg-transparent px-0 shadow-none`과 포커스 링·
 * 오류 테두리의 무력화 여섯이다 — 그것들은 "껍데기를 누가 소유하는가"의 결과이고 그
 * 답은 줄 수와 무관하게 그룹이다. 갈리는 것은 높이 하나다: 한 줄 컨트롤은 껍데기의
 * 한 줄을 그대로 채우고, 여러 줄 컨트롤은 자기 `min-h`로 껍데기를 **밀어 올린다.**
 * 그래서 상수는 둘이고, 갈리는 부분만 다르다.
 *
 * **`CONTROL`에서 `h-full`이 빠졌다.** 루트가 `h-9`(고정 36px)일 때 `h-full`은 36px로
 * 해결됐는데, 루트가 `min-h-9`가 되면 부모 높이가 미정이라 `height: 100%`가 auto로
 * 무너진다. `Input`이 자기 `h-9`를 이미 갖고 있으므로 벗기지 않으면 값이 그대로 36px다
 * — **렌더 결과가 그대로이고**(루트 36 = 컨트롤 36), 매니페스트에서는 루트의 `height`
 * 리터럴 36px이 `min-height`의 `space.9` 토큰으로 바뀌어 오히려 해결도가 올라간다.
 *
 * **루트를 `has-[>textarea]:h-auto`로 조건 분기하지 않는다.** upstream이 그렇게 하지만,
 * 이 계약의 `limits`가 `block-start`·`block-end`를 닫으며 이미 적어 둔 그 이유 그대로다
 * — 조건부 선언은 파생 채널이 그리지 못한다. 실제로 재어 보면 이 파일의 `has-[…]` 넷은
 * 매니페스트 셀에 **아예 나타나지 않는다**(`unresolved`조차 아니다). 높이를 조건부로
 * 두면 Figma는 여러 줄 컨트롤이 든 그룹을 36px로 그린다. `min-h-9`는 조건이 없어 두
 * 경우를 한 선언으로 담는다. */
const CONTROL = "flex-1 rounded-none border-0 bg-transparent px-0 shadow-none focus-visible:border-0 focus-visible:ring-0 aria-invalid:border-0 aria-invalid:ring-0"

/* 여러 줄 컨트롤. 무력화 여섯은 `CONTROL`과 같은 문자열이고 높이만 다르다.
 *
 * `InputGroupTextarea`는 `Textarea`를 **소비한다** — 복제하지 않는다(#91). `InputGroupInput`이
 * `Input`을 벗겨 쓰는 자리와 같고, 그래서 `size` 축·placeholder·`aria-invalid`의 정본은
 * 여전히 `Textarea` 계약이다. 루트가 `h-9`에서 `min-h-9`로 바뀌어도 `Input`이 자기 `h-9`를
 * 갖고 있어 한 줄일 때의 렌더는 36px 그대로다(in-place safe).
 *
 * `resize-none`인 것은 크기 조절 손잡이가 컨트롤의 모서리에 그려지는데 그 모서리를
 * 소유한 것이 컨트롤이 아니라 껍데기이기 때문이다 — 손잡이가 테두리 안쪽에 떠서
 * 잡을 것이 무엇인지 거짓말을 한다. 그리고 native resize가 쓰는 것은 인라인 `height`라
 * 계약에도 매니페스트에도 앉을 자리가 없다. `Textarea` 단독은 `resize-y` 그대로다. */
const MULTILINE_CONTROL = "flex-1 resize-none rounded-none border-0 bg-transparent px-0 shadow-none focus-visible:border-0 focus-visible:ring-0 aria-invalid:border-0 aria-invalid:ring-0"

/* 부가물 **안의** 글자 자리다(#170). `InputGroupAddon`의 자식으로 고정이고 홀로 서지
 * 않는다 — 그래서 배치 축(`placement`)도 갖지 않는다: 어느 쪽에 서는가는 자기를 담은
 * 부가물이 이미 정했다.
 *
 * PR #212의 기록은 이 자리를 "부가물과 갈리는 것은 글자 크기 한 단계"라는 위계 판단으로
 * 적었지만 재판정 결과는 **판단이 아니라 인용이었다**(#227). 발행 문서의 정본 갈래는
 * lyra가 아니라 base-nova인데(#196), `TEXT`의 `text-xs`는 §5.1이 lyra의
 * `.cn-input-group-text`를 축자로 인용해 연 자리다. base-nova의 값은 `text-sm`이라
 * 부가물 자체와 같은 크기로 선다 — "한 단계 낮다"는 근거는 성립하지 않는다. 그래도 지금
 * 고치면 이미 발행된 인스턴스의 렌더가 바뀌므로 `breaking`이다 — 맵 #221 규칙 3(발행된
 * 인스턴스를 지키는 값이 기본값이다)을 새 축의 기본값이 아니라 파트 고정 클래스에도
 * 같은 논리로 적용해 오늘은 유지한다. 바꾸려면 별도 breaking 세대가 필요하다.
 *
 * 접근성 — 라벨·설명·오류 문구는 여전히 Field가 소유하고 접근성 상태의 정본은 안쪽
 * 컨트롤의 disabled·aria-invalid다. 여러 줄일 때도 같아서 `FieldLabel`의 `htmlFor`가
 * `InputGroupTextarea`의 `id`를 가리키고, `InputGroupText`는 라벨 경로에 서지 않는다 —
 * 장식이면 담은 부가물에 `aria-hidden`, 뜻이 있으면 소비처가 `aria-describedby`로 묶는다. */
const TEXT = "flex items-center gap-2 text-xs text-muted-foreground [&_svg:not([class*='size-'])]:size-4"

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

/** 그룹 안의 유일한 컨트롤을 여러 줄로 세운 것. 기존 Textarea를 className으로만 벗겨 쓴다. */
function InputGroupTextarea({ className, ...props }: React.ComponentProps<typeof Textarea>) {
  return <Textarea data-slot="input-group-textarea" className={cn(MULTILINE_CONTROL, className)} {...props} />
}

/** 부가물 안의 글자. `InputGroupAddon`의 자식으로만 선다. */
function InputGroupText({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="input-group-text" className={cn(TEXT, className)} {...props} />
}

/** 부가물 자리의 버튼. 기존 Button을 기본 variant/size만 바꿔 쓴다.
 * variant·size 축을 이 계약에서 다시 열지 않는다 — 소비처가 `Button`의 축을 그대로 쓰면
 * 되고 우리 스타일 결정을 복제하지 않는다(#121). */
function InputGroupButton({ className, variant = "ghost", size = "icon-xs", ...props }: React.ComponentProps<typeof Button>) {
  return <Button data-slot="input-group-button" variant={variant} size={size} className={cn("shrink-0", className)} {...props} />
}

const componentContract = {
  name: "input-group", source: "src/components/ui/input-group.tsx",
  publicExports: ["InputGroup", "InputGroupAddon", "InputGroupText", "InputGroupInput", "InputGroupTextarea", "InputGroupButton", "inputGroupVariants", "inputGroupVariantsConfig"],
  config: inputGroupVariantsConfig, className: (props: Record<string, string>) => cn(inputGroupVariants(props)),
  /* anatomy 표기에는 `?`(선택)와 `*`(반복)뿐이라 "둘 중 정확히 하나"를 적을 자리가 없어
   * `InputGroupInput`·`InputGroupTextarea`가 둘 다 `?`로 서고, 그 배타는 `limits`의 첫 문장이
   * 진다. `InputGroupText`가 `InputGroupAddon`의 자식이라는 중첩도 이 표기가 담지 못해
   * (순서로만 드러난다) `limits`가 진다(#170). */
  anatomy: ["InputGroup", "InputGroupAddon?", "InputGroupText?", "InputGroupInput?", "InputGroupTextarea?", "InputGroupButton?"],
  configurationStates: { validity: ["valid", "invalid"], disabled: ["enabled", "disabled"] }, drawnBy: { validity: { modifiers: ["has-[[aria-invalid=true]]", "aria-invalid"], carriedBy: "none" }, disabled: "루트의 `has-[:disabled]`가 그리는데 조립이 담을 자리가 없다 — 그 셀에 상태 사다리가 없어 불투명도가 버려진다. `InputGroupButton`의 `state.disabled`는 Button base가 낸 별개 값이다(#184)" },
  parts: {
    InputGroupAddon: { config: inputGroupAddonVariantsConfig, className: (props: Record<string, string>) => cn(inputGroupAddonVariants(props)) },
    InputGroupText: staticPart(TEXT),
    InputGroupInput: staticPart(cn(inputVariants(), CONTROL)),
    InputGroupTextarea: staticPart(cn(textareaVariants(), MULTILINE_CONTROL)),
    InputGroupButton: staticPart(cn(buttonVariants({ variant: "ghost", size: "icon-xs" }), "shrink-0")),
  },
  behaviors: {},
  reference: { example: "input-group", guidance: {
    use: "한 줄 또는 여러 줄 입력 컨트롤 하나와 아이콘·단위·글자·버튼 같은 부가물을 하나의 필드 껍데기 안에 붙이고, 포커스·비활성·오류 표시를 껍데기가 대신 그린다.",
    evidence: "투자 이력 검색은 앞에 검색 아이콘이, 금액 입력은 뒤에 통화 단위와 초기화 버튼이 필드 안에 붙어야 한다.",
    limits: "컨트롤은 `InputGroupInput`·`InputGroupTextarea` 하나다. 라벨·설명·오류는 Field가 진다. `InputGroupText`는 `InputGroupAddon` 안에만 선다. 버튼 정렬은 className, 모양은 `Button` 축. `text-xs`는 nova(`text-sm`)와 다르지만 발행 인스턴스를 지켜 유지한다.",
  } },
} as const

export { InputGroup, InputGroupAddon, InputGroupText, InputGroupInput, InputGroupTextarea, InputGroupButton, inputGroupVariants, inputGroupVariantsConfig, componentContract }
