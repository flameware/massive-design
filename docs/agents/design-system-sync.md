# 디자인 시스템 갱신 규약

코드 정본을 Storybook과 Figma 파생 채널로 갱신할 때 쓰는 runbook이다. 시작은 항상 `bun run sync:preflight`다. 이 명령은 토큰·매니페스트를 생성하고 repo check/test, Storybook production build, 모든 story의 axe 검사를 실행한 뒤 `verification/design-system-sync.json`을 다시 쓴다.

## 1. Repo gate

1. 변경을 공개 기준선과 비교해 `additive`·`in-place safe`·`breaking`으로 분류한다. `breaking`이거나 `in-place safe` 증거가 없으면 여기서 멈춘다.
2. `bun run sync:preflight`를 실행한다.
3. 기록의 `CODE_VERIFIED`와 `STORYBOOK_VERIFIED`가 모두 `PASS`인지 확인한다. 실패하면 `failure`와 `resumeAt`에 적힌 검사부터 고친 뒤 명령 전체를 다시 실행한다.
4. 생성물과 검증 기록을 포함해 commit을 고정한다. 공개 Storybook 배포가 그 commit에서 성공하기 전에는 Figma 단계로 넘어가지 않는다.

완료 기준: 대상 commit, `inputDigest`, 컴포넌트별 manifest/token 해시, repo 검사·테스트·Storybook build·axe 0건이 하나의 기록에 있다.

## 2. Figma document gate

Figma 쓰기 전에 `figma-use` skill을 읽고, 토큰은 [`figma-injection.md`](figma-injection.md), 컴포넌트는 [`figma-components.md`](figma-components.md)를 따른다.

1. 기록의 `inputDigest`와 현재 preflight 결과가 같은지 확인한다. 다르면 Repo gate로 돌아간다.
2. Massive Design 문서를 읽기 전용으로 조사한다.
3. 토큰 01~06을 전부 재실행한다. 컴포넌트는 manifest 이름으로 찾아 제자리에서 갱신한다.
4. 두 번째 실행에서 생성·삭제·교체와 정규화 구조 diff가 모두 0인지 확인한다.
5. 변경된 자산을 사람이 Light/Dark와 상태 견본으로 확인한다.
6. 기록의 `FIGMA_DOCUMENT_SYNCED`에 결과, 검사 시각·확인자, 구조/바인딩/해시 증거, 실패와 재개 지점을 기록한다. 구조를 읽을 수 없거나 증거가 낡았으면 `UNKNOWN`, 위반을 확인했으면 `FAIL`이다.

완료 기준: 모든 대상 컴포넌트 이름·property 표면·바인딩·세대가 일치하고 멱등 diff가 0이며 변경 자산의 시각 확인이 남아 있다.

## 3. Human publish checkpoint

에이전트는 각 component set의 `getPublishStatusAsync()`를 `try/catch`로 읽는다. `CHANGED`나 `UNPUBLISHED`이면 `FIGMA_LIBRARY_CURRENT`를 `PENDING_HUMAN`과 `PUBLISH_CONFIRMATION_REQUIRED`로 기록하고 사람에게 다음을 요청한다.

1. Figma 발행 대화상자에서 변경된 컴포넌트·Variables·Text Style·Effect Style을 발행한다.
2. 미발행 변경이 없음을 확인한다.
3. 확인자와 시각을 검증 기록에 남긴다.

그 뒤 에이전트가 모든 component set의 `PUBLISHED`를 다시 확인해야 `FIGMA_LIBRARY_CURRENT: PASS`다. 사람 확인이 없는 컴포넌트 `PUBLISHED`만으로 통과시키지 않는다.

## 4. Consumer checkpoint

대표 소비 파일의 담당자가 라이브러리 구독과 업데이트 적용을 확인한다. 에이전트는 원격 인스턴스로 이름·variant/property 표면·핵심 semantic 바인딩·Light/Dark 전환을 검증한다. 이 증거까지 있을 때만 별도 실행 티켓에서 `CONSUMER_CURRENT`와 전체 `SYNC_COMPLETE`를 선언한다.

## 재개 규칙

- 같은 `inputDigest`: 마지막 `PASS` 다음 단계부터 재개한다.
- 관련 코드 입력 변경: `CODE_VERIFIED`부터 다시 실행한다.
- 컴포넌트 또는 토큰 해시 변경: Figma document와 그 뒤 증거를 `UNKNOWN`으로 본다.
- Figma 문서 변경: library 증거를 `UNKNOWN`으로 본다.
- 실패 뒤 단계는 획득하지 않는다. 가능한 현재 단계 검사는 모두 실행해 한 번에 진단한다.
- 롤백된 채널을 정상으로 가장하지 않고 새 세대로 전진한다.
