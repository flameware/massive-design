import type { Meta, StoryObj } from "@storybook/react-vite"
import { useEffect, useState } from "react"

/* PROTOTYPE: three Storybook information architectures, switchable via
 * ?variant=A|B|C in the existing Storybook. Delete after issue 59 is decided. */

const meta = {
  title: "Prototype/Storybook boundary",
  parameters: { layout: "fullscreen" },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const components = [
  { name: "Button", cells: 48, hash: "8472d5d50576", coverage: "6 variants × 8 sizes" },
  { name: "Card", cells: 1, hash: "50895e9c5fea", coverage: "1 composition" },
  { name: "Label", cells: 1, hash: "f13a318e70a1", coverage: "1 composition" },
]

const styles = {
  page: { minHeight: "100vh", background: "var(--background)", color: "var(--foreground)", fontFamily: "system-ui, sans-serif" },
  shell: { maxWidth: 1120, margin: "0 auto", padding: "40px 32px 112px" },
  muted: { color: "var(--muted-foreground)" },
  card: { border: "1px solid var(--border)", borderRadius: 12, padding: 20, background: "var(--card)" },
  tag: { display: "inline-block", border: "1px solid var(--border)", borderRadius: 999, padding: "3px 8px", fontSize: 12 },
} as const

function GeneratedTag() {
  return <span style={{ ...styles.tag, color: "#166534", background: "#dcfce7" }}>GENERATED · do not edit</span>
}

function AuthoredTag() {
  return <span style={{ ...styles.tag, color: "#854d0e", background: "#fef9c3" }}>AUTHORED · review here</span>
}

function Matrix() {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 12 }}>
        <thead><tr><th style={{ textAlign: "left", padding: 8 }}>variant ↓ / size →</th>{["xs", "sm", "default", "lg", "icon"].map(x => <th key={x} style={{ padding: 8 }}>{x}</th>)}</tr></thead>
        <tbody>{["default", "destructive", "outline", "secondary", "ghost", "link"].map(v => <tr key={v}><th style={{ textAlign: "left", padding: 8 }}>{v}</th>{[0,1,2,3,4].map(i => <td key={i} style={{ padding: 8, textAlign: "center", borderTop: "1px solid var(--border)" }}><button style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid var(--border)", background: v === "default" ? "var(--primary)" : "transparent", color: v === "default" ? "var(--primary-foreground)" : "inherit" }}>Aa</button></td>)}</tr>)}</tbody>
      </table>
    </div>
  )
}

function VariantA() {
  return <main style={styles.page}><div style={styles.shell}>
    <p style={styles.muted}>A · Component-first reference</p><h1>Button</h1>
    <p style={styles.muted}>A component page is the unit of truth. Generated reference comes first; human guidance follows.</p>
    <section style={{ ...styles.card, marginTop: 28 }}><GeneratedTag/><h2>API surface</h2><Matrix/><p style={styles.muted}>Controls, matrix, state samples, manifest generation and token/literal classification are regenerated from the component manifest.</p></section>
    <section style={{ ...styles.card, marginTop: 20 }}><AuthoredTag/><h2>When to use Button</h2><p>Use for explicit actions. Prefer one primary action per region. Link-style buttons remain actions, not navigation.</p><h3>Invest Diary evidence</h3><p>Used for “거래 추가” and row actions in the representative investment-history screen.</p></section>
    <section style={{ ...styles.card, marginTop: 20 }}><AuthoredTag/><h2>Quality and delivery</h2><ul><li>Keyboard and accessible-name expectations</li><li>Light/Dark and focus-state review notes</li><li>Code → manifest → Figma document → human publish checkpoint</li></ul></section>
  </div></main>
}

function VariantB() {
  return <main style={styles.page}><div style={styles.shell}>
    <p style={styles.muted}>B · Audience journeys</p><h1>Build the investment-history screen</h1>
    <p style={styles.muted}>The representative screen is the front door; components and pipeline evidence are supporting routes.</p>
    <section style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 20, marginTop: 28 }}>
      <div style={styles.card}><AuthoredTag/><h2>Screen recipe</h2><ol><li>Desktop: Table with sortable columns and row actions</li><li>Mobile: ListRow preserving the same information priorities</li><li>Filters and empty/loading/error states</li></ol><p style={styles.muted}>Human-authored rationale explains why these parts belong together.</p></div>
      <div style={styles.card}><GeneratedTag/><h2>Required inventory</h2>{components.map(c => <p key={c.name}><strong>{c.name}</strong><br/><span style={styles.muted}>{c.coverage} · {c.hash}</span></p>)}<p style={styles.muted}>Missing manifest entry fails the inventory gate.</p></div>
    </section>
    <section style={{ ...styles.card, marginTop: 20 }}><h2>Drill into Button</h2><div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}><GeneratedTag/><span style={styles.tag}>48 combinations</span><span style={styles.tag}>5 state samples</span><span style={styles.tag}>Light + Dark</span></div><p>Open the component reference for controls, full matrix, tokens, and accessibility checks.</p></section>
    <section style={{ ...styles.card, marginTop: 20 }}><AuthoredTag/><h2>What this proves</h2><p>The catalog grows only when the chosen screen exposes a reusable system gap; it is not a general component wishlist.</p></section>
  </div></main>
}

function VariantC() {
  return <main style={styles.page}><div style={styles.shell}>
    <p style={styles.muted}>C · Trust and pipeline first</p><h1>Is the design system current?</h1>
    <p style={styles.muted}>The home surface answers freshness and coverage first, then links to reference and editorial guidance.</p>
    <section style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 28 }}>{[
      ["Code", "3 manifests verified", "Source of truth"], ["Storybook", "3 / 3 catalogued", "Build + a11y green"], ["Figma", "Human publish pending", "Document differs from CURRENT"],
    ].map(([name,status,note]) => <div key={name} style={styles.card}><h2>{name}</h2><strong>{status}</strong><p style={styles.muted}>{note}</p></div>)}</section>
    <section style={{ ...styles.card, marginTop: 20 }}><GeneratedTag/><h2>Coverage ledger</h2>{components.map(c => <div key={c.name} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", padding: "12px 0", borderBottom: "1px solid var(--border)" }}><strong>{c.name}</strong><span>{c.cells} combinations</span><code>{c.hash}</code></div>)}</section>
    <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 20 }}><div style={styles.card}><AuthoredTag/><h2>Quality policy</h2><p>Explain review expectations once: accessibility, themes, state behavior, and supported composition boundaries.</p></div><div style={styles.card}><AuthoredTag/><h2>Update runbook</h2><p>Explain the human checkpoints once: regenerate, verify Storybook, inject in place, publish, and confirm CURRENT.</p></div></section>
  </div></main>
}

const variants = [
  { key: "A", name: "Component-first", component: VariantA },
  { key: "B", name: "Screen-first", component: VariantB },
  { key: "C", name: "Pipeline-first", component: VariantC },
] as const

function readVariant() {
  if (typeof window === "undefined") return "A"
  const value = new URL(window.location.href).searchParams.get("variant")
  return variants.some(item => item.key === value) ? value! : "A"
}

function Prototype() {
  const [current, setCurrent] = useState(readVariant)
  const index = variants.findIndex(item => item.key === current)
  const selected = variants[index] ?? variants[0]
  const select = (next: number) => {
    const item = variants[(next + variants.length) % variants.length]
    const url = new URL(window.location.href)
    url.searchParams.set("variant", item.key)
    window.history.replaceState({}, "", url)
    setCurrent(item.key)
  }
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (target?.matches("input, textarea, [contenteditable]")) return
      if (event.key === "ArrowLeft") select(index - 1)
      if (event.key === "ArrowRight") select(index + 1)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [index])
  const Page = selected.component
  return <><Page/><nav style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 14, alignItems: "center", padding: "10px 14px", borderRadius: 999, background: "#111827", color: "white", boxShadow: "0 8px 30px #0005", zIndex: 20 }} aria-label="Prototype variants"><button onClick={() => select(index - 1)} aria-label="Previous variant">←</button><strong>{selected.key} · {selected.name}</strong><button onClick={() => select(index + 1)} aria-label="Next variant">→</button></nav></>
}

export const CompareBoundaries: Story = { render: () => <Prototype/> }
