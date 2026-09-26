import { cva, type VariantProps } from "class-variance-authority"
import type * as React from "react"

import { cn } from "../lib/utils.js"
import { Heading, type HeadingProps } from "../text/text.js"

/* Base UI 뒤에 없다 — Card는 자체 스타일 primitive다(스펙 #283). 서버 컴포넌트로
 * 남는다: 상태도 이벤트 핸들러도 없어 `"use client"`가 필요 없다. 이 경계는
 * test/package.test.mjs가 "./card"를 SERVER_SUBPATHS로 재고 지킨다.
 *
 * 그림자는 강제하지 않는다(ADR-0023 §11 "그림자 토큰은 있되 강제하지 않는다" —
 * 스토리 12). `border`와 `bg-surface`만으로 면을 뗀다 — shadow-* 유틸리티는
 * 여기서 내지 않고, 필요하면 소비처가 className으로 얹는다. */
export const cardVariants = cva(
  "flex flex-col gap-6 rounded-lg border border-default bg-surface py-(--ds-card-padding) text-default",
  {
    variants: {
      /* `list`는 헤더 아래 행 목록이 카드 가장자리까지 붙는 목록 카드다(#469).
       * Root는 위아래 여백과 파트 사이 간격을 내려놓고, 파트의 모양은
       * card.css가 `data-variant`를 보고 정한다. */
      variant: { default: "", list: "gap-0 py-0" },
    },
    defaultVariants: { variant: "default" },
  }
)

export interface CardRootProps
  extends React.ComponentPropsWithoutRef<"div">,
    VariantProps<typeof cardVariants> {}

/* 여백은 공개 변수 `--ds-card-padding` 하나에서 나온다(#469). 기본값(16, sm
 * 이상 24)은 여기가 아니라 card.css의 `@layer components`가 정의한다 — 앱이
 * Root에 `[--ds-card-padding:…]`를 주면 utilities 층이라 폭과 관계없이 이긴다.
 * 같은 층의 `sm:[--ds-card-padding:…]`였다면 sm 이상에서 앱의 값이 졌다.
 *
 * 파트는 Root의 `variant`를 React context가 아니라 `data-variant`와 부모
 * 선택자로 안다 — context를 쓰면 서버 컴포넌트로 남을 수 없다. */
function Root({ className, variant, ...props }: CardRootProps) {
  return (
    <div
      data-slot="card"
      data-variant={variant ?? "default"}
      className={cn(cardVariants({ variant }), className)}
      {...props}
    />
  )
}

const HEADER = "flex flex-col gap-1.5 px-(--ds-card-padding)"
const BODY = "px-(--ds-card-padding)"
const FOOTER = "flex items-center gap-2 px-(--ds-card-padding)"
/* 행 자신의 좌우 여백은 card.css가 `> *`로 준다 — 파트 클래스로는 줄 것이 없다 */
const ROWS = "flex flex-col"

/** 파트 클래스 — cva 뒤에 있지 않아 test/card.test.mjs가 여기서 직접 읽는다. */
export const cardPartClassNames = { HEADER, BODY, FOOTER, ROWS }

export interface CardPartProps extends React.ComponentPropsWithoutRef<"div"> {}

/** 제목·설명 같은 안내문이 놓이는 자리. 세로 간격은 Root의 `gap-6`이 다른
 * 파트와의 사이를 벌리고, Header 안에서는 `gap-1.5`로 더 좁게 묶는다. 목록
 * 카드에서는 card.css가 위아래 12px과 아래 구분선을 준다. */
function Header({ className, ...props }: CardPartProps) {
  return <div data-slot="card-header" className={cn(HEADER, className)} {...props} />
}

/** 카드의 본문. 파트를 하나만 쓰는 카드(Header 없이 Body만)도 흔하므로 세로
 * 여백은 Root가 지고 Body는 가로 여백만 진다. 목록 카드에서는 Root가 세로
 * 여백을 내려놓으므로 card.css가 Body에 네 방향 여백을 준다 — 타일 격자·경고·
 * 빈 상태처럼 행이 아닌 내용이 여기 들어간다. */
function Body({ className, ...props }: CardPartProps) {
  return <div data-slot="card-body" className={cn(BODY, className)} {...props} />
}

/** 동작이 놓이는 자리 — 대개 Button. Button을 여기서 import해 기본 variant를
 * 먹이지 않는다: 그 결정은 소비처의 몫이고, 먹이면 Button의 상태 사다리가
 * 이 자리에서만 갈린다(rules.md 의존성과 base, Button의 같은 판단 참고). 목록
 * 카드에서는 card.css가 Header와 대칭으로 위아래 12px과 위쪽 구분선을 준다(#476). */
function Footer({ className, ...props }: CardPartProps) {
  return <div data-slot="card-footer" className={cn(FOOTER, className)} {...props} />
}

/** 행 목록을 카드 가장자리까지 붙이는 자리(#469). 직계 자식(행) 각각의 좌우
 * 여백을 `--ds-card-padding`에 맞춰 행의 첫 글자가 Header 글자와 같은 세로선에
 * 선다. 행(`ListRow`) 자신의 치수는 건드리지 않는다 — 규칙이 components 층에
 * 있어 행에 준 `px-*`가 이긴다. 행 사이 구분선은 행이나 앱의 몫이다. */
function Rows({ className, ...props }: CardPartProps) {
  return <div data-slot="card-rows" className={cn(ROWS, className)} {...props} />
}

/** Header 안에 놓는 제목. 소비처 셋(auth·history·portfolio)에서 `Heading`을
 * `Card.Header` 안에 직접 두는 조립이 14번 반복돼 프리셋으로 올린다
 * (ADR-0023 §5 "반복이 확인된 뒤"). `Text`/`Heading`처럼 접근성 트리의 제목
 * 레벨(`level`)과 시각 크기(`size`)를 함께 받되, 카드 제목이 흔히 놓이는
 * 위계(h3)와 크기(`lg`)를 기본값으로 둔다 — shadcn `CardTitle`은 `<div>`였고
 * 제목이 문서 구조에 들어가지 않았다. */
function Title({ level = 3, size = "lg", className, ...props }: HeadingProps) {
  return <Heading level={level} size={size} className={cn("leading-none", className)} {...props} />
}

/** `Card.Root`·`Card.Header`·`Card.Body`·`Card.Footer`·`Card.Title`·`Card.Rows` —
 * 네임스페이스형 API(ADR-0023 §5). Title·Rows를 뺀 넷은 옵셔널이라 Body 하나만
 * 쓰는 카드도 유효하다. */
export const Card = { Root, Header, Body, Footer, Title, Rows }
