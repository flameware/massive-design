import * as React from "react"
import { ContextMenu as ContextMenuPrimitive, DropdownMenu as DropdownMenuPrimitive } from "radix-ui"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

/* 트리거 모드(`openOn`)는 계약에 담되 매니페스트에는 담지 않는다(#126, #119).
 *
 * `openOn="context"`는 메뉴를 우클릭·롱프레스로 연다. 내부에서 Radix `ContextMenu`
 * primitive로 갈아 끼우지만 **공개 anatomy와 구성 상태는 그대로다** — 우리 클래스는
 * `dropdownMenuVariants` 하나뿐이고 두 모드가 그것을 똑같이 호출하므로 매니페스트의
 * 셀·축·anatomy·구성 상태가 한 글자도 움직이지 않는다. 이것이 #119가 Context Menu를
 * 새 컴포넌트로 열지 않고 여기에 흡수한 근거다. 그래서 `openOn`은 `cva` 축도
 * `configurationStates`도 아니다 — 축으로 두면 셀이 둘로 갈라지고 Figma가 동작을
 * variant로 그리게 되는데, 그것이 #97이 닫은 자리다. 호환성은 additive다: 기본값이
 * `press`라 공개 기준선의 기존 호출과 발행된 인스턴스를 재해석하지 않는다.
 *
 * `DropdownMenuTrigger`가 보증하는 것은 **메뉴를 여는 요소**이지 버튼이 아니다.
 * 이 노드는 우리 클래스를 하나도 내지 않아 예나 지금이나 소비처가 `asChild`로 주는
 * 요소이고, context 모드에서는 그것이 포커스를 받지 못하는 `<span>`이 된다. 파생
 * 채널은 이 차이를 구분하지 못하므로(클래스가 없어 셀에 나타나지 않는다) 게이트가
 * 볼 수 없다 — 그래서 여기와 `limits`의 문장이 그 값을 대신 낸다.
 *
 * **키보드 경로는 확인 항목이 아니라 구현 항목이다.** Radix `ContextMenuTrigger`는
 * tabIndex도 role도 `onKeyDown`도 갖고 오지 않아 컨텍스트 메뉴 키와 Shift+F10이 닿을
 * 곳이 없다. 아래에서 직접 잇는다 — macOS에는 그 키가 없어 브라우저가 `contextmenu`를
 * 대신 쏴 주지 않으므로 이벤트를 우리가 만들어 트리거 위에서 흘린다.
 *
 * **700ms 롱프레스는 상속 표면이고, ADR-0005의 `gestures`가 담지 못하는 첫 상속
 * 표면이다.** 그 필드는 **닫는** 제스처의 모양이라 `surface`가 사라지는 표면을
 * 가리키고 `feedback`이 `className()` 안에 실제로 있어야 하는데, 여는 제스처에는
 * 닫히는 표면이 없고 피드백 클래스를 넣는 순간 셀이 바뀌어 매니페스트 해시가 깨진다.
 * 지킬 수 없는 것을 지킨다고 적지 않고 `limits`의 문장으로 남긴다 — 침묵은 선택지가
 * 아니다. */
const dropdownMenuVariantsConfig = { variants: {}, defaultVariants: {} } as const
const dropdownMenuVariants = cva("min-w-32 rounded-md border bg-popover p-1 text-popover-foreground shadow-md", dropdownMenuVariantsConfig)

type DropdownMenuOpenOn = "press" | "context"
const DropdownMenuOpenOnContext = React.createContext<DropdownMenuOpenOn>("press")

/* 루트의 prop 타입을 모드로 가른다 — Radix `ContextMenu` Root에는 `defaultOpen`이
 * 없다(열기 전에는 커서 앵커가 없어 위치가 정해지지 않는다). 한 타입으로 적으면
 * context 모드에서 거짓말이 된다. */
type DropdownMenuProps =
  | ({ openOn?: "press" } & React.ComponentProps<typeof DropdownMenuPrimitive.Root>)
  | ({ openOn: "context" } & React.ComponentProps<typeof ContextMenuPrimitive.Root>)

/* 트리거는 모드마다 다른 요소로 렌더된다(button / span). ref와 `onKeyDown`만 넓히고
 * 나머지는 기존 타입 그대로 둔다 — 기존 호출을 하나도 재해석하지 않기 위해서다. */
type DropdownMenuTriggerProps = Omit<React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>, "ref" | "onKeyDown"> & {
  ref?: React.Ref<HTMLButtonElement> | React.Ref<HTMLSpanElement>
  onKeyDown?: React.KeyboardEventHandler<HTMLElement>
  disabled?: boolean
}

/** 컨텍스트 메뉴 키·Shift+F10을 우클릭과 같은 자리로 보낸다. */
function openMenuFromKeyboard(element: HTMLElement) {
  const rect = element.getBoundingClientRect()
  element.dispatchEvent(new MouseEvent("contextmenu", {
    bubbles: true, cancelable: true,
    clientX: Math.round(rect.left + rect.width / 2),
    clientY: Math.round(rect.top + rect.height / 2),
  }))
}

function DropdownMenu(props: DropdownMenuProps) {
  if (props.openOn === "context") {
    const { openOn: _openOn, ...rest } = props
    return <DropdownMenuOpenOnContext.Provider value="context"><ContextMenuPrimitive.Root {...rest} /></DropdownMenuOpenOnContext.Provider>
  }
  const { openOn: _openOn, ...rest } = props
  return <DropdownMenuOpenOnContext.Provider value="press"><DropdownMenuPrimitive.Root {...rest} /></DropdownMenuOpenOnContext.Provider>
}

function DropdownMenuTrigger({ ref, onKeyDown, ...props }: DropdownMenuTriggerProps) {
  const openOn = React.useContext(DropdownMenuOpenOnContext)
  // 모드가 요소를 정하므로 ref의 요소 타입도 모드가 정한다. 공개 타입은 둘 다 받는다
  if (openOn === "press") return <DropdownMenuPrimitive.Trigger data-slot="dropdown-menu-trigger" ref={ref as React.Ref<HTMLButtonElement>} onKeyDown={onKeyDown} {...props} />
  return (
    <ContextMenuPrimitive.Trigger
      data-slot="dropdown-menu-trigger"
      tabIndex={0}
      ref={ref as React.Ref<HTMLSpanElement>}
      {...props}
      onKeyDown={(event: React.KeyboardEvent<HTMLElement>) => {
        onKeyDown?.(event)
        if (event.defaultPrevented) return
        if (event.key !== "ContextMenu" && !(event.shiftKey && event.key === "F10")) return
        event.preventDefault()
        openMenuFromKeyboard(event.currentTarget)
      }}
    />
  )
}

function DropdownMenuContent({ className, sideOffset = 4, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  const openOn = React.useContext(DropdownMenuOpenOnContext)
  const contentClassName = cn(dropdownMenuVariants({ className }))
  if (openOn === "press") return <DropdownMenuPrimitive.Portal><DropdownMenuPrimitive.Content data-slot="dropdown-menu" sideOffset={sideOffset} className={contentClassName} {...props} /></DropdownMenuPrimitive.Portal>
  /* `ContextMenuContent`는 side·sideOffset·align을 받지 않고 자기 값으로 덮는다 —
   * 넘기면 타입이 걸리거나 조용히 무시된다. 위치는 커서가 정한다 */
  const { side: _side, align: _align, ...rest } = props
  return <ContextMenuPrimitive.Portal><ContextMenuPrimitive.Content data-slot="dropdown-menu" className={contentClassName} {...rest} /></ContextMenuPrimitive.Portal>
}

/* Item·Label·Separator·Group은 두 primitive가 같은 `@radix-ui/react-menu` 파트로
 * 내려가 prop 타입이 동일하다. 다른 것은 scope뿐이라 컴포넌트만 고른다 */
function DropdownMenuItem({ className, inset, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & { inset?: boolean }) { const Item = React.useContext(DropdownMenuOpenOnContext) === "context" ? ContextMenuPrimitive.Item : DropdownMenuPrimitive.Item; return <Item data-slot="dropdown-menu-item" data-inset={inset} className={cn("state [--ds-state-base:var(--popover)] relative flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset=true]:pl-8", className)} {...props} /> }
function DropdownMenuLabel({ className, inset, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & { inset?: boolean }) { const Label = React.useContext(DropdownMenuOpenOnContext) === "context" ? ContextMenuPrimitive.Label : DropdownMenuPrimitive.Label; return <Label data-slot="dropdown-menu-label" data-inset={inset} className={cn("px-2 py-1.5 text-xs font-medium data-[inset=true]:pl-8", className)} {...props} /> }
function DropdownMenuSeparator({ className, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) { const Separator = React.useContext(DropdownMenuOpenOnContext) === "context" ? ContextMenuPrimitive.Separator : DropdownMenuPrimitive.Separator; return <Separator data-slot="dropdown-menu-separator" className={cn("-mx-1 my-1 h-px bg-border", className)} {...props} /> }
function DropdownMenuGroup(props: React.ComponentProps<typeof DropdownMenuPrimitive.Group>) { const Group = React.useContext(DropdownMenuOpenOnContext) === "context" ? ContextMenuPrimitive.Group : DropdownMenuPrimitive.Group; return <Group data-slot="dropdown-menu-group" {...props} /> }

const componentContract = {
  name: "dropdown-menu", source: "src/components/ui/dropdown-menu.tsx",
  publicExports: ["DropdownMenu", "DropdownMenuTrigger", "DropdownMenuContent", "DropdownMenuItem", "DropdownMenuLabel", "DropdownMenuSeparator", "DropdownMenuGroup", "dropdownMenuVariants", "dropdownMenuVariantsConfig"],
  config: dropdownMenuVariantsConfig, className: (props: Record<string, string>) => cn(dropdownMenuVariants(props)),
  anatomy: ["DropdownMenu", "DropdownMenuTrigger", "DropdownMenuContent", "DropdownMenuGroup*", "DropdownMenuLabel?", "DropdownMenuItem*", "DropdownMenuSeparator?"],
  configurationStates: { open: ["closed", "open"] },
  reference: { example: "dropdown-menu", guidance: { use: "현재 맥락에 속하는 보조 동작을 묶는다. 화면에 보이는 컨트롤에서 여는 기본 모드와, 대상 영역을 우클릭·롱프레스해서 여는 openOn=\"context\" 모드를 같은 계약으로 덮는다.", evidence: "각 투자 행의 수정·삭제 같은 행 메뉴 진입점에 필요하고, 표의 행 자체를 우클릭해 같은 메뉴를 여는 경로도 같은 자산이어야 한다.", limits: "삭제 확인과 실제 동작 로직은 포함하지 않는다. openOn=\"context\"는 배경 영역 자체가 대상인 행·캔버스에만 쓰고, 화면에 보이는 버튼에서 여는 메뉴는 기본값 press를 쓴다. 이 모드에서 DropdownMenuTrigger는 버튼이 아니라 우클릭을 받는 영역이라 스스로 포커스를 받지 못하므로, 소비처가 포커스 가능한 요소를 asChild로 주어 Shift+F10·컨텍스트 메뉴 키로도 열리게 해야 한다. 터치에서는 upstream이 갖고 오는 롱프레스로 열리며 그 임계값은 계약하지 않는다 — 여는 제스처라 gestures 필드가 담지 못하는 첫 상속 표면이다. defaultOpen과 sideOffset은 press 모드에서만 유효하다. 여러 메뉴가 한 막대에 상시 노출되는 명령 막대에는 쓰지 않는다 — 그 자리는 Menubar이고, 화면을 이동하는 사이트 탐색은 Navigation Menu다(#127). upstream이 갖는 `CheckboxItem`·`RadioItem`·`Sub`를 우리는 공개하지 않으며 이 세대에서도 열지 않았다: 셋은 #119가 Menubar를 별도 컴포넌트로 세운 anatomy 근거라 여기서 함께 열면 그 판정의 전제가 사라지고, 이미 완성된 43개에 anatomy를 더하는 일이라 #121이 승격 8건을 맵 밖에 둔 것과 같은 성질이다. 다만 이 세 표면은 #121의 종류 ② 전수 대조 목록에 없었으므로 판정을 거친 자리가 아니라 **확인된 공백**이다 — 여는 근거는 두 관문으로 따로 판정해야 한다." } },
} as const

export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuGroup, dropdownMenuVariants, dropdownMenuVariantsConfig, componentContract }
