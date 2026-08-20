/**
 * tokens/** → dist/figma/01..06.js
 *
 * `use_figma`의 `code` 파라미터에 **그대로** 들어가는 JS를 낸다. flat JSON만 내고
 * 주입할 때 에이전트가 코드를 새로 쓰는 방식은 택하지 않았다 — 그러면 주입할
 * 때마다 다른 코드가 돌고, #10에서 한 번 뚫은 순서를 다음 주입 때 다시 뚫어야
 * 한다(build-pipeline.md §5).
 *
 * 파일명 번호가 곧 실행 순서이고, 각 파일은 **별도 호출**이다. 쪼개는 이유는
 * 성능이 아니라 실패 시 재실행 범위를 좁히기 위해서다.
 *
 * ⚠️ 조사 뼈대(#4)는 01이 돌려준 컬렉션 ID를 다음 단계에 **문자열 리터럴로**
 * 박으라고 적었다. 정적 산출물에는 그 길이 없다 — 빌드 시점에 알 수 없는 값이다.
 * 그래서 **모든 파일이 컬렉션·모드를 이름으로 다시 조회한다.** 이름 조회는 어차피
 * 멱등성의 근간이므로(§2.1) 층이 하나 늘어나는 게 아니라 같은 층을 재사용한다.
 */
import { flatten } from '../resolve.mjs'

/** `code` 파라미터 상한(#4). 넘으면 빌드 타임에 드러난다 — 런타임이 아니라. */
export const CODE_LIMIT = 50_000

const COLOR_SCOPES = ['FRAME_FILL', 'SHAPE_FILL', 'TEXT_FILL', 'STROKE_COLOR']

/** DTCG 경로 → Figma 변수명. `palette.`/`color.` 접두는 컬렉션이 이미 말한다. */
export const figmaName = (path) => path.replace(/^(palette|color)\./, '').replace(/\./g, '/')

const json = (value) => JSON.stringify(value)

/** 행 하나에 튜플 하나. 들여쓴 JSON은 표를 세로로 늘려 읽을 수 없게 만든다. */
const table = (rows) => `[\n${rows.map((r) => `  ${JSON.stringify(r)},`).join('\n')}\n]`

// 이름으로 조회해 있으면 갱신, 없으면 생성. 모든 파일이 이 머리말을 공유한다.
const PRELUDE = `
async function upsertCollection(name) {
  const all = await figma.variables.getLocalVariableCollectionsAsync()
  const hit = all.filter((c) => c.name === name)
  // 중복 컬렉션명은 조용히 허용된다 — 조기에 시끄럽게 드러낸다 (#4)
  if (hit.length > 1) throw new Error('중복 컬렉션: ' + name + ' × ' + hit.length)
  return hit[0] ?? figma.variables.createVariableCollection(name)
}

function upsertMode(col, name) {
  const hit = col.modes.find((m) => m.name === name)
  if (hit) return hit.modeId
  // 새 컬렉션은 항상 "Mode 1" 하나로 시작한다. 첫 모드가 곧 기본 모드이고
  // defaultModeId에는 setter가 없다 (#10)
  if (col.modes.length === 1 && col.modes[0].name === 'Mode 1') {
    col.renameMode(col.modes[0].modeId, name)
    return col.modes[0].modeId
  }
  return col.addMode(name)
}

async function indexVariables(col) {
  const vars = await Promise.all(
    col.variableIds.map((id) => figma.variables.getVariableByIdAsync(id)))
  return new Map(vars.filter(Boolean).map((v) => [v.name, v]))
}

function upsertVariable(index, col, name, type) {
  const existing = index.get(name)
  if (existing) {
    if (existing.resolvedType === type) return existing
    existing.remove()   // resolvedType은 사후 변경 불가 — 재생성이 유일한 길
  }
  const v = figma.variables.createVariable(name, col, type)
  index.set(name, v)
  return v
}

function hexToRgba(hex) {
  const h = hex.replace('#', '')
  return {
    r: parseInt(h.slice(0, 2), 16) / 255,
    g: parseInt(h.slice(2, 4), 16) / 255,
    b: parseInt(h.slice(4, 6), 16) / 255,
    a: h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1,
  }
}
`.trim()

const header = (n, title) =>
  `// ⚙ 생성물 — scripts/build.mjs. 손대지 말 것.\n` +
  `// ${n} — ${title}\n` +
  `// use_figma의 code 파라미터에 그대로 넣는다. IIFE로 감싸지 말 것 — 이미 async 컨텍스트다.\n`

// ── 01 컬렉션 ───────────────────────────────────────────────────────────────

function emit01() {
  return `${header('01', '컬렉션·모드')}
${PRELUDE}

const palette = await upsertCollection('palette')
const semantic = await upsertCollection('semantic')

// Light를 **먼저** 만든다. 첫 모드가 기본 모드이고 바꿀 수단이 없다 (#10)
const paletteValue = upsertMode(palette, 'Value')
const light = upsertMode(semantic, 'Light')
const dark = upsertMode(semantic, 'Dark')

return {
  palette: { id: palette.id, modes: palette.modes.map((m) => m.name) },
  semantic: { id: semantic.id, modes: semantic.modes.map((m) => m.name) },
}
`
}

// ── 02 palette 색 ───────────────────────────────────────────────────────────

function emit02({ gen, literal }) {
  const colors = [...flatten(gen), ...flatten(literal)]
    .map(([path, token]) => [figmaName(path), token.$value, `var(--ds-${path.replace(/\./g, '-')})`])

  return `${header('02', `palette 색 ${colors.length}개`)}
${PRELUDE}

// [figma 이름, hex, WEB code syntax]
const COLORS = ${table(colors)}

const col = await upsertCollection('palette')
const mode = upsertMode(col, 'Value')
const index = await indexVariables(col)

for (const [name, hex, syntax] of COLORS) {
  const v = upsertVariable(index, col, name, 'COLOR')
  v.scopes = ${json(COLOR_SCOPES)}
  // primitive를 Tailwind @theme에 등록하지 않는 결정(#7)의 Figma 쪽 대응물
  v.hiddenFromPublishing = true
  v.setValueForMode(mode, hexToRgba(hex))
  v.setVariableCodeSyntax('WEB', syntax)
}

return { count: COLORS.length, collection: col.id }
`
}

// ── 03 palette 스케일 ───────────────────────────────────────────────────────

/**
 * Figma로 나가는 비색상. CSS와 **서로 다른 부분집합**이고 그건 매체 차이다
 * (scale-tokens.md §3.2) — space 프리셋 13은 Figma 전용이고, borderWidth·
 * duration·opacity는 CSS 출력이 없다.
 *
 * `key`는 **코드 쪽에서 이 변수를 부르는 이름**이고 번역표 ②가 그걸 쓴다
 * (figma-components.md §8). 여기서 같이 내는 이유는 짝을 아는 자리가 여기뿐이기
 * 때문이다 — 대부분은 scale.json의 점 경로지만 셋이 그렇지 않다: line-height는
 * 사이즈 × tier로 **파생**돼 점 경로가 없고(CSS 변수 이름으로 부른다), family는
 * `--font-sans`, `borderWidth.1`은 kebab으로 갈린다. 저쪽에서 다시 지으면 그게
 * 세 번째 사본이다.
 *
 * @returns {{key: string, name: string, type: string, value: unknown, scopes: string[]}[]}
 */
export function scaleVariables(scale) {
  const out = []
  const push = (key, name, type, value, scopes) => out.push({ key, name, type, value, scopes })
  const px = (token) => token.$extensions['design.massive.px']

  for (const [name, token] of entries(scale.type.size)) {
    push(`type.size.${name}`, `type/size/${name}`, 'FLOAT', px(token), ['FONT_SIZE'])
  }
  // 비율이 아니라 px. setBoundVariable('lineHeight')가 단위를 PIXELS로 강제
  // 변환하므로 빌드가 곱해 낸다 (#10 · scale-tokens.md §2.5)
  for (const [name, token] of entries(scale.type.size)) {
    const tier = token.$extensions['design.massive.typeTier']
    // 점 경로가 없다 — 매니페스트도 `--text-sm--line-height`로 부른다
    push(`--text-${name}--line-height`, `type/line-height/${name}`, 'FLOAT',
      round(px(token) * scale.type.lineHeight[tier].$value), ['LINE_HEIGHT'])
  }
  // STRING 변수 — 로컬 폰트를 못 보는 실행 컨텍스트 우회 (#9)
  for (const [name, token] of entries(scale.type.family)) {
    push(`--font-${name}`, `type/family/${name}`, 'STRING',
      token.$extensions['design.massive.figmaFamily'], ['FONT_FAMILY'])
  }
  for (const [name, token] of entries(scale.space)) {
    if (name === 'base') continue   // --spacing은 코드 전용(cssOnly)
    push(`space.${name}`, `space/${name}`, 'FLOAT', px(token), ['GAP', 'WIDTH_HEIGHT'])
  }
  for (const [name, token] of entries(scale.radius)) {
    if (name === 'base') continue   // shadcn이 직접 참조하는 CSS 변수. 피커에 낼 값이 아니다
    push(`radius.${name}`, `radius/${name}`, 'FLOAT', px(token), ['CORNER_RADIUS'])
  }
  for (const [name, token] of entries(scale.borderWidth)) {
    push(`borderWidth.${name}`, `border-width/${name}`, 'FLOAT', px(token), ['STROKE_FLOAT'])
  }
  // duration에 대응하는 VariableScope가 없다. ALL_SCOPES는 모든 피커를
  // 오염시키므로(#4) 빈 배열로 둔다 — 값은 살아 있고 피커에만 안 뜬다
  for (const [name, token] of entries(scale.duration)) {
    push(`duration.${name}`, `duration/${name}`, 'FLOAT', parseFloat(token.$value), [])
  }
  for (const [name, group] of entries(scale.state)) {
    push(`state.${name}.opacity`, `opacity/${name}`, 'FLOAT', group.opacity.$value, ['OPACITY'])
  }
  return out
}

function emit03({ scale }) {
  // 주입 스크립트에는 Figma 쪽 넷만 간다 — `key`는 번역표 ②의 것이다
  const vars = scaleVariables(scale).map((v) => [v.name, v.type, v.value, v.scopes])
  return `${header('03', `palette 스케일 ${vars.length}개`)}
${PRELUDE}

// [이름, 타입, 값, scopes] — scopes는 항상 명시한다. 기본값 ALL_SCOPES는
// 모든 속성 피커를 오염시킨다 (#4)
const SCALE = ${table(vars)}

const col = await upsertCollection('palette')
const mode = upsertMode(col, 'Value')
const index = await indexVariables(col)

// hiddenFromPublishing을 걸지 않는다. 02에서 복사돼 온 줄이었고 #7의 과적용이다
// — #7이 Tailwind @theme에서 뺀 것은 primitive **색**뿐이고 --spacing·--radius-md·
// --text-sm은 등록돼 있어 컴포넌트가 매일 집어 쓴다. 코드에서 공개인 것을 Figma에서만
// 숨기면 디자이너가 피커에서 집을 수 없다 (#41)
for (const [name, type, value, scopes] of SCALE) {
  const v = upsertVariable(index, col, name, type)
  v.scopes = scopes
  // 이미 숨겨진 채로 주입된 파일을 되돌린다 — 플래그는 멱등이어야 한다
  v.hiddenFromPublishing = false
  v.setValueForMode(mode, value)
}

return { count: SCALE.length, collection: col.id }
`
}

// ── 04 semantic ─────────────────────────────────────────────────────────────

function emit04({ semantic }) {
  const map = [...flatten(semantic)].map(([path, token]) => {
    const dark = token.$extensions?.['org.primer.overrides']?.dark ?? token.$value
    return [
      figmaName(path),
      figmaName(strip(token.$value)),
      figmaName(strip(dark)),
      `var(--ds-${path.replace(/^color\./, '').replace(/\./g, '-')})`,
    ]
  })

  return `${header('04', `semantic ${map.length}개 × 2모드`)}
${PRELUDE}

// [semantic 이름, light가 가리킬 palette 이름, dark가 가리킬 palette 이름, code syntax]
const SEMANTIC = ${table(map)}

const paletteCol = await upsertCollection('palette')
const semanticCol = await upsertCollection('semantic')
const light = upsertMode(semanticCol, 'Light')
const dark = upsertMode(semanticCol, 'Dark')

const paletteIndex = await indexVariables(paletteCol)
const index = await indexVariables(semanticCol)

for (const [name, lightRef, darkRef, syntax] of SEMANTIC) {
  const lv = paletteIndex.get(lightRef)
  const dv = paletteIndex.get(darkRef)
  if (!lv || !dv) throw new Error('palette 누락: ' + name + ' → ' + lightRef + ' / ' + darkRef)
  const v = upsertVariable(index, semanticCol, name, 'COLOR')
  v.scopes = ${json(COLOR_SCOPES)}
  // 크로스 컬렉션 alias — 프로브로 동작 확인됨 (#4)
  v.setValueForMode(light, { type: 'VARIABLE_ALIAS', id: lv.id })
  v.setValueForMode(dark, { type: 'VARIABLE_ALIAS', id: dv.id })
  v.setVariableCodeSyntax('WEB', syntax)
}

return { count: SEMANTIC.length, collection: semanticCol.id }
`
}

// ── 05 Text Style ───────────────────────────────────────────────────────────

function emit05({ scale }) {
  const styles = entries(scale.type.size).map(([name, token]) => {
    const tier = token.$extensions['design.massive.typeTier']
    const size = token.$extensions['design.massive.px']
    return [
      name,
      size,
      round(size * scale.type.lineHeight[tier].$value),
      emToPercent(scale.type.tracking[tier].$value),
    ]
  })

  return `${header('05', `Text Style ${styles.length}개`)}
// 순서가 곧 제약이다 (#10 · docs/agents/figma-injection.md §2.3):
// 리터럴 → fontSize·lineHeight 바인딩 → **마지막에** fontFamily 바인딩.
// fontFamily 바인딩이 스타일을 폰트 잠금 상태로 만들어 그 뒤로는 lineHeight
// 재기록도 막힌다.

// [이름, fontSize, lineHeight px, letterSpacing %]
const STYLES = ${table(styles)}

// 부트스트랩용 폰트. 실제 패밀리는 STRING 변수 바인딩으로 들어간다 (#9)
await figma.loadFontAsync({ family: 'Inter', style: 'Regular' })

const paletteCol = (await figma.variables.getLocalVariableCollectionsAsync())
  .find((c) => c.name === 'palette')
if (!paletteCol) throw new Error('palette 컬렉션이 없다 — 01을 먼저 실행할 것')

const vars = new Map(
  (await Promise.all(paletteCol.variableIds.map((id) => figma.variables.getVariableByIdAsync(id))))
    .filter(Boolean).map((v) => [v.name, v]))

const famVar = vars.get('type/family/sans')
if (!famVar) throw new Error('type/family/sans가 없다 — 03을 먼저 실행할 것')

const existing = new Map((await figma.getLocalTextStylesAsync()).map((s) => [s.name, s]))
const touched = []

for (const [name, size, lineHeight, tracking] of STYLES) {
  const ts = existing.get(name) ?? figma.createTextStyle()
  ts.name = name
  ts.fontName = { family: 'Inter', style: 'Regular' }
  ts.fontSize = size
  ts.lineHeight = { unit: 'PIXELS', value: lineHeight }        // 맨 숫자는 throw
  ts.letterSpacing = { unit: 'PERCENT', value: tracking }
  ts.setBoundVariable('fontSize', vars.get('type/size/' + name))
  ts.setBoundVariable('lineHeight', vars.get('type/line-height/' + name))

  // 런타임이 처음 보는 (family, style) 쌍은 첫 시도가 반드시 throw한다.
  // atomic 롤백은 파일 상태만 되돌리므로 face 등록은 살아남는다 — 재시도 없이는
  // 콜드 파일에서 100% 실패한다 (#10)
  let bound = false
  for (let attempt = 1; attempt <= 3 && !bound; attempt++) {
    try {
      ts.setBoundVariable('fontFamily', famVar)
      bound = true
    } catch (e) {
      if (attempt === 3) throw e
    }
  }
  touched.push(name)
}

return { count: touched.length, styles: touched }
`
}

// ── 06 Effect Style ─────────────────────────────────────────────────────────

function emit06({ scale }) {
  const shadows = entries(scale.shadow).map(([name, token]) => [
    `shadow/${name}`,
    token.$value.map((l) => ({
      x: parseFloat(l.offsetX), y: parseFloat(l.offsetY),
      radius: parseFloat(l.blur), spread: parseFloat(l.spread), alpha: l.alpha,
    })),
  ])

  return `${header('06', `Effect Style ${shadows.length}개`)}
// 그림자 색은 변수화하지 않고 리터럴 RGBA로 둔다 — 단계마다 알파가 달라
// 변수화하면 그림자 밖에서 쓸 일 없는 색 primitive가 5개 는다 (scale-tokens.md §5.3).
// 라이트/다크 한 벌이다. 다크 elevation은 그림자가 아니라 border가 표현한다.

// [이름, 레이어들]
const SHADOWS = ${table(shadows)}

const existing = new Map((await figma.getLocalEffectStylesAsync()).map((s) => [s.name, s]))
const touched = []

for (const [name, layers] of SHADOWS) {
  const es = existing.get(name) ?? figma.createEffectStyle()
  es.name = name
  // effects는 read-only 배열이라 통째로 재할당한다 (#4)
  es.effects = layers.map((l) => ({
    type: 'DROP_SHADOW',
    color: { r: 0, g: 0, b: 0, a: l.alpha },
    offset: { x: l.x, y: l.y },
    radius: l.radius,
    spread: l.spread,
    visible: true,
    blendMode: 'NORMAL',
  }))
  touched.push(name)
}

return { count: touched.length, styles: touched }
`
}

// ── ─────────────────────────────────────────────────────────────────────────

export function emitFigma(sources) {
  return {
    '01-collections.js': emit01(),
    '02-palette-color.js': emit02(sources),
    '03-palette-scale.js': emit03(sources),
    '04-semantic.js': emit04(sources),
    '05-text-styles.js': emit05(sources),
    '06-effect-styles.js': emit06(sources),
  }
}

const entries = (group) => Object.entries(group).filter(([k]) => !k.startsWith('$'))
const strip = (ref) => ref.replace(/^\{|\}$/g, '')
const emToPercent = (em) => Math.round(parseFloat(em) * 100)
/** FLOAT는 float32라 22.4가 22.399999618530273로 돌아온다. 비교는 반올림 후에. */
const round = (n) => Math.round(n * 100) / 100
