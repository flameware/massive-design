# 컴포넌트 맵 인계 가이드

확정: 2026-08-20 · 근거 티켓 [#12](https://github.com/flameware/massive-design/issues/12) · 이전 맵 [massive-design 토큰 파운데이션 #1](https://github.com/flameware/massive-design/issues/1)

**다음 맵의 차팅 세션은 이 문서 하나만 읽고 시작하면 된다.** 토큰 맵의 결정을 다시 읽을 필요는 없고, 필요할 때 링크를 따라가면 된다.

---

## 1. 다음 맵의 destination 초안

> **massive-design 모노리포에서 shadcn 기반 React 컴포넌트가 `@massive/ui`로 서고, 그 구조가 매니페스트로 나오며, 에이전트가 그걸 읽어 `use_figma`로 Figma 컴포넌트를 만들고, 공개된 Storybook에서 코드·Figma 양쪽이 한 화면으로 보이는 상태.**
>
> "LLM이 우리 Figma 컴포넌트를 조립해 화면 시안을 만들 수 있다"가 완료 판정이고, **그 자동화 흐름 자체가 이 프로젝트가 남에게 보여주려는 것**이다.
>
> 실제 앱(invest diary)에의 적용은 이 맵 밖.

### 이 맵은 실행을 포함한다 — wayfinder 기본값을 깨야 한다

wayfinder는 기본적으로 **결정만 내리고 실행은 인계하는** 도구다. 티켓 하나가 결정 하나를 해소하고, 더 결정할 게 없으면 맵이 끝난다.

**다음 맵은 그 기본값으로는 돌아가지 않는다.** destination이 결정이 아니라 **작동하는 상태**이기 때문이다 — "공개된 Storybook에서 보인다"는 누가 가서 만들어야 도달한다. 이걸 명시하지 않으면 모든 티켓이 억지로 결정 모양을 하려 들고, 모노리포 재구조화·shadcn 설치·Storybook 세팅·배포 같은 **순수 실행 작업이 갈 곳을 잃는다.**

→ **맵의 `## Notes`에 "이 맵은 실행을 포함한다"를 명시할 것.** 스킬이 그 오버라이드 경로를 열어두고 있다.

판단 기준: 결정이 필요한 티켓은 `grilling`/`prototype`/`research`, 정해진 걸 만들기만 하면 되는 티켓은 `task`. 다만 `task`가 늘어난다고 해서 맵이 잘못된 건 아니다 — 이 맵의 성격이 원래 그렇다.

### destination을 이렇게 잡은 이유 — 관객이 있다

이 프로젝트는 개인 프로젝트이면서 동시에 **포트폴리오이자 작업 방식 변경을 논의하기 위한 예시**다. 관객이 있다는 사실이 다음 맵의 무게중심을 옮긴다:

- 다음 맵의 목표는 "컴포넌트를 만든다"가 **아니라** "코드에서 Figma까지 흐르는 파이프라인을 남이 볼 수 있게 세운다"이다
- 컴포넌트는 그 파이프라인이 흐르는지 보이기 위한 **최소 재료**다. 그래서 컴포넌트 개수·범위는 미리 정하지 않는다(§4)
- **Storybook은 인프라가 아니라 산출물이다.** 공유할 수 없는 Storybook은 관객이 없는 것과 같으므로, 공개 URL이 destination의 일부다

### "Figma + LLM 디자인 자동화"의 방향

**코드 → Figma → LLM이 조립** 한 방향으로 확정했다. LLM이 우리 Figma 컴포넌트를 인스턴스로 꺼내 화면 시안을 만든다.

반대 방향(Figma에서 디자인하고 LLM이 React로 옮김)은 **택하지 않았다.** 토큰 맵이 "코드가 source of truth, Figma는 단방향 파생"을 이미 확정했고 그 뼈대와 정면으로 싸우며, Code Connect가 Pro에서 막힌 것이 곧바로 벽이 되기 때문이다.

---

## 2. 이미 확정된 것 — 다시 묻지 말 것

다시 열려면 **명시적으로 뒤집어야** 한다.

### 2.1 토큰 (이전 맵의 산출물)

| 항목 | 어디를 볼 것 |
|---|---|
| semantic 토큰 어휘 30개 · shadcn alias 34개 매핑 | [`docs/tokens/semantic-tokens.md`](../tokens/semantic-tokens.md) |
| 비색상 스케일 (space·typography·radius·shadow) | [`docs/tokens/scale-tokens.md`](../tokens/scale-tokens.md) |
| 빌드 파이프라인 · 생성물 커밋 규약 | [`docs/tokens/build-pipeline.md`](../tokens/build-pipeline.md) |
| Figma 주입 절차 · 멱등 패턴 · 함정 | [`docs/agents/figma-injection.md`](../agents/figma-injection.md) |

핵심만 추리면:

- **component 계층 토큰은 0개**이고, 규칙만 있다: **"component는 semantic만 참조한다."** primitive를 직접 집는 컴포넌트는 규칙 위반이다. 실제 component 토큰을 정의할지 말지는 다음 맵이 정한다 — 이전 맵은 "컴포넌트 없이 만들면 공상"이라 규칙만 남겼다
- **primitive는 Tailwind `@theme`에 등록되지 않는다.** `bg-brand-500` 같은 유틸리티는 존재하지 않는다. 컴포넌트가 쓸 수 있는 색은 shadcn 이름(`bg-primary` 등)뿐이다
- **상태 색 토큰은 0개.** hover/pressed/disabled는 M3식 **state layer**로 만든다 — `color.state.layer` 위에 `state.hover.opacity`(0.08) / `pressed`(0.12) / `disabled`(0.5)를 `color-mix`로 얹는다
- **알파 램프는 없다.** 리터럴 primitive 3개(`alpha.white.10/.15`, `alpha.black.50`)뿐

### 2.2 출력물을 소비하는 방법

`@massive/tokens`가 `dist/tokens.css`를 낸다. 이 파일이 shadcn의 `globals.css`를 **통째로 대신한다** — 변수 34개뿐 아니라 **`@layer base`의 두 규칙까지** 낸다.

- **한때 변수만 냈고 그게 [#36](https://github.com/flameware/massive-design/issues/36)의 결함이었다.** 정본의 마지막 블록은 변수가 아니라 규칙이라 "변수 34개를 전부 낸다"는 점검을 통과했다. `* { border-color; outline-color }`가 없으면 `border` 유틸리티가 `currentColor`로 그려지고(라이트에선 진한 테두리처럼 보여 눈에 안 띈다), `body { background-color; color }`가 없으면 다크에서 UA 기본 검정 글자가 된다

- `@import "tailwindcss";` **뒤에** import 한다
- `@theme inline`이 **필수**다. 그냥 `@theme`는 중첩 `.dark` 서브트리를 조용히 깨뜨린다(빌드 diff로 실증됨)
- **`.dark`는 문서 루트든 중첩 서브트리든 어디에 붙어도 된다.** `<div class="dark">` 하나로 그 안쪽만 다크가 되므로, 라이트·다크를 한 화면에 나란히 놓을 수 있다. `dist/tokens.css`의 `.dark`가 semantic 30 + **shadcn alias 34**를 함께 재선언해 이걸 지탱한다 — alias를 빼면 `--ds-*`만 뒤집히고 alias는 라이트에 남는다(브라우저 실측: 중첩 `.dark`에서 `--ds-bg-canvas`는 `#0c0c0c`인데 `--background`는 `#f8f8f8`). 이 문서는 한때 "`.dark`는 semantic만 재선언한다"고 적었고 그게 [#35](https://github.com/flameware/massive-design/issues/35)의 결함이었다
- **반대 방향은 없다** — `.dark` 안쪽을 다시 라이트로 되돌리는 `.light`는 없다. 나란히 놓을 때 바깥이 라이트여야 한다
- 모노리포 안에서는 복사가 아니라 **패키지 경로로 import** 한다: `@massive/tokens/dist/tokens.css`
- 리포 밖 소비처(invest diary)만 여전히 파일을 복사해 간다

### 2.3 코드 컴포넌트

- **shadcn을 감싸지 않고 그대로 쓴다.** 감싸는 표준 명분은 "서드파티 API 변경으로부터의 격리"인데 shadcn에는 그 서드파티가 없다 — 파일이 이미 우리 리포에 있고 우리가 편집한다. 감싸면 `variant` prop을 두 번 선언하고 두 번 동기화하는 순수 비용만 남는다
- **컴포넌트의 원본은 코드, Figma는 단방향 파생.** 토큰과 같은 규칙을 물려받는다
- 단, **파생의 자동화 수준은 낮게 잡는다.** "빌드가 Figma 컴포넌트를 생성한다"가 아니라 **"에이전트가 코드를 읽고 `use_figma`로 만든다"**. 토큰에서 통했던 완전 자동 파생을 컴포넌트에 요구하면 다음 맵이 그 도구를 만드느라 전부 소진된다

### 2.4 리포 구조 — 모노리포

**이전 맵의 "React/Storybook은 별도 리포" 결정은 [#12](https://github.com/flameware/massive-design/issues/12)에서 뒤집혔다.** 근거는 [ADR-0001](../adr/0001-monorepo-over-split-repos.md).

```
massive-design/
├── package.json            # workspaces: ["packages/*", "apps/*"]  ← 루트. 코드 없음
├── bun.lockb               # 하나뿐
├── node_modules/           # 하나뿐
├── packages/
│   ├── tokens/             # ← build-pipeline.md §1이 확정한 구조가 통째로 여기로
│   │   ├── package.json    #   name: "@massive/tokens"
│   │   └── tokens/ scripts/ dist/
│   └── ui/
│       ├── package.json    #   name: "@massive/ui"
│       │                   #   dependencies: { "@massive/tokens": "*" }
│       └── src/            #   shadcn 컴포넌트 + 매니페스트 빌드
├── apps/
│   └── storybook/          #   dependencies: { "@massive/ui": "*" }
└── docs/                   # 루트에 남는다 — 맵·ADR·에이전트 규약은 패키지 소유가 아니다
```

- **패키지 매니저는 bun. 런타임은 node.** `bun install`로 설치·워크스페이스를 관리하고, 토큰 빌드 스크립트는 `node scripts/build.mjs` 그대로 둔다. `node --test` 결정(build-pipeline)이 한 줄도 안 바뀐다
- ⚠️ **Storybook 세팅이 이 선택의 시험대다.** *bun 워크스페이스 + Vite 번들러의 Storybook*에서 경로 해석 이슈가 보고돼 있다([storybook#28335](https://github.com/storybookjs/storybook/discussions/28335)). 하필 우리 구성이고 하필 관객이 있는 산출물이다. 터지면 npm으로 후퇴한다 — `workspaces` 선언이 매니저마다 동일하므로 잠금 파일 교체 하나다
- 맵과 티켓은 **이 리포의 GitHub Issues**에 계속 산다. 리포가 하나이므로 이전에 고민했던 "맵이 두 리포를 가로지르는" 문제 자체가 없어졌다

### 2.5 컴포넌트 매니페스트

`@massive/ui`가 **컴포넌트 구조를 기계가 읽을 형태로** 내보낸다. 컴포넌트별 variant·size·상태·사용 토큰.

- **생성물이므로 커밋한다.** `dist/**`를 커밋하는 것과 같은 논리(토큰 맵 결정)
- **출처는 `cva` 정의이지 CSF가 아니다.** variant의 진실은 `cva` 호출에 있고 스토리는 그걸 손으로 옮겨 적은 사본이다. 사본에서 뽑으면 사본을 원본 취급하게 된다
- **CI가 검증한다** — "매니페스트가 소스와 어긋났다"를 잡는다. 리포를 건널 땐 낡아도 알 길이 없었지만 같은 리포에 있으면 잡힌다
- 매니페스트는 모노리포로 바뀌면서도 살아남았다. 원래는 리포 경계를 건너려고 만든 것이었지만, "에이전트가 매번 TSX를 다시 해석하는 지점을 없앤다"는 논거가 경계와 무관하게 유효하다

---

## 3. 이전 맵이 인계하는 함정과 사실

**이 절이 이 문서에서 가장 값진 부분이다.** 모르면 다음 맵이 같은 벽에 다시 부딪힌다.

### 3.1 다크 elevation은 그림자가 아니라 border가 표현한다

그림자는 **라이트/다크 한 벌**이다. Figma에서 shadow는 Effect Style이라 Variable이 아니고 **모드 전환이 안 되기** 때문이다. 두 벌을 만들면 `Shadow/md`와 `Shadow/md Dark`가 나란히 서고 어느 쪽이 정본인지 규약이 필요해진다.

그 결과 **다크 border 계열의 알파 예외가 elevation 시스템의 절반을 떠맡는다.** `border.default`는 다크에서 `alpha.white.10`, `border.field`는 `alpha.white.15`다.

→ **다음 맵이 이걸 모르면 다크 카드·팝오버를 그림자로 띄우려다 실패한다.** 다크에서 면이 떠 보이게 하는 수단은 border다.

### 3.2 Figma는 `color-mix`를 표현할 수 없다

state layer(§2.1)는 `color-mix`로 구현되는데 Figma Variable에는 그런 게 없다. **상태 표현이 코드와 Figma에서 구조적으로 갈린다.**

이걸 알고도 채택한 이유는 대안이 더 비싸기 때문이다 — 상태마다 램프 단계를 따로 두면 상태 토큰이 폭발한다.

→ 다음 맵이 정해야 할 것: Figma 컴포넌트의 hover/pressed 상태를 **어떻게 표현할 것인가.** 후보는 (a) 상태 variant를 만들되 색을 손으로 계산해 박는다 (b) 상태를 Figma에 아예 안 만들고 기본 상태만 둔다. 어느 쪽이든 **코드가 원본이고 Figma가 근사치**라는 사실은 변하지 않는다.

### 3.3 role 타이포 어휘는 폐기가 아니라 연기다

`text-body` 같은 role 이름을 안 만들고 t-shirt 이름(`text-sm`)을 유지했다. 결정적 이유는, role 어휘를 **추가**하면 `text-sm`이 라틴 기준 line-height로 남는데 **화면 면적의 대부분이 shadcn 컴포넌트 내부이고 거기가 전부 `text-sm`** 이라는 것 — 한국어 line-height 결정이 정작 실제 화면에 안 닿는다.

→ 컴포넌트가 생기면 그 위에서 다시 정한다. **단, 값 override는 이미 되어 있으므로 role 어휘를 추가하더라도 "값을 정하는" 일이 아니라 "이름을 붙이는" 일이다.**

### 3.4 Figma 제약이 컴포넌트 작업에 미치는 영향

[`docs/agents/figma-injection.md`](../agents/figma-injection.md)를 반드시 읽고 시작할 것. 컴포넌트 작업에 직접 걸리는 것만 추리면:

- **컴포넌트는 이름으로 찾아 제자리에서 고친다. 절대 재생성하지 않는다.** 변수는 지웠다 다시 만들어도 그만이지만, **컴포넌트를 재생성하면 캔버스의 인스턴스가 전부 끊긴다.** 토큰 맵의 멱등 패턴보다 한 단계 더 엄격한 요구다
- **낡음 판정은 매니페스트 해시를 컴포넌트 `description`에 박아서 한다.** 리포는 Figma 주입 기록을 보관하지 않는다(Figma가 상태를 갖고 있다) — 상태를 Figma에 남기는 이 방식이 그 원칙과 일치한다
- **텍스트를 다 쓴 뒤 마지막에 `fontFamily`를 바인딩한다.** 바인딩된 노드는 `characters` 쓰기도 `appendChild` 대상도 될 수 없다. 구조가 먼저, 폰트가 나중
- **`fontFamily` 바인딩은 첫 시도가 반드시 실패한다**(Regular 제외). 3회 재시도로 감쌀 것. `use_figma`의 atomic 롤백이 이 부수효과는 되돌리지 않아 "두 번 돌리면 되던데"로 감춰진다
- **`setTextStyleIdAsync`로 Pretendard 스타일을 노드에 적용할 수 없다.** 노드에는 스타일이 아니라 변수를 직접 바인딩한다
- **Code Connect는 Pro에서 쓸 수 없다**(플랜 확정). 코드↔Figma 매핑 수단을 다른 걸로 정해야 한다 — §4 참조
- `code` 파라미터 상한 **50,000자**. 토큰 61개가 약 4KB였으니 컴포넌트도 여유는 있지만, 컴포넌트는 노드를 만들므로 토큰보다 훨씬 무겁다

### 3.5 warning · info 패밀리를 추가할 때

**티켓을 만들 필요는 없다.** 키 컬러 한 줄 추가로 설계돼 있다. 다만 다음 사실을 알고 할 것:

- **그 한 줄이 램프 override ②(단계별 L/C/H)의 첫 검증자다.** 지금까지 8개 램프가 단계 override를 하나도 안 써서 ②는 자리·문법만 잡혀 있고 실행된 적이 없다. 미구현 키는 조용히 무시되지 않고 **에러**를 낸다
- 새 키 컬러는 **step 9 위 흰 텍스트가 WCAG AA(4.5)를 넘어야 한다.** 넘지 못하면 `fg.on-solid`를 단일 토큰으로 둔 결정이 깨진다. 기존 4패밀리는 4.80~5.41로 통과한다
- 노랑 계열은 cusp L이 높아(초록 0.872 사례 참조) 중간 단계가 형광이 되기 쉽다. `min(cusp(L), cusp(keyL))` 상한이 이미 걸려 있지만 눈으로 확인할 것

---

## 4. 처음부터 다시 물어야 할 것

이전 맵이 **의도적으로 답하지 않은** 것들이다. 다음 맵의 차팅이 여기서 시작한다.

1. **컴포넌트 범위와 우선순위.** 파이프라인을 증명하는 데 Button 하나로 충분한지, 폼 전체가 필요한지. destination이 "파이프라인을 보인다"이므로 개수는 목표가 아니라 수단이다
2. **Figma 컴포넌트와 React 컴포넌트의 동기화 수단.** Code Connect가 막힌 상태의 대안. 매니페스트 해시(§3.4)가 "낡았는지"는 알려주지만 "이 Figma 컴포넌트가 어느 React 컴포넌트인지"는 여전히 이름 규약에 기대고 있다
3. **Figma 컴포넌트의 상태 표현.** §3.2의 `color-mix` 부재를 어떻게 처리할지
4. **component 계층 토큰을 실제로 정의할 것인가.** 규칙("semantic만 참조")만 있고 토큰은 0개다. 컴포넌트가 생긴 뒤에야 값이 매겨진다
5. **role 타이포 어휘**(§3.3)
6. **`--chart-1..5` 시각화 팔레트.** 무채색 플레이스홀더로 미뤄져 있다. 4패밀리에서 범주형 5색을 뽑으면 danger/success의 의미가 데이터에 잘못 실린다는 것이 확인됐으므로 **별도 설계가 필요하고**, 차트를 실제로 그리는 화면이 생겨야 값이 매겨진다
7. **Storybook의 형태.** 관객이 있으므로 "무엇을 보여줄 것인가"가 설계 대상이다. 컴포넌트 카탈로그인지, 파이프라인 자체를 설명하는 문서인지, 둘 다인지
8. **공개 배포 수단.** Storybook을 어디에 띄울지. destination의 일부다

### 열지 않는 것

| 항목 | 이유 |
|---|---|
| npm 배포 / 버저닝 | 소비처가 여전히 하나. 워크스페이스라 나중에 여는 건 `private: false` 한 줄 |
| 시각 회귀 테스트 | 관객은 결과를 보지 테스트를 안 본다. 더 뒤 |
| Code Connect | Pro에서 불가. 플랜 문제라 논의로 안 바뀐다 |
| invest diary의 v4 마이그레이션 | 사용자가 별개로 진행 |

---

## 5. 이전 맵이 남긴 미해결 fog

다음 맵이 받되, **아직 티켓이 될 만큼 선명하지 않다.**

- **스케일 변수가 사는 컬렉션.** Figma 컬렉션이 `palette`·`semantic` 둘뿐이라 `type/size/base`가 "palette" 밑에 놓인다. 코드엔 무해하지만 Figma 변수 피커에서 컬렉션 이름은 최상위 그룹이라 디자이너 눈에 어색하다. **컴포넌트가 변수를 실제로 집어 쓰기 시작해야** 값이 매겨진다
- **`hiddenFromPublishing`의 부작용.** palette 변수 전체에 걸어뒀으나(primitive를 노출하지 않는 결정의 Figma 쪽 대응물) 라이브러리 발행을 해본 적이 없다. 발행할 때 드러난다
- **변수 500개 이상 / 50,000자에 육박하는 스크립트의 한계점.** 실측 최대가 61변수·약 4KB였다. 컴포넌트는 노드를 만들므로 여기 먼저 닿을 가능성이 높다
