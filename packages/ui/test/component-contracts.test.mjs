import assert from "node:assert/strict"
import test from "node:test"

import { publicBarrel, validateContracts } from "../scripts/component-contracts.mjs"

const contract = (name, source = `src/components/ui/${name}.tsx`) => ({
  name, source, publicExports: ["Widget"], anatomy: ["Widget"],
  config: { variants: {}, defaultVariants: {} }, className: () => "", configurationStates: {}, behaviors: {},
  reference: { example: name, guidance: { use: "use", evidence: "evidence", limits: "limits" } },
})

test("source와 계약은 빠짐과 유령 없이 일대일이다", () => {
  assert.throws(() => validateContracts(["a.tsx", "b.tsx"], [contract("a")]), /계약이 없는 컴포넌트 source/)
  assert.throws(() => validateContracts(["a.tsx"], [contract("a"), contract("ghost")]), /존재하지 않는 계약 source/)
})

test("중복 name/source를 거부한다", () => {
  assert.throws(
    () => validateContracts(["a.tsx", "b.tsx"], [contract("same", "src/components/ui/a.tsx"), contract("same", "src/components/ui/b.tsx")]),
    /중복 컴포넌트 이름/
  )
})

test("공개 배럴은 계약의 source와 export에서만 파생된다", () => {
  assert.match(publicBarrel([contract("a")]), /export \{ Widget \} from "\.\/components\/ui\/a\.js"/)
})

test("authored guidance와 대표 예시는 모든 계약에 필요하다", () => {
  const missing = contract("a")
  delete missing.reference
  assert.throws(() => validateContracts(["a.tsx"], [missing]), /reference 계약이 없는 컴포넌트/)

  const empty = contract("a")
  empty.reference.guidance.use = ""
  assert.throws(() => validateContracts(["a.tsx"], [empty]), /authored guidance가 비어 있다/)
})

test("공개 컴포넌트는 anatomy에 있어야 한다", () => {
  // parts 검사는 anatomy → parts 한 방향만 봤다. parts 없는 계약의 빈 anatomy가
  // 43세대를 통과한 침묵을 반대 방향으로 닫는다
  const silent = contract("a")
  silent.publicExports = ["Widget", "WidgetHeader"]
  assert.throws(() => validateContracts(["a.tsx"], [silent]), /anatomy에 없는 공개 컴포넌트: a\.WidgetHeader/)

  const bare = contract("a")
  bare.anatomy = []
  assert.throws(() => validateContracts(["a.tsx"], [bare]), /anatomy에 없는 공개 컴포넌트: a\.Widget/)

  // cva 헬퍼는 소문자로 시작해 컴포넌트가 아니다 — anatomy에 자리를 요구하지 않는다
  const helpers = contract("a")
  helpers.publicExports = ["Widget", "widgetVariants", "widgetVariantsConfig"]
  assert.doesNotThrow(() => validateContracts(["a.tsx"], [helpers]))

  // 선택·반복 표식이 붙어 있어도 같은 이름이다
  const marked = contract("a")
  marked.publicExports = ["Widget", "WidgetItem"]
  marked.anatomy = ["Widget", "WidgetItem*"]
  assert.doesNotThrow(() => validateContracts(["a.tsx"], [marked]))
})

test("외부 소유 표면에는 이유가 붙고, 우리 표면과 겹치지 않는다", () => {
  const noReason = contract("a")
  noReason.externalSurfaces = { "슬라이드 트랙": "" }
  assert.throws(() => validateContracts(["a.tsx"], [noReason]), /외부 소유 표면에는 이유가 필요하다/)

  const overlapping = contract("a")
  overlapping.anatomy = ["Widget", "WidgetTrack"]
  overlapping.externalSurfaces = { WidgetTrack: "라이브러리가 트랜스폼을 소유한다" }
  assert.throws(() => validateContracts(["a.tsx"], [overlapping]), /anatomy·parts와 겹친다/)

  const empty = contract("a")
  empty.externalSurfaces = {}
  assert.throws(() => validateContracts(["a.tsx"], [empty]), /비어 있지 않은 객체/)

  const ok = contract("a")
  ok.anatomy = ["Widget"]
  ok.externalSurfaces = { "슬라이드 트랙": "embla가 트랜스폼과 레이아웃을 소유한다" }
  assert.doesNotThrow(() => validateContracts(["a.tsx"], [ok]))
})

test("dismiss 제스처는 우리 표면 위에서만, 동등 경로와 실재하는 피드백과 함께 선언된다", () => {
  const gesture = (over = {}) => ({
    surface: "Widget", feedback: "data-[swipe=move]", equivalent: "Widget", why: "upstream이 갖고 온다", ...over,
  })
  const withGesture = (over, className = () => "data-[swipe=move]:translate-x-4") => {
    const c = contract("a")
    c.anatomy = ["Widget"]
    c.className = className
    c.gestures = { "swipe-dismiss": gesture(over) }
    return c
  }

  // 제스처가 닫는 표면은 우리 것이어야 한다 — 남의 것이면 externalSurfaces로 간다
  assert.throws(() => validateContracts(["a.tsx"], [withGesture({ surface: "TheirTrack" })]), /닫는 표면이 anatomy에 없다/)

  // 동등 경로는 소비처가 집을 수 있어야 하므로 공개 export여야 한다
  assert.throws(() => validateContracts(["a.tsx"], [withGesture({ equivalent: "Hidden" })]), /동등 경로가 공개 export가 아니다/)

  // 선언만 하고 클래스에 없으면 통과시키지 않는다 — 이 필드가 생긴 이유가 그것이다
  assert.throws(() => validateContracts(["a.tsx"], [withGesture({}, () => "p-4")]), /선언한 시각 피드백이 클래스에 없다/)
  assert.throws(() => validateContracts(["a.tsx"], [withGesture({ feedback: "" })]), /시각 피드백 표식이 필요하다/)
  assert.throws(() => validateContracts(["a.tsx"], [withGesture({ why: "" })]), /제스처에는 이유가 필요하다/)

  const empty = contract("a")
  empty.gestures = {}
  assert.throws(() => validateContracts(["a.tsx"], [empty]), /비어 있지 않은 객체/)

  assert.doesNotThrow(() => validateContracts(["a.tsx"], [withGesture()]))
})

test("파생 채널이 나르지 않는 동작을 계약이 선언한다", () => {
  // 빈 객체라도 적게 하는 것이 이 필수의 값어치다 — 게이트는 upstream이 동작을 갖고
  // 오는지 못 읽으므로, 필드가 없으면 빠뜨림이 침묵으로 통과한다(#149)
  const silent = contract("a")
  delete silent.behaviors
  assert.throws(() => validateContracts(["a.tsx"], [silent]), /behaviors가 없다/)

  const behavior = (over) => ({
    kind: "open-cause", surface: "Widget", origin: "inherited", why: "why", ...over,
  })
  const withBehavior = (over) => {
    const c = contract("a")
    c.behaviors = { hoverOpen: behavior(over) }
    return c
  }

  // 넷째 종류가 오면 열거를 늘린다 — 오타가 새 종류로 통과하지는 않는다
  assert.throws(() => validateContracts(["a.tsx"], [withBehavior({ kind: "dismiss" })]), /종류가 열거 밖이다/)

  // 제스처와 같은 자다 — 우리 이름으로 나가는 동작이므로 표면이 우리 것이어야 한다
  assert.throws(() => validateContracts(["a.tsx"], [withBehavior({ surface: "TheirNode" })]), /표면이 anatomy에 없다/)

  // origin이 확인표를 가른다: inherited면 사람이 upstream 기본값까지 본다
  assert.throws(() => validateContracts(["a.tsx"], [withBehavior({ origin: "upstream" })]), /origin이 필요하다/)

  // control은 선택이다. 없는 것과 적다 만 것은 다르다
  assert.doesNotThrow(() => validateContracts(["a.tsx"], [withBehavior({})]))
  assert.throws(() => validateContracts(["a.tsx"], [withBehavior({ control: "  " })]), /control이 비어 있다/)
  assert.doesNotThrow(() => validateContracts(["a.tsx"], [withBehavior({ control: "openOn" })]))

  assert.throws(() => validateContracts(["a.tsx"], [withBehavior({ why: "" })]), /동작에는 이유가 필요하다/)

  // 빈 객체는 통과한다 — gestures와 다른 점이다. 갖고 오는 것이 없는 것이 사실일 수 있다
  const none = contract("a")
  none.behaviors = {}
  assert.doesNotThrow(() => validateContracts(["a.tsx"], [none]))
})

test("구성 상태는 무엇이 그리는지를 함께 선언한다", () => {
  // 선언과 그림이 이어져 있지 않으면 계약이 이미 선언한 것이 매니페스트에서
  // `unresolved`("아직 못 다뤘다")로 떨어진다(#147·#148)
  const silent = contract("a")
  silent.configurationStates = { pressed: ["unpressed", "pressed"] }
  assert.throws(() => validateContracts(["a.tsx"], [silent]), /구성 상태를 그리는 자리가 선언되지 않았다: a\.pressed/)

  const stale = contract("a")
  stale.drawnBy = { ghost: "없는 구성 상태" }
  assert.throws(() => validateContracts(["a.tsx"], [stale]), /구성 상태가 아닌 것에 drawnBy가 있다: a\.ghost/)
})

test("그리는 자리는 이유 문자열이거나 실제로 붙어 있는 data-* 수식자다", () => {
  const drawn = (drawnBy, className = "") => {
    const c = contract("a")
    c.configurationStates = { pressed: ["unpressed", "pressed"] }
    c.drawnBy = drawnBy
    c.className = () => className
    return c
  }

  // 이유 문자열은 손으로 적은 근거다 — externalSurfaces와 같은 등급이고 비어 있으면 안 된다
  assert.doesNotThrow(() => validateContracts(["a.tsx"], [drawn({ pressed: "표면의 존재가 그린다" })]))
  assert.throws(() => validateContracts(["a.tsx"], [drawn({ pressed: "  " })]), /그리는 자리가 클래스가 아니면 이유가 필요하다/)

  const attribute = { attribute: "data-state", values: { pressed: "on" } }
  // 제스처의 피드백 검사와 같다 — 선언한 수식자가 클래스에 없으면 매니페스트는 아무것도 해소하지 못한다
  assert.throws(
    () => validateContracts(["a.tsx"], [drawn({ pressed: attribute }, "rounded-md")]),
    /선언한 수식자가 클래스에 없다: a\.pressed\.pressed \(data-\[state=on\]\)/
  )
  assert.doesNotThrow(() => validateContracts(["a.tsx"], [drawn({ pressed: attribute }, "data-[state=on]:bg-accent")]))

  // 이름표는 계약이 지지만, 계약이 자기 축에 없는 값을 지어내지는 못한다
  assert.throws(
    () => validateContracts(["a.tsx"], [drawn({ pressed: { attribute: "data-state", values: { on: "on" } } }, "data-[state=on]:bg-accent")]),
    /구성 상태에 없는 값을 대응시킨다: a\.pressed\.on/
  )
  assert.throws(
    () => validateContracts(["a.tsx"], [drawn({ pressed: { attribute: "state", values: { pressed: "on" } } }, "data-[state=on]:bg-accent")]),
    /그리는 속성은 data-\* 이름이어야 한다/
  )
})

/* 세 번째 drawnBy 모양(#184). 이 모양이 사는 이유는 **주장이 검사된다**는 것 하나이므로,
 * 검사가 실제로 무는지를 못박는다 — 물지 않으면 이유 문자열보다 나을 것이 없다. */

const carried = (drawn, className) => ({
  ...contract("widget"),
  className: () => className,
  configurationStates: { validity: ["valid", "invalid"] },
  drawnBy: { validity: drawn },
})

test("carriedBy는 정책이 정말 ignore:일 때만 통과한다", () => {
  // `aria-invalid`는 정책표에서 ignore: 다 — 클래스에도 있으므로 통과한다
  assert.doesNotThrow(() => validateContracts(["widget.tsx"], [
    carried({ modifiers: ["aria-invalid"], carriedBy: "none" }, "aria-invalid:border-destructive"),
  ]))
})

test("정책이 나르기로 판정한 수식자에 carriedBy를 적으면 깨진다", () => {
  // `disabled`는 `state` 정책이다 — 나르지 않는다는 주장이 거짓이다
  assert.throws(() => validateContracts(["widget.tsx"], [
    carried({ modifiers: ["disabled"], carriedBy: "none" }, "disabled:opacity-50"),
  ]), /정책이 나르기로 판정했다/)
})

test("정책이 아예 없는 수식자는 unresolved로 새고 있다고 말한다", () => {
  assert.throws(() => validateContracts(["widget.tsx"], [
    carried({ modifiers: ["data-[orientation=vertical]"], carriedBy: "none" }, "data-[orientation=vertical]:w-2"),
  ]), /정책이 없는 수식자/)
})

test("선언한 수식자가 클래스에 없으면 깨진다 — 앞의 모양과 같은 검사다", () => {
  assert.throws(() => validateContracts(["widget.tsx"], [
    carried({ modifiers: ["aria-invalid"], carriedBy: "none" }, "border"),
  ]), /선언한 수식자가 클래스에 없다/)
})

test("carriedBy는 \"none\"만 쓴다 — 상태 사다리는 셀 단위라 계약이 말할 수 없다", () => {
  assert.throws(() => validateContracts(["widget.tsx"], [
    carried({ modifiers: ["disabled"], carriedBy: "state" }, "state disabled:opacity-50"),
  ]), /carriedBy는 "none"만 쓴다/)
  assert.throws(() => validateContracts(["widget.tsx"], [
    carried({ modifiers: [], carriedBy: "none" }, "aria-invalid:border-destructive"),
  ]), /그리는 수식자 목록이 필요하다/)
})
