/* Foundations/색의 "두 사다리" 절이 읽는 견본.
 *
 * 표가 아니라 **나란히 놓은 그림**인 이유는, 이 절이 말하는 것이 값이 아니라
 * 값들 사이의 관계라서다 — `bg-accent-soft`가 `bg-subtle` 위에서 1.00:1이라는
 * 사실은 스와치 두 개를 따로 보면 보이지 않는다(#337). 소비처가 그것을 모르고
 * 트랙을 `bg-inset`에서 `bg-subtle`로 옮기며 "한 단계 내렸다"고 믿었다.
 *
 * ColorTable과 같은 이유로 Tailwind 클래스가 아니라 인라인 `var(--ds-*)`를
 * 읽는다 — Tailwind의 소스 탐지가 apps/storybook까지 닿지 않아 클래스를 적으면
 * 조용히 CSS가 안 나온다. */
import { Td, Th } from "./cell"

const FILLS = [
  { step: "soft", label: "bg-accent-soft", varName: "--ds-bg-accent-soft" },
  { step: "muted", label: "bg-accent-muted", varName: "--ds-bg-accent-muted" },
  { step: "solid", label: "bg-accent-solid", varName: "--ds-bg-accent-solid" },
] as const

/** 트랙(면) 위에 채움 한 칸을 얹은 미터 — #336·#337이 실패한 바로 그 모양. */
function Meter({ fill, fg }: { fill: string; fg: string }) {
  return (
    <div
      style={{
        background: "var(--ds-bg-subtle)",
        borderRadius: 8,
        padding: 4,
        width: 220,
      }}
    >
      <div
        style={{
          background: `var(${fill})`,
          color: `var(${fg})`,
          borderRadius: 4,
          padding: "6px 10px",
          width: "62%",
          fontSize: 13,
          fontWeight: 600,
          whiteSpace: "nowrap",
        }}
      >
        62%
      </div>
    </div>
  )
}

export function FillLadder() {
  return (
    <table>
      <thead>
        <tr>
          <Th>bg-subtle 트랙 위</Th>
          <Th>채움</Th>
          <Th>그 위 전경</Th>
          <Th>트랙 대비</Th>
        </tr>
      </thead>
      <tbody>
        {FILLS.map((fill) => (
          <tr key={fill.step}>
            <Td padding="6px 12px 6px 0">
              <Meter
                fill={fill.varName}
                fg={fill.step === "solid" ? "--ds-fg-on-solid" : "--ds-fg-default"}
              />
            </Td>
            <Td padding="6px 12px 6px 0">
              <code>{fill.label}</code>
            </Td>
            <Td padding="6px 12px 6px 0">
              <code>{fill.step === "solid" ? "text-on-solid" : "text-default"}</code>
            </Td>
            <Td padding="6px 12px 6px 0">
              {fill.step === "soft" ? "1.00 — 사라진다" : fill.step === "muted" ? "1.39 이상" : "높다"}
            </Td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
