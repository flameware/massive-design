/* Collapsible(#486)의 **눈으로 안 보이는 계약**만 잰다 — 열고 닫히는 동작,
 * aria 배선, 카드 안 머리 치수는 스토리 seam(apps/storybook)이 렌더링된 값으로
 * 잰다. 여기서 재는 것: 네임스페이스형 파트가 나오는가, 파트가 card.css가
 * 알아볼 `data-slot`을 내는가, chevron이 열림 상태에서 회전하고 reduced-motion
 * 에서 전환이 없는가, 목록 카드 안 배치 규칙이 components 층에 있는가. */
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { test } from "node:test"
import { createElement as h } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { compile } from "tailwindcss"

import { Collapsible } from "../dist/collapsible/index.js"
// 파트 클래스는 공개 API가 아니라 서브패스 index에 없다 — 파일을 직접 읽는다
import { collapsiblePartClassNames } from "../dist/collapsible/collapsible.js"

const root = fileURLToPath(new URL("..", import.meta.url))
const entry = resolve(root, "src/styles.css")

async function loadStylesheet(id, base) {
  const path =
    id === "tailwindcss"
      ? fileURLToPath(import.meta.resolve("tailwindcss/index.css"))
      : id.startsWith(".")
        ? resolve(base, id)
        : fileURLToPath(import.meta.resolve(id))
  return { path, base: dirname(path), content: readFileSync(path, "utf8") }
}

/* 컴파일러는 빌드할수록 후보를 쌓는다 — 방출 여부를 길이 차이로 재는 테스트는
 * 앞 테스트가 쌓은 것에 속지 않게 새 컴파일러를 쓴다 */
const makeCompiler = () =>
  compile(readFileSync(entry, "utf8"), {
    base: dirname(entry),
    loadStylesheet,
    loadModule: async () => {
      throw new Error("JS 설정은 쓰지 않는다")
    },
  })
const compiler = await makeCompiler()

/* `--spacing(n)` — 컴파일러가 테마 값을 인라인하면 `0.25rem`으로 나온다 */
const spacing = (n) => String.raw`calc\((?:var\(--spacing\)|0\.25rem) \* ${n}\)`

const render = (props = {}) =>
  renderToStaticMarkup(
    h(
      Collapsible.Root,
      props,
      h(Collapsible.Trigger, null, "노트 없는 종목 20"),
      h(Collapsible.Panel, null, h("p", null, "펼친 내용"))
    )
  )

test("Collapsible은 네임스페이스형이다 — Root·Trigger·Panel 셋", () => {
  assert.deepEqual(Object.keys(Collapsible).sort(), ["Panel", "Root", "Trigger"])
})

test("파트가 card.css가 알아볼 data-slot을 낸다", () => {
  const html = render({ defaultOpen: true })
  assert.match(html, /<div[^>]*data-slot="collapsible"/)
  assert.match(html, /<button[^>]*data-slot="collapsible-trigger"/)
  assert.match(html, /<div[^>]*data-slot="collapsible-panel"/)
})

test("Trigger가 chevron을 직접 그리고 그 뒤에 라벨을 둔다 — chevron은 접근성 트리 밖이다", () => {
  const html = render()
  assert.match(html, /<button[^>]*><svg[^>]*aria-hidden="true"[^>]*>.*<\/svg>노트 없는 종목 20<\/button>/)
})

test("Trigger의 aria-expanded가 열림 상태를 따르고 aria-controls가 Panel의 id를 가리킨다", () => {
  const open = render({ defaultOpen: true })
  const controls = open.match(/<button[^>]*aria-controls="([^"]+)"/)?.[1]
  assert.ok(controls, "Trigger에 aria-controls가 없다")
  assert.match(open, new RegExp(`<div[^>]*id="${controls}"[^>]*data-slot="collapsible-panel"`))
  assert.match(open, /<button[^>]*aria-expanded="true"/)
  assert.match(render(), /<button[^>]*aria-expanded="false"/)
})

test("닫혀 있으면 Panel이 렌더되지 않는다 — 안의 요소가 탭 순서에 없다", () => {
  assert.doesNotMatch(render(), /펼친 내용/)
  assert.match(render({ defaultOpen: true }), /펼친 내용/)
})

test("전달한 className이 파트마다 기본 클래스와 함께 살아남는다", () => {
  const html = renderToStaticMarkup(
    h(Collapsible.Root, { className: "mt-4" }, h(Collapsible.Trigger, { className: "text-danger" }, "라벨"))
  )
  assert.match(html, /data-slot="collapsible"[^>]*class="mt-4"|class="mt-4"[^>]*data-slot="collapsible"/)
  assert.match(html, /<button[^>]*class="[^"]*text-sm[^"]*text-danger[^"]*"/)
})

test("chevron은 열린 Trigger(data-panel-open) 안에서 90° 돌고, reduced-motion에서는 전환이 없다", () => {
  const icon = collapsiblePartClassNames.ICON.split(/\s+/)
  assert.ok(icon.includes("in-data-panel-open:rotate-90"), "열림 상태의 회전이 없다")
  assert.ok(icon.includes("motion-reduce:transition-none"), "chevron 회전이 reduced-motion을 무시한다")
  const css = compiler.build(["in-data-panel-open:rotate-90"])
  assert.match(css, /:where\(\[data-panel-open\]\) &|:where\(\[data-panel-open\]\) \.in-data-panel-open\\:rotate-90/)
})

test("Panel의 높이 전환은 Base UI의 --collapsible-panel-height를 쓰고 reduced-motion에서 꺼진다", () => {
  const panel = collapsiblePartClassNames.PANEL.split(/\s+/)
  assert.ok(panel.includes("h-(--collapsible-panel-height)"))
  assert.ok(panel.includes("data-starting-style:h-0") && panel.includes("data-ending-style:h-0"))
  assert.ok(panel.includes("motion-reduce:transition-none"))
  const css = compiler.build(["motion-reduce:transition-none"])
  assert.match(
    css,
    /@media \(prefers-reduced-motion: reduce\)\s*\{\s*\.motion-reduce\\:transition-none\s*\{\s*transition-property:\s*none/
  )
})

test("파트가 부르는 클래스가 빠짐없이 선언을 낸다", async () => {
  const fresh = await makeCompiler()
  const candidates = new Set(Object.values(collapsiblePartClassNames).flatMap((c) => c.split(/\s+/)))
  let before = fresh.build([]).length
  const silent = []
  for (const candidate of candidates) {
    if (!candidate) continue
    const after = fresh.build([candidate]).length
    if (after === before) silent.push(candidate)
    before = after
  }
  assert.deepEqual(silent, [], "이 클래스들은 CSS를 내지 않는다 — 조용히 무효다")
})

/* ---------- 목록 카드 안 (#486) ----------
 * 새 축이 아니라 card.css의 부모 선택자 규칙이다 — 목록 카드 Header·Footer와
 * 같은 방식이고 `>`로 직계만 겨눠 카드 밖이나 중첩된 카드에 새지 않는다. */

const components = () => {
  const css = compiler.build([])
  return css.slice(css.indexOf("@layer components"))
}
/* 선택자로 시작하는 규칙 하나 — 줄 첫머리에서 찾아 더 긴 선택자의 꼬리에 걸리지 않는다 */
const rule = (layer, selector) => {
  const found = layer.indexOf(`\n  ${selector}`)
  const at = found < 0 ? -1 : found + 3
  assert.ok(at >= 0, `${selector} 규칙이 없다`)
  return layer.slice(at, layer.indexOf("}", at))
}

const IN_LIST = '[data-slot="card"][data-variant="list"] > [data-slot="collapsible"]'

test("목록 카드 안 Collapsible은 위 구분선을 갖는다", () => {
  assert.match(rule(components(), `${IN_LIST} {`), /border-top:\s*1px solid var\(--ds-border-subtle\)/)
})

test("목록 카드 안 Trigger는 Card.Header(list)와 같은 치수다 — 위아래 12 · 좌우 카드 여백 · 폭 전체", () => {
  const trigger = rule(components(), `${IN_LIST} > [data-slot="collapsible-trigger"] {`)
  assert.match(trigger, new RegExp(String.raw`padding-block:\s*${spacing(3)}`))
  assert.match(trigger, /padding-inline:\s*var\(--ds-card-padding\)/)
  assert.match(trigger, /width:\s*100%/)
  assert.match(trigger, /--ds-state-base:\s*var\(--ds-bg-surface\)/, "카드 면 위 항목의 상태 바탕은 카드 면색이다")
})

test("목록 카드 안 Panel의 Card.Rows는 위 구분선으로 머리와 나뉜다", () => {
  const rows = rule(
    components(),
    `${IN_LIST} > [data-slot="collapsible-panel"] > [data-slot="card-rows"]`
  )
  assert.match(rows, /border-top:\s*1px solid var\(--ds-border-subtle\)/)
})

test("Trigger의 홀로 선 모양(여백·radius)은 components 층에 있어 카드 규칙과 앱의 className이 이긴다", () => {
  const layer = components()
  const alone = rule(layer, '[data-slot="collapsible-trigger"] {')
  assert.match(alone, /padding-block:/)
  assert.match(alone, /border-radius:\s*var\(--radius-md\)/)
  for (const part of ["TRIGGER", "ICON", "PANEL"])
    assert.ok(
      !collapsiblePartClassNames[part].split(/\s+/).some((c) => /^(?:p[xytblr]?|rounded(?:-[a-z]+)?)-/.test(c)),
      `${part}가 여백·radius를 유틸리티로 낸다 — utilities 층이라 card.css 규칙을 이긴다`
    )
})
