/* 입력 계열의 **쉬는 면**과 **무력화된 면**이 어느 토큰을 부르는지만 잰다
 * (#463) — 모양은 스토리 몫이고, 이 파일은 badge.test.mjs가 #434에서 톤의 색
 * 조합을 잰 것과 같은 자리다.
 *
 * 이 테스트가 있는 이유는 **대비 게이트가 이 변경을 전혀 보지 못한다**는 것이다.
 * packages/tokens의 대비 검사는 글자↔면(4.5:1) · 상태 테두리와 어포던스 채움↔면
 * (3:1) · 면으로 읽혀야 하는 채움↔면(1.35:1) 셋을 재고, **면↔면은 명시적으로
 * 제외**돼 있다("면은 그 위에 놓이는 것과 재고 자기 자신과는 재지 않는다",
 * contrast.mjs의 게이트 근거 블록). border.field도 제외 토큰이다. 그래서
 * bg-inset ↔ bg-surface를 오가도 기존 검사는 전부 초록이다 — 결정을 문자열로
 * 고정하는 것은 이 테스트뿐이다. */
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { test } from "node:test"

import { comboboxInputVariants } from "../dist/combobox/index.js"
import { inputVariants } from "../dist/input/index.js"
import { fieldControlBase } from "../dist/lib/field-control.js"
import { numberFieldGroupVariants } from "../dist/number-field/index.js"
import { textareaVariants } from "../dist/textarea/index.js"
import { toggleGroupVariants } from "../dist/toggle-group/index.js"

/** `bg-surface`처럼 변형자 없는 유틸리티가 그대로 있는지 */
const bare = (name) => new RegExp(String.raw`(?:^|\s)${name}(?:\s|$)`)
/** `data-disabled:bg-inset`처럼 변형자가 붙은 유틸리티가 있는지 */
const whenDisabled = (name) => new RegExp(String.raw`(?:^|\s)data-disabled:${name}(?:\s|$)`)

test("공유 밑그림의 쉬는 면은 bg.surface다 — 입력은 파묻힌 면이 아니다", () => {
  const classes = fieldControlBase.join(" ")
  assert.match(classes, bare("bg-surface"))
  // 쉬는 면으로서의 bg-inset은 사라졌다. 변형자 없는 bg-inset이 남아 있으면
  // 다섯 컨트롤 전부가 다시 회색 면으로 돌아간다 (#463)
  assert.ok(!bare("bg-inset").test(classes), "쉬는 면이 아직 bg-inset이다")
  assert.ok(!bare("bg-canvas").test(classes) && !bare("bg-subtle").test(classes))
})

test("무력화된 입력의 면은 bg.inset이고, 불투명도 처리는 그대로 남는다", () => {
  const classes = fieldControlBase.join(" ")
  assert.match(classes, whenDisabled("bg-inset"))
  // 면을 더하는 것이지 기존 규약을 뒤집는 것이 아니다 — 카탈로그 전체가
  // 무력화를 불투명도로 말한다
  assert.match(classes, whenDisabled("opacity-50"))
  assert.match(classes, whenDisabled("pointer-events-none"))
})

test("입력 다섯은 공유 밑그림을 계속 펼친다 — 펼침이 끊기면 위 두 단정이 거짓이 된다", () => {
  // Select 트리거는 cva를 내보내지 않으므로 소스가 정본이다(overlay.test.mjs와
  // 같은 방식). 나머지 넷은 이미 내보내진 cva로 직접 잰다.
  for (const [name, variants] of [
    ["Input", inputVariants],
    ["Textarea", textareaVariants],
    ["Combobox 입력", comboboxInputVariants],
    ["NumberField 그룹", numberFieldGroupVariants],
  ]) {
    const classes = variants()
    assert.match(classes, bare("bg-surface"), `${name}이 bg-surface를 부르지 않는다`)
    assert.match(classes, whenDisabled("bg-inset"), `${name}에 무력화 면이 없다`)
    assert.ok(!bare("bg-inset").test(classes), `${name}의 쉬는 면이 아직 bg-inset이다`)
  }

  const trigger = readFileSync(new URL("../src/select/select.tsx", import.meta.url), "utf8")
  assert.match(trigger, /\.\.\.fieldControlBase/, "Select 트리거가 공유 밑그림을 놓았다")
})

test("ToggleGroup 루트도 흰 면이다 — 묶음은 테두리가 나른다", () => {
  const classes = toggleGroupVariants()
  assert.match(classes, bare("bg-surface"))
  assert.ok(!bare("bg-inset").test(classes), "루트 트랙이 아직 bg-inset이다")
  // 테두리는 승격하지 않는다(#463) — Card 같은 다른 묶음 컨테이너와 갈라지지
  // 않기 위해서다. 맨 `border`는 base 규칙의 border.default를 받는다
  assert.match(classes, bare("border"))
  assert.ok(!bare("border-field").test(classes))
})

test("NumberField의 ± 버튼도 같은 면 위에 앉는다 — 한 컨트롤 안에서 면색이 갈리지 않는다", () => {
  // 이 cva는 내보내지 않는다. 테스트 편의로 공개 API를 늘리면 등급이 patch에서
  // minor로 밀리므로, overlay.test.mjs처럼 소스를 읽는다.
  const source = readFileSync(new URL("../src/number-field/number-field.tsx", import.meta.url), "utf8")
  const stepper = source.slice(source.indexOf("numberFieldStepperVariants"))
  const block = stepper.slice(0, stepper.indexOf("])"))
  assert.match(block, /--ds-state-base:var\(--ds-bg-surface\)/)
  assert.ok(
    !/--ds-state-base:var\(--ds-bg-neutral-soft\)/.test(block),
    "± 버튼이 아직 중립 채움을 쉬는 면으로 쓴다",
  )
  // 무력화에서도 갈리지 않아야 한다. `.state`는 alpha 0%에서 기준색을 그대로
  // 칠하는 **background-color의 유일한 작성자**라(state.css, #299) 기준색을
  // 그대로 두면 Group이 bg-inset으로 갈 때 ± 칸만 흰 면으로 남는다 — 실측으로
  // 확인했다(Group #eeeeee vs 스테퍼 #fdfdfd). 쉬는 면과 같은 이유로 여기도
  // 한 면이어야 한다
  assert.match(block, /data-disabled:\[--ds-state-base:var\(--ds-bg-inset\)\]/)
})
