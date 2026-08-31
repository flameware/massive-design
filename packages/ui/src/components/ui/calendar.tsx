import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

/* Calendar — 월 격자 하나를 그리는 날짜 선택 표면이다.
 *
 * 결정 1. **선택 모드는 single과 range 둘만 계약한다.** multiple(흩어진 여러
 * 날짜)은 invest diary에 근거가 없다 — 거래일은 하루이고 기간 필터는 구간이다.
 * 근거 없는 세 번째 모드는 Figma에서 축을 하나 더 늘리고 range 규칙과 충돌하는
 * 선택 해제 의미를 새로 정의하게 만든다. 필요해지면 `mode`에 값을 더하는
 * additive 변경으로 열 수 있으므로 지금 닫아 두는 쪽이 되돌리기 쉽다.
 *
 * 결정 2. **날짜 상태는 배타적 열거 하나다.** disabled > selected > inRange >
 * outside > today > default 순으로 하나만 이긴다. 상태를 직교 불리언으로 두면
 * Figma variant 조합이 곱셈으로 늘고 "선택된 오늘"처럼 화면에 동시에 나타날 수
 * 없는 칸이 생긴다. 조합이 아니라 우선순위라는 사실을 `calendarDayVariantsConfig`의
 * `day` 축이 그대로 적는다.
 *
 * 결정 3. **월 탐색은 이전/다음 한 칸씩만 내장한다.** 연·월 드롭다운과 다중 월
 * 표시는 넣지 않는다 — 둘 다 Date Picker 조합 층의 결정이고(이 티켓의 범위 밖),
 * `month`/`onMonthChange`로 제어하면 소비처가 원하는 어떤 이동 UI도 붙일 수 있다.
 *
 * 결정 4. **locale과 "오늘"은 주입 가능한 입력이다.** 월 이름·요일 이름·날짜
 * 숫자는 전부 플랫폼 `Intl`이 만들고 `locale` prop이 그 입력을 받는다(새 의존성
 * 없음). `today`도 prop이라 벽시계에 기대지 않는다 — Storybook 참조와 axe 실행이
 * 결정론적이어야 하기 때문이다. 주 시작 요일은 `weekStartsOn`으로 명시한다:
 * `Intl.Locale.prototype.getWeekInfo`는 아직 모든 런타임에 없어서 locale에서
 * 자동 유도하면 환경마다 격자가 달라진다.
 *
 * 결정 5. **선택 불가 날짜는 disabled가 아니라 aria-disabled다.** `disabled` 속성을
 * 쓰면 그 칸이 포커스를 못 받아 roving tabindex가 격자 밖으로 떨어지고, 화살표로
 * 지나갈 수 없는 구멍이 생긴다(PageDown으로 내려간 달이 전부 선택 불가일 때 키보드
 * 탐색 자체가 멈췄다). 이동은 항상 되고 활성화만 막는다.
 *
 * 결정 6. **접근성 경계는 grid 의미론까지다.** `role="grid"` 테이블, 열 머리의
 * 축약 표기 뒤에 붙는 완전한 요일 이름, 날짜 버튼의 완전한 날짜 접근 이름,
 * roving tabindex와 화살표/Home/End/PageUp/PageDown 이동, 그리고 월이 바뀔 때
 * `aria-live="polite"` 캡션이 새 월을 읽는 것 — 여기까지가 계약이다. 그 밖의
 * 입력 필드·팝오버·확인 버튼 같은 Date Picker 조합은 계약하지 않는다. */

type CalendarDateRange = { from?: Date; to?: Date }

const calendarVariantsConfig = { variants: {}, defaultVariants: {} } as const
const calendarVariants = cva("inline-flex w-fit flex-col gap-4 rounded-lg border bg-background p-3", calendarVariantsConfig)

const calendarDayVariantsConfig = {
  variants: {
    day: {
      default: "state",
      today: "state border font-semibold",
      selected: "state [--ds-state-base:var(--primary)] text-primary-foreground",
      inRange: "state [--ds-state-base:var(--primary-soft)] text-foreground",
      outside: "state text-muted-foreground",
      disabled: "text-muted-foreground opacity-50",
    },
  },
  defaultVariants: { day: "default" },
} as const

const calendarDayVariants = cva("inline-flex size-9 shrink-0 items-center justify-center rounded-md text-sm font-normal tabular-nums whitespace-nowrap transition-all outline-none select-none focus-visible:border-focus-contrast focus-visible:ring-[3px] focus-visible:ring-ring aria-disabled:pointer-events-none", calendarDayVariantsConfig)

type CalendarDayStyleProps = VariantProps<typeof calendarDayVariants>

const staticPart = (className: string) => ({
  config: { variants: {}, defaultVariants: {} } as const,
  className: () => className,
})

const HEADER_CLASS = "flex items-center justify-between gap-2"
const NAV_CLASS = cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))
const CAPTION_CLASS = "text-sm font-medium"
const GRID_CLASS = "w-full border-collapse"
const HEAD_CELL_CLASS = "size-9 p-0 text-center text-xs font-normal text-muted-foreground"
const CELL_CLASS = "p-0 text-center align-middle"

/* ── 파트 ──────────────────────────────────────────────────────────────────── */

function CalendarHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="calendar-header" className={cn(HEADER_CLASS, className)} {...props} />
}

function CalendarNav({ className, direction, children, ...props }: React.ComponentProps<"button"> & { direction: "previous" | "next" }) {
  return <button type="button" data-slot="calendar-nav" data-direction={direction} className={cn(NAV_CLASS, className)} {...props}>{children ?? <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4"><path d={direction === "previous" ? "m10 3-5 5 5 5" : "m6 3 5 5-5 5"} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"/></svg>}</button>
}

function CalendarCaption({ className, ...props }: React.ComponentProps<"div">) {
  return <div aria-live="polite" data-slot="calendar-caption" className={cn(CAPTION_CLASS, className)} {...props} />
}

function CalendarGrid({ className, ...props }: React.ComponentProps<"table">) {
  return <table role="grid" data-slot="calendar-grid" className={cn(GRID_CLASS, className)} {...props} />
}

function CalendarHeadCell({ className, ...props }: React.ComponentProps<"th">) {
  return <th scope="col" data-slot="calendar-head-cell" className={cn(HEAD_CELL_CLASS, className)} {...props} />
}

function CalendarCell({ className, ...props }: React.ComponentProps<"td">) {
  return <td role="gridcell" data-slot="calendar-cell" className={cn(CELL_CLASS, className)} {...props} />
}

function CalendarDay({ className, day, ...props }: React.ComponentProps<"button"> & CalendarDayStyleProps) {
  return <button type="button" data-slot="calendar-day" data-day={day ?? "default"} className={cn(calendarDayVariants({ day, className }))} {...props} />
}

/* ── 날짜 계산 — 벽시계도 시간대 변환도 하지 않는 지역 달력 날짜만 다룬다 ──── */

function startOfDay(date: Date) { return new Date(date.getFullYear(), date.getMonth(), date.getDate()) }
function startOfMonth(date: Date) { return new Date(date.getFullYear(), date.getMonth(), 1) }
function addDays(date: Date, amount: number) { return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount) }
function isSameDay(a: Date, b: Date) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate() }
function isSameMonth(a: Date, b: Date) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() }

/** 일(day-of-month)을 대상 월의 마지막 날로 자르며 월을 옮긴다. 1/31 + 1개월 = 2/28. */
function shiftMonth(date: Date, amount: number) {
  const target = new Date(date.getFullYear(), date.getMonth() + amount, 1)
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate()
  return new Date(target.getFullYear(), target.getMonth(), Math.min(date.getDate(), lastDay))
}

function isRange(value: unknown): value is CalendarDateRange {
  return typeof value === "object" && value !== null && !(value instanceof Date)
}

/* ── Calendar ──────────────────────────────────────────────────────────────── */

type CalendarWeekday = 0 | 1 | 2 | 3 | 4 | 5 | 6

type CalendarBaseProps = Omit<React.ComponentProps<"div">, "onSelect"> & {
  /** 제어 월. 주면 이전/다음 버튼은 `onMonthChange`만 부르고 스스로 움직이지 않는다. */
  month?: Date
  /** 비제어 초기 월. 참조 렌더링을 고정할 때 쓴다. */
  defaultMonth?: Date
  onMonthChange?: (month: Date) => void
  /** "오늘"의 기준 날짜. 생략하면 `new Date()` — 결정론이 필요하면 주입한다. */
  today?: Date
  /** `Intl`에 넘길 BCP-47 태그. 생략하면 런타임 기본 locale. */
  locale?: string
  /** 주의 시작 요일(0=일요일). locale에서 유도하지 않는다. */
  weekStartsOn?: CalendarWeekday
  /** 선택할 수 없는 날짜. min/max 같은 업무 규칙은 소비처가 이 술어로 표현한다. */
  disabled?: (date: Date) => boolean
  labels?: { previousMonth?: string; nextMonth?: string }
}

type CalendarSingleProps = {
  mode?: "single"
  selected?: Date | null
  defaultSelected?: Date | null
  onSelect?: (date: Date | null) => void
}

type CalendarRangeProps = {
  mode: "range"
  selected?: CalendarDateRange | null
  defaultSelected?: CalendarDateRange | null
  onSelect?: (range: CalendarDateRange | null) => void
}

type CalendarProps = CalendarBaseProps & (CalendarSingleProps | CalendarRangeProps)

type CalendarSelection = Date | CalendarDateRange | null

type CalendarLooseProps = CalendarBaseProps & {
  mode?: "single" | "range"
  selected?: CalendarSelection
  defaultSelected?: CalendarSelection
  onSelect?: (value: CalendarSelection) => void
}

function Calendar(props: CalendarProps) {
  const {
    mode = "single", month, defaultMonth, onMonthChange, selected, defaultSelected, onSelect,
    today, locale, weekStartsOn = 0, disabled, labels, className, ...rest
  } = props as unknown as CalendarLooseProps

  const captionId = `${React.useId()}-caption`
  const gridRef = React.useRef<HTMLTableElement>(null)
  const shouldFocus = React.useRef(false)

  const [uncontrolledMonth, setUncontrolledMonth] = React.useState(() => startOfMonth(defaultMonth ?? month ?? today ?? new Date()))
  const monthStart = month ? startOfMonth(month) : uncontrolledMonth

  const [uncontrolledSelected, setUncontrolledSelected] = React.useState<CalendarSelection>(defaultSelected ?? null)
  const selection = selected !== undefined ? selected : uncontrolledSelected

  const todayDate = startOfDay(today ?? new Date())

  const offset = (monthStart.getDay() - weekStartsOn + 7) % 7
  const gridStart = addDays(monthStart, -offset)
  // 6주 고정 — 달마다 격자 높이가 흔들리면 조립된 화면과 Figma 프레임이 어긋난다
  const weeks = Array.from({ length: 6 }, (_, week) => Array.from({ length: 7 }, (_, weekday) => addDays(gridStart, week * 7 + weekday)))

  const monthFormat = new Intl.DateTimeFormat(locale, { year: "numeric", month: "long" })
  // 숫자만 쓴다 — DateTimeFormat의 day는 ko에서 "26일"처럼 단위를 붙여 칸을 넓힌다.
  // 완전한 날짜 이름은 버튼의 aria-label이 따로 진다
  const dayNumberFormat = new Intl.NumberFormat(locale)
  const dayLabelFormat = new Intl.DateTimeFormat(locale, { dateStyle: "long" })
  const weekdayNarrowFormat = new Intl.DateTimeFormat(locale, { weekday: "narrow" })
  const weekdayLongFormat = new Intl.DateTimeFormat(locale, { weekday: "long" })
  const weekdays = Array.from({ length: 7 }, (_, index) => addDays(gridStart, index))

  const isDisabled = (date: Date) => disabled?.(date) ?? false
  const range = mode === "range" && isRange(selection) ? selection : null
  const single = mode === "single" && selection instanceof Date ? selection : null

  const isSelectedDay = (date: Date) => {
    if (single) return isSameDay(date, single)
    if (range) return Boolean((range.from && isSameDay(date, range.from)) || (range.to && isSameDay(date, range.to)))
    return false
  }
  const isInRange = (date: Date) => {
    if (!range?.from || !range.to) return false
    const time = startOfDay(date).getTime()
    return time > startOfDay(range.from).getTime() && time < startOfDay(range.to).getTime()
  }

  const dayStateOf = (date: Date): NonNullable<CalendarDayStyleProps["day"]> => {
    if (isDisabled(date)) return "disabled"
    if (isSelectedDay(date)) return "selected"
    if (isInRange(date)) return "inRange"
    if (!isSameMonth(date, monthStart)) return "outside"
    if (isSameDay(date, todayDate)) return "today"
    return "default"
  }

  const daysInMonth = weeks.flat().filter((date) => isSameMonth(date, monthStart))
  const preferred =
    daysInMonth.find((date) => isSelectedDay(date) && !isDisabled(date)) ??
    daysInMonth.find((date) => isSameDay(date, todayDate) && !isDisabled(date)) ??
    daysInMonth.find((date) => !isDisabled(date)) ??
    daysInMonth[0] ??
    monthStart

  const [focusedTime, setFocusedTime] = React.useState<number | null>(null)
  const focusedIsVisible = focusedTime !== null && weeks.flat().some((date) => date.getTime() === focusedTime)
  const tabbableTime = focusedIsVisible ? focusedTime : preferred.getTime()

  React.useEffect(() => {
    if (!shouldFocus.current) return
    shouldFocus.current = false
    gridRef.current?.querySelector<HTMLButtonElement>(`[data-day-key="${tabbableTime}"]`)?.focus()
  })

  const goToMonth = (next: Date) => {
    const target = startOfMonth(next)
    if (month === undefined) setUncontrolledMonth(target)
    onMonthChange?.(target)
  }

  const focusDate = (date: Date) => {
    shouldFocus.current = true
    setFocusedTime(date.getTime())
    if (!isSameMonth(date, monthStart)) goToMonth(date)
  }

  const commit = (value: CalendarSelection) => {
    if (selected === undefined) setUncontrolledSelected(value)
    onSelect?.(value)
  }

  const handleSelect = (date: Date) => {
    if (isDisabled(date)) return
    if (mode === "range") {
      if (!range?.from || range.to) commit({ from: date, to: undefined })
      else if (startOfDay(date).getTime() < startOfDay(range.from).getTime()) commit({ from: date, to: range.from })
      else commit({ from: range.from, to: date })
    } else {
      commit(single && isSameDay(date, single) ? null : date)
    }
    focusDate(date)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTableElement>) => {
    const base = new Date(tabbableTime)
    const weekOffset = (base.getDay() - weekStartsOn + 7) % 7
    const next =
      event.key === "ArrowLeft" ? addDays(base, -1)
      : event.key === "ArrowRight" ? addDays(base, 1)
      : event.key === "ArrowUp" ? addDays(base, -7)
      : event.key === "ArrowDown" ? addDays(base, 7)
      : event.key === "Home" ? addDays(base, -weekOffset)
      : event.key === "End" ? addDays(base, 6 - weekOffset)
      : event.key === "PageUp" ? shiftMonth(base, event.shiftKey ? -12 : -1)
      : event.key === "PageDown" ? shiftMonth(base, event.shiftKey ? 12 : 1)
      : null
    if (!next) return
    event.preventDefault()
    focusDate(next)
  }

  return (
    <div data-slot="calendar" data-mode={mode} className={cn(calendarVariants({ className }))} {...rest}>
      <CalendarHeader>
        <CalendarNav direction="previous" aria-label={labels?.previousMonth ?? "Go to previous month"} onClick={() => goToMonth(shiftMonth(monthStart, -1))}/>
        <CalendarCaption id={captionId}>{monthFormat.format(monthStart)}</CalendarCaption>
        <CalendarNav direction="next" aria-label={labels?.nextMonth ?? "Go to next month"} onClick={() => goToMonth(shiftMonth(monthStart, 1))}/>
      </CalendarHeader>
      <CalendarGrid ref={gridRef} aria-labelledby={captionId} onKeyDown={handleKeyDown}>
        <thead>
          <tr>{weekdays.map((date) => <CalendarHeadCell key={date.getDay()}><span aria-hidden="true">{weekdayNarrowFormat.format(date)}</span><span className="sr-only">{weekdayLongFormat.format(date)}</span></CalendarHeadCell>)}</tr>
        </thead>
        <tbody>
          {weeks.map((week) => <tr key={week[0]?.getTime()}>{week.map((date) => {
            const day = dayStateOf(date)
            const key = date.getTime()
            return <CalendarCell key={key} aria-selected={isSelectedDay(date) || undefined}>
              <CalendarDay
                day={day}
                data-day-key={key}
                data-today={isSameDay(date, todayDate) || undefined}
                data-outside={!isSameMonth(date, monthStart) || undefined}
                data-selected={isSelectedDay(date) || undefined}
                data-in-range={isInRange(date) || undefined}
                aria-disabled={day === "disabled" || undefined}
                tabIndex={key === tabbableTime ? 0 : -1}
                aria-label={dayLabelFormat.format(date)}
                onClick={() => handleSelect(date)}
              >{dayNumberFormat.format(date.getDate())}</CalendarDay>
            </CalendarCell>
          })}</tr>)}
        </tbody>
      </CalendarGrid>
    </div>
  )
}

const componentContract = {
  name: "calendar", source: "src/components/ui/calendar.tsx",
  publicExports: ["Calendar", "CalendarHeader", "CalendarNav", "CalendarCaption", "CalendarGrid", "CalendarHeadCell", "CalendarCell", "CalendarDay", "calendarVariants", "calendarVariantsConfig", "calendarDayVariants", "calendarDayVariantsConfig"],
  config: calendarVariantsConfig, className: (props: Record<string, string>) => cn(calendarVariants(props)),
  anatomy: ["Calendar", "CalendarHeader", "CalendarNav*", "CalendarCaption", "CalendarGrid", "CalendarHeadCell*", "CalendarCell*", "CalendarDay*"],
  configurationStates: { selection: ["single", "range"] },
  parts: {
    CalendarHeader: staticPart(HEADER_CLASS),
    CalendarNav: staticPart(NAV_CLASS),
    CalendarCaption: staticPart(CAPTION_CLASS),
    CalendarGrid: staticPart(GRID_CLASS),
    CalendarHeadCell: staticPart(HEAD_CELL_CLASS),
    CalendarCell: staticPart(CELL_CLASS),
    CalendarDay: { config: calendarDayVariantsConfig, className: (props: Record<string, string>) => cn(calendarDayVariants(props)) },
  },
  reference: { example: "calendar", guidance: { use: "한 달 격자에서 날짜 하나(single) 또는 시작·끝이 있는 기간(range)을 고르고, 오늘·이번 달 밖·선택 불가 날짜를 격자 안에서 구분한다.", evidence: "투자 이력의 거래일 입력은 하루를, 손익 조회 기간 필터는 구간을 고르며 미래 거래일처럼 고를 수 없는 날짜를 격자에서 미리 막아야 한다.", limits: "입력 필드·팝오버·확인 버튼을 묶는 Date Picker 조합과 연·월 드롭다운, 다중 월 표시, 흩어진 여러 날짜 선택(multiple)은 계약하지 않는다. 시간대 변환과 날짜 파싱·직렬화도 다루지 않고 지역 달력 날짜만 받는다. 월 이름·요일 이름은 locale prop이 정하고 주 시작 요일과 오늘 기준일은 소비처가 명시한다." } },
} as const

export { Calendar, CalendarHeader, CalendarNav, CalendarCaption, CalendarGrid, CalendarHeadCell, CalendarCell, CalendarDay, calendarVariants, calendarVariantsConfig, calendarDayVariants, calendarDayVariantsConfig, type CalendarProps, type CalendarDateRange, componentContract }
