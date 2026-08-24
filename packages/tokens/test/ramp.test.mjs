import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

import { oklchToHex, toOklch } from '../scripts/lib/oklch.mjs'
import { buildRamp, generate, lintRamp, resolveOverrides, resolveParams } from '../scripts/ramp.mjs'

const config = JSON.parse(readFileSync(new URL('../tokens/ramp.config.json', import.meta.url), 'utf8'))
const gen = JSON.parse(readFileSync(new URL('../tokens/primitive/color.gen.json', import.meta.url), 'utf8'))

const paramsFor = (name) => resolveParams(config.defaults, config.families[name], name)
const hexes = (family, mode) => Object.values(gen.palette[family][mode]).map((t) => t.$value)

test('생성물이 120색이다 — 5패밀리 × 2모드 × 12단', () => {
  const all = Object.values(gen.palette).flatMap((f) => Object.values(f).flatMap((r) => Object.keys(r)))
  assert.equal(all.length, 120)
})

test('키 컬러가 step 9에 정확히 앉는다 — 두 모드 모두', () => {
  for (const [name, family] of Object.entries(config.families)) {
    for (const mode of ['light', 'dark']) {
      assert.equal(gen.palette[name][mode]['9'].$value, oklchToHex(toOklch(family.key)), `${name}.${mode}`)
    }
  }
})

test('semantic 매핑이 실제로 집는 단계의 hex가 확정값과 같다', () => {
  // docs/tokens/semantic-tokens.md §4가 못박은 값. 이 표가 곧 대비 검증의 근거다.
  const want = {
    'neutral.light': { 1: '#fdfdfd', 2: '#f8f8f8', 3: '#eeeeee', 6: '#d2d2d2', 7: '#b8b8b8', 8: '#8a8a8a', 9: '#727272', 10: '#616161', 11: '#424242', 12: '#333333' },
    'neutral.dark': { 1: '#0c0c0c', 2: '#151515', 3: '#1e1e1e', 8: '#656565', 9: '#727272', 10: '#8f8f8f', 12: '#e8e8e8' },
    'brand.light': { 3: '#eaeef4', 8: '#4581f1', 9: '#0f5fed', 10: '#1553c6' },
    // brand.dark.3은 문서가 #0c1d3b — 프로토타입의 손계산 행렬이 낸 값이다.
    // culori에서는 R 채널이 12.52/255로 반올림 경계를 넘어 #0d1d3b가 된다(ΔE ≈ 0.0005).
    'brand.dark': { 3: '#0d1d3b', 8: '#0d55d4', 9: '#0f5fed', 10: '#5989e2' },
    'danger.light': { 3: '#f4eceb', 8: '#f34c4b', 9: '#db2931', 10: '#b92429' },
    'danger.dark': { 3: '#341210', 8: '#c41a26', 9: '#db2931', 10: '#e76760' },
    'success.light': { 3: '#e0f4e3', 9: '#20823e', 10: '#1c6f35' },
    'success.dark': { 3: '#102314', 9: '#20823e', 10: '#569e65' },
    'warning.light': { 3: '#f4eddf', 9: '#eab308', 10: '#b7902c', 11: '#665019' },
    'warning.dark': { 3: '#241d0e', 9: '#eab308', 10: '#edc467' },
  }
  for (const [key, steps] of Object.entries(want)) {
    const [family, mode] = key.split('.')
    for (const [step, hex] of Object.entries(steps)) {
      assert.equal(gen.palette[family][mode][step].$value, hex, `${key}.${step}`)
    }
  }
})

test('neutral은 전 단계가 순수 회색이다 — brand hue가 섞이지 않는다', () => {
  for (const mode of ['light', 'dark']) {
    for (const hex of hexes('neutral', mode)) {
      assert.match(hex, /^#(..)\1\1$/, `neutral.${mode}: ${hex}`)
    }
  }
})

test('L이 단조다 — 라이트는 감소, 다크는 증가', () => {
  for (const name of Object.keys(config.families)) {
    for (const [mode, dir] of [['light', -1], ['dark', 1]]) {
      const ramp = buildRamp(config.families[name], paramsFor(name), mode)
      for (let i = 1; i < ramp.length; i++) {
        const d = ramp[i].l - ramp[i - 1].l
        assert.ok(dir < 0 ? d <= 1e-4 : d >= -1e-4, `${name}.${mode} step ${i}→${i + 1}`)
      }
    }
  }
})

test('5패밀리 10램프가 lint를 통과한다 — 경고 하나 없이', () => {
  const { issues } = generate(config)
  assert.deepEqual(issues, [])
})

test('lint가 단조 위반을 다크 램프에서도 잡는다', () => {
  const params = paramsFor('brand')
  const ramp = buildRamp(config.families.brand, params, 'dark', 'brand.dark')
  ramp[5].l = ramp[4].l - 0.05 // 다크에서 L이 거꾸로 간다
  const issues = lintRamp(ramp, config.families.brand, params, 'brand.dark')
  assert.ok(issues.some((i) => i.level === 'error' && i.msg.includes('단조 증가 위반')))
})

test('lint가 키 앵커가 풀린 것을 잡는다', () => {
  const params = paramsFor('brand')
  const ramp = buildRamp(config.families.brand, params, 'light', 'brand.light')
  ramp[8] = { ...ramp[8], hex: '#123456' }
  const issues = lintRamp(ramp, config.families.brand, params, 'brand.light')
  assert.ok(issues.some((i) => i.level === 'error' && i.msg.includes('앵커가 물리지 않았다')))
})

test('미구현 파라미터 키는 조용히 무시되지 않고 에러다', () => {
  assert.throws(
    () => resolveParams(config.defaults, { key: '#eab308', params: { satPeek: 0.8 } }, 'warning'),
    /미구현 파라미터 키 'satPeek'/,
  )
})

test('override에 _why가 없으면 에러다', () => {
  const family = { key: '#eab308', overrides: { light: { 9: { l: 0.918 } } } }
  assert.throws(() => resolveOverrides(family, 'warning'), /_why/)
  family.overrides.light['9']._why = '노랑은 cusp L이 높아 step 9가 형광이 된다'
  assert.deepEqual(resolveOverrides(family, 'warning'), family.overrides)
})

test('override는 감마 매핑 앞에서 먹는다 — 감마 밖 값도 검증을 받는다', () => {
  const family = {
    key: '#0f5fed',
    overrides: { light: { 5: { c: 0.9, _why: '테스트: 감마 밖 chroma' } } },
  }
  const ramp = buildRamp(family, paramsFor('brand'), 'light')
  assert.ok(ramp[4].clamped > 0.1, 'override 값이 감마 매핑을 통과했어야 한다')
})

test('configHash가 config 내용을 따라간다', () => {
  const recorded = gen.$extensions['design.massive.source'].configHash
  assert.match(recorded, /^sha256:[0-9a-f]{64}$/)
})
