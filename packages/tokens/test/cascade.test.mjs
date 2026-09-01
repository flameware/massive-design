/**
 * 중첩 서브트리에서 `.dark`가 실제로 뒤집는가 — #35의 회귀 게이트.
 *
 * 나머지 게이트가 전부 **문자열 diff**라 이 결함을 통째로 놓쳤다. 출력은 내내
 * 정상으로 보였다: `.dark`가 `--ds-*` 30개를 덮고 있었으니 diff에 이상이 없다.
 * 틀린 것은 문자열이 아니라 **치환이 일어나는 요소**였다 — 그래서 여기서는
 * CSS 커스텀 속성의 계산 규칙을 아주 작게 흉내 내어 값을 실제로 풀어 본다.
 *
 * 규칙 하나가 전부다: `var()`는 **그 선언이 붙은 요소에서** 풀리고, 자손은 이미
 * 확정된 값을 상속한다. `:root`의 `--background: var(--ds-bg-canvas)`가 :root에서
 * 라이트로 확정되므로, 자손 `.dark`가 `--ds-bg-canvas`만 덮어서는 `--background`가
 * 바뀌지 않는다. `.dark`가 `<html>`에 붙으면 `:root`와 같은 요소라 우연히 맞는다.
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'

import { buildAll, loadSources } from '../scripts/build.mjs'

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

  const resolve = (name) => {
    if (!decls.has(name)) return inherited.get(name)
    assert.ok(!seen.has(name), `${name}: 순환 참조`)
    seen.add(name)
    const value = decls.get(name).replace(/var\((--[\w-]+)\)/g, (_, ref) => resolve(ref) ?? '')
    seen.delete(name)
    return value
  }

  for (const name of decls.keys()) out.set(name, resolve(name))
  return out
}

const root = block(css, ':root')
const dark = block(css, '\\.dark')

const light = computed(root)                    // <html>
const rootDark = computed(dark, computed(root)) // <html class="dark"> — :root와 같은 요소
const nestedDark = computed(dark, light)        // <html> > <div class="dark">

// ── ──────────────────────────────────────────────────────────────────────────

test('.dark는 어디에 붙어도 같은 값을 낸다 — 루트든 중첩 서브트리든', () => {
  const drifted = [...root.keys()].filter((name) => nestedDark.get(name) !== rootDark.get(name))
  assert.deepEqual(drifted, [])
})

test('중첩 .dark에서 alias 원본 전부가 루트 다크와 같은 값이 된다', () => {
  const alias = [...root.keys()].filter((n) => !n.startsWith('--ds-') && n !== '--radius')
  const expected = Object.keys(sources.shadcn)
    .filter((name) => !name.startsWith('$') && name !== 'radius').length
  assert.equal(alias.length, expected)
  for (const name of alias) assert.equal(nestedDark.get(name), rootDark.get(name), name)

  // 모드별 alias 값이 갈리는 전량을 감시한다. #82의 warning은 solid와 전용 검정
  // 전경이 모드 공통이고, soft/text가 모드별로 갈린다. #143의 knockout은 bg.canvas를
  // 그대로 따라가므로 canvas와 같이 갈린다 — 그것이 이 토큰의 정의다.
  const flips = alias.filter((n) => rootDark.get(n) !== light.get(n))
  assert.equal(flips.length, 35)
  for (const name of flips) assert.notEqual(nestedDark.get(name), light.get(name), name)
})

test('엇갈림이 없다 — state layer와 그것이 얹히는 면이 같은 모드다', () => {
  // 결함의 최악 증상: 층은 뒤집히고 배경은 안 뒤집혀 밝은 면 위에 흰 층이 얹혔다
  assert.equal(nestedDark.get('--ds-state-layer'), rootDark.get('--ds-state-layer'))
  assert.equal(nestedDark.get('--secondary'), rootDark.get('--secondary'))
})

test('계산기가 진짜로 무는가 — alias 재선언을 걷어내면 실패한다', () => {
  // 이 테스트가 없으면 위 셋은 "계산기가 아무것도 안 해도 통과"할 수 있다
  const broken = new Map([...dark].filter(([name]) => name.startsWith('--ds-')))
  const brokenNested = computed(broken, light)
  assert.equal(brokenNested.get('--ds-bg-canvas'), rootDark.get('--ds-bg-canvas'))
  assert.equal(brokenNested.get('--background'), light.get('--background'))
})

test('모드 무관인 것은 .dark에 없다 — --radius', () => {
  assert.ok(root.has('--radius'))
  assert.ok(!dark.has('--radius'))
})
