/* 매니페스트를 메모리에서 짓는다. 파일로 쓰는 것은 manifest.mjs, 커밋된 것과
 * 비교하는 것은 manifest-verify.mjs — 토큰 패키지의 build/verify 선례 그대로다.
 *
 * ⚠️ 이 모듈은 **bun으로만 돈다.** 컴포넌트의 cva 정의를 읽으려면 .tsx를 그대로
 * import해야 하는데 node는 JSX를 못 벗긴다(ADR-0001의 "런타임은 node"는 토큰
 * 빌드의 이야기이고, 여기서는 소스가 TSX라는 사실이 이긴다). 순수 부분(파서·
 * 분류기·해시)은 따로 떼어 node --test가 그대로 검사한다. */
import { readFileSync } from "node:fs"
import { join } from "node:path"

import { assembleBase, assembleCell, cellsOf, inheritedAxesOf, partCellsOf } from "./assemble.mjs"
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
/** 8: 파트가 root의 축을 `inheritedAxes`로 지목해 물려받고, 축 되읽기가 셀의 축 값에
 * 대고 해소된다(#179).
 *
 * 소비처가 새로 해야 하는 일은 **파트의 축을 다시 읽는 것**이다 — `part.axes`에 파트
 * 자신의 cva 축이 아닌 이름이 들어올 수 있고(`SliderTrack.orientation`), 그만큼 파트의
 * 셀 수가 는다. 값과 기본값은 root의 것 그대로이므로 root와 파트가 같은 축을 가지면
 * 같은 값으로 읽는다.
 *
 * 루트 쪽은 필드가 늘지 않는다. 축을 되읽는 수식자는 `unresolved`로 뜨는 대신 그 셀의
 * `properties`에 접히거나(값이 같을 때) 사라진다(다를 때) — `configurations`가 아니다.
 * 셀이 이미 고른 것이라 고를 것이 남아 있지 않고, Figma 쪽에서도 component property가
 * 아니라 이미 존재하는 variant 축이다. */
/** 9: 무리 안 위치를 그리는 수식자가 제4의 등급 `elsewhere:`로 판정돼 문서 단위
 * `elsewhere`로 나간다(#180).
 *
 * 소비처가 새로 해야 하는 일은 **침묵과 구분하는 것**이다. `elsewhere`에 적힌 속성은
 * 그 컴포넌트의 셀 어디에도 없지만 **누락이 아니다** — Figma에 실재하되 개별 컴포넌트
 * 자산이 아니라 `declaredOn`이 지목한 자산을 **조립한 그룹**에 그려진다. 붙은 Toggle
 * Group의 바깥 모서리가 그것이다. `externalSurfaces`와 같은 자리에 앉는 같은 종류의
 * 필드이고(둘 다 "셀에 없는 이유"를 적는다), 다른 것은 이유다 — 그쪽은 소유자가
 * 다르고 이쪽은 그려지는 자리가 다르다.
 *
 * `externalSurfaces`와 달리 **파생값이다.** 이유의 정본은 `MODIFIER_POLICY`의
 * `elsewhere:` 값이고 자리는 조립이 실측하므로, 손으로 적을 것이 없고 낡을 자리도 없다
 * (ADR-0009가 `carriedBy`에서, ADR-0011이 `inheritedAxes`에서 택한 것과 같은 판단).
 *
 * 해시의 입력이 **아니다** — `externalSurfaces`·`drawnBy`·`reference`와 같다. 이 필드가
 * 말하는 것은 이 컴포넌트의 Figma 자산이 무엇을 그리는가가 아니라 무엇을 **그리지
 * 않는가**라, 자산을 만드는 입력이 아니다. 이 세대에 해시가 움직이는 것은 90건이
 * `properties`에서 빠지기 때문이고 그 폭은 세 컴포넌트다. */
export const SCHEMA_VERSION = 9
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
    const parts = Object.fromEntries(Object.entries(c.parts ?? {}).map(([name, part]) => {
      const inherited = inheritedAxesOf(c, part)
      return [name, { contract: part, inherited, cells: partCellsOf(part, inherited) }]
    }))
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
    const elsewhere = elsewhereCollector()
    const assembledParts = Object.fromEntries(Object.entries(parts).map(([name, part]) => [
      name,
      {
        // 물려받은 축도 파트의 축이다 — 셀이 그 값을 고정하므로 파생 채널이 그것으로 전개한다(#179)
        axes: {
          ...Object.fromEntries(Object.entries(part.contract.config.variants).map(([a, v]) => [a, Object.keys(v)])),
          ...Object.fromEntries(Object.entries(part.inherited).map(([a, i]) => [a, i.values])),
        },
        defaults: {
          ...part.contract.config.defaultVariants,
          ...Object.fromEntries(Object.entries(part.inherited).map(([a, i]) => [a, i.default])),
        },
        // 구성 상태는 컴포넌트가 선언하고 파트가 그린다 — tabs의 `selected`를 `TabsTrigger`가
        // 그리는 것이 그 예다. 그래서 파트 셀도 같은 이름표를 받는다
        cells: part.cells.map(({ props, className }) => assembleCell({ props, className, tree, theme, drawnBy: component.drawnBy, elsewhere: elsewhere.on(name) })),
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
      cells: cells.map(({ props, className }) => assembleCell({ props, className, tree, theme, drawnBy: component.drawnBy, elsewhere: elsewhere.on(component.name) })),
    }
    // 셀을 다 조립한 뒤에야 수집이 끝난다 — 파트가 먼저 돌지만 루트 셀도 얹는다
    const drawnElsewhere = elsewhere.value()
    if (drawnElsewhere) doc.elsewhere = drawnElsewhere
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

/**
 * 한 컴포넌트가 **다른 자리에** 그리는 것을 모은다(#180).
 *
 * `on(자산)`이 그 자산의 셀에 넘길 수집기를 낸다 — 자산 이름은 파트 이름이거나 루트
 * 셀이면 컴포넌트 이름이고, 문서가 `parts`를 키로 쓰는 방식 그대로다.
 *
 * 담는 것은 **속성 이름뿐이고 값이 아니다.** 이 필드는 조립된 그룹의 명세가 아니라
 * *"이 자산의 셀에서 이것을 찾지 마라"*는 부인이다 — 우리는 그 그룹을 자산으로 발행하지
 * 않으므로 값을 적으면 아무도 지키지 않는 명세가 하나 생기고, 셀마다 다를 수 있는 값을
 * 문서 단위로 접으면서 조용히 하나만 남긴다. 값이 필요하면 소스 클래스가 정본이다.
 *
 * 반대로 **속성 이름은 빠짐없이** 담는다 — 여기 오는 속성 집합은 이 등급이 없었다면
 * `unresolved`로 떴을 것과 정확히 같다. 그 항등이 무리가 통째로 조용해지지 않았음을 보인다.
 */
function elsewhereCollector() {
  const out = new Map()
  return {
    on: (asset) => (modifier, reason, prop) => {
      const entry = out.get(modifier) ?? { reason, declaredOn: new Map() }
      out.set(modifier, entry)
      const props = entry.declaredOn.get(asset) ?? new Set()
      entry.declaredOn.set(asset, props)
      props.add(prop)
    },
    value: () => (out.size === 0 ? null : Object.fromEntries([...out].map(([modifier, e]) => [modifier, {
      reason: e.reason,
      declaredOn: Object.fromEntries([...e.declaredOn].map(([asset, props]) => [asset, [...props].sort()])),
    }]))),
  }
}
