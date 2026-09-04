# 디자인 시스템 갱신 규약

두 절이다. **§1 사람 동작 확인**은 계약이 선언한 접근성 동작을 사람이 판정하는 절차로, 코드 변경이 그 선언을 건드릴 때 PR 안에서 한다. **§2 Figma 스냅숏**은 소유자가 명시적으로 요청할 때만 현재 세대를 Figma에 주입·발행하는 절차다([ADR-0002 개정](../adr/0002-separate-repo-verification-from-figma-sync.md)). 코드 변경의 완료 조건은 `bun run check`·`bun run test`(CI)와 PR 리뷰이고, Figma가 뒤처진 상태는 결함이 아니다.

## 1. 사람 동작 확인

**언제.** 이번 변경이 계약의 `gestures`·`behaviors` 선언이나 그것을 가진 컴포넌트를 건드렸을 때, 또는 포인터 대상 slot을 가진 파일이 diff에 있을 때. 건드리지 않았으면 이 절은 들지 않는다 — 선언을 하나라도 건드렸으면 그 세대는 선언한 자리를 **전부** 다시 찍는다(좁히지 않는다).

**무엇을.** `bun run manifest` 뒤 `bun run sync:checklist`를 돈다. 계약에서 이번 세대의 확인 항목이 나온다 — `gestures`가 걸리면 **터치 확인**을, `behaviors`가 걸리면 종류에 따라 **컨트롤 제스처 확인**·**열림 계기 확인**·**우발 변경 확인**을 한다. 포인터 대상 slot을 건드렸으면 **뷰포트 확인 — 포인터 대상 크기**를 한다.

**어디에.** 결과는 PR 설명에 적는다 — "봤다"가 아니라 **어느 항목이 통과했는지**를. 기준 없는 확인은 판정이 아니라 인상만 남긴다([#97](https://github.com/flameware/massive-design/issues/97)).

### 터치 확인 — dismiss 제스처

**제스처에는 자동 검사가 없다.** Storybook은 카탈로그에서 생성되는 파생 채널이라 손으로 쓴 인터랙션 스토리가 없고, `packages/ui`의 테스트에는 DOM이 없다. 게이트가 보는 것은 계약 선언의 모양까지이고 **동작이 옳은지는 사람만 판정한다.**

계약이 `gestures`를 선언한 컴포넌트를 터치 기기 또는 기기 에뮬레이션에서 열고, 계약이 진 셋을 그대로 확인한다.

- [ ] **존재** — 선언한 제스처로 실제로 닫힌다
- [ ] **시각 피드백** — 끄는 동안 표면이 손가락을 따라오고, 임계값에 못 미쳐 놓으면 제자리로 돌아온다
- [ ] **접근성 동등 경로** — 계약이 지목한 공개 export로 제스처 없이 닫을 수 있고, 키보드와 스크린리더로 그 수단에 닿는다

이 절은 **dismiss 제스처만** 본다 — 드래그가 컨트롤의 기능 자체이거나 표면을 여는 계기이면 `gestures`가 아니라 `behaviors`이고, 아래 절이 본다([ADR-0010](../../packages/ui/scripts/manifest/decisions/0010-behaviors-are-declared-and-human-verified.md)).

### 컨트롤 제스처 확인

계약이 `behaviors`에 `kind: "control-gesture"`로 선언한 자리. 드래그가 컨트롤의 기능 자체라 표면이 사라지지 않고, 판정 기준은 **값이 옳게 바뀌는가**다. 어느 컴포넌트의 어느 표면인지는 `sync:checklist`가 찍는다 — 손으로 든 목록은 세 번 샜다([#124](https://github.com/flameware/massive-design/issues/124)·[#125](https://github.com/flameware/massive-design/issues/125)·[#127](https://github.com/flameware/massive-design/issues/127)).

- [ ] **값이 바뀐다** — 포인터로 끌면 컨트롤의 값이 따라 움직이고, 놓으면 그 값에 머문다
- [ ] **키보드 동등 경로** — 같은 값 변화에 포인터 없이 닿는다
- [ ] **끄는 자리** — 확인표가 `바꾸는 자리`를 적어 준 항목은 그것으로 실제로 꺼지거나 바뀐다. 적히지 않은 항목은 끄는 수단이 없다는 뜻이고, 그것도 사실로 확인한다
- [ ] **상속 항목의 upstream 기본값** — 확인표가 `상속`으로 적은 항목은 upstream 기본값이 우리가 적어 둔 그대로인지 함께 본다. 게이트는 서드파티 소스를 읽지 못한다([ADR-0005](../adr/0005-inherited-dismiss-gestures.md))

### 열림 계기 확인

계약이 `behaviors`에 `kind: "open-cause"`로 선언한 자리. **자동 검증이 0이다** — 열림 계기는 `cva` 축도 구성 상태도 아니라 생성된 스토리에 자리가 없고, Storybook axe는 기본 모드만 렌더한다.

- [ ] **그 계기로 열린다** — 확인표가 적은 계기(우클릭·컨텍스트 메뉴 키, 터치 롱프레스, 포인터 머무름)로 실제로 열리고, 열린 표면이 계약이 지목한 그 표면이다
- [ ] **그 계기 없이도 열린다** — 우클릭 모드는 Tab으로 트리거에 도달한 뒤 컨텍스트 메뉴 키 또는 Shift+F10으로, hover 모드는 Tab 포커스·클릭·터치로 열린다
- [ ] **초점과 닫기** — 열릴 때 초점이 표면으로 튀지 않고, 콘텐츠 안의 버튼·링크가 Tab 순서에 남으며, Esc로 닫히고 초점이 트리거로 돌아온다. hover 모드는 트리거에서 콘텐츠로 건너가는 동안 닫히지 않는다
- [ ] **기본 모드 불변** — 어느 계기도 기본 모드의 렌더 결과를 바꾸지 않는다. 확인표의 `기본 모드 해시`가 `packages/ui/dist/manifest/index.gen.json`의 값과 같다
- [ ] **상속 항목의 upstream 기본값** — `상속`으로 적힌 항목은 지연·임계값이 여전히 upstream 기본값인지 함께 본다

> 메뉴의 **체크·라디오·서브메뉴 여섯 파트**는 두 모드 모두에서 표식·화살표가 나오고 서브메뉴가 열리는지 함께 본다([#154](https://github.com/flameware/massive-design/issues/154)). 생성된 스토리는 `checked`를 구성 상태로 **고정해** 렌더하므로 클릭해도 표식이 바뀌지 않는 것이 정상이다.
>
> **`behaviors: {}`는 "갖고 오는 것이 없음을 확인했다"를 뜻한다.** [#187](https://github.com/flameware/massive-design/issues/187)이 고정된 버전의 소스로 전수 조사했다. 새 컴포넌트를 계약하면서 upstream이 갖고 오는 동작을 발견하면 그 자리에서 적는다 — 끄거나 선언하거나 둘 중 하나이고 침묵은 선택지가 아니다([ADR-0015](../../packages/ui/scripts/manifest/decisions/0015-behaviors-boundary-is-the-cause.md)).

### 우발 변경 확인

계약이 `behaviors`에 `kind: "implicit-change"`로 선언한 자리. 앞의 두 절과 갈리는 것은 **확인하는 방법**이다 — **아무것도 활성화하지 않은 채** 초점만 옮기거나 글자를 치거나 그냥 기다려 보고 값이 움직이는지 본다.

- [ ] **활성화 없이 바뀐다** — 확인표가 적은 계기(초점 도착, 닫힌 컨트롤에 타이핑, 시간 경과)만 주고 클릭·Enter·Space를 누르지 않았는데 값이나 위치가 바뀐다
- [ ] **되돌릴 수 있다** — 되돌아갈 경로가 있다. 시간이 계기인 항목은 **정지·연장 수단**이 있는지 본다(WCAG 2.2.1)
- [ ] **끄는 자리** — `바꾸는 자리`가 적힌 항목은 그것으로 실제로 꺼진다
- [ ] **상속 항목의 upstream 기본값** — 기본값이 뒤집히면 조용히 사라지거나 조용히 생긴다

### 뷰포트 확인 — 포인터 대상 크기

**언제.** 포인터 대상 slot([`pointer-target-measure.md`](pointer-target-measure.md) §2.1)을 가진 파일이 diff에 있을 때만 — "좁히지 않는다"의 명시적 예외다([ADR-0020](../adr/0020-pointer-target-size-is-borne-by-the-hit-area.md) §파급).

**무엇을.** `bun run pointer-gate`를 손으로 돈다(CI에 없다 — Storybook 빌드 + Playwright가 약 7분). 게이트는 기준선 대비 새 미달(regression)과 미신고 겹침을 가른다. 낮은 값이 나오면 **대상 자체의 히트 영역 부족인지 참조 스토리의 우연한 가림인지**를 사람이 가른다 — 가림이면 스토리 조립을 고치고, 대상이면 규칙 적용 또는 예외 목록([`pointer-target-exceptions-2026-09.md`](../research/pointer-target-exceptions-2026-09.md)) 판정을 따른다.

- [ ] **하한** — 건드린 slot 각각이 24×24를 만족하거나, 예외 목록에 이름과 이유로 올라 있다
- [ ] **가림** — 미달로 읽힌 값이 대상 자체인지 참조 스토리의 가림인지 가려졌다
- [ ] **초과분** — 확장한 대상은 중심 대칭 폭이 문서화돼 있고, 이웃과 겹치면 그 사실이 적혀 있다(겹침 판정은 소비처, ADR-0020 결정 5)

### 시각 오류의 수정 위치

| 관찰 | 수정 위치 |
|---|---|
| 실제 컴포넌트 렌더링도 디자인 의도와 다르다 | 토큰 또는 `packages/ui` 구현 정본 |
| 컴포넌트는 맞고 Storybook에서만 다르다 | story·decorator·theme·viewport 등 Storybook 표현 계층 |
| Storybook은 맞고 Figma에서만 다르다 | 매니페스트 생성·번역표·주입 경로 |
| Figma 매체 제약으로 같은 구조를 표현할 수 없다 | 구현 정본에서 파생값을 생성하고 허용된 차이를 절차 문서에 명시 |

생성물이나 Figma 자산의 결과만 손으로 고치지 않는다. 오류가 생긴 최초 계층을 고친 뒤 이후 채널을 새 세대로 다시 갱신한다.

## 2. Figma 스냅숏

소유자가 요청하면 [Figma 스냅숏 issue template](../../.github/ISSUE_TEMPLATE/figma-sync.md)으로 실행 issue를 만든다. 대상은 main의 한 commit이고, 범위는 `verification/figma-baseline.json`의 `targetCommit` 이후 매니페스트 해시가 바뀐 컴포넌트와 토큰이다(`packages/ui/dist/manifest/index.gen.json`과 비교). 공개 Storybook 배포가 대상 commit에서 성공한 뒤에 시작한다.

`bun run check`의 parts 경고(규칙 6)와 매니페스트의 `unresolved` 수는 **이때 읽는다** — Figma가 그리지 못하는 자리의 목록이고, 스냅숏 전에 고칠지 그대로 둘지 여기서 정한다.

### 주입

Figma 쓰기 전에 `figma-use` skill을 읽고, 토큰은 [`figma-injection.md`](figma-injection.md), 컴포넌트는 [`figma-components.md`](figma-components.md)를 따른다.

1. Massive Design 문서를 읽기 전용으로 조사한다.
2. 토큰·Foundations 01~07을 전부 재실행한다. 컴포넌트는 manifest 이름으로 찾아 제자리에서 갱신하며, 상태 견본 색은 `state-colors.gen.json`을 소비한다.
3. 컴포넌트 구조 주입 뒤 카탈로그 배치 검사·정규화를 실행한다. 매니페스트 registry 순서의 단일 세로 열이어야 하고, 예상 밖 최상위 노드·누락·중복·잘못된 타입이 없어야 한다.
4. 두 번째 실행에서 생성·삭제·교체와 정규화 구조 diff가 모두 0이고, 카탈로그 배치 `movedCount`가 0인지 확인한다.
5. **폰트 단계.** `Components` 페이지의 TEXT 노드를 세어 `fontFamilyBound: <bound>/<total>`을 보고한다. `bound < total`이면 아래 폰트 바인딩으로 간다.
6. 변경된 자산을 사람이 Light/Dark와 상태 견본으로 확인한다. 토큰이 바뀐 세대에는 `Foundations`의 palette 전체와 semantic 두 모드를 확인한다. **한글 라벨이 실제로 렌더되는지 이때 함께 본다.**

### 폰트 바인딩

에이전트는 `use_figma`가 도는 **저작 런타임**에서 일하고, 그 런타임에는 Pretendard가 없다. 바인딩은 Pretendard가 설치된 **셰이핑 런타임**, 즉 사람의 Figma 데스크톱 앱에서만 성립한다([ADR-0004](../adr/0004-font-shaping-runtime.md)).

1. Figma **데스크톱 앱**에서 `scripts/figma-font-bind`를 실행한다. 최초 1회만 Plugins → Development → Import plugin from manifest…로 등록한다.
2. 플러그인이 낸 `새로 바인딩 <n>`을 확인하고, 한 번 더 돌려 `0`이 나오는지 본다(멱등).
3. 에이전트가 `fontFamilyBound`를 다시 읽어 `n/n`인지 확인한다.

발행은 **이 단계가 끝난 뒤** 한다 — 순서를 뒤집으면 폰트 미완 상태가 발행되고 발행을 두 번 하게 된다. 판정은 **바인딩 유무**이지 `fontName`이 아니다([#115](https://github.com/flameware/massive-design/issues/115)).

### 발행

1. 사람이 Figma 발행 대화상자에서 변경된 컴포넌트·Variables·Text Style·Effect Style을 발행하고, 미발행 변경이 없음을 확인한다.
2. 에이전트가 각 component set의 `getPublishStatusAsync()`로 모두 `PUBLISHED`인지 재확인한다.
3. `verification/figma-baseline.json`을 새 세대(`targetCommit`·컴포넌트별 `manifestHash`·`tokenArtifactHash`·확인자·시각)로 갱신하고 issue에 증거를 적어 닫는다.

리포 밖 소비 파일(invest diary)의 라이브러리 갱신은 소비처의 일이고 이 issue의 완료 조건이 아니다.
