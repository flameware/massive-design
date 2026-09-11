/**
 * 차트 계열색 규약(#334) — README `## 차트 계열색`이 적은 수를 지킨다.
 *
 * DS는 차트 토큰도 컴포넌트도 갖지 않는다(ADR-0017 §2). 소비처에 주는 것은
 * **단계 선택 규칙과 대비 하한**뿐이라, 그 규약이 사는 곳은 문서다. 문서의 수는
 * 램프 config가 바뀌면 조용히 낡으므로, 여기서 같은 산출물(`dist/ramp.js` ·
 * `dist/tokens.css`)로 다시 재서 문서와 대조한다 — 하한 미달과 문서 표류를
 * 같은 테스트가 잡는다.
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const { contrastRatio } = await import(new URL('../dist/ramp.js', import.meta.url))
const { createRamp } = await import(new URL('../dist/ramp.js', import.meta.url))

const { composite, srgb } = await import(new URL('../scripts/lib/wcag.mjs', import.meta.url))

const README = readFileSync(new URL('../README.md', import.meta.url), 'utf8')
const CSS = readFileSync(new URL('../dist/tokens.css', import.meta.url), 'utf8')

/** 규약이 고르는 단계 — 계열 1은 양 모드 9, 계열 2는 라이트 7 · 다크 6. */
const SERIES = { 1: { light: 9, dark: 9 }, 2: { light: 7, dark: 6 } }
/** 하한 — README `### 기준`. */
const FLOOR = { surface: 1.5, between: 1.9 }
const MODES = ['light', 'dark']

const palette = (family, mode, step) => {
  const m = CSS.match(new RegExp(`--ds-palette-${family}-${mode}-${step}: (#[0-9a-f]{6})`))
  assert.ok(m, `--ds-palette-${family}-${mode}-${step}가 생성물에 없다`)
  return m[1]
}
/** semantic 면 — `bg.surface`는 라이트 neutral 1, 다크 neutral 2다. */
const surface = (mode) => palette('neutral', mode, mode === 'light' ? 1 : 2)
const series = (n, mode) => palette('brand', mode, SERIES[n][mode])
const ratio = (a, b) => Number(contrastRatio(a, b).toFixed(2))

test('계열 1은 bg-accent-solid 그 자체다 — 소비처가 브랜드를 다시 파생시키지 않는다', () => {
  for (const mode of MODES) {
    const accent = CSS.match(
      new RegExp(`--ds-bg-accent-solid: var\\(--ds-palette-brand-${mode}-(\\d+)\\)`),
    )
    assert.ok(accent, `${mode}의 bg-accent-solid가 brand 팔레트를 가리키지 않는다`)
    assert.equal(Number(accent[1]), SERIES[1][mode])
  }
})

test('규약대로 뽑은 계열이 두 하한을 넘는다', () => {
  for (const mode of MODES) {
    const [c1, c2] = [series(1, mode), series(2, mode)]
    assert.ok(ratio(c2, surface(mode)) >= FLOOR.surface, `${mode} 계열 2 ↔ 면`)
    assert.ok(ratio(c1, surface(mode)) >= FLOOR.surface, `${mode} 계열 1 ↔ 면`)
    assert.ok(ratio(c1, c2) >= FLOOR.between, `${mode} 계열 1 ↔ 계열 2`)
  }
})

test('README의 실측표가 지금 값과 같다 — 문서가 낡으면 여기서 깨진다', () => {
  const rows = {
    light: ['규약 · 라이트', '#97b8f2'],
    dark: ['규약 · 다크', '#073891'],
  }
  for (const mode of MODES) {
    const [label, hex] = rows[mode]
    assert.equal(series(2, mode), hex, `${mode} 계열 2의 값`)
    const row = `| ${label} | \`${hex}\` | ${ratio(series(2, mode), surface(mode)).toFixed(2)} | ${ratio(series(1, mode), series(2, mode)).toFixed(2)} |`
    assert.ok(README.includes(row), `README에 없는 행: ${row}`)
  }
  // 면 값도 문서가 적는다 — 배경이 바뀌면 위 네 수의 의미가 바뀐다.
  assert.ok(README.includes(`라이트 \`${surface('light')}\` · 다크 \`${surface('dark')}\``))
})

test('계열 2는 계열 1보다 면 쪽이고, 그 방향에 3:1인 단계가 없다', () => {
  for (const mode of MODES) {
    assert.ok(SERIES[2][mode] < SERIES[1][mode], `${mode} 계열 2가 면 쪽이 아니다`)
    const c1 = series(1, mode)
    const bg = surface(mode)
    // 면 쪽(step < 9)에서 계열 1과 3:1을 넘는 단계는 전부 면과 붙어 보이지 않는다.
    const both = []
    for (let step = 1; step < SERIES[1][mode]; step += 1) {
      const hex = palette('brand', mode, step)
      if (ratio(c1, hex) >= 3 && ratio(hex, bg) >= FLOOR.surface) both.push(step)
    }
    assert.deepEqual(both, [], `${mode}에 이 단계가 생기면 하한을 3:1로 올릴 수 있다 — 문서를 고쳐야 한다`)
  }
  // 문서가 드는 두 근거 수치.
  assert.ok(README.includes('brand 6이 3.61 · **1.48**'))
  assert.ok(README.includes('brand 3이 3.09 · 1.09'))
})

test('밝은 키에서는 같은 단계 규칙이 무너진다 — README의 warning 반례가 참이다', () => {
  const warning = createRamp('warning', { key: '#eab308' })
  const pair = ratio(warning.light[8].hex, warning.light[SERIES[2].light - 1].hex)
  assert.ok(pair < FLOOR.between, '반례가 아니게 되면 문서의 경고를 고쳐야 한다')
  assert.ok(README.includes(`**${pair.toFixed(2)}**`), `README의 반례 수치가 ${pair}가 아니다`)
})

test('1.5:1 하한이 딛는 테두리 실측이 지금도 문서와 같다', () => {
  // 라이트는 불투명 팔레트, 다크는 흰 알파라 면 위에 합성해서 잰다
  // (scripts/contrast.mjs와 같은 경로).
  const light = (name) => {
    const m = CSS.match(new RegExp(`--ds-border-${name}: var\\(--ds-palette-neutral-light-(\\d+)\\)`))
    assert.ok(m, `라이트 border.${name}`)
    return ratio(palette('neutral', 'light', m[1]), surface('light'))
  }
  const dark = (name) => {
    const m = CSS.match(new RegExp(`--ds-border-${name}: var\\(--ds-palette-alpha-white-(\\d+)\\)`))
    assert.ok(m, `다크 border.${name}`)
    const bg = srgb(surface('dark'))
    const over = composite({ ...srgb('#ffffff'), a: Number(m[1]) / 100 }, bg)
    const hex = `#${[over.r, over.g, over.b].map((c) => c.toString(16).padStart(2, '0')).join('')}`
    return ratio(hex, surface('dark'))
  }
  const cited = `\`border.default\`(라이트 ${light('default').toFixed(2)} · 다크 ${dark('default').toFixed(2)})에서 \`border.field\`(라이트 ${light('field').toFixed(2)} · 다크 ${dark('field').toFixed(2)})`
  assert.ok(README.includes(cited), `README에 없는 근거: ${cited}`)
})
