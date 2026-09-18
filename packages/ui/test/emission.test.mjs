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
import { headingWeightVariants, textVariants } from "../dist/text/index.js"
import {
  toastPartClassNames,
  toastRootVariants,
  toastViewportVariants,
} from "../dist/toast/index.js"
import { toggleVariants } from "../dist/toggle/index.js"
// 그룹 안 항목 크기는 공개 API가 아니라 서브패스 index에 없다 — 파일을 직접 읽는다
import { toggleInGroupVariants } from "../dist/toggle/toggle.js"
import { toggleGroupVariants } from "../dist/toggle-group/index.js"

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
  badgeVariants({ tone: "muted" }),
  listRowVariants(),
  ...partClasses,
  progressTrackVariants(),
  progressIndicatorVariants(),
  skeletonVariants(),
  spinnerVariants({ size: "sm" }),
  spinnerVariants({ size: "md" }),
  spinnerVariants({ size: "lg" }),
  spinnerVariants({ size: "xl" }),
  // #369 — Spinner의 tone 축. inherit는 색 클래스를 내지 않는 게 계약이라 여기
  // 후보에서는 제외한다(빈 문자열은 어차피 CSS를 내지 않으니 잴 것이 없다)
  spinnerVariants({ tone: "accent" }),
  spinnerVariants({ tone: "muted" }),
  // #369 — Toggle의 size 축(#466이 척도 32·36·40에 맞췄다)
  toggleVariants({ size: "sm" }),
  toggleVariants({ size: "md" }),
  toggleVariants({ size: "lg" }),
  // #466 — ToggleGroup의 size 축. 판은 높이를 적지 않고 안의 항목이 그룹 안
  // 크기(h-6.5·h-7.5·h-8.5 — 기본 배수 밖의 반 칸)를 진다
  toggleInGroupVariants({ size: "sm" }),
  toggleInGroupVariants({ size: "md" }),
  toggleInGroupVariants({ size: "lg" }),
  toggleGroupVariants(),
  tableHeadVariants({ textAlign: "start" }),
  tableHeadVariants({ textAlign: "center" }),
  tableHeadVariants({ textAlign: "end" }),
  tableCellVariants({ textAlign: "start" }),
  tableCellVariants({ textAlign: "center" }),
  tableCellVariants({ textAlign: "end" }),
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
  textVariants({ tone: "inherit" }),
  textVariants({ tone: "neutral" }),
  textVariants({ tone: "danger" }),
  textVariants({ tone: "muted" }),
  headingWeightVariants({ weight: "semibold" }),
  headingWeightVariants({ weight: "bold" }),
  // #371 — Toast의 tone 축(Badge·Alert와 같은 이름 공간)
  toastRootVariants({ tone: "neutral" }),
  toastRootVariants({ tone: "success" }),
  toastRootVariants({ tone: "danger" }),
  toastViewportVariants(),
  // #371 — cva 축이 없는 리터럴 클래스(카드 안 파트들)도 같이 잰다
  // (overlay.test.mjs가 Dialog·Drawer의 closeButtonClassName을 재는 것과 같은 이유)
  ...Object.values(toastPartClassNames),
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

/* 토스트 닫기(X)의 오프셋 `right-3 top-3`은 **카드 모서리** 기준이다(#419) — 위치
 * 기준(`relative`)이 `p-4` 안쪽 콘텐츠 래퍼에 있으면 X가 모서리에서 28px(16+12)로
 * 밀려 제목 줄 아래·카드 아래 모서리에 걸친다. 그리고 X에는 `hit-area`도 걸려 있어
 * 그 유틸리티의 `position: relative`와 `absolute`가 한 요소에서 겨룬다 — 둘은
 * 명시도가 같으므로 방출 순서가 승부를 가른다. 순서가 뒤집히면 X가 흐름 안으로
 * 떨어진다. */
test("토스트 닫기 버튼은 카드 루트 기준으로 absolute 배치된다 (#419)", () => {
  for (const tone of ["neutral", "success", "danger"]) {
    assert.ok(
      toastRootVariants({ tone }).split(/\s+/).includes("relative"),
      `${tone}: 카드 루트에 relative가 없다 — X의 위치 기준이 카드가 아니다`
    )
  }
  assert.ok(
    !toastPartClassNames.CONTENT.split(/\s+/).includes("relative"),
    "콘텐츠 래퍼에 relative가 있다 — X가 p-4 안쪽 기준으로 밀린다"
  )
  const close = toastPartClassNames.CLOSE.split(/\s+/)
  assert.ok(
    close.includes("absolute") && close.includes("hit-area"),
    "CLOSE에 absolute·hit-area 중 하나가 없다 — 아래 방출 순서 단언의 전제가 깨졌다"
  )

  const css = compiler.build(["hit-area", "absolute"])
  const hitArea = css.indexOf(".hit-area {")
  const absolute = css.indexOf(".absolute {")
  assert.ok(hitArea >= 0 && absolute >= 0, "두 규칙 중 하나가 방출되지 않았다")
  assert.ok(
    absolute > hitArea,
    "`.absolute`가 `.hit-area`보다 먼저 방출된다 — hit-area의 position: relative가 이긴다"
  )
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
