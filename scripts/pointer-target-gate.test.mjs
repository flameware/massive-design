import assert from "node:assert/strict"
import { test } from "node:test"

import {
  evaluateBelowFloor, evaluateOverlap, evaluateUnmeasuredSlots, evaluateGate,
  isMeasuredRow, parseTsv, loadExceptions,
} from "./pointer-target-gate.mjs"

/* self-test — #232 acceptance: "일부러 미달인 대상을 넣었을 때 실제로 실패한다".
 * 알려진 미달·겹침·미측정 slot 케이스를 fixture 로 만들어 게이트가 실제로 무는지 확인한다. */

const row = (over = {}) => ({
  story: "checkbox", cell: "-", slot: "checkbox", tag: "button", role: "-",
  inScan: "true", nativeInteractive: "true",
  visualW: "16", visualH: "16", hitW: "16", hitH: "17",
  square24: "false", clipAncestor: "-", clipRoom: "-", after: "-", note: "-", chain: "-",
  ...over,
})

test("parseTsv: 머리글 기준으로 읽는다", () => {
  const rows = parseTsv("a\tb\n1\t2\n3\t4\n")
  assert.deepEqual(rows, [{ a: "1", b: "2" }, { a: "3", b: "4" }])
})

test("parseTsv: 빈 입력은 빈 배열", () => {
  assert.deepEqual(parseTsv(""), [])
})

test("isMeasuredRow: pointer-events:none 은 재지 않음으로 거른다", () => {
  assert.equal(isMeasuredRow(row({ note: "pointer-events:none" })), false)
  assert.equal(isMeasuredRow(row({ note: "center-miss" })), true)
  assert.equal(isMeasuredRow(row({ note: "-" })), true)
})

test("loadExceptions: 파일이 없으면 빈 목록", () => {
  const exceptions = loadExceptions("/no/such/path.json")
  assert.equal(exceptions.belowFloor.size, 0)
  assert.equal(exceptions.unmeasuredSlots.size, 0)
})

// --- 하한 미달 ---

test("하한 미달: 기준선에 없던 미달은 regression으로 문다", () => {
  const current = [row()]
  const baseline = [] // 기준선에는 이 대상이 없었다 — 이번 세대가 새로 냈다
  const { regressions, knownGaps, exempted } = evaluateBelowFloor({
    currentRows: current, baselineRows: baseline, exceptions: loadExceptions(null),
  })
  assert.equal(regressions.length, 1)
  assert.equal(knownGaps.length, 0)
  assert.equal(exempted.length, 0)
})

test("하한 미달: 기준선에도 있던 미달은 known gap으로 문다(여전히 FAIL)", () => {
  const current = [row()]
  const baseline = [row()] // 같은 (story, cell, slot) 이 기준선에도 미달로 있다
  const { regressions, knownGaps } = evaluateBelowFloor({
    currentRows: current, baselineRows: baseline, exceptions: loadExceptions(null),
  })
  assert.equal(regressions.length, 0)
  assert.equal(knownGaps.length, 1)
})

test("하한 미달: 예외 목록에 있으면 통과시킨다", () => {
  const current = [row()]
  const exceptions = { belowFloor: new Map([["checkbox\tcheckbox", "#231 예외"]]), unmeasuredSlots: new Map() }
  const { regressions, knownGaps, exempted } = evaluateBelowFloor({
    currentRows: current, baselineRows: [], exceptions,
  })
  assert.equal(regressions.length, 0)
  assert.equal(knownGaps.length, 0)
  assert.equal(exempted.length, 1)
  assert.equal(exempted[0].reason, "#231 예외")
})

test("하한 미달: square24가 참이면 잡지 않는다", () => {
  const current = [row({ square24: "true" })]
  const { regressions, knownGaps, exempted } = evaluateBelowFloor({
    currentRows: current, baselineRows: [], exceptions: loadExceptions(null),
  })
  assert.equal(regressions.length + knownGaps.length + exempted.length, 0)
})

test("하한 미달: pointer-events:none 셀은 미달이어도 재지 않음으로 거른다", () => {
  const current = [row({ note: "pointer-events:none" })]
  const { regressions, knownGaps } = evaluateBelowFloor({
    currentRows: current, baselineRows: [], exceptions: loadExceptions(null),
  })
  assert.equal(regressions.length + knownGaps.length, 0)
})

// --- 미신고 겹침 ---

test("미신고 겹침: 기준선에 없던 오버리지는 문다", () => {
  const current = [row({ visualW: "16", visualH: "16", hitW: "24", hitH: "24", after: "-" })]
  const { unreported, declared } = evaluateOverlap({ currentRows: current, baselineRows: [] })
  assert.equal(unreported.length, 1)
  assert.equal(declared.length, 0)
})

test("미신고 겹침: 같은 (story,cell,slot)에 기준선도 오버리지면 선언된 것으로 통과시킨다", () => {
  const current = [row({ visualW: "16", visualH: "16", hitW: "24", hitH: "24", after: "-" })]
  const baseline = [row({ visualW: "16", visualH: "16", hitW: "24", hitH: "24", after: "-" })]
  const { unreported, declared } = evaluateOverlap({ currentRows: current, baselineRows: baseline })
  assert.equal(unreported.length, 0)
  assert.equal(declared.length, 1)
})

test("미신고 겹침: after: 유무는 판정을 바꾸지 않고 보고용 정보로만 붙는다", () => {
  const current = [row({ visualW: "16", visualH: "16", hitW: "24", hitH: "24", after: "24px×24px" })]
  const baseline = [row({ visualW: "16", visualH: "16", hitW: "24", hitH: "24", after: "24px×24px" })]
  const { declared } = evaluateOverlap({ currentRows: current, baselineRows: baseline })
  assert.equal(declared.length, 1)
  assert.equal(declared[0].hasAfter, true)
})

test("미신고 겹침: 해상도 오차(±1px)는 겹침으로 세지 않는다", () => {
  const current = [row({ visualW: "16", visualH: "16", hitW: "17", hitH: "17", after: "-" })]
  const { unreported, declared } = evaluateOverlap({ currentRows: current, baselineRows: [] })
  assert.equal(unreported.length, 0)
  assert.equal(declared.length, 0)
})

// --- 참조 스토리가 안 그리는 slot ---

test("참조 스토리가 안 그리는 slot: 예외 목록에 없으면 문다", () => {
  const scanSlots = [{ component: "menubar", slot: "menubar-item" }]
  const current = [row({ slot: "checkbox" })] // menubar-item 은 어느 셀에도 없다
  const { failing, exempted } = evaluateUnmeasuredSlots({ scanSlots, currentRows: current, exceptions: loadExceptions(null) })
  assert.equal(failing.length, 1)
  assert.equal(exempted.length, 0)
})

test("참조 스토리가 안 그리는 slot: pointer-events:none이라 재지 않는 것과는 다르다 — DOM에 있으면 그린 것이다", () => {
  const scanSlots = [{ component: "switch", slot: "switch-thumb" }]
  const current = [row({ slot: "switch-thumb", note: "pointer-events:none" })] // DOM에는 있다, 재지 않을 뿐
  const { failing, exempted } = evaluateUnmeasuredSlots({ scanSlots, currentRows: current, exceptions: loadExceptions(null) })
  assert.equal(failing.length, 0)
  assert.equal(exempted.length, 0)
})

test("참조 스토리가 안 그리는 slot: 예외 목록에 있으면 통과시킨다", () => {
  const scanSlots = [{ component: "menubar", slot: "menubar-item" }]
  const exceptions = { belowFloor: new Map(), unmeasuredSlots: new Map([["menubar\tmenubar-item", "참조 스토리가 열지 않는 메뉴"]]) }
  const { failing, exempted } = evaluateUnmeasuredSlots({ scanSlots, currentRows: [], exceptions })
  assert.equal(failing.length, 0)
  assert.equal(exempted.length, 1)
})

// --- 종합 ---

test("evaluateGate: 문제 없으면 ok:true", () => {
  const result = evaluateGate({
    currentRows: [row({ square24: "true" })],
    baselineRows: [],
    exceptions: loadExceptions(null),
    scanSlots: [{ component: "checkbox", slot: "checkbox" }],
  })
  assert.equal(result.ok, true)
  assert.equal(result.failingCount, 0)
})

test("evaluateGate: 세 종류가 섞여도 전부 센다", () => {
  const result = evaluateGate({
    currentRows: [
      row({ slot: "checkbox", square24: "false" }), // regression
      row({ slot: "toast-close", visualW: "16", visualH: "16", hitW: "24", hitH: "24", after: "-", square24: "true" }), // unreported overlap
    ],
    baselineRows: [],
    exceptions: loadExceptions(null),
    scanSlots: [{ component: "menubar", slot: "menubar-item" }], // unmeasured
  })
  assert.equal(result.ok, false)
  assert.equal(result.failingCount, 3)
})
