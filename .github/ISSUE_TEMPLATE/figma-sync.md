---
name: Figma 스냅숏
about: 현재 세대를 Figma 문서에 주입하고 발행한다 (소유자 요청 시에만)
title: "Figma 스냅숏: "
labels: needs-triage
assignees: ""
---

## 대상

- commit:
- 마지막 스냅숏 (`verification/figma-baseline.json`의 `targetCommit`):
- 변경된 토큰·컴포넌트 (`packages/ui/dist/manifest/index.gen.json`의 해시를 기준선과 비교):
- 호환성 분류: `additive` / `in-place safe` / `breaking`

절차는 `docs/agents/design-system-sync.md` §2.

## 주입

- [ ] 대상 commit의 공개 Storybook 배포가 성공했다
- [ ] Figma 문서를 읽기 전용으로 조사했다
- [ ] 토큰·Foundations 01~07을 재실행했다
- [ ] 대상 컴포넌트를 제자리에서 갱신했다
- [ ] 카탈로그 배치 검사·정규화를 통과했다
- [ ] 두 번째 실행의 생성·삭제·교체·구조 diff와 `movedCount`가 0이다
- [ ] `fontFamilyBound`가 `n/n`이다 (아니면 사람이 데스크톱 앱에서 `scripts/figma-font-bind`를 돌린다)
- [ ] 변경 자산의 Light/Dark·상태 견본을 사람이 확인했다

## 발행

- [ ] 사람이 Figma 발행을 완료했다
- [ ] 에이전트가 모든 대상 component set의 `PUBLISHED`를 재확인했다
- [ ] `verification/figma-baseline.json`을 새 세대로 갱신했다

## 기록

- 확인자 · 시각:
- 구조·바인딩·해시·카탈로그 배치 증거:
