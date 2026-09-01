import * as React from "react"
import { Slot } from "radix-ui"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

const breadcrumbVariantsConfig = { variants: {}, defaultVariants: {} } as const
const breadcrumbVariants = cva("", breadcrumbVariantsConfig)
const staticPart = (className: string) => ({
  config: { variants: {}, defaultVariants: {} } as const,
  className: () => className,
})

function Breadcrumb({ className, ...props }: React.ComponentProps<"nav">) {
  return <nav aria-label="breadcrumb" data-slot="breadcrumb" className={cn(breadcrumbVariants({ className }))} {...props} />
}

function BreadcrumbList({ className, ...props }: React.ComponentProps<"ol">) {
  return <ol data-slot="breadcrumb-list" className={cn("flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground sm:gap-2.5", className)} {...props} />
}

function BreadcrumbItem({ className, ...props }: React.ComponentProps<"li">) {
  return <li data-slot="breadcrumb-item" className={cn("inline-flex items-center gap-1.5", className)} {...props} />
}

function BreadcrumbLink({ asChild = false, className, ...props }: React.ComponentProps<"a"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "a"
  return <Comp data-slot="breadcrumb-link" className={cn("rounded-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring", className)} {...props} />
}

function BreadcrumbPage({ className, ...props }: React.ComponentProps<"span">) {
  return <span aria-current="page" aria-disabled="true" data-slot="breadcrumb-page" className={cn("font-normal text-foreground", className)} {...props} />
}

function BreadcrumbSeparator({ children, className, ...props }: React.ComponentProps<"li">) {
  return <li role="presentation" aria-hidden="true" data-slot="breadcrumb-separator" className={cn("[&>svg]:size-3.5", className)} {...props}>{children ?? <svg viewBox="0 0 16 16"><path d="m6 3 5 5-5 5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" /></svg>}</li>
}

function BreadcrumbEllipsis({ className, ...props }: React.ComponentProps<"span">) {
  return <span role="presentation" aria-hidden="true" data-slot="breadcrumb-ellipsis" className={cn("flex size-9 items-center justify-center", className)} {...props}><svg viewBox="0 0 16 16" className="size-4"><circle cx="3" cy="8" r="1" fill="currentColor"/><circle cx="8" cy="8" r="1" fill="currentColor"/><circle cx="13" cy="8" r="1" fill="currentColor"/></svg><span className="sr-only">More</span></span>
}

const componentContract = {
  name: "breadcrumb", source: "src/components/ui/breadcrumb.tsx",
  publicExports: ["Breadcrumb", "BreadcrumbList", "BreadcrumbItem", "BreadcrumbLink", "BreadcrumbPage", "BreadcrumbSeparator", "BreadcrumbEllipsis", "breadcrumbVariants", "breadcrumbVariantsConfig"],
  config: breadcrumbVariantsConfig, className: (props: Record<string, string>) => cn(breadcrumbVariants(props)),
  anatomy: ["Breadcrumb", "BreadcrumbList", "BreadcrumbItem*", "BreadcrumbLink*", "BreadcrumbPage", "BreadcrumbSeparator*", "BreadcrumbEllipsis?"], configurationStates: { currentLocation: ["ancestor", "current"] }, drawnBy: { currentLocation: "값마다 파트가 다르다 — `BreadcrumbPage`가 현재이고 `BreadcrumbLink`가 조상이다" },
  parts: {
    BreadcrumbList: staticPart("flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground sm:gap-2.5"),
    BreadcrumbItem: staticPart("inline-flex items-center gap-1.5"),
    BreadcrumbLink: staticPart("rounded-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring"),
    BreadcrumbPage: staticPart("font-normal text-foreground"),
    BreadcrumbSeparator: staticPart("[&>svg]:size-3.5"),
    BreadcrumbEllipsis: staticPart("flex size-9 items-center justify-center"),
  },
  behaviors: {},
  reference: { example: "breadcrumb", guidance: { use: "현재 위치의 상위 계층을 링크로 제공하고 마지막 항목을 현재 위치로 표시한다.", evidence: "깊은 설정이나 상세 화면에서 사용자가 상위 범위로 되돌아갈 수 있는 짧은 경로가 필요하다.", limits: "단일 단계 화면이나 선형 진행 상황에는 사용하지 않으며, 긴 경로를 축약해도 현재 위치와 접근 가능한 탐색 이름은 유지한다." } },
} as const

export { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator, BreadcrumbEllipsis, breadcrumbVariants, breadcrumbVariantsConfig, componentContract }
