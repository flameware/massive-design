"use client"

import { Menu as BaseMenu } from "@base-ui/react/menu"
import { cva, type VariantProps } from "class-variance-authority"
import type * as React from "react"

import { cn } from "../lib/utils.js"

/* 네임스페이스형(ADR-0023 §5) — Root·Trigger·Popup·Group·GroupLabel·Item·
 * CheckboxItem·Separator를 하나의 이름 아래 둔다. 화살표 이동·Enter 선택·Esc 닫기는 전부 Base UI
 * `MenuRoot`/`MenuPositioner`가 지고, 여기는 스타일과 조립만 진다(ADR-0023 §2).
 *
 * `Popup`이 Portal·Positioner를 안에서 함께 연다 — 소비처가 매번 세 겹을
 * 조립하지 않는다. Dialog·AlertDialog(#284)도 같은 이유로 같은 모양을 고를
 * 가능성이 높지만, 그 판단은 그 티켓의 몫이다. */
const Root = BaseMenu.Root

export interface MenuTriggerProps<Payload = unknown>
  extends Omit<React.ComponentPropsWithoutRef<typeof BaseMenu.Trigger<Payload>>, "className"> {
  className?: string
}

/* 트리거는 포인터 대상이다 — 기본 모양은 고스트 버튼과 같은 자리(상태 레이어만,
 * `bg-*` 없음, #299)이고 `hit-area`로 24px 하한을 진다. 소비처가 `render`로
 * Avatar 등 다른 모양을 씌우면 이 클래스는 `cn`을 거쳐 병합된다 — 원형을
 * 깨지 않으려면 소비처가 `render`에 자기 클래스를 함께 얹는다(Avatar 스토리 참고). */
function Trigger<Payload = unknown>({ className, ...props }: MenuTriggerProps<Payload>) {
  return (
    <BaseMenu.Trigger
      className={cn(
        "hit-area inline-flex items-center justify-center rounded-md outline-offset-2",
        "state transition-[background-color] focus-visible:outline-2",
        className
      )}
      {...props}
    />
  )
}

export interface MenuPopupProps
  extends Omit<React.ComponentPropsWithoutRef<typeof BaseMenu.Popup>, "className"> {
  className?: string
  side?: React.ComponentPropsWithoutRef<typeof BaseMenu.Positioner>["side"]
  align?: React.ComponentPropsWithoutRef<typeof BaseMenu.Positioner>["align"]
  sideOffset?: React.ComponentPropsWithoutRef<typeof BaseMenu.Positioner>["sideOffset"]
}

function Popup({ className, side, align, sideOffset = 4, children, ...props }: MenuPopupProps) {
  return (
    <BaseMenu.Portal>
      <BaseMenu.Positioner side={side} align={align} sideOffset={sideOffset} className="z-50">
        <BaseMenu.Popup
          className={cn(
            "min-w-40 rounded-md border border-default bg-overlay p-1 text-sm text-default shadow-md",
            "origin-[var(--transform-origin)] transition-[transform,opacity]",
            "data-[starting-style]:scale-95 data-[starting-style]:opacity-0",
            "data-[ending-style]:scale-95 data-[ending-style]:opacity-0",
            className
          )}
          {...props}
        >
          {children}
        </BaseMenu.Popup>
      </BaseMenu.Positioner>
    </BaseMenu.Portal>
  )
}

/* Item에서만 `variant`를 연다 — root(BaseMenu)에는 그런 축이 없어서 규칙이
 * 허용하는 자리다(rules.md 축과 이름 공간, 1세대 `DropdownMenuItem.variant`가
 * 선례). `default`는 면을 안 주고(고스트와 같은 이유 — 투명 위의 반투명 층),
 * `destructive`는 글자색만 danger로 올린다 — 상태 층은 색이 없는 채로 공유된다.
 * base는 팝업 자신의 면색(`--ds-bg-overlay`, 위 Popup과 같은 값)이라 쉬는
 * 항목이 보이지 않는다 — SelectItem과 같은 이유이고 같은 시점에 고쳤다(#387). */
export const menuItemVariants = cva(
  [
    "relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5",
    "outline-none",
    "state transition-[background-color]",
    "[--ds-state-base:var(--ds-bg-overlay)]",
    "data-disabled:pointer-events-none data-disabled:opacity-50",
  ],
  {
    variants: {
      variant: {
        default: "text-default",
        destructive: "text-danger",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

export interface MenuItemProps
  extends Omit<React.ComponentPropsWithoutRef<typeof BaseMenu.Item>, "className">,
    VariantProps<typeof menuItemVariants> {
  className?: string
}

function Item({ className, variant, ...props }: MenuItemProps) {
  return <BaseMenu.Item className={cn(menuItemVariants({ variant }), className)} {...props} />
}

export interface MenuCheckboxItemProps
  extends Omit<React.ComponentPropsWithoutRef<typeof BaseMenu.CheckboxItem>, "className"> {
  className?: string
}

/* 체크 표시는 `CheckboxItemIndicator`가 진다 — `checked`가 false면 언마운트라
 * 소비처가 조건부 렌더를 직접 쓰지 않아도 된다(`keepMounted`를 켜면 트랜지션이
 * 붙는다, 지금은 켜지 않는다: Phase 1 모션 토큰이 없다, ADR-0023 §11).
 *
 * 체크 아이콘은 인라인 SVG다 — Button의 Spinner와 같은 이유(button.tsx)로
 * `lucide-react`를 끌어오지 않는다: 그 peer는 `Icon`을 쓰지 않는 소비처의
 * 바닥값에서 빠지기로 한 것인데(package.json `peerDependenciesMeta`,
 * ADR-0017), Menu가 내부에서 무조건 import하면 CheckboxItem 하나 때문에
 * 그 선택지가 없어진다. */
function CheckboxItem({ className, children, ...props }: MenuCheckboxItemProps) {
  return (
    <BaseMenu.CheckboxItem className={cn(menuItemVariants({ variant: "default" }), className)} {...props}>
      <span className="flex size-4 items-center justify-center">
        <BaseMenu.CheckboxItemIndicator>
          <CheckMark />
        </BaseMenu.CheckboxItemIndicator>
      </span>
      {children}
    </BaseMenu.CheckboxItem>
  )
}

function CheckMark() {
  return (
    <svg aria-hidden="true" className="size-4" viewBox="0 0 16 16" fill="none">
      <path
        d="M3.5 8.5 6.5 11.5 12.5 4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export interface MenuGroupProps
  extends Omit<React.ComponentPropsWithoutRef<typeof BaseMenu.Group>, "className"> {
  className?: string
}

/* 그룹은 면도 여백도 갖지 않는다 — 묶음을 **보이게** 하는 것은 이미 `Separator`의
 * 몫이고, Group이 자기 패딩을 더하면 구분선이 나눈 간격과 두 번 겹친다. 여기서
 * 나는 것은 의미뿐이다: `role="group"`과 자기 Label을 가리키는 `aria-labelledby`. */
function Group({ className, ...props }: MenuGroupProps) {
  return <BaseMenu.Group className={className} {...props} />
}

export interface MenuGroupLabelProps
  extends Omit<React.ComponentPropsWithoutRef<typeof BaseMenu.GroupLabel>, "className"> {
  className?: string
}

/* 그룹 제목 — 항목이 아니다 (#320).
 *
 * 가로 패딩은 `Menu.Item`과 같은 `px-2`다 — 제목과 항목의 글자가 한 세로줄에
 * 선다. `Menu.CheckboxItem`은 그 안쪽에 `size-4` 인디케이터와 `gap-2`를 더
 * 두므로 글자가 24px 더 들어간다: 제목이 맞추는 줄은 **`Item`의 줄**이고,
 * 체크 항목이 섞인 묶음에서는 체크 항목 쪽이 들여쓰인 것으로 읽힌다(인디케이터
 * 자리가 그 들여쓰기의 이유라 그대로 둔다 — 제목을 그쪽에 맞추면 이번에는
 * 일반 항목과 어긋난다).
 *
 * 항목과 달리 `state` 층은 걸지 않는다: 상태 층이 있으면 hover에 면이 뜨고, 그
 * 순간 이것은 다시 "누를 수 있는 것"으로 보인다 — 소비처가 손조립 `<div><p>`로
 * 그렸을 때 난 결함이 정확히 그것이었다. 글자는 `text-muted`·`text-xs`로 한 단
 * 내린다.
 *
 * 포커스·화살표 이동 대상이 아닌 것은 클래스가 아니라 Base UI가 진다 — Label은
 * composite item으로 등록되지 않고 자신에게 `aria-hidden`을 건다(이름은 Group의
 * `aria-labelledby`를 통해 한 번만 읽힌다). 그 계약을 Menu 스토리의 키보드 계약이
 * 매번 눌러 잰다.
 *
 * **정본 이름은 `GroupLabel`이다** — 같은 Base UI 파트가 카탈로그 안에서 두
 * 이름을 갖지 않기 위해서고(rules.md 축과 이름 공간), 그래서 `Select.GroupLabel`과
 * 같은 철자다. `Menu.Label`은 그 위에 얹은 **짧은 별칭**이다(#320이 그 이름으로
 * 열렸다): 같은 함수를 가리키므로 두 철자가 갈라질 일은 없지만, 카탈로그에
 * 대칭이 없는 이름이라(`Select.Label`은 없다) 이 리포의 스토리·문서·README는
 * 언제나 `GroupLabel`로 적는다 — 별칭이 있다는 사실을 보여주는 한 자리(Menu
 * 스토리의 `그룹과 제목`)만 예외다. */
function GroupLabel({ className, ...props }: MenuGroupLabelProps) {
  return (
    <BaseMenu.GroupLabel
      className={cn("px-2 py-1.5 text-xs font-medium text-muted", className)}
      {...props}
    />
  )
}

export interface MenuSeparatorProps
  extends Omit<React.ComponentPropsWithoutRef<typeof BaseMenu.Separator>, "className"> {
  className?: string
}

function Separator({ className, ...props }: MenuSeparatorProps) {
  return (
    <BaseMenu.Separator
      className={cn("-mx-1 my-1 h-0 border-t border-default", className)}
      {...props}
    />
  )
}

export const Menu = {
  Root,
  Trigger,
  Popup,
  Group,
  GroupLabel,
  /** `GroupLabel`의 별칭 — 같은 컴포넌트다. */
  Label: GroupLabel,
  Item,
  CheckboxItem,
  Separator,
}
