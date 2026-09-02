import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Label, labelVariants } from "@/components/ui/label"
import { cn } from "@/lib/utils"

const fieldVariantsConfig = {
  variants: {
    orientation: {
      vertical: "flex flex-col gap-2",
      horizontal: "flex items-center gap-3",
      responsive: "flex flex-col gap-2 @md/field-group:flex-row @md/field-group:items-center @md/field-group:gap-3",
    },
  },
  defaultVariants: { orientation: "vertical" },
} as const
const fieldVariants = cva("group/field w-full data-[invalid=true]:text-destructive-text", fieldVariantsConfig)

function Field({ className, orientation = "vertical", ...props }: React.ComponentProps<"div"> & VariantProps<typeof fieldVariants>) {
  return <div role="group" data-slot="field" data-orientation={orientation} className={cn(fieldVariants({ orientation, className }))} {...props} />
}

const LABEL = "w-fit"
const CONTENT = "flex flex-1 flex-col gap-1"
const DESCRIPTION = "text-sm text-muted-foreground"
const ERROR = "text-sm text-destructive-text"
const GROUP = "@container/field-group flex flex-col gap-6"
const SET = "flex flex-col gap-4"

/* `FieldLegend`의 `rank` 축(#164) — 이 맵의 로스터 여덟 번째이고, #121이 판정 3으로
 * 승격시킨 뒤 구현 티켓 없이 남아 있던 자리다(#162가 찾았다).
 *
 * **축 이름이 `variant`가 아닌 이유.** upstream은 `variant`인데 그 이름은 카탈로그
 * 전역에서 루트의 의미/강조 축이 이미 쓴다(ADR-0008: 축 이름의 이름 공간은 카탈로그
 * 전역, 값 이름의 이름 공간은 축 지역). `frame`(#145)·`indicator`(#146)·
 * `placement`(#144)가 선 것과 같은 자리다. 이 축이 이름 붙이는 것은 **이 캡션이
 * 필드 위계에서 서는 층위** — 그룹 캡션으로 말하는가, 필드 라벨의 층위로 말하는가 —
 * 라서 `rank`다. 값 이름은 축 지역이므로 upstream의 `legend`·`label`을 그대로 쓴다.
 *
 * **기본값이 `legend`이고 그 모양이 upstream의 `legend`와 다른 이유.** 기본값은
 * 발행된 인스턴스를 지키는 값이다(#143·#144·#145). 오늘의 `FieldLegend`는
 * `text-base font-semibold`이고 이는 upstream의 `legend`(`text-sm`)도 `label`
 * (`text-xs`)도 아니다 — `EmptyMedia`가 이미 upstream의 `icon`이었던 #145의 거울상이다.
 * upstream의 두 값은 **역할**을 이름하지 절대 타입 값을 이름하지 않고(`.cn-field-legend`
 * 는 `data-[variant=label]:text-xs data-[variant=legend]:text-sm`로 **한 단** 차이만
 * 낸다), 스타일 갈래가 여덟이라 값 자체가 갈래마다 다르다. 그래서 두 역할을 우리
 * 스케일에서 **같은 한 단 차이**로 낸다: `legend`는 `text-base font-semibold`(오늘의
 * 모양), `label`은 그 한 단 아래인 `text-sm font-medium`이다. 새 토큰 0개.
 *
 * **`label` 값이 `FieldLabel`을 복제하는가 — 아니다.** #121이 미룬 이유로 지목한
 * 지점이고, 재면 두 가지가 갈린다. 첫째, **소비할 수 없다**: `Label`은 Radix
 * `Label.Root`(`<label>`)를 그리고 이 노드는 `<legend>`여야 한다. `<legend>`는
 * `<fieldset>`을 암묵적으로 이름하고 `<label>`은 `for`로 컨트롤을 이름한다 — 접근성
 * 계약이 다른 요소라 #91("조합된 컴포넌트는 원본을 소비한다")이 성립할 수 없다.
 * 둘째, **복제도 아니다**: 겹치는 것은 `text-sm font-medium` 두 유틸리티뿐이고,
 * `Label`이 지는 나머지(`flex items-center gap-2 leading-none select-none`,
 * `group-data-[disabled]`·`peer-disabled` 수식자)는 `<legend>`에 오면 안 되는 결정이다.
 * 상수로 공유하면 `Label`의 조정이 두 계약의 해시를 한 줄에 묶는데(#154가 Menubar에서
 * 거부한 자리), 여기서는 그 결합이 **틀리기까지 하다** — 라벨의 disabled 수식자가
 * legend를 따라다닐 이유가 없다. 그래서 두 유틸리티를 축자로 적는다. */
const fieldLegendVariantsConfig = {
  variants: {
    rank: {
      legend: "text-base font-semibold",
      label: "text-sm font-medium",
    },
  },
  defaultVariants: { rank: "legend" },
} as const
const fieldLegendVariants = cva("", fieldLegendVariantsConfig)

function FieldLabel({ className, ...props }: React.ComponentProps<typeof Label>) { return <Label data-slot="field-label" className={cn(LABEL, className)} {...props} /> }
function FieldContent({ className, ...props }: React.ComponentProps<"div">) { return <div data-slot="field-content" className={cn(CONTENT, className)} {...props} /> }
function FieldDescription({ className, ...props }: React.ComponentProps<"p">) { return <p data-slot="field-description" className={cn(DESCRIPTION, className)} {...props} /> }
function FieldError({ className, ...props }: React.ComponentProps<"p">) { return <p data-slot="field-error" role="alert" className={cn(ERROR, className)} {...props} /> }
function FieldGroup({ className, ...props }: React.ComponentProps<"div">) { return <div data-slot="field-group" className={cn(GROUP, className)} {...props} /> }
function FieldSet({ className, ...props }: React.ComponentProps<"fieldset">) { return <fieldset data-slot="field-set" className={cn(SET, className)} {...props} /> }
function FieldLegend({ className, rank = "legend", ...props }: React.ComponentProps<"legend"> & VariantProps<typeof fieldLegendVariants>) { return <legend data-slot="field-legend" data-rank={rank} className={cn(fieldLegendVariants({ rank, className }))} {...props} /> }

const staticPart = (className: string) => ({
  config: { variants: {}, defaultVariants: {} } as const,
  className: () => className,
})

const componentContract = {
  name: "field", source: "src/components/ui/field.tsx",
  publicExports: ["Field", "FieldLabel", "FieldContent", "FieldDescription", "FieldError", "FieldGroup", "FieldSet", "FieldLegend", "fieldVariants", "fieldVariantsConfig"],
  config: fieldVariantsConfig, className: (props: Record<string, string>) => cn(fieldVariants(props)),
  anatomy: ["Field", "FieldLabel", "Control", "FieldDescription?", "FieldError?", "FieldContent?", "FieldGroup?", "FieldSet?", "FieldLegend?"], configurationStates: { validity: ["valid", "invalid"] }, drawnBy: { validity: { attribute: "data-invalid", values: { invalid: "true" } } },
  parts: {
    FieldLabel: staticPart(cn(labelVariants(), LABEL)),
    FieldContent: staticPart(CONTENT),
    FieldDescription: staticPart(DESCRIPTION),
    FieldError: staticPart(ERROR),
    FieldGroup: staticPart(GROUP),
    FieldSet: staticPart(SET),
    FieldLegend: { config: fieldLegendVariantsConfig, className: (props: Record<string, string>) => cn(fieldLegendVariants(props)) },
  },
  behaviors: {},
  reference: { example: "field", guidance: { use: "라벨, 컨트롤, 도움말과 오류를 접근 가능한 한 필드로 조립하고, `FieldSet`의 캡션이 어느 층위로 말할지는 `FieldLegend`의 `rank` 축이 정한다.", evidence: "투자 입력 화면의 라벨·메모·검증 메시지를 일관된 구조로 묶어야 하고, 같은 `<legend>`가 섹션 캡션인 화면과 필드 라벨 한 줄로 앉는 화면이 갈린다.", limits: "폼 상태 관리, 검증 규칙, 제출 동작은 소비처가 소유한다. `FieldLegend`가 서는 층위는 `rank` 축이 지고(#164) 값은 `legend`(`text-base font-semibold`, 기본값)·`label`(`text-sm font-medium`) 둘이다. **기본값이 upstream의 `legend`와 다른 모양인 것은 의도다** — 기본값은 발행된 인스턴스를 지키는 값이고(#143·#144·#145) 오늘의 `FieldLegend`는 upstream의 두 값 어디에도 없는 `text-base font-semibold`였다. upstream의 `legend`/`label`은 절대 타입 값이 아니라 **역할**을 이름하고 실제 선언은 스타일 갈래 여덟마다 다르므로(`style-lyra.css`의 `.cn-field-legend`는 `sm`/`xs` **한 단** 차이만 낸다), 우리는 같은 한 단 차이를 우리 스케일에서 낸다. 축 이름이 `variant`가 아닌 것은 그 이름이 카탈로그 전역에서 루트의 의미/강조 축이기 때문이다(ADR-0008). **`label` 값은 `FieldLabel`을 복제하지 않는다** — `<legend>`는 `<fieldset>`을 암묵적으로 이름하고 `Label`은 `for`로 컨트롤을 이름하는 `<label>`이라 소비가 성립하지 않고(#91), 겹치는 것은 `text-sm font-medium` 두 유틸리티뿐이며 `Label`이 지는 `leading-none`·`select-none`과 disabled 수식자는 `<legend>`에 와서는 안 되는 결정이라 상수로 공유하지 않는다(#154). `rank`는 타이포그래피만 바꾸고 접근성 계약은 바꾸지 않는다 — `rank=\"label\"`인 `<legend>`도 여전히 `<fieldset>`의 접근 가능한 이름이다. 새 토큰 0개. `FieldTitle`·`FieldSeparator`는 upstream에 있으나 두 관문을 거친 적이 없는 종류 ②라 이 계약이 아직 이름하지 않는다(#162) — 침묵이 아니라 별도 effort의 모집단이다." } },
} as const

export { Field, FieldLabel, FieldContent, FieldDescription, FieldError, FieldGroup, FieldSet, FieldLegend, fieldVariants, fieldVariantsConfig, componentContract }
