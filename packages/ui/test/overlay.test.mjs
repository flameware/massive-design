/* Dialog·AlertDialog·Drawer(#284)가 부르는 정적 클래스가 실제로 선언을 내는지
 * 잰다 — utilities.test.mjs와 같은 이유다(오타·미등록 이름은 Tailwind에서
 * 조용히 0바이트가 된다). 이 셋은 cva 축이 없어 button.test.mjs처럼 조합을
 * 곱하지 않는다 — 소스에서 `cn(...)`에 적힌 리터럴 클래스를 그대로 모은다. */
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { test } from "node:test"
import { compile } from "tailwindcss"

const root = fileURLToPath(new URL("..", import.meta.url))
const entry = resolve(root, "src/styles.css")

async function loadStylesheet(id, base) {
  const path =
    id === "tailwindcss"
      ? fileURLToPath(import.meta.resolve("tailwindcss/index.css"))
      : id.startsWith(".")
        ? resolve(base, id)
        : fileURLToPath(import.meta.resolve(id))
  return { path, base: dirname(path), content: readFileSync(path, "utf8") }
}

const compiler = await compile(readFileSync(entry, "utf8"), {
  base: dirname(entry),
  loadStylesheet,
  loadModule: async () => {
    throw new Error("JS 설정은 쓰지 않는다")
  },
})

/** `cn(...)` 호출 안의 문자열 리터럴에서 클래스 후보를 모은다. 코드 자체가
 * 정본이므로, 클래스를 고치면 이 목록도 다시 읽는다 — 손으로 옮겨 적지 않는다. */
function classesFromSource(relativePath) {
  const text = readFileSync(resolve(root, relativePath), "utf8")
  const candidates = new Set()
  for (const call of text.matchAll(/cn\(([\s\S]*?)\)\s*\}/g)) {
    for (const literal of call[1].matchAll(/"([^"]*)"/g)) {
      for (const c of literal[1].split(/\s+/)) if (c) candidates.add(c)
    }
  }
  return candidates
}

const sources = [
  "src/dialog/shared.tsx",
  "src/drawer/drawer.tsx",
]

const candidates = new Set()
for (const source of sources) for (const c of classesFromSource(source)) candidates.add(c)

test("Dialog·AlertDialog·Drawer 표면 클래스가 오타 없이 읽힌다", () => {
  assert.ok(candidates.size > 20, `클래스가 ${candidates.size}개뿐이다 — 소스에서 못 읽었다`)
})

test("Dialog·AlertDialog·Drawer가 부르는 클래스가 하나도 빠짐없이 선언을 낸다", () => {
  let before = compiler.build([]).length
  const silent = []
  for (const candidate of candidates) {
    const after = compiler.build([candidate]).length
    if (after === before) silent.push(candidate)
    before = after
  }
  assert.deepEqual(silent, [], "이 클래스들은 CSS를 내지 않는다 — 조용히 무효다")
})
