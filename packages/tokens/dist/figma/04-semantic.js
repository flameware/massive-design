// ⚙ 생성물 — scripts/build.mjs. 손대지 말 것.
// 04 — semantic 30개 × 2모드
// use_figma의 code 파라미터에 그대로 넣는다. IIFE로 감싸지 말 것 — 이미 async 컨텍스트다.

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

// [semantic 이름, light가 가리킬 palette 이름, dark가 가리킬 palette 이름, code syntax]
const SEMANTIC = [
  ["bg/canvas","neutral/light/2","neutral/dark/1","var(--ds-bg-canvas)"],
  ["bg/surface","neutral/light/1","neutral/dark/2","var(--ds-bg-surface)"],
  ["bg/subtle","neutral/light/3","neutral/dark/3","var(--ds-bg-subtle)"],
  ["bg/inset","neutral/light/3","neutral/dark/3","var(--ds-bg-inset)"],
  ["bg/overlay","neutral/light/1","neutral/dark/3","var(--ds-bg-overlay)"],
  ["bg/neutral/soft","neutral/light/3","neutral/dark/3","var(--ds-bg-neutral-soft)"],
  ["bg/neutral/solid","neutral/light/9","neutral/dark/9","var(--ds-bg-neutral-solid)"],
  ["bg/accent/soft","brand/light/3","brand/dark/3","var(--ds-bg-accent-soft)"],
  ["bg/accent/solid","brand/light/9","brand/dark/9","var(--ds-bg-accent-solid)"],
  ["bg/danger/soft","danger/light/3","danger/dark/3","var(--ds-bg-danger-soft)"],
  ["bg/danger/solid","danger/light/9","danger/dark/9","var(--ds-bg-danger-solid)"],
  ["bg/success/soft","success/light/3","success/dark/3","var(--ds-bg-success-soft)"],
  ["bg/success/solid","success/light/9","success/dark/9","var(--ds-bg-success-solid)"],
  ["bg/inverse","neutral/light/12","neutral/dark/12","var(--ds-bg-inverse)"],
  ["bg/scrim","alpha/black/50","alpha/black/50","var(--ds-bg-scrim)"],
  ["fg/default","neutral/light/12","neutral/dark/12","var(--ds-fg-default)"],
  ["fg/muted","neutral/light/10","neutral/dark/10","var(--ds-fg-muted)"],
  ["fg/on-solid","base/white","base/white","var(--ds-fg-on-solid)"],
  ["fg/on-inverse","neutral/light/1","neutral/dark/1","var(--ds-fg-on-inverse)"],
  ["fg/accent","brand/light/10","brand/dark/10","var(--ds-fg-accent)"],
  ["fg/danger","danger/light/10","danger/dark/10","var(--ds-fg-danger)"],
  ["fg/success","success/light/10","success/dark/10","var(--ds-fg-success)"],
  ["fg/link","brand/light/10","brand/dark/10","var(--ds-fg-link)"],
  ["border/default","neutral/light/6","alpha/white/10","var(--ds-border-default)"],
  ["border/field","neutral/light/7","alpha/white/15","var(--ds-border-field)"],
  ["border/strong","neutral/light/9","neutral/dark/9","var(--ds-border-strong)"],
  ["border/accent","brand/light/9","brand/dark/9","var(--ds-border-accent)"],
  ["border/danger","danger/light/9","danger/dark/9","var(--ds-border-danger)"],
  ["border/focus","brand/light/9","brand/dark/9","var(--ds-border-focus)"],
  ["state/layer","base/black","base/white","var(--ds-state-layer)"],
]

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
  v.scopes = ["FRAME_FILL","SHAPE_FILL","TEXT_FILL","STROKE_COLOR"]
  // 크로스 컬렉션 alias — 프로브로 동작 확인됨 (#4)
  v.setValueForMode(light, { type: 'VARIABLE_ALIAS', id: lv.id })
  v.setValueForMode(dark, { type: 'VARIABLE_ALIAS', id: dv.id })
  v.setVariableCodeSyntax('WEB', syntax)
}

return { count: SEMANTIC.length, collection: semanticCol.id }
