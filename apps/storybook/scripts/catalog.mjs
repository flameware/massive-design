import { readFile, writeFile } from "node:fs/promises"
import path from "node:path"

const root = path.resolve(import.meta.dirname, "../../..")
const manifestRoot = path.join(root, "packages/ui/dist/manifest")
const output = path.join(root, "apps/storybook/stories/catalog.gen.ts")
const storiesOutput = path.join(root, "apps/storybook/stories/Components.stories.tsx")
const verify = process.argv.includes("--verify")

const index = JSON.parse(await readFile(path.join(manifestRoot, "index.gen.json"), "utf8"))
const components = await Promise.all(index.components.map(async (entry) => {
  const manifest = JSON.parse(await readFile(path.join(manifestRoot, entry.path), "utf8"))
  return {
    component: manifest.component,
    displayName: manifest.component.split("-").map((part) => `${part[0].toUpperCase()}${part.slice(1)}`).join(" "),
    hash: manifest.hash,
    cells: manifest.cells.length,
    axes: manifest.axes,
    anatomy: manifest.anatomy ?? [],
    configurationStates: manifest.configurationStates ?? {},
    reference: manifest.reference,
    stateSamples: manifest.cells.some((cell) => cell.state !== null),
    source: manifest.source,
  }
}))

const contents = `/* GENERATED from @massive/ui manifests. Do not edit. */\nexport const catalog = ${JSON.stringify(components, null, 2)} as const\n`
const storyName = (name) => name.split("-").map((part) => `${part[0].toUpperCase()}${part.slice(1)}`).join("")
const stories = `/* GENERATED from @massive/ui manifests. Do not edit. */
import type { Meta, StoryObj } from "@storybook/react-vite"
import { CatalogReference } from "./CatalogReference"
import { catalog } from "./catalog.gen"

const meta = { title: "Components/Manifest references", parameters: { layout: "fullscreen" } } satisfies Meta<Record<string, string>>
export default meta
type Story = StoryObj<Record<string, string>>

function story(component: (typeof catalog)[number]["component"]): Story {
  const entry = catalog.find((item) => item.component === component)!
  const controls = { ...entry.axes, ...entry.configurationStates } as Record<string, readonly string[]>
  const args = Object.fromEntries(Object.entries(controls).map(([axis, values]) => [axis, values[0]]))
  return {
    args,
    argTypes: Object.fromEntries(Object.entries(controls).map(([axis, values]) => [axis, { control: "select", options: values }])),
    render: (selection) => <CatalogReference entry={entry} selection={selection}/>,
  }
}

${components.map((entry) => `export const ${storyName(entry.component)} = story(${JSON.stringify(entry.component)})`).join("\n")}
`

if (verify) {
  let current = ""
  try { current = await readFile(output, "utf8") } catch {}
  let currentStories = ""
  try { currentStories = await readFile(storiesOutput, "utf8") } catch {}
  if (current !== contents || currentStories !== stories) {
    console.error("Storybook catalog is stale. Run: bun run --cwd apps/storybook catalog")
    process.exit(1)
  }
  console.log(`Storybook catalog: ${components.length} manifests represented exactly once`)
} else {
  await writeFile(output, contents)
  await writeFile(storiesOutput, stories)
  console.log(`Generated Storybook catalog and ${components.length} reference stories`)
}
