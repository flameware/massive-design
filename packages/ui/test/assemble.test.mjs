/* 조합 조립. #22가 정확성의 근거로 든 자리 — 아이콘 크기가 축별 값과 갈리는 칸 —
 * 을 여기서 못박는다. */
import assert from "node:assert/strict"
import { test } from "node:test"

import { assembleCell, cellsOf } from "../scripts/manifest/assemble.mjs"
import { parseCss } from "../scripts/manifest/css.mjs"
import { loadTheme } from "../scripts/manifest/theme.mjs"

const CSS = `
@layer theme { :root, :host { --text-xs: 0.75rem; } }
@layer utilities {
  .h-6 { height: calc(0.25rem * 6); }
  .gap-1 { gap: 0.25rem; }
  .px-2 { padding-inline: calc(0.25rem * 2); }
  .text-xs { font-size: var(--text-xs); line-height: var(--tw-leading, 1.6); }
  .disabled\\:opacity-50:disabled { opacity: 50%; }
  .data-open\\:underline[data-open] { text-decoration-line: underline; }
  .state {
    --ds-state-alpha: 0%;
    background-color: var(--ds-state-base, transparent);
    @supports (color: color-mix(in lab, red, red)) {
      background-color: color-mix(in oklab, var(--ds-state-base, transparent) calc(100% - var(--ds-state-alpha)), var(--ds-state-layer));
    }
    &:hover { --ds-state-alpha: 8%; }
    &:active { --ds-state-alpha: 12%; }
  }
  .\\[--ds-state-base\\:var\\(--primary\\)\\] { --ds-state-base: var(--primary); }
  .\\[\\&_svg\\:not\\(\\[class\\*\\=\\'size-\\'\\]\\)\\]\\:size-3 svg:not([class*='size-']) { width: calc(0.25rem * 3); height: calc(0.25rem * 3); }
  .\\[\\&_svg\\:not\\(\\[class\\*\\=\\'size-\\'\\]\\)\\]\\:size-4 svg:not([class*='size-']) { width: calc(0.25rem * 4); height: calc(0.25rem * 4); }
}
`
const TOKENS_CSS = `
:root {
  --ds-bg-accent-solid: var(--ds-palette-brand-light-9);
  --primary: var(--ds-bg-accent-solid);
}
`
const SCALE = JSON.stringify({
  type: { size: { xs: { $value: "0.75rem", $extensions: { "design.massive.px": 12 } } } },
  space: {
    base: { $value: "0.25rem", $extensions: { "design.massive.px": 4 } },
    1: { $value: "0.25rem", $extensions: { "design.massive.px": 4 } },
    2: { $value: "0.5rem", $extensions: { "design.massive.px": 8 } },
    3: { $value: "0.75rem", $extensions: { "design.massive.px": 12 } },
    6: { $value: "1.5rem", $extensions: { "design.massive.px": 24 } },
  },
  radius: {},
  borderWidth: {},
})

const tree = parseCss(CSS)
const theme = loadTheme({ tokensCss: TOKENS_CSS, scaleJson: SCALE, compiledCss: CSS })
const cell = (className, props = { variant: "default", size: "xs" }) =>
  assembleCell({ props, className, tree, theme })

test("축의 데카르트 곱이 곧 칸이다", () => {
  const cells = cellsOf({ variants: { variant: { a: "", b: "" }, size: { s: "", m: "", l: "" } } })
  assert.equal(cells.length, 6)
  assert.deepEqual(cells[0], { variant: "a", size: "s" })
})

test("아이콘 크기는 병합된 결과를 따른다 — 축별 값이 아니다", () => {
  // base의 size-4를 xs의 size-3이 덮는다. 축별로 담았다면 16px이라고 말했을 자리다
  const c = cell("[&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='size-'])]:size-3 gap-1")
  assert.equal(c.slots.icon.size.px, 12)
  assert.equal(c.slots.icon.gap.px, 4)
})

test("state는 레시피로 담기고 base는 semantic까지 내려간다", () => {
  const c = cell("state [--ds-state-base:var(--primary)] disabled:opacity-50 h-6 px-2 text-xs")
  assert.deepEqual(c.state, {
    base: "--ds-bg-accent-solid",
    layer: "--ds-state-layer",
    hover: 0.08,
    pressed: 0.12,
    disabled: 0.5,
  })
  assert.deepEqual(c.properties["background-color"], {
    tier: "token", token: "--ds-bg-accent-solid", from: "state",
  })
  assert.equal(c.properties["line-height"].token, "--text-xs--line-height")
})

test("바탕이 없는 variant는 base 없이 드러난다", () => {
  const c = cell("state disabled:opacity-50")
  assert.equal(c.state.base, null)
  assert.deepEqual(c.properties["background-color"], { tier: "literal", value: "transparent", from: "state" })
})

test("state가 아예 없는 variant는 state가 null이다", () => {
  assert.equal(cell("h-6 disabled:opacity-50").state, null)
})

test("처음 보는 수식자는 조용히 사라지지 않고 unresolved로 뜬다", () => {
  const c = cell("data-open:underline")
  assert.equal(c.properties["data-open:text-decoration-line"].tier, "unresolved")
})
