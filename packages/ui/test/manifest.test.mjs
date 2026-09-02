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

test("part의 Figma 속성 변경은 세대 해시를 바꾼다", () => {
  const doc = {
    axes: {}, base: {}, cells: [], configurationStates: {}, anatomy: ["Table", "TableCell*"],
    parts: { TableCell: { axes: {}, defaults: {}, cells: [{ properties: { padding: { tier: "literal", px: 8 } } }] } },
  }
  assert.notEqual(hashComponent(doc), hashComponent({
    ...doc,
    parts: { TableCell: { ...doc.parts.TableCell, cells: [{ properties: { padding: { tier: "literal", px: 12 } } }] } },
  }))
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

test("공개 루트의 anatomy와 구성 상태가 매니페스트에 남는다", () => {
  const table = read("table.gen.json")
  const checkbox = read("checkbox.gen.json")
  assert.ok(table.anatomy.includes("TableRow*"))
  assert.deepEqual(table.configurationStates.row, ["default", "selected"])
  assert.deepEqual(checkbox.configurationStates.checked, ["unchecked", "checked", "indeterminate"])
})

test("합성 part의 스타일이 루트와 분리된 조합으로 남는다", () => {
  const table = read("table.gen.json")
  assert.deepEqual(Object.keys(table.parts), [
    "TableBody", "TableCaption", "TableCell", "TableHead", "TableHeader", "TableRow",
  ])
  assert.equal(table.parts.TableHead.cells[0].properties.height.px, 40)
  assert.equal(table.parts.TableHead.cells[0].properties["padding-inline"].px, 8)
  assert.equal(table.parts.TableCell.cells[0].properties.padding.px, 8)
  assert.equal(table.parts.TableCaption.cells[0].properties["margin-top"].px, 16)
})

test("Item의 하위 파트 스타일이 루트와 분리된 조합으로 남는다", () => {
  const item = read("item.gen.json")
  assert.deepEqual(Object.keys(item.parts), [
    "ItemActions", "ItemContent", "ItemDescription", "ItemFooter", "ItemGroup",
    "ItemHeader", "ItemMedia", "ItemSeparator", "ItemTitle",
  ])
  assert.equal(item.parts.ItemContent.cells[0].properties.gap.px, 4)
  assert.equal(item.parts.ItemTitle.cells[0].properties["font-weight"].value, "500")
  assert.equal(item.parts.ItemDescription.cells[0].properties["font-size"].px, 14)
  assert.equal(item.parts.ItemActions.cells[0].properties.gap.px, 8)
})

/* 중립 채움은 두 역할이고 각각 이름으로 구분된다(CONTEXT.md, #109).
 * 컨트롤 어포던스는 앉는 면에 3:1이 필요해 solid를 집고, 잔여 트랙은 대비 요구가
 * 없어 값이 그대로 남되 **한 가지** 이름으로 정렬한다 — 전에는 셋으로 갈려 있었다. */
test("컨트롤 어포던스는 solid 중립을, 잔여 트랙은 한 이름을 집는다", () => {
  const affordance = "--ds-bg-neutral-solid"
  const remainder = "--ds-bg-neutral-soft"
  assert.equal(
    read("scroll-area.gen.json").parts.ScrollAreaThumb.cells[0].properties["background-color"].token,
    affordance
  )
  assert.equal(read("switch.gen.json").cells[0].state.base, affordance)
  assert.equal(read("progress.gen.json").cells[0].properties["background-color"].token, remainder)
  assert.equal(
    read("slider.gen.json").parts.SliderTrack.cells[0].properties["background-color"].token,
    remainder
  )
})
