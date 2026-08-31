import { createHash } from "node:crypto"
import { copyFile, mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises"
import { spawnSync } from "node:child_process"
import path from "node:path"

const root = path.resolve(import.meta.dirname, "..")
const recordPath = path.join(root, "verification/repo-verification.json")
const figmaBaselinePath = path.join(root, "verification/figma-baseline.json")
const inputs = [
  "apps/storybook/.storybook",
  "apps/storybook/package.json",
  "apps/storybook/scripts",
  "apps/storybook/stories",
  "bun.lock",
  "package.json",
  "packages/tokens/package.json",
  "packages/tokens/scripts",
  "packages/tokens/tokens",
  "packages/ui/package.json",
  "packages/ui/scripts",
  "packages/ui/src",
  "tsconfig.base.json",
]

async function filesAt(relative) {
  const absolute = path.join(root, relative)
  const metadata = await stat(absolute)
  if (metadata.isFile()) return [relative]
  const names = await readdir(absolute)
  return (await Promise.all(names.sort().map((name) => filesAt(path.join(relative, name))))).flat()
}

async function digest(paths) {
  const hash = createHash("sha256")
  for (const file of (await Promise.all(paths.map(filesAt))).flat().sort()) {
    hash.update(`${file}\0`)
    hash.update(await readFile(path.join(root, file)))
    hash.update("\0")
  }
  return hash.digest("hex")
}

function run(label, command, args) {
  process.stdout.write(`\n[${label}] ${command} ${args.join(" ")}\n`)
  const result = spawnSync(command, args, { cwd: root, encoding: "utf8", stdio: "inherit" })
  return { label, result: result.status === 0 ? "PASS" : "FAIL", exitCode: result.status ?? 1 }
}

const startedAt = new Date().toISOString()
const checks = []
checks.push(run("generate tokens", "bun", ["run", "--cwd", "packages/tokens", "tokens:build"]))
checks.push(run("generate manifests", "bun", ["run", "--cwd", "packages/ui", "manifest"]))
checks.push(run("generate Storybook catalog", "bun", ["run", "--cwd", "apps/storybook", "catalog"]))
checks.push(run("repo check", "bun", ["run", "check"]))
checks.push(run("repo test", "bun", ["run", "test"]))
checks.push(run("Storybook production build", "bun", ["run", "--cwd", "apps/storybook", "build-storybook"]))
checks.push(run("Storybook axe", "bun", ["run", "--cwd", "apps/storybook", "test:a11y"]))

const inputDigest = await digest(inputs)
const tokenArtifactHash = await digest(["packages/tokens/dist"])
const manifestIndex = JSON.parse(await readFile(path.join(root, "packages/ui/dist/manifest/index.gen.json"), "utf8"))
let a11yReport = null
try {
  a11yReport = JSON.parse(await readFile(path.join(root, "apps/storybook/storybook-static/a11y-report.json"), "utf8"))
} catch {
  // The failed check and resume point remain recordable even if axe could not emit details.
}
const targetCommit = spawnSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).stdout.trim()
const codeChecks = checks.slice(0, 5)
const storybookChecks = checks.slice(5)
const codeResult = codeChecks.every((check) => check.result === "PASS") ? "PASS" : "FAIL"
const storybookAutomatedResult = codeResult === "PASS"
  ? storybookChecks.every((check) => check.result === "PASS") ? "PASS" : "FAIL"
  : "UNKNOWN"
const failed = checks.find((check) => check.result === "FAIL")

const record = {
  schemaVersion: 2,
  kind: "repo-verification",
  result: failed ? "FAIL" : storybookAutomatedResult === "PASS" ? "PENDING_HUMAN" : "UNKNOWN",
  targetCommit,
  inputDigest,
  tokenArtifactHash,
  components: manifestIndex.components.map(({ component, hash }) => ({ component, manifestHash: hash, tokenArtifactHash })),
  stages: {
    CODE_VERIFIED: { result: codeResult, checkedAt: startedAt, checks: codeChecks },
    STORYBOOK_VERIFIED: {
      result: storybookAutomatedResult === "PASS" ? "PENDING_HUMAN" : storybookAutomatedResult,
      checkedAt: startedAt,
      automatedResult: storybookAutomatedResult,
      checks: storybookChecks,
      a11y: a11yReport,
      ...(storybookAutomatedResult === "PASS" ? {
        reason: "Review the changed Storybook components in Light/Dark and affected states, then run sync:review-storybook.",
      } : {}),
    },
  },
  lastCompletedStage: codeResult === "PASS" ? "CODE_VERIFIED" : null,
  failure: failed ? { stage: storybookChecks.includes(failed) ? "STORYBOOK_VERIFIED" : "CODE_VERIFIED", check: failed.label, exitCode: failed.exitCode } : null,
  resumeAt: failed?.label ?? "Storybook visual review",
}

await writeFile(recordPath, `${JSON.stringify(record, null, 2)}\n`)
await mkdir(path.join(root, "apps/storybook/storybook-static/verification"), { recursive: true })
await copyFile(recordPath, path.join(root, "apps/storybook/storybook-static/verification/repo-verification.json"))
try {
  await copyFile(figmaBaselinePath, path.join(root, "apps/storybook/storybook-static/verification/figma-baseline.json"))
} catch (error) {
  if (error?.code !== "ENOENT") throw error
}
console.log(`\nVerification record: ${path.relative(root, recordPath)}`)
console.log(`inputDigest: ${inputDigest}`)
console.log(`resumeAt: ${record.resumeAt}`)
process.exit(failed ? 1 : 0)
