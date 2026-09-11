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
 * "한 세트의 UI 객체"라는 정의가 빈 상태 블록과 맞는다.
 *
 * #327: Title·Description 둘 다 옵셔널 파트다(Title이 "실질적으로 항상 쓴다"는
 * 문서화된 관례여도 타입은 막지 않는다) — 그런데 Root가 `aria-labelledby`·
 * `aria-describedby`를 무조건 걸면, 파트가 빠졌을 때 아무 요소도 갖지 않는
 * id를 가리키는 매달린 IDREF가 남고 axe(`aria-valid-attr-value`)가 이를 잡는다.
 * 소비처(투자 다이어리 거래 목록)가 실제로 Description 없이 Root를 쓰는 경로가
 * 있어 이 결함이 현실에서 터졌다.
 *
 * Field는 Base UI 프리미티브 컨텍스트가 렌더 이후 어떤 파트가 실제로 마운트됐는지
 * 추적해 같은 문제를 푼다 — 이 패키지엔 그 프리미티브가 없다. effect로
 * 마운트 여부를 감지해 상태를 갱신하는 방식은 이 패키지에 지역 상태·effect가
 * 전혀 없다는 하우스 스타일을 깨는 것은 물론, 첫 페인트에는 무조건 켠 값으로
 * 그렸다가 effect가 돈 뒤에야 고치는 렌더-순서 버그를 그대로 만든다(첫 axe
 * 스냅숏이 이미 틀린 값을 본다). 대신 `props.children`은 Root 함수 본문이
 * 실행되는 시점에 이미 완성된 React 엘리먼트 트리이므로, 같은 렌더 패스 안에서
 * `React.Children`으로 그 트리를 훑어 `Title`·`Description`이 직계 자식으로
 * 있는지 동기적으로 판정할 수 있다 — 훅도 effect도 추가하지 않는 가장 단순한
 * 수단이고, 첫 페인트부터 정답을 그린다. */

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

/** `children` 중 직계 자식으로 `part`(`Title`이나 `Description`)가 있는지
 * 동기적으로 판정한다 — Root 자신의 렌더 패스 안에서 끝나므로 effect나 추가
 * 상태 없이 첫 페인트부터 정확하다(위 #327 코멘트 참고). */
function hasPart(children: React.ReactNode, part: React.ElementType): boolean {
  return React.Children.toArray(children).some(
    (child) => React.isValidElement(child) && child.type === part,
  )
}

/** 빈 상태 블록 하나를 감싼다. 안의 `Title`·`Description`이 낸 id를, 그 파트가
 * 실제로 렌더될 때만 `aria-labelledby`·`aria-describedby`로 받아 스크린 리더가
 * 한 덩어리로 읽는다 — 파트가 없으면 아무 요소도 갖지 않는 id를 가리키는 매달린
 * IDREF를 남기지 않는다(#327). */
function Root({ className, children, ...props }: EmptyStateRootProps) {
  const titleId = React.useId()
  const descriptionId = React.useId()

  return (
    <EmptyStateContext.Provider value={{ titleId, descriptionId }}>
      <div
        role="group"
        aria-labelledby={hasPart(children, Title) ? titleId : undefined}
        aria-describedby={hasPart(children, Description) ? descriptionId : undefined}
        className={cn(rootVariants(), className)}
        {...props}
      >
        {children}
      </div>
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
