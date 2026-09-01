import * as React from "react"
import { Avatar as AvatarPrimitive } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/* 겹친 아바타를 가르는 링은 `border-knockout`이다(#143).
 *
 * 이 링은 요소의 경계가 아니라 **뒤에 있는 면을 되그려 파내는 것**이라 값이
 * `bg.canvas`와 같다. 그런데 `border-background`로 쓰면 매니페스트가
 * `border-color: --ds-bg-canvas`를 내고 `packages/ui`의 계열 게이트가 문다 —
 * 그래서 `--ds-border-knockout`이 별도 semantic 토큰으로 생겼다. 고려한 대안과
 * 각각이 걸린 자리는 ADR-0007에 있다: `ring`은 box-shadow로 컴파일돼
 * `unresolved`가 되고, `outline-*`은 `IGNORED_PROPERTIES`라 아예 침묵한다.
 *
 * **링이 `avatarVariants`의 축인 이유.** 파생 채널이 나르는 것은 셀이므로,
 * context로 클래스만 몰래 붙이면 링이 매니페스트에 나타나지 않는다 — 보이는
 * 선인데 파생 채널에 없는, ADR-0006이 닫으려는 침묵이다. 축으로 두면 셀이
 * 3개에서 6개로 늘고 Figma가 variant로 그린다. `AvatarGroup`이 context로 값을
 * 넣어 주는 모양은 `ToggleGroup`→`ToggleGroupItem`과 같다(#91의 소비 관계).
 *
 * **면색이 canvas로 고정된다는 한계는 계약이 진다.** 카드(`--card`) 위에 놓인
 * 그룹에서 링이 어긋난다. upstream도 `ring-background`로 같은 한계를 갖지만
 * 우리는 그것을 `limits`에 적는다 — 침묵은 선택지가 아니다. */

const avatarVariantsConfig = {
  variants: {
    size: {
      sm: "size-6 text-xs",
      default: "size-8 text-sm",
      lg: "size-10 text-base",
    },
    /* 겹침 링. 기본값이 none이라 기존 호출과 발행된 인스턴스를 재해석하지 않는다 */
    knockout: {
      none: "",
      ring: "border-2 border-knockout",
    },
  },
  defaultVariants: { size: "default", knockout: "none" },
} as const

const avatarVariants = cva("relative flex shrink-0 overflow-hidden rounded-full", avatarVariantsConfig)

/** 겹침 링과 크기는 그룹이 정하고 자식이 읽는다 — `ToggleGroupContext`와 같은 모양. */
type AvatarGroupValue = { size: "sm" | "default" | "lg" | null; knockout: "none" | "ring" }
const AvatarGroupContext = React.createContext<AvatarGroupValue>({ size: null, knockout: "none" })

function Avatar({ className, size, knockout, ...props }: React.ComponentProps<typeof AvatarPrimitive.Root> & VariantProps<typeof avatarVariants>) {
  const group = React.useContext(AvatarGroupContext)
  return <AvatarPrimitive.Root data-slot="avatar" className={cn(avatarVariants({ size: size ?? group.size ?? "default", knockout: knockout ?? group.knockout, className }))} {...props} />
}

function AvatarImage({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return <AvatarPrimitive.Image data-slot="avatar-image" className={cn("aspect-square size-full object-cover", className)} {...props} />
}

function AvatarFallback({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return <AvatarPrimitive.Fallback data-slot="avatar-fallback" className={cn("flex size-full items-center justify-center rounded-full bg-muted text-muted-foreground", className)} {...props} />
}

/* 배지는 아바타 모서리에 절대 배치된다. **위치 축을 열지 않는다** — upstream이
 * 위치 prop을 아예 갖지 않고 bottom-right로 고정하며, 실측 수요 없이 축을 열지
 * 않는다는 #123(Kbd 크기 축)의 근거가 그대로 선다. 다른 모서리가 필요하면
 * 소비처가 `className`으로 옮긴다.
 *
 * 크기는 아바타를 따라간다. 배지도 아바타 면 위에 얹히므로 같은 knockout 링을
 * 두른다 — 여기서는 링이 뒤의 이미지를 파내는 자리다.
 *
 * `role="img"`와 `aria-label`을 타입으로 요구한다. 색점 하나로 상태를 말하는
 * 요소라 이름이 없으면 보조기술에 아무것도 아니고, `aria-label`만 얹으면
 * role 없는 `<span>`이라 `aria-prohibited-attr`로 걸린다 — 둘은 한 쌍이다. */
const avatarBadgeVariantsConfig = {
  variants: {
    size: {
      sm: "size-2",
      default: "size-2.5",
      lg: "size-3",
    },
  },
  defaultVariants: { size: "default" },
} as const

const avatarBadgeVariants = cva("absolute right-0 bottom-0 z-10 flex items-center justify-center rounded-full border-2 border-knockout bg-muted text-muted-foreground", avatarBadgeVariantsConfig)

function AvatarBadge({ className, size = "default", ...props }: React.ComponentProps<"span"> & VariantProps<typeof avatarBadgeVariants> & { "aria-label": string }) {
  return <span data-slot="avatar-badge" role="img" className={cn(avatarBadgeVariants({ size, className }))} {...props} />
}

/* 그룹은 아바타를 겹쳐 늘어놓고 자식에 크기·겹침 링을 먹인다. `aria-label`을
 * 타입으로 요구한다 — 겹친 얼굴 더미는 그 자체로 무엇의 모임인지 말하지 않는다
 * (Menubar가 막의 이름을 요구한 것과 같은 자리). */
const avatarGroupVariantsConfig = {
  variants: {
    size: {
      sm: "-space-x-1.5",
      default: "-space-x-2",
      lg: "-space-x-2.5",
    },
  },
  defaultVariants: { size: "default" },
} as const

const avatarGroupVariants = cva("flex w-fit items-center", avatarGroupVariantsConfig)

function AvatarGroup({ className, size = "default", children, ...props }: React.ComponentProps<"div"> & VariantProps<typeof avatarGroupVariants> & { "aria-label": string }) {
  return <div data-slot="avatar-group" role="group" className={cn(avatarGroupVariants({ size, className }))} {...props}>
    <AvatarGroupContext.Provider value={{ size: size ?? "default", knockout: "ring" }}>{children}</AvatarGroupContext.Provider>
  </div>
}

/* 넘침 수("+3")는 **part이지 구성 상태가 아니다** — 구성 상태는 텍스트 노드를
 * 그리지 못한다. 아바타와 같은 자리에 서므로 지름·링·겹침을 그대로 따른다.
 *
 * 배지와 같은 이유로 `role="img"`+`aria-label`을 요구한다. 여기서는 이름이
 * "+3"이라는 축약을 대신 읽어 주는 값도 한다 — "외 3명". */
const avatarGroupCountVariantsConfig = {
  variants: {
    size: {
      sm: "size-6 text-xs",
      default: "size-8 text-xs",
      lg: "size-10 text-sm",
    },
  },
  defaultVariants: { size: "default" },
} as const

const avatarGroupCountVariants = cva("relative flex shrink-0 items-center justify-center rounded-full border-2 border-knockout bg-muted text-muted-foreground tabular-nums", avatarGroupCountVariantsConfig)

function AvatarGroupCount({ className, size, ...props }: React.ComponentProps<"span"> & VariantProps<typeof avatarGroupCountVariants> & { "aria-label": string }) {
  const group = React.useContext(AvatarGroupContext)
  return <span data-slot="avatar-group-count" role="img" className={cn(avatarGroupCountVariants({ size: size ?? group.size ?? "default", className }))} {...props} />
}

const staticPart = (className: string) => ({
  config: { variants: {}, defaultVariants: {} } as const,
  className: () => className,
})

const componentContract = {
  name: "avatar", source: "src/components/ui/avatar.tsx",
  publicExports: ["Avatar", "AvatarImage", "AvatarFallback", "AvatarBadge", "AvatarGroup", "AvatarGroupCount", "avatarVariants", "avatarVariantsConfig"],
  config: avatarVariantsConfig, className: (props: Record<string, string>) => cn(avatarVariants(props)),
  anatomy: ["Avatar", "AvatarImage?", "AvatarFallback", "AvatarBadge?", "AvatarGroup?", "AvatarGroupCount?"],
  configurationStates: { source: ["image", "fallback"] },
  parts: {
    AvatarImage: staticPart("aspect-square size-full object-cover"),
    AvatarFallback: staticPart("flex size-full items-center justify-center rounded-full bg-muted text-muted-foreground"),
    AvatarBadge: { config: avatarBadgeVariantsConfig, className: (props: Record<string, string>) => cn(avatarBadgeVariants(props)) },
    AvatarGroup: { config: avatarGroupVariantsConfig, className: (props: Record<string, string>) => cn(avatarGroupVariants(props)) },
    AvatarGroupCount: { config: avatarGroupCountVariantsConfig, className: (props: Record<string, string>) => cn(avatarGroupCountVariants(props)) },
  },
  reference: { example: "avatar", guidance: { use: "사람이나 계정을 작은 원형 이미지로 식별하고 이미지가 없거나 실패하면 안정적인 fallback을 표시한다. 여럿을 겹쳐 보일 때는 `AvatarGroup`이 겹침 간격과 가르는 링을 지고, 넘치는 수는 `AvatarGroupCount`가 같은 지름으로 잇는다. 상태 점은 `AvatarBadge`가 오른쪽 아래에 얹는다.", evidence: "투자 기록의 작성자나 연결된 증권 계정을 목록과 활동 내역에서 빠르게 구별해야 하고, 한 기록에 참여자가 여럿이면 얼굴을 겹쳐 보이고 나머지 수를 함께 낸다.", limits: "이미지만으로 이름을 전달하지 말고 주변 텍스트나 접근 가능한 이름을 제공하며, 장식 이미지에는 빈 대체 텍스트를 사용한다. `AvatarGroup`은 접근 가능한 이름을 `aria-label`로 요구한다 — 겹친 얼굴 더미는 그 자체로 무엇의 모임인지 말하지 않는다. 겹치지 않고 나란히 늘어놓는 경우에는 쓰지 않는다: 그건 소비처의 `flex gap-*`이고 이 컴포넌트가 계약하는 것은 겹침 간격과 가르는 링뿐이라 링이 필요 없으면 남는 결정이 없다. `AvatarBadge`와 `AvatarGroupCount`는 `role=\"img\"`를 달고 `aria-label`을 타입으로 요구한다 — 색점과 `+3`은 그 자체로 이름이 아니고, role 없이 `aria-label`만 얹으면 `aria-prohibited-attr`로 걸린다. `AvatarBadge`의 위치 축은 계약하지 않는다 — upstream이 위치 prop 없이 오른쪽 아래로 고정하고, 실측 수요 없이 축을 열지 않는다(#123). 다른 모서리는 소비처가 className으로 옮긴다. **겹침 링의 색은 canvas로 고정된다**(`--ds-border-knockout`) — 카드나 팝오버 면 위에 놓인 그룹에서는 링이 그 면과 어긋난다. upstream도 `ring-background`로 같은 한계를 갖고, 면마다 링 색을 가르려면 축이 하나 더 생겨 셀이 면 수만큼 늘어난다(ADR-0007). 소비처가 그 자리에서 `border-card` 같은 클래스로 덮는다. 넘침 수를 몇에서 접는지는 계약하지 않는다 — 소비처가 정해 `AvatarGroupCount`에 텍스트로 넣는다." } },
} as const

export { Avatar, AvatarImage, AvatarFallback, AvatarBadge, AvatarGroup, AvatarGroupCount, avatarVariants, avatarVariantsConfig, componentContract }
