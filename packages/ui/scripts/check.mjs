/* @massive/ui의 게이트. packages/tokens의 check와 같은 자리에 선다.
 *
 * 두 가지를 지킨다:
 *   1. primitive를 직접 집는 곳이 없다 — 노출하지 않기로 한 계층이 컴포넌트로
 *      새는 순간을 잡는다. `bg-brand-500` 같은 유틸리티는 @theme에 없어서
 *      "조용히 아무 스타일도 안 나오는" 방식으로 실패하므로 눈으로는 안 보인다
 *   2. state layer 사다리가 primitive scale.json과 같다 — 그 토큰들은 noCss라
 *      CSS 변수로 나오지 않고 styles.css가 값을 손으로 적은 유일한 사본이다 */
import { readFileSync, readdirSync, statSync } from "node:fs"
import { join, relative } from "node:path"
import { fileURLToPath } from "node:url"

const root = fileURLToPath(new URL("..", import.meta.url))
const src = join(root, "src")
const errors = []

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name)
    return statSync(p).isDirectory() ? walk(p) : [p]
  })
}

const files = walk(src)

// 1. primitive 누출
const FAMILIES = ["brand", "neutral", "danger", "success"]
const primitivePatterns = [
  { re: /--ds-palette-/g, why: "palette 변수를 직접 읽는다" },
  {
    re: new RegExp(`\\b(?:bg|text|border|ring|fill|stroke|from|via|to|outline|decoration|shadow|accent|caret|divide|placeholder)-(?:${FAMILIES.join("|")})-\\d`, "g"),
    why: "primitive 램프를 유틸리티로 집는다 — @theme에 없으므로 조용히 무효가 된다",
  },
]

for (const file of files) {
  const text = readFileSync(file, "utf8")
  for (const { re, why } of primitivePatterns) {
    for (const m of text.matchAll(re)) {
      const line = text.slice(0, m.index).split("\n").length
      errors.push(`${relative(root, file)}:${line} — ${m[0]}: ${why}`)
    }
  }
}

// 2. state layer 사다리
const scale = JSON.parse(
  readFileSync(join(root, "../tokens/tokens/primitive/scale.json"), "utf8")
)
const opacity = (name) => scale.state[name].opacity.$value

const css = readFileSync(join(src, "styles.css"), "utf8")
const ladder = [...css.matchAll(/&:(hover|active)\s*\{\s*--ds-state-alpha:\s*([\d.]+)%/g)].map(
  (m) => [m[1], Number(m[2]) / 100]
)
const expected = [
  ["hover", opacity("hover")],
  ["active", opacity("pressed")],
]
for (const [state, want] of expected) {
  const got = ladder.find(([s]) => s === state)?.[1]
  if (got !== want) {
    errors.push(
      `src/styles.css — &:${state}의 --ds-state-alpha가 ${got ?? "없음"}, scale.json은 ${want}`
    )
  }
}

// disabled는 층이 아니라 요소 전체의 불투명도라 shadcn의 유틸리티가 값을 쥔다
const button = readFileSync(join(src, "components/ui/button.tsx"), "utf8")
const disabledWant = `disabled:opacity-${opacity("disabled") * 100}`
if (!button.includes(disabledWant)) {
  errors.push(
    `src/components/ui/button.tsx — ${disabledWant}가 없다. scale.json의 state.disabled.opacity는 ${opacity("disabled")}`
  )
}

if (errors.length) {
  console.error("@massive/ui check 실패:")
  for (const e of errors) console.error("  " + e)
  process.exit(1)
}
console.log(`@massive/ui check 통과 — 파일 ${files.length}개, state 사다리 ${expected.map(([s, v]) => `${s}=${v}`).join(" ")}`)
