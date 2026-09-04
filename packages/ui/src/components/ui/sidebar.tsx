import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Separator } from "./separator"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "./sheet"

/* 애플리케이션 셸의 세로 탐색 표면. shadcn 원본을 감싸지 않고 제자리에서 편집한다.
 *
 * ── 토큰 ────────────────────────────────────────────────────────────────────
 * `--sidebar-*` 여덟은 이미 alias 계층에 있고(#119 재판정, `tokens/alias/shadcn.json`)
 * 이 티켓은 토큰을 하나도 건드리지 않는다. 매핑 중 둘은 upstream의 **값**과 갈리는데
 * 의도된 것이라 여기 적어 둔다 — 다음 재조회가 결함으로 다시 발견하지 않도록:
 *   - `--sidebar-primary` → `bg.accent.solid`. upstream은 라이트 `oklch(0.205 0 0)`(거의
 *     검정) · 다크 `oklch(0.488 0.243 264.376)`(파랑)으로 **자기들끼리 어긋나** 있다.
 *     upstream의 의도는 "= `--primary`"이고 우리 `primary` alias가 이미 `bg.accent.solid`를
 *     가리키므로, 같은 곳을 가리키는 것이 우리 표에서 유일하게 일관된 선택이다.
 *   - `--sidebar-ring` → `border.focus`. upstream의 링은 중립 회색이지만 우리 `ring`은
 *     시스템 전역에서 브랜드다. 사이드바만 다른 포커스 링을 갖게 할 근거가 없다.
 *
 * ── 원본에서 바꾼 것 ────────────────────────────────────────────────────────
 *   - hover/active의 `hover:bg-sidebar-accent` → state layer(`state` 유틸리티). 활성 행은
 *     불투명도 트릭이 아니라 **base 교체**다(item.tsx와 같은 형태):
 *     `[--ds-state-base:var(--sidebar)]` → `data-[active=true]:[--ds-state-base:var(--sidebar-accent)]`
 *   - focus 링을 두 겹으로 분리한다(#43, #54). `ring-sidebar-ring`에 불투명도를 붙이지
 *     않는다 — 상태 테두리는 토큰을 원색으로 칠한다(semantic-tokens.md §8).
 *   - `lucide-react`를 쓰지 않는다. `@massive/ui`의 런타임 의존성이 아니고, 아이콘은
 *     accordion.tsx처럼 인라인 SVG로 그린다.
 *   - `md:` breakpoint 클래스를 전부 뺐다. 아래 **breakpoint** 절을 볼 것 — 폭 판정이
 *     소비처의 것이면 클래스로 다시 굳히면 안 된다.
 *
 * ── 계약 밖으로 뺀 것 ──────────────────────────────────────────────────────
 *   - **쿠키 영속화와 `Cmd/Ctrl+B`**. 둘 다 동작이라 파생 채널이 나르지 않는다(#97).
 *     Radix Toast의 스와이프처럼 **저절로 따라오는** 상속 표면이 아니라 우리가 직접
 *     타이핑해야 생기는 것이므로 ADR 0005의 선언 대상도 아니다. `defaultOpen`·`open`·
 *     `onOpenChange`를 열어 두고 소비처가 배선한다.
 *   - **breakpoint 판정**. `SidebarProvider`가 `isMobile`을 받는다(기본 `false`).
 *     `list-row`의 `limits`가 *"투자 도메인과 breakpoint 전환을 내장하지 않는다"*고 이미
 *     선을 그었고, 여기서 768px을 상수로 굳히면 아무도 판정한 적 없는 시스템 상수가
 *     조용히 생긴다.
 *   - **`collapsible: "none"`**. 렌더 결과가 `offcanvas`+expanded와 구분되지 않아 #97이
 *     값 층위에서 그대로 걸린다. 소비처는 `SidebarTrigger`·`SidebarRail`을 렌더하지
 *     않으면 같은 결과를 얻는다.
 *   - **`SidebarMenuButton`의 `outline` variant**. 아래 `sidebarMenuButtonVariants` 주석.
 *   - **`SidebarInput`·`SidebarMenuSkeleton`**. 파트로 열지 않는다 — 앞은 Input에
 *     유틸리티 두 줄을 얹은 것이라 파생 채널이 구분하지 못하고, 뒤는 폭이 난수라 참조
 *     스토리가 결정적이지 않다. 소비처가 Input·Skeleton을 직접 조립한다. 접힌 상태의
 *     메뉴 버튼에 레이블을 보충해야 하면 Tooltip을 소비처가 감싼다.
 *   - **`gestures` 필드**. upstream Sidebar에는 스와이프가 없다(원본 726줄에 swipe·drag·
 *     touch 0건). 모바일 분기는 Radix Dialog이고 스와이프를 갖는 것은 Radix Toast뿐이다.
 *     물려받은 제스처가 없으므로 선언할 것도 없다. off-canvas 열고 닫기는 트리거·rail·
 *     키보드로만 한다 — 나중에 스와이프를 붙인다면 표면이 사라지는 dismiss 제스처이므로
 *     ADR 0005의 존재·시각 피드백·접근성 동등 경로를 함께 계약해야 한다.
 *
 * ── `useSidebar`를 공개하는 판단 ────────────────────────────────────────────
 * 소문자라 "공개 컴포넌트는 anatomy에 있어야 한다"는 게이트(#121)를 **조용히 통과한다.**
 * 게이트가 못 보는 자리이므로 의식적으로 적어 둔다: 공개한다. 접힌 상태에서 레이블을
 * 감추거나 자기 트리거를 만들려면 소비처가 `state`를 읽어야 하고, 그 통로가 없으면
 * 소비처가 컨텍스트를 다시 만들면서 우리 상태 축을 복제한다. `buttonVariants`처럼
 * 파생 채널이 나르지 않는 공개 항목이며 anatomy에 자리가 없는 것이 정상이다.
 *
 * ── 이름 공간 주의 ─────────────────────────────────────────────────────────
 * `--sidebar-width`·`--sidebar-width-icon`은 **토큰이 아니라** 인라인 레이아웃 변수다.
 * alias 색 여덟과 접두사를 공유하지만 겹치는 이름이 없고 `--ds-*`도 아니다. 소비처가
 * 이미 아는 upstream 이름이라 그대로 둔다. */

const SIDEBAR_WIDTH = "16rem"
const SIDEBAR_WIDTH_MOBILE = "18rem"
const SIDEBAR_WIDTH_ICON = "3rem"

type SidebarContextValue = {
  /* 축 이름이 `open`이 아니라 `state`인 것은 카탈로그의 관례에서 벗어난다 — Sheet·
   * Popover·Select은 전부 `open: closed|open`이다. upstream의 `data-state`와
   * `useSidebar().state`가 expanded/collapsed이고 이 축을 읽는 CSS가 그 이름으로
   * 쓰이므로, 두 이름을 병행하는 대신 upstream 이름을 따른다. */
  state: "expanded" | "collapsed"
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
  sidebarId: string
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) throw new Error("useSidebar는 SidebarProvider 안에서만 쓸 수 있다.")
  return context
}

function SidebarProvider({ className, style, defaultOpen = true, open: openProp, onOpenChange, isMobile = false, ...props }: React.ComponentProps<"div"> & {
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  isMobile?: boolean
}) {
  const [openState, setOpenState] = React.useState(defaultOpen)
  const [openMobile, setOpenMobile] = React.useState(false)
  const open = openProp ?? openState
  const sidebarId = React.useId()

  const setOpen = React.useCallback((value: boolean) => {
    if (onOpenChange) onOpenChange(value)
    else setOpenState(value)
  }, [onOpenChange])

  const toggleSidebar = React.useCallback(() => {
    if (isMobile) setOpenMobile((previous) => !previous)
    else setOpen(!open)
  }, [isMobile, open, setOpen])

  const value = React.useMemo<SidebarContextValue>(() => ({
    state: open ? "expanded" : "collapsed", open, setOpen, openMobile, setOpenMobile, isMobile, toggleSidebar, sidebarId,
  }), [open, setOpen, openMobile, isMobile, toggleSidebar, sidebarId])

  return <SidebarContext.Provider value={value}>
    <div
      data-slot="sidebar-wrapper"
      style={{ "--sidebar-width": SIDEBAR_WIDTH, "--sidebar-width-icon": SIDEBAR_WIDTH_ICON, ...style } as React.CSSProperties}
      className={cn("flex min-h-svh w-full", className)}
      {...props}
    />
  </SidebarContext.Provider>
}

/* 계약의 root는 **보이는 패널**(sidebar-container)이다. 바깥 wrapper는 흐름에서 자리만
 * 차지하는 스페이서라 축이 없고, upstream이 따로 두던 sidebar-gap 노드는 wrapper가
 * 겸하게 해 노드를 하나 줄였다. `variant`는 패널의 형태만, `collapsible`은 접혔을 때의
 * 폭만 정하고 열림 상태는 소비처가 소유한다. */
const sidebarVariantsConfig = {
  variants: {
    side: {
      left: "left-0 data-[variant=sidebar]:border-r",
      right: "right-0 data-[variant=sidebar]:border-l",
    },
    variant: { sidebar: "", floating: "p-2", inset: "p-2" },
    collapsible: {
      offcanvas: "data-[state=collapsed]:data-[side=left]:left-[calc(var(--sidebar-width)*-1)] data-[state=collapsed]:data-[side=right]:right-[calc(var(--sidebar-width)*-1)]",
      icon: "data-[state=collapsed]:w-(--sidebar-width-icon)",
    },
  },
  defaultVariants: { side: "left", variant: "sidebar", collapsible: "offcanvas" },
} as const
const sidebarVariants = cva("fixed inset-y-0 z-10 flex h-svh w-(--sidebar-width) border-sidebar-border transition-[left,right,width] duration-200 ease-linear", sidebarVariantsConfig)
type SidebarStyleProps = VariantProps<typeof sidebarVariants>

const sidebarInnerClassName = "flex h-full w-full flex-col bg-sidebar text-sidebar-foreground data-[variant=floating]:rounded-lg data-[variant=floating]:border data-[variant=floating]:border-sidebar-border data-[variant=floating]:shadow-sm"

function Sidebar({ className, children, side = "left", variant = "sidebar", collapsible = "offcanvas", ...props }: React.ComponentProps<"div"> & SidebarStyleProps & { "aria-label": string }) {
  const { state, openMobile, setOpenMobile, isMobile, sidebarId } = useSidebar()
  const label = props["aria-label"]

  /* 랜드마크는 upstream에 없다 — 원본의 root는 role 없는 `div`이고 `<nav>`도 없다.
   * 소비처가 스스로 붙이면 우리 조립 결정을 복제하므로 우리가 진다(#121 관문 ⓑ).
   * 이름은 소비처가 준다 — 앱에 사이드바가 둘일 수 있다. */
  const inner = <nav id={sidebarId} data-slot="sidebar-inner" data-variant={variant} aria-label={label} className={sidebarInnerClassName}>{children}</nav>

  if (isMobile) {
    return <Sheet open={openMobile} onOpenChange={setOpenMobile}>
      {/* 우리 Sheet의 limits가 SheetTitle 생략을 금지한다. 사이드바에는 보이는 제목이
        * 없으므로 sr-only 헤더가 선택이 아니라 필수다. */}
      <SheetContent data-slot="sidebar" data-mobile="true" side={side} style={{ "--sidebar-width": SIDEBAR_WIDTH_MOBILE } as React.CSSProperties} className={cn("w-(--sidebar-width) bg-sidebar p-0 text-sidebar-foreground", className)}>
        <SheetHeader className="sr-only"><SheetTitle>{label}</SheetTitle><SheetDescription>모바일 폭에서 열리는 사이드바입니다.</SheetDescription></SheetHeader>
        {inner}
      </SheetContent>
    </Sheet>
  }

  return <div data-slot="sidebar" data-state={state} data-side={side} data-variant={variant} data-collapsible={collapsible} className="relative block w-(--sidebar-width) shrink-0 bg-transparent transition-[width] duration-200 ease-linear data-[state=collapsed]:data-[collapsible=offcanvas]:w-0 data-[state=collapsed]:data-[collapsible=icon]:w-(--sidebar-width-icon)">
    {/* 접혀서 화면 밖으로 나간 off-canvas 하위 트리는 DOM에 남아 **탭 순서에 계속
      * 잡힌다** — upstream의 실제 결함이다. inert로 걷어낸다. icon 모드는 여전히
      * 보이므로 걷어내지 않는다. */}
    <div
      data-slot="sidebar-container"
      data-state={state}
      data-side={side}
      data-variant={variant}
      inert={state === "collapsed" && collapsible === "offcanvas" ? true : undefined}
      className={cn(sidebarVariants({ side, variant, collapsible, className }))}
      {...props}
    >{inner}</div>
  </div>
}

function SidebarTrigger({ className, onClick, ...props }: React.ComponentProps<"button">) {
  const { toggleSidebar, open, openMobile, isMobile, sidebarId } = useSidebar()
  /* upstream은 aria-expanded도 aria-controls도 주지 않아 토글이 아무것도 통지하지
   * 못한다. 열림 상태 통지는 계약이 진다. */
  return <button
    type="button"
    data-slot="sidebar-trigger"
    aria-controls={sidebarId}
    aria-expanded={isMobile ? openMobile : open}
    onClick={(event) => { onClick?.(event); toggleSidebar() }}
    className={cn("state [--ds-state-base:var(--sidebar)] inline-flex size-8 shrink-0 items-center justify-center rounded-md text-sidebar-foreground outline-none transition-all focus-visible:border-focus-contrast focus-visible:ring-[3px] focus-visible:ring-sidebar-ring disabled:pointer-events-none disabled:opacity-50", className)}
    {...props}
  >
    <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4 shrink-0"><rect x="1.75" y="2.75" width="12.5" height="10.5" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5"/><path d="M6.25 2.75v10.5" stroke="currentColor" strokeWidth="1.5"/></svg>
    <span className="sr-only">사이드바 전환</span>
  </button>
}

/* rail은 포인터 전용 확대 타겟이다(tabIndex -1). 키보드 동등 경로는 SidebarTrigger이고,
 * 둘 다 같은 toggleSidebar를 부르므로 rail이 키보드에서 빠져도 기능이 사라지지 않는다.
 *
 * 히트 영역  가로 16px(`w-4`)만 미달이고 세로는 사이드바 전체 높이라 이미 24를
 * 넘는다 — `after:`가 이미 hover 강조선(`w-[2px]`)을 그리고 있어 확장을 얹으면
 * 강조선이 24px로 넓어져 시각이 움직이므로, 대신 `before:`로 가로만 중심 대칭
 * ±4px 넓힌다(#111 결정 2·4·5, #230, [#231] 예외 목록의 "예외 아님" 판정). 이미
 * `absolute`가 걸려 있어 `relative`를 더하지 않는다.
 *
 * `before:`의 계산된 크기는 24px다(`getComputedStyle`로 확인). 그런데 참조 스토리의
 * `side:left` 변형에서는 실측 히트 폭이 12~21px로 덜 나온다 — `side:right`에서는
 * 24px로 정확히 읽힌다. 원인은 CSS가 아니라 **`SidebarInset`(본문)이 확장된 히트
 * 영역과 같은 좌표에서 옆에 붙어 있는 것**이다 — Kbd 스토리의 툴팁이 이웃 Button을
 * 가린 것과 같은 종류의 참조 스토리 겹침(`docs/research/pointer-targets-2026-09.md`
 * §4.3)이라 여기서 풀지 않고 선언한다(#111 결정 5). 소비처의 실제 레이아웃에서
 * `SidebarInset`에 무엇을 넣는지에 따라 겹침 여부가 갈린다. */
function SidebarRail({ className, ...props }: React.ComponentProps<"button">) {
  const { toggleSidebar } = useSidebar()
  return <button type="button" data-slot="sidebar-rail" tabIndex={-1} aria-hidden="true" onClick={toggleSidebar} className={cn("absolute inset-y-0 z-20 w-4 -translate-x-1/2 transition-all ease-linear before:absolute before:inset-y-0 before:-inset-x-1 after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] hover:after:bg-sidebar-border", className)} {...props} />
}

/* upstream은 `<main>`으로 렌더한다. 우리는 `<div>`다.
 *
 * 페이지 랜드마크는 **소비처의 페이지 구조**이지 컴포넌트 라이브러리가 정할 것이 아니다. 셸이
 * 이미 `<main>`을 가진 문서 안에 놓이는 순간 랜드마크가 둘이 되고, 그건 가정이 아니라 우리
 * 카탈로그에서 실제로 났다 — 참조 페이지가 `<main>`으로 감싸고 있어 axe가 세 규칙
 * (`landmark-main-is-top-level`·`landmark-no-duplicate-main`·`landmark-unique`)을 물었다.
 *
 * `list-row`가 breakpoint 전환을 소비처에 남기고 `field`가 폼 상태를 남긴 것과 같은 경계다.
 * 소비처가 `<SidebarInset asChild>` 없이도 자기 `<main>`을 이 안에 두거나 이 자리를 자기
 * 랜드마크로 감싸면 된다. 반대로 sidebar 안쪽의 `<nav>`는 우리가 준다 — 그건 셸의 구조이지
 * 페이지의 구조가 아니다. */
function SidebarInset({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sidebar-inset" className={cn("relative flex w-full flex-1 flex-col bg-background", className)} {...props} />
}

function SidebarHeader({ className, ...props }: React.ComponentProps<"div">) { return <div data-slot="sidebar-header" className={cn("flex flex-col gap-2 p-2", className)} {...props} /> }
function SidebarContent({ className, ...props }: React.ComponentProps<"div">) { return <div data-slot="sidebar-content" className={cn("flex min-h-0 flex-1 flex-col gap-2 overflow-auto p-2", className)} {...props} /> }
function SidebarFooter({ className, ...props }: React.ComponentProps<"div">) { return <div data-slot="sidebar-footer" className={cn("flex flex-col gap-2 p-2", className)} {...props} /> }
/* 원본을 소비한다(#91) — 구분선을 다시 그리면 Separator의 role·decorative 계약이 두 벌이 된다. */
function SidebarSeparator({ className, ...props }: React.ComponentProps<typeof Separator>) { return <Separator data-slot="sidebar-separator" className={cn("mx-2 w-auto border-sidebar-border", className)} {...props} /> }

function SidebarGroup({ className, ...props }: React.ComponentProps<"div">) { return <div data-slot="sidebar-group" className={cn("relative flex w-full min-w-0 flex-col p-2", className)} {...props} /> }
function SidebarGroupLabel({ className, ...props }: React.ComponentProps<"div">) { return <div data-slot="sidebar-group-label" className={cn("flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-muted-foreground", className)} {...props} /> }
function SidebarGroupContent({ className, ...props }: React.ComponentProps<"div">) { return <div data-slot="sidebar-group-content" className={cn("w-full text-sm", className)} {...props} /> }
/* 히트 영역  가로만 20px로 미달이고 세로(24px)는 이미 하한을 만족한다 — `after:`로
 * 가로만 중심 대칭 ±2px 넓혀 24까지 채운다(#111 결정 2·5, #230). `after:inset-y-0`을
 * 같이 주는 이유는 세로를 안 늘려도 **명시해야** 하기 때문이다 — top/bottom을 비워
 * auto로 두면 의사 요소의 높이가 0으로 접혀(내용이 없으므로) 가로 확장분마저 클릭
 * 면적을 갖지 못한다(재실측이 잡아낸 버그). `absolute`가 이미 걸려 있어 `relative`를
 * 더하지 않는다. `sidebar-content`의 `overflow-auto`까지 여유가 20px 있어 잘리지
 * 않는다(실측 `docs/research/pointer-targets-2026-09.md` §4.2). Group의 다른
 * 인터랙티브 표면과 가로로 겹칠 자리는 없지만, 확장분은 여기 선언해 둔다. */
function SidebarGroupAction({ className, ...props }: React.ComponentProps<"button">) { return <button type="button" data-slot="sidebar-group-action" className={cn("state [--ds-state-base:var(--sidebar)] absolute right-3 top-3.5 flex aspect-square w-5 items-center justify-center rounded-md text-sidebar-foreground outline-none transition-all after:absolute after:inset-y-0 after:-inset-x-0.5 focus-visible:border-focus-contrast focus-visible:ring-[3px] focus-visible:ring-sidebar-ring disabled:pointer-events-none disabled:opacity-50", className)} {...props} /> }

function SidebarMenu({ className, ...props }: React.ComponentProps<"ul">) { return <ul data-slot="sidebar-menu" className={cn("flex w-full min-w-0 flex-col gap-1", className)} {...props} /> }
function SidebarMenuItem({ className, ...props }: React.ComponentProps<"li">) { return <li data-slot="sidebar-menu-item" className={cn("group/menu-item relative", className)} {...props} /> }

/* upstream의 `outline` variant를 열지 않는다. 그 값은 컨트롤 테두리를
 * `shadow-[0_0_0_1px_var(--sidebar-border)]`로 그리는데, `--sidebar-border`는
 * `border.default`이고 그건 **구분선이라 3:1 게이트에서 의도적으로 빠져 있다**
 * (contrast.mjs, 다크에서 1.31). 게이트를 통과하는 대안은 `border.strong`인데
 * **alias 이름이 없다** — 컴포넌트 색은 alias를 통해 소비하는 것이 규칙이라(CONTEXT.md)
 * 이 variant를 열려면 토큰 변경이 선행돼야 하고 그건 이 티켓 밖이다(#109와 같은 결).
 * 열지 않기로 한 근거를 여기에 남긴다(ADR 0006). */
const sidebarMenuButtonVariantsConfig = {
  variants: {
    size: { default: "h-8 text-sm", sm: "h-7 text-xs", lg: "h-12 text-sm" },
  },
  defaultVariants: { size: "default" },
} as const
const sidebarMenuButtonVariants = cva("state [--ds-state-base:var(--sidebar)] data-[active=true]:[--ds-state-base:var(--sidebar-accent)] flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sidebar-foreground outline-none transition-all focus-visible:border-focus-contrast focus-visible:ring-[3px] focus-visible:ring-sidebar-ring disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0", sidebarMenuButtonVariantsConfig)

function SidebarMenuButton({ className, size = "default", isActive = false, ...props }: React.ComponentProps<"button"> & VariantProps<typeof sidebarMenuButtonVariants> & { isActive?: boolean }) {
  return <button type="button" data-slot="sidebar-menu-button" data-size={size} data-active={isActive} className={cn(sidebarMenuButtonVariants({ size, className }))} {...props} />
}

/* 히트 영역  가로 20px는 #230이 ±2px 넓혔다. 세로(시각 22.4px, `aspect-square`인데도
 * 실측이 20이 아니라 22.4를 준다 — 재실측으로 확인한 실제 값)는 #249 몫: 같은
 * 22.4px 계열(Toast close·action·Breadcrumb link)과 같은 기제로 ±0.8px 더 넓힌다
 * (#111 결정 2·4·5). `absolute`가 이미 걸려 있어 `relative`를 더하지 않는다.
 * `sidebar-content`의 여유가 20px라 두 방향 다 잘리지 않는다. */
function SidebarMenuAction({ className, ...props }: React.ComponentProps<"button">) { return <button type="button" data-slot="sidebar-menu-action" className={cn("state [--ds-state-base:var(--sidebar)] absolute right-1 top-1.5 flex aspect-square w-5 items-center justify-center rounded-md text-sidebar-foreground outline-none transition-all after:absolute after:-inset-x-0.5 after:-inset-y-[0.8px] focus-visible:border-focus-contrast focus-visible:ring-[3px] focus-visible:ring-sidebar-ring disabled:pointer-events-none disabled:opacity-50", className)} {...props} /> }
function SidebarMenuBadge({ className, ...props }: React.ComponentProps<"div">) { return <div data-slot="sidebar-menu-badge" className={cn("pointer-events-none absolute right-1 top-1.5 flex h-5 min-w-5 select-none items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums text-sidebar-foreground", className)} {...props} /> }
function SidebarMenuSub({ className, ...props }: React.ComponentProps<"ul">) { return <ul data-slot="sidebar-menu-sub" className={cn("mx-3.5 flex min-w-0 flex-col gap-1 border-l border-sidebar-border px-2.5 py-0.5", className)} {...props} /> }
function SidebarMenuSubItem({ className, ...props }: React.ComponentProps<"li">) { return <li data-slot="sidebar-menu-sub-item" className={cn("group/menu-sub-item relative", className)} {...props} /> }
function SidebarMenuSubButton({ className, isActive = false, ...props }: React.ComponentProps<"a"> & { isActive?: boolean }) {
  return <a data-slot="sidebar-menu-sub-button" data-active={isActive} className={cn(sidebarMenuSubButtonClassName, className)} {...props} />
}
const sidebarMenuSubButtonClassName = "state [--ds-state-base:var(--sidebar)] data-[active=true]:[--ds-state-base:var(--sidebar-accent)] flex h-7 min-w-0 items-center gap-2 overflow-hidden rounded-md px-2 text-sm text-sidebar-foreground outline-none transition-all focus-visible:border-focus-contrast focus-visible:ring-[3px] focus-visible:ring-sidebar-ring aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0"

const staticPart = (className: string) => ({
  config: { variants: {}, defaultVariants: {} } as const,
  className: () => className,
})

const componentContract = {
  name: "sidebar", source: "src/components/ui/sidebar.tsx",
  publicExports: ["SidebarProvider", "Sidebar", "SidebarInset", "SidebarTrigger", "SidebarRail", "SidebarHeader", "SidebarContent", "SidebarFooter", "SidebarSeparator", "SidebarGroup", "SidebarGroupLabel", "SidebarGroupContent", "SidebarGroupAction", "SidebarMenu", "SidebarMenuItem", "SidebarMenuButton", "SidebarMenuAction", "SidebarMenuBadge", "SidebarMenuSub", "SidebarMenuSubItem", "SidebarMenuSubButton", "useSidebar", "sidebarVariants", "sidebarVariantsConfig", "sidebarMenuButtonVariants", "sidebarMenuButtonVariantsConfig"],
  config: sidebarVariantsConfig, className: (props: Record<string, string>) => cn(sidebarVariants(props)),
  anatomy: ["SidebarProvider", "Sidebar", "SidebarHeader?", "SidebarContent", "SidebarGroup*", "SidebarGroupLabel?", "SidebarGroupAction?", "SidebarGroupContent", "SidebarMenu", "SidebarMenuItem*", "SidebarMenuButton", "SidebarMenuAction?", "SidebarMenuBadge?", "SidebarMenuSub?", "SidebarMenuSubItem*", "SidebarMenuSubButton", "SidebarSeparator?", "SidebarFooter?", "SidebarRail?", "SidebarTrigger", "SidebarInset?"],
  configurationStates: { state: ["expanded", "collapsed"], item: ["default", "active"] }, drawnBy: { state: { attribute: "data-state", values: { collapsed: "collapsed" } }, item: { attribute: "data-active", values: { active: "true" } } },
  parts: {
    /* `Sidebar` 자신이 두 노드로 갈린다(#245) — 데스크톱은 흐름에 자리를 남기는
     * spacer(`data-slot="sidebar"`)가 `fixed` 패널(`sidebar-container`, 계약의 root가
     * 이미 여기 있다)을 감싸고, 모바일은 그 자리를 `Sheet`가 대신해 `SheetContent`가
     * `data-slot="sidebar"`를 받는다. 계약 root를 옮기지 않는다 — `sidebar-container`는
     * `side`·`variant`·`collapsible` 세 축을 실제로 그리는 자리이고 anatomy 이름이 없는
     * 내부 노드([ADR-0018] "소비처가 조립하지 않는 노드는 anatomy가 아니다")라 root를
     * 옮기면 그 세 축이 어디에도 못 닿는 자리로 빠진다 — 있던 침묵을 다른 자리로
     * 옮기는 것일 뿐 닫는 게 아니다. 대신 anatomy가 이미 갖고 있는 `Sidebar` 이름으로
     * **파트를 하나 더** 세워, 소비처가 `<Sidebar>` 하나를 쓸 때 실제로 받는 **바깥
     * 노드**(spacer 또는 SheetContent)의 클래스를 그대로 담는다. 갈래를 고르는 것은
     * `Sidebar` 자신의 prop이 아니라 `SidebarProvider`의 `isMobile`(소비처가 주는 값,
     * 기본 `false`)이라 축 이름을 그대로 `mobile`로 쓴다 — DOM의 `data-mobile="true"`와
     * 한 이름이라 다음 재조회가 바로 대응을 찾는다. 기본값 `"false"`는 `isMobile`의
     * 기본값과 같아 발행된 인스턴스(데스크톱 참조 스토리)를 그대로 지킨다(맵 규칙 3의
     * 논리, #227 선례). 렌더는 바뀌지 않는다 — 두 문자열 다 소스에 이미 있는 그대로다. */
    Sidebar: {
      config: { variants: { mobile: { false: "desktop", true: "mobile" } }, defaultVariants: { mobile: "false" } } as const,
      className: (props: Record<string, string>) => props.mobile === "true"
        ? "w-(--sidebar-width) bg-sidebar p-0 text-sidebar-foreground"
        : "relative block w-(--sidebar-width) shrink-0 bg-transparent transition-[width] duration-200 ease-linear data-[state=collapsed]:data-[collapsible=offcanvas]:w-0 data-[state=collapsed]:data-[collapsible=icon]:w-(--sidebar-width-icon)",
    },
    SidebarTrigger: staticPart("state [--ds-state-base:var(--sidebar)] inline-flex size-8 shrink-0 items-center justify-center rounded-md text-sidebar-foreground outline-none transition-all focus-visible:border-focus-contrast focus-visible:ring-[3px] focus-visible:ring-sidebar-ring disabled:pointer-events-none disabled:opacity-50"),
    SidebarRail: staticPart("absolute inset-y-0 z-20 w-4 -translate-x-1/2 transition-all ease-linear before:absolute before:inset-y-0 before:-inset-x-1 after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] hover:after:bg-sidebar-border"),
    SidebarSeparator: staticPart("mx-2 w-auto border-sidebar-border"),
    SidebarGroupAction: staticPart("state [--ds-state-base:var(--sidebar)] absolute right-3 top-3.5 flex aspect-square w-5 items-center justify-center rounded-md text-sidebar-foreground outline-none transition-all after:absolute after:inset-y-0 after:-inset-x-0.5 focus-visible:border-focus-contrast focus-visible:ring-[3px] focus-visible:ring-sidebar-ring disabled:pointer-events-none disabled:opacity-50"),
    SidebarMenuAction: staticPart("state [--ds-state-base:var(--sidebar)] absolute right-1 top-1.5 flex aspect-square w-5 items-center justify-center rounded-md text-sidebar-foreground outline-none transition-all after:absolute after:-inset-x-0.5 after:-inset-y-[0.8px] focus-visible:border-focus-contrast focus-visible:ring-[3px] focus-visible:ring-sidebar-ring disabled:pointer-events-none disabled:opacity-50"),
    // `[&>span:last-child]:truncate`가 지목하는 것은 **라벨**이다(#181). 선택자가 그것을
    // 스스로 말하지 않으므로 전역 `MODIFIER_POLICY`가 아니라 계약이 이름표를 진다(ADR-0013)
    SidebarMenuButton: { config: sidebarMenuButtonVariantsConfig, className: (props: Record<string, string>) => cn(sidebarMenuButtonVariants(props)), slots: { label: "[&>span:last-child]" } },
    // upstream이 `size?: "sm" | "md"`를 `data-size`로 낸다. 여기서는 글자 한 단(`text-sm`→
    // `text-xs`) 차이라 FieldTitle(#175)·Card(#121)·Item xs(#174)와 같은 근거로 축을
    // 닫되, 형제 SidebarMenuButton이 이미 `size`를 발행해 소비처가 sub 버튼에서만
    // 덮어써야 한다는 #174의 단서가 더 세게 걸린다. 조건부 닫기 — 실측 수요가 확인되면
    // 여는 것이 기본값이다(#177 §3, #225).
    SidebarMenuSubButton: { ...staticPart(sidebarMenuSubButtonClassName), slots: { label: "[&>span:last-child]" } },
    SidebarHeader: staticPart("flex flex-col gap-2 p-2"),
    SidebarContent: staticPart("flex min-h-0 flex-1 flex-col gap-2 overflow-auto p-2"),
    SidebarFooter: staticPart("flex flex-col gap-2 p-2"),
    SidebarGroup: staticPart("relative flex w-full min-w-0 flex-col p-2"),
    SidebarGroupLabel: staticPart("flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-muted-foreground"),
    SidebarGroupContent: staticPart("w-full text-sm"),
    SidebarMenu: staticPart("flex w-full min-w-0 flex-col gap-1"),
    SidebarMenuItem: staticPart("group/menu-item relative"),
    SidebarMenuBadge: staticPart("pointer-events-none absolute right-1 top-1.5 flex h-5 min-w-5 select-none items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums text-sidebar-foreground"),
    SidebarMenuSub: staticPart("mx-3.5 flex min-w-0 flex-col gap-1 border-l border-sidebar-border px-2.5 py-0.5"),
    SidebarMenuSubItem: staticPart("group/menu-sub-item relative"),
    SidebarInset: staticPart("relative flex w-full flex-1 flex-col bg-background"),
  },
  behaviors: {},
  reference: { example: "sidebar", guidance: { use: "애플리케이션 셸의 왼쪽이나 오른쪽에 고정돼 본문과 함께 살며 접고 펴는 세로 탐색 표면에 쓴다. 좁은 폭에서는 `isMobile`에 따라 Sheet으로 갈아 끼운다.", evidence: "투자 이력·보유 현황·회고를 오가는 탐색이 화면 상단 탭으로는 다 들어가지 않고, 본문을 보면서 다른 구역으로 이동해야 한다.", limits: "breakpoint·영속화·단축키는 `isMobile`·`open`·`onOpenChange`로 소비처가 배선한다. 검색·스켈레톤·접힌 레이블은 Input·Skeleton·Tooltip으로 조립한다. `<main>`·`aria-label`은 소비처가 준다. `SidebarMenuSubButton.size`는 닫는다 — 작은 글자는 `className`으로." } },
} as const

export { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger, SidebarRail, SidebarHeader, SidebarContent, SidebarFooter, SidebarSeparator, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarGroupAction, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarMenuAction, SidebarMenuBadge, SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton, useSidebar, sidebarVariants, sidebarVariantsConfig, sidebarMenuButtonVariants, sidebarMenuButtonVariantsConfig, componentContract }
