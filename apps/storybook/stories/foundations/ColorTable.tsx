/* Foundations/색이 읽는 표. 정본은 @flameware/tokens의 `cssVar`다 — 토큰 이름을
 * 손으로 한 번 더 베끼면(StatusBadge의 TONE처럼) 새 semantic 색이 늘 때마다
 * 이 표를 잊을 수 있고, 그 어긋남을 잡는 도구가 또 생긴다(rules.md 방법론).
 * `cssVar`는 css.mjs가 @theme에 여는 것과 같은 semantic 집합이므로, 여기
 * 나열되는 이름이 곧 소비처가 부를 수 있는 유틸리티 이름이다.
 *
 * 스와치는 Tailwind 유틸리티 클래스가 아니라 인라인 스타일로 `var(--ds-*)`를
 * 직접 읽는다(StatusBadge와 같은 이유) — Tailwind의 자동 소스 탐지는
 * `@flameware/ui/src`를 기준으로 하고 apps/storybook까지 닿지 않으므로,
 * 여기서 `bg-accent-solid` 같은 클래스를 그냥 적으면 조용히 CSS가 안 나온다.
 * 표가 **보여주는 이름**은 소비처 앱(Tailwind가 실제로 스캔하는 곳)에서
 * 그대로 쓸 유틸리티 클래스 이름이다. */
import { cssVar } from "@flameware/tokens"
import { Td, Th } from "./cell"

const ROLE = {
  bg: { utility: "bg", label: "배경 (bg-*)" },
  fg: { utility: "text", label: "글자 (text-*)" },
  border: { utility: "border", label: "테두리 (border-*)" },
} as const

type Role = keyof typeof ROLE

function rows(role: Role) {
  return Object.keys(cssVar)
    .filter((path) => path.startsWith(`${role}.`))
    .map((path) => {
      const name = path.slice(role.length + 1).replace(/\./g, "-")
      return { path, name, className: `${ROLE[role].utility}-${name}`, varName: cssVar[path as keyof typeof cssVar] }
    })
}

function Swatch({ varName, role }: { varName: string; role: Role }) {
  const size = 40
  if (role === "border") {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: 8,
          border: `2px solid var(${varName})`,
          background: "var(--ds-bg-surface)",
        }}
      />
    )
  }
  if (role === "fg") {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--ds-bg-surface)",
          border: "1px solid var(--ds-border-default)",
          color: `var(${varName})`,
          fontWeight: 700,
        }}
      >
        Ag
      </div>
    )
  }
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 8,
        border: "1px solid var(--ds-border-default)",
        background: `var(${varName})`,
      }}
    />
  )
}

function RoleSection({ role }: { role: Role }) {
  return (
    <div>
      <h3>{ROLE[role].label}</h3>
      <table>
        <thead>
          <tr>
            <Th>견본</Th>
            <Th>유틸리티</Th>
            <Th>semantic 경로</Th>
            <Th>CSS 변수</Th>
          </tr>
        </thead>
        <tbody>
          {rows(role).map((row) => (
            <tr key={row.path}>
              <Td padding="4px 8px 4px 0">
                <Swatch varName={row.varName} role={role} />
              </Td>
              <Td padding="4px 8px 4px 0">
                <code>{row.className}</code>
              </Td>
              <Td padding="4px 8px 4px 0">{row.path}</Td>
              <Td padding="4px 8px 4px 0">
                <code>{row.varName}</code>
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function ColorTable() {
  return (
    <>
      <RoleSection role="bg" />
      <RoleSection role="fg" />
      <RoleSection role="border" />
    </>
  )
}
