import { cva, type VariantProps } from "class-variance-authority"
import type * as React from "react"

import { cn } from "../lib/utils.js"

/* Base UI 뒤에 없다 — Badge는 자체 스타일 primitive다(#290). 서버 컴포넌트로
 * 남는다: 상태도 이벤트 핸들러도 없어 `"use client"`가 필요 없다.
 * test/package.test.mjs가 "./badge"를 SERVER_SUBPATHS로 재고 지킨다.
 *
 * 톤은 일곱이고, 색은 **대비 게이트가 이미 검증한 조합만** 쓴다
 * (packages/tokens/scripts/contrast.mjs TEXT_PAIRS) — `fg.default`는
 * `bg.neutral.soft` 위에서, `fg.{accent,danger,success,warning}`은 각자의
 * `bg.{family}.soft` 위에서 검증됐다. 검증 밖의 조합(예: `fg.muted` × 유채
 * soft)은 만들지 않는다. 도메인 값(매수·매도 등)을 톤 이름으로 추가하지
 * 않는다 — 소비처가 일곱 톤에 자기 의미를 매핑한다(rules.md 축과 이름 공간).
 *
 * `muted`는 새 축이 아니라 이 축의 새 값이다(#368) — 실측이 요구한 12자리는
 * 전부 `text-muted`(부모 색과 갈리지 않는 조용한 배지)를 손으로 얹고 있었다.
 * `text-muted`를 다른 다섯 톤처럼 soft 면 위에 얹으면 대비 게이트가 깨진다
 * — `fg.muted`는 `bg.<family>.soft` 조합에서 검증돼 있지 않다(TEXT_PAIRS는
 * `fg.muted`를 SURFACES·`bg.neutral.soft` 위에서만 잰다). 값을 포기하는 대신
 * **면을 고른다**(AC): `bg.neutral.muted`는 #337이 정확히 이 용도로 이미 연
 * "면으로 읽혀야 하는 채움" 단계이고, `fg.default`와의 조합이 FILL_GATE
 * 1.35와 TEXT_PAIRS 4.5 둘 다 이미 검증돼 있다(MUTEDS 목록). 그래서 `muted`
 * 톤은 `bg-neutral-muted text-default`다 — 새 토큰이 필요 없었다.
 *
 * `outline`은 면을 채우지 않고 테두리만 두른다 — 소비처(auth·history·
 * portfolio) 9자리에서 반복된 자리다(ADR-0023 §5). 글자색은 `fg.default`
 * 하나뿐이다: 새 색 조합을 여는 대신, 면이 있는 다섯 톤과 달리 이 톤은
 * "분류"가 아니라 "밀도가 낮은 배지"가 필요할 때 쓰는 용도라 톤별 글자색이
 * 필요 없다. 소비처가 더 옅은 글자색을 원하면 지금까지처럼 `className`으로
 * 얹는다(`fg.default`는 이미 모든 표면 위에서 검증됐으므로 그 위에 얹는
 * `className`은 이 컴포넌트의 대비 계약을 깨지 않는다).
 *
 * `whitespace-nowrap`은 축이 아니라 기본값이다(#322). Badge는 "짧은 분류·상태" 하나를
 * 나르기로 선언한 컴포넌트라, 두 줄이 되는 것은 이 컴포넌트가 고른 모양이 아니라 정하지
 * 않은 것이었다 — 좁은 셀에서 배지가 "매/수"로 갈린 것이 그 결손이다
 * (flameware/investmentdiary#240). 소비처의 배지 21자리를 다시 세어 줄바꿈을 원하는
 * 자리는 0이었고, 사용자 입력이 길이를 정하는 단 한 자리(노트 목록의 활성 필터)는
 * 이미 손으로 `whitespace-nowrap`+`truncate`를 얹고 있었다. 그래서 `wrap` 축을 열지
 * 않는다 — rules.md 축과 이름 공간: 차원을 더하는 데는 실측된 수요가 필요하고,
 * 줄바꿈하는 배지의 수요는 0이다.
 *
 * `stable` 컴포넌트의 기본 렌더를 바꾸지만 **깨는 변경이 아니다** — props·타입·
 * 서브패스·`badgeVariants` 시그니처가 그대로다(판정과 근거는 #322 코멘트, 요약은
 * #317 Decisions-so-far).
 *
 * 되돌리는 비용은 클래스 하나다 — `cn`이 tailwind-merge이므로 `className`의
 * `whitespace-normal`이 기본 `whitespace-nowrap`을 **지운다**(`!`도, 축도 필요 없다).
 * 같은 이유로 `className="shrink"`는 기본 `shrink-0`을 지운다. 그래서 옵트인 축을 열지
 * 않는 판정의 비용이 낮다: 줄바꿈이 필요한 자리가 나중에 생기면 그 자리가 한 클래스로
 * 되돌린다. test/emission.test.mjs가 이 되돌리기를 지킨다 — `cn`이나 tailwind-merge
 * 설정이 바뀌어 기본값이 남으면 그 테스트가 먼저 깨진다.
 *
 * 길이를 모르는 값을 담는 자리의 권고는 되돌리기가 아니라 말줄임이다: 배지에
 * `max-w-full min-w-0`, 자식 텍스트에 `min-w-0 truncate`. */
export const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium",
  {
    variants: {
      tone: {
        neutral: "bg-neutral-soft text-default",
        accent: "bg-accent-soft text-accent",
        danger: "bg-danger-soft text-danger",
        success: "bg-success-soft text-success",
        warning: "bg-warning-soft text-warning",
        outline: "border border-default text-default bg-transparent",
        muted: "bg-neutral-muted text-default",
      },
    },
    defaultVariants: { tone: "neutral" },
  }
)

export interface BadgeProps
  extends React.ComponentPropsWithoutRef<"span">,
    VariantProps<typeof badgeVariants> {}

/**
 * 짧은 분류·상태를 보조하는 태그.
 *
 * 이름을 나르지 않는다 — 곁에 놓인 텍스트가 이미 뜻을 말하는 자리에 쓴다.
 * Badge 혼자 정보의 유일한 출처가 되면(예: 아이콘만 있는 톤 표시) 스크린
 * 리더는 그 뜻을 읽지 못한다.
 */
export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />
}
