// ⚙ 생성물 — scripts/build.mjs. 손대지 말 것.
// 07 — Foundations 색 스와치 palette 125개 + semantic 35개 × 2모드
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

// 이 프레임만 생성기가 소유한다. Foundations 페이지의 다른 수동 노드는 건드리지 않는다.
const DATA = {"palette":[{"name":"brand/light/1","hex":"#fcfdfd"},{"name":"brand/light/2","hex":"#f7f8fa"},{"name":"brand/light/3","hex":"#eaeef4"},{"name":"brand/light/4","hex":"#dae2ef"},{"name":"brand/light/5","hex":"#cad8ef"},{"name":"brand/light/6","hex":"#c2d4f2"},{"name":"brand/light/7","hex":"#97b8f2"},{"name":"brand/light/8","hex":"#4581f1"},{"name":"brand/light/9","hex":"#0f5fed"},{"name":"brand/light/10","hex":"#1553c6"},{"name":"brand/light/11","hex":"#0f3a8b"},{"name":"brand/light/12","hex":"#0d2e6c"},{"name":"brand/dark/1","hex":"#070c17"},{"name":"brand/dark/2","hex":"#0a1527"},{"name":"brand/dark/3","hex":"#0d1d3b"},{"name":"brand/dark/4","hex":"#0c2451"},{"name":"brand/dark/5","hex":"#0c3278"},{"name":"brand/dark/6","hex":"#073891"},{"name":"brand/dark/7","hex":"#0541ab"},{"name":"brand/dark/8","hex":"#0d55d4"},{"name":"brand/dark/9","hex":"#0f5fed"},{"name":"brand/dark/10","hex":"#5989e2"},{"name":"brand/dark/11","hex":"#b4c8ea"},{"name":"brand/dark/12","hex":"#e2e8f3"},{"name":"neutral/light/1","hex":"#fdfdfd"},{"name":"neutral/light/2","hex":"#f8f8f8"},{"name":"neutral/light/3","hex":"#eeeeee"},{"name":"neutral/light/4","hex":"#e1e1e1"},{"name":"neutral/light/5","hex":"#d7d7d7"},{"name":"neutral/light/6","hex":"#d2d2d2"},{"name":"neutral/light/7","hex":"#b8b8b8"},{"name":"neutral/light/8","hex":"#8a8a8a"},{"name":"neutral/light/9","hex":"#727272"},{"name":"neutral/light/10","hex":"#616161"},{"name":"neutral/light/11","hex":"#424242"},{"name":"neutral/light/12","hex":"#333333"},{"name":"neutral/dark/1","hex":"#0c0c0c"},{"name":"neutral/dark/2","hex":"#151515"},{"name":"neutral/dark/3","hex":"#1e1e1e"},{"name":"neutral/dark/4","hex":"#272727"},{"name":"neutral/dark/5","hex":"#373737"},{"name":"neutral/dark/6","hex":"#414141"},{"name":"neutral/dark/7","hex":"#4d4d4d"},{"name":"neutral/dark/8","hex":"#656565"},{"name":"neutral/dark/9","hex":"#727272"},{"name":"neutral/dark/10","hex":"#8f8f8f"},{"name":"neutral/dark/11","hex":"#c8c8c8"},{"name":"neutral/dark/12","hex":"#e8e8e8"},{"name":"danger/light/1","hex":"#fdfdfc"},{"name":"danger/light/2","hex":"#faf8f7"},{"name":"danger/light/3","hex":"#f4eceb"},{"name":"danger/light/4","hex":"#f0dcda"},{"name":"danger/light/5","hex":"#efceca"},{"name":"danger/light/6","hex":"#f3c6c2"},{"name":"danger/light/7","hex":"#f3a29b"},{"name":"danger/light/8","hex":"#f34c4b"},{"name":"danger/light/9","hex":"#db2931"},{"name":"danger/light/10","hex":"#b92429"},{"name":"danger/light/11","hex":"#7c191b"},{"name":"danger/light/12","hex":"#5d1515"},{"name":"danger/dark/1","hex":"#150807"},{"name":"danger/dark/2","hex":"#230e0c"},{"name":"danger/dark/3","hex":"#341210"},{"name":"danger/dark/4","hex":"#461211"},{"name":"danger/dark/5","hex":"#671416"},{"name":"danger/dark/6","hex":"#7b0e15"},{"name":"danger/dark/7","hex":"#960b18"},{"name":"danger/dark/8","hex":"#c41a26"},{"name":"danger/dark/9","hex":"#db2931"},{"name":"danger/dark/10","hex":"#e76760"},{"name":"danger/dark/11","hex":"#ecbdb8"},{"name":"danger/dark/12","hex":"#f3e4e2"},{"name":"success/light/1","hex":"#fcfdfc"},{"name":"success/light/2","hex":"#f5faf5"},{"name":"success/light/3","hex":"#e0f4e3"},{"name":"success/light/4","hex":"#c1efc8"},{"name":"success/light/5","hex":"#aee8b7"},{"name":"success/light/6","hex":"#a0e7ac"},{"name":"success/light/7","hex":"#7ccd8c"},{"name":"success/light/8","hex":"#439c58"},{"name":"success/light/9","hex":"#20823e"},{"name":"success/light/10","hex":"#1c6f35"},{"name":"success/light/11","hex":"#154e25"},{"name":"success/light/12","hex":"#123d1d"},{"name":"success/dark/1","hex":"#080e09"},{"name":"success/dark/2","hex":"#0c180f"},{"name":"success/dark/3","hex":"#102314"},{"name":"success/dark/4","hex":"#102e17"},{"name":"success/dark/5","hex":"#11431f"},{"name":"success/dark/6","hex":"#0c4f22"},{"name":"success/dark/7","hex":"#085c26"},{"name":"success/dark/8","hex":"#147534"},{"name":"success/dark/9","hex":"#20823e"},{"name":"success/dark/10","hex":"#569e65"},{"name":"success/dark/11","hex":"#9cd8a6"},{"name":"success/dark/12","hex":"#cef3d3"},{"name":"warning/light/1","hex":"#fdfdfc"},{"name":"warning/light/2","hex":"#faf8f4"},{"name":"warning/light/3","hex":"#f4eddf"},{"name":"warning/light/4","hex":"#efe0bf"},{"name":"warning/light/5","hex":"#efd499"},{"name":"warning/light/6","hex":"#f2ce7d"},{"name":"warning/light/7","hex":"#f3c65e"},{"name":"warning/light/8","hex":"#ebbb44"},{"name":"warning/light/9","hex":"#eab308"},{"name":"warning/light/10","hex":"#b7902c"},{"name":"warning/light/11","hex":"#665019"},{"name":"warning/light/12","hex":"#3f3110"},{"name":"warning/dark/1","hex":"#0e0c07"},{"name":"warning/dark/2","hex":"#19140b"},{"name":"warning/dark/3","hex":"#241d0e"},{"name":"warning/dark/4","hex":"#2f250e"},{"name":"warning/dark/5","hex":"#45350e"},{"name":"warning/dark/6","hex":"#523e09"},{"name":"warning/dark/7","hex":"#775a0a"},{"name":"warning/dark/8","hex":"#be931f"},{"name":"warning/dark/9","hex":"#eab308"},{"name":"warning/dark/10","hex":"#edc467"},{"name":"warning/dark/11","hex":"#f4e2ba"},{"name":"warning/dark/12","hex":"#f8f1e2"},{"name":"base/white","hex":"#ffffff"},{"name":"base/black","hex":"#000000"},{"name":"alpha/white/10","hex":"#ffffff1a"},{"name":"alpha/white/15","hex":"#ffffff26"},{"name":"alpha/black/50","hex":"#00000080"}],"semantic":[{"name":"bg/canvas","Light":"#f8f8f8","Dark":"#0c0c0c"},{"name":"bg/surface","Light":"#fdfdfd","Dark":"#151515"},{"name":"bg/subtle","Light":"#eeeeee","Dark":"#1e1e1e"},{"name":"bg/inset","Light":"#eeeeee","Dark":"#1e1e1e"},{"name":"bg/overlay","Light":"#fdfdfd","Dark":"#1e1e1e"},{"name":"bg/neutral/soft","Light":"#eeeeee","Dark":"#1e1e1e"},{"name":"bg/neutral/solid","Light":"#727272","Dark":"#727272"},{"name":"bg/accent/soft","Light":"#eaeef4","Dark":"#0d1d3b"},{"name":"bg/accent/solid","Light":"#0f5fed","Dark":"#0f5fed"},{"name":"bg/danger/soft","Light":"#f4eceb","Dark":"#341210"},{"name":"bg/danger/solid","Light":"#db2931","Dark":"#db2931"},{"name":"bg/success/soft","Light":"#e0f4e3","Dark":"#102314"},{"name":"bg/success/solid","Light":"#20823e","Dark":"#20823e"},{"name":"bg/warning/soft","Light":"#f4eddf","Dark":"#241d0e"},{"name":"bg/warning/solid","Light":"#eab308","Dark":"#eab308"},{"name":"bg/inverse","Light":"#333333","Dark":"#e8e8e8"},{"name":"bg/scrim","Light":"#00000080","Dark":"#00000080"},{"name":"fg/default","Light":"#333333","Dark":"#e8e8e8"},{"name":"fg/muted","Light":"#616161","Dark":"#8f8f8f"},{"name":"fg/on-solid","Light":"#ffffff","Dark":"#ffffff"},{"name":"fg/on-inverse","Light":"#fdfdfd","Dark":"#0c0c0c"},{"name":"fg/on-warning","Light":"#000000","Dark":"#000000"},{"name":"fg/accent","Light":"#1553c6","Dark":"#5989e2"},{"name":"fg/danger","Light":"#b92429","Dark":"#e76760"},{"name":"fg/success","Light":"#1c6f35","Dark":"#569e65"},{"name":"fg/warning","Light":"#665019","Dark":"#edc467"},{"name":"fg/link","Light":"#1553c6","Dark":"#5989e2"},{"name":"border/default","Light":"#d2d2d2","Dark":"#ffffff1a"},{"name":"border/field","Light":"#b8b8b8","Dark":"#ffffff26"},{"name":"border/strong","Light":"#727272","Dark":"#727272"},{"name":"border/accent","Light":"#0f5fed","Dark":"#0f5fed"},{"name":"border/danger","Light":"#db2931","Dark":"#db2931"},{"name":"border/focus","Light":"#0f5fed","Dark":"#0f5fed"},{"name":"border/focus-contrast","Light":"#333333","Dark":"#e8e8e8"},{"name":"state/layer","Light":"#000000","Dark":"#ffffff"}]}
const PAGE = 'Foundations'
const ROOT = 'Massive Foundations · generated'

await figma.loadFontAsync({ family: 'Inter', style: 'Regular' })
const page = figma.root.children.find((node) => node.type === 'PAGE' && node.name === PAGE)
  ?? figma.createPage()
page.name = PAGE
await figma.setCurrentPageAsync(page)

function direct(parent, type, name, create) {
  const hits = parent.children.filter((node) => node.type === type && node.name === name)
  if (hits.length > 1) throw new Error('중복 Foundations 노드: ' + name + ' × ' + hits.length)
  const node = hits[0] ?? create()
  node.name = name
  if (node.parent !== parent) parent.appendChild(node)
  return node
}

function frame(parent, name, direction = 'VERTICAL') {
  const node = direct(parent, 'FRAME', name, () => figma.createFrame())
  node.layoutMode = direction
  node.primaryAxisSizingMode = 'AUTO'
  node.counterAxisSizingMode = 'AUTO'
  node.itemSpacing = direction === 'VERTICAL' ? 12 : 8
  node.paddingTop = node.paddingRight = node.paddingBottom = node.paddingLeft = 12
  node.fills = []
  return node
}

function text(parent, name, characters, size = 12) {
  const node = direct(parent, 'TEXT', name, () => figma.createText())
  node.fontName = { family: 'Inter', style: 'Regular' }
  node.fontSize = size
  node.characters = characters
  node.fills = [{ type: 'SOLID', color: { r: 0.12, g: 0.12, b: 0.12 } }]
  return node
}

function rect(parent, name, hex, variable) {
  const node = direct(parent, 'RECTANGLE', name, () => figma.createRectangle())
  node.resize(64, 48)
  node.cornerRadius = 6
  const fallback = hexToRgba(hex)
  let paint = { type: 'SOLID', color: { r: fallback.r, g: fallback.g, b: fallback.b }, opacity: fallback.a }
  paint = figma.variables.setBoundVariableForPaint(paint, 'color', variable)
  node.fills = [paint]
  return node
}

function prune(parent, keep) {
  for (const node of [...parent.children]) if (!keep.has(node.name)) node.remove()
}

function swatch(parent, name, hex, variable) {
  const cell = frame(parent, 'swatch:' + name)
  rect(cell, 'color', hex, variable)
  text(cell, 'label', name)
  prune(cell, new Set(['color', 'label']))
  return cell
}

const paletteCol = (await figma.variables.getLocalVariableCollectionsAsync()).find((c) => c.name === 'palette')
const semanticCol = (await figma.variables.getLocalVariableCollectionsAsync()).find((c) => c.name === 'semantic')
if (!paletteCol || !semanticCol) throw new Error('01~04를 먼저 실행할 것')
const paletteVars = await indexVariables(paletteCol)
const semanticVars = await indexVariables(semanticCol)
const modeIds = Object.fromEntries(semanticCol.modes.map((mode) => [mode.name, mode.modeId]))

const root = direct(page, 'FRAME', ROOT, () => figma.createFrame())
root.layoutMode = 'VERTICAL'
root.primaryAxisSizingMode = 'AUTO'
root.counterAxisSizingMode = 'AUTO'
root.itemSpacing = 32
root.paddingTop = root.paddingRight = root.paddingBottom = root.paddingLeft = 32
root.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }]
if (root.x === 0 && root.y === 0) {
  const bottom = page.children.filter((node) => node !== root)
    .reduce((max, node) => Math.max(max, node.y + node.height), 0)
  root.x = 0
  root.y = bottom ? bottom + 160 : 0
}

text(root, 'title', 'Massive Design Foundations', 24)
const paletteSection = frame(root, 'section:palette')
text(paletteSection, 'title', 'Palette', 18)
const paletteGroups = new Map()
for (const item of DATA.palette) {
  const groupName = item.name.split('/').slice(0, 2).join('/')
  if (!paletteGroups.has(groupName)) paletteGroups.set(groupName, [])
  paletteGroups.get(groupName).push(item)
}
const paletteKeep = new Set(['title'])
for (const [groupName, items] of paletteGroups) {
  const group = frame(paletteSection, 'group:' + groupName, 'HORIZONTAL')
  const keep = new Set()
  for (const item of items) {
    const variable = paletteVars.get(item.name)
    if (!variable) throw new Error('palette 변수 누락: ' + item.name)
    const cell = swatch(group, item.name, item.hex, variable)
    keep.add(cell.name)
  }
  prune(group, keep)
  paletteKeep.add(group.name)
}
prune(paletteSection, paletteKeep)

const semanticSection = frame(root, 'section:semantic', 'HORIZONTAL')
const semanticKeep = new Set()
for (const mode of ['Light', 'Dark']) {
  if (!modeIds[mode]) throw new Error('semantic 모드 누락: ' + mode)
  const column = frame(semanticSection, 'mode:' + mode)
  column.setExplicitVariableModeForCollection(semanticCol, modeIds[mode])
  text(column, 'title', mode, 18)
  const keep = new Set(['title'])
  for (const item of DATA.semantic) {
    const variable = semanticVars.get(item.name)
    if (!variable) throw new Error('semantic 변수 누락: ' + item.name)
    const cell = swatch(column, item.name, item[mode], variable)
    keep.add(cell.name)
  }
  prune(column, keep)
  semanticKeep.add(column.name)
}
prune(semanticSection, semanticKeep)
prune(root, new Set(['title', 'section:palette', 'section:semantic']))

return {
  pageId: page.id,
  rootId: root.id,
  palette: DATA.palette.length,
  semantic: DATA.semantic.length,
  modes: ['Light', 'Dark'],
}
