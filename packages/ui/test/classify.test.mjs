/* 3단 판정. 여기가 틀리면 Figma가 리터럴로 도배되거나, 반대로 없는 변수를 집는다. */
import assert from "node:assert/strict"
import { test } from "node:test"

import { IGNORED_CLASSES, MODIFIER_POLICY, classifyDeclaration, classifyShadow, policyFor, resolveVarChain } from "../scripts/manifest/classify.mjs"
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
    "[&>span:last-child]",                 // 슬롯 지목 — 전역 표가 아니라 계약이 진다(#181)
    "data-[inset=true]", "data-[placeholder=true]", "placeholder",  // 맵 밖(#140 Out of scope)
    "[&[data-state=open]>svg]",            // 복합 선택자
    "[&_[data-slot=switch-thumb]]",        // 등록되지 않은 파트를 지목한다 — #155의 몫
  ]) assert.equal(policyFor(mod), undefined, mod)
})

test("소비처가 넣는 내용을 틀에 맞추는 배관은 ignore다 — 담을 슬롯이 없다(#181)", () => {
  // 셋 다 anatomy에도 parts에도 없는 노드를 가리키고, 담으려면 역할 어휘를 늘려야 하는데
  // 그것은 **계약을 여는** 방향이라 이 맵의 destination과 반대다. 이유는 셋이 다르다
  for (const mod of ["[&_img]", "[&_a]", "[&_*]"]) assert.match(policyFor(mod), /^ignore:/, mod)
  // 자식 결합자 형태는 축약이 자손 형태로 모아 같은 자리에 도달한다
  assert.equal(policyFor("[&>a]"), policyFor("[&_a]"))
  assert.equal(policyFor("[&>*]"), policyFor("[&_*]"))
  const reasons = new Set(["[&_img]", "[&_a]", "[&_*]"].map((m) => policyFor(m)))
  assert.equal(reasons.size, 3, "셋의 이유가 서로 다르다")
})

test("폭에 걸린 것은 뜻 둘로 접힌다 — elsewhere가 아니라 ignore다(#181)", () => {
  // 그려지기는 한다 — 넓은 뷰포트에서. 그런데 elsewhere:는 그려지는 자리가 **다른 자산**일
  // 때의 등급이고 그 규약은 저기가 어디인지를 지목하는 것인데, 뷰포트는 자산이 아니다
  for (const mod of ["sm", "md", "lg", "xl", "2xl"]) assert.equal(policyFor(mod), MODIFIER_POLICY.get("viewport"), mod)
  for (const mod of ["@md/field-group", "@lg/sidebar", "@md"]) {
    assert.equal(policyFor(mod), MODIFIER_POLICY.get("container-width"), mod)
  }
  for (const mod of ["viewport", "container-width"]) assert.match(MODIFIER_POLICY.get(mod), /^ignore:/, mod)
  // 형태가 아니라 뜻이 표에 온다(#178) — 다섯 breakpoint에 이유가 다섯 벌 있지 않다
  for (const form of ["sm", "md", "lg", "xl", "2xl", "@md/field-group"]) {
    assert.equal(MODIFIER_POLICY.has(form), false, form)
  }
  // Tailwind 기본 이름만 접는다. 프로젝트가 자기 이름을 정의하면 unresolved로 떠서 알려 준다
  assert.equal(policyFor("tablet"), undefined)
})

test("무리 안 위치는 elsewhere다 — ignore와 등급이 다르다", () => {
  // 그려지되 이 자산이 아닌 자리에 그려진다. `ignore:`("영영 거기 없다")를 쓰면
  // 이 맵이 고치려던 병을 `ignore:`로 옮긴다(#180)
  for (const mod of ["first", "last"]) assert.match(policyFor(mod), /^elsewhere:/, mod)

  // 컨테이너가 자식을 고르는 형태는 축약이 뜻만 남겨 도달한다 — 표에는 형태가 아니라
  // 뜻(`not(:first-child)`)이 있고, 요소부는 도달 경로라 무엇이든 같은 자리로 온다(#178)
  for (const mod of [
    "[&>*:not(:first-child)]", "[&>*:not(:last-child)]",
    "[&>button:not(:first-child)]", "[&_*:not(:last-child)]",
  ]) assert.match(policyFor(mod), /^elsewhere:/, mod)

  // 이유가 **저기가 어디인지**를 지목한다는 것이 이 등급의 규약이다(ADR-0012). 지목하는
  // 자리는 조립된 그룹만이 아니다 — #181이 등록된 파트를 지목하는 것을 더했다
  for (const [, policy] of MODIFIER_POLICY) {
    if (policy.startsWith("elsewhere:")) assert.match(policy, /이 자산이 아니라 \S.*[이가] 그린다/)
  }
})

test("자손 지목의 last-child는 `last`로 접히지 않는다 — 뜻이 갈린다(#181)", () => {
  // 둘 다 무리의 끝 항목이 아니라 **자손을 지목**한다. `last`로 접혔다면 이 무리가 통째로
  // 조용해졌을 것이다(#147 판정 규칙 4, #180이 남긴 ⚠️). 그래서 도착지가 서로 다르다
  const last = MODIFIER_POLICY.get("last")
  assert.notEqual(policyFor("[&_tr:last-child]"), last)
  assert.notEqual(policyFor("[&>span:last-child]"), last)

  // 지목한 파트가 그것을 실제로 그리면 참인 지목이다 — TableRow의 셀에 `border-b`가 있다
  assert.match(policyFor("[&_tr]"), /TableRow/)
  // 끝 행에 테두리가 **없다**는 사실은 TableRow의 셀에 없다(그 셀은 언제나 border-b다).
  // TableRow를 지목하면 거짓 지목이므로 이쪽만 무리 안 위치로 간다 — 조립된 표가 그린다
  assert.match(policyFor("[&_tr:last-child]"), /조립된 표/)
  assert.doesNotMatch(policyFor("[&_tr:last-child]"), /TableRow/)

  // 슬롯 지목은 전역 표에 오지 않는다 — 선택자가 역할을 스스로 말하지 않으므로
  // 계약이 이름표를 진다(ADR-0013)
  assert.equal(policyFor("[&>span:last-child]"), undefined)
})

test("규칙을 내지 않는 것이 의도인 클래스는 셋째 표가 ②로 닫는다(#181)", () => {
  // 표식 클래스는 속성도 수식자도 아니라 policyFor에 닿기 전에 걸린다
  for (const cls of ["group/field", "group/item", "group/menu-item", "group/menu-sub-item"]) {
    assert.match(IGNORED_CLASSES.get(cls), /이름표/, cls)
    assert.equal(policyFor(cls), undefined, cls)
  }
  // 형태가 아니라 이름을 적는다 — 다른 뜻의 group/*가 와도 조용해지지 않는다
  assert.equal(IGNORED_CLASSES.has("group/새로운것"), false)
})
