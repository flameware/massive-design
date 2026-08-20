/* 컴파일된 CSS를 읽는 최소 파서.
 *
 * 매니페스트는 클래스 문자열을 파싱하는 대신 Tailwind가 낸 CSS를 읽는다(#22 §2).
 * 그 CSS를 읽으려면 파서가 필요한데, 대상이 Tailwind의 출력 한 종류뿐이라
 * postcss를 끌어오는 대신 여기서 200줄 미만으로 끝낸다. 중첩(@supports, &:hover)
 * 과 이스케이프된 선택자(`.has-\[\>svg\]\:px-3`)만 다루면 된다. */

/** CSS를 { prelude, children } / { prop, value } 트리로 판다. */
export function parseCss(src) {
  let i = 0

  function block() {
    const nodes = []
    let buf = ""
    const flush = () => {
      const text = buf.trim()
      buf = ""
      if (!text) return
      const c = splitDecl(text)
      if (c) nodes.push(c)
    }
    while (i < src.length) {
      const ch = src[i]
      if (ch === "/" && src[i + 1] === "*") {
        const end = src.indexOf("*/", i + 2)
        i = end < 0 ? src.length : end + 2
        continue
      }
      if (ch === '"' || ch === "'") {
        const quote = ch
        buf += ch
        i++
        while (i < src.length) {
          buf += src[i]
          if (src[i] === "\\") { buf += src[i + 1] ?? ""; i += 2; continue }
          i++
          if (src[i - 1] === quote) break
        }
        continue
      }
      if (ch === "\\") { buf += ch + (src[i + 1] ?? ""); i += 2; continue }
      if (ch === "{") { i++; const prelude = buf.trim(); buf = ""; nodes.push({ prelude, children: block() }); continue }
      if (ch === "}") { i++; flush(); return nodes }
      if (ch === ";") { i++; flush(); continue }
      buf += ch
      i++
    }
    flush()
    return nodes
  }

  return block()
}

function splitDecl(text) {
  let depth = 0
  for (let n = 0; n < text.length; n++) {
    const ch = text[n]
    if (ch === "(" || ch === "[") depth++
    else if (ch === ")" || ch === "]") depth--
    else if (ch === ":" && depth === 0) {
      return { prop: text.slice(0, n).trim(), value: text.slice(n + 1).trim() }
    }
  }
  return null
}

/** Tailwind가 클래스명을 선택자로 옮길 때 쓰는 이스케이프. */
export function escapeClass(cls) {
  return cls.replace(/[^A-Za-z0-9_-]/g, (ch) => "\\" + ch)
}

/** 트리를 훑어 이 클래스가 만든 규칙들을 모은다. 중첩 at-rule 안이라도 찾는다. */
export function rulesForClass(nodes, cls) {
  const needle = "." + escapeClass(cls)
  const found = []
  const visit = (list) => {
    for (const node of list) {
      if (!node.children) continue
      if (node.prelude.startsWith("@")) { visit(node.children); continue }
      if (selectorHasClass(node.prelude, needle)) found.push(node)
      else visit(node.children)
    }
  }
  visit(nodes)
  return found
}

function selectorHasClass(selector, needle) {
  let from = 0
  for (;;) {
    const at = selector.indexOf(needle, from)
    if (at < 0) return false
    const next = selector[at + needle.length] ?? " "
    // `.gap-1` 이 `.gap-1\.5` 를 물지 않게 — 뒤에 이름이 이어지면 다른 클래스다
    if (!/[A-Za-z0-9_\\-]/.test(next)) return true
    from = at + 1
  }
}

/**
 * `@layer base` 안의 **선택자가 정확히 `*`인** 규칙들. 캐스케이드 순서 그대로 준다.
 *
 * preflight의 `*, ::after, ::before, …`는 선택자 목록이라 여기 안 걸린다 —
 * 걸리면 `border: 0 solid`가 매니페스트에 실린다. 우리 규칙만 정확히 집는다(#36).
 */
export function starRulesInBase(nodes) {
  const found = []
  const visit = (list, inBase) => {
    for (const node of list) {
      if (!node.children) continue
      if (node.prelude.startsWith("@")) {
        visit(node.children, inBase || /^@layer\s+base\b/.test(node.prelude))
        continue
      }
      if (inBase && node.prelude === "*") found.push(node)
      else visit(node.children, inBase)
    }
  }
  visit(nodes, false)
  return found
}

/** 규칙의 직속 선언만. @supports·&:hover 같은 중첩은 호출자가 따로 본다. */
export function declarations(rule) {
  return rule.children.filter((n) => n.prop)
}

/** 클래스명을 수식자와 유틸리티로 가른다. 대괄호 안의 `:` 는 구분자가 아니다. */
export function splitModifiers(cls) {
  const parts = []
  let buf = ""
  let depth = 0
  let quote = null
  for (const ch of cls) {
    if (quote) { buf += ch; if (ch === quote) quote = null; continue }
    if (ch === "'" || ch === '"') { quote = ch; buf += ch; continue }
    if (ch === "[" || ch === "(") depth++
    if (ch === "]" || ch === ")") depth--
    if (ch === ":" && depth === 0) { parts.push(buf); buf = ""; continue }
    buf += ch
  }
  parts.push(buf)
  return { modifiers: parts.slice(0, -1), utility: parts[parts.length - 1] }
}
