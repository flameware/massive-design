---
name: Figma Sync
about: 검증된 Repo verification 세대를 Figma 문서와 발행 라이브러리에 동기화한다
title: "Figma Sync: "
labels: ""
assignees: ""
---

## 대상

- Repo verification commit:
- `inputDigest`:
- 마지막 `FIGMA_LIBRARY_CURRENT` 공개 기준선 (`verification/figma-baseline.json`):
- 변경된 토큰·컴포넌트:
- 호환성 분류: `additive` / `in-place safe` / `breaking`

대상은 issue 생성 시점의 최신 `STORYBOOK_VERIFIED: PASS` 세대로 고정한다. 관련 코드 입력이 바뀌면 자동으로 새 세대로 이동하지 말고 Repo verification부터 다시 판단한다.

## Figma document gate

- [ ] 대상 commit의 공개 Storybook 배포가 성공했다
- [ ] 기록의 `inputDigest`가 대상 Repo verification과 같다
- [ ] Figma 문서를 읽기 전용으로 조사했다
- [ ] 토큰·Foundations 01~07을 재실행했다
- [ ] 대상 컴포넌트를 제자리에서 갱신했다
- [ ] 카탈로그 배치 검사·정규화를 통과했다
- [ ] 두 번째 실행의 생성·삭제·교체·구조 diff와 `movedCount`가 0이다
- [ ] 변경 자산의 Light/Dark·상태 견본을 사람이 확인했다
- [ ] `FIGMA_DOCUMENT_SYNCED: PASS` 증거를 기록했다

## Library publish checkpoint

- [ ] 발행 전 변경 자산과 Variables·Text Style·Effect Style을 확인했다
- [ ] 사람이 Figma 발행을 완료하고 확인자·시각을 기록했다
- [ ] 에이전트가 모든 대상 component set의 `PUBLISHED`를 재확인했다
- [ ] `FIGMA_LIBRARY_CURRENT: PASS`와 새 공개 기준선을 기록했다

## 실행 기록

- 확인자:
- 확인 시각:
- 구조·바인딩·해시·카탈로그 배치 증거:
- 실패 또는 재개 지점:
- 결과 공개 기준선:

리포 밖 consumer checkpoint는 이 issue의 완료 조건이 아니다.
