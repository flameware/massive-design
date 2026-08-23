/* 커밋된 매니페스트가 소스와 어긋났는지 본다. `bun run manifest:verify`.
 *
 * 리포가 하나라서 성립하는 게이트다(ADR-0001): 컴포넌트를 고치고 매니페스트를
 * 안 돌리면 여기서 빨개진다. 토큰의 verify와 같은 방식으로 메모리에서 렌더해
 * 비교하고, 유령 파일을 따로 본다. */
import { readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"

import { buildManifests, OUT_DIR } from "./manifest/build.mjs"
import { COMPONENTS } from "./manifest/components.mjs"
import { publicBarrel } from "./component-contracts.mjs"

export function verifyManifests(root) {
  const built = buildManifests(COMPONENTS, root)
  const dir = join(root, OUT_DIR)
  const stale = []

  for (const [name, expected] of built) {
    let actual
    try {
      actual = readFileSync(join(dir, name), "utf8")
    } catch {
      stale.push(`${OUT_DIR}/${name} — 없다`)
      continue
    }
    if (actual !== expected) stale.push(`${OUT_DIR}/${name} — 소스와 어긋났다`)
  }

  let present = []
  try {
    present = readdirSync(dir)
  } catch {
    /* 위에서 이미 "없다"로 잡힌다 */
  }
  for (const name of present) if (!built.has(name)) stale.push(`${OUT_DIR}/${name} — 빌드가 내지 않는 파일이다`)

  const barrel = "src/index.gen.ts"
  try {
    if (readFileSync(join(root, barrel), "utf8") !== publicBarrel(COMPONENTS)) stale.push(`${barrel} — 계약과 어긋났다`)
  } catch {
    stale.push(`${barrel} — 없다`)
  }

  return stale
}

const root = fileURLToPath(new URL("..", import.meta.url))
const stale = verifyManifests(root)
for (const s of stale) console.error(`✗ ${s}`)
if (stale.length) {
  console.error("\nmanifest:verify 실패 — bun run manifest를 다시 돌리고 커밋할 것")
  process.exit(1)
}
console.log("manifest:verify 통과 — 커밋된 매니페스트가 소스와 일치한다")
