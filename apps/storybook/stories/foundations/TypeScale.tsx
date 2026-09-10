import { typeSizes } from "./scale"

const TIER_LINE_HEIGHT = { body: 1.6, mid: 1.4, heading: 1.25 }
const TIER_TRACKING = { body: "0em", mid: "-0.01em", heading: "-0.02em" }

export function TypeScale() {
  return (
    <table>
      <thead>
        <tr>
          <th style={{ textAlign: "left" }}>이름</th>
          <th style={{ textAlign: "left" }}>크기</th>
          <th style={{ textAlign: "left" }}>줄 높이</th>
          <th style={{ textAlign: "left" }}>자간</th>
          <th style={{ textAlign: "left" }}>견본</th>
        </tr>
      </thead>
      <tbody>
        {typeSizes.map((size) => (
          <tr key={size.name}>
            <td style={{ padding: "6px 12px 6px 0" }}>
              <code>text-{size.name}</code>
            </td>
            <td style={{ padding: "6px 12px 6px 0" }}>
              {size.px}px
            </td>
            <td style={{ padding: "6px 12px 6px 0" }}>{TIER_LINE_HEIGHT[size.tier]}</td>
            <td style={{ padding: "6px 12px 6px 0" }}>{TIER_TRACKING[size.tier]}</td>
            <td
              style={{
                fontSize: size.px,
                lineHeight: TIER_LINE_HEIGHT[size.tier],
                letterSpacing: TIER_TRACKING[size.tier],
                fontFamily: "var(--font-sans)",
              }}
            >
              massive-design 디자인 시스템
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
