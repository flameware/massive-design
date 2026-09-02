import * as React from "react"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Command } from "./command"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"

/* Popover와 Command를 합성해 "값 하나를 고르는" 표면으로 좁힌다. 이 파일이 새로
 * 만드는 것은 둘 중 어디에도 없던 것뿐이다 — 고른 값을 보여주는 트리거와, 선택이
 * 곧 닫기가 되는 연결.
 *
 * 두 컴포넌트를 import하는 리포 첫 사례다. 베끼면 Command의 키보드 계약이 두
 * 벌이 되어 갈라지므로, 합성 컴포넌트는 원본을 그대로 소비한다.
 *
 * 접근성의 핵심 결정: 트리거에 `role="combobox"`를 두지 않는다. Command의 검색
 * 입력이 이미 combobox이고 그 안의 목록이 listbox라, 트리거까지 combobox로 두면
 * combobox가 둘 겹친다. 트리거는 Radix Popover가 주는 `aria-haspopup="dialog"`와
 * `aria-expanded`를 그대로 쓰는 버튼이고, 검색 가능한 목록은 열린 dialog 안에
 * 산다.
 *
 * Escape는 검색어를 비우는 것이 아니라 곧바로 닫는다. Command 단독으로는 첫
 * Escape가 검색어만 지우지만, 여기서는 고르기를 그만두겠다는 뜻이므로 한 번에
 * 닫는 것이 맞다 — 값 하나를 고르는 컨트롤에서 두 번 눌러야 닫히면 그게 회귀다.
 * Popover의 dismiss가 document에서 듣기 때문에 동작상으로도 이쪽이 정본이다. */

type ComboboxContextValue = {
  value: string | undefined
  select: (value: string) => void
}

const ComboboxContext = React.createContext<ComboboxContextValue | null>(null)

function useComboboxContext(part: string) {
  const context = React.useContext(ComboboxContext)
  if (!context) throw new Error(`${part}는 Combobox 안에서만 쓴다`)
  return context
}

const comboboxVariantsConfig = { variants: {}, defaultVariants: {} } as const
const comboboxVariants = cva(
  "flex h-9 w-full min-w-0 items-center justify-between gap-2 rounded-md border bg-background px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-focus-contrast focus-visible:ring-[3px] focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20",
  comboboxVariantsConfig
)

const staticPart = (className: string) => ({
  config: { variants: {}, defaultVariants: {} } as const,
  className: () => className,
})

const comboboxValueClass = "truncate text-left data-[placeholder=true]:text-muted-foreground"
const comboboxIconClass = "size-4 shrink-0 text-muted-foreground"
const comboboxContentClass = "w-[var(--radix-popover-trigger-width)] p-0"

type ComboboxProps = {
  children?: React.ReactNode
  /** 고른 값. Command의 `value`와 같은 문자열이며 트리거에 그대로 표시된다. */
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  modal?: boolean
}

function Combobox({
  children,
  value: valueProp,
  defaultValue,
  onValueChange,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  modal,
}: ComboboxProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
  const open = openProp ?? uncontrolledOpen
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue)
  const value = valueProp ?? uncontrolledValue

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (openProp === undefined) setUncontrolledOpen(next)
      onOpenChange?.(next)
    },
    [onOpenChange, openProp]
  )

  // 고르는 순간이 곧 닫는 순간이다 — Popover는 닫으면서 초점을 트리거로 되돌린다
  const select = React.useCallback(
    (next: string) => {
      if (valueProp === undefined) setUncontrolledValue(next)
      onValueChange?.(next)
      setOpen(false)
    },
    [onValueChange, setOpen, valueProp]
  )

  const context = React.useMemo<ComboboxContextValue>(() => ({ value, select }), [select, value])

  return (
    <ComboboxContext.Provider value={context}>
      <Popover open={open} onOpenChange={setOpen} modal={modal}>
        {children}
      </Popover>
    </ComboboxContext.Provider>
  )
}

function ComboboxTrigger({ className, ...props }: React.ComponentProps<typeof PopoverTrigger>) {
  const combobox = useComboboxContext("ComboboxTrigger")
  return (
    <PopoverTrigger
      type="button"
      data-slot="combobox-trigger"
      data-selected={combobox.value === undefined ? undefined : true}
      className={cn(comboboxVariants({ className }))}
      {...props}
    />
  )
}

function ComboboxValue({ className, placeholder, children, ...props }: React.ComponentProps<"span"> & { placeholder?: string }) {
  const combobox = useComboboxContext("ComboboxValue")
  const empty = combobox.value === undefined
  return (
    <span data-slot="combobox-value" data-placeholder={empty ? true : undefined} className={cn(comboboxValueClass, className)} {...props}>
      {children ?? (empty ? placeholder : combobox.value)}
    </span>
  )
}

function ComboboxIcon({ className, children, ...props }: React.ComponentProps<"svg">) {
  return (
    <svg data-slot="combobox-icon" viewBox="0 0 16 16" aria-hidden="true" className={cn(comboboxIconClass, className)} {...props}>
      {children ?? <path d="m4 6 4 4 4-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />}
    </svg>
  )
}

type ComboboxContentProps = React.ComponentProps<typeof PopoverContent> &
  Pick<React.ComponentProps<typeof Command>, "search" | "defaultSearch" | "onSearchChange" | "shouldFilter" | "filter" | "autoHighlight">

function ComboboxContent({
  className,
  children,
  search,
  defaultSearch,
  onSearchChange,
  shouldFilter,
  filter,
  autoHighlight,
  ...props
}: ComboboxContentProps) {
  const combobox = useComboboxContext("ComboboxContent")
  return (
    <PopoverContent data-slot="combobox-content" className={cn(comboboxContentClass, className)} {...props}>
      <Command
        value={combobox.value}
        onValueChange={combobox.select}
        search={search}
        defaultSearch={defaultSearch}
        onSearchChange={onSearchChange}
        shouldFilter={shouldFilter}
        filter={filter}
        autoHighlight={autoHighlight}
        className="border-0 shadow-none"
      >
        {children}
      </Command>
    </PopoverContent>
  )
}

const componentContract = {
  name: "combobox", source: "src/components/ui/combobox.tsx",
  publicExports: ["Combobox", "ComboboxTrigger", "ComboboxValue", "ComboboxIcon", "ComboboxContent", "comboboxVariants", "comboboxVariantsConfig"],
  config: comboboxVariantsConfig, className: (props: Record<string, string>) => cn(comboboxVariants(props)),
  /* 목록 안쪽은 Command의 표면을 그대로 쓴다 — 조립된 구조를 있는 그대로 적는다. */
  anatomy: ["Combobox", "ComboboxTrigger", "ComboboxValue", "ComboboxIcon?", "ComboboxContent", "CommandInput", "CommandList", "CommandGroup*", "CommandItem*", "CommandEmpty?"],
  /* Command는 커서(highlighted)까지 세 축을 갖지만 Combobox는 두 축이다 — 커서는
   * 열린 목록 안에서만 뜻이 있고 그 조립은 Command의 참조 화면이 이미 나른다. */
  configurationStates: { open: ["closed", "open"], selected: ["unselected", "selected"] }, drawnBy: { open: "표면(`ComboboxContent`)의 존재가 곧 열림이다", selected: "`ComboboxValue`의 내용이 그린다 — `data-selected`가 DOM에 붙지만 우리 클래스는 그것을 읽지 않는다" },
  parts: {
    ComboboxValue: staticPart(comboboxValueClass),
    ComboboxIcon: staticPart(comboboxIconClass),
    ComboboxContent: staticPart(comboboxContentClass),
  },
  behaviors: {},
  reference: { example: "combobox", guidance: { use: "값이 많아 눈으로 훑기 어려운 목록에서 검색으로 좁혀 하나를 고르고, 닫힌 상태에서는 고른 값을 트리거에 보여준다.", evidence: "거래를 기록할 때 종목을 골라야 하는데 상장 종목이 수천 개라 고정 목록으로는 펼칠 수 없고, 고른 뒤에는 어떤 종목인지 계속 보여야 한다.", limits: "값이 적고 고정되어 있으면 Select, 폼 제출과 시스템 피커가 중요하면 Native Select, 고를 값이 아니라 실행할 동작이면 Command를 그대로 쓴다. 트리거는 `role=\"combobox\"`가 아니라 dialog를 여는 버튼이므로 접근 가능한 이름은 소비처가 `aria-label`이나 Field의 라벨로 준다. Escape는 검색어를 비우지 않고 한 번에 닫으며, 닫으면 검색어는 버려진다. 다중 선택과 값 생성(새 항목 추가)은 계약하지 않는다." } },
} as const

export { Combobox, ComboboxTrigger, ComboboxValue, ComboboxIcon, ComboboxContent, comboboxVariants, comboboxVariantsConfig, componentContract }
