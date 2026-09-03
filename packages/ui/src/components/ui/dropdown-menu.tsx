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
 * 지킬 수 없는 것을 지킨다고 적지 않고 `behaviors.longPressOpen`의 문장으로 남긴다 —
 * 터치에서는 upstream이 갖고 오는 롱프레스로 열리며 그 임계값은 계약하지 않는다.
 * 침묵은 선택지가 아니다. */
/* 체크·라디오·서브메뉴 여섯 파트를 두 모드 모두에 낸다(#154, 판정은 #142).
 *
 * 43세대 동안 이 계약은 upstream의 `CheckboxItem`·`RadioItem`·`Sub`를 공개하지 않았고,
 * 그 자리는 판정을 거친 적조차 없는 **확인된 공백**이었다(#127). #142가 ADR-0006의 두
 * 관문에 걸어 열기로 판정했다 — ⓐ Menubar가 같은 표면에 이미 독립 셀을 내고 있고
 * (`INDICATOR_ITEM`의 `pr-2 pl-8`은 `ITEM`의 `px-2`와 다른 셀이며 `SUB_TRIGGER`는
 * `data-[state=open]`으로 구성 상태까지 낸다), ⓑ 소비처에는 재현할 우리 노드조차 없어
 * `radix-ui`를 직접 집고 표식 기하를 손으로 다시 정해야 한다(#122가 닫은 자리).
 *
 * **여섯을 한 번에 연다.** `RadioItem`은 `value`를 소유하는 `RadioGroup` 없이 뜻이 없고
 * `Sub`는 `SubTrigger`·`SubContent` 없이 아무것도 그리지 않는다 — 셋만 열면 나머지 셋을
 * 소비처가 `radix-ui`에서 직접 가져와야 해서 ⓑ가 그대로 다시 샌다.
 *
 * **Menubar와의 비대칭은 이 세대에서 해소됐고 #119의 판정은 그대로 선다**: 두 컴포넌트를
 * 가르는 것은 루트 막대 + `MenubarMenu*` 다중 메뉴 + `value`이지 이 세 파트가 아니다.
 * `openOn="context"` 모드에도 상시 노출 막대가 없고 진입점이 하나이므로 여섯 파트를 줘도
 * Menubar가 되지 않는다.
 *
 * **두 모드 모두에 낸다.** `openOn`이 `cva` 축도 구성 상태도 아닌 근거가 "두 모드가 같은
 * 공개 anatomy를 갖는다"이므로(#126), 한쪽에만 열면 그 전제가 깨져 `openOn`이 축이 되어야
 * 하는 컴포넌트로 바뀐다. `ContextMenuPrimitive`가 여섯 + `ItemIndicator`를 모두 갖는
 * 것은 확인했다(`@radix-ui/react-context-menu@2.3.7`). 관용구는 기존 `Item`·`Label`·
 * `Separator`·`Group`과 같다 — `useContext(DropdownMenuOpenOnContext)`로 컴포넌트만 고른다.
 *
 * **클래스 상수는 Menubar와 공유하지 않고 복제한다.** 리포의 교차 import 9건은 전부 다른
 * 컴포넌트의 `cva` 또는 컴포넌트 자체를 **소비**하는 #91의 자리다(`ToggleGroupItem`은
 * Toggle **이므로** `toggleVariants`를 쓴다). 여기는 그 관계가 아니다 — 두 메뉴는 같은
 * `@radix-ui/react-menu` 파트로 내려갈 뿐 한쪽이 다른 쪽인 것은 아니고, 맨 클래스 문자열을
 * 공유하는 선례는 하나도 없다. 게다가 두 파일은 이미 갈라져 있다(Menubar `ITEM`에는
 * `select-none`이 있고 여기에는 없다). 공유 상수는 그 차이를 지우거나 조건을 달게 만들고,
 * 무엇보다 두 계약의 해시를 한 줄에 묶어 한쪽 조정이 다른 쪽 매니페스트를 움직인다.
 * 그래서 `INDICATOR_ITEM`·`SUB_TRIGGER`는 이 파일의 `ITEM` 관용구에 맞춰 복제한다.
 *
 * **`ItemIndicator`는 파트로 열지 않는다.** Menubar가 닫은 근거 그대로 — 켜졌을 때만
 * 나타나는 글리프라 정적 시안이 그리는 것은 `checked` 구성 상태이지 별도 노드가 아니고,
 * 껍데기를 노드로 세우면 체크·라디오 두 항목이 같은 클래스를 갖게 되어 파생 채널이
 * 가르지 못한다(Select의 `ItemIndicator`와 같은 자리). 대신 `configurationStates`에 `checked`가
 * 선다. 같은 이유로 `DropdownMenuCheckboxItem`과 `DropdownMenuRadioItem`의 조합 스타일은 서로
 * 같다 — 둘을 가르는 것은 역할과 표식이지 면이 아니다.
 *
 * **`SubContent`는 `dropdownMenuVariants`를 그대로 쓴다.** 서브 표면은 떠 있는 같은 면이고
 * 여기에는 다시 정할 결정이 없다 — 복제하면 한쪽만 조정되는 두 번째 진실이 생긴다.
 * Menubar가 `CONTENT` 한 상수를 `Content`·`SubContent` 둘에 쓴 것과 같은 자리다. */
const dropdownMenuVariantsConfig = { variants: {}, defaultVariants: {} } as const
const dropdownMenuVariants = cva("min-w-32 rounded-md border bg-popover p-1 text-popover-foreground shadow-md", dropdownMenuVariantsConfig)

const ITEM = "state [--ds-state-base:var(--popover)] relative flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset=true]:pl-8"
const LABEL = "px-2 py-1.5 text-xs font-medium data-[inset=true]:pl-8"
/* 구분선을 `bg-border`가 아니라 `border-t`로 그린다. 43세대 동안 이 노드는 `h-px bg-border`
 * 였고 게이트에 걸린 적이 없다 — `parts`가 없어 매니페스트에 아예 나타나지 않았기 때문이다.
 * 등록하는 순간 `--ds-border-default`가 `background-color`에 온 것을 게이트가 물었다:
 * **없는 것은 통과가 아니라 침묵이다**(ADR-0006). 렌더는 같은 1px 선이고 menubar.tsx·
 * resizable.tsx가 이미 낸 답이다. */
const SEPARATOR = "-mx-1 my-1 h-0 border-t"
/* 체크·라디오 항목은 표식이 앉는 왼쪽 칸만큼 들여 쓴다. `ITEM`의 `px-2`와는 다른 셀이고
 * (`pr-2 pl-8`), 표식 자체는 자기 클래스가 없는 `ItemIndicator`다. Menubar의 같은 상수에서
 * `select-none`만 뺐다 — 이 파일의 `ITEM`이 그것을 갖지 않으므로 여기서 새로 들이면 두
 * 항목이 같은 메뉴 안에서 서로 다른 선택 동작을 갖는다. */
const INDICATOR_ITEM = "state [--ds-state-base:var(--popover)] relative flex cursor-default items-center rounded-sm py-1.5 pr-2 pl-8 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
/* 서브 트리거는 화살표를 오른쪽 끝으로 밀고(`justify-between gap-4`), 열려 있는 동안 base를
 * accent로 갈아 끼운다 — 불투명도 트릭이 아니라 base 교체다(menubar.tsx·sidebar.tsx). */
const SUB_TRIGGER = "state [--ds-state-base:var(--popover)] data-[state=open]:[--ds-state-base:var(--accent)] relative flex cursor-default items-center justify-between gap-4 rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50"


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
function DropdownMenuItem({ className, inset, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & { inset?: boolean }) { const Item = React.useContext(DropdownMenuOpenOnContext) === "context" ? ContextMenuPrimitive.Item : DropdownMenuPrimitive.Item; return <Item data-slot="dropdown-menu-item" data-inset={inset} className={cn(ITEM, className)} {...props} /> }
function DropdownMenuLabel({ className, inset, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & { inset?: boolean }) { const Label = React.useContext(DropdownMenuOpenOnContext) === "context" ? ContextMenuPrimitive.Label : DropdownMenuPrimitive.Label; return <Label data-slot="dropdown-menu-label" data-inset={inset} className={cn(LABEL, className)} {...props} /> }
function DropdownMenuSeparator({ className, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) { const Separator = React.useContext(DropdownMenuOpenOnContext) === "context" ? ContextMenuPrimitive.Separator : DropdownMenuPrimitive.Separator; return <Separator data-slot="dropdown-menu-separator" className={cn(SEPARATOR, className)} {...props} /> }
function DropdownMenuGroup(props: React.ComponentProps<typeof DropdownMenuPrimitive.Group>) { const Group = React.useContext(DropdownMenuOpenOnContext) === "context" ? ContextMenuPrimitive.Group : DropdownMenuPrimitive.Group; return <Group data-slot="dropdown-menu-group" {...props} /> }

/* 아래 여섯도 같은 관용구다 — 두 primitive가 같은 `@radix-ui/react-menu` 파트로 내려가
 * prop 타입이 동일하므로 컴포넌트만 고른다. 체크·라디오는 `ItemIndicator`까지 같은 모드에서
 * 골라야 한다: 다른 scope의 indicator는 켜짐 상태를 읽지 못해 표식이 영영 나타나지 않는다.
 * 체크·라디오 항목의 role과 `aria-checked`, 서브메뉴의 `aria-haspopup`·`aria-expanded`는
 * primitive가 내고 표식·화살표 `<svg>`는 `aria-hidden`이라 이름에 섞이지 않는다. */
function DropdownMenuCheckboxItem({ className, children, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>) {
  const isContext = React.useContext(DropdownMenuOpenOnContext) === "context"
  const CheckboxItem = isContext ? ContextMenuPrimitive.CheckboxItem : DropdownMenuPrimitive.CheckboxItem
  const ItemIndicator = isContext ? ContextMenuPrimitive.ItemIndicator : DropdownMenuPrimitive.ItemIndicator
  return <CheckboxItem data-slot="dropdown-menu-checkbox-item" className={cn(INDICATOR_ITEM, className)} {...props}>
    <ItemIndicator className="absolute left-2 flex size-4 items-center justify-center">
      <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4"><path d="m3.5 8.5 3 3 6-7" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"/></svg>
    </ItemIndicator>
    {children}
  </CheckboxItem>
}

/** 배타 선택의 `value` 소유자. 클래스가 없는 묶음 노드다. */
function DropdownMenuRadioGroup(props: React.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>) {
  const RadioGroup = React.useContext(DropdownMenuOpenOnContext) === "context" ? ContextMenuPrimitive.RadioGroup : DropdownMenuPrimitive.RadioGroup
  return <RadioGroup data-slot="dropdown-menu-radio-group" {...props} />
}

function DropdownMenuRadioItem({ className, children, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem>) {
  const isContext = React.useContext(DropdownMenuOpenOnContext) === "context"
  const RadioItem = isContext ? ContextMenuPrimitive.RadioItem : DropdownMenuPrimitive.RadioItem
  const ItemIndicator = isContext ? ContextMenuPrimitive.ItemIndicator : DropdownMenuPrimitive.ItemIndicator
  return <RadioItem data-slot="dropdown-menu-radio-item" className={cn(INDICATOR_ITEM, className)} {...props}>
    <ItemIndicator className="absolute left-2 flex size-4 items-center justify-center">
      <svg aria-hidden="true" viewBox="0 0 16 16" className="size-2"><circle cx="8" cy="8" r="8" fill="currentColor"/></svg>
    </ItemIndicator>
    {children}
  </RadioItem>
}

/** 항목 안에서 다시 열리는 메뉴. 클래스가 없는 묶음 노드다. */
function DropdownMenuSub(props: React.ComponentProps<typeof DropdownMenuPrimitive.Sub>) {
  const Sub = React.useContext(DropdownMenuOpenOnContext) === "context" ? ContextMenuPrimitive.Sub : DropdownMenuPrimitive.Sub
  return <Sub {...props} />
}

function DropdownMenuSubTrigger({ className, children, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger>) {
  const SubTrigger = React.useContext(DropdownMenuOpenOnContext) === "context" ? ContextMenuPrimitive.SubTrigger : DropdownMenuPrimitive.SubTrigger
  return <SubTrigger data-slot="dropdown-menu-sub-trigger" className={cn(SUB_TRIGGER, className)} {...props}>
    {children}
    <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4 shrink-0"><path d="m6 3 5 5-5 5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"/></svg>
  </SubTrigger>
}

/* 서브 표면도 Portal로 나간다 — 루트 `Content`와 같은 이유(잘림·쌓임 맥락)이고 Radix가
 * 문서화한 배치다. 면은 `dropdownMenuVariants`를 그대로 호출한다. */
function DropdownMenuSubContent({ className, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.SubContent>) {
  const isContext = React.useContext(DropdownMenuOpenOnContext) === "context"
  const Portal = isContext ? ContextMenuPrimitive.Portal : DropdownMenuPrimitive.Portal
  const SubContent = isContext ? ContextMenuPrimitive.SubContent : DropdownMenuPrimitive.SubContent
  return <Portal><SubContent data-slot="dropdown-menu-sub-content" className={cn(dropdownMenuVariants({ className }))} {...props} /></Portal>
}

const staticPart = (className: string) => ({
  config: { variants: {}, defaultVariants: {} } as const,
  className: () => className,
})

/* 여러 메뉴가 한 막대에 상시 노출되는 명령 막대에는 쓰지 않는다 — 그 자리는 Menubar이고,
 * 화면을 이동하는 사이트 탐색은 Navigation Menu다(#127). */
const componentContract = {
  name: "dropdown-menu", source: "src/components/ui/dropdown-menu.tsx",
  /* `DropdownMenuShortcut`은 열지 않는다 — #123이 `CommandShortcut` 자리를 닫은 것과 같은 근거이고,
   * 소비처가 `Kbd`를 `ml-auto`로 놓으면 같은 결과다. `DropdownMenuPortal`은 공개하지 않는다 —
   * `DropdownMenuContent`와 `DropdownMenuSubContent`가 각자 Portal을 감싸므로 소비처가 조립할
   * 자리가 아니다(#172, ADR-0018). 포탈 대상을 고르는 경로가 필요해지면 노드가 아니라
   * `DropdownMenuContent`의 prop으로 온다. */
  publicExports: ["DropdownMenu", "DropdownMenuTrigger", "DropdownMenuContent", "DropdownMenuItem", "DropdownMenuLabel", "DropdownMenuSeparator", "DropdownMenuGroup", "DropdownMenuCheckboxItem", "DropdownMenuRadioGroup", "DropdownMenuRadioItem", "DropdownMenuSub", "DropdownMenuSubTrigger", "DropdownMenuSubContent", "dropdownMenuVariants", "dropdownMenuVariantsConfig"],
  config: dropdownMenuVariantsConfig, className: (props: Record<string, string>) => cn(dropdownMenuVariants(props)),
  anatomy: ["DropdownMenu", "DropdownMenuTrigger", "DropdownMenuContent", "DropdownMenuGroup*", "DropdownMenuLabel?", "DropdownMenuItem*", "DropdownMenuCheckboxItem*", "DropdownMenuRadioGroup?", "DropdownMenuRadioItem*", "DropdownMenuSeparator?", "DropdownMenuSub?", "DropdownMenuSubTrigger", "DropdownMenuSubContent"],
  configurationStates: { open: ["closed", "open"], checked: ["unchecked", "checked"] }, drawnBy: { open: { attribute: "data-state", values: { open: "open" } }, checked: "`ItemIndicator` 글리프의 존재가 그린다 — 파트로 열지 않기로 판정했고(#154) 그 노드는 자기 클래스가 없다" },
  /* `parts`를 신설하면서 기존 `Item`·`Label`·`Separator`까지 함께 등록한다(#154).
   * 이 계약에는 `parts`가 아예 없었다 — 세 노드가 클래스를 내면서 등록되지 않은,
   * ADR-0006이 `Card`에서 잡아낸 것과 같은 모양의 침묵이다. 새 넷만 넣으면 매니페스트가
   * "CheckboxItem은 클래스가 있고 Item은 없다"고 말하는데 그건 거짓이고, 반쯤 메우면 다음
   * 재조회가 같은 파일을 또 판다. #155의 모집단이 14 → 13이 된다.
   * `Group`·`RadioGroup`·`Sub`는 클래스를 내지 않으므로 파트가 아니다(anatomy에만 선다). */
  parts: {
    DropdownMenuItem: staticPart(ITEM),
    DropdownMenuLabel: staticPart(LABEL),
    DropdownMenuSeparator: staticPart(SEPARATOR),
    DropdownMenuCheckboxItem: staticPart(INDICATOR_ITEM),
    DropdownMenuRadioItem: staticPart(INDICATOR_ITEM),
    DropdownMenuSubTrigger: staticPart(SUB_TRIGGER),
    DropdownMenuSubContent: { config: dropdownMenuVariantsConfig, className: (props: Record<string, string>) => cn(dropdownMenuVariants(props)) },
  },
  behaviors: {
    submenuHoverOpen: { kind: "open-cause", surface: "DropdownMenuSubContent", origin: "inherited", why: "radix-ui Menu가 갖고 오는 상속 표면이다 — **`DropdownMenuSubTrigger` 위에 포인터가 얹히면 100ms 뒤 서브메뉴가 열린다**(누르지 않아도 열리고, 대각선으로 빠져나가는 동안은 유예 영역이 닫힘을 미룬다). #154가 여섯 파트를 열면서 anatomy에는 들어왔지만 열림 계기는 어디에도 없었다. 키보드 경로(→ 또는 Enter)는 upstream에 있고 두 열림 모드(`press`·`context`) 모두에서 같다. **끄는 자리가 없다**(#187)." },
    contextOpen: { kind: "open-cause", surface: "DropdownMenuContent", origin: "ours", control: "openOn", why: "`openOn=\"context\"`는 우클릭·컨텍스트 메뉴 키로 연다 — 우리가 만든 열림 계기이고 기본값은 `press`다(#126). 열림 계기는 동작이라 `cva` 축도 구성 상태도 아니어서 생성된 카탈로그 스토리가 이 모드를 한 번도 렌더하지 않는다 — Storybook axe가 말해 주는 것이 없다." },
    longPressOpen: { kind: "open-cause", surface: "DropdownMenuContent", origin: "inherited", why: "`openOn=\"context\"`에서 터치의 롱프레스로 열리는 것은 radix-ui ContextMenu가 갖고 오는 상속 표면이다 — 우리가 타이핑한 적 없고 임계값도 우리가 정하지 않았다(#126). 여는 계기라 표면이 사라지지 않으므로 `gestures`가 담지 못한다." },
  },
  /* 켜고 끄는 항목은 `DropdownMenuCheckboxItem`, 배타 선택은 `DropdownMenuRadioGroup`·`DropdownMenuRadioItem`,
   * 더 깊은 묶음은 `DropdownMenuSub`가 지며 셋 다 두 모드에서 같다. context 모드의 트리거는 버튼이 아니라
   * 우클릭을 받는 영역이라 스스로 포커스를 받지 못하므로, 소비처가 포커스 가능한 요소를 `asChild`로 주어야
   * Shift+F10·컨텍스트 메뉴 키로도 열린다. */
  reference: { example: "dropdown-menu", guidance: { use: "현재 맥락의 보조 동작을 묶는다. 보이는 컨트롤에서 여는 press 모드와 대상 영역을 우클릭·롱프레스해 여는 openOn=\"context\" 모드가 같은 계약이고, 체크·라디오·서브메뉴는 두 모드에서 같다.", evidence: "각 투자 행의 수정·삭제 같은 행 메뉴 진입점이 필요하고, 표의 행을 우클릭해 같은 메뉴를 여는 경로도 같은 자산이어야 한다. 같은 메뉴에서 즐겨찾기를 켜고 끄고, 통화를 하나만 고르고, 내보내기 형식을 한 겹 더 들어가 고른다.", limits: "삭제 확인과 동작 로직은 소비처가 둔다. openOn=\"context\"는 영역 자체가 대상인 행·캔버스에만 쓰고 트리거는 포커스 가능한 요소를 asChild로 준다. defaultOpen·sideOffset은 press에서만 듣는다. 상시 노출 명령 막대는 Menubar, 사이트 탐색은 Navigation Menu다." } },
} as const

export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuGroup, DropdownMenuCheckboxItem, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, dropdownMenuVariants, dropdownMenuVariantsConfig, componentContract }
