/* parts 공백 모집단 계수기 — #195 (맵 #221 첫 티켓).
 *
 * 단위는 **JSX 노드**다 — `className` 속성을 가진 우리 소스의 JSX 요소 하나가 한 행이다.
 * 표기(`cn()`·맨 문자열·변수)를 가리지 않는다: `className` 식에서 **클래스 자리**에 있는
 * 문자열 리터럴을 전부 모아 토큰으로 만든다(`cn(...)` 인자, `cva(base, …)`의 base 와
 * `variants.<축>.<값>`, 같은 파일·`@/components/ui/*`의 `const`·`cva()` 선언을 따라간다.
 * `xVariants({ variant: "ghost" })`처럼 인자가 리터럴이면 고른 변형만, 식이면 그 축 전부).
 *
 * "매니페스트에 닿는다"의 정본은 생성된 매니페스트 자신이다: `scripts/manifest/build.mjs`가
 * 컴파일하는 클래스 집합은 루트 셀과 `parts.*` 셀의 `className`을 토큰으로 쪼갠 합집합이다.
 * 그래서 노드의 토큰이 그 합집합에 전부 들어 있으면 **닿았다**, 하나라도 빠지면 **닿지 않았다**.
 *
 * 실행 — 리포 루트에서:
 *   WORK=$(mktemp -d); (cd "$WORK" && bun add @babel/parser@7)     # 리포의 typescript@7 은 파서 API 가 없다
 *   cp docs/research/parts-population-2026-09.count.mjs "$WORK/count.mjs"
 *   (cd packages/ui && bun "$WORK/count.mjs" "$PWD")            # 요약 + 다섯 기준의 모집단
 *   (cd packages/ui && bun "$WORK/count.mjs" "$PWD" --nodes)    # 노드 한 줄씩 (TSV)
 * cwd 가 packages/ui 여야 한다 — 계약 모듈의 `@/lib/utils` 가 그 tsconfig 로 풀린다.
 * 매니페스트는 커밋된 dist/manifest/*.gen.json 을 읽는다 — 재생성하지 않는다(런북 §1과 같다).
 *
 * 한계: tailwind-merge 를 적용하지 않는다. `cn(toggleVariants({size}), "min-w-0 px-3")`처럼
 * 뒤 인자가 앞을 덮어쓰면 덮인 토큰이 "닿지 않음"으로 나온다 — 그 행은 사람이 등급을 매긴다.
 */
import { parse } from "@babel/parser"
import { readFileSync, existsSync } from "node:fs"
import { join } from "node:path"
import { pathToFileURL } from "node:url"

const root = process.argv[2]
if (!root || !existsSync(join(root, "scripts/component-contracts.mjs"))) {
  console.error("usage: bun count.mjs <packages/ui 경로> [--nodes]"); process.exit(2)
}
const { loadComponentContracts } = await import(pathToFileURL(join(root, "scripts/component-contracts.mjs")).href)
const showNodes = process.argv.includes("--nodes")
const pascal = (s) => s.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join("")
const tok = (s) => String(s ?? "").split(/\s+/).filter(Boolean)

/* ── 1. 매니페스트: 닿은 토큰의 합집합 ─────────────────────────────────── */
function carriedTokens(name) {
  const file = join(root, `dist/manifest/${name}.gen.json`)
  if (!existsSync(file)) throw new Error(`매니페스트 없음: ${file}`)
  const m = JSON.parse(readFileSync(file, "utf8"))
  const set = new Set()
  for (const c of m.cells ?? []) for (const t of tok(c.className)) set.add(t)
  for (const p of Object.values(m.parts ?? {})) for (const c of p.cells ?? []) for (const t of tok(c.className)) set.add(t)
  return { set, partKeys: Object.keys(m.parts ?? {}), hash: m.hash }
}

/* ── 2. 소스: className 을 가진 JSX 노드와 그 토큰 ─────────────────────── */
const each = (node, fn) => {
  if (!node || typeof node !== "object") return
  if (Array.isArray(node)) { for (const n of node) each(n, fn); return }
  if (typeof node.type === "string") fn(node)
  for (const k of Object.keys(node)) if (k !== "loc" && k !== "start" && k !== "end" && k !== "extra") each(node[k], fn)
}
const jsxName = (n) => n.type === "JSXIdentifier" ? n.name : n.type === "JSXMemberExpression" ? `${jsxName(n.object)}.${jsxName(n.property)}` : n.type === "JSXNamespacedName" ? `${n.namespace.name}:${n.name.name}` : "?"

const fileCache = new Map()
function loadFile(file) {
  if (fileCache.has(file)) return fileCache.get(file)
  const text = readFileSync(file, "utf8")
  const ast = parse(text, { sourceType: "module", plugins: ["jsx", "typescript"] })
  const decls = new Map() // 이름 → 초기화 식 (파일 안 어디든)
  const imports = new Map() // 이름 → 경로 (`./x` 와 `@/components/ui/x` 만 따라간다)
  each(ast, (n) => {
    if (n.type === "VariableDeclarator" && n.id.type === "Identifier" && n.init) decls.set(n.id.name, n.init)
    if (n.type === "ImportDeclaration" && (n.source.value.startsWith("./") || n.source.value.startsWith("@/components/ui/")))
      for (const sp of n.specifiers) if (sp.type === "ImportSpecifier") imports.set(sp.local.name, n.source.value)
  })
  const entry = { file, ast, decls, imports }
  fileCache.set(file, entry)
  return entry
}
const resolveIdent = (entry, name) => {
  if (entry.decls.has(name)) return { e: entry.decls.get(name), entry }
  const from = entry.imports.get(name)
  if (!from) return null
  const target = from.startsWith("@/") ? join(root, "src", from.slice(2).replace(/\.tsx?$/, "") + ".tsx") : join(entry.file, "..", from.replace(/\.tsx?$/, "") + ".tsx")
  if (!existsSync(target)) return null
  const other = loadFile(target)
  return other.decls.has(name) ? { e: other.decls.get(name), entry: other } : null
}

/* **클래스 자리**에 있는 문자열만 토큰이다. `cn(...)`의 인자, `cva(base, …)`의 base 와
 * `variants.<축>.<값>`, `className` 리터럴, 그리고 거기서 식별자로 이어지는 선언. 비교식의
 * 피연산자(`o === "horizontal"`), 삼항의 조건, `defaultVariants`, 변형 선택 인자
 * (`buttonVariants({ variant: "outline" })`)는 클래스가 아니므로 내려가지 않는다. */
function tokensOf(e, entry, out, seen, unresolved, depth = 0) {
  if (!e || depth > 16) return
  switch (e.type) {
    case "StringLiteral": for (const t of tok(e.value)) out.add(t); return
    case "TemplateLiteral": for (const q of e.quasis) for (const t of tok(q.value.cooked)) out.add(t); return
    case "JSXExpressionContainer": case "ParenthesizedExpression": case "TSAsExpression": case "TSSatisfiesExpression": case "TSNonNullExpression": case "TSTypeAssertion":
      return tokensOf(e.expression, entry, out, seen, unresolved, depth + 1)
    case "Identifier": {
      if (e.name === "className" || e.name === "undefined") return // 소비처가 주는 값
      const key = `${entry.file}#${e.name}`
      if (seen.has(key)) return
      seen.add(key)
      const r = resolveIdent(entry, e.name)
      if (r) return tokensOf(r.e, r.entry, out, seen, unresolved, depth + 1)
      unresolved.add(e.name); return
    }
    case "CallExpression": {
      const callee = e.callee.type === "Identifier" ? e.callee.name : null
      if (callee === "cn") { for (const a of e.arguments) tokensOf(a, entry, out, seen, unresolved, depth + 1); return }
      if (callee === "cva") {
        tokensOf(e.arguments[0], entry, out, seen, unresolved, depth + 1)
        cvaConfigTokens(e.arguments[1], entry, out, seen, unresolved, depth + 1)
        return
      }
      // 그 밖의 호출(`xVariants({...})`) — 호출 대상이 `cva(...)` 선언이면 인자로 고른 변형만 센다.
      // 축 값이 리터럴이면 그 값 하나, 식이면(삼항·prop) 그 축의 값 전부, 안 준 축은 defaultVariants.
      if (!callee) return
      const r = resolveIdent(entry, callee)
      if (r && r.e.type === "CallExpression" && r.e.callee.type === "Identifier" && r.e.callee.name === "cva") {
        const picked = new Map()
        const arg = e.arguments[0]
        if (arg?.type === "ObjectExpression") for (const p of arg.properties) {
          if (p.type !== "ObjectProperty" || p.key.type !== "Identifier") continue
          picked.set(p.key.name, p.value.type === "StringLiteral" ? [p.value.value] : null) // null = 전부
        }
        cvaSelectedTokens(r.e, r.entry, picked, out, seen, unresolved, depth + 1)
        return
      }
      tokensOf(e.callee, entry, out, seen, unresolved, depth + 1)
      return
    }
    case "ObjectExpression": // cn 에 넘긴 객체 — 문자열 키가 클래스다
      for (const p of e.properties) if (p.type === "ObjectProperty" && p.key.type === "StringLiteral") for (const t of tok(p.key.value)) out.add(t)
      return
    case "ArrayExpression": for (const x of e.elements) tokensOf(x, entry, out, seen, unresolved, depth + 1); return
    case "ConditionalExpression": tokensOf(e.consequent, entry, out, seen, unresolved, depth + 1); tokensOf(e.alternate, entry, out, seen, unresolved, depth + 1); return
    case "LogicalExpression":
      if (e.operator === "&&") return tokensOf(e.right, entry, out, seen, unresolved, depth + 1)
      tokensOf(e.left, entry, out, seen, unresolved, depth + 1); tokensOf(e.right, entry, out, seen, unresolved, depth + 1); return
    case "ArrowFunctionExpression": case "FunctionExpression": return tokensOf(e.body, entry, out, seen, unresolved, depth + 1)
    case "BlockStatement": for (const s of e.body) if (s.type === "ReturnStatement") tokensOf(s.argument, entry, out, seen, unresolved, depth + 1); return
    default: return
  }
}
const unwrap = (n) => { while (n && (n.type === "TSAsExpression" || n.type === "TSSatisfiesExpression" || n.type === "ParenthesizedExpression")) n = n.expression; return n }
const objProps = (o) => { o = unwrap(o); return o?.type === "ObjectExpression" ? o.properties.filter((p) => p.type === "ObjectProperty") : [] }
const keyOf = (p) => p.key.type === "Identifier" ? p.key.name : p.key.type === "StringLiteral" ? p.key.value : ""
function cvaSelectedTokens(cvaCall, entry, picked, out, seen, unresolved, depth) {
  tokensOf(cvaCall.arguments[0], entry, out, seen, unresolved, depth + 1) // base
  let cfg = unwrap(cvaCall.arguments[1])
  if (cfg?.type === "Identifier") { const r = resolveIdent(entry, cfg.name); if (!r) { unresolved.add(cfg.name); return } cfg = unwrap(r.e); entry = r.entry }
  const defaults = new Map()
  for (const p of objProps(cfg)) if (keyOf(p) === "defaultVariants") for (const d of objProps(p.value)) if (d.value.type === "StringLiteral") defaults.set(keyOf(d), d.value.value)
  for (const p of objProps(cfg)) {
    if (keyOf(p) === "variants") for (const axis of objProps(p.value)) {
      const a = keyOf(axis)
      const want = picked.has(a) ? picked.get(a) : (defaults.has(a) ? [defaults.get(a)] : [])
      for (const val of objProps(axis.value)) if (want === null || want.includes(keyOf(val))) tokensOf(val.value, entry, out, seen, unresolved, depth + 1)
    }
    if (keyOf(p) === "compoundVariants") { const v = unwrap(p.value); if (v?.type === "ArrayExpression") for (const cv of v.elements) for (const q of objProps(cv)) if (keyOf(q) === "class" || keyOf(q) === "className") tokensOf(q.value, entry, out, seen, unresolved, depth + 1) }
  }
}
function cvaConfigTokens(cfg, entry, out, seen, unresolved, depth) {
  if (!cfg || depth > 16) return
  if (cfg.type === "TSAsExpression" || cfg.type === "TSSatisfiesExpression" || cfg.type === "ParenthesizedExpression") return cvaConfigTokens(cfg.expression, entry, out, seen, unresolved, depth + 1)
  if (cfg.type === "Identifier") { const r = resolveIdent(entry, cfg.name); if (r) return cvaConfigTokens(r.e, r.entry, out, seen, unresolved, depth + 1); unresolved.add(cfg.name); return }
  if (cfg.type !== "ObjectExpression") return
  for (const p of cfg.properties) {
    if (p.type !== "ObjectProperty") continue
    const key = p.key.type === "Identifier" ? p.key.name : p.key.type === "StringLiteral" ? p.key.value : ""
    if (key === "variants") {
      let v = p.value
      while (v && (v.type === "TSAsExpression" || v.type === "TSSatisfiesExpression")) v = v.expression
      if (v?.type !== "ObjectExpression") continue
      for (const axis of v.properties) {
        if (axis.type !== "ObjectProperty") continue
        let vals = axis.value
        while (vals && (vals.type === "TSAsExpression" || vals.type === "TSSatisfiesExpression")) vals = vals.expression
        if (vals?.type !== "ObjectExpression") continue
        for (const val of vals.properties) if (val.type === "ObjectProperty") tokensOf(val.value, entry, out, seen, unresolved, depth + 1)
      }
    } else if (key === "compoundVariants" && p.value.type === "ArrayExpression") {
      for (const cv of p.value.elements) if (cv?.type === "ObjectExpression")
        for (const q of cv.properties) if (q.type === "ObjectProperty" && ((q.key.type === "Identifier" && q.key.name === "class") || (q.key.type === "Identifier" && q.key.name === "className")))
          tokensOf(q.value, entry, out, seen, unresolved, depth + 1)
    }
  }
}

function analyze(file) {
  const entry = loadFile(file)
  const kindOf = (e) => {
    if (!e) return "none"
    if (e.type === "StringLiteral") return "literal"
    if (e.type === "JSXExpressionContainer") return kindOf(e.expression)
    if (e.type === "CallExpression") return e.callee.type === "Identifier" ? `call:${e.callee.name}` : "call"
    if (e.type === "Identifier") return `ident:${e.name}`
    if (e.type === "TemplateLiteral") return "template"
    if (e.type === "ConditionalExpression") return "ternary"
    return e.type
  }
  const nodes = []
  each(entry.ast, (n) => {
    if (n.type !== "JSXOpeningElement") return
    let slot = null, cls = null
    for (const a of n.attributes) {
      if (a.type !== "JSXAttribute") continue
      const an = jsxName(a.name)
      if (an === "data-slot" && a.value?.type === "StringLiteral") slot = a.value.value
      if (an === "className") cls = a.value
    }
    if (!cls) return
    const tokens = new Set(), unresolved = new Set()
    tokensOf(cls, entry, tokens, new Set(), unresolved)
    nodes.push({ line: n.loc.start.line, tag: jsxName(n.name), slot, kind: kindOf(cls), tokens, unresolved })
  })
  return nodes
}

/* ── 3. 계약 × 매니페스트 × 소스 ─────────────────────────────────────── */
const contracts = await loadComponentContracts(root)
const rows = []
const summary = []
for (const c of [...contracts].sort((a, b) => a.name.localeCompare(b.name))) {
  const { set: carried, partKeys, hash } = carriedTokens(c.name)
  const anatomy = (c.anatomy ?? []).map((e) => e.replace(/[?*]$/, ""))
  const hasParts = Object.prototype.hasOwnProperty.call(c, "parts")
  const nodes = analyze(join(root, c.source))
  const compPascal = pascal(c.name)
  const mine = []
  for (const n of nodes) {
    const missing = [...n.tokens].filter((t) => !carried.has(t))
    const slotPascal = n.slot ? pascal(n.slot) : null
    const isRoot = n.slot === c.name
    // anatomy 이름 대응: 슬롯의 Pascal 이 그대로거나, 컴포넌트 접두를 뗀 것이 anatomy 에 있는가
    const anatomyName = slotPascal && (anatomy.includes(slotPascal) ? slotPascal
      : anatomy.includes(slotPascal.replace(compPascal, "")) ? slotPascal.replace(compPascal, "") : null)
    const partKey = slotPascal && partKeys.includes(slotPascal) ? slotPascal : null
    const row = { component: c.name, ...n, missing, anatomyName, isRoot, partKey, carried: missing.length === 0 }
    rows.push(row); mine.push(row)
  }
  const uncarried = mine.filter((r) => !r.carried)
  summary.push({
    name: c.name, hash, anatomy: anatomy.length, hasParts, partKeys: partKeys.length,
    emitting: nodes.length, cnNodes: nodes.filter((n) => n.kind === "call:cn").length,
    uncarriedAll: uncarried.length,
    uncarriedAnatomy: uncarried.filter((r) => r.anatomyName).length,
    uncarriedOther: uncarried.filter((r) => !r.anatomyName).length,
    uncarriedNames: uncarried.map((r) => r.anatomyName ?? `(${r.slot ?? r.tag})`),
  })
}

/* ── 4. 출력 ─────────────────────────────────────────────────────────── */
if (showNodes) {
  console.log(["component", "line", "slot", "tag", "kind", "anatomy", "part", "carried", "missingTokens", "unresolvedIdents"].join("\t"))
  for (const r of rows) console.log([r.component, r.line, r.slot ?? "-", r.tag, r.kind, r.anatomyName ?? "-", r.partKey ?? (r.isRoot ? "(root)" : "-"), r.carried ? "yes" : "NO", r.missing.join(" ") || "-", [...r.unresolved].join(",") || "-"].join("\t"))
  process.exit(0)
}

const pick = (f) => summary.filter(f).map((s) => s.name)
const A = pick((s) => !s.hasParts)
const B = pick((s) => !s.hasParts && s.anatomy >= 2 && s.cnNodes >= 2)
const C = pick((s) => !s.hasParts && s.emitting >= 2)
const D = pick((s) => s.uncarriedAnatomy > 0)
const E = pick((s) => s.hasParts && s.uncarriedAnatomy > 0)
const Dother = pick((s) => s.uncarriedOther > 0)

console.log(["component", "hash", "anatomy", "parts?", "partKeys", "emittingNodes", "cnNodes", "uncarried(all)", "uncarried(anatomy)", "uncarried(other)", "uncarriedNames"].join("\t"))
for (const s of summary) console.log([s.name, s.hash, s.anatomy, s.hasParts ? "yes" : "no", s.partKeys, s.emitting, s.cnNodes, s.uncarriedAll, s.uncarriedAnatomy, s.uncarriedOther, s.uncarriedNames.join(",") || "-"].join("\t"))
console.log("")
console.log(`계약 수: ${summary.length}`)
console.log(`[A] parts 키가 없는 계약 (${A.length}): ${A.join(" ")}`)
console.log(`[B] #155 표의 기준 — parts 없음 ∧ anatomy≥2 ∧ className={cn(…)} 노드≥2 (${B.length}): ${B.join(" ")}`)
console.log(`[C] #155 첫 문장의 의도 — parts 없음 ∧ 클래스를 내는 노드≥2, 표기 불문 (${C.length}): ${C.join(" ")}`)
console.log(`[D] 매니페스트에 닿지 않는 클래스를 내는 anatomy 노드가 있는 계약 (${D.length}): ${D.join(" ")}`)
console.log(`    그중 parts 가 이미 있는데도 남은 것 (${E.length}): ${E.join(" ") || "-"}`)
console.log(`[D'] anatomy 밖 노드가 닿지 않는 클래스를 내는 계약 (${Dother.length}): ${Dother.join(" ")}`)
const unresolved = rows.filter((r) => r.unresolved.size)
if (unresolved.length) console.log(`\n해석 못 한 식별자 (${unresolved.length}건): ` + unresolved.map((r) => `${r.component}:${r.line} ${[...r.unresolved].join(",")}`).join(" | "))
