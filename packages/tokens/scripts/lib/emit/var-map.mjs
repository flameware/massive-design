/**
 * tokens/** → dist/figma/var-map.gen.json
 *
 * 번역표 ② — **코드 쪽 이름 → Figma 쪽 이름**(docs/agents/figma-components.md §8).
 * 주입 에이전트가 매니페스트 셀의 `token`/`scale`을 들고 와 Figma 변수를 찾는 표다.
 *
 * 문서에 손으로 적지 않는 이유가 셋이다(§8.1). 그중 둘이 이 파일의 모양을 정한다:
 *
 * - **문자열 규칙으로 복원되지 않는다.** `--ds-fg-on-solid` → `fg/on-solid`에서
 *   첫 대시는 경로 구분자이고 둘째는 이름 내부다. `borderWidth.1` → `border-width/1`
 *   은 camelCase → kebab이고, `--text-sm--line-height` → `type/line-height/sm`은
 *   순서까지 뒤집힌다
 * - ⚠️ **값은 담지 않는다.** `--text-sm--line-height`의 CSS 값은 비율 `1.6`인데
 *   Figma `type/line-height/sm`은 px `22.4`다. 이름만 옮긴다
 *
 * 그래서 이 파일은 **양쪽 이름을 이미 아는 자리에서만** 짝을 만든다. 스케일 쪽
 * 짝은 `figma.mjs`의 `scaleVariables()`가 Figma 이름을 짓는 그 줄에서 같이 나오고
 * (`key` 필드), 색 쪽 짝은 `css.mjs`의 `dsVar()`와 `figmaName()`을 같은 경로에
 * 먹여 만든다. 여기서 이름을 다시 짓는 곳은 **없다** — 있으면 그게 세 번째 사본이다.
 *
 * ## 범위
 *
 * **매니페스트가 합법적으로 가리킬 수 있는 것 전부, 그리고 그것뿐.** primitive 색
 * (`--ds-palette-*`)은 넣지 않는다 — Tailwind `@theme`에 없어서 컴포넌트가 집을 수
 * 없고(#7), 실제로 새면 `@massive/ui`의 check 규칙 1이 먼저 잡는다. 표에 없으므로
 * 커버리지 게이트도 함께 운다.
 *
 * Text Style(05)은 없다. 타이포 role 어휘가 아직 없어 매니페스트가 스타일 이름으로
 * 말하지 않는다 — `font-size`·`line-height`를 변수로 따로 집는다.
 */
import { flatten } from '../resolve.mjs'
import { dsVar } from './css.mjs'
import { figmaName, scaleVariables } from './figma.mjs'

/** `$`로 시작하는 키는 메타다 — tokens/**의 DTCG 규약과 같다. */
const META = {
  $generated: 'scripts/build.mjs — 손대지 말 것. 사양은 docs/agents/figma-components.md §8',
  $consume:
    '셀에 scale이 있으면 그걸로, 없으면 token으로 찾는다. ' +
    'kind가 variable이면 collection 안에서 name으로, effectStyle이면 getLocalEffectStylesAsync에서 name으로.',
}

const variable = (collection, name) => ({ kind: 'variable', collection, name })

/**
 * @returns {object} 코드 쪽 키 → `{kind, collection?, name}`. 삽입 순서는 빌드
 *   순서(스케일 → 그림자 → semantic)라 diff가 원본을 따라 읽힌다.
 */
export function varMap({ scale, semantic }) {
  const out = { ...META }

  // 03이 내는 palette 스케일 변수. `key`가 매니페스트 쪽 이름이다
  for (const { key, name } of scaleVariables(scale)) out[key] = variable('palette', name)

  // 06이 내는 Effect Style. 컬렉션이 없으므로 조회 채널이 다르다 — kind가 그걸 말한다
  for (const name of Object.keys(scale.shadow)) {
    if (name.startsWith('$')) continue
    out[`shadow.${name}`] = { kind: 'effectStyle', name: `shadow/${name}` }
  }

  // 04가 내는 semantic. state/layer도 여기 들어 있다 — #24가 fills[1]에 쓰는 그것이다
  for (const [path] of flatten(semantic)) out[dsVar(path)] = variable('semantic', figmaName(path))

  return out
}

export function emitVarMap(sources) {
  return `${JSON.stringify(varMap(sources), null, 2)}\n`
}
