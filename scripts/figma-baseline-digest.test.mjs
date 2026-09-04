import assert from "node:assert/strict"
import test from "node:test"

import { digest, TOKEN_ARTIFACT } from "./figma-baseline-digest.mjs"

/* 가짜 트리. 실제 산출물을 읽으면 토큰이 바뀔 때마다 이 테스트가 빨개지는데,
 * 여기서 지키려는 것은 값이 아니라 **알고리즘**이다. */
const tree = { "d/a.txt": "alpha", "d/b/c.txt": "gamma" }

const readerFor = (files) => {
  const dirs = new Set()
  for (const file of Object.keys(files)) {
    const parts = file.split("/")
    for (let i = 0; i < parts.length; i++) dirs.add(parts.slice(0, i).join("/"))
  }
  const rel = (absolute) => absolute.replace(/^.*?(?=d(\/|$))/, "")
  return {
    stat: async (absolute) => ({ isFile: () => files[rel(absolute)] !== undefined }),
    readdir: async (absolute) => {
      const prefix = rel(absolute) === "" ? "" : `${rel(absolute)}/`
      const names = new Set()
      for (const file of Object.keys(files)) {
        if (!file.startsWith(prefix)) continue
        names.add(file.slice(prefix.length).split("/")[0])
      }
      return [...names]
    },
    readFile: async (absolute) => Buffer.from(files[rel(absolute)]),
  }
}

/* 붙박이 답. 이 값이 움직이면 세대를 건너는 비교가 끊긴다 — 옛 기준선의
 * tokenArtifactHash와 새 값이 같은 함수에서 나왔다는 보장이 사라진다. */
test("digest는 지워진 sync-preflight의 알고리즘을 그대로 잇는다", async () => {
  assert.equal(
    await digest(["d"], readerFor(tree)),
    "e660829d1647bf0f3d2f940bb79de8ac6aae7700467f6261a655936f5f7122aa",
  )
})

test("경로가 해시에 들어간다 — 이름만 바뀌어도 세대가 움직인다", async () => {
  const renamed = { "d/a.txt": "alpha", "d/b/z.txt": "gamma" }
  assert.notEqual(await digest(["d"], readerFor(tree)), await digest(["d"], readerFor(renamed)))
})

test("구분자가 이어붙이기 충돌을 막는다", async () => {
  // 구분자가 없으면 "alpha"+"gamma"와 "alphagamma"가 같은 해시를 낸다
  assert.notEqual(await digest(["d"], readerFor(tree)), await digest(["d"], readerFor({ "d/a.txt": "alphagamma" })))
})

test("파일 순서는 읽은 순서가 아니라 정렬 순서다", async () => {
  const reversed = Object.fromEntries(Object.entries(tree).reverse())
  assert.equal(await digest(["d"], readerFor(tree)), await digest(["d"], readerFor(reversed)))
})

test("대상은 토큰 산출물 하나다 — inputDigest는 ADR-0002 개정이 지웠다", () => {
  assert.equal(TOKEN_ARTIFACT, "packages/tokens/dist")
})
