// ⚙ 생성물 — scripts/lib/emit/ramp.mjs. 손대지 말 것.

/** 램프 한 단계. */
export interface RampStep {
  step: number
  /** sRGB hex, 예: '#0f5fed'. */
  hex: string
  /** 'oklch(L% C H)' 표기. */
  oklch: string
}

/** 알고리즘 파라미터 — 전부 선택이고, 준 것만 DS 기본값을 덮는다.
 *  tokens/ramp.config.json의 families.*.params와 같은 모양이다. */
export interface RampParams {
  steps?: number
  lightnessAnchors?: { light: Array<[number, number]>; dark: Array<[number, number]> }
  lightnessEasing?: 'smoothstep' | 'linear'
  satPeakStep?: number
  satPeak?: number
  satSigma?: number
  satBgEnd?: number
  satTextEnd?: number
  hueShift?: [number, number]
  dark?: { backgroundL?: number; satBiasBg?: number; satBiasText?: number; anchorStep?: number }
  textChromaCap?: boolean
  chromaRefCap?: boolean
  minStepDelta?: number
  minLGapPerStep?: number
  minTailGapPerStep?: number
  allowNonMonotonicL?: boolean
}

/** 단계 하나를 손으로 고칠 때. `_why`는 필수다 — 키 컬러를 바꿨을 때 이
 *  override가 아직 유효한지 판단할 유일한 근거이기 때문이다. */
export interface RampStepOverride {
  l?: number
  c?: number
  h?: number
  _why: string
}

export interface RampOverrides {
  light?: Record<string, RampStepOverride>
  dark?: Record<string, RampStepOverride>
}

export interface RampInput {
  /** 키 컬러 — 6자리 sRGB hex, 예: '#0f5fed'. CSS 색이름·3자리·알파 hex는 받지 않는다. */
  key: string
  params?: RampParams
  overrides?: RampOverrides
}

export interface RampIssue {
  level: 'error' | 'warn'
  msg: string
}

export interface RampResult {
  name: string
  light: RampStep[]
  dark: RampStep[]
  /** lint 이슈(규칙군 A, scripts/lib/ramp-core.mjs) — 'error'가 있으면 생성은
   *  됐지만 램프가 설계를 만족하지 못한다는 뜻이다. */
  issues: RampIssue[]
}

/**
 * 키 컬러 하나로 OKLCH 램프(라이트·다크)를 만든다. DS의 5패밀리와 같은
 * 알고리즘·같은 기본 파라미터를 쓴다.
 */
export declare function createRamp(name: string, input: RampInput): RampResult

export interface RampToCssOptions {
  /** CSS 변수 접두사. 기본값은 `name`. */
  prefix?: string
}

/** RampResult → CSS 변수 텍스트. `:root`에 라이트, `.dark`에 다크. */
export declare function rampToCssVariables(result: RampResult, options?: RampToCssOptions): string

/** WCAG 2 상대 휘도 대비비. DS 대비 게이트와 같은 공식. */
export declare function contrastRatio(fgHex: string, bgHex: string): number

/**
 * 소비처 brand 키 컬러 하나로 `--ds-palette-brand-{light,dark}-{1..12}`만
 * 덮는 CSS를 만든다. key는 hex('#rrggbb')든 `oklch(...)`든 culori가 읽는
 * CSS 색이면 된다. 대비 게이트(DS의 brand 조합과 같은 쌍·같은 공식)를 못
 * 넘으면 에러를 던진다 — 어느 쌍이 몇 대 몇으로 떨어졌는지 메시지에 담아서.
 */
export declare function createBrandOverride(key: string): string
