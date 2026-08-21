/* 해시와 커밋된 산출물.
 *
 * 생성기 자체는 bun으로만 돈다(.tsx를 import한다) — 여기서는 커밋된 매니페스트를
 * 읽어 스스로 앞뒤가 맞는지만 본다. "소스와 어긋났는가"는 manifest-verify가 본다. */
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { test } from "node:test"

import { canonicalJson, hashComponent } from "../scripts/manifest/hash.mjs"

const root = fileURLToPath(new URL("..", import.meta.url))
const read = (name) => JSON.parse(readFileSync(join(root, "dist/manifest", name), "utf8"))

test("정규 JSON은 키를 정렬하고 배열 순서는 지킨다", () => {
  assert.equal(canonicalJson({ b: 1, a: [3, 1, 2] }, 0), '{"a":[3,1,2],"b":1}\n')
})

test("해시는 자기 자신을 입력에서 뺀다", () => {
  const doc = { component: "x", cells: [] }
  const h = hashComponent(doc)
  assert.equal(h.length, 12)
  assert.equal(hashComponent({ ...doc, hash: "다른값" }), h)
})

test("키 순서만 다른 문서는 같은 해시를 낸다", () => {
  assert.equal(hashComponent({ a: 1, b: 2 }), hashComponent({ b: 2, a: 1 }))
})

test("Figma에 대응하지 않는 className 변경은 해시를 바꾸지 않는다", () => {
  const doc = {
    axes: { size: ["default"] },
    base: { "border-color": { tier: "token", token: "--ds-border-default" } },
    cells: [{
      props: { size: "default" },
      className: "border focus-visible:ring-[3px]",
      properties: { color: { tier: "token", token: "--ds-fg-default" } },
    }],
  }

  assert.equal(
    hashComponent(doc),
    hashComponent({ ...doc, cells: [{ ...doc.cells[0], className: "border focus-visible:ring-ring" }] }),
  )
})

test("Figma에 대응하는 properties 변경은 해시를 바꾼다", () => {
  const doc = {
    axes: { size: ["default"] },
    base: {},
    cells: [{
      props: { size: "default" },
      className: "h-9",
      properties: { height: { tier: "literal", px: 36 } },
    }],
  }

  assert.notEqual(
    hashComponent(doc),
    hashComponent({ ...doc, cells: [{
      ...doc.cells[0],
      properties: { height: { tier: "literal", px: 40 } },
    }] }),
  )
})

test("커밋된 매니페스트의 해시가 내용과 맞는다", () => {
  const index = read("index.gen.json")
  assert.ok(index.components.length > 0)
  for (const entry of index.components) {
    const doc = read(entry.path)
    assert.equal(doc.hash, hashComponent(doc), `${entry.component}의 해시가 내용과 다르다`)
    assert.equal(doc.hash, entry.hash, `${entry.component}의 목차 해시가 문서와 다르다`)
    assert.equal(doc.cells.length, entry.cells)
  }
})

test("칸은 축의 곱만큼 있고 빠짐이 없다", () => {
  for (const { path } of read("index.gen.json").components) {
    const doc = read(path)
    const expected = Object.values(doc.axes).reduce((n, values) => n * values.length, 1)
    assert.equal(doc.cells.length, expected)
    const seen = new Set(doc.cells.map((c) => Object.keys(doc.axes).map((a) => c[a]).join("/")))
    assert.equal(seen.size, expected)
  }
})
