import type { Meta, StoryObj } from "@storybook/react-vite"
import { useEffect, useState } from "react"
import { catalog } from "./catalog.gen"

const meta = { title: "System/Trust and workflow", parameters: { layout: "fullscreen" } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

type RecordState = {
  inputDigest?: string
  tokenArtifactHash?: string
  components?: { component: string; manifestHash: string }[]
  result?: string
  stages?: Record<string, { result?: string; reason?: string }>
  resumeAt?: string | null
}
const repoStages = ["CODE_VERIFIED", "STORYBOOK_VERIFIED"]
const figmaStages = ["FIGMA_DOCUMENT_SYNCED", "FIGMA_LIBRARY_CURRENT"]

function StageCards({ names, record }: { names: string[]; record: RecordState | null }) {
  return <section className="grid gap-3 md:grid-cols-2">{names.map((stage) => <article className="rounded-lg border p-4" key={stage}><h2 className="text-sm font-semibold">{stage}</h2><strong className="text-xl">{record?.stages?.[stage]?.result ?? "UNKNOWN"}</strong><p className="text-sm text-muted-foreground">{record?.stages?.[stage]?.reason ?? "검증 기록 증거 없음"}</p></article>)}</section>
}

export const FreshnessAndCoverage: Story = { render: () => {
  const [repoRecord, setRepoRecord] = useState<RecordState | null>(null)
  const [figmaBaseline, setFigmaBaseline] = useState<RecordState | null>(null)
  useEffect(() => {
    fetch("./verification/repo-verification.json").then((response) => response.ok ? response.json() : null).then(setRepoRecord).catch(() => setRepoRecord(null))
    fetch("./verification/figma-baseline.json").then((response) => response.ok ? response.json() : null).then(setFigmaBaseline).catch(() => setFigmaBaseline(null))
  }, [])
  const baselineHashes = new Map(figmaBaseline?.components?.map(({ component, manifestHash }) => [component, manifestHash]))
  const changedComponents = repoRecord?.components?.filter(({ component, manifestHash }) => baselineHashes.get(component) !== manifestHash) ?? []
  const tokenChanged = Boolean(repoRecord?.tokenArtifactHash && repoRecord.tokenArtifactHash !== figmaBaseline?.tokenArtifactHash)
  const sameGeneration = Boolean(repoRecord && figmaBaseline && !tokenChanged && changedComponents.length === 0 && repoRecord.components?.length === figmaBaseline.components?.length)
  return <main className="mx-auto grid max-w-6xl gap-6 p-8"><header><p className="text-sm text-muted-foreground">Repo verification · explicit Figma Sync</p><h1 className="text-3xl font-semibold">디자인 시스템이 최신 상태인가?</h1><p>Repo verification은 Storybook에서 독립적으로 완료된다. Figma 기준선은 사용자가 Sync를 요청할 때만 전진한다.</p></header>
    <section className="grid gap-3"><div><h2 className="text-xl font-semibold">Repo verification</h2><p className="text-sm text-muted-foreground">현재 결과: {repoRecord?.result ?? "UNKNOWN"}</p></div><StageCards names={repoStages} record={repoRecord} /></section>
    <section className="grid gap-3"><div><h2 className="text-xl font-semibold">Figma 공개 기준선</h2><p className="text-sm text-muted-foreground">{sameGeneration ? "같은 세대" : `다른 세대 · 명시적 Figma Sync 전까지 허용됨 · 토큰 ${tokenChanged ? "변경됨" : "동일"} · 컴포넌트 ${changedComponents.length}개 변경`}</p></div><StageCards names={figmaStages} record={figmaBaseline} /></section>
    <p className="text-sm">Repo inputDigest: <code>{repoRecord?.inputDigest ?? "기록 없음"}</code> · Figma inputDigest: <code>{figmaBaseline?.inputDigest ?? "기준선 없음"}</code> · resumeAt: <strong>{repoRecord?.resumeAt ?? "none"}</strong></p>
    <section className="rounded-lg border p-5"><p className="text-sm text-muted-foreground">생성됨 · 직접 고치지 말 것</p><h2 className="text-xl font-semibold">컴포넌트 검증 현황표</h2><div className="mt-3 overflow-x-auto"><table className="w-full"><thead><tr><th className="p-2 text-left">컴포넌트</th><th className="p-2 text-left">조합</th><th className="p-2 text-left">세대</th><th className="p-2 text-left">확인 화면</th></tr></thead><tbody>{catalog.map((entry) => <tr className="border-t" key={entry.component}><td className="p-2"><a href={`?path=/story/components-manifest-references--${entry.component}`}>{entry.displayName}</a></td><td className="p-2">{entry.cells}</td><td className="p-2"><code>{entry.hash}</code></td><td className="p-2">Light · Dark{entry.stateSamples ? " · interaction" : ""}</td></tr>)}</tbody></table></div></section>
  </main>
} }

export const QualityPolicy: Story = { render: () => <main className="mx-auto grid max-w-3xl gap-6 p-8"><h1 className="text-3xl font-semibold">품질 정책</h1><section><h2 className="text-xl font-semibold">접근성</h2><p>공개 story는 키보드 접근, 접근 가능한 이름, focus-visible을 보존한다. production build 뒤 모든 story에 axe를 실행하며 확정 violation은 심각도와 무관하게 0이어야 한다. incomplete는 숨기지 않고 검증 기록에 판단 대상으로 남긴다.</p></section><section><h2 className="text-xl font-semibold">테마와 상태</h2><p>toolbar로 Light/Dark를 모두 검토한다. 구성 상태는 controls로 조립하고, hover·pressed·focus·disabled는 별도 상호작용 상태 견본 요구로 취급한다. 상태 견본은 variant 축이 아니다.</p></section><section><h2 className="text-xl font-semibold">합성 범위</h2><p>Table과 ListRow는 투자 이력의 반복 가능한 기반만 제공한다. 정렬·필터·선택 모델, breakpoint 전환, pagination, 완성 화면은 소비처 책임이다.</p></section></main> }

export const UpdateRunbook: Story = { render: () => <main className="mx-auto grid max-w-3xl gap-5 p-8"><h1 className="text-3xl font-semibold">갱신 절차</h1><section><h2 className="text-xl font-semibold">Repo verification</h2><ol className="list-decimal space-y-3 pl-6"><li>구현 정본을 이름으로 찾아 제자리에서 변경한다.</li><li><code>bun run sync:preflight</code>로 token·manifest와 Figma용 로컬 산출물을 생성하고 check·test·Storybook build·axe를 실행한다.</li><li>변경된 컴포넌트의 Light/Dark와 영향 상태를 확인하고 <code>sync:review-storybook</code>으로 기록한다.</li><li><code>CODE_VERIFIED</code>와 <code>STORYBOOK_VERIFIED</code>가 PASS이면 작업을 완료한다.</li></ol></section><section><h2 className="text-xl font-semibold">Figma Sync · 명시적 요청 전용</h2><p>사용자가 명시적으로 요청할 때 전용 GitHub issue를 만들고 최신 Repo verification 세대를 문서에 주입한다. 멱등 검증·시각 확인·사람 발행·발행 상태 재확인까지 완료한다. Figma가 뒤처진 상태는 Repo verification 실패가 아니다.</p></section><p>시각 오류는 결과물을 손수정하지 않고 최초 원인 계층에서 고친다. <code>resumeAt</code>은 실패하거나 중단된 필수 단계에만 쓴다.</p></main> }
