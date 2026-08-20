/* 클래스 묶음을 Tailwind로 컴파일한다.
 *
 * **자동 소스 스캔을 반드시 끈다**(#22 프로브 ②). `@import "tailwindcss"`만 쓰면
 * Tailwind가 입력 CSS의 기준 디렉터리(packages/ui)를 통째로 스캔해서, 준 적 없는
 * 클래스의 선언이 섞여 나온다. `source(none)` + 임시 디렉터리 하나만 `@source`로
 * 지정해 격리한다.
 *
 * 상태 유틸리티는 src/state.css만 끌어온다 — styles.css는 `@source "../src"`를
 * 들고 있어서 import하는 순간 위의 격리가 무너진다(#22 프로브 ③).
 *
 * 입력 CSS가 패키지 안에 있어야 `tailwindcss` 가 해석된다. 그래서 임시 자리가
 * node_modules 밑이다.
 */
import { execFileSync } from "node:child_process"
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { join } from "node:path"

export const TMP = join("node_modules", ".cache", "massive-manifest")

/** @param {string[]} classes @returns {string} 컴파일된 CSS */
export function compileClasses(classes, { root, tokensCss, stateCss }) {
  const dir = join(root, TMP)
  const src = join(dir, "src")
  rmSync(dir, { recursive: true, force: true })
  mkdirSync(src, { recursive: true })
  writeFileSync(join(src, "classes.txt"), classes.join("\n"))
  writeFileSync(
    join(dir, "in.css"),
    [
      `@import "tailwindcss" source(none);`,
      `@import "${tokensCss}";`,
      `@import "${stateCss}";`,
      `@source "${src}";`,
      "",
    ].join("\n")
  )
  try {
    execFileSync(join(root, "node_modules", ".bin", "tailwindcss"), ["-i", join(dir, "in.css"), "-o", join(dir, "out.css")], {
      cwd: root,
      stdio: ["ignore", "ignore", "pipe"],
    })
    return readFileSync(join(dir, "out.css"), "utf8")
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}
