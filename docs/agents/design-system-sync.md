# 디자인 시스템 갱신 규약

구현 정본을 파생 채널로 갱신하는 두 독립 작업의 runbook이다.

- **Repo verification**은 모든 구현 정본 변경의 기본 완료 단위다. `bun run sync:preflight`로 시작하며 Storybook 사람 검토까지 완료하고 종료한다.
- **Figma Sync**는 사용자가 명시적으로 요청할 때만 전용 GitHub issue에서 시작한다. Repo verification이 끝났다는 이유만으로 자동 수행하지 않는다.

`sync:preflight`는 토큰·매니페스트와 Figma용 파생 산출물을 생성하고 repo check/test, Storybook production build, 모든 story의 axe 검사를 실행한다. Figma용 로컬 생성·검증은 Repo verification에 남지만 MCP로 Figma 문서를 읽거나 쓰는 일은 Figma Sync에만 속한다.

## 1. Repo verification

1. 변경을 공개 기준선과 비교해 `additive`·`in-place safe`·`breaking`으로 분류한다. `breaking`이거나 `in-place safe` 증거가 없으면 여기서 멈춘다.
2. `bun run sync:preflight`를 실행한다.
3. 자동 검사가 통과하면 `CODE_VERIFIED: PASS`, `STORYBOOK_VERIFIED: PENDING_HUMAN`이다. 프로젝트 소유자가 변경된 컴포넌트의 Light/Dark와 영향받는 주요 상태를 확인한다. semantic 토큰이나 base 계층 변경이면 전체 카탈로그를 확인한다.
4. 확인 결과를 `bun run sync:review-storybook -- --reviewer <이름> --scope "<확인 범위>"`로 기록한다. 오류면 `--result FAIL --reason "<이유>"`를 함께 주고 아래 분기에 따라 원인 계층을 고친 뒤 preflight부터 다시 실행한다.
5. `CODE_VERIFIED`와 `STORYBOOK_VERIFIED`가 모두 `PASS`인지 확인한다. 생성물과 검증 기록을 포함해 commit을 고정하고 Repo verification을 완료한다. Figma는 선택 가능한 다음 작업이지 이 작업의 재개 지점이 아니다.

완료 기준: 대상 commit, `inputDigest`, 컴포넌트별 manifest/token 해시, repo 검사·테스트·Storybook build·axe 0건, 사람 시각 확인의 확인자·시각·범위가 하나의 기록에 있다.

Figma가 뒤처진 상태에는 시간 제한을 두지 않는다. 최신 Repo verification 세대와 마지막 `FIGMA_LIBRARY_CURRENT` 공개 기준선은 독립적으로 보존해 차이를 판독할 수 있게 한다. 새 Repo verification이 마지막 Figma 증거를 덮어쓰거나 실패로 바꾸지 않는다.

- `verification/repo-verification.json` — 최신 Repo verification 실행이 갱신하는 기록
- `verification/figma-baseline.json` — Figma Sync가 `FIGMA_LIBRARY_CURRENT: PASS`를 획득했을 때만 갱신하는 공개 기준선

### 시각 오류의 수정 위치

| 관찰 | 수정 위치 |
|---|---|
| 실제 컴포넌트 렌더링도 디자인 의도와 다르다 | 토큰 또는 `packages/ui` 구현 정본 |
| 컴포넌트는 맞고 Storybook에서만 다르다 | story·decorator·theme·viewport 등 Storybook 표현 계층 |
| Storybook은 맞고 Figma에서만 다르다 | 매니페스트 생성·번역표·주입 경로 |
| Figma 매체 제약으로 같은 구조를 표현할 수 없다 | 구현 정본에서 파생값을 생성하고 허용된 차이를 절차 문서에 명시 |

생성물이나 Figma 자산의 결과만 손으로 고치지 않는다. 오류가 생긴 최초 계층을 고친 뒤 이후 채널을 새 세대로 다시 갱신한다.

## 2. Figma Sync

사용자가 Figma Sync를 명시적으로 요청하면 [Figma Sync issue template](../../.github/ISSUE_TEMPLATE/figma-sync.md)으로 실행 issue를 만든다. issue 생성 시점의 최신 `STORYBOOK_VERIFIED: PASS` commit과 `inputDigest`를 대상으로 고정하고, 마지막 `FIGMA_LIBRARY_CURRENT` 공개 기준선부터 누적된 변경을 범위로 삼는다. 공개 Storybook 배포가 대상 commit에서 성공하기 전에는 document gate로 넘어가지 않는다.

### Figma document gate

Figma 쓰기 전에 `figma-use` skill을 읽고, 토큰은 [`figma-injection.md`](figma-injection.md), 컴포넌트는 [`figma-components.md`](figma-components.md)를 따른다.

1. 기록의 `inputDigest`와 현재 preflight 결과가 같은지 확인한다. 다르면 Repo gate로 돌아간다.
2. Massive Design 문서를 읽기 전용으로 조사한다.
3. 토큰·Foundations 01~07을 전부 재실행한다. 컴포넌트는 manifest 이름으로 찾아 제자리에서 갱신하며, 상태 견본 색은 `state-colors.gen.json`을 소비한다.
4. 컴포넌트 구조 주입 뒤 카탈로그 배치 검사·정규화를 실행한다. 매니페스트 registry 순서의 단일 세로 열이어야 하고, 예상 밖 최상위 노드·누락·중복·잘못된 타입이 없어야 한다.
5. 두 번째 실행에서 생성·삭제·교체와 정규화 구조 diff가 모두 0이고, 카탈로그 배치 `movedCount`가 0인지 확인한다.
6. 변경된 자산을 사람이 Light/Dark와 상태 견본으로 확인한다. 토큰이 바뀐 세대에는 `Foundations`의 `Massive Foundations · generated`에서 palette 전체와 semantic 두 모드를 확인한다.
7. 기록의 `FIGMA_DOCUMENT_SYNCED`에 결과, 검사 시각·확인자, 구조/바인딩/해시·카탈로그 배치 증거, 실패와 재개 지점을 기록한다. 구조를 읽을 수 없거나 증거가 낡았으면 `UNKNOWN`, 위반을 확인했으면 `FAIL`이다.

완료 기준: 모든 대상 컴포넌트 이름·property 표면·바인딩·세대가 일치하고, 카탈로그 배치 구조 오류가 없으며, 멱등 diff와 두 번째 배치 이동 수가 0이고 변경 자산의 시각 확인이 남아 있다.

### Human publish checkpoint

에이전트는 각 component set의 `getPublishStatusAsync()`를 `try/catch`로 읽는다. `CHANGED`나 `UNPUBLISHED`이면 `FIGMA_LIBRARY_CURRENT`를 `PENDING_HUMAN`과 `PUBLISH_CONFIRMATION_REQUIRED`로 기록하고 사람에게 다음을 요청한다.

1. Figma 발행 대화상자에서 변경된 컴포넌트·Variables·Text Style·Effect Style을 발행한다.
2. 미발행 변경이 없음을 확인한다.
3. 확인자와 시각을 검증 기록에 남긴다.

그 뒤 에이전트가 모든 component set의 `PUBLISHED`를 다시 확인해야 `FIGMA_LIBRARY_CURRENT: PASS`다. 사람 확인이 없는 컴포넌트 `PUBLISHED`만으로 통과시키지 않는다.

Figma Sync는 사람이 발행을 확인한 뒤 에이전트가 모든 대상 component set의 `PUBLISHED`를 다시 확인해 `FIGMA_LIBRARY_CURRENT: PASS`를 획득하면 완료한다.

## 3. Consumer checkpoint

대표 소비 파일의 담당자가 라이브러리 구독과 업데이트 적용을 확인한다. 에이전트는 원격 인스턴스로 이름·variant/property 표면·핵심 semantic 바인딩·Light/Dark 전환을 검증한다. 이 checkpoint는 Figma Sync의 완료 조건이 아닌 별도 작업이다. 이 증거까지 있을 때만 그 실행 티켓에서 `CONSUMER_CURRENT`와 전체 `SYNC_COMPLETE`를 선언한다.

## 재개 규칙

- 같은 `inputDigest`: 마지막 `PASS` 다음 단계부터 재개한다.
- 관련 코드 입력 변경: `CODE_VERIFIED`부터 다시 실행한다.
- 컴포넌트 또는 토큰 해시 변경: Figma document와 그 뒤 증거를 `UNKNOWN`으로 본다.
- Figma 문서 변경: library 증거를 `UNKNOWN`으로 본다.
- 실패 뒤 단계는 획득하지 않는다. 가능한 현재 단계 검사는 모두 실행해 한 번에 진단한다.
- 롤백된 채널을 정상으로 가장하지 않고 새 세대로 전진한다.
