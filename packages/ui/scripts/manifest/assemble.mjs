/* 조합 하나를 조립 스펙으로 옮긴다.
 *
 * 단위가 축이 아니라 조합인 이유는 정확성이다(#22 §1): base + variant + size를
 * tailwind-merge가 정리한 뒤에야 값이 확정된다. 축별로 담으면 매니페스트가
 * `xs` 버튼의 아이콘을 16px이라고 말한다 — 실제로는 12px이다. */
import { declarations, rulesForClass, splitModifiers, starRulesInBase } from "./css.mjs"
import { classifyDeclaration, classifyShadow, policyFor, resolveVarChain } from "./classify.mjs"

/**
 * 모든 셀에 **앞서** 적용되는 기저. `@layer base`의 `*` 규칙에서 파생한다(#36).
 *
 * 셀 밖에 있는 이유: 이 값은 클래스가 아니라 규칙에서 온다. 48칸에 복사하면
 * `border-width`가 없는 40칸까지 stroke 색을 갖게 되고, #26의 에이전트가 그걸
 * 보고 폭 1px를 칠한다. 조립은 CSS 의미 그대로다 —
 * `stroke = base["border-color"]`, `weight = cell["border-width"] ?? 0`.
 *
 * 무시 화이트리스트는 셀과 공유한다. 그래서 `outline-color`는 여기 안 남는다 —
 * 포커스는 #24가 Figma에서 뺐고 `outline-style`·`outline-offset`이 이미 무시된다.
 * base 블록이 일반적인 것은 구조이지 통과하는 속성이 아니다.
 */
export function assembleBase({ tree, theme }) {
  const properties = {}
  for (const rule of starRulesInBase(tree)) {
    for (const d of declarations(rule)) {
      if (d.prop.startsWith("--ds-")) continue
      const hit = classifyDeclaration(theme, d.prop, d.value, "@layer base")
      if (hit) properties[hit.prop] = hit.entry
    }
  }
  return properties
}

/** config.variants의 데카르트 곱. 축 이름과 값은 cva config가 쥔다. */
export function cellsOf(config) {
  let rows = [{}]
  for (const [axis, values] of Object.entries(config.variants)) {
    rows = rows.flatMap((row) => Object.keys(values).map((v) => ({ ...row, [axis]: v })))
  }
  return rows
}

/**
 * 계약의 `drawnBy`를 수식자 → 구성 상태 자리로 뒤집는다(#148).
 *
 * 조회 키가 수식자인 이유는 조립이 클래스에서 출발하기 때문이다. 이유 문자열 항목은
 * 우리 클래스가 그리지 않는다고 말한 것이므로 여기 오지 않는다.
 */
export function drawnByModifier(drawnBy) {
  const map = new Map()
  for (const [state, drawn] of Object.entries(drawnBy ?? {})) {
    if (typeof drawn !== "object" || drawn === null) continue
    for (const [value, domValue] of Object.entries(drawn.values ?? {})) {
      map.set(`data-[${drawn.attribute.slice("data-".length)}=${domValue}]`, { state, value })
    }
  }
  return map
}

/**
 * 셀 하나를 조립한다.
 *
 * `properties`는 **쉬는 상태**다. 계약이 `drawnBy`로 이름표를 준 수식자는 `unresolved`가
 * 아니라 `configurations[구성 상태][값]`에 담기며, 그 자리는 쉬는 상태에 대한 **차이**만
 * 갖는다 — 값이 없는 구성 상태 값은 `properties`가 그대로 그린다는 뜻이다. Figma에서
 * 이 자리는 variant 축이 아니라 **component property**다(#147의 어휘 교정).
 */
export function assembleCell({ props, className, tree, theme, drawnBy }) {
  const properties = {}
  const slots = {}
  const configurations = {}
  const byModifier = drawnByModifier(drawnBy)
  let state = null
  let stateBase = undefined
  let disabledOpacity = null

  const classes = className.split(/\s+/).filter(Boolean)

  for (const cls of classes) {
    const { modifiers, utility } = splitModifiers(cls)
    const rules = rulesForClass(tree, cls)
    if (!rules.length) {
      properties[cls] = { tier: "unresolved", why: "컴파일 출력에 이 클래스의 규칙이 없다", from: cls }
      continue
    }
    const decls = rules.flatMap(declarations)

    if (modifiers.length === 0) {
      if (utility === "state") { state = readStateRule(rules[0]); continue }
      if (utility.startsWith("shadow-")) {
        const hit = classifyShadow(theme, decls, cls)
        if (hit) properties[hit.prop] = hit.entry
        continue
      }
      for (const d of decls) {
        if (d.prop === "--ds-state-base") { stateBase = d.value; continue }
        if (d.prop.startsWith("--ds-")) continue
        const hit = classifyDeclaration(theme, d.prop, d.value, cls)
        if (hit) properties[hit.prop] = hit.entry
      }
      continue
    }

    // 계약이 이름표를 지므로 전역 정책보다 앞선다 — 이 수식자가 무엇을 그리는지는
    // 그 컴포넌트만 안다. 복합 수식자는 여기 안 걸린다(#182이 조회를 넓힌다)
    const drawn = modifiers.length === 1 ? byModifier.get(modifiers[0]) : undefined
    if (drawn) {
      const bucket = () => ((configurations[drawn.state] ??= {})[drawn.value] ??= {})
      if (utility.startsWith("shadow-")) {
        const hit = classifyShadow(theme, decls, cls)
        if (hit) bucket()[hit.prop] = hit.entry
        continue
      }
      for (const d of decls) {
        // 쉬는 상태와 같은 뜻이다 — 상태 사다리가 얹히는 면이 이 구성 상태에서 바뀐다
        if (d.prop === "--ds-state-base") {
          const chain = resolveVarChain(theme, varName(d.value))
          bucket()["background-color"] = chain.kind === "token"
            ? { tier: "token", token: chain.token, from: cls }
            : { tier: "literal", value: d.value, from: cls }
          continue
        }
        if (d.prop.startsWith("--ds-")) continue
        const hit = classifyDeclaration(theme, d.prop, d.value, cls)
        if (hit) bucket()[hit.prop] = hit.entry
      }
      continue
    }

    // 조회는 형태가 아니라 뜻에 걸린다 — `policyFor`가 도달 경로를 벗겨 정책표를 본다(#178)
    const policy = modifiers.length === 1 ? policyFor(modifiers[0]) : undefined
    if (policy === undefined) {
      for (const d of decls) {
        properties[`${modifiers.join(":")}:${d.prop}`] = {
          tier: "unresolved",
          value: d.value,
          why: `수식자 ${modifiers.join(":")}를 아직 다루지 않는다`,
          from: cls,
        }
      }
      continue
    }
    if (policy.startsWith("ignore:")) continue
    if (policy === "state") {
      // disabled는 층이 아니라 요소 전체의 불투명도다. state가 없는 variant(link)에는
      // 상태 자체가 없으므로 여기서 바로 얹지 않고 마지막에 합친다
      for (const d of decls) if (d.prop === "opacity") disabledOpacity = percent(d.value)
      continue
    }
    if (policy === "slot-icon") {
      for (const d of decls) {
        const hit = classifyDeclaration(theme, d.prop, d.value, cls)
        if (!hit) continue
        if (hit.prop === "height") slots.icon = { ...(slots.icon ?? {}), size: hit.entry }
        if (hit.prop === "padding-inline") slots.icon = { ...(slots.icon ?? {}), paddingInline: hit.entry }
      }
    }
  }

  // 아이콘 간격은 쉬는 상태의 gap 그대로다 — 아이콘 전용 유틸리티가 따로 없다
  if (slots.icon && properties.gap) slots.icon.gap = properties.gap

  // line-height는 폰트 사이즈 유틸리티가 함께 낸다. 이름도 그 사이즈를 따른다
  const size = properties["font-size"]
  if (size?.scale?.startsWith("type.size.") && properties["line-height"]) {
    const step = size.scale.slice("type.size.".length)
    properties["line-height"] = { ...properties["line-height"], tier: "token", token: `--text-${step}--line-height` }
  }

  if (state) {
    state.disabled = disabledOpacity
    const base = stateBase === undefined ? null : resolveVarChain(theme, varName(stateBase))
    state.base = base?.kind === "token" ? base.token : null
    properties["background-color"] = state.base
      ? { tier: "token", token: state.base, from: "state" }
      : { tier: "literal", value: "transparent", from: "state" }
  }

  return {
    ...props,
    className,
    properties,
    ...(Object.keys(slots).length ? { slots } : {}),
    ...(Object.keys(configurations).length ? { configurations } : {}),
    state,
  }
}

/** `.state` 규칙에서 사다리와 층 색을 읽는다 — 손으로 적힌 사본을 만들지 않는다. */
function readStateRule(rule) {
  const out = { base: null, layer: null, hover: null, pressed: null, disabled: null }
  for (const node of rule.children) {
    if (node.prop) continue
    if (node.prelude.startsWith("@supports")) {
      const mix = node.children.find((n) => n.prop === "background-color")?.value ?? ""
      const layer = [...mix.matchAll(/var\((--[\w-]+)\)/g)].map((m) => m[1]).pop()
      out.layer = layer ?? null
      continue
    }
    const alpha = node.children.find((n) => n.prop === "--ds-state-alpha")
    if (!alpha) continue
    if (node.prelude === "&:hover") out.hover = percent(alpha.value)
    if (node.prelude === "&:active") out.pressed = percent(alpha.value)
  }
  return out
}

const percent = (v) => Number(String(v).replace("%", "")) / 100
const varName = (v) => /var\(\s*(--[\w-]+)/.exec(v)?.[1] ?? v
