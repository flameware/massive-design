import assert from "node:assert/strict"
import { test } from "node:test"

import { catalogLayout, emitCatalogLayout } from "../scripts/manifest/catalog-layout.mjs"

const entries = [
  { component: "alert-dialog" },
  { component: "button" },
]

test("카탈로그 배치는 합의된 기준 좌표를 고정한다", () => {
  assert.deepEqual(catalogLayout, { x: 2000, startY: 0, gap: 120 })
})

test("검사와 정규화 payload는 같은 registry 순서를 소비한다", () => {
  const check = emitCatalogLayout(entries, "check")
  const sync = emitCatalogLayout(entries, "sync")

  for (const code of [check, sync]) {
    assert.match(code, /const EXPECTED = \[\n  "alert-dialog",\n  "button"\n\]/)
    assert.match(code, /const X = 2000/)
    assert.match(code, /const GAP = 120/)
    assert.match(code, /unexpected/)
    assert.match(code, /duplicates/)
    assert.match(code, /massive:\(\[a-z0-9-\]\+\)@/)
  }
  assert.match(check, /const APPLY = false/)
  assert.match(sync, /const APPLY = true/)
})

test("알 수 없는 payload 모드는 거부한다", () => {
  assert.throws(() => emitCatalogLayout(entries, "repair"), /알 수 없는 카탈로그 배치 모드/)
})
