"use client"

import { Slider as BaseSlider } from "@base-ui/react/slider"
import { cva } from "class-variance-authority"
import type * as React from "react"

import { cn } from "../lib/utils.js"

/* Base UI Slider는 Checkbox·Switch와 같은 자리에 선다 — `value`/`defaultValue`
 * (제어/비제어)와 `name`·`form`(폼 제출)을 스스로 지고, `Field.Root` 안에 두면
 * `useRegisterFieldControl`로 Form의 필드 registry에도 스스로 등록된다
 * (switch.tsx 주석과 같은 확인, node_modules/@base-ui/react/slider/root/
 * SliderRoot.mjs). 그래서 이 컴포넌트도 상태 배선을 새로 놓지 않고 색과
 * 치수만 입힌다.
 *
 * ADR-0026의 기본 폼 컨트롤이라 착지 자리 지명 없이 만든다.
 *
 * Switch와 달리 **네임스페이스형**이다 — Base UI의 anatomy 자체가
 * Root·Control·Track·Indicator·Thumb 다섯으로 갈린다(Progress와 같은 이유,
 * progress.tsx 주석). `value`가 배열이면 thumb이 여럿인 범위 슬라이더가
 * 되므로(단일 값과 범위 둘 다 이 하나의 조립으로 표현된다) 소비처가 `Thumb`을
 * 값의 개수만큼 늘어놓는다:
 *
 *   <Slider.Root defaultValue={[20, 80]}>
 *     <Slider.Control>
 *       <Slider.Track>
 *         <Slider.Indicator />
 *       </Slider.Track>
 *       <Slider.Thumb index={0} getAriaLabel={() => "최소"} />
 *       <Slider.Thumb index={1} getAriaLabel={() => "최대"} />
 *     </Slider.Control>
 *   </Slider.Root>
 *
 * Thumb은 Track **밖**, Control의 형제로 둔다 — Base UI가 thumb 위치를
 * `Control`의 상자를 기준으로 계산하고(`SliderThumb.mjs`의
 * `getInsetPosition`이 `controlRef`를 쓴다), Track 안에 두면 Track의
 * `overflow-hidden`(둥근 모서리를 위해 필요하다)이 thumb의 `hit-area`가
 * 세로로 벌리는 영역을 24px 아래로 잘라 버린다 — ADR-0020 결정 4가 적은
 * "겹침은 선언하는 것"이 아니라 진짜 함정(overflow-hidden 조상)이라 조립
 * 자체를 바꿔 피한다.
 * 트랙의 채워지지 않은 부분은 **잔여 트랙**이다(CONTEXT.md·rules.md 토큰과
 * 대비, Progress와 같은 자리) — 값이 아직 닿지 않은 바닥이라 대비 요구가
 * 없고 `bg.neutral.soft`를 쓴다. 채워진 부분(Indicator)은 Progress의
 * Indicator와 같은 이유로 `bg.accent.solid`다 — 뜻을 채움 자체가 나르므로
 * WCAG 1.4.11을 빚지지 않지만, 정적 표식이지 상태 사다리를 갖는 표면이
 * 아니므로 `--ds-state-base`가 아니라 직접 칠한다(state.css는 상태 사다리가
 * 있는 표면만의 유일한 필자다, rules.md).
 *
 * Thumb은 **컨트롤 어포던스**다(CONTEXT.md) — 잡는 대상 자체가 의미를
 * 나르므로 앉는 면(Root가 놓인 배경)에 대해 비텍스트 대비 3:1(WCAG 1.4.11)을
 * 진다. 그래서 Switch의 꺼짐 트랙·Scroll Area의 thumb과 같은 이유로
 * `bg.neutral.solid`를 쓴다 — 잔여 트랙·채움 어느 쪽과도 같은 토큰을 쓰지
 * 않는다. 시각 지름은 16px이라 포인터 하한 24px 아래로 내려가므로
 * `hit-area`가 진다(ADR-0020, Checkbox와 같은 자리). */

export interface SliderRootProps<Value extends number | readonly number[] = number>
  extends Omit<React.ComponentPropsWithoutRef<typeof BaseSlider.Root<Value>>, "className"> {
  className?: string
}

/**
 * 값과 범위를 끌어서 고르는 폼 컨트롤. `value`/`onValueChange`로 제어,
 * `defaultValue`로 비제어 — 어느 쪽도 안 주면 `min`(기본 0)에서 비제어로
 * 시작한다. 배열을 주면(`defaultValue={[20, 80]}`) 범위 슬라이더가 된다.
 * `Field.Root` 안에서 `name`을 주면 Form의 제출 맵에 그대로 잡힌다.
 */
function Root<Value extends number | readonly number[] = number>({
  className,
  ...props
}: SliderRootProps<Value>) {
  return (
    <BaseSlider.Root
      className={cn("flex w-full flex-col gap-2 data-disabled:opacity-50", className)}
      {...props}
    />
  )
}

export interface SliderControlProps
  extends Omit<React.ComponentPropsWithoutRef<typeof BaseSlider.Control>, "className"> {
  className?: string
}

/** 트랙 눌림(track-press)을 받는 자리 — Track보다 살짝 넓은 세로 여백으로
 * 손가락이 트랙 자체보다 쉽게 닿게 한다. */
function Control({ className, ...props }: SliderControlProps) {
  return (
    <BaseSlider.Control
      className={cn("relative flex w-full touch-none items-center py-2 select-none", className)}
      {...props}
    />
  )
}

export interface SliderTrackProps
  extends Omit<React.ComponentPropsWithoutRef<typeof BaseSlider.Track>, "className"> {
  className?: string
}

export const sliderTrackVariants = cva(
  "relative h-1.5 w-full grow overflow-hidden rounded-full bg-neutral-soft"
)

function Track({ className, ...props }: SliderTrackProps) {
  return <BaseSlider.Track className={cn(sliderTrackVariants(), className)} {...props} />
}

export interface SliderIndicatorProps
  extends Omit<React.ComponentPropsWithoutRef<typeof BaseSlider.Indicator>, "className"> {
  className?: string
}

export const sliderIndicatorVariants = cva("absolute h-full rounded-full bg-accent-solid")

function Indicator({ className, ...props }: SliderIndicatorProps) {
  return <BaseSlider.Indicator className={cn(sliderIndicatorVariants(), className)} {...props} />
}

export interface SliderThumbProps
  extends Omit<React.ComponentPropsWithoutRef<typeof BaseSlider.Thumb>, "className"> {
  className?: string
}

export const sliderThumbVariants = cva([
  "block size-4 rounded-full bg-neutral-solid",
  "outline-offset-2 focus-visible:outline-2",
  "hit-area",
  "data-disabled:pointer-events-none",
])

function Thumb({ className, ...props }: SliderThumbProps) {
  return <BaseSlider.Thumb className={cn(sliderThumbVariants(), className)} {...props} />
}

export interface SliderValueProps
  extends Omit<React.ComponentPropsWithoutRef<typeof BaseSlider.Value>, "className"> {
  className?: string
}

/** 서식이 갖춰진 값을 보여준다(기본은 숫자 그대로, 범위면 공백으로 이은 둘) —
 * 계산은 Base UI가 진다(Progress.Value와 같은 자리). */
function Value({ className, ...props }: SliderValueProps) {
  return <BaseSlider.Value className={cn("text-sm text-muted", className)} {...props} />
}

export const Slider = { Root, Control, Track, Indicator, Thumb, Value }
