/* Icon의 **소비처가 마주치는 계약**만 잰다 — 스토리·시각은 #280의 Storybook
 * 몫이다. 여기서는 눈으로 안 보이는 것 하나: 이름은 항상 Icon 밖에 있어야
 * 하므로 Icon 자신은 aria-hidden이 기본이다. */
import assert from "node:assert/strict"
import { createElement as h } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { test } from "node:test"

import { Icon, iconVariants } from "../dist/icon/index.js"

function FakeLucideIcon(props) {
  return h("svg", { viewBox: "0 0 24 24", ...props })
}

test("Icon은 기본으로 aria-hidden이다 — 이름은 밖에 있다", () => {
  const html = renderToStaticMarkup(h(Icon, { icon: FakeLucideIcon }))
  assert.match(html, /aria-hidden="true"/)
})

test("size는 텍스트 스케일에 물린 세 값이다 — sm=14px·md=16px·lg=18px", () => {
  assert.match(iconVariants({ size: "sm" }), /(?:^|\s)size-3\.5(?:\s|$)/)
  assert.match(iconVariants({ size: "md" }), /(?:^|\s)size-4(?:\s|$)/)
  assert.match(iconVariants({ size: "lg" }), /(?:^|\s)size-4\.5(?:\s|$)/)
  assert.match(iconVariants(), /(?:^|\s)size-4(?:\s|$)/, "기본값은 md — Button이 자기 svg에 쓰는 크기와 같다")
})

test("전달한 className이 크기 클래스와 함께 살아남는다", () => {
  const html = renderToStaticMarkup(h(Icon, { icon: FakeLucideIcon, size: "lg", className: "text-danger" }))
  assert.match(html, /class="[^"]*size-4\.5[^"]*text-danger[^"]*"/)
})
