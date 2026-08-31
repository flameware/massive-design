import { readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.resolve(import.meta.dirname, "..")
const recordPath = path.join(root, "verification/repo-verification.json")

function valueAfter(args, name) {
  const index = args.indexOf(name)
  return index === -1 ? null : args[index + 1]
}

export function parseReviewArgs(args) {
  const result = valueAfter(args, "--result") ?? "PASS"
  const reviewer = valueAfter(args, "--reviewer")
  const scope = valueAfter(args, "--scope")
  const reason = valueAfter(args, "--reason")
  if (!['PASS', 'FAIL'].includes(result)) throw new Error("--result는 PASS 또는 FAIL이어야 한다")
  if (!reviewer) throw new Error("--reviewer가 필요하다")
  if (!scope) throw new Error("--scope가 필요하다")
  if (result === 'FAIL' && !reason) throw new Error("FAIL에는 --reason이 필요하다")
  return { result, reviewer, scope, reason }
}

export function applyStorybookReview(record, review, checkedAt = new Date().toISOString()) {
  const stage = record.stages?.STORYBOOK_VERIFIED
  if (!stage || stage.automatedResult !== 'PASS') {
    throw new Error('Storybook 자동 검사가 PASS인 최신 preflight 기록이 필요하다')
  }
  stage.result = review.result
  stage.visualReview = {
    reviewer: review.reviewer,
    checkedAt,
    scope: review.scope,
    ...(review.reason ? { reason: review.reason } : {}),
  }
  delete stage.reason
  if (review.result === 'PASS') {
    record.result = 'PASS'
    record.completedAt = checkedAt
    record.lastCompletedStage = 'STORYBOOK_VERIFIED'
    record.failure = null
    record.resumeAt = null
  } else {
    record.result = 'FAIL'
    delete record.completedAt
    record.lastCompletedStage = 'CODE_VERIFIED'
    record.failure = { stage: 'STORYBOOK_VERIFIED', check: 'Storybook visual review', reason: review.reason }
    record.resumeAt = 'sync:preflight after fixing the owning layer'
  }
  return record
}

async function main() {
  const review = parseReviewArgs(process.argv.slice(2))
  const record = JSON.parse(await readFile(recordPath, 'utf8'))
  applyStorybookReview(record, review)
  await writeFile(recordPath, `${JSON.stringify(record, null, 2)}\n`)
  console.log(`Storybook visual review: ${review.result}`)
  console.log(`reviewer: ${review.reviewer}`)
  console.log(`scope: ${review.scope}`)
  console.log(`Repo verification: ${record.result}`)
  console.log(`resumeAt: ${record.resumeAt ?? 'none'}`)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main()
