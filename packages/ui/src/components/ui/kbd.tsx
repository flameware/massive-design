import * as React from "react"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

/* 키보드 키 하나를 키캡 모양으로 표기한다. shadcn 원본을 제자리에서 편집한다.
 *
 * 원본에서 바꾼 것은 둘이다:
 *   - `KbdGroup`의 타입을 `ComponentProps<"div">` → `ComponentProps<"kbd">`로 고쳤다.
 *     원본은 `div`로 타입을 적고 `<kbd>`를 렌더한다 — 타입과 렌더가 어긋난 자리이고,
 *     둘 중 렌더가 맞다. 중첩 `<kbd>`는 HTML에서 "더 큰 입력 서술 안의 실제 키"라
 *     의도된 표기이며, `div`였다면 본문 문단이나 TooltipContent 텍스트 흐름 안에
 *     들어가지 못한다 — 그 셋이 원본이 문서화한 배치 자리다.
 *   - Tooltip 문맥 override(`[[data-slot=tooltip-content]_&]:bg-background/20` …와
 *     그 `dark:` 짝)를 가져오지 않았다. 색에 불투명도를 얹는 것과 컴포넌트가 다크를
 *     따로 아는 것 둘 다 우리 규약 밖이다(button.tsx 머리말). Tooltip의 반전 면 위에
 *     놓일 때 필요한 반전 subtle 채움은 우리에게 없고, 이 수요는 열지 않은 채 확인된
 *     공백으로 남긴다(#109·ADR-0003과 같은 모양) — 침묵으로 두지 않는다. 그때 색은
 *     소비처가 `className`으로 바꾼다.
 *
 * `font-sans`는 장식이 아니라 필수다. `<kbd>`의 UA 기본 글꼴이 monospace라 끄지
 * 않으면 본문 글꼴에서 벗어난다. mono 계열을 쓰려면 `--font-mono`가 필요한데 그건
 * 새 토큰이고, 새 토큰은 선제 공개하지 않는다(#118). `bg-muted`·`text-muted-foreground`는
 * 이미 있는 alias이고 `fg.muted on bg.subtle`은 이미 대비 게이트 안에 있다.
 *
 * 두 필드를 의도적으로 두지 않는다:
 *   - `gestures` — upstream primitive가 없다. 순수 마크업이라 물려받는 dismiss
 *     제스처가 애초에 없고, 없는 것을 확인한 결과다(ADR-0005).
 *   - `externalSurfaces` — 서드파티가 소유하는 DOM이 없다. 두 노드 모두 우리가
 *     className을 주는 노드라 경계가 전부 계약 안이다(#122).
 *
 * 크기 축은 두지 않는다. 고정 20px `text-xs` 캡 하나가 Button의 네 크기와 Tooltip·
 * Input Group의 줄 안에 모두 들어가고, 실측할 소비처가 아직 없는 상태에서 스케일을
 * 정하면 우리가 정한 적 없는 결정을 떠안는다(#121 ⓑ). 나중에 여는 것은 additive이고
 * 닫는 것은 breaking이라 지금은 닫는다. cva를 그래도 쓰는 것은 규약이다 — 매니페스트의
 * 출처가 cva 정의여야 하고, config를 이름 붙여 내보내야 축이 없다는 사실도 기계가 읽는다.
 *
 * 접근성 — `<kbd>`는 HTML-AAM에서 대응 역할이 없어 이 요소에 접근 가능한 이름을 붙이지
 * 않는다. `⌘`·`⇧` 같은 기호의 이름은 소비처가 주고, 이름이 실제로 필요한 자리는 동작을
 * 수행하는 컨트롤의 `aria-keyshortcuts`다. Command 항목 끝의 배치도 소비처가 소유한다
 * (`ml-auto`). */
const kbdVariantsConfig = { variants: {}, defaultVariants: {} } as const
const kbdVariants = cva(
  "pointer-events-none inline-flex h-5 w-fit min-w-5 items-center justify-center gap-1 rounded-sm bg-muted px-1 font-sans text-xs font-medium text-muted-foreground select-none [&_svg:not([class*='size-'])]:size-3",
  kbdVariantsConfig
)

const KBD_GROUP = "inline-flex items-center gap-1"

function Kbd({ className, ...props }: React.ComponentProps<"kbd">) {
  return <kbd data-slot="kbd" className={cn(kbdVariants({ className }))} {...props} />
}

/** 키 여러 개를 한 조합으로 묶는다. 구분자(`+`)는 소비처가 넣는 텍스트다 — 파트로 열지
 * 않는다. 클래스도 노드도 없는 문자열이라 파생 채널이 그릴 것이 없다(#119·#121).
 * `<kbd>` 안에 `<kbd>`가 중첩되는 것은 의도다(머리말). */
function KbdGroup({ className, ...props }: React.ComponentProps<"kbd">) {
  return <kbd data-slot="kbd-group" className={cn(KBD_GROUP, className)} {...props} />
}

const componentContract = {
  name: "kbd", source: "src/components/ui/kbd.tsx",
  publicExports: ["Kbd", "KbdGroup", "kbdVariants", "kbdVariantsConfig"],
  config: kbdVariantsConfig, className: (props: Record<string, string>) => cn(kbdVariants(props)),
  anatomy: ["KbdGroup?", "Kbd*"], configurationStates: {},
  parts: {
    KbdGroup: { config: { variants: {}, defaultVariants: {} } as const, className: () => KBD_GROUP },
  },
  behaviors: {},
  reference: { example: "kbd", guidance: {
    use: "키보드 키와 단축키 조합을 본문·툴팁·버튼 안에서 본문 글자와 구분되는 키캡으로 표기한다.",
    evidence: "투자 기록 검색과 거래 추가처럼 자주 쓰는 명령에 단축키를 함께 알려야 하고, 그 표기는 주변 문장과 눈으로 구분돼야 한다.",
    limits: "크기 축은 없다 — `text-xs` 캡 하나가 Button·Tooltip·Input Group에 다 들어간다. 구분자 `+`는 소비처가 텍스트로 넣고, 기호 이름과 `aria-keyshortcuts`는 동작 컨트롤에 준다. Tooltip 반전 면 위의 색과 Command 항목 끝 배치는 className으로 준다.",
  } },
} as const

export { Kbd, KbdGroup, kbdVariants, kbdVariantsConfig, componentContract }
