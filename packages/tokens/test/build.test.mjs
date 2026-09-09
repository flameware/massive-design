import assert from 'node:assert/strict'
import { test } from 'node:test'

import { buildAll, loadSources } from '../scripts/build.mjs'
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

test('빌드는 두 파일만 낸다 — Figma 산출물은 #277에서 사라졌다', () => {
  assert.deepEqual([...files.keys()], ['tokens.css', 'tokens.d.ts'])
})

test('블록 순서가 참조 체인 순서다 — palette → semantic → .dark → @theme', () => {
  const at = (needle) => css.indexOf(needle)
  assert.ok(at('@custom-variant dark') < at('--ds-palette-brand-light-1'))
  assert.ok(at('--ds-palette-brand-light-1') < at('--ds-bg-canvas'))
  assert.ok(at('--ds-bg-canvas') < at('.dark {'))
  assert.ok(at('.dark {') < at('@theme inline {'))
})

test('.dark는 semantic 전부를 빠짐없이 재선언하고 그것만 재선언한다', () => {
  const dark = css.match(/\n\.dark \{([\s\S]*?)\n\}/)[1]
  const decls = [...dark.matchAll(/^\s*(--[\w-]+):/gm)].map((m) => m[1])
  const semanticCount = flatten(sources.semantic).size
  assert.equal(decls.length, semanticCount)
  assert.ok(decls.every((d) => d.startsWith('--ds-')))
})

test('alias 층이 없다 — :root와 .dark는 --ds-*만 선언한다 (ADR-0023 §3, #277)', () => {
  // 1세대 alias(`--background`, `--primary` …)는 :root/.dark에 --ds-* 아닌 선언으로
  // 살았다. 이름 목록을 얼리지 않고 모양으로 잰다 — 목록은 태그 v1-shadcn에 있다
  for (const selector of [':root', '\\.dark']) {
    const body = css.match(new RegExp(`(?:^|\\n)${selector}\\s*\\{([\\s\\S]*?)\\n\\}`))[1]
    const foreign = [...body.matchAll(/^\s*(--[\w-]+)\s*:/gm)].map((m) => m[1])
      .filter((n) => !n.startsWith('--ds-'))
    assert.deepEqual(foreign, [], selector)
  }
  assert.ok(!css.includes('shadcn'))
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

test('base 규칙이 semantic 변수를 직접 칠한다 — 페이지 배경·글자·테두리·outline', () => {
  const base = css.slice(css.indexOf('@layer base'))
  assert.match(base, /\*\s*\{\s*border-color: var\(--ds-border-default\);\s*outline-color: var\(--ds-border-focus\);/)
  assert.match(base, /body\s*\{\s*background-color: var\(--ds-bg-canvas\);\s*color: var\(--ds-fg-default\);/)
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

test('C14 — @custom-variant dark의 형태를 잡는다', () => {
  assert.ok(errorsFor('@custom-variant dark (&:is(.dark *));').some((e) => e.startsWith('C14')))
})

test('C15 — base 규칙이 빠지거나 다른 변수를 읽으면 잡는다', () => {
  assert.ok(errorsFor(css.replace('background-color: var(--ds-bg-canvas)', 'background-color: var(--background)'))
    .some((e) => e.startsWith('C15')))
})

test('빌드한 CSS는 규칙군 C를 통과한다', () => {
  assert.deepEqual(errorsFor(css), [])
})

// ── 타입 ────────────────────────────────────────────────────────────────────

test('타입 union의 개수가 회계와 맞는다', () => {
  const types = files.get('tokens.d.ts')
  const count = (header) => {
    const lines = types.slice(types.indexOf(header)).split('\n').slice(1)
    const end = lines.findIndex((l) => !l.startsWith('  | '))
    return end === -1 ? lines.length : end
  }
  assert.equal(count('export type SemanticColorToken'), 36)   // #143이 border.knockout을 더했다
  assert.equal(count('export type PaletteToken'), 125)   // 램프 120 + 리터럴 5
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
