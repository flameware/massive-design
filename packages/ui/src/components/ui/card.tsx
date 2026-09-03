import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// Card는 variant 축이 없다 — #51은 카탈로그 확장이 아니라 #34가 역산한 화면
// 조립이 목적이라 축을 늘리지 않는다. config를 그래도 내보내는 것은 매니페스트
// 생성기가 손으로 적은 축 사본 없이 컴포넌트의 cva config를 그대로 읽기
// 때문이다(#22 §7, button.tsx 상단 주석과 동일한 이유).
// upstream의 `size` 축(default/sm)도 열지 않는다 — 축은 늘지만 간격은 소비처가
// 유틸리티로 정하면 되고 우리 스케일 결정을 복제하지 않는다(#121).
const cardVariantsConfig = {
  variants: {},
  defaultVariants: {},
} as const

const cardVariants = cva(
  "flex flex-col gap-6 rounded-xl border bg-card py-6 text-card-foreground shadow-sm",
  cardVariantsConfig
)

function Card({
  className,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof cardVariants>) {
  return (
    <div
      data-slot="card"
      data-component="card"
      className={cn(cardVariants({ className }))}
      {...props}
    />
  )
}

const HEADER = "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6"
const TITLE = "leading-none font-semibold"
const DESCRIPTION = "text-sm text-muted-foreground"
const ACTION = "col-start-2 row-span-2 row-start-1 self-start justify-self-end"
const CONTENT = "px-6"
const FOOTER = "flex items-center px-6 [.border-t]:pt-6"

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(HEADER, className)}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn(TITLE, className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn(DESCRIPTION, className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(ACTION, className)}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn(CONTENT, className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(FOOTER, className)}
      {...props}
    />
  )
}

const staticPart = (className: string) => ({
  config: { variants: {}, defaultVariants: {} } as const,
  className: () => className,
})

const componentContract = {
  name: "card", source: "src/components/ui/card.tsx",
  publicExports: ["Card", "CardHeader", "CardFooter", "CardTitle", "CardAction", "CardDescription", "CardContent", "cardVariants", "cardVariantsConfig"],
  config: cardVariantsConfig, className: (props: Record<string, string>) => cn(cardVariants(props)),
  anatomy: ["Card", "CardHeader?", "CardTitle?", "CardDescription?", "CardAction?", "CardContent?", "CardFooter?"],
  configurationStates: {},
  parts: {
    CardHeader: staticPart(HEADER),
    CardTitle: staticPart(TITLE),
    CardDescription: staticPart(DESCRIPTION),
    CardAction: staticPart(ACTION),
    CardContent: staticPart(CONTENT),
    CardFooter: staticPart(FOOTER),
  },
  behaviors: {},
  reference: { example: "card", guidance: { use: "관련 콘텐츠를 하나의 표면으로 묶는다.", evidence: "투자 이력의 요약 영역에서 기존 Card를 재사용한다.", limits: "SummaryCard 같은 도메인 컴포넌트를 만들지 않고 기존 Card 파트로 조립한다. `size` 축(upstream의 default/sm)은 열지 않는다 — 간격은 소비처가 유틸리티로 정한다." } },
} as const

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  cardVariants,
  cardVariantsConfig,
  componentContract,
}
