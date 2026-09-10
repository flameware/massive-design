/**
 * WCAG 2 상대 휘도 대비비 — 순수 함수, 외부 의존 없음.
 *
 * `scripts/contrast.mjs`(대비 게이트)와 `scripts/lib/emit/ramp.mjs`(공개 API
 * 번들, #281)가 같은 파일을 쓴다. APCA(`apca-w3`)는 여기 없다 — 병기용이고
 * 게이트가 아니라서 공개 API가 물 이유가 없다(바닥값, ADR-0017).
 */

// srgb·composite는 apca()(scripts/contrast.mjs)도 쓴다 — export해 그쪽이
// import하게 한다. 두 벌로 두면 8자리 hex 알파 파싱이나 합성 반올림을 고칠 때
// 한쪽만 고쳐 WCAG 게이트와 APCA 병기 값이 다른 색을 재는 결함이 난다.
export const srgb = (hex) => {
  const h = hex.replace('#', '')
  const at = (i) => parseInt(h.slice(i, i + 2), 16)
  return { r: at(0), g: at(2), b: at(4), a: h.length === 8 ? at(6) / 255 : 1 }
}

/** 알파가 있는 색은 배경 위에 합성해야 대비값이 의미를 갖는다. */
export function composite(fg, bg) {
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

export function wcag(fgHex, bgHex) {
  const bg = srgb(bgHex)
  const fg = composite(srgb(fgHex), bg)
  const [hi, lo] = [luminance(fg), luminance(bg)].sort((a, b) => b - a)
  return (hi + 0.05) / (lo + 0.05)
}
