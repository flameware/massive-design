/**
 * 중첩 서브트리에서 `.dark`가 실제로 뒤집는가 — #35의 회귀 게이트.
 *
 * 나머지 게이트가 전부 **문자열 diff**라 이 결함을 통째로 놓쳤다. 틀린 것은
 * 문자열이 아니라 **치환이 일어나는 요소**였다 — 그래서 여기서는 CSS 커스텀
 * 속성의 계산 규칙을 아주 작게 흉내 내어 값을 실제로 풀어 본다.
 *
 * 규칙 하나가 전부다: `var()`는 **그 선언이 붙은 요소에서** 풀리고, 자손은 이미
 * 확정된 값을 상속한다. 그래서 `.dark`는 semantic을 **통째로** 재선언해야 한다 —
 * 일부만 덮으면 나머지는 `:root`에서 라이트로 확정된 값을 상속한다.
 * 1세대에는 alias 층이 하나 더 있어 같은 규칙이 두 번 걸렸다(#277에서 삭제).
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'

import { buildAll, loadSources } from '../scripts/build.mjs'
import { resolve } from '../scripts/lib/resolve.mjs'
import { dsVar } from '../scripts/lib/emit/css.mjs'

const sources = loadSources()
const css = buildAll(sources).get('tokens.css')

// ── 아주 작은 커스텀 속성 계산기 ────────────────────────────────────────────

/** 최상위 `<selector> { … }` 블록의 선언을 이름→값 Map으로 떠낸다. */
function block(source, selector) {
  const text = source.replace(/\/\*[\s\S]*?\*\//g, '')
  const body = text.match(new RegExp(`(?:^|\\n)${selector}\\s*\\{([\\s\\S]*?)\\n\\}`))
  assert.ok(body, `${selector} 블록이 없다`)
  return new Map([...body[1].matchAll(/^\s*(--[\w-]+)\s*:\s*([^;]+);/gm)]
    .map((m) => [m[1], m[2].trim()]))
}

/**
 * 요소 하나의 계산된 커스텀 속성. `decls`는 이 요소에 붙은 선언, `inherited`는
 * 부모의 **계산된** 값들. 선언된 것만 여기서 풀고, 나머지는 상속을 그대로 쓴다.
 */
function computed(decls, inherited = new Map()) {
  const out = new Map(inherited)
  const seen = new Set()

  const resolveVar = (name) => {
    if (!decls.has(name)) return inherited.get(name)
    assert.ok(!seen.has(name), `${name}: 순환 참조`)
    seen.add(name)
    const value = decls.get(name).replace(/var\((--[\w-]+)\)/g, (_, ref) => resolveVar(ref) ?? '')
    seen.delete(name)
    return value
  }

  for (const name of decls.keys()) out.set(name, resolveVar(name))
  return out
}

const root = block(css, ':root')
const dark = block(css, '\\.dark')

const light = computed(root)                    // <html>
const rootDark = computed(dark, computed(root)) // <html class="dark"> — :root와 같은 요소
const nestedDark = computed(dark, light)        // <html> > <div class="dark">

const semanticPaths = [...sources.tokens.keys()].filter((p) => p.startsWith('color.'))

// ── ──────────────────────────────────────────────────────────────────────────

test('.dark는 어디에 붙어도 같은 값을 낸다 — 루트든 중첩 서브트리든', () => {
  const drifted = [...root.keys()].filter((name) => nestedDark.get(name) !== rootDark.get(name))
  assert.deepEqual(drifted, [])
})

test('계산된 값이 원본 해석과 같다 — 두 모드 전부, semantic 전량', () => {
  for (const path of semanticPaths) {
    const name = dsVar(path)
    assert.equal(light.get(name), resolve(sources.tokens, path, 'light').value, `${name} light`)
    assert.equal(nestedDark.get(name), resolve(sources.tokens, path, 'dark').value, `${name} dark`)
  }
})

test('모드가 갈리는 토큰은 중첩 .dark에서도 전부 뒤집힌다', () => {
  // 갈리는 전량을 원본에서 센다 — 수를 문서에 얼리지 않는다
  const flips = semanticPaths.filter((p) =>
    resolve(sources.tokens, p, 'light').value !== resolve(sources.tokens, p, 'dark').value)
  assert.ok(flips.length > 0)
  for (const path of flips) {
    const name = dsVar(path)
    assert.notEqual(nestedDark.get(name), light.get(name), name)
  }
})

test('엇갈림이 없다 — state layer와 그것이 얹히는 면이 같은 모드다', () => {
  // 결함의 최악 증상: 층은 뒤집히고 배경은 안 뒤집혀 밝은 면 위에 흰 층이 얹혔다
  assert.equal(nestedDark.get('--ds-state-layer'), rootDark.get('--ds-state-layer'))
  assert.equal(nestedDark.get('--ds-bg-neutral-soft'), rootDark.get('--ds-bg-neutral-soft'))
})

test('계산기가 진짜로 무는가 — 재선언 하나를 걷어내면 그 값은 라이트에 남는다', () => {
  // 이 테스트가 없으면 위 넷은 "계산기가 아무것도 안 해도 통과"할 수 있다
  const broken = new Map([...dark].filter(([name]) => name !== '--ds-bg-canvas'))
  const brokenNested = computed(broken, light)
  assert.equal(brokenNested.get('--ds-bg-canvas'), light.get('--ds-bg-canvas'))
  assert.notEqual(brokenNested.get('--ds-bg-canvas'), rootDark.get('--ds-bg-canvas'))
})
