/* 게시물의 모양. tokens는 코드가 아니라 **CSS 한 장과 타입**이라 서브패스가
 * 조용히 어긋나기 쉽다 — `exports`가 가리키는 파일이 `files`에 없으면 설치는
 * 되고 import만 실패한다. ui의 스모크와 같은 자리에 선다(#278). */
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'

const root = fileURLToPath(new URL('..', import.meta.url))
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))

test('exports가 가리키는 파일이 전부 실재한다', () => {
  const targets = Object.entries(pkg.exports).flatMap(([subpath, target]) =>
    typeof target === 'string'
      ? [[subpath, target]]
      : Object.values(target).map((t) => [subpath, t])
  )
  for (const [subpath, target] of targets) {
    if (target.includes('*')) continue // 와일드카드는 파일 하나가 아니다
    assert.ok(existsSync(join(root, target)), `${subpath} → ${target}이 없다`)
  }
})

test('게시되는 것은 dist와 README뿐이다 — 스크립트와 원본 토큰은 소비처 몫이 아니다', () => {
  assert.deepEqual(pkg.files, ['dist', 'README.md'])
  // culori는 dist/ramp.js가 런타임에 필요로 한다(#281) — `./ramp`를 import하지
  // 않는 소비처는 번들에 물지 않는다(트리셰이킹), apca-w3는 병기용이라 여전히
  // devDependency다 — 바닥값은 패키징이 정한다(ADR-0017)
  assert.deepEqual(Object.keys(pkg.dependencies), ['culori'])
})

test('루트 서브패스는 타입과 런타임을 함께 낸다 — 선언만 있고 구현이 없지 않다', async () => {
  assert.deepEqual(Object.keys(pkg.exports['.']).sort(), ['default', 'types'])
  const mod = await import(pkg.name)
  const dts = readFileSync(join(root, pkg.exports['.'].types), 'utf8')
  const declared = [...dts.matchAll(/^export declare const (\w+)/gm)].map((m) => m[1])
  for (const name of declared) {
    assert.ok(mod[name] !== undefined, `${name}은 선언만 있고 구현이 없다`)
  }
})

test('./ramp 서브패스는 타입과 런타임을 함께 낸다 — 공개 표면 넷뿐이다(#281·#398)', async () => {
  assert.deepEqual(Object.keys(pkg.exports['./ramp']).sort(), ['default', 'types'])
  const mod = await import(`${pkg.name}/ramp`)
  assert.deepEqual(
    Object.keys(mod).sort(),
    ['contrastRatio', 'createBrandOverride', 'createRamp', 'rampToCssVariables'],
  )

  const dts = readFileSync(join(root, pkg.exports['./ramp'].types), 'utf8')
  const declaredFns = [...dts.matchAll(/^export declare function (\w+)/gm)].map((m) => m[1])
  for (const name of declaredFns) {
    assert.equal(typeof mod[name], 'function', `${name}은 선언만 있고 구현이 없다`)
  }
})

test('dist/ramp.js는 apca-w3를 물지 않는다 — 병기 대비는 소비처 바닥값이 아니다', async () => {
  const js = readFileSync(join(root, 'dist/ramp.js'), 'utf8')
  assert.ok(!/from ['"]apca-w3['"]/.test(js))
  assert.match(js, /from 'culori'/)
})
