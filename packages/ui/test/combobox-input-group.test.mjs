/* Combobox.InputGroup의 **눈으로 안 보이는 계약**만 잰다(#487) — 치수·후보 목록
 * 폭·포커스 링의 실제 그림은 스토리 몫이다(apps/storybook/test/combobox-input-group.test.mjs).
 *
 *   - 파트가 나오고, 부모 선택자 규칙의 걸쇠(`data-slot`)를 단다
 *   - 밑그림은 fieldControlBase를 글자 그대로 펴고, 더하는 것은 포커스 링 한 줄이다
 *   - 그룹 안 Combobox.Input은 맨 칸이고, 그룹 밖은 지금과 글자 그대로 같다
 *   - 그룹 안 ToggleGroup 규칙이 components 층에 important 없이 있고 실제 CSS로 나온다 */
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { test } from "node:test"
import { createElement as h } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { compile } from "tailwindcss"

import { Combobox, comboboxInputGroupVariants, comboboxInputVariants } from "../dist/combobox/index.js"
import { fieldControlBase } from "../dist/lib/field-control.js"

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

const compiler = await compile(readFileSync(entry, "utf8"), {
  base: dirname(entry),
  loadStylesheet,
  loadModule: async () => {
    throw new Error("JS 설정은 쓰지 않는다")
  },
})

const classesOfTag = (html, tag) =>
  (html.match(new RegExp(`<${tag}[^>]*?class="([^"]*)"`))?.[1] ?? "").replaceAll("&gt;", ">")
const has = (classes, name) => classes.split(/\s+/).includes(name)

const inGroup = (input) =>
  renderToStaticMarkup(h(Combobox.Root, { items: ["a"] }, h(Combobox.InputGroup, null, input)))

test("Combobox에 InputGroup 파트가 있다", () => {
  assert.ok(Object.keys(Combobox).includes("InputGroup"))
})

test("그룹이 data-slot과 group 역할을 낸다", () => {
  const html = inGroup(h(Combobox.Input, { "aria-label": "종목" }))
  assert.match(html, /^<div[^>]*data-slot="combobox-input-group"/)
  assert.match(html, /^<div[^>]*role="group"/)
})

test("그룹 밑그림은 fieldControlBase를 글자 그대로 펴고, 포커스 링 한 줄만 더한다", () => {
  const classes = comboboxInputGroupVariants()
  for (const cls of fieldControlBase.join(" ").split(/\s+/)) assert.ok(has(classes, cls), `그룹에 ${cls}가 없다`)
  assert.ok(has(classes, "has-[>input:focus-visible]:outline-2"))
  assert.ok(has(classes, "h-9") && has(classes, "border") && has(classes, "rounded-md"))
  assert.equal(classesOfTag(inGroup(h(Combobox.Input, { "aria-label": "종목" })), "div"), classes)
})

test("그룹 안 Combobox.Input은 맨 칸이다 — 테두리·면·자기 링이 없다", () => {
  const classes = classesOfTag(inGroup(h(Combobox.Input, { "aria-label": "종목" })), "input")
  assert.ok(classes, "입력이 그려지지 않았다")
  for (const cls of ["border", "border-field", "bg-surface", "focus-visible:outline-2"])
    assert.ok(!has(classes, cls), `그룹 안 입력에 ${cls}가 남았다`)
  assert.ok(has(classes, "bg-transparent") && has(classes, "flex-1") && has(classes, "border-0"))
})

test("그룹 밖 Combobox.Input은 지금과 같다", () => {
  const html = renderToStaticMarkup(h(Combobox.Root, { items: ["a"] }, h(Combobox.Input, { "aria-label": "종목" })))
  assert.equal(classesOfTag(html, "input"), comboboxInputVariants())
})

test("포커스 링과 그룹 안 ToggleGroup 규칙이 실제 CSS로 나온다", () => {
  const css = compiler.build(comboboxInputGroupVariants().split(/\s+/))
  assert.match(css, /:has\(\s*>\s*input:focus-visible\)/, "포커스 링 규칙이 나오지 않았다")

  /** 규칙 바로 앞의 층 선언이 components여야 한다 — utilities에 두면 앱의 className까지 이긴다 */
  const inComponents = (match) => {
    const before = css.slice(0, match.index)
    return before.slice(before.lastIndexOf("@layer ")).startsWith("@layer components {")
  }
  const panel = /\[data-slot="combobox-input-group"\]\s*>\s*\[data-slot="toggle-group"\]\s*\{([^}]*)\}/.exec(css)
  assert.ok(panel && inComponents(panel), "판 규칙이 components 층에 없다")
  assert.match(panel[1], /border-width:\s*0/)
  assert.match(panel[1], /background-color:\s*transparent/)
  const item = /\[data-slot="combobox-input-group"\]\s*>\s*\[data-slot="toggle-group"\]\[data-size\]\s*\{([^}]*)\}/.exec(css)
  assert.ok(item && inComponents(item), "항목 높이 규칙이 components 층에 없다")
  assert.match(item[1], /--ds-toggle-item-height:[^;]*7\.5/)
  // important 없이 같은 층의 명시도로 이긴다 — 앱의 className(utilities)은 여전히 이긴다
  assert.ok(!/!important/.test(panel[1] + item[1]), "important는 앱의 className까지 막는다(rules.md #469)")
})
