/* 매니페스트를 메모리에서 짓는다. 파일로 쓰는 것은 manifest.mjs, 커밋된 것과
 * 비교하는 것은 manifest-verify.mjs — 토큰 패키지의 build/verify 선례 그대로다.
 *
 * ⚠️ 이 모듈은 **bun으로만 돈다.** 컴포넌트의 cva 정의를 읽으려면 .tsx를 그대로
 * import해야 하는데 node는 JSX를 못 벗긴다(ADR-0001의 "런타임은 node"는 토큰
 * 빌드의 이야기이고, 여기서는 소스가 TSX라는 사실이 이긴다). 순수 부분(파서·
 * 분류기·해시)은 따로 떼어 node --test가 그대로 검사한다. */
import { readFileSync } from "node:fs"
import { join } from "node:path"

import { assembleBase, assembleCell, cellsOf } from "./assemble.mjs"
import { compileClasses } from "./compile.mjs"
import { parseCss } from "./css.mjs"
import { canonicalJson, hashComponent } from "./hash.mjs"
import { emitCatalogLayout } from "./catalog-layout.mjs"
import { loadTheme } from "./theme.mjs"

/** 5: 서드파티가 소유해 우리 cva가 설명하지 못하는 표면을 `externalSurfaces`에 담는다(#122).
 *
 * 파생 채널이 읽어야 하기 때문에 계약에만 두지 않는다. Figma Sync가 이 컴포넌트를
 * 만났을 때 **매니페스트에 없는 것이 아직 못 다룬 것인지 영영 우리 것이 아닌지**를
 * 여기서 구분한다 — 그러지 않으면 껍데기 variant를 주입한 뒤에야 알게 된다. */
/** 6: 계약이 구성 상태를 그리는 자리를 `drawnBy`로 함께 선언하고, 셀이 구성 상태별 차이를
 * `configurations`에 담는다(#148).
 *
 * 소비처가 새로 읽어야 하는 것은 셀의 `configurations`다 — `{ 구성 상태: { 값: { CSS 속성: 항목 } } }`
 * 이며 쉬는 상태(`properties`)에 대한 차이다. Figma 쪽에서 이것은 variant 축이 아니라
 * **component property**이므로 카탈로그의 조합 수는 늘지 않는다. `drawnBy`는 매니페스트에도
 * 실리지만 코드 쪽 사실이라 해시의 입력이 아니다. */
/** 7: `drawnBy` 항목에 세 번째 모양 `{ modifiers, carriedBy: "none" }`이 생긴다(#184).
 *
 * 소비처가 새로 해야 하는 일은 **판별**이다 — 이제 이유 문자열과 `{ attribute, values }`
 * 둘로 가르면 안 된다. 뜻은 *"우리 클래스가 그리지만 파생 채널이 나르지 않기로 판정됐다"*
 * 이므로, 이 자리를 만난 주입은 `unresolved`처럼 "아직 못 다룬 것"으로 읽지 말고 그릴 것이
 * 없는 것으로 읽는다. `drawnBy`는 여전히 해시의 입력이 아니라 이 세대는 해시를 움직이지
 * 않는다. */
export const SCHEMA_VERSION = 7
export const OUT_DIR = "dist/manifest"

export function buildManifests(components, root) {
  // CSS 안에서는 패키지 지정자로 부른다 — 임시 입력 파일이 node_modules 밑에
  // 있어도 워크스페이스 심링크를 타고 해석된다. fs로 읽을 때는 scripts/check.mjs와
  // 같은 상대 경로를 쓴다
  const tokensCssSpecifier = "@massive/tokens/dist/tokens.css"
  const tokensCssPath = join(root, "../tokens/dist/tokens.css")
  const stateCss = join(root, "src/state.css")
  const scalePath = join(root, "../tokens/tokens/primitive/scale.json")

  const planFor = (c) => {
    const cells = cellsOf(c.config).map((props) => ({ props, className: c.className(props) }))
    const parts = Object.fromEntries(Object.entries(c.parts ?? {}).map(([name, part]) => [
      name,
      {
        contract: part,
        cells: cellsOf(part.config).map((props) => ({ props, className: part.className(props) })),
      },
    ]))
    return { component: c, cells, parts }
  }
  const plans = components.map(planFor)

  const classes = [...new Set(plans.flatMap((p) => [
    ...p.cells,
    ...Object.values(p.parts).flatMap((part) => part.cells),
  ].flatMap((c) => c.className.split(/\s+/))))].filter(Boolean)
  const compiled = compileClasses(classes, { root, tokensCss: tokensCssSpecifier, stateCss })
  const tree = parseCss(compiled)
  const theme = loadTheme({
    tokensCss: readFileSync(tokensCssPath, "utf8"),
    scaleJson: readFileSync(scalePath, "utf8"),
    compiledCss: compiled,
  })

  // 컴포넌트에 무관하다 — 컴파일 입력이 같으므로 한 번만 판다
  const base = assembleBase({ tree, theme })

  const files = new Map()
  const index = []

  for (const { component, cells, parts } of plans) {
    const assembledParts = Object.fromEntries(Object.entries(parts).map(([name, part]) => [
      name,
      {
        axes: Object.fromEntries(Object.entries(part.contract.config.variants).map(([a, v]) => [a, Object.keys(v)])),
        defaults: { ...part.contract.config.defaultVariants },
        // 구성 상태는 컴포넌트가 선언하고 파트가 그린다 — tabs의 `selected`를 `TabsTrigger`가
        // 그리는 것이 그 예다. 그래서 파트 셀도 같은 이름표를 받는다
        cells: part.cells.map(({ props, className }) => assembleCell({ props, className, tree, theme, drawnBy: component.drawnBy })),
      },
    ]))
    const doc = {
      schemaVersion: SCHEMA_VERSION,
      base,
      component: component.name,
      source: component.source,
      axes: Object.fromEntries(Object.entries(component.config.variants).map(([a, v]) => [a, Object.keys(v)])),
      defaults: { ...component.config.defaultVariants },
      anatomy: component.anatomy ?? [],
      ...(Object.keys(assembledParts).length ? { parts: assembledParts } : {}),
      configurationStates: component.configurationStates ?? {},
      drawnBy: component.drawnBy ?? {},
      ...(component.externalSurfaces ? { externalSurfaces: { ...component.externalSurfaces } } : {}),
      reference: component.reference,
      cells: cells.map(({ props, className }) => assembleCell({ props, className, tree, theme, drawnBy: component.drawnBy })),
    }
    doc.hash = hashComponent(doc)
    const file = `${component.name}.gen.json`
    files.set(file, canonicalJson(doc))
    index.push({ component: component.name, hash: doc.hash, path: file, cells: doc.cells.length })
  }

  index.sort((a, b) => a.component.localeCompare(b.component))
  files.set(
    "index.gen.json",
    canonicalJson({ schemaVersion: SCHEMA_VERSION, components: index })
  )
  files.set("catalog-layout-check.gen.js", emitCatalogLayout(index, "check"))
  files.set("catalog-layout-sync.gen.js", emitCatalogLayout(index, "sync"))
  return files
}
