/* 정적 빌드 하나를 127.0.0.1의 빈 포트에 띄운다 — apps/storybook/test의 서버와 같은 모양 */
import { createServer } from "node:http"
import { readFile } from "node:fs/promises"
import path from "node:path"

const TYPES = { ".css": "text/css", ".html": "text/html", ".js": "text/javascript", ".json": "application/json", ".svg": "image/svg+xml", ".woff2": "font/woff2" }

export function serve(dir) {
  const server = createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname)
      const absolute = path.resolve(dir, pathname === "/" ? "index.html" : pathname.slice(1))
      const body = await readFile(absolute)
      response.writeHead(200, { "content-type": TYPES[path.extname(absolute)] ?? "application/octet-stream" }).end(body)
    } catch {
      response.writeHead(404).end("Not found")
    }
  })
  return new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve({ server, port: server.address().port })))
}

export async function open(page, port, id) {
  await page.goto(`http://127.0.0.1:${port}/iframe.html?id=${id}&viewMode=story`)
  await page.waitForFunction((expected) => document.documentElement.dataset.dsRendered === expected, id)
}
