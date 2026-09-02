/* 선언 하나를 3단(token/literal/unresolved) 중 하나로 판정한다(#22 §3).
 *
 * **불변식: 셀에서 안 보이는 선언에는 네 등급이 있고, 서로 겹치지 않는다(#180).**
 * `unresolved`가 "아직 못 다룬 것"만 가리키려면 나머지 셋이 자기 몫을 가져가야 한다 —
 * 한 등급이 남의 몫까지 삼키면 신호가 무엇을 가리키는지 알 수 없게 되고, 다음 세대가
 * 진짜 공백을 발견하지 못한다.
 *
 *   ① `unresolved`      아직 못 다뤘다        — 셀에 뜬다. 목록에 없는 속성·수식자·클래스가 여기로 온다
 *   ② `ignore:`         영영 거기 없다        — Figma에 대응물이 **아예 없는** 축만 적힌다
 *   ③ `externalSurfaces` 우리 것이 아니다      — 서드파티가 노드를 소유한다. 소유자가 다르다(#122)
 *   ④ `elsewhere:`      여기가 아니라 저기다   — 그려지지만 이 자산이 아닌 **다른 자리**에 그려진다(#180)
 *
 * ②와 ④를 가르는 것은 **그려지는가**다. ③과 ④를 가르는 것은 **소유자냐 자리냐**이고,
 * 둘 다 매니페스트에 문서 단위 필드로 나가 파생 채널이 침묵과 구분한다.
 *
 * ②는 **표 셋**에 나뉘어 산다 — 속성(`IGNORED_PROPERTIES`) · 수식자(`MODIFIER_POLICY`의
 * `ignore:`) · 클래스(`IGNORED_CLASSES`). 등급이 셋인 것이 아니라 판정이 걸리는 자리가
 * 셋이고, 셋 다 값이 이유다(#181).
 *
 * 정책 조회는 **문자열이 아니라 뜻**에 걸린다(#178). 같은 뜻이 여러 형태로 도달하므로
 * (`data-[disabled]` · `aria-disabled` · `peer-disabled` · `has-[:disabled]`), 조회는
 * 수식자를 축약해 뜻을 남긴 뒤 정책표를 본다. 형태를 나열해 표를 늘리면 다음 변종이
 * 하나 더 생길 때 또 뚫린다 — 그래서 표에는 뜻만 오고 형태는 축약이 감당한다.
 *
 * **수식자가 여럿이면 사슬은 경로다(#182).** 이 표는 항 하나의 뜻을 주고, 항들이 만났을 때의
 * 합성은 `assemble.mjs`의 `resolveChain`이 한다 — 표를 복합 키로 늘리지 않는 이유는 위와
 * 같다: `A:B`를 적으면 `B:A`도 `A:C:B`도 적어야 하고, 표가 조합만큼 커진다.
 *
 * 합성의 규칙은 셋이고 순서가 곧 우선순위다.
 *
 *   1. **떨어뜨리는 항이 이긴다.** 선언은 모든 항이 참일 때만 그려지므로, 한 항이 거짓 축이거나
 *      `ignore:`·`elsewhere:`면 나머지를 몰라도 결론이 난다. 모르는 항이 섞였다고 `unresolved`로
 *      올리면 **아는 사실을 ①의 신호에 잡음으로 붓는다.**
 *   2. **모르는 항이 하나라도 있으면 전체가 ①이다.** 아는 쪽만 적용하면 반쪽만 그린 채 통과한다 —
 *      switch의 `[&_[data-slot=switch-thumb]]:data-[state=checked]`에서 상태만 읽으면 매니페스트가
 *      *루트가* 움직인다고 말하는데 실제로 움직이는 것은 thumb이다.
 *   3. **남으면 주어 × 구성 상태가 앉는 자리를 정한다.** 항은 그 자리의 주어에 걸리고 주어를 옮기는
 *      것은 슬롯 지목뿐이므로, **순서가 뜻을 바꾸는 것은 오직 주어 이동을 통해서다** — CSS가 그것을
 *      증명한다: `[&_svg]:disabled` ≡ `svg:disabled`이고 `disabled:[&_svg]` ≡ `:disabled svg`다.
 *      옮겨진 주어에는 이 자산의 축도 구성 상태도 걸리지 않는다(ADR-0014). */
import { lengthToPx, parseVar, normalizeShadow } from "./theme.mjs"

/** Figma에 대응물이 없는 축. 값이 이유다 — 지울 때 근거를 지운다. */
export const IGNORED_PROPERTIES = new Map([
  ["transition-property", "Figma에 전이 속성이 없다"],
  ["transition-duration", "Figma에 전이 속성이 없다"],
  ["transition-timing-function", "Figma에 전이 속성이 없다"],
  ["transition-behavior", "Figma에 전이 속성이 없다"],
  ["pointer-events", "상호작용 — 그려지지 않는다"],
  ["cursor", "상호작용 — 그려지지 않는다"],
  ["user-select", "상호작용 — 그려지지 않는다"],
  ["white-space", "Figma 텍스트는 줄바꿈을 오토레이아웃으로 표현한다"],
  ["flex-shrink", "Figma 오토레이아웃의 resizing 이지 컴포넌트 속성이 아니다"],
  ["outline-color", "포커스 링 — 상태 견본에서 별도 표현한다. base 계층이 이 속성을 낸다(#36)"],
  ["outline-style", "포커스 링 — 상태 견본에서 별도 표현한다"],
  ["outline-offset", "포커스 링 — 상태 견본에서 별도 표현한다"],
  ["text-underline-offset", "Figma에 밑줄 오프셋이 없다"],
  ["box-shadow", "shadow-* 유틸리티 자체를 Effect Style로 옮긴다 — 합성된 box-shadow는 읽지 않는다"],
])

/** CSS를 내지 않는 **표식 클래스**. 값이 이유다 — 위 표와 같은 규약(#181).
 *
 * 이 표가 셋째 축인 이유는 이것이 **속성도 수식자도 아니기** 때문이다. Tailwind의
 * `group/<이름>`은 자손 수식자(`group-data-[x]`)가 조상을 지목할 때 쓰는 이름표라 규칙을
 * 하나도 내지 않고, 그래서 `policyFor`에 닿기도 전에 *"컴파일 출력에 이 클래스의 규칙이
 * 없다"*로 `unresolved`가 됐다. 정확한 뜻은 ②다 — 이름표는 **영영 Figma에 없다.**
 *
 * 형태(`group\/.+`)가 아니라 **이름 넷**을 적는다. 정규식으로 삼키면 다른 뜻의 `group/*`가
 * 와도 조용해진다 — 표에는 뜻이 오지 형태가 오지 않는다(#178). */
export const IGNORED_CLASSES = new Map([
  ["group/field", "Tailwind group 이름표 — 규칙을 내지 않는다. 자손 수식자가 조상을 지목하는 배선이라 Figma에 대응물이 없다"],
  ["group/item", "Tailwind group 이름표 — 규칙을 내지 않는다. 자손 수식자가 조상을 지목하는 배선이라 Figma에 대응물이 없다"],
  ["group/menu-item", "Tailwind group 이름표 — 규칙을 내지 않는다. 자손 수식자가 조상을 지목하는 배선이라 Figma에 대응물이 없다"],
  ["group/menu-sub-item", "Tailwind group 이름표 — 규칙을 내지 않는다. 자손 수식자가 조상을 지목하는 배선이라 Figma에 대응물이 없다"],
])

/** 수식자별 처리. 여기 없는 수식자는 unresolved로 뜬다.
 *
 * 이 표는 **전역**이다 — 컴포넌트를 가리지 않는 뜻만 온다. 한 컴포넌트의 구성 상태를
 * 그리는 수식자(`data-[state=on]` ↔ `pressed`)는 여기 오지 않는다: 뜻이 컴포넌트마다
 * 다르고, 여기 쌓으면 51개 컴포넌트의 DOM 사실이 계약 밖에 모여 새 컴포넌트의 누락을
 * 아무 게이트도 못 본다. 그쪽 이름표는 계약의 `drawnBy`가 지고 조립이 조회한다(#148). */
export const MODIFIER_POLICY = new Map([
  ["disabled", "state"],
  ["has-[>svg]", "slot-icon"],
  ["[&_svg]", "slot-icon"],
  ["[&_svg:not([class*='size-'])]", "slot-icon"],
  ["focus-visible", "ignore:포커스 링 — 컴포넌트 축이 아니라 Figma 상태 견본으로 표현한다(#43)"],
  ["aria-invalid", "ignore:검증 상태 — Figma에 대응물이 없다(#22 §5)"],
  ["hover", "ignore:상태 사다리 밖의 hover — link의 밑줄이 여기 걸린다(#24가 상태 축을 정하면 다뤄진다)"],
  // dismiss 제스처의 시각 피드백(#110). `unresolved`("아직 못 다뤘다")가 아니라 ignore다 —
  // 손가락을 따라오는 트랜스폼은 **동작**이고 파생 채널이 나르는 것은 anatomy와 구성 상태뿐이라,
  // 나중에 Figma가 다룰 것이 아니라 영영 거기 없다. 검증은 사람이 터치에서 한다
  ["data-[swipe=move]", "ignore:제스처 피드백 — 동작이라 Figma 채널에 실리지 않는다(#110)"],
  ["data-[swipe=cancel]", "ignore:제스처 피드백 — 동작이라 Figma 채널에 실리지 않는다(#110)"],
  ["data-[swipe=end]", "ignore:제스처 피드백 — 동작이라 Figma 채널에 실리지 않는다(#110)"],
  // Resizable 핸들의 포인터 히트 영역(#124). 1px 선 위에 투명한 의사 요소를 얹어 잡기 쉽게 만든 것이라
  // 그릴 것이 없다 — unresolved로 두면 "아직 못 다뤘다"가 되지만, 이건 영영 Figma에 없다
  ["after", "ignore:포인터 히트 영역 — 투명한 의사 요소라 Figma에 그릴 것이 없다(#124)"],
  // 포커스가 자손에 있을 때 컨테이너가 그리는 링(#178). `focus-visible`과 **같은 그림**이지만
  // 다른 의사 클래스라 축약이 접지 않는다 — 축약은 도달 경로만 벗기고 뜻을 바꾸지 않는다
  ["focus-within", "ignore:포커스 링 — 컴포넌트 축이 아니라 Figma 상태 견본으로 표현한다(#43)"],
  /* 무리 안 **위치**(#180). `ignore:`가 아닌 이유는 이것이 **그려지기** 때문이다 — 붙은
   * Toggle Group의 바깥 모서리는 Figma에 실재하고, 다만 개별 항목 자산이 아니라 **조립된
   * 그룹**에 있다. 여기에 `ignore:`("영영 거기 없다")를 쓰면 이 맵이 고치려던 병을 `ignore:`로
   * 옮겨 다음 세대가 `ignore:`를 못 믿게 된다.
   *
   * 이유가 **저기가 어디인지**를 지목해야 한다는 것이 이 등급의 규약이다(ADR-0012).
   * 여기 적힌 뜻은 전역이지만 *어느* 조립인지는 컴포넌트마다 다르므로, 조립이 그 자리를
   * 매니페스트의 `elsewhere.<수식자>.declaredOn`으로 파생해 적는다 — 손으로 복사하지 않는다.
   *
   * 네 키인 이유는 **뜻이 넷**이기 때문이다. "나는 첫째다"와 "나는 첫째가 아니다"는 반대
   * 뜻이고, 형태가 아니라 뜻이 표에 온다(#178) — 컨테이너가 자식을 고르는 형태
   * (`[&>*:not(:first-child)]`)는 축약이 `not(:first-child)`로 벗겨 여기 도달한다.
   *
   * ⚠️ `last-child`는 여기 없다 — 자손 지목을 거쳐 도착하는 것은 **뜻이 다르다**. #181이
   * 둘을 갈라 닫았다: `[&_tr:last-child]`는 아래에 자기 이유로 서고, `[&>span:last-child]`는
   * 슬롯 지목이라 전역 표가 아니라 **계약이 이름표를 진다**(ADR-0013). */
  ["first", "elsewhere:무리 안 위치(첫 항목) — 이 자산이 아니라 조립된 그룹이 그린다"],
  ["last", "elsewhere:무리 안 위치(끝 항목) — 이 자산이 아니라 조립된 그룹이 그린다"],
  ["not(:first-child)", "elsewhere:무리 안 위치(첫 항목이 아닌 것) — 이 자산이 아니라 조립된 그룹이 그린다"],
  ["not(:last-child)", "elsewhere:무리 안 위치(끝 항목이 아닌 것) — 이 자산이 아니라 조립된 그룹이 그린다"],
  /* 등록된 파트를 자손으로 지목하는 것(#181). `elsewhere:`이고 지목하는 "저기"가 **파트**다 —
   * `TableRow`의 셀이 `border-b`를 실제로 그리므로 참인 지목이고, `TableHeader`의 이 선언은
   * 같은 그림을 조상에서 한 번 더 말한 것이다.
   *
   * 두 키가 갈리는 이유는 **저기가 서로 다른 자리**이기 때문이다. 끝 행에 테두리가 없다는
   * 사실은 `TableRow`의 셀에 없다 — 그 셀은 언제나 `border-b`다. `TableRow`를 지목하면
   * 거짓 지목이 되고 ADR-0012의 규약이 그것을 금하므로, 이쪽은 위 네 키와 같은 **무리 안
   * 위치**로 간다: 그 사실이 사는 곳은 조립된 표다. 축약이 `last`로 접지 못하는 것은
   * 도달 경로가 자손 지목이라서이지 뜻이 달라서가 아니다. */
  ["[&_tr]", "elsewhere:행의 테두리 — 이 자산이 아니라 TableRow 파트가 그린다"],
  ["[&_tr:last-child]", "elsewhere:무리 안 위치(끝 행) — 이 자산이 아니라 조립된 표가 그린다"],
  /* 소비처가 넣는 내용을 틀에 맞추는 배관(#181). 셋 다 anatomy에도 `parts`에도 없는 노드를
   * 가리키므로 담을 슬롯이 없고, 담으려면 역할 어휘를 늘려야 하는데 그것은 **계약을 여는**
   * 방향이라 이 맵의 destination과 반대다. 이유는 셋이 다르므로 셋을 따로 적는다. */
  ["[&_img]", "ignore:그림을 틀에 맞추는 HTML 배관 — Figma는 자식 노드가 아니라 틀 자신의 clip과 image fill로 같은 일을 하고, 그 틀은 이 셀이 이미 해결된 속성으로 담고 있다"],
  ["[&_a]", "ignore:자손 링크의 밑줄 — 노드가 아니라 소비처가 문장 안에 넣는 텍스트 범위의 장식이다(`text-underline-offset`이 이미 같은 이유로 걸러진다)"],
  ["[&_*]", "ignore:포커스 링을 형제 위로 올리는 쌓임 맥락 — 얹히는 z-10 둘이 focus-visible·focus-within으로 이미 무시되므로 남은 position이 그리는 것이 없다. 모든 자식을 가리켜 이름 붙일 슬롯도 없다"],
  /* 폭에 걸린 것(#181). **그려지기는 한다** — 넓은 뷰포트에서. 그런데 `elsewhere:`는 그려지는
   * 자리가 **다른 자산**일 때 쓰는 등급이고 그 규약은 저기가 어디인지를 지목하는 것인데,
   * 뷰포트는 자산 그래프의 자리가 아니다. Figma 컴포넌트 자산은 뷰포트도 컨테이너 폭도 갖지
   * 않으므로 ②가 맞다. 형태(`sm`·`md`·`@md/field-group`)는 축약이 벗기고 표에는 뜻 둘이 온다. */
  ["viewport", "ignore:뷰포트 폭에 걸린 것 — Figma 컴포넌트 자산은 뷰포트를 갖지 않는다. 그려지되 다른 자산이 아니라 다른 뷰포트에서라 elsewhere:가 아니다"],
  ["container-width", "ignore:컨테이너 폭에 걸린 것 — Figma 컴포넌트 자산은 자기가 놓일 컨테이너를 갖지 않는다. 뷰포트와 같은 이유로 elsewhere:가 아니다"],
])

/** 수식자를 한 단계씩 축약한다. 첫 번째로 걸린 규칙만 적용하고, `null`이면 더 줄 것이 없다.
 *
 * 규칙은 **도달 경로**와 **표기**만 벗긴다 — 뜻은 절대 바꾸지 않는다. `peer-disabled`는
 * 형제가, `group-data-[disabled=true]`는 조상이, `has-[:disabled]`는 자손이 disabled라는
 * 뜻이지만 **그려지는 것은 언제나 이 요소**이고 그림은 셋 다 같다. 도달 경로는 DOM 배선
 * 사실이지 파생 채널이 나르는 것이 아니다.
 *
 * `focus-within`을 `focus-visible`로 접지 않는 이유가 이 선의 반대쪽이다 — 그림이 같아도
 * 서로 다른 의사 클래스이므로 **정책표가 각각 이유를 지고**, 축약은 관여하지 않는다. */
const REDUCTIONS = [
  // has-[SEL] — 자손이 그 상태다
  [/^has-\[(.+)\]$/, (m) => m[1]],
  // group-* 는 조상이, peer-* 는 형제가 그 상태다
  [/^(?:group|peer)-(.+)$/, (m) => m[1]],
  // 임의 변형 [&...] — & 를 걷어내고 안쪽 선택자를 줄인다
  [/^\[&(.+)\]$/, (m) => reduceSelector(m[1])],
  // :disabled 같은 의사 클래스는 이름이 곧 변형 이름이다
  [/^:([\w-]+)$/, (m) => m[1]],
  // [aria-invalid=true] 같은 속성 선택자 → 같은 뜻의 변형 이름
  [/^\[([\w-]+)=["']?true["']?\]$/, (m) => m[1]],
  // data-[x] · data-[x=true] 는 "x가 참"이라는 뜻이다. 값이 true가 **아닌** 것
  // (`data-[swipe=move]` · `data-[orientation=vertical]`)은 값이 뜻을 가르므로 접지 않는다
  [/^data-\[([\w-]+)(?:=["']?true["']?)?\]$/, (m) => m[1]],
  // aria-disabled 는 disabled 와 같은 그림이다 — 접근성 속성으로 도달했을 뿐이다
  [/^aria-([\w-]+)$/, (m) => m[1]],
  // sm · md · lg … 는 뷰포트 폭, @md/<컨테이너> 는 컨테이너 폭이다. 뜻은 각각 하나이고
  // 형태만 여럿이라 여기서 벗긴다. Tailwind 기본 breakpoint 이름만 접는다 —
  // 프로젝트가 자기 이름을 정의하면 unresolved로 떠서 알려 준다(안전한 실패)
  [/^(?:sm|md|lg|xl|2xl)$/, () => "viewport"],
  [/^@[\w-]+(?:\/[\w-]+)?$/, () => "container-width"],
]

/** 임의 변형 안쪽 선택자(`&` 를 뗀 나머지)를 줄인다.
 *
 * 상태부(의사 클래스)가 있으면 그것이 뜻이다 — `>a:hover`가 그리는 것은 hover다.
 * 없으면 요소를 가리키는 슬롯이고, 자식 결합자와 자손 결합자는 **같은 슬롯**을 가리키므로
 * (`[&>svg]` ≡ `[&_svg]`) 자손 형태로 모은다. */
function reduceSelector(rest) {
  const state = /^[>_]\s*[\w*-]+:(.+)$/.exec(rest)
  if (state) return state[1]
  const child = /^>\s*(.+)$/.exec(rest)
  return child ? `[&_${child[1]}]` : null
}

/**
 * 수식자 하나의 정책을 찾는다. 축약해 가며 **먼저 걸린 뜻**이 이긴다.
 *
 * 원형을 먼저 보는 것이 중요하다 — `aria-invalid`는 그 자체로 표에 있고, 접어 버리면
 * `invalid`가 되어 다른 것을 가리킨다. 못 찾으면 `undefined`이고 호출자가 unresolved로
 * 띄운다: **축약은 표에 이미 있는 뜻으로만 접고, 없는 뜻을 만들어 내지 않는다.**
 *
 * 그래서 표의 키는 **상태의 뜻**이어야 한다. 의사 요소와 이름이 겹치는 키(`placeholder`)를
 * 넣으면 `data-[placeholder=true]`(combobox)와 `::placeholder`(input)가 한 뜻으로 접힌다 —
 * 서로 다른 것이므로 그런 이름은 이 표에 오지 않는다.
 *
 * @returns {string|undefined}
 */
export function policyFor(modifier) {
  let cur = modifier
  for (let step = 0; step < REDUCTIONS.length + 1; step++) {
    const hit = MODIFIER_POLICY.get(cur)
    if (hit !== undefined) return hit
    const rule = REDUCTIONS.find(([re]) => re.test(cur))
    if (!rule) return undefined
    const next = rule[1](rule[0].exec(cur))
    if (next === null || next === cur) return undefined
    cur = next
  }
  return undefined
}

const SPACE_PROPERTIES = new Set([
  "width", "height", "min-width", "min-height", "max-width", "max-height",
  "gap", "column-gap", "row-gap",
  "padding", "padding-inline", "padding-block",
  "padding-top", "padding-right", "padding-bottom", "padding-left",
])

function scaleGroupFor(prop) {
  if (SPACE_PROPERTIES.has(prop)) return "space"
  if (prop === "border-radius" || prop.endsWith("-radius")) return "radius"
  if (prop === "font-size") return "fontSize"
  if (prop === "border-width" || (prop.startsWith("border-") && prop.endsWith("-width"))) return "borderWidth"
  return null
}

/** 변수 사슬을 --ds-* 까지 탄다. tokens.css의 :root가 사슬의 원본이다. */
export function resolveVarChain(theme, name, seen = new Set()) {
  if (seen.has(name)) return { kind: "cycle", name }
  seen.add(name)
  if (name.startsWith("--ds-palette-")) return { kind: "primitive", name }
  if (name.startsWith("--ds-")) return { kind: "token", token: name }
  const next = theme.aliases.get(name) ?? theme.themeVars.get(name)
  if (next === undefined) return { kind: "unknown", name }
  const v = parseVar(next)
  if (v) return resolveVarChain(theme, v.name, seen)
  return { kind: "literal", value: next, via: name }
}

/**
 * @returns {{prop: string, entry: object}|null} null이면 무시 화이트리스트에 걸린 것
 */
export function classifyDeclaration(theme, prop, value, from) {
  if (prop.startsWith("--tw-")) return null
  if (IGNORED_PROPERTIES.has(prop)) return null

  const entry = classifyValue(theme, prop, value)
  return entry ? { prop, entry: { ...entry, from } } : null
}

function classifyValue(theme, prop, value) {
  const v = parseVar(value)
  if (v) {
    if (v.name.startsWith("--tw-")) {
      // Tailwind 내부 변수. 폴백에 진짜 값이 있으면 그것이 쉬는 상태의 값이다
      return v.fallback ? classifyValue(theme, prop, v.fallback) : null
    }
    const chain = resolveVarChain(theme, v.name)
    if (chain.kind === "token") return { tier: "token", token: chain.token }
    if (chain.kind === "primitive") {
      return { tier: "unresolved", value, why: `primitive를 직접 집었다: ${chain.name}` }
    }
    if (chain.kind === "literal") return withScale(theme, prop, chain.value)
    return { tier: "unresolved", value, why: `변수 ${v.name}의 값을 찾지 못했다` }
  }
  return withScale(theme, prop, value)
}

/** 리터럴 값을 scale.json에서 되짚는다. 되짚히면 token, 아니면 literal. */
function withScale(theme, prop, value) {
  const px = lengthToPx(value)
  const group = scaleGroupFor(prop)
  if (px !== null && group) {
    const hit = theme.scales.lookup(group, px)
    if (hit) {
      const entry = { tier: "token", scale: hit.path, px }
      if (hit.token) entry.token = hit.token
      if (hit.multiple !== undefined) entry.multiple = hit.multiple
      return entry
    }
  }
  if (px !== null) return { tier: "literal", px }
  return { tier: "literal", value }
}

/** shadow-* 는 합성된 box-shadow가 아니라 유틸리티 자체를 Effect Style로 옮긴다. */
export function classifyShadow(theme, rule, from) {
  const decl = rule.find((d) => d.prop === "--tw-shadow")
  if (!decl) return null
  const hit = theme.shadows.get(normalizeShadow(decl.value))
  return hit
    ? { prop: "box-shadow", entry: { tier: "token", token: hit.token, scale: hit.path, from } }
    : { prop: "box-shadow", entry: { tier: "unresolved", value: decl.value, why: "shadow 스케일에 없는 그림자다", from } }
}
