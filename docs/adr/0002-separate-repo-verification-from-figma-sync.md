# Repo verification과 Figma Sync를 독립 작업으로 분리한다

구현 정본 변경은 `CODE_VERIFIED`와 `STORYBOOK_VERIFIED`를 획득하는 Repo verification에서 완료한다. Figma MCP·skill의 높은 토큰 및 실행 시간 비용을 모든 코드 변경에 부과하지 않기 위해, Figma 드리프트는 기간 제한 없이 허용하고 사용자가 명시적으로 요청할 때만 전용 GitHub issue로 Figma Sync를 시작한다.

Repo verification은 Figma용 토큰 산출물·매니페스트·번역표·세대 해시의 로컬 생성과 검증을 계속 포함한다. Figma Sync는 특정 Repo verification의 commit과 `inputDigest`를 고정해 문서 주입·멱등 검증·시각 확인·사람 발행·발행 상태 재확인까지 책임지며, 리포 밖 consumer checkpoint는 별도 작업으로 남긴다. 최신 Repo verification 기록과 마지막 Figma 공개 기준선은 서로 덮어쓰지 않도록 독립적으로 보존한다.

## 개정 — Figma는 요청 시 스냅숏이다 (2026-09-04)

[2026-09 점검](../handoff/repo-review-2026-09.md)에서 소유자가 정했다. 이 리포의 목적은 **코드 중심 개인 디자인 시스템**이고 Figma는 있으면 좋은 파생물이다. 원래 결정의 두 축 중 "Figma 드리프트는 기간 제한 없이 허용하고 명시적 요청에만 동기화한다"는 그대로이고, 그것을 둘러싼 **검증 원장**은 걷어낸다.

- `CODE_VERIFIED`·`STORYBOOK_VERIFIED`·`FIGMA_DOCUMENT_SYNCED`·`FIGMA_LIBRARY_CURRENT`의 누적 상태, `inputDigest`, `verification/repo-verification.json`, `sync:preflight`·`sync:review-storybook`, Storybook의 System 페이지는 없다. 코드 변경의 완료 조건은 `bun run check`·`bun run test`(CI)와 PR 리뷰다.
- `verification/figma-baseline.json`은 **마지막 스냅숏의 기록**으로만 남는다 — 어느 commit의 매니페스트 해시가 Figma에 있는가. 다음 스냅숏을 뜰 때 diff의 기준이고, 그 외에는 아무것도 이 파일을 읽지 않는다.
- Figma 스냅숏 절차는 [`docs/agents/design-system-sync.md`](../agents/design-system-sync.md) §2다 — 주입·멱등 확인·폰트 바인딩·발행. 사람 확인 단계는 그대로이되 상태 기계가 아니라 체크리스트다.
- 계약의 `behaviors`·`gestures`가 요구하는 **사람 동작 확인**(§1)은 Figma와 무관한 접근성 확인이라 남는다. `bun run sync:checklist`가 항목을 찍고, 결과는 PR 설명에 적는다.
- `bun run check` 규칙 6(parts 모집단)은 Figma 정밀도의 문제라 **경고**로 내린다. 다음 스냅숏 전에 읽는 숫자이지 CI가 막을 일이 아니다.
