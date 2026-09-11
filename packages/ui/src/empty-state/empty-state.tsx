"use client"

import { cva } from "class-variance-authority"
import * as React from "react"

import { cn } from "../lib/utils.js"
import { Heading, Text, type HeadingProps, type TextProps } from "../text/text.js"

/* Base UI 뒤에 없다 — "…없습니다" 자리는 Base UI 후보 목록에 없는 자체 스타일
 * 패턴이다(#317 Implementation Decisions "Empty state는 자체 스타일이다").
 * 네임스페이스형 API다(ADR-0023 §5, Progress·Card와 같은 모양) — 아이콘·제목·
 * 설명·행동 버튼 넷 다 옵셔널 자리이되, 제목·설명은 이 패턴이 존재하는 이유이므로
 * 실질적으로 항상 쓴다. 아이콘과 행동 버튼만 없어도 무너지지 않는다는 것이
 * 이 티켓의 명시적 스토리다(#326 AC).
 *
 * Title·Description을 Root의 `aria-labelledby`·`aria-describedby`로 묶어
 * 보조기술에 한 덩어리로 읽히게 한다(#326 AC "제목·설명이 보조기술에 한 덩어리로
 * 읽힌다"). Base UI Field가 라벨·설명을 컨텍스트로 자동 연결하는 것과 같은
 * 모양이지만(field.tsx 참고), 뒤에 선 프리미티브가 없으므로 이 파일이 직접
 * `useId`로 배선한다. `role="group"`은 Landmark를 새로 열지 않으면서
 * (`role="region"`과 달리) 접근성 이름·설명 계산을 받는 최소 역할이다 —
 * "한 세트의 UI 객체"라는 정의가 빈 상태 블록과 맞는다. */

interface EmptyStateContextValue {
  titleId: string
  descriptionId: string
}

const EmptyStateContext = React.createContext<EmptyStateContextValue | null>(null)

function useEmptyStateContext(part: string): EmptyStateContextValue {
  const ctx = React.useContext(EmptyStateContext)
  if (!ctx) throw new Error(`EmptyState.${part}는 EmptyState.Root 안에서만 쓴다`)
  return ctx
}

const rootVariants = cva("flex flex-col items-center gap-1 py-12 text-center")

export interface EmptyStateRootProps extends Omit<React.ComponentPropsWithoutRef<"div">, "className"> {
  className?: string
}

/** 빈 상태 블록 하나를 감싼다. 안의 `Title`·`Description`이 낸 id를
 * `aria-labelledby`·`aria-describedby`로 받아 스크린 리더가 한 덩어리로 읽는다. */
function Root({ className, ...props }: EmptyStateRootProps) {
  const titleId = React.useId()
  const descriptionId = React.useId()

  return (
    <EmptyStateContext.Provider value={{ titleId, descriptionId }}>
      <div
        role="group"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className={cn(rootVariants(), className)}
        {...props}
      />
    </EmptyStateContext.Provider>
  )
}

export interface EmptyStateIconProps extends Omit<React.ComponentPropsWithoutRef<"div">, "className"> {
  className?: string
}

/* 이름표는 여기 두지 않는다 — 아이콘의 이름은 언제나 밖에 있다(icon.tsx 참고,
 * `Icon`이 기본으로 `aria-hidden`을 건다). 이 슬롯은 크기·색·간격만 진다.
 * 기본 아이콘 크기(`Icon`의 `md`=16px)보다 큰 자리이므로 자식 svg에 직접
 * 40px를 입힌다 — 소비처가 `<Icon icon={Inbox} />` 하나만 넘기면 된다. */
function IconSlot({ className, ...props }: EmptyStateIconProps) {
  return (
    <div
      className={cn("mb-2 text-muted [&>svg]:size-10", className)}
      {...props}
    />
  )
}

/** `EmptyState.Title` — `level`(접근성 트리)·`size`(시각)를 Card.Title과 같은
 * 기본값(h3·lg)으로 둔다. Root가 낸 `titleId`를 받아 `aria-labelledby`의
 * 대상이 된다. */
function Title({ level = 3, size = "lg", className, ...props }: HeadingProps) {
  const { titleId } = useEmptyStateContext("Title")
  return <Heading id={titleId} level={level} size={size} className={cn("font-semibold", className)} {...props} />
}

/** `EmptyState.Description` — Root가 낸 `descriptionId`를 받아
 * `aria-describedby`의 대상이 된다. 줄 폭을 `max-w-sm`으로 좁혀 가운데 정렬된
 * 문단이 과하게 넓어지지 않게 한다. */
function Description({ className, ...props }: TextProps) {
  const { descriptionId } = useEmptyStateContext("Description")
  return (
    <Text id={descriptionId} className={cn("max-w-sm text-muted", className)} {...props} />
  )
}

export interface EmptyStateActionProps extends Omit<React.ComponentPropsWithoutRef<"div">, "className"> {
  className?: string
}

/** 행동 버튼이 놓이는 자리 — 대개 `Button`. Card.Footer와 같은 이유로 여기서
 * `Button`을 import해 기본 variant를 먹이지 않는다(rules.md 의존성과 base) —
 * 어떤 variant를 쓸지는 소비처의 몫이다. 24×24 포인터 하한은 `Button`이 이미
 * 진다(`hit-area`, ADR-0020) — 이 슬롯은 위쪽 간격만 더한다. */
function Action({ className, ...props }: EmptyStateActionProps) {
  return <div className={cn("mt-2", className)} {...props} />
}

/** `EmptyState.Root`·`Icon`·`Title`·`Description`·`Action` — 네임스페이스형
 * API(ADR-0023 §5). `Icon`·`Action`은 옵셔널이라 아이콘 없이·행동 버튼 없이도
 * 유효하다(#326 AC). */
export const EmptyState = { Root, Icon: IconSlot, Title, Description, Action }
