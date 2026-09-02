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
  .first\\:rounded-l-md:first-child { border-top-left-radius: 0.5rem; border-bottom-left-radius: 0.5rem; }
  .\\[\\&\\>\\*\\:not\\(\\:first-child\\)\\]\\:rounded-l-none > *:not(:first-child) { border-top-left-radius: 0; border-bottom-left-radius: 0; }
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
  .\\[\\&\\>span\\:last-child\\]\\:truncate > span:last-child { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .md\\:p-12 { @media (width >= 48rem) { padding: calc(0.25rem * 12); } }
  .data-\\[state\\=collapsed\\]\\:data-\\[side\\=left\\]\\:px-2[data-state="collapsed"][data-side="left"] { padding-inline: calc(0.25rem * 2); }
  .\\[\\&\\[data-state\\=on\\]\\>svg\\]\\:size-6[data-state=on] > svg { width: calc(0.25rem * 6); height: calc(0.25rem * 6); }
  .data-\\[state\\=on\\]\\:\\[\\&\\>svg\\]\\:size-6[data-state="on"] > svg { width: calc(0.25rem * 6); height: calc(0.25rem * 6); }
  .\\[\\&_svg\\]\\:data-\\[state\\=on\\]\\:size-6 svg[data-state="on"] { width: calc(0.25rem * 6); height: calc(0.25rem * 6); }
  .\\[\\&_\\[data-slot\\=thumb\\]\\]\\:data-\\[state\\=on\\]\\:underline [data-slot=thumb][data-state="on"] { text-decoration-line: underline; }
  .focus-visible\\:data-\\[slot\\=zzz\\]\\:underline:focus-visible[data-slot="zzz"] { text-decoration-line: underline; }
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

test("무리 안 위치는 셀에서 빠지되 문서 단위로 모인다", () => {
  // `ignore:`처럼 셀에서 사라지지만 **뜻이 반대다** — 그려지되 이 자산이 아닌
  // 조립된 그룹에 그려진다. 조용히 버리면 파생 채널이 침묵과 구분하지 못한다(#180)
  const seen = []
  const c = assembleCell({
    props: { variant: "default", size: "xs" },
    className: "h-6 first:rounded-l-md",
    tree, theme,
    elsewhere: (modifier, reason, prop) => seen.push([modifier, reason, prop]),
  })
  assert.equal(c.properties["first:border-top-left-radius"], undefined)
  assert.equal(c.properties.height.px, 24)
  assert.deepEqual(seen.map(([m, , p]) => [m, p]), [
    ["first", "border-top-left-radius"],
    ["first", "border-bottom-left-radius"],
  ])
  assert.match(seen[0][1], /조립된 그룹/)

  // 수집기를 안 주면 그냥 버린다 — 셀 판정은 수집과 무관하다
  assert.deepEqual(assembleCell({
    props: {}, className: "first:rounded-l-md", tree, theme,
  }).properties, {})
})

test("컨테이너가 자식을 고르는 형태도 같은 등급으로 온다", () => {
  // Button Group은 자식의 props를 건드리지 않겠다는 경계 때문에 컨테이너에서 얹는다 —
  // 형태는 반대지만 그려지는 자리는 같은 조립된 그룹이다(#180)
  const seen = []
  const c = assembleCell({
    props: {}, className: "[&>*:not(:first-child)]:rounded-l-none", tree, theme,
    elsewhere: (modifier, reason, prop) => seen.push([modifier, prop]),
  })
  assert.deepEqual(c.properties, {})
  assert.deepEqual(seen, [
    ["[&>*:not(:first-child)]", "border-top-left-radius"],
    ["[&>*:not(:first-child)]", "border-bottom-left-radius"],
  ])
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

test("계약이 지목한 슬롯은 전역 표를 거치지 않고 그 역할에 담긴다(#181)", () => {
  // `[&>span:last-child]`는 자기가 라벨을 가리킨다고 말하지 않는다. `[&_svg]`가 전역 표에
  // 있는 것과 갈리는 자리이고, 그래서 이름표를 계약이 진다(ADR-0013)
  const bare = cell("[&>span:last-child]:truncate")
  assert.equal(bare.slots, undefined, "지목이 없으면 unresolved다 — 조용히 담기지 않는다")
  assert.equal(bare.properties["[&>span:last-child]:overflow"].tier, "unresolved")

  const c = assembleCell({
    props: {}, className: "[&>span:last-child]:truncate", tree, theme,
    declaredSlots: { label: "[&>span:last-child]" },
  })
  // 속성 이름은 CSS 그대로다 — slot-icon의 개명(height→size)은 정사각형이라는 사실을
  // 담느라 필요했던 것이지 이 필드의 규약이 아니다
  assert.equal(c.slots.label.overflow.value, "hidden")
  assert.equal(c.slots.label["text-overflow"].value, "ellipsis")
  // 무시 화이트리스트는 슬롯 안에서도 그대로 돈다
  assert.equal(c.slots.label["white-space"], undefined)
  assert.equal(Object.keys(c.properties).length, 0)
})

test("규칙을 하나도 내지 않는 표식 클래스는 셀에서 조용히 빠진다(#181)", () => {
  // 컴파일 출력에 규칙이 없는 것이 **의도**인 클래스다. 표에 없는 것은 그대로 unresolved다
  assert.equal(Object.keys(cell("group/item").properties).length, 0)
  assert.equal(cell("group/아직-모르는-것").properties["group/아직-모르는-것"].tier, "unresolved")
})

test("뷰포트 폭에 걸린 선언은 ignore로 빠진다 — 다른 자산이 아니라 다른 뷰포트다(#181)", () => {
  assert.equal(Object.keys(cell("md:p-12").properties).length, 0)
})

/* 복합 수식자의 합성(#182). 사슬은 **경로**이고, 항은 그 자리의 주어에 걸린다. */
const PRESSED = { pressed: { attribute: "data-state", values: { pressed: "on" } } }

test("축 되읽기와 구성 상태가 한 사슬에서 만나면 각자의 일을 한다(#182)", () => {
  const drawnBy = { state: { attribute: "data-state", values: { collapsed: "collapsed" } } }
  const cls = "data-[state=collapsed]:data-[side=left]:px-2"
  // 축은 셀이 이미 고정했으므로 거르고, 남은 구성 상태가 자리를 고른다
  const left = assembleCell({ props: { side: "left" }, className: cls, tree, theme, drawnBy })
  assert.equal(left.configurations.state.collapsed["padding-inline"].px, 8)
  // 축이 거짓인 셀에는 그 규칙이 아예 적용되지 않는다 — unresolved도 빈 자리도 아니다
  const right = assembleCell({ props: { side: "right" }, className: cls, tree, theme, drawnBy })
  assert.deepEqual(right.properties, {})
  assert.equal(right.configurations, undefined)
})

test("주어를 옮긴 뒤의 구성 상태 차이는 그 슬롯 안에 앉는다(#182)", () => {
  const c = assembleCell({ props: {}, className: "data-[state=on]:[&>svg]:size-6", tree, theme, drawnBy: PRESSED })
  // 구성 상태가 바깥이고 슬롯이 안쪽이다 — 한 번의 전환이 여러 노드를 함께 바꾼다
  assert.equal(c.configurations.pressed.pressed.slots.icon.size.px, 24)
  assert.equal(c.slots, undefined)
})

test("같은 뜻의 두 표기가 같은 자리에 앉는다 — 신호가 철자에 좌우되지 않는다(#182)", () => {
  const one = assembleCell({ props: {}, className: "[&[data-state=on]>svg]:size-6", tree, theme, drawnBy: PRESSED })
  const two = assembleCell({ props: {}, className: "data-[state=on]:[&>svg]:size-6", tree, theme, drawnBy: PRESSED })
  assert.equal(one.configurations.pressed.pressed.slots.icon.size.px, 24)
  assert.deepEqual(
    Object.keys(one.configurations.pressed.pressed.slots),
    Object.keys(two.configurations.pressed.pressed.slots),
  )
})

test("주어가 옮겨진 뒤에는 이 자산의 구성 상태가 걸리지 않는다(#182)", () => {
  // `[&_svg]:data-[state=on]`이 그리는 것은 **svg가 on일 때**다. 계약의 `drawnBy`는 이
  // 자산이 무엇을 그리는지를 선언한 것이라 자손의 DOM 사실에까지 이름표를 주지 않는다
  const c = assembleCell({ props: {}, className: "[&_svg]:data-[state=on]:size-6", tree, theme, drawnBy: PRESSED })
  assert.equal(c.properties["[&_svg]:data-[state=on]:height"].tier, "unresolved")
  assert.equal(c.configurations, undefined)
})

test("모르는 항이 하나라도 섞이면 전체가 unresolved다 — 반쪽만 그리지 않는다(#182)", () => {
  // 상태만 읽어 담으면 매니페스트가 **루트가 밑줄을 긋는다**고 말하는데 실제로 긋는 것은 thumb이다
  const c = assembleCell({ props: {}, className: "[&_[data-slot=thumb]]:data-[state=on]:underline", tree, theme, drawnBy: PRESSED })
  assert.equal(c.properties["[&_[data-slot=thumb]]:data-[state=on]:text-decoration-line"].tier, "unresolved")
  assert.equal(c.configurations, undefined)
})

test("떨어뜨리는 항이 모르는 항을 이긴다 — 아는 사실을 신호에 잡음으로 붓지 않는다(#182)", () => {
  // `focus-visible`은 영영 컴포넌트 축이 아니다(②). 나머지를 몰라도 결론이 난다
  const c = cell("focus-visible:data-[slot=zzz]:underline")
  assert.deepEqual(c.properties, {})
})
