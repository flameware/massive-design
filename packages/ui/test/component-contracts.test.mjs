import assert from "node:assert/strict"
import test from "node:test"

import { publicBarrel, validateContracts } from "../scripts/component-contracts.mjs"

const contract = (name, source = `src/components/ui/${name}.tsx`) => ({
  name, source, publicExports: ["Widget"],
  config: { variants: {}, defaultVariants: {} }, className: () => "",
  reference: { example: name, guidance: { use: "use", evidence: "evidence", limits: "limits" } },
})

test("source와 계약은 빠짐과 유령 없이 일대일이다", () => {
  assert.throws(() => validateContracts(["a.tsx", "b.tsx"], [contract("a")]), /계약이 없는 컴포넌트 source/)
  assert.throws(() => validateContracts(["a.tsx"], [contract("a"), contract("ghost")]), /존재하지 않는 계약 source/)
})

test("중복 name/source를 거부한다", () => {
  assert.throws(
    () => validateContracts(["a.tsx", "b.tsx"], [contract("same", "src/components/ui/a.tsx"), contract("same", "src/components/ui/b.tsx")]),
    /중복 컴포넌트 이름/
  )
})

test("공개 배럴은 계약의 source와 export에서만 파생된다", () => {
  assert.match(publicBarrel([contract("a")]), /export \{ Widget \} from "\.\/components\/ui\/a\.js"/)
})

test("authored guidance와 대표 예시는 모든 계약에 필요하다", () => {
  const missing = contract("a")
  delete missing.reference
  assert.throws(() => validateContracts(["a.tsx"], [missing]), /reference 계약이 없는 컴포넌트/)

  const empty = contract("a")
  empty.reference.guidance.use = ""
  assert.throws(() => validateContracts(["a.tsx"], [empty]), /authored guidance가 비어 있다/)
})
