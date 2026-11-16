"use client"

import {
  createComboboxController,
  Combobox as SdkCombobox,
  ComboboxContent as SdkComboboxContent,
  ComboboxEmpty as SdkComboboxEmpty,
  ComboboxInput as SdkComboboxInput,
  ComboboxItem as SdkComboboxItem,
  ComboboxList as SdkComboboxList,
  ComboboxStatus as SdkComboboxStatus,
} from "@ui-sdk/react/combobox"
import { useFieldControl } from "@ui-sdk/react/field"
import { fieldControlBase } from "@flameware/ui/lib/field-control"
import { cn } from "@flameware/ui/lib/utils"
import { cva } from "class-variance-authority"
import { createContext, useContext, useMemo, useState } from "react"
import type * as React from "react"

/* 밖에서 열고 닫고 값·텍스트를 넣는 손잡이 — UI SDK의 것을 그대로 낸다 */
export { createComboboxController }

/* #496 스파이크 — packages/ui/src/combobox/combobox.tsx를 UI SDK 위에 다시 세운다.
 *
 * 파트 이름은 평면형이고 UI SDK의 anatomy를 따른다: `Combobox`·`ComboboxInput`·
 * `ComboboxContent`·`ComboboxList`·`ComboboxItem`·`ComboboxEmpty`·`ComboboxStatus`.
 * 클래스 문자열은 대응하는 요소가 있는 한 원본과 글자 그대로 같다.
 *
 * 원본과 갈리는 것(자세한 목록은 스파이크 보고서):
 *   - `Popup`이 `Content`다. Portal·Positioner가 없다 — UI SDK 팝업은 브라우저의
 *     top layer에 **제자리에서** 뜬다. 그래서 원본이 Positioner에 걸던 `z-50`도
 *     없다(top layer는 z-index 바깥이다).
 *   - `items` + `List`의 항목별 렌더 함수가 없다. UI SDK의 `items`는
 *     `{ value, label }` 모양(`ListData`)만 받고 `List`의 함수 자식은 항목이 아니라
 *     목록 상태를 받는다. 임의 모양의 객체는 소비처가 직접 `map`해 `ComboboxItem`을
 *     그린다 — 필터는 그려진 항목을 `hidden`으로 숨기는 방식으로 돈다.
 *   - `itemToStringLabel` → `itemToLabel`. 객체 값은 `itemToValue`(문자열 정체성)가
 *     있어야 한다 — 없으면 객체의 `value`·`id`를 찾는다. 항목의 필터 문자열은
 *     `ComboboxItem`의 `label`이다.
 *   - `inputValue`·`defaultInputValue`·`onInputValueChange` → `query`·`defaultQuery`·
 *     `onQueryChange`. 다만 처음 준 텍스트는 필터를 걸지 않는다 — 사용자의 타이핑과
 *     controller의 `setQuery`만 거른다.
 *   - `ComboboxInputGroup`은 UI SDK에 없어 이 파일이 손으로 세운다(아래).
 */

/* ---------- Root ---------- */

/* 그룹(ComboboxInputGroup)이 있으면 그 요소가 후보 목록의 앵커다. UI SDK의 기본
 * 앵커는 `chips ?? input`이라(core combobox-api.js `anchorElement`) 그룹을 모른다 —
 * Root가 그룹 요소를 받아 Content의 `anchor`로 넘긴다. `disabled`는 Field 밖에서
 * Root에 직접 준 값을 그룹이 읽게 함께 내린다. `close`는 `onFreeformSubmit`이 값을
 * 넘긴 뒤 목록을 닫는 데 쓴다(ComboboxInput). */
interface ComboboxGroupContextValue {
  group: HTMLElement | null
  setGroup: (element: HTMLElement | null) => void
  disabled: boolean
  close: () => void
}

const ComboboxGroupContext = createContext<ComboboxGroupContextValue | null>(null)

export type ComboboxProps<T = string, Multiple extends boolean | undefined = false> = React.ComponentProps<
  typeof SdkCombobox<T, Multiple>
>

/**
 * 입력 필터와 후보 목록을 하나로 묶는 콤보박스. `Field` 안에 두면 라벨·설명·오류가
 * `ComboboxInput`에 자동으로 연결된다.
 *
 * 그 자체는 아무 HTML도 그리지 않는다 — `ComboboxInput`·`ComboboxContent`가
 * 실제 마크업을 낸다.
 */
export function Combobox<T = string, Multiple extends boolean | undefined = false>(props: ComboboxProps<T, Multiple>) {
  const [group, setGroup] = useState<HTMLElement | null>(null)
  /* UI SDK의 파트는 Root의 api를 React 쪽으로 내주지 않는다(`useHandle`은 공개 API가
   * 아니다). 밖에서 닫는 공개 통로는 controller뿐이라, 소비처가 주지 않으면 하나 만든다 */
  const [ownController] = useState(() => createComboboxController<T, Multiple>())
  const controller = props.controller ?? ownController
  const disabled = !!props.disabled
  const context = useMemo(
    () => ({ group, setGroup, disabled, close: () => void controller.close() }),
    [group, disabled, controller]
  )
  return (
    <ComboboxGroupContext.Provider value={context}>
      <SdkCombobox<T, Multiple> {...props} controller={controller} />
    </ComboboxGroupContext.Provider>
  )
}

/* ---------- Input ---------- */

export const comboboxInputVariants = cva(["flex h-9 w-full min-w-0 rounded-md border px-3 text-sm", ...fieldControlBase])

/* 그룹 안 입력의 맨 칸 — 원본과 같은 문자열이다 */
const comboboxInputInGroupVariants = cva(
  "h-full min-w-0 flex-1 border-0 bg-transparent px-3 text-sm outline-none placeholder:text-muted"
)

const InputInGroupContext = createContext(false)

export type ComboboxInputProps = Omit<React.ComponentProps<typeof SdkComboboxInput>, "className"> & {
  className?: string
  /**
   * 후보가 없을 때(필터 결과 0개) Enter가 현재 입력 텍스트를 값으로 제출한다 (#323).
   *
   * UI SDK에는 원본이 읽던 `data-list-empty`가 입력에 없다(입력의 상태는 open·
   * disabled·readOnly·required뿐이다). 그래서 열린 목록의 DOM을 직접 본다:
   * `aria-controls`가 가리키는 listbox 안에 숨지 않은 `role=option`이 하나도 없으면
   * 빈 목록이다. 목록이 닫혀 있으면 제출하지 않는다 — UI SDK는 고르지 않고 닫을 때
   * 입력 텍스트를 선택된 라벨로 되돌리므로, 닫힌 채 남아 있는 텍스트는 후보 밖
   * 입력이 아니다. 제출한 뒤에는 목록을 닫는다 — UI SDK는 하이라이트 없는 Enter에
   * 목록을 열어 둔다(원본은 닫았다).
   *
   * UI SDK 자신의 대응물은 Root의 `allowCustomValue`다. 다만 그것은 값이 **문자열
   * 자체**가 되고 목록이 닫힐 때(포커스 이탈)도 확정하므로 이 prop과 계약이 다르다.
   */
  onFreeformSubmit?: (inputValue: string) => void
}

function listIsEmpty(input: HTMLInputElement) {
  const id = input.getAttribute("aria-controls")
  const list = id ? input.ownerDocument.getElementById(id) : null
  if (!list) return false
  return list.querySelector('[role="option"]:not([hidden])') === null
}

/** 필터 텍스트를 받는 입력. 밑그림은 Input·Textarea와 같다(lib/field-control.ts). */
export function ComboboxInput({ className, onFreeformSubmit, onKeyDown, ...props }: ComboboxInputProps) {
  const inGroup = useContext(InputInGroupContext)
  const root = useContext(ComboboxGroupContext)
  return (
    <SdkComboboxInput
      className={cn(inGroup ? comboboxInputInGroupVariants() : comboboxInputVariants(), className)}
      onKeyDown={
        onFreeformSubmit
          ? (event) => {
              onKeyDown?.(event)
              if (event.key !== "Enter" || event.nativeEvent.isComposing) {
                return
              }
              if (!listIsEmpty(event.currentTarget)) {
                return
              }
              const value = event.currentTarget.value.trim()
              if (value) {
                onFreeformSubmit(value)
                root?.close()
              }
            }
          : onKeyDown
      }
      {...props}
    />
  )
}

/* ---------- InputGroup (손으로 세운 파트) ---------- */

export const comboboxInputGroupVariants = cva([
  "flex h-9 w-full min-w-0 items-center overflow-hidden rounded-md border",
  ...fieldControlBase,
  "has-[>input:focus-visible]:outline-2",
])

export type ComboboxInputGroupProps = Omit<React.ComponentProps<"div">, "className"> & {
  className?: string
}

/* Field의 상태 속성(`data-invalid`·`data-disabled`…)만 골라낸다. UI SDK가 공개한
 * 통로는 `useFieldControl().props()`뿐이고 그것은 **컨트롤**용이라 id·aria·ref도
 * 함께 준다 — 그룹은 컨트롤이 아니므로 data 속성만 쓰고 나머지는 버린다(ref를
 * 버리므로 Field가 그룹을 자기 컨트롤로 입양하지 않는다). */
function useFieldDataAttributes() {
  const field = useFieldControl()
  if (!field) return { disabled: false, attributes: {} as Record<string, string> }
  const merged = field.props({}) as Record<string, unknown>
  const attributes: Record<string, string> = {}
  for (const [key, value] of Object.entries(merged)) {
    if (key.startsWith("data-") && key !== "data-slot" && typeof value === "string") attributes[key] = value
  }
  return { disabled: field.disabled, attributes }
}

/**
 * 입력과 그 옆 컨트롤(세그먼트·아이콘)을 한 칸으로 묶는다 (#487). `ComboboxInput`은
 * 그룹의 **직계 자식**으로 둔다 — 포커스 링을 그 입력에서 읽는다.
 *
 * UI SDK Combobox에는 이 파트가 없다. 가까운 둘을 보고 둘 다 쓰지 않았다:
 *   - `ComboboxChips` — 앵커가 되어 주지만 `role="toolbar"`·`aria-orientation`을
 *     내는 다중 선택용 칩 줄이다.
 *   - `@ui-sdk/react/input`의 `InputGroup` — 자기 안의 `Input`(input primitive)
 *     상태만 읽고, Combobox의 앵커도 Field의 invalid도 모른다.
 * 그래서 맨 `div`에 셋을 손으로 단다: (1) Root에 자기 요소를 앵커로 올린다,
 * (2) Field·Root의 상태를 `data-invalid`·`data-disabled`로 옮긴다, (3) 안의 입력에
 * 맨 칸 밑그림을 고르게 한다.
 */
export function ComboboxInputGroup({ className, children, ...props }: ComboboxInputGroupProps) {
  const root = useContext(ComboboxGroupContext)
  const field = useFieldDataAttributes()
  const disabled = field.disabled || root?.disabled
  return (
    <div
      ref={root?.setGroup}
      data-slot="combobox-input-group"
      {...field.attributes}
      data-disabled={disabled ? "" : undefined}
      className={cn(comboboxInputGroupVariants(), className)}
      {...props}
    >
      <InputInGroupContext.Provider value={true}>{children}</InputInGroupContext.Provider>
    </div>
  )
}

/* ---------- Content ---------- */

/* 원본의 Popup 문자열 그대로다. `--anchor-width`는 UI SDK가 Content 자신에 얹는다 */
export const comboboxContentVariants = cva([
  "max-h-72 w-(--anchor-width) overflow-auto rounded-md border border-default bg-overlay p-1 text-default shadow-md outline-none",
  "data-starting-style:opacity-0 data-ending-style:opacity-0 transition-opacity",
])

export type ComboboxContentProps = Omit<React.ComponentProps<typeof SdkComboboxContent>, "className"> & {
  className?: string
}

/**
 * 목록을 담는 팝업. 원본의 Portal·Positioner·Popup 셋이 UI SDK에서는 이 하나다.
 * 위치 축(`side`·`align`·`sideOffset`·`alignOffset`·`anchor`)은 UI SDK가 Content에
 * 직접 받는다. `anchor`를 주지 않으면 그룹이 있을 때 그룹에, 없으면 입력에 붙는다.
 */
export function ComboboxContent({ className, sideOffset = 4, anchor, ...props }: ComboboxContentProps) {
  const root = useContext(ComboboxGroupContext)
  return (
    <SdkComboboxContent
      sideOffset={sideOffset}
      anchor={anchor ?? root?.group ?? undefined}
      className={cn(comboboxContentVariants(), className)}
      {...props}
    />
  )
}

/* ---------- List · Item ---------- */

export const comboboxListVariants = cva("flex flex-col gap-0.5")

export type ComboboxListProps = Omit<React.ComponentProps<typeof SdkComboboxList>, "className"> & {
  className?: string
}

/** 항목들의 컨테이너(`role="listbox"`). 자식이 함수면 **목록 상태**를 받는다 —
 * 원본처럼 항목마다 불리지 않는다. */
export function ComboboxList({ className, ...props }: ComboboxListProps) {
  return <SdkComboboxList className={cn(comboboxListVariants(), className)} {...props} />
}

/* 항목의 면은 `.state` 층이 진다 — 원본과 같은 문자열이다. UI SDK도 하이라이트·
 * 선택·비활성을 `data-highlighted`·`data-selected`·`data-disabled`로 낸다. */
export const comboboxItemVariants = cva([
  "relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-default outline-none select-none",
  "hit-area",
  "state transition-[background-color]",
  "[--ds-state-base:var(--ds-bg-overlay)]",
  "data-selected:font-medium data-selected:text-accent",
  "data-disabled:pointer-events-none data-disabled:opacity-50",
])

type SdkItemProps<T> = Parameters<typeof SdkComboboxItem<T>>[0]

export type ComboboxItemProps<T = string> = Omit<SdkItemProps<T>, "className"> & { className?: string }

/** 목록의 한 항목. `label`이 필터와 입력에 쓰이는 문자열이다. */
export function ComboboxItem<T = string>({ className, ...props }: ComboboxItemProps<T>) {
  return <SdkComboboxItem<T> className={cn(comboboxItemVariants(), className)} {...(props as SdkItemProps<T>)} />
}

/* ---------- Empty · Status ---------- */

/* `empty:py-0` — UI SDK의 Empty도 래퍼 `<div role="status">`는 Content가 떠 있는
 * 동안 늘 마운트해 두고 children만 `state.empty`일 때 낸다(react combobox.js
 * `ComboboxEmpty`). 원본과 같은 이유로 자식이 없으면 여백만 접는다. */
export const comboboxEmptyVariants = cva("px-2 py-6 text-center text-sm text-muted empty:py-0")

export type ComboboxEmptyProps = Omit<React.ComponentProps<typeof SdkComboboxEmpty>, "className"> & {
  className?: string
}

/** 필터 결과가 0일 때만 children을 렌더한다. */
export function ComboboxEmpty({ className, ...props }: ComboboxEmptyProps) {
  return <SdkComboboxEmpty className={cn(comboboxEmptyVariants(), className)} {...props} />
}

export const comboboxStatusVariants = cva("px-2 py-1.5 text-sm text-muted empty:py-0")

export type ComboboxStatusProps = Omit<React.ComponentProps<typeof SdkComboboxStatus>, "className"> & {
  className?: string
}

/** 비동기 로딩 문구처럼 polite로 읽혀야 하는 상태(`role="status"`). */
export function ComboboxStatus({ className, ...props }: ComboboxStatusProps) {
  return <SdkComboboxStatus className={cn(comboboxStatusVariants(), className)} {...props} />
}
