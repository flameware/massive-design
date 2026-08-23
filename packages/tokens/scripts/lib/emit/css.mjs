/**
 * tokens/** → dist/tokens.css
 *
 * 블록 순서가 곧 4계층 alias 체인이다(docs/tokens/build-pipeline.md §4.2):
 * palette → semantic → shadcn raw → @theme inline.
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

  out.push('', '  /* semantic — 라이트. 모드 전환은 이 계층에서만 일어난다 */')
  for (const [path, token] of semanticEntries) {
    out.push(line(dsVar(path), `var(${dsVar(ref(token.$value))})`))
  }

  out.push('', '  /* shadcn raw — 반드시 실제 선언. color-mix 경로가 직접 읽는다 (#5).')
  out.push('     .dark가 한 벌 더 선언한다 — 여기서 치환이 끝나기 때문 (#35) */')
  for (const [name, value] of shadcnColors) out.push(line(`--${name}`, shadcnRef(value, 'light')))
  out.push(line('--radius', tokens.get('radius.base').$value))
  out.push('}', '')

  // semantic + shadcn raw. **alias도 통째로 다시 선언한다** — 커스텀
  // 속성은 선언된 그 요소에서 치환되므로, :root의 `--background: var(--ds-bg-canvas)`
  // 는 :root에서 라이트로 확정되고 자손은 그 확정된 값을 상속한다. 중첩 서브트리의
  // .dark가 --ds-*만 덮으면 alias는 라이트에 남고, --ds-*를 직접 읽는 state layer만
  // 뒤집혀 **밝은 배경 위의 흰 층**이 나온다. .dark가 <html>에 붙을 때만 우연히
  // 맞았던 것이다(#35). --radius는 모드 무관이라 뺀다.
  out.push('.dark {')
  for (const [path, token] of semanticEntries) {
    const dark = token.$extensions?.['org.primer.overrides']?.dark ?? token.$value
    out.push(line(dsVar(path), `var(${dsVar(ref(dark))})`))
  }
  out.push('')
  for (const [name, value] of shadcnColors) out.push(line(`--${name}`, shadcnRef(value, 'dark')))
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

  // shadcn 정본 globals.css의 마지막 블록은 변수가 아니라 **규칙**이다. 이게 없으면
  // Tailwind preflight의 `border: 0 solid`가 남아 `border` 유틸리티의 테두리 색이
  // currentColor — 즉 글자색 — 가 된다. 라이트에서는 거의 검정이라 "진한 테두리"로
  // 보여 눈에 안 띄지만 다크에서는 거의 흰 테두리가 된다 (#36).
  //
  // 이 파일이 갖는 이유: 리포 밖 소비처는 dist/tokens.css **하나만** 복사해 간다
  // (build-pipeline.md §6). packages/ui가 들면 소비처에서 결함이 그대로 재현된다.
  // "토큰 패키지는 변수만 낸다"는 선은 1행의 @custom-variant가 이미 한 번 넘었다.
  //
  // @apply가 아니라 평문인 이유: 나머지 250여 줄이 전부 평문 선언이고, @apply는
  // Tailwind 진입점 밖에서 하드 에러가 나지만 평문은 그냥 동작한다. @theme inline
  // 덕에 계산값은 정본과 동일하다.
  //
  // outline-ring/50이 아니라 outline-ring인 이유: /50은 어떤 면·어떤 모드에서도
  // 3:1을 못 넘는다(최대 2.36) — "상태 테두리는 토큰을 불투명도 없이 칠한다"
  // (semantic-tokens.md §8.2, #33). 이 규칙이 닿는 것은 shadcn 밖의 맨 <a>·<input>
  // 뿐이다 — button.tsx는 outline-none + focus-visible:ring-*을 들고 있다.
  out.push('')
  out.push('/* shadcn 정본의 base 규칙. 변수가 아니라 규칙이라 #17이 놓쳤다 (#36) */')
  out.push('@layer base {')
  out.push('  * {')
  out.push('    border-color: var(--border);')
  out.push('    outline-color: var(--ring);')
  out.push('  }')
  out.push('')
  // 정본의 둘째 줄. 이게 없으면 --foreground가 정상 해석되는데 아무도 칠하지
  // 않는다 — 다크에서 #0c0c0c 위 UA 기본 검정 글자가 된다(브라우저 실측, #36).
  // 위의 * 규칙과 달리 이건 페이지를 **칠하므로** 소비처의 body 배경·글자색이
  // 이 파일을 복사하는 순간 우리 것이 된다. shadcn 정본이 하는 그대로다.
  out.push('  body {')
  out.push('    background-color: var(--background);')
  out.push('    color: var(--foreground);')
  out.push('  }')
  out.push('}')

  return `${out.join('\n')}\n`
}

// ── 내부 ────────────────────────────────────────────────────────────────────

const REF = /^\{([^}]+)\}$/
const ref = (value) => value.match(REF)[1]

/** 출력 순서 = 파일 순서. flatten이 삽입 순서를 유지하는 Map을 준다. */
const flat = (doc) => flatten(doc)
