// ⚙ 생성물 — scripts/manifest.mjs. 손대지 말 것.
// Components page 카탈로그 배치 정규화.
// use_figma의 code 파라미터에 그대로 넣는다. IIFE로 감싸지 말 것.

const EXPECTED = [
  "accordion",
  "alert",
  "alert-dialog",
  "avatar",
  "badge",
  "breadcrumb",
  "button",
  "card",
  "checkbox",
  "collapsible",
  "dialog",
  "dropdown-menu",
  "empty",
  "field",
  "input",
  "item",
  "label",
  "list-row",
  "pagination",
  "popover",
  "progress",
  "radio-group",
  "select",
  "separator",
  "skeleton",
  "spinner",
  "switch",
  "table",
  "tabs",
  "textarea",
  "toast",
  "toggle",
  "toggle-group",
  "tooltip"
]
const X = 2000
const START_Y = 0
const GAP = 120
const APPLY = true

const page = figma.root.children.find((node) => node.name === 'Components')
if (!page) throw new Error('Components page가 없다')
await figma.setCurrentPageAsync(page)

const expectedComponents = new Set(EXPECTED)
const byComponent = new Map()
const identityOf = (node) => {
  if (node.type !== 'COMPONENT' && node.type !== 'COMPONENT_SET') return null
  const match = node.description.match(/(?:^|\n)massive:([a-z0-9-]+)@[0-9a-f]{12}$/)
  return match?.[1] ?? null
}
for (const node of page.children) {
  const component = identityOf(node)
  if (!component) continue
  const list = byComponent.get(component) ?? []
  list.push(node)
  byComponent.set(component, list)
}

const missing = EXPECTED.filter((component) => !byComponent.has(component))
const duplicates = EXPECTED.flatMap((component) => {
  const count = byComponent.get(component)?.length ?? 0
  return count > 1 ? [{ component, count }] : []
})
const unexpected = page.children
  .filter((node) => !expectedComponents.has(identityOf(node)))
  .map((node) => ({ id: node.id, name: node.name, type: node.type, component: identityOf(node) }))

const structuralErrors = { missing, duplicates, unexpected }
const structurallyValid = Object.values(structuralErrors).every((items) => items.length === 0)
if (APPLY && !structurallyValid) {
  throw new Error('카탈로그 배치 정규화 중단: ' + JSON.stringify(structuralErrors))
}

let y = START_Y
const drift = []
const positions = []
if (structurallyValid) {
  for (const component of EXPECTED) {
    const node = byComponent.get(component)[0]
    const expected = { x: X, y }
    const actual = { x: node.x, y: node.y }
    if (actual.x !== expected.x || actual.y !== expected.y) {
      drift.push({ id: node.id, component, name: node.name, expected, actual })
      if (APPLY) {
        node.x = expected.x
        node.y = expected.y
      }
    }
    positions.push({ id: node.id, component, name: node.name, x: expected.x, y: expected.y, width: node.width, height: node.height })
    y += node.height + GAP
  }
}

return {
  result: structurallyValid && (APPLY || drift.length === 0) ? 'PASS' : 'FAIL',
  mode: APPLY ? 'sync' : 'check',
  expectedCount: EXPECTED.length,
  actualCount: page.children.length,
  structuralErrors,
  drift,
  movedCount: APPLY ? drift.length : 0,
  mutatedNodeIds: APPLY ? drift.map(({ id }) => id) : [],
  positions,
}
