import assert from 'node:assert/strict'
import { test } from 'node:test'

import { loadSources } from '../scripts/build.mjs'
import { emitStateColors } from '../scripts/lib/emit/figma.mjs'

test('상태 견본 색은 모든 semantic 배경의 Light/Dark × hover/pressed를 낸다', () => {
  const out = JSON.parse(emitStateColors(loadSources()))
  assert.equal(out.colorSpace, 'oklab')
  assert.deepEqual(out.states, { hover: 0.08, pressed: 0.12 })
  assert.ok(Object.keys(out.entries).length >= 10)
  for (const [name, modes] of Object.entries(out.entries)) {
    assert.match(name, /^--ds-bg-/)
    assert.deepEqual(Object.keys(modes), ['Light', 'Dark'])
    for (const values of Object.values(modes)) {
      assert.match(values.base, /^#[0-9a-f]{6}$/)
      assert.match(values.hover, /^#[0-9a-f]{6}$/)
      assert.match(values.pressed, /^#[0-9a-f]{6}$/)
    }
  }
})

test('대표 상태 색은 현재 토큰 입력에서 결정적이다', () => {
  const out = JSON.parse(emitStateColors(loadSources()))
  assert.deepEqual(out.entries['--ds-bg-accent-solid'].Light, {
    base: '#0f5fed', hover: '#0c54d4', pressed: '#0b4fc8',
  })
})
