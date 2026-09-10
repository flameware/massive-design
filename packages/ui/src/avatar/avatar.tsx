"use client"

import { Avatar as BaseAvatar } from "@base-ui/react/avatar"
import { cva, type VariantProps } from "class-variance-authority"
import type * as React from "react"

import { cn } from "../lib/utils.js"

/* 네임스페이스형이다 — Root·Image·Fallback 세 파트를 하나의 이름 아래 둔다
 * (ADR-0023 §5). `size`는 Root에서만 정한다: Image·Fallback은 Root의 원(`size-*`)을
 * 채우기만 하면 되므로 축을 한 번 더 두지 않는다(rules.md 축과 이름 공간 —
 * 파트는 root에 축이 있으면 물려받는다).
 *
 * sm(24px)은 포인터 하한과 같은 값이다 — Avatar 자체가 대화형 트리거로 쓰이는
 * 자리(Menu.Trigger에 얹힐 때 등)에서 hit-area 없이도 바닥을 채운다. 대화형이
 * 아닌 자리(목록의 장식용 아바타)는 하한이 걸리지 않으므로 문제되지 않는다. */
const sizeVariants = cva("relative inline-flex shrink-0 overflow-hidden rounded-full", {
  variants: {
    size: {
      sm: "size-6 text-xs",
      md: "size-8 text-sm",
      lg: "size-10 text-base",
    },
  },
  defaultVariants: { size: "md" },
})

export interface AvatarRootProps
  extends Omit<React.ComponentPropsWithoutRef<typeof BaseAvatar.Root>, "className">,
    VariantProps<typeof sizeVariants> {
  className?: string
}

/**
 * 사용자를 나타내는 원형 그림. 이미지가 없거나 불러오기 실패하면 `Fallback`이
 * 대신 그려진다 — Base UI가 로딩 상태를 관리하므로 소비처는 `onLoadingStatusChange`
 * 없이도 순서만 지키면 된다: `Image` 다음에 `Fallback`을 두면 이미지가 실패했을 때만
 * 폴백이 보인다(둘 다 항상 DOM에 있지만 실패해야 폴백이 그려진다).
 */
function Root({ className, size, ...props }: AvatarRootProps) {
  return <BaseAvatar.Root className={cn(sizeVariants({ size }), className)} {...props} />
}

export interface AvatarImageProps
  extends Omit<React.ComponentPropsWithoutRef<typeof BaseAvatar.Image>, "className"> {
  className?: string
}

function Image({ className, ...props }: AvatarImageProps) {
  return <BaseAvatar.Image className={cn("size-full object-cover", className)} {...props} />
}

export interface AvatarFallbackProps
  extends Omit<React.ComponentPropsWithoutRef<typeof BaseAvatar.Fallback>, "className"> {
  className?: string
}

/**
 * 이미지가 없을 때의 자리 — 이름의 이니셜을 children으로 받는다(`<Avatar.Fallback>SK</Avatar.Fallback>`).
 * 이니셜을 이름에서 뽑는 규칙은 소비처마다 다르므로(성이 먼저인가, 몇 글자인가)
 * DS가 계산하지 않는다 — 그림을 못 그릴 때 텍스트를 그리는 자리만 만든다.
 */
function Fallback({ className, ...props }: AvatarFallbackProps) {
  return (
    <BaseAvatar.Fallback
      className={cn(
        "flex size-full items-center justify-center bg-neutral-soft font-medium text-muted",
        className
      )}
      {...props}
    />
  )
}

export const Avatar = { Root, Image, Fallback }
