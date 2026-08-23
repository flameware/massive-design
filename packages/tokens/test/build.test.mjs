import assert from 'node:assert/strict'
import { test } from 'node:test'

import { buildAll, checkLimits, loadSources } from '../scripts/build.mjs'
import { lintCss } from '../scripts/lint.mjs'
import { report, wcag } from '../scripts/contrast.mjs'
import { flatten } from '../scripts/lib/resolve.mjs'

const sources = loadSources()
const files = buildAll(sources)
const css = files.get('tokens.css')

/** 규칙군 C를 임의의 CSS에 걸어 본다 — lint가 실제로 무는지 확인하는 통로. */
const errorsFor = (text) => {
  const out = []
  lintCss(text, (msg) => out.push(msg))
  return out
}

// ── 출력물 모양 ─────────────────────────────────────────────────────────────

test('블록 순서가 alias 체인 순서다 — palette → semantic → shadcn → @theme', () => {
  const at = (needle) => css.indexOf(needle)
  assert.ok(at('@custom-variant dark') < at('--ds-palette-brand-light-1'))
  assert.ok(at('--ds-palette-brand-light-1') < at('--ds-bg-canvas'))
  assert.ok(at('--ds-bg-canvas') < at('--background:'))
  assert.ok(at('--background:') < at('.dark {'))
  assert.ok(at('.dark {') < at('@theme inline {'))
})

test('.dark는 semantic과 alias 원본을 빠짐없이 재선언한다', () => {
  const dark = css.match(/\n\.dark \{([\s\S]*?)\n\}/)[1]
  const decls = [...dark.matchAll(/^\s*(--[\w-]+):/gm)].map((m) => m[1])
  const semanticCount = flatten(sources.semantic).size
  const aliasCount = Object.keys(sources.shadcn)
    .filter((name) => !name.startsWith('$') && name !== 'radius').length
  assert.equal(decls.length, semanticCount + aliasCount)
  assert.equal(decls.filter((d) => d.startsWith('--ds-')).length, semanticCount)
  // alias는 :root에서 이미 치환이 끝나 자손이 상속만 한다 — 한 벌 더 선언하지
  // 않으면 중첩 .dark에서 라이트에 남는다 (#35). 뒤집히는지 자체는 cascade.test
  assert.equal(decls.filter((d) => !d.startsWith('--ds-')).length, aliasCount)
  assert.ok(!decls.includes('--radius'))
})

test('타이포는 사이즈를 덮지 않고 서브키만 낸다', () => {
  assert.ok(!/--text-sm:/.test(css))
  assert.match(css, /--text-sm--line-height: 1\.6;/)
  // 본문 tier의 tracking은 0이라 출력하지 않는다 — 5개만 나간다
  assert.equal([...css.matchAll(/--text-[\w-]+--letter-spacing:/g)].length, 5)
})

test('CSS 출력이 없는 카테고리는 정말로 없다', () => {
  for (const name of ['--border-width', '--duration', '--opacity', '--ease-']) {
    assert.ok(!css.includes(name), name)
  }
})

// ── lint 규칙군 C가 실제로 무는가 ───────────────────────────────────────────

test('C10 — @theme 안의 --ds-*를 잡는다', () => {
  assert.match(errorsFor('@theme inline { --ds-bg-canvas: red; }')[0], /^C10/)
})

test('C11 — inline 없는 @theme를 잡는다', () => {
  assert.ok(errorsFor('@theme { --color-primary: red; }').some((e) => e.startsWith('C11')))
})

test('C12 — --color-X 와 --text-X 충돌을 잡는다', () => {
  const errors = errorsFor(':root { --color-sm: red; --text-sm: 1rem; }')
  assert.ok(errors.some((e) => e.startsWith('C12')), errors.join('\n'))
})

test('C13 — shadcn 정본이 빠지면 잡는다', () => {
  assert.ok(errorsFor(css.replace('  --primary: ', '  --primary-x: ')).some((e) =>
    e === 'C13 :root에 --primary이 없다'))
})

test('C14 — @custom-variant dark의 형태를 잡는다', () => {
  assert.ok(errorsFor('@custom-variant dark (&:is(.dark *));').some((e) => e.startsWith('C14')))
})

test('빌드한 CSS는 규칙군 C를 통과한다', () => {
  assert.deepEqual(errorsFor(css), [])
})

// ── Figma 산출물 ────────────────────────────────────────────────────────────

// 주입 스크립트만. dist/figma에는 var-map.gen.json도 산다 — 그건 code로 안 간다
const figma = [...files].filter(([name]) => name.includes('figma') && name.endsWith('.js'))
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor

test('주입 스크립트 6개가 50,000자 상한 안에 있다', () => {
  assert.equal(figma.length, 6)
  assert.deepEqual(checkLimits(files), [])
})

test('주입 스크립트가 문법적으로 성립한다 — 최상위 await·return 포함', () => {
  for (const [name, code] of figma) {
    assert.doesNotThrow(() => new AsyncFunction('figma', code), name)
  }
})

test('line-height는 비율이 아니라 px로 나간다 — 바인딩이 PERCENT를 못 쓴다', () => {
  const code = files.get('figma/03-palette-scale.js')
  assert.match(code, /\[\s*"type\/line-height\/sm",\s*"FLOAT",\s*22\.4,/)
  assert.match(code, /\[\s*"type\/line-height\/5xl",\s*"FLOAT",\s*60,/)
})

test('primitive 색은 숨기고 스케일은 노출한다 — #7의 대응물은 색뿐이다 (#41)', () => {
  assert.match(files.get('figma/02-palette-color.js'), /hiddenFromPublishing = true/)
  // 지우는 게 아니라 false다 — 지우면 이미 숨겨진 채 주입된 파일이 영영 안 돌아온다
  assert.match(files.get('figma/03-palette-scale.js'), /hiddenFromPublishing = false/)
})

test('semantic은 두 모드가 서로 다른 palette 단계를 가리킨다', () => {
  const code = files.get('figma/04-semantic.js')
  assert.match(code, /\[\s*"bg\/canvas",\s*"neutral\/light\/2",\s*"neutral\/dark\/1"/)
  assert.match(code, /\[\s*"bg\/surface",\s*"neutral\/light\/1",\s*"neutral\/dark\/2"/)
})

// ── 타입 ────────────────────────────────────────────────────────────────────

test('타입 union의 개수가 회계와 맞는다', () => {
  const types = files.get('tokens.d.ts')
  const count = (header) => {
    const lines = types.slice(types.indexOf(header)).split('\n').slice(1)
    const end = lines.findIndex((l) => !l.startsWith('  | '))
    return end === -1 ? lines.length : end
  }
  assert.equal(count('export type SemanticColorToken'), 31)
  assert.equal(count('export type PaletteToken'), 101)   // 램프 96 + 리터럴 5
})

// ── 대비 ────────────────────────────────────────────────────────────────────

test('WCAG 계산이 알려진 값과 맞는다', () => {
  assert.equal(wcag('#ffffff', '#000000').toFixed(0), '21')
  assert.equal(wcag('#777777', '#777777').toFixed(0), '1')
})

test('게이트 조합이 전부 기준을 넘는다', () => {
  for (const row of report().filter((r) => r.gated)) {
    assert.ok(row.cr >= row.gate, `${row.mode} ${row.fg} on ${row.bg}: ${row.cr.toFixed(2)}`)
  }
})

test('텍스트 최저는 danger solid 위의 흰 글자다 — 단일 on-solid 토큰의 근거', () => {
  const text = report().filter((r) => r.kind === 'text')
  const min = text.reduce((a, b) => (a.cr < b.cr ? a : b))
  assert.equal(min.fg, 'fg.on-solid')
  assert.equal(min.bg, 'bg.danger.solid')
  assert.equal(min.cr.toFixed(2), '4.80')
})
