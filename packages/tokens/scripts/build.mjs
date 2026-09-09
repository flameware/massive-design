/**
 * tokens/** → dist/**
 *
 * 출력물: `dist/tokens.css` · `dist/tokens.d.ts`. `dist/**`는 커밋한다 —
 * 아직 npm 게시 전이라 **커밋이 곧 배포 채널**이다(build-pipeline.md §2).
 * 어긋남은 `tokens:verify`가 잡는다.
 *
 * 1세대의 Figma 주입 스크립트·var-map·상태 견본 색·shadcn alias 층은 #277에서
 * 삭제됐다(ADR-0023 §1·§3·§9). 태그 `v1-shadcn`이 보존한다.
 */
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

import { flatten } from './lib/resolve.mjs'
import { emitCss } from './lib/emit/css.mjs'
import { emitTypes } from './lib/emit/types.mjs'

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

export function loadSources(root = ROOT) {
  const read = (p) => JSON.parse(readFileSync(join(root, 'tokens', p), 'utf8'))
  const gen = read('primitive/color.gen.json')
  const literal = read('primitive/color.literal.json')
  const scale = read('primitive/scale.json')
  const semantic = read('semantic/color.json')
  // 빌드가 보는 평면 세계 — primitive와 semantic이 한 Map에 산다
  const tokens = new Map([
    ...flatten(gen), ...flatten(literal), ...flatten(scale), ...flatten(semantic),
  ])
  return { gen, literal, scale, semantic, tokens }
}

/** 상대 경로 → 내용. 파일로 쓰지 않는다 — verify가 같은 함수로 메모리 비교를 한다. */
export function buildAll(sources = loadSources()) {
  const out = new Map()
  out.set('tokens.css', emitCss(sources))
  out.set('tokens.d.ts', emitTypes(sources))
  return out
}

function main() {
  const files = buildAll()

  const dist = join(ROOT, 'dist')
  rmSync(dist, { recursive: true, force: true })
  for (const [name, content] of files) {
    const path = join(dist, name)
    mkdirSync(dirname(path), { recursive: true })
    writeFileSync(path, content)
  }

  for (const name of files.keys()) console.log(`dist/${name}`)
}

/** dist에 실제로 놓인 파일 목록. verify가 유령 파일을 잡는 데 쓴다. */
export function distFiles(root = ROOT) {
  const dist = join(root, 'dist')
  const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : [relative(dist, join(dir, e.name))])
  try {
    return walk(dist)
  } catch {
    return []
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main()
