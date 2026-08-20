import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

import { depth, flatten, isRef, refPath, resolve, valueFor } from '../scripts/lib/resolve.mjs'

const read = (p) => JSON.parse(readFileSync(new URL(`../tokens/${p}`, import.meta.url), 'utf8'))
const gen = read('primitive/color.gen.json')
const literal = read('primitive/color.literal.json')
const scale = read('primitive/scale.json')
const semantic = read('semantic/color.json')
const shadcn = read('alias/shadcn.json')

/** 빌드가 보는 것과 같은 평면 세계 — primitive + semantic이 한 Map에 산다. */
const tokens = new Map([
  ...flatten(gen), ...flatten(literal), ...flatten(scale), ...flatten(semantic),
])
const semanticColors = [...flatten(semantic).keys()]

test('semantic 색 토큰이 정확히 30개다', () => {
  assert.equal(semanticColors.length, 30)
})

test('semantic은 전부 {palette.*} 참조다 — 리터럴 금지', () => {
  for (const path of semanticColors) {
    for (const mode of ['light', 'dark']) {
      const value = valueFor(tokens.get(path), mode)
      assert.ok(isRef(value), `${path} (${mode}): 리터럴 ${value}`)
      assert.ok(refPath(value).startsWith('palette.'), `${path} (${mode}): ${value}`)
    }
  }
})

test('primitive는 참조를 갖지 않는다 — 리터럴만', () => {
  for (const [path, token] of [...flatten(gen), ...flatten(literal)]) {
    assert.ok(!isRef(token.$value), `${path}: ${token.$value}`)
  }
})

test('alias 그래프가 1단 깊이다', () => {
  for (const path of semanticColors) {
    for (const mode of ['light', 'dark']) {
      assert.equal(depth(tokens, path, mode), 1, `${path} (${mode})`)
    }
  }
})

test('semantic 이름에 색상명이 들어가지 않는다', () => {
  for (const path of semanticColors) {
    assert.doesNotMatch(path, /blue|red|green|gray|grey|yellow|brand/, path)
  }
})

test('모든 semantic 참조가 실재하는 palette 토큰을 가리킨다', () => {
  for (const path of semanticColors) {
    for (const mode of ['light', 'dark']) {
      const { value } = resolve(tokens, path, mode)
      assert.match(value, /^#[0-9a-f]{6}([0-9a-f]{2})?$/, `${path} (${mode}): ${value}`)
    }
  }
})

test('모드가 실제로 갈리는 지점은 semantic 하나뿐이다', () => {
  // 라이트에서만 canvas/surface가 단계를 교차한다 — 나머지 29개는 두 모드가
  // 같은 단계 번호를 쓴다(같은 값이라는 뜻은 아니다).
  const step = (path, mode) => refPath(valueFor(tokens.get(path), mode)).split('.').at(-1)
  const crossed = semanticColors.filter((p) => step(p, 'light') !== step(p, 'dark'))
  assert.deepEqual(crossed.sort(), [
    'color.bg.canvas', 'color.bg.overlay', 'color.bg.surface',
    'color.border.default', 'color.border.field', 'color.state.layer',
  ])
})

test('알파 리터럴은 8자리 hex와 정확한 알파를 함께 갖는다', () => {
  // 8비트 알파는 손실이 있다(0.1 → 1a → 0.10196). Figma·color-mix 경로는
  // $extensions의 정확한 값을 쓰고, CSS 8자리 hex는 표시용이다.
  for (const [path, token] of flatten(literal)) {
    if (!path.startsWith('palette.alpha')) continue
    assert.match(token.$value, /^#[0-9a-f]{8}$/, path)
    assert.equal(typeof token.$extensions['design.massive.alpha'], 'number', path)
  }
})

test('shadcn 정본 34개 + radius가 전부 있고 semantic으로 해석된다', () => {
  const keys = Object.keys(shadcn).filter((k) => !k.startsWith('$'))
  assert.equal(keys.length, 35)
  for (const [name, target] of Object.entries(shadcn)) {
    if (name.startsWith('$') || name === 'radius') continue
    if (typeof target === 'string') {
      assert.ok(tokens.has(target), `--${name} → ${target}`)
    } else {
      // chart-1..5만 palette를 직접 가리킨다 — 모드별로 값이 갈리므로
      // 방출기가 .dark에서 이 5개를 재선언해야 한다(semantic 30개와 함께).
      for (const mode of ['light', 'dark']) assert.ok(tokens.has(target[mode]), `--${name}.${mode}`)
    }
  }
})

test('radius 7단이 base × 배수와 일치한다', () => {
  const px = (name) => scale.radius[name].$extensions['design.massive.px']
  for (const [name, node] of Object.entries(scale.radius)) {
    const derived = node.$extensions?.['design.massive.derivedFrom']
    if (!derived) continue
    assert.equal(px(name), px('base') * derived.multiplier, name)
  }
})

test('type 사이즈 9개가 tier를 갖고, tier가 line-height·tracking과 짝이 맞는다', () => {
  const sizes = Object.entries(scale.type.size)
  assert.equal(sizes.length, 9)
  for (const [name, node] of sizes) {
    const tier = node.$extensions['design.massive.typeTier']
    assert.ok(scale.type.lineHeight[tier], `${name}: line-height tier ${tier}`)
    assert.ok(scale.type.tracking[tier], `${name}: tracking tier ${tier}`)
  }
})

test('Figma용 line-height px는 사이즈 × 비율로 나온다 — 9개', () => {
  // 코드는 무단위 비율, Figma는 px. 곱셈의 주체가 빌드라서 어긋날 수 없다.
  const want = { xs: 19.2, sm: 22.4, base: 25.6, lg: 28.8, xl: 28, '2xl': 33.6, '3xl': 37.5, '4xl': 45, '5xl': 60 }
  for (const [name, node] of Object.entries(scale.type.size)) {
    const tier = node.$extensions['design.massive.typeTier']
    const px = node.$extensions['design.massive.px'] * scale.type.lineHeight[tier].$value
    assert.ok(Math.abs(px - want[name]) < 1e-9, `${name}: ${px} ≠ ${want[name]}`)
  }
})

test('Figma space 프리셋 13개가 배수 × 4px다', () => {
  const presets = Object.entries(scale.space).filter(([k]) => !k.startsWith('$') && k !== 'base')
  assert.equal(presets.length, 13)
  for (const [name, node] of presets) {
    assert.equal(node.$extensions['design.massive.px'], Number(name) * 4, name)
  }
})

test('resolve가 순환 참조와 미아 참조를 조용히 통과시키지 않는다', () => {
  const broken = new Map([
    ['a', { $value: '{b}' }],
    ['b', { $value: '{a}' }],
    ['c', { $value: '{nope}' }],
  ])
  assert.throws(() => resolve(broken, 'a'), /순환 참조/)
  assert.throws(() => resolve(broken, 'c'), /알 수 없는 토큰 참조/)
})
