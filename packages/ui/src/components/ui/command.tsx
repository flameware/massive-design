import * as React from "react"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

/* 명령 선택 표면. 검색 입력 하나가 유일한 tab 정지점이고, 목록은
 * `aria-activedescendant`로만 이동한다(ARIA combobox + listbox).
 *
 * 커서(highlighted)와 선택값(selected)을 분리한다 — 커서는 `aria-activedescendant`와
 * `data-highlighted`가, 선택값은 `aria-selected`와 `data-selected`가 나른다.
 * 두 축을 한 속성에 겹치면 정적 화면에서 "지금 커서가 놓인 행"과 "이미 고른 값"을
 * 구분해 조립할 수 없다. */

type CommandFilter = (value: string, search: string, keywords: readonly string[]) => boolean

const defaultFilter: CommandFilter = (value, search, keywords) => {
  const needle = search.trim().toLowerCase()
  if (!needle) return true
  return [value, ...keywords].some((haystack) => haystack.toLowerCase().includes(needle))
}

type CommandItemData = { id: string; keywords: readonly string[]; disabled: boolean; onSelect?: (value: string) => void }

type CommandContextValue = {
  inputId: string
  listId: string
  search: string
  setSearch: (search: string) => void
  matches: (value: string, keywords: readonly string[]) => boolean
  matchCount: number
  highlighted: string | null
  highlightedId: string | undefined
  setHighlighted: (value: string | null) => void
  move: (delta: number | "first" | "last") => void
  selected: string | undefined
  select: (value: string) => void
  register: (value: string, data: React.RefObject<CommandItemData>) => () => void
}

const CommandContext = React.createContext<CommandContextValue | null>(null)

function useCommandContext(part: string) {
  const context = React.useContext(CommandContext)
  if (!context) throw new Error(`${part}는 Command 안에서만 쓴다`)
  return context
}

const CommandGroupContext = React.createContext<string | undefined>(undefined)

const commandVariantsConfig = { variants: {}, defaultVariants: {} } as const
const commandVariants = cva("flex w-full flex-col rounded-md border bg-popover text-popover-foreground shadow-md", commandVariantsConfig)

const staticPart = (className: string) => ({
  config: { variants: {}, defaultVariants: {} } as const,
  className: () => className,
})

const commandInputClass = "flex h-9 w-full border-b bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-[3px] focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
const commandListClass = "max-h-64 overflow-y-auto p-1"
const commandGroupClass = "py-1"
const commandGroupHeadingClass = "px-2 py-1.5 text-xs font-medium text-muted-foreground"
const commandItemClass = "state [--ds-state-base:var(--popover)] relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-none data-[highlighted=true]:bg-accent data-[highlighted=true]:text-accent-foreground data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50"
const commandEmptyClass = "px-3 py-6 text-center text-sm text-muted-foreground"
/* 구분선은 `bg-*`가 아니라 `h-0 border-t`로 긋는다 — upstream `.cn-command-separator`의
 * `bg-border -mx-1 h-px`는 `--ds-border-default`를 `background-color`에 올리는 계열
 * 위반이고, #154가 `DropdownMenuSeparator`에서 43세대 만에 잡아낸 것과 글자 그대로
 * 같은 모양이다. Menubar·Resizable이 이미 낸 답을 같은 이유로 여기서도 쓴다.
 *
 * 색은 `border-border`로 **수식자 없는 `border-color`**에 앉는다. `border-t`만 적으면
 * 색은 tokens.css의 `@layer base { * { border-color: var(--border) } }`에서 오고
 * 매니페스트에는 컴포넌트 전역 `base`로만 남는다 — 그 항목은 이 파트가 선을 긋든
 * 말든 있으므로 **이 셀에 대한 증거가 아니다**. 명시하면 파트 셀의 `properties`에
 * `border-color: --ds-border-default`가 실제로 들어가 `manifest/lint.mjs`의 계열
 * 규칙(`checkCells`)이 이 자리를 직접 읽는다(#146: 게이트가 본다는 주장은 주석이
 * 아니라 코드 모양으로 참이어야 한다).
 *
 * `-mx-1`은 **계약이 진다**. 그것이 되쓰는 값이 `commandListClass`의 `p-1`이라
 * 소비처는 볼 수도 없는 우리 내부 수이고, 둘이 갈라지면 선이 목록 폭에서 어긋난다.
 * `my-*`는 두지 않는다 — `CommandGroup`의 `py-1`이 위아래 4px를 이미 그리고 있어
 * 여백을 겹쳐 주면 upstream이 그리는 간격의 두 배가 된다. */
const commandSeparatorClass = "-mx-1 h-0 border-t border-border"

type CommandProps = React.ComponentProps<"div"> & {
  /** 검색어. 제어하려면 `onSearchChange`와 함께 준다. */
  search?: string
  defaultSearch?: string
  onSearchChange?: (search: string) => void
  /** 선택된 항목의 value — `aria-selected`가 붙는 행. */
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** 키보드 커서가 놓인 항목의 value — `aria-activedescendant`가 가리키는 행. */
  highlighted?: string | null
  defaultHighlighted?: string | null
  onHighlightedChange?: (value: string | null) => void
  /** 커서를 첫 일치 항목에 자동으로 둔다. false면 화살표 키를 누르기 전까지 커서가 없다. */
  autoHighlight?: boolean
  /** 검색어로 항목을 거른다. 서버에서 이미 거른 목록이면 false. */
  shouldFilter?: boolean
  filter?: CommandFilter
}

function Command({
  className,
  children,
  search: searchProp,
  defaultSearch = "",
  onSearchChange,
  value: valueProp,
  defaultValue,
  onValueChange,
  highlighted: highlightedProp,
  defaultHighlighted = null,
  onHighlightedChange,
  autoHighlight = true,
  shouldFilter = true,
  filter = defaultFilter,
  ...props
}: CommandProps) {
  const baseId = React.useId()
  const inputId = `${baseId}-input`
  const listId = `${baseId}-list`

  const [uncontrolledSearch, setUncontrolledSearch] = React.useState(defaultSearch)
  const search = searchProp ?? uncontrolledSearch
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue)
  const selected = valueProp ?? uncontrolledValue
  const [uncontrolledHighlighted, setUncontrolledHighlighted] = React.useState(defaultHighlighted)
  const highlightState = highlightedProp === undefined ? uncontrolledHighlighted : highlightedProp

  const registry = React.useRef(new Map<string, React.RefObject<CommandItemData>>())
  const [, bumpRegistry] = React.useReducer((count: number) => count + 1, 0)
  const register = React.useCallback((value: string, data: React.RefObject<CommandItemData>) => {
    registry.current.set(value, data)
    bumpRegistry()
    return () => {
      registry.current.delete(value)
      bumpRegistry()
    }
  }, [])

  const matches = React.useCallback(
    (value: string, keywords: readonly string[]) => (shouldFilter ? filter(value, search, keywords) : true),
    [filter, search, shouldFilter]
  )

  // 등록 순서가 곧 문서 순서다 — 형제 항목의 effect는 마운트 순서대로 돈다
  const matched: string[] = []
  const navigable: string[] = []
  for (const [value, data] of registry.current) {
    if (!matches(value, data.current.keywords)) continue
    matched.push(value)
    if (!data.current.disabled) navigable.push(value)
  }

  const highlighted =
    highlightState !== null && navigable.includes(highlightState)
      ? highlightState
      : autoHighlight
        ? (navigable[0] ?? null)
        : null

  const setSearch = React.useCallback(
    (next: string) => {
      if (searchProp === undefined) setUncontrolledSearch(next)
      onSearchChange?.(next)
    },
    [onSearchChange, searchProp]
  )

  const setHighlighted = React.useCallback(
    (next: string | null) => {
      if (highlightedProp === undefined) setUncontrolledHighlighted(next)
      onHighlightedChange?.(next)
    },
    [highlightedProp, onHighlightedChange]
  )

  const move = React.useCallback(
    (delta: number | "first" | "last") => {
      if (!navigable.length) return
      if (delta === "first") return setHighlighted(navigable[0] ?? null)
      if (delta === "last") return setHighlighted(navigable[navigable.length - 1] ?? null)
      const current = highlighted === null ? -1 : navigable.indexOf(highlighted)
      const next = current === -1 ? (delta > 0 ? 0 : navigable.length - 1) : (current + delta + navigable.length) % navigable.length
      setHighlighted(navigable[next] ?? null)
    },
    [highlighted, navigable, setHighlighted]
  )

  const select = React.useCallback(
    (value: string) => {
      const data = registry.current.get(value)
      if (data?.current.disabled) return
      if (valueProp === undefined) setUncontrolledValue(value)
      onValueChange?.(value)
      data?.current.onSelect?.(value)
    },
    [onValueChange, valueProp]
  )

  const context: CommandContextValue = {
    inputId,
    listId,
    search,
    setSearch,
    matches,
    matchCount: matched.length,
    highlighted,
    highlightedId: highlighted === null ? undefined : registry.current.get(highlighted)?.current.id,
    setHighlighted,
    move,
    selected,
    select,
    register,
  }

  return (
    <div data-slot="command" className={cn(commandVariants({ className }))} {...props}>
      <CommandContext.Provider value={context}>{children}</CommandContext.Provider>
    </div>
  )
}

function CommandInput({ className, onKeyDown, onChange, ...props }: React.ComponentProps<"input">) {
  const command = useCommandContext("CommandInput")
  return (
    <input
      {...props}
      id={props.id ?? command.inputId}
      data-slot="command-input"
      type="text"
      role="combobox"
      autoComplete="off"
      spellCheck={false}
      aria-autocomplete="list"
      aria-expanded={command.matchCount > 0}
      aria-controls={command.listId}
      aria-activedescendant={command.highlightedId}
      value={command.search}
      onChange={(event) => {
        onChange?.(event)
        command.setSearch(event.currentTarget.value)
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event)
        if (event.defaultPrevented) return
        if (event.key === "ArrowDown") { event.preventDefault(); command.move(1) }
        else if (event.key === "ArrowUp") { event.preventDefault(); command.move(-1) }
        else if (event.key === "Home") { event.preventDefault(); command.move("first") }
        else if (event.key === "End") { event.preventDefault(); command.move("last") }
        else if (event.key === "Enter" && command.highlighted !== null) { event.preventDefault(); command.select(command.highlighted) }
        else if (event.key === "Escape" && command.search !== "") { event.preventDefault(); command.setSearch("") }
      }}
      className={cn(commandInputClass, className)}
    />
  )
}

function CommandList({ className, "aria-label": ariaLabel = "Command results", ...props }: React.ComponentProps<"div">) {
  const command = useCommandContext("CommandList")
  return (
    <div
      {...props}
      id={command.listId}
      data-slot="command-list"
      role="listbox"
      aria-label={ariaLabel}
      hidden={command.matchCount === 0}
      className={cn(commandListClass, className)}
    />
  )
}

function CommandGroup({ className, ...props }: React.ComponentProps<"div">) {
  const headingId = React.useId()
  return (
    <CommandGroupContext.Provider value={headingId}>
      <div {...props} data-slot="command-group" role="group" aria-labelledby={headingId} className={cn(commandGroupClass, className)} />
    </CommandGroupContext.Provider>
  )
}

function CommandGroupHeading({ className, ...props }: React.ComponentProps<"div">) {
  const headingId = React.useContext(CommandGroupContext)
  return <div {...props} id={props.id ?? headingId} data-slot="command-group-heading" className={cn(commandGroupHeadingClass, className)} />
}

type CommandItemProps = Omit<React.ComponentProps<"div">, "onSelect"> & {
  /** 검색·선택·커서가 모두 이 문자열을 키로 쓴다. 목록 안에서 유일해야 한다. */
  value: string
  /** value 말고도 검색에 걸릴 문자열. 티커·영문명처럼 화면에 없는 이름을 잇는다. */
  keywords?: readonly string[]
  disabled?: boolean
  onSelect?: (value: string) => void
}

function CommandItem({ className, value, keywords, disabled = false, onSelect, onClick, onPointerMove, children, ...props }: CommandItemProps) {
  const command = useCommandContext("CommandItem")
  const id = React.useId()
  const data = React.useRef<CommandItemData>({ id, keywords: keywords ?? [], disabled, onSelect })
  data.current = { id, keywords: keywords ?? [], disabled, onSelect }
  React.useEffect(() => command.register(value, data), [command.register, value]) // eslint-disable-line react-hooks/exhaustive-deps

  const highlighted = command.highlighted === value
  const selected = command.selected === value
  if (!command.matches(value, keywords ?? [])) return null

  return (
    <div
      {...props}
      id={id}
      data-slot="command-item"
      data-value={value}
      role="option"
      aria-selected={selected}
      aria-disabled={disabled || undefined}
      data-highlighted={highlighted ? "true" : undefined}
      data-selected={selected ? "true" : undefined}
      data-disabled={disabled ? "true" : undefined}
      onPointerMove={(event) => {
        onPointerMove?.(event)
        if (!disabled) command.setHighlighted(value)
      }}
      onClick={(event) => {
        onClick?.(event)
        if (!disabled) command.select(value)
      }}
      className={cn(commandItemClass, className)}
    >
      {children}
      {selected ? <span aria-hidden="true" className="absolute right-2">✓</span> : null}
    </div>
  )
}

/* 장식선이다 — `aria-hidden`으로 접근성 트리에서 뺀다. `CommandList`가 `role="listbox"`라
 * 소유 자식은 `option`과 `group`만 허용되고, `role="separator"`는 (menu와 달리) 그 목록에
 * 없어 넣는 순간 목록 시맨틱이 깨진다. 선이 나르는 것은 `CommandGroupHeading`이 이미
 * 이름으로 나르는 묶음 경계라 트리에서 빼도 잃는 정보가 없다. */
function CommandSeparator({ className, ...props }: React.ComponentProps<"div">) {
  return <div {...props} data-slot="command-separator" aria-hidden="true" className={cn(commandSeparatorClass, className)} />
}

function CommandEmpty({ className, ...props }: React.ComponentProps<"div">) {
  const command = useCommandContext("CommandEmpty")
  if (command.matchCount > 0) return null
  return <div {...props} data-slot="command-empty" role="status" className={cn(commandEmptyClass, className)} />
}

const componentContract = {
  name: "command", source: "src/components/ui/command.tsx",
  publicExports: ["Command", "CommandInput", "CommandList", "CommandGroup", "CommandGroupHeading", "CommandItem", "CommandSeparator", "CommandEmpty", "commandVariants", "commandVariantsConfig"],
  config: commandVariantsConfig, className: (props: Record<string, string>) => cn(commandVariants(props)),
  anatomy: ["Command", "CommandInput", "CommandList", "CommandGroup*", "CommandGroupHeading?", "CommandItem*", "CommandSeparator?", "CommandEmpty?"],
  /* highlighted는 키보드 커서가 놓인 행 하나, selected는 이미 고른 값이다.
   * results는 검색 결과가 있는 목록과 빈 결과 표면 중 무엇을 조립하는지 고른다. */
  configurationStates: { highlighted: ["highlighted", "idle"], selected: ["unselected", "selected"], results: ["matches", "empty"] }, drawnBy: { highlighted: { attribute: "data-highlighted", values: { highlighted: "true" } }, selected: "선택된 행에만 붙는 `✓` 글리프가 그린다 — 자기 클래스가 없는 노드다", results: "`CommandEmpty`의 존재가 그린다 — 결과가 없을 때만 그 파트가 렌더된다" },
  parts: {
    CommandInput: staticPart(commandInputClass),
    CommandList: staticPart(commandListClass),
    CommandGroup: staticPart(commandGroupClass),
    CommandGroupHeading: staticPart(commandGroupHeadingClass),
    CommandItem: staticPart(commandItemClass),
    CommandSeparator: staticPart(commandSeparatorClass),
    CommandEmpty: staticPart(commandEmptyClass),
  },
  behaviors: {},
  reference: { example: "command", guidance: { use: "검색어로 목록을 좁혀 명령이나 항목 하나를 고르고, 키보드 커서(highlighted)와 고른 값(selected)을 함께 보여준다.", evidence: "종목·거래·화면 이동이 한 자리에 섞여 있어 마우스로 메뉴를 파고들기보다 이름을 입력해 바로 실행하는 진입점이 필요하다.", limits: "값이 적고 고정된 선택에는 Select를, 맥락 동작 묶음에는 Dropdown Menu를 쓴다. 팝오버·모달 안에 넣는 것과 닫기, 원격 검색과 정렬 순서는 소비처가 조립하며 검색 입력의 접근 가능한 이름도 소비처가 준다. 항목 끝의 단축키 표기(upstream의 `CommandShortcut`)는 열지 않는다 — 소비처가 `Kbd`를 `ml-auto`와 함께 놓으면 되고 그 클래스가 우리 스타일 결정을 복제하지 않는다(#121 ⓑ, `InputGroupButton`의 variant·size와 같은 판정 2). upstream의 `CommandShortcut`도 키캡이 아니라 평평한 muted 텍스트라 Kbd가 채우던 자리가 아니다. `CommandSeparator`는 43세대 동안 이름조차 없던 종류 ② 공백이었고 #169가 ADR-0006의 두 관문으로 판정해 **열었다**(#165) — upstream에 실재하는 노드이고(ⓐ), 소비처가 다시 그리려면 목록 안쪽 여백을 되쓰는 음수 여백을 우리 내부 수에서 추측해야 한다(ⓑ). **선은 `bg-*`가 아니라 `-mx-1 h-0 border-t border-border`로 긋는다** — upstream의 `.cn-command-separator`(`bg-border -mx-1 h-px`)는 #154가 `DropdownMenuSeparator`에서 잡은 `--ds-border-default`를 `background-color`에 올리는 계열 위반과 글자 그대로 같은 모양이라, 베끼면 43세대짜리 결함을 새로 만든다. 렌더는 같은 1px 선이고 Menubar·Resizable이 이미 낸 답이다. 색을 `border-border`로 **명시**한 것은 계열 게이트가 이 셀을 실제로 읽게 하기 위해서다 — `border-t`만 적으면 색은 `@layer base`에서 와 매니페스트의 컴포넌트 전역 `base`에만 남고, 그 항목은 이 파트가 있든 없든 있으므로 이 자리에 대한 증거가 아니다(없는 것은 통과가 아니라 침묵이다, ADR-0006 · #146). **음수 여백은 계약이 진다.** `-mx-1`이 되쓰는 값은 `CommandList`의 `p-1`이고 그건 소비처가 볼 수 없는 우리 내부 수라, 소비처에 맡기면 목록 패딩을 한 번 바꿀 때마다 모든 소비처에서 선이 어긋난다 — 두 수는 한 파일에서 함께 움직여야 하고, 파생 채널이 나르는 기하도 계약이 질 때만 참이다. 세로 여백은 두지 않는다: `CommandGroup`의 `py-1`이 위아래 4px를 이미 그려 upstream과 같은 간격이 나온다. **`CommandGroup` 사이 전용이 아니다.** 이 선이 가르는 것은 `CommandList`의 형제 구역이고, 묶음이 없는 목록에서 항목 무리를 가르는 쓰임도 같은 자리다 — 쓰임이 한 자리로 고정되지 않으므로 `anatomy`는 `CommandSeparator?`로 존재와 선택성만 말한다(anatomy 표기는 평평한 목록이라 중첩을 말하지 못한다). 고정된 것은 **가면 안 되는 자리**다: `CommandGroup` **안**에는 넣지 않는다 — 묶음은 `aria-labelledby`로 이름 하나를 갖는 한 구역이라 그 안을 선으로 가르면 이름이 가리키는 범위와 눈에 보이는 범위가 어긋난다. 접근성: 장식선이라 `aria-hidden=\"true\"`로 접근성 트리에서 뺀다. `CommandList`가 `role=\"listbox\"`이고 listbox가 소유할 수 있는 자식은 `option`과 `group`뿐이라, menu에서라면 옳았을 `role=\"separator\"`가 여기서는 목록 시맨틱을 깬다. 선이 나르는 경계는 `CommandGroupHeading`이 이미 이름으로 나르므로 트리에서 빼도 잃는 정보가 없다. 검색으로 한쪽 묶음이 비어도 선은 그대로 남는다 — `CommandGroup`이 자기 묶음의 일치 수를 세지 않기 때문이고, 오늘 빈 묶음의 `CommandGroupHeading`이 남는 것과 같은 자리다. 여는 티켓이 그 계산을 새로 들이지 않았다. 새 축도 새 구성 상태도 늘지 않는다 — 정적 파트 하나다." } },
} as const

export { Command, CommandInput, CommandList, CommandGroup, CommandGroupHeading, CommandItem, CommandSeparator, CommandEmpty, commandVariants, commandVariantsConfig, componentContract }
