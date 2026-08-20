// ⚙ 생성물 — scripts/build.mjs. 손대지 말 것.
// 03 — palette 스케일 47개
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

// [이름, 타입, 값, scopes] — scopes는 항상 명시한다. 기본값 ALL_SCOPES는
// 모든 속성 피커를 오염시킨다 (#4)
const SCALE = [
  ["type/size/xs","FLOAT",12,["FONT_SIZE"]],
  ["type/size/sm","FLOAT",14,["FONT_SIZE"]],
  ["type/size/base","FLOAT",16,["FONT_SIZE"]],
  ["type/size/lg","FLOAT",18,["FONT_SIZE"]],
  ["type/size/xl","FLOAT",20,["FONT_SIZE"]],
  ["type/size/2xl","FLOAT",24,["FONT_SIZE"]],
  ["type/size/3xl","FLOAT",30,["FONT_SIZE"]],
  ["type/size/4xl","FLOAT",36,["FONT_SIZE"]],
  ["type/size/5xl","FLOAT",48,["FONT_SIZE"]],
  ["type/line-height/xs","FLOAT",19.2,["LINE_HEIGHT"]],
  ["type/line-height/sm","FLOAT",22.4,["LINE_HEIGHT"]],
  ["type/line-height/base","FLOAT",25.6,["LINE_HEIGHT"]],
  ["type/line-height/lg","FLOAT",28.8,["LINE_HEIGHT"]],
  ["type/line-height/xl","FLOAT",28,["LINE_HEIGHT"]],
  ["type/line-height/2xl","FLOAT",33.6,["LINE_HEIGHT"]],
  ["type/line-height/3xl","FLOAT",37.5,["LINE_HEIGHT"]],
  ["type/line-height/4xl","FLOAT",45,["LINE_HEIGHT"]],
  ["type/line-height/5xl","FLOAT",60,["LINE_HEIGHT"]],
  ["type/family/sans","STRING","Pretendard",["FONT_FAMILY"]],
  ["space/0","FLOAT",0,["GAP","WIDTH_HEIGHT"]],
  ["space/1","FLOAT",4,["GAP","WIDTH_HEIGHT"]],
  ["space/2","FLOAT",8,["GAP","WIDTH_HEIGHT"]],
  ["space/3","FLOAT",12,["GAP","WIDTH_HEIGHT"]],
  ["space/4","FLOAT",16,["GAP","WIDTH_HEIGHT"]],
  ["space/5","FLOAT",20,["GAP","WIDTH_HEIGHT"]],
  ["space/6","FLOAT",24,["GAP","WIDTH_HEIGHT"]],
  ["space/8","FLOAT",32,["GAP","WIDTH_HEIGHT"]],
  ["space/10","FLOAT",40,["GAP","WIDTH_HEIGHT"]],
  ["space/12","FLOAT",48,["GAP","WIDTH_HEIGHT"]],
  ["space/16","FLOAT",64,["GAP","WIDTH_HEIGHT"]],
  ["space/20","FLOAT",80,["GAP","WIDTH_HEIGHT"]],
  ["space/24","FLOAT",96,["GAP","WIDTH_HEIGHT"]],
  ["radius/sm","FLOAT",6,["CORNER_RADIUS"]],
  ["radius/md","FLOAT",8,["CORNER_RADIUS"]],
  ["radius/lg","FLOAT",10,["CORNER_RADIUS"]],
  ["radius/xl","FLOAT",14,["CORNER_RADIUS"]],
  ["radius/2xl","FLOAT",18,["CORNER_RADIUS"]],
  ["radius/3xl","FLOAT",22,["CORNER_RADIUS"]],
  ["radius/4xl","FLOAT",26,["CORNER_RADIUS"]],
  ["border-width/1","FLOAT",1,["STROKE_FLOAT"]],
  ["border-width/2","FLOAT",2,["STROKE_FLOAT"]],
  ["duration/fast","FLOAT",150,[]],
  ["duration/base","FLOAT",200,[]],
  ["duration/slow","FLOAT",300,[]],
  ["opacity/hover","FLOAT",0.08,["OPACITY"]],
  ["opacity/pressed","FLOAT",0.12,["OPACITY"]],
  ["opacity/disabled","FLOAT",0.5,["OPACITY"]],
]

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
