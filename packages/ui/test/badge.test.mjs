/* Badge의 **소비처가 마주치는 계약**만 잰다 — 모양은 스토리 몫이다.
 *
 * 여기서 재는 것은 톤 축의 값 집합과, 조용한 값(`muted`)이 고른 색 조합이다.
 * `muted`는 이름이 약속한 대로 조용한 면(`bg.neutral.soft`, 면 대비 1.09) 위에
 * 옅은 글자(`fg.muted`)를 얹는다 — `['fg.muted', 'bg.neutral.soft']`는
 * packages/tokens/scripts/contrast.mjs의 TEXT_PAIRS에 이미 있는 쌍이다
 * (실측 5.34:1 라이트 · 5.15:1 다크, TEXT_GATE 4.5를 넘는다). */
import assert from "node:assert/strict"
import { test } from "node:test"

import { badgeVariants } from "../dist/badge/index.js"

const TONES = ["neutral", "accent", "danger", "success", "warning", "outline", "muted"]

test("톤은 일곱이고 기본은 neutral이다", () => {
  // cva는 모르는 값에도 문자열(기본 클래스)을 돌려주므로, 값이 실제로 열려
  // 있는지는 "기본 클래스에 무언가를 더했는가"로 잰다
  const base = badgeVariants({ tone: "없는톤" })
  const rendered = new Map(TONES.map((tone) => [tone, badgeVariants({ tone })]))
  for (const [tone, classes] of rendered) {
    assert.notEqual(classes, base, `${tone} 톤이 아무 클래스도 더하지 않았다`)
  }
  assert.equal(new Set(rendered.values()).size, TONES.length, "톤마다 다른 조합이어야 한다")
  assert.equal(badgeVariants(), rendered.get("neutral"))
})

test("muted 톤은 fg.muted × bg.neutral.soft를 쓴다 — 대비 게이트가 검증한 조합", () => {
  const classes = badgeVariants({ tone: "muted" })
  assert.match(classes, /(?:^|\s)bg-neutral-soft(?:\s|$)/)
  assert.match(classes, /(?:^|\s)text-muted(?:\s|$)/)
  // #434 — 면으로 읽히라고 연 단계(bg.neutral.muted)는 조용한 배지의 면이 아니다
  assert.ok(!/(?:^|\s)bg-neutral-muted(?:\s|$)/.test(classes))
  assert.ok(!/(?:^|\s)text-default(?:\s|$)/.test(classes))
})

test("muted는 neutral과 같은 면을 쓰고 글자만 옅다", () => {
  const muted = badgeVariants({ tone: "muted" })
  const neutral = badgeVariants({ tone: "neutral" })
  assert.match(neutral, /(?:^|\s)bg-neutral-soft(?:\s|$)/)
  assert.match(neutral, /(?:^|\s)text-default(?:\s|$)/)
  assert.notEqual(muted, neutral)
})
