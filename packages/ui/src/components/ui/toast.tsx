import * as React from "react"
import { Toast as ToastPrimitive } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const toastVariantsConfig = {
  variants: {
    variant: {
      default: "bg-background text-foreground",
      success: "bg-success-soft text-success-text",
      warning: "bg-warning-soft text-warning-text",
      destructive: "bg-destructive-soft text-destructive-text",
    },
  },
  defaultVariants: { variant: "default" },
} as const
const toastVariants = cva("relative flex w-full items-start justify-between gap-4 rounded-lg border p-4 shadow-lg", toastVariantsConfig)

const ToastProvider = ToastPrimitive.Provider
const ToastViewport = React.forwardRef<React.ElementRef<typeof ToastPrimitive.Viewport>, React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>>(
  ({ className, ...props }, ref) => <ToastPrimitive.Viewport ref={ref} data-slot="toast-viewport" className={cn("fixed right-0 bottom-0 z-50 flex max-h-screen w-full max-w-sm flex-col gap-2 p-4", className)} {...props} />,
)
ToastViewport.displayName = "ToastViewport"

const Toast = React.forwardRef<React.ElementRef<typeof ToastPrimitive.Root>, React.ComponentPropsWithoutRef<typeof ToastPrimitive.Root> & VariantProps<typeof toastVariants>>(
  ({ className, variant = "default", ...props }, ref) => <ToastPrimitive.Root ref={ref} data-slot="toast" className={cn(toastVariants({ variant, className }))} {...props} />,
)
Toast.displayName = "Toast"

function ToastTitle({ className, ...props }: React.ComponentProps<typeof ToastPrimitive.Title>) { return <ToastPrimitive.Title data-slot="toast-title" className={cn("font-medium", className)} {...props} /> }
function ToastDescription({ className, ...props }: React.ComponentProps<typeof ToastPrimitive.Description>) { return <ToastPrimitive.Description data-slot="toast-description" className={cn("text-sm", className)} {...props} /> }
function ToastAction({ className, ...props }: React.ComponentProps<typeof ToastPrimitive.Action>) { return <ToastPrimitive.Action data-slot="toast-action" className={cn("text-sm font-medium underline underline-offset-4", className)} {...props} /> }
function ToastClose({ className, ...props }: React.ComponentProps<typeof ToastPrimitive.Close>) { return <ToastPrimitive.Close data-slot="toast-close" aria-label="알림 닫기" className={cn("shrink-0 text-sm", className)} {...props}>닫기</ToastPrimitive.Close> }

const componentContract = {
  name: "toast", source: "src/components/ui/toast.tsx",
  publicExports: ["ToastProvider", "ToastViewport", "Toast", "ToastTitle", "ToastDescription", "ToastAction", "ToastClose", "toastVariants", "toastVariantsConfig"],
  config: toastVariantsConfig, className: (props: Record<string, string>) => cn(toastVariants(props)),
  anatomy: ["ToastProvider", "ToastViewport", "Toast", "ToastTitle?", "ToastDescription", "ToastAction?", "ToastClose?"], configurationStates: { open: ["closed", "open"] },
  reference: { example: "toast", guidance: { use: "사용자 작업 직후의 짧고 비차단적인 결과를 알리고 필요할 때 한 개의 후속 동작을 제공한다.", evidence: "거래 저장이나 동기화 완료를 현재 맥락을 가리지 않고 확인시켜야 한다.", limits: "전역 toast 큐와 명령형 호출 API는 소비처가 소유하며, 확인이 필요한 위험 행동에는 Alert Dialog를 사용한다." } },
} as const

export { ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription, ToastAction, ToastClose, toastVariants, toastVariantsConfig, componentContract }
