import { cva, type VariantProps } from "class-variance-authority"
import type * as React from "react"

import { cn } from "../lib/utils.js"

/* 자체 스타일 primitive — Base UI가 없다(ADR-0023 §2 밖). `<table>`은 행동이
 * 없는 시맨틱 요소라 브라우저가 이미 role·구조를 진다. DS가 지는 것은 면·간격
 * ·테두리뿐이고, 헤더·행·셀을 **무엇으로 채우는가**는 언제나 소비처다.
 *
 * TanStack Table 위에 그대로 얹히는 것이 설계의 목적이다(스토리 24) — TanStack의
 * `flexRender(header.column.columnDef.header, header.getContext())`와
 * `flexRender(cell.column.columnDef.cell, cell.getContext())`가 반환하는
 * `ReactNode`를 `Table.Head`·`Table.Cell`의 children으로 그대로 꽂으면 된다.
 * 그래서 이 파일은 TanStack을 **모른다** — `@tanstack/react-table`은
 * `package.json`의 어디에도 없다(devDependency로도), 알면 그 버전이 소비처의
 * 버전과 갈릴 때 이 패키지가 발을 묶는다. 정렬·필터·페이지네이션·행 선택의
 * 상태는 전부 소비처(또는 TanStack)가 쥔다 — DS는 그 상태가 만든 결과물을
 * `data-*`로 받아 그릴 뿐이다.
 *
 * `Root`가 가로 스크롤 컨테이너를 진다 — 열이 많은 거래 테이블이 좁은 화면에서
 * 잘리지 않고 옆으로 밀리게 하는 최소한의 반응형이다(ADR-0023 §11의 레이아웃은
 * Phase 2이지만, 이것은 새 축이 아니라 `Root` 하나의 고정된 모양이다). */

export type TableRootProps = React.ComponentPropsWithoutRef<"table">

function TableRoot({ className, ...props }: TableRootProps) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={cn("w-full caption-bottom text-sm text-default", className)} {...props} />
    </div>
  )
}

export type TableHeaderProps = React.ComponentPropsWithoutRef<"thead">

function TableHeader({ className, ...props }: TableHeaderProps) {
  return <thead className={cn("[&_tr]:border-b [&_tr]:border-default", className)} {...props} />
}

export type TableBodyProps = React.ComponentPropsWithoutRef<"tbody">

function TableBody({ className, ...props }: TableBodyProps) {
  return <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props} />
}

/* 행 하나. 채움은 상태 레이어 하나가 진다(#299의 규칙이 Base UI 없는 표면에도
 * 같다) — `--ds-state-base`를 주지 않으므로 기본은 투명이고, hover·active만
 * `.state`의 반투명 층으로 드러난다. 그래서 `Root`가 어떤 바탕(canvas·surface)
 * 위에 있든 행이 그 바탕과 어긋나지 않는다. */
export type TableRowProps = React.ComponentPropsWithoutRef<"tr">

function TableRow({ className, ...props }: TableRowProps) {
  return (
    <tr className={cn("state border-b border-default transition-colors", className)} {...props} />
  )
}

/* 정렬은 **열**의 성질이지만 이 표에는 열이라는 객체가 없다(`colgroup`을 열지
 * 않았다, #367) — 그래서 축은 셀마다(`Table.Head`·`Table.Cell`) 서고, 열
 * 전체를 맞추는 반복은 소비처(TanStack `columnDef`)가 진다. `Table.Row`·
 * `Table.Root`에는 두지 않는다.
 *
 * 값은 물리 방향(`left`/`right`)이 아니라 논리(`start`/`center`/`end`)다 —
 * RTL이 ADR-0023 §11의 영구 제외라도 축 이름이 방향을 박제하지 않기
 * 위해서다. 기본은 `start` — 지금 `text-left`가 그리는 것과 같다(rules.md
 * "새 축의 기본은 게시된 인스턴스를 보존하는 값").
 *
 * `<th>`·`<td>`의 네이티브 `align` 속성(폐기 예정, `left`/`right`/`center`/
 * `char`)과 이름이 부딪혀 각 Props가 `Omit<..., "align">`으로 지운다 — DS의
 * `align`은 그 자리를 완전히 대신한다. */
export const tableHeadVariants = cva(
  "h-10 px-3 align-middle font-medium text-muted whitespace-nowrap",
  {
    variants: {
      align: {
        start: "text-left",
        center: "text-center",
        end: "text-right",
      },
    },
    defaultVariants: { align: "start" },
  }
)

/* 머리 셀. `scope`는 기본을 주지 않는다 — 합계 행처럼 `<tbody>` 안에서도
 * `<th scope="row">`가 쓰이고, 그 결정은 셀이 아니라 소비처가 표의 모양을 보고
 * 내린다(1세대 TableFooter가 남긴 판단, v1-shadcn). */
export interface TableHeadProps
  extends Omit<React.ComponentPropsWithoutRef<"th">, "align">,
    VariantProps<typeof tableHeadVariants> {}

function TableHead({ className, align, ...props }: TableHeadProps) {
  return <th className={cn(tableHeadVariants({ align }), className)} {...props} />
}

/* 숫자 열은 `tabular-nums`를 얻는다 — `ListRow.Value`가 이미 쓰는 것과 **같은
 * 규약**이다(list-row.tsx의 `VALUE`). 같은 뜻(비교하는 수)이 컴포넌트마다
 * 다른 서체를 얻지 않기 위해서다. `align`과는 독립된 축이다 — 정렬은 열의
 * 시각적 위치, `numeric`은 열의 서체 규약이라 서로 다른 것을 답한다(숫자
 * 열이 보통 `align="end"`와 `numeric`을 함께 받긴 하지만, 강제하지 않는다).
 * 기본은 `false` — `tabular-nums`를 내지 않는 지금 모양을 보존한다. */
export const tableCellVariants = cva("p-3 align-middle", {
  variants: {
    align: {
      start: "text-left",
      center: "text-center",
      end: "text-right",
    },
    numeric: {
      true: "tabular-nums",
      false: "",
    },
  },
  defaultVariants: { align: "start", numeric: false },
})

export interface TableCellProps
  extends Omit<React.ComponentPropsWithoutRef<"td">, "align">,
    VariantProps<typeof tableCellVariants> {}

function TableCell({ className, align, numeric, ...props }: TableCellProps) {
  return <td className={cn(tableCellVariants({ align, numeric }), className)} {...props} />
}

export const Table = {
  Root: TableRoot,
  Header: TableHeader,
  Body: TableBody,
  Row: TableRow,
  Head: TableHead,
  Cell: TableCell,
}
