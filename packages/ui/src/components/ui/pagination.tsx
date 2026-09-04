import * as React from "react"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

const paginationVariantsConfig = { variants: {}, defaultVariants: {} } as const
const paginationVariants = cva("mx-auto flex w-full justify-center", paginationVariantsConfig)
const staticPart = (className: string) => ({
  config: { variants: {}, defaultVariants: {} } as const,
  className: () => className,
})

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return <nav role="navigation" aria-label="pagination" data-slot="pagination" className={cn(paginationVariants({ className }))} {...props} />
}

function PaginationContent({ className, ...props }: React.ComponentProps<"ul">) {
  return <ul data-slot="pagination-content" className={cn("flex flex-row items-center gap-1", className)} {...props} />
}

function PaginationItem(props: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />
}

type PaginationLinkProps = React.ComponentProps<"a"> & { isActive?: boolean; size?: "default" | "icon" }

function PaginationLink({ className, isActive, size = "icon", ...props }: PaginationLinkProps) {
  return <a aria-current={isActive ? "page" : undefined} data-slot="pagination-link" data-active={isActive || undefined} className={cn(buttonVariants({ variant: isActive ? "outline" : "ghost", size }), className)} {...props} />
}

/* 이전·다음의 문구는 children으로 소비처가 정한다 — upstream의 `text` prop에 해당하는
 * 자리이며, 문자열이라 파생 채널이 구분하지 않는다(#121). */
function PaginationPrevious({ className, ...props }: React.ComponentProps<typeof PaginationLink>) {
  return <PaginationLink aria-label="Go to previous page" size="default" className={cn("gap-1 px-2.5 sm:pl-2.5", className)} {...props}><svg aria-hidden="true" viewBox="0 0 16 16" className="size-4"><path d="m10 3-5 5 5 5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"/></svg><span className="hidden sm:block">Previous</span></PaginationLink>
}

function PaginationNext({ className, ...props }: React.ComponentProps<typeof PaginationLink>) {
  return <PaginationLink aria-label="Go to next page" size="default" className={cn("gap-1 px-2.5 sm:pr-2.5", className)} {...props}><span className="hidden sm:block">Next</span><svg aria-hidden="true" viewBox="0 0 16 16" className="size-4"><path d="m6 3 5 5-5 5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"/></svg></PaginationLink>
}

function PaginationEllipsis({ className, ...props }: React.ComponentProps<"span">) {
  return <span aria-hidden="true" data-slot="pagination-ellipsis" className={cn("flex size-9 items-center justify-center", className)} {...props}><svg viewBox="0 0 16 16" className="size-4"><circle cx="3" cy="8" r="1" fill="currentColor"/><circle cx="8" cy="8" r="1" fill="currentColor"/><circle cx="13" cy="8" r="1" fill="currentColor"/></svg><span className="sr-only">More pages</span></span>
}

const componentContract = {
  name: "pagination", source: "src/components/ui/pagination.tsx",
  publicExports: ["Pagination", "PaginationContent", "PaginationItem", "PaginationLink", "PaginationPrevious", "PaginationNext", "PaginationEllipsis", "paginationVariants", "paginationVariantsConfig"],
  config: paginationVariantsConfig, className: (props: Record<string, string>) => cn(paginationVariants(props)),
  anatomy: ["Pagination", "PaginationContent", "PaginationItem*", "PaginationPrevious?", "PaginationLink*", "PaginationEllipsis?", "PaginationNext?"], configurationStates: { currentPage: ["other", "current"] }, drawnBy: { currentPage: "`PaginationLink`가 현재 페이지에서 Button의 `outline` variant로 바뀐다 — 그리는 것은 Button 계약의 축이다" },
  parts: {
    PaginationContent: staticPart("flex flex-row items-center gap-1"),
    /* `PaginationLink`는 `variant`(현재 페이지 outline)와 `size`(default·icon)를 Button 계약의 축으로
     * 그린다 — 셀에 담는 것은 기본 조합(ghost·icon) 하나이고 나머지 토큰은 Button의 셀에 있다(ADR-0012의
     * `elsewhere:` 등급). parts 게이트가 그 주장을 `elsewhere: "button"`으로 되묻는다(#246). */
    PaginationLink: staticPart(buttonVariants({ variant: "ghost", size: "icon" })),
    PaginationPrevious: staticPart(cn(buttonVariants({ variant: "ghost", size: "default" }), "gap-1 px-2.5 sm:pl-2.5")),
    PaginationNext: staticPart(cn(buttonVariants({ variant: "ghost", size: "default" }), "gap-1 px-2.5 sm:pr-2.5")),
    PaginationEllipsis: staticPart("flex size-9 items-center justify-center"),
  },
  behaviors: {},
  reference: { example: "pagination", guidance: { use: "긴 결과 집합을 여러 페이지로 나누고 현재 페이지와 인접 이동을 링크로 제공한다.", evidence: "투자 이력처럼 전체 결과를 한 번에 표시하기 어려운 목록에서 URL로 복원 가능한 페이지 이동이 필요하다.", limits: "데이터가 적으면 한 페이지에 다 보이고, 연속 스크롤이 핵심인 흐름은 소비처가 자기 목록으로 푼다. 축약 뒤에도 현재 페이지·이전·다음 링크의 접근 가능한 이름과 기본 키보드 동작을 보존한다. 이전·다음의 문구는 children으로 정한다. 링크 크기(default·icon)는 Button 계약이 그린다 — 다른 크기는 Button `asChild`로." } },
} as const

export { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext, PaginationEllipsis, paginationVariants, paginationVariantsConfig, componentContract }
