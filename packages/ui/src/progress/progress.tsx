"use client"

import { Progress as BaseProgress } from "@base-ui/react/progress"
import { cva } from "class-variance-authority"
import type * as React from "react"

import { cn } from "../lib/utils.js"

/* 네임스페이스형이다 — Root·Track·Indicator·Label·Value 다섯 파트를 하나의
 * 이름 아래 둔다(ADR-0023 §5, Avatar와 같은 모양). 값이 있는(결정적) 진행률만
 * 다룬다 — 비결정적(값 없음) 모양은 Spinner가 이미 진다(#317 스토리 9, #325).
 *
 * Base UI의 Root가 `role="progressbar"`·`aria-valuenow`·`aria-valuemin`·
 * `aria-valuemax`·`aria-valuetext`를 전부 스스로 낸다 — #317이 요구한 "Base UI의
 * 모양이 앱의 자리와 맞는지" 확인의 답이 이것이다: 시세 일괄 갱신·CSV 가져오기가
 * 필요로 하는 값 있는 진행률에 그대로 맞고, DS가 더 얹을 접근성 배선이 없다.
 * 우리가 더하는 것은 트랙·필의 색과 두께뿐이다. */

export interface ProgressRootProps
  extends Omit<React.ComponentPropsWithoutRef<typeof BaseProgress.Root>, "className"> {
  className?: string
}

/** 값 있는 진행률 하나를 감싼다. `value`는 필수다(`null`을 주면 Base UI가
 * 비결정적으로 그리지만, 그 모양은 Spinner의 자리이므로 여기서는 쓰지 않는다). */
function Root({ className, ...props }: ProgressRootProps) {
  return <BaseProgress.Root className={cn("flex w-full flex-col gap-2", className)} {...props} />
}

export interface ProgressTrackProps
  extends Omit<React.ComponentPropsWithoutRef<typeof BaseProgress.Track>, "className"> {
  className?: string
}

/* 잔여 트랙은 대비를 지지 않는다(rules.md 토큰과 대비 — "track remainder(Progress,
 * Slider)는 채워진 부분이 뜻을 이미 지므로 대비를 지지 않는다"). `bg-neutral-soft`는
 * 그 자리에 대비 게이트가 이미 검증한 조합에서 온 값이지, 이 자리가 대비를
 * 요구해서 고른 값이 아니다. */
export const progressTrackVariants = cva(
  "relative h-2 w-full overflow-hidden rounded-full bg-neutral-soft"
)

function Track({ className, ...props }: ProgressTrackProps) {
  return <BaseProgress.Track className={cn(progressTrackVariants(), className)} {...props} />
}

export interface ProgressIndicatorProps
  extends Omit<React.ComponentPropsWithoutRef<typeof BaseProgress.Indicator>, "className"> {
  className?: string
}

/* 필은 tabs.tsx의 인디케이터(`bg-accent-solid`)와 같은 자리다 — 정적 표식이지
 * hover·pressed를 갖는 상태 있는 표면이 아니므로 `--ds-state-base`가 아니라
 * `bg-accent-solid`를 직접 쓴다(state.css는 상태 사다리가 있는 표면만의 유일한
 * 필자다, rules.md 토큰과 대비). 너비는 Base UI가 인라인 스타일(`percentageValue`)로
 * 주므로 이 클래스는 `absolute`+`inset-y-0`로 Track을 채우는 자리만 만든다. */
export const progressIndicatorVariants = cva(
  "absolute inset-y-0 start-0 h-full rounded-full bg-accent-solid transition-[width] duration-300 ease-out"
)

function Indicator({ className, ...props }: ProgressIndicatorProps) {
  return (
    <BaseProgress.Indicator className={cn(progressIndicatorVariants(), className)} {...props} />
  )
}

export interface ProgressLabelProps
  extends Omit<React.ComponentPropsWithoutRef<typeof BaseProgress.Label>, "className"> {
  className?: string
}

/** 진행률이 무엇의 진행인지 이름 붙인다(예: "시세 갱신 중"). Root의
 * `aria-labelledby`로 한 번만 읽힌다 — Field의 라벨과 같은 자리다. */
function Label({ className, ...props }: ProgressLabelProps) {
  return (
    <BaseProgress.Label
      className={cn("text-sm font-medium text-default", className)}
      {...props}
    />
  )
}

export interface ProgressValueProps
  extends Omit<React.ComponentPropsWithoutRef<typeof BaseProgress.Value>, "className"> {
  className?: string
}

/** 서식이 갖춰진 값(기본은 백분율)을 보여준다 — 계산은 Base UI가 진다. */
function Value({ className, ...props }: ProgressValueProps) {
  return <BaseProgress.Value className={cn("text-sm text-muted", className)} {...props} />
}

export const Progress = { Root, Track, Indicator, Label, Value }
