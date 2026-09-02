import * as React from "react"
import { Progress as ProgressPrimitive } from "radix-ui"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

const progressVariantsConfig = { variants: {}, defaultVariants: {} } as const
/* 루트가 **잔여 트랙**이다 — 값이 아직 닿지 않은 바닥이고 의미는 Indicator가
 * 나르므로 대비 요구가 없다. Slider 트랙과 같은 이름을 집는다(#109).
 *
 * **upstream의 `ProgressTrack`은 여기다**(#167). upstream은 컨테이너 루트 밑에
 * `ProgressTrack`을 따로 두는데 우리 루트가 그 트랙을 겸한다 — `bg-secondary
 * rounded-full h-2 overflow-hidden`이 트랙의 선언이다. 노드를 갈라 이름을 맞추면
 * 이미 발행된 모든 인스턴스의 루트가 다른 것을 뜻하게 되므로 `breaking`이고,
 * 이 티켓은 **이름만 정한다**: 트랙의 이름은 `Progress`이며 `parts`에
 * `ProgressTrack` 항목은 서지 않는다. 없는 노드에 이름을 주면 매니페스트가
 * 거짓을 말한다. */
const progressVariants = cva("relative h-2 w-full overflow-hidden rounded-full bg-secondary", progressVariantsConfig)

/* 진행률 텍스트 한 줄(#167). upstream은 컨테이너 루트 안에서 라벨과 값을 한 줄로
 * 그리는데(값이 `ml-auto tabular-nums text-xs`), 우리 루트는 트랙이라 그 안에
 * 텍스트가 들어갈 수 없다 — `h-2 overflow-hidden`이 잘라 버린다. 그래서 둘은
 * **트랙의 형제**이고, 둘을 담는 행은 소비처가 준다. 자세한 것은 `limits`에 있다.
 *
 * 새 토큰 0개다. `tabular-nums`는 Tailwind의 `font-variant-numeric` 유틸리티이지
 * 토큰 수요가 아니고, Calendar가 이미 같은 유틸리티를 쓴다. */
const INDICATOR = "h-full w-full bg-primary transition-transform"
const LABEL = "text-sm font-medium"
const VALUE = "ml-auto text-xs tabular-nums"

function Progress({ className, value, ...props }: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  const percent = Math.max(0, Math.min(100, value ?? 0))
  return <ProgressPrimitive.Root data-slot="progress" className={cn(progressVariants({ className }))} value={value} {...props}>
    <ProgressPrimitive.Indicator data-slot="progress-indicator" className={cn(INDICATOR)} style={{ transform: `translateX(-${100 - percent}%)` }} />
  </ProgressPrimitive.Root>
}

function ProgressLabel({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="progress-label" className={cn(LABEL, className)} {...props} />
}

/* `aria-hidden`이 기본값인 이유 — Radix `Progress.Root`가 이미 `role="progressbar"`와
 * `aria-valuenow`·`aria-valuetext`("60%")를 낸다. 같은 수를 텍스트로도 노출하면
 * 보조기술이 값을 두 번 읽는다. 눈으로 보는 수는 여기가, 통지하는 수는 루트가
 * 진다 — 하나의 값에 통지 경로가 하나다. 소비처가 뒤집을 수 있게 `{...props}`가
 * 뒤에 온다. */
function ProgressValue({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="progress-value" className={cn(VALUE, className)} aria-hidden="true" {...props} />
}

const staticPart = (className: string) => ({
  config: { variants: {}, defaultVariants: {} } as const,
  className: () => className,
})

const componentContract = {
  name: "progress", source: "src/components/ui/progress.tsx",
  publicExports: ["Progress", "ProgressLabel", "ProgressValue", "progressVariants", "progressVariantsConfig"],
  config: progressVariantsConfig, className: (props: Record<string, string>) => cn(progressVariants(props)),
  anatomy: ["Progress", "ProgressIndicator", "ProgressLabel?", "ProgressValue?"], configurationStates: { value: ["empty", "partial", "complete"] }, drawnBy: { value: "`ProgressIndicator`의 인라인 `transform`이 그린다 — 계산된 값이라 클래스가 아니다. 파트는 #167이 등록했으므로 더 이상 #155의 공백이 아니고, 그래도 이 축은 클래스로 내려오지 않는다" },
  parts: {
    ProgressIndicator: staticPart(INDICATOR),
    ProgressLabel: staticPart(LABEL),
    ProgressValue: staticPart(VALUE),
  },
  behaviors: {},
  reference: { example: "progress", guidance: { use: "완료량을 알 수 있는 작업의 진행 정도를 0에서 100 사이 값으로 보여주고, 무엇의 진행인지와 지금 몇 퍼센트인지는 `ProgressLabel`·`ProgressValue`가 트랙 위 한 줄로 말한다.", evidence: "투자 내역 가져오기처럼 처리할 전체 항목 수를 아는 작업에 진행률 피드백이 필요하고, 그 화면은 대개 \"무엇을\"과 \"몇 퍼센트\"를 트랙과 함께 읽는다.", limits: "완료량을 모르는 대기에는 Spinner를 사용하고 value의 계산이나 진행 상태 문구는 소비처가 제공한다 — `ProgressValue`는 자기 수를 만들지 않고 children으로 받는다(루트에 값 context가 없고, 그것을 여는 것은 새 표면이라 #165의 로스터 밖이다).\n\n**`ProgressTrack`은 루트다**(#167). upstream은 컨테이너 루트 밑에 `ProgressTrack`을 따로 두지만 우리 `Progress` 루트가 트랙 자체다 — `h-2 w-full overflow-hidden rounded-full bg-secondary`가 트랙의 선언이고 `ProgressIndicator`가 그 안에 산다. 노드를 갈라 upstream과 이름을 맞추면 발행된 모든 인스턴스의 루트가 다른 것을 뜻하게 되므로 `breaking`이고, 이 세대는 **이름만 정한다**: 트랙의 이름은 `Progress`이며 `parts`에 `ProgressTrack` 항목은 서지 않는다 — 없는 노드에 이름을 주면 매니페스트가 거짓을 말한다. 잔여 트랙이라 대비 요구가 없는 것은 그대로다(#109). `ProgressIndicator`는 오늘도 그리던 노드에 이름이 붙은 것이라 렌더가 한 픽셀도 움직이지 않는다(`in-place safe`).\n\n**`ProgressLabel`·`ProgressValue`는 트랙의 형제이지 자손이 아니다.** 루트가 `h-2 overflow-hidden`이라 텍스트가 그 안에 들어가면 잘리고, 텍스트가 들어가도록 루트의 격자를 바꾸는 것은 발행된 인스턴스의 재해석이다(`breaking`). 그래서 둘을 담는 한 줄(`flex items-center gap-2` 정도)은 소비처가 주고 계약은 **두 조각의 타이포그래피와 접근성만** 진다. `ProgressValue`의 `ml-auto`는 upstream에서 그대로 가져온 것으로 그 행이 flex·grid일 때 값을 오른쪽 끝으로 민다 — 그런 행이 아니면 아무 일도 하지 않는다. `ProgressLabel`은 `<span>`이라 자기 힘으로 이름을 붙이지 못한다: 소비처가 `id`를 주고 `Progress`에 `aria-labelledby`로 물린다(`aria-label`을 루트에 직접 주는 길도 그대로 열려 있다).\n\n**값의 이중 통지를 막는다.** Radix `Progress.Root`가 이미 `role=\"progressbar\"`·`aria-valuenow`·`aria-valuetext`를 내므로 `ProgressValue`가 같은 수를 노출하면 보조기술이 두 번 읽는다. 그래서 `ProgressValue`는 기본으로 `aria-hidden=\"true\"`다 — 보이는 수는 이 파트가, 통지하는 수는 루트가 진다. 소비처가 필요하면 `aria-hidden={undefined}`로 뒤집을 수 있다.\n\n새 토큰 0개다. `tabular-nums`는 Tailwind의 `font-variant-numeric` 유틸리티이지 토큰 수요가 아니고 Calendar가 이미 같은 자리에서 쓴다 — 숫자 폭을 토큰으로 올리려면 타이포 스케일 전체의 결정이 먼저다(#165 규칙 5). 그 유틸리티가 매니페스트에서 `--tw-*` 합성 사슬을 그대로 흘리는 것은 이 계약의 결함이 아니라 #140이 남긴 열린 안개와 같은 자리다 — Avatar의 카운트 셀이 이미 글자 하나 다르지 않은 값을 낸다. 이 세대의 호환성 분류는 **`additive`** 이고(파트 셋과 공개 export 둘이 늘 뿐 기존 셀은 그대로), `ProgressIndicator` 등록만 따로 보면 `in-place safe`다. `parts`를 처음 세우면서 `ProgressIndicator`의 클래스가 매니페스트에 처음 닿았고, #154가 `DropdownMenuSeparator`에서 잡은 계열 위반(`--ds-border-default`를 `background-color`에) 같은 것은 나오지 않았다 — `bg-primary`는 배경 계열 이름이 배경 속성에 온 자리다." } },
} as const

export { Progress, ProgressLabel, ProgressValue, progressVariants, progressVariantsConfig, componentContract }
