// Massive Design — 폰트 바인딩 (셰이핑 런타임의 사람 단계)
//
// 저작 런타임(`use_figma`)에는 Pretendard가 없다. 거기서 `fontFamily`를
// `type/family/sans`에 바인딩하면 그 노드는 한글 셰이핑을 얻지 못하고,
// 로드 불가 폰트가 되어 `appendChild` 대상도 될 수 없다. 그래서 에이전트는
// 텍스트를 로드 가능한 face로 남기고 — 폰트 미완 상태 — 이 플러그인이
// Pretendard가 설치된 셰이핑 런타임에서 바인딩을 건다.
//
// 절차상의 위치는 `docs/agents/design-system-sync.md`의 Figma document gate,
// 근거는 `docs/adr/0004-font-shaping-runtime.md`.
//
// 실행: Figma 데스크톱 앱 → Plugins → Development → Import plugin from manifest…
//       → 이 디렉터리의 `manifest.json`
//
// 멱등하다. 두 번째 실행은 bound 0을 낸다.

const TARGET_PAGE = 'Components'
const FAMILY_VAR = 'type/family/sans'

async function findFamilyVariable() {
  const collections = await figma.variables.getLocalVariableCollectionsAsync()
  for (const collection of collections) {
    for (const id of collection.variableIds) {
      const variable = await figma.variables.getVariableByIdAsync(id)
      if (variable && variable.name === FAMILY_VAR) return variable
    }
  }
  return null
}

async function main() {
  const page = figma.root.children.find((p) => p.name === TARGET_PAGE)
  if (!page) throw new Error(`'${TARGET_PAGE}' 페이지가 없다`)
  await figma.setCurrentPageAsync(page)

  const familyVar = await findFamilyVariable()
  if (!familyVar) throw new Error(`${FAMILY_VAR} 변수가 없다 — 토큰 주입 01~03을 먼저 실행할 것`)

  const texts = page.findAllWithCriteria({ types: ['TEXT'] })

  // 바인딩은 대상 노드의 **현재** 폰트와 변수가 해석하는 폰트가 **모두** 로드돼야
  // 통과한다. 노드의 현재 폰트는 하드코딩하지 말고 세그먼트에서 읽는다 — 세대마다
  // 에이전트가 남긴 face가 다를 수 있다.
  const fonts = new Map()
  for (const text of texts) {
    for (const segment of text.getStyledTextSegments(['fontName'])) {
      fonts.set(JSON.stringify(segment.fontName), segment.fontName)
    }
  }

  // 변수는 family만 담는다. style은 문서에 실제로 쓰인 것들과 짝지어 로드한다.
  const styles = new Set(Array.from(fonts.values()).map((f) => f.style))
  for (const value of Object.values(familyVar.valuesByMode)) {
    if (typeof value !== 'string') continue
    for (const style of styles) {
      fonts.set(JSON.stringify({ family: value, style }), { family: value, style })
    }
  }

  const unloadable = []
  for (const font of fonts.values()) {
    try {
      await figma.loadFontAsync(font)
    } catch (error) {
      unloadable.push(`${font.family} ${font.style}`)
    }
  }

  // 이게 이 플러그인의 안전장치다. 로드가 실패하는 런타임은 셰이핑 런타임이
  // 아니므로, 여기서 바인딩하면 저작 런타임이 만든 것과 똑같이 깨진 노드가 된다.
  if (unloadable.length > 0) {
    throw new Error(
      `폰트를 로드할 수 없다 — 이 런타임은 셰이핑 런타임이 아니다: ${unloadable.join(', ')}`,
    )
  }

  let bound = 0
  let already = 0
  for (const text of texts) {
    if (text.boundVariables && text.boundVariables.fontFamily) {
      already++
      continue
    }
    text.setBoundVariable('fontFamily', familyVar)
    bound++
  }

  return { total: texts.length, bound, already }
}

main()
  .then((result) => {
    figma.closePlugin(
      `폰트 바인딩 — 전체 ${result.total} · 새로 바인딩 ${result.bound} · 이미 바인딩 ${result.already}`,
    )
  })
  .catch((error) => {
    figma.closePlugin(`실패: ${error.message}`)
  })
