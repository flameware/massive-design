/**
 * 램프 생성기 순수 로직(oklch.mjs·ramp-core.mjs·wcag.mjs) → dist/ramp.js·dist/ramp.d.ts
 *
 * 세 소스 파일의 **텍스트를 그대로 옮겨 붙인다** — 알고리즘을 두 벌 유지하지
 * 않기 위해서다(rules.md 방법론 — 읽은 원본과 기록이 갈리지 않게). 내부 함수의
 * `export`는 여기서 걷어내고, 공개 표면은 이 파일이 맨 끝에 붙이는
 * `createRamp`·`rampToCssVariables`·`contrastRatio` 셋뿐이다(#281, ADR-0023 §6
 * meta 최소와 같은 절제).
 *
 * culori는 이 파일에서만 쓴다 — `./ramp` 서브패스를 import하지 않는 소비처는
 * culori를 번들에 물지 않는다(바닥값, ADR-0017). `dist/tokens.css`·`dist/tokens.js`는
 * 건드리지 않는다.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/** 내부 헬퍼의 `export`를 걷어낸다 — 공개 표면은 이 파일이 명시적으로 정한다. */
const deExport = (src) => src.replace(/^export (function|const) /gm, '$1 ')

/** ramp-core.mjs가 `./oklch.mjs`에서 끌어오는 import 블록 — 이제 한 파일이라 뺀다. */
const IMPORT_FROM_OKLCH = /import \{[\s\S]*?\} from '\.\/oklch\.mjs'\n\n/

export function readRampSources(root) {
  const read = (rel) => readFileSync(join(root, 'scripts/lib', rel), 'utf8')
  return {
    oklch: read('oklch.mjs'),
    rampCore: read('ramp-core.mjs'),
    wcag: read('wcag.mjs'),
  }
}

export function emitRampJs({ oklch, rampCore, wcag }, rampDefaults) {
  const oklchBody = deExport(oklch)
  const rampCoreBody = deExport(rampCore).replace(IMPORT_FROM_OKLCH, '')
  const wcagBody = deExport(wcag)
  const bundled = `${oklchBody}\n${rampCoreBody}\n${wcagBody}`

  // 텍스트 이어붙이기라 깨지면 조용히 깨진다 — 여기서 두 가지를 확인한다:
  // 내부 소스의 export가 전부 걷혔는가(공개 표면이 의도치 않게 넓어지지
  // 않았는가), 상대 import가 남지 않았는가(그대로 두면 소비처에서
  // module-not-found). 둘 다 깨지면 빌드가 먼저 죽는 편이 낫다 — 실패가
  // 저 아래 test/package.test.mjs의 export-key 비교에서 나면 원인이 멀다.
  if (/^export /m.test(bundled)) {
    throw new Error('emitRampJs: 내부 소스에 export가 남았다 — deExport가 못 걸렀다.')
  }
  if (/from '\.\//.test(bundled)) {
    throw new Error('emitRampJs: 내부 소스에 상대 import가 남았다 — 번들링이 실패했다.')
  }

  return `// ⚙ 생성물 — scripts/lib/emit/ramp.mjs. 손대지 말 것.
//
// 소스: scripts/lib/oklch.mjs · scripts/lib/ramp-core.mjs · scripts/lib/wcag.mjs.
// 공개 표면은 맨 끝의 createRamp · rampToCssVariables · contrastRatio 셋뿐이다.

${bundled}
// ── 램프 알고리즘 기본값 — tokens/ramp.config.json의 defaults를 빌드 시점에 굳힌다 ──

const RAMP_DEFAULTS = ${JSON.stringify(rampDefaults, null, 2)}

// ── 공개 API (#281, ADR-0023 §10 — "손익 색은 앱 소유다") ───────────────────

/**
 * 키 컬러 하나로 OKLCH 램프(라이트·다크, 기본 12단)를 만든다. DS의 5패밀리와
 * 같은 알고리즘·같은 기본 파라미터를 쓴다 — 같은 대비 경향을 물려받지만
 * 게이트를 대신 통과시켜 주지는 않는다. 확인은 contrastRatio로 스스로 한다.
 */
export function createRamp(name, input) {
  if (typeof name !== 'string' || name === '') {
    throw new Error('createRamp: name(패밀리 이름)이 필요하다')
  }
  if (!input || typeof input.key !== 'string' || !/^#[0-9a-f]{6}$/i.test(input.key)) {
    // 6자리 sRGB hex만 받는다 — RampStep.hex의 계약과 같다. culori에
    // 곧장 넘기면 'red' 같은 CSS 색이름은 조용히 통과하고 '#zzzzzz'는
    // culori 내부 TypeError로 죽는다 — 둘 다 이 계층에서 먼저 잡는다.
    throw new Error(\`createRamp: input.key는 6자리 hex('#rrggbb')여야 한다 — \${JSON.stringify(input?.key)}\`)
  }
  const family = { key: input.key, overrides: input.overrides ?? {} }
  resolveOverrides(family, name)
  const params = resolveParams(RAMP_DEFAULTS, { params: input.params ?? {} }, name)
  const result = { name, light: [], dark: [], issues: [] }
  for (const mode of ['light', 'dark']) {
    const label = \`\${name}.\${mode}\`
    const ramp = buildRamp(family, params, mode, label)
    result.issues.push(...lintRamp(ramp, family, params, label))
    result[mode] = ramp.map((s) => ({ step: s.step, hex: s.hex, oklch: s.oklch }))
  }
  return result
}

/**
 * RampResult → CSS 변수 텍스트. \`:root\`에 라이트, \`.dark\`에 다크를 싣는다
 * (DS의 \`dark\` 클래스 스위치와 같은 규약 — ADR-0023 §11 스토리 8). 변수 이름은
 * \`--{prefix}-{step}\`이고 prefix 기본값은 패밀리 이름이다. DS의 \`--ds-*\`
 * 이름 공간과 겹치지 않는다 — 손익 색은 앱 소유라서다.
 */
export function rampToCssVariables(result, options = {}) {
  const prefix = options.prefix ?? result.name
  const line = (s) => \`  --\${prefix}-\${s.step}: \${s.hex};\`
  return [
    ':root {',
    ...result.light.map(line),
    '}',
    '',
    '.dark {',
    ...result.dark.map(line),
    '}',
  ].join('\\n') + '\\n'
}

/**
 * WCAG 2 상대 휘도 대비비. DS 대비 게이트(scripts/contrast.mjs)와 같은
 * 공식이다 — 생성한 램프가 DS와 같은 기준(텍스트 4.5:1 · 비텍스트 3:1)을
 * 통과하는지 소비처가 스스로 재는 자리다.
 */
export const contrastRatio = wcag
`
}

export function emitRampDts() {
  return `// ⚙ 생성물 — scripts/lib/emit/ramp.mjs. 손대지 말 것.

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

/** 단계 하나를 손으로 고칠 때. \`_why\`는 필수다 — 키 컬러를 바꿨을 때 이
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
  /** CSS 변수 접두사. 기본값은 \`name\`. */
  prefix?: string
}

/** RampResult → CSS 변수 텍스트. \`:root\`에 라이트, \`.dark\`에 다크. */
export declare function rampToCssVariables(result: RampResult, options?: RampToCssOptions): string

/** WCAG 2 상대 휘도 대비비. DS 대비 게이트와 같은 공식. */
export declare function contrastRatio(fgHex: string, bgHex: string): number
`
}
