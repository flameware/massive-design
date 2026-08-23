import { writeFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { join } from "node:path"

import { loadComponentContracts, publicBarrel } from "./component-contracts.mjs"

const root = fileURLToPath(new URL("..", import.meta.url))
const contracts = await loadComponentContracts(root)
writeFileSync(join(root, "src/index.gen.ts"), publicBarrel(contracts))
console.log(`컴포넌트 계약 ${contracts.length}개 — 공개 배럴 생성`)
