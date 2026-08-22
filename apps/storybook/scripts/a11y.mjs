import { createServer } from "node:http"
import { readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { chromium } from "playwright"
import axe from "axe-core"

const root = path.resolve(import.meta.dirname, "..")
const output = path.join(root, "storybook-static")
const index = JSON.parse(await readFile(path.join(output, "index.json"), "utf8"))
const stories = Object.values(index.entries).filter((entry) => entry.type === "story")

const contentTypes = { ".css": "text/css", ".html": "text/html", ".js": "text/javascript", ".json": "application/json", ".svg": "image/svg+xml" }
const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname)
    const requested = pathname === "/" ? "index.html" : pathname.slice(1)
    const absolute = path.resolve(output, requested)
    if (!absolute.startsWith(`${output}${path.sep}`)) throw new Error("outside Storybook output")
    const body = await readFile(absolute)
    response.writeHead(200, { "content-type": contentTypes[path.extname(absolute)] ?? "application/octet-stream" }).end(body)
  } catch {
    response.writeHead(404).end("Not found")
  }
})

await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve))
const { port } = server.address()
const browser = await chromium.launch({ headless: true })
const violations = []
const incomplete = []
try {
  const page = await browser.newPage()
  for (const story of stories) {
    await page.goto(`http://127.0.0.1:${port}/iframe.html?id=${encodeURIComponent(story.id)}&viewMode=story`, { waitUntil: "networkidle" })
    await page.addScriptTag({ content: axe.source })
    const result = await page.evaluate(() => globalThis.axe.run(document, {
      rules: {
        "landmark-one-main": { enabled: false },
        "page-has-heading-one": { enabled: false },
        region: { enabled: false },
      },
    }))
    for (const violation of result.violations) violations.push({ story: story.id, impact: violation.impact, rule: violation.id, nodes: violation.nodes.length })
    for (const item of result.incomplete) incomplete.push({ story: story.id, impact: item.impact, rule: item.id, nodes: item.nodes.length })
  }
} finally {
  await browser.close()
  server.close()
}

if (violations.length) {
  await writeFile(path.join(output, "a11y-report.json"), `${JSON.stringify({ stories: stories.length, violations, incomplete }, null, 2)}\n`)
  console.error(JSON.stringify(violations, null, 2))
  process.exit(1)
}
await writeFile(path.join(output, "a11y-report.json"), `${JSON.stringify({ stories: stories.length, violations, incomplete }, null, 2)}\n`)
console.log(`axe: 0 violations across ${stories.length} stories`)
console.log(`axe incomplete: ${incomplete.length}${incomplete.length ? `\n${JSON.stringify(incomplete, null, 2)}` : ""}`)
