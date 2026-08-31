import * as React from "react"
import { Popover as PopoverPrimitive } from "radix-ui"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

/* 트리거 모드(`openOn`)는 계약에 담되 매니페스트에는 담지 않는다(#126, #119).
 *
 * `openOn="hover"`는 포인터가 머무를 때 지연 후 연다. 다만 **Radix `HoverCard`로
 * 갈아 끼우지 않는다** — 그 primitive는 `Anchor`와 `Close`를 내보내지 않아 우리
 * anatomy의 `PopoverAnchor?`가 렌더될 수 없고, 포인터 핸들러가 touch를 배제하고
 * `onTouchStart`를 preventDefault해서 **터치로는 영영 열리지 않으며**(터치가 1급
 * 대상이라는 #97의 전제와 정면으로 부딪힌다), 콘텐츠 안의 tabbable을 전부
 * `tabindex="-1"`로 눕혀 "짧은 설정"을 담는다는 이 컴포넌트의 `use`를 무효로 만든다.
 * 셋 다 우리가 받을 수 없는 손실이라, Popover primitive를 그대로 두고 제어된 `open`을
 * 타이머로 민다. 그래서 클릭은 계속 열고 닫으며(터치와 키보드의 경로다),
 * `aria-haspopup`·`aria-expanded`·`aria-controls` 배선과 포커스 반환이 그대로 산다.
 *
 * **지연값은 우리 것이다.** HoverCard의 700/300은 위의 손실과 함께 오는 값이라
 * 가져오지 않고, 같은 리포에서 이미 한 번 정한 `tooltip.tsx`의 `delayDuration = 300`을
 * 따른다. 닫는 지연은 포인터가 트리거에서 콘텐츠로 건너갈 시간이다. 이 값들은
 * 공개 prop이 아니다 — 물리는 계약하지 않는다.
 *
 * 매니페스트는 움직이지 않는다: 우리 클래스는 `popoverVariants` 하나뿐이고 두 모드가
 * 그것을 똑같이 호출하므로 셀·축·anatomy·구성 상태가 그대로다. `openOn`을 `cva` 축이나
 * `configurationStates`에 두면 파생 채널이 동작을 그리게 되고, 그것이 #97이 닫은
 * 자리다. 호환성은 additive — 기본값 `press`가 기존 호출과 발행된 인스턴스를
 * 재해석하지 않는다. */
const popoverVariantsConfig = { variants: {}, defaultVariants: {} } as const
const popoverVariants = cva("w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none", popoverVariantsConfig)

const POPOVER_HOVER_OPEN_DELAY = 300
const POPOVER_HOVER_CLOSE_DELAY = 300

type PopoverHoverControls = { open: () => void; close: () => void; cancel: () => void }
/** hover 모드에서만 채워진다. null이면 press 모드이고 아무 핸들러도 붙지 않는다. */
const PopoverHoverContext = React.createContext<PopoverHoverControls | null>(null)

type PopoverProps = React.ComponentProps<typeof PopoverPrimitive.Root> & { openOn?: "press" | "hover" }

function Popover({ openOn = "press", ...props }: PopoverProps) {
  return openOn === "hover" ? <PopoverHoverRoot {...props} /> : <PopoverPrimitive.Root {...props} />
}

function PopoverHoverRoot({ open: openProp, defaultOpen, onOpenChange, ...props }: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen ?? false)
  const timer = React.useRef(0)
  const open = openProp ?? uncontrolledOpen
  // 지연 없이 즉시 반영되는 경로다 — 클릭·Esc·바깥 클릭이 여기로 들어온다
  const setOpen = React.useCallback((next: boolean) => {
    window.clearTimeout(timer.current)
    if (openProp === undefined) setUncontrolledOpen(next)
    onOpenChange?.(next)
  }, [openProp, onOpenChange])
  React.useEffect(() => () => window.clearTimeout(timer.current), [])
  const controls = React.useMemo<PopoverHoverControls>(() => ({
    open: () => { window.clearTimeout(timer.current); timer.current = window.setTimeout(() => setOpen(true), POPOVER_HOVER_OPEN_DELAY) },
    close: () => { window.clearTimeout(timer.current); timer.current = window.setTimeout(() => setOpen(false), POPOVER_HOVER_CLOSE_DELAY) },
    cancel: () => window.clearTimeout(timer.current),
  }), [setOpen])
  return <PopoverHoverContext.Provider value={controls}><PopoverPrimitive.Root open={open} onOpenChange={setOpen} {...props} /></PopoverHoverContext.Provider>
}

function PopoverTrigger(props: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  const hover = React.useContext(PopoverHoverContext)
  if (!hover) return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />
  return (
    <PopoverPrimitive.Trigger
      data-slot="popover-trigger"
      {...props}
      // 포인터가 없는 환경을 hover에 맡기지 않는다: 포커스로 열고, 클릭은 그대로 토글이다
      onPointerEnter={(event) => { props.onPointerEnter?.(event); if (event.pointerType !== "touch") hover.open() }}
      onPointerLeave={(event) => { props.onPointerLeave?.(event); if (event.pointerType !== "touch") hover.close() }}
      onFocus={(event) => { props.onFocus?.(event); hover.open() }}
      onBlur={(event) => { props.onBlur?.(event); hover.close() }}
      // 클릭이 토글한 뒤 예약된 타이머가 그것을 되돌리지 않게 한다
      onClick={(event) => { props.onClick?.(event); hover.cancel() }}
    />
  )
}

function PopoverAnchor(props: React.ComponentProps<typeof PopoverPrimitive.Anchor>) { return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} /> }

function PopoverContent({ className, align = "center", sideOffset = 4, ...props }: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  const hover = React.useContext(PopoverHoverContext)
  const contentClassName = cn(popoverVariants({ className }))
  if (!hover) return <PopoverPrimitive.Portal><PopoverPrimitive.Content data-slot="popover-content" align={align} sideOffset={sideOffset} className={contentClassName} {...props} /></PopoverPrimitive.Portal>
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={contentClassName}
        {...props}
        // 포인터가 트리거에서 콘텐츠로 건너가는 동안 닫히지 않는다
        onPointerEnter={(event) => { props.onPointerEnter?.(event); if (event.pointerType !== "touch") hover.cancel() }}
        onPointerLeave={(event) => { props.onPointerLeave?.(event); if (event.pointerType !== "touch") hover.close() }}
        // hover로 열린 표면이 포커스를 빼앗지 않는다. 클릭으로 연 경우의 포커스 반환은 그대로다
        onOpenAutoFocus={(event) => { props.onOpenAutoFocus?.(event); if (!event.defaultPrevented) event.preventDefault() }}
      />
    </PopoverPrimitive.Portal>
  )
}

const componentContract = {
  name: "popover", source: "src/components/ui/popover.tsx",
  publicExports: ["Popover", "PopoverTrigger", "PopoverAnchor", "PopoverContent", "popoverVariants", "popoverVariantsConfig"],
  config: popoverVariantsConfig, className: (props: Record<string, string>) => cn(popoverVariants(props)),
  anatomy: ["Popover", "PopoverTrigger", "PopoverAnchor?", "PopoverContent"],
  configurationStates: { open: ["closed", "open"] },
  reference: { example: "popover", guidance: { use: "트리거와 가까운 곳에서 짧은 보조 정보나 설정을 제공한다. 클릭으로 여는 기본 모드와, 포인터가 머무르면 지연 후 여는 openOn=\"hover\" 모드를 같은 계약으로 덮는다.", evidence: "투자 기록의 필터 설명과 빠른 설정을 원래 화면 맥락을 떠나지 않고 보여줘야 하고, 종목 이름 위에 잠깐 머무르는 것만으로 그 종목의 요약을 미리 보는 경로도 같은 자산이어야 한다.", limits: "핵심 작업 흐름이나 긴 양식은 Dialog로 옮기고, 행동 없는 짧은 설명은 Tooltip을 사용한다. openOn=\"hover\"에서도 컨트롤의 의미를 보충하는 한 줄 설명은 여전히 Tooltip이다 — Tooltip은 트리거에 aria-describedby로 묶여 이름을 보조하는 설명이고, hover 모드의 Popover는 트리거가 가리키는 대상의 미리보기다. 미리보기 안의 정보와 행동은 hover 없이도 도달할 수 있는 다른 경로가 있어야 하며 이 모드는 필수 작업 흐름을 담지 않는다. 여는 지연과 닫는 지연은 우리가 정하지만 공개 prop이 아니다." } },
} as const

export { Popover, PopoverTrigger, PopoverAnchor, PopoverContent, popoverVariants, popoverVariantsConfig, componentContract }
