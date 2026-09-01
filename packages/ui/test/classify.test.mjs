/* 3단 판정. 여기가 틀리면 Figma가 리터럴로 도배되거나, 반대로 없는 변수를 집는다. */
import assert from "node:assert/strict"
import { test } from "node:test"

import { MODIFIER_POLICY, classifyDeclaration, classifyShadow, policyFor, resolveVarChain } from "../scripts/manifest/classify.mjs"
import { lengthToPx, loadTheme, normalizeShadow, parseVar } from "../scripts/manifest/theme.mjs"

const TOKENS_CSS = `
:root {
  --ds-bg-accent-solid: var(--ds-palette-brand-light-9);
  --primary: var(--ds-bg-accent-solid);
  --leaky: var(--ds-palette-brand-light-9);
  --radius: 0.625rem;
}
@theme inline {
  --color-primary: var(--primary);
  --radius-md: 0.5rem;
  --shadow-xs: 0 1px 2px 0 rgb(0 0 0 / .05);
}
`
const SCALE = JSON.stringify({
  type: { size: { sm: { $value: "0.875rem", $extensions: { "design.massive.px": 14 } } } },
  space: {
    base: { $value: "0.25rem", $extensions: { "design.massive.px": 4 } },
    2: { $value: "0.5rem", $extensions: { "design.massive.px": 8 } },
    4: { $value: "1rem", $extensions: { "design.massive.px": 16 } },
  },
  radius: { md: { $value: "0.5rem", $extensions: { "design.massive.px": 8 } } },
  borderWidth: { 1: { $value: "1px", $extensions: { "design.massive.px": 1 } } },
})
const COMPILED = `@layer theme {
  :root, :host {
    --text-sm: 0.875rem;
    --font-weight-medium: 500;
  }
}
@layer utilities { .x { color: red } }`

const theme = loadTheme({ tokensCss: TOKENS_CSS, scaleJson: SCALE, compiledCss: COMPILED })

test("길이와 변수를 읽는다", () => {
  assert.equal(lengthToPx("calc(0.25rem * 6)"), 24)
  assert.equal(lengthToPx("0.5rem"), 8)
  assert.equal(lengthToPx("1px"), 1)
  assert.equal(lengthToPx("1.6"), null)
  assert.deepEqual(parseVar("var(--ds-state-base, transparent)"), { name: "--ds-state-base", fallback: "transparent" })
  assert.equal(parseVar("0.5rem"), null)
})

test("별칭 사슬은 --ds-* 에서 멈춘다", () => {
  assert.deepEqual(resolveVarChain(theme, "--primary"), { kind: "token", token: "--ds-bg-accent-solid" })
  assert.deepEqual(resolveVarChain(theme, "--leaky"), { kind: "primitive", name: "--ds-palette-brand-light-9" })
  assert.equal(resolveVarChain(theme, "--nope").kind, "unknown")
})

// ⚠️ 이 픽스처의 `color: text-primary`는 **일부러 잘못된 조합**이다 — #37이
// 잡은 결함 그 자체이고, 이제 scripts/manifest/lint.mjs가 이 모양을 막는다.
// 여기서는 별칭 사슬이 --ds-*까지 내려가는지만 보므로 그대로 둔다. 실제
// 컴포넌트의 올바른 짝은 `color: text-link` → --ds-fg-link다
test("색은 semantic 이름까지 내려간다", () => {
  assert.deepEqual(classifyDeclaration(theme, "color", "var(--primary)", "text-primary"), {
    prop: "color",
    entry: { tier: "token", token: "--ds-bg-accent-solid", from: "text-primary" },
  })
})

test("primitive를 집으면 unresolved로 뜬다", () => {
  const { entry } = classifyDeclaration(theme, "color", "var(--leaky)", "text-leaky")
  assert.equal(entry.tier, "unresolved")
})

test("인라인된 리터럴은 scale.json에서 되짚는다", () => {
  assert.deepEqual(classifyDeclaration(theme, "border-radius", "0.5rem", "rounded-md").entry, {
    tier: "token", token: "--radius-md", scale: "radius.md", px: 8, from: "rounded-md",
  })
  assert.deepEqual(classifyDeclaration(theme, "padding-inline", "calc(0.25rem * 4)", "px-4").entry, {
    tier: "token", token: "--spacing", scale: "space.4", multiple: 4, px: 16, from: "px-4",
  })
  assert.deepEqual(classifyDeclaration(theme, "border-width", "1px", "border").entry, {
    tier: "token", scale: "borderWidth.1", px: 1, from: "border",
  })
})

test("Figma에 없는 단계는 literal이다 — 실패가 아니다", () => {
  assert.deepEqual(classifyDeclaration(theme, "height", "calc(0.25rem * 9)", "h-9").entry, {
    tier: "literal", px: 36, from: "h-9",
  })
})

test("Tailwind 기본 변수도 스케일에 있으면 token이다", () => {
  assert.deepEqual(classifyDeclaration(theme, "font-size", "var(--text-sm)", "text-sm").entry, {
    tier: "token", token: "--text-sm", scale: "type.size.sm", px: 14, from: "text-sm",
  })
  // Figma에 대응 변수가 없는 것은 값으로 남는다
  assert.deepEqual(classifyDeclaration(theme, "font-weight", "var(--font-weight-medium)", "font-medium").entry, {
    tier: "literal", value: "500", from: "font-medium",
  })
})

test("--tw-* 내부 변수는 폴백이 쉬는 상태의 값이다", () => {
  assert.deepEqual(classifyDeclaration(theme, "line-height", "var(--tw-leading, 1.6)", "text-sm").entry, {
    tier: "literal", value: "1.6", from: "text-sm",
  })
  assert.equal(classifyDeclaration(theme, "border-style", "var(--tw-border-style)", "border"), null)
})

test("무시 화이트리스트는 null을 낸다", () => {
  assert.equal(classifyDeclaration(theme, "transition-property", "all", "transition-all"), null)
  assert.equal(classifyDeclaration(theme, "--tw-shadow", "0 1px", "shadow-xs"), null)
})

test("그림자는 색 자리를 벗겨 되짚는다", () => {
  assert.equal(normalizeShadow("0 1px 2px 0 var(--tw-shadow-color, rgb(0 0 0 / .05))"), "0 1px 2px 0 rgb(0 0 0 / .05)")
  const hit = classifyShadow(theme, [{ prop: "--tw-shadow", value: "0 1px 2px 0 var(--tw-shadow-color, rgb(0 0 0 / .05))" }], "shadow-xs")
  assert.deepEqual(hit.entry, { tier: "token", token: "--shadow-xs", scale: "shadow.xs", from: "shadow-xs" })
})

/* 정책 조회는 뜻에 걸린다(#178). 여기가 느슨해지면 같은 뜻의 다음 변종이 또 unresolved로
 * 새고, 반대로 헐거워지면 서로 다른 것이 한 뜻으로 접힌다. 양쪽을 다 못박는다. */

test("도달 경로는 그림을 바꾸지 않는다 — disabled의 여섯 형태가 한 뜻이다", () => {
  for (const mod of [
    "disabled",                    // 자기 자신
    "data-[disabled]",             // 존재 형태
    "data-[disabled=true]",        // 값 형태
    "aria-disabled",               // 접근성 속성
    "has-[:disabled]",             // 자손이 disabled
    "peer-disabled",               // 형제가 disabled
    "group-data-[disabled=true]",  // 조상이 disabled
  ]) assert.equal(policyFor(mod), "state", mod)
})

test("자식 결합자와 자손 결합자는 같은 슬롯을 가리킨다", () => {
  assert.equal(policyFor("[&>svg]"), "slot-icon")
  assert.equal(policyFor("[&_svg]"), "slot-icon")
  assert.equal(policyFor("has-[>svg]"), "slot-icon")
  assert.equal(policyFor("[&_svg:not([class*='size-'])]"), "slot-icon")
})

test("임의 변형 안의 상태부가 뜻이다 — 요소부는 도달 경로다", () => {
  assert.match(policyFor("[&>a:hover]"), /^ignore:/)
  assert.match(policyFor("[&>*:focus-visible]"), /^ignore:/)
  assert.match(policyFor("has-[:focus-visible]"), /^ignore:/)
  assert.match(policyFor("has-[[aria-invalid=true]]"), /^ignore:/)
})

test("원형이 먼저다 — aria-invalid는 invalid로 접히기 전에 자기 이름으로 걸린다", () => {
  assert.equal(policyFor("aria-invalid"), MODIFIER_POLICY.get("aria-invalid"))
})

test("값이 true가 아닌 data 속성은 값이 뜻을 가르므로 접지 않는다", () => {
  assert.match(policyFor("data-[swipe=move]"), /^ignore:/)       // 표에 원형으로 있다
  assert.equal(policyFor("data-[orientation=vertical]"), undefined)
  assert.equal(policyFor("data-[variant=sidebar]"), undefined)
})

test("표에 없는 뜻은 만들어 내지 않는다 — 다른 무리는 그대로 unresolved다", () => {
  for (const mod of [
    "first", "last",                       // E — 무리 안 위치(#180)
    "[&_img]", "[&_tr]", "[&>span:last-child]",  // D — 자손 슬롯(#181)
    "sm", "md", "@md/field-group",         // D — 반응형(#181)
    "[&>*:not(:first-child)]",             // E — 무리 안 위치(#180)
    "data-[inset=true]", "data-[placeholder=true]", "placeholder",  // 맵 밖(#140 Out of scope)
    "[&[data-state=open]>svg]",            // 복합 선택자
  ]) assert.equal(policyFor(mod), undefined, mod)
})
