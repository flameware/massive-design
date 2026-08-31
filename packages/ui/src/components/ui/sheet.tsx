import * as React from "react"
import { Dialog as SheetPrimitive } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/* Sheet은 Dialog와 같은 모달 계약(포커스 트랩·Esc·바깥 클릭 닫기·본문 스크롤 잠금)을
 * 쓰되, 화면 중앙이 아니라 **화면 가장자리**에 고정된다. 그래서 공개 축은 크기가 아니라
 * 붙는 변(side) 하나다 — side는 배치 축이지 동작 축이 아니며, 어느 값을 골라도 모달
 * 동작은 같다. 동작이 달라지는 표면(끌어서 닫기 등)은 Sheet의 side 값이 아니라 별도
 * 컴포넌트의 결정이다(#97). */
const sheetVariantsConfig = {
  variants: {
    side: {
      top: "inset-x-0 top-0 max-h-[80vh] w-full border-b",
      right: "inset-y-0 right-0 h-full w-3/4 max-w-sm border-l",
      bottom: "inset-x-0 bottom-0 max-h-[80vh] w-full border-t",
      left: "inset-y-0 left-0 h-full w-3/4 max-w-sm border-r",
    },
  },
  defaultVariants: { side: "right" },
} as const

const sheetVariants = cva("fixed flex flex-col gap-4 overflow-y-auto bg-background p-6 text-foreground shadow-lg outline-none", sheetVariantsConfig)
type SheetStyleProps = VariantProps<typeof sheetVariants>

function Sheet(props: React.ComponentProps<typeof SheetPrimitive.Root>) { return <SheetPrimitive.Root {...props} /> }
function SheetTrigger(props: React.ComponentProps<typeof SheetPrimitive.Trigger>) { return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} /> }
function SheetPortal(props: React.ComponentProps<typeof SheetPrimitive.Portal>) { return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} /> }
function SheetClose(props: React.ComponentProps<typeof SheetPrimitive.Close>) { return <SheetPrimitive.Close data-slot="sheet-close" {...props} /> }
function SheetOverlay({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Overlay>) { return <SheetPrimitive.Overlay data-slot="sheet-overlay" className={cn("fixed inset-0 bg-black/50", className)} {...props} /> }

function SheetContent({ className, children, side = "right", ...props }: React.ComponentProps<typeof SheetPrimitive.Content> & SheetStyleProps) {
  return <SheetPortal><SheetOverlay/><SheetPrimitive.Content data-slot="sheet-content" data-side={side} className={cn(sheetVariants({ side, className }))} {...props}>{children}</SheetPrimitive.Content></SheetPortal>
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) { return <div data-slot="sheet-header" className={cn("flex flex-col gap-2 text-left", className)} {...props} /> }
function SheetFooter({ className, ...props }: React.ComponentProps<"div">) { return <div data-slot="sheet-footer" className={cn("mt-auto flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)} {...props} /> }
function SheetTitle({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Title>) { return <SheetPrimitive.Title data-slot="sheet-title" className={cn("text-lg font-semibold", className)} {...props} /> }
function SheetDescription({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Description>) { return <SheetPrimitive.Description data-slot="sheet-description" className={cn("text-sm text-muted-foreground", className)} {...props} /> }

const componentContract = {
  name: "sheet", source: "src/components/ui/sheet.tsx",
  publicExports: ["Sheet", "SheetTrigger", "SheetPortal", "SheetClose", "SheetOverlay", "SheetContent", "SheetHeader", "SheetFooter", "SheetTitle", "SheetDescription", "sheetVariants", "sheetVariantsConfig"],
  config: sheetVariantsConfig, className: (props: Record<string, string>) => cn(sheetVariants(props)),
  anatomy: ["Sheet", "SheetTrigger", "SheetPortal", "SheetOverlay", "SheetContent", "SheetHeader?", "SheetTitle", "SheetDescription?", "SheetFooter?", "SheetClose?"],
  configurationStates: { open: ["closed", "open"] },
  reference: { example: "sheet", guidance: { use: "본문을 덮지 않고 화면 가장자리에서 열리는 모달 표면으로, 원래 맥락을 유지한 채 필터·상세·보조 편집을 옆에서 처리한다. side는 붙는 변만 정하고 열리는 동안의 동작(포커스 트랩·Esc와 바깥 클릭으로 닫기·본문 스크롤 잠금·닫은 뒤 트리거로 초점 복귀)은 네 값이 모두 같다.", evidence: "투자 이력 화면에서 목록을 보면서 시장·기간·손익 필터를 조정하거나 한 거래의 상세를 확인해야 하고, 화면 중앙을 가리면 방금 본 행을 놓친다.", limits: "화면 중앙에서 흐름을 멈추고 끝내야 하는 작업은 Dialog, 파괴적 확인은 Alert Dialog, 배경과 상호작용이 이어져야 하는 보조 정보는 Popover를 쓴다. Sheet은 항상 모달이므로 비모달 패널이나 접근 가능한 이름 없는 표면으로 쓰지 않으며, SheetTitle은 생략할 수 없다." } },
} as const

export { Sheet, SheetTrigger, SheetPortal, SheetClose, SheetOverlay, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription, sheetVariants, sheetVariantsConfig, componentContract }
