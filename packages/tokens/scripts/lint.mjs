/**
 * 3개 규칙군 — 램프(A) · 계층·네이밍(B) · 출력물(C).
 * 규칙 번호는 docs/tokens/build-pipeline.md §4.3과 1:1로 대응한다.
 *
 * 별도 도구를 쓰지 않는다. A·B는 JSON을 읽는 평범한 JS, C는 dist/tokens.css에
 * 대한 정규식·괄호 스캔이다. 규칙 10·11은 **Stylelint가 원래 모르는 도메인
 * 규칙**이라 어차피 직접 써야 한다. 규칙 13(alias 표 존재)은 alias 층과 함께
 * #277에서 사라졌다.
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
  //    #143이 border.knockout을 더했다 — 겹친 요소를 가르려고 뒤 면을 되그리는
  //    테두리다. 값은 bg.canvas와 같지만 계열이 달라야 했다(1세대 매니페스트
  //    게이트가 border-color에 --ds-bg-*가 오는 것을 물었다). 근거는 ADR-0007.
  //    #337이 bg.<family>.muted 다섯을 더했다 — 면으로 읽혀야 하는 채움 단계.
  if (semanticTokens.size !== 41) {
    err(`B8 semantic 색 토큰이 ${semanticTokens.size}개다 — 41이어야 한다`)
  }

  lintSameValue(semanticTokens, err)
}

/**
 * 16. **이름이 값보다 많은 상태는 선언되어야 한다** ([#337](https://github.com/flameware/massive-design/issues/337)).
 *
 * 같은 **계열** 안에서 두 이름이 한 팔레트 단계를 가리키면, 소비처는 이름 수만큼
 * 역할이 있다고 읽고 둘 사이를 오가는 변경을 무해한 리팩터로 착각한다 — 실제로
 * 소비처가 `bg-inset` → `bg-subtle`을 "트랙을 한 단계 내렸다"고 믿었고, 그 변경은
 * 아무것도 하지 않았다. 그래서 동일값 자체는 막지 않되 **선언을 강제한다**:
 * `$extensions["design.massive.sameValue"]`가 같은 값을 갖는 형제 전부를 적어야 한다.
 *
 * **계열이 다르면 면제한다.** `bg.neutral.solid`와 `border.strong`이 둘 다 neutral
 * 9인 것은 정상이고(CONTEXT.md 「계열」), 소비는 값이 아니라 역할을 따른다 —
 * `border.knockout`이 값으로 `bg.canvas`와 같은 것도 ADR-0007이 의도한 바다.
 * 착각이 생기는 자리는 **한 계열 안에서 서로 갈아 끼울 수 있어 보이는 이름들**이다.
 *
 * 선언은 **정확히 일치**해야 한다 — 빠지면 소비처가 속고, 남으면 이미 갈라진
 * 값에 대한 낡은 경고가 남는다. 둘 다 이 규칙이 없애려는 것이다.
 */
export function lintSameValue(semanticTokens, err) {
  const strip = (path) => path.replace(/^color\./, '')
  const channel = (path) => strip(path).split('.')[0]

  /** 실제로 관측된 동일값 형제 — 모드 합집합. */
  const observed = new Map([...semanticTokens.keys()].map((p) => [p, new Set()]))
  for (const mode of MODES) {
    const byValue = new Map()
    for (const [path, token] of semanticTokens) {
      const value = valueFor(token, mode)
      const key = `${channel(path)}::${isRef(value) ? refPath(value) : value}`
      if (!byValue.has(key)) byValue.set(key, [])
      byValue.get(key).push(path)
    }
    for (const group of byValue.values()) {
      if (group.length < 2) continue
      for (const path of group) {
        for (const other of group) if (other !== path) observed.get(path).add(strip(other))
      }
    }
  }

  for (const [path, token] of semanticTokens) {
    const declared = new Set(token.$extensions?.['design.massive.sameValue'] ?? [])
    const actual = observed.get(path)
    const missing = [...actual].filter((n) => !declared.has(n)).sort()
    const stale = [...declared].filter((n) => !actual.has(n)).sort()
    if (missing.length) {
      err(`B16 ${path}: ${missing.join(' · ')}와 값이 같은데 design.massive.sameValue에 없다 — ` +
        '이름이 값보다 많은 상태는 선언되어야 한다')
    }
    if (stale.length) {
      err(`B16 ${path}: design.massive.sameValue의 ${stale.join(' · ')}는 더 이상 같은 값이 아니다 — 선언을 지울 것`)
    }
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

  // 14. @custom-variant dark의 형태. &:is(.dark *)는 토글 자신을 놓친다
  if (!/@custom-variant\s+dark\s*\(&:where\(\.dark,\s*\.dark \*\)\);/.test(css)) {
    err('C14 @custom-variant dark가 &:where(.dark, .dark *) 형태가 아니다')
  }

  // 15. base 규칙 (#36). 없으면 preflight의 `border: 0 solid`가 남아
  //     `border` 유틸리티가 currentColor로 그려진다 — 다크에서 거의 흰 테두리다.
  //     #35의 "규칙군 C는 전부 문자열 스캔이라 결함이 통과했다"가 여기엔 안 걸린다:
  //     그때는 선언이 멀쩡했고 치환이 틀렸지만, 여기서는 규칙 자체가 없는 것이
  //     결함이다. 없는 문자열을 찾는 데는 문자열 스캔이 정확히 맞는 도구다.
  //     두 규칙이다. body 줄이 없으면 --ds-fg-default가 정상 해석되는데 아무도
  //     칠하지 않아 다크에서 UA 기본 검정 글자가 된다.
  for (const [selector, expected] of [
    ['\\*', [['border-color', '--ds-border-default'], ['outline-color', '--ds-border-focus']]],
    ['body', [['background-color', '--ds-bg-canvas'], ['color', '--ds-fg-default']]],
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
