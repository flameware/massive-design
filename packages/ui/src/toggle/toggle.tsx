"use client"

import { Field as BaseField } from "@base-ui/react/field"
import { Toggle as BaseToggle } from "@base-ui/react/toggle"
import { cva, type VariantProps } from "class-variance-authority"
import type * as React from "react"

import { useToggleGroupSize } from "../lib/toggle-group-size.js"
import { useControllableState } from "../lib/use-controllable-state.js"
import { cn } from "../lib/utils.js"

/* 눌림이 남는 버튼. `pressed`/`onPressedChange`로 제어, `defaultPressed`로
 * 비제어 — Base UI Toggle 자체가 그 둘을 받는다. 그런데 Checkbox·Select와
 * 달리 Toggle은 스스로 폼에 등록하지 않는다: `useRegisterFieldControl`을
 * 부르는 곳이 checkbox·select·switch뿐이다(node_modules/@base-ui/react의
 * 세 root 파일에서만 그 훅을 쓴다 — Toggle에는 없다). Base UI 쪽에 `name`
 * prop 자체가 없다.
 *
 * 그래서 "폼 안에서는 name으로 값을 낸다"는 이 티켓의 계약을 이 컴포넌트가
 * 직접 만든다: `name`을 주면 지금 눌린 값을 그대로 미러링하는 숨은
 * `Field.Control`(`render`로 `<input type="hidden">`을 그린) 하나를 곁에
 * 세운다. `Field.Control`은 Base UI가 공개한 컴포넌트다(internals가
 * 아니다) — Field 문서가 "Input·Checkbox·Select 대신 다른 걸 써도 된다"고
 * 적은 그 확장점을 그대로 쓴다. 값이 항상 필요해서(비제어일 때도 지금 눌린
 * 값을 읽어야 미러 입력을 채운다) `useControllableState`로 제어/비제어를
 * 한곳에서 겸한다 — 소비처가 보는 API는 그대로 두 갈래다. */
/* `size`는 #369가 열고 #466이 척도에 맞췄다. 값 이름은 `Button`의 `size`와
 * 같은 이름 공간이고(`sm`·`md`·`lg`), 같은 이름이면 같은 겉 높이다 — sm 32 ·
 * md 36 · lg 40(CONTEXT.md §컨트롤 높이, ADR-0027). #369는 `md`를 게시 당시의
 * 32px로 보존하고 Button `md`(36)와의 어긋남을 판정으로 남겼는데, #466이 그
 * 판정을 뒤집었다: 필터 줄에서 ToggleGroup이 Select 옆에 42 대 36으로 섰고,
 * 용어를 세우자마자 예외를 두면 용어가 지켜지지 않는다. `sm`의 `text-xs`는 필터
 * 칩 모양(#369)에서 온 것이라 남기되 높이는 척도를 따른다.
 *
 * ToggleGroup 안에서는 이 `size`를 쓰지 않는다 — 그룹이 context로 내린 크기의
 * **그룹 안** 값(`toggleInGroupVariants`)을 쓴다. 그래서 그룹 안 Toggle과 낱개
 * Toggle은 같은 이름이라도 높이가 다르고, 그것이 의도다(ADR-0027). */
export const toggleVariants = cva(
  [
    "inline-flex shrink-0 items-center justify-center gap-1.5",
    "rounded-md font-medium",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    "outline-offset-2 focus-visible:outline-2",
    "state transition-[background-color,color,box-shadow]",
    // 가장 작은 높이(그룹 안 sm 26px)도 24px 하한을 넘지만, 아이콘 전용으로 더
    // 좁게 쓰는 소비처가 있을 수 있어 Checkbox와 같은 이유로 hit-area를 같이
    // 건다(#288, ADR-0020)
    "hit-area",
    // 꺼진 상태는 ghost와 같다 — --ds-state-base를 안 주면 상태 층이 transparent에
    // 섞인다(state.css, Button의 ghost variant와 같은 이유)
    "text-default",
    // 켜짐은 브랜드 솔리드다 — 레퍼런스와 다르고, 그게 판단이다. 레퍼런스는
    // `--accent`를 주지만 shadcn의 `--accent`는 브랜드가 아니라 hover용 연회색
    // (DS의 `bg-subtle`)이다. 철자만 읽으면 오류로 보이고 실제로 #387의 전수
    // 대조가 이 줄을 잡았다. 필터 토글의 켜짐은 8% 층보다 세게 보여야 해서
    // (투자기록 앱 ToggleGroup 보유/청산 필터) DS는 브랜드 솔리드를 고른다.
    // 되돌리기 전에 ADR-0025를 읽는다 (docs/adr/0025-reference-words-carry-meaning-not-spelling.md)
    "data-pressed:text-on-solid data-pressed:[--ds-state-base:var(--ds-bg-accent-solid)]",
    "data-disabled:pointer-events-none data-disabled:opacity-50",
  ],
  {
    variants: {
      size: {
        sm: "h-8 min-w-8 px-2 text-xs",
        md: "h-9 min-w-9 px-2.5 text-sm",
        lg: "h-10 min-w-10 px-4 text-base",
      },
    },
    defaultVariants: { size: "md" },
  }
)

/* 그룹 안 항목의 크기. 겉 높이 − 판 여백 2·2 − 테두리 1·1(toggle-group.tsx의
 * `p-0.5 border`) = sm 26 · md 30 · lg 34 — 판의 겉이 척도 값이 된다. 여백·글자·
 * `min-w`도 이 높이에 맞춘다. 공개 API가 아니다: 소비처는 ToggleGroup의 `size`
 * 하나로 이것을 고른다. */
export const toggleInGroupVariants = cva("", {
  variants: {
    size: {
      sm: "h-6.5 min-w-6.5 px-2 text-xs",
      md: "h-7.5 min-w-7.5 px-2.5 text-sm",
      lg: "h-8.5 min-w-8.5 px-3 text-base",
    },
  },
  defaultVariants: { size: "md" },
})

export interface ToggleProps<Value extends string = string>
  extends Omit<React.ComponentPropsWithoutRef<typeof BaseToggle<Value>>, "className">,
    VariantProps<typeof toggleVariants> {
  className?: string
  /**
   * 폼 제출 이름. 주면 눌린 값을 숨은 입력 하나로 낸다 — 안 주면(그룹 밖
   * 단독 사용의 기본) 폼에 아무것도 내지 않는다.
   */
  name?: string
}

/**
 * 눌림이 남는 버튼 — Button의 `variant="ghost"`와 다른 점은 누른 뒤에도
 * 상태가 유지된다는 것 하나다(즐겨찾기·굵게 같은 토글 자체). 켜고 끄는
 * 자리가 아니라 **누르면 무언가 일어나는** 자리는 Button이다.
 */
export function Toggle<Value extends string = string>({
  className,
  pressed,
  defaultPressed,
  onPressedChange,
  disabled,
  name,
  value,
  size,
  ...props
}: ToggleProps<Value>) {
  // 그룹 안이면 그룹의 크기가 이긴다 — 항목마다 다른 `size`를 줘도 판의 겉
  // 높이가 깨지지 않는다(#466)
  const groupSize = useToggleGroupSize()
  const [isPressed, setPressed] = useControllableState({
    prop: pressed,
    defaultProp: defaultPressed ?? false,
  })

  const toggle = (
    <BaseToggle<Value>
      pressed={isPressed}
      onPressedChange={(next, eventDetails) => {
        setPressed(next)
        onPressedChange?.(next, eventDetails)
      }}
      disabled={disabled}
      value={value}
      className={cn(
        toggleVariants({ size: groupSize ? null : size }),
        groupSize && toggleInGroupVariants({ size: groupSize }),
        className
      )}
      {...props}
    />
  )

  if (!name) return toggle

  // 폼에 내는 값은 "on"이 기본이다. 꺼진 네이티브 체크박스가 아무 값도 내지
  // 않는 것과 같은 모양을 내려면 값을 ""로 두는 것만으로는 부족하다 — 그러면
  // 필드 자체는 여전히 등록돼 제출 맵에 빈 문자열이 잡힌다(checkbox.tsx가
  // 기대는 Base UI Checkbox는 `uncheckedValue`가 없으면 꺼졌을 때 입력 자체를
  // 렌더하지 않는다, node_modules/@base-ui/react/checkbox/root/CheckboxRoot.mjs).
  // 그래서 미러 입력 자체를 눌렸을 때만 마운트한다. `value`를 Toggle 자신의
  // 식별자로 이미 받았으면 그 값을 그대로 쓴다.
  return (
    <BaseField.Root name={name}>
      {toggle}
      {isPressed ? <BaseField.Control render={<input type="hidden" />} value={value ?? "on"} /> : null}
    </BaseField.Root>
  )
}
