/**
 * 번역표 ②(figma-components.md §8)가 지켜야 하는 것.
 *
 * 검사의 초점은 **개수가 아니라 문자열 규칙으로 복원되지 않는 자리들**이다 —
 * 그 자리가 있다는 것이 이 표가 생성물인 이유이므로, 거기가 무너지면 표가
 * 무의미해진다.
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'

import { loadSources } from '../scripts/build.mjs'
import { scaleVariables } from '../scripts/lib/emit/figma.mjs'
import { varMap } from '../scripts/lib/emit/var-map.mjs'

const sources = loadSources()
const map = varMap(sources)
const entries = Object.entries(map).filter(([k]) => !k.startsWith('$'))

test('표가 03의 스케일 47개 · 06의 그림자 5개 · 04의 semantic 31개를 덮는다', () => {
  assert.equal(scaleVariables(sources.scale).length, 47)
  assert.equal(entries.length, 47 + 5 + 31)
  assert.equal(entries.filter(([, v]) => v.kind === 'effectStyle').length, 5)
  assert.equal(entries.filter(([, v]) => v.collection === 'semantic').length, 31)
})

test('문자열 규칙으로 복원되지 않는 네 자리', () => {
  // 첫 대시는 경로 구분자, 둘째는 이름 내부
  assert.deepEqual(map['--ds-fg-on-solid'],
    { kind: 'variable', collection: 'semantic', name: 'fg/on-solid' })
  // camelCase → kebab
  assert.deepEqual(map['borderWidth.1'],
    { kind: 'variable', collection: 'palette', name: 'border-width/1' })
  // 순서가 뒤집힌다. 값도 다르다 — CSS는 비율 1.6, Figma는 px 22.4
  assert.deepEqual(map['--text-sm--line-height'],
    { kind: 'variable', collection: 'palette', name: 'type/line-height/sm' })
  // 컬렉션이 아니라 스타일이다 — 조회 채널이 다르다
  assert.deepEqual(map['shadow.xs'], { kind: 'effectStyle', name: 'shadow/xs' })
})

test('값은 담지 않는다 — 이름만 옮긴다 (§8.1)', () => {
  for (const [key, entry] of entries) {
    assert.deepEqual(
      Object.keys(entry).sort(),
      entry.kind === 'effectStyle' ? ['kind', 'name'] : ['collection', 'kind', 'name'],
      key
    )
  }
})

test('primitive 색은 표에 없다 — @theme에 없어 컴포넌트가 집을 수 없다 (#7)', () => {
  assert.equal(entries.filter(([k]) => k.startsWith('--ds-palette-')).length, 0)
})

test('Figma 이름이 겹치지 않는다 — 같은 변수를 두 키로 가리키면 소비 규칙이 갈린다', () => {
  const names = entries.map(([, v]) => `${v.collection ?? 'style'}/${v.name}`)
  assert.equal(new Set(names).size, names.length)
})

test('이름이 _ 나 . 로 시작하지 않는다 — 발행 목록에서 조용히 사라진다 (#31)', () => {
  for (const [key, { name }] of entries) {
    for (const segment of name.split('/')) {
      assert.ok(!/^[_.]/.test(segment), `${key} → ${name}`)
    }
  }
})
