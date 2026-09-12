/* Card·Alert·Badge·ListRow·Text·Skeleton·Spinner·Combobox·Progress가 부르는
 * 클래스가 **실제로 선언을 내는지** 잰다 — Button의 test/utilities.test.mjs와
 * 같은 이유, 같은 계기다. Tailwind는 모르는 유틸리티를 오류로 만들지 않고
 * 조용히 아무것도 내지 않으므로, semantic 이름의 오타나 미등록은 눈으로 안 보인다.
 *
 * Button의 파일을 건드리지 않고 따로 둔 이유: 그 파일은 #299 회귀 테스트(상태
 * 레이어 캐스케이드 참여자 수)까지 지고 있어 Button 전용으로 남기고, `.state`
 * 유틸리티를 쓰지 않는 나머지 컴포넌트(Card·Alert·Badge 등은 상태가 아예 없고,
 * Combobox는 Base UI의 `data-highlighted`·`data-selected`를 색으로만 받고,
 * Progress의 필은 정적 표식이라 tabs.tsx의 인디케이터처럼 `bg-accent-solid`를
 * 직접 쓴다)는 "클래스가 방출되는가"만 재면 충분하다. */
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { test } from "node:test"
import { compile } from "tailwindcss"

import { alertVariants } from "../dist/alert/index.js"
import { badgeVariants } from "../dist/badge/index.js"
import { cardVariants } from "../dist/card/index.js"
import {
  comboboxEmptyVariants,
  comboboxInputVariants,
  comboboxItemVariants,
  comboboxListVariants,
  comboboxPopupVariants,
  comboboxStatusVariants,
} from "../dist/combobox/index.js"
import { cn } from "../dist/lib/utils.js"
import { listRowPartClassNames, listRowVariants } from "../dist/list-row/index.js"
import { progressIndicatorVariants, progressTrackVariants } from "../dist/progress/index.js"
import { skeletonVariants } from "../dist/skeleton/index.js"
import { spinnerVariants } from "../dist/spinner/index.js"
import { tableCellVariants, tableHeadVariants } from "../dist/table/index.js"
import { textVariants } from "../dist/text/index.js"

const root = fileURLToPath(new URL("..", import.meta.url))
const entry = resolve(root, "src/styles.css")

async function loadStylesheet(id, base) {
  const path = id === "tailwindcss"
    ? fileURLToPath(import.meta.resolve("tailwindcss/index.css"))
    : id.startsWith(".")
      ? resolve(base, id)
      : fileURLToPath(import.meta.resolve(id))
  return { path, base: dirname(path), content: readFileSync(path, "utf8") }
}

const compiler = await compile(readFileSync(entry, "utf8"), {
  base: dirname(entry),
  loadStylesheet,
  loadModule: async () => { throw new Error("JS 설정은 쓰지 않는다") },
})

const partClasses = Object.values(listRowPartClassNames)

const candidates = new Set()
for (const classes of [
  cardVariants(),
  alertVariants({ tone: "neutral" }),
  alertVariants({ tone: "danger" }),
  alertVariants({ tone: "warning" }),
  comboboxInputVariants(),
  comboboxPopupVariants(),
  comboboxListVariants(),
  comboboxItemVariants(),
  comboboxEmptyVariants(),
  comboboxStatusVariants(),
  badgeVariants({ tone: "neutral" }),
  badgeVariants({ tone: "accent" }),
  badgeVariants({ tone: "danger" }),
  badgeVariants({ tone: "success" }),
  badgeVariants({ tone: "warning" }),
  listRowVariants(),
  ...partClasses,
  progressTrackVariants(),
  progressIndicatorVariants(),
  skeletonVariants(),
  spinnerVariants({ size: "sm" }),
  spinnerVariants({ size: "md" }),
  spinnerVariants({ size: "lg" }),
  spinnerVariants({ size: "xl" }),
  tableHeadVariants({ align: "start" }),
  tableHeadVariants({ align: "center" }),
  tableHeadVariants({ align: "end" }),
  tableCellVariants({ align: "start" }),
  tableCellVariants({ align: "center" }),
  tableCellVariants({ align: "end" }),
  tableCellVariants({ numeric: true }),
  tableCellVariants({ numeric: false }),
  textVariants({ size: "xs" }),
  textVariants({ size: "sm" }),
  textVariants({ size: "base" }),
  textVariants({ size: "lg" }),
  textVariants({ size: "xl" }),
  textVariants({ size: "2xl" }),
  textVariants({ size: "3xl" }),
  textVariants({ size: "4xl" }),
  textVariants({ size: "5xl" }),
]) {
  for (const c of classes.split(/\s+/)) if (c) candidates.add(c)
}

test("자체 스타일 primitive·Combobox가 부르는 클래스가 하나도 빠짐없이 선언을 낸다", () => {
  assert.ok(candidates.size > 15, `클래스가 ${candidates.size}개뿐이다 — 축을 못 읽었다`)

  let before = compiler.build([]).length
  const silent = []
  for (const candidate of candidates) {
    // 순수 셀렉터 조합자(`[&>svg]:col-start-1` 등)는 후보 자체가 자식 결합자
    // 문법이라 단독으로 빌드해도 대상 요소가 없어 항상 규칙을 낸다 — 다른 후보와
    // 마찬가지로 차이를 재면 된다
    const after = compiler.build([candidate]).length
    if (after === before) silent.push(candidate)
    before = after
  }
  assert.deepEqual(silent, [], "이 클래스들은 CSS를 내지 않는다 — 조용히 무효다")
})

/* Badge의 기본 `whitespace-nowrap`을 소비처가 어떻게 되돌리는지를 주석과 MDX가 권고로
 * 적었다(#322) — `className="whitespace-normal"` 한 클래스다. 그것이 성립하는 이유는
 * 캐스케이드가 아니라 `cn`이 tailwind-merge라는 것이다: 두 클래스가 한 요소에 공존하지
 * 않고, 뒤에 온 쪽이 앞의 것을 **지운다**. 그래서 `cn`이나 tailwind-merge 설정이 바뀌면
 * 문서의 권고가 조용히 틀린다 — 그 순간을 이 한 줄이 잡는다(rules.md 방법론: 에이전트의
 * 실수가 되풀이되지 않게 하는 것은 규칙 한 문단이 아니라 테스트 한 줄이다. 이 권고는
 * 실제로 한 번 틀리게 적혔다 — 방출 순서를 재고 캐스케이드로 읽었다). */
test("문서가 권하는 되돌리기가 기본값을 지운다 — Badge의 nowrap·shrink-0", () => {
  const reverted = cn(badgeVariants({ tone: "neutral" }), "whitespace-normal").split(/\s+/)
  assert.ok(reverted.includes("whitespace-normal"), "소비처의 값이 사라졌다")
  assert.ok(
    !reverted.includes("whitespace-nowrap"),
    "기본 nowrap이 남았다 — `whitespace-normal` 한 클래스로 되돌린다는 권고가 틀렸다"
  )

  const shrunk = cn(badgeVariants({ tone: "neutral" }), "shrink").split(/\s+/)
  assert.ok(!shrunk.includes("shrink-0"), "기본 shrink-0이 남았다 — 문서를 고쳐야 한다")
})
