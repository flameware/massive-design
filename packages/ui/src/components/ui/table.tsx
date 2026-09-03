import * as React from "react"

import { cn } from "@/lib/utils"

const tableVariantsConfig = { variants: {}, defaultVariants: {} } as const
const tableVariants = (options?: { className?: string }) => cn("w-full caption-bottom text-sm", options?.className)

const staticPart = (className: string) => ({
  config: { variants: {}, defaultVariants: {} } as const,
  className: () => className,
})

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return <table data-slot="table" className={tableVariants({ className })} {...props} />
}
function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return <thead data-slot="table-header" className={cn("[&_tr]:border-b", className)} {...props} />
}
function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return <tbody data-slot="table-body" className={cn("[&_tr:last-child]:border-0", className)} {...props} />
}
function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return <tr data-slot="table-row" className={cn("state [--ds-state-base:var(--background)] border-b transition-colors data-[state=selected]:bg-primary-soft", className)} {...props} />
}
function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return <th data-slot="table-head" className={cn("h-10 px-2 text-left align-middle font-medium text-muted-foreground", className)} {...props} />
}
function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return <td data-slot="table-cell" className={cn("p-2 align-middle", className)} {...props} />
}
/* 합계 행의 면과 경계다(#170).
 *
 * `<tfoot>`은 합계·소계처럼 **본문 행들을 요약하는 행**의 자리다 — 표 시맨틱은 브라우저가
 * 지므로 DOM 어디에 쓰든 마지막에 그려지고 보조기술에는 rowgroup 하나로 읽힌다. 요약
 * 행의 첫 칸을 이름으로 읽히게 할지는 소비처가 `TableHead scope="row"`로 정한다 — 슬롯은
 * 자기가 담은 것이 이름인지 값인지 알 수 없다(`ItemMedia`의 대체 텍스트와 같은 자리, #145).
 *
 * **`bg-muted/50`을 그대로 가져오지 않는다.** upstream의 `.cn-table-footer`는 반투명
 * 면인데, 우리 매니페스트에 그대로 넣어 재어 보면 `background-color`가
 * `--ds-bg-subtle`로 **알파가 버려진 채** 해결된다 — 코드는 50%를 그리고 파생 채널은
 * 100%를 그리는데 그 어긋남을 보는 게이트가 없다. ADR-0006이 이름 붙인 "없는 것은
 * 통과가 아니라 침묵이다"가 값 층위에서 재현되는 자리다. 알파를 계약하려면
 * `--ds-bg-subtle`의 반투명 짝이 토큰으로 서야 하는데 그건 새 토큰이고 선제 공개하지
 * 않는다(#118·#165 규칙 5). 그래서 **`bg-muted`를 온전히 그린다** — 우리 계열에서
 * 머리글이 `text-muted-foreground`로, `Item`의 `muted` variant가 `bg-muted`로 이미 서
 * 있는 그 면이다. #165가 구분선에 대해 "복사해 오지 않는다"고 정한 것과 같은 자리다.
 *
 * **끝 행의 경계는 `[&_tr:last-child]:border-0`이다** — `TableBody`가 이미 쓰는 관용구
 * 그대로다. upstream의 `[&>tr]:last:border-b-0`을 축자로 옮기면 `[&>tr:last-child]`가
 * 되는데(ADR-0014: 사슬은 경로다) 그 수식자는 정책 표에 없어 `unresolved` 두 칸을
 * 새로 만든다. #140이 `unresolved`를 "전부 주인이 있는 10키/17셀"까지 좁혀 놓은
 * 자리에 주인 없는 둘을 더할 이유가 없고, 뜻도 같다.
 *
 * **sticky는 계약이 지지 않는다.** 스크롤 컨테이너가 없으면 `position: sticky`가
 * 걸릴 곳이 없는데 `Table` 루트는 `w-full`뿐이고 컨테이너는 소비처가 준다 — 게다가
 * `<tfoot>` 자체에 sticky를 걸면 브라우저마다 갈려 실제로는 `<th>`·`<td>`에 걸어야
 * 한다. 그건 셀마다 다른 결정이라 우리 셀이 아니고, `limits`가 이미 가상화·정렬을
 * 소비처에 둔 것과 같은 선이다. */
function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return <tfoot data-slot="table-footer" className={cn("border-t bg-muted font-medium [&_tr:last-child]:border-0", className)} {...props} />
}
function TableCaption({ className, ...props }: React.ComponentProps<"caption">) {
  return <caption data-slot="table-caption" className={cn("mt-4 text-sm text-muted-foreground", className)} {...props} />
}

const componentContract = {
  name: "table", source: "src/components/ui/table.tsx",
  publicExports: ["Table", "TableHeader", "TableBody", "TableFooter", "TableRow", "TableHead", "TableCell", "TableCaption", "tableVariants", "tableVariantsConfig"],
  config: tableVariantsConfig, className: (props: Record<string, string>) => cn(tableVariants(props)),
  anatomy: ["Table", "TableHeader", "TableBody", "TableFooter?", "TableRow*", "TableHead*", "TableCell*", "TableCaption?"],
  parts: {
    TableHeader: staticPart("[&_tr]:border-b"),
    TableBody: staticPart("[&_tr:last-child]:border-0"),
    TableFooter: staticPart("border-t bg-muted font-medium [&_tr:last-child]:border-0"),
    TableRow: staticPart("state [--ds-state-base:var(--background)] border-b transition-colors data-[state=selected]:bg-primary-soft"),
    TableHead: staticPart("h-10 px-2 text-left align-middle font-medium text-muted-foreground"),
    TableCell: staticPart("p-2 align-middle"),
    TableCaption: staticPart("mt-4 text-sm text-muted-foreground"),
  },
  configurationStates: { row: ["default", "selected"] }, drawnBy: { row: { attribute: "data-state", values: { selected: "selected" } } },
  behaviors: {},
  reference: { example: "table", guidance: {
    use: "열 의미가 있고 비교가 중요한 데스크톱 데이터를 표현한다.",
    evidence: "한국어 종목명·날짜·금액·양/음수 손익과 선택 가능한 투자 이력 행을 비교한다.",
    limits: "정렬·필터·페이지네이션·가상화와 데이터 모델은 소비처 책임이다. `TableFooter`는 `<tfoot>`이라 본문을 요약하는 합계·소계 행의 자리이고, 첫 칸을 이름으로 읽힐지는 `TableHead scope=\"row\"`로 정한다. sticky는 소비처가 스크롤 컨테이너와 함께 `<th>`·`<td>`에 건다.",
  } },
} as const
export { Table, TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell, TableCaption, tableVariants, tableVariantsConfig, componentContract }
