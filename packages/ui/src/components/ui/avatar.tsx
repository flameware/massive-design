import * as React from "react"
import { Avatar as AvatarPrimitive } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const avatarVariantsConfig = {
  variants: {
    size: {
      sm: "size-6 text-xs",
      default: "size-8 text-sm",
      lg: "size-10 text-base",
    },
  },
  defaultVariants: { size: "default" },
} as const

const avatarVariants = cva("relative flex shrink-0 overflow-hidden rounded-full", avatarVariantsConfig)

function Avatar({ className, size = "default", ...props }: React.ComponentProps<typeof AvatarPrimitive.Root> & VariantProps<typeof avatarVariants>) {
  return <AvatarPrimitive.Root data-slot="avatar" className={cn(avatarVariants({ size, className }))} {...props} />
}

function AvatarImage({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return <AvatarPrimitive.Image data-slot="avatar-image" className={cn("aspect-square size-full object-cover", className)} {...props} />
}

function AvatarFallback({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return <AvatarPrimitive.Fallback data-slot="avatar-fallback" className={cn("flex size-full items-center justify-center rounded-full bg-muted text-muted-foreground", className)} {...props} />
}

const componentContract = {
  name: "avatar", source: "src/components/ui/avatar.tsx",
  publicExports: ["Avatar", "AvatarImage", "AvatarFallback", "avatarVariants", "avatarVariantsConfig"],
  config: avatarVariantsConfig, className: (props: Record<string, string>) => cn(avatarVariants(props)),
  anatomy: ["Avatar", "AvatarImage?", "AvatarFallback"], configurationStates: { source: ["image", "fallback"] },
  reference: { example: "avatar", guidance: { use: "사람이나 계정을 작은 원형 이미지로 식별하고 이미지가 없거나 실패하면 안정적인 fallback을 표시한다.", evidence: "투자 기록의 작성자나 연결된 증권 계정을 목록과 활동 내역에서 빠르게 구별해야 한다.", limits: "이미지만으로 이름을 전달하지 말고 주변 텍스트나 접근 가능한 이름을 제공하며, 장식 이미지에는 빈 대체 텍스트를 사용한다." } },
} as const

export { Avatar, AvatarImage, AvatarFallback, avatarVariants, avatarVariantsConfig, componentContract }
