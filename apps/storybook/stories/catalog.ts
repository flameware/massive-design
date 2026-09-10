/* 상태 표가 읽는 카탈로그. 정본은 스토리 파일의 meta 하나이므로 여기에 목록을
 * 손으로 적지 않는다 — Vite가 스토리 파일을 훑어 title과 `parameters.ds`를 모은다.
 *
 * 손으로 적은 목록이었다면 "목록과 실제가 같은가"를 묻는 도구가 또 필요했을
 * 것이다. 그 도구를 만들지 않기 위한 구조다(ADR-0023 §6). */
import { CATEGORIES, categoryOf, nameOf, type Category, type DsMeta } from "./meta"

export interface CatalogEntry extends DsMeta {
  category: Category
  name: string
}

const modules = import.meta.glob<{ default?: { title?: string; parameters?: { ds?: DsMeta } } }>(
  "./**/*.stories.tsx",
  { eager: true }
)

export const catalog: CatalogEntry[] = Object.values(modules)
  .flatMap((module) => {
    const meta = module.default
    const category = meta?.title === undefined ? undefined : categoryOf(meta.title)
    // ds를 선언하지 않았거나 분류 밖의 title이면 표에 넣지 않는다 — 표는 선언된
    // 것만 보여준다. 선언을 강제하는 게이트는 두지 않는다(ADR-0023 §6)
    if (meta?.title === undefined || category === undefined || meta.parameters?.ds === undefined)
      return []
    return [{ ...meta.parameters.ds, category, name: nameOf(meta.title) }]
  })
  .sort(
    (a, b) =>
      CATEGORIES.indexOf(a.category) - CATEGORIES.indexOf(b.category) ||
      a.name.localeCompare(b.name)
  )
