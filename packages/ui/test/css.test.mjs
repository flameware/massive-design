/* 파서와 선택자 매칭. 여기서 틀리면 매니페스트가 조용히 빈 칸을 낸다. */
import assert from "node:assert/strict"
import { test } from "node:test"

import { declarations, escapeClass, parseCss, rulesForClass, splitModifiers, starRulesInBase } from "../scripts/manifest/css.mjs"

const CSS = `
@layer utilities {
  .gap-1 { gap: 0.25rem; }
  .gap-1\\.5 { gap: calc(0.25rem * 1.5); }
  .state {
    --ds-state-alpha: 0%;
    background-color: var(--ds-state-base, transparent);
    @supports (color: color-mix(in lab, red, red)) {
      background-color: color-mix(in oklab, var(--ds-state-base, transparent) calc(100% - var(--ds-state-alpha)), var(--ds-state-layer));
    }
    &:hover { --ds-state-alpha: 8%; }
  }
  @media (hover: hover) {
    .hover\\:underline:hover { text-decoration-line: underline; }
  }
  .has-\\[\\>svg\\]\\:px-3:has( > svg) { padding-inline: calc(0.25rem * 3); }
  /* 주석은 무시된다 */
  .content-\\[\\'a\\;b\\'\\] { content: 'a;b'; }
}
`

test("이스케이프는 Tailwind의 선택자 표기와 같다", () => {
  assert.equal(escapeClass("has-[>svg]:px-3"), "has-\\[\\>svg\\]\\:px-3")
  assert.equal(escapeClass("gap-1.5"), "gap-1\\.5")
})

test("이름이 이어지는 클래스를 잘못 물지 않는다", () => {
  const tree = parseCss(CSS)
  const [rule] = rulesForClass(tree, "gap-1")
  assert.deepEqual(declarations(rule), [{ prop: "gap", value: "0.25rem" }])
})

test("@media 안의 규칙도 찾는다", () => {
  const tree = parseCss(CSS)
  const [rule] = rulesForClass(tree, "hover:underline")
  assert.equal(rule.prelude, ".hover\\:underline:hover")
})

test("중첩은 직속 선언과 갈린다", () => {
  const tree = parseCss(CSS)
  const [state] = rulesForClass(tree, "state")
  assert.deepEqual(
    declarations(state).map((d) => d.prop),
    ["--ds-state-alpha", "background-color"]
  )
  assert.deepEqual(
    state.children.filter((n) => n.children).map((n) => n.prelude),
    ["@supports (color: color-mix(in lab, red, red))", "&:hover"]
  )
})

test("문자열 안의 세미콜론은 선언을 끊지 않는다", () => {
  const tree = parseCss(CSS)
  const [rule] = rulesForClass(tree, "content-['a;b']")
  assert.deepEqual(declarations(rule), [{ prop: "content", value: "'a;b'" }])
})

test("대괄호 안의 콜론은 수식자 구분자가 아니다", () => {
  assert.deepEqual(splitModifiers("[--ds-state-base:var(--primary)]"), {
    modifiers: [],
    utility: "[--ds-state-base:var(--primary)]",
  })
  assert.deepEqual(splitModifiers("[&_svg:not([class*='size-'])]:size-3"), {
    modifiers: ["[&_svg:not([class*='size-'])]"],
    utility: "size-3",
  })
  assert.deepEqual(splitModifiers("has-[>svg]:px-3"), { modifiers: ["has-[>svg]"], utility: "px-3" })
})

/* base 계층 (#36). preflight의 선택자 목록을 물면 `border: 0 solid`가 매니페스트에
 * 실려, 고치려던 결함을 매니페스트가 그대로 되풀이한다. */
const BASE_CSS = `
@layer base {
  *, ::after, ::before, ::backdrop, ::file-selector-button {
    box-sizing: border-box;
    border: 0 solid;
  }
  html, :host { line-height: 1.5; }
}
@layer base {
  * {
    border-color: var(--border);
    outline-color: var(--ring);
  }
}
@layer utilities {
  * { color: red; }
}
`

test("base 계층의 * 규칙만 집는다 — preflight의 선택자 목록은 아니다", () => {
  const rules = starRulesInBase(parseCss(BASE_CSS))
  assert.equal(rules.length, 1)
  assert.deepEqual(declarations(rules[0]), [
    { prop: "border-color", value: "var(--border)" },
    { prop: "outline-color", value: "var(--ring)" },
  ])
})
