import * as React from "react"
import { Menubar as MenubarPrimitive } from "radix-ui"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

/* 지속적으로 보이는 막대 위의 **명령 메뉴**. shadcn 원본을 제자리에서 편집한다.
 *
 * ── 왜 Dropdown Menu와 별도 컴포넌트인가 ────────────────────────────────────
 * #119(로스터 재판정)가 둘을 가른 근거는 anatomy다 — Menubar는 `CheckboxItem`·
 * `RadioItem`·`Sub`를 갖는 명령 메뉴이고 Dropdown Menu는 한 진입점에 달린 행 메뉴다.
 * 그 근거는 **구현이 실제로 그 셋을 공개할 때만** 성립한다. 열지 않으면 남는 차이가
 * "트리거가 여럿이다"뿐이고, 그건 #97이 닫은 자리(동작 차이)에 가까워진다. 그래서
 * 세 파트를 전부 공개 anatomy로 낸다.
 *
 * ── Dropdown Menu와의 비대칭은 남긴다 ───────────────────────────────────────
 * 우리 Dropdown Menu는 `CheckboxItem`·`RadioItem`·`Sub`를 공개하지 않는다(upstream은
 * 한다). 여기서 그쪽을 함께 여는 선택지가 있었고 열지 않는다. 이유는 둘이다:
 *   1. 여는 순간 #119가 두 컴포넌트를 갈라 세운 근거가 사라진다. 판정을 실행하는
 *      티켓이 판정의 전제를 지우면 안 된다.
 *   2. Dropdown Menu는 **이미 완성된 43개**의 하나이고, 거기에 anatomy를 더하는 것은
 *      #121(미계약 표면 재판정)이 승격 8건을 이 맵 밖으로 보낸 것과 정확히 같은
 *      성질의 일이다(기존 43개 재개방 + 두 관문 재판정). 같은 근거를 한쪽에만
 *      적용하면 경계가 자의적이 된다.
 * 다만 **Dropdown Menu의 그 세 표면은 #121의 전수 대조에 등장한 적이 없다** — 종류
 * ②("upstream에 있고 우리 계약에 없음")인데 14개 목록에 없었다. 근거가 있었는지부터
 * 확인해야 하는 자리라는 뜻이므로, 양쪽 `limits`에 확인된 공백으로 적어 다음 재조회가
 * 이 자리를 처음 보는 것처럼 발견하지 않게 한다.
 *
 * ── 구성 상태 ───────────────────────────────────────────────────────────────
 * **"어느 메뉴가 열려 있는가"는 구성 상태가 아니다.** Radix 루트의 `value`는 소비처가
 * 지은 메뉴 이름 문자열이고, 값 집합이 소비처마다 다르므로 파생 채널이 고를 수 있는
 * 열거가 되지 않는다 — Resizable의 패널 크기가 연속값이라 조합으로 나오지 않은 것과
 * 같은 자리다. 실려야 하는 것은 **한 메뉴의 열림 여부**(`open`)와 **체크·라디오 항목의
 * 선택 여부**(`checked`)이고 둘 다 유한한 의미 상태다.
 * "막대 전체에서 동시에 하나만 열린다"는 것은 상태가 아니라 루트가 단일 `value`로
 * 보증하는 **불변식**이다. 축으로 두면 존재하지 않는 조합(둘이 동시에 열린 칸)이
 * Figma에 생긴다.
 *
 * ── 접근성 ──────────────────────────────────────────────────────────────────
 * 막대 안 좌우 화살표 이동·typeahead·열린 메뉴 사이의 건너뛰기는 Radix의
 * RovingFocusGroup이 준다. 열림 상태 통지도 primitive가 진다(트리거의
 * `aria-haspopup="menu"`·`aria-expanded`·`aria-controls`). 남는 하나가 **막대 자체의
 * 접근 가능한 이름**이라 `aria-label`을 필수 prop으로 받는다 — Sidebar와 같은 근거로,
 * 한 화면에 명령 막대가 둘일 수 있고 `role="menubar"`에는 기본 이름이 없다.
 * `aria-current`는 여기 없다: 이 막대는 명령을 실행하지 화면을 이동하지 않는다 —
 * 현재 위치 계약(#92)이 걸리는 자리는 Navigation Menu다.
 *
 * ── 두 필드를 두지 않는다 ───────────────────────────────────────────────────
 *   - `gestures` — Radix Menubar에 스와이프가 없다. 물려받는 dismiss 제스처가 없으므로
 *     선언할 것도 없다(ADR-0005).
 *   - `externalSurfaces` — 서드파티가 스스로 만드는 노드가 없다. Portal은 자리만
 *     옮기고 클래스를 내는 노드는 전부 우리 것이다(#122).
 *
 * ── 원본에서 바꾼 것 ────────────────────────────────────────────────────────
 *   - `hover:bg-accent`·`data-[state=open]:bg-accent`를 state layer로 바꿨다. 열린
 *     트리거는 불투명도 트릭이 아니라 **base 교체**다(sidebar.tsx와 같은 형태).
 *   - `lucide-react`를 쓰지 않는다 — 화살표·체크·점은 인라인 SVG다(accordion.tsx).
 *   - 구분선을 `bg-border`가 아니라 `border-t`로 그린다. `--ds-border-default`가
 *     `background-color`에 오면 게이트가 문다(resizable.tsx가 이미 같은 답을 냈다).
 *   - `MenubarShortcut`을 열지 않는다. #123(Kbd)이 `CommandShortcut` 자리를 닫으며
 *     세운 판정과 같다 — 소비처가 `Kbd`를 `ml-auto`로 놓으면 같은 결과다. */

const menubarVariantsConfig = { variants: {}, defaultVariants: {} } as const
const menubarVariants = cva("flex h-9 w-fit items-center gap-1 rounded-md border bg-background p-1 shadow-xs", menubarVariantsConfig)

const TRIGGER = "state [--ds-state-base:var(--background)] data-[state=open]:[--ds-state-base:var(--accent)] flex select-none items-center rounded-sm px-2 py-1 text-sm font-medium outline-none focus-visible:border-focus-contrast focus-visible:ring-[3px] focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
const CONTENT = "z-50 min-w-48 rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
const ITEM = "state [--ds-state-base:var(--popover)] relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
/* 체크·라디오 항목은 표식이 앉는 왼쪽 칸만큼 들여 쓴다. 표식 자체는 항목 안의
 * `ItemIndicator`이고 자기 클래스가 없다 — 켜졌을 때만 나타나는 글리프라 정적 시안이
 * 그리는 것은 `checked` 구성 상태이지 별도 노드가 아니다. */
const INDICATOR_ITEM = "state [--ds-state-base:var(--popover)] relative flex cursor-default select-none items-center rounded-sm py-1.5 pr-2 pl-8 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
const LABEL = "px-2 py-1.5 text-xs font-medium text-muted-foreground"
const SEPARATOR = "-mx-1 my-1 h-0 border-t"
const SUB_TRIGGER = "state [--ds-state-base:var(--popover)] data-[state=open]:[--ds-state-base:var(--accent)] relative flex cursor-default select-none items-center justify-between gap-4 rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50"

function Menubar({ className, ...props }: React.ComponentProps<typeof MenubarPrimitive.Root> & { "aria-label": string }) {
  return <MenubarPrimitive.Root data-slot="menubar" className={cn(menubarVariants({ className }))} {...props} />
}

/** 막대 위의 메뉴 하나. 클래스가 없는 묶음 노드이고 `value`로 열린 메뉴를 가리킨다. */
function MenubarMenu(props: React.ComponentProps<typeof MenubarPrimitive.Menu>) {
  return <MenubarPrimitive.Menu {...props} />
}

function MenubarTrigger({ className, ...props }: React.ComponentProps<typeof MenubarPrimitive.Trigger>) {
  return <MenubarPrimitive.Trigger data-slot="menubar-trigger" className={cn(TRIGGER, className)} {...props} />
}

function MenubarContent({ className, align = "start", sideOffset = 6, ...props }: React.ComponentProps<typeof MenubarPrimitive.Content>) {
  return <MenubarPrimitive.Portal><MenubarPrimitive.Content data-slot="menubar-content" align={align} sideOffset={sideOffset} className={cn(CONTENT, className)} {...props} /></MenubarPrimitive.Portal>
}

function MenubarGroup(props: React.ComponentProps<typeof MenubarPrimitive.Group>) {
  return <MenubarPrimitive.Group data-slot="menubar-group" {...props} />
}

function MenubarLabel({ className, ...props }: React.ComponentProps<typeof MenubarPrimitive.Label>) {
  return <MenubarPrimitive.Label data-slot="menubar-label" className={cn(LABEL, className)} {...props} />
}

function MenubarItem({ className, ...props }: React.ComponentProps<typeof MenubarPrimitive.Item>) {
  return <MenubarPrimitive.Item data-slot="menubar-item" className={cn(ITEM, className)} {...props} />
}

function MenubarCheckboxItem({ className, children, ...props }: React.ComponentProps<typeof MenubarPrimitive.CheckboxItem>) {
  return <MenubarPrimitive.CheckboxItem data-slot="menubar-checkbox-item" className={cn(INDICATOR_ITEM, className)} {...props}>
    <MenubarPrimitive.ItemIndicator className="absolute left-2 flex size-4 items-center justify-center">
      <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4"><path d="m3.5 8.5 3 3 6-7" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"/></svg>
    </MenubarPrimitive.ItemIndicator>
    {children}
  </MenubarPrimitive.CheckboxItem>
}

function MenubarRadioGroup(props: React.ComponentProps<typeof MenubarPrimitive.RadioGroup>) {
  return <MenubarPrimitive.RadioGroup data-slot="menubar-radio-group" {...props} />
}

function MenubarRadioItem({ className, children, ...props }: React.ComponentProps<typeof MenubarPrimitive.RadioItem>) {
  return <MenubarPrimitive.RadioItem data-slot="menubar-radio-item" className={cn(INDICATOR_ITEM, className)} {...props}>
    <MenubarPrimitive.ItemIndicator className="absolute left-2 flex size-4 items-center justify-center">
      <svg aria-hidden="true" viewBox="0 0 16 16" className="size-2"><circle cx="8" cy="8" r="8" fill="currentColor"/></svg>
    </MenubarPrimitive.ItemIndicator>
    {children}
  </MenubarPrimitive.RadioItem>
}

function MenubarSeparator({ className, ...props }: React.ComponentProps<typeof MenubarPrimitive.Separator>) {
  return <MenubarPrimitive.Separator data-slot="menubar-separator" className={cn(SEPARATOR, className)} {...props} />
}

/** 항목 안에서 다시 열리는 메뉴. 클래스가 없는 묶음 노드다. */
function MenubarSub(props: React.ComponentProps<typeof MenubarPrimitive.Sub>) {
  return <MenubarPrimitive.Sub {...props} />
}

function MenubarSubTrigger({ className, children, ...props }: React.ComponentProps<typeof MenubarPrimitive.SubTrigger>) {
  return <MenubarPrimitive.SubTrigger data-slot="menubar-sub-trigger" className={cn(SUB_TRIGGER, className)} {...props}>
    {children}
    <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4 shrink-0"><path d="m6 3 5 5-5 5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"/></svg>
  </MenubarPrimitive.SubTrigger>
}

function MenubarSubContent({ className, ...props }: React.ComponentProps<typeof MenubarPrimitive.SubContent>) {
  return <MenubarPrimitive.Portal><MenubarPrimitive.SubContent data-slot="menubar-sub-content" className={cn(CONTENT, className)} {...props} /></MenubarPrimitive.Portal>
}

const staticPart = (className: string) => ({
  config: { variants: {}, defaultVariants: {} } as const,
  className: () => className,
})

const componentContract = {
  name: "menubar", source: "src/components/ui/menubar.tsx",
  publicExports: ["Menubar", "MenubarMenu", "MenubarTrigger", "MenubarContent", "MenubarGroup", "MenubarLabel", "MenubarItem", "MenubarCheckboxItem", "MenubarRadioGroup", "MenubarRadioItem", "MenubarSeparator", "MenubarSub", "MenubarSubTrigger", "MenubarSubContent", "menubarVariants", "menubarVariantsConfig"],
  config: menubarVariantsConfig, className: (props: Record<string, string>) => cn(menubarVariants(props)),
  anatomy: ["Menubar", "MenubarMenu*", "MenubarTrigger", "MenubarContent", "MenubarGroup*", "MenubarLabel?", "MenubarItem*", "MenubarCheckboxItem*", "MenubarRadioGroup?", "MenubarRadioItem*", "MenubarSeparator?", "MenubarSub?", "MenubarSubTrigger", "MenubarSubContent"],
  configurationStates: { open: ["closed", "open"], checked: ["unchecked", "checked"] },
  parts: {
    MenubarTrigger: staticPart(TRIGGER),
    MenubarContent: staticPart(CONTENT),
    MenubarLabel: staticPart(LABEL),
    MenubarItem: staticPart(ITEM),
    MenubarCheckboxItem: staticPart(INDICATOR_ITEM),
    MenubarRadioItem: staticPart(INDICATOR_ITEM),
    MenubarSeparator: staticPart(SEPARATOR),
    MenubarSubTrigger: staticPart(SUB_TRIGGER),
    MenubarSubContent: staticPart(CONTENT),
  },
  reference: { example: "menubar", guidance: { use: "화면에 계속 떠 있는 가로 막대에 명령 메뉴 여러 개를 나란히 두고, 그 안에서 실행·전환·설정 항목을 묶는다. 켜고 끄는 항목은 `MenubarCheckboxItem`, 배타 선택은 `MenubarRadioGroup`, 더 깊은 묶음은 `MenubarSub`가 진다.", evidence: "투자 기록 화면은 거래 추가·가져오기·내보내기 같은 실행 명령과 열 표시·정렬 같은 보기 설정을 항상 같은 자리에서 꺼내야 하고, 그 진입점이 행마다 따라다니는 메뉴와 달리 화면 상단에 고정돼 있어야 한다.", limits: "화면을 이동하는 사이트 탐색에는 쓰지 않는다 — 이 막대의 항목은 명령이라 `aria-current`도 URL도 갖지 않으며, 그 자리는 Navigation Menu다. 진입점이 하나뿐인 행·캔버스 메뉴에도 쓰지 않는다: 그건 Dropdown Menu이고 우클릭으로 여는 경우까지 그쪽이 덮는다(#126). Tabs와도 갈린다 — Tabs는 같은 화면 안에서 패널을 갈아 끼우지만 이 막대는 패널을 소유하지 않고 항목이 명령이다. 어느 메뉴가 열려 있는지는 계약하지 않는다: 루트의 `value`는 소비처가 지은 이름이라 값 집합이 소비처마다 달라 파생 채널이 고를 열거가 되지 않으며, 동시에 하나만 열린다는 것은 축이 아니라 루트가 보증하는 불변식이다. `MenubarShortcut`을 파트로 열지 않는다 — #123이 `CommandShortcut` 자리를 닫은 것과 같은 근거이고, 소비처가 `Kbd`를 `ml-auto`로 놓으면 같은 결과다. 막대의 접근 가능한 이름은 소비처가 `aria-label`로 준다. 체크·라디오 표식(`ItemIndicator`)도 파트로 열지 않는다 — 켜졌을 때만 나타나는 글리프라 정적 시안이 그리는 것은 `checked` 구성 상태이지 별도 노드가 아니며, 껍데기를 노드로 세우면 두 항목이 같은 클래스를 갖게 되어 파생 채널이 가르지 못한다(Select의 `ItemIndicator`와 같은 자리다). 같은 이유로 `MenubarCheckboxItem`과 `MenubarRadioItem`의 조합 스타일은 서로 같다 — 둘을 가르는 것은 역할과 표식이지 면이 아니다. Dropdown Menu가 `CheckboxItem`·`RadioItem`·`Sub`를 공개하지 않는 비대칭은 남긴다 — 함께 열면 #119가 두 컴포넌트를 갈라 세운 anatomy 근거가 사라지고, Dropdown Menu에 파트를 더하는 것은 이미 완성된 43개를 다시 여는 일이라 #121이 승격 8건을 이 맵 밖에 둔 것과 같은 성질이다. 다만 그 세 표면은 #121의 전수 대조 목록에 없었으므로 근거가 있었는지부터 확인해야 하는 확인된 공백으로 남긴다." } },
} as const

export { Menubar, MenubarMenu, MenubarTrigger, MenubarContent, MenubarGroup, MenubarLabel, MenubarItem, MenubarCheckboxItem, MenubarRadioGroup, MenubarRadioItem, MenubarSeparator, MenubarSub, MenubarSubTrigger, MenubarSubContent, menubarVariants, menubarVariantsConfig, componentContract }
