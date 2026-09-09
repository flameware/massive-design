# 2세대 — Base UI 기반으로 다시 세우고, 계약·매니페스트·Figma 파생을 폐기한다

상태: accepted · 2026-09-09 · 그릴링 세션의 결정 25개를 담는다

1세대는 shadcn/ui를 옮겨 51개 컴포넌트를 채웠고, 그 위에 계약(`componentContract`)·매니페스트·게이트·Figma 스냅숏이라는 파생 기계를 세웠다. [2026-09 점검](../handoff/repo-review-2026-09.md)이 잰 결과: DS 본체 약 5,400줄에 검증·동기화 툴링 약 10,000줄, 9월 이슈 95건 중 신규 컴포넌트 0건·재측정 54건. 그리고 "shadcn을 무비판적으로 옮기다 보니 어떤 구조로 구성해야 할지 생각하지 않았다"는 소유자의 판단이 이 ADR의 출발점이다.

## 결정

### 1. 같은 리포에서 **새 세대**를 시작한다. 점진 이행이 아니다

- `@massive/tokens`는 그대로 승계한다 — OKLCH 램프 생성기, semantic 상한 lint, 대비 게이트, Pretendard 셰이핑이 이 리포의 값진 자산이다.
- `packages/ui`는 새로 쓴다. 옛 51개는 태그 `v1-shadcn`을 찍고 **즉시 삭제**한다. `ui-legacy`로 옮겨 두지 않는다 — "나중에 쓸지도"는 점진 이행의 다른 이름이다.
- 매니페스트 생성기·계약 검증·`parts` 커버리지·`sync:checklist`·Figma digest·카탈로그 verify는 **삭제**한다. git 히스토리가 보존한다.
- 새 리포를 열지 않는 이유: 얻는 것이 "깨끗한 느낌"뿐이고, tokens와 규칙 원장의 히스토리를 끊는 대가가 있다.

### 2. primitive 기반은 **Base UI**(`@base-ui/react`)다 — [ADR-0016](0016-primitive-base-stays-radix.md)을 대체한다

ADR-0016은 "바꾸는 쪽이 입증한다"였고 그 시험은 1세대의 24개를 이행하는 비용에 대한 것이었다. 이번은 이행이 아니라 **세대를 새로 시작하며 기반을 처음 고르는 것**이라 프레임이 다르다. 그래도 이유는 적는다.

- 주 이유: `render` prop(함수로 내부 상태를 받아 마크업을 가른다), `Field`·`Fieldset`·`Form` 프리미티브, `data-*` 상태 속성 기반 스타일링 — 설계 자체가 우리가 원하는 모양이다.
- 보조 이유: upstream shadcn/ui가 Base UI를 1차로 제시해 참고 자료가 그쪽으로 모인다. ADR-0016이 "그 자체로는 근거가 아니다"라고 한 판정을 유지하며 보조로만 둔다.
- 소비처와 맞는 자리: invest diary의 종목 검색(Command+Popover 조립)은 Base UI `Combobox`에, 모바일 다이얼로그는 Base UI `Drawer`에, React Hook Form 결합은 `Field`의 `render`에 1:1로 앉는다.
- **ADR-0016이 적은 세 손실을 그대로 받아들인다** — 독립 `Label` 없음(`Field.Label`만), Accordion roving focus 없음, Tabs 기본 수동 활성화. v1.8.0(2026-09-04)에서도 셋 다 그대로다. Tabs만 우리 기본값을 자동 활성화로 감싼다.
- radix 유지보수 우려는 이유로 적지 않는다 — ADR-0016 §7.1이 근거를 찾지 못했다고 기록했다.
- "기반은 하나"라는 ADR-0016 §3의 규칙은 **승계**한다. 기반이 바뀌었을 뿐 규칙은 같다.

### 3. 스타일링은 Tailwind v4 + cva를 유지한다

토큰 파이프라인이 Tailwind `@theme` 등록 위에 서 있고 Base UI 문서가 Tailwind를 1급으로 다룬다. `alias/shadcn.json` 층은 **삭제**한다 — 존재 이유가 "shadcn 코드를 그대로 붙여넣기"였고 이번 세대는 그것을 하지 않는다. 컴포넌트는 semantic 이름을 직접 소비한다.

### 4. 배포는 npm 패키지이고, 대상은 GitHub Packages다

`@massive/tokens`·`@massive/ui` 두 패키지. `@massive/ui/button`식 서브패스 export로 tree-shaking한다. 아이콘은 `lucide-react`를 peer로 두고 `Icon` 래퍼만 제공한다. 첫 게시는 `0.1.0`. 빌드와 타입 emit이 지금 없으므로 Phase 1의 패키징 작업이다.

shadcn식 레지스트리(소비처가 소스를 복사)는 배제한다 — 이번 피벗이 벗어나려는 구조를 소비처마다 재생산한다. invest diary의 "massive-design 산출물을 수동 복사로 받는다"는 규약(그쪽 ADR-0012)은 npm 의존으로 개정한다.

### 5. 컴포넌트 API는 네임스페이스형이고, 프리셋은 Composites 층에 산다

`import { Dialog } from '@massive/ui/dialog'` 뒤 `<Dialog.Root>` — Base UI 문서·`render` prop과 1:1이라 학습 비용이 없다. 흔한 조립(`ConfirmDialog` 등)은 **소비 앱에서 반복이 확인된 뒤** Composites 층의 프리셋으로 올린다. Phase 1에는 넣지 않는다.

### 6. 계약의 후계는 **얇은 meta 하나**다

컴포넌트가 자기에 대해 선언하는 것은 `{ category, status, since }` 정도이고, 읽는 곳은 문서 사이드바 순서와 상태 표뿐이다. 1세대의 교훈: 선언이 커질수록 선언을 검증하는 일이 본업을 삼킨다. 디자인 판단이었던 규칙(히트 영역 24px, 역할 기반 대비)은 선언이 아니라 **테스트**로 남긴다.

상태 어휘는 `planned → preview → stable → deprecated` 넷이다.

### 7. 층위와 분류는 다른 축이다

- **층위(layer)** — 의존 순서. Foundations → Primitives → Composites → Patterns. Phase를 자르는 축이다.
- **분류(category)** — 문서 사이드바. Foundations · Actions · Forms · Navigation · Overlays · Feedback · Data display · Layout · Typography · Patterns.

하나의 축으로 둘을 겸하면 "Dialog는 primitive인가 overlay인가"가 반복된다. 참고한 세 시스템(Fluent UI v9·govuk-react·Carbon) 중 둘은 층위 구조가 없고 Carbon만 웹사이트에서 Elements → Components → Patterns를 가르므로, 층위는 베낀 것이 아니라 우리가 설계한 것이다.

### 8. 문서는 Storybook 유지 + MDX 문서 계층이다. 별도 사이트는 Phase 2 말에 재판단한다

참고한 세 시스템이 모두 Storybook이고, 컴포넌트 페이지는 "한 줄 설명 + 짧은 best-practice + 변형 스토리 + 자동 props 표" 수준이다. 부족한 것으로 확인된 것은 사이드바 구조·매니저 외관·문서 페이지 내용 셋이고, 셋 다 Storybook 안에서 해결된다. "문서 사이트가 아니라 개발 도구로 읽힌다"는 정체성 문제가 남으면 Phase 2 말에 별도 사이트(Astro/Next)로 옮기고 Storybook은 워크벤치로 내린다. MDX로 쓴 문서는 옮겨도 그대로 산다.

### 9. Figma는 **보류**다 — 모든 Phase가 끝난 뒤 진행 여부를 판단한다

[ADR-0002 개정](0002-separate-repo-verification-from-figma-sync.md)의 "요청 시 스냅숏"에서 한 단계 더 내린다. 스냅숏을 만드는 툴링이 이 ADR로 삭제되므로 요청이 와도 지금 만들 수 없다. `verification/figma-baseline.json`은 1세대의 마지막 기록으로만 남는다.

### 10. 소비처가 필요의 잣대다 — Phase 1의 완료 조건은 앱이 돌아가는 것이다

첫 소비처는 리포 밖의 **invest diary**(Next.js 15, React 19, Tailwind v4, 모바일 웹 768px 브레이크포인트)다. Phase 1 완료 = 그 앱의 `components/ui/`가 비고 `@massive/ui` import로 세 화면(포트폴리오·히스토리·노트)과 인증이 돌아가는 것. 이행은 화면 단위(인증 → 히스토리 → 포트폴리오 → 노트)로 하고 두 라이브러리가 한 화면에 공존하는 기간을 최소화한다.

손익 색(한국 관행 상승 빨강·하락 파랑)은 **앱 소유**다. DS는 패밀리를 더하지 않고, 대신 **램프 생성기를 API로 노출**해 앱이 자기 키 컬러로 손익 램프를 만들게 한다. warning·info 패밀리는 Phase 2에서 Toast·Alert가 요구할 때 더한다.

### 11. 비기능 축

| 축 | 판정 |
| --- | --- |
| 라이트/다크 · 아이콘 · 폼 검증(Field/Form) | Phase 1 |
| 모션 토큰 · 반응형 레이아웃(Stack/Grid) | Phase 2 |
| RTL · 밀도(compact/comfortable) | 영구 제외 |

폼 라이브러리(React Hook Form, TanStack Form)는 DS에 넣지 않는다 — 앱마다 갈리고 `Field`의 `render`로 어느 쪽이든 붙는다. DS가 특정 폼 라이브러리를 물면 바닥값([ADR-0017](0017-dependency-weight-is-a-floor-cost.md))에 얹힌다.

### 12. 게이트는 줄인다. 새 게이트는 소비 앱에서 결함이 난 뒤에만 더한다

- 유지: tokens `lint`·`contrast`·`verify`, `tsc`, Storybook axe.
- 형태 변경: 포인터 24px → Playwright 테스트. "primitive 팔레트 직접 사용 금지" → ESLint 규칙 또는 grep 테스트.
- 삭제: manifest-verify, parts-coverage, sync:checklist, figma digest, catalog verify.

### 13. 옛 코드에서 tokens 외에 살리는 것 셋 — 형태를 바꿔서

`cn`(그대로) · `state.css`의 상태 레이어 사다리(Base UI `data-*` 상태 속성에 맞춰 셀렉터만 다시 씀) · 히트 영역 24px `after:` 패턴(cva 변형이 아니라 재사용 클래스 하나 + Playwright 테스트).

## Phase 표

층위 × invest diary의 실제 사용(import 자리 수: Button 21, Card 15, Badge 9, Input 8, DropdownMenu 7, Alert 7, ListRow 5, Toggle·ToggleGroup·Label·Dialog·AlertDialog 4, Select·Form 3, Table·Command·Checkbox 2, Tooltip·Textarea·Tabs·Avatar 1)으로 잘랐다.

**Phase 1 — 앱의 세 화면 + 인증이 `@massive/ui`로 돌아가는 것**

| 층 | 항목 |
| --- | --- |
| Foundations | 토큰(색·타이포·간격·라운드·그림자) · 라이트/다크 · Pretendard · `Icon` 래퍼 · 브레이크포인트는 Tailwind 기본값 |
| Primitives (Base UI) | Button · Input · Textarea · Checkbox · Select · Toggle · ToggleGroup · Tooltip · Dialog · AlertDialog · Drawer · Field(+Label) · Avatar · Separator · Tabs |
| Primitives (자체 스타일) | Card · Badge · Alert · Table · ListRow · Skeleton · Spinner · Text/Heading |
| Composites | Menu · Combobox · Form(Field+Form) |
| Patterns | Page shell(헤더 + 탭 내비) · Theme toggle |

**Phase 2** — Popover · Toast · Radio · Switch · NumberField · Accordion · Collapsible · Progress · Meter · ScrollArea · Pagination · Stack/Grid · 모션 토큰 · Empty state 패턴 · 프리셋 첫 후보(ConfirmDialog) · warning·info 패밀리

**Phase 3 — 필요가 확인되면** — NavigationMenu · Menubar · ContextMenu · Toolbar · PreviewCard · OTPField · Slider · Breadcrumb · Sidebar · Command palette · DatePicker(서드파티) · Carousel · Resizable

**돌아오지 않는 것** — Chart(ADR-0017대로 소비처 몫) · Sheet(Drawer가 대체) · InputGroup · ButtonGroup · NativeSelect · Kbd · Item · Calendar(DatePicker에 흡수)

## 승계와 대체

**승계** — 디자인 판단이었던 것: [0001](0001-monorepo-over-split-repos.md) 모노레포 · [0003](0003-neutral-solid-alias-name.md) neutral-solid · [0004](0004-font-shaping-runtime.md) 폰트 셰이핑 · [0008](0008-axis-and-value-name-spaces.md) 축 이름 공간 · [0017](0017-dependency-weight-is-a-floor-cost.md) 바닥값 · [0018](0018-anatomy-is-the-consumer-assembly.md) anatomy · [0019](0019-what-variant-names.md) variant의 뜻 · [0020](0020-pointer-target-size-is-borne-by-the-hit-area.md) 히트 영역 · [0022](0022-guidance-is-for-the-consumer.md) 지침은 소비처용. 규칙 원장의 대비·포인터·축 규칙, 그리고 "이슈는 소비자 대면 모양·소비 앱 결함·패키징을 바꿀 때만 연다"([2026-09 점검](../handoff/repo-review-2026-09.md)) — 지난 세대에서 가장 비싸게 배운 규칙이다.

**이 ADR이 대체(superseded)** — radix 표면·매니페스트 스키마·Figma 파생을 전제한 것: [0002](0002-separate-repo-verification-from-figma-sync.md) · [0005](0005-inherited-dismiss-gestures.md) · [0006](0006-uncontracted-surfaces.md) · [0007](0007-knockout-border.md) · [0009](0009-drawn-but-not-carried.md)~[0015](0015-behaviors-boundary-is-the-cause.md) · [0016](0016-primitive-base-stays-radix.md) · [0021](0021-reference-screen-words-are-two-layers.md). 0005·0007은 내용이 Base UI에서도 성립할 수 있으나 재검증 없이 승계하지 않는다.

`docs/handoff/`와 규칙 원장의 1세대 서술은 지우지 않고 **역사**로 남긴다.

## 고려한 대안

- **같은 리포에서 점진 이행.** ADR-0016이 미확인으로 남긴 두 기반의 공존 리스크(두 모달의 포커스 트랩·스크롤 잠금 중첩)를 매일 안고 가고, 툴링을 살리려다 1세대의 재측정 패턴이 반복된다.
- **새 리포.** tokens와 규칙 원장의 히스토리를 끊는 대가만 있다.
- **CSS Modules로 Tailwind 비강제.** 소비 앱에 Tailwind를 강제하지 않는 장점이 있으나, 유일한 소비처가 이미 Tailwind v4이고 토큰 파이프라인을 다시 짜야 한다.
- **별도 문서 사이트를 지금.** Phase 1 컴포넌트 작업과 사이트 구축이 경쟁한다. MDX는 나중에 옮겨도 그대로 살므로 미룰 수 있다.
- **DS가 `positive`·`negative` 패밀리를 소유.** 금융 도메인이 DS에 들어온다. DS는 앱에 중립이어야 한다.
- **참고 시스템 셋의 교집합으로 Phase 1.** 교집합이 곧 "내게 필요한 것"이 아니다.

## 파급

- 코드는 이 ADR로 바뀌지 않는다. Phase 1 맵 이슈가 실행을 연다.
- `CONTEXT.md`에 층위·분류·상태·프리셋이 들어가고, 계약·파트·표면·게이트·파생 채널·세대는 1세대 용어로 표시된다.
- `AGENTS.md`의 표준 지시(규칙 원장 읽기, `sync:checklist`)는 Phase 1이 툴링을 지우는 시점에 함께 고친다.
- 1세대의 ADR-0016 재판정 트리거 4번("리포 밖 소비처가 생긴다")은 이미 성립해 있었다 — invest diary가 그것이다.
