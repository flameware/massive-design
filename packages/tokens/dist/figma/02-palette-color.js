// ⚙ 생성물 — scripts/build.mjs. 손대지 말 것.
// 02 — palette 색 125개
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

// [figma 이름, hex, WEB code syntax]
const COLORS = [
  ["brand/light/1","#fcfdfd","var(--ds-palette-brand-light-1)"],
  ["brand/light/2","#f7f8fa","var(--ds-palette-brand-light-2)"],
  ["brand/light/3","#eaeef4","var(--ds-palette-brand-light-3)"],
  ["brand/light/4","#dae2ef","var(--ds-palette-brand-light-4)"],
  ["brand/light/5","#cad8ef","var(--ds-palette-brand-light-5)"],
  ["brand/light/6","#c2d4f2","var(--ds-palette-brand-light-6)"],
  ["brand/light/7","#97b8f2","var(--ds-palette-brand-light-7)"],
  ["brand/light/8","#4581f1","var(--ds-palette-brand-light-8)"],
  ["brand/light/9","#0f5fed","var(--ds-palette-brand-light-9)"],
  ["brand/light/10","#1553c6","var(--ds-palette-brand-light-10)"],
  ["brand/light/11","#0f3a8b","var(--ds-palette-brand-light-11)"],
  ["brand/light/12","#0d2e6c","var(--ds-palette-brand-light-12)"],
  ["brand/dark/1","#070c17","var(--ds-palette-brand-dark-1)"],
  ["brand/dark/2","#0a1527","var(--ds-palette-brand-dark-2)"],
  ["brand/dark/3","#0d1d3b","var(--ds-palette-brand-dark-3)"],
  ["brand/dark/4","#0c2451","var(--ds-palette-brand-dark-4)"],
  ["brand/dark/5","#0c3278","var(--ds-palette-brand-dark-5)"],
  ["brand/dark/6","#073891","var(--ds-palette-brand-dark-6)"],
  ["brand/dark/7","#0541ab","var(--ds-palette-brand-dark-7)"],
  ["brand/dark/8","#0d55d4","var(--ds-palette-brand-dark-8)"],
  ["brand/dark/9","#0f5fed","var(--ds-palette-brand-dark-9)"],
  ["brand/dark/10","#5989e2","var(--ds-palette-brand-dark-10)"],
  ["brand/dark/11","#b4c8ea","var(--ds-palette-brand-dark-11)"],
  ["brand/dark/12","#e2e8f3","var(--ds-palette-brand-dark-12)"],
  ["neutral/light/1","#fdfdfd","var(--ds-palette-neutral-light-1)"],
  ["neutral/light/2","#f8f8f8","var(--ds-palette-neutral-light-2)"],
  ["neutral/light/3","#eeeeee","var(--ds-palette-neutral-light-3)"],
  ["neutral/light/4","#e1e1e1","var(--ds-palette-neutral-light-4)"],
  ["neutral/light/5","#d7d7d7","var(--ds-palette-neutral-light-5)"],
  ["neutral/light/6","#d2d2d2","var(--ds-palette-neutral-light-6)"],
  ["neutral/light/7","#b8b8b8","var(--ds-palette-neutral-light-7)"],
  ["neutral/light/8","#8a8a8a","var(--ds-palette-neutral-light-8)"],
  ["neutral/light/9","#727272","var(--ds-palette-neutral-light-9)"],
  ["neutral/light/10","#616161","var(--ds-palette-neutral-light-10)"],
  ["neutral/light/11","#424242","var(--ds-palette-neutral-light-11)"],
  ["neutral/light/12","#333333","var(--ds-palette-neutral-light-12)"],
  ["neutral/dark/1","#0c0c0c","var(--ds-palette-neutral-dark-1)"],
  ["neutral/dark/2","#151515","var(--ds-palette-neutral-dark-2)"],
  ["neutral/dark/3","#1e1e1e","var(--ds-palette-neutral-dark-3)"],
  ["neutral/dark/4","#272727","var(--ds-palette-neutral-dark-4)"],
  ["neutral/dark/5","#373737","var(--ds-palette-neutral-dark-5)"],
  ["neutral/dark/6","#414141","var(--ds-palette-neutral-dark-6)"],
  ["neutral/dark/7","#4d4d4d","var(--ds-palette-neutral-dark-7)"],
  ["neutral/dark/8","#656565","var(--ds-palette-neutral-dark-8)"],
  ["neutral/dark/9","#727272","var(--ds-palette-neutral-dark-9)"],
  ["neutral/dark/10","#8f8f8f","var(--ds-palette-neutral-dark-10)"],
  ["neutral/dark/11","#c8c8c8","var(--ds-palette-neutral-dark-11)"],
  ["neutral/dark/12","#e8e8e8","var(--ds-palette-neutral-dark-12)"],
  ["danger/light/1","#fdfdfc","var(--ds-palette-danger-light-1)"],
  ["danger/light/2","#faf8f7","var(--ds-palette-danger-light-2)"],
  ["danger/light/3","#f4eceb","var(--ds-palette-danger-light-3)"],
  ["danger/light/4","#f0dcda","var(--ds-palette-danger-light-4)"],
  ["danger/light/5","#efceca","var(--ds-palette-danger-light-5)"],
  ["danger/light/6","#f3c6c2","var(--ds-palette-danger-light-6)"],
  ["danger/light/7","#f3a29b","var(--ds-palette-danger-light-7)"],
  ["danger/light/8","#f34c4b","var(--ds-palette-danger-light-8)"],
  ["danger/light/9","#db2931","var(--ds-palette-danger-light-9)"],
  ["danger/light/10","#b92429","var(--ds-palette-danger-light-10)"],
  ["danger/light/11","#7c191b","var(--ds-palette-danger-light-11)"],
  ["danger/light/12","#5d1515","var(--ds-palette-danger-light-12)"],
  ["danger/dark/1","#150807","var(--ds-palette-danger-dark-1)"],
  ["danger/dark/2","#230e0c","var(--ds-palette-danger-dark-2)"],
  ["danger/dark/3","#341210","var(--ds-palette-danger-dark-3)"],
  ["danger/dark/4","#461211","var(--ds-palette-danger-dark-4)"],
  ["danger/dark/5","#671416","var(--ds-palette-danger-dark-5)"],
  ["danger/dark/6","#7b0e15","var(--ds-palette-danger-dark-6)"],
  ["danger/dark/7","#960b18","var(--ds-palette-danger-dark-7)"],
  ["danger/dark/8","#c41a26","var(--ds-palette-danger-dark-8)"],
  ["danger/dark/9","#db2931","var(--ds-palette-danger-dark-9)"],
  ["danger/dark/10","#e76760","var(--ds-palette-danger-dark-10)"],
  ["danger/dark/11","#ecbdb8","var(--ds-palette-danger-dark-11)"],
  ["danger/dark/12","#f3e4e2","var(--ds-palette-danger-dark-12)"],
  ["success/light/1","#fcfdfc","var(--ds-palette-success-light-1)"],
  ["success/light/2","#f5faf5","var(--ds-palette-success-light-2)"],
  ["success/light/3","#e0f4e3","var(--ds-palette-success-light-3)"],
  ["success/light/4","#c1efc8","var(--ds-palette-success-light-4)"],
  ["success/light/5","#aee8b7","var(--ds-palette-success-light-5)"],
  ["success/light/6","#a0e7ac","var(--ds-palette-success-light-6)"],
  ["success/light/7","#7ccd8c","var(--ds-palette-success-light-7)"],
  ["success/light/8","#439c58","var(--ds-palette-success-light-8)"],
  ["success/light/9","#20823e","var(--ds-palette-success-light-9)"],
  ["success/light/10","#1c6f35","var(--ds-palette-success-light-10)"],
  ["success/light/11","#154e25","var(--ds-palette-success-light-11)"],
  ["success/light/12","#123d1d","var(--ds-palette-success-light-12)"],
  ["success/dark/1","#080e09","var(--ds-palette-success-dark-1)"],
  ["success/dark/2","#0c180f","var(--ds-palette-success-dark-2)"],
  ["success/dark/3","#102314","var(--ds-palette-success-dark-3)"],
  ["success/dark/4","#102e17","var(--ds-palette-success-dark-4)"],
  ["success/dark/5","#11431f","var(--ds-palette-success-dark-5)"],
  ["success/dark/6","#0c4f22","var(--ds-palette-success-dark-6)"],
  ["success/dark/7","#085c26","var(--ds-palette-success-dark-7)"],
  ["success/dark/8","#147534","var(--ds-palette-success-dark-8)"],
  ["success/dark/9","#20823e","var(--ds-palette-success-dark-9)"],
  ["success/dark/10","#569e65","var(--ds-palette-success-dark-10)"],
  ["success/dark/11","#9cd8a6","var(--ds-palette-success-dark-11)"],
  ["success/dark/12","#cef3d3","var(--ds-palette-success-dark-12)"],
  ["warning/light/1","#fdfdfc","var(--ds-palette-warning-light-1)"],
  ["warning/light/2","#faf8f4","var(--ds-palette-warning-light-2)"],
  ["warning/light/3","#f4eddf","var(--ds-palette-warning-light-3)"],
  ["warning/light/4","#efe0bf","var(--ds-palette-warning-light-4)"],
  ["warning/light/5","#efd499","var(--ds-palette-warning-light-5)"],
  ["warning/light/6","#f2ce7d","var(--ds-palette-warning-light-6)"],
  ["warning/light/7","#f3c65e","var(--ds-palette-warning-light-7)"],
  ["warning/light/8","#ebbb44","var(--ds-palette-warning-light-8)"],
  ["warning/light/9","#eab308","var(--ds-palette-warning-light-9)"],
  ["warning/light/10","#b7902c","var(--ds-palette-warning-light-10)"],
  ["warning/light/11","#665019","var(--ds-palette-warning-light-11)"],
  ["warning/light/12","#3f3110","var(--ds-palette-warning-light-12)"],
  ["warning/dark/1","#0e0c07","var(--ds-palette-warning-dark-1)"],
  ["warning/dark/2","#19140b","var(--ds-palette-warning-dark-2)"],
  ["warning/dark/3","#241d0e","var(--ds-palette-warning-dark-3)"],
  ["warning/dark/4","#2f250e","var(--ds-palette-warning-dark-4)"],
  ["warning/dark/5","#45350e","var(--ds-palette-warning-dark-5)"],
  ["warning/dark/6","#523e09","var(--ds-palette-warning-dark-6)"],
  ["warning/dark/7","#775a0a","var(--ds-palette-warning-dark-7)"],
  ["warning/dark/8","#be931f","var(--ds-palette-warning-dark-8)"],
  ["warning/dark/9","#eab308","var(--ds-palette-warning-dark-9)"],
  ["warning/dark/10","#edc467","var(--ds-palette-warning-dark-10)"],
  ["warning/dark/11","#f4e2ba","var(--ds-palette-warning-dark-11)"],
  ["warning/dark/12","#f8f1e2","var(--ds-palette-warning-dark-12)"],
  ["base/white","#ffffff","var(--ds-palette-base-white)"],
  ["base/black","#000000","var(--ds-palette-base-black)"],
  ["alpha/white/10","#ffffff1a","var(--ds-palette-alpha-white-10)"],
  ["alpha/white/15","#ffffff26","var(--ds-palette-alpha-white-15)"],
  ["alpha/black/50","#00000080","var(--ds-palette-alpha-black-50)"],
]

const col = await upsertCollection('palette')
const mode = upsertMode(col, 'Value')
const index = await indexVariables(col)

for (const [name, hex, syntax] of COLORS) {
  const v = upsertVariable(index, col, name, 'COLOR')
  v.scopes = ["FRAME_FILL","SHAPE_FILL","TEXT_FILL","STROKE_COLOR"]
  // primitive를 Tailwind @theme에 등록하지 않는 결정(#7)의 Figma 쪽 대응물
  v.hiddenFromPublishing = true
  v.setValueForMode(mode, hexToRgba(hex))
  v.setVariableCodeSyntax('WEB', syntax)
}

return { count: COLORS.length, collection: col.id }
