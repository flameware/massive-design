/* Button의 **소비처가 마주치는 계약**만 잰다 — 모양이 아니라 마크업의 약속.
 *
 * 스토리·스냅숏은 #279의 몫이다. 여기 있는 것은 셋 다 조용히 깨질 수 있고
 * 눈으로는 안 보이는 것들이다: 로딩 중 키보드 활성화, 링크로 render 했을 때의
 * 속성, 그리고 면 색과 상태 레이어 바탕의 짝. */
import assert from "node:assert/strict"
import { createElement as h } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { test } from "node:test"

import { Button, buttonVariants } from "../dist/button/index.js"

const render = (props, children = "저장") => renderToStaticMarkup(h(Button, props, children))

test("loading은 활성화를 막되 포커스는 남긴다", () => {
  const html = render({ loading: true })
  // aria-disabled이지 네이티브 disabled가 아니다 — Base UI가 onClick을 먹으므로
  // 포인터든 Enter/Space든 통과하지 못하고, tabindex는 살아 있다
  assert.match(html, /aria-disabled="true"/)
  assert.match(html, /aria-busy="true"/)
  assert.match(html, /tabindex="0"/)
  assert.ok(!/\sdisabled=/.test(html), "loading이 네이티브 disabled를 걸면 포커스를 잃는다")
})

test("disabled는 네이티브 그대로다 — 포커스를 잃는 것이 맞다", () => {
  const html = render({ disabled: true })
  assert.match(html, /\sdisabled=""/)
  assert.ok(!/aria-busy/.test(html))
})

test("render로 링크를 받으면 button 속성이 따라붙지 않는다", () => {
  const html = render({ variant: "link", render: h("a", { href: "/signup" }) }, "회원가입")
  assert.match(html, /^<a /)
  assert.match(html, /href="\/signup"/)
  // `type`은 <a>에서 MIME 힌트라 뜻이 다르다. nativeButton을 소비처가 끄지
  // 않아도 되는 것이 이 테스트가 지키는 약속이다
  assert.ok(!/type="button"/.test(html))
})

test("면을 칠하는 variant는 상태 레이어의 바탕을 같은 토큰으로 준다", () => {
  // 둘은 손으로 두 번 적힌다(정적 추출 때문에 조립할 수 없다). 어긋나면
  // 버튼은 멀쩡히 칠해지고 hover만 엉뚱한 색에서 섞인다 — 눈으로 못 잡는다
  for (const variant of ["default", "destructive", "outline", "secondary"]) {
    const classes = buttonVariants({ variant })
    const surface = classes.match(/(?:^|\s)bg-([\w-]+)/)?.[1]
    assert.ok(surface, `${variant}에 면 유틸리티가 없다`)
    assert.match(
      classes,
      new RegExp(`\\[--ds-state-base:var\\(--ds-bg-${surface}\\)\\]`),
      `${variant}: bg-${surface}인데 상태 바탕이 --ds-bg-${surface}가 아니다`
    )
  }
})

test("면이 없는 variant는 상태 바탕도 주지 않는다 — 층 자체가 되는 것이 의도다", () => {
  for (const variant of ["ghost", "link"]) {
    assert.ok(!buttonVariants({ variant }).includes("--ds-state-base"), variant)
  }
})
