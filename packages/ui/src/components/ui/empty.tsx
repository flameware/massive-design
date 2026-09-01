import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const emptyVariantsConfig = {
  variants: { variant: { default: "", outline: "border border-dashed" } },
  defaultVariants: { variant: "default" },
} as const
const emptyVariants = cva("flex min-w-0 flex-1 flex-col items-center justify-center gap-6 rounded-lg p-6 text-center md:p-12", emptyVariantsConfig)

function Empty({ className, variant = "default", ...props }: React.ComponentProps<"div"> & VariantProps<typeof emptyVariants>) {
  return <div data-slot="empty" className={cn(emptyVariants({ variant, className }))} {...props} />
}
const HEADER = "flex max-w-sm flex-col items-center gap-2 text-center"
const TITLE = "text-lg font-medium"
const DESCRIPTION = "text-sm text-muted-foreground [&>a:hover]:text-foreground [&>a]:underline [&>a]:underline-offset-4"
const CONTENT = "flex w-full max-w-sm min-w-0 flex-col items-center gap-4 text-sm"

/* `EmptyMedia`는 `ItemMedia`와 **한 축을 쓴다** — `frame`이고 값 이름도 같다(#145).
 *
 * 실질은 한 가지를 알아본 데서 나온다: **오늘의 `EmptyMedia`는 이미 upstream의
 * `icon` 값이다.** `size-10 rounded-lg bg-muted`에 `[&_svg]:size-6` — upstream이
 * `icon`으로 부르는 것과 같은 결정이고, upstream의 `default`(면 없음)에 해당하는
 * 모양은 우리에게 아예 없었다. 그래서 여기서는 **기본값이 `icon`이다.**
 * `ItemMedia`의 기본값이 `none`인 것과 방향이 반대로 보이지만 근거는 하나다 —
 * **기본값은 발행된 인스턴스를 지키는 값이다**(#143·#144). 두 슬롯이 오늘 서 있는
 * 자리가 다를 뿐이고, 그 비대칭이야말로 축을 공유해야 보이는 사실이다.
 *
 * `none`을 여는 근거는 ⓑ다. 지금 제목 위에 면 없는 글리프만 두려는 소비처는
 * `size-auto bg-transparent rounded-none` 세 유틸리티로 **우리 결정을 되돌려야**
 * 한다 — 계약이 새는 모양 그대로다.
 *
 * **`image`는 열지 않는다.** upstream에도 없고, 우리 쪽 근거가 따로 있다:
 * 이 슬롯은 제목 위 가운데 `size-10`이다. 40px 틀은 빈 상태 일러스트가 아니라
 * 글리프 칩이고, 일러스트를 원하는 소비처는 지름부터 덮으므로 그 값이 지는
 * 우리 결정이 남지 않는다 — ⓑ가 안 선다. 실측 수요도 없다(#123). 큰 그림이
 * 필요하면 소비처가 `EmptyHeader` 안에 자기 노드를 둔다. `ItemMedia`에만 `image`가
 * 있는 것은 두 어휘가 갈라진 것이 아니라 **40px 틀이 목록 행에서는 썸네일이고
 * 빈 상태 가운데서는 아니라는** 차이다. */
const emptyMediaVariantsConfig = {
  variants: {
    frame: {
      none: "[&_svg]:size-6",
      icon: "size-10 rounded-lg bg-muted [&_svg]:size-6",
    },
  },
  defaultVariants: { frame: "icon" },
} as const

const emptyMediaVariants = cva("flex items-center justify-center text-muted-foreground", emptyMediaVariantsConfig)

function EmptyHeader({ className, ...props }: React.ComponentProps<"div">) { return <div data-slot="empty-header" className={cn(HEADER, className)} {...props} /> }
function EmptyMedia({ className, frame = "icon", ...props }: React.ComponentProps<"div"> & VariantProps<typeof emptyMediaVariants>) { return <div data-slot="empty-media" data-frame={frame} className={cn(emptyMediaVariants({ frame, className }))} {...props} /> }
function EmptyTitle({ className, ...props }: React.ComponentProps<"h3">) { return <h3 data-slot="empty-title" className={cn(TITLE, className)} {...props} /> }
function EmptyDescription({ className, ...props }: React.ComponentProps<"p">) { return <p data-slot="empty-description" className={cn(DESCRIPTION, className)} {...props} /> }
function EmptyContent({ className, ...props }: React.ComponentProps<"div">) { return <div data-slot="empty-content" className={cn(CONTENT, className)} {...props} /> }

const staticPart = (className: string) => ({
  config: { variants: {}, defaultVariants: {} } as const,
  className: () => className,
})

const componentContract = {
  name: "empty", source: "src/components/ui/empty.tsx",
  publicExports: ["Empty", "EmptyHeader", "EmptyMedia", "EmptyTitle", "EmptyDescription", "EmptyContent", "emptyVariants", "emptyVariantsConfig"],
  config: emptyVariantsConfig, className: (props: Record<string, string>) => cn(emptyVariants(props)),
  anatomy: ["Empty", "EmptyHeader", "EmptyMedia?", "EmptyTitle", "EmptyDescription?", "EmptyContent?"], configurationStates: {},
  parts: {
    EmptyHeader: staticPart(HEADER),
    EmptyMedia: { config: emptyMediaVariantsConfig, className: (props: Record<string, string>) => cn(emptyMediaVariants(props)) },
    EmptyTitle: staticPart(TITLE),
    EmptyDescription: staticPart(DESCRIPTION),
    EmptyContent: staticPart(CONTENT),
  },
  behaviors: {},
  reference: { example: "empty", guidance: { use: "표시할 내용이 없는 영역에 상태 설명과 선택적인 다음 행동을 조립하고, 미디어 자리가 그릴 틀은 `EmptyMedia`의 `frame` 축이 정한다.", evidence: "검색 결과나 아직 생성되지 않은 목록에서 빈 영역의 이유와 회복 경로를 함께 보여줘야 하고, 같은 자리에 면을 두른 글리프 칩과 면 없는 글리프가 화면 밀도에 따라 갈린다.", limits: "오류·권한·온보딩 의미를 자체 판단하지 않으며 문구, 일러스트, 행동의 제품 의미는 소비처가 제공한다. `EmptyMedia`가 그리는 틀은 `frame` 축이 지고 **`ItemMedia`와 같은 축 이름·같은 값 이름을 쓴다**(#145) — `icon`(면을 두른 `size-10` 칩, 기본값)·`none`(면 없음) 둘이다. 기본값이 `icon`인 것은 **오늘의 `EmptyMedia`가 이미 upstream의 `icon` 값이기 때문**이다: 기본값은 발행된 인스턴스를 지키는 값이고(#143·#144), `ItemMedia`의 기본값이 `none`인 것과 방향이 반대로 보이는 것은 두 슬롯이 오늘 서 있는 자리가 다르기 때문이지 어휘가 갈린 것이 아니다. **`image`는 계약하지 않는다** — upstream에도 없고, 이 슬롯이 제목 위 가운데 `size-10`이라 40px 틀은 빈 상태 일러스트가 아니라 글리프 칩이다. 일러스트를 원하는 소비처는 지름부터 덮으므로 그 값이 질 우리 결정이 남지 않고(ADR-0006 ⓑ), 실측 수요도 없다(#123). 큰 그림이 필요하면 소비처가 `EmptyHeader` 안에 자기 노드를 둔다. 대체 텍스트는 계약이 지지 않는다 — 장식이면 `EmptyMedia`에 `aria-hidden`을 걸고, 뜻이 있으면 소비처가 안쪽 요소의 `alt`에 넣는다. **`EmptyDescription`의 `[&>a]` 계열 세 선언은 매니페스트에서 `unresolved`로 떨어진다** — 파트를 계약에 등록하면서 드러난 것이고, 등록하지 않았을 때는 매니페스트에 아예 없어 **침묵**이었다(#122). 자손 링크의 밑줄은 `MODIFIER_POLICY`에 정책이 없다(#140의 모집단)." } },
} as const

export { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent, emptyVariants, emptyVariantsConfig, componentContract }
