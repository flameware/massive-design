/* 포인터 대상 히트 영역 실측 (#228, ADR-0020 결정 7의 둘째 단계 — #232 실측 게이트의 씨앗).
 *
 * 무엇을 재는가. 정적 Storybook을 띄워 참조 스토리의 **모든 셀**(축 × 구성 상태의 곱)을
 * 렌더하고, 코드 스캔(packages/ui/scripts/pointer-targets/scan.mjs)이 낸 slot 을 DOM에서
 * 찾아 **실효 히트 영역**을 잰다. 치수는 클래스 이름이 아니라 `document.elementFromPoint`
 * 로 얻는다 — 그 점을 누르면 이 노드(또는 자손)가 받는가를 1px 걸음으로 묻고, 받는 점의
 * 연속 구간이 곧 히트 영역이다. 그래서 다음 셋이 한 계기로 잡힌다.
 *
 * 좌표는 **정수 픽셀**로 묻는다. Chromium 은 elementFromPoint 의 소수 좌표를 가장 가까운
 * 정수로 반올림하므로(self-test 가 처음 잡은 +1 오차의 원인) 0.5 걸음은 같은 픽셀을 두 번
 * 세고, 반 픽셀에 앉은 상자는 스냅된 픽셀 수(±1)로 읽힌다 — 그것이 이 계기의 해상도다.
 *
 *   · `after:` 의사 요소가 넓힌 영역   — 의사 요소의 점은 originating element 로 해석된다
 *   · `overflow-hidden` 조상이 자른 영역 — 잘린 점은 조상이나 그 뒤가 받는다
 *   · 이웃·오버레이에 가려진 영역        — 가린 요소가 받는다
 *
 * 열(TSV):
 *   story cell slot tag role  visualW visualH  hitW hitH  square24  clipAncestor clipRoom  after  note
 *   visual*   getBoundingClientRect (그려지는 상자)
 *   hit*      중심을 지나는 가로·세로선에서 이 노드가 받는 연속 구간의 길이 (실효 히트 영역)
 *   square24  중심에 놓은 24×24 정사각형의 네 귀와 중심이 모두 이 노드에 떨어지는가
 *   clipAncestor  overflow 가 visible 이 아닌 가장 가까운 조상의 slot(또는 태그)
 *   clipRoom  그 조상의 padding box 까지 네 방향 여유의 최솟값(px) — 24까지 대칭 확장에 필요한
 *             폭이 이 값을 넘으면 확장이 잘린다
 *   after     ::after 가 absolute 로 서 있는가 (resizable 식 히트 영역 기제)
 *
 * 사용:
 *   bun run --filter @massive/storybook build-storybook
 *   node scripts/pointer-targets.mjs [--out DIR] [--only slug,slug] [--settle ms]
 *   node scripts/pointer-targets.mjs --self-test      # 계기 자체를 알려진 기하로 검증
 *
 * a11y.mjs 와 같은 정적 서버·Playwright 경로를 쓴다. 게이트가 아니다 — 판정은 사람이 한다. */
import { createServer } from "node:http"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { chromium } from "playwright"
import { scanAll } from "../../../packages/ui/scripts/pointer-targets/scan.mjs"

const root = path.resolve(import.meta.dirname, "..")
const repo = path.resolve(root, "../..")
const output = path.join(root, "storybook-static")
const argv = process.argv.slice(2)
const flag = (name) => { const i = argv.indexOf(name); return i >= 0 ? argv[i + 1] : undefined }
const outDir = flag("--out") ?? output
const only = flag("--only")?.split(",")
const settle = Number(flag("--settle") ?? 400) // 렌더 뒤 기다리는 ms — Sidebar 의 width 전환(200ms)이 끝나야 값이 앉는다
const FLOOR = 24
const REACH = 48 // 시각 상자 밖으로 이만큼까지만 더듬는다 — 그 밖은 "이 노드가 아니다"로 본다

/* ---------- 브라우저 안에서 도는 계기 ---------- */
export function measureInPage({ slots, floor, reach }) {
  const isEl = (n) => n && n.nodeType === 1
  const slotOf = (el) => el.getAttribute("data-slot")
  const label = (el) => slotOf(el) ?? el.tagName.toLowerCase()
  const NATIVE = "button, a[href], input, select, textarea, label, summary, [role=button], [role=link], [role=checkbox], [role=radio], [role=switch], [role=tab], [role=menuitem], [role=menuitemcheckbox], [role=menuitemradio], [role=option], [role=slider], [role=scrollbar], [role=combobox], [role=spinbutton], [tabindex]"

  const wanted = new Set(slots)
  const candidates = new Set()
  for (const el of document.querySelectorAll("[data-slot]")) if (wanted.has(slotOf(el))) candidates.add(el)
  for (const el of document.querySelectorAll(NATIVE)) candidates.add(el)

  const hit = (el, x, y) => { const t = document.elementFromPoint(x, y); return isEl(t) && (t === el || el.contains(t)) }
  const span = (el, ax, ay, dx, dy, from, limit) => {
    let n = 0
    for (let k = 1; k <= limit; k++) { if (hit(el, ax + dx * k, ay + dy * k)) n = k; else break }
    return n
  }
  const rows = []
  for (const el of candidates) {
    const cs = getComputedStyle(el)
    const rect = el.getBoundingClientRect()
    const row = {
      slot: slotOf(el) ?? "-", tag: el.tagName.toLowerCase(), role: el.getAttribute("role") ?? "-",
      inScan: wanted.has(slotOf(el)), nativeInteractive: el.matches(NATIVE),
      visualW: +rect.width.toFixed(1), visualH: +rect.height.toFixed(1),
      hitW: null, hitH: null, square24: null, clipAncestor: "-", clipRoom: null, after: "-", note: [],
      chain: [],
    }
    for (let p = el.parentElement; p; p = p.parentElement) if (slotOf(p)) row.chain.push(slotOf(p))
    if (cs.display === "none" || cs.visibility === "hidden" || rect.width === 0 && rect.height === 0) { row.note.push("not-rendered"); rows.push(row); continue }
    if (cs.pointerEvents === "none") row.note.push("pointer-events:none")
    const after = getComputedStyle(el, "::after")
    row.after = after.content !== "none" && after.content !== "normal" && after.position === "absolute" ? `${after.width}×${after.height}` : "-"

    // 화면 안으로 가져온다 — elementFromPoint 는 뷰포트 좌표만 받는다
    el.scrollIntoView({ block: "center", inline: "center" })
    const r = el.getBoundingClientRect()
    const cx = Math.floor(r.left + r.width / 2), cy = Math.floor(r.top + r.height / 2)
    let ax = cx, ay = cy
    if (!hit(el, cx, cy)) {
      // 중심을 자식이 아닌 다른 노드가 받는다(오버레이·겹침·0폭 상자). 상자 안팎 reach 까지 2px 격자로 받는 점을 찾는다
      let found = null
      outer: for (let y = Math.floor(r.top) - reach; y <= r.bottom + reach; y += 2)
        for (let x = Math.floor(r.left) - reach; x <= r.right + reach; x += 2) if (hit(el, x, y)) { found = [x, y]; break outer }
      if (!found) { row.note.push("no-hit-point"); row.hitW = 0; row.hitH = 0; row.square24 = false; rows.push(row); continue }
      row.note.push("center-miss"); [ax, ay] = found
    }
    const limitX = Math.ceil(r.width / 2) + reach, limitY = Math.ceil(r.height / 2) + reach
    const left = span(el, ax, ay, -1, 0, ax, limitX), right = span(el, ax, ay, 1, 0, ax, limitX)
    const up = span(el, ax, ay, 0, -1, ay, limitY), down = span(el, ax, ay, 0, 1, ay, limitY)
    row.hitW = left + right + 1
    row.hitH = up + down + 1
    /* floor×floor 정사각형이 히트 영역 안에 **어디든** 들어가는가 — WCAG 2.5.8 의 물음 그대로다.
     * 히트 영역은 직사각형이 아닐 수 있다(손잡이 자식이 중심선만 두껍게 만들거나 모서리가 둥글다).
     * 먼저 히트 구간의 중심에 놓아 보고(대부분 여기서 끝난다), 안 되면 상자 ± reach 를 4px 걸음으로
     * 훑는다. 한 정사각형은 네 귀·네 변 중점·중심 아홉 점으로 판정한다. */
    const h = (floor - 1) / 2
    const squareAt = (x, y) => [[0, 0], [-h, -h], [h, -h], [-h, h], [h, h], [0, -h], [0, h], [-h, 0], [h, 0]].every(([dx, dy]) => hit(el, Math.round(x + dx), Math.round(y + dy)))
    const hx = (ax - left + ax + right) / 2, hy = (ay - up + ay + down) / 2
    row.square24 = squareAt(hx, hy)
    if (!row.square24) { // 중심선이 둘 다 미달이어도 다른 자리에 들어갈 수 있다(L 꼴) — 거르지 않고 훑는다

      search: for (let y = Math.floor(r.top) - reach + h; y <= r.bottom + reach - h; y += 4)
        for (let x = Math.floor(r.left) - reach + h; x <= r.right + reach - h; x += 4) if (squareAt(x, y)) { row.square24 = true; row.note.push("square24-off-center"); break search }
    }
    if (right === limitX || left === limitX || up === limitY || down === limitY) row.note.push("reach-limit")

    // overflow 조상 — 확장에 남은 여유
    for (let p = el.parentElement; p && p !== document.documentElement; p = p.parentElement) {
      const pcs = getComputedStyle(p)
      const clips = (v) => v !== "visible"
      if (clips(pcs.overflowX) || clips(pcs.overflowY)) {
        const pr = p.getBoundingClientRect()
        const padBox = {
          left: pr.left + parseFloat(pcs.borderLeftWidth), right: pr.right - parseFloat(pcs.borderRightWidth),
          top: pr.top + parseFloat(pcs.borderTopWidth), bottom: pr.bottom - parseFloat(pcs.borderBottomWidth),
        }
        const rooms = []
        if (clips(pcs.overflowX)) rooms.push(r.left - padBox.left, padBox.right - r.right)
        if (clips(pcs.overflowY)) rooms.push(r.top - padBox.top, padBox.bottom - r.bottom)
        row.clipAncestor = `${label(p)}[${[clips(pcs.overflowX) ? "x" : "", clips(pcs.overflowY) ? "y" : ""].join("")}]`
        row.clipRoom = +Math.min(...rooms).toFixed(1)
        break
      }
    }
    rows.push(row)
  }
  return rows
}

/* ---------- 정적 서버 (a11y.mjs 와 같다) ---------- */
const contentTypes = { ".css": "text/css", ".html": "text/html", ".js": "text/javascript", ".json": "application/json", ".svg": "image/svg+xml", ".woff2": "font/woff2" }
function serve(dir) {
  const server = createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname)
      const requested = pathname === "/" ? "index.html" : pathname.slice(1)
      const absolute = path.resolve(dir, requested)
      if (!absolute.startsWith(`${dir}${path.sep}`)) throw new Error("outside")
      const body = await readFile(absolute)
      response.writeHead(200, { "content-type": contentTypes[path.extname(absolute)] ?? "application/octet-stream" }).end(body)
    } catch { response.writeHead(404).end("Not found") }
  })
  return new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve({ server, port: server.address().port })))
}

/* ---------- 셀 곱 ---------- */
function cellsOf(manifest) {
  const controls = { ...(manifest.axes ?? {}), ...(manifest.configurationStates ?? {}) }
  const keys = Object.keys(controls)
  let combos = [{}]
  for (const key of keys) combos = combos.flatMap((c) => controls[key].map((v) => ({ ...c, [key]: v })))
  return combos
}
const argsParam = (cell) => Object.entries(cell).map(([k, v]) => `${k}:${v}`).join(";")

/* ---------- 계기 자체 검증 ---------- */
const SELF_TEST_HTML = `<!doctype html><meta charset="utf-8"><style>
  body{margin:0;padding:100px;font:14px sans-serif}
  .row{display:flex;flex-wrap:wrap;gap:60px;align-items:flex-start;margin-bottom:60px}
  .row>*{flex:none}
  #plain{width:16px;height:16px;background:#888}
  #after{position:relative;width:16px;height:16px;background:#888}
  #after::after{content:"";position:absolute;left:50%;top:50%;width:32px;height:32px;transform:translate(-50%,-50%)}
  #clipbox{width:20px;height:20px;overflow:hidden;padding:0;border:1px solid #000}
  #clipped{position:relative;width:16px;height:16px;margin:2px;background:#888}
  #clipped::after{content:"";position:absolute;left:50%;top:50%;width:32px;height:32px;transform:translate(-50%,-50%)}
  #zero{width:0;height:40px;position:relative;border-left:1px solid #000}
  #zero::after{content:"";position:absolute;left:50%;top:0;bottom:0;width:4px;transform:translateX(-50%)}
  #stack{position:relative;width:40px;height:40px}
  #under{position:absolute;inset:0;background:#888}
  #over{position:absolute;left:0;top:0;width:40px;height:20px;background:#f00}
  #wide{width:60px;height:12px;background:#888}
  #grip{position:relative;width:200px;height:0;border-top:1px solid #000}
  #grip::after{content:"";position:absolute;left:0;right:0;top:50%;height:4px;transform:translateY(-50%)}
  #grip>i{position:absolute;left:50%;top:50%;width:16px;height:12px;transform:translate(-50%,-50%);background:#444}
  #lshape{position:relative;width:20px;height:20px;background:#888}
  #lshape::after{content:"";position:absolute;left:10px;top:10px;width:30px;height:30px}
  #hidden{display:none}
</style>
<div class="row">
  <button id="plain" data-slot="t-plain"></button>
  <button id="after" data-slot="t-after"></button>
  <div id="clipbox" data-slot="t-clipbox"><button id="clipped" data-slot="t-clipped"></button></div>
  <div id="zero" data-slot="t-zero"></div>
  <div id="stack"><div id="under" data-slot="t-under"></div><div id="over"></div></div>
  <button id="wide" data-slot="t-wide"></button>
  <div id="grip" data-slot="t-grip"><i></i></div>
  <button id="lshape" data-slot="t-lshape"></button>
  <button id="hidden" data-slot="t-hidden"></button>
</div>`

/* 기대값 — 계기가 이것을 그대로 읽지 못하면 계기를 고친다, 읽은 값을 믿지 않는다 */
const SELF_TEST_EXPECT = {
  "t-plain":   { hitW: 16, hitH: 16, square24: false, note: "16px 상자 — 미달을 미달로 읽는가" },
  "t-after":   { hitW: 32, hitH: 32, square24: true,  note: "16px 상자 + 32px ::after — 의사 요소가 넓힌 영역을 읽는가" },
  "t-clipped": { hitW: 20, hitH: 20, square24: false, clipAncestor: "t-clipbox[xy]", note: "같은 ::after 가 overflow-hidden 20px 상자에 잘리는가" },
  "t-zero":    { hitW: 4,  hitH: 40, square24: false, note: "0폭 상자 + 4px ::after (resizable 식) — 중심이 빗나가도 찾는가" },
  "t-under":   { hitW: 40, hitH: 20, square24: false, note: "위를 20px 덮은 형제 — 가려진 절반을 빼고 읽는가 (자손은 가림이 아니다)" },
  "t-wide":    { hitW: 60, hitH: 12, square24: false, note: "60×12 — 한 축만 미달을 미달로 읽는가" },
  "t-grip":    { hitW: 200, hitH: 12, square24: false, after: "200px×4px", note: "0높이 선 + 4px ::after + 가운데 16×12 손잡이 자식 — 중심선은 손잡이(12)를 읽고 after 열이 4px 띠를 따로 적는가" },
  "t-lshape":  { hitW: 20, hitH: 20, square24: true, noteHas: "square24-off-center", note: "20px 상자 + 오른쪽 아래로 뻗은 30×30 ::after — 중심을 벗어난 자리에 24 정사각형이 들어가는 것을 찾는가" },
  "t-hidden":  { hitW: null, hitH: null, square24: null, noteHas: "not-rendered", note: "display:none — 재지 않고 표시하는가" },
}

async function selfTest(browser) {
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } })
  await page.setContent(SELF_TEST_HTML)
  const rows = await page.evaluate(measureInPage, { slots: Object.keys(SELF_TEST_EXPECT), floor: FLOOR, reach: REACH })
  let failed = 0
  for (const [slot, expect] of Object.entries(SELF_TEST_EXPECT)) {
    const row = rows.find((r) => r.slot === slot)
    const problems = []
    if (!row) problems.push("행이 없다")
    else {
      for (const key of ["hitW", "hitH", "square24", "clipAncestor", "after"]) if (key in expect && row[key] !== expect[key]) problems.push(`${key}: 기대 ${expect[key]} 실측 ${row[key]}`)
      if (expect.noteHas && !row.note.includes(expect.noteHas)) problems.push(`note 에 ${expect.noteHas} 없음 (${row.note.join(",")})`)
    }
    console.log(`${problems.length ? "FAIL" : "ok  "}  ${slot.padEnd(10)} ${expect.note}${problems.length ? `\n      ${problems.join("; ")}\n      ${JSON.stringify(row)}` : ""}`)
    if (problems.length) failed++
  }
  await page.close()
  return failed
}

/* ---------- 본 실행 ---------- */
async function run(browser) {
  const index = JSON.parse(await readFile(path.join(output, "index.json"), "utf8"))
  const stories = Object.values(index.entries).filter((e) => e.type === "story" && e.id.startsWith("components-manifest-references--"))
  const manifestIndex = JSON.parse(await readFile(path.join(repo, "packages/ui/dist/manifest/index.gen.json"), "utf8"))
  const manifests = new Map()
  for (const entry of manifestIndex.components) {
    const m = JSON.parse(await readFile(path.join(repo, "packages/ui/dist/manifest", entry.path), "utf8"))
    manifests.set(m.component, m)
  }
  const scan = scanAll()
  const slots = [...new Set(scan.map((r) => r.slot).filter((s) => s !== "-"))]
  const slotOwner = new Map(scan.filter((r) => r.slot !== "-").map((r) => [r.slot, r.component]))

  const { server, port } = await serve(output)
  const page = await browser.newPage({ viewport: { width: 1400, height: 1800 } })
  const rows = []
  let cellsRun = 0
  try {
    for (const story of stories) {
      const slug = story.id.replace("components-manifest-references--", "")
      const manifest = [...manifests.values()].find((m) => m.component.replace(/-/g, "") === slug.replace(/-/g, ""))
      if (!manifest) { console.error(`manifest 없음: ${story.id}`); continue }
      if (only && !only.includes(manifest.component)) continue
      for (const cell of cellsOf(manifest)) {
        const url = `http://127.0.0.1:${port}/iframe.html?id=${encodeURIComponent(story.id)}&viewMode=story&args=${encodeURIComponent(argsParam(cell))}`
        await page.goto(url, { waitUntil: "networkidle" })
        await page.waitForTimeout(settle) // Radix 의 presence/positioning 과 CSS 전환이 끝난 뒤에 잰다
        const measured = await page.evaluate(measureInPage, { slots, floor: FLOOR, reach: REACH })
        cellsRun++
        for (const r of measured) rows.push({ story: manifest.component, cell: argsParam(cell) || "-", owner: slotOwner.get(r.slot) ?? "-", ...r })
      }
      process.stderr.write(`${manifest.component} `)
    }
  } finally {
    await page.close()
    server.close()
  }
  process.stderr.write("\n")

  await mkdir(outDir, { recursive: true })
  const header = ["story", "cell", "owner", "slot", "tag", "role", "inScan", "nativeInteractive", "visualW", "visualH", "hitW", "hitH", "square24", "clipAncestor", "clipRoom", "after", "note", "chain"]
  const tsv = [header.join("\t"), ...rows.map((r) => header.map((k) => Array.isArray(r[k]) ? r[k].join(",") || "-" : r[k] ?? "-").join("\t"))].join("\n")
  await writeFile(path.join(outDir, "pointer-targets.tsv"), `${tsv}\n`)
  await writeFile(path.join(outDir, "pointer-targets.json"), `${JSON.stringify({ cellsRun, stories: stories.length, floor: FLOOR, scan, rows }, null, 2)}\n`)

  /* 요약 — 판정이 아니라 셈이다 */
  const rendered = rows.filter((r) => r.hitW !== null)
  const seenSlots = new Set(rendered.map((r) => r.slot))
  const scanUnseen = slots.filter((s) => !seenSlots.has(s))
  const domOnly = [...new Set(rendered.filter((r) => !r.inScan && r.nativeInteractive && r.slot !== "-").map((r) => r.slot))]
  const below = rendered.filter((r) => r.inScan && (r.hitW < FLOOR || r.hitH < FLOOR))
  const key = (r) => `${r.story}\t${r.slot}\t${r.hitW}×${r.hitH}`
  const belowUnique = [...new Map(below.map((r) => [key(r), r])).values()]
  console.log(`cells: ${cellsRun} / rows: ${rows.length} / rendered: ${rendered.length}`)
  console.log(`scan slots: ${slots.length}, never rendered in any cell: ${scanUnseen.length}${scanUnseen.length ? ` — ${scanUnseen.join(", ")}` : ""}`)
  console.log(`DOM-interactive slots the scan did not list: ${domOnly.length}${domOnly.length ? ` — ${domOnly.join(", ")}` : ""}`)
  console.log(`below ${FLOOR}px (scan slots, unique story/slot/size): ${belowUnique.length}`)
  for (const r of belowUnique.sort((a, b) => a.story.localeCompare(b.story) || a.slot.localeCompare(b.slot))) console.log(`  ${r.story}\t${r.slot}\t${r.hitW}×${r.hitH}\tvisual ${r.visualW}×${r.visualH}\tclip ${r.clipAncestor} room ${r.clipRoom}\t${r.note.join(",") || ""}`)
  console.log(`written: ${path.join(outDir, "pointer-targets.tsv")}`)
}

const browser = await chromium.launch({ headless: true })
try {
  if (argv.includes("--self-test")) {
    const failed = await selfTest(browser)
    console.log(failed ? `self-test: ${failed} FAILED` : "self-test: all ok")
    process.exitCode = failed ? 1 : 0
  } else {
    if (!argv.includes("--skip-self-test")) {
      const failed = await selfTest(browser)
      if (failed) { console.error(`self-test failed (${failed}) — 계기를 믿을 수 없어 실측하지 않는다`); process.exit(1) }
    }
    await run(browser)
  }
} finally {
  await browser.close()
}
