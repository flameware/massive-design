import { spacePresets } from "./scale"
import { Td, Th } from "./cell"

export function SpaceScale() {
  return (
    <table>
      <thead>
        <tr>
          <Th>배수</Th>
          <Th>값</Th>
          <Th>견본</Th>
        </tr>
      </thead>
      <tbody>
        {spacePresets.map((preset) => (
          <tr key={preset.name}>
            <Td padding="6px 12px 6px 0">
              <code>p-{preset.name} · gap-{preset.name} …</code>
            </Td>
            <Td padding="6px 12px 6px 0">{preset.value}</Td>
            <Td padding="6px 0">
              <div style={{ background: "var(--ds-bg-accent-solid)", width: preset.value, height: 12 }} />
            </Td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
