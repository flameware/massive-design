"use client"

import { cn } from "@flameware/ui/lib/utils"
import { createParts } from "@ui-sdk/react/primitive"
import type * as React from "react"

import { listRowList } from "./primitive"

/* #496 스파이크 — packages/ui/src/list-row/list-row.tsx를 옮기고, 그 위에
 * 고를 수 있는 목록을 직접 만든 primitive(./primitive.ts)로 더한다.
 *
 * 파트 이름은 평면형이다(#496 결정 2). 정적 파트 다섯의 클래스 문자열은
 * 원본과 글자 그대로 같다.
 *
 * 원본과 갈리는 것:
 *   - 이 파일은 `"use client"`다. `createParts`가 훅을 쓰기 때문이고, 그래서
 *     같은 모듈에 있는 정적 파트도 서버 컴포넌트가 아니게 된다. 원본의
 *     `./list-row`는 SERVER_SUBPATHS다 — 실제로 옮긴다면 고를 수 있는 목록은
 *     다른 서브패스로 나가야 한다. */

/* ---------- 정적 파트 (원본 그대로) ---------- */

const ROOT = "flex min-w-0 items-center gap-3 py-3"
const GROUP = "flex min-w-0 flex-1 flex-col"
const PRIMARY = "truncate text-sm font-medium text-default"
const SECONDARY = "truncate text-sm text-muted"
const VALUE = "ml-auto shrink-0 text-sm font-medium tabular-nums text-default"

export const listRowPartClassNames = { ROOT, GROUP, PRIMARY, SECONDARY, VALUE }

export interface ListRowProps extends React.ComponentPropsWithoutRef<"div"> {}
export interface ListRowPartProps extends React.ComponentPropsWithoutRef<"div"> {}

export function ListRow({ className, ...props }: ListRowProps) {
  return <div className={cn(ROOT, className)} {...props} />
}

/** 주 텍스트와 보조 텍스트를 세로로 묶는 자리 */
export function ListRowGroup({ className, ...props }: ListRowPartProps) {
  return <div className={cn(GROUP, className)} {...props} />
}

/** 종목명·거래 제목처럼 한 줄의 이름표 */
export function ListRowPrimary({ className, ...props }: ListRowPartProps) {
  return <div className={cn(PRIMARY, className)} {...props} />
}

/** 날짜·수량처럼 주 텍스트를 보충하는 둘째 줄 */
export function ListRowSecondary({ className, ...props }: ListRowPartProps) {
  return <div className={cn(SECONDARY, className)} {...props} />
}

/** 금액·손익처럼 오른쪽 끝에 붙는 값 */
export function ListRowValue({ className, ...props }: ListRowPartProps) {
  return <div className={cn(VALUE, className)} {...props} />
}

/* ---------- 고를 수 있는 목록 (스파이크에서 새로 더한 것) ---------- */

/* 이름 — `ListRowList`·`ListRowOption`.
 *   - `List`는 이 카탈로그에서 이미 "role=listbox인 항목 컨테이너"다
 *     (`Combobox.List`). 같은 뜻이라 같은 이름을 쓴다(rules.md 축과 이름 공간 —
 *     막는 것은 같은 이름이 다른 뜻을 갖는 것이다).
 *   - `Option`은 role을 그대로 부른다. 카탈로그의 `Item`(Combobox·Select·Menu)은
 *     팝업 안 항목이고 `data-highlighted`로 가상 하이라이트를 받는다. 이 행은
 *     실제 포커스를 받고 흐름 안에 서므로 그 이름을 빌리지 않았다.
 *   - `ListRowSelectable…`처럼 형용사를 붙이지 않은 것은 정적 `ListRow`가 그대로
 *     남기 때문이다 — 고를 수 있는지는 어느 파트를 쓰는가로 갈린다. */
const parts = createParts(listRowList, { root: "div", option: "div" })

export type ListRowListProps = Omit<React.ComponentProps<typeof parts.Root>, "className"> & {
  className?: string
}

/** `role="listbox"`. 이름(`aria-label`·`aria-labelledby`)은 쓰는 쪽이 준다 */
export function ListRowList({ className, ...props }: ListRowListProps) {
  return <parts.Root className={cn("flex flex-col", className)} {...props} />
}

/* 하이라이트는 combobox.tsx의 `comboboxItemVariants`와 같은 조립이다 —
 * `state`(호버 8%·눌림 12%)와 `hit-area`. 다른 점 둘:
 *   - 흐름 안의 행이라 평소에는 `--ds-state-base`를 주지 않는다(면이 없다 —
 *     state.css: 안 주면 transparent에 섞인다). 선택된 행만 `accent-soft`를 진다
 *   - 실제 포커스를 받으므로 키보드 표시는 `data-highlighted`가 아니라
 *     `focus-visible` 링이다(Button과 같은 클래스) */
const OPTION = cn(
  ROOT,
  "cursor-default rounded-sm px-3 select-none",
  "-outline-offset-2 focus-visible:outline-2",
  "hit-area",
  "state transition-[background-color]",
  "data-selected:[--ds-state-base:var(--ds-bg-accent-soft)]",
  "data-disabled:opacity-50"
)

export type ListRowOptionProps = Omit<React.ComponentProps<typeof parts.Option>, "className"> & {
  className?: string
}

/** `role="option"`인 ListRow. 안에 `ListRowGroup`·`ListRowValue`를 그대로 넣는다 */
export function ListRowOption({ className, ...props }: ListRowOptionProps) {
  return <parts.Option className={cn(OPTION, className)} {...props} />
}
