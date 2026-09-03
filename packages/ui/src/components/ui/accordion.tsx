import * as React from "react"
import { Accordion as AccordionPrimitive } from "radix-ui"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

const accordionVariantsConfig = { variants: {}, defaultVariants: {} } as const
const accordionVariants = cva("w-full", accordionVariantsConfig)

function Accordion({ className, ...props }: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return <AccordionPrimitive.Root data-slot="accordion" className={cn(accordionVariants({ className }))} {...props} />
}

const ITEM = "border-b last:border-b-0"
const TRIGGER = "state [--ds-state-base:var(--background)] flex flex-1 items-center justify-between gap-4 rounded-md py-4 text-left text-sm font-medium outline-none transition-all hover:underline focus-visible:border-focus-contrast focus-visible:ring-[3px] focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180"
const CONTENT = "overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"

function AccordionItem({ className, ...props }: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return <AccordionPrimitive.Item data-slot="accordion-item" className={cn(ITEM, className)} {...props} />
}

function AccordionTrigger({ className, children, ...props }: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return <AccordionPrimitive.Header className="flex"><AccordionPrimitive.Trigger data-slot="accordion-trigger" className={cn(TRIGGER, className)} {...props}>{children}<svg aria-hidden="true" viewBox="0 0 16 16" className="size-4 shrink-0 transition-transform"><path d="m4 6 4 4 4-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" /></svg></AccordionPrimitive.Trigger></AccordionPrimitive.Header>
}

function AccordionContent({ className, children, ...props }: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return <AccordionPrimitive.Content data-slot="accordion-content" className={CONTENT} {...props}><div className={cn("pb-4 pt-0", className)}>{children}</div></AccordionPrimitive.Content>
}

const staticPart = (className: string) => ({
  config: { variants: {}, defaultVariants: {} } as const,
  className: () => className,
})

const componentContract = {
  name: "accordion", source: "src/components/ui/accordion.tsx",
  publicExports: ["Accordion", "AccordionItem", "AccordionTrigger", "AccordionContent", "accordionVariants", "accordionVariantsConfig"],
  config: accordionVariantsConfig, className: (props: Record<string, string>) => cn(accordionVariants(props)),
  anatomy: ["Accordion", "AccordionItem*", "AccordionTrigger", "AccordionContent"], configurationStates: { expansion: ["single", "multiple"], open: ["closed", "open"] }, drawnBy: { expansion: "`type` prop이 고르는 조립이 그린다 — 여러 항목이 동시에 열릴 수 있는지는 클래스가 아니라 primitive의 동작이다", open: { attribute: "data-state", values: { open: "open" } } },
  parts: {
    AccordionItem: staticPart(ITEM),
    AccordionTrigger: staticPart(TRIGGER),
    AccordionContent: staticPart(CONTENT),
  },
  behaviors: {},
  reference: { example: "accordion", guidance: { use: "관련된 여러 섹션의 제목을 훑고 필요한 내용을 하나 또는 여러 개 펼친다.", evidence: "설정·도움말처럼 제목별로 나뉜 긴 보조 정보를 좁은 화면에서 단계적으로 확인해야 한다.", limits: "순서가 필수인 절차, 항상 보여야 하는 핵심 정보, 서로 무관한 동작 모음에는 사용하지 않는다." } },
} as const

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent, accordionVariants, accordionVariantsConfig, componentContract }
