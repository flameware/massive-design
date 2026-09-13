/**
 * 소비처 brand 키 컬러 대비 게이트 표 — **빌드 시점 전용**.
 *
 * `scripts/contrast.mjs`가 DS 자신의 brand(accent) 패밀리에 거는 것과 같은
 * 쌍(`TEXT_PAIRS`·`NONTEXT_PAIRS`·`FILL_PAIRS`)과 같은 게이트값을 그대로
 * import해서 쓴다 — 복사하지 않는다(#398 AC). 이 파일이 하는 일은 그 쌍들을
 * 훑어 "brand 팔레트를 직접 참조하는 쪽"과 "브랜드와 무관해 고정인 쪽"으로
 * 접는 것뿐이다. semantic → palette alias는 1단 깊이라서(`CONTEXT.md`) 이 접기가
 * 안전하다.
 *
 * 결과 표는 `scripts/lib/emit/ramp.mjs`가 `dist/ramp.js`에 리터럴로 굳힌다
 * (`RAMP_DEFAULTS`와 같은 패턴) — 그래서 소비처 런타임은 fs도, semantic 토큰
 * 원본도 물지 않는다.
 */
import { TEXT_PAIRS, NONTEXT_PAIRS, FILL_PAIRS, TEXT_GATE, NONTEXT_GATE, FILL_GATE } from '../contrast.mjs'
import { isRef, refPath, resolve, valueFor } from './resolve.mjs'

const MODES = ['light', 'dark']
const BRAND_REF = /^palette\.brand\.(light|dark)\.(\d+)$/

/**
 * name이 `{palette.brand.<mode>.<step>}`를 직접 참조하면 그 step, 아니면 null.
 * 짝 목록(scripts/contrast.mjs의 TEXT_PAIRS 등)은 `color.` 접두어 없이
 * 이름을 적는다 — contrast.mjs의 `report()`와 같은 규약으로 여기서 붙인다.
 */
function brandStepFor(tokens, name, mode) {
  const path = `color.${name}`
  const token = tokens.get(path)
  if (!token) throw new Error(`알 수 없는 토큰 참조: ${path}`)
  const value = valueFor(token, mode)
  if (!isRef(value)) return null
  const m = refPath(value).match(BRAND_REF)
  return m && m[1] === mode ? Number(m[2]) : null
}

/** brand 참조면 `{brand: step}`, 아니면 완전히 해석한 고정 hex `{fixed: hex}`. */
function sideFor(tokens, name, mode) {
  const step = brandStepFor(tokens, name, mode)
  if (step != null) return { brand: step }
  return { fixed: resolve(tokens, `color.${name}`, mode).value }
}

/**
 * `{tokens}`(`build.mjs`의 `loadSources().tokens`) → brand 게이트 표.
 * 두 쪽 다 brand가 아닌 조합(현재 brand 키와 무관한 조합)은 뺀다.
 */
export function computeBrandGateTable(tokens) {
  const groups = [
    ['text', TEXT_PAIRS, TEXT_GATE],
    ['nontext', NONTEXT_PAIRS, NONTEXT_GATE],
    ['fill', FILL_PAIRS, FILL_GATE],
  ]
  const rows = []
  for (const [kind, pairs, gate] of groups) {
    for (const [a, b] of pairs) {
      const sides = {}
      let relevant = false
      for (const mode of MODES) {
        const sa = sideFor(tokens, a, mode)
        const sb = sideFor(tokens, b, mode)
        if (sa.brand != null || sb.brand != null) relevant = true
        sides[mode] = [sa, sb]
      }
      if (relevant) rows.push({ kind, gate, a, b, sides })
    }
  }
  return rows
}
