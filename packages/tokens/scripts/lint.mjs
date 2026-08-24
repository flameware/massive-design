/**
 * 3개 규칙군 — 램프(A) · 계층·네이밍(B) · 출력물(C).
 * 규칙 번호는 docs/tokens/build-pipeline.md §4.3과 1:1로 대응한다.
 *
 * 별도 도구를 쓰지 않는다. A·B는 JSON을 읽는 평범한 JS, C는 dist/tokens.css에
 * 대한 정규식·괄호 스캔이다. 규칙 10·11·13은 **Stylelint가 원래 모르는 도메인
 * 규칙**이라 어차피 직접 써야 한다.
 *
 * 규칙 10·12는 현재 구조상 위반이 불가능하다. 그래도 남긴다 — 이 lint의 값은
 * 위반을 잡는 게 아니라 **구조가 무너졌을 때 알려주는 것**이다.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { ROOT, loadSources } from './build.mjs'
import { deltaEOK, oklchToHex, toOklch } from './lib/oklch.mjs'
import { flatten, isRef, refPath, valueFor } from './lib/resolve.mjs'
import { resolveOverrides, resolveParams } from './ramp.mjs'

/**
 * alias 표가 반드시 내야 하는 이름. alias 파일에서 파생하지 않는다 —
 * 그러면 자기 자신을 검사한다.
 *
 * ⚠️ 이름이 "정본"이지만 전부 정본은 아니다: success·warning·link 묶음은
 * shadcn에 없는 우리 추가분이다(#37, #82). 그래도 여기 있는 이유는
 * 이 목록이 "shadcn이 정한 것"이 아니라 **"컴포넌트가 집을 수 있는 이름의
 * 전량"**이기 때문이다 — 빠지면 `text-link` 같은 유틸리티가 조용히 무효가 된다.
 */
const SHADCN_CANON = [
  'background', 'foreground', 'card', 'card-foreground', 'popover', 'popover-foreground',
  'primary', 'primary-foreground', 'secondary', 'secondary-foreground',
  'muted', 'muted-foreground', 'accent', 'accent-foreground',
  'destructive', 'destructive-foreground', 'border', 'input', 'ring', 'focus-contrast',
  'chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5',
  'sidebar', 'sidebar-foreground', 'sidebar-primary', 'sidebar-primary-foreground',
  'sidebar-accent', 'sidebar-accent-foreground', 'sidebar-border', 'sidebar-ring',
  'success', 'success-foreground',
  'warning', 'warning-foreground',
  'link',
]

const MODES = ['light', 'dark']

// ── A. 램프 ─────────────────────────────────────────────────────────────────

function lintRamps(gen, config, err) {
  for (const [name, family] of Object.entries(config.families)) {
    const params = resolveParams(config.defaults, family, name)
    resolveOverrides(family, name)                                   // 9. _why 누락은 여기서 throw
    const keyHex = oklchToHex(toOklch(family.key))
    const peak = Math.round((params.satPeakStep / 11) * (params.steps - 1))

    for (const mode of MODES) {
      const label = `${name}.${mode}`
      const steps = Object.entries(gen.palette[name][mode])
        .map(([step, token]) => ({ step: Number(step), hex: token.$value, ...toOklch(token.$value) }))
        .sort((a, b) => a.step - b.step)

      // 1. 인접 단계 구별성
      for (let i = 1; i < steps.length; i++) {
        const d = deltaEOK(steps[i - 1], steps[i])
        if (d < params.minStepDelta) {
          err(`A1 ${label}: step ${i}↔${i + 1} deltaEOK ${d.toFixed(4)} < ${params.minStepDelta}`)
        }
      }

      // 2. L 단조 — 방향을 램프에서 읽는다. 라이트를 하드코딩하면 다크 램프의
      //    역전을 통째로 놓친다(#6 결함 (d))
      if (!params.allowNonMonotonicL) {
        const dir = steps[0].l > steps[steps.length - 1].l ? -1 : 1
        for (let i = 1; i < steps.length; i++) {
          const d = steps[i].l - steps[i - 1].l
          if (dir < 0 ? d > 1e-4 : d < -1e-4) err(`A2 ${label}: step ${i}→${i + 1} L 단조 위반`)
        }
      }

      // 3. 전 단계가 sRGB 감마 안
      for (const s of steps) {
        if (!/^#[0-9a-f]{6}$/.test(s.hex)) err(`A3 ${label}: step ${s.step} sRGB 밖 — ${s.hex}`)
      }

      // 4. 앵커가 실제로 물렸는가
      if (steps[peak].hex !== keyHex) {
        err(`A4 ${label}: step ${peak + 1} 키 앵커 어긋남 — ${steps[peak].hex} ≠ ${keyHex}`)
      }
    }
  }
}

// ── B. 계층·네이밍 ──────────────────────────────────────────────────────────

export function lintLayers({ gen, literal, semantic }, err) {
  const semanticTokens = flatten(semantic)

  for (const [path, token] of semanticTokens) {
    for (const mode of MODES) {
      const value = valueFor(token, mode)
      // 5. semantic은 반드시 {palette.*} 참조 — 리터럴 금지
      if (!isRef(value) || !refPath(value).startsWith('palette.')) {
        err(`B5 ${path} (${mode}): {palette.*} 참조가 아니다 — ${value}`)
      }
    }
    // 7. semantic 이름에 색상명 금지. accent/danger/success/warning은 의미어라 허용
    if (/blue|red|green|gray|grey|yellow|brand/.test(path)) err(`B7 ${path}: 색상명`)
  }

  // 6. primitive는 참조 금지 — 리터럴만
  for (const [path, token] of [...flatten(gen), ...flatten(literal)]) {
    if (isRef(token.$value)) err(`B6 ${path}: primitive가 참조를 갖는다 — ${token.$value}`)
  }

  // 8. #82가 feedback용 warning soft/solid/text/on-warning 역할을 추가했다.
  if (semanticTokens.size !== 35) {
    err(`B8 semantic 색 토큰이 ${semanticTokens.size}개다 — 35여야 한다`)
  }
}

// ── C. 출력물 ───────────────────────────────────────────────────────────────

/** `@theme`/`@theme inline` 블록 본문을 괄호 짝으로 떠낸다. */
function themeBlocks(css) {
  const blocks = []
  const re = /@theme([^{]*)\{/g
  let m
  while ((m = re.exec(css))) {
    let depth = 1
    let i = re.lastIndex
    while (i < css.length && depth > 0) {
      if (css[i] === '{') depth++
      else if (css[i] === '}') depth--
      i++
    }
    blocks.push({ modifier: m[1].trim(), body: css.slice(re.lastIndex, i - 1) })
  }
  return blocks
}

export function lintCss(source, err) {
  // 주석을 먼저 걷어낸다 — 주석 안의 '@theme'을 블록으로 오인하면 규칙 11이
  // 자기 설명문을 위반으로 읽는다
  const css = source.replace(/\/\*[\s\S]*?\*\//g, '')

  for (const { modifier, body } of themeBlocks(css)) {
    // 10. @theme 안의 --ds-* (#7)
    for (const decl of body.matchAll(/(--ds-[\w-]+)\s*:/g)) {
      err(`C10 @theme 블록에 ${decl[1]}이 있다`)
    }
    // 11. inline 없는 @theme — 중첩 .dark 서브트리를 조용히 깨뜨린다 (#5)
    if (modifier !== 'inline') err(`C11 @theme에 inline이 없다 — '${modifier || '(없음)'}'`)
  }

  // 12. --color-X 와 --text-X 이름 충돌 — text-X가 색으로 해석된다 (#5)
  const named = (prefix) => new Set(
    [...css.matchAll(new RegExp(`--${prefix}-([\\w-]+?)(?:--[\\w-]+)?\\s*:`, 'g'))].map((m) => m[1]))
  for (const name of named('color')) {
    if (named('text').has(name)) err(`C12 --color-${name} 과 --text-${name} 이 충돌한다`)
  }

  // 13. alias 표의 이름이 :root에 전부 존재
  const root = css.match(/:root\s*\{([\s\S]*?)\n\}/)?.[1] ?? ''
  for (const name of SHADCN_CANON) {
    if (!new RegExp(`^\\s*--${name}\\s*:`, 'm').test(root)) err(`C13 :root에 --${name}이 없다`)
  }

  // 14. @custom-variant dark의 형태. shadcn CLI의 &:is(.dark *)는 토글 자신을 놓친다
  if (!/@custom-variant\s+dark\s*\(&:where\(\.dark,\s*\.dark \*\)\);/.test(css)) {
    err('C14 @custom-variant dark가 &:where(.dark, .dark *) 형태가 아니다')
  }

  // 15. shadcn 정본의 base 규칙 (#36). 없으면 preflight의 `border: 0 solid`가 남아
  //     `border` 유틸리티가 currentColor로 그려진다 — 다크에서 거의 흰 테두리다.
  //     #35의 "규칙군 C는 전부 문자열 스캔이라 결함이 통과했다"가 여기엔 안 걸린다:
  //     그때는 선언이 멀쩡했고 치환이 틀렸지만, 여기서는 규칙 자체가 없는 것이
  //     결함이다. 없는 문자열을 찾는 데는 문자열 스캔이 정확히 맞는 도구다.
  //     정본은 두 규칙이다. body 줄이 없으면 --foreground가 정상 해석되는데 아무도
  //     칠하지 않아 다크에서 UA 기본 검정 글자가 된다.
  for (const [selector, expected] of [
    ['\\*', [['border-color', '--border'], ['outline-color', '--ring']]],
    ['body', [['background-color', '--background'], ['color', '--foreground']]],
  ]) {
    const body = css.match(new RegExp(`@layer\\s+base\\s*\\{[\\s\\S]*?(?:^|\\n)\\s*${selector}\\s*\\{([\\s\\S]*?)\\}`))?.[1]
    if (body === undefined) { err(`C15 @layer base의 ${selector.replace('\\', '')} 규칙이 없다`); continue }
    for (const [prop, value] of expected) {
      if (!new RegExp(`(?:^|;|\\s)${prop}\\s*:\\s*var\\(${value}\\)\\s*;`).test(body)) {
        err(`C15 @layer base의 ${selector.replace('\\', '')}에 ${prop}: var(${value})가 없다`)
      }
    }
    // 불투명도를 붙이면 3:1을 못 넘는다 (semantic-tokens.md §8.2, #33)
    if (/color-mix|\/\s*\d/.test(body)) err(`C15 base의 ${selector.replace('\\', '')} 규칙이 색을 불투명도로 깎는다`)
  }
}

// ── ─────────────────────────────────────────────────────────────────────────

export function lint(root = ROOT) {
  const errors = []
  const err = (msg) => errors.push(msg)
  const sources = loadSources(root)
  const config = JSON.parse(readFileSync(join(root, 'tokens/ramp.config.json'), 'utf8'))

  lintRamps(sources.gen, config, err)
  lintLayers(sources, err)

  try {
    lintCss(readFileSync(join(root, 'dist/tokens.css'), 'utf8'), err)
  } catch (e) {
    if (e.code !== 'ENOENT') throw e
    err('C: dist/tokens.css가 없다 — tokens:build를 먼저 돌릴 것')
  }
  return errors
}

function main() {
  const errors = lint()
  for (const e of errors) console.error(`✗ ${e}`)
  if (errors.length) {
    console.error(`\nlint 실패 — ${errors.length}건`)
    process.exit(1)
  }
  console.log('lint 통과 — 램프(A) · 계층·네이밍(B) · 출력물(C)')
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main()
