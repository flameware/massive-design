/* 매니페스트가 집은 **semantic 토큰의 계열**이 그 값이 놓인 CSS 속성과 맞는지
 * 본다(#37). `color: --ds-bg-accent-solid`처럼 **배경용 이름을 글자색에 쓴 자리**를
 * 잡는 게이트다.
 *
 * 왜 여기여야 하는가 — packages/tokens의 `tokens:contrast`는 **semantic 조합표**를
 * 검사한다. 조합표에는 `fg.link on bg.canvas`가 이미 있고 5.68로 통과한다. 그런데
 * 컴포넌트가 `fg.link`가 아니라 `bg.accent.solid`를 집으면 그 조합은 표에 아예
 * 나타나지 않아 게이트가 침묵한다. **어떤 컴포넌트가 어떤 토큰을 집는지**는
 * 매니페스트(#23)가 처음으로 기계가 읽게 적어 준 정보라, 이 검사는 여기서만 된다.
 *
 * ⚠️ 이것은 대비 검사가 아니라 **계열 검사**다. 이름이 맞는데 대비가 안 나오는
 * 조합(`fg.muted` on `bg.neutral.solid` 같은)은 못 잡는다. 셀마다 실제 CR을 재는
 * 노선은 매니페스트에 `color`와 `background-color`가 둘 다 있어서 가능하지만,
 * `ghost`·`link`처럼 자기 배경이 없는 칸을 **어느 면 위에서 잴지**를 정해야 하고
 * 그건 #33이 6조합 → 40조합으로 겪은 결정을 컴포넌트 쪽에서 되풀이하는 일이다.
 * 지금은 열지 않는다(#37 Q4).
 *
 * ⚠️ 두 번째 침묵: `ghost`·`outline`은 `color` 항목 **자체가 없다** — #36이 되살린
 * `body` 규칙의 `--foreground`를 상속하기 때문이다. 상속은 클래스에 안 나타나므로
 * 매니페스트에 없고, 따라서 이 규칙이 볼 것도 없다. 없는 것은 통과가 아니라 침묵이다.
 */

/** CSS 속성 → 그 자리에 와야 하는 `--ds-<계열>-`. */
export const PROPERTY_FAMILY = new Map([
  ["color", "fg"],
  ["background-color", "bg"],
  ["border-color", "border"],
])

const FAMILY_LABEL = { fg: "전경", bg: "배경", border: "테두리" }

/** `--ds-bg-accent-solid` → `bg`. `--ds-*`가 아니면 null(스케일 토큰은 대상 밖). */
function familyOf(token) {
  const m = /^--ds-([a-z]+)-/.exec(token)
  return m ? m[1] : null
}

function check(prop, token, where, errors) {
  const want = PROPERTY_FAMILY.get(prop)
  if (!want) return
  const got = familyOf(token)
  if (got === null || got === want) return
  errors.push(
    `${where} — ${prop}에 ${token}이 왔다: ${FAMILY_LABEL[want]}용 --ds-${want}-* 여야 한다`
  )
}

/**
 * 매니페스트 문서 하나를 검사한다. 순수 함수라 node --test가 그대로 검사한다.
 * @returns {string[]} 위반 메시지. 빈 배열이면 통과다
 */
export function lintManifest(doc) {
  const errors = []
  const name = doc.component

  for (const [prop, entry] of Object.entries(doc.base ?? {})) {
    if (entry?.tier === "token" && entry.token) check(prop, entry.token, `${name} base`, errors)
  }

  for (const cell of doc.cells ?? []) {
    const where = `${name} ${cell.variant}/${cell.size}`
    for (const [prop, entry] of Object.entries(cell.properties ?? {})) {
      if (entry?.tier === "token" && entry.token) check(prop, entry.token, where, errors)
    }
    // state.base는 layer가 얹히는 **면**이라 background-color와 같은 자리다.
    // state.layer는 --ds-state-layer라 계열이 다르고 검사 대상이 아니다
    if (cell.state?.base) check("background-color", cell.state.base, `${where} state.base`, errors)
  }

  return errors
}

/* ── 번역표 ② 커버리지 ────────────────────────────────────────────────────── */

/**
 * 매니페스트가 가리키는 모든 `token`/`scale`이 번역표 ②에 있는지 본다(#41).
 *
 * 없으면 주입 에이전트가 **조용히** 리터럴로 떨어뜨린다 — 바인딩이 안 걸린 값은
 * Figma에서 정상으로 보이고 모드 전환에서만 죽는다. 계열 검사(위)와 같은 종류의
 * 침묵이라 게이트가 아니면 안 보인다.
 *
 * 소비 규칙이 곧 검사 규칙이다: **셀에 `scale`이 있으면 그걸로, 없으면 `token`으로.**
 * 검사하는 키가 소비하는 키와 다르면 통과하는 게이트가 아니라 두 번째 규약이 된다.
 *
 * @param {object} doc 매니페스트 문서 하나
 * @param {object} varMap `@massive/tokens`의 `dist/figma/var-map.gen.json`
 * @returns {string[]} 위반 메시지
 */
export function lintVarMapCoverage(doc, varMap) {
  const errors = []
  const name = doc.component
  const seen = new Set()

  const need = (entry, where) => {
    if (entry?.tier !== "token") return
    const key = entry.scale ?? entry.token
    if (!key || key in varMap || seen.has(key)) return
    seen.add(key)   // 48칸이 같은 토큰을 집는다. 한 번만 말한다
    errors.push(`${where} — ${key}가 번역표 ②(var-map.gen.json)에 없다`)
  }

  for (const [prop, entry] of Object.entries(doc.base ?? {})) need(entry, `${name} base/${prop}`)

  for (const cell of doc.cells ?? []) {
    const where = `${name} ${cell.variant}/${cell.size}`
    for (const [prop, entry] of Object.entries(cell.properties ?? {})) need(entry, `${where}/${prop}`)
    for (const [role, slot] of Object.entries(cell.slots ?? {})) {
      for (const [prop, entry] of Object.entries(slot)) need(entry, `${where} ${role}/${prop}`)
    }
    // state.base·state.layer는 tier 봉투가 없는 맨 토큰 이름이다
    for (const role of ["base", "layer"]) {
      need({ tier: "token", token: cell.state?.[role] }, `${where} state.${role}`)
    }
  }

  return errors
}
