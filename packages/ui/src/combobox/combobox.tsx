"use client"

import { Combobox as BaseCombobox } from "@base-ui/react/combobox"
import type {
  ComboboxEmptyProps as BaseComboboxEmptyProps,
  ComboboxInputProps as BaseComboboxInputProps,
  ComboboxItemProps as BaseComboboxItemProps,
  ComboboxListProps as BaseComboboxListProps,
  ComboboxPopupProps as BaseComboboxPopupProps,
  ComboboxPositionerProps as BaseComboboxPositionerProps,
  ComboboxRootProps as BaseComboboxRootProps,
  ComboboxStatusProps as BaseComboboxStatusProps,
} from "@base-ui/react/combobox"
import { cva } from "class-variance-authority"
import type * as React from "react"

import { fieldControlBase } from "../lib/field-control.js"
import { cn } from "../lib/utils.js"

/* Base UI가 v1.8에서 `Combobox`를 통째로 낸다 — 입력·필터·목록·키보드 탐색·
 * Field 연결까지 하나의 primitive다(스펙 #275 스토리 29, ADR-0023 §2). 1세대
 * rules.md("무엇이 컴포넌트가 되는가")가 남긴 "조립은 원본을 소비한다"는 원칙이
 * 여기서 한 단계 더 나간다 — 예전엔 Command와 Popover 둘을 조립해야 했지만
 * (앱의 `components/ui/`), 그 조립 자체가 이제 upstream의 컴포넌트 하나다. DS가
 * 여기서 조립하는 것은 Portal·Positioner·Popup 셋뿐이다(Popup 참고) — 그 셋은
 * Base UI에서도 항상 같이 다니는 한 묶음이라, 소비처가 "입력·목록·항목·빈 상태"
 * 넷만 알면 되게 접는다(이슈 #289 acceptance criteria의 그 넷).
 *
 * 비동기 항목은 API가 따로 없다 — `items`에 무엇을 넘기든(로딩 중엔 빈 배열이나
 * `undefined`, 응답이 오면 채운 배열) Combobox가 그대로 반영한다. 로딩 문구는
 * `Combobox.Status`(스크린 리더에 polite로 알리는 자리, 로딩 중에만 자식을
 * 렌더하는 것은 소비처의 몫)로, 빈 결과는 `Combobox.Empty`(items가 있고 필터
 * 결과가 0일 때만 스스로 렌더한다)로 표현한다 — 스토리 AsyncItems가 그 조합을
 * 보여준다.
 *
 * 필터는 기본값을 그대로 쓴다: Base UI가 `Intl.Collator`(sensitivity: "base",
 * 대소문자·발음 구별 무시)로 `itemToStringLabel`이 가리키는 문자열에 대해
 * 부분일치를 본다. 종목명·코드 둘 다로 찾게 하려면 `itemToStringLabel`에 둘을
 * 합친 문자열을 준다(스토리의 `stockItems` 참고). */

export const comboboxInputVariants = cva(["flex h-9 w-full min-w-0 rounded-md border px-3 text-sm", ...fieldControlBase])

export type ComboboxRootProps<Value, Multiple extends boolean | undefined = false, Item = Value> = BaseComboboxRootProps<
  Value,
  Multiple,
  Item
>

/**
 * 비동기 항목 목록과 입력 필터를 하나로 받는 콤보박스. `Field.Root` 안에 두면
 * 라벨·설명·오류가 `Combobox.Input`에 자동으로 연결된다(Input이 Base UI
 * `Field.Control`과 같은 배선을 쓴다 — field.tsx 참고).
 *
 * 그 자체는 아무 HTML도 그리지 않는다 — `Combobox.Input`·`Combobox.Popup`이
 * 실제 마크업을 낸다.
 */
function ComboboxRoot<Value, Multiple extends boolean | undefined = false, Item = Value>(
  props: ComboboxRootProps<Value, Multiple, Item>
) {
  return <BaseCombobox.Root<Value, Multiple, Item> {...props} />
}

export type ComboboxInputProps = Omit<BaseComboboxInputProps, "className"> & {
  className?: string
}

/** 필터 텍스트를 받는 입력. 밑그림은 Input·Textarea와 같다(lib/field-control.ts) —
 * 여기서 갈리는 것은 콤보박스만의 치수(팝업이 붙는 높이) 없이 한 줄 입력 그대로다. */
function ComboboxInput({ className, ...props }: ComboboxInputProps) {
  return <BaseCombobox.Input className={cn(comboboxInputVariants(), className)} {...props} />
}

export const comboboxPopupVariants = cva([
  "z-50 max-h-72 w-(--anchor-width) overflow-auto rounded-md border border-default bg-surface p-1 text-default shadow-md outline-none",
  "data-starting-style:opacity-0 data-ending-style:opacity-0 transition-opacity",
])

export type ComboboxPopupProps = Omit<BaseComboboxPopupProps, "className"> & {
  className?: string
} & Pick<BaseComboboxPositionerProps, "side" | "align" | "sideOffset" | "alignOffset" | "anchor">

/**
 * 목록을 담는 팝업. Base UI는 `Portal`·`Positioner`·`Popup` 셋을 따로 조립하게
 * 두지만(트리거 옆에 붙이는 계산과 body 밖으로 빼는 것이 각자의 일이라
 * 분리돼 있다), 셋이 항상 같이 다니고 그 경계가 소비처에게 의미 있는 선택지가
 * 아니므로 DS가 여기서 하나로 접는다. 위치 축(`side`·`align`·`sideOffset`·
 * `alignOffset`·`anchor`)만 밖으로 내고 나머지 Positioner props는 기본값에 맡긴다.
 *
 * 너비는 입력에 맞춘다(`--anchor-width` — Base UI가 Positioner에 앵커의 실측
 * 너비를 CSS 변수로 얹는다) — 목록이 입력보다 좁거나 넓게 흔들리지 않는다.
 */
function ComboboxPopup({ className, side, align, sideOffset = 4, alignOffset, anchor, ...props }: ComboboxPopupProps) {
  return (
    <BaseCombobox.Portal>
      <BaseCombobox.Positioner side={side} align={align} sideOffset={sideOffset} alignOffset={alignOffset} anchor={anchor}>
        <BaseCombobox.Popup className={cn(comboboxPopupVariants(), className)} {...props} />
      </BaseCombobox.Positioner>
    </BaseCombobox.Portal>
  )
}

export const comboboxListVariants = cva("flex flex-col gap-0.5")

export type ComboboxListProps = Omit<BaseComboboxListProps, "className"> & {
  className?: string
}

/** 항목들의 컨테이너. `children`이 함수면 항목마다 한 번 불린다 — Base UI가
 * 그 자리에서 가상화를 붙일 수 있게 열어 둔 통로라 DS는 그대로 통과시킨다. */
function ComboboxList({ className, ...props }: ComboboxListProps) {
  return <BaseCombobox.List className={cn(comboboxListVariants(), className)} {...props} />
}

export const comboboxItemVariants = cva([
  "relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-default outline-none select-none",
  "hit-area",
  "data-highlighted:bg-neutral-soft",
  "data-selected:font-medium data-selected:text-accent",
  "data-disabled:pointer-events-none data-disabled:opacity-50",
])

export type ComboboxItemProps = Omit<BaseComboboxItemProps, "className"> & {
  className?: string
}

/**
 * 목록의 한 항목. 하이라이트(키보드 이동·포인터 호버)와 선택 상태는 Base UI가
 * `data-highlighted`·`data-selected`로 낸다 — DS는 색만 입힌다. 화면에 보이는
 * 상자는 `hit-area`로 포인터 하한 24px을 따로 진다: `py-1.5`(28px 안팎)는
 * 이미 하한을 넘지만, 좁은 항목(짧은 종목명)에서도 항상 넘도록 유틸리티를
 * 고정으로 건다.
 */
function ComboboxItem({ className, ...props }: ComboboxItemProps) {
  return <BaseCombobox.Item className={cn(comboboxItemVariants(), className)} {...props} />
}

export const comboboxEmptyVariants = cva("px-2 py-6 text-center text-sm text-muted")

export type ComboboxEmptyProps = Omit<BaseComboboxEmptyProps, "className"> & {
  className?: string
}

/** 필터 결과가 0일 때만 스스로 렌더한다(`items`를 Root에 준 경우에 한해 —
 * Base UI의 계약). 로딩 중처럼 항목 유무를 아직 모르는 상태는 이것이 아니라
 * `Combobox.Status`로 표현한다 — 결과가 없는 것과 아직 모르는 것은 다른
 * 문구를 요구한다. */
function ComboboxEmpty({ className, ...props }: ComboboxEmptyProps) {
  return <BaseCombobox.Empty className={cn(comboboxEmptyVariants(), className)} {...props} />
}

export const comboboxStatusVariants = cva("px-2 py-1.5 text-sm text-muted")

export type ComboboxStatusProps = Omit<BaseComboboxStatusProps, "className"> & {
  className?: string
}

/** 비동기 로딩 문구 같은, 변할 때마다 스크린 리더에 polite로 읽혀야 하는 상태.
 * children을 조건부로 주는 것은 소비처의 몫이다(AsyncItems 스토리 참고) — 이
 * 컴포넌트는 마운트 상태를 유지해야 한다는 Base UI 계약(주석 없이 걷어내면
 * 스크린 리더마다 알림이 끊긴다)을 그대로 지킨다. */
function ComboboxStatus({ className, ...props }: ComboboxStatusProps) {
  return <BaseCombobox.Status className={cn(comboboxStatusVariants(), className)} {...props} />
}

export const Combobox = {
  Root: ComboboxRoot,
  Input: ComboboxInput,
  Popup: ComboboxPopup,
  List: ComboboxList,
  Item: ComboboxItem,
  Empty: ComboboxEmpty,
  Status: ComboboxStatus,
}
