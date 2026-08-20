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
  differenceEuclidean,
  toGamut,
} from 'culori'

const toOklchColor = converter('oklch')
const toRgb = converter('rgb')
const fit = toGamut('rgb', 'oklch') // CSS Color 4 감마 매핑

/** hex → {l, c, h}. 무채색이면 culori가 h를 undefined로 주므로 0으로 채운다. */
export function toOklch(hex) {
  const { l, c, h } = toOklchColor(hex)
  return { l, c, h: h ?? 0 }
}

export function oklchToHex({ l, c, h }) {
  return formatHex({ mode: 'oklch', l, c, h })
}

export function formatOklch({ l, c, h }) {
  return `oklch(${(l * 100).toFixed(1)}% ${c.toFixed(3)} ${h.toFixed(1)})`
}

/** 주어진 (L, H)에서 sRGB 안에 담기는 최대 chroma. 24회 이분탐색(≈3e-8). */
export function cuspChroma(l, h) {
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
export function fitGamut({ l, c, h }) {
  const fitted = toOklchColor(fit({ mode: 'oklch', l, c, h }))
  return {
    l: fitted.l,
    c: fitted.c,
    h: fitted.h ?? h,
    clamped: Math.max(0, c - fitted.c),
  }
}

const euclid = differenceEuclidean('oklch')

export function deltaEOK(a, b) {
  return euclid({ mode: 'oklch', ...a }, { mode: 'oklch', ...b })
}
