/**
 * tokens/ramp.config.json → tokens/primitive/color.gen.json (120색)
 *
 * 알고리즘 자체는 `scripts/lib/ramp-core.mjs`에 산다(순수 함수, #281이
 * 공개 API 번들과 공유하려고 분리했다). 이 파일은 그 알고리즘의 **CLI/빌드
 * 소비자**다 — config를 읽고, 생성 문서를 만들고, 파일에 쓴다.
 *
 * 램프 lint(규칙군 A)를 생성 직후 인라인으로 돌린다 — 깨진 램프가 파일로
 * 떨어지면 diff가 오염된다(build-pipeline §4.1).
 */
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { buildRamp, lintRamp, resolveOverrides, resolveParams } from './lib/ramp-core.mjs'

export { buildRamp, lintRamp, resolveOverrides, resolveParams }

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const CONFIG_PATH = 'tokens/ramp.config.json'
const OUT_PATH = 'tokens/primitive/color.gen.json'
const MODES = ['light', 'dark']

// ── 생성 ────────────────────────────────────────────────────────────────────

export function generate(config) {
  const palette = {}
  const issues = []
  for (const [name, family] of Object.entries(config.families)) {
    const params = resolveParams(config.defaults, family, name)
    resolveOverrides(family, name)
    palette[name] = {}
    for (const mode of MODES) {
      const label = `${name}.${mode}`
      const ramp = buildRamp(family, params, mode, label)
      issues.push(...lintRamp(ramp, family, params, label))
      palette[name][mode] = Object.fromEntries(
        ramp.map((s) => [
          String(s.step),
          {
            $type: 'color',
            $value: s.hex,
            $extensions: { 'design.massive.oklch': s.oklch },
          },
        ]),
      )
    }
  }
  return { palette, issues }
}

/**
 * config 원문 → `color.gen.json` 파일 내용. lint 이슈를 함께 돌려준다.
 * 파일로 쓰지 않는다 — `tokens:verify`가 같은 함수로 메모리 비교를 한다.
 */
export function renderGenDoc(configText) {
  const config = JSON.parse(configText)
  const { palette, issues } = generate(config)
  const doc = {
    $extensions: {
      'design.massive.source': {
        generator: 'scripts/ramp.mjs',
        config: CONFIG_PATH,
        // config가 바뀌는 시점과 값이 바뀌는 시점이 정확히 같다
        configHash: `sha256:${createHash('sha256').update(configText).digest('hex')}`,
      },
    },
    palette,
  }
  return { content: `${JSON.stringify(doc, null, 2)}\n`, issues, palette }
}

export const CONFIG_FILE = CONFIG_PATH
export const GEN_FILE = OUT_PATH
export const configPath = (root = ROOT) => join(root, CONFIG_PATH)

function main() {
  const configText = readFileSync(join(ROOT, CONFIG_PATH), 'utf8')
  const { content, issues, palette } = renderGenDoc(configText)

  for (const i of issues) console.error(`${i.level === 'error' ? '✗' : '⚠'} ${i.msg}`)
  if (issues.some((i) => i.level === 'error')) {
    console.error('\n램프 lint 실패 — 파일을 쓰지 않는다.')
    process.exit(1)
  }

  const out = join(ROOT, OUT_PATH)
  mkdirSync(dirname(out), { recursive: true })
  writeFileSync(out, content)
  const count = Object.values(palette).reduce(
    (n, f) => n + Object.values(f).reduce((m, r) => m + Object.keys(r).length, 0), 0,
  )
  console.log(`${OUT_PATH} — ${count}색 (${Object.keys(palette).length}패밀리 × 2모드)`)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main()
