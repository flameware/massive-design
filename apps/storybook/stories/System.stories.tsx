import type { Meta, StoryObj } from "@storybook/react-vite"
import { useEffect, useState } from "react"
import { catalog } from "./catalog.gen"

const meta = { title: "System/Trust and workflow", parameters: { layout: "fullscreen" } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

type RecordState = { inputDigest?: string; stages?: Record<string, { result?: string; reason?: string }>; resumeAt?: string }
const stageNames = ["CODE_VERIFIED", "STORYBOOK_VERIFIED", "FIGMA_DOCUMENT_SYNCED", "FIGMA_LIBRARY_CURRENT"]

export const FreshnessAndCoverage: Story = { render: () => {
  const [record, setRecord] = useState<RecordState | null>(null)
  useEffect(() => { fetch("./verification/design-system-sync.json").then((response) => response.ok ? response.json() : null).then(setRecord).catch(() => setRecord(null)) }, [])
  return <main className="mx-auto grid max-w-6xl gap-6 p-8"><header><p className="text-sm text-muted-foreground">Code → manifest → Storybook → Figma</p><h1 className="text-3xl font-semibold">Is the design system current?</h1><p>세대별 누적 상태를 읽는다. 뒤 채널의 대기나 UNKNOWN은 앞 단계의 정상 증거를 지우지 않는다.</p></header>
    <section className="grid gap-3 md:grid-cols-4">{stageNames.map((stage) => <article className="rounded-lg border p-4" key={stage}><h2 className="text-sm font-semibold">{stage}</h2><strong className="text-xl">{record?.stages?.[stage]?.result ?? "UNKNOWN"}</strong><p className="text-sm text-muted-foreground">{record?.stages?.[stage]?.reason ?? "Verification record evidence"}</p></article>)}</section>
    <p className="text-sm">inputDigest: <code>{record?.inputDigest ?? "record unavailable"}</code> · resumeAt: <strong>{record?.resumeAt ?? "sync:preflight"}</strong></p>
    <section className="rounded-lg border p-5"><p className="text-sm text-muted-foreground">GENERATED · do not edit</p><h2 className="text-xl font-semibold">Coverage ledger</h2><div className="mt-3 overflow-x-auto"><table className="w-full"><thead><tr><th className="p-2 text-left">Component</th><th className="p-2 text-left">Combinations</th><th className="p-2 text-left">Generation</th><th className="p-2 text-left">Samples</th></tr></thead><tbody>{catalog.map((entry) => <tr className="border-t" key={entry.component}><td className="p-2"><a href={`?path=/story/components-manifest-references--${entry.component}`}>{entry.displayName}</a></td><td className="p-2">{entry.cells}</td><td className="p-2"><code>{entry.hash}</code></td><td className="p-2">Light · Dark{entry.stateSamples ? " · interaction" : ""}</td></tr>)}</tbody></table></div></section>
  </main>
} }

export const QualityPolicy: Story = { render: () => <main className="mx-auto grid max-w-3xl gap-6 p-8"><h1 className="text-3xl font-semibold">Quality policy</h1><section><h2 className="text-xl font-semibold">Accessibility</h2><p>공개 story는 키보드 접근, 접근 가능한 이름, focus-visible을 보존한다. production build 뒤 모든 story에 axe를 실행하며 확정 violation은 심각도와 무관하게 0이어야 한다. incomplete는 숨기지 않고 검증 기록에 판단 대상으로 남긴다.</p></section><section><h2 className="text-xl font-semibold">Themes and states</h2><p>toolbar로 Light/Dark를 모두 검토한다. 구성 상태는 controls로 조립하고, hover·pressed·focus·disabled는 별도 상호작용 상태 견본 요구로 취급한다. 상태 견본은 variant 축이 아니다.</p></section><section><h2 className="text-xl font-semibold">Composition boundary</h2><p>Table과 ListRow는 투자 이력의 반복 가능한 기반만 제공한다. 정렬·필터·선택 모델, breakpoint 전환, pagination, 완성 화면은 소비처 책임이다.</p></section></main> }

export const UpdateRunbook: Story = { render: () => <main className="mx-auto grid max-w-3xl gap-5 p-8"><h1 className="text-3xl font-semibold">Update runbook</h1><ol className="list-decimal space-y-3 pl-6"><li>구현 정본을 이름으로 찾아 제자리에서 변경한다.</li><li><code>bun run sync:preflight</code>로 token·manifest·Storybook 생성과 check·test·build·axe를 실행한다. 자동 검사가 통과하면 Storybook은 <code>PENDING_HUMAN</code>이다.</li><li>변경된 컴포넌트의 Light/Dark와 영향 상태를 확인하고 <code>sync:review-storybook</code>으로 확인자·범위를 기록해 <code>STORYBOOK_VERIFIED: PASS</code>로 만든다. 전역 token·base 변경은 전체 카탈로그를 본다.</li><li>Figma 문서에서 01~07과 같은 이름의 component를 제자리 주입하고 멱등 재실행을 확인한다.</li><li>변경된 세대와 생성된 Foundations 스와치를 사람이 시각 검토하고 라이브러리를 발행한다. Variables·Text Style·Effect Style의 미발행 변경 없음도 사람이 확인한다.</li><li>모든 대상의 <code>CURRENT</code>와 소비 파일 구독·원격 import를 확인한 뒤에만 완료로 판정한다.</li></ol><p>시각 오류는 결과물을 손수정하지 않고 최초 원인 계층에서 고친다. 중단하면 검증 기록의 <code>resumeAt</code>에서 재개한다.</p></main> }
