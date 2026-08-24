import assert from 'node:assert/strict'
import { test } from 'node:test'

import { displayable } from 'culori'

import { cuspChroma, deltaEOK, fitGamut, formatOklch, mixOklabHex, oklchToHex, toOklch } from '../scripts/lib/oklch.mjs'

test('hex ↔ oklch 왕복이 hex를 보존한다', () => {
  for (const hex of ['#0f5fed', '#727272', '#db2931', '#20823e', '#ffffff', '#000000']) {
    assert.equal(oklchToHex(toOklch(hex)), hex)
  }
})

test('무채색은 chroma 0이고 hue가 undefined로 새지 않는다', () => {
  const gray = toOklch('#727272')
  assert.equal(gray.c, 0)
  assert.equal(typeof gray.h, 'number')
})

test('cuspChroma는 실질적으로 감마 경계다', () => {
  for (const [l, h] of [[0.5, 261.5], [0.87, 142], [0.2, 29]]) {
    const c = cuspChroma(l, h)
    // cusp(엄밀한 sRGB 경계)와 CSS Color 4 감마 매핑(deltaE JND 기반)은 1e-5
    // 수준에서 설계상 어긋난다. 계약은 "hex가 바뀌지 않는다"이지 "clamped == 0"이 아니다.
    assert.ok(fitGamut({ l, c, h }).clamped < 1e-4, `L=${l} H=${h}: cusp 자신이 감마 밖이면 안 된다`)
    assert.equal(oklchToHex(fitGamut({ l, c, h })), oklchToHex({ l, c, h }))
    // 감마 매핑은 JND(0.02) 안에서 멈추고 나머지를 클리핑으로 처리하므로
    // "cusp 위"의 판정은 매핑이 아니라 sRGB 자신에게 묻는다.
    assert.ok(displayable({ mode: 'oklch', l, c: c - 0.001, h }), `L=${l} H=${h}: cusp 아래가 감마 밖이면 안 된다`)
    assert.ok(!displayable({ mode: 'oklch', l, c: c + 0.01, h }), `L=${l} H=${h}: cusp 위가 감마 안이면 안 된다`)
  }
})

test('cusp L은 hue마다 다르다 — 초록이 파랑보다 훨씬 밝다', () => {
  const peak = (h) => {
    let best = { l: 0, c: -1 }
    for (let l = 0.05; l < 1; l += 0.005) {
      const c = cuspChroma(l, h)
      if (c > best.c) best = { l, c }
    }
    return best.l
  }
  assert.ok(peak(142) > peak(261.5) + 0.2, '초록 cusp이 파랑보다 0.2 이상 밝아야 chromaRefCap의 근거가 선다')
})

test('감마 밖 chroma는 깎이고 깎인 양이 보고된다', () => {
  const f = fitGamut({ l: 0.5, c: 0.4, h: 261.5 })
  assert.ok(f.clamped > 0.1)
  assert.ok(f.c < 0.4)
})

test('deltaEOK는 같은 색에서 0, 인접 단계에서 양수', () => {
  const a = { l: 0.5, c: 0.1, h: 260 }
  assert.ok(deltaEOK(a, a) < 1e-9)
  assert.ok(deltaEOK(a, { ...a, l: 0.52 }) > 0.01)
})

test('formatOklch는 문서 표기와 같은 형식이다', () => {
  assert.equal(formatOklch(toOklch('#0f5fed')), 'oklch(53.6% 0.226 261.5)')
})

test('상태 색은 CSS와 같은 oklab 공간에서 합성한다', () => {
  assert.equal(mixOklabHex('#ffffff', '#000000', 0.08), '#e4e4e4')
  assert.equal(mixOklabHex('#ffffff', '#000000', 0.12), '#d7d7d7')
  assert.throws(() => mixOklabHex('#ffffff', '#000000', 1.01), /alpha 범위/)
})
