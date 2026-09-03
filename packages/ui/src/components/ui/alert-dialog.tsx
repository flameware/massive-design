import * as React from "react"
import { AlertDialog as AlertDialogPrimitive } from "radix-ui"
import { cva } from "class-variance-authority"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/* `size` 축은 열지 않는다 — size는 소비처가 유틸리티로 정할 수 있다(#121). */
const alertDialogVariantsConfig = { variants: {}, defaultVariants: {} } as const
const alertDialogVariants = cva(
  "fixed top-1/2 left-1/2 grid w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 rounded-lg border bg-background p-6 text-foreground shadow-lg outline-none",
  alertDialogVariantsConfig,
)

const OVERLAY = "fixed inset-0 bg-black/50"
const HEADER = "flex flex-col gap-2 text-center sm:text-left"
const FOOTER = "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"
const TITLE = "text-lg font-semibold"
const DESCRIPTION = "text-sm text-muted-foreground"
const ACTION = buttonVariants()
const CANCEL = buttonVariants({ variant: "outline" })

function AlertDialog(props: React.ComponentProps<typeof AlertDialogPrimitive.Root>) {
  return <AlertDialogPrimitive.Root {...props} />
}

function AlertDialogTrigger(props: React.ComponentProps<typeof AlertDialogPrimitive.Trigger>) {
  return <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />
}

function AlertDialogPortal(props: React.ComponentProps<typeof AlertDialogPrimitive.Portal>) {
  return <AlertDialogPrimitive.Portal {...props} />
}

function AlertDialogOverlay({ className, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Overlay>) {
  return <AlertDialogPrimitive.Overlay data-slot="alert-dialog-overlay" className={cn(OVERLAY, className)} {...props} />
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
  return <div data-slot="alert-dialog-header" className={cn(HEADER, className)} {...props} />
}

function AlertDialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="alert-dialog-footer" className={cn(FOOTER, className)} {...props} />
}

function AlertDialogTitle({ className, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return <AlertDialogPrimitive.Title data-slot="alert-dialog-title" className={cn(TITLE, className)} {...props} />
}

function AlertDialogDescription({ className, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return <AlertDialogPrimitive.Description data-slot="alert-dialog-description" className={cn(DESCRIPTION, className)} {...props} />
}

function AlertDialogAction({ className, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Action>) {
  return <AlertDialogPrimitive.Action data-slot="alert-dialog-action" className={cn(ACTION, className)} {...props} />
}

function AlertDialogCancel({ className, ...props }: React.ComponentProps<typeof AlertDialogPrimitive.Cancel>) {
  return <AlertDialogPrimitive.Cancel data-slot="alert-dialog-cancel" className={cn(CANCEL, className)} {...props} />
}

const staticPart = (className: string) => ({
  config: { variants: {}, defaultVariants: {} } as const,
  className: () => className,
})

const componentContract = {
  name: "alert-dialog",
  source: "src/components/ui/alert-dialog.tsx",
  /* `AlertDialogPortal`은 공개하지 않는다 — `AlertDialogContent`가 스스로 Portal을 감싸므로
   * 소비처가 조립할 자리가 아니다. 공개돼 있던 동안에도 쓰면 Portal이 이중으로 생겨
   * `container`가 무시됐다(#172, ADR-0018). 포탈 대상을 고르는 경로가 필요해지면 노드가
   * 아니라 `AlertDialogContent`의 prop으로 온다. */
  publicExports: [
    "AlertDialog", "AlertDialogTrigger", "AlertDialogOverlay",
    "AlertDialogContent", "AlertDialogHeader", "AlertDialogFooter", "AlertDialogTitle",
    "AlertDialogDescription", "AlertDialogAction", "AlertDialogCancel",
    "alertDialogVariants", "alertDialogVariantsConfig",
  ],
  config: alertDialogVariantsConfig,
  className: (props: Record<string, string>) => cn(alertDialogVariants(props)),
  /* `AlertDialogMedia`는 열지 않는다 — Dialog에는 없어 두 컴포넌트의 anatomy를 갈라놓는
   * upstream의 비대칭이라 승계할 근거가 없다(#121). */
  anatomy: [
    "AlertDialog", "AlertDialogTrigger", "AlertDialogOverlay",
    "AlertDialogContent", "AlertDialogHeader?", "AlertDialogTitle",
    "AlertDialogDescription", "AlertDialogFooter", "AlertDialogCancel", "AlertDialogAction",
  ],
  configurationStates: { open: ["closed", "open"] }, drawnBy: { open: "표면의 존재가 곧 열림이다 — 닫힌 상태에는 그릴 노드가 없다" },
  parts: {
    AlertDialogOverlay: staticPart(OVERLAY),
    AlertDialogHeader: staticPart(HEADER),
    AlertDialogFooter: staticPart(FOOTER),
    AlertDialogTitle: staticPart(TITLE),
    AlertDialogDescription: staticPart(DESCRIPTION),
    AlertDialogAction: staticPart(ACTION),
    AlertDialogCancel: staticPart(CANCEL),
  },
  behaviors: {},
  reference: {
    example: "alert-dialog",
    guidance: {
      use: "되돌리기 어렵거나 중요한 행동을 실행하기 직전에 결과를 설명하고 명시적인 확인을 받는다.",
      evidence: "투자 거래 삭제는 기록과 손익 계산에 영향을 주므로 실행과 취소의 의미를 분리해 확인해야 한다.",
      limits: "일반 정보·양식·되돌리기 쉬운 행동은 Dialog로 가고 반복 확인 단계로 쓰지 않는다. `size` 축·`AlertDialogMedia`는 열지 않고 크기는 유틸리티로 정한다. `AlertDialogPortal`은 공개하지 않고 포탈 대상은 `AlertDialogContent`의 prop으로 온다 — 근거: ADR-0018",
    },
  },
} as const

export {
  AlertDialog, AlertDialogTrigger, AlertDialogOverlay,
  AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle,
  AlertDialogDescription, AlertDialogAction, AlertDialogCancel,
  alertDialogVariants, alertDialogVariantsConfig, componentContract,
}
