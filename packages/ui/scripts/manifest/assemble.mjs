/* 조합 하나를 조립 스펙으로 옮긴다.
 *
 * 단위가 축이 아니라 조합인 이유는 정확성이다(#22 §1): base + variant + size를
 * tailwind-merge가 정리한 뒤에야 값이 확정된다. 축별로 담으면 매니페스트가
 * `xs` 버튼의 아이콘을 16px이라고 말한다 — 실제로는 12px이다. */
import { declarations, rulesForClass, splitModifiers, starRulesInBase } from "./css.mjs"
import { IGNORED_CLASSES, classifyDeclaration, classifyShadow, policyFor, resolveVarChain } from "./classify.mjs"

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
 * 계약의 `slots`를 수식자 → 역할로 뒤집는다(#181).
 *
 * `drawnByModifier`와 **같은 모양**이고 같은 이유로 계약이 진다 — 선택자는 자기가 무엇을
 * 가리키는지 말하지 않는다. `[&_svg]`는 *"svg는 어디서나 아이콘"*이라 전역 표가 이름을
 * 줄 수 있지만, `>span:last-child`는 그럴 수 없다: 마지막 자식인 span이 라벨인 것은 이
 * 파트의 사실이지 51개 컴포넌트의 사실이 아니다. 전역 표에 넣으면 다음 컴포넌트에서
 * 조용히 빗나가고, 그 표는 자기 주석에 "컴포넌트를 가리지 않는 뜻만 온다"고 적어 두었다.
 *
 * 그래서 선이 이렇다 — **선택자가 역할을 스스로 말하면 전역 표, 말하지 않으면 계약**(ADR-0013).
 *
 * 조회 키가 수식자인 것도 `drawnByModifier`와 같다: 조립은 클래스에서 출발한다.
 */
export function slotByModifier(slots) {
  return new Map(Object.entries(slots ?? {}).map(([role, selector]) => [selector, role]))
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
 *
 * `elsewhere`는 선택적 수집기다(#180). 정책이 `elsewhere:`인 수식자는 `ignore:`처럼 셀에서
 * 빠지지만 **뜻이 반대다** — 그려지되 이 자산이 아닌 자리에 그려진다. 조용히 버리면 파생
 * 채널에서 `ignore:`와 구분되지 않아 "여기 없다"가 "어디에도 없다"로 읽히므로, 문서 단위로
 * 모아 두라고 호출자에게 넘긴다. 넘기지 않으면 그냥 버린다 — 셀 판정은 수집과 무관하다.
 */
export function assembleCell({ props, className, tree, theme, drawnBy, declaredSlots, elsewhere }) {
  const properties = {}
  const slots = {}
  const configurations = {}
  const byModifier = drawnByModifier(drawnBy)
  const bySlot = slotByModifier(declaredSlots)
  let state = null
  let stateBase = undefined
  let disabledOpacity = null

  const classes = className.split(/\s+/).filter(Boolean)

  for (const cls of classes) {
    const { modifiers, utility } = splitModifiers(cls)
    const rules = rulesForClass(tree, cls)
    if (!rules.length) {
      // 규칙을 하나도 내지 않는 것이 **의도**인 클래스가 있다 — Tailwind의 group 이름표가
      // 그렇다. 셋째 표가 그것을 ②로 닫는다(#181): 여기 없으면 여전히 unresolved다
      if (IGNORED_CLASSES.has(cls)) continue
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

    /* 수식자 사슬을 **경로**로 걷는다(#182). 각 항은 그 자리의 주어에 걸리고, 주어를
     * 옮기는 것은 슬롯 지목뿐이다 — 그래서 순서가 뜻을 바꾸는 것은 오직 주어 이동을
     * 통해서다. CSS가 그것을 증명한다: `[&_svg]:disabled` ≡ `svg:disabled`이고
     * `disabled:[&_svg]` ≡ `:disabled svg`다. */
    const verdict = resolveChain(modifiers, { props, byModifier, bySlot })
    if (verdict.kind === "drop") continue
    if (verdict.kind === "elsewhere") {
      if (elsewhere) for (const d of decls) elsewhere(verdict.modifier, verdict.reason, d.prop)
      continue
    }
    if (verdict.kind === "unresolved") {
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
    if (verdict.ladder) {
      // disabled는 층이 아니라 요소 전체의 불투명도다. state가 없는 variant(link)에는
      // 상태 자체가 없으므로 여기서 바로 얹지 않고 마지막에 합친다
      for (const d of decls) if (d.prop === "opacity") disabledOpacity = percent(d.value)
      continue
    }

    /* 앉는 자리는 **주어 × 구성 상태**다. 구성 상태가 바깥이고 슬롯이 안쪽인 이유는
     * 한 번의 property 전환이 여러 노드를 함께 바꾸기 때문이다 — switch의 `checked`는
     * 루트의 면과 thumb의 위치를 같이 옮긴다. 슬롯을 바깥에 두면 그 한 사실이 서로
     * 모르는 두 자리에 흩어져, 소비처가 *"켜지면 무엇이 달라지는가"*를 슬롯마다 훑어
     * 다시 모아야 한다. `slots`는 CSS 속성 이름이 될 수 없으므로 이 자리에서 예약
     * 키로 서도 속성과 섞이지 않는다. */
    const bucket = () => {
      const at = verdict.state ? ((configurations[verdict.state.state] ??= {})[verdict.state.value] ??= {}) : properties
      if (!verdict.slot) return at
      const host = verdict.state ? (at.slots ??= {}) : slots
      return (host[verdict.slot] ??= {})
    }

    if (utility.startsWith("shadow-")) {
      const hit = classifyShadow(theme, decls, cls)
      if (hit) bucket()[hit.prop] = hit.entry
      continue
    }
    for (const d of decls) {
      // 쉬는 상태와 같은 뜻이다 — 상태 사다리가 얹히는 면이 이 구성 상태에서 바뀐다
      if (d.prop === "--ds-state-base" && verdict.state && !verdict.slot) {
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
  }

  // 슬롯 버킷은 CSS 이름으로 모은 뒤 한 번에 정리한다 — 개명은 자리가 아니라 속성의 사실이다
  foldSlots(slots)
  for (const values of Object.values(configurations)) for (const diff of Object.values(values)) if (diff.slots) foldSlots(diff.slots)

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

/**
 * 수식자 사슬 하나를 판정한다(#182).
 *
 * **조회를 넓히는 것만으로는 답이 안 나온다** — `data-[state=collapsed]:data-[side=left]`는
 * 구성 상태와 축 되읽기가 만난 자리이고, 둘은 셀에서 하는 일이 서로 다르다. 그래서 이 함수는
 * 표를 한 번 더 뒤지는 것이 아니라 사슬을 **경로로 걷는다**: 항은 그 자리의 주어에 걸리고,
 * 주어를 옮기는 것은 슬롯 지목뿐이다.
 *
 * 판정의 우선순위가 이 순서인 데는 이유가 있다.
 *
 * 1. **떨어뜨리는 항이 이긴다** — 거짓 축 · `ignore:` · `elsewhere:`. 선언은 모든 항이 참일
 *    때만 그려지므로, 한 항이 *"여기 그려지지 않는다"*고 말하면 나머지를 몰라도 결론이 난다.
 *    모르는 항이 섞였다고 `unresolved`로 올리면 **아는 사실을 신호에 잡음으로 붓는다.**
 * 2. **모르는 항이 있으면 전체가 `unresolved`다** — 아는 쪽만 적용하면 반쪽만 그린 채
 *    통과한다. switch의 `[&_[data-slot=switch-thumb]]:data-[state=checked]`가 그 증거다:
 *    상태만 읽어 담으면 매니페스트가 **루트가 움직인다**고 말하는데 실제로 움직이는 것은
 *    thumb이다. 안전한 실패가 거짓 통과보다 낫다.
 * 3. 남으면 앉는 자리를 정한다 — 주어(슬롯) × 구성 상태.
 *
 * 구성 상태와 축 되읽기는 **주어가 이 자산일 때만** 걸린다. 계약의 `drawnBy`도 `config.variants`도
 * *이 자산*이 무엇을 그리는지를 선언한 것이지 자손의 DOM 사실을 선언한 것이 아니다 — 옮겨진
 * 주어에까지 그 이름표를 붙이면 계약이 말한 적 없는 사실을 매니페스트가 주장하게 되고, 그것은
 * #148이 진단한 병(DOM 사실이 계약 밖에 사는 것)이다. 지금 그런 사슬은 switch 하나뿐이고
 * 어차피 슬롯 쪽도 미지라 `unresolved`로 서지만, `Thumb`이 파트로 등록되면(#155) 이 선이
 * 그 세대에 다시 판정되도록 남는다.
 *
 * @returns {{kind:"drop"}|{kind:"elsewhere",modifier:string,reason:string}|{kind:"unresolved"}|{kind:"place",state?:object,slot?:string,ladder?:boolean}}
 */
export function resolveChain(modifiers, ctx) {
  const acc = { state: null, slot: null, ladder: false, unknown: false, elsewhere: null }
  const drop = walkTerms(modifiers, ctx, acc)
  if (drop) return acc.elsewhere ? { kind: "elsewhere", ...acc.elsewhere } : { kind: "drop" }
  if (acc.unknown) return { kind: "unresolved" }
  return { kind: "place", ...(acc.state ? { state: acc.state } : {}), ...(acc.slot ? { slot: acc.slot } : {}), ...(acc.ladder ? { ladder: true } : {}) }
}

/** @returns {boolean} true면 선언 전체가 이 셀에서 떨어진다 */
function walkTerms(terms, ctx, acc) {
  for (const term of terms) if (walkTerm(term, ctx, acc)) return true
  return false
}

function walkTerm(term, ctx, acc) {
  // 옮겨진 주어에는 이 자산의 축도 구성 상태도 걸리지 않는다 — 위 주석의 선이다
  if (!acc.slot) {
    const axis = axisReadback(ctx.props, term)
    if (axis === false) return true
    if (axis === true) return false

    const drawn = ctx.byModifier.get(term)
    if (drawn) { if (acc.state) acc.unknown = true; else acc.state = drawn; return false }
  }

  const role = ctx.bySlot.get(term)
  if (role) { if (acc.slot) acc.unknown = true; else acc.slot = role; return false }

  /* 원형을 먼저 본다(#178) — `[&>*:not(:first-child)]`는 표에 `not(:first-child)`로 있고
   * 축약이 거기 닿는다. 쪼개기부터 하면 그 사슬이 `[&_*]`(`ignore:`)로 떨어져 #180이 세운
   * 항등(`elsewhere`에 오는 속성 집합 = 이 등급이 없었다면 unresolved로 떴을 것)이 깨진다. */
  const policy = policyFor(term)
  if (policy !== undefined) {
    if (policy.startsWith("ignore:")) return true
    if (policy.startsWith("elsewhere:")) {
      acc.elsewhere = { modifier: term, reason: policy.slice("elsewhere:".length) }
      return true
    }
    if (policy === "slot-icon") { if (acc.slot) acc.unknown = true; else acc.slot = "icon"; return false }
    if (policy === "state") {
      // 상태 사다리는 사슬의 유일한 항일 때만 뜻이 분명하다. 다른 자리와 겹치면
      // 어느 쪽이 이기는지 정한 적이 없으므로 안전하게 실패한다
      if (acc.ladder || acc.state || acc.slot) acc.unknown = true
      else acc.ladder = true
      return false
    }
    acc.unknown = true
    return false
  }

  const inner = decomposeVariant(term)
  if (!inner) { acc.unknown = true; return false }
  return walkTerms(inner, ctx, acc)
}

/**
 * 주어 이동을 품은 임의 변형을 사슬로 편다(#182).
 *
 * `[&[data-state=open]>svg]`와 `data-[state=open]:[&>svg]`는 **같은 선택자로 컴파일된다** —
 * 표기가 둘일 뿐 뜻은 하나다. 표에는 뜻이 오고 형태는 축약이 감당한다는 #178의 규칙이
 * 여기서도 그대로다: 형태로 갈리면 매니페스트의 신호가 철자에 좌우된다.
 *
 * `&`에 붙은 술어가 없으면 `null`이다 — 쪼갤 것이 없고, 그 형태(`[&_svg]`·`[&>*:not(:first-child)]`)는
 * `policyFor`가 이미 감당한다.
 *
 * @returns {string[]|null}
 */
export function decomposeVariant(term) {
  const m = /^\[&(.+)\]$/.exec(term)
  if (!m) return null
  const sel = m[1]
  let depth = 0
  for (let i = 0; i < sel.length; i++) {
    const ch = sel[i]
    if (ch === "[" || ch === "(") depth++
    else if (ch === "]" || ch === ")") depth--
    else if (depth === 0 && (ch === ">" || ch === "_")) {
      const predicate = sel.slice(0, i).trim()
      const rest = sel.slice(i + 1).trim()
      if (!predicate || !rest) return null
      const asTerm = predicateTerm(predicate)
      // 자식 결합자와 자손 결합자는 같은 슬롯을 가리킨다(#178) — 자손 형태로 모은다
      return asTerm ? [asTerm, `[&_${rest}]`] : null
    }
  }
  return null
}

/** `&`에 붙은 술어를 수식자 이름으로 되돌린다. 되돌릴 수 없으면 `null`이다. */
function predicateTerm(predicate) {
  const data = /^\[(data-[\w-]+)(?:=["']?([\w-]+)["']?)?\]$/.exec(predicate)
  if (data) return data[2] === undefined ? `${data[1]}` : `data-[${data[1].slice("data-".length)}=${data[2]}]`
  const pseudo = /^:([\w-]+)$/.exec(predicate)
  if (pseudo) return pseudo[1]
  return null
}

/**
 * 슬롯 자리의 속성 이름을 정리한다(#181의 규약 — **CSS 이름 그대로**).
 *
 * `icon`만 두 개명을 진다. `size`는 `size-*`가 낸 width·height가 **같다**는 사실을 담는
 * 이름이라 둘이 갈리면 개명하지 않고 CSS 이름 둘을 그대로 둔다 — 정사각형이 아닌 것을
 * `size` 하나로 접으면 매니페스트가 한 변을 조용히 버린다. `paddingInline`은 이 규약이
 * 서기 전부터 있던 이름이고, 새 역할은 개명하지 않는다.
 */
function foldSlot(role, bucket) {
  if (role !== "icon") return bucket
  const out = {}
  const { width, height, ...rest } = bucket
  if (width && height && JSON.stringify(width) === JSON.stringify(height)) out.size = height
  else { if (width) out.width = width; if (height) out.height = height }
  for (const [prop, entry] of Object.entries(rest)) out[prop === "padding-inline" ? "paddingInline" : prop] = entry
  return out
}

/** 셀과 구성 상태 자리에 모인 슬롯 버킷을 한 번에 정리한다. */
function foldSlots(host) {
  for (const [role, bucket] of Object.entries(host)) host[role] = foldSlot(role, bucket)
}
