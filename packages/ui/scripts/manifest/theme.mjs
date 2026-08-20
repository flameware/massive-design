/* 값을 토큰으로 되짚는 표.
 *
 * 컴파일된 CSS는 두 가지 얼굴로 나온다:
 *   - `color: var(--primary)` — @theme inline이 값을 그대로 옮겼고, 그 값이 또 변수다
 *   - `border-radius: 0.5rem` — @theme inline이 리터럴을 박아 넣었다. 변수 이름이 없다
 * 그래서 되짚기가 두 갈래다. 앞은 tokens.css의 :root 별칭 사슬을 타고 --ds-* 까지
 * 내려가고(#22 §3의 예가 그것이다), 뒤는 px 값을 scale.json에서 되찾는다.
 *
 * **`token` 단의 판정 기준이 "Figma에 그 변수가 실재하는가"이므로**(#22 §3) 그
 * 판정의 입력은 scale.json이다 — Figma 변수 목록의 원본이고, 손으로 옮겨 적으면
 * 어긋나도 아무도 못 잡는다. `h-9`(36px)가 literal로 떨어지는 것은 space 프리셋에
 * 9가 없기 때문이지 실패가 아니다. */
const REM = 16

export function loadTheme({ tokensCss, scaleJson, compiledCss }) {
  const scale = JSON.parse(scaleJson)
  return {
    aliases: parseAliases(tokensCss),
    themeVars: parseThemeVars(compiledCss),
    scales: buildScales(scale),
    shadows: parseShadows(tokensCss),
  }
}

/** tokens.css의 :root / @theme 선언 — `--primary: var(--ds-bg-accent-solid)` 사슬. */
function parseAliases(css) {
  const map = new Map()
  for (const m of css.matchAll(/^\s*(--[\w-]+):\s*([^;]+);/gm)) {
    if (!map.has(m[1])) map.set(m[1], m[2].trim())
  }
  return map
}

/** 컴파일 출력의 @layer theme — Tailwind 기본값(--text-sm 등)이 여기 산다. */
function parseThemeVars(css) {
  const map = new Map()
  const at = css.indexOf("@layer theme")
  if (at < 0) return map
  const end = css.indexOf("\n}", css.indexOf("{", css.indexOf("{", at) + 1))
  for (const m of css.slice(at, end < 0 ? undefined : end).matchAll(/(--[\w-]+):\s*([^;]+);/g)) {
    if (!map.has(m[1])) map.set(m[1], m[2].trim())
  }
  return map
}

/** px → 토큰. 그룹마다 CSS 변수 이름 규칙이 다르고, 없는 그룹도 있다. */
function buildScales(scale) {
  const px = (node) => node?.$extensions?.["design.massive.px"]
  const groups = []

  const steps = (obj) => Object.entries(obj).filter(([k, v]) => !k.startsWith("$") && v?.$value !== undefined)

  groups.push({
    name: "space",
    // base(--spacing)는 프리셋이 아니라 배수의 단위다. 코드는 목록 밖 배수도 쓴다
    entries: steps(scale.space)
      .filter(([k]) => k !== "base")
      .map(([k, v]) => ({ step: k, px: px(v), token: "--spacing", multiple: Number(k), path: `space.${k}` })),
  })
  groups.push({
    name: "radius",
    entries: steps(scale.radius)
      .filter(([k]) => k !== "base")
      .map(([k, v]) => ({ step: k, px: px(v), token: `--radius-${k}`, path: `radius.${k}` })),
  })
  groups.push({
    name: "fontSize",
    entries: steps(scale.type.size).map(([k, v]) => ({ step: k, px: px(v), token: `--text-${k}`, path: `type.size.${k}` })),
  })
  groups.push({
    name: "borderWidth",
    // noCss — CSS 변수가 없다. DTCG 경로만이 이름이다(#16)
    entries: steps(scale.borderWidth).map(([k, v]) => ({ step: k, px: px(v), token: null, path: `borderWidth.${k}` })),
  })

  const byName = new Map(groups.map((g) => [g.name, g]))
  return {
    lookup(group, pxValue) {
      return byName.get(group)?.entries.find((e) => e.px === pxValue) ?? null
    },
    lineHeightToken(sizeStep) {
      return `--text-${sizeStep}--line-height`
    },
  }
}

/** shadow는 값이 통째로 문자열이라 px 되짚기가 안 된다. 값 자체로 되짚는다. */
function parseShadows(css) {
  const map = new Map()
  for (const m of css.matchAll(/(--shadow-[\w-]+):\s*([^;]+);/g)) {
    map.set(normalizeShadow(m[2]), { token: m[1], path: `shadow.${m[1].slice("--shadow-".length)}` })
  }
  return map
}

export function normalizeShadow(value) {
  // Tailwind는 색 자리를 var(--tw-shadow-color, <원래 색>)로 감싼다. 벗겨야 원본과 같아진다
  return value.replace(/var\(--tw-shadow-color,\s*([^)]*\))\)/g, "$1").replace(/\s+/g, " ").trim()
}

/** `calc(0.25rem * 6)` · `0.5rem` · `1px` → px 수. 못 읽으면 null. */
export function lengthToPx(value) {
  const v = value.trim()
  let m
  if ((m = /^calc\(\s*([\d.]+)rem\s*\*\s*([\d.]+)\s*\)$/.exec(v))) return Number(m[1]) * REM * Number(m[2])
  if ((m = /^([\d.]+)rem$/.exec(v))) return Number(m[1]) * REM
  if ((m = /^([\d.]+)px$/.exec(v))) return Number(m[1])
  if (v === "0") return 0
  return null
}

/** `var(--x)` · `var(--x, fallback)` 을 판다. */
export function parseVar(value) {
  const m = /^var\(\s*(--[\w-]+)\s*(?:,\s*([\s\S]+))?\)$/.exec(value.trim())
  return m ? { name: m[1], fallback: m[2]?.trim() ?? null } : null
}
