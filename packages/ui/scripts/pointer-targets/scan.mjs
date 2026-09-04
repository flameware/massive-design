/* 포인터 대상 모집단 — 코드 스캔 (#228, ADR-0020 결정 7의 첫 단계).
 *
 * `src/components/ui/*.tsx`를 TypeScript 파서로 읽어 **JSX 요소 하나하나**를 보고,
 * 아래 규칙 중 하나라도 걸리는 요소를 후보로 낸다. 매니페스트의 `anatomy`·`parts`는
 * 읽지 않는다 — `parts`가 없는 계약이 있어 구멍 난 계기다(결정 7).
 *
 * 규칙은 **넓게** 건다. 좁히는 일은 실측(apps/storybook/scripts/pointer-targets.mjs)과
 * 사람이 한다 — 추출 단계에서 거르면 그 필터가 곧 #121의 diff 열이 된다
 * (docs/agents/upstream-surface-recount.md §2.2).
 *
 *   primitive  radix-ui / react-resizable-panels / input-otp 의 상호작용 노드
 *              (Trigger·Item·Thumb·Close·Action·… 와 컨트롤 자체인 Root)
 *   native     button · a · input · select · textarea · label · summary
 *   handler    onClick · onPointerDown · onMouseDown · onTouchStart · onKeyDown
 *   role       role="button|link|checkbox|radio|switch|tab|menuitem*|option|slider|scrollbar|combobox"
 *   tabindex   tabIndex 속성이 있는 요소 (값 불문 — -1도 포인터는 겨냥한다)
 *   composed   우리 컴포넌트를 안에서 다시 쓰는 자리 (`<Button>` 등)
 *
 * 출력(TSV, stdout):  component  function  slot  tag  rules  line
 *   slot 은 그 요소가 다는 data-slot 리터럴, 없으면 "-". 실측 단계가 DOM에서 대상을
 *   찾는 열쇠가 slot 이므로, slot 이 "-"인 행은 실측이 **못 찾는다** — 그 목록이 곧
 *   계기의 한계로 보고된다.
 *
 * 사용:  node scripts/pointer-targets/scan.mjs [> pointer-targets.tsv]
 *        node scripts/pointer-targets/scan.mjs --json */
import { readdirSync, readFileSync } from "node:fs"
import path from "node:path"

import { jsxAttrName, jsxName, parseTsx, walk } from "../tsx-ast.mjs"

const root = path.resolve(import.meta.dirname, "../..")
const dir = path.join(root, "src/components/ui")

/* 상호작용 노드 이름 — 라이브러리별. Root 는 컨트롤 자체가 루트인 것만. */
export const PRIMITIVE_INTERACTIVE = new Set([
  "Trigger", "SubTrigger", "Item", "CheckboxItem", "RadioItem", "Thumb", "Close", "Cancel", "Action",
  "Link", "ScrollUpButton", "ScrollDownButton", "Scrollbar",
])
export const PRIMITIVE_ROOT_IS_CONTROL = new Set([
  "CheckboxPrimitive", "SwitchPrimitive", "TogglePrimitive", "LabelPrimitive",
  "ToastPrimitive", // 루트가 스와이프로 끌린다 — 겨냥 단위는 아니지만 "끌리는 노드"라 넓게 넣는다
])
/* 라이브러리가 컨테이너로 쓰는 이름이 상호작용 노드 이름과 겹치는 자리 — 겨냥 대상이 아니다. */
export const PRIMITIVE_CONTAINER = new Map([
  ["AccordionPrimitive.Item", "값 하나의 묶음(div) — 누름은 Trigger가 받는다"],
  ["NavigationMenuPrimitive.Item", "li 컨테이너 — 누름은 Trigger·Link가 받는다"],
])
/* 누름이 값을 옮기는 트랙 — radix Slider 는 Track/Root 의 pointerdown 으로 값을 옮긴다. */
const PRIMITIVE_PRESS_SURFACE = new Set(["SliderPrimitive.Track"])
export const NATIVE_INTERACTIVE = new Set(["button", "a", "input", "select", "textarea", "label", "summary"])
export const HANDLER_ATTRS = new Set(["onClick", "onPointerDown", "onPointerUp", "onMouseDown", "onTouchStart", "onKeyDown"])
export const INTERACTIVE_ROLES = new Set([
  "button", "link", "checkbox", "radio", "switch", "tab", "menuitem", "menuitemcheckbox", "menuitemradio",
  "option", "slider", "scrollbar", "combobox", "spinbutton", "gridcell", "treeitem",
])
/* 외부 라이브러리 컴포넌트 중 그 자체가 포인터 대상인 것 */
const EXTERNAL_INTERACTIVE = new Set(["ResizablePrimitive.Separator", "OTPInput"])

/* 파서는 ../tsx-ast.mjs 가 쥔다 — typescript@7 은 컴파일러 JS API 를 싣지 않아 @babel/parser 로 읽고,
 * parts 게이트(manifest/parts-coverage.mjs)와 같은 AST 를 본다(#246). */
const tagText = jsxName
const attrName = jsxAttrName
const literal = (a) => {
  if (a.type !== "JSXAttribute" || !a.value) return null
  if (a.value.type === "StringLiteral") return a.value.value
  if (a.value.type === "JSXExpressionContainer" && a.value.expression.type === "StringLiteral") return a.value.expression.value
  return null
}

function enclosingFunction(ancestors) {
  for (let i = ancestors.length - 1; i >= 0; i--) {
    const n = ancestors[i]
    if (n.type === "FunctionDeclaration" && n.id) return n.id.name
    if (n.type === "VariableDeclarator" && n.id.type === "Identifier" && n.init && (n.init.type === "ArrowFunctionExpression" || n.init.type === "FunctionExpression")) return n.id.name
  }
  return "-"
}

export function scanFile(file, text) {
  const component = path.basename(file, ".tsx")
  const ast = parseTsx(text)
  const ours = new Set()
  const locals = new Set()
  for (const stmt of ast.program.body) {
    if (stmt.type === "ImportDeclaration" && (stmt.source.value.startsWith("@/components/ui/") || stmt.source.value.startsWith("./")))
      for (const sp of stmt.specifiers) if (sp.type === "ImportSpecifier" && /^[A-Z]/.test(sp.local.name)) ours.add(sp.local.name)
    if (stmt.type === "FunctionDeclaration" && stmt.id) locals.add(stmt.id.name)
  }
  /* 태그가 변수인 자리 둘. `const Comp = asChild ? Slot.Root : "button"` 은 문자열 쪽이 기본 렌더이고,
   * `const Item = isContext ? ContextMenuPrimitive.Item : DropdownMenuPrimitive.Item` 은 뒤쪽(기본 모드)을
   * 따라간다. 첫 실측의 DOM 대조가 dropdown-menu-item 넷을 "스캔에 없음"으로 잡아 이 둘째 갈래가 생겼다. */
  const aliases = new Map()
  const exprText = (n) => n.type === "Identifier" ? n.name : n.type === "MemberExpression" ? `${exprText(n.object)}.${n.property.name}` : null
  for (const [node] of walk(ast.program))
    if (node.type === "VariableDeclarator" && node.id.type === "Identifier" && node.init?.type === "ConditionalExpression") {
      const lit = [node.init.consequent, node.init.alternate].find((b) => b.type === "StringLiteral")
      const fallback = exprText(node.init.alternate)
      if (lit) aliases.set(node.id.name, lit.value)
      else if (fallback) aliases.set(node.id.name, fallback)
    }
  const rows = []
  for (const [node, ancestors] of walk(ast.program)) {
    if (node.type !== "JSXOpeningElement") continue
    const written = tagText(node.name)
    const tag = aliases.get(written) ?? written
    const attrs = node.attributes
    const names = new Set(attrs.map(attrName).filter(Boolean))
    const slot = attrs.map((a) => (attrName(a) === "data-slot" ? literal(a) : null)).find(Boolean) ?? "-"
    const role = attrs.map((a) => (attrName(a) === "role" ? literal(a) : null)).find(Boolean)
    const rules = []
    const dot = tag.lastIndexOf(".")
    if (PRIMITIVE_CONTAINER.has(tag)) { /* 컨테이너 — 대상이 아니다 */ }
    else if (EXTERNAL_INTERACTIVE.has(tag)) rules.push(`external:${tag}`)
    else if (PRIMITIVE_PRESS_SURFACE.has(tag)) rules.push("primitive:press-surface")
    else if (dot > 0) {
      const [ns, member] = [tag.slice(0, dot), tag.slice(dot + 1)]
      if (PRIMITIVE_INTERACTIVE.has(member)) rules.push(`primitive:${member}`)
      else if (member === "Root" && PRIMITIVE_ROOT_IS_CONTROL.has(ns)) rules.push("primitive:Root")
    }
    if (NATIVE_INTERACTIVE.has(tag)) rules.push(`native:${tag}`)
    for (const h of HANDLER_ATTRS) if (names.has(h)) rules.push(`handler:${h}`)
    if (role && INTERACTIVE_ROLES.has(role)) rules.push(`role:${role}`)
    if (names.has("tabIndex")) rules.push("tabindex")
    if (ours.has(tag) && !locals.has(tag)) rules.push(`composed:${tag}`)
    if (rules.length) rows.push({ component, function: enclosingFunction(ancestors), slot, tag: written === tag ? tag : `${written}→${tag}`, rules, line: node.loc.start.line })
  }
  return rows
}

/* composed 규칙은 두 번째 패스에서 좁힌다 — 안에서 다시 쓰는 우리 컴포넌트가 **그 자체로
 * 대상일 때만**(Button·Input·PopoverTrigger…) 남고, Popover·Command 같은 컨테이너 합성은 빠진다.
 * 대상 함수의 집합은 첫 패스의 결과에서 기계로 얻는다 — 손으로 적은 목록이 아니다. */
export function scanAll() {
  const rows = readdirSync(dir).filter((f) => f.endsWith(".tsx")).sort()
    .flatMap((f) => scanFile(path.join(dir, f), readFileSync(path.join(dir, f), "utf8")))
  const targetFunctions = new Set(rows.filter((r) => r.rules.some((x) => !x.startsWith("composed:"))).map((r) => r.function))
  return rows.filter((r) => {
    const own = r.rules.filter((x) => !x.startsWith("composed:"))
    const composed = r.rules.filter((x) => x.startsWith("composed:") && targetFunctions.has(x.slice(9)))
    r.rules = [...own, ...composed]
    return r.rules.length > 0
  })
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.filename)) {
  const rows = scanAll()
  if (process.argv.includes("--json")) console.log(JSON.stringify(rows, null, 2))
  else {
    console.log(["component", "function", "slot", "tag", "rules", "line"].join("\t"))
    for (const r of rows) console.log([r.component, r.function, r.slot, r.tag, r.rules.join(","), r.line].join("\t"))
  }
}
