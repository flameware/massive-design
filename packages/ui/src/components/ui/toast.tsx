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
/* Toast는 오른쪽 스와이프로 닫힌다. 우리가 구현한 것이 아니라 `radix-ui` Toast가
 * 기본값(`swipeDirection: "right"`, `swipeThreshold: 50`)으로 갖고 오는 **상속 표면**이며,
 * 우리는 물리를 소유하지 않는다. 우리 것은 아래 세 줄 — 끄는 동안 손가락을 따라오고,
 * 놓으면 제자리로 돌아오고, 임계값을 넘기면 그 방향으로 빠진다. 이 피드백이 없으면
 * 사용자는 꿈쩍 않는 토스트를 끌다가 50px에서 그것이 사라지는 것을 본다(#110). */
const toastVariants = cva(
  "relative flex w-full items-start justify-between gap-4 rounded-lg border p-4 shadow-lg " +
    "data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none " +
    "data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition-transform " +
    "data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)]",
  toastVariantsConfig,
)

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
/* 히트 영역  가로(24.2px)는 이미 하한을 만족하고 세로(22.4px, `text-sm`의 줄높이)만
 * 1.6px 모자란다 — `after:`로 세로만 중심 대칭 ±0.8px 넓힌다(#111 결정 2·5, #230).
 * 같은 22.4px 계열인 Toast action·Breadcrumb link·Sidebar menu-action(세로)은
 * 줄높이·패딩이 원인이라 기제가 다를 수 있어 #249로 갈렸다 — ToastClose는 버튼
 * 하나뿐이라 `after:` 확장으로 충분해 여기 남았다(#111 범위 갱신 댓글). */
function ToastClose({ className, ...props }: React.ComponentProps<typeof ToastPrimitive.Close>) { return <ToastPrimitive.Close data-slot="toast-close" aria-label="알림 닫기" className={cn("relative shrink-0 text-sm after:absolute after:inset-x-0 after:-inset-y-[0.8px]", className)} {...props}>닫기</ToastPrimitive.Close> }

const componentContract = {
  name: "toast", source: "src/components/ui/toast.tsx",
  publicExports: ["ToastProvider", "ToastViewport", "Toast", "ToastTitle", "ToastDescription", "ToastAction", "ToastClose", "toastVariants", "toastVariantsConfig"],
  config: toastVariantsConfig, className: (props: Record<string, string>) => cn(toastVariants(props)),
  anatomy: ["ToastProvider", "ToastViewport", "Toast", "ToastTitle?", "ToastDescription", "ToastAction?", "ToastClose?"], configurationStates: { open: ["closed", "open"] }, drawnBy: { open: "표면의 존재가 곧 열림이다 — viewport에 붙고 떨어지는 것이 전부다" },
  gestures: {
    "swipe-dismiss": {
      surface: "Toast",
      feedback: "data-[swipe=move]",
      equivalent: "ToastClose",
      why: "radix-ui Toast가 기본값으로 갖고 오는 상속 표면이다 — 오른쪽으로 임계값만큼 끌면 닫힌다. 제스처 물리는 upstream이 소유하므로 방향·임계값은 계약하지 않는다. 우리가 지는 것은 이 표면이 제스처로 닫힌다는 사실, 끄는 동안의 시각 피드백, 그리고 제스처를 쓸 수 없는 사용자를 위한 동등 경로다.",
    },
  },
  behaviors: {
    autoDismiss: { kind: "implicit-change", surface: "Toast", origin: "inherited", control: "duration", why: "`ToastProvider`를 `ToastPrimitive.Provider` 그대로 통과시키므로 `duration` 기본값 5000ms를 상속한다 — **아무도 아무것도 하지 않아도 토스트가 스스로 사라진다.** 스와이프는 `gestures`가 담지만 저쪽은 사람이 하는 dismiss이고 이것은 시간이 계기다. 포인터가 얹히거나 초점이 안으로 들어오면 타이머가 멈추고 나가면 이어지는 것도 upstream이 갖고 오며, 그 멈춤이 WCAG 2.2.1이 요구하는 유일한 연장 수단이다 — 값은 계약하지 않으므로(ADR-0005) 5000ms가 그대로인지는 사람이 본다. 소비처가 `duration`으로 바꾼다(#187)." },
  },
  reference: { example: "toast", guidance: { use: "사용자 작업 직후의 짧고 비차단적인 결과를 알리고 필요할 때 한 개의 후속 동작을 제공한다.", evidence: "거래 저장이나 동기화 완료를 현재 맥락을 가리지 않고 확인시켜야 한다.", limits: "전역 toast 큐와 명령형 호출 API는 소비처가 소유하며, 확인이 필요한 위험 행동에는 Alert Dialog를 사용한다. 오른쪽 스와이프로 닫히지만 그 방향과 임계값은 계약하지 않는다 — 제스처를 쓸 수 없는 사용자는 ToastClose로 동등하게 닫는다." } },
} as const

export { ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription, ToastAction, ToastClose, toastVariants, toastVariantsConfig, componentContract }
