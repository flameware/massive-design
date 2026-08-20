/**
 * tokens/** → dist/tokens.d.ts
 *
 * **타입 선언만 낸다.** semantic의 *값*은 내보내지 않는다 — 모드 의존이라
 * 런타임 CSS만이 정답을 안다(build-pipeline.md §4.2).
 *
 * ⚠️ `declare const`는 짝이 되는 .js가 없다. 짚고 넘어갈 것: 이 파일은 타입과
 * 이름 목록을 주는 용도이고, 값을 런타임에 import하려면 별도 출력물이 필요하다.
 * 지금은 소비처가 CSS 변수를 읽으므로 그럴 자리가 없다.
 */
import { flatten } from '../resolve.mjs'

const union = (names) => names.map((n) => `  | '${n}'`).join('\n')

export function emitTypes({ gen, literal, scale, semantic }) {
  const semanticNames = [...flatten(semantic).keys()].map((p) => p.replace(/^color\./, ''))
  const paletteNames = [...flatten(gen).keys(), ...flatten(literal).keys()]
    .map((p) => p.replace(/^palette\./, ''))
  const scaleNames = [...flatten(scale).keys()]

  const cssVar = semanticNames
    .map((n) => `  '${n}': '--ds-${n.replace(/\./g, '-')}'`)
    .join('\n')

  return `// ⚙ 생성물 — scripts/build.mjs. 손대지 말 것.

/** semantic 색 토큰 ${semanticNames.length}개. 값은 모드 의존이라 타입으로 내보내지 않는다. */
export type SemanticColorToken =
${union(semanticNames)}

/** palette ${paletteNames.length}개 — 램프 96 + 리터럴 ${paletteNames.length - 96}. 모드가 이름에 있어 모호하지 않다. */
export type PaletteToken =
${union(paletteNames)}

/** 비색상 스케일 ${scaleNames.length}개. */
export type ScaleToken =
${union(scaleNames)}

/** semantic 토큰 이름 → CSS 변수명. */
export declare const cssVar: {
${cssVar}
}

/** palette 토큰 이름 → sRGB hex. */
export declare const palette: Record<PaletteToken, string>
`
}
