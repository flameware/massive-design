"use client"

import { Select as BaseSelect } from "@base-ui/react/select"
import { cva } from "class-variance-authority"
import type * as React from "react"

import { fieldControlBase } from "../lib/field-control.js"
import { cn } from "../lib/utils.js"

/* Base UI Select는 `value`/`defaultValue`(제어/비제어)와 `name`(폼 제출,
 * Field.Root 안이면 Form 필드 registry에도 스스로 등록 — select/root/
 * SelectRoot.mjs가 checkbox.tsx와 같은 `useRegisterFieldControl`을 쓴다)을
 * 이미 다 진다. 그래서 이 파일이 새로 놓는 배선은 없고, Base UI 문서의
 * anatomy를 그대로 따라가며 파트마다 색·치수만 입힌다(네임스페이스형 API,
 * ADR-0023 §5) — `Select.Root` 뒤 열넷.
 *
 * 트리거는 Input·Textarea와 같은 밑그림을 쓴다(lib/field-control.ts) — 셋
 * 다 "Field 안의 컨트롤"이라는 같은 역할이기 때문이다. 팝업 면은
 * `bg-overlay`(다이얼로그·팝오버 몫으로 이미 있는 semantic, color.json)를
 * 쓴다. */

const triggerVariants = cva([
  "flex h-9 w-full min-w-0 items-center justify-between gap-2 rounded-md border px-3 text-sm",
  "data-placeholder:text-muted",
  ...fieldControlBase,
])

export type SelectTriggerProps = Omit<React.ComponentPropsWithoutRef<typeof BaseSelect.Trigger>, "className"> & {
  className?: string
}

function SelectTrigger({ className, children, ...props }: SelectTriggerProps) {
  return (
    <BaseSelect.Trigger className={cn(triggerVariants(), className)} {...props}>
      {children}
      <SelectIcon />
    </BaseSelect.Trigger>
  )
}

/* 소비처가 직접 두지 않는다 — 트리거가 자기 화살표를 스스로 그린다(Button이
 * loading일 때 Spinner를 스스로 붙이는 것과 같은 이유, button.tsx). 여는
 * 상태에 따라 방향을 뒤집는 것은 CSS 회전 하나로 충분해 상태를 따로 읽지
 * 않는다 — `Select.Icon`은 항상 같은 자식을 그리고 열림 자체가 `data-open`을
 * 트리거에 남긴다(SelectTriggerDataAttributes의 `popupOpen`). */
function SelectIcon() {
  return (
    <BaseSelect.Icon className="text-muted transition-transform data-popup-open:rotate-180">
      <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className="size-4">
        <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </BaseSelect.Icon>
  )
}

export type SelectValueProps = Omit<React.ComponentPropsWithoutRef<typeof BaseSelect.Value>, "className"> & {
  className?: string
}

function SelectValue({ className, ...props }: SelectValueProps) {
  return <BaseSelect.Value className={cn("truncate", className)} {...props} />
}

export type SelectPortalProps = React.ComponentPropsWithoutRef<typeof BaseSelect.Portal>

function SelectPortal(props: SelectPortalProps) {
  return <BaseSelect.Portal {...props} />
}

const positionerVariants = cva("z-50 outline-none")

export type SelectPositionerProps = Omit<
  React.ComponentPropsWithoutRef<typeof BaseSelect.Positioner>,
  "className"
> & {
  className?: string
}

function SelectPositioner({ className, sideOffset = 4, ...props }: SelectPositionerProps) {
  return <BaseSelect.Positioner className={cn(positionerVariants(), className)} sideOffset={sideOffset} {...props} />
}

/* 뜬 면이라 그림자를 진다 — Card 같은 문서 흐름 안 표면은 그림자를 강제하지
 * 않지만(card.tsx, ADR-0023 §11), Menu·Dialog·Drawer·Tooltip은 문서 흐름
 * 밖에 떠서 다른 분리 단서가 없으므로 border 하나로는 부족하다(menu.tsx의
 * `shadow-md`, dialog/shared.tsx·drawer.tsx의 `shadow-lg`). Select의 팝업도
 * 같은 자리라 Menu와 같은 `shadow-md`를 쓴다. */
const popupVariants = cva([
  "max-h-[min(24rem,var(--available-height))] min-w-[var(--anchor-width)] overflow-y-auto",
  "rounded-md border bg-overlay p-1 shadow-md outline-none",
  "origin-[var(--transform-origin)] transition-[transform,opacity]",
  "data-starting-style:scale-95 data-starting-style:opacity-0",
  "data-ending-style:scale-95 data-ending-style:opacity-0",
])

export type SelectPopupProps = Omit<React.ComponentPropsWithoutRef<typeof BaseSelect.Popup>, "className"> & {
  className?: string
}

function SelectPopup({ className, ...props }: SelectPopupProps) {
  return <BaseSelect.Popup className={cn(popupVariants(), className)} {...props} />
}

export type SelectListProps = Omit<React.ComponentPropsWithoutRef<typeof BaseSelect.List>, "className"> & {
  className?: string
}

function SelectList({ className, ...props }: SelectListProps) {
  return <BaseSelect.List className={cn("flex flex-col", className)} {...props} />
}

/* `.state`가 `[data-highlighted]`를 이미 8%로 다룬다(state.css, #285) —
 * Select item도 Menu item과 같은 자리라 base를 조건 없이 준다(menu.tsx의
 * menuItemVariants와 같은 모양). 마우스 호버도 `highlightItemOnHover`
 * 기본값 때문에 같은 `data-highlighted`로 들어와 화살표 이동과 한 셀렉터를
 * 공유한다.
 *
 * base는 **팝업 자신의 면색**(`--ds-bg-overlay`)이다 — 쉬는 항목이 팝업과
 * 같은 색이라 보이지 않고, 8%가 불투명한 면 위에서 섞여 하이라이트만 뜬다.
 * 여기 회색(`neutral-soft`)이 있던 동안에는 선택되지 않은 항목까지 전부
 * 회색으로 깔려 선택과 하이라이트의 대비가 8%밖에 나지 않았다(#387).
 * 지우고 투명으로 두지는 않는다 — base가 없으면 color-mix가 투명 위에서
 * 일어나고 state.css가 경고한 @supports 폴백에 걸린다.
 *
 * 선택 표시는 오른쪽이다(`pr-8 pl-2` + ItemIndicator `right-2`) — 라벨이
 * 팝업 왼쪽에 정렬되어 트리거의 값 텍스트와 세로로 맞는다. Menu의
 * `CheckboxItem`은 흐름 안 왼쪽에 두는데(menu.tsx), 선택 표시와 체크박스
 * 상태는 다른 물건이라 방향이 갈리는 게 맞다. */
const itemVariants = cva([
  "relative flex cursor-default select-none items-center rounded-sm py-1.5 pr-8 pl-2 text-sm text-default outline-none",
  "state transition-[background-color]",
  "[--ds-state-base:var(--ds-bg-overlay)]",
  "data-disabled:pointer-events-none data-disabled:opacity-50",
])

export type SelectItemProps = Omit<React.ComponentPropsWithoutRef<typeof BaseSelect.Item>, "className"> & {
  className?: string
}

function SelectItem({ className, children, ...props }: SelectItemProps) {
  return (
    <BaseSelect.Item className={cn(itemVariants(), className)} {...props}>
      <BaseSelect.ItemIndicator className="absolute right-2 inline-flex items-center">
        <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className="size-3.5">
          <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </BaseSelect.ItemIndicator>
      <BaseSelect.ItemText>{children}</BaseSelect.ItemText>
    </BaseSelect.Item>
  )
}

export type SelectGroupProps = Omit<React.ComponentPropsWithoutRef<typeof BaseSelect.Group>, "className"> & {
  className?: string
}

function SelectGroup({ className, ...props }: SelectGroupProps) {
  return <BaseSelect.Group className={className} {...props} />
}

export type SelectGroupLabelProps = Omit<
  React.ComponentPropsWithoutRef<typeof BaseSelect.GroupLabel>,
  "className"
> & { className?: string }

function SelectGroupLabel({ className, ...props }: SelectGroupLabelProps) {
  return <BaseSelect.GroupLabel className={cn("px-3 py-1.5 text-xs font-medium text-muted", className)} {...props} />
}

export type SelectSeparatorProps = Omit<
  React.ComponentPropsWithoutRef<typeof BaseSelect.Separator>,
  "className"
> & { className?: string }

function SelectSeparator({ className, ...props }: SelectSeparatorProps) {
  return <BaseSelect.Separator className={cn("mx-1 my-1 h-px bg-subtle", className)} {...props} />
}

/**
 * 네임스페이스형 select. `Select.Root`가 제어/비제어·폼 제출(`name`)을 다
 * 진다 — 나머지는 파트마다 색과 치수만 입힌 Base UI 그대로다.
 *
 * 키보드는 Base UI가 준다: 화살표로 항목을 옮기고(`Enter`가 고르고 닫는다),
 * `Escape`로 닫는다, 타이핑하면 그 글자로 시작하는 항목으로 건너뛴다(typeahead).
 * 이 계약을 선언하는 자리는 Select.stories.tsx다.
 */
export const Select = {
  Root: BaseSelect.Root,
  Trigger: SelectTrigger,
  Value: SelectValue,
  Portal: SelectPortal,
  Positioner: SelectPositioner,
  Popup: SelectPopup,
  List: SelectList,
  Item: SelectItem,
  Group: SelectGroup,
  GroupLabel: SelectGroupLabel,
  Separator: SelectSeparator,
}
