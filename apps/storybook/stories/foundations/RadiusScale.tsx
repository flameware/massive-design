import { radii } from "./scale"
import { Td, Th } from "./cell"

export function RadiusScale() {
  return (
    <table>
      <thead>
        <tr>
          <Th>이름</Th>
          <Th>값</Th>
          <Th>견본</Th>
        </tr>
      </thead>
      <tbody>
        {radii.map((radius) => (
          <tr key={radius.name}>
            <Td padding="6px 12px 6px 0">
              <code>rounded-{radius.name}</code>
            </Td>
            <Td padding="6px 12px 6px 0">
              {radius.value} ({radius.px}px)
            </Td>
            <Td padding="6px 0">
              <div
                style={{
                  width: 48,
                  height: 32,
                  borderRadius: radius.value,
                  background: "var(--ds-bg-neutral-soft)",
                  border: "1px solid var(--ds-border-default)",
                }}
              />
            </Td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
