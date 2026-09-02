/* 조합 조립. #22가 정확성의 근거로 든 자리 — 아이콘 크기가 축별 값과 갈리는 칸 —
 * 을 여기서 못박는다. */
import assert from "node:assert/strict"
import { test } from "node:test"

import { assembleCell, cellsOf, inheritedAxesOf, partCellsOf } from "../scripts/manifest/assemble.mjs"
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
  .data-\\[variant\\=sidebar\\]\\:border-r[data-variant="sidebar"] { border-right-style: var(--tw-border-style); border-right-width: 1px; }
  .data-\\[orientation\\=horizontal\\]\\:h-6[data-orientation="horizontal"] { height: calc(0.25rem * 6); }
  .data-\\[state\\=on\\]\\:underline[data-state="on"] { text-decoration-line: underline; }
  .data-\\[state\\=on\\]\\:\\[--ds-state-base\\:var\\(--primary\\)\\][data-state="on"] { --ds-state-base: var(--primary); }
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

test("계약이 이름표를 준 수식자는 unresolved가 아니라 구성 상태의 차이가 된다", () => {
  // 선언(`pressed`)과 그림(`data-[state=on]`)은 키도 값도 다르다 — 이름표는 계약이 진다(#148)
  const drawnBy = { pressed: { attribute: "data-state", values: { pressed: "on" } } }
  const resolved = assembleCell({
    props: { variant: "default", size: "xs" },
    className: "data-[state=on]:underline data-[state=on]:[--ds-state-base:var(--primary)]",
    tree, theme, drawnBy,
  })
  assert.deepEqual(resolved.configurations.pressed.pressed["text-decoration-line"], {
    tier: "literal", value: "underline", from: "data-[state=on]:underline",
  })
  // 쉬는 상태와 같은 뜻이다 — 상태 사다리가 얹히는 면이 이 구성 상태에서 바뀐다
  assert.deepEqual(resolved.configurations.pressed.pressed["background-color"], {
    tier: "token", token: "--ds-bg-accent-solid", from: "data-[state=on]:[--ds-state-base:var(--primary)]",
  })
  // 차이만 담는다 — 쉬는 상태의 자리를 덮어쓰지 않는다
  assert.equal(resolved.properties["text-decoration-line"], undefined)

  // 이름표가 없으면 그대로 unresolved다. 그것이 "아직 못 다뤘다"의 신호다
  const silent = cell("data-[state=on]:underline")
  assert.equal(silent.configurations, undefined)
  assert.equal(silent.properties["data-[state=on]:text-decoration-line"].tier, "unresolved")
})

test("축을 되읽는 수식자는 셀의 축 값에 대고 해소된다", () => {
  // 축은 셀로 전개되므로 셀이 값을 **이미 고정하고 있다** — 판정이 정적이다(#179)
  const on = cell("data-[variant=sidebar]:border-r", { side: "left", variant: "sidebar" })
  assert.deepEqual(on.properties["border-right-width"], { tier: "literal", px: 1, from: "data-[variant=sidebar]:border-r" })
  // 구성 상태가 아니다 — 셀이 이미 골랐으므로 고를 것이 남아 있지 않다
  assert.equal(on.configurations, undefined)

  // 값이 다른 셀에는 그 규칙이 아예 적용되지 않는다. unresolved도 아니고 빈 자리도 아니다
  const off = cell("data-[variant=sidebar]:border-r", { side: "left", variant: "floating" })
  assert.deepEqual(off.properties, {})
})

test("축이 아닌 이름을 읽는 data 수식자는 그대로 unresolved다", () => {
  // 축 되읽기는 셀이 그 축을 가질 때만 걸린다 — 없는 것을 만들어 내지 않는다
  const c = cell("data-[variant=sidebar]:border-r", { size: "xs" })
  assert.equal(c.properties["data-[variant=sidebar]:border-right-width"].tier, "unresolved")
})

test("파트는 지목한 root 축만 물려받고 값·기본값은 root의 것 그대로다", () => {
  const component = {
    config: { variants: { size: { sm: "", lg: "" }, orientation: { horizontal: "", vertical: "" } },
              defaultVariants: { size: "sm", orientation: "horizontal" } },
  }
  const part = {
    config: { variants: { size: { sm: "", lg: "" } }, defaultVariants: { size: "sm" } },
    className: () => "data-[orientation=horizontal]:h-6",
    inheritedAxes: ["orientation"],
  }
  assert.deepEqual(inheritedAxesOf(component, part), {
    orientation: { values: ["horizontal", "vertical"], default: "horizontal" },
  })
  // 지목하지 않은 축(size는 파트 자신의 것)은 곱해지지 않는다 — 2 x 2이지 2 x 2 x 2가 아니다
  const cells = partCellsOf(part, inheritedAxesOf(component, part))
  assert.equal(cells.length, 4)
  assert.deepEqual(cells.map((c) => c.props), [
    { size: "sm", orientation: "horizontal" }, { size: "sm", orientation: "vertical" },
    { size: "lg", orientation: "horizontal" }, { size: "lg", orientation: "vertical" },
  ])

  // 물려받은 축은 클래스를 고르지 않는다 — 어느 수식자가 살아 있는지를 고른다
  assert.ok(cells.every((c) => c.className === "data-[orientation=horizontal]:h-6"))
  const [horizontal, vertical] = cells
  assert.equal(assembleCell({ ...horizontal, tree, theme }).properties.height.px, 24)
  assert.deepEqual(assembleCell({ ...vertical, tree, theme }).properties, {})
})

test("물려받지 않은 파트에서는 같은 수식자가 unresolved로 남는다", () => {
  // 지목이 셀 수를 늘리는 결정이므로, 지목하지 않으면 신호가 그대로 뜬다(#179)
  const component = { config: { variants: { orientation: { horizontal: "", vertical: "" } }, defaultVariants: {} } }
  const part = { config: { variants: {}, defaultVariants: {} }, className: () => "data-[orientation=horizontal]:h-6" }
  const [only] = partCellsOf(part, inheritedAxesOf(component, part))
  assert.deepEqual(only.props, {})
  assert.equal(assembleCell({ ...only, tree, theme }).properties["data-[orientation=horizontal]:height"].tier, "unresolved")
})
