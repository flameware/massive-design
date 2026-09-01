# 디자인 시스템 갱신 규약

구현 정본을 파생 채널로 갱신하는 두 독립 작업의 runbook이다.

- **Repo verification**은 모든 구현 정본 변경의 기본 완료 단위다. `bun run sync:preflight`로 시작하며 Storybook 사람 검토까지 완료하고 종료한다.
- **Figma Sync**는 사용자가 명시적으로 요청할 때만 전용 GitHub issue에서 시작한다. Repo verification이 끝났다는 이유만으로 자동 수행하지 않는다.

`sync:preflight`는 토큰·매니페스트와 Figma용 파생 산출물을 생성하고 repo check/test, Storybook production build, 모든 story의 axe 검사를 실행한다. Figma용 로컬 생성·검증은 Repo verification에 남지만 MCP로 Figma 문서를 읽거나 쓰는 일은 Figma Sync에만 속한다.

## 1. Repo verification

1. 변경을 공개 기준선과 비교해 `additive`·`in-place safe`·`breaking`으로 분류한다. `breaking`이거나 `in-place safe` 증거가 없으면 여기서 멈춘다.
2. `bun run sync:preflight`를 실행한다.
3. 자동 검사가 통과하면 `CODE_VERIFIED: PASS`, `STORYBOOK_VERIFIED: PENDING_HUMAN`이다. 프로젝트 소유자가 변경된 컴포넌트의 Light/Dark와 영향받는 주요 상태를 확인한다. semantic 토큰이나 base 계층 변경이면 전체 카탈로그를 확인한다.
4. 계약이 `gestures`를 선언한 컴포넌트가 변경 범위에 있으면 **터치 확인**을 함께 한다(아래).
5. 확인 결과를 `bun run sync:review-storybook -- --reviewer <이름> --scope "<확인 범위>"`로 기록한다. 오류면 `--result FAIL --reason "<이유>"`를 함께 주고 아래 분기에 따라 원인 계층을 고친 뒤 preflight부터 다시 실행한다.
6. `CODE_VERIFIED`와 `STORYBOOK_VERIFIED`가 모두 `PASS`인지 확인한다. 생성물과 검증 기록을 포함해 commit을 고정하고 Repo verification을 완료한다. Figma는 선택 가능한 다음 작업이지 이 작업의 재개 지점이 아니다.

완료 기준: 대상 commit, `inputDigest`, 컴포넌트별 manifest/token 해시, repo 검사·테스트·Storybook build·axe 0건, 사람 시각 확인의 확인자·시각·범위가 하나의 기록에 있다.

### 터치 확인 — dismiss 제스처

**제스처에는 자동 검사가 없다.** Storybook은 카탈로그에서 생성되는 파생 채널이라 손으로 쓴 인터랙션 스토리가 없고, `packages/ui`의 테스트에는 DOM이 없다. 게이트가 보는 것은 계약 선언의 모양(닫히는 표면이 우리 anatomy인가, 동등 경로가 공개 export인가, 선언한 피드백 클래스가 실제로 붙어 있는가)까지이고 **동작이 옳은지는 사람만 판정한다.**

계약이 `gestures`를 선언한 컴포넌트를 터치 기기 또는 기기 에뮬레이션에서 열고, 계약이 진 셋을 그대로 확인한다.

- [ ] **존재** — 선언한 제스처로 실제로 닫힌다
- [ ] **시각 피드백** — 끄는 동안 표면이 손가락을 따라오고, 임계값에 못 미쳐 놓으면 제자리로 돌아온다
- [ ] **접근성 동등 경로** — 계약이 지목한 공개 export로 제스처 없이 닫을 수 있고, 키보드와 스크린리더로 그 수단에 닿는다

확인 범위를 `--scope`에 남긴다. 판정 기준이 위 셋이므로 "터치에서 봤다"가 아니라 **어느 항목이 통과했는지**를 적는다 — 기준 없는 뷰포트 확인은 검토 기록에 판정이 아니라 인상만 남긴다([#97](https://github.com/flameware/massive-design/issues/97)).

### 트리거 모드 확인 — 사람이 진다

Dropdown Menu의 `openOn="context"`와 Popover의 `openOn="hover"`는 **자동 검증이 0이다**([#126](https://github.com/flameware/massive-design/issues/126)). `openOn`은 `cva` 축도 구성 상태도 아니라 생성된 카탈로그 스토리에 자리가 없고(`Components.stories.tsx`의 컨트롤은 `axes ∪ configurationStates`에서만 나온다), 따라서 Storybook axe가 두 모드를 한 번도 렌더하지 않는다. **`STORYBOOK_VERIFIED: PASS`는 이 두 모드에 대해 아무것도 말하지 않는다** — 기본 모드만 통과한 것이다. 세대를 넘기기 전에 사람이 확인한다.

- [ ] **우클릭 모드** — 대상 영역을 우클릭하면 커서 위치에서 열린다. **키보드만으로** 열린다(Tab으로 트리거에 도달 → 컨텍스트 메뉴 키 또는 Shift+F10). 터치에서 길게 눌러 열린다. Esc로 닫히고 초점이 트리거로 돌아온다.
- [ ] **hover 모드** — 포인터를 얹으면 지연 후 열리고, 트리거에서 콘텐츠로 건너가는 동안 닫히지 않는다. **포인터 없이** 열린다(Tab 포커스, 클릭, 터치). 열릴 때 초점이 표면으로 튀지 않는다. 콘텐츠 안의 버튼·링크가 Tab 순서에 남아 있다.
- [ ] **체크·라디오·서브메뉴 여섯 파트** — 두 모드 모두에서 표식·화살표가 나오고 서브메뉴가 열린다(#154). **켜고 끄는 동작은 카탈로그가 보여 주지 못한다** — 생성된 스토리는 `checked`를 구성 상태로 **고정해** 렌더하므로(`onCheckedChange` 없는 controlled) 클릭해도 표식이 바뀌지 않는 것이 정상이고, 그것을 실패로 읽지 않는다. 토글과 우클릭 모드는 이 절의 다른 항목과 같이 손으로 만든 자리에서 본다.
- [ ] **기본 모드 불변** — 어느 모드도 기본 모드의 렌더 결과를 바꾸지 않는다. `sync:preflight` 기록의 `components[]`에서 `dropdown-menu = fa7ada0fad97`, `popover = 2535c4105bf4`로 확인한다.

> 터치 대상 **크기** 규칙은 여기 없다. [#111](https://github.com/flameware/massive-design/issues/111)이 정한 뒤 이 절에 들어온다 — 그쪽은 `size` 축 기본값을 건드리는 base 계층 변경이라 전 카탈로그 재검증을 요구하므로 도착 시점과 적용 범위가 다르다.

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
6. **폰트 단계.** 에이전트가 `Components` 페이지의 TEXT 노드를 세어 `fontFamilyBound: <bound>/<total>`을 보고한다. `bound < total`이면 폰트 미완 상태가 남은 것이므로 **사람 단계가 필요하다** — 아래 Font shaping checkpoint로 간다. 여기를 건너뛴 세대는 `FIGMA_DOCUMENT_SYNCED`를 획득하지 못한다.
7. 변경된 자산을 사람이 Light/Dark와 상태 견본으로 확인한다. 토큰이 바뀐 세대에는 `Foundations`의 `Massive Foundations · generated`에서 palette 전체와 semantic 두 모드를 확인한다. **한글 라벨이 실제로 렌더되는지 이때 함께 본다** — 폰트 단계가 빠지면 여기서만 드러난다.
8. 기록의 `FIGMA_DOCUMENT_SYNCED`에 결과, 검사 시각·확인자, 구조/바인딩/해시·카탈로그 배치·`fontFamilyBound` 증거, 실패와 재개 지점을 기록한다. 구조를 읽을 수 없거나 증거가 낡았으면 `UNKNOWN`, 위반을 확인했으면 `FAIL`이다.

완료 기준: 모든 대상 컴포넌트 이름·property 표면·바인딩·세대가 일치하고, 카탈로그 배치 구조 오류가 없으며, 멱등 diff와 두 번째 배치 이동 수가 0이고, `fontFamilyBound`가 `n/n`이며 변경 자산의 시각 확인이 남아 있다.

### Font shaping checkpoint

에이전트는 `use_figma`가 도는 **저작 런타임**에서 일하고, 그 런타임에는 Pretendard가 없다. 로드 불가 패밀리를 바인딩한 노드는 한글 셰이핑을 잃으므로 에이전트는 텍스트를 로드 가능한 face로 남긴다 — **폰트 미완 상태**다. 바인딩은 Pretendard가 설치된 **셰이핑 런타임**, 즉 사람의 Figma 데스크톱 앱에서만 성립한다. 근거는 [ADR-0004](../adr/0004-font-shaping-runtime.md).

`fontFamilyBound`가 `n/n`이 아니면 에이전트는 `FIGMA_DOCUMENT_SYNCED`를 `PENDING_HUMAN`과 `FONT_BINDING_REQUIRED`로 기록하고 사람에게 다음을 요청한다.

1. Figma **데스크톱 앱**에서 `scripts/figma-font-bind`를 실행한다. 최초 1회만 Plugins → Development → Import plugin from manifest…로 등록하면 이후에는 실행뿐이다.
2. 플러그인이 낸 `새로 바인딩 <n>`을 확인한다. 한 번 더 돌려 `0`이 나오는지 본다(멱등).
3. 확인자와 시각을 검증 기록에 남긴다.

그 뒤 에이전트가 `fontFamilyBound`를 다시 읽어 `n/n`인지 확인해야 이 단계를 통과한다. 발행은 **이 단계가 끝난 뒤** 한다 — 순서를 뒤집으면 폰트 미완 상태가 공개 기준선에 들어가고 발행을 두 번 하게 된다.

> 판정은 **바인딩 유무**이지 `fontName`이 아니다. 폰트 이름만 맞고 바인딩이 없는 상태는 화면상 정상으로 보이지만 토큰을 따르지 않으며, `fontName` 기준 검사는 그것을 통과시킨다([#115](https://github.com/flameware/massive-design/issues/115)에서 실제로 그렇게 새어 나갔다).
>
> 대상은 `Components` 페이지다. `Foundations`는 세대마다 01~07이 통째로 재생성하는 검증 표면이고 라벨이 라틴이라 폰트 미완 상태를 남겨도 잃을 것이 없다.

### Human publish checkpoint

**Font shaping checkpoint가 끝난 뒤에 온다.** 순서가 뒤집히면 폰트 미완 상태가 발행되고, 바인딩 뒤 다시 `CHANGED`가 되어 발행을 두 번 한다.

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
