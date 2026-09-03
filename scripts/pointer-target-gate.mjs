/* 포인터 대상 실측 게이트 (#232, 맵 #111 결정 6 — 정책표 등급은 그대로 두고 실측 게이트를 따로 둔다).
 *
 * `apps/storybook/scripts/pointer-targets.mjs`(#228의 계기)가 낸 실측을 두 가지로 문다.
 *
 *   1. **하한 미달** — `square24`가 거짓인 대상 중 예외 목록에 없는 것
 *   2. **미신고 겹침** — 히트 영역이 시각 상자 밖으로 넘쳤는데(overage) 그 오버리지가
 *      **기준선에 없던 것**. ADR-0020 결정 5는 "선언은 계약 필드가 아니라 계산"이라고
 *      정했다 — 그 계산이 사는 자리는 커밋된 기준선(docs/research/pointer-targets-2026-09.md의
 *      TSV)이다. 실측을 돌려 기준선을 갱신하는 행위 자체가 선언이라, 기준선에 이미 있는
 *      오버리지는 선언된 것이고 없던 오버리지는 이번 세대가 조용히 늘린 것이라 문다.
 *      `after:` 계산 스타일 하나만으로 판정하지 않는다 — 참조 스토리의 구성(같은 행의
 *      다른 대상)이 `after:` 없이도 오버리지처럼 읽히는 잡음이 있고, 그 잡음도 기준선에
 *      똑같이 찍혀 있어 기준선 대조가 잡음과 신규 오버리지를 갈라 준다.
 *
 * **정책표(classify.mjs)는 건드리지 않는다.** "Figma가 그리는가"에 답하는 도구와
 * "규칙이 지켜지는가"에 답하는 도구를 하나로 섞은 것이 #109의 실패였다(ADR-0020 결정 6).
 *
 * 기준선 대비 진단. 지금 main은 #230·#249가 아직 안 끝나 미달이 남아 있으므로, 같은
 * 미달이라도 **기준선(docs/research/pointer-targets-2026-09.md의 TSV)에도 있던 것**(이미
 * 알려진 간격, known gap)과 **기준선에는 없던 것**(이번 세대가 새로 냄, regression)을
 * 갈라 보고한다. 예외 목록에 없으면 둘 다 게이트를 실패시킨다 — 구분은 보고를 읽는 사람을
 * 위한 것이지 판정을 봐주는 것이 아니다(#232 acceptance: "목록에 없는 미달은 문다").
 *
 * 예외 목록은 #231이 만든다. 경로를 하드코딩하지 않는다 — --exceptions 로 주거나 기본
 * 경로(POINTER_TARGET_EXCEPTIONS_DEFAULT)가 없으면 빈 목록으로 돈다.
 *
 * CI 승격은 보류한다(맵 #111 결정 6, 이 티켓의 out of scope). 이 스크립트는 `bun run check`
 * 사슬에 없고, `bun run pointer-gate`로 손으로 돈다 — 실행 시간(Storybook 빌드 + Playwright,
 * 약 7분)이 preflight 예산을 넘는다. 언제 돌리는가의 판정 기준은 #233이 규약으로 적는다.
 *
 * 사용:
 *   bun run pointer-gate                          # 빌드 + 실측 + 게이트, 기준선·기본 예외 경로
 *   node scripts/pointer-target-gate.mjs --skip-build --measured <tsv>   # 이미 실측한 TSV로 게이트만
 *   node scripts/pointer-target-gate.mjs --exceptions <path>            # 예외 목록 경로 지정 */
import { spawnSync } from "node:child_process"
import { mkdtempSync, readFileSync, existsSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"

export const FLOOR = 24
export const RESOLUTION_TOLERANCE = 1 // 계기의 해상도 — 렌더 실측 문서 §5②

export const POINTER_TARGET_EXCEPTIONS_DEFAULT = "docs/research/pointer-target-exceptions.json"
export const BASELINE_TSV_DEFAULT = "docs/research/pointer-targets-2026-09.tsv"

/* ---------- TSV: 머리글 기준으로 읽는다 — 계기가 버전을 올려 열이 늘어도 깨지지 않는다 ---------- */
export function parseTsv(text) {
  const lines = text.replace(/\r\n/g, "\n").split("\n").filter((l) => l.length > 0)
  if (lines.length === 0) return []
  const header = lines[0].split("\t")
  return lines.slice(1).map((line) => {
    const cells = line.split("\t")
    const row = {}
    header.forEach((key, i) => { row[key] = cells[i] ?? "-" })
    return row
  })
}

const num = (v) => (v === "-" || v === undefined || v === "" ? null : Number(v))
const bool = (v) => v === "true" || v === true

/* ---------- 예외 목록 ---------- */
// 형식: { "belowFloor": [{ component, slot, reason }], "unmeasuredSlots": [{ component, slot, reason }] }
// #231이 실제 파일을 만든다 — 여기 형식은 이 게이트가 기대하는 최소 계약이고, 없으면 빈 목록이다.
export function loadExceptions(exceptionsPath) {
  const empty = { belowFloor: new Map(), unmeasuredSlots: new Map() }
  if (!exceptionsPath || !existsSync(exceptionsPath)) return empty
  const json = JSON.parse(readFileSync(exceptionsPath, "utf8"))
  const toMap = (list) => new Map((list ?? []).map((e) => [`${e.component}\t${e.slot}`, e.reason ?? "(이유 없음)"]))
  return { belowFloor: toMap(json.belowFloor), unmeasuredSlots: toMap(json.unmeasuredSlots) }
}

const slotKey = (row) => `${row.story}\t${row.slot}`
const cellKey = (row) => `${row.story}\t${row.cell}\t${row.slot}`

/* 재지 않음으로 거르는 자리 — pointer-events:none·표시되지 않음·중심점을 못 찾음.
 * ADR-0020 결정 6의 인터페이스 (b): 정책표가 아니라 이 게이트가 직접 거른다. */
const UNMEASURED_NOTES = ["pointer-events:none", "not-rendered", "no-hit-point"]
export function isMeasuredRow(row) {
  const note = row.note ?? "-"
  if (note === "-") return true
  return !UNMEASURED_NOTES.some((n) => note.split(",").includes(n))
}

/* ---------- 하한 미달 ---------- */
export function evaluateBelowFloor({ currentRows, baselineRows, exceptions }) {
  const inScanMeasured = (rows) => rows.filter((r) => bool(r.inScan ?? "true") && isMeasuredRow(r))
  const belowFloorKeys = (rows) => new Set(inScanMeasured(rows).filter((r) => !bool(r.square24)).map(cellKey))

  const baselineBelow = belowFloorKeys(baselineRows)
  const currentBelow = inScanMeasured(currentRows).filter((r) => !bool(r.square24))

  const regressions = [], knownGaps = [], exempted = []
  for (const row of currentBelow) {
    const reason = exceptions.belowFloor.get(slotKey(row))
    if (reason !== undefined) { exempted.push({ ...row, reason }); continue }
    if (baselineBelow.has(cellKey(row))) knownGaps.push(row)
    else regressions.push(row)
  }
  return { regressions, knownGaps, exempted }
}

/* ---------- 미신고 겹침 ----------
 * ADR-0020 결정 5: "선언은 계약 필드가 아니라 계산"이다. 계산이 산다는 자리는 **커밋된
 * 기준선**이다 — 실측을 돌려 baseline TSV를 갱신하는 행위 자체가 선언이다. 그래서 이
 * 검사도 하한 미달과 같은 모양으로 기준선과 diff한다: 이번 세대의 오버리지(hit이 visual을
 * 넘는 폭)가 기준선에도 있었으면 이미 선언된 것이고, 없었으면 이번 세대가 조용히 늘린
 * 것이라 미신고다.
 *
 * `after:` 계산 스타일 하나만으로 판정하지 않는다 — 참조 스토리의 구성(같은 행에 놓인
 * 다른 대상·툴팁 등)이 `after:` 없이도 오버리지처럼 읽히는 자리가 있다(연구 문서 §4.3의
 * "계기가 가림을 읽는다"와 같은 종류의 잡음). 그 잡음은 기준선에도 똑같이 찍혀 있으므로
 * 기준선 대조가 실제 신규 오버리지와 스토리 잡음을 갈라 준다. */
const hasOverage = (row) => {
  const vw = num(row.visualW), vh = num(row.visualH), hw = num(row.hitW), hh = num(row.hitH)
  if (vw === null || hw === null) return false
  return hw - vw > RESOLUTION_TOLERANCE || hh - vh > RESOLUTION_TOLERANCE
}

export function evaluateOverlap({ currentRows, baselineRows }) {
  const inScanMeasured = (rows) => rows.filter((r) => bool(r.inScan ?? "true") && isMeasuredRow(r))
  const baselineOverage = new Set(inScanMeasured(baselineRows).filter(hasOverage).map(cellKey))
  const currentOverage = inScanMeasured(currentRows).filter(hasOverage)

  const unreported = [], declared = []
  for (const row of currentOverage) {
    const hasAfter = (row.after ?? "-") !== "-"
    if (baselineOverage.has(cellKey(row))) declared.push({ ...row, hasAfter })
    else unreported.push({ ...row, hasAfter })
  }
  return { unreported, declared }
}

/* ---------- 참조 스토리가 안 그리는 slot ----------
 * "재지 않음"(pointer-events:none 등, isMeasuredRow가 거르는 것)과 "안 그림"(어느 셀의 DOM에도
 * 없음)은 다르다. `switch-thumb`는 pointer-events:none이라 재지 않지만 DOM에는 있다 — Switch의
 * 대상은 Root라는 뜻이지 참조 스토리가 안 그린 것이 아니다(연구 문서 §3). 그래서 여기서는
 * isMeasuredRow로 거르지 않고 **행이 존재하는가**만 본다. */
export function evaluateUnmeasuredSlots({ scanSlots, currentRows, exceptions }) {
  const rendered = new Set(currentRows.map((r) => r.slot))
  const failing = [], exemptedList = []
  for (const { component, slot } of scanSlots) {
    if (slot === "-" || rendered.has(slot)) continue
    const key = `${component}\t${slot}`
    const reason = exceptions.unmeasuredSlots.get(key)
    if (reason !== undefined) exemptedList.push({ component, slot, reason })
    else failing.push({ component, slot })
  }
  return { failing, exempted: exemptedList }
}

/* ---------- 종합 ---------- */
export function evaluateGate({ currentRows, baselineRows, exceptions, scanSlots }) {
  const belowFloor = evaluateBelowFloor({ currentRows, baselineRows, exceptions })
  const overlap = evaluateOverlap({ currentRows, baselineRows })
  const unmeasured = evaluateUnmeasuredSlots({ scanSlots, currentRows, exceptions })
  const failing = belowFloor.regressions.length + belowFloor.knownGaps.length + overlap.unreported.length + unmeasured.failing.length
  return { belowFloor, overlap, unmeasured, ok: failing === 0, failingCount: failing }
}

export function formatReport(result) {
  const lines = []
  const { belowFloor, overlap, unmeasured } = result
  lines.push(`포인터 대상 게이트 — ${result.ok ? "PASS" : "FAIL"} (실패 ${result.failingCount}건 — 하한 미달 regression·known gap + 미신고 겹침 + 안 그리는 slot 합)`)
  lines.push("")
  lines.push(`하한 미달 — 기준선 대비 새 미달(regression): ${belowFloor.regressions.length}`)
  for (const r of belowFloor.regressions) lines.push(`  FAIL  ${r.story}\t${r.slot}\t${r.cell}\thit ${r.hitW}×${r.hitH}`)
  lines.push(`하한 미달 — 기준선에도 있던 미달(known gap, #230·#249 미완): ${belowFloor.knownGaps.length}`)
  for (const r of belowFloor.knownGaps) lines.push(`  FAIL  ${r.story}\t${r.slot}\t${r.cell}\thit ${r.hitW}×${r.hitH}`)
  lines.push(`하한 미달 — 예외 목록으로 면제: ${belowFloor.exempted.length}`)
  for (const r of belowFloor.exempted) lines.push(`  ok    ${r.story}\t${r.slot}\t${r.cell}\t(${r.reason})`)
  lines.push("")
  lines.push(`미신고 겹침(기준선에 없던 오버리지): ${overlap.unreported.length}`)
  for (const r of overlap.unreported) lines.push(`  FAIL  ${r.story}\t${r.slot}\t${r.cell}\tvisual ${r.visualW}×${r.visualH} hit ${r.hitW}×${r.hitH}\tafter ${r.hasAfter ? "있음" : "없음"}`)
  lines.push(`선언된 겹침(기준선에도 있던 오버리지, 정보용): ${overlap.declared.length}`)
  lines.push("")
  lines.push(`참조 스토리가 안 그리는 scan slot: ${unmeasured.failing.length}`)
  for (const r of unmeasured.failing) lines.push(`  FAIL  ${r.component}\t${r.slot}`)
  lines.push(`참조 스토리가 안 그리는 scan slot — 예외 목록으로 면제: ${unmeasured.exempted.length}`)
  for (const r of unmeasured.exempted) lines.push(`  ok    ${r.component}\t${r.slot}\t(${r.reason})`)
  return lines.join("\n")
}

/* ---------- CLI ---------- */
async function runCli(argv) {
  const flag = (name) => { const i = argv.indexOf(name); return i >= 0 ? argv[i + 1] : undefined }
  const root = path.resolve(fileURLToPath(new URL(".", import.meta.url)), "..")
  const skipBuild = argv.includes("--skip-build")
  const baselinePath = path.resolve(root, flag("--baseline") ?? BASELINE_TSV_DEFAULT)
  const exceptionsPath = path.resolve(root, flag("--exceptions") ?? POINTER_TARGET_EXCEPTIONS_DEFAULT)
  let measuredPath = flag("--measured")

  if (!measuredPath) {
    const workDir = mkdtempSync(path.join(tmpdir(), "pointer-target-gate-"))
    if (!skipBuild) {
      const build = spawnSync("bun", ["run", "--filter", "@massive/storybook", "build-storybook"], { cwd: root, stdio: "inherit" })
      if (build.status !== 0) { console.error("Storybook 빌드 실패 — 게이트를 돌릴 수 없다"); process.exit(1) }
    }
    const measure = spawnSync("node", [path.join(root, "apps/storybook/scripts/pointer-targets.mjs"), "--out", workDir], { cwd: root, stdio: "inherit" })
    if (measure.status !== 0) { console.error("실측이 실패했다(self-test 포함) — 게이트를 돌릴 수 없다"); process.exit(1) }
    measuredPath = path.join(workDir, "pointer-targets.tsv")
  }

  const currentRows = parseTsv(readFileSync(measuredPath, "utf8"))
  const baselineRows = existsSync(baselinePath) ? parseTsv(readFileSync(baselinePath, "utf8")) : []
  const exceptions = loadExceptions(exceptionsPath)

  const { scanAll } = await import(path.join(root, "packages/ui/scripts/pointer-targets/scan.mjs"))
  const scanSlots = scanAll().filter((r) => r.slot !== "-").map((r) => ({ component: r.component, slot: r.slot }))

  const result = evaluateGate({ currentRows, baselineRows, exceptions, scanSlots })
  console.log(formatReport(result))
  process.exitCode = result.ok ? 0 : 1
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
  await runCli(process.argv.slice(2))
}
