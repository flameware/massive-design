import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

import { buildAll, loadSources } from '../scripts/build.mjs'
import { lintCss } from '../scripts/lint.mjs'
import { report, wcag } from '../scripts/contrast.mjs'
import { flatten } from '../scripts/lib/resolve.mjs'

const sources = loadSources()
const files = buildAll(sources)
const css = files.get('tokens.css')

/** @theme에 등록된 semantic 색 이름들 — 역할 접두사를 뗀 유틸리티 이름이다. */
const registeredColorNames = () => {
  const theme = css.match(/@theme inline \{([\s\S]*?)\n\}/)[1]
  return [...theme.matchAll(/^\s*--(?:background|text|border)-color-([\w-]+):/gm)].map((m) => m[1])
}

/** 규칙군 C를 임의의 CSS에 걸어 본다 — lint가 실제로 무는지 확인하는 통로. */
const errorsFor = (text) => {
  const out = []
  lintCss(text, (msg) => out.push(msg))
  return out
}

// ── 출력물 모양 ─────────────────────────────────────────────────────────────

test('빌드는 다섯 파일만 낸다 — Figma 산출물은 #277에서 사라졌고, ramp.js·ramp.d.ts는 #281이 더했다', () => {
  assert.deepEqual(
    [...files.keys()],
    ['tokens.css', 'tokens.js', 'tokens.d.ts', 'ramp.js', 'ramp.d.ts'],
  )
})

test('tokens.d.ts가 선언한 값에는 tokens.js의 구현이 있다', () => {
  // 예전에는 `declare const`만 있고 짝이 되는 .js가 없었다. 게시 전에는 아무도
  // 부르지 않아 드러나지 않는 종류의 거짓말이다 — 소비처에서는 타입 검사를
  // 통과하고 런타임에서 터진다 (#278)
  const declared = [...files.get('tokens.d.ts').matchAll(/^export declare const (\w+)/gm)].map((m) => m[1])
  const implemented = [...files.get('tokens.js').matchAll(/^export const (\w+)/gm)].map((m) => m[1])
  assert.ok(declared.length > 0)
  assert.deepEqual(declared.sort(), implemented.sort())
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

test('@theme의 semantic 색은 역할별 이름 공간에 산다 — 이름이 겹치지 않는다', () => {
  const theme = css.match(/@theme inline \{([\s\S]*?)\n\}/)[1]
  const colors = [...theme.matchAll(/^\s*--((?:background|text|border)-color)-([\w-]+): var\((--ds-[\w-]+)\);/gm)]
  assert.ok(colors.length > 0)

  // 역할이 접두사다. 하나의 --color-*에 담았다면 fg.default/border.default처럼
  // 세 쌍이 같은 이름이 됐을 것이고, 그 충돌은 조용하다
  const roleOf = { '--ds-bg-': 'background-color', '--ds-fg-': 'text-color', '--ds-border-': 'border-color' }
  for (const [, namespace, , dsVar] of colors) {
    const prefix = Object.keys(roleOf).find((p) => dsVar.startsWith(p))
    assert.equal(namespace, roleOf[prefix], dsVar)
  }

  // 팔레트는 @theme에 절대 오지 않는다 (#7) — lint C10과 같은 규칙을 출력물에서 다시 잰다
  assert.ok(!theme.includes('--ds-palette-'))
})

test('@theme의 색 이름은 semantic의 bg·fg·border 리프와 정확히 같다 — 훑기이지 임의 목록이 아니다 (#280)', () => {
  const registered = registeredColorNames().sort()

  // semantic/color.json의 bg·fg·border 리프 전부가 register 대상이어야 한다.
  // #278까지는 Button이 쓰는 8개만 열었다(success·warning·inverse·scrim은
  // 일부러 뺐다) — #280부터는 Foundations 챕터가 전체 팔레트를 보여줘야 하므로
  // 뺀 이름이 없어야 한다
  const semanticNames = [...flatten(sources.semantic)]
    .map(([path]) => path.replace(/^color\./, ''))
    .filter((path) => /^(?:bg|fg|border)\./.test(path))
    .map((path) => path.split('.').slice(1).join('-'))
    .sort()

  assert.deepEqual(registered, semanticNames)
  for (const name of ['success-solid', 'warning-solid', 'inverse', 'scrim']) {
    assert.ok(registered.includes(name), name)
  }
})

test('README가 말하는 유틸 수가 @theme의 실제 등록 수와 같다 (#321)', () => {
  // README는 한때 36개라고 적었지만 등록된 것은 35개였다 — semantic 색 토큰은 36개가
  // 맞고, 그중 state.layer가 색 유틸이 아니어서 빠진다. 수를 손으로 적은 자리는 README
  // 한 곳뿐이고, 그 한 곳이 출력물과 어긋나지 않게 여기서 묶는다
  const readme = readFileSync(new URL('../README.md', import.meta.url), 'utf8')
  const claim = `지금 ${registeredColorNames().length}개`
  assert.ok(readme.includes(claim), `README가 "${claim}"라고 말하지 않는다`)

  // 빠지는 하나가 정말 state.layer인가 — README가 이름으로 말하는 예외다
  const unregistered = [...flatten(sources.semantic)]
    .map(([path]) => path.replace(/^color\./, ''))
    .filter((path) => !/^(?:bg|fg|border)\./.test(path))
  assert.deepEqual(unregistered, ['state.layer'])
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
  assert.equal(count('export type SemanticColorToken'), 42)   // #143 border.knockout + #337 muted 다섯 + #335 border.subtle
  assert.equal(count('export type PaletteToken'), 126)   // 램프 120 + 리터럴 6(#335의 alpha.white.05 추가)
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
