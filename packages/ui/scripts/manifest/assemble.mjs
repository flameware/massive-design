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
 * 파트가 root에서 물려받는 축을 푼다(#179).
 *
 * `data-[orientation=*]`는 root의 축인데 그것을 그리는 클래스가 `SliderTrack`·`SliderRange`
 * **파트**의 셀에 떨어진다. 파트의 축에는 orientation이 없으므로 **대고 해소할 값이 없다** —
 * 물려받는 것은 값을 주기 위해서이고, 값을 얻고 나면 해소는 root와 **똑같은 규칙**이다.
 *
 * 전부 물려받지 않고 **계약이 지목한다**(#147). 셀 수는 발행되는 Figma 자산의 크기이므로
 * 클래스 한 줄을 더하는 것만으로 조용히 늘면 안 된다 — 지목을 계약에 적게 하면 그 변경이
 * 리뷰에 보인다. 지목하지 않은 축의 되읽기는 그대로 `unresolved`로 뜬다.
 *
 * 축 값과 기본값은 **root의 것 그대로다.** 파트가 다시 적으면 두 자리가 갈린다.
 */
export function inheritedAxesOf(component, part) {
  const out = {}
  for (const axis of part.inheritedAxes ?? []) {
    const values = component.config.variants?.[axis]
    if (!values) continue
    out[axis] = { values: Object.keys(values), default: component.config.defaultVariants?.[axis] }
  }
  return out
}

/** 파트 셀을 물려받은 축만큼 전개한다. 클래스는 **파트 자신의 축**만으로 낸다 —
 * 물려받은 축은 클래스를 고르지 않고 어느 수식자가 살아 있는지를 고른다. */
export function partCellsOf(part, inherited) {
  let rows = cellsOf(part.config).map((own) => ({ props: own, className: String(part.className(own)) }))
  for (const [axis, { values }] of Object.entries(inherited)) {
    rows = rows.flatMap((row) => values.map((v) => ({ ...row, props: { ...row.props, [axis]: v } })))
  }
  return rows
}

/**
 * 계약의 `drawnBy`를 수식자 → 구성 상태 자리로 뒤집는다(#148).
 *
 * 조회 키가 수식자인 이유는 조립이 클래스에서 출발하기 때문이다. 이유 문자열 항목은
 * 우리 클래스가 그리지 않는다고 말한 것이므로 여기 오지 않고, `carriedBy` 항목은
 * 그리지만 담기지 않는다고 말한 것이므로 역시 오지 않는다(#184).
 */
export function drawnByModifier(drawnBy) {
  const map = new Map()
  for (const [state, drawn] of Object.entries(drawnBy ?? {})) {
    if (typeof drawn !== "object" || drawn === null) continue
    // `carriedBy` 모양은 우리 클래스가 그리지만 정책이 나르지 않기로 판정한 것이라
    // 담을 자리를 지목하지 않는다 — 조회표에 오지 않고 정책이 그대로 처리한다(#184)
    if (typeof drawn.attribute !== "string") continue
    for (const [value, domValue] of Object.entries(drawn.values ?? {})) {
      map.set(`data-[${drawn.attribute.slice("data-".length)}=${domValue}]`, { state, value })
    }
  }
  return map
}

/**
 * 축을 DOM 속성으로 되읽는 수식자를 **셀의 축 값에 대고** 해소한다(#179).
 *
 * `data-[variant=sidebar]`는 이미 선언된 cva 축을 읽는다. 축은 셀로 전개되므로 셀이
 * 그 값을 **이미 고정하고 있고**, 그래서 판정이 정적이다 — 값이 같으면 그 선언은 이
 * 셀의 쉬는 상태이고, 다르면 이 셀에는 그 규칙이 아예 적용되지 않는다.
 *
 * 구성 상태와 **앉는 자리가 다르다**(#148과의 갈림). `configurations`는 셀이 고르지
 * 않은 상태의 차이를 담는 자리인데, 축은 셀이 이미 골랐다. 그래서 참이면 `properties`에
 * 접히고 거짓이면 사라진다 — Figma 쪽에서 이것은 component property가 아니라 이미
 * 존재하는 variant 축이며, 조합 수도 늘지 않는다.
 *
 * 축 이름과 DOM 속성 이름은 **같다고 본다.** 축의 이름 공간은 우리 것이고(ADR-0008)
 * 되읽히는 속성도 우리가 쓴다(`data-variant={variant}`) — 언젠가 갈리면 이 조회가
 * 빗나가 `unresolved`로 뜬다. 그것이 이 맵이 지키려는 신호이므로 안전한 실패다.
 *
 * @returns {true|false|undefined} undefined면 이 수식자가 축을 읽는 것이 아니다
 */
function axisReadback(props, modifier) {
  const m = /^data-\[([\w-]+)=([\w-]+)\]$/.exec(modifier)
  if (!m) return undefined
  const current = props?.[m[1]]
  return current === undefined ? undefined : current === m[2]
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

    // 축 되읽기가 가장 앞이다 — 셀이 그 값을 이미 고정했으므로 판정이 정적이고,
    // 고를 것이 남아 있지 않다. 계약이 이름표를 줄 자리도 아니다(#179)
    const axis = modifiers.length === 1 ? axisReadback(props, modifiers[0]) : undefined
    if (axis === false) continue
    if (axis === true) {
      if (utility.startsWith("shadow-")) {
        const hit = classifyShadow(theme, decls, cls)
        if (hit) properties[hit.prop] = hit.entry
        continue
      }
      for (const d of decls) {
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
