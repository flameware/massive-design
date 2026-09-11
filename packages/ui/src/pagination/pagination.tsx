"use client"

import type * as React from "react"

import { Button } from "../button/button.js"
import { cn } from "../lib/utils.js"

/* Base UI 뒤에 없다 — 자체 스타일 패턴이다(#317 Implementation Decisions
 * "Pagination·Empty state는 자체 스타일이다"). 소비처(거래 데이터 테이블)가
 * 이미 페이지 상태를 갖고 있다 — TanStack Table의 `pageIndex`/`pageCount`/
 * `nextPage` 위에 얹기만 하면 되게 하는 것이 이 티켓의 요구다(#329 "What to
 * build"). 그래서 이 컴포넌트는 페이지 상태를 **갖지 않는다**: `page`·
 * `pageCount`·`onPageChange` 셋만 받는 제어 컴포넌트다 — `useState` 없이도
 * 소비처의 상태를 그대로 비춘다.
 *
 * 네임스페이스형 API를 열지 않는다(EmptyState·Progress와 다른 모양). 페이지
 * 번호·줄임표의 계산은 소비처가 조립할 자리가 아니라 이 컴포넌트가 스스로
 * 하는 일이기 때문이다 — EmptyState의 파트들은 소비처가 무엇을 넣을지
 * 고르지만, Pagination의 "무엇을 보여줄까"(경계·형제·줄임표)는 `page`·
 * `pageCount`·`siblingCount`·`boundaryCount`에서 결정된다. 소비처 자리는
 * 지금 하나(거래 데이터 테이블, #329)라 파트로 여는 것은 실측 없는 축이다
 * (rules.md 방법론).
 *
 * 이전/다음·페이지 번호 버튼은 `Button`을 그대로 쓴다 — composed component가
 * 원본을 소비한다는 규칙과 같은 근거다(rules.md 축과 이름 공간 #91, Combobox가
 * Command·Popover를 쓰는 것과 같은 모양). variant·상태 레이어·24×24 포인터
 * 하한(`size="icon"`, ADR-0020)을 다시 만들지 않는다. */

/** 페이지 번호 사이 줄임표. */
export type PaginationItem = number | "start-ellipsis" | "end-ellipsis"

function range(start: number, end: number): number[] {
  const length = end - start + 1
  return length <= 0 ? [] : Array.from({ length }, (_, i) => start + i)
}

/** 보이는 페이지 번호·줄임표의 목록을 계산한다. 경계(`boundaryCount`)는
 * 시작·끝에 항상 보이고, 현재 페이지 좌우로 `siblingCount`만큼 보이며, 그
 * 사이에 뜬 자리는 숫자 하나(간격이 1) 또는 줄임표(간격이 그 이상)로
 * 메운다. */
export function getPaginationItems(
  page: number,
  pageCount: number,
  siblingCount: number,
  boundaryCount: number
): PaginationItem[] {
  const count = Math.max(1, pageCount)
  const current = Math.min(Math.max(1, page), count)

  const startPages = range(1, Math.min(boundaryCount, count))
  const endPages = range(Math.max(count - boundaryCount + 1, boundaryCount + 1), count)

  const siblingsStart = Math.max(
    Math.min(current - siblingCount, count - boundaryCount - siblingCount * 2 - 1),
    boundaryCount + 2
  )
  const siblingsEnd = Math.min(
    Math.max(current + siblingCount, boundaryCount + siblingCount * 2 + 2),
    endPages[0] !== undefined ? endPages[0] - 2 : count - 1
  )

  return [
    ...startPages,
    ...(siblingsStart > boundaryCount + 2
      ? (["start-ellipsis"] as const)
      : boundaryCount + 1 < count - boundaryCount
        ? [boundaryCount + 1]
        : []),
    ...range(siblingsStart, siblingsEnd),
    ...(siblingsEnd < count - boundaryCount - 1
      ? (["end-ellipsis"] as const)
      : count - boundaryCount > boundaryCount
        ? [count - boundaryCount]
        : []),
    ...endPages,
  ]
}

function ChevronLeftIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className="size-4">
      <path d="M10 3 5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" className="size-4">
      <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export interface PaginationProps
  extends Omit<React.ComponentPropsWithoutRef<"nav">, "className" | "onChange"> {
  /** 현재 페이지. 1부터 시작한다(TanStack의 `pageIndex`는 0부터라 소비처가
   * `pageIndex + 1`로 넘긴다 — MDX 참고). */
  page: number
  /** 전체 페이지 수. */
  pageCount: number
  /** 페이지가 바뀔 때 불린다 — 다음에 가야 할 페이지 번호(1부터)를 받는다.
   * 이 컴포넌트는 자기 상태를 갖지 않으므로 소비처가 `page`를 갱신해야
   * 실제로 페이지가 넘어간다. */
  onPageChange: (page: number) => void
  /** 시작·끝에 항상 보이는 페이지 수. 기본 1. */
  boundaryCount?: number
  /** 현재 페이지 좌우로 보이는 페이지 수. 기본 1. */
  siblingCount?: number
  /** "이전" 버튼의 접근성 이름. 기본 "이전 페이지". */
  previousLabel?: string
  /** "다음" 버튼의 접근성 이름. 기본 "다음 페이지". */
  nextLabel?: string
  className?: string
}

/**
 * 이전/다음·페이지 번호·현재 표시를 갖춘 페이지 이동.
 *
 * 상태를 갖지 않는다 — `page`·`pageCount`·`onPageChange`로만 그린다. 앞뒤
 * 경계(`page`가 1이거나 `pageCount`)에서 이전·다음 버튼이 `disabled`가 되고,
 * 현재 페이지 버튼은 `aria-current="page"`를 진다. `nav`가 접근성 이름을
 * 진다(기본 "페이지 이동") — 페이지가 여럿인 화면에서 `nav`가 둘 이상이어도
 * 스크린 리더가 구분한다.
 *
 * 키보드는 네이티브다: 모든 버튼이 `Button`이므로 Tab이 순서대로 닿고
 * Enter·Space가 활성화한다 — 이 계약을 선언하는 자리는
 * Pagination.stories.tsx다.
 */
export function Pagination({
  page,
  pageCount,
  onPageChange,
  boundaryCount = 1,
  siblingCount = 1,
  previousLabel = "이전 페이지",
  nextLabel = "다음 페이지",
  "aria-label": ariaLabel,
  className,
  ...props
}: PaginationProps) {
  const items = getPaginationItems(page, pageCount, siblingCount, boundaryCount)

  return (
    <nav
      aria-label={ariaLabel ?? "페이지 이동"}
      className={cn("flex items-center gap-1", className)}
      {...props}
    >
      <Button
        variant="ghost"
        size="icon"
        aria-label={previousLabel}
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeftIcon />
      </Button>

      {items.map((item, index) =>
        typeof item === "number" ? (
          <Button
            key={item}
            variant={item === page ? "outline" : "ghost"}
            size="icon"
            aria-label={`${item} 페이지로 이동`}
            aria-current={item === page ? "page" : undefined}
            onClick={() => onPageChange(item)}
          >
            {item}
          </Button>
        ) : (
          <span
            key={item === "start-ellipsis" ? `start-${index}` : `end-${index}`}
            aria-hidden="true"
            className="select-none px-1 text-sm text-muted"
          >
            …
          </span>
        )
      )}

      <Button
        variant="ghost"
        size="icon"
        aria-label={nextLabel}
        disabled={page >= pageCount}
        onClick={() => onPageChange(page + 1)}
      >
        <ChevronRightIcon />
      </Button>
    </nav>
  )
}
