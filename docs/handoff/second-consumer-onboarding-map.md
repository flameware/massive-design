# 숲마루 온보딩 맵 완료 기록

맵 [#396](https://github.com/flameware/massive-design/issues/396) · 결정은 [ADR-0026](../adr/0026-baseline-form-controls-need-no-consumer-evidence.md) · 규칙은 [`../agents/rules.md`](../agents/rules.md) · 선행 [`phase-3-base-ui-map.md`](phase-3-base-ui-map.md)

## Destination (#396에서 그대로 옮김)

두 번째 소비처 **숲마루**(`flameware/apt-finder`)가 `@flameware/ui`·`@flameware/tokens`로 돌고, 그 온보딩이 드러낸 DS 쪽 결손이 닫혀 새 minor로 게시된 상태. 숲마루 쪽 이행은 그 리포의 맵이 따로 추적한다([flameware/apt-finder#32](https://github.com/flameware/apt-finder/issues/32)).

## Notes (#396에서 그대로 옮김)

- 출처: 2026-09-13 그릴링 세션(두 번째 소비처 온보딩). 결정은 ADR-0026과 아래 Decisions so far에 있다
- **숲마루 실측(2026-09-13, `main`)**: Next.js 16.2.1 · React 19.2.4 · Tailwind v4 · shadcn `base-nova`(Base UI 기반) · bun. `src/components/ui/`에 shadcn 11개가 있지만 import는 `button` 8곳 · `input` 1곳뿐이고 나머지 UI는 도메인 컴포넌트 24개 안의 손조립이다. Pretendard는 이미 쓴다
- 도메인 조립(지도 마커 · 스카이라인 차트 · 매물 카드)은 **소비처 몫**이다(`CONTEXT.md` 소비처). 이 맵에 올리지 않는다
- 이것은 "Phase 4"가 아니다 — ADR-0023 후보 목록을 여는 맵이 아니라, 소비처가 드러낸 결손과 ADR-0026이 연 기본 폼 컨트롤만 담는다
- 결정의 근거가 된 사실 중 invest diary와 다른 것: 다크 모드가 OS 설정 기본(숲마루가 클래스로 옮긴다 — DS는 바꾸지 않는다), 브랜드가 forest 녹색(DS brand 키는 `#0f5fed`)

## Decisions-so-far (#396에서 그대로 옮김, 순서대로)

- **결손은 목록 대조가 아니라 소비처 화면이 정한다.** 예외는 하나 — 네이티브 입력에 대응하는 폼 컨트롤(Switch · Slider · Radio)은 근거 없이 만든다(ADR-0026)
- **brand 키 컬러는 소비처가 정할 수 있다.** 모드별이 아니라 키 하나(step 9 앵커), 대비 게이트를 못 넘으면 에러. 키를 주지 않으면 지금 brand 그대로 — invest diary 무영향, minor
- **다크 모드 규약(`.dark` 클래스)은 바꾸지 않는다.** OS 설정 추종은 소비처의 인라인 스크립트 몫이고 온보딩 가이드에 적는다
- **별도 문서 사이트·Figma는 재검토 후 보류**, 대신 소비처 온보딩 가이드를 쓴다
- **#398 닫힘(#407)**: `@flameware/tokens/ramp`의 `createBrandOverride(key)` — contrast.mjs의 쌍 표를 공유해 brand를 참조하는 모든 쌍을 게이트하고 실패 시 에러. forest 키는 통과(step 9 `#267b4c`, on-solid 5.22:1)
- **#399 닫힘(#408)**: `Switch`(Base UI `Switch.Root`/`Thumb`, Checkbox 모양) — 꺼짐 트랙은 컨트롤 어포던스로 `bg.neutral.solid`, 켜짐은 `bg.accent.solid`, 손잡이는 `fg.on-solid`. 트랙 20px라 `hit-area`. `status: preview`, `since: 0.6.0` 선기입
- **#400 닫힘(#409)**: `Slider`(Root/Control/Track/Indicator/Thumb/Value, 단일·범위) — 잔여 트랙 `bg.neutral.soft`, 채움 `bg.accent.solid`, thumb(컨트롤 어포던스) `bg.neutral.solid`. Thumb은 Track의 `overflow-hidden`에 hit-area가 잘려 Control 직속으로 뺐다. 포인터 계기에 `native-range-thumb` 위임(숨은 range input 대신 부모 thumb을 잰다) + 자기 검증 추가
- **#401 닫힘(#411)**: `Radio`·`RadioGroup`을 두 서브패스로(Base UI 구조, Toggle/ToggleGroup 선례) — 미선택 테두리 `border-field`, 선택 `bg.accent.solid`, 점 `on-solid`. 화살표 이동이 곧 선택. 경계: 보이는 2–5개 → RadioGroup, 즉시 반영 필터 → ToggleGroup, 접히거나 6개+ → Select
- **#402 닫힘**: Next 16.2.12 · React 19.2.4 · bun 스크래치 앱에서 main 빌드로 실측 — tarball 설치는 Turbopack에서 서브패스 전부 해석, #377 함정은 15와 같음, `@source`는 심볼릭 링크 아래서도 빠짐없음, Card·Alert에 `"use client"` 없음(README가 맞음). 단 `bun link` 심볼릭 링크 배치는 Turbopack이 서브패스를 못 풀고 webpack은 된다 → 가이드(#403)에. Icon의 컴포넌트 prop RSC 경계 문서 결손은 #412로 분리
- **#412 닫힘(#413)**: Icon의 `"use client"`는 훅·이벤트 없이 근거 없이 박혀 있었다 — 걷어내 서버 컴포넌트로(`SERVER_SUBPATHS`로 이동). Server Component에서 `<Icon icon={X} />`가 Next 16 Turbopack 빌드를 통과함을 실측. 서버/클라이언트 분류의 정본은 `package.test.mjs`
- **#403 닫힘(#414)**: [`docs/consumer-onboarding.md`](../consumer-onboarding.md) 한 장 — 레지스트리·CSS 순서·폰트·다크 모드(숲마루 apt-finder#41 실제 스크립트)·brand 키·RSC(#377·#412)·Next 16/`bun link` 함정·ADR-0025 대조표·`@theme inline` 이름 충돌(`--font-sans`·`--radius-*`). 두 README가 가리킨다
- **#404 닫힘(#415)**: 두 번째 소비처 트리거 → 재검토 후 보류를 ADR-0023 §8·§9 포인터로 기록. 다음 계기 — 문서 사이트: 소유자가 아닌 사람이 세 번째 소비처를 온보딩하는 날 / Figma: 디자이너나 비코드 소비자가 실제로 DS 산출물을 필요로 하는 날. phase-2·3 기록의 §9→§8 오인용도 바로잡음
- **#405 닫힘(#416, `v0.6.0` 게시)**: 두 패키지 `0.6.0`, ui의 tokens 범위 `^0.6.0`. `v0.5.2..main`은 가산뿐(minor), `dist/tokens.css` diff 없음 → brand 키 미지정 소비처 화면 불변. `publish.yml` 성공으로 두 패키지 `0.6.0` 게시

## Fog — 답 (#396에서 그대로 옮김 + 답)

- forest 키(`oklch(0.52 0.11 155)`)가 `fg.on-solid`(흰색)와 대비 게이트를 넘는지 — 못 넘으면 숲마루가 키를 조정한다

**답: 넘는다.** [#398](https://github.com/flameware/massive-design/issues/398) 코멘트와 PR [#407](https://github.com/flameware/massive-design/pull/407)이 측정했다 — forest step 9(라이트·다크 공통) `#267b4c`, `fg.on-solid ↔ bg.accent.solid` 5.22:1(양 모드, 게이트 4.5:1), `border.accent`/`border.focus` 계열 3.19~5.14(게이트 3:1), `bg.accent.muted` 계열 1.68~2.00(게이트 1.35:1) — 여덟 쌍 전부 게이트를 넘어 숲마루는 키를 조정할 필요가 없었다.

## 티켓별 결과

| 티켓 | PR | 무엇을 했나 | 남긴 것 |
| --- | --- | --- | --- |
| [#397](https://github.com/flameware/massive-design/issues/397) 기본 폼 컨트롤 예외 ADR | (문서만, PR 없음) | [ADR-0026](../adr/0026-baseline-form-controls-need-no-consumer-evidence.md) — 네이티브 HTML 입력에 대응하는 폼 컨트롤(Switch·Slider·Radio)은 소비처 근거 없이 만든다는 예외. §10 "소비처가 잣대다"는 폐기하지 않는다, 예외는 이 기준 하나 | 다음 "이것도 기본 아닌가"가 오면 같은 한 문장("네이티브 HTML 입력에 대응하는가")으로 판정한다 |
| [#398](https://github.com/flameware/massive-design/issues/398) brand 키 API | [#407](https://github.com/flameware/massive-design/pull/407) | `@flameware/tokens/ramp`에 `createBrandOverride(key)` — `scripts/contrast.mjs`의 쌍 표를 그대로 재사용(복사 아님), 실패 시 에러, `:root`/`.dark` CSS 문자열 반환 | **구조적 약점**: `scripts/build.mjs` → `scripts/lib/brand-gate.mjs` → `scripts/contrast.mjs` → `scripts/build.mjs` 순환 import. 세 파일 다 순환 대상을 함수 본문에서만 참조해 지금은 동작하지만, 다음에 이 셋 중 하나를 모듈 최상단에서 즉시 실행하는 코드로 바꾸면 조용히 깨진다 |
| [#399](https://github.com/flameware/massive-design/issues/399) Switch | [#408](https://github.com/flameware/massive-design/pull/408) | Base UI `Switch.Root`/`Thumb` 위에 색·치수. 꺼짐 트랙(컨트롤 어포던스)·켜짐 트랙·손잡이가 각각 다른 토큰. `status: preview` | 착지 자리 없이 만들어졌다 — ADR-0026 예외라 `preview`에 계속 머무는 것 자체가 위반이 아니다 |
| [#400](https://github.com/flameware/massive-design/issues/400) Slider | [#409](https://github.com/flameware/massive-design/pull/409) | Base UI `Slider.Root`/`Control`/`Track`/`Indicator`/`Thumb`, 단일값·범위(다중 thumb) 둘 다 같은 조립. Thumb을 Track 밖 Control 직속으로 뺐다(Track의 `overflow-hidden`이 hit-area를 24px 아래로 자름) | 포인터 계기에 **일반 패턴** `native-range-thumb`를 추가했다 — 네이티브 `<input type="range">`가 `clip-path`로 히트 테스트에서 빠지고 부모 thumb div가 대신 포인터를 받는 컴포넌트라면 앞으로도 이 분기가 적용된다. 계기 자체 검증에 self-test 포함 |
| [#401](https://github.com/flameware/massive-design/issues/401) Radio·RadioGroup | [#411](https://github.com/flameware/massive-design/pull/411) | 두 서브패스(Toggle/ToggleGroup 선례). 미선택 `border-field`, 선택 `bg.accent.solid`, 점 `on-solid`, 화살표 이동이 곧 선택 | RadioGroup·ToggleGroup·Select 세 컴포넌트의 경계(보이는 2–5개 / 즉시 반영 필터 / 접히거나 6개+)를 MDX에 명문화 |
| [#402](https://github.com/flameware/massive-design/issues/402) Next 16 실측 | (research, PR 없음 — 숲마루 apt-finder#40) | tarball/호이스팅 설치는 Turbopack에서 서브패스 35개 전부 해석. `bun link` **심링크** 설치는 Turbopack이 서브패스 해석에 전부 실패(webpack은 성공) — Next 16 Turbopack 자체 결함, DS 결함 아님 | **`bun link`/Turbopack 캐베어트**: 로컬에서 아직 게시 안 된 DS 변경을 미리 붙여보려면 `bun link` 대신 `npm pack` tarball을 쓴다 — `bun link`는 Next 16 Turbopack에서 서브패스 export를 통째로 못 푼다. `docs/consumer-onboarding.md`에 반영 |
| [#403](https://github.com/flameware/massive-design/issues/403) 온보딩 가이드 | [#414](https://github.com/flameware/massive-design/pull/414) | `docs/consumer-onboarding.md` 한 장 — `.npmrc`/토큰, CSS 순서, 폰트, 다크 모드(숲마루 실제 스크립트), brand 키, RSC 주의, Next 16 결과, ADR-0025 대조표 | 두 README(`packages/ui`·`packages/tokens`)가 이 문서를 가리킨다. 다크 모드 스크립트의 두 함정(압축기가 지역 함수 이름을 바꿔 `toString()` 기반 다중 함수 합성이 깨짐, SPA 내비게이션이 `<head>` 스크립트를 다시 안 돌림)도 여기 적혔다 |
| [#404](https://github.com/flameware/massive-design/issues/404) 문서 사이트·Figma 재판단 | [#415](https://github.com/flameware/massive-design/pull/415) | ADR-0023 §8·§9에 포인터 단락(원문 불변) — 둘 다 재검토 후 보류 | 다음 재판단 계기: 문서 사이트는 **소유자가 아닌 사람이 세 번째 소비처를 온보딩하는 날**, Figma는 **디자이너나 비코드 소비자가 실제로 DS 산출물을 필요로 하는 날**. phase-2·3 완료 기록이 이 트리거를 §9로 잘못 가리키던 것도 §8로 정정 |
| [#412](https://github.com/flameware/massive-design/issues/412) Icon RSC 경계 결함 | [#413](https://github.com/flameware/massive-design/pull/413) | 문서로 우회하지 않고 원인에서 고쳤다 — Icon은 훅·이벤트 없는 자체 스타일 primitive라 `"use client"`가 근거 없이 박혀 있었다. 지시어를 걷어내 서버 컴포넌트로(`SERVER_SUBPATHS`로 이동) | `package.test.mjs`의 `CLIENT_SUBPATHS`/`SERVER_SUBPATHS`가 서버/클라이언트 분류의 정본이라는 것, 그리고 앞으로 `"use client"`를 붙일 때는 근거를 주석에 남긴다는 관행이 확정됐다 |
| [#405](https://github.com/flameware/massive-design/issues/405) 게시 | [#416](https://github.com/flameware/massive-design/pull/416) | `@flameware/tokens`·`@flameware/ui` `0.6.0`, ui의 tokens 범위를 같은 커밋에서 `^0.6.0`으로. `v*` 태그 → `publish.yml` 성공(run [34787069584](https://github.com/flameware/massive-design/actions/runs/34787069584)) | `v0.5.2..v0.6.0`은 가산뿐, `dist/tokens.css` diff 없음 — invest diary는 brand 키를 안 주므로 올려도 화면 불변 |

## 게시 이력

| 버전 | 종류 | 무엇 | 상태 |
| --- | --- | --- | --- |
| `0.6.0` | minor | brand 키 API(#398), Switch(#399)·Slider(#400)·Radio/RadioGroup(#401), Icon을 서버 컴포넌트로(#412) | 성공(run [34787069584](https://github.com/flameware/massive-design/actions/runs/34787069584)) |

## What outlives the map

- **네이티브 HTML 입력에 대응하는 폼 컨트롤은 소비처 근거 없이 만든다** — ADR-0026, "소비처가 잣대다"(§10)의 유일한 예외.
- **brand 키 오버라이드는 게이트 표를 공유하고, 실패는 에러다** — `createBrandOverride`가 `contrast.mjs`의 쌍 표를 그대로 재사용한다.
- **`native-range-thumb`처럼, 포인터 계기의 새 패턴은 일반화하고 self-test를 남긴다** — 특정 컴포넌트 하드코딩이 아니라 재사용 가능한 인식 규칙으로 추가한다.
- **서버/클라이언트 분류의 정본은 `package.test.mjs`의 `CLIENT_SUBPATHS`/`SERVER_SUBPATHS`다** — `"use client"`를 붙이는 이유는 주석에 남긴다.
- **소비처 대면 설정 지식은 `docs/consumer-onboarding.md`에 모은다** — README는 그 문서를 가리키기만 한다.

## 넘기는 것

`scripts/build.mjs` → `brand-gate.mjs` → `contrast.mjs` → `build.mjs` 순환 import는 지금은 안전하지만(순환 대상을 전부 함수 본문에서만 참조) 구조적으로 약하다 — 새 이슈는 열지 않는다(지금 아무것도 막고 있지 않다, `rules.md` 방법론 "이슈는 셋 중 하나가 막혔을 때만 연다"). 다음에 이 세 파일 중 하나를 고칠 사람이 이 기록을 먼저 읽도록 여기 남긴다.
