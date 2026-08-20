/* 토큰 계열 ↔ CSS 속성 게이트(#37). 실제로 났던 결함은 `link` variant의
 * `color: --ds-bg-accent-solid`였다 — 다크 canvas 위 3.61:1. */
import assert from "node:assert/strict"
import { test } from "node:test"

import { lintManifest, lintVarMapCoverage } from "../scripts/manifest/lint.mjs"

const token = (t) => ({ tier: "token", token: t })

const cell = (variant, properties, state) => ({
  variant,
  size: "default",
  properties,
  ...(state ? { state } : {}),
})

test("배경용 토큰이 글자색에 오면 잡는다 — #37이 발견한 결함 그대로", () => {
  const errors = lintManifest({
    component: "button",
    cells: [cell("link", { color: token("--ds-bg-accent-solid") })],
  })
  assert.equal(errors.length, 1)
  assert.match(errors[0], /button link\/default/)
  assert.match(errors[0], /--ds-fg-\* 여야 한다/)
})

test("계열이 맞으면 통과한다 — 고친 뒤의 모양", () => {
  assert.deepEqual(
    lintManifest({
      component: "button",
      base: { "border-color": token("--ds-border-default") },
      cells: [
        cell("link", { color: token("--ds-fg-link") }),
        cell(
          "default",
          { color: token("--ds-fg-on-solid"), "background-color": token("--ds-bg-accent-solid") },
          { base: "--ds-bg-accent-solid", layer: "--ds-state-layer" }
        ),
      ],
    }),
    []
  )
})

test("반대 방향도 잡는다 — 전경용 토큰이 배경에 온 경우", () => {
  const errors = lintManifest({
    component: "x",
    cells: [cell("a", { "background-color": token("--ds-fg-default") })],
  })
  assert.equal(errors.length, 1)
  assert.match(errors[0], /--ds-bg-\* 여야 한다/)
})

test("base 블록도 검사한다 — 셀 밖에 있다고 빠지지 않는다", () => {
  const errors = lintManifest({
    component: "x",
    base: { "border-color": token("--ds-bg-canvas") },
    cells: [],
  })
  assert.equal(errors.length, 1)
  assert.match(errors[0], /x base/)
})

test("state.base는 면이라 background-color와 같은 자리로 본다", () => {
  const errors = lintManifest({
    component: "x",
    cells: [cell("a", {}, { base: "--ds-fg-default", layer: "--ds-state-layer" })],
  })
  assert.equal(errors.length, 1)
  assert.match(errors[0], /state\.base/)
})

test("state.layer는 계열이 달라 대상이 아니다 — ghost의 base 없음도 마찬가지", () => {
  assert.deepEqual(
    lintManifest({
      component: "x",
      cells: [cell("ghost", {}, { base: null, layer: "--ds-state-layer" })],
    }),
    []
  )
})

test("--ds-*가 아닌 토큰은 대상 밖이다 — 스케일은 계열이 없다", () => {
  assert.deepEqual(
    lintManifest({
      component: "x",
      cells: [cell("a", { "border-radius": token("--radius-md"), "font-size": token("--text-sm") })],
    }),
    []
  )
})

test("literal은 토큰이 아니라 검사하지 않는다", () => {
  assert.deepEqual(
    lintManifest({
      component: "x",
      cells: [cell("a", { color: { tier: "literal", value: "#fff", from: "text-white" } })],
    }),
    []
  )
})

test("계열 검사가 침묵하는 자리 — color 항목이 아예 없는 칸", () => {
  // ghost·outline은 body 규칙의 --foreground를 상속한다(#36). 상속은 클래스에
  // 나타나지 않아 매니페스트에 없고, 없는 것은 통과가 아니라 침묵이다
  assert.deepEqual(
    lintManifest({
      component: "button",
      cells: [cell("ghost", { display: { tier: "literal", value: "inline-flex" } })],
    }),
    []
  )
})

/* ── 번역표 ② 커버리지(#41) ────────────────────────────────────────────────── */

const VAR_MAP = {
  $generated: "메타 키는 표의 칸이 아니다",
  "space.4": { kind: "variable", collection: "palette", name: "space/4" },
  "shadow.xs": { kind: "effectStyle", name: "shadow/xs" },
  "--ds-fg-on-solid": { kind: "variable", collection: "semantic", name: "fg/on-solid" },
  "--ds-state-layer": { kind: "variable", collection: "semantic", name: "state/layer" },
}

test("표에 없는 이름을 잡는다 — 셀·슬롯·base·state 전부", () => {
  const errors = lintVarMapCoverage(
    {
      component: "button",
      base: { "border-color": token("--ds-border-default") },
      cells: [
        {
          variant: "default",
          size: "default",
          properties: { color: token("--ds-fg-muted") },
          slots: { icon: { size: { tier: "token", scale: "space.99", token: "--spacing" } } },
          state: { base: "--ds-bg-ghost", layer: "--ds-state-layer" },
        },
      ],
    },
    VAR_MAP
  )
  assert.deepEqual(errors.map((e) => e.split(" — ")[1].split("가 ")[0]), [
    "--ds-border-default",
    "--ds-fg-muted",
    "space.99",
    "--ds-bg-ghost",
  ])
})

test("scale이 token을 이긴다 — 소비 규칙과 같은 키로 검사한다", () => {
  // space.4는 표에 있고 --spacing은 없다. 소비가 scale로 찾으므로 통과여야 한다
  const entry = { tier: "token", scale: "space.4", token: "--spacing", multiple: 4 }
  assert.deepEqual(
    lintVarMapCoverage(
      { component: "b", cells: [{ variant: "a", size: "s", properties: { gap: entry } }] },
      VAR_MAP
    ),
    []
  )
})

test("literal은 대상이 아니고 같은 키는 한 번만 운다", () => {
  const missing = token("--ds-fg-muted")
  const cells = [1, 2, 3].map((n) => ({
    variant: `v${n}`,
    size: "default",
    properties: { color: missing, display: { tier: "literal", value: "inline-flex" } },
  }))
  const errors = lintVarMapCoverage({ component: "b", cells }, VAR_MAP)
  assert.equal(errors.length, 1)
  assert.match(errors[0], /b v1\/default/)
})

test("effectStyle 칸도 통과한다 — kind가 달라도 표에 있으면 있는 것이다", () => {
  assert.deepEqual(
    lintVarMapCoverage(
      {
        component: "b",
        cells: [
          {
            variant: "a",
            size: "s",
            properties: { "box-shadow": { tier: "token", scale: "shadow.xs", token: "--shadow-xs" } },
          },
        ],
      },
      VAR_MAP
    ),
    []
  )
})
