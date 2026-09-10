import { spacePresets } from "./scale"

export function SpaceScale() {
  return (
    <table>
      <thead>
        <tr>
          <th style={{ textAlign: "left" }}>배수</th>
          <th style={{ textAlign: "left" }}>값</th>
          <th style={{ textAlign: "left" }}>견본</th>
        </tr>
      </thead>
      <tbody>
        {spacePresets.map((preset) => (
          <tr key={preset.name}>
            <td style={{ padding: "6px 12px 6px 0" }}>
              <code>p-{preset.name} · gap-{preset.name} …</code>
            </td>
            <td style={{ padding: "6px 12px 6px 0" }}>{preset.value}</td>
            <td style={{ padding: "6px 0" }}>
              <div style={{ background: "var(--ds-bg-accent-solid)", width: preset.value, height: 12 }} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
