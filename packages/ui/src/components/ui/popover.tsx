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

/* 머리말 세 조각(#166). Dialog·Sheet·AlertDialog가 이미 갖는 셋을 Popover만 갖지
 * 않던 카탈로그 내부 비대칭을 닫는다.
 *
 * **Dialog의 상수를 공유하지 않고 복제한다.** 소비(#91)가 성립하려면 원본을 실제로
 * 렌더할 수 있어야 하는데 `DialogTitle`은 `DialogPrimitive.Title`이라 Popover 안에서
 * 렌더하면 Radix가 스코프 컨텍스트를 찾지 못해 던진다 — Radix `Popover`에는 `Title`도
 * `Description`도 없다. #170이 `Textarea`를 소비할 수 있었던 것은 그 관계가 성립했기
 * 때문이고, 여기는 성립하지 않는다. 그리고 값도 갈린다(아래).
 *
 * **값은 제목만 갈린다.** upstream `.cn-popover-title`은 `text-sm font-medium`,
 * `.cn-popover-description`은 `text-muted-foreground text-xs/relaxed`다. 제목은
 * upstream을 그대로 집는다 — `w-72 p-4` 표면에 Dialog의 `text-lg font-semibold`는
 * 과하고, `text-sm font-medium`은 `ProgressLabel`·`ListRowTitle`·Calendar 캡션이 이미
 * 서 있는 이 카탈로그의 단이다. 설명은 upstream의 `text-xs/relaxed`가 아니라 카탈로그의
 * 유일한 설명 단인 `text-sm text-muted-foreground`다 — `/relaxed`는 어느 계약도 쓰지
 * 않는 새 행간이고, 실측 수요 없이 단을 늘리지 않는다(#168·#164). */
const HEADER = "flex flex-col gap-1"
const TITLE = "text-sm font-medium"
const DESCRIPTION = "text-sm text-muted-foreground"

type PopoverLabelling = {
  titleId: string
  descriptionId: string
  registerTitle: (delta: number) => void
  registerDescription: (delta: number) => void
}
/** `PopoverContent`가 제공한다. 밖에서 쓰인 제목·설명은 id를 받지 못하고 글자만 진다. */
const PopoverLabellingContext = React.createContext<PopoverLabelling | null>(null)

/* SSR에서 `useLayoutEffect`는 아무것도 하지 않으면서 경고만 낸다. 브라우저에서는
 * 페인트 전에 붙어야 한다 — 열릴 때 초점이 표면으로 가므로 한 프레임 늦은 이름은
 * 보조기술이 읽는 순간을 놓친다. */
const useRegistrationEffect = typeof document === "undefined" ? React.useEffect : React.useLayoutEffect

function usePopoverLabelPart(register: ((delta: number) => void) | undefined) {
  useRegistrationEffect(() => {
    register?.(1)
    return () => register?.(-1)
  }, [register])
}

function PopoverContent({ className, align = "center", sideOffset = 4, ...props }: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  const hover = React.useContext(PopoverHoverContext)
  const contentClassName = cn(popoverVariants({ className }))
  /* 이름 배선은 우리가 진다(#166). Radix `Popover.Content`는 `role="dialog"`를 내면서
   * `aria-labelledby`·`aria-describedby`를 배선하지 않는다 — 1.1.23 소스가 내는 aria는
   * 트리거의 `aria-controls`·`aria-expanded`·`aria-haspopup`뿐이라 오늘 이 표면은
   * **이름 없는 dialog**다. `Dialog.Content`는 `titlePresent`/`descriptionPresent`로
   * 조건부 배선을 하므로 같은 모양을 여기서 낸다. 무조건 id를 거는
   * `CommandGroup` 쪽 답을 쓰지 않는 것은, 제목이 선택적인 이 표면에서는 그것이
   * 존재하지 않는 id를 가리키는 참조가 되고 axe가 그것을 위반으로 읽기 때문이다. */
  const titleId = React.useId()
  const descriptionId = React.useId()
  const [titleCount, setTitleCount] = React.useState(0)
  const [descriptionCount, setDescriptionCount] = React.useState(0)
  const labelling = React.useMemo<PopoverLabelling>(() => ({
    titleId, descriptionId,
    registerTitle: (delta) => setTitleCount((count) => count + delta),
    registerDescription: (delta) => setDescriptionCount((count) => count + delta),
  }), [titleId, descriptionId])
  // 소비처가 스스로 이름을 준 표면은 건드리지 않는다. `aria-labelledby`는 뒤의 전개가 이긴다
  const labelledBy = props["aria-label"] === undefined && titleCount > 0 ? titleId : undefined
  const describedBy = descriptionCount > 0 ? descriptionId : undefined
  if (!hover) return <PopoverPrimitive.Portal><PopoverLabellingContext.Provider value={labelling}><PopoverPrimitive.Content data-slot="popover-content" align={align} sideOffset={sideOffset} className={contentClassName} aria-labelledby={labelledBy} aria-describedby={describedBy} {...props} /></PopoverLabellingContext.Provider></PopoverPrimitive.Portal>
  return (
    <PopoverPrimitive.Portal>
      <PopoverLabellingContext.Provider value={labelling}>
        <PopoverPrimitive.Content
          data-slot="popover-content"
          align={align}
          sideOffset={sideOffset}
          className={contentClassName}
          aria-labelledby={labelledBy}
          aria-describedby={describedBy}
          {...props}
          // 포인터가 트리거에서 콘텐츠로 건너가는 동안 닫히지 않는다
          onPointerEnter={(event) => { props.onPointerEnter?.(event); if (event.pointerType !== "touch") hover.cancel() }}
          onPointerLeave={(event) => { props.onPointerLeave?.(event); if (event.pointerType !== "touch") hover.close() }}
          // hover로 열린 표면이 포커스를 빼앗지 않는다. 클릭으로 연 경우의 포커스 반환은 그대로다
          onOpenAutoFocus={(event) => { props.onOpenAutoFocus?.(event); if (!event.defaultPrevented) event.preventDefault() }}
        />
      </PopoverLabellingContext.Provider>
    </PopoverPrimitive.Portal>
  )
}

function PopoverHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="popover-header" className={cn(HEADER, className)} {...props} />
}

/* `<div>`이지 heading이 아니다 — 앵커에 붙는 인라인 표면이 페이지의 제목 개요에
 * 자기 층위를 밀어 넣을 근거가 없고, 어느 층위인지는 소비처의 문서 구조가 안다.
 * 이름은 heading 시맨틱이 아니라 `aria-labelledby`가 진다. 제목을 heading으로
 * 읽혀야 하는 소비처는 `children`으로 자기 heading을 넣는다. */
function PopoverTitle({ className, id, ...props }: React.ComponentProps<"div">) {
  const labelling = React.useContext(PopoverLabellingContext)
  usePopoverLabelPart(labelling?.registerTitle)
  return <div data-slot="popover-title" id={id ?? labelling?.titleId} className={cn(TITLE, className)} {...props} />
}

function PopoverDescription({ className, id, ...props }: React.ComponentProps<"p">) {
  const labelling = React.useContext(PopoverLabellingContext)
  usePopoverLabelPart(labelling?.registerDescription)
  return <p data-slot="popover-description" id={id ?? labelling?.descriptionId} className={cn(DESCRIPTION, className)} {...props} />
}

const staticPart = (className: string) => ({
  config: { variants: {}, defaultVariants: {} } as const,
  className: () => className,
})

const componentContract = {
  name: "popover", source: "src/components/ui/popover.tsx",
  publicExports: ["Popover", "PopoverTrigger", "PopoverAnchor", "PopoverContent", "PopoverHeader", "PopoverTitle", "PopoverDescription", "popoverVariants", "popoverVariantsConfig"],
  config: popoverVariantsConfig, className: (props: Record<string, string>) => cn(popoverVariants(props)),
  anatomy: ["Popover", "PopoverTrigger", "PopoverAnchor?", "PopoverContent", "PopoverHeader?", "PopoverTitle?", "PopoverDescription?"],
  configurationStates: { open: ["closed", "open"] }, drawnBy: { open: "표면의 존재가 곧 열림이다 — 닫힌 상태에는 그릴 노드가 없다" },
  parts: {
    PopoverHeader: staticPart(HEADER),
    PopoverTitle: staticPart(TITLE),
    PopoverDescription: staticPart(DESCRIPTION),
  },
  behaviors: {
    hoverOpen: { kind: "open-cause", surface: "PopoverContent", origin: "ours", control: "openOn", why: "`openOn=\"hover\"`는 포인터가 머무르면 지연 후 연다 — 우리가 만든 열림 계기이고 기본값은 `press`다(#126). 여는 지연과 닫는 지연은 우리가 정하지만 공개 prop이 아니라 소비처가 바꿀 자리가 없다. 열림 계기는 축도 구성 상태도 아니어서 생성된 스토리가 이 모드를 렌더하지 않는다." },
  },
  reference: { example: "popover", guidance: { use: "트리거와 가까운 곳에서 짧은 보조 정보나 설정을 제공하고, 그 표면의 제목과 한 줄 설명은 `PopoverHeader`·`PopoverTitle`·`PopoverDescription`이 진다. 클릭으로 여는 기본 모드와, 포인터가 머무르면 지연 후 여는 openOn=\"hover\" 모드를 같은 계약으로 덮는다.", evidence: "투자 기록의 필터 설명과 빠른 설정을 원래 화면 맥락을 떠나지 않고 보여줘야 하고, 종목 이름 위에 잠깐 머무르는 것만으로 그 종목의 요약을 미리 보는 경로도 같은 자산이어야 한다. 그 표면들은 대개 \"무엇에 대한 설정인가\" 한 줄과 그 아래 설명 한 줄로 시작한다.", limits: "핵심 작업 흐름이나 긴 양식은 Dialog로 옮기고, 행동 없는 짧은 설명은 Tooltip을 사용한다. openOn=\"hover\"에서도 컨트롤의 의미를 보충하는 한 줄 설명은 여전히 Tooltip이다 — Tooltip은 트리거에 aria-describedby로 묶여 이름을 보조하는 설명이고, hover 모드의 Popover는 트리거가 가리키는 대상의 미리보기다. 미리보기 안의 정보와 행동은 hover 없이도 도달할 수 있는 다른 경로가 있어야 하며 이 모드는 필수 작업 흐름을 담지 않는다. 여는 지연과 닫는 지연은 우리가 정하지만 공개 prop이 아니다. `PopoverPortal`은 공개하지 않는다 — `PopoverContent`가 각자 Portal을 감싸므로 소비처가 조립할 자리가 아니다(#172, ADR-0018). 포탈 대상을 고르는 경로가 필요해지면 노드가 아니라 `PopoverContent`의 prop으로 온다.\n\n**머리말 셋은 소비처가 조립하므로 anatomy다**(#166, ADR-0018). `PopoverPortal`과 갈리는 자리가 여기다 — Portal은 `PopoverContent`가 자동으로 감싸 소비처가 쓸 자리가 없지만, 셋은 소비처가 `PopoverContent` 안에 직접 넣어야만 존재한다. 셋 다 선택적이고 서로를 요구하지 않는다: `PopoverHeader`는 제목과 설명을 세로로 묶는 그릇일 뿐이라 한 조각만 쓰는 표면은 그릇 없이 그 조각만 쓴다. 그래서 anatomy 표기는 셋 다 `?`이고, 필수로 올리면 오늘 발행된 인스턴스가 계약 위반이 된다.\n\n**Dialog의 클래스를 공유하지 않고 복제한다.** #91의 소비가 성립하려면 원본을 실제로 렌더할 수 있어야 하는데(`InputGroupTextarea`가 `Textarea`를 렌더하는 자리, #170) `DialogTitle`은 `DialogPrimitive.Title`이라 Popover 안에서 렌더하면 Radix가 자기 스코프 컨텍스트를 찾지 못한다 — Radix `Popover`에는 `Title`도 `Description`도 없다. 그리고 #168이 보탠 두 번째 질문에도 걸린다: 원본이 지고 있는 계약이 없는 표면을 소비하면 이 표면을 정의하는 유일한 선언이 `popover` 매니페스트 밖에 남는다. **갈림선은 조합이냐 같은 역할이냐가 아니라 ⓐ 원본을 그대로 렌더할 수 있는가와 ⓑ 원본이 질 계약이 있는가다** — 여기는 둘 다 아니라 복제가 남는 유일한 길이고, 맨 클래스 문자열을 공유하는 선례가 카탈로그에 하나도 없는 것과도 같다(#154). Dialog·Sheet·AlertDialog 셋이 이미 서로 복제한 자리다.\n\n**값은 제목만 Dialog와 갈린다.** 제목은 upstream `.cn-popover-title`의 `text-sm font-medium`을 그대로 집는다 — `w-72 p-4` 표면에 Dialog의 `text-lg font-semibold`는 과하고, 그 단은 `ProgressLabel`·`ListRowTitle`·Calendar 캡션이 이미 서 있는 카탈로그의 단이라 새 값이 아니다. 설명은 upstream의 `text-muted-foreground text-xs/relaxed`가 아니라 카탈로그의 유일한 설명 단인 `text-sm text-muted-foreground`다(Dialog·Sheet·AlertDialog·Card가 같은 선언이고, 이 컴포넌트의 참조 시안이 이미 손으로 그 클래스를 적고 있었다) — `/relaxed`는 어느 계약도 쓰지 않는 새 행간이라 실측 수요 없이 들이지 않는다(#168·#164가 값이 아니라 차이를 옮긴 것과 같다). 머리말은 `flex flex-col gap-1`이고 Dialog의 `text-center sm:text-left`를 가져오지 않는다 — 그 정렬은 작은 화면에서 폭을 다 쓰는 모달의 결정이고 앵커에 붙는 288px 표면은 그런 상태가 없다. upstream 머리말의 `text-xs`도 가져오지 않는다: 두 자식이 각자 자기 단을 선언하므로 그것이 고르는 것은 소비처가 머리말에 더 넣은 노드뿐이다.\n\n**표면의 접근 가능한 이름은 `PopoverTitle`이 지고 배선은 계약이 진다.** Radix `Popover.Content`는 `role=\"dialog\"`를 내면서 `aria-labelledby`·`aria-describedby`를 배선하지 않는다(1.1.23 소스가 내는 aria는 트리거의 `aria-controls`·`aria-expanded`·`aria-haspopup`뿐이다) — 즉 이 표면은 지금까지 **이름 없는 dialog**였다. `Dialog.Content`가 `titlePresent`/`descriptionPresent`로 하는 조건부 배선을 같은 모양으로 여기서 낸다: `PopoverTitle`·`PopoverDescription`이 마운트된 동안에만 속성이 붙고, 없으면 붙지 않는다(무조건 id를 거는 `CommandGroup` 쪽 답은 제목이 선택적인 이 표면에서 존재하지 않는 id를 가리키는 참조가 되고 axe가 그것을 본다). 소비처가 `aria-label`을 직접 주면 우리 `aria-labelledby`는 서지 않고, `aria-labelledby`를 직접 주면 뒤의 전개가 이긴다 — **이름의 정본은 언제나 하나다.** 제목이 `<div>`이고 heading이 아닌 것도 결정이다: 앵커에 붙는 인라인 표면이 페이지의 제목 개요에 자기 층위를 밀어 넣을 근거가 없고 어느 층위인지는 소비처의 문서 구조가 안다. 이름은 heading 시맨틱이 아니라 `aria-labelledby`가 지므로 잃는 것이 없고, heading으로 읽혀야 하는 소비처는 `children`으로 자기 heading을 넣는다.\n\n**`parts`를 이 세대가 신설했다**(#166, #155 모집단 9 → 8). 새로 등록된 셋의 클래스에서 #154가 `DropdownMenuSeparator`에서 잡은 계열 위반(`--ds-border-default`가 `background-color`에 오는 자리)은 나오지 않았다 — 셋 다 타이포그래피와 레이아웃이고 색은 `text-muted-foreground` 하나뿐이라 전경 이름이 전경 속성에 온다. 루트의 클래스는 `parts` 없이도 이미 매니페스트에 닿아 있었으므로(`config`·`className`이 루트 셀을 낸다) 이 신설로 처음 드러난 기존 셀은 없다. **그리고 여기서 새 비대칭이 하나 열린 채로 남는다**: `dialog`·`sheet`·`alert-dialog` 셋은 오늘도 `parts`가 없어 같은 역할의 Header·Title·Description이 어느 매니페스트에도 닿은 적이 없다. 이제 popover의 셋만 파생 채널에 실리고 Dialog 쪽 셋은 실리지 않는다 — 사실로 여기 남기되 이 계약이 고칠 자리가 아니고 그 셋의 `parts`는 #155의 몫이다(#165 규칙 1: 로스터를 손으로 넓히지 않는다). 새 토큰 0개이고 호환성은 **additive** — 기존 네 표면의 클래스·축·구성 상태가 한 줄도 움직이지 않았고, 새 파트도 새 aria 속성도 소비처가 셋을 렌더하기 전에는 나타나지 않는다." } },
} as const

export { Popover, PopoverTrigger, PopoverAnchor, PopoverContent, PopoverHeader, PopoverTitle, PopoverDescription, popoverVariants, popoverVariantsConfig, componentContract }
