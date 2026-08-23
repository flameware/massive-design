import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const root = new URL('../../../', import.meta.url)
const read = (path) => readFileSync(new URL(path, root), 'utf8')

test('토큰 계약 문서는 정적 총계 대신 원본·생성물·검증을 가리킨다', () => {
  const context = read('CONTEXT.md')
  const semantic = read('docs/tokens/semantic-tokens.md')
  const scale = read('docs/tokens/scale-tokens.md')
  const source = JSON.parse(read('packages/tokens/tokens/semantic/color.json'))

  assert.match(context, /semantic\/color\.json.*tokens:lint/)
  assert.match(semantic, /dist\/tokens\.d\.ts.*dist\/figma\/04-semantic\.js/)
  assert.match(scale, /scale\.json.*tokens:verify.*test\/build\.test\.mjs/s)
  assert.doesNotMatch(source.color.$description, /semantic\s+\d+개/)
})

test('CSS 생성기와 생성물은 변동 총계를 현재값처럼 복제하지 않는다', () => {
  const emitter = read('packages/tokens/scripts/lib/emit/css.mjs')
  const css = read('packages/tokens/dist/tokens.css')
  const staleInventory = /(?:semantic|shadcn raw|alias)\s+\d+/

  assert.doesNotMatch(emitter, staleInventory)
  assert.doesNotMatch(css, staleInventory)
})

test('state.layer는 상태 합성 전용 입력이자 alias 소비 규칙의 명시적 예외다', () => {
  const context = read('CONTEXT.md')

  assert.match(context, /state\.layer.*상태 합성 전용 입력.*명시적 예외/s)
  assert.match(context, /state layer.*alias 소비 규칙의 유일한 예외/s)
})
