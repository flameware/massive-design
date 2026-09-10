/* 상태 배지 — 문서 페이지 머리와 상태 표가 같은 그림을 쓴다.
 *
 * DS 컴포넌트가 아니다(Badge는 #283). 문서 껍데기라 인라인 스타일로 두고,
 * 색은 semantic 변수를 직접 읽는다 — 문서 자신은 Tailwind 유틸리티를 쓰지
 * 않으므로 primitive 누출 게이트의 관심 밖이다. */
import type { Status } from "./meta"

const TONE: Record<Status, { bg: string; fg: string; label: string }> = {
  planned: { bg: "--ds-bg-neutral-soft", fg: "--ds-fg-muted", label: "planned · 아직 없다" },
  preview: { bg: "--ds-bg-accent-soft", fg: "--ds-fg-accent", label: "preview · 모양이 바뀔 수 있다" },
  stable: { bg: "--ds-bg-success-soft", fg: "--ds-fg-success", label: "stable · 깨는 변경은 major다" },
  deprecated: { bg: "--ds-bg-danger-soft", fg: "--ds-fg-danger", label: "deprecated · 쓰지 않는다" },
}

export function StatusBadge({ status }: { status: Status }) {
  const tone = TONE[status]
  return (
    <span
      style={{
        display: "inline-block",
        padding: "0.125rem 0.5rem",
        borderRadius: "0.5rem",
        fontSize: "0.8125rem",
        fontWeight: 500,
        whiteSpace: "nowrap",
        background: `var(${tone.bg})`,
        color: `var(${tone.fg})`,
      }}
    >
      {tone.label}
    </span>
  )
}
