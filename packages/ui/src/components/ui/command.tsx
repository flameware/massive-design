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

function CommandEmpty({ className, ...props }: React.ComponentProps<"div">) {
  const command = useCommandContext("CommandEmpty")
  if (command.matchCount > 0) return null
  return <div {...props} data-slot="command-empty" role="status" className={cn(commandEmptyClass, className)} />
}

const componentContract = {
  name: "command", source: "src/components/ui/command.tsx",
  publicExports: ["Command", "CommandInput", "CommandList", "CommandGroup", "CommandGroupHeading", "CommandItem", "CommandEmpty", "commandVariants", "commandVariantsConfig"],
  config: commandVariantsConfig, className: (props: Record<string, string>) => cn(commandVariants(props)),
  anatomy: ["Command", "CommandInput", "CommandList", "CommandGroup*", "CommandGroupHeading?", "CommandItem*", "CommandEmpty?"],
  /* highlighted는 키보드 커서가 놓인 행 하나, selected는 이미 고른 값이다.
   * results는 검색 결과가 있는 목록과 빈 결과 표면 중 무엇을 조립하는지 고른다. */
  configurationStates: { highlighted: ["highlighted", "idle"], selected: ["unselected", "selected"], results: ["matches", "empty"] }, drawnBy: { highlighted: { attribute: "data-highlighted", values: { highlighted: "true" } }, selected: "선택된 행에만 붙는 `✓` 글리프가 그린다 — 자기 클래스가 없는 노드다", results: "`CommandEmpty`의 존재가 그린다 — 결과가 없을 때만 그 파트가 렌더된다" },
  parts: {
    CommandInput: staticPart(commandInputClass),
    CommandList: staticPart(commandListClass),
    CommandGroup: staticPart(commandGroupClass),
    CommandGroupHeading: staticPart(commandGroupHeadingClass),
    CommandItem: staticPart(commandItemClass),
    CommandEmpty: staticPart(commandEmptyClass),
  },
  behaviors: {},
  reference: { example: "command", guidance: { use: "검색어로 목록을 좁혀 명령이나 항목 하나를 고르고, 키보드 커서(highlighted)와 고른 값(selected)을 함께 보여준다.", evidence: "종목·거래·화면 이동이 한 자리에 섞여 있어 마우스로 메뉴를 파고들기보다 이름을 입력해 바로 실행하는 진입점이 필요하다.", limits: "값이 적고 고정된 선택에는 Select를, 맥락 동작 묶음에는 Dropdown Menu를 쓴다. 팝오버·모달 안에 넣는 것과 닫기, 원격 검색과 정렬 순서는 소비처가 조립하며 검색 입력의 접근 가능한 이름도 소비처가 준다. 항목 끝의 단축키 표기(upstream의 `CommandShortcut`)는 열지 않는다 — 소비처가 `Kbd`를 `ml-auto`와 함께 놓으면 되고 그 클래스가 우리 스타일 결정을 복제하지 않는다(#121 ⓑ, `InputGroupButton`의 variant·size와 같은 판정 2). upstream의 `CommandShortcut`도 키캡이 아니라 평평한 muted 텍스트라 Kbd가 채우던 자리가 아니다." } },
} as const

export { Command, CommandInput, CommandList, CommandGroup, CommandGroupHeading, CommandItem, CommandEmpty, commandVariants, commandVariantsConfig, componentContract }
