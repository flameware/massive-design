import * as React from "react"
import { Slider as SliderPrimitive } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/* Slider는 연속 범위에서 값을 고르는 컨트롤이다(#98). Radix Slider가 role·키보드·
 * 폼 브리지를 지고, 우리는 anatomy와 토큰만 얹는다.
 *
 * anatomy  Slider(root) → SliderTrack → SliderRange, 그리고 값 개수만큼의
 *   SliderThumb. root가 기본 조합을 직접 그리므로 소비처는 `<Slider …/>` 한 줄로
 *   쓰지만, 세 부품은 공개 export라 Figma anatomy와 코드가 같은 이름을 쓴다.
 *
 * value 구성 상태  single과 range 둘을 계약에 넣는다. thumb 개수는 value/
 *   defaultValue 배열의 길이에서 파생되므로 별도 prop이 없다 — 배열이 둘이면
 *   range다. Radix가 thumb 간 최소 간격(minStepsBetweenThumbs)과 교차 방지를
 *   이미 처리한다.
 *
 * size·orientation  size는 track 두께와 thumb 지름만 바꾼다. root의 size 칸이
 *   빈 문자열인 것은 Toggle Group과 같은 이유다 — 축은 계약에 있어야 하지만
 *   그리는 자리는 part다. orientation은 Radix가 data-orientation으로 내려 주므로
 *   part들이 같은 축을 selector로 읽는다.
 *
 * 접근성  role="slider"·aria-valuenow/min/max·화살표·Home/End·PageUp/PageDown은
 *   Radix thumb가 준다. 남은 하나가 **접근 가능한 이름**이다: role=slider는 이름이
 *   없으면 접근성 위반이므로, root가 받은 aria-label/aria-labelledby를 thumb에
 *   내려 주고 range일 때는 thumbLabels로 thumb마다 이름을 준다. `name`을 주면
 *   Radix가 hidden input을 만들어 네이티브 폼 제출에 실린다. disabled는 root의
 *   Radix prop이고 data-disabled로 전 부품에 전파된다. */
const sliderVariantsConfig = {
  variants: {
    size: { sm: "", default: "", lg: "" },
    orientation: {
      horizontal: "w-full flex-row",
      vertical: "h-44 w-fit flex-col",
    },
  },
  defaultVariants: { size: "default", orientation: "horizontal" },
} as const

const sliderVariants = cva(
  "relative flex touch-none items-center select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
  sliderVariantsConfig
)

const sliderTrackVariantsConfig = {
  variants: {
    size: {
      sm: "data-[orientation=horizontal]:h-1 data-[orientation=vertical]:w-1",
      default: "data-[orientation=horizontal]:h-1.5 data-[orientation=vertical]:w-1.5",
      lg: "data-[orientation=horizontal]:h-2 data-[orientation=vertical]:w-2",
    },
  },
  defaultVariants: { size: "default" },
} as const
const sliderTrackVariants = cva(
  "relative grow overflow-hidden rounded-full bg-muted data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full",
  sliderTrackVariantsConfig
)

const sliderRangeVariantsConfig = { variants: {}, defaultVariants: {} } as const
const sliderRangeVariants = cva(
  "absolute bg-primary data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full",
  sliderRangeVariantsConfig
)

const sliderThumbVariantsConfig = {
  variants: {
    size: { sm: "size-3.5", default: "size-4", lg: "size-5" },
  },
  defaultVariants: { size: "default" },
} as const
const sliderThumbVariants = cva(
  "block shrink-0 rounded-full border bg-background shadow-sm transition-[color,box-shadow] outline-none focus-visible:border-focus-contrast focus-visible:ring-[3px] focus-visible:ring-ring disabled:pointer-events-none",
  sliderThumbVariantsConfig
)

type SliderSize = "sm" | "default" | "lg"

function SliderTrack({ className, size = "default", ...props }: React.ComponentProps<typeof SliderPrimitive.Track> & VariantProps<typeof sliderTrackVariants>) {
  return <SliderPrimitive.Track data-slot="slider-track" className={cn(sliderTrackVariants({ size, className }))} {...props} />
}

function SliderRange({ className, ...props }: React.ComponentProps<typeof SliderPrimitive.Range>) {
  return <SliderPrimitive.Range data-slot="slider-range" className={cn(sliderRangeVariants({ className }))} {...props} />
}

function SliderThumb({ className, size = "default", ...props }: React.ComponentProps<typeof SliderPrimitive.Thumb> & VariantProps<typeof sliderThumbVariants>) {
  return <SliderPrimitive.Thumb data-slot="slider-thumb" className={cn(sliderThumbVariants({ size, className }))} {...props} />
}

function Slider({
  className,
  size = "default",
  orientation = "horizontal",
  defaultValue,
  value,
  min = 0,
  max = 100,
  thumbLabels,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root> & VariantProps<typeof sliderVariants> & { size?: SliderSize; thumbLabels?: readonly string[] }) {
  const values = React.useMemo(
    () => (Array.isArray(value) ? value : Array.isArray(defaultValue) ? defaultValue : [min]),
    [value, defaultValue, min]
  )

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      data-size={size}
      orientation={orientation ?? "horizontal"}
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(sliderVariants({ size, orientation, className }))}
      {...props}
    >
      <SliderTrack size={size}><SliderRange /></SliderTrack>
      {values.map((_, index) => (
        <SliderThumb
          key={index}
          size={size}
          aria-label={thumbLabels?.[index] ?? ariaLabel}
          aria-labelledby={thumbLabels?.[index] ? undefined : ariaLabelledby}
        />
      ))}
    </SliderPrimitive.Root>
  )
}

const componentContract = {
  name: "slider", source: "src/components/ui/slider.tsx",
  publicExports: ["Slider", "SliderTrack", "SliderRange", "SliderThumb", "sliderVariants", "sliderVariantsConfig"],
  config: sliderVariantsConfig, className: (props: Record<string, string>) => cn(sliderVariants(props)),
  anatomy: ["Slider", "SliderTrack", "SliderRange", "SliderThumb*"],
  configurationStates: { value: ["single", "range"] }, drawnBy: { value: "thumb의 개수가 그린다 — 조립이지 클래스가 아니다" },
  parts: {
    SliderTrack: { config: sliderTrackVariantsConfig, className: (props: Record<string, string>) => cn(sliderTrackVariants(props)) },
    SliderRange: { config: sliderRangeVariantsConfig, className: (props: Record<string, string>) => cn(sliderRangeVariants(props)) },
    SliderThumb: { config: sliderThumbVariantsConfig, className: (props: Record<string, string>) => cn(sliderThumbVariants(props)) },
  },
  reference: { example: "slider", guidance: { use: "정확한 숫자보다 상대적 위치가 중요한 연속 범위에서 값 하나 또는 구간의 양 끝을 고른다.", evidence: "투자 이력 필터의 손익 범위처럼 최소·최대를 눈으로 훑으며 좁히는 자리가 있다.", limits: "정확한 금액이나 날짜를 입력받아야 하면 Input을 쓰고, 값이 몇 개뿐인 이산 선택에는 Toggle Group이나 Radio Group을 쓴다. thumb마다 접근 가능한 이름이 필요하므로 range에서는 thumbLabels를 반드시 준다." } },
} as const

export { Slider, SliderTrack, SliderRange, SliderThumb, sliderVariants, sliderVariantsConfig, componentContract }
