/**
 * 커밋된 생성물이 원본과 어긋나지 않았는지 본다.
 *
 * **생성물 커밋(build-pipeline.md §2)이 성립하려면 이게 있어야 한다.** `dist/**`가
 * 배포 채널이므로 "원본은 고쳤는데 dist를 안 다시 지은" 상태가 곧 잘못된 배포다.
 *
 * 사양은 "임시 디렉터리에 재실행"이라고 적었지만 **메모리에서 렌더해 비교한다**.
 * 같은 판정을 더 적은 움직이는 부품으로 내고, 임시 디렉터리가 남기는 뒷정리
 * 실패 경로가 없다. 대신 임시 디렉터리 방식이 놓치는 것 — dist에 남은 유령
 * 파일 — 을 따로 검사한다.
 *
 * CI 순서에서 마지막인 이유: lint·contrast는 **원본**을 검사하므로 먼저 실패해야
 * 원인이 명확하다. verify는 "생성물이 원본과 어긋났다"만 말할 수 있어 진단
 * 정보가 가장 적다(build-pipeline.md §7).
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { ROOT, buildAll, distFiles, loadSources } from './build.mjs'
import { GEN_FILE, configPath, renderGenDoc } from './ramp.mjs'

export function verify(root = ROOT) {
  const stale = []

  // 1. tokens:ramp — 생성 토큰 원본
  const { content, issues } = renderGenDoc(readFileSync(configPath(root), 'utf8'))
  for (const i of issues.filter((x) => x.level === 'error')) stale.push(`램프 lint: ${i.msg}`)
  if (readFileSync(join(root, GEN_FILE), 'utf8') !== content) {
    stale.push(`${GEN_FILE} — 손편집됐거나 config가 바뀌었다. tokens:ramp를 돌릴 것`)
  }

  // 2. tokens:build — dist 4종
  const built = buildAll(loadSources(root))
  for (const [name, expected] of built) {
    let actual
    try {
      actual = readFileSync(join(root, 'dist', name), 'utf8')
    } catch {
      stale.push(`dist/${name} — 없다`)
      continue
    }
    if (actual !== expected) stale.push(`dist/${name} — 원본과 어긋났다`)
  }

  // 3. 유령 파일 — 이름이 바뀐 뒤 남은 옛 산출물은 여전히 배포에 실린다
  for (const name of distFiles(root)) {
    if (!built.has(name)) stale.push(`dist/${name} — 빌드가 내지 않는 파일이다`)
  }

  return stale
}

function main() {
  const stale = verify()
  for (const s of stale) console.error(`✗ ${s}`)
  if (stale.length) {
    console.error('\nverify 실패 — tokens:ramp · tokens:build를 다시 돌리고 커밋할 것')
    process.exit(1)
  }
  console.log('verify 통과 — 커밋된 생성물이 원본과 일치한다')
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main()
