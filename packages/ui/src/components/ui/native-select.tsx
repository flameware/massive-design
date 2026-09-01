import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/* Native Select는 브라우저의 `<select>`를 그대로 쓰는 폼 컨트롤이다(#98).
 *
 * 기존 Select(Radix)와의 경계  같은 "값 하나 고르기"지만 서로 대체하지 않는다.
 *   - Radix `Select`는 트리거+팝업을 우리가 그리는 위젯이다. 항목에 아이콘·설명·
 *     구분선을 넣을 수 있고 열림 상태(open/closed)를 구성 상태로 갖는다. 대신
 *     팝업을 portal로 띄우므로 네이티브 폼 제출·모바일 시스템 피커·자동완성과는
 *     거리가 있다.
 *   - `NativeSelect`는 옵션 목록을 **OS가** 그린다. 구성 상태에 open이 없다 —
 *     열린 모습은 우리 것이 아니어서 Figma로도 코드로도 파생할 수 없다. 대신
 *     `name`/`form`/`required`가 그냥 동작하고, 모바일에서 시스템 피커가 뜨며,
 *     키보드·스크린리더 동작이 플랫폼 기본이다.
 *   판단: 값이 짧은 문자열이고 폼 제출에 실려야 하면 Native Select, 항목 자체를
 *   디자인해야 하면 Radix Select.
 *
 * 접근성  라벨은 이 컴포넌트가 만들지 않는다 — `id`를 받아 Field의 FieldLabel
 *   `htmlFor`와 짝을 이루거나 `aria-label`을 받는다. 오류는 `aria-invalid`가
 *   정본이고 테두리·링이 그 표현이다. 비활성은 네이티브 `disabled`다. 화살표
 *   글리프는 `aria-hidden`이고 포인터 이벤트를 받지 않으므로 접근성 트리와
 *   히트 영역 어느 쪽에도 끼어들지 않는다. */
const nativeSelectVariantsConfig = {
  variants: {
    size: {
      sm: "h-8 rounded-md py-1 pr-8 pl-2.5 text-sm",
      default: "h-9 py-2 pr-9 pl-3 text-sm",
      lg: "h-10 py-2 pr-9 pl-4 text-sm",
    },
  },
  defaultVariants: { size: "default" },
} as const

const nativeSelectVariants = cva(
  "w-full min-w-0 appearance-none rounded-md border bg-background shadow-xs outline-none focus-visible:border-focus-contrast focus-visible:ring-[3px] focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20",
  nativeSelectVariantsConfig
)

const staticPart = (className: string) => ({
  config: { variants: {}, defaultVariants: {} } as const,
  className: () => className,
})

const ICON = "pointer-events-none absolute right-3 size-4 text-muted-foreground"

function NativeSelect({ className, size = "default", children, ...props }: Omit<React.ComponentProps<"select">, "size"> & VariantProps<typeof nativeSelectVariants>) {
  return (
    <span data-slot="native-select-root" className="relative inline-flex w-full items-center">
      <select data-slot="native-select" data-size={size} className={cn(nativeSelectVariants({ size, className }))} {...props}>{children}</select>
      <NativeSelectIcon />
    </span>
  )
}

/** 장식용 화살표. 옵션 목록은 OS가 그리므로 이 글리프는 열림을 제어하지 않는다. */
function NativeSelectIcon({ className, ...props }: React.ComponentProps<"svg">) {
  return <svg aria-hidden="true" focusable="false" viewBox="0 0 16 16" data-slot="native-select-icon" className={cn(ICON, className)} {...props}><path d="m4 6 4 4 4-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" /></svg>
}

/** 네이티브 `<option>`. 스타일은 OS 소유라 클래스가 없다. */
function NativeSelectOption(props: React.ComponentProps<"option">) {
  return <option data-slot="native-select-option" {...props} />
}

/** 네이티브 `<optgroup>`. `label`이 곧 그룹의 접근 가능한 이름이다. */
function NativeSelectGroup(props: React.ComponentProps<"optgroup">) {
  return <optgroup data-slot="native-select-group" {...props} />
}

const componentContract = {
  name: "native-select", source: "src/components/ui/native-select.tsx",
  publicExports: ["NativeSelect", "NativeSelectIcon", "NativeSelectOption", "NativeSelectGroup", "nativeSelectVariants", "nativeSelectVariantsConfig"],
  config: nativeSelectVariantsConfig, className: (props: Record<string, string>) => cn(nativeSelectVariants(props)),
  anatomy: ["NativeSelect", "NativeSelectIcon", "NativeSelectGroup?", "NativeSelectOption*"],
  configurationStates: { validity: ["valid", "invalid"], disabled: ["enabled", "disabled"] }, drawnBy: { validity: "`aria-invalid` 수식자가 그리는데 지금 정책이 그것을 버린다(#178)", disabled: "네이티브 `:disabled`가 그린다 — `data-*`가 아니라 pseudo-class이고 조립은 그것을 상태 사다리의 `disabled`로 담는다" },
  parts: {
    NativeSelectIcon: staticPart(ICON),
  },
  reference: { example: "native-select", guidance: { use: "폼에 실려야 하는 짧은 값 하나를 고를 때 브라우저의 select를 그대로 쓰고, 필드 껍데기와 화살표만 디자인 시스템이 그린다.", evidence: "투자 이력 필터의 시장·계좌처럼 값이 문자열이고 모바일에서 시스템 피커가 더 빠른 자리가 있다.", limits: "옵션에 아이콘·설명·구분선을 넣거나 열린 목록을 디자인해야 하면 Radix 기반 Select를 쓴다 — 열림 상태는 OS 소유라 이 컴포넌트의 구성 상태에 없고, 라벨은 Field가 연결한다." } },
} as const

export { NativeSelect, NativeSelectIcon, NativeSelectOption, NativeSelectGroup, nativeSelectVariants, nativeSelectVariantsConfig, componentContract }
