import * as React from "react"
import { AlertDialog as AlertDialogPrimitive } from "radix-ui"
import { cva } from "class-variance-authority"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const alertDialogVariantsConfig = { variants: {}, defaultVariants: {} } as const
const alertDialogVariants = cva(
  "fixed top-1/2 left-1/2 grid w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 rounded-lg border bg-background p-6 text-foreground shadow-lg outline-none",
  alertDialogVariantsConfig,
)

function AlertDialog(props: React.ComponentProps<typeof AlertDialogPrimitive.Root>) {
  return <AlertDialogPrimitive.Root {...props} />
}

function AlertDialogTrigger(props: React.ComponentProps<typeof AlertDialogPrimitive.Trigger>) {
  return <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />
}

function AlertDialogPortal(props: React.ComponentProps<typeof AlertDialogPrimitive.Portal>) {
  return <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />
}

function AlertDialogOverlay({ className, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Overlay>) {
  return <AlertDialogPrimitive.Overlay data-slot="alert-dialog-overlay" className={cn("fixed inset-0 bg-black/50", className)} {...props} />
}

function AlertDialogContent({ className, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Content>) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        data-slot="alert-dialog-content"
        className={cn(alertDialogVariants({ className }))}
        {...props}
      />
    </AlertDialogPortal>
  )
}

function AlertDialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="alert-dialog-header" className={cn("flex flex-col gap-2 text-center sm:text-left", className)} {...props} />
}

function AlertDialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="alert-dialog-footer" className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)} {...props} />
}

function AlertDialogTitle({ className, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return <AlertDialogPrimitive.Title data-slot="alert-dialog-title" className={cn("text-lg font-semibold", className)} {...props} />
}

function AlertDialogDescription({ className, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return <AlertDialogPrimitive.Description data-slot="alert-dialog-description" className={cn("text-sm text-muted-foreground", className)} {...props} />
}

function AlertDialogAction({ className, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Action>) {
  return <AlertDialogPrimitive.Action data-slot="alert-dialog-action" className={cn(buttonVariants(), className)} {...props} />
}

function AlertDialogCancel({ className, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Cancel>) {
  return <AlertDialogPrimitive.Cancel data-slot="alert-dialog-cancel" className={cn(buttonVariants({ variant: "outline" }), className)} {...props} />
}

const componentContract = {
  name: "alert-dialog",
  source: "src/components/ui/alert-dialog.tsx",
  publicExports: [
    "AlertDialog", "AlertDialogTrigger", "AlertDialogPortal", "AlertDialogOverlay",
    "AlertDialogContent", "AlertDialogHeader", "AlertDialogFooter", "AlertDialogTitle",
    "AlertDialogDescription", "AlertDialogAction", "AlertDialogCancel",
    "alertDialogVariants", "alertDialogVariantsConfig",
  ],
  config: alertDialogVariantsConfig,
  className: (props: Record<string, string>) => cn(alertDialogVariants(props)),
  anatomy: [
    "AlertDialog", "AlertDialogTrigger", "AlertDialogPortal", "AlertDialogOverlay",
    "AlertDialogContent", "AlertDialogHeader?", "AlertDialogTitle",
    "AlertDialogDescription", "AlertDialogFooter", "AlertDialogCancel", "AlertDialogAction",
  ],
  configurationStates: { open: ["closed", "open"] },
  reference: {
    example: "alert-dialog",
    guidance: {
      use: "되돌리기 어렵거나 중요한 행동을 실행하기 직전에 결과를 설명하고 명시적인 확인을 받는다.",
      evidence: "투자 거래 삭제는 기록과 손익 계산에 영향을 주므로 실행과 취소의 의미를 분리해 확인해야 한다.",
      limits: "일반 정보, 양식 입력, 되돌리기 쉬운 행동에는 Dialog를 사용하고 Alert Dialog를 반복적인 확인 단계로 만들지 않는다.",
    },
  },
} as const

export {
  AlertDialog, AlertDialogTrigger, AlertDialogPortal, AlertDialogOverlay,
  AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle,
  AlertDialogDescription, AlertDialogAction, AlertDialogCancel,
  alertDialogVariants, alertDialogVariantsConfig, componentContract,
}
