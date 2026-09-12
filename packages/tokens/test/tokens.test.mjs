import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

import { depth, flatten, isRef, refPath, resolve, valueFor } from '../scripts/lib/resolve.mjs'

const read = (p) => JSON.parse(readFileSync(new URL(`../tokens/${p}`, import.meta.url), 'utf8'))
const gen = read('primitive/color.gen.json')
const literal = read('primitive/color.literal.json')
const scale = read('primitive/scale.json')
const semantic = read('semantic/color.json')

/** 빌드가 보는 것과 같은 평면 세계 — primitive + semantic이 한 Map에 산다. */
const tokens = new Map([
  ...flatten(gen), ...flatten(literal), ...flatten(scale), ...flatten(semantic),
])
const semanticColors = [...flatten(semantic).keys()]

test('semantic 색 토큰이 정확히 41개다', () => {
  // 35 → 36: #143의 border.knockout. 근거는 ADR-0007에 있다
  // 36 → 41: #337의 bg.<family>.muted 다섯 — 면으로 읽혀야 하는 채움 단계
  assert.equal(semanticColors.length, 41)
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

test('참조 그래프가 1단 깊이다 — semantic → palette', () => {
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
  // 라이트에서만 canvas/surface가 단계를 교차한다 — 나머지는 두 모드가
  // 같은 단계 번호를 쓴다(같은 값이라는 뜻은 아니다).
  // border.knockout은 bg.canvas를 그대로 따라가므로 같이 교차한다 — 그것이
  // 이 토큰의 정의다(뒤에 있는 면을 되그린다, #143).
  // bg.<family>.muted 다섯은 **의도된 비대칭**이다 — 라이트 7 · 다크 6이라야 양
  // 모드가 면 대비 1.35:1을 함께 넘는다. 한 단계로 맞추면 한쪽이 무너진다(#337).
  const step = (path, mode) => refPath(valueFor(tokens.get(path), mode)).split('.').at(-1)
  const crossed = semanticColors.filter((p) => step(p, 'light') !== step(p, 'dark'))
  assert.deepEqual(crossed.sort(), [
    'color.bg.accent.muted', 'color.bg.canvas', 'color.bg.danger.muted',
    'color.bg.neutral.muted', 'color.bg.overlay', 'color.bg.success.muted',
    'color.bg.surface', 'color.bg.warning.muted',
    'color.border.default', 'color.border.field', 'color.border.knockout',
    'color.fg.warning', 'color.state.layer',
  ])
})

test('알파 리터럴은 8자리 hex와 정확한 알파를 함께 갖는다', () => {
  // 8비트 알파는 손실이 있다(0.1 → 1a → 0.10196). color-mix 경로는
  // $extensions의 정확한 값을 쓰고, CSS 8자리 hex는 표시용이다.
  for (const [path, token] of flatten(literal)) {
    if (!path.startsWith('palette.alpha')) continue
    assert.match(token.$value, /^#[0-9a-f]{8}$/, path)
    assert.equal(typeof token.$extensions['design.massive.alpha'], 'number', path)
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

test('line-height px 확장은 사이즈 × 비율로 나온다 — 9개', () => {
  // 코드는 무단위 비율, $extensions는 px. 곱셈의 주체가 빌드라서 어긋날 수 없다.
  const want = { xs: 19.2, sm: 22.4, base: 25.6, lg: 28.8, xl: 28, '2xl': 33.6, '3xl': 37.5, '4xl': 45, '5xl': 60 }
  for (const [name, node] of Object.entries(scale.type.size)) {
    const tier = node.$extensions['design.massive.typeTier']
    const px = node.$extensions['design.massive.px'] * scale.type.lineHeight[tier].$value
    assert.ok(Math.abs(px - want[name]) < 1e-9, `${name}: ${px} ≠ ${want[name]}`)
  }
})

test('space 프리셋 13개가 배수 × 4px다', () => {
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

/* 컨트롤 어포던스 — 채움 자체가 조작 대상인 자리(Scroll Area thumb, Switch off 트랙).
 * 앉는 면에 대해 비텍스트 3:1을 지켜야 하고 그래서 solid 계열 중립 배경을 집는다(#109). */
test('면으로 읽혀야 하는 채움이 다섯 면 위에서 1.35:1을 넘는다 — 양 모드 (#337)', async () => {
  const { report } = await import('../scripts/contrast.mjs')
  const rows = report().filter((r) => r.kind === 'fill')
  // 패밀리 5종 × 면 5종 × 2모드
  assert.equal(rows.length, 50)
  for (const r of rows) {
    assert.equal(r.gate, 1.35, `${r.mode} ${r.fg} on ${r.bg}`)
    assert.ok(r.gated && r.cr >= 1.35, `${r.mode} ${r.fg} on ${r.bg} — ${r.cr.toFixed(2)}`)
  }
})

test('muted 위 전경은 fg.default 하나뿐이다 — 유채 fg는 오지 않는다 (#336)', async () => {
  const { report, wcag } = await import('../scripts/contrast.mjs')
  const muteds = report().filter((r) => r.kind === 'fill').map((r) => r.fg)
  const onMuted = report().filter((r) => r.kind === 'text' && muteds.includes(r.bg))
  assert.equal(onMuted.length, 10)                       // 5패밀리 × 2모드
  for (const r of onMuted) assert.equal(r.fg, 'fg.default', `${r.mode} on ${r.bg}`)

  // 유채 fg를 이 단계 위에 올리면 실제로 AA가 깨진다 — 계약이 취향이 아니라는 증거다
  const hex = (name, mode) => resolve(tokens, `color.${name}`, mode).value
  const broken = ['accent', 'danger', 'success'].map(
    (f) => wcag(hex(`fg.${f}`, 'dark'), hex(`bg.${f}.muted`, 'dark')),
  )
  for (const cr of broken) assert.ok(cr < 4.5, `다크 유채 fg가 muted 위에서 ${cr.toFixed(2)}`)
})

test('같은 값을 갖는 semantic 이름은 전부 선언되어 있다 (#337)', async () => {
  // lint B9가 게이트이고, 여기서는 **선언이 실제 상태와 붙어 있는지**를 잠근다.
  // 이름이 값보다 많은 상태 자체는 금지가 아니다 — 조용한 것이 금지다.
  const { lintSameValue } = await import('../scripts/lint.mjs')
  const errors = []
  lintSameValue(flatten(semantic), (e) => errors.push(e))
  assert.deepEqual(errors, [])

  const declared = (path) =>
    tokens.get(path).$extensions?.['design.massive.sameValue'] ?? []
  assert.deepEqual(declared('color.bg.inset').sort(), ['bg.neutral.soft', 'bg.overlay', 'bg.subtle'])
  assert.deepEqual(declared('color.bg.neutral.muted'), [])   // muted는 아무와도 겹치지 않는다
})

test('컨트롤 어포던스가 다섯 면 위에서 비텍스트 3:1을 넘는다 — 양 모드', async () => {
  const { report } = await import('../scripts/contrast.mjs')
  const rows = report().filter((r) => r.fg === 'bg.neutral.solid')
  // 면 5종 × 2모드. 게이트가 텍스트 4.5가 아니라 비텍스트 3이어야 한다
  assert.equal(rows.length, 10)
  for (const r of rows) {
    assert.equal(r.gate, 3, `${r.mode} on ${r.bg}`)
    assert.ok(r.gated && r.cr >= 3, `${r.mode} on ${r.bg} — ${r.cr.toFixed(2)}`)
  }
})
