/**
 * `createBrandOverride`(#398) — 소비처 brand 키 컬러 하나로
 * `--ds-palette-brand-{light,dark}-{1..12}`만 덮는 CSS를 만드는 공개 API.
 * `dist/ramp.js`를 대상으로 잰다(ramp-api.test.mjs와 같은 이유 — 게시되는
 * 것이 dist라서다).
 *
 * AC 목록:
 * - DS 기본 키(#0f5fed)는 통과하고 결과가 dist/tokens.css의 brand 팔레트와 같다
 * - 밝은 키(#eab308)는 에러
 * - 대비 게이트는 scripts/contrast.mjs와 같은 판정 코드(BRAND_GATE_TABLE,
 *   scripts/lib/brand-gate.mjs가 빌드 시점에 접었다)를 쓴다
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const ramp = await import(new URL('../dist/ramp.js', import.meta.url))
const tokensCss = readFileSync(new URL('../dist/tokens.css', import.meta.url), 'utf8')

/** dist/tokens.css의 `--ds-palette-brand-<mode>-<step>: <hex>;` 한 줄을 읽는다. */
function brandVar(mode, step) {
  const m = tokensCss.match(new RegExp(`--ds-palette-brand-${mode}-${step}: (#[0-9a-f]{6});`))
  assert.ok(m, `dist/tokens.css에 --ds-palette-brand-${mode}-${step}이 없다`)
  return m[1]
}

test('DS 기본 키(#0f5fed)는 게이트를 통과하고 :root·.dark 블록을 낸다', () => {
  const css = ramp.createBrandOverride('#0f5fed')
  assert.match(css, /^:root \{\n(?:.|\n)*--ds-palette-brand-light-1: #[0-9a-f]{6};/)
  assert.match(css, /\n\.dark \{\n(?:.|\n)*--ds-palette-brand-dark-1: #[0-9a-f]{6};/)
})

test('DS 기본 키의 결과가 dist/tokens.css의 brand 팔레트와 같다', () => {
  const css = ramp.createBrandOverride('#0f5fed')
  for (const mode of ['light', 'dark']) {
    for (let step = 1; step <= 12; step++) {
      const expected = brandVar(mode, step)
      assert.match(
        css,
        new RegExp(`--ds-palette-brand-${mode}-${step}: ${expected};`),
        `${mode} step ${step}`,
      )
    }
  }
})

test('밝은 키(#eab308)는 대비 게이트를 못 넘어 에러를 던진다', () => {
  assert.throws(
    () => ramp.createBrandOverride('#eab308'),
    /대비 게이트 실패/,
  )
})

test('에러 메시지가 어느 쌍이 몇 대 몇으로 떨어졌는지 담는다', () => {
  assert.throws(
    () => ramp.createBrandOverride('#eab308'),
    /fg\.on-solid ↔ bg\.accent\.solid: [\d.]+ < 4\.5:1/,
  )
})

test('숲마루 forest 키(oklch(0.52 0.11 155))는 게이트를 통과한다', () => {
  const css = ramp.createBrandOverride('oklch(0.52 0.11 155)')
  assert.match(css, /--ds-palette-brand-light-9: #[0-9a-f]{6};/)
  assert.match(css, /--ds-palette-brand-dark-9: #[0-9a-f]{6};/)
  // step 9는 라이트/다크가 같다 — 키 컬러 자신이 앉는 유일한 단계라서다.
  const light9 = css.match(/--ds-palette-brand-light-9: (#[0-9a-f]{6});/)[1]
  const dark9 = css.match(/--ds-palette-brand-dark-9: (#[0-9a-f]{6});/)[1]
  assert.equal(light9, dark9)
})

test('hex가 아닌 CSS 색(oklch(...))도 키로 받는다 — 같은 색이면 결과가 같다', () => {
  // #0f5fed를 oklch(...)로만 다시 쓴 것 — hex로 줬을 때와 같은 색이어야 한다.
  const fromHex = ramp.createBrandOverride('#0f5fed')
  const fromOklch = ramp.createBrandOverride('oklch(0.53603284586106 0.22568248179744815 261.481180169905)')
  assert.equal(fromOklch, fromHex)
})

test('색으로 해석할 수 없는 key는 명확히 거절한다', () => {
  for (const key of ['', 'not-a-color', undefined, null]) {
    assert.throws(() => ramp.createBrandOverride(key))
  }
})
