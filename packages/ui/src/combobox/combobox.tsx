"use client"

import { Combobox as BaseCombobox } from "@base-ui/react/combobox"
import type {
  ComboboxEmptyProps as BaseComboboxEmptyProps,
  ComboboxInputGroupProps as BaseComboboxInputGroupProps,
  ComboboxInputProps as BaseComboboxInputProps,
  ComboboxItemProps as BaseComboboxItemProps,
  ComboboxListProps as BaseComboboxListProps,
  ComboboxPopupProps as BaseComboboxPopupProps,
  ComboboxPositionerProps as BaseComboboxPositionerProps,
  ComboboxRootProps as BaseComboboxRootProps,
  ComboboxStatusProps as BaseComboboxStatusProps,
} from "@base-ui/react/combobox"
import { cva } from "class-variance-authority"
import { createContext, useContext } from "react"
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

/* 입력 칸 안에 세그먼트·아이콘 같은 컨트롤을 함께 두는 그룹(#487). Base UI
 * Combobox anatomy의 `InputGroup` 파트를 그대로 감싼 것이고, ADR-0023이 "돌아오지
 * 않는 것"으로 걷은 범용 InputGroup(1세대 shadcn 표면)이 돌아온 것이 아니다.
 *
 * 밑그림은 fieldControlBase를 **그룹이** 그대로 편다. Base UI가 Field 상태를
 * 그룹에도 `data-invalid`·`data-disabled`로 얹으므로(ComboboxInputGroup.mjs의
 * fieldValidityMapping) invalid·disabled 줄이 글자 그대로 동작한다. 그룹은 포커스를
 * 받지 않으므로 `focus-visible:outline-2`는 아무것도 하지 않고, 대신 직계 입력이
 * `:focus-visible`일 때 그룹 바깥에 링을 그린다 — 더하는 것은 그 한 줄뿐이다.
 *
 * 겉 높이는 컨트롤 높이 md 36이고 `size` 축은 없다(ADR-0027 결정 4). 후보 목록은
 * `anchor` 없이 그룹 폭에 붙는다 — Base UI Positioner의 기본 앵커가 InputGroup이다
 * (ComboboxPositioner.mjs `inputGroupElement ?? inputElement`).
 *
 * 그룹 안 ToggleGroup의 치수는 combobox.css의 부모 선택자 규칙이 정한다. 그룹 안
 * Combobox.Input은 같은 방식으로 덮지 않고 아래 context로 고른다 — 입력 밑그림
 * (fieldControlBase)은 utilities이고 Input·Textarea·Select와 공유하므로 판처럼
 * components 층으로 옮길 수 없다. 두 파트가 한 파일이라 공개 API는 늘지 않는다. */
export const comboboxInputGroupVariants = cva([
  "flex h-9 w-full min-w-0 items-center overflow-hidden rounded-md border",
  ...fieldControlBase,
  "has-[>input:focus-visible]:outline-2",
])

/* 그룹 안 입력의 맨 칸 — 테두리·면·자기 링을 그룹에 넘기고 남은 폭을 채운다.
 * 글자색은 그룹의 `text-default`(fieldControlBase)를 물려받는다. placeholder 색은
 * 상속되지 않아 입력이 계속 진다 */
const comboboxInputInGroupVariants = cva(
  "h-full min-w-0 flex-1 border-0 bg-transparent px-3 text-sm outline-none placeholder:text-muted"
)

/* Input이 그룹 바로 안에 있는지를 같은 모듈 안에서만 내린다. CSS 부모 선택자로
 * 덮지 않는 이유: Input의 밑그림은 utilities 층이라 `@layer components` 규칙이
 * 이기지 못한다. 두 파트가 한 파일이라 공개 API가 늘지 않는다 */
const InputInGroupContext = createContext(false)

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
  /**
   * 후보가 없을 때(필터 결과 0개) Enter가 현재 입력 텍스트를 값으로 제출한다
   * — 종목 검색이 미상장 종목명을 그대로 받는 자리(이슈 #323). 새 상태를
   * 만들지 않는다: Base UI가 이미 내는 `data-list-empty`(아래에서 읽는 것과
   * 같은 상태가 `Combobox.Empty`를 스스로 렌더하게 한다 — `useListEmpty`,
   * `filteredItems.length === 0`)를 그대로 읽을 뿐이다. 지정하지 않으면
   * (기본값) Enter는 Base UI 기본대로 팝업만 닫는다 — 게시된 인스턴스를
   * 그대로 보존하는 값이라 이 축을 여는 것은 가산 변경이다(rules.md 축과
   * 이름 공간).
   */
  onFreeformSubmit?: (inputValue: string) => void
}

/** 필터 텍스트를 받는 입력. 밑그림은 Input·Textarea와 같다(lib/field-control.ts) —
 * 여기서 갈리는 것은 콤보박스만의 치수(팝업이 붙는 높이) 없이 한 줄 입력 그대로다.
 *
 * `onFreeformSubmit`이 있을 때만 Enter에 손을 댄다. Base UI 자신의 Enter
 * 처리(하이라이트가 없으면 폼 제출을 막지 않도록 팝업만 닫는다, 하이라이트가
 * 있으면 그 항목을 선택한다)는 그대로 두고, 그 뒤에 `data-list-empty`
 * 하나만 더 본다 — 읽는 것은 이전 렌더가 이미 찍어 둔 속성이라 두 핸들러의
 * 실행 순서는 결과에 영향을 주지 않는다. */
function ComboboxInput({ className, onFreeformSubmit, onKeyDown, ...props }: ComboboxInputProps) {
  const inGroup = useContext(InputInGroupContext)
  return (
    <BaseCombobox.Input
      className={cn(inGroup ? comboboxInputInGroupVariants() : comboboxInputVariants(), className)}
      onKeyDown={
        onFreeformSubmit
          ? (event) => {
              onKeyDown?.(event)
              if (event.key !== "Enter" || event.nativeEvent.isComposing) {
                return
              }
              if (!event.currentTarget.hasAttribute("data-list-empty")) {
                return
              }
              const value = event.currentTarget.value.trim()
              if (value) {
                onFreeformSubmit(value)
              }
            }
          : onKeyDown
      }
      {...props}
    />
  )
}

export type ComboboxInputGroupProps = Omit<BaseComboboxInputGroupProps, "className"> & {
  className?: string
}

/**
 * 입력과 그 옆 컨트롤(세그먼트·아이콘)을 한 칸으로 묶는다. `Combobox.Input`은
 * 그룹의 **직계 자식**으로 둔다 — 포커스 링을 그 입력에서 읽는다. 바로 안에 둔
 * `ToggleGroup`은 판 테두리·면 없이 칸의 안쪽 높이를 채운다(combobox.css).
 *
 * `data-slot="combobox-input-group"`은 그 부모 선택자 규칙의 걸쇠다(rules.md
 * 축과 이름 공간 #469의 `data-slot` 규약).
 */
function ComboboxInputGroup({ className, children, ...props }: ComboboxInputGroupProps) {
  return (
    <BaseCombobox.InputGroup
      data-slot="combobox-input-group"
      className={cn(comboboxInputGroupVariants(), className)}
      {...props}
    >
      <InputInGroupContext.Provider value={true}>{children}</InputInGroupContext.Provider>
    </BaseCombobox.InputGroup>
  )
}

/* `z-50`은 여기가 아니라 Positioner에 있다 — Popup은 `position: static`이라
 * z-index가 아무것도 하지 않는다(정적 요소에는 적용되지 않는다). 층을 만드는
 * 것은 Base UI가 `absolute`로 앉히는 Positioner 쪽이고, Menu·Select도 그쪽에
 * 건다(menu.tsx의 Positioner `className="z-50"`, select.tsx의
 * positionerVariants). 여기 있던 동안 Dialog·Drawer 안의 콤보박스 팝업이
 * z-50 뷰포트 **뒤로** 깔려 항목을 누를 수 없었다 — 소비처가 고칠 수 없는
 * 자리다(Popup의 className은 Positioner에 닿지 않는다). */
export const comboboxPopupVariants = cva([
  "max-h-72 w-(--anchor-width) overflow-auto rounded-md border border-default bg-overlay p-1 text-default shadow-md outline-none",
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
      <BaseCombobox.Positioner
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        anchor={anchor}
        className="z-50"
      >
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

/* 항목의 면은 `.state` 층이 진다 — Select·Menu와 같은 모양이고 같은 이유다.
 * 여기 `data-highlighted:bg-neutral-soft`가 직접 칠하던 동안에는 #387의 증상
 * (쉬는 항목이 회색)은 없었지만, 팝업 항목 중 유일하게 상태 층 밖에 있어서
 * 셋이 서로 다른 메커니즘이었다(#391). `bg-*`를 남겨 둔 채 `.state`를 더하면
 * 같은 특정도의 나중 유틸리티가 color-mix를 이겨 #299가 그대로 재현된다.
 *
 * base는 **팝업 자신의 면색**(`--ds-bg-overlay`, 위 comboboxPopupVariants의
 * `bg-overlay`와 같은 값)이다 — 쉬는 항목이 팝업과 같은 색이라 보이지 않고,
 * 하이라이트 8%·눌림 12%가 불투명한 면 위에서 섞인다. 지우고 투명으로 두지
 * 않는 이유는 select.tsx와 같다(투명 위 color-mix는 state.css가 경고한
 * @supports 폴백에 걸린다). 이 교체로 눌림 단계가 생기고(직접 칠할 때는
 * 하이라이트 한 단뿐이었다) 다크에서 단차가 Select·Menu와 같아진다.
 *
 * `data-selected`는 상태 층이 아니라 선택 표시라 글자로 남는다 — Combobox가
 * 체크 표시 대신 굵기와 accent 색으로 선택을 말하는 것은 의도된 분기다(#387). */
export const comboboxItemVariants = cva([
  "relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-default outline-none select-none",
  "hit-area",
  "state transition-[background-color]",
  "[--ds-state-base:var(--ds-bg-overlay)]",
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

/* `empty:py-0` — Base UI는 Empty·Status의 래퍼 `<div>`를 항상 마운트해 두고
 * (aria-live 영역은 DOM에 남아 있어야 스크린 리더가 변화를 읽는다) children만
 * 조건부로 낸다. 그래서 세로 여백을 무조건 주면 결과가 **있을 때** 목록 위에
 * 48px짜리 빈 띠가 생긴다 — 소비처 두 곳(거래 종목 검색 #292, 노트 검색 #294)
 * 모두에서 실측됐다. 마운트는 유지한 채(`display:none`은 Base UI 계약 위반)
 * 자식이 없으면 여백만 접는다. Status도 같다. */
export const comboboxEmptyVariants = cva("px-2 py-6 text-center text-sm text-muted empty:py-0")

export type ComboboxEmptyProps = Omit<BaseComboboxEmptyProps, "className"> & {
  className?: string
}

/** 필터 결과가 0일 때만 children을 렌더한다(`items`를 Root에 준 경우에 한해 —
 * Base UI의 계약). 래퍼는 늘 마운트돼 있으므로 여백은 `empty:`로 접는다(위
 * comboboxEmptyVariants 참고). 로딩 중처럼 항목 유무를 아직 모르는 상태는 이것이 아니라
 * `Combobox.Status`로 표현한다 — 결과가 없는 것과 아직 모르는 것은 다른
 * 문구를 요구한다. */
function ComboboxEmpty({ className, ...props }: ComboboxEmptyProps) {
  return <BaseCombobox.Empty className={cn(comboboxEmptyVariants(), className)} {...props} />
}

export const comboboxStatusVariants = cva("px-2 py-1.5 text-sm text-muted empty:py-0")

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
  InputGroup: ComboboxInputGroup,
  Input: ComboboxInput,
  Popup: ComboboxPopup,
  List: ComboboxList,
  Item: ComboboxItem,
  Empty: ComboboxEmpty,
  Status: ComboboxStatus,
}
