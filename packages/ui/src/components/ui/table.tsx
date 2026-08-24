import * as React from "react"

import { cn } from "@/lib/utils"

const tableVariantsConfig = { variants: {}, defaultVariants: {} } as const
const tableVariants = (options?: { className?: string }) => cn("w-full caption-bottom text-sm", options?.className)

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
function TableCaption({ className, ...props }: React.ComponentProps<"caption">) {
  return <caption data-slot="table-caption" className={cn("mt-4 text-sm text-muted-foreground", className)} {...props} />
}

const componentContract = {
  name: "table", source: "src/components/ui/table.tsx",
  publicExports: ["Table", "TableHeader", "TableBody", "TableRow", "TableHead", "TableCell", "TableCaption", "tableVariants", "tableVariantsConfig"],
  config: tableVariantsConfig, className: (props: Record<string, string>) => cn(tableVariants(props)),
  anatomy: ["Table", "TableHeader", "TableBody", "TableRow*", "TableHead*", "TableCell*", "TableCaption?"],
  configurationStates: { row: ["default", "selected"] },
  reference: { example: "table", guidance: { use: "열 의미가 있고 비교가 중요한 데스크톱 데이터를 표현한다.", evidence: "한국어 종목명·날짜·금액·양/음수 손익과 선택 가능한 투자 이력 행을 비교한다.", limits: "정렬·필터·페이지네이션·가상화와 데이터 모델은 소비처 책임이다." } },
} as const
export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption, tableVariants, tableVariantsConfig, componentContract }
