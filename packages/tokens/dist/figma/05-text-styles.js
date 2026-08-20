// ⚙ 생성물 — scripts/build.mjs. 손대지 말 것.
// 05 — Text Style 9개
// use_figma의 code 파라미터에 그대로 넣는다. IIFE로 감싸지 말 것 — 이미 async 컨텍스트다.

// 순서가 곧 제약이다 (#10 · docs/agents/figma-injection.md §2.3):
// 리터럴 → fontSize·lineHeight 바인딩 → **마지막에** fontFamily 바인딩.
// fontFamily 바인딩이 스타일을 폰트 잠금 상태로 만들어 그 뒤로는 lineHeight
// 재기록도 막힌다.

// [이름, fontSize, lineHeight px, letterSpacing %]
const STYLES = [
  ["xs",12,19.2,0],
  ["sm",14,22.4,0],
  ["base",16,25.6,0],
  ["lg",18,28.8,0],
  ["xl",20,28,-1],
  ["2xl",24,33.6,-1],
  ["3xl",30,37.5,-2],
  ["4xl",36,45,-2],
  ["5xl",48,60,-2],
]

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
