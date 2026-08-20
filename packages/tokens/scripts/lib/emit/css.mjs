/**
 * tokens/** → dist/tokens.css
 *
 * 블록 순서가 곧 4계층 alias 체인이다(docs/tokens/build-pipeline.md §4.2):
 * palette → semantic → shadcn raw → @theme inline.
 *
 * 비색상은 이 파일이 **카테고리별로 명시 열거**한다. scale.json을 통째로 훑지
 * 않는 이유: CSS로 나가는 집합이 "Tailwind 기본과 다른 것"이라는 판정을 이미
 * 거친 닫힌 목록이고(scale-tokens.md §7 — 26개), 그 판정은 토큰 파일이 아니라
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

/** shadcn alias 값: 문자열이면 semantic 경로, 객체면 모드별 palette 직참조. */
function shadcnRef(value, mode) {
  return typeof value === 'string'
    ? `var(${dsVar(value)})`
    : `var(${dsVar(value[mode])})`
}

export function emitCss({ tokens, gen, literal, semantic, scale, shadcn }) {
  const paletteEntries = [...flat(gen), ...flat(literal)]
  const semanticEntries = [...flat(semantic)]
  const shadcnColors = Object.entries(shadcn)
    .filter(([k]) => !k.startsWith('$') && k !== 'radius')

  const out = []

  // Tailwind 공식형. shadcn CLI의 `&:is(.dark *)`는 토글 자신을 놓친다(#5)
  out.push('@custom-variant dark (&:where(.dark, .dark *));', '')

  out.push(':root {')
  out.push('  /* palette — devtools 추적용. @theme에 등록하지 않는다 (#7) */')
  for (const [path, token] of paletteEntries) out.push(line(dsVar(path), token.$value))

  out.push('', '  /* semantic 30 — 라이트. 모드 전환은 이 계층에서만 일어난다 */')
  for (const [path, token] of semanticEntries) {
    out.push(line(dsVar(path), `var(${dsVar(ref(token.$value))})`))
  }

  out.push('', '  /* shadcn raw 34 — 반드시 실제 선언. color-mix 경로가 직접 읽는다 (#5) */')
  for (const [name, value] of shadcnColors) out.push(line(`--${name}`, shadcnRef(value, 'light')))
  out.push(line('--radius', tokens.get('radius.base').$value))
  out.push('}', '')

  // semantic 30 + chart 5. chart만 palette를 직참조하므로 함께 재선언해야 한다(#16)
  out.push('.dark {')
  for (const [path, token] of semanticEntries) {
    const dark = token.$extensions?.['org.primer.overrides']?.dark ?? token.$value
    out.push(line(dsVar(path), `var(${dsVar(ref(dark))})`))
  }
  for (const [name, value] of shadcnColors.filter(([, v]) => typeof v === 'object')) {
    out.push(line(`--${name}`, shadcnRef(value, 'dark')))
  }
  out.push('}', '')

  out.push('@theme inline {')
  out.push('  /* 색 — shadcn 이름만. --ds-* 는 여기 절대 들어가지 않는다 (#7) */')
  for (const [name] of shadcnColors) out.push(line(`--color-${name}`, `var(--${name})`))

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

  out.push('', '  /* radius — shadcn CLI의 곱셈 7단, 빌드 시점 선계산 */')
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

  return `${out.join('\n')}\n`
}

// ── 내부 ────────────────────────────────────────────────────────────────────

const REF = /^\{([^}]+)\}$/
const ref = (value) => value.match(REF)[1]

/** 출력 순서 = 파일 순서. flatten이 삽입 순서를 유지하는 Map을 준다. */
const flat = (doc) => flatten(doc)
