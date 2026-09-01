import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariantsConfig = {
  variants: {
    variant: {
      default: "bg-background text-foreground",
      success: "bg-success-soft text-success-text",
      warning: "bg-warning-soft text-warning-text",
      destructive: "bg-destructive-soft text-destructive-text",
    },
  },
  defaultVariants: { variant: "default" },
} as const

const alertVariants = cva("relative grid w-full gap-1 rounded-lg border p-4 text-sm", alertVariantsConfig)

const TITLE = "font-medium"
const DESCRIPTION = "text-sm"

/* `AlertAction`은 **자리만 정하는 껍데기**다(#144).
 *
 * 무엇이 들어가는지는 소비처가 정한다 — 대개 우리 `Button`이다. `Button`을
 * import해 기본 variant·size를 먹이지 않는다: 여기서 우리가 정할 스타일 결정이
 * 없고, 정하면 Button의 상태 사다리가 이 자리에서 갈린다(#91). `InputGroupButton`이
 * Button을 감싸는 것은 그쪽이 `ghost`·`icon-xs`라는 **실제 결정**을 지기 때문이고,
 * 여기에는 그런 결정이 없다.
 *
 * **격자 열이 아니라 absolute인 이유.** Alert은 1열 그리드다. 열을 하나 더 두면
 * 기존 인스턴스의 격자를 재해석한다 — #121이 아이콘 컬럼을 닫은 바로 그 근거다.
 * `has-data-[slot=alert-action]:grid-cols-[1fr_auto]`로 조건부로 두면 렌더는
 * 지키지만 그 선언이 매니페스트에서 `unresolved`가 되어, **보이는 선인데 파생
 * 채널에 없는** 상태가 된다(ADR-0006이 닫으려는 침묵). absolute는 위치 결정이
 * 전부 이 part의 셀 안에 있어 파생 채널이 그대로 나른다. upstream도 같은 자리에
 * absolute다.
 *
 * 위치 축은 열지 않는다 — upstream이 위치 prop 없이 오른쪽 위로 고정하고, 실측
 * 수요 없이 축을 열지 않는다(#123, 그리고 `AvatarBadge`가 선 같은 자리 #143).
 * 오프셋은 Alert 자신의 `p-4`를 그대로 되쓴다: 새 간격 결정이 없다.
 *
 * DOM에서는 **맨 뒤**에 선다. `role="alert"`은 라이브 영역이라 삽입 시점에 내용을
 * 통째로 읽고 그 순서를 정하는 것은 시각 배치가 아니라 DOM이다 — 제목·설명보다
 * 앞에 두면 버튼 이름부터 읽힌다. anatomy 순서가 그 규약이다. */
const ACTION = "absolute top-4 right-4"

function Alert({ className, variant = "default", ...props }: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return <div data-slot="alert" role="alert" className={cn(alertVariants({ variant, className }))} {...props} />
}
function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="alert-title" className={cn(TITLE, className)} {...props} />
}
function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="alert-description" className={cn(DESCRIPTION, className)} {...props} />
}
function AlertAction({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="alert-action" className={cn(ACTION, className)} {...props} />
}

const staticPart = (className: string) => ({
  config: { variants: {}, defaultVariants: {} } as const,
  className: () => className,
})

const componentContract = {
  name: "alert", source: "src/components/ui/alert.tsx",
  publicExports: ["Alert", "AlertTitle", "AlertDescription", "AlertAction", "alertVariants", "alertVariantsConfig"],
  config: alertVariantsConfig, className: (props: Record<string, string>) => cn(alertVariants(props)),
  anatomy: ["Alert", "AlertTitle?", "AlertDescription", "AlertAction?"], configurationStates: {},
  parts: {
    AlertTitle: staticPart(TITLE),
    AlertDescription: staticPart(DESCRIPTION),
    AlertAction: staticPart(ACTION),
  },
  behaviors: {},
  reference: { example: "alert", guidance: { use: "화면 안에서 사용자가 알아야 할 지속적인 피드백이나 주의 사항을 의미별로 전달하고, 그 자리에서 할 수 있는 동작 하나를 `AlertAction`에 얹는다.", evidence: "투자 데이터 동기화 결과와 가격 지연 경고를 성공·warning·danger 의미로 구별해야 하고, 동기화가 실패한 경고에는 다시 시도 버튼이 같은 카드 안에 있어야 한다.", limits: "잠깐 나타나는 작업 결과에는 Toast를 사용하고, 모든 안내를 role=alert로 반복해 쌓지 않는다. `AlertAction`은 **자리만 정하고 내용은 소비처가 넣는다** — 대개 `Button`이며, 우리가 variant·size 기본값을 먹이지 않는다(#91). `AlertAction`은 anatomy 순서대로 **DOM의 맨 뒤**에 둔다: `role=alert`은 삽입 시점에 내용을 통째로 읽고 그 순서는 DOM이 정하므로, 앞에 두면 버튼 이름부터 읽힌다. 위치 축은 계약하지 않는다 — upstream이 위치 prop 없이 오른쪽 위로 고정하고 실측 수요 없이 축을 열지 않는다(#123). **absolute라 제목·설명과 겹칠 수 있다**: 긴 제목은 소비처가 `pr-*`로 자리를 비운다. 열로 두면 겹치지 않지만 1열 그리드를 재해석하거나(breaking) 조건부 열이 되어 파생 채널이 못 그린다(#144). 아이콘 컬럼은 계약하지 않는다 — 이 Alert이 1열 그리드라 도입하면 기존 인스턴스의 격자를 재해석하는 breaking이다(#121)." } },
} as const

export { Alert, AlertTitle, AlertDescription, AlertAction, alertVariants, alertVariantsConfig, componentContract }
