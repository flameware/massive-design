import { cva, type VariantProps } from "class-variance-authority"
import type * as React from "react"

import { cn } from "../lib/utils.js"

/* Base UI 뒤에 없다 — ListRow는 자체 스타일 primitive다(#290). 상태도 이벤트
 * 핸들러도 없어 서버 컴포넌트로 남는다 — test/package.test.mjs가 "./list-row"를
 * SERVER_SUBPATHS로 재고 지킨다. 행 전체가 눌려야 하면 소비처가 `Button`을
 * `render`로 감싸거나 Root를 `<a>`/`<button>`으로 바꿔 쓴다 — ListRow 자신은
 * role도 tabIndex도 갖지 않는다(Card의 같은 판단, #283).
 *
 * 그리는 것은 모바일 목록의 한 줄뿐이다 — 주 텍스트·보조 텍스트·우측 값
 * (스펙 #290, 스토리 25). Leading 아이콘·다중 우측 값 같은 자리는 실측 수요가
 * 확인되면 연다(rules.md 축과 이름 공간) — 지금은 세 파트만 연다. */
export const listRowVariants = cva("flex min-w-0 items-center gap-3 py-3")

export interface ListRowRootProps
  extends React.ComponentPropsWithoutRef<"div">,
    VariantProps<typeof listRowVariants> {}

function Root({ className, ...props }: ListRowRootProps) {
  return <div className={cn(listRowVariants(), className)} {...props} />
}

const GROUP = "flex min-w-0 flex-1 flex-col"
const PRIMARY = "truncate text-sm font-medium text-default"
const SECONDARY = "truncate text-sm text-muted"
const VALUE = "ml-auto shrink-0 text-sm font-medium tabular-nums text-default"

/** 파트 클래스 — cva 뒤에 있지 않아 test/emission.test.mjs가 여기서 직접
 * 읽는다(다른 컴포넌트는 `xVariants()`를 그 용도로 호출한다). */
export const listRowPartClassNames = { GROUP, PRIMARY, SECONDARY, VALUE }

export interface ListRowPartProps extends React.ComponentPropsWithoutRef<"div"> {}

/** 주 텍스트와 보조 텍스트를 세로로 묶는 자리 — 둘이 같은 폭에서 각자 줄여져야
 * 하므로(`truncate`) 공통 `min-w-0` 컨테이너가 필요하다. */
function Group({ className, ...props }: ListRowPartProps) {
  return <div className={cn(GROUP, className)} {...props} />
}

/** 종목명·거래 제목처럼 한 줄의 이름표. */
function Primary({ className, ...props }: ListRowPartProps) {
  return <div className={cn(PRIMARY, className)} {...props} />
}

/** 날짜·수량처럼 주 텍스트를 보충하는 둘째 줄. Secondary 없이 Primary만
 * 있어도 유효하다. */
function Secondary({ className, ...props }: ListRowPartProps) {
  return <div className={cn(SECONDARY, className)} {...props} />
}

/** 금액·손익처럼 오른쪽 끝에 붙는 값. `ml-auto`가 Text와의 사이를 벌린다 —
 * Text가 없어도(아이콘만 있는 행 등) 오른쪽 끝에 붙는다. */
function Value({ className, ...props }: ListRowPartProps) {
  return <div className={cn(VALUE, className)} {...props} />
}

/** `ListRow.Root`·`ListRow.Group`·`ListRow.Primary`·`ListRow.Secondary`·
 * `ListRow.Value` — 네임스페이스형 API(ADR-0023 §5). 흔한 조립은
 * `Root > (Group > Primary + Secondary?) + Value?`다. */
export const ListRow = { Root, Group, Primary, Secondary, Value }
