/* Card의 **소비처가 마주치는 계약**만 잰다 — 모양은 #283의 스토리 몫이다.
 * 여기서 재는 것은 눈으로 안 보이는 것: 네임스페이스형 파트가 실제로 나오는가,
 * 그림자를 강제하지 않는가, 서버 컴포넌트로 남는가(package.test.mjs가 더 다룬다),
 * 그리고 여백이 공개 변수 `--ds-card-padding` 하나에서 나오는가(#469). */
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { test } from "node:test"
import { createElement as h } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { compile } from "tailwindcss"

import { Card, cardVariants } from "../dist/card/index.js"
// 파트 클래스는 공개 API가 아니라 서브패스 index에 없다 — 파일을 직접 읽는다
import { cardPartClassNames } from "../dist/card/card.js"
import { cn } from "../dist/lib/utils.js"

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

/* `--spacing(n)` — 컴파일러가 테마 값을 인라인하면 `0.25rem`으로 나온다 */
const spacing = (n) => String.raw`calc\((?:var\(--spacing\)|0\.25rem) \* ${n}\)`

const classesOf = (html) => html.match(/class="([^"]*)"/)[1].split(/\s+/)

test("Card는 네임스페이스형이다 — Root·Header·Body·Footer·Title·Rows 여섯", () => {
  assert.deepEqual(Object.keys(Card).sort(), ["Body", "Footer", "Header", "Root", "Rows", "Title"])
})

test("그림자를 강제하지 않는다 — shadow 유틸리티를 스스로 내지 않는다", () => {
  assert.ok(!/shadow-/.test(cardVariants()), "Root가 여전히 shadow-*를 낸다 — 평평한 디자인은 강제하지 않는 것이 계약이다")
})

test("Body 하나만 있어도 유효하다", () => {
  const html = renderToStaticMarkup(h(Card.Root, null, h(Card.Body, null, "내용")))
  assert.match(html, />내용</)
})

test("전달한 className이 파트마다 기본 클래스와 함께 살아남는다", () => {
  const html = renderToStaticMarkup(h(Card.Header, { className: "text-danger" }, "제목"))
  assert.match(html, /class="[^"]*flex[^"]*text-danger[^"]*"/)
})

/* ---------- 여백 (#469) ---------- */

test("Header·Body·Footer의 좌우 여백과 Root의 위아래 여백이 --ds-card-padding에서 나온다", () => {
  for (const part of ["HEADER", "BODY", "FOOTER"])
    assert.ok(
      cardPartClassNames[part].split(/\s+/).includes("px-(--ds-card-padding)"),
      `${part}의 좌우 여백이 카드 여백 변수를 쓰지 않는다`
    )
  const rootClasses = cardVariants().split(/\s+/)
  assert.ok(rootClasses.includes("py-(--ds-card-padding)"), "Root의 위아래 여백이 카드 여백 변수를 쓰지 않는다")
  assert.ok(rootClasses.includes("gap-6"), "파트 사이 간격은 바꾸지 않는다")
  assert.ok(!rootClasses.some((c) => /--ds-card-padding:/.test(c)), "기본값을 유틸리티로 정의하면 sm: 변형이 앱의 덮어쓰기를 이긴다")
})

test("Root가 data-slot과 data-variant를 내어 파트의 CSS가 부모를 알아본다", () => {
  assert.match(renderToStaticMarkup(h(Card.Root)), /data-slot="card"[^>]*data-variant="default"/)
  assert.match(renderToStaticMarkup(h(Card.Root, { variant: "list" })), /data-variant="list"/)
  assert.match(renderToStaticMarkup(h(Card.Rows)), /data-slot="card-rows"/)
})

/* 기본값은 `@layer components`에 있다 — 앱이 Root에 `[--ds-card-padding:…]`
 * 유틸리티(utilities 층)를 주면 폭과 관계없이 그것이 이긴다. 같은 층의
 * `sm:[--ds-card-padding:…]`였다면 sm 이상에서 앱의 값이 조용히 졌다. */
test("--ds-card-padding의 기본값이 components 층에서 16 → sm 이상 24로 정의된다", () => {
  const css = compiler.build([])
  const layer = css.slice(css.indexOf("@layer components"))
  assert.match(layer, new RegExp(String.raw`\[data-slot="card"\]\s*\{\s*--ds-card-padding:\s*${spacing(4)};`))
  assert.match(layer, new RegExp(String.raw`@media \(width >= 40rem\)\s*\{\s*--ds-card-padding:\s*${spacing(6)};`))
})

test("앱이 Root에서 변수를 덮어쓰면 utilities 층 선언이 나온다", () => {
  const css = compiler.build(["[--ds-card-padding:--spacing(3)]"])
  const utilities = css.slice(css.indexOf("@layer utilities"))
  assert.match(utilities, new RegExp(String.raw`--ds-card-padding:\s*${spacing(3)}`))
})

test("파트에 준 px-*는 카드 여백 변수를 걷어낸다 — 이행 안내의 전제", () => {
  const merged = cn(cardPartClassNames.HEADER, "px-4").split(/\s+/)
  assert.ok(merged.includes("px-4") && !merged.includes("px-(--ds-card-padding)"))
})

/* ---------- 목록 카드 (#469) ---------- */

test("variant 기본값은 default이고 list는 Root의 위아래 여백과 간격을 0으로 만든다", () => {
  assert.equal(cardVariants(), cardVariants({ variant: "default" }))
  const list = classesOf(renderToStaticMarkup(h(Card.Root, { variant: "list" })))
  assert.ok(list.includes("py-0") && list.includes("gap-0"))
  assert.ok(!list.includes("gap-6") && !list.includes("py-(--ds-card-padding)"), "cn이 기본 여백을 걷어내지 못했다")
})

test("목록 카드의 Header·Body·Rows 규칙이 components 층에 있다", () => {
  const css = compiler.build([])
  const layer = css.slice(css.indexOf("@layer components"))
  const rule = (selector) => {
    const at = layer.indexOf(selector)
    assert.ok(at >= 0, `${selector} 규칙이 없다`)
    return layer.slice(at, layer.indexOf("}", at))
  }
  const header = rule('[data-slot="card"][data-variant="list"] > [data-slot="card-header"]')
  assert.match(header, new RegExp(String.raw`padding-block:\s*${spacing(3)}`))
  assert.match(header, /border-bottom:\s*1px solid var\(--ds-border-subtle\)/)
  const body = rule('[data-slot="card"][data-variant="list"] > [data-slot="card-body"]')
  assert.match(body, /padding-block:\s*var\(--ds-card-padding\)/)
  const rows = rule('[data-slot="card-rows"] > *')
  assert.match(rows, /padding-inline:\s*var\(--ds-card-padding\)/)
})

test("카드가 부르는 클래스가 하나도 빠짐없이 선언을 낸다", () => {
  const candidates = new Set()
  for (const classes of [cardVariants(), cardVariants({ variant: "list" }), ...Object.values(cardPartClassNames)])
    for (const c of classes.split(/\s+/)) if (c) candidates.add(c)
  let before = compiler.build([]).length
  const silent = []
  for (const candidate of candidates) {
    const after = compiler.build([candidate]).length
    if (after === before) silent.push(candidate)
    before = after
  }
  assert.deepEqual(silent, [], "이 클래스들은 CSS를 내지 않는다 — 조용히 무효다")
})
