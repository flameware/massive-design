/* 모든 컴포넌트의 status·since를 한 장에 보여준다 (#279, 스토리 36).
 *
 * 목록의 출처는 catalog.ts이고 그것의 출처는 각 스토리의 meta다. 새 컴포넌트가
 * 스토리를 더하는 순간 이 표에 줄이 하나 는다 — 표를 갱신하는 단계는 없다. */
import type { CSSProperties } from "react"

import { CATEGORIES, type Category } from "../meta"
import { catalog } from "../catalog"
import { StatusBadge } from "../StatusBadge"

const cell: CSSProperties = {
  textAlign: "left",
  padding: "0.5rem 0.75rem",
  borderBottom: "1px solid var(--ds-border-default)",
  verticalAlign: "baseline",
}

export function StatusTable() {
  const present = CATEGORIES.filter((category) =>
    catalog.some((entry) => entry.category === category)
  )
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", color: "var(--ds-fg-default)" }}>
      <thead>
        <tr>
          <th style={{ ...cell, width: "40%" }}>컴포넌트</th>
          <th style={{ ...cell, width: "35%" }}>상태</th>
          <th style={{ ...cell }}>since</th>
        </tr>
      </thead>
      <tbody>
        {present.map((category) => (
          <CategoryRows key={category} category={category} />
        ))}
      </tbody>
    </table>
  )
}

function CategoryRows({ category }: { category: Category }) {
  return (
    <>
      <tr>
        <th
          colSpan={3}
          style={{ ...cell, paddingTop: "1.25rem", fontSize: "0.8125rem", color: "var(--ds-fg-muted)" }}
        >
          {category}
        </th>
      </tr>
      {catalog
        .filter((entry) => entry.category === category)
        .map((entry) => (
          <tr key={entry.name}>
            <td style={cell}>{entry.name}</td>
            <td style={cell}>
              <StatusBadge status={entry.status} />
            </td>
            <td style={cell}>{entry.since}</td>
          </tr>
        ))}
    </>
  )
}
