/**
 * 주입 스크립트를 **가짜 Figma** 위에서 돌린다.
 *
 * 목적은 Plugin API를 흉내내는 게 아니라 `docs/agents/figma-injection.md` §3이
 * 요구하는 "두 번 실행해 수가 그대로인지" 를 왕복 없이 확인하는 것이다. 스텁은
 * 실측으로 확인된 두 가지 성질만 진짜처럼 군다:
 *
 * - 같은 컬렉션 안의 **중복 변수명은 throw**한다 (#4)
 * - 처음 보는 `(family, style)` 쌍의 **첫 fontFamily 바인딩은 throw**한다 (#10)
 *
 * 통과가 Figma에서의 성공을 보장하진 않는다. 실패는 확실히 실패를 뜻한다.
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'

import { buildAll } from '../scripts/build.mjs'

const files = buildAll()
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor
const ORDER = [
  '01-collections.js', '02-palette-color.js', '03-palette-scale.js',
  '04-semantic.js', '05-text-styles.js', '06-effect-styles.js',
]

function createFigmaStub() {
  let seq = 0
  const id = (p) => `${p}:${++seq}`
  const collections = []
  const byId = new Map()
  const textStyles = []
  const effectStyles = []
  const loadedFaces = new Set()

  const newCollection = (name) => {
    const col = {
      id: id('Collection'), name, variableIds: [],
      modes: [{ modeId: id('Mode'), name: 'Mode 1' }],
      renameMode(modeId, next) { col.modes.find((m) => m.modeId === modeId).name = next },
      addMode(next) {
        const modeId = id('Mode')
        col.modes.push({ modeId, name: next })
        return modeId
      },
    }
    collections.push(col)
    return col
  }

  const newVariable = (name, col, type) => {
    // 같은 컬렉션 안의 중복 변수명은 throw한다 — 멱등성이 깨지면 여기서 터진다
    if (col.variableIds.some((vid) => byId.get(vid).name === name)) {
      throw new Error(`in createVariable: duplicate variable name: ${name}`)
    }
    const v = {
      id: id('VariableID'), name, resolvedType: type, scopes: [],
      hiddenFromPublishing: false, valuesByMode: {}, codeSyntax: {},
      setValueForMode(modeId, value) { v.valuesByMode[modeId] = value },
      setVariableCodeSyntax(platform, syntax) { v.codeSyntax[platform] = syntax },
      remove() {
        col.variableIds = col.variableIds.filter((x) => x !== v.id)
        byId.delete(v.id)
      },
    }
    col.variableIds.push(v.id)
    byId.set(v.id, v)
    return v
  }

  const newTextStyle = () => {
    const s = {
      id: id('Style'), name: '', fontName: null, fontSize: null,
      lineHeight: null, letterSpacing: null, boundVariables: {},
      setBoundVariable(field, variable) {
        if (field === 'fontFamily') {
          const face = `${variable.valuesByMode[Object.keys(variable.valuesByMode)[0]]} Regular`
          // 런타임이 처음 보는 face는 첫 시도가 반드시 throw한다 (#10)
          if (!loadedFaces.has(face)) {
            loadedFaces.add(face)
            throw new Error(`in setBoundVariable: unloaded font "${face}".`)
          }
        }
        s.boundVariables[field] = { type: 'VARIABLE_ALIAS', id: variable.id }
      },
    }
    textStyles.push(s)
    return s
  }

  const newEffectStyle = () => {
    const s = { id: id('Style'), name: '', effects: [] }
    effectStyles.push(s)
    return s
  }

  return {
    state: { collections, byId, textStyles, effectStyles },
    figma: {
      variables: {
        getLocalVariableCollectionsAsync: async () => collections,
        createVariableCollection: newCollection,
        getVariableByIdAsync: async (vid) => byId.get(vid) ?? null,
        createVariable: newVariable,
      },
      loadFontAsync: async ({ family, style }) => { loadedFaces.add(`${family} ${style}`) },
      getLocalTextStylesAsync: async () => textStyles,
      createTextStyle: newTextStyle,
      getLocalEffectStylesAsync: async () => effectStyles,
      createEffectStyle: newEffectStyle,
    },
  }
}

async function inject(stub) {
  const results = {}
  for (const name of ORDER) {
    results[name] = await new AsyncFunction('figma', files.get(`figma/${name}`))(stub.figma)
  }
  return results
}

const census = ({ state }) => ({
  collections: state.collections.map((c) => `${c.name}(${c.modes.map((m) => m.name).join('/')})`),
  variables: state.byId.size,
  textStyles: state.textStyles.length,
  effectStyles: state.effectStyles.length,
})

test('콜드 파일에 6단계가 순서대로 실린다', async () => {
  const stub = createFigmaStub()
  const results = await inject(stub)

  assert.deepEqual(census(stub).collections, ['palette(Value)', 'semantic(Light/Dark)'])
  assert.equal(results['02-palette-color.js'].count, 125)   // 램프 120 + 리터럴 5
  assert.equal(results['04-semantic.js'].count, 35)
  assert.equal(results['05-text-styles.js'].count, 9)
  assert.equal(results['06-effect-styles.js'].count, 5)
})

test('두 번 실행해도 수가 그대로다 — 재주입이 중복을 만들지 않는다', async () => {
  const stub = createFigmaStub()
  await inject(stub)
  const first = census(stub)
  await inject(stub)
  assert.deepEqual(census(stub), first)
})

test('Light가 semantic의 첫 모드다 — defaultModeId에는 setter가 없다', async () => {
  const stub = createFigmaStub()
  await inject(stub)
  const semantic = stub.state.collections.find((c) => c.name === 'semantic')
  assert.equal(semantic.modes[0].name, 'Light')
})

test('semantic이 크로스 컬렉션으로 palette를 가리킨다', async () => {
  const stub = createFigmaStub()
  await inject(stub)
  const named = new Map([...stub.state.byId.values()].map((v) => [v.name, v]))
  const canvas = named.get('bg/canvas')
  const [light, dark] = Object.values(canvas.valuesByMode)
  assert.equal(light.type, 'VARIABLE_ALIAS')
  assert.equal(stub.state.byId.get(light.id).name, 'neutral/light/2')
  assert.equal(stub.state.byId.get(dark.id).name, 'neutral/dark/1')
})

test('fontFamily 바인딩의 첫 실패를 재시도가 삼킨다', async () => {
  const stub = createFigmaStub()
  await inject(stub)
  for (const style of stub.state.textStyles) {
    assert.ok(style.boundVariables.fontFamily, `${style.name}: fontFamily 미바인딩`)
    assert.ok(style.boundVariables.fontSize && style.boundVariables.lineHeight, style.name)
    assert.equal(style.lineHeight.unit, 'PIXELS')     // PERCENT는 바인딩과 양립하지 않는다
    assert.equal(style.letterSpacing.unit, 'PERCENT')
  }
  const sm = stub.state.textStyles.find((s) => s.name === 'sm')
  assert.equal(sm.fontSize, 14)
  assert.deepEqual(sm.lineHeight, { unit: 'PIXELS', value: 22.4 })
})

test('scopes를 비워 두지 않는다 — ALL_SCOPES는 모든 피커를 오염시킨다', async () => {
  const stub = createFigmaStub()
  await inject(stub)
  for (const v of stub.state.byId.values()) {
    // duration만 대응하는 scope가 없어 의도적으로 빈 배열이다
    if (v.name.startsWith('duration/')) continue
    assert.ok(v.scopes.length > 0, v.name)
    assert.ok(!v.scopes.includes('ALL_SCOPES'), v.name)
  }
})

test('그림자는 레이어를 통째로 재할당한다 — sm~xl은 2장', async () => {
  const stub = createFigmaStub()
  await inject(stub)
  const byName = new Map(stub.state.effectStyles.map((s) => [s.name, s]))
  assert.equal(byName.get('shadow/xs').effects.length, 1)
  assert.equal(byName.get('shadow/md').effects.length, 2)
  assert.equal(byName.get('shadow/md').effects[0].color.a, 0.1)
})
