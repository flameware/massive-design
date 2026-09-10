/**
 * 공개 램프 API(#281) — 소비처가 `@flameware/tokens/ramp`로 부르는 것과 정확히
 * 같은 산출물(`dist/ramp.js`)을 대상으로 잰다. scripts/ramp.mjs가 아니라
 * dist를 import하는 이유는 package.test.mjs와 같다: 게시되는 것이 dist라서다.
 *
 * AC3("생성된 손익 램프가 DS의 대비 게이트와 같은 기준을 통과한다")는 여기서
 * 잰다 — DS 자신이 쓰는 것과 같은 짝(텍스트 step10 vs canvas/soft, 비텍스트
 * step9 vs 면 3종)을 소비처가 만들 법한 두 키 컬러(상승 빨강·하락 파랑)로
 * 재현한다. contrast.mjs의 TEXT_PAIRS·NONTEXT_PAIRS와 같은 자리다.
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'

const ramp = await import(new URL('../dist/ramp.js', import.meta.url))

// DS 5패밀리와 같은 면 값 — 대비 재현의 배경이다(scripts/contrast.mjs SURFACES).
// 라이트 canvas는 거의 흰색, 다크 canvas는 거의 검정 — brand.9 자리를 기준으로
// neutral 램프에서 딴 값이라 여기서 다시 계산하지 않고 상수로 못박는다.
const CANVAS = { light: '#ffffff', dark: '#0a0a0a' }

test('createRamp가 name·key를 요구한다', () => {
  assert.throws(() => ramp.createRamp('', { key: '#0f5fed' }), /name/)
  assert.throws(() => ramp.createRamp('profit', {}), /key/)
  assert.throws(() => ramp.createRamp('profit', undefined), /key/)
})

test('createRamp가 DS 5패밀리와 같은 알고리즘을 쓴다 — 키 컬러가 step 9에 그대로 앉는다', () => {
  const result = ramp.createRamp('profit', { key: '#db2931' })
  assert.equal(result.light[8].hex, '#db2931')
  assert.equal(result.dark[8].hex, '#db2931')
  assert.deepEqual(result.issues, [])
  assert.equal(result.light.length, 12)
  assert.equal(result.dark.length, 12)
})

test('lint 규칙군 A가 공개 API에서도 산다 — 미구현 override 키는 조용히 무시되지 않는다', () => {
  assert.throws(
    () => ramp.createRamp('profit', { key: '#db2931', overrides: { light: { 9: { l: 0.5 } } } }),
    /_why/,
  )
})

test('rampToCssVariables가 :root·.dark 두 블록을 낸다 — 변수 이름은 이름 접두사다', () => {
  const result = ramp.createRamp('profit', { key: '#db2931' })
  const css = ramp.rampToCssVariables(result)
  assert.match(css, /:root \{\n(?:.|\n)*--profit-1: #[0-9a-f]{6};/)
  assert.match(css, /\.dark \{\n(?:.|\n)*--profit-1: #[0-9a-f]{6};/)
  assert.ok(!css.includes('--ds-'), 'DS 이름 공간과 겹치지 않는다 — 손익 색은 앱 소유다')
})

test('rampToCssVariables의 prefix 옵션이 이름을 대신한다', () => {
  const result = ramp.createRamp('profit', { key: '#db2931' })
  const css = ramp.rampToCssVariables(result, { prefix: 'pnl-up' })
  assert.match(css, /--pnl-up-9: #db2931;/)
})

// ── AC3: 생성된 손익 램프가 DS의 대비 게이트와 같은 기준을 통과한다 ──────────

for (const [dir, key] of [['상승(빨강)', '#db2931'], ['하락(파랑)', '#0f5fed']]) {
  test(`손익 램프 ${dir} — 텍스트 4.5:1 (step 10 on canvas·soft), 비텍스트 3:1 (step 9 on canvas)`, () => {
    for (const mode of ['light', 'dark']) {
      const result = ramp.createRamp('pnl', { key })
      const step = (n) => result[mode][n - 1].hex
      const canvas = CANVAS[mode]

      assert.ok(
        ramp.contrastRatio(step(10), canvas) >= 4.5,
        `${mode} step10 on canvas: ${ramp.contrastRatio(step(10), canvas).toFixed(2)}`,
      )
      assert.ok(
        ramp.contrastRatio(step(10), step(3)) >= 4.5,
        `${mode} step10 on soft(step3): ${ramp.contrastRatio(step(10), step(3)).toFixed(2)}`,
      )
      assert.ok(
        ramp.contrastRatio(step(9), canvas) >= 3,
        `${mode} step9 on canvas (비텍스트): ${ramp.contrastRatio(step(9), canvas).toFixed(2)}`,
      )
    }
  })
}

test('contrastRatio가 DS 대비 게이트(scripts/contrast.mjs)와 같은 공식이다 — 알려진 값', () => {
  assert.equal(ramp.contrastRatio('#ffffff', '#000000').toFixed(0), '21')
  assert.equal(ramp.contrastRatio('#777777', '#777777').toFixed(0), '1')
})

test('공개 표면은 정확히 셋이다 — createRamp · rampToCssVariables · contrastRatio', () => {
  assert.deepEqual(Object.keys(ramp).sort(), ['contrastRatio', 'createRamp', 'rampToCssVariables'])
})
