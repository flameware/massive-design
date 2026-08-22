import { readFile, writeFile } from "node:fs/promises"
import path from "node:path"

const root = path.resolve(import.meta.dirname, "../../..")
const manifestRoot = path.join(root, "packages/ui/dist/manifest")
const output = path.join(root, "apps/storybook/stories/catalog.gen.ts")
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
    stateSamples: manifest.cells.some((cell) => cell.state !== null),
    source: manifest.source,
  }
}))

const contents = `/* GENERATED from @massive/ui manifests. Do not edit. */\nexport const catalog = ${JSON.stringify(components, null, 2)} as const\n`

if (verify) {
  let current = ""
  try { current = await readFile(output, "utf8") } catch {}
  if (current !== contents) {
    console.error("Storybook catalog is stale. Run: bun run --cwd apps/storybook catalog")
    process.exit(1)
  }
  console.log(`Storybook catalog: ${components.length} manifests represented exactly once`)
} else {
  await writeFile(output, contents)
  console.log(`Generated ${path.relative(root, output)} (${components.length} components)`)
}
