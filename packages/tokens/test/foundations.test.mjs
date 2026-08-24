import assert from 'node:assert/strict'
import { test } from 'node:test'

import { buildAll, loadSources } from '../scripts/build.mjs'
import { foundationsData } from '../scripts/lib/emit/figma.mjs'

test('Foundations 데이터가 palette 전체와 semantic 두 모드를 덮는다', () => {
  const data = foundationsData(loadSources())
  assert.equal(data.palette.length, 125)
  assert.equal(data.semantic.length, 35)
  assert.deepEqual(Object.keys(data.semantic[0]), ['name', 'Light', 'Dark'])
  assert.ok(data.palette.some(({ name }) => name.startsWith('danger/')))
  assert.ok(data.palette.some(({ name }) => name.startsWith('success/')))
})

test('07 생성물은 생성 영역만 소유하고 변수 바인딩과 semantic 모드를 사용한다', () => {
  const code = buildAll().get('figma/07-foundations.js')
  assert.match(code, /Massive Foundations · generated/)
  assert.match(code, /setBoundVariableForPaint/)
  assert.match(code, /setExplicitVariableModeForCollection/)
  assert.match(code, /page\.children\.filter/)
})

function foundationsStub(data) {
  let seq = 0
  const id = (type) => `${type}:${++seq}`
  const make = (type) => {
    const node = {
      id: id(type), type, name: '', parent: null, children: [], x: 0, y: 0, width: 100, height: 100,
      appendChild(child) {
        child.parent?.children.splice(child.parent.children.indexOf(child), 1)
        child.parent = node
        node.children.push(child)
      },
      remove() {
        if (node.parent) node.parent.children.splice(node.parent.children.indexOf(node), 1)
        node.parent = null
      },
      resize(width, height) { node.width = width; node.height = height },
      setExplicitVariableModeForCollection() {},
    }
    return node
  }
  const root = make('DOCUMENT')
  const pages = root.children
  const palette = { id: id('Collection'), name: 'palette', modes: [{ name: 'Value', modeId: id('Mode') }], variableIds: [] }
  const semantic = { id: id('Collection'), name: 'semantic', modes: [
    { name: 'Light', modeId: id('Mode') }, { name: 'Dark', modeId: id('Mode') },
  ], variableIds: [] }
  const variables = new Map()
  const seed = (col, name) => {
    const variable = { id: id('Variable'), name }
    col.variableIds.push(variable.id)
    variables.set(variable.id, variable)
  }
  data.palette.forEach(({ name }) => seed(palette, name))
  data.semantic.forEach(({ name }) => seed(semantic, name))
  const create = (type) => () => make(type)
  const createPage = () => {
    const page = make('PAGE')
    root.appendChild(page)
    return page
  }
  return {
    figma: {
      root,
      createPage,
      setCurrentPageAsync: async () => {},
      loadFontAsync: async () => {},
      createFrame: create('FRAME'),
      createText: create('TEXT'),
      createRectangle: create('RECTANGLE'),
      variables: {
        getLocalVariableCollectionsAsync: async () => [palette, semantic],
        getVariableByIdAsync: async (variableId) => variables.get(variableId),
        setBoundVariableForPaint: (paint, field, variable) => ({ ...paint, boundVariables: { [field]: variable.id } }),
      },
    },
    census: () => {
      let count = 0
      const visit = (node) => { count++; node.children.forEach(visit) }
      pages.forEach(visit)
      return count
    },
  }
}

test('07을 두 번 실행해도 생성 영역의 노드 수가 늘지 않는다', async () => {
  const files = buildAll()
  const data = foundationsData(loadSources())
  const stub = foundationsStub(data)
  const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor
  const inject = () => new AsyncFunction('figma', files.get('figma/07-foundations.js'))(stub.figma)
  const firstResult = await inject()
  const firstCount = stub.census()
  const secondResult = await inject()
  assert.deepEqual(secondResult, firstResult)
  assert.equal(stub.census(), firstCount)
  assert.match(firstResult.pageId, /^PAGE:/)
  assert.match(firstResult.rootId, /^FRAME:/)
  assert.deepEqual({ palette: firstResult.palette, semantic: firstResult.semantic, modes: firstResult.modes }, {
    palette: 125, semantic: 35, modes: ['Light', 'Dark'],
  })
})
