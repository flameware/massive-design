import { radii } from "./scale"

export function RadiusScale() {
  return (
    <table>
      <thead>
        <tr>
          <th style={{ textAlign: "left" }}>이름</th>
          <th style={{ textAlign: "left" }}>값</th>
          <th style={{ textAlign: "left" }}>견본</th>
        </tr>
      </thead>
      <tbody>
        {radii.map((radius) => (
          <tr key={radius.name}>
            <td style={{ padding: "6px 12px 6px 0" }}>
              <code>rounded-{radius.name}</code>
            </td>
            <td style={{ padding: "6px 12px 6px 0" }}>
              {radius.value} ({radius.px}px)
            </td>
            <td style={{ padding: "6px 0" }}>
              <div
                style={{
                  width: 48,
                  height: 32,
                  borderRadius: radius.value,
                  background: "var(--ds-bg-neutral-soft)",
                  border: "1px solid var(--ds-border-default)",
                }}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
