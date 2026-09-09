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

test("@theme에 열린 색 이름 중 쓰이지 않는 것이 없다", () => {
  // 반대 방향의 저울이다 — 위 테스트가 "부르는데 없는 것"을 잡는다면 이것은
  // "열어 뒀는데 아무도 안 부르는 것"을 잡는다. 열려 있으면 "쓸 수 있는데 왜
  // 안 쓰나"가 되고, 세면서 눈으로 관리하면 어긋난다(rules.md 방법론).
  // 표를 늘리는 것은 그것을 쓰는 컴포넌트가 생길 때다 (#280)
  const tokensCss = readFileSync(
    fileURLToPath(import.meta.resolve("@flameware/tokens/tokens.css")), "utf8"
  )
  const theme = tokensCss.match(/@theme inline \{([\s\S]*?)\n\}/)[1]
  const registered = [...theme.matchAll(/^\s*--(?:background|text|border)-color-([\w-]+):/gm)]
    .map((m) => m[1])
  assert.ok(registered.length > 0)

  const used = compiler.build([...candidates])
  const unused = registered.filter(
    (name) => !new RegExp(`\\.(?:bg|text|border)-${name}(?![\\w-])`).test(used)
  )
  assert.deepEqual(unused, [], "이 이름들은 등록만 되고 아무도 부르지 않는다")
})

test("hit-area가 24px 하한을 유사요소로 진다 — 시각 치수가 아니라 (ADR-0020)", () => {
  const css = compiler.build(["hit-area"])
  assert.match(css, /::after/)
  assert.match(css, /min-width:\s*24px/)
  assert.match(css, /min-height:\s*24px/)
})
