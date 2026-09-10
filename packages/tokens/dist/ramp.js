// ⚙ 생성물 — scripts/lib/emit/ramp.mjs. 손대지 말 것.
//
// 소스: scripts/lib/oklch.mjs · scripts/lib/ramp-core.mjs · scripts/lib/wcag.mjs.
// 공개 표면은 맨 끝의 createRamp · rampToCssVariables · contrastRatio 셋뿐이다.

/**
 * OKLCH 헬퍼 — culori 위에 새로 쓴다.
 *
 * `prototypes/ramp-generator.prototype.html`은 의존성 0을 목표로 Oklab 변환
 * 행렬을 직접 넣은 **버릴 코드**다. 수학은 같지만 여기서는 검증된 라이브러리를
 * 쓴다(docs/tokens/build-pipeline.md §1).
 */
import {
  converter,
  displayable,
  formatHex,
  interpolate,
  differenceEuclidean,
  toGamut,
} from 'culori'

const toOklchColor = converter('oklch')
const toRgb = converter('rgb')
const fit = toGamut('rgb', 'oklch') // CSS Color 4 감마 매핑

/** hex → {l, c, h}. 무채색이면 culori가 h를 undefined로 주므로 0으로 채운다. */
function toOklch(hex) {
  const { l, c, h } = toOklchColor(hex)
  return { l, c, h: h ?? 0 }
}

function oklchToHex({ l, c, h }) {
  return formatHex({ mode: 'oklch', l, c, h })
}

/** CSS `color-mix(in oklab, base (1-alpha), layer alpha)`와 같은 파생 hex. */
function mixOklabHex(base, layer, alpha) {
  if (!(alpha >= 0 && alpha <= 1)) throw new Error(`alpha 범위 오류: ${alpha}`)
  return formatHex(interpolate([base, layer], 'oklab')(alpha))
}

function formatOklch({ l, c, h }) {
  const chroma = c.toFixed(3)
  /* C가 0으로 반올림되면 hue는 정의되지 않는다. 그 자리에 찍히던 값은 거의 0인
   * 두 수의 atan2가 낸 노이즈라 **node 버전이 바뀌면 같이 바뀐다** — ECMAScript가
   * 초월함수 구현을 명세하지 않기 때문이다. 생성물을 커밋해 verify로 지키는 이
   * 파이프라인에서 그건 곧 "생성한 런타임에서만 통과하는 산출물"이 된다(실제로
   * node 24로 생성한 color.gen.json이 CI의 node 22에서 3칸 어긋났다). */
  const hue = chroma === '0.000' ? 0 : h
  return `oklch(${(l * 100).toFixed(1)}% ${chroma} ${hue.toFixed(1)})`
}

/** 주어진 (L, H)에서 sRGB 안에 담기는 최대 chroma. 24회 이분탐색(≈3e-8). */
function cuspChroma(l, h) {
  let lo = 0
  let hi = 0.5
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2
    if (inGamut(l, mid, h)) lo = mid
    else hi = mid
  }
  return lo
}

/**
 * culori의 `displayable`은 여유가 0이라 cusp 바로 위 부동소수 오차에서 흔들린다.
 * 프로토타입과 같은 1e-5 여유를 준다 — 없으면 이분탐색이 한 비트씩 덜 먹는다.
 */
function inGamut(l, c, h) {
  const color = { mode: 'oklch', l, c, h }
  if (displayable(color)) return true
  const { r, g, b } = toRgb(color)
  const e = 1e-5
  return r >= -e && r <= 1 + e && g >= -e && g <= 1 + e && b >= -e && b <= 1 + e
}

/**
 * 감마 정리. chroma가 깎인 양을 함께 돌려준다 — 조용한 뭉개짐을 막는 장치.
 * `toGamut`은 목적지 모드(rgb)로 돌려주므로 다시 oklch로 읽어 측정한다.
 */
function fitGamut({ l, c, h }) {
  const fitted = toOklchColor(fit({ mode: 'oklch', l, c, h }))
  return {
    l: fitted.l,
    c: fitted.c,
    h: fitted.h ?? h,
    clamped: Math.max(0, c - fitted.c),
  }
}

const euclid = differenceEuclidean('oklch')

function deltaEOK(a, b) {
  return euclid({ mode: 'oklch', ...a }, { mode: 'oklch', ...b })
}

/**
 * 램프 생성 알고리즘 — 순수 함수만. fs·crypto 없음.
 *
 * `scripts/ramp.mjs`(빌드 CLI)와 `scripts/lib/emit/ramp.mjs`(공개 API
 * 번들러, #281)가 **같은 파일**을 쓴다 — 후자는 이 파일의 소스 텍스트를
 * 그대로 `dist/ramp.js`에 옮겨 붙인다. 알고리즘을 두 번 적지 않기 위한
 * 구조다(rules.md 방법론 — 읽은 원본과 기록이 갈리지 않게).
 *
 * 알고리즘은 docs/research/oklch-ramps.md §7.3, 확정 파라미터는
 * docs/tokens/build-pipeline.md §3.1. 단계 주석의 1a~1h가 그 의사코드에 대응한다.
 */
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

function resolveParams(defaults, family, name) {
  for (const k of Object.keys(family.params ?? {})) {
    if (!PARAM_KEYS.has(k)) {
      throw new Error(`${name}: 미구현 파라미터 키 '${k}' — 오타이거나 아직 없는 기능이다`)
    }
  }
  const p = { ...defaults, ...(family.params ?? {}) }
  p.dark = { ...defaults.dark, ...(family.params?.dark ?? {}) }
  return p
}

/** 단계 override는 필요한 패밀리만 명시적인 근거와 함께 쓴다(§3.2). */
function resolveOverrides(family, name) {
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

function buildRamp(family, params, mode, name = 'ramp') {
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

function lintRamp(ramp, family, params, name) {
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

/**
 * WCAG 2 상대 휘도 대비비 — 순수 함수, 외부 의존 없음.
 *
 * `scripts/contrast.mjs`(대비 게이트)와 `scripts/lib/emit/ramp.mjs`(공개 API
 * 번들, #281)가 같은 파일을 쓴다. APCA(`apca-w3`)는 여기 없다 — 병기용이고
 * 게이트가 아니라서 공개 API가 물 이유가 없다(바닥값, ADR-0017).
 */

const srgb = (hex) => {
  const h = hex.replace('#', '')
  const at = (i) => parseInt(h.slice(i, i + 2), 16)
  return { r: at(0), g: at(2), b: at(4), a: h.length === 8 ? at(6) / 255 : 1 }
}

/** 알파가 있는 색은 배경 위에 합성해야 대비값이 의미를 갖는다. */
function composite(fg, bg) {
  if (fg.a === 1) return fg
  const mix = (c) => Math.round(fg[c] * fg.a + bg[c] * (1 - fg.a))
  return { r: mix('r'), g: mix('g'), b: mix('b'), a: 1 }
}

const channel = (v) => {
  const s = v / 255
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
}

const luminance = ({ r, g, b }) =>
  0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)

function wcag(fgHex, bgHex) {
  const bg = srgb(bgHex)
  const fg = composite(srgb(fgHex), bg)
  const [hi, lo] = [luminance(fg), luminance(bg)].sort((a, b) => b - a)
  return (hi + 0.05) / (lo + 0.05)
}

// ── 램프 알고리즘 기본값 — tokens/ramp.config.json의 defaults를 빌드 시점에 굳힌다 ──

const RAMP_DEFAULTS = {
  "steps": 12,
  "lightnessAnchors": {
    "light": [
      [
        0,
        0.993
      ],
      [
        5,
        0.865
      ],
      [
        11,
        0.32
      ]
    ],
    "dark": [
      [
        0,
        0.155
      ],
      [
        2,
        0.235
      ],
      [
        5,
        0.375
      ],
      [
        11,
        0.93
      ]
    ]
  },
  "lightnessEasing": "smoothstep",
  "satPeakStep": 8,
  "satPeak": 0.9,
  "satSigma": 4.2,
  "satBgEnd": 0.05,
  "satTextEnd": 0.45,
  "hueShift": [
    0,
    0
  ],
  "dark": {
    "backgroundL": 0.155,
    "satBiasBg": 1.9,
    "satBiasText": 0.6,
    "anchorStep": 8
  },
  "textChromaCap": true,
  "chromaRefCap": true,
  "minStepDelta": 0.012,
  "minLGapPerStep": 0.018,
  "minTailGapPerStep": 0.055
}

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
  if (!input || typeof input.key !== 'string') {
    throw new Error('createRamp: input.key(hex 키 컬러)가 필요하다')
  }
  const family = { key: input.key, overrides: input.overrides ?? {} }
  resolveOverrides(family, name)
  const params = resolveParams(RAMP_DEFAULTS, { params: input.params ?? {} }, name)
  const result = { name, light: [], dark: [], issues: [] }
  for (const mode of ['light', 'dark']) {
    const label = `${name}.${mode}`
    const ramp = buildRamp(family, params, mode, label)
    result.issues.push(...lintRamp(ramp, family, params, label))
    result[mode] = ramp.map((s) => ({ step: s.step, hex: s.hex, oklch: s.oklch }))
  }
  return result
}

/**
 * RampResult → CSS 변수 텍스트. `:root`에 라이트, `.dark`에 다크를 싣는다
 * (DS의 `dark` 클래스 스위치와 같은 규약 — ADR-0023 §11 스토리 8). 변수 이름은
 * `--{prefix}-{step}`이고 prefix 기본값은 패밀리 이름이다. DS의 `--ds-*`
 * 이름 공간과 겹치지 않는다 — 손익 색은 앱 소유라서다.
 */
export function rampToCssVariables(result, options = {}) {
  const prefix = options.prefix ?? result.name
  const line = (s) => `  --${prefix}-${s.step}: ${s.hex};`
  return [
    ':root {',
    ...result.light.map(line),
    '}',
    '',
    '.dark {',
    ...result.dark.map(line),
    '}',
  ].join('\n') + '\n'
}

/**
 * WCAG 2 상대 휘도 대비비. DS 대비 게이트(scripts/contrast.mjs)와 같은
 * 공식이다 — 생성한 램프가 DS와 같은 기준(텍스트 4.5:1 · 비텍스트 3:1)을
 * 통과하는지 소비처가 스스로 재는 자리다.
 */
export const contrastRatio = wcag
