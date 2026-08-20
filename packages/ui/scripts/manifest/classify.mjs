/* 선언 하나를 3단(token/literal/unresolved) 중 하나로 판정한다(#22 §3).
 *
 * 무시 화이트리스트는 조용히 버리는 것과 다르다 — Figma에 대응물이 아예 없는
 * 축만 여기 적히고, 그래야 남은 `unresolved`가 "아직 못 다룬 것"만 가리킨다.
 * 목록에 없는 속성이나 수식자가 새로 들어오면 unresolved로 떠서 눈에 띈다. */
import { lengthToPx, parseVar, normalizeShadow } from "./theme.mjs"

/** Figma에 대응물이 없는 축. 값이 이유다 — 지울 때 근거를 지운다. */
export const IGNORED_PROPERTIES = new Map([
  ["transition-property", "Figma에 전이 속성이 없다"],
  ["transition-duration", "Figma에 전이 속성이 없다"],
  ["transition-timing-function", "Figma에 전이 속성이 없다"],
  ["transition-behavior", "Figma에 전이 속성이 없다"],
  ["pointer-events", "상호작용 — 그려지지 않는다"],
  ["cursor", "상호작용 — 그려지지 않는다"],
  ["user-select", "상호작용 — 그려지지 않는다"],
  ["white-space", "Figma 텍스트는 줄바꿈을 오토레이아웃으로 표현한다"],
  ["flex-shrink", "Figma 오토레이아웃의 resizing 이지 컴포넌트 속성이 아니다"],
  ["outline-style", "포커스 링 — Figma에 상태 축이 없다(#24가 열면 그때)"],
  ["outline-offset", "포커스 링 — Figma에 상태 축이 없다(#24가 열면 그때)"],
  ["text-underline-offset", "Figma에 밑줄 오프셋이 없다"],
  ["box-shadow", "shadow-* 유틸리티 자체를 Effect Style로 옮긴다 — 합성된 box-shadow는 읽지 않는다"],
])

/** 수식자별 처리. 여기 없는 수식자는 unresolved로 뜬다. */
export const MODIFIER_POLICY = new Map([
  ["disabled", "state"],
  ["has-[>svg]", "slot-icon"],
  ["[&_svg]", "slot-icon"],
  ["[&_svg:not([class*='size-'])]", "slot-icon"],
  ["focus-visible", "ignore:포커스 링 — Figma에 상태 축이 없다(#24가 열면 그때)"],
  ["aria-invalid", "ignore:검증 상태 — Figma에 대응물이 없다(#22 §5)"],
  ["hover", "ignore:상태 사다리 밖의 hover — link의 밑줄이 여기 걸린다(#24가 상태 축을 정하면 다뤄진다)"],
])

const SPACE_PROPERTIES = new Set([
  "width", "height", "min-width", "min-height", "max-width", "max-height",
  "gap", "column-gap", "row-gap",
  "padding", "padding-inline", "padding-block",
  "padding-top", "padding-right", "padding-bottom", "padding-left",
])

function scaleGroupFor(prop) {
  if (SPACE_PROPERTIES.has(prop)) return "space"
  if (prop === "border-radius" || prop.endsWith("-radius")) return "radius"
  if (prop === "font-size") return "fontSize"
  if (prop === "border-width" || (prop.startsWith("border-") && prop.endsWith("-width"))) return "borderWidth"
  return null
}

/** 변수 사슬을 --ds-* 까지 탄다. tokens.css의 :root가 사슬의 원본이다. */
export function resolveVarChain(theme, name, seen = new Set()) {
  if (seen.has(name)) return { kind: "cycle", name }
  seen.add(name)
  if (name.startsWith("--ds-palette-")) return { kind: "primitive", name }
  if (name.startsWith("--ds-")) return { kind: "token", token: name }
  const next = theme.aliases.get(name) ?? theme.themeVars.get(name)
  if (next === undefined) return { kind: "unknown", name }
  const v = parseVar(next)
  if (v) return resolveVarChain(theme, v.name, seen)
  return { kind: "literal", value: next, via: name }
}

/**
 * @returns {{prop: string, entry: object}|null} null이면 무시 화이트리스트에 걸린 것
 */
export function classifyDeclaration(theme, prop, value, from) {
  if (prop.startsWith("--tw-")) return null
  if (IGNORED_PROPERTIES.has(prop)) return null

  const entry = classifyValue(theme, prop, value)
  return entry ? { prop, entry: { ...entry, from } } : null
}

function classifyValue(theme, prop, value) {
  const v = parseVar(value)
  if (v) {
    if (v.name.startsWith("--tw-")) {
      // Tailwind 내부 변수. 폴백에 진짜 값이 있으면 그것이 쉬는 상태의 값이다
      return v.fallback ? classifyValue(theme, prop, v.fallback) : null
    }
    const chain = resolveVarChain(theme, v.name)
    if (chain.kind === "token") return { tier: "token", token: chain.token }
    if (chain.kind === "primitive") {
      return { tier: "unresolved", value, why: `primitive를 직접 집었다: ${chain.name}` }
    }
    if (chain.kind === "literal") return withScale(theme, prop, chain.value)
    return { tier: "unresolved", value, why: `변수 ${v.name}의 값을 찾지 못했다` }
  }
  return withScale(theme, prop, value)
}

/** 리터럴 값을 scale.json에서 되짚는다. 되짚히면 token, 아니면 literal. */
function withScale(theme, prop, value) {
  const px = lengthToPx(value)
  const group = scaleGroupFor(prop)
  if (px !== null && group) {
    const hit = theme.scales.lookup(group, px)
    if (hit) {
      const entry = { tier: "token", scale: hit.path, px }
      if (hit.token) entry.token = hit.token
      if (hit.multiple !== undefined) entry.multiple = hit.multiple
      return entry
    }
  }
  if (px !== null) return { tier: "literal", px }
  return { tier: "literal", value }
}

/** shadow-* 는 합성된 box-shadow가 아니라 유틸리티 자체를 Effect Style로 옮긴다. */
export function classifyShadow(theme, rule, from) {
  const decl = rule.find((d) => d.prop === "--tw-shadow")
  if (!decl) return null
  const hit = theme.shadows.get(normalizeShadow(decl.value))
  return hit
    ? { prop: "box-shadow", entry: { tier: "token", token: hit.token, scale: hit.path, from } }
    : { prop: "box-shadow", entry: { tier: "unresolved", value: decl.value, why: "shadow 스케일에 없는 그림자다", from } }
}
