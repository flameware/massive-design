/* Combobox.InputGroup의 렌더링된 치수 (#487).
 *
 * stories.test.mjs는 모든 스토리에 같은 다섯(axe·히트 영역·컨트롤 높이·여백·
 * 키보드)을 잰다. 여기는 그 다섯이 표현하지 못하는 칸 안 그룹만의 계약을 같은
 * 정적 빌드에서 잰다(스토리는 stories/combobox/Combobox.stories.tsx의 "칸 안 세그먼트") — 클래스 문자열이 아니라 `getComputedStyle`·
 * `getBoundingClientRect`로:
 *
 *   1. 테두리는 그룹 하나뿐이고 입력에는 테두리·면이 없다
 *   2. `anchor` 없이 연 후보 목록의 폭이 그룹 폭과 같다
 *   3. 키보드로 입력에 포커스하면 링이 그룹 바깥에 그려지고 입력 자신의 링은 없다
 *   4. invalid면 그룹 테두리가 danger, disabled면 그룹이 무력화 면·불투명도를 받는다
 *   5. 칸 안 ToggleGroup은 판 테두리가 없고 칸의 안쪽 높이 안에 들어간다 */
import assert from "node:assert/strict"
import { createServer } from "node:http"
import { readFile } from "node:fs/promises"
import path from "node:path"
import { after, before, test } from "node:test"
import { chromium } from "playwright"

const output = path.resolve(import.meta.dirname, "..", "storybook-static")

/* stories.test.mjs의 정적 서버와 같은 모양이다. 그 파일을 import하면 그쪽의
 * 테스트 전부가 이 프로세스에서 다시 돌므로 몇 줄을 옮겨 둔다 */
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
      const absolute = path.resolve(dir, pathname === "/" ? "index.html" : pathname.slice(1))
      if (!absolute.startsWith(`${dir}${path.sep}`)) throw new Error("outside Storybook output")
      const body = await readFile(absolute)
      response
        .writeHead(200, { "content-type": CONTENT_TYPES[path.extname(absolute)] ?? "application/octet-stream" })
        .end(body)
    } catch {
      response.writeHead(404).end("Not found")
    }
  })
  return new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve({ server, port: server.address().port })))
}

let server
let browser
let page
let port

before(async () => {
  ;({ server, port } = await serve(output))
  browser = await chromium.launch({ headless: true })
  page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  await page.route("**://*/**", (route) =>
    route.request().url().startsWith(`http://127.0.0.1:${port}/`) ? route.continue() : route.abort()
  )
})

after(async () => {
  await browser?.close()
  server?.close()
})

/* stories.test.mjs의 openStory와 같은 세 조건을 기다린다(#482) */
async function openStory(id) {
  await page.goto(
    `http://127.0.0.1:${port}/iframe.html?id=${encodeURIComponent(id)}&viewMode=story&globals=a11y.manual:!true`
  )
  await page.waitForFunction((expected) => document.documentElement.dataset.dsRendered === expected, id)
  await page.evaluate(async () => {
    await document.fonts.ready
    await Promise.all(
      document
        .getAnimations()
        .filter((animation) => animation.effect?.getComputedTiming().endTime !== Infinity)
        .map((animation) => animation.finished.catch(() => {}))
    )
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
  })
}

/** 그룹과 그 직계 입력, 칸 안 판의 계산된 치수 */
function measureGroup(groupSelector) {
  const group = document.querySelector(groupSelector)
  const input = group.querySelector(":scope > input")
  const panel = group.querySelector(":scope > [role=group][aria-label='시장']")
  const gs = getComputedStyle(group)
  const is = getComputedStyle(input)
  const rect = (el) => {
    const r = el.getBoundingClientRect()
    return { top: r.top, bottom: r.bottom, left: r.left, right: r.right, width: r.width, height: r.height }
  }
  /* 토큰을 같은 문서에서 같은 방식으로 계산해 비교한다 — 값을 테스트에 박지 않는다 */
  const resolve = (prop, value) => {
    const probe = document.createElement("div")
    probe.style.setProperty(prop, value)
    document.body.append(probe)
    const out = getComputedStyle(probe).getPropertyValue(prop)
    probe.remove()
    return out
  }
  return {
    group: {
      rect: rect(group),
      borderTop: parseFloat(gs.borderTopWidth),
      borderLeft: parseFloat(gs.borderLeftWidth),
      borderColor: gs.borderTopColor,
      background: gs.backgroundColor,
      opacity: gs.opacity,
      outlineStyle: gs.outlineStyle,
      outlineWidth: parseFloat(gs.outlineWidth),
    },
    input: {
      borderTop: parseFloat(is.borderTopWidth),
      borderLeft: parseFloat(is.borderLeftWidth),
      background: is.backgroundColor,
      outlineStyle: is.outlineStyle,
      outlineWidth: parseFloat(is.outlineWidth),
    },
    panel: panel && {
      rect: rect(panel),
      borderTop: parseFloat(getComputedStyle(panel).borderTopWidth),
      background: getComputedStyle(panel).backgroundColor,
    },
    tokens: {
      danger: resolve("border-top-color", "var(--ds-border-danger)"),
      field: resolve("border-top-color", "var(--ds-border-field)"),
      inset: resolve("background-color", "var(--ds-bg-inset)"),
    },
  }
}

const TRANSPARENT = "rgba(0, 0, 0, 0)"

test("테두리는 그룹 하나뿐이고, 입력은 테두리·면 없는 맨 칸이다", async () => {
  await openStory("forms-combobox--input-group-segment")
  const m = await page.evaluate(measureGroup, "[data-testid=market-search-group]")
  assert.equal(m.group.borderTop, 1)
  assert.equal(m.group.borderLeft, 1)
  assert.equal(m.group.borderColor, m.tokens.field)
  assert.equal(m.input.borderTop, 0)
  assert.equal(m.input.borderLeft, 0)
  assert.equal(m.input.background, TRANSPARENT)
  assert.equal(m.group.rect.height, 36, "그룹 겉 높이가 md 36이 아니다")
})

/* 기본 size인 판과, 일부러 `size="lg"`를 준 판 둘 다 — 항목 높이는 칸이 정한다 */
for (const [story, group] of [
  ["forms-combobox--input-group-segment", "[data-testid=market-search-group]"],
  ["forms-combobox--input-group-control-height", "[data-testid=height-group]"],
])
test(`칸 안 ToggleGroup은 판 테두리·면이 없고, 칸의 안쪽 높이를 채운다 — ${story}`, async () => {
  await openStory(story)
  const m = await page.evaluate(measureGroup, group)
  assert.ok(m.panel, "칸 안 판이 없다")
  assert.equal(m.panel.borderTop, 0)
  assert.equal(m.panel.background, TRANSPARENT)
  const innerTop = m.group.rect.top + m.group.borderTop
  const innerBottom = m.group.rect.bottom - m.group.borderTop
  // 판이 칸의 안쪽 높이(34)를 채운다 — 넘치지도 모자라지도 않는다
  assert.equal(m.panel.rect.height, innerBottom - innerTop, "판이 칸의 안쪽 높이를 채우지 않는다")
  assert.ok(m.panel.rect.top >= innerTop - 0.5 && m.panel.rect.bottom <= innerBottom + 0.5, "판이 칸 밖으로 넘친다")
})

test("anchor 없이 연 후보 목록의 폭이 그룹 폭과 같다", async () => {
  await openStory("forms-combobox--input-group-segment")
  await page.locator("[data-testid=market-search-group] > input").focus()
  await page.keyboard.press("ArrowDown")
  const popup = page.locator("[data-testid=market-search-popup]")
  await popup.waitFor({ state: "visible" })
  // 플로팅 포지셔닝이 rAF에서 자리를 잡는다 — stories.test.mjs의 openStory와 같은 두 프레임
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
  const { group, list } = await page.evaluate(() => ({
    group: document.querySelector("[data-testid=market-search-group]").getBoundingClientRect().toJSON(),
    list: document.querySelector("[data-testid=market-search-popup]").getBoundingClientRect().toJSON(),
  }))
  assert.ok(Math.abs(list.width - group.width) < 0.5, `목록 ${list.width}px ≠ 그룹 ${group.width}px`)
  assert.ok(Math.abs(list.left - group.left) < 0.5, `목록이 그룹 왼쪽 끝(${group.left})이 아니라 ${list.left}에 붙었다`)
  assert.ok(list.top >= group.bottom, "목록이 그룹 아래에 있지 않다")

  /* 열린 동안 Base UI가 칸 안 세그먼트에 거는 aria-hidden은 열린 순간의 것이다 —
   * Shift+Tab으로 세그먼트에 가면 목록이 닫히고 속성이 풀린다(스토리 파일 주석) */
  const leadingHidden = () =>
    page.evaluate(() =>
      document
        .querySelector("[data-testid=market-search-group] > [role=group][aria-label='시장']")
        .getAttribute("aria-hidden")
    )
  assert.equal(await leadingHidden(), "true", "전제가 바뀌었다 — 스토리 주석을 고칠 때다")
  await page.keyboard.press("Shift+Tab")
  await popup.waitFor({ state: "hidden" })
  assert.equal(await leadingHidden(), null)
  assert.equal(await page.evaluate(() => document.activeElement?.textContent), "한국")
})

test("키보드로 입력에 포커스하면 링은 그룹 바깥에 그려지고 입력 자신의 링은 없다", async () => {
  await openStory("forms-combobox--input-group-keyboard")
  const before = await page.evaluate(measureGroup, "[data-testid=market-keyboard-group]")
  assert.equal(before.group.outlineStyle, "none", "포커스 전부터 링이 있다")
  await page.keyboard.press("Tab")
  await page.keyboard.press("Tab")
  const focused = await page.evaluate(() => document.activeElement?.getAttribute("data-testid"))
  assert.equal(focused, "input-group-input")
  const m = await page.evaluate(measureGroup, "[data-testid=market-keyboard-group]")
  assert.equal(m.group.outlineStyle, "solid")
  assert.equal(m.group.outlineWidth, 2)
  assert.ok(m.input.outlineStyle === "none" || m.input.outlineWidth === 0, "입력이 자기 링을 그린다")
})

test("invalid면 그룹 테두리가 danger이고, disabled면 그룹이 무력화 면·불투명도를 받는다", async () => {
  await openStory("forms-combobox--input-group-states")
  const invalid = await page.evaluate(measureGroup, "[data-testid=market-invalid-group]")
  assert.equal(invalid.group.borderColor, invalid.tokens.danger)
  assert.equal(invalid.input.borderTop, 0, "invalid 입력이 자기 테두리를 그린다")

  const disabled = await page.evaluate(measureGroup, "[data-testid=market-disabled-group]")
  assert.equal(disabled.group.background, disabled.tokens.inset)
  assert.equal(disabled.group.opacity, "0.5")
  assert.equal(disabled.input.background, TRANSPARENT)
})
