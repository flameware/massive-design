import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

/* shadcn 원본을 감싸지 않고 제자리에서 편집한다(핸드오프 §2.3).
 * 원본에서 바꾼 것은 상태 표현뿐이다:
 *   - hover:bg-primary/90 같은 불투명도 트릭 → state layer(styles.css의 `state`)
 *   - active(pressed) 12% 추가 — 원본에는 pressed가 없다
 *   - dark:bg-input/30, dark:bg-destructive/60 등 다크 전용 보정 제거 —
 *     모드 전환은 semantic 계층에서만 일어난다(CONTEXT.md). 컴포넌트가 다크를
 *     따로 알면 그 규칙이 깨진다
 *   - destructive의 text-white → text-destructive-foreground (fg.on-solid)
 *   - focus-visible 링을 두 겹으로 분리한다: 안쪽 `border-focus-contrast`는
 *     모드별 중립 대비 경계, 바깥 `ring-ring`은 기존 브랜드 포커스 링이다(#43, #54).
 *     링의 불투명도 제거(ring-ring/50 → ring-ring,
 *     ring-destructive/20 → ring-destructive) — #33. **상태 테두리는 토큰을
 *     불투명도 없이 칠한다**가 규약이다: tokens의 대비 게이트는 토큰 원색을
 *     재는데(packages/tokens가 packages/ui를 볼 수 없다) 컴포넌트가 그 색을
 *     깎으면 게이트가 약속한 3:1이 화면에서 성립하지 않는다. /50은 어떤 면·
 *     어떤 모드에서도 3:1을 못 넘었다 — 최댓값이 2.36이다.
 *     aria-invalid:ring-destructive/20은 남긴다: 그 상태를 지는 것은 같이 걸린
 *     aria-invalid:border-destructive(원색, 게이트 대상)이고 링은 그 위 글로우다
 * variant/size 축은 원본 그대로 둔다 — 코드가 원본이고 Figma가 근사치다(#18).
 *
 * 축 설정을 이름 붙여 내보내는 것이 규약이다 — cva가 반환하는 함수는 config를
 * 클로저에 가둬 "variant 축에 값이 몇 개인가"를 되물을 수 없다. 매니페스트
 * 생성기가 축을 따로 적으면 그건 verify가 원리적으로 못 잡는 손글씨가 된다
 * (#22 §7). 새 컴포넌트도 같은 형태로 config를 내보낸다(#23). */
const BASE =
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:border-focus-contrast focus-visible:ring-[3px] focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"

const buttonVariantsConfig = {
  variants: {
    variant: {
      default: "state [--ds-state-base:var(--primary)] text-primary-foreground",
      destructive:
        "state [--ds-state-base:var(--destructive)] text-destructive-foreground focus-visible:ring-destructive",
      // 다크에서 면을 띄우는 건 그림자가 아니라 border다(핸드오프 §3.1).
      // shadow-xs는 라이트에서만 의미가 있고, 다크 elevation은 border-default의
      // alpha.white.10이 떠맡는다
      outline:
        "state [--ds-state-base:var(--background)] border shadow-xs",
      secondary:
        "state [--ds-state-base:var(--secondary)] text-secondary-foreground",
      // base 없음 — state layer가 곧 반투명 층이 된다
      ghost: "state",
      // link만 state가 없다 — 면이 없는 variant라 층을 얹을 바탕이 없다.
      // 상태는 밑줄이 표현한다.
      //
      // text-primary가 아니라 text-link다(#37). --primary는 bg.accent.solid
      // (램프 9단, 배경용)라 다크 canvas 위에서 CR 3.61 — 본문 게이트 4.5를 못
      // 넘었다. --link는 fg.link(램프 10단)로 5.68이다. shadcn 정본에 링크색
      // 이름이 없어서 생긴 결함이다: alias 표가 배경 중심이라 유채색 텍스트
      // 토큰 4개(fg.accent·danger·success·link)에 shadcn 이름이 하나도 없었고,
      // 브랜드색 글자를 칠할 유틸리티가 text-primary밖에 없었다
      link: "text-link underline-offset-4 hover:underline",
    },
    size: {
      default: "h-9 px-4 py-2 has-[>svg]:px-3",
      xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
      sm: "h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5",
      lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
      icon: "size-9",
      "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
      "icon-sm": "size-8",
      "icon-lg": "size-10",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
} as const

const buttonVariants = cva(BASE, buttonVariantsConfig)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

const componentContract = {
  name: "button", source: "src/components/ui/button.tsx",
  publicExports: ["Button", "buttonVariants", "buttonVariantsConfig"],
  config: buttonVariantsConfig, className: (props: Record<string, string>) => cn(buttonVariants(props)),
  anatomy: [], configurationStates: {},
  reference: { example: "button", guidance: { use: "사용자가 명시적으로 시작하는 동작에 쓴다.", evidence: "거래 추가와 행 메뉴의 명시적 동작에 필요하다.", limits: "탐색 링크나 화면 전용 아이콘 API를 대신하지 않는다." } },
} as const

export { Button, buttonVariants, buttonVariantsConfig, componentContract }
