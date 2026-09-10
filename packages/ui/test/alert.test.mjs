/* Alert의 **소비처가 마주치는 계약**만 잰다 — 모양은 #283의 스토리 몫이다.
 *
 * 여기서 재는 것 셋: role이 톤을 따라 갈리는가(긴급도), 톤마다 쓰는 색이
 * packages/tokens/scripts/contrast.mjs가 이미 검증한 조합인가, 네임스페이스형
 * 파트가 나오는가. */
import assert from "node:assert/strict"
import { createElement as h } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { test } from "node:test"

import { Alert, alertVariants } from "../dist/alert/index.js"

test("Alert는 네임스페이스형이다 — Root·Title·Description 셋", () => {
  assert.deepEqual(Object.keys(Alert).sort(), ["Description", "Root", "Title"])
})

test("danger는 role=alert(assertive), neutral은 role=status(polite)다", () => {
  assert.match(renderToStaticMarkup(h(Alert.Root, { tone: "danger" })), /role="alert"/)
  assert.match(renderToStaticMarkup(h(Alert.Root, { tone: "neutral" })), /role="status"/)
  assert.match(renderToStaticMarkup(h(Alert.Root, null)), /role="status"/, "기본 톤은 neutral이다")
})

test("danger 톤은 fg.danger·bg.danger.soft만 쓴다 — 대비 게이트가 검증한 조합", () => {
  const classes = alertVariants({ tone: "danger" })
  assert.match(classes, /(?:^|\s)text-danger(?:\s|$)/)
  assert.match(classes, /(?:^|\s)bg-danger-soft(?:\s|$)/)
  assert.match(classes, /(?:^|\s)border-danger(?:\s|$)/)
  // fg.muted × bg.danger.soft는 contrast.mjs의 TEXT_PAIRS에 없다 — 만들지 않는다
  assert.ok(!/text-muted/.test(classes))
})

test("neutral 톤은 fg.default·bg.neutral.soft를 쓴다 — 대비 게이트가 검증한 조합", () => {
  const classes = alertVariants({ tone: "neutral" })
  assert.match(classes, /(?:^|\s)text-default(?:\s|$)/)
  assert.match(classes, /(?:^|\s)bg-neutral-soft(?:\s|$)/)
})

test("아이콘은 격자 1열, 제목·설명은 2열이다 — 아이콘 유무와 무관하게 정렬이 유지된다", () => {
  // Root가 직속 자식 svg를 [&>svg]: 셀렉터로 1열에 앉힌다(alert.tsx) — 클래스가
  // svg 위가 아니라 부모 위에 있으므로 여기서 재는 것은 그 후보 클래스다
  assert.match(alertVariants(), /\[&>svg\]:col-start-1/)

  const html = renderToStaticMarkup(h(Alert.Title, null, "실패"))
  assert.match(html, /class="[^"]*col-start-2[^"]*"/)
})
