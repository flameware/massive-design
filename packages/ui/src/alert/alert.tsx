import { cva, type VariantProps } from "class-variance-authority"
import type * as React from "react"

import { cn } from "../lib/utils.js"

/* Base UI 뒤에 없다 — Alert은 자체 스타일 primitive다(스펙 #283). 서버
 * 컴포넌트로 남는다: 상태도 이벤트 핸들러도 없어 `"use client"`가 필요 없다.
 * test/package.test.mjs가 "./alert"를 SERVER_SUBPATHS로 재고 지킨다.
 *
 * 톤 축은 `neutral`·`danger`·`warning` 셋이다(#324 — `info` 패밀리는 앱에 자리가
 * 없어 만들지 않는다). warning 패밀리 토큰(`bg.warning.soft`·`fg.warning`)은
 * `@theme`에 이미 있다 — #280이 열었다. 이 티켓은 토큰이 아니라 이 축에 값 하나를
 * 더한다. 색은 **대비 게이트가 이미 검증한 조합만** 쓴다(packages/tokens/scripts/contrast.mjs
 * TEXT_PAIRS): `fg.danger`는 `bg.danger.soft` 위에서만, `fg.warning`은
 * `bg.warning.soft` 위에서만, `fg.default`·`fg.muted`는 `bg.neutral.soft` 위에서
 * 검증됐다. danger·warning 톤에서 제목·설명을 둘 다 자기 색 하나로 통일하는 것은
 * 미감이 아니라 이 목록이 `fg.muted`·`bg.danger.soft`(또는 `bg.warning.soft`) 조합을
 * 검증하지 않기 때문이다 — 검증 밖의 색은 만들지 않는다. warning은 `border.warning`
 * 토큰이 없어(semantic/color.json에 danger만 있다) 테두리는 `border-default`를
 * 쓴다 — neutral과 같은 자리다. Alert의 테두리는 대비 게이트의 NONTEXT_PAIRS
 * 대상(인터랙티브 어포던스)이 아니라 이 선택이 게이트를 우회하는 것이 아니다. */
export const alertVariants = cva(
  [
    // 격자 1열은 아이콘, 2열은 제목·설명이다. 아이콘 없이 써도 무너지지
    // 않는다 — 빈 1열은 내용이 없으면 트랙 너비가 0이 된다. 아이콘은 소비처가
    // @flameware/ui/icon으로 Root의 첫 자식에 놓는다(스펙 #283) — Alert은 자기가
    // 만들지 않는다. currentColor를 따라가도록 크기·자리만 여기서 진다
    "relative grid grid-cols-[auto_1fr] items-start gap-x-3 gap-y-1 rounded-lg border p-4 text-sm",
    "[&>svg]:col-start-1 [&>svg]:row-start-1 [&>svg]:size-4 [&>svg]:mt-0.5 [&>svg]:shrink-0",
  ],
  {
    variants: {
      tone: {
        neutral: "border-default bg-neutral-soft text-default",
        danger: "border-danger bg-danger-soft text-danger",
        warning: "border-default bg-warning-soft text-warning",
      },
    },
    defaultVariants: { tone: "neutral" },
  }
)

export interface AlertRootProps
  extends React.ComponentPropsWithoutRef<"div">,
    VariantProps<typeof alertVariants> {}

/**
 * 지속적인 피드백이나 주의 사항을 의미별로 전달하는 배너.
 *
 * role은 톤을 따라 갈린다 — `danger`는 사용자가 놓치면 안 되는 오류라
 * `role="alert"`(assertive, 삽입 즉시 읽는다), 그 밖의 톤은 급하지 않은 안내라
 * `role="status"`(polite, 읽던 것을 끊지 않는다)다. `warning`도 `status`다(#324) —
 * 시세 갱신 실패·환율 미상처럼 "틀리진 않았지만 주의"인 자리는 지금 당장 조치가
 * 필요한 오류가 아니라 사용자가 이어 하던 일을 끊을 근거가 없다. 놓치면 안 되는
 * 것과 급하지 않은 것을 가르는 축이 role이고, warning은 후자다. 하나로 고정하지
 * 않는 이유는 "role을 올바르게 갖는다"가 톤 전부에 같은 값을 박는 것이 아니라 각
 * 톤의 긴급도에 맞는 값을 고르는 일이기 때문이다.
 */
function Root({ className, tone, ...props }: AlertRootProps) {
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={cn(alertVariants({ tone }), className)}
      {...props}
    />
  )
}

const TITLE = "col-start-2 font-medium leading-none"
const DESCRIPTION = "col-start-2 text-sm"

export interface AlertPartProps extends React.ComponentPropsWithoutRef<"div"> {}

/** 제목. Description 없이 Title만 있어도 유효하다(짧은 배너). */
function Title({ className, ...props }: AlertPartProps) {
  return <div className={cn(TITLE, className)} {...props} />
}

/** 부연 설명. Title 없이 Description만 있어도 유효하다. */
function Description({ className, ...props }: AlertPartProps) {
  return <div className={cn(DESCRIPTION, className)} {...props} />
}

/** `Alert.Root`·`Alert.Title`·`Alert.Description` — 네임스페이스형
 * API(ADR-0023 §5). Root 안쪽 첫 자식으로 `<Icon>` 하나, 그다음 Title·
 * Description을 담는 세로 스택을 두는 조립이 일반적이다(Alert 스토리 참고). */
export const Alert = { Root, Title, Description }
