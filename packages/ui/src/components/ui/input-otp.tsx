import * as React from "react"
import { OTPInput, OTPInputContext } from "input-otp"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

/* 일회용 코드 입력. 칸이 여러 개로 보이지만 **값을 가진 입력은 하나뿐이다**(#124).
 * `input-otp`가 컨테이너 안에 투명한 입력 하나를 절대 배치로 깔고, 우리는 그 위에
 * 칸을 그린다. 그래서 폼 제출·붙여넣기·모바일 자동완성은 전부 그 입력 하나가 진다.
 *
 * anatomy  InputOTP(container) → InputOTPGroup* → InputOTPSlot*, 그리고 그룹 사이의
 *   InputOTPSeparator?. 여기에 보이지 않는 InputOTPControl이 하나 더 있다 — 우리가
 *   className을 주는 진짜 입력이다. 이름을 안 붙이면 매니페스트가 컨테이너만
 *   설명하고 입력의 클래스는 **없는 것이 아니라 침묵**이 된다(#122).
 *
 * 커서(cursor)  구성 상태로 계약한다. 라이브러리의 `isActive`는 포커스에서
 *   파생되지만, Command가 키보드 커서(`highlighted`)를 구성 상태로 둔 것과 같은
 *   이유다(#93) — 어느 칸이 다음 차례인지는 정적 화면이 조립해야 하는 것이다.
 *   그래서 `InputOTPSlot`에 `active` 오버라이드를 둔다. 이것이 없으면 포커스가 없는
 *   참조 화면에서 `active`가 `idle`과 똑같이 그려져 **조립할 수 없는 구성 상태**가
 *   되고, 그건 #97의 완료 정의를 통과하지 못한다. Command의 `autoHighlight`가
 *   같은 자리에 있는 같은 물건이다.
 *
 * 접근성  값의 정본은 입력 하나이므로 눈에 보이는 칸은 전부 장식이다. 그룹에
 *   `aria-hidden`을 걸어 스크린 리더가 같은 코드를 두 번 읽지 않게 하고, 구분자도
 *   같은 이유로 장식으로 둔다. 접근 가능한 이름은 소비처가 Field나 `aria-label`로
 *   준다 — 라이브러리가 붙여 주는 ARIA는 `aria-placeholder` 하나뿐이다.
 *
 * 경계  컨테이너는 우리가 className을 주는 우리 노드이지만 **속성을 줄 통로가
 *   없다**(`containerClassName` 하나뿐이다). 그래서 `data-slot`은 입력에 붙고,
 *   오류 표시도 컨테이너를 거쳐 내려가지 못해 슬롯이 자기 `aria-invalid`를 읽는다.
 *   클래스 소유로 그은 경계가 노드는 갈라 주지만 **인라인 스타일까지 갈라 주지는
 *   않는다** — 그 사실을 `externalSurfaces`에 적는다. */
const inputOtpVariantsConfig = { variants: {}, defaultVariants: {} } as const
const inputOtpVariants = cva("flex items-center gap-2 has-[:disabled]:opacity-50", inputOtpVariantsConfig)

const staticPart = (className: string) => ({
  config: { variants: {}, defaultVariants: {} } as const,
  className: () => className,
})

const CONTROL = "disabled:cursor-not-allowed"
const GROUP = "flex items-center"
/* 첫·마지막 칸의 바깥 모서리를 지목하는 `first:`·`last:` 수식자는 셀에 나타나지 않고
 * 매니페스트의 `elsewhere`가 진다 — 그 모서리는 Figma에 실재하되 칸 자산이 아니라
 * **조립된 칸 무리**에 그려진다(ADR-0012). `ToggleGroupItem`의 붙은 형태가 이 관용구를
 * 선례로 삼았다. 오류 표시는 컨트롤의 `aria-invalid`가 정본이고 슬롯은 같은 값을 받아
 * 테두리를 붉힌다 — 라이브러리가 컨테이너에 속성을 주는 통로를 열어 두지 않아 CSS로
 * 전파할 자리가 없다. */
const SLOT =
  "relative flex size-9 items-center justify-center border-y border-r text-sm shadow-xs outline-none first:rounded-l-md first:border-l last:rounded-r-md data-[active=true]:z-10 data-[active=true]:border-focus-contrast data-[active=true]:ring-[3px] data-[active=true]:ring-ring aria-invalid:border-destructive aria-invalid:ring-destructive/20"
/* 커서 깜박임은 기존 `animate-pulse`로 그린다 — 전용 키프레임을 새로 열지 않는다. */
const CARET = "pointer-events-none absolute inset-0 flex items-center justify-center"
const SEPARATOR = "flex items-center justify-center text-muted-foreground"

/* 비밀번호 관리자 배지를 끈다. `input-otp`의 기본값(`increase-width`)은 1초마다
 * `elementFromPoint`로 배지를 찾아 **컨테이너 폭을 늘린다** — 우리가 구현한 적 없는
 * 상속 표면이고, 켜 두면 우리 레이아웃이 우리 것이 아니게 된다. 끄거나 선언하거나
 * 둘 중 하나이고(ADR-0005), 여기서는 끄는 쪽이 깨끗하다 — 배지는 컨테이너 폭을 바꾼다.
 * 모바일 문자 자동완성 경로인 `autoComplete="one-time-code"`는 켠 채로 둔다. 붙여넣기는
 * upstream이 소유한다(iOS와 pasteTransformer를 제외하면 네이티브 경로 그대로다). IME
 * 조합은 upstream이 다루지 않으므로 조합 문자가 필요한 코드에는 쓰지 않는다. */
function InputOTP({
  className,
  containerClassName,
  ...props
}: React.ComponentProps<typeof OTPInput> & { containerClassName?: string }) {
  return (
    <OTPInput
      data-slot="input-otp-control"
      pushPasswordManagerStrategy="none"
      containerClassName={cn(inputOtpVariants({ className: containerClassName }))}
      className={cn(CONTROL, className)}
      {...props}
    />
  )
}

/** 칸 묶음. 값은 입력 하나가 나르므로 이 층은 장식이다. */
function InputOTPGroup({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="input-otp-group" aria-hidden="true" className={cn(GROUP, className)} {...props} />
}

/** 칸 하나. `active`를 주면 커서 자리를 정적으로 조립한다(#93). */
function InputOTPSlot({
  index,
  active,
  className,
  ...props
}: React.ComponentProps<"div"> & { index: number; active?: boolean }) {
  const context = React.useContext(OTPInputContext)
  const slot = context?.slots?.[index]
  const char = slot?.char ?? null
  const isActive = active ?? slot?.isActive ?? false
  const hasCaret = active === undefined ? (slot?.hasFakeCaret ?? false) : active && char === null

  return (
    <div data-slot="input-otp-slot" data-active={isActive} className={cn(SLOT, className)} {...props}>
      {char}
      {hasCaret && <div className={CARET}><div className="h-4 w-px animate-pulse bg-foreground"/></div>}
    </div>
  )
}

/** 묶음 사이의 구분 표시. 값을 나르지 않으므로 그룹과 같이 장식이다. */
function InputOTPSeparator({ children, className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="input-otp-separator" aria-hidden="true" className={cn(SEPARATOR, className)} {...props}>{children ?? "–"}</div>
}

const componentContract = {
  name: "input-otp", source: "src/components/ui/input-otp.tsx",
  publicExports: ["InputOTP", "InputOTPGroup", "InputOTPSlot", "InputOTPSeparator", "inputOtpVariants", "inputOtpVariantsConfig"],
  config: inputOtpVariantsConfig, className: (props: Record<string, string>) => cn(inputOtpVariants(props)),
  /* InputOTPControl은 공개 export가 아니라 **이름 붙인 내부 노드**다. Field의 `Control`과
   * 같은 자리이며, 우리가 className을 주는 이상 계약이 설명해야 한다. */
  anatomy: ["InputOTP", "InputOTPGroup*", "InputOTPSlot*", "InputOTPSeparator?", "InputOTPControl"],
  /* value는 칸이 찼는지, cursor는 다음 차례가 어디인지, validity는 오류 표시다.
   * 셋을 한 축으로 합치면 "커서가 앉은 채 이미 채워진 칸"을 조립할 수 없다(#93). */
  configurationStates: { value: ["empty", "filled"], cursor: ["idle", "active"], validity: ["valid", "invalid"] }, drawnBy: { value: "칸에 글자가 렌더되는 것이 그린다 — 내용이지 클래스가 아니다", cursor: { attribute: "data-active", values: { active: "true" } }, validity: { modifiers: ["aria-invalid"], carriedBy: "none" } },
  parts: {
    InputOTPControl: staticPart(CONTROL),
    InputOTPGroup: staticPart(GROUP),
    InputOTPSlot: staticPart(SLOT),
    InputOTPSeparator: staticPart(SEPARATOR),
  },
  externalSurfaces: {
    "입력 래퍼": "input-otp이 컨테이너 안에 절대 배치 div를 스스로 만들고 className도 style도 받지 않는다",
    "숨은 입력의 인라인 지오메트리": "input-otp이 color·caret-color·letter-spacing·font-family와 --root-height를 인라인으로 소유한다 — 노드는 우리 것이지만 그 자리의 모양은 우리 클래스가 이기지 못한다",
    "no-script 폴백 스타일": "input-otp이 <noscript><style>로 자기 기본 스타일을 !important로 낸다",
    "문서 수준 선택·자동완성 스타일": "input-otp이 document.head에 ::selection과 :autofill 규칙을 한 번 심는다",
  },
  behaviors: {},
  reference: { example: "input-otp", guidance: {
    use: "여섯 자리 안팎의 일회용 코드를 칸으로 나눠 보여주면서, 값과 폼 제출은 입력 하나가 그대로 지게 한다.",
    evidence: "투자 이력의 계좌 연동과 재로그인에서 문자로 받은 인증번호를 넣는 자리가 있고, 몇 자리를 넣었는지가 한눈에 보여야 한다.",
    limits: "일반 텍스트나 금액에는 Input을 쓴다. 접근 가능한 이름은 소비처가 Field나 aria-label로 주고, 오류는 컨트롤의 aria-invalid가 정본이며 슬롯도 같은 값을 받는다. IME 조합 문자가 필요한 코드에는 쓰지 않는다. 재전송 타이머·자동 제출·검증 규칙은 소비처가 소유한다.",
  } },
} as const

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator, inputOtpVariants, inputOtpVariantsConfig, componentContract }
