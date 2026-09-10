/* Button이 부르는 클래스가 **실제로 선언을 내는지** 잰다.
 *
 * 이 테스트가 있는 이유는 실패 모양 때문이다. Tailwind는 모르는 유틸리티를
 * 오류로 만들지 않고 **아무것도 내지 않는다** — `bg-accent-solid`를 @theme에
 * 등록하기 전에 쓰면 버튼이 조용히 투명해진다. scripts/check.mjs가 무는 것은
 * primitive 램프라는 **알려진** 오답이고, 여기서 무는 것은 오타·미등록·이름
 * 변경처럼 목록으로 적을 수 없는 쪽이다.
 *
 * cva 정의에서 클래스를 꺼내므로, 변형을 더하면 이 테스트가 자동으로 그것도 잰다. */
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { test } from "node:test"
import { compile } from "tailwindcss"

import { buttonVariants } from "../dist/button/index.js"

const root = fileURLToPath(new URL("..", import.meta.url))
const entry = resolve(root, "src/styles.css")

/** `@import`를 손으로 푼다 — 번들러 없이 컴파일러를 직접 부르기 때문. */
async function loadStylesheet(id, base) {
  const path = id === "tailwindcss"
    ? fileURLToPath(import.meta.resolve("tailwindcss/index.css"))
    : id.startsWith(".")
      ? resolve(base, id)
      : fileURLToPath(import.meta.resolve(id))
  return { path, base: dirname(path), content: readFileSync(path, "utf8") }
}

const compiler = await compile(readFileSync(entry, "utf8"), {
  base: dirname(entry),
  loadStylesheet,
  loadModule: async () => { throw new Error("JS 설정은 쓰지 않는다") },
})

/** cva가 내는 모든 조합의 클래스 합집합. */
const AXES = {
  variant: ["default", "destructive", "outline", "secondary", "ghost", "link"],
  size: ["sm", "md", "lg", "icon"],
  loading: [true, false],
}
const candidates = new Set()
for (const variant of AXES.variant) {
  for (const size of AXES.size) {
    for (const loading of AXES.loading) {
      for (const c of buttonVariants({ variant, size, loading }).split(/\s+/)) {
        if (c) candidates.add(c)
      }
    }
  }
}

test("Button이 부르는 클래스가 하나도 빠짐없이 선언을 낸다", () => {
  assert.ok(candidates.size > 20, `클래스가 ${candidates.size}개뿐이다 — 축을 못 읽었다`)

  // 컴파일러는 누적한다 — 한 번 받은 후보는 다음 build에도 남는다. 그래서
  // "이 후보가 낸 것"은 넣기 전후의 **차이**로만 잰다. 모르는 후보는 오류가
  // 아니라 0바이트라서, 길이가 그대로인 것이 곧 조용한 실패다
  let before = compiler.build([]).length
  const silent = []
  for (const candidate of candidates) {
    const after = compiler.build([candidate]).length
    if (after === before) silent.push(candidate)
    before = after
  }
  assert.deepEqual(silent, [], "이 클래스들은 CSS를 내지 않는다 — 조용히 무효다")
})

test("유틸리티 규칙은 semantic 변수만 집는다 — 팔레트를 거치지 않는다", () => {
  // 출력 전체에는 팔레트가 있다(:root가 통째로 실린다). 재는 것은 **유틸리티
  // 규칙의 본문**이다 — 거기 팔레트가 보이면 @theme 등록이 semantic 층을 건너뛴
  // 것이고, 그러면 .dark가 덮을 자리가 없어 라이트/다크 전환이 죽는다 (#7, #35)
  const css = compiler.build([...candidates])
  // `.dark`는 토큰 시트가 가진 유일한 클래스 규칙이고, semantic → palette 참조가
  // 사는 자리다. 재는 대상이 아니라 재는 기준이므로 빼고 본다
  const utilityBodies = [...css.matchAll(/^\s*(\.[^\n{]*)\{([^{}]*)\}/gm)]
    .filter((m) => m[1].trim() !== ".dark")
    .map((m) => m[2])
  assert.ok(utilityBodies.length > 10, `유틸리티 규칙이 ${utilityBodies.length}개뿐이다`)
  const leaking = utilityBodies.filter((b) => b.includes("--ds-palette-"))
  assert.deepEqual(leaking, [])
  assert.ok(utilityBodies.some((b) => b.includes("var(--ds-bg-accent-solid)")))
})

test("@theme에 열린 색 이름이 전부 실제로 CSS를 낸다", () => {
  // #280 전에는 Button이 부르는 이름만 열려 있었고(8개), 이 테스트가 "열어
  // 뒀는데 아무도 안 부르는 것"을 Button의 후보 집합으로 잡았다. #280은
  // Foundations 챕터가 토큰 이름을 찾아 쓰는 자리이므로 표를 Button 소비
  // 여부와 무관하게 **semantic에 있는 모든 색**으로 연다(css.mjs) — 그 색을
  // 실제로 부르는 곳은 Foundations 스토리(apps/storybook)이지 Button이 아니다.
  // 그래서 이 테스트는 "Button이 부르는가"가 아니라 "이름이 정말 CSS를
  // 내는가"를 잰다 — 오타나 semantic 쪽 참조가 끊긴 이름을 잡는다. 진짜
  // 소비는 apps/storybook의 스토리 테스트(#279 seam)가 렌더로 잰다
  const tokensCss = readFileSync(
    fileURLToPath(import.meta.resolve("@flameware/tokens/tokens.css")), "utf8"
  )
  const theme = tokensCss.match(/@theme inline \{([\s\S]*?)\n\}/)[1]
  const registered = [...theme.matchAll(/^\s*--(?:background|text|border)-color-([\w-]+):/gm)]
    .map((m) => m[1])
  assert.ok(registered.length > 0)

  const prefix = { "--background-color-": "bg", "--text-color-": "text", "--border-color-": "border" }
  const dead = []
  for (const [varPrefix, utilityPrefix] of Object.entries(prefix)) {
    for (const m of theme.matchAll(new RegExp(`^\\s*${varPrefix}([\\w-]+):`, "gm"))) {
      const className = `${utilityPrefix}-${m[1]}`
      const out = compiler.build([className])
      if (!new RegExp(`\\.${className.replace(/[/\\]/g, "\\$&")}\\b`).test(out)) dead.push(className)
    }
  }
  assert.deepEqual(dead, [], "이 이름들은 @theme에 등록됐지만 실제 유틸리티 클래스가 CSS를 내지 않는다")
})

/** `text`에서 `open`이 여는 구간을, 중첩 `{}`를 세어 그 짝이 닫히는 지점까지 자른다. */
function balancedBlock(text, openIndex) {
  let depth = 0
  for (let i = openIndex; i < text.length; i++) {
    if (text[i] === "{") depth++
    else if (text[i] === "}") {
      depth--
      if (depth === 0) return text.slice(openIndex + 1, i)
    }
  }
  throw new Error("짝이 맞지 않는 중괄호")
}

/** `@layer utilities { ... }`의 **최상위** 규칙들. `.state`처럼 안에 `&:hover`·
 *  `@supports`를 중첩한 규칙은 그 전체가 하나의 최상위 규칙이다 — 중첩까지
 *  들여다보면 한 규칙 안의 `&:hover`가 별개의 "작성자"로 잘못 세어진다. */
function topLevelRules(utilitiesBlock) {
  const rules = []
  let i = 0
  while (i < utilitiesBlock.length) {
    const brace = utilitiesBlock.indexOf("{", i)
    if (brace === -1) break
    const selector = utilitiesBlock.slice(i, brace).trim()
    const body = balancedBlock(utilitiesBlock, brace)
    rules.push({ selector, body })
    i = brace + body.length + 2 // +2 = 연 중괄호와 닫힌 중괄호
  }
  return rules
}

test("면을 가진 variant마다 background-color 작성자가 .state 하나뿐이다 (#299 회귀 테스트)", async () => {
  // #299의 실패 모양: bg-X와 .state가 같은 property·같은 specificity(0,1,0)를
  // 놓고 경쟁했고, 컴파일된 시트에서 나중에 나온 쪽(bg-X)이 이겨 상태 레이어의
  // color-mix가 한 번도 적용되지 않았다. 클래스가 **방출되는지**만 재는 위
  // 테스트로는 잡히지 않는다 — 셋 다 방출됐기 때문이다. 여기서는 **캐스케이드
  // 참여자 수**를 잰다: 한 variant가 부르는 클래스들이 내는 utilities 규칙(최상위
  // 하나) 중 background-color를 선언하는 것이 정확히 하나(.state)여야 한다.
  //
  // 위쪽 `compiler`는 파일 전체에서 **누적**된다(이전 테스트가 이미 전체 후보
  // 집합을 먹였다) — 그래서 이 테스트는 격리된 새 컴파일러를 쓴다
  for (const variant of ["default", "destructive", "outline", "secondary"]) {
    const isolated = await compile(readFileSync(entry, "utf8"), {
      base: dirname(entry),
      loadStylesheet,
      loadModule: async () => { throw new Error("JS 설정은 쓰지 않는다") },
    })
    const classes = buttonVariants({ variant }).split(/\s+/).filter(Boolean)
    const css = isolated.build(classes)
    const utilitiesStart = css.indexOf("@layer utilities {")
    const utilitiesBody = balancedBlock(css, css.indexOf("{", utilitiesStart))
    const writers = topLevelRules(utilitiesBody).filter((rule) =>
      /background-color:/.test(rule.body)
    )
    assert.deepEqual(
      writers.map((w) => w.selector),
      [".state"],
      `${variant}: background-color를 쓰는 유틸리티 규칙이 [${writers.map((w) => w.selector).join(", ")}]다 — .state 하나여야 한다`
    )
  }
})

test("hit-area가 24px 하한을 유사요소로 진다 — 시각 치수가 아니라 (ADR-0020)", () => {
  const css = compiler.build(["hit-area"])
  assert.match(css, /::after/)
  assert.match(css, /min-width:\s*24px/)
  assert.match(css, /min-height:\s*24px/)
})
