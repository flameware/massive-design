import { typeSizes } from "./scale"
import { Td, Th } from "./cell"

const TIER_LINE_HEIGHT = { body: 1.6, mid: 1.4, heading: 1.25 }
const TIER_TRACKING = { body: "0em", mid: "-0.01em", heading: "-0.02em" }

export function TypeScale() {
  return (
    <table>
      <thead>
        <tr>
          <Th>이름</Th>
          <Th>크기</Th>
          <Th>줄 높이</Th>
          <Th>자간</Th>
          <Th>견본</Th>
        </tr>
      </thead>
      <tbody>
        {typeSizes.map((size) => (
          <tr key={size.name}>
            <Td padding="6px 12px 6px 0">
              <code>text-{size.name}</code>
            </Td>
            <Td padding="6px 12px 6px 0">{size.px}px</Td>
            <Td padding="6px 12px 6px 0">{TIER_LINE_HEIGHT[size.tier]}</Td>
            <Td padding="6px 12px 6px 0">{TIER_TRACKING[size.tier]}</Td>
            <Td
              style={{
                fontSize: size.px,
                lineHeight: TIER_LINE_HEIGHT[size.tier],
                letterSpacing: TIER_TRACKING[size.tier],
                fontFamily: "var(--font-sans)",
              }}
            >
              massive-design 디자인 시스템
            </Td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
