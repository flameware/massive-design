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

test("외부 소유 표면에는 이유가 붙고, 우리 표면과 겹치지 않는다", () => {
  const noReason = contract("a")
  noReason.externalSurfaces = { "슬라이드 트랙": "" }
  assert.throws(() => validateContracts(["a.tsx"], [noReason]), /외부 소유 표면에는 이유가 필요하다/)

  const overlapping = contract("a")
  overlapping.anatomy = ["Widget", "WidgetTrack"]
  overlapping.externalSurfaces = { WidgetTrack: "라이브러리가 트랜스폼을 소유한다" }
  assert.throws(() => validateContracts(["a.tsx"], [overlapping]), /anatomy·parts와 겹친다/)

  const empty = contract("a")
  empty.externalSurfaces = {}
  assert.throws(() => validateContracts(["a.tsx"], [empty]), /비어 있지 않은 객체/)

  const ok = contract("a")
  ok.anatomy = ["Widget"]
  ok.externalSurfaces = { "슬라이드 트랙": "embla가 트랜스폼과 레이아웃을 소유한다" }
  assert.doesNotThrow(() => validateContracts(["a.tsx"], [ok]))
})
