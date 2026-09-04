/* parts 게이트 — 클래스를 내는 anatomy 노드는 `parts`에 있어야 한다 (#246, 맵 #221).
 *
 * ADR-0006이 `Card`에서 잡은 침묵은 "`parts` 키가 없다"가 아니라 **우리 노드가 내는 클래스가
 * 어느 매니페스트 셀에도 없다**는 사실이다. 게이트·린트·파생 채널은 셀만 보므로 셀에 없는
 * 클래스는 통과가 아니라 침묵이다. 그래서 기준은 침묵의 정의 그 자체다(#195):
 *
 *   한 계약의 소스에서 `className`을 받는 JSX 노드의 클래스 토큰이 그 계약의 매니페스트
 *   (루트 셀 ∪ parts 셀)의 className 토큰 합집합에 전부 들어 있지 않으면 닿지 않은 것이다.
 *   게이트가 묻는 것은 닿지 않은 노드 중 **anatomy에 이름을 가진** 것이다.
 *
 * anatomy 밖 노드(svg·sr-only span·ItemIndicator…)는 세되 묻지 않는다 — ADR-0018이 anatomy가
 * 아니라고 정했고 로더가 `parts ⊆ anatomy`를 강제하므로 `parts`로는 닿게 할 수 없다. 층이
 * 다르다(연구 문서 §4).
 *
 * 무엇을 읽는가: **커밋된 `dist/manifest/*.gen.json`**(anatomy·parts 셀·source)과 그 source의
 * `.tsx`. 계약 모듈을 import하지 않으므로 node에서 돈다 — check.mjs 규칙 3과 같은 근거이고,
 * 낡은 매니페스트로 통과하는 일은 같은 `check` 사슬의 `manifest:verify`가 막는다.
 *
 * 소스 쪽은 `@babel/parser`로 읽는다(`../tsx-ast.mjs`, #228과 공유). **클래스 자리**에 있는
 * 문자열만 토큰이다 — `cn(...)` 인자, `cva(base, …)`의 base와 `variants.<축>.<값>`, 같은 파일·
 * `@/components/ui/*`의 선언, `xVariants({ variant: "ghost" })`처럼 인자가 리터럴이면 고른
 * 변형만, 식이면 그 축 전부. 비교식·삼항의 조건·`defaultVariants`는 클래스가 아니다.
 *
 * 예외는 `parts-coverage.exceptions.json`에 산다. 항목마다 이유와 함께 **검사 가능한 주장**을
 * 하나 얹는다 — 게이트는 이유를 믿지 않고 주장이 거짓인지만 본다(#184의 `carriedBy: "none"`과
 * 같은 원리):
 *   elsewhere: "<contract>"   빠진 토큰 전부가 그 계약의 매니페스트 셀에 있다(ADR-0012 `elsewhere:`)
 *   overriddenBy: "<classes>" 빠진 토큰 각각이 tailwind-merge로 그 클래스에 덮인다(계기 한계)
 * 노드가 이제 닿는데 예외가 남아 있으면 낡은 것이고, 그것도 빨갛다.
 *
 * 사용:  node scripts/manifest/parts-coverage.mjs            # 요약 (check.mjs 규칙 6과 같은 판정)
 *        node scripts/manifest/parts-coverage.mjs --nodes    # 노드 한 줄씩 TSV (연구 문서의 nodes.tsv와 같은 열) */
import { existsSync, readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { twMerge } from "tailwind-merge"

import { jsxAttrName, jsxName, parseTsx, walk } from "../tsx-ast.mjs"

export const EXCEPTIONS_FILE = "scripts/manifest/parts-coverage.exceptions.json"
export const MANIFEST_DIR = "dist/manifest"

const tok = (s) => String(s ?? "").split(/\s+/).filter(Boolean)
const pascal = (s) => s.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join("")

/* ── 1. 매니페스트: 닿은 토큰의 합집합 ─────────────────────────────────── */
export function carriedTokens(manifest) {
  const set = new Set()
  for (const c of manifest.cells ?? []) for (const t of tok(c.className)) set.add(t)
  for (const p of Object.values(manifest.parts ?? {})) for (const c of p.cells ?? []) for (const t of tok(c.className)) set.add(t)
  return set
}

export function readManifests(root) {
  const dir = join(root, MANIFEST_DIR)
  return readdirSync(dir).filter((n) => n.endsWith(".gen.json") && n !== "index.gen.json").sort()
    .map((n) => JSON.parse(readFileSync(join(dir, n), "utf8")))
}

/* ── 2. 소스: className을 가진 JSX 노드와 그 토큰 ─────────────────────── */
export function createSourceReader(root, { readFile = (file) => readFileSync(file, "utf8"), exists = existsSync } = {}) {
  const fileCache = new Map()
  const loadFile = (file) => {
    if (fileCache.has(file)) return fileCache.get(file)
    const ast = parseTsx(readFile(file))
    const decls = new Map() // 이름 → 초기화 식 (파일 안 어디든)
    const imports = new Map() // 이름 → 경로 (`./x`와 `@/components/ui/x`만 따라간다)
    for (const [n] of walk(ast)) {
      if (n.type === "VariableDeclarator" && n.id.type === "Identifier" && n.init) decls.set(n.id.name, n.init)
      if (n.type === "ImportDeclaration" && (n.source.value.startsWith("./") || n.source.value.startsWith("@/components/ui/")))
        for (const sp of n.specifiers) if (sp.type === "ImportSpecifier") imports.set(sp.local.name, n.source.value)
    }
    const entry = { file, ast, decls, imports }
    fileCache.set(file, entry)
    return entry
  }
  const resolveIdent = (entry, name) => {
    if (entry.decls.has(name)) return { e: entry.decls.get(name), entry }
    const from = entry.imports.get(name)
    if (!from) return null
    const target = from.startsWith("@/")
      ? join(root, "src", from.slice(2).replace(/\.tsx?$/, "") + ".tsx")
      : join(entry.file, "..", from.replace(/\.tsx?$/, "") + ".tsx")
    if (!exists(target)) return null
    const other = loadFile(target)
    return other.decls.has(name) ? { e: other.decls.get(name), entry: other } : null
  }

  const unwrap = (n) => { while (n && (n.type === "TSAsExpression" || n.type === "TSSatisfiesExpression" || n.type === "ParenthesizedExpression")) n = n.expression; return n }
  const objProps = (o) => { o = unwrap(o); return o?.type === "ObjectExpression" ? o.properties.filter((p) => p.type === "ObjectProperty") : [] }
  const keyOf = (p) => p.key.type === "Identifier" ? p.key.name : p.key.type === "StringLiteral" ? p.key.value : ""

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
      case "ObjectExpression": // cn에 넘긴 객체 — 문자열 키가 클래스다
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
    cfg = unwrap(cfg)
    if (cfg.type === "Identifier") { const r = resolveIdent(entry, cfg.name); if (r) return cvaConfigTokens(r.e, r.entry, out, seen, unresolved, depth + 1); unresolved.add(cfg.name); return }
    if (cfg.type !== "ObjectExpression") return
    for (const p of objProps(cfg)) {
      const key = keyOf(p)
      if (key === "variants") {
        for (const axis of objProps(p.value)) for (const val of objProps(axis.value)) tokensOf(val.value, entry, out, seen, unresolved, depth + 1)
      } else if (key === "compoundVariants") {
        const v = unwrap(p.value)
        if (v?.type === "ArrayExpression") for (const cv of v.elements) for (const q of objProps(cv)) if (keyOf(q) === "class" || keyOf(q) === "className") tokensOf(q.value, entry, out, seen, unresolved, depth + 1)
      }
    }
  }

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

  /** 한 파일의 `className`을 가진 JSX 노드 전부 — `{ line, tag, slot, kind, tokens, unresolved }`. */
  function analyze(file) {
    const entry = loadFile(file)
    const nodes = []
    for (const [n] of walk(entry.ast)) {
      if (n.type !== "JSXOpeningElement") continue
      let slot = null, cls = null
      for (const a of n.attributes) {
        const an = jsxAttrName(a)
        if (!an) continue
        if (an === "data-slot" && a.value?.type === "StringLiteral") slot = a.value.value
        if (an === "className") cls = a.value
      }
      if (!cls) continue
      const tokens = new Set(), unresolved = new Set()
      tokensOf(cls, entry, tokens, new Set(), unresolved)
      nodes.push({ line: n.loc.start.line, tag: jsxName(n.name), slot, kind: kindOf(cls), tokens, unresolved })
    }
    return nodes
  }
  return { analyze }
}

/* ── 3. 예외 ─────────────────────────────────────────────────────────── */
export function loadExceptions(root) {
  const file = join(root, EXCEPTIONS_FILE)
  if (!existsSync(file)) return []
  return JSON.parse(readFileSync(file, "utf8")).nodes ?? []
}

/** 예외의 주장을 되묻는다. 거짓이면 이유 문자열, 참이면 null. */
export function verifyException(exception, missing, manifestsByName) {
  const { elsewhere, overriddenBy } = exception
  if (typeof elsewhere === "string") {
    const other = manifestsByName.get(elsewhere)
    if (!other) return `elsewhere가 가리키는 계약이 없다: ${elsewhere}`
    const carried = carriedTokens(other)
    const absent = missing.filter((t) => !carried.has(t))
    return absent.length ? `elsewhere: "${elsewhere}"의 셀에 없는 토큰이 있다 — ${absent.join(" ")}` : null
  }
  if (typeof overriddenBy === "string") {
    const survives = missing.filter((t) => twMerge(`${t} ${overriddenBy}`).split(/\s+/).includes(t))
    return survives.length ? `overriddenBy: "${overriddenBy}"가 덮지 않는 토큰이 있다 — ${survives.join(" ")}` : null
  }
  return "예외에는 검사 가능한 주장이 필요하다 — elsewhere 또는 overriddenBy"
}

/* ── 4. 판정 ─────────────────────────────────────────────────────────── */
/**
 * @param manifests 커밋된 매니페스트 문서들(`readManifests`)
 * @param reader `createSourceReader(root)`
 * @param exceptions `loadExceptions(root)`
 * @returns { rows, violations, exempted, errors, outside, population }
 *   rows        노드 전부(TSV용)
 *   violations  anatomy 이름이 있는데 닿지 않은 노드 — 예외 밖 (게이트가 묻는 것)
 *   exempted    예외로 통과한 노드 (주장 검사 통과)
 *   errors      낡은·거짓 예외, 해석 못 한 식별자 — 이것도 빨갛다
 *   outside     anatomy 밖에서 닿지 않은 노드 수 (정보)
 *   population  violations가 있는 계약 이름 — 맵 #221의 destination은 이 목록이 빈 것이다
 */
export function evaluatePartsCoverage({ manifests, reader, exceptions = [], root }) {
  const byName = new Map(manifests.map((m) => [m.component, m]))
  const exceptionKey = (component, node) => `${component}\t${node}`
  const exceptionMap = new Map(exceptions.map((x) => [exceptionKey(x.component, x.node), x]))
  const usedExceptions = new Set()
  const rows = [], violations = [], exempted = [], errors = []
  let outside = 0

  for (const m of manifests) {
    const carried = carriedTokens(m)
    const partKeys = Object.keys(m.parts ?? {})
    const anatomy = (m.anatomy ?? []).map((e) => e.replace(/[?*]$/, ""))
    const compPascal = pascal(m.component)
    const nodes = reader.analyze(join(root, m.source))
    for (const n of nodes) {
      const missing = [...n.tokens].filter((t) => !carried.has(t))
      const slotPascal = n.slot ? pascal(n.slot) : null
      // anatomy 이름 대응: 슬롯의 Pascal이 그대로거나, 컴포넌트 접두를 뗀 것이 anatomy에 있는가(#243의 무접두 규칙)
      const anatomyName = slotPascal && (anatomy.includes(slotPascal) ? slotPascal
        : anatomy.includes(slotPascal.replace(compPascal, "")) ? slotPascal.replace(compPascal, "") : null)
      const row = {
        component: m.component, line: n.line, slot: n.slot, tag: n.tag, kind: n.kind, tokens: n.tokens, unresolved: n.unresolved,
        missing, anatomyName, isRoot: n.slot === m.component,
        partKey: slotPascal && partKeys.includes(slotPascal) ? slotPascal : null,
        carried: missing.length === 0,
      }
      rows.push(row)
      if (n.unresolved.size) {
        errors.push(`${m.component}:${n.line} — 해석 못 한 식별자(${[...n.unresolved].join(",")}): 게이트가 못 보는 클래스는 침묵이다 — 같은 파일·@/components/ui/*의 선언으로 풀리게 쓴다`)
      }
      if (row.carried) continue
      if (!anatomyName) { outside++; continue }
      const exception = exceptionMap.get(exceptionKey(m.component, anatomyName))
      if (!exception) { violations.push({ component: m.component, node: anatomyName, line: n.line, missing }); continue }
      usedExceptions.add(exceptionKey(m.component, anatomyName))
      const falsified = verifyException(exception, missing, byName)
      if (falsified) errors.push(`${m.component}.${anatomyName} — 예외의 주장이 거짓이다: ${falsified}`)
      else exempted.push({ component: m.component, node: anatomyName, line: n.line, reason: exception.reason ?? "(이유 없음)" })
    }
  }
  for (const x of exceptions) {
    if (!usedExceptions.has(exceptionKey(x.component, x.node)))
      errors.push(`${x.component}.${x.node} — 예외가 낡았다: 그 노드는 이제 닿거나 없다. 항목을 지운다`)
  }
  const population = [...new Set(violations.map((v) => v.component))].sort()
  return { rows, violations, exempted, errors, outside, population }
}

export function runPartsCoverage(root) {
  const manifests = readManifests(root)
  const reader = createSourceReader(root)
  const exceptions = loadExceptions(root)
  return evaluatePartsCoverage({ manifests, reader, exceptions, root })
}

/** check.mjs가 쓰는 한 줄들 — 실패는 errors 배열로, 통과 요약은 문자열로. */
export function formatFailures(result) {
  return [
    ...result.violations.map((v) => `${v.component}.${v.node}(:${v.line}) — 클래스를 내는 anatomy 노드가 parts에 없다: ${v.missing.join(" ")}`),
    ...result.errors,
  ]
}
export function formatSummary(result) {
  return `parts 모집단 ${result.population.length}` +
    ` (노드 ${result.rows.length}, 예외로 통과 ${result.exempted.length}: ${result.exempted.map((e) => `${e.component}.${e.node}`).join(" ") || "-"}, anatomy 밖 미도달 ${result.outside})`
}

/* ── CLI ─────────────────────────────────────────────────────────────── */
if (process.argv[1] && fileURLToPath(import.meta.url) === (await import("node:path")).resolve(process.argv[1])) {
  const root = fileURLToPath(new URL("../..", import.meta.url))
  const result = runPartsCoverage(root)
  if (process.argv.includes("--nodes")) {
    console.log(["component", "line", "slot", "tag", "kind", "anatomy", "part", "carried", "missingTokens", "unresolvedIdents"].join("\t"))
    for (const r of result.rows) console.log([r.component, r.line, r.slot ?? "-", r.tag, r.kind, r.anatomyName ?? "-", r.partKey ?? (r.isRoot ? "(root)" : "-"), r.carried ? "yes" : "NO", r.missing.join(" ") || "-", [...r.unresolved].join(",") || "-"].join("\t"))
  } else {
    for (const line of formatFailures(result)) console.error(`  ${line}`)
    console.log(formatSummary(result) + (result.population.length ? `: ${result.population.join(" ")}` : ""))
    process.exitCode = formatFailures(result).length ? 1 : 0
  }
}
