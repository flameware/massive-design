/**
 * DTCG `{a.b.c}` alias 해석.
 *
 * alias 그래프는 **1단 깊이**다 — semantic → palette 하나뿐이고 component 계층은
 * 토큰이 0개다(CONTEXT.md). 그래서 해석기가 50줄이 안 되고, Style Dictionary를
 * 버린 근거 중 하나가 됐다(build-pipeline.md §0).
 */

const REF = /^\{([^}]+)\}$/

export const isRef = (value) => typeof value === 'string' && REF.test(value)
export const refPath = (value) => value.match(REF)?.[1] ?? null

/** DTCG 트리를 `점.경로 → 토큰` 평면 Map으로. `$`로 시작하는 키는 메타다. */
export function flatten(doc, prefix = '', out = new Map()) {
  for (const [key, node] of Object.entries(doc)) {
    if (key.startsWith('$')) continue
    if (node === null || typeof node !== 'object') continue
    const path = prefix ? `${prefix}.${key}` : key
    if ('$value' in node) out.set(path, node)
    else flatten(node, path, out)
  }
  return out
}

/** 모드별 원시 값. 다크는 Primer 인라인 override가 있으면 그것을, 없으면 $value를 쓴다. */
export function valueFor(token, mode = 'light') {
  const override = token.$extensions?.['org.primer.overrides']?.[mode]
  return override ?? token.$value
}

/**
 * 한 토큰의 값을 리터럴까지 따라간다. 깊이 1단이 설계이지만 순환·미아 참조는
 * 조용히 통과시키지 않는다 — 조용한 실패가 이 계층의 유일한 실패 양상이다.
 */
export function resolve(tokens, path, mode = 'light', seen = new Set()) {
  const token = tokens.get(path)
  if (!token) throw new Error(`알 수 없는 토큰 참조: ${path}`)
  const value = valueFor(token, mode)
  if (!isRef(value)) return { token, path, value }
  if (seen.has(path)) throw new Error(`순환 참조: ${[...seen, path].join(' → ')}`)
  seen.add(path)
  return resolve(tokens, refPath(value), mode, seen)
}

/** 참조 체인의 길이(리터럴 = 0). lint가 "1단 깊이" 규약을 검사하는 데 쓴다. */
export function depth(tokens, path, mode = 'light') {
  let n = 0
  let cur = path
  while (isRef(valueFor(tokens.get(cur), mode))) {
    cur = refPath(valueFor(tokens.get(cur), mode))
    if (!tokens.has(cur)) throw new Error(`알 수 없는 토큰 참조: ${cur}`)
    if (++n > 8) throw new Error(`순환 참조 의심: ${path}`)
  }
  return n
}
