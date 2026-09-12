/* 패키지 스모크 — 세 seam 중 하나다(#278).
 *
 * 여기서 재는 것은 컴포넌트의 모양이 아니라 **소비처가 설치한 뒤 마주치는
 * 것**이다: 서브패스가 해석되는가, 타입이 나오는가, 아무것도 안 써도 무는
 * 바이트가 상한 아래인가, 클라이언트 경계가 패키지 안에 박혀 있는가.
 *
 * 1세대가 비싸게 배운 것이 여기 있다 — 바닥값을 올리는 것은 의존성 선택이
 * 아니라 패키징이고(ADR-0017), 그 결함은 소비 앱의 번들에서만 보인다. */
import assert from "node:assert/strict"
import { spawnSync } from "node:child_process"
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { test } from "node:test"

const root = fileURLToPath(new URL("..", import.meta.url))
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"))

/** exports에 선언된 서브패스 중 코드가 나오는 것들. */
const CODE_SUBPATHS = [
  ".",
  "./button",
  "./icon",
  "./field",
  "./input",
  "./textarea",
  "./form",
  "./card",
  "./alert",
  "./menu",
  "./avatar",
  "./separator",
  "./tooltip",
  "./dialog",
  "./alert-dialog",
  "./drawer",
  "./table",
  "./badge",
  "./list-row",
  "./text",
  "./skeleton",
  "./spinner",
  "./tabs",
  "./page-shell",
  "./theme-toggle",
  "./checkbox",
  "./select",
  "./toggle",
  "./toggle-group",
  "./combobox",
  "./progress",
  "./empty-state",
  "./number-field",
  "./pagination",
  "./confirm-dialog",
  "./toast",
]

/** 컴포넌트 하나마다 서브패스 하나 — 이 목록이 늘어나는 것이 컴포넌트가 느는 것이다. */
const COMPONENT_SUBPATHS = [
  "./button",
  "./icon",
  "./field",
  "./input",
  "./textarea",
  "./form",
  "./card",
  "./alert",
  "./menu",
  "./avatar",
  "./separator",
  "./tooltip",
  "./dialog",
  "./alert-dialog",
  "./drawer",
  "./table",
  "./badge",
  "./list-row",
  "./text",
  "./skeleton",
  "./spinner",
  "./tabs",
  "./page-shell",
  "./theme-toggle",
  "./checkbox",
  "./select",
  "./toggle",
  "./toggle-group",
  "./combobox",
  "./progress",
  "./empty-state",
  "./number-field",
  "./pagination",
  "./confirm-dialog",
  "./toast",
]

/** Base UI를 감싸거나 상태를 갖는 서브패스 — 클라이언트 경계가 패키지 안에 박혀야
 * 한다. Card·Alert·Table·Badge·ListRow·Text·Skeleton·Spinner는 Base UI 뒤가
 * 없는 자체 스타일 primitive라 이벤트 핸들러도 상태도 없다(#283, #290, #291)
 * — 서버 컴포넌트로 남고, `"use client"`를 붙이면 오히려 소비처의 서버 렌더
 * 경계를 불필요하게 앞당긴다. Menu·Avatar·Separator·Tooltip은 넷 다 Base UI
 * 뒤이므로(#285) 클라이언트 쪽에 선다. Dialog·AlertDialog·Drawer(#284)도 셋
 * 다 Base UI 프리미티브를 직접 감싸므로(포커스·열림 상태) 클라이언트다.
 * Tabs·PageShell·ThemeToggle도 Base UI 뒤이거나(Tabs) 상태·이벤트 핸들러를
 * 갖는다(PageShell의 탭 상태, ThemeToggle의 onClick) — 셋 다 클라이언트 쪽에
 * 선다(#286). Checkbox·Select·Toggle·ToggleGroup은 넷 다 제어/비제어 상태를
 * 다루거나(Toggle·ToggleGroup은 `useControllableState`) Base UI의 상태 있는
 * 컴포넌트를 감싸므로(#288) 클라이언트다. Combobox(#289)도 Base UI Combobox를
 * 감싸므로 클라이언트다. Progress(#325)도 Base UI Progress.Root를 감싸므로
 * 클라이언트다. EmptyState(#326)는 Base UI 뒤가 없지만 `useId`로 Title·
 * Description을 Root의 aria-labelledby·aria-describedby에 배선하는 컨텍스트를
 * 쓰므로 클라이언트다. NumberField(#328)도 Base UI NumberField.Root를 감싸고
 * 증감 버튼의 상태를 다루므로 클라이언트다. Pagination(#329)도 Base UI 뒤가
 * 없지만 이전/다음·페이지 번호 버튼에 `onClick`을 달므로 클라이언트다.
 * ConfirmDialog(#330)는 AlertDialog를 감싸는 프리셋이라 열림·로딩 상태를
 * 직접 다루므로 클라이언트다. Toast(#371)도 Base UI Toast.Provider·
 * useToastManager를 감싸 토스트 목록·타이머 상태를 다루므로 클라이언트다. */
const CLIENT_SUBPATHS = [
  "./button",
  "./icon",
  "./field",
  "./input",
  "./textarea",
  "./form",
  "./menu",
  "./avatar",
  "./separator",
  "./tooltip",
  "./dialog",
  "./alert-dialog",
  "./drawer",
  "./tabs",
  "./page-shell",
  "./theme-toggle",
  "./checkbox",
  "./select",
  "./toggle",
  "./toggle-group",
  "./combobox",
  "./progress",
  "./empty-state",
  "./number-field",
  "./pagination",
  "./confirm-dialog",
  "./toast",
]
const SERVER_SUBPATHS = [
  "./card",
  "./alert",
  "./table",
  "./badge",
  "./list-row",
  "./text",
  "./skeleton",
  "./spinner",
]

// ── 서브패스 ────────────────────────────────────────────────────────────────

test("선언한 서브패스가 전부 해석된다 — 이름으로", async () => {
  for (const subpath of Object.keys(pkg.exports)) {
    const specifier = subpath === "." ? pkg.name : `${pkg.name}/${subpath.slice(2)}`
    assert.doesNotThrow(() => import.meta.resolve(specifier), specifier)
  }
})

test("코드 서브패스마다 .d.ts가 있고 실제로 타입을 낸다", () => {
  for (const subpath of CODE_SUBPATHS) {
    const types = pkg.exports[subpath].types
    assert.ok(types, `${subpath}에 types 조건이 없다`)
    const text = readFileSync(join(root, types), "utf8")
    assert.match(text, /\bexport\b/, `${types}가 비어 있다`)
  }
})

test("컴포넌트는 저마다의 서브패스로만 들어온다 — 루트는 바닥값이다", async () => {
  const rootExports = await import(pkg.name)
  assert.deepEqual(Object.keys(rootExports).sort(), ["cn"])

  for (const subpath of COMPONENT_SUBPATHS) {
    const mod = await import(`${pkg.name}/${subpath.slice(2)}`)
    assert.ok(Object.keys(mod).length > 0, subpath)
  }
})

// ── 경계와 부작용 ───────────────────────────────────────────────────────────

function entryFiles(subpath) {
  const entry = join(root, pkg.exports[subpath].default)
  // 서브패스의 진입점이 재수출만 하면 지시어는 실제 구현 파일에 있어야 한다.
  // 진입점부터 따라가 relative import 한 겹까지 본다
  const text = readFileSync(entry, "utf8")
  const reexports = [...text.matchAll(/from "(\.[^"]+)"/g)].map((m) => m[1])
  return [text, ...reexports.map((r) => readFileSync(join(entry, "..", r), "utf8"))]
}

test("클라이언트 경계는 패키지가 박는다 — 소비처가 고민하지 않는다", () => {
  for (const subpath of CLIENT_SUBPATHS) {
    assert.ok(
      entryFiles(subpath).some((f) => /^["']use client["']/m.test(f)),
      `${subpath}에 "use client"가 없다`
    )
  }
})

test("자체 스타일 primitive는 서버 컴포넌트로 남는다 — \"use client\"를 박지 않는다", () => {
  for (const subpath of SERVER_SUBPATHS) {
    assert.ok(
      entryFiles(subpath).every((f) => !/^["']use client["']/m.test(f)),
      `${subpath}는 Base UI 뒤가 없는데도 "use client"가 있다 — 서버 경계를 앞당긴다`
    )
  }
})

test("sideEffects는 CSS로 한정된다 — 그것이 트리 셰이킹을 여는 선언이다", () => {
  assert.deepEqual(pkg.sideEffects, ["**/*.css"])
})

// ── 바닥값 ──────────────────────────────────────────────────────────────────

/* 상한. 지금 값은 27,634 B(clsx + tailwind-merge, minify, react 외부)이고
 * 상한은 그 위 약 8%다. 여유를 크게 두지 않는 것이 요점이다 — 이 저울이 우는
 * 것은 **번들러가 떼어낼 수 없는** 것이 늘 때다. 루트에서 컴포넌트를 재수출하는
 * 것만으로는 울지 않는다(트리 셰이킹이 걷어낸다). 그쪽은 바로 위 서브패스
 * 테스트가 문다 — 저울 하나가 두 결함을 다 잡지는 않는다. */
const FLOOR_CAP_BYTES = 30_000

test(`cn만 import한 바닥값이 ${FLOOR_CAP_BYTES} B 아래다`, () => {
  const dir = mkdtempSync(join(tmpdir(), "flameware-ui-floor-"))
  try {
    // 진입점은 **exports 맵을 거쳐** 고른다 — 배선이 틀리면 여기서 먼저 터진다.
    // 번들러에 이름을 그대로 주지 않는 이유는 자기 참조(self-reference)를
    // 해석하는 규칙이 러너마다 다르기 때문이다. 재는 대상은 같다
    const rootEntry = fileURLToPath(import.meta.resolve(pkg.name))
    const entry = join(dir, "entry.mjs")
    writeFileSync(entry, `import { cn } from ${JSON.stringify(rootEntry)}\nglobalThis.__cn = cn\n`)

    const out = join(dir, "out.js")
    const build = spawnSync(
      "bun",
      ["build", entry, "--minify", "--target=browser", "--outfile", out,
        ...Object.keys(pkg.peerDependencies).flatMap((d) => ["--external", d])],
      { cwd: root, encoding: "utf8" }
    )
    assert.equal(build.status, 0, build.stderr)

    const bytes = readFileSync(out).byteLength
    assert.ok(bytes < FLOOR_CAP_BYTES, `바닥값이 ${bytes} B — 상한 ${FLOOR_CAP_BYTES} B`)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})
