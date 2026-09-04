/* 소스를 읽는 스캐너들이 공유하는 파서 층.
 *
 * 리포의 `typescript@7`은 컴파일러 JS API(`createSourceFile`)를 싣지 않으므로 `.tsx`를 읽는
 * 스크립트는 `@babel/parser`로 읽는다(#228이 devDependency로 들였다). 파서를 집는 자리를
 * 하나로 두는 이유는 두 스캐너 — 포인터 대상 스캔(`pointer-targets/scan.mjs`)과 parts
 * 게이트(`manifest/parts-coverage.mjs`) — 가 같은 AST 모양을 기대해야 하기 때문이다. 파서를
 * 바꾸는 날 고칠 자리가 여기 하나다.
 *
 * 런타임 의존성이 아니다 — `@massive/ui`가 발행하는 코드는 이 파일을 import하지 않는다. */
import { parse } from "@babel/parser"

/** `.tsx` 소스 텍스트 → Babel AST(`File`). */
export function parseTsx(text) {
  return parse(text, { sourceType: "module", plugins: ["jsx", "typescript"] })
}

const SKIP_KEYS = new Set(["loc", "range", "start", "end", "extra", "leadingComments", "trailingComments", "innerComments"])

/** 깊이 우선으로 `[node, ancestors]`를 낸다. `type`이 문자열인 것만 노드로 본다. */
export function* walk(node, ancestors = []) {
  if (!node || typeof node.type !== "string") return
  yield [node, ancestors]
  const next = [...ancestors, node]
  for (const key of Object.keys(node)) {
    if (SKIP_KEYS.has(key)) continue
    const v = node[key]
    if (Array.isArray(v)) { for (const c of v) if (c && typeof c.type === "string") yield* walk(c, next) }
    else if (v && typeof v.type === "string") yield* walk(v, next)
  }
}

/** JSX 태그 이름 — `Foo`, `Ns.Member`, `svg:path`. */
export const jsxName = (n) =>
  n.type === "JSXIdentifier" ? n.name
    : n.type === "JSXMemberExpression" ? `${jsxName(n.object)}.${jsxName(n.property)}`
      : n.type === "JSXNamespacedName" ? `${n.namespace.name}:${n.name.name}` : "?"

/** JSX 속성 이름 — 속성이 아니면(spread) null. */
export const jsxAttrName = (a) =>
  a.type === "JSXAttribute" ? (a.name.type === "JSXNamespacedName" ? `${a.name.namespace.name}:${a.name.name.name}` : a.name.name) : null
