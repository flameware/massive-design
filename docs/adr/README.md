# ADR 색인

ADR은 **불변 로그**다. 한번 쓴 ADR은 지우거나 합치지 않고, 새 결정이 옛 결정을 대체하면 옛 ADR 머리에 배너를 단다. "왜 그렇게 정했나"는 ADR이, "지금 무엇이 구속하나"는 [`rules.md`](../agents/rules.md)와 [`CONTEXT.md`](../../CONTEXT.md)가 진다. ADR을 쓰는 조건과 이 색인을 고치는 규칙은 [`domain.md`](../agents/domain.md)에 있다.

## 유효한 결정

| ADR | 결정 | 한 줄 요약 | 개정 |
| --- | --- | --- | --- |
| [0001](0001-monorepo-over-split-repos.md) | 모노리포 | React/Storybook을 별도 리포로 두지 않고 토큰과 한 리포에 둔다. | |
| [0008](0008-axis-and-value-name-spaces.md) | 축·값 이름 공간 | 축 이름은 카탈로그 전역에서 겹치면 안 되고, 값 이름은 축 안에서만 뜻을 갖는다. 현행 표현은 `rules.md` §축과 이름 공간. | |
| [0017](0017-dependency-weight-is-a-floor-cost.md) | 의존성 무게 | 의존성은 라이브러리 크기가 아니라 소비처가 아무것도 안 써도 무는 **바닥값**으로 잰다. | |
| [0019](0019-what-variant-names.md) | `variant`의 뜻 | `variant`는 그 축을 소유한 노드가 어떤 표면으로 서는가를 이름하고, 컴포넌트는 해당 차원만 채운다. 현행 표현은 `rules.md` §축과 이름 공간. | 결정 1 (#224·#237) |
| [0020](0020-pointer-target-size-is-borne-by-the-hit-area.md) | 포인터 대상 크기 | 24×24 하한은 투명 히트 영역이 지고, 시각 치수는 움직이지 않는다. | |
| [0023](0023-second-generation-base-ui.md) | 2세대 | Base UI 위에 다시 세우고 계약·매니페스트·Figma 파생을 폐기한다. 1세대 ADR 대부분을 대체한다. | §4 → 0024, §10 → 0026 |
| [0024](0024-package-scope-follows-the-registry-owner.md) | 패키지 스코프 | 스코프는 레지스트리 소유자를 따라 `@flameware/*`다. | |
| [0025](0025-reference-words-carry-meaning-not-spelling.md) | 레퍼런스 번역 | 레퍼런스(shadcn)의 토큰 이름은 철자가 아니라 뜻으로 옮긴다. shadcn `accent` ≠ DS accent. | |
| [0026](0026-baseline-form-controls-need-no-consumer-evidence.md) | 기본 폼 컨트롤 | 네이티브 HTML 입력에 대응하는 폼 컨트롤은 소비처 근거 없이 만든다. ADR-0023 §10의 유일한 예외. | |

## 대체된 결정

아래는 모두 [ADR-0023](0023-second-generation-base-ui.md)이 대체한 1세대 결정이다. 1세대 코드와 `docs/handoff/`를 읽을 때만 연다.

- [0002](0002-separate-repo-verification-from-figma-sync.md) Repo verification과 Figma Sync를 독립 작업으로 분리한다
- [0003](0003-neutral-solid-alias-name.md) 중립 solid 배경의 별칭을 `neutral-solid`로 연다
- [0004](0004-font-shaping-runtime.md) 한글 셰이핑을 셰이핑 런타임의 사람 단계에 맡긴다
- [0005](0005-inherited-dismiss-gestures.md) 상속 dismiss 제스처를 얕게 계약한다
- [0006](0006-uncontracted-surfaces.md) 미계약 표면을 두 관문으로 가르고, 판정을 계약에 남긴다
- [0007](0007-knockout-border.md) 겹침 링은 `background`가 아니라 `border.knockout`이다
- [0009](0009-drawn-but-not-carried.md) 파생 채널이 나르지 않는 자리는 계약이 검사 가능한 모양으로 적는다
- [0010](0010-behaviors-are-declared-and-human-verified.md) 동작을 계약이 선언하고 확인표를 생성한다
- [0011](0011-axis-readback-and-part-axis-inheritance.md) 축 되읽기 수식자와 파트의 root 축 상속
- [0012](0012-drawn-elsewhere.md) 무리 안 위치는 제4의 등급 `elsewhere:`로 판정한다
- [0013](0013-slot-labels-are-borne-by-the-contract.md) 슬롯의 이름표는 계약이 진다
- [0014](0014-modifier-chains-are-paths.md) 수식자 사슬은 경로다
- [0015](0015-behaviors-boundary-is-the-cause.md) `behaviors`의 경계는 계기가 가른다
- [0016](0016-primitive-base-stays-radix.md) primitive 기반은 `radix-ui`에 머무른다
- [0018](0018-anatomy-is-the-consumer-assembly.md) `anatomy`는 소비처가 조립하는 것을 이름한다
- [0021](0021-reference-screen-words-are-two-layers.md) 참조 화면의 낱말은 두 층이다
- [0022](0022-guidance-is-for-the-consumer.md) 참조 화면의 세 문장은 소비처의 것이다
