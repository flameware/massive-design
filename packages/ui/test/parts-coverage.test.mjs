/* parts 게이트(#246) — "클래스를 내는 anatomy 노드는 parts에 있어야 한다"를 매니페스트와
 * 소스의 대조로 묻는다. 실제로 났던 침묵은 Card가 파트 여섯을 공개하면서 anatomy: []로
 * 43세대를 통과한 것(ADR-0006)이고, #195가 같은 기준으로 14 계약·54 노드를 셌다. */
import assert from "node:assert/strict"
import { test } from "node:test"

import { carriedTokens, createSourceReader, evaluatePartsCoverage, formatFailures, verifyException } from "../scripts/manifest/parts-coverage.mjs"

const ROOT = "/repo"
const manifest = (component, { anatomy, cells = [], parts = {} }) => ({
  component, source: `src/components/ui/${component}.tsx`, anatomy, cells, parts,
})
const cell = (className) => ({ className })
const rel = (file) => file.slice(`${ROOT}/src/components/ui/`.length)
const files = (map) => createSourceReader(ROOT, {
  readFile: (file) => { if (!(rel(file) in map)) throw new Error(`fixture에 없는 파일: ${file}`); return map[rel(file)] },
  exists: (file) => rel(file) in map,
})
const evaluate = (manifests, sources, exceptions = []) =>
  evaluatePartsCoverage({ manifests, reader: files(sources), exceptions, root: ROOT })

const CARD = `
import { cn } from "@/lib/utils"
function Card({ className, ...props }) { return <div data-slot="card" className={cn("rounded-xl border", className)} {...props} /> }
function CardHeader({ className, ...props }) { return <div data-slot="card-header" className={cn("grid gap-1.5 px-6", className)} {...props} /> }
`

test("Card의 침묵 — 클래스를 내는 anatomy 노드가 어느 셀에도 없으면 잡는다", () => {
  const result = evaluate(
    [manifest("card", { anatomy: ["Card", "CardHeader?"], cells: [cell("rounded-xl border")] })],
    { "card.tsx": CARD }
  )
  assert.deepEqual(result.population, ["card"])
  assert.equal(result.violations.length, 1)
  assert.deepEqual(result.violations[0], { component: "card", node: "CardHeader", line: 4, missing: ["grid", "gap-1.5", "px-6"] })
  assert.match(formatFailures(result)[0], /card\.CardHeader\(:4\) — 클래스를 내는 anatomy 노드가 parts에 없다: grid gap-1\.5 px-6/)
})

test("parts 셀이 토큰을 다 담으면 통과한다 — 기준은 셀의 합집합이지 parts 키의 유무가 아니다", () => {
  const result = evaluate(
    [manifest("card", { anatomy: ["Card", "CardHeader?"], cells: [cell("rounded-xl border")], parts: { CardHeader: { cells: [cell("grid gap-1.5 px-6")] } } })],
    { "card.tsx": CARD }
  )
  assert.deepEqual(result.population, [])
  assert.equal(result.violations.length, 0)
  assert.equal(result.rows.length, 2)
})

test("anatomy 밖 노드는 세되 묻지 않는다 — 층이 다르다(ADR-0018)", () => {
  const src = `
import { cn } from "@/lib/utils"
function Kbd({ className, ...props }) { return <kbd data-slot="kbd" className={cn("rounded", className)}><svg className="size-4" /><span className="sr-only">x</span></kbd> }
`
  const result = evaluate([manifest("kbd", { anatomy: ["Kbd"], cells: [cell("rounded")] })], { "kbd.tsx": src })
  assert.equal(result.violations.length, 0)
  assert.equal(result.outside, 2)
})

test("무접두 anatomy 이름은 접두를 뗀 슬롯으로 대응한다 — #243의 규칙", () => {
  const src = `
import { cn } from "@/lib/utils"
function Checkbox({ className, ...props }) { return <button data-slot="checkbox" className={cn("size-4", className)}><span data-slot="checkbox-indicator" className="grid place-content-center" /></button> }
`
  const result = evaluate([manifest("checkbox", { anatomy: ["Checkbox", "Indicator"], cells: [cell("size-4")] })], { "checkbox.tsx": src })
  assert.deepEqual(result.violations.map((v) => v.node), ["Indicator"])
})

test("표기를 가리지 않는다 — 맨 문자열·변수·cva 호출 전부 토큰이다(#162의 실패 모드)", () => {
  const src = `
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"
const THUMB = "block size-4 rounded-full"
const rootVariants = cva("peer inline-flex", { variants: { size: { default: "h-5 w-9", sm: "h-4 w-7" } }, defaultVariants: { size: "default" } })
function Switch({ className, size, ...props }) { return <button data-slot="switch" className={cn(rootVariants({ size }), className)}><span data-slot="switch-thumb" className={THUMB} /></button> }
`
  const result = evaluate([manifest("switch", { anatomy: ["Switch", "Thumb"], cells: [cell("peer inline-flex h-5 w-9"), cell("peer inline-flex h-4 w-7")] })], { "switch.tsx": src })
  assert.deepEqual(result.violations.map((v) => [v.node, v.missing]), [["Thumb", ["block", "size-4", "rounded-full"]]])
})

test("변형 선택 인자가 리터럴이면 고른 변형만, 식이면 축 전부를 센다", () => {
  const button = `
import { cva } from "class-variance-authority"
export const buttonVariants = cva("inline-flex", { variants: { variant: { ghost: "hover:bg-accent", outline: "border shadow-xs" }, size: { default: "h-9 px-4", icon: "size-9" } }, defaultVariants: { variant: "ghost", size: "default" } })
`
  const link = `
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
function Link({ className, isActive, size, ...props }) { return <a data-slot="link" className={cn(buttonVariants({ variant: isActive ? "outline" : "ghost", size }), className)} {...props} /> }
function Only({ className, ...props }) { return <a data-slot="only" className={cn(buttonVariants({ variant: "ghost", size: "icon" }), className)} {...props} /> }
`
  const result = evaluate(
    [manifest("link", { anatomy: ["Link", "Only"], cells: [cell("inline-flex hover:bg-accent size-9")] })],
    { "link.tsx": link, "button.tsx": button }
  )
  const byNode = Object.fromEntries(result.rows.map((r) => [r.anatomyName, r.missing]))
  assert.deepEqual(byNode.Only, [])
  assert.deepEqual(byNode.Link, ["border", "shadow-xs", "h-9", "px-4"])
})

test("예외 elsewhere — 빠진 토큰이 전부 그 계약의 셀에 있어야 통과한다(ADR-0012)", () => {
  const button = manifest("button", { anatomy: ["Button"], cells: [cell("inline-flex border shadow-xs")] })
  const byName = new Map([[button.component, button]])
  assert.equal(verifyException({ elsewhere: "button" }, ["border", "shadow-xs"], byName), null)
  assert.match(verifyException({ elsewhere: "button" }, ["border", "h-9"], byName), /셀에 없는 토큰이 있다 — h-9/)
  assert.match(verifyException({ elsewhere: "ghost" }, ["border"], byName), /계약이 없다/)
})

test("예외 overriddenBy — 빠진 토큰 각각이 tailwind-merge로 덮여야 통과한다", () => {
  assert.equal(verifyException({ overriddenBy: "min-w-0 px-3" }, ["min-w-8", "px-1.5", "min-w-9"], new Map()), null)
  assert.match(verifyException({ overriddenBy: "min-w-0" }, ["min-w-8", "px-1.5"], new Map()), /덮지 않는 토큰이 있다 — px-1\.5/)
  assert.match(verifyException({ reason: "이유만" }, ["x"], new Map()), /검사 가능한 주장이 필요하다/)
})

test("예외는 이유가 아니라 주장으로 통과한다 — 거짓 주장과 낡은 예외는 빨갛다", () => {
  const manifests = [manifest("card", { anatomy: ["Card", "CardHeader?"], cells: [cell("rounded-xl border")] })]
  const ok = evaluate(manifests, { "card.tsx": CARD }, [{ component: "card", node: "CardHeader", overriddenBy: "block gap-2 px-0", reason: "r" }])
  assert.deepEqual(ok.population, [])
  assert.deepEqual(ok.exempted.map((e) => e.node), ["CardHeader"])
  assert.deepEqual(ok.errors, [])

  const falsified = evaluate(manifests, { "card.tsx": CARD }, [{ component: "card", node: "CardHeader", overriddenBy: "px-0", reason: "r" }])
  assert.deepEqual(falsified.population, [])
  assert.match(falsified.errors[0], /card\.CardHeader — 예외의 주장이 거짓이다/)

  const stale = evaluate(
    [manifest("card", { anatomy: ["Card", "CardHeader?"], cells: [cell("rounded-xl border grid gap-1.5 px-6")] })],
    { "card.tsx": CARD },
    [{ component: "card", node: "CardHeader", elsewhere: "card", reason: "r" }]
  )
  assert.match(stale.errors[0], /card\.CardHeader — 예외가 낡았다/)
  assert.equal(formatFailures(stale).length, 1)
})

test("해석 못 한 식별자는 침묵이라 빨갛다", () => {
  const src = `
import { cn } from "@/lib/utils"
import { mystery } from "some-lib"
function X({ className }) { return <div data-slot="x" className={cn(mystery, className)} /> }
`
  const result = evaluate([manifest("x", { anatomy: ["X"], cells: [cell("")] })], { "x.tsx": src })
  assert.match(result.errors[0], /x:4 — 해석 못 한 식별자\(mystery\)/)
})

test("carriedTokens는 루트 셀과 parts 셀의 합집합이다", () => {
  const set = carriedTokens({ cells: [cell("a b")], parts: { P: { cells: [cell("b c")] } } })
  assert.deepEqual([...set].sort(), ["a", "b", "c"])
})
