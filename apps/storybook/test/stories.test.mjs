/* 주 seam — 모든 스토리를 Playwright로 열어 셋을 잰다 (#279, ADR-0023 §12·스토리 22).
 *
 *   1. axe 접근성 위반 0
 *   2. 모든 포인터 대상의 히트 영역 ≥ 24×24 (WCAG 2.5.8 AA, ADR-0020)
 *   3. 스토리가 선언한 키보드 계약
 *
 * 1세대는 이것이 세 도구였다 — `scripts/a11y.mjs`, `pointer-targets.mjs`(계기)와
 * 루트 `pointer-target-gate.mjs`(매니페스트의 축을 곱해 셀을 만들고 커밋된
 * 기준선과 대조하는 게이트). 2세대는 **스토리가 모집단이다**: 축의 곱을 계산할
 * 매니페스트가 없고, 대신 스토리가 보여 주기로 한 것이 곧 재는 대상이다. 기준선
 * TSV도 예외 목록도 없다 — 하한은 하한이고, 미달은 커밋되기 전에 고친다.
 *
 * 히트 영역을 재는 계기는 1세대에서 형태를 그대로 가져왔다. 치수는 클래스 이름이
 * 아니라 `document.elementFromPoint`로 얻는다 — 그 점을 누르면 이 노드가 받는가를
 * 1px 걸음으로 묻는다. 그래서 `after:` 유사요소가 넓힌 영역, `overflow-hidden`이
 * 자른 영역, 이웃이 가린 영역이 한 계기에 잡힌다.
 *
 * 계기를 먼저 검증한다(rules.md 방법론 — 읽은 값을 믿기 전에 계기를 믿을 수
 * 있어야 한다). 알려진 기하 다섯을 렌더해 계기가 그것을 그대로 읽지 못하면,
 * 스토리를 하나도 재기 전에 실패한다. */
import assert from "node:assert/strict"
import { createServer } from "node:http"
import { readFile } from "node:fs/promises"
import path from "node:path"
import { after, before, describe, test } from "node:test"
import axe from "axe-core"
import { chromium } from "playwright"

const root = path.resolve(import.meta.dirname, "..")
const output = path.join(root, "storybook-static")

const FLOOR = 24 // WCAG 2.5.8 (AA), CSS px
const REACH = 48 // 시각 상자 밖으로 이만큼까지만 더듬는다 — 그 밖은 "이 노드가 아니다"

/* ---------- 정적 서버 ---------- */
const CONTENT_TYPES = {
  ".css": "text/css",
  ".html": "text/html",
  ".js": "text/javascript",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
}

function serve(dir) {
  const server = createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname)
      const requested = pathname === "/" ? "index.html" : pathname.slice(1)
      const absolute = path.resolve(dir, requested)
      if (!absolute.startsWith(`${dir}${path.sep}`)) throw new Error("outside Storybook output")
      const body = await readFile(absolute)
      response
        .writeHead(200, {
          "content-type": CONTENT_TYPES[path.extname(absolute)] ?? "application/octet-stream",
        })
        .end(body)
    } catch {
      response.writeHead(404).end("Not found")
    }
  })
  return new Promise((resolve) =>
    server.listen(0, "127.0.0.1", () => resolve({ server, port: server.address().port }))
  )
}

/* ---------- 브라우저 안에서 도는 계기 ---------- */
/* 1세대 apps/storybook/scripts/pointer-targets.mjs의 measureInPage에서 매니페스트
 * slot 의존만 걷어냈다. 모집단은 "상호작용하는 것으로 읽히는 노드" 하나다. */
export function measureInPage({ floor, reach }) {
  const NATIVE =
    "button, a[href], input:not([type=hidden]), select, textarea, summary, [role=button], [role=link], [role=checkbox], [role=radio], [role=switch], [role=tab], [role=menuitem], [role=menuitemcheckbox], [role=menuitemradio], [role=option], [role=slider], [role=spinbutton], [role=combobox]"

  const isEl = (n) => n && n.nodeType === 1
  const hit = (el, x, y) => {
    const target = document.elementFromPoint(x, y)
    return isEl(target) && (target === el || el.contains(target))
  }
  /* 한 방향으로 1px씩 걸으며 이 노드가 계속 받는 구간의 길이. 좌표는 **정수**로
   * 묻는다 — Chromium은 소수 좌표를 반올림하므로 0.5 걸음은 같은 픽셀을 두 번 센다 */
  const span = (el, ax, ay, dx, dy, limit) => {
    let n = 0
    for (let k = 1; k <= limit; k++) {
      if (hit(el, ax + dx * k, ay + dy * k)) n = k
      else break
    }
    return n
  }

  const rows = []
  for (const el of document.querySelectorAll(NATIVE)) {
    const cs = getComputedStyle(el)
    const rect = el.getBoundingClientRect()
    const row = {
      label:
        el.getAttribute("data-testid") ??
        el.getAttribute("aria-label") ??
        `${el.tagName.toLowerCase()}:${(el.textContent ?? "").trim().slice(0, 20)}`,
      tag: el.tagName.toLowerCase(),
      visualW: +rect.width.toFixed(1),
      visualH: +rect.height.toFixed(1),
      hitW: null,
      hitH: null,
      fitsFloor: null,
      note: [],
    }
    if (cs.display === "none" || cs.visibility === "hidden" || (rect.width === 0 && rect.height === 0)) {
      row.note.push("not-rendered")
      rows.push(row)
      continue
    }
    if (el.getAttribute("aria-hidden") === "true") {
      // 접근성 트리 밖이면 포인터 대상도 아니다 — 예: Base UI Checkbox·Select가
      // 네이티브 폼 의미론을 위해 곁에 두는, 시각적으로는 clip-path로 1px까지
      // 줄인 숨은 `<input>`(type이 checkbox/text라 `input:not([type=hidden])`에
      // 걸린다). 사람이 누르는 자리는 그 옆의 실제 커스텀 컨트롤이고, 그쪽이
      // 이미 자기 몫의 hit-area로 재진다 — 이 구현 디테일까지 재면 있지도 않은
      // 미달을 만든다(#288, Checkbox가 이 셋을 처음 population에 들였다)
      row.note.push("aria-hidden")
      rows.push(row)
      continue
    }
    if (cs.pointerEvents === "none") {
      // 누를 수 없는 것은 포인터 대상이 아니다 — 재지 않고 표시한다
      row.note.push("pointer-events:none")
      rows.push(row)
      continue
    }

    el.scrollIntoView({ block: "center", inline: "center" })
    const r = el.getBoundingClientRect()
    const cx = Math.floor(r.left + r.width / 2)
    const cy = Math.floor(r.top + r.height / 2)
    let ax = cx
    let ay = cy
    if (!hit(el, cx, cy)) {
      // 중심을 다른 노드가 받는다(겹침·0폭 상자). 상자 안팎 reach까지 2px 격자로 훑는다
      let found = null
      outer: for (let y = Math.floor(r.top) - reach; y <= r.bottom + reach; y += 2)
        for (let x = Math.floor(r.left) - reach; x <= r.right + reach; x += 2)
          if (hit(el, x, y)) {
            found = [x, y]
            break outer
          }
      if (!found) {
        row.note.push("no-hit-point")
        row.hitW = 0
        row.hitH = 0
        row.fitsFloor = false
        rows.push(row)
        continue
      }
      row.note.push("center-miss")
      ;[ax, ay] = found
    }

    const limitX = Math.ceil(r.width / 2) + reach
    const limitY = Math.ceil(r.height / 2) + reach
    const left = span(el, ax, ay, -1, 0, limitX)
    const right = span(el, ax, ay, 1, 0, limitX)
    const up = span(el, ax, ay, 0, -1, limitY)
    const down = span(el, ax, ay, 0, 1, limitY)
    row.hitW = left + right + 1
    row.hitH = up + down + 1

    /* floor×floor 정사각형이 히트 영역 안에 **어디든** 들어가는가 — WCAG 2.5.8의
     * 물음 그대로다. 히트 영역은 직사각형이 아닐 수 있어서(모서리가 둥글거나
     * 자식이 중심선만 두껍게 만든다) 중심에 놓아 보고, 안 되면 훑는다. */
    const h = (floor - 1) / 2
    const squareAt = (x, y) =>
      [[0, 0], [-h, -h], [h, -h], [-h, h], [h, h], [0, -h], [0, h], [-h, 0], [h, 0]].every(
        ([dx, dy]) => hit(el, Math.round(x + dx), Math.round(y + dy))
      )
    const hx = (ax - left + ax + right) / 2
    const hy = (ay - up + ay + down) / 2
    row.fitsFloor = squareAt(hx, hy)
    if (!row.fitsFloor) {
      search: for (let y = Math.floor(r.top) - reach + h; y <= r.bottom + reach - h; y += 4)
        for (let x = Math.floor(r.left) - reach + h; x <= r.right + reach - h; x += 4)
          if (squareAt(x, y)) {
            row.fitsFloor = true
            row.note.push("square-off-center")
            break search
          }
    }
    rows.push(row)
  }
  return rows
}

/* 재지 않는 행 — 그려지지 않았거나 누를 수 없거나 접근성 트리 밖이면 포인터
 * 대상이 아니다 */
const isMeasured = (row) =>
  !row.note.includes("not-rendered") &&
  !row.note.includes("pointer-events:none") &&
  !row.note.includes("aria-hidden")

/* ---------- 계기 자체 검증 ---------- */
const SELF_TEST_HTML = `<!doctype html><meta charset="utf-8"><style>
  body{margin:0;padding:100px;font:14px sans-serif}
  .row{display:flex;flex-wrap:wrap;gap:60px;align-items:flex-start}
  .row>*{flex:none}
  #plain{width:16px;height:16px;background:#888}
  #after{position:relative;width:16px;height:16px;background:#888}
  #after::after{content:"";position:absolute;left:50%;top:50%;width:32px;height:32px;transform:translate(-50%,-50%)}
  #clipbox{width:20px;height:20px;overflow:hidden;border:1px solid #000}
  #clipped{position:relative;width:16px;height:16px;margin:2px;background:#888}
  #clipped::after{content:"";position:absolute;left:50%;top:50%;width:32px;height:32px;transform:translate(-50%,-50%)}
  #lshape{position:relative;width:20px;height:20px;background:#888}
  #lshape::after{content:"";position:absolute;left:10px;top:10px;width:30px;height:30px}
  #hidden{display:none}
  #ariahidden{position:absolute;width:1px;height:1px;clip-path:inset(50%);overflow:hidden}
</style>
<div class="row">
  <button id="plain" data-testid="plain"></button>
  <button id="after" data-testid="after"></button>
  <div id="clipbox"><button id="clipped" data-testid="clipped"></button></div>
  <button id="lshape" data-testid="lshape"></button>
  <button id="hidden" data-testid="hidden"></button>
  <input id="ariahidden" data-testid="ariahidden" aria-hidden="true" />
</div>`

/* 기대값 — 계기가 이것을 그대로 읽지 못하면 계기를 고친다, 읽은 값을 믿지 않는다 */
const SELF_TEST_EXPECT = {
  plain: { hitW: 16, hitH: 16, fitsFloor: false, why: "16px 상자 — 미달을 미달로 읽는가" },
  after: { hitW: 32, hitH: 32, fitsFloor: true, why: "16px 상자 + 32px ::after — 의사 요소가 넓힌 영역을 읽는가" },
  clipped: { hitW: 20, hitH: 20, fitsFloor: false, why: "같은 ::after가 overflow-hidden 20px 상자에 잘리는가" },
  lshape: { fitsFloor: true, note: "square-off-center", why: "오른쪽 아래로 뻗은 ::after — 중심을 벗어난 정사각형을 찾는가" },
  hidden: { note: "not-rendered", why: "display:none — 재지 않고 표시하는가" },
  ariahidden: {
    note: "aria-hidden",
    why: "clip-path로 1px까지 줄인 aria-hidden 네이티브 입력 — Base UI Checkbox·Select가 폼 의미론을 위해 곁에 두는 것과 같은 모양(#288). 재지 않고 표시하는가",
  },
}

/* ---------- 실행 ---------- */
const index = JSON.parse(await readFile(path.join(output, "index.json"), "utf8"))
const stories = Object.values(index.entries).filter((entry) => entry.type === "story")

const { server, port } = await serve(output)
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })

/* 테스트는 네트워크를 타지 않는다. `preview-head.html`이 Pretendard를 CDN에서
 * 받는데, `networkidle`로 기다리는 이 계기에서 그 요청 하나가 느리면 스토리마다
 * 그만큼 늘어지고 오프라인에서는 매달린다. 문서를 보는 사람에게 필요한 폰트이지
 * 재는 데 필요한 폰트가 아니므로 여기서만 끊는다 — 재는 것은 기하와 접근성이고,
 * 둘 다 폰트 스택의 다음 서체로 그려도 같은 값이 나온다. */
await page.route("**://*/**", (route) =>
  route.request().url().startsWith(`http://127.0.0.1:${port}/`) ? route.continue() : route.abort()
)

after(async () => {
  await browser.close()
  server.close()
})

const storyUrl = (id) =>
  `http://127.0.0.1:${port}/iframe.html?id=${encodeURIComponent(id)}&viewMode=story`

/* 기본 뷰포트는 데스크톱(1280×900, 위 `page` 생성부)이다. Drawer(#284)처럼
 * 모바일 폭에서만 뜻이 있는 스토리는 `tags: ["viewport:mobile"]`를 달아
 * 375px(iPhone SE급)로 열게 한다 — CSF의 `tags`는 index.json에 그대로
 * 실리므로(Storybook이 색인에서 보존하는 몇 안 되는 필드다) 스토리를 열기
 * **전에** 알 수 있다. `parameters`는 실리지 않아서 이 용도로 못 쓴다
 * (preview.tsx의 키보드 계약이 `dataset`을 거치는 이유와 같다 — 그쪽은 이미
 * 연 문서 안에서 읽는 값이라 문제가 없다). */
const MOBILE_VIEWPORT = { width: 375, height: 812 }
const DEFAULT_VIEWPORT = { width: 1280, height: 900 }

test("계기 검증 — 알려진 기하를 그대로 읽는다", async () => {
  const probe = await browser.newPage({ viewport: { width: 1200, height: 800 } })
  try {
    await probe.setContent(SELF_TEST_HTML)
    const rows = await probe.evaluate(measureInPage, { floor: FLOOR, reach: REACH })
    for (const [label, expected] of Object.entries(SELF_TEST_EXPECT)) {
      const row = rows.find((candidate) => candidate.label === label)
      assert.ok(row, `${label}: 행이 없다 — ${expected.why}`)
      for (const key of ["hitW", "hitH", "fitsFloor"]) {
        if (key in expected)
          assert.equal(row[key], expected[key], `${label}.${key} — ${expected.why}`)
      }
      if (expected.note)
        assert.ok(row.note.includes(expected.note), `${label}: note에 ${expected.note}가 없다 (${row.note.join(",")}) — ${expected.why}`)
    }
  } finally {
    await probe.close()
  }
})

test("스토리가 하나라도 있다", () => {
  assert.ok(stories.length > 0, "storybook-static/index.json에 스토리가 없다 — build-storybook이 먼저다")
})

for (const story of stories) {
  describe(story.id, () => {
    before(async () => {
      const mobile = story.tags?.includes("viewport:mobile") ?? false
      await page.setViewportSize(mobile ? MOBILE_VIEWPORT : DEFAULT_VIEWPORT)
      await page.goto(storyUrl(story.id), { waitUntil: "networkidle" })
    })

    test("axe 위반 0", async () => {
      await page.addScriptTag({ content: axe.source })
      const result = await page.evaluate(() =>
        globalThis.axe.run(document, {
          /* 스토리는 페이지가 아니라 **한 조각**이다. 랜드마크·h1·region은 그
           * 조각을 감싼 페이지의 몫이라 여기서 물으면 언제나 위반이 난다 */
          rules: {
            "landmark-one-main": { enabled: false },
            "page-has-heading-one": { enabled: false },
            region: { enabled: false },
          },
        })
      )
      assert.deepEqual(
        result.violations.map((violation) => ({
          rule: violation.id,
          impact: violation.impact,
          targets: violation.nodes.map((node) => node.target),
        })),
        []
      )
    })

    test(`포인터 대상 히트 영역 ≥ ${FLOOR}×${FLOOR}`, async () => {
      const rows = await page.evaluate(measureInPage, { floor: FLOOR, reach: REACH })
      const measured = rows.filter(isMeasured)
      const short = measured.filter((row) => row.fitsFloor !== true)
      assert.deepEqual(
        short.map((row) => ({
          label: row.label,
          visual: `${row.visualW}×${row.visualH}`,
          hit: `${row.hitW}×${row.hitH}`,
          note: row.note.join(",") || "-",
        })),
        [],
        `히트 영역이 ${FLOOR}px 하한에 못 미친다 — 시각 치수를 키우지 말고 hit-area를 걸어라 (ADR-0020)`
      )
    })

    test("키보드 계약", async (t) => {
      const declared = await page.evaluate(() => document.documentElement.dataset.dsKeyboard ?? null)
      if (!declared) {
        // 계약을 선언하지 않은 스토리는 잴 것이 없다. 다음 컴포넌트가 자기 계약을
        // parameters.keyboard에 더하면 여기서 자동으로 돈다
        t.skip("선언된 키보드 계약이 없다")
        return
      }
      for (const contract of JSON.parse(declared)) {
        // 계약마다 새로 연다 — 앞 계약이 남긴 상태(누른 횟수·포커스)를 물려받으면
        // 순서가 결과를 바꾸고, 그러면 계약이 계약이 아니라 시나리오가 된다
        await page.goto(storyUrl(story.id), { waitUntil: "networkidle" })
        if (contract.focus) await page.locator(contract.focus).focus()
        // 키 사이에 한 프레임을 준다 — 여는 동작은 플로팅 포지셔닝(rAF)을
        // 한 박자 기다린 뒤 반영되고, 다음 키가 그 전에 도착하면(예: 메뉴가
        // 아직 열리기 전에 온 두 번째 ArrowDown, #285) 계기가 있지도 않은
        // 상태를 잰다. 오버레이가 열리며 초기 포커스를 옮기는 것도 같은
        // 이유로 비동기다(Dialog·AlertDialog·Drawer, #284). Select의
        // typeahead도 같다 — Enter로 열고 곧장 타이핑 점프한 뒤 Enter로 고르는
        // 계약이 이 간격 없이는 React 상태가 커밋되기 전에 다음 키가 그 상태를
        // 읽는 경합으로 못 지나갔다(#288). 간격 자체는 결과가 아니므로 계약에는
        // 적지 않는다
        for (const key of contract.press) {
          await page.keyboard.press(key)
          await page.waitForTimeout(50)
        }

        /* Menu·Dialog류는 포커스 이동이 포지셔닝(플로팅 UI의 rAF)이나 열림
         * 트랜지션을 한 박자 기다린 뒤 일어난다 — 누른 직후 바로 읽으면 이
         * 계기가 그 박자를 놓치고 간헐적으로 실패한다(#285의 Menu, #284의
         * Dialog·AlertDialog·Drawer가 각각 발견). `waitForFunction`으로
         * 조건이 참이 될 때까지 짧게 기다렸다가 마지막 값으로 단언한다 —
         * 조건이 이미 참이면 사실상 즉시 통과하므로 계약이 빠른 컴포넌트는
         * 느려지지 않는다. */
        if (contract.expect.focused) {
          const selector = contract.expect.focused
          await page
            .waitForFunction(
              (sel) => document.activeElement !== null && document.activeElement.closest(sel) !== null,
              selector,
              { timeout: 2000 }
            )
            .catch(() => {})
          const focused = await page.evaluate((sel) => {
            const active = document.activeElement
            return active !== null && active.closest(sel) !== null
          }, selector)
          assert.ok(focused, `${contract.name}: 포커스가 ${selector}에 없다`)
        }
        for (const [selector, expected] of Object.entries(contract.expect.text ?? {})) {
          await page
            .waitForFunction(
              ({ sel, exp }) => document.querySelector(sel)?.textContent?.trim() === exp,
              { sel: selector, exp: expected },
              { timeout: 2000 }
            )
            .catch(() => {})
          const actual = await page.locator(selector).textContent()
          assert.equal(actual?.trim(), expected, `${contract.name}: ${selector}`)
        }
      }
    })
  })
}
