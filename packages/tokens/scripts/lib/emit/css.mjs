/**
 * tokens/** → dist/tokens.css
 *
 * 블록 순서가 곧 참조 체인이다: palette → semantic(:root 라이트 · .dark 다크) →
 * @theme inline(비색상). 2세대는 alias 층이 없다 — 1세대의 shadcn 이름 층은
 * #277에서 삭제됐다(ADR-0023 §3). semantic 색을 Tailwind `@theme`에 등록하는
 * 일은 #280의 몫이다 — 그때까지 `@theme inline`에는 비색상만 산다.
 *
 * 비색상은 이 파일이 **카테고리별로 명시 열거**한다. scale.json을 통째로 훑지
 * 않는 이유: CSS로 나가는 집합이 "Tailwind 기본과 다른 것"이라는 판정을 이미
 * 거친 닫힌 목록이고(scale-tokens.md §7), 그 판정은 토큰 파일이 아니라
 * 이 표에 산다. 훑기로 바꾸면 easing 2개처럼 "값이 같아서 안 내보내는" 것들이
 * 조용히 출력에 끼어든다.
 */

import { flatten } from '../resolve.mjs'

/** DTCG 경로 → CSS 변수명. `color.` 세그먼트는 탈락한다(semantic-tokens.md §1). */
export const dsVar = (path) => `--ds-${path.replace(/^color\./, '').replace(/\./g, '-')}`

const line = (name, value) => `  ${name}: ${value};`

/** `0px` → `0`, `0.05` → `.05`. Tailwind v4 정본 그림자 표기와 같은 모양. */
const trimZero = (s) => (s === '0px' ? '0' : s)
const alpha = (a) => String(a).replace(/^0\./, '.')

function shadowValue(layers) {
  return layers
    .map((l) => `${trimZero(l.offsetX)} ${trimZero(l.offsetY)} ${trimZero(l.blur)} ` +
      `${trimZero(l.spread)} rgb(0 0 0 / ${alpha(l.alpha)})`)
    .join(', ')
}

export function emitCss({ gen, literal, semantic, scale }) {
  const paletteEntries = [...flat(gen), ...flat(literal)]
  const semanticEntries = [...flat(semantic)]

  const out = []

  // Tailwind 공식형. `&:is(.dark *)`는 토글 자신을 놓친다(#5)
  out.push('@custom-variant dark (&:where(.dark, .dark *));', '')

  out.push(':root {')
  out.push('  /* palette — devtools 추적용. @theme에 등록하지 않는다 (#7) */')
  for (const [path, token] of paletteEntries) out.push(line(dsVar(path), token.$value))

  out.push('', '  /* semantic — 라이트. 모드 전환은 이 계층에서만 일어난다 */')
  for (const [path, token] of semanticEntries) {
    out.push(line(dsVar(path), `var(${dsVar(ref(token.$value))})`))
  }
  out.push('}', '')

  // semantic을 **통째로 다시 선언한다** — 커스텀 속성은 선언된 그 요소에서
  // 치환되므로, 중첩 서브트리의 .dark가 일부만 덮으면 나머지는 라이트에 남는다(#35).
  out.push('.dark {')
  for (const [path, token] of semanticEntries) {
    const dark = token.$extensions?.['org.primer.overrides']?.dark ?? token.$value
    out.push(line(dsVar(path), `var(${dsVar(ref(dark))})`))
  }
  out.push('}', '')

  out.push('@theme inline {')
  out.push('  /* 색 — 아직 없다. semantic 이름의 @theme 등록은 #280. --ds-* 는 여기 절대 들어가지 않는다 (#7) */')

  out.push('', '  /* 타이포 — 사이즈 사다리는 Tailwind 기본과 같아 덮지 않는다 */')
  out.push(line('--font-sans', scale.type.family.sans.$value))
  for (const [name, token] of Object.entries(scale.type.size)) {
    if (name.startsWith('$')) continue
    const tier = token.$extensions['design.massive.typeTier']
    out.push(line(`--text-${name}--line-height`, scale.type.lineHeight[tier].$value))
  }
  for (const [name, token] of Object.entries(scale.type.size)) {
    if (name.startsWith('$')) continue
    const tier = token.$extensions['design.massive.typeTier']
    const tracking = scale.type.tracking[tier].$value
    if (tracking !== '0em') out.push(line(`--text-${name}--letter-spacing`, tracking))
  }

  out.push('', '  /* space — 이름 붙은 단계는 0개. 배수 하나가 전부 동적 생성한다 */')
  out.push(line('--spacing', scale.space.base.$value))

  out.push('', '  /* radius — base × 배수 7단, 빌드 시점 선계산 */')
  for (const [name, token] of Object.entries(scale.radius)) {
    if (name.startsWith('$') || name === 'base') continue
    out.push(line(`--radius-${name}`, token.$value))
  }

  out.push('', '  /* shadow — 기하는 Tailwind v4 그대로, 알파만 우리 사다리 */')
  for (const [name, token] of Object.entries(scale.shadow)) {
    if (name.startsWith('$')) continue
    out.push(line(`--shadow-${name}`, shadowValue(token.$value)))
  }
  out.push('}')

  // 변수가 아니라 **규칙**이다. 이게 없으면 Tailwind preflight의 `border: 0 solid`가
  // 남아 `border` 유틸리티의 테두리 색이 currentColor — 즉 글자색 — 가 된다.
  // 라이트에서는 거의 검정이라 눈에 안 띄지만 다크에서는 거의 흰 테두리가 된다 (#36).
  // body 규칙이 없으면 다크에서 UA 기본 검정 글자가 된다(브라우저 실측, #36).
  //
  // 이 파일이 갖는 이유: 소비처는 dist/tokens.css **하나만** 받는다
  // (build-pipeline.md §6). 이 규칙은 페이지를 **칠하므로** 소비처의 body 배경·
  // 글자색이 이 파일을 받는 순간 우리 것이 된다.
  //
  // outline에 불투명도를 붙이지 않는 이유: /50은 어떤 면·어떤 모드에서도 3:1을
  // 못 넘는다(최대 2.36) — "상태 테두리는 토큰을 불투명도 없이 칠한다"
  // (semantic-tokens.md §8.2, #33).
  out.push('')
  out.push('/* base 규칙. 변수가 아니라 규칙이라 #17이 놓쳤다 (#36) */')
  out.push('@layer base {')
  out.push('  * {')
  out.push('    border-color: var(--ds-border-default);')
  out.push('    outline-color: var(--ds-border-focus);')
  out.push('  }')
  out.push('')
  out.push('  body {')
  out.push('    background-color: var(--ds-bg-canvas);')
  out.push('    color: var(--ds-fg-default);')
  out.push('  }')
  out.push('}')

  return `${out.join('\n')}\n`
}

// ── 내부 ────────────────────────────────────────────────────────────────────

const REF = /^\{([^}]+)\}$/
const ref = (value) => value.match(REF)[1]

/** 출력 순서 = 파일 순서. flatten이 삽입 순서를 유지하는 Map을 준다. */
const flat = (doc) => flatten(doc)
