/* Figma 스냅숏 기준선의 `tokenArtifactHash`(#273).
 *
 * **이 스크립트가 존재하는 이유는 계산법이 한 번 사라졌기 때문이다.** 이 해시는
 * `scripts/sync-preflight.mjs`가 만들었고 ADR-0002 개정(`6fe293e`)이 검증 원장을
 * 걷어내면서 그 파일을 지웠다 — 필드는 runbook이 계속 요구하는데 그것을 만드는
 * 코드만 없어진 자리다. 2026-09 스냅숏은 지워진 commit에서 `digest()`를 꺼내
 * 옛 기준선의 값을 재현해 본 뒤에야 새 값을 쓸 수 있었다. 두 번은 하지 않는다.
 *
 * **`inputDigest`는 되살리지 않는다.** ADR-0002 개정이 이름을 대고 지운 것이고,
 * 기준선이 답해야 하는 질문은 "어느 commit의 매니페스트 해시가 Figma에 있는가"
 * 하나로 좁혀졌다. 이 스크립트가 내는 것은 토큰 산출물 하나뿐이다.
 *
 * 알고리즘은 지워진 스크립트의 것을 그대로 옮겼다 — 값이 세대를 건너 비교되므로
 * 바꾸면 옛 기준선과 이어지지 않는다. 파일 경로를 정렬해 `<경로>\0<내용>\0`을
 * 차례로 먹인 sha256이다. */

import { createHash } from "node:crypto"
import { readFile, readdir, stat } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")

/** 토큰 산출물 전체. `bun run --cwd packages/tokens tokens:build`가 내는 자리다. */
export const TOKEN_ARTIFACT = "packages/tokens/dist"

async function filesAt(relative, read) {
  const absolute = path.join(root, relative)
  const metadata = await read.stat(absolute)
  if (metadata.isFile()) return [relative]
  const names = await read.readdir(absolute)
  return (await Promise.all(names.sort().map((name) => filesAt(path.join(relative, name), read)))).flat()
}

/* 경로를 내용과 함께 먹인다 — 내용만 먹이면 파일이 이름을 바꿔도 해시가 안 움직인다.
 * 널 바이트 구분자는 "ab"+"c"와 "a"+"bc"가 같은 해시를 내는 것을 막는다. */
export async function digest(paths, read = { stat, readdir, readFile }) {
  const hash = createHash("sha256")
  for (const file of (await Promise.all(paths.map((p) => filesAt(p, read)))).flat().sort()) {
    hash.update(`${file}\0`)
    hash.update(await read.readFile(path.join(root, file)))
    hash.update("\0")
  }
  return hash.digest("hex")
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.stdout.write(`${await digest([TOKEN_ARTIFACT])}\n`)
}
