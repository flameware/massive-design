/* 매니페스트를 메모리에서 짓는다. 파일로 쓰는 것은 manifest.mjs, 커밋된 것과
 * 비교하는 것은 manifest-verify.mjs — 토큰 패키지의 build/verify 선례 그대로다.
 *
 * ⚠️ 이 모듈은 **bun으로만 돈다.** 컴포넌트의 cva 정의를 읽으려면 .tsx를 그대로
 * import해야 하는데 node는 JSX를 못 벗긴다(ADR-0001의 "런타임은 node"는 토큰
 * 빌드의 이야기이고, 여기서는 소스가 TSX라는 사실이 이긴다). 순수 부분(파서·
 * 분류기·해시)은 따로 떼어 node --test가 그대로 검사한다. */
import { readFileSync } from "node:fs"
import { join } from "node:path"

import { assembleCell, cellsOf } from "./assemble.mjs"
import { compileClasses } from "./compile.mjs"
import { parseCss } from "./css.mjs"
import { canonicalJson, hashComponent } from "./hash.mjs"
import { loadTheme } from "./theme.mjs"

export const SCHEMA_VERSION = 1
export const OUT_DIR = "dist/manifest"

export function buildManifests(components, root) {
  // CSS 안에서는 패키지 지정자로 부른다 — 임시 입력 파일이 node_modules 밑에
  // 있어도 워크스페이스 심링크를 타고 해석된다. fs로 읽을 때는 scripts/check.mjs와
  // 같은 상대 경로를 쓴다
  const tokensCssSpecifier = "@massive/tokens/dist/tokens.css"
  const tokensCssPath = join(root, "../tokens/dist/tokens.css")
  const stateCss = join(root, "src/state.css")
  const scalePath = join(root, "../tokens/tokens/primitive/scale.json")

  const plans = components.map((c) => {
    const cells = cellsOf(c.config).map((props) => ({ props, className: c.className(props) }))
    return { component: c, cells }
  })

  const classes = [...new Set(plans.flatMap((p) => p.cells.flatMap((c) => c.className.split(/\s+/))))].filter(Boolean)
  const compiled = compileClasses(classes, { root, tokensCss: tokensCssSpecifier, stateCss })
  const tree = parseCss(compiled)
  const theme = loadTheme({
    tokensCss: readFileSync(tokensCssPath, "utf8"),
    scaleJson: readFileSync(scalePath, "utf8"),
    compiledCss: compiled,
  })

  const files = new Map()
  const index = []

  for (const { component, cells } of plans) {
    const doc = {
      schemaVersion: SCHEMA_VERSION,
      component: component.name,
      source: component.source,
      axes: Object.fromEntries(Object.entries(component.config.variants).map(([a, v]) => [a, Object.keys(v)])),
      defaults: { ...component.config.defaultVariants },
      cells: cells.map(({ props, className }) => assembleCell({ props, className, tree, theme })),
    }
    doc.hash = hashComponent(doc)
    const file = `${component.name}.gen.json`
    files.set(file, canonicalJson(doc))
    index.push({ component: component.name, hash: doc.hash, path: file, cells: doc.cells.length })
  }

  files.set(
    "index.gen.json",
    canonicalJson({ schemaVersion: SCHEMA_VERSION, components: index.sort((a, b) => a.component.localeCompare(b.component)) })
  )
  return files
}
