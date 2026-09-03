import * as React from "react"
import { Dialog as DialogPrimitive } from "radix-ui"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const dialogVariantsConfig = { variants: {}, defaultVariants: {} } as const
const dialogVariants = cva("fixed top-1/2 left-1/2 grid w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 rounded-lg border bg-background p-6 text-foreground shadow-lg outline-none", dialogVariantsConfig)

function Dialog(props: React.ComponentProps<typeof DialogPrimitive.Root>) { return <DialogPrimitive.Root {...props} /> }
function DialogTrigger(props: React.ComponentProps<typeof DialogPrimitive.Trigger>) { return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} /> }
function DialogPortal(props: React.ComponentProps<typeof DialogPrimitive.Portal>) { return <DialogPrimitive.Portal {...props} /> }
function DialogClose(props: React.ComponentProps<typeof DialogPrimitive.Close>) { return <DialogPrimitive.Close data-slot="dialog-close" {...props} /> }
function DialogOverlay({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Overlay>) { return <DialogPrimitive.Overlay data-slot="dialog-overlay" className={cn("fixed inset-0 bg-black/50", className)} {...props} /> }
function DialogContent({ className, children, ...props }: React.ComponentProps<typeof DialogPrimitive.Content>) {
  return <DialogPortal><DialogOverlay/><DialogPrimitive.Content data-slot="dialog-content" className={cn(dialogVariants({ className }))} {...props}>{children}</DialogPrimitive.Content></DialogPortal>
}
function DialogHeader({ className, ...props }: React.ComponentProps<"div">) { return <div data-slot="dialog-header" className={cn("flex flex-col gap-2 text-center sm:text-left", className)} {...props} /> }
function DialogFooter({ className, ...props }: React.ComponentProps<"div">) { return <div data-slot="dialog-footer" className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)} {...props} /> }
function DialogTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) { return <DialogPrimitive.Title data-slot="dialog-title" className={cn("text-lg font-semibold", className)} {...props} /> }
function DialogDescription({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Description>) { return <DialogPrimitive.Description data-slot="dialog-description" className={cn("text-sm text-muted-foreground", className)} {...props} /> }

const componentContract = {
  name: "dialog", source: "src/components/ui/dialog.tsx",
  /* `DialogPortal`은 공개하지 않는다 — `DialogContent`가 스스로 Portal을 감싸므로 소비처가
   * 조립할 자리가 아니다. 공개돼 있던 동안에도 쓰면 Portal이 이중으로 생겨 `container`가
   * 무시됐다(#172, ADR-0018). 포탈 대상을 고르는 경로가 필요해지면 노드가 아니라
   * `DialogContent`의 prop으로 온다. */
  publicExports: ["Dialog", "DialogTrigger", "DialogClose", "DialogOverlay", "DialogContent", "DialogHeader", "DialogFooter", "DialogTitle", "DialogDescription", "dialogVariants", "dialogVariantsConfig"],
  config: dialogVariantsConfig, className: (props: Record<string, string>) => cn(dialogVariants(props)),
  anatomy: ["Dialog", "DialogTrigger", "DialogOverlay", "DialogContent", "DialogHeader?", "DialogTitle", "DialogDescription?", "DialogFooter?", "DialogClose?"],
  configurationStates: { open: ["closed", "open"] }, drawnBy: { open: "표면의 존재가 곧 열림이다 — 닫힌 상태에는 그릴 노드가 없다" },
  behaviors: {},
  reference: { example: "dialog", guidance: { use: "현재 흐름을 잠시 멈추고 집중해서 완료할 작업을 연다.", evidence: "투자 거래를 추가하거나 편집하는 동안 제목·설명·행동을 한 모달 맥락에 유지해야 한다.", limits: "파괴적 행동 확인에는 Alert Dialog를, 단순 보조 정보에는 Popover를 쓴다. `DialogPortal`은 공개하지 않는다 — 포탈 대상을 골라야 하면 노드가 아니라 `DialogContent`의 prop으로 온다 — 근거: ADR-0018" } },
} as const

export { Dialog, DialogTrigger, DialogClose, DialogOverlay, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, dialogVariants, dialogVariantsConfig, componentContract }
