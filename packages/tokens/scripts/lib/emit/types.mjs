/**
 * tokens/** → dist/tokens.d.ts
 *
 * semantic의 *값*은 내보내지 않는다 — 모드 의존이라 런타임 CSS만이 정답을
 * 안다(build-pipeline.md §4.2). 이름과 팔레트 hex는 모드에 의존하지 않으므로 낸다.
 *
 * 짝이 되는 `tokens.js`를 같이 낸다(emitValues). 예전에는 `declare const`만
 * 있고 구현이 없었다 — 게시 전에는 아무도 부르지 않아 드러나지 않았지만,
 * 패키지가 되고 나면 `import { palette }`가 **타입 검사를 통과하고 런타임에서
 * 터지는** 모양이 된다(#278). 선언이 있으면 구현도 있다.
 */
import { flatten } from '../resolve.mjs'

const union = (names) => names.map((n) => `  | '${n}'`).join('\n')

/** 세 emit이 같은 이름 목록에서 나온다 — 목록이 갈리면 선언과 구현이 갈린다. */
function names({ gen, literal, scale, semantic }) {
  return {
    semanticNames: [...flatten(semantic).keys()].map((p) => p.replace(/^color\./, '')),
    paletteEntries: [...flatten(gen), ...flatten(literal)]
      .map(([p, token]) => [p.replace(/^palette\./, ''), token.$value]),
    scaleNames: [...flatten(scale).keys()],
  }
}

/** dist/tokens.js — tokens.d.ts가 선언한 값들의 실제 구현. */
export function emitValues(sources) {
  const { semanticNames, paletteEntries } = names(sources)
  const line = (k, v) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)},`
  return `// ⚙ 생성물 — scripts/build.mjs. 손대지 말 것.

/** semantic 토큰 이름 → CSS 변수명. */
export const cssVar = {
${semanticNames.map((n) => line(n, `--ds-${n.replace(/\./g, '-')}`)).join('\n')}
}

/** palette 토큰 이름 → sRGB hex. 모드가 이름에 있어 모호하지 않다. */
export const palette = {
${paletteEntries.map(([n, v]) => line(n, v)).join('\n')}
}
`
}

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
