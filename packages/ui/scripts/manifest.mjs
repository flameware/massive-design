/* 매니페스트를 dist에 쓴다. `bun run manifest`.
 *
 * bun으로 도는 이유는 build.mjs 머리말에 있다 — 컴포넌트가 .tsx다. */
import { mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"

import { buildManifests, OUT_DIR } from "./manifest/build.mjs"
import { COMPONENTS } from "./manifest/components.mjs"
import { publicBarrel } from "./component-contracts.mjs"

const root = fileURLToPath(new URL("..", import.meta.url))
const files = buildManifests(COMPONENTS, root)
const dir = join(root, OUT_DIR)

mkdirSync(dir, { recursive: true })
// 이름이 바뀐 뒤 남은 옛 산출물도 배포에 실린다 — 유령 파일을 지운다
for (const name of readdirSync(dir)) if (!files.has(name)) rmSync(join(dir, name))
for (const [name, content] of files) writeFileSync(join(dir, name), content)
writeFileSync(join(root, "src/index.gen.ts"), publicBarrel(COMPONENTS))

console.log(`매니페스트 ${files.size}개 — ${[...files.keys()].join(", ")}`)
