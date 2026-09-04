/* 동작 확인표(#149).
 *
 * `behaviors`가 선언한 동작은 자동 검증이 0이다 — 동작이라 파생 채널이 나르지 않고,
 * 생성된 Storybook 스토리는 `axes ∪ configurationStates`에서만 나오므로 열림 계기의
 * 두 번째 모드를 한 번도 렌더하지 않는다. 그래서 사람이 진다(ADR-0005·ADR-0010).
 *
 * **이 스크립트가 존재하는 이유는 목록을 사람 손에서 떼는 것이다.** 확인 항목의 문장은
 * 종류마다 같고 `design-system-sync.md`가 산문으로 갖는다. 컴포넌트마다 다른 것은 어디를
 * 보는가뿐이고, 그것을 손으로 유지하자 세 번 샜다(#124·#125가 지나치고, #126의 손으로 쓴
 * 절 밖으로 #127이 곧바로 나갔다).
 *
 * **좁히지 않는다.** 선언한 자리를 매 세대 전부 찍는다 — 이 자리의 실패 양식은 피로가
 * 아니라 **빠짐**이다. 명시적 예외 둘은 runbook §1이 적는다.
 *
 * 열림 계기의 "기본 모드 불변" 항목이 요구하는 이번 세대의 해시는 매니페스트 인덱스
 * (`packages/ui/dist/manifest/index.gen.json`)에서 읽는다 — `bun run manifest` 뒤에 선다. */

import { readFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")

/** 종류마다 확인 항목의 문장이 같다 — 산문의 정본은 runbook이고 여기는 그 절을 가리킨다. */
const SECTIONS = {
  "control-gesture": { title: "컨트롤 제스처 확인", anchor: "design-system-sync.md § 컨트롤 제스처 확인" },
  "open-cause": { title: "열림 계기 확인", anchor: "design-system-sync.md § 열림 계기 확인" },
  "implicit-change": { title: "우발 변경 확인", anchor: "design-system-sync.md § 우발 변경 확인" },
}

/** 값은 계약하지 않으므로 origin이 "무엇을 볼지"를 가른다(ADR-0010). */
const ORIGIN_NOTE = {
  inherited: "상속 — upstream 기본값이 그대로인지도 함께 본다",
  ours: "우리 값 — 의도대로인지만 본다",
}

/**
 * @param contracts 계약 배열
 * @param index `index.gen.json`의 내용(`{ components: [{ component, hash }] }`) 또는 null
 */
export function checklistFor(contracts, index) {
  const lines = []
  const declared = contracts
    .flatMap((contract) => Object.entries(contract.behaviors ?? {}).map(([behavior, declaration]) => ({ contract, behavior, ...declaration })))
    .sort((a, b) => a.contract.name.localeCompare(b.contract.name) || a.behavior.localeCompare(b.behavior))

  const hashes = new Map((index?.components ?? []).map(({ component, hash }) => [component, hash]))
  const kinds = Object.keys(SECTIONS).filter((kind) => declared.some((entry) => entry.kind === kind))

  lines.push(`동작 확인표 — ${declared.length}자리 / ${new Set(declared.map((entry) => entry.contract.name)).size}개 컴포넌트`)
  if (!index) lines.push("경고: packages/ui/dist/manifest/index.gen.json이 없다 — bun run manifest를 먼저 실행한다")
  if (!declared.length) {
    lines.push("", "선언된 동작이 없다.")
    return `${lines.join("\n")}\n`
  }

  for (const kind of kinds) {
    lines.push("", `## ${SECTIONS[kind].title} — 항목의 정본은 ${SECTIONS[kind].anchor}`)
    for (const entry of declared.filter((item) => item.kind === kind)) {
      const bits = [entry.surface, ORIGIN_NOTE[entry.origin]]
      if (entry.control) bits.push(`바꾸는 자리: ${entry.control}`)
      if (kind === "open-cause") bits.push(`기본 모드 해시: ${hashes.get(entry.contract.name) ?? "(인덱스에 없다)"}`)
      lines.push(`- [ ] ${entry.contract.name}.${entry.behavior} — ${bits.join(" · ")}`)
      lines.push(`      ${entry.why}`)
    }
  }

  lines.push("", "확인 결과는 PR 설명에 어느 항목이 통과했는지로 적는다.")
  return `${lines.join("\n")}\n`
}

async function main() {
  /* .tsx 계약을 직접 읽으므로 bun이 필요하다. 최상위 import로 두면 node로 도는
   * scripts/*.test.mjs가 이 파일을 불러오는 것만으로 깨진다. */
  const { loadComponentContracts } = await import("../packages/ui/scripts/component-contracts.mjs")
  const contracts = await loadComponentContracts(path.join(root, "packages/ui"))
  let index = null
  try {
    index = JSON.parse(await readFile(path.join(root, "packages/ui/dist/manifest/index.gen.json"), "utf8"))
  } catch {
    // 인덱스가 없는 것도 확인표가 말해야 하는 사실이다 — 여기서 던지면 그 문장이 안 나온다
  }
  process.stdout.write(checklistFor(contracts, index))
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main()
