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

/* `FieldSeparator`(#168) — #162가 찾은 종류 ② 표면이다. 세 가지를 정했다.
 *
 * **선을 `bg-*`가 아니라 `h-0 border-t`로 그린다.** upstream `.cn-field-separator`가
 * 소비하는 `Separator`는 `bg-border`로 1px 선을 내는데, 그건 #154가
 * `DropdownMenuSeparator`에서 잡은 **`--ds-border-default`를 `background-color`에
 * 올리는 계열 위반** 그대로다. Menubar·Resizable·Dropdown Menu·`Separator` 네 곳이
 * 이미 같은 답을 갖고 있으므로 그것에 맞춘다 — 렌더는 같은 1px 선이고, 색이 맨
 * `border-color`로 가야 매니페스트 계열 게이트가 이 자리를 **실제로 본다**(없는 것은
 * 통과가 아니라 침묵이다, ADR-0006).
 *
 * **`Separator` 컴포넌트를 소비하지 않고 스스로 그린다.** #91("조합된 컴포넌트는
 * 원본을 복사하지 않고 소비한다")이 지키는 것은 원본이 **지고 있는 계약** —
 * Command의 키보드 계약, Popover의 배치 — 인데 1px 선에는 그런 계약이 없다. 반대로
 * 소비하면 이 표면을 정의하는 선언(`border-t`)이 `field` 매니페스트 **밖**에 남아
 * 파생 채널이 이 파트를 선 없는 빈 띠로 그린다. Menubar·Resizable·Dropdown Menu가
 * 저마다 `border-t`를 축자로 적고 있는 것이 이 카탈로그의 선례다.
 *
 * **가운데 내용은 축이 아니라 파트다.** upstream은 `data-content={!!children}`를
 * 달지만 여덟 스타일 갈래 어디에도 `data-content` 선택자가 없다 — 그 속성은 아무것도
 * 그리지 않는다. 우리 껍데기도 내용 유무와 무관하게 같은 `h-0 border-t`라서, 축으로
 * 열면 두 값이 선언에서 갈리지 않는 축이 되고 그건 ADR-0008이 막는 자리다(값은 축이
 * 이름한 것의 **상태**를 말한다). 실제로 갈리는 것은 **노드의 존재**이고 그 노드는
 * 자기 클래스 목록을 갖는다 — 그래서 `FieldSeparatorContent` 파트다. 소비처가
 * `children`으로 주면 나타나므로 export하지는 않는다(`CarouselTrack`과 같은 자리).
 *
 * **접근성 — 장식선이라 아무 역할도 주지 않는다.** `role="separator"`를 주면 글자를
 * 품은 노드가 구분선이 되고, `<fieldset>`·`role="group"` 사이에 우리가 만들지 않은
 * 경계가 접근성 트리에 생긴다. 테두리는 애초에 트리에 나타나지 않으므로 역할 없는
 * `<div>`가 정확한 선언이다 — field/form 시맨틱이 그대로 선다. 가운데 내용은 평범한
 * 글자라 그대로 읽힌다(그래서 `aria-hidden`도 주지 않는다).
 *
 * **칩의 글자 크기는 upstream의 `text-xs`가 아니라 이 계약의 본문 단인 `text-sm`이다.**
 * 축이 아니라 값을 옮기는 자리이고, 실측 수요 없이 세 번째 단을 들이지 않는다(#164가
 * `rank`에서 한 것과 같다). 칩은 `bg-background`로 선을 가리므로 캔버스가 아닌 면 위에
 * 놓는 소비처는 배경을 스스로 맞춘다. 새 토큰 0개다. */
const SEPARATOR = "relative h-0 border-t"
const SEPARATOR_CONTENT = "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-sm text-muted-foreground"

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
 * 낸다 — `style-lyra.css` 기준), 스타일 갈래가 여덟이라 값 자체가 갈래마다 다르다. 그래서 두 역할을 우리
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
 * legend를 따라다닐 이유가 없다. 그래서 두 유틸리티를 축자로 적는다.
 *
 * **`rank`는 타이포그래피만 바꾸고 접근성 계약은 바꾸지 않는다.** `rank="label"`인
 * `<legend>`도 여전히 `<fieldset>`의 접근 가능한 이름이다. */
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
function FieldSeparator({ className, children, ...props }: React.ComponentProps<"div">) { return <div data-slot="field-separator" className={cn(SEPARATOR, className)} {...props}>{children ? <span data-slot="field-separator-content" className={SEPARATOR_CONTENT}>{children}</span> : null}</div> }
function FieldSet({ className, ...props }: React.ComponentProps<"fieldset">) { return <fieldset data-slot="field-set" className={cn(SET, className)} {...props} /> }
function FieldLegend({ className, rank = "legend", ...props }: React.ComponentProps<"legend"> & VariantProps<typeof fieldLegendVariants>) { return <legend data-slot="field-legend" data-rank={rank} className={cn(fieldLegendVariants({ rank, className }))} {...props} /> }

const staticPart = (className: string) => ({
  config: { variants: {}, defaultVariants: {} } as const,
  className: () => className,
})

/* `rank` 축(#164)과 `FieldSeparator`(#168)의 호환성은 **additive**다 — 기존 여덟 표면의
 * 클래스와 접근성 계약은 한 줄도 움직이지 않았고, 새 파트는 소비처가 쓰기 전에는
 * 렌더되지 않는다. 두 티켓 모두 새 토큰 0개. */
const componentContract = {
  name: "field", source: "src/components/ui/field.tsx",
  publicExports: ["Field", "FieldLabel", "FieldContent", "FieldDescription", "FieldError", "FieldGroup", "FieldSet", "FieldLegend", "FieldSeparator", "fieldVariants", "fieldVariantsConfig"],
  config: fieldVariantsConfig, className: (props: Record<string, string>) => cn(fieldVariants(props)),
  /* `FieldTitle`은 열지 않는다(#162가 종류 ②로 찾았고 #175가 판정했다). upstream의 그
   * 노드는 `data-slot`이 `field-label`로 우리 `FieldLabel`과 **같은 값**이라 파생 채널이
   * 둘을 가를 이름을 얻지 못하고(ⓐ), 선언도 `flex w-fit items-center` + `.cn-field-title`의
   * `gap-2 text-xs/relaxed group-data-[disabled=true]/field:opacity-50`인데 그 중 배치·간격·
   * disabled 흐림은 우리 `FieldLabel`(`labelVariants()` + `w-fit`)이 이미 지고 있어 소비처가
   * 복제할 결정으로 남는 것은 **글자 한 단**(`text-xs`)뿐이다(ⓑ). 한 단 차이로 표면을
   * 늘리지 않는 것은 `Card`의 `size`와 `Item`의 `size: xs`를 닫은 것과 같은 자리다
   * (#121·#174). upstream이 이것을 `<label>`이 아니라 `<div>`로 두어 아무것도 이름 배선하지
   * 않는다는 점도 같은 방향이다 — 이름을 잇는 것은 우리 `FieldLabel`이 지는 계약이고,
   * 여기에는 그 계약이 없다. */
  anatomy: ["Field", "FieldLabel", "Control", "FieldDescription?", "FieldError?", "FieldContent?", "FieldGroup?", "FieldSet?", "FieldLegend?", "FieldSeparator?", "FieldSeparatorContent?"], configurationStates: { validity: ["valid", "invalid"] }, drawnBy: { validity: { attribute: "data-invalid", values: { invalid: "true" } } },
  parts: {
    FieldLabel: staticPart(cn(labelVariants(), LABEL)),
    FieldContent: staticPart(CONTENT),
    FieldDescription: staticPart(DESCRIPTION),
    FieldError: staticPart(ERROR),
    FieldGroup: staticPart(GROUP),
    FieldSet: staticPart(SET),
    FieldLegend: { config: fieldLegendVariantsConfig, className: (props: Record<string, string>) => cn(fieldLegendVariants(props)) },
    FieldSeparator: staticPart(SEPARATOR),
    FieldSeparatorContent: staticPart(SEPARATOR_CONTENT),
  },
  behaviors: {},
  reference: { example: "field", guidance: {
    use: "라벨·컨트롤·도움말·오류를 접근 가능한 한 필드로 조립한다. `FieldSet` 캡션의 층위는 `FieldLegend`의 `rank` 축이, 묶음 사이 장식선은 `FieldSeparator`가 진다.",
    evidence: "투자 입력 화면의 라벨·메모·검증 메시지를 한 구조로 묶어야 하고, 같은 `<legend>`가 섹션 캡션인 화면과 필드 라벨로 앉는 화면이 갈리며, 매수·매도처럼 배타적인 묶음 사이에 \"또는\" 구분선이 필요하다.",
    limits: "폼 상태·검증 규칙·제출은 소비처가 소유한다. `FieldTitle`은 열지 않는다 — 한 단 작은 라벨은 `FieldLabel`에 `text-xs`를 준다. `rank`는 글자만 바꾼다. \"또는\" 칩은 `FieldSeparator`의 `children`으로 주고, 캔버스가 아닌 면 위에서는 칩 배경을 소비처가 맞춘다.",
  } },
} as const

export { Field, FieldLabel, FieldContent, FieldDescription, FieldError, FieldGroup, FieldSet, FieldLegend, FieldSeparator, fieldVariants, fieldVariantsConfig, componentContract }
