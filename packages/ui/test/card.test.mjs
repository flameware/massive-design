/* Card의 **소비처가 마주치는 계약**만 잰다 — 모양은 #283의 스토리 몫이다.
 * 여기서 재는 것은 눈으로 안 보이는 것: 네임스페이스형 파트가 실제로 나오는가,
 * 그림자를 강제하지 않는가, 서버 컴포넌트로 남는가(package.test.mjs가 더 다룬다). */
import assert from "node:assert/strict"
import { createElement as h } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { test } from "node:test"

import { Card, cardVariants } from "../dist/card/index.js"

test("Card는 네임스페이스형이다 — Root·Header·Body·Footer·Title 다섯", () => {
  assert.deepEqual(Object.keys(Card).sort(), ["Body", "Footer", "Header", "Root", "Title"])
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
