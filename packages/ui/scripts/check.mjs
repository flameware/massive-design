/* @massive/ui의 게이트. packages/tokens의 check와 같은 자리에 선다.
 *
 * 네 가지를 지킨다:
 *   1. primitive를 직접 집는 곳이 없다 — 노출하지 않기로 한 계층이 컴포넌트로
 *      새는 순간을 잡는다. `bg-brand-500` 같은 유틸리티는 @theme에 없어서
 *      "조용히 아무 스타일도 안 나오는" 방식으로 실패하므로 눈으로는 안 보인다
 *   2. state layer 사다리가 primitive scale.json과 같다 — 그 토큰들은 noCss라
 *      CSS 변수로 나오지 않고 styles.css가 값을 손으로 적은 유일한 사본이다
 *   3. 매니페스트의 토큰 계열이 그 값이 놓인 CSS 속성과 맞는다 — 배경용 이름을
 *      글자색에 쓴 자리를 잡는다(#37). 규칙 본문은 scripts/manifest/lint.mjs
 *   4. 매니페스트가 가리키는 토큰이 전부 번역표 ②에 있다 — 없는 이름은 주입 때
 *      조용히 리터럴이 된다(#41). 표는 @massive/tokens의 생성물이라 여기서만 볼 수
 *      있다: 표는 토큰 패키지가 갖고 매니페스트는 UI 패키지가 갖는다
 *
 *   6. 클래스를 내는 anatomy 노드는 `parts`에 있다 — 노드의 클래스가 어느 매니페스트
 *      셀에도 없으면 통과가 아니라 침묵이다(ADR-0006의 Card, #195의 기준). 규칙 본문과
 *      예외의 모양은 scripts/manifest/parts-coverage.mjs
 *
 * 규칙 3·6은 **커밋된 매니페스트**를 읽는다. node로 도는 이 파일이 .tsx를 계약 모듈로
 * 못 벗기기 때문이고(생성기는 bun 전용 — 규칙 6은 소스를 @babel/parser로 읽을 뿐 import하지
 * 않는다), 낡은 매니페스트로 통과하는 일은 같은 `check` 사슬의 `manifest:verify`가
 * 막는다 — 그것이 소스와의 일치를 이미 보증한다. */
import { readFileSync, readdirSync, statSync } from "node:fs"
import { createRequire } from "node:module"
import { join, relative } from "node:path"
import { fileURLToPath } from "node:url"

import { OUT_DIR } from "./manifest/build.mjs"
import { lintGuidance, lintManifest, lintVarMapCoverage } from "./manifest/lint.mjs"
import { formatFailures, formatSummary, runPartsCoverage } from "./manifest/parts-coverage.mjs"

const root = fileURLToPath(new URL("..", import.meta.url))
const src = join(root, "src")
const errors = []
const guidanceErrors = []

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

// 사다리는 state.css에 산다 — styles.css에서 분리된 것이 규약이다(#23).
// 생성기가 @source 오염 없이 단독 컴파일하려면 그래야 한다
const css = readFileSync(join(src, "state.css"), "utf8")
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
      `src/state.css — &:${state}의 --ds-state-alpha가 ${got ?? "없음"}, scale.json은 ${want}`
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

// 3. 매니페스트 토큰 계열 ↔ CSS 속성
const manifestDir = join(root, OUT_DIR)
let manifests = []
try {
  manifests = readdirSync(manifestDir).filter((n) => n.endsWith(".gen.json") && n !== "index.gen.json")
} catch {
  errors.push(`${OUT_DIR}/ — 매니페스트가 없다. bun run manifest를 먼저 돌릴 것`)
}

// 4. 번역표 ② 커버리지
//
// 상대 경로가 아니라 exports를 탄다 — 이 파일은 `dist/` 밑만 내보내므로(#15),
// 리포 밖 소비처가 이 표를 읽는 길과 같은 길로 읽는다. 규칙 2의 scale.json이
// 상대 경로인 것은 그것이 **원본**이라 애초에 내보내지지 않기 때문이다.
const VAR_MAP = "@massive/tokens/dist/figma/var-map.gen.json"
let varMap = {}
try {
  varMap = JSON.parse(readFileSync(createRequire(import.meta.url).resolve(VAR_MAP), "utf8"))
} catch {
  errors.push(`${VAR_MAP} — 없다. @massive/tokens의 tokens:build를 먼저 돌릴 것`)
}

for (const name of manifests) {
  const doc = JSON.parse(readFileSync(join(manifestDir, name), "utf8"))
  for (const e of lintManifest(doc)) errors.push(`${OUT_DIR}/${name} — ${e}`)
  for (const e of lintVarMapCoverage(doc, varMap)) errors.push(`${OUT_DIR}/${name} — ${e}`)
  for (const e of lintGuidance(doc)) guidanceErrors.push(`${OUT_DIR}/${name} — ${e}`)
}

// 6. 클래스를 내는 anatomy 노드 ↔ parts 셀 (#246) — **경고**다, 실패가 아니다.
//
// 이 모집단은 Figma 채널이 그리는 정밀도의 문제다. Figma가 요청 시 스냅숏으로 격하된
// 뒤(ADR-0002 개정, 2026-09-04) 이 수를 0으로 유지하는 것은 CI가 막을 일이 아니라
// 다음 스냅숏을 뜨는 사람이 읽을 사실이다. 예외 둘(pagination.PaginationLink·
// toggle-group.ToggleGroupItem)은 여전히 검사 가능한 주장으로 통과한다.
let partsSummary = "parts 게이트 건너뜀"
const partsWarnings = []
if (manifests.length) {
  const result = runPartsCoverage(root)
  for (const e of formatFailures(result)) partsWarnings.push(e)
  partsSummary = formatSummary(result)
}

if (errors.length) {
  console.error("@massive/ui check 실패:")
  for (const e of errors) console.error("  " + e)
  process.exit(1)
}

// 5. 참조 화면 guidance — 판정 기록이 계약 안에 남아 있는지(ADR-0022)
//
// 51개 중 다수가 이미 상한을 넘겨 있다 — 이 목록이 그 분해 작업의 대상
// 목록이고, 손으로 훑어 만들지 않는다(#165의 "모집단은 눈으로 읽지 않는다").
if (guidanceErrors.length) {
  console.error(`@massive/ui check 실패 — reference.guidance가 ADR-0022 상한을 넘는다 (${guidanceErrors.length}건):`)
  for (const e of guidanceErrors) console.error("  " + e)
  process.exit(1)
}
if (partsWarnings.length) {
  console.warn(`@massive/ui check 경고 — parts 모집단 ${partsWarnings.length}건 (Figma 스냅숏 전에 읽는다, CI는 막지 않는다):`)
  for (const e of partsWarnings) console.warn("  " + e)
}
const ladderText = expected.map(([s, v]) => `${s}=${v}`).join(" ")
const varMapSize = Object.keys(varMap).filter((k) => !k.startsWith("$")).length
console.log(
  `@massive/ui check 통과 — 파일 ${files.length}개, state 사다리 ${ladderText}, ` +
    `매니페스트 ${manifests.length}개의 토큰 계열과 번역표 ${varMapSize}칸 커버리지, ${partsSummary}`
)
