/**
 * tokens/ramp.config.json → tokens/primitive/color.gen.json (96색)
 *
 * 알고리즘은 docs/research/oklch-ramps.md §7.3, 확정 파라미터는
 * docs/tokens/build-pipeline.md §3.1. 단계 주석의 1a~1h가 그 의사코드에 대응한다.
 *
 * 램프 lint(규칙군 A)를 생성 직후 인라인으로 돌린다 — 깨진 램프가 파일로
 * 떨어지면 diff가 오염된다(build-pipeline §4.1).
 */
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  cuspChroma,
  deltaEOK,
  fitGamut,
  formatOklch,
  oklchToHex,
  toOklch,
} from './lib/oklch.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const CONFIG_PATH = 'tokens/ramp.config.json'
const OUT_PATH = 'tokens/primitive/color.gen.json'

/** 파라미터 화이트리스트. 미구현 키는 조용히 무시하지 않고 에러다(§3.2). */
const PARAM_KEYS = new Set([
  'steps', 'lightnessAnchors', 'lightnessEasing', 'satPeakStep', 'satPeak',
  'satSigma', 'satBgEnd', 'satTextEnd', 'hueShift', 'dark', 'textChromaCap',
  'chromaRefCap', 'minStepDelta', 'minLGapPerStep', 'minTailGapPerStep',
  'allowNonMonotonicL',
])
const OVERRIDE_KEYS = new Set(['l', 'c', 'h', '_why'])
const MODES = ['light', 'dark']

const smoothstep = (t) => t * t * (3 - 2 * t)
const EASINGS = { smoothstep, linear: (t) => t }

// ── 앵커 ────────────────────────────────────────────────────────────────────

/** 앵커 인덱스는 12단 기준이므로 N에 맞춰 비율 스케일한다. */
function scaleAnchors(anchors, n) {
  return anchors.map(([i, v]) => [(i / 11) * (n - 1), v])
}

/**
 * 키 컬러의 L을 peak 단계의 앵커로 심는다(같은 인덱스의 기존 앵커는 치환).
 * 보간이 끝난 뒤 L[peak]만 덮어쓰면 양옆이 따라오지 않아 9↔10이 역전된다.
 */
function withKeyAnchor(scaled, peak, keyL) {
  return scaled
    .filter(([i]) => Math.abs(i - peak) > 1e-9)
    .concat([[peak, keyL]])
    .sort((a, b) => a[0] - b[0])
}

/**
 * 앵커를 방향(dir: -1 감소 / +1 증가)에 대해 단조로 강제한다.
 * 키 앵커를 고정점으로 두고 바깥으로 밀어내므로 키 컬러 L은 정확히 보존된다.
 */
function normalizeAnchors(scaled, peak, dir, headGap, tailGap) {
  const a = scaled.map((x) => x.slice())
  const k = a.findIndex(([i]) => Math.abs(i - peak) < 1e-9)
  const bg = a[0][1] // 모드의 배경 L — 설계값이라 절대 밀지 않는다
  const fix = (i, ref) => {
    // 꼬리(키 너머)는 더 넓은 간격을 요구한다. 어두운 키를 주면 기본 꼬리
    // 앵커(0.320)와 키 사이가 좁아 9~12가 한 덩어리로 뭉치기 때문.
    const gap = i > k ? tailGap : headGap
    const need = a[ref][1] + dir * gap * (a[i][0] - a[ref][0])
    // 키 앵커 앞쪽(i < ref)에서는 부등호가 뒤집힌다 — 여기를 놓치면 라이트
    // 램프의 흰색 머리가 중간 회색으로 끌려 내려온다.
    const violates = (i > ref) === (dir < 0) ? a[i][1] > need : a[i][1] < need
    if (violates) a[i][1] = need
  }
  for (let i = k + 1; i < a.length; i++) fix(i, i - 1)
  for (let i = k - 1; i >= 0; i--) fix(i, i + 1)
  a.forEach((x) => (x[1] = Math.min(0.995, Math.max(0.03, x[1]))))
  a[0][1] = bg
  return a
}

function interpolateAnchors(scaled, n, ease) {
  const out = []
  const last = scaled[scaled.length - 1]
  for (let i = 0; i < n; i++) {
    if (i <= scaled[0][0]) { out.push(scaled[0][1]); continue }
    if (i >= last[0]) { out.push(last[1]); continue }
    let a = scaled[0]
    let b = last
    for (let k = 0; k < scaled.length - 1; k++) {
      if (i >= scaled[k][0] && i <= scaled[k + 1][0]) {
        a = scaled[k]
        b = scaled[k + 1]
        break
      }
    }
    const t = (i - a[0]) / (b[0] - a[0])
    out.push(a[1] + (b[1] - a[1]) * ease(t))
  }
  return out
}

// ── 램프 ────────────────────────────────────────────────────────────────────

export function resolveParams(defaults, family, name) {
  for (const k of Object.keys(family.params ?? {})) {
    if (!PARAM_KEYS.has(k)) {
      throw new Error(`${name}: 미구현 파라미터 키 '${k}' — 오타이거나 아직 없는 기능이다`)
    }
  }
  const p = { ...defaults, ...(family.params ?? {}) }
  p.dark = { ...defaults.dark, ...(family.params?.dark ?? {}) }
  return p
}

/** override 자리는 잡혀 있으나 4패밀리는 아직 쓰지 않는다(§3.2). */
export function resolveOverrides(family, name) {
  const all = family.overrides ?? {}
  for (const mode of Object.keys(all)) {
    if (!MODES.includes(mode)) throw new Error(`${name}.overrides: 모드가 아니다 — '${mode}'`)
    for (const [step, ov] of Object.entries(all[mode])) {
      for (const k of Object.keys(ov)) {
        if (!OVERRIDE_KEYS.has(k)) {
          throw new Error(`${name}.overrides.${mode}.${step}: 미구현 override 키 '${k}'`)
        }
      }
      if (!ov._why) {
        throw new Error(
          `${name}.overrides.${mode}.${step}: '_why'가 없다. ` +
            '키 컬러를 바꿨을 때 이 override가 아직 유효한지 판단할 유일한 근거다',
        )
      }
    }
  }
  return all
}

export function buildRamp(family, params, mode, name = 'ramp') {
  const p = params
  const n = p.steps
  const key = toOklch(family.key)
  const peak = Math.round((p.satPeakStep / 11) * (n - 1))
  const ease = EASINGS[p.lightnessEasing]
  if (!ease) throw new Error(`${name}: 미구현 lightnessEasing '${p.lightnessEasing}'`)

  // 1a. L 곡선 — 키 컬러의 L을 peak 앵커로 심은 뒤 보간한다.
  //     "step 9는 light/dark 동일"이라는 결정이 여기서 지켜진다.
  const dir = mode === 'light' ? -1 : 1
  const base = p.lightnessAnchors[mode].map(([i, v]) => [i, i === 0 && mode === 'dark' ? p.dark.backgroundL : v])
  const anchors = normalizeAnchors(
    withKeyAnchor(scaleAnchors(base, n), peak, key.l),
    peak, dir, p.minLGapPerStep, p.minTailGapPerStep,
  )
  const L = interpolateAnchors(anchors, n, ease)

  // 1b. hue 곡선 — 어두운 끝 → 밝은 끝 선형 보간
  const H = []
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 0 : i / (n - 1)
    const shift = p.hueShift[0] + (p.hueShift[1] - p.hueShift[0]) * t
    H.push((((key.h + shift) % 360) + 360) % 360)
  }

  // 1c. 정규화 saturation 벨 커브 + 다크 2점 보정
  const sat = []
  for (let i = 0; i < n; i++) {
    const g = Math.exp(-((i - peak) ** 2) / (2 * p.satSigma ** 2))
    const endVal = i < peak ? p.satBgEnd : p.satTextEnd
    let s = endVal + (p.satPeak - endVal) * g
    if (mode === 'dark') {
      const w = n === 1 ? 0 : i / (n - 1)
      const bias = p.dark.satBiasBg + (p.dark.satBiasText - p.dark.satBiasBg) * w
      if (i !== p.dark.anchorStep) s = Math.min(1, Math.max(0, s * bias))
    }
    sat.push(s)
  }

  // 1d. sat → 절대 chroma. 기준 chroma를 "키 명도에서의 cusp"로 상한 건다 —
  //     초록·라임·노랑은 cusp L이 0.87~0.94라 상한이 없으면 같은 정규화 sat이
  //     파랑의 몇 배 chroma로 번역돼 중간 단계가 형광이 된다.
  const refCap = p.chromaRefCap ? cuspChroma(key.l, key.h) : Infinity
  const C = []
  for (let i = 0; i < n; i++) C.push(Math.min(cuspChroma(L[i], H[i]), refCap) * sat[i])

  // 1e. 키 컬러 C/H 앵커링. L은 1a에서 이미 곡선에 심었다
  C[peak] = key.c
  H[peak] = key.h

  // 1f. Radix 텍스트 채도 상한
  if (p.textChromaCap && n >= 3) {
    const cap = Math.max(C[peak], C[Math.max(0, peak - 1)])
    C[n - 2] = Math.min(C[n - 2], cap)
    C[n - 1] = Math.min(C[n - 1], cap)
  }

  // 1g. 단계 override — 텍스트 채도 상한 뒤, 감마 매핑 앞
  const ov = family.overrides?.[mode] ?? {}
  for (const [step, v] of Object.entries(ov)) {
    const i = Number(step) - 1
    if (!Number.isInteger(i) || i < 0 || i >= n) throw new Error(`${name}: override 단계 범위 밖 — ${step}`)
    if (v.l != null) L[i] = v.l
    if (v.c != null) C[i] = v.c
    if (v.h != null) H[i] = v.h
  }

  // 1h. 감마 정리 + 클램프량 측정
  return L.map((l, i) => {
    const f = fitGamut({ l, c: C[i], h: H[i] })
    return {
      step: i + 1,
      hex: oklchToHex(f),
      oklch: formatOklch(f),
      l: f.l, c: f.c, h: f.h,
      clamped: f.clamped,
    }
  })
}

// ── lint 규칙군 A (build-pipeline §4.3 A) ───────────────────────────────────

export function lintRamp(ramp, family, params, name) {
  const issues = []
  const err = (msg) => issues.push({ level: 'error', msg: `${name}: ${msg}` })
  const warn = (msg) => issues.push({ level: 'warn', msg: `${name}: ${msg}` })

  // A0. 감마 클램핑이 설계를 대신하고 있으면 시끄럽게 알린다
  for (const s of ramp) {
    if (s.clamped > 0.005) {
      warn(`step ${s.step}: chroma가 감마 매핑으로 ${s.clamped.toFixed(3)} 깎임 — satPeak를 낮추거나 override할 것`)
    }
  }

  // A1. 인접 단계 구별성
  for (let i = 1; i < ramp.length; i++) {
    const d = deltaEOK(ramp[i - 1], ramp[i])
    if (d < params.minStepDelta) {
      err(`step ${i}↔${i + 1}: deltaEOK ${d.toFixed(4)} < ${params.minStepDelta} — 구별 불가`)
    }
  }

  // A2. L 단조 — 방향을 램프에서 읽는다. 라이트를 하드코딩하면 다크 램프의
  //     역전을 통째로 놓친다(#6 결함 (d))
  if (!params.allowNonMonotonicL) {
    const dir = ramp[0].l > ramp[ramp.length - 1].l ? -1 : 1
    for (let i = 1; i < ramp.length; i++) {
      const d = ramp[i].l - ramp[i - 1].l
      if (dir < 0 ? d > 1e-4 : d < -1e-4) {
        err(`step ${i}→${i + 1}: L ${dir < 0 ? '단조 감소' : '단조 증가'} 위반 ` +
          `(${(ramp[i - 1].l * 100).toFixed(1)}% → ${(ramp[i].l * 100).toFixed(1)}%)`)
      }
    }
  }

  // A3. 전 단계가 sRGB 감마 안 (1h가 보장하지만, 무너지면 여기서 드러난다)
  for (const s of ramp) {
    if (!/^#[0-9a-f]{6}$/.test(s.hex)) err(`step ${s.step}: hex가 sRGB 밖 — ${s.hex}`)
  }

  // A4. 앵커가 실제로 물렸는가 — step 9의 hex == 키 컬러 hex
  const peak = Math.round((params.satPeakStep / 11) * (params.steps - 1))
  const keyHex = oklchToHex(toOklch(family.key))
  if (ramp[peak].hex !== keyHex) {
    err(`step ${peak + 1}: 키 컬러 앵커가 물리지 않았다 — ${ramp[peak].hex} ≠ ${keyHex}`)
  }
  return issues
}

// ── 생성 ────────────────────────────────────────────────────────────────────

export function generate(config) {
  const palette = {}
  const issues = []
  for (const [name, family] of Object.entries(config.families)) {
    const params = resolveParams(config.defaults, family, name)
    resolveOverrides(family, name)
    palette[name] = {}
    for (const mode of MODES) {
      const label = `${name}.${mode}`
      const ramp = buildRamp(family, params, mode, label)
      issues.push(...lintRamp(ramp, family, params, label))
      palette[name][mode] = Object.fromEntries(
        ramp.map((s) => [
          String(s.step),
          {
            $type: 'color',
            $value: s.hex,
            $extensions: { 'design.massive.oklch': s.oklch },
          },
        ]),
      )
    }
  }
  return { palette, issues }
}

/**
 * config 원문 → `color.gen.json` 파일 내용. lint 이슈를 함께 돌려준다.
 * 파일로 쓰지 않는다 — `tokens:verify`가 같은 함수로 메모리 비교를 한다.
 */
export function renderGenDoc(configText) {
  const config = JSON.parse(configText)
  const { palette, issues } = generate(config)
  const doc = {
    $extensions: {
      'design.massive.source': {
        generator: 'scripts/ramp.mjs',
        config: CONFIG_PATH,
        // config가 바뀌는 시점과 값이 바뀌는 시점이 정확히 같다
        configHash: `sha256:${createHash('sha256').update(configText).digest('hex')}`,
      },
    },
    palette,
  }
  return { content: `${JSON.stringify(doc, null, 2)}\n`, issues, palette }
}

export const CONFIG_FILE = CONFIG_PATH
export const GEN_FILE = OUT_PATH
export const configPath = (root = ROOT) => join(root, CONFIG_PATH)

function main() {
  const configText = readFileSync(join(ROOT, CONFIG_PATH), 'utf8')
  const { content, issues, palette } = renderGenDoc(configText)

  for (const i of issues) console.error(`${i.level === 'error' ? '✗' : '⚠'} ${i.msg}`)
  if (issues.some((i) => i.level === 'error')) {
    console.error('\n램프 lint 실패 — 파일을 쓰지 않는다.')
    process.exit(1)
  }

  const out = join(ROOT, OUT_PATH)
  mkdirSync(dirname(out), { recursive: true })
  writeFileSync(out, content)
  const count = Object.values(palette).reduce(
    (n, f) => n + Object.values(f).reduce((m, r) => m + Object.keys(r).length, 0), 0,
  )
  console.log(`${OUT_PATH} — ${count}색 (${Object.keys(palette).length}패밀리 × 2모드)`)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main()
