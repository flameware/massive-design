/**
 * tokens/** → dist/**
 *
 * 출력물 4종: `dist/tokens.css` · `dist/tokens.d.ts` · `dist/figma/0*.js` ·
 * `dist/figma/var-map.gen.json`.
 * `dist/**`는 커밋한다 — npm 배포가 out of scope이므로 **커밋이 곧 배포
 * 채널**이다(build-pipeline.md §2). 어긋남은 `tokens:verify`가 잡는다.
 */
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

import { flatten } from './lib/resolve.mjs'
import { emitCss } from './lib/emit/css.mjs'
import { emitFigma, CODE_LIMIT } from './lib/emit/figma.mjs'
import { emitTypes } from './lib/emit/types.mjs'
import { emitVarMap } from './lib/emit/var-map.mjs'

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

export function loadSources(root = ROOT) {
  const read = (p) => JSON.parse(readFileSync(join(root, 'tokens', p), 'utf8'))
  const gen = read('primitive/color.gen.json')
  const literal = read('primitive/color.literal.json')
  const scale = read('primitive/scale.json')
  const semantic = read('semantic/color.json')
  const shadcn = read('alias/shadcn.json')
  // 빌드가 보는 평면 세계 — primitive와 semantic이 한 Map에 산다
  const tokens = new Map([
    ...flatten(gen), ...flatten(literal), ...flatten(scale), ...flatten(semantic),
  ])
  return { gen, literal, scale, semantic, shadcn, tokens }
}

/** 상대 경로 → 내용. 파일로 쓰지 않는다 — verify가 같은 함수로 메모리 비교를 한다. */
export function buildAll(sources = loadSources()) {
  const out = new Map()
  out.set('tokens.css', emitCss(sources))
  out.set('tokens.d.ts', emitTypes(sources))
  for (const [name, code] of Object.entries(emitFigma(sources))) {
    out.set(join('figma', name), code)
  }
  // 주입 스크립트가 아니라 표다 — 에이전트가 매니페스트를 들고 와 읽는다
  out.set(join('figma', 'var-map.gen.json'), emitVarMap(sources))
  return out
}

/**
 * `code` 파라미터 상한을 **빌드 타임에** 강제한다. 런타임에 드러나면 주입
 * 중간에서 터진다(build-pipeline.md §5).
 */
export function checkLimits(files) {
  const over = []
  for (const [name, code] of files) {
    // `code` 파라미터로 가는 것만이 상한의 대상이다 — var-map.gen.json은 표다
    if (name.startsWith('figma') && name.endsWith('.js') && code.length > CODE_LIMIT) {
      over.push(`${name}: ${code.length}자 > ${CODE_LIMIT} — 02a/02b로 쪼갤 것`)
    }
  }
  return over
}

function main() {
  const files = buildAll()
  const over = checkLimits(files)
  if (over.length) {
    for (const msg of over) console.error(`✗ ${msg}`)
    process.exit(1)
  }

  const dist = join(ROOT, 'dist')
  rmSync(dist, { recursive: true, force: true })
  for (const [name, content] of files) {
    const path = join(dist, name)
    mkdirSync(dirname(path), { recursive: true })
    writeFileSync(path, content)
  }

  for (const [name, content] of files) {
    const note = name.endsWith('.js') ? ` (${content.length}자)` : ''
    console.log(`dist/${name}${note}`)
  }
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
