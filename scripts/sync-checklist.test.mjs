import assert from "node:assert/strict"
import test from "node:test"

import { checklistFor } from "./sync-checklist.mjs"

const contract = (name, behaviors) => ({ name, behaviors })
const record = { components: [{ component: "popover", hash: "2535c4105bf4" }] }

const drag = { kind: "control-gesture", surface: "SliderThumb", origin: "inherited", why: "upstream이 갖고 온다" }
const hover = { kind: "open-cause", surface: "PopoverContent", origin: "ours", control: "openOn", why: "우리가 만든 계기다" }

test("확인표는 선언한 자리를 종류별로 묶어 전부 찍는다", () => {
  // 좁히지 않는 것이 결정이다 — 이 자리의 실패 양식은 피로가 아니라 빠짐이었다(#124·#125·#127)
  const out = checklistFor([contract("popover", { hoverOpen: hover }), contract("slider", { thumbDrag: drag })], record)
  assert.match(out, /2자리 \/ 2개 컴포넌트/)
  assert.match(out, /## 컨트롤 제스처 확인/)
  assert.match(out, /## 열림 계기 확인/)
  assert.match(out, /- \[ \] slider\.thumbDrag/)
  assert.match(out, /- \[ \] popover\.hoverOpen/)

  // 종류가 없으면 그 절도 없다 — 빈 절은 확인할 것이 있다고 거짓말한다
  assert.doesNotMatch(checklistFor([contract("slider", { thumbDrag: drag })], record), /열림 계기 확인/)
})

test("origin이 무엇을 볼지를 가른다", () => {
  // 값을 계약하지 않기로 했으므로(ADR-0005) origin이 확인표의 유일한 갈림이다
  const out = checklistFor([contract("popover", { hoverOpen: hover }), contract("slider", { thumbDrag: drag })], record)
  assert.match(out, /popover\.hoverOpen — .*우리 값/)
  assert.match(out, /slider\.thumbDrag — .*상속 — upstream 기본값이 그대로인지도/)

  // control은 선택이라 없으면 그 조각을 내지 않는다
  assert.doesNotMatch(out, /slider\.thumbDrag — .*바꾸는 자리/)
})

test("열림 계기에는 이번 세대의 기본 모드 해시가 붙는다", () => {
  // runbook에 손으로 박혀 있던 해시를 대신한다 — 정본은 매니페스트 인덱스다
  assert.match(checklistFor([contract("popover", { hoverOpen: hover })], record), /기본 모드 해시: 2535c4105bf4/)
  assert.match(checklistFor([contract("popover", { hoverOpen: hover })], { components: [] }), /기본 모드 해시: \(인덱스에 없다\)/)
})

test("인덱스가 없으면 확인표가 먼저 그 사실을 적는다", () => {
  assert.match(checklistFor([contract("popover", { hoverOpen: hover })], null), /경고: packages\/ui\/dist\/manifest\/index\.gen\.json이 없다/)
})

test("선언이 하나도 없으면 없다고 적는다", () => {
  // 침묵을 선언으로 바꾸는 것이 behaviors의 값어치이므로 확인표도 침묵하지 않는다
  assert.match(checklistFor([contract("badge", {})], record), /선언된 동작이 없다/)
})
