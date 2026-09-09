"use client"

import { Button as BaseButton } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { isValidElement } from "react"
import type * as React from "react"

import { cn } from "../lib/utils.js"

/* 축 이름은 1세대에서 승계한다 — 소비처(invest diary)의 21개 자리가 이미
 * `variant`·`size`를 이 값 이름으로 부르고 있고, 새 축의 기본값은 이미 발행된
 * 인스턴스를 보존하는 값이라는 규칙(rules.md 축과 이름 공간)이 여기서도 같다.
 *
 * 색은 semantic 유틸리티만 집는다. primitive 램프는 @theme에 없어서 조용히
 * 무효가 되고, scripts/check.mjs가 그것을 문다. */
export const buttonVariants = cva(
  [
    "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap",
    "rounded-md text-sm font-medium",
    // 아이콘은 글자 크기를 따라간다 — 크기 축이 아이콘까지 한 번에 움직인다
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    // 포커스 링의 색은 tokens.css의 base 규칙이 이미 outline-color로 칠했다
    "outline-offset-2 focus-visible:outline-2",
    // 상태 레이어. hover/pressed 색 토큰은 0개이고 층 하나가 사다리를 만든다
    "state transition-[background-color,color,box-shadow]",
    "disabled:pointer-events-none disabled:opacity-50",
  ],
  {
    variants: {
      // 면 이름이 두 번 나온다 — `bg-X`와 상태 레이어의 바탕 `--ds-bg-X`. 헬퍼로
      // 한 번만 적고 싶지만 그럴 수 없다: Tailwind는 소스를 **정적으로** 훑어
      // 클래스를 찾으므로 `bg-${name}` 같은 조립은 아예 발견되지 않고, 그러면
      // 소비 앱에서 CSS가 0바이트 나온다. 어긋남은 test/utilities.test.mjs가 문다
      variant: {
        default: "bg-accent-solid text-on-solid [--ds-state-base:var(--ds-bg-accent-solid)]",
        destructive: "bg-danger-solid text-on-solid [--ds-state-base:var(--ds-bg-danger-solid)]",
        outline: "border bg-surface text-default [--ds-state-base:var(--ds-bg-surface)]",
        secondary: "bg-neutral-soft text-default [--ds-state-base:var(--ds-bg-neutral-soft)]",
        // 면을 주지 않는다 — 상태 레이어가 반투명 층 그 자체가 되는 것이
        // 의도다(state.css). --ds-state-base가 없으면 transparent에 섞인다
        ghost: "text-default",
        link: "text-accent underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-8 px-3 has-[>svg]:px-2.5",
        md: "h-9 px-4 has-[>svg]:px-3",
        lg: "h-10 px-6 has-[>svg]:px-4",
        icon: "size-9 p-0",
      },
      loading: {
        true: "pointer-events-none",
        false: "",
      },
    },
    compoundVariants: [
      // link는 면이 아니라 글줄이다. 높이를 글자에 맡기면 sm에서 20px 남짓이 되어
      // 24px 하한 아래로 내려가므로, 시각 치수는 그대로 두고 hit-area가 하한을
      // 진다 (ADR-0020 결정 1·2). 나머지 size는 h-8/h-9/size-9라 이미 넘는다
      { variant: "link", class: "h-auto px-0 hit-area" },
    ],
    defaultVariants: {
      variant: "default",
      size: "md",
      loading: false,
    },
  }
)

export interface ButtonProps
  extends Omit<React.ComponentPropsWithoutRef<typeof BaseButton>, "className">,
    VariantProps<typeof buttonVariants> {
  className?: string
}

/**
 * 동작을 부르는 버튼.
 *
 * `render`로 다른 요소를 받는다 — 링크는 `render={<a href="/login" />}`. 그때
 * `nativeButton`을 소비처가 끄지 않아도 된다: 넘어온 요소가 `button`이 아니면
 * 여기서 끈다. 켜진 채로 두면 `<a>`에 `type="button"`이 붙는다 — 무해해
 * 보이지만 `type`은 `<a>`에서 다른 뜻(MIME 힌트)이고, Base UI도 개발 모드에서
 * 경고한다. 함수형 `render`는 무엇이 나올지 알 수 없으므로 기본값을 그대로 둔다.
 *
 * `loading`은 **활성화를 막는다**. 포인터만 끄면 Enter·Space가 그대로 통과해
 * 키보드 사용자가 두 번 제출한다 — 그래서 Base UI에 `disabled`로 내려보내
 * 클릭 자체를 막고, `focusableWhenDisabled`로 포커스는 남긴다: 진행 중에
 * 포커스가 튀면 스크린 리더가 자리를 잃기 때문이다. 네이티브 `disabled`는
 * 그대로 네이티브로 간다(그쪽은 포커스를 잃는 것이 맞다).
 */
export function Button({
  className,
  variant,
  size,
  loading,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const nativeButton =
    props.nativeButton ?? (isValidElement(props.render) ? props.render.type === "button" : true)

  return (
    <BaseButton
      aria-busy={loading ? true : undefined}
      disabled={Boolean(loading) || Boolean(disabled)}
      focusableWhenDisabled={Boolean(loading) && !disabled}
      nativeButton={nativeButton}
      className={cn(buttonVariants({ variant, size, loading }), className)}
      {...props}
    >
      {loading ? <Spinner /> : null}
      {children}
    </BaseButton>
  )
}

/* 인라인이다 — Spinner 컴포넌트는 #290이고, 그때까지 Button 하나를 위해
 * 서브패스를 열지 않는다. `aria-hidden`인 이유는 상태를 이미 `aria-busy`가
 * 말하기 때문이다: 둘 다 말하면 스크린 리더가 두 번 읽는다. */
function Spinner() {
  return (
    <svg aria-hidden="true" className="animate-spin" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
      <path d="M14.5 8A6.5 6.5 0 0 0 8 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
