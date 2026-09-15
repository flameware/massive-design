# 한국어 글쓰기 맵 완료 기록

맵 [#425](https://github.com/flameware/massive-design/issues/425) · 규칙 문서는 [`../agents/writing-ko.md`](../agents/writing-ko.md) · 규칙 원장은 [`../agents/rules.md`](../agents/rules.md) · 선행 [`second-consumer-onboarding-map.md`](second-consumer-onboarding-map.md)

## Destination (#425에서 그대로 옮김)

사용자(DS를 쓰는 앱의 개발자)가 읽는 한국어 글 — Storybook MDX 47개, 패키지 README 3개, 온보딩 가이드, 공개 API 에러 메시지 — 이 읽히는 글로 다시 쓰이고, 다음 문서를 쓰는 에이전트가 그 규칙을 읽게 된 상태.

## Notes (#425에서 그대로 옮김)

- 출처: Storybook 문서가 한국어로 쓰였는데도 이해되지 않는다는 메인테이너의 관찰. 실측(MDX 47개 + README 3개, 약 160KB): 문장 끝이 사실상 100% 해라체(`-다.` 600회), 본문 대시 431회(파일당 평균 9회), 자리 156 · 소비처 76 · "~가 진다" 29 · 축 24 · 계약 23 · 게이트 20 · 몫 13, "X가 아니라 Y다" 21회 이상, "왜 ~인가" 제목 5개
- 재발을 막을 장치가 없었다. 용어집이 이미 "계약"을 _Avoid_로 정했는데도 MDX에 23회 남아 있었다 — 규칙이 작업 폴더 가까이에서 링크되지 않으면 읽히지 않는다는 증거다
- 순서가 결정의 일부다: 기준 페이지를 먼저 메인테이너가 승인하고, 그 승인한 페이지의 전후 비교에서 규칙을 뽑는다. 규칙을 먼저 쓰면 추상적인 문장이 된다
- 문장 lint(textlint·Vale·금지어 스크립트)를 CI에 붙이는 일은 범위 밖이다. 규칙 문서와 PR의 `grep` 결과가 대신한다

## Decisions-so-far (#425에서 그대로 옮김 + 진행 중 확정된 것)

- **독자는 앱 개발자다.** 저장소의 이슈·ADR·내부 스크립트·사용 중인 앱 이름을 모른다고 가정하고, 첫 문장에서 "이 페이지가 무엇을 해결하는가"를 알 수 있어야 한다
- **페이지 뼈대는 한 줄 요약 → 사용법 → 주의할 점 → 배경**이다. 설계 이유는 3~4문장 이하의 배경 절이나 ADR 링크로 내린다
- **문체는 해요체**, 코드 식별자는 원어, 개념어는 사전 없이 이해할 수 있는 말로 푼다
- **금지 패턴 넷**: 본문 대시(" — "), "왜 ~인가" 제목, "X가 아니라 Y다" 대비 단정문(독자가 실제로 헷갈릴 때만 허용), "그래서 ~" 논증체. 굵은 글씨는 한 문단에 하나 이하
- **용어집의 "다른 말로 부르지 말 것"은 내부 문서와 코드에만 적용된다.** 앱 개발자가 읽는 글은 용어집 항목의 `_문서에서는_` 줄을 따른다. 이 예외를 `CONTEXT.md` 머리말에 적었다(#426)
- **ADR·이슈·`docs/handoff/`·`CONTEXT.md` 정의문·커밋 메시지는 대상이 아니다.** 독자가 메인테이너와 에이전트인 내부 글이다
- **에러 메시지는 원인 → 수치·입력값 → 해결 방법 순서의 해요체**이고, 함수 이름·토큰 조합·수치는 그대로 남는다. 공개 API 형태를 바꾸지 않으므로 patch로 게시한다
- **에러 테스트는 문구가 아니라 함수 이름·식별자·수치를 확인한다.** 테스트가 없던 에러 메시지에 새 테스트를 만들지 않는다

## 티켓별 결과

| 티켓 | PR | 머지 | 무엇을 했나 | 남긴 것 |
| --- | --- | --- | --- | --- |
| [#426](https://github.com/flameware/massive-design/issues/426) 기준 페이지와 규칙 | [#435](https://github.com/flameware/massive-design/pull/435) | `779ef11` | `Foundations/브랜드 색 입히기`를 다시 쓰고 메인테이너 승인 후 그 전후 비교로 [`../agents/writing-ko.md`](../agents/writing-ko.md)를 썼다. 루트 `AGENTS.md`·`apps/storybook/AGENTS.md`(새 파일)·`apps/storybook/CLAUDE.md` 포인터에서 링크. `CONTEXT.md`에 `_문서에서는_` 줄과 예외 머리말 | Storybook에 `remark-gfm`이 없어 GFM 표가 한 문단으로 렌더되던 것을 함께 고쳤다(이 페이지의 표 2개와 기존 `Text.mdx` 색 옵션 표가 깨져 있었다) |
| [#427](https://github.com/flameware/massive-design/issues/427) Foundations 8개 | [#436](https://github.com/flameware/massive-design/pull/436) | `e5c6dcf` | 색·간격·라운드·타이포·라이트다크·아이콘·램프 생성기·상태를 다시 썼다. "왜 줄 높이가 세 단계뿐인가" 같은 제목을 없애고 설계 이유를 배경 절로 | 토큰 점 표기(`border.default`)를 실제 유틸리티 이름(`border-default`)으로 통일. 아이콘 사용법에 `bun add lucide-react` 추가(optional peer라 앱이 직접 설치한다). 삭제된 1세대 Figma 폰트 채널 문장 제거 |
| [#428](https://github.com/flameware/massive-design/issues/428) Forms 12개 | [#437](https://github.com/flameware/massive-design/pull/437) | `9fc8d52` | Checkbox·Combobox·Field·Form·Input·NumberField·Radio·RadioGroup·Select·Slider·Switch·Textarea | **"언제 쓰는가 / 언제 쓰지 않는가"를 사용법 앞에 두는 배치**가 여기서 정해져 이후 PR 셋이 그대로 따랐다. `hit-area`·대비 토큰 같은 내부 구현 설명은 배경 절로 내리고 본문에는 독자가 할 일만 남긴다 |
| [#429](https://github.com/flameware/massive-design/issues/429) Actions·Navigation·Layout·Typography 8개 | [#438](https://github.com/flameware/massive-design/pull/438) | `864c239` | Button·Toggle·ToggleGroup·Pagination·Tabs·Card·Separator·Text | **표 셀의 `—`를 "없음"으로** 바꾸는 규약(금지 표현 `grep`이 표 셀도 센다). Text의 `tone` 표에서 내부 실측 수치 열을 빼고 "언제 쓰나" 열로 교체. 자기 리뷰가 사실 오류 넷을 잡았다(`Menu.Separator`가 DS `Separator`를 쓴다는 오기, `tone="muted"`가 Text 전용이라는 없던 제약 등) |
| [#430](https://github.com/flameware/massive-design/issues/430) Overlays·Feedback 10개 | [#439](https://github.com/flameware/massive-design/pull/439) | `a52e3f6` | AlertDialog·Dialog·Drawer·Menu·Tooltip·Alert·Progress·Skeleton·Spinner·Toast | **Toast의 "왜 있는가" 도입 서사를 삭제**해 그 서술은 이제 [#371](https://github.com/flameware/massive-design/issues/371)에만 남는다. "자리표시자" → "회색 틀"처럼 금지어가 든 복합어도 풀었다. 자기 리뷰가 사실 오류 여섯을 잡았다(`Dialog.Close`가 스타일이 없다는 오기, `Menu.Item` 위험 서술의 방향이 반대인 것 등) |
| [#431](https://github.com/flameware/massive-design/issues/431) Data display·Patterns 8개 | [#440](https://github.com/flameware/massive-design/pull/440) | `0588d1c` | Avatar·Badge·ListRow·Table·ConfirmDialog·EmptyState·PageShell·ThemeToggle | 문서 간 상대 경로 링크(`../text/Text.mdx`)를 Storybook 경로(`?path=/docs/...`)로 바꿨다. "제자리에" 같은 평범한 복합어도 `grep` 0건 조건 때문에 고쳤다 |
| [#432](https://github.com/flameware/massive-design/issues/432) README 3개와 온보딩 가이드 | [#441](https://github.com/flameware/massive-design/pull/441) | `c218f9b` | `@flameware/tokens`·`@flameware/ui`·`@flameware/storybook` README와 [`../consumer-onboarding.md`](../consumer-onboarding.md) | 긴 레퍼런스 README는 절마다 배경을 두지 않고 문서 맨 아래 `## 배경` 한 곳에 모으고 각 절에서 링크한다. 제목을 바꾼 앵커를 가리키던 MDX 링크와 `chart-series.test.mjs`의 표 대조 문자열을 함께 고쳤다. storybook README만 독자가 다르므로(컴포넌트를 더하는 사람) 내부 파일 경로를 본문에 남겼다 |
| [#433](https://github.com/flameware/massive-design/issues/433) 에러 메시지와 게시 | [#442](https://github.com/flameware/massive-design/pull/442) · [#443](https://github.com/flameware/massive-design/pull/443) | `8d3462a` · `97ea990` | `ramp.mjs`·`ramp-core.mjs`·`oklch.mjs`·`empty-state.tsx`의 에러 메시지를 해요체로, 테스트 정규식 6곳을 문구가 아니라 함수 이름·식별자·수치로. `0.6.2` patch 게시 | **에러 메시지에 백틱을 넣지 않는다**(터미널에 그대로 찍히는 문자열이라 평문). **실패 조합은 줄마다 쓴다**(`#eab308`은 19개가 나와 한 줄에 이으면 해결 안내가 묻힌다). **`lintRamp`의 검사 문구는 제외**(메인테이너가 보는 CLI 출력이고 이슈 대상 밖). `docs/tokens/build-pipeline.md` 표와 `dist/ramp.d.ts` JSDoc도 대상 밖 |

## 게시 이력

| 버전 | 종류 | 무엇 | 상태 |
| --- | --- | --- | --- |
| `0.6.2` | patch | 공개 API 에러 메시지를 해요체로, 원인·수치·해결 순서로(#433) | 성공(run [34884309684](https://github.com/flameware/massive-design/actions/runs/34884309684)) |

`v0.6.1..v0.6.2`의 패키지 diff는 `scripts/lib/{emit/ramp,ramp-core,oklch}.mjs`, 생성물 `dist/ramp.js`, `src/empty-state/empty-state.tsx`, 테스트 4개, 문서 3개다. 서브패스 39개·prop·함수 이름·인자·반환값이 그대로라 patch로 봤다 — 에러 문장을 정규식으로 잡아 쓰던 앱이 있다면 깨질 수 있지만, 에러 문장은 공개 API 형태가 아니다.

## What outlives the map

- **앱 개발자가 읽는 한국어 글은 [`../agents/writing-ko.md`](../agents/writing-ko.md)를 따른다** — 대상, 독자, 페이지 뼈대, 문체, 단어 표현표, 금지 패턴, 전후 비교, PR에서 돌릴 `grep` 명령이 그 한 장에 있다. 규칙은 루트 `AGENTS.md`와 `apps/storybook/AGENTS.md`에서 링크된다.
- **페이지 뼈대는 한 줄 요약 → (컴포넌트면 언제 쓰는가 / 언제 쓰지 않는가) → 사용법 → 주의할 점 → 배경**이다. 설계 논증은 맨 아래 배경 절이나 ADR 링크로 간다.
- **에러 메시지는 원인 → 수치 → 해결 순서의 해요체이고, 테스트는 문구가 아니라 함수 이름·토큰 조합·수치를 확인한다.**
- **용어집의 "다른 말로 부르지 말 것"은 내부 문서와 코드에만 적용된다** — 앱 개발자가 읽는 글은 `_문서에서는_` 표현을 쓴다.

## 넘기는 것

- **문장 품질의 최종 판정은 메인테이너가 배포된 Storybook에서 읽고 한다.** 기계로 셀 수 있는 것(금지어, 본문 대시)은 `grep` 0건으로 확인했지만, 대비 단정문·논증체·문장 길이는 사람이 읽어야 한다. 46개 페이지 중 기준 페이지 하나만 메인테이너가 직접 읽고 고쳤다.
- **두 소비처는 아직 `0.6.2`가 아니다.** 숲마루(`flameware/apt-finder`)는 `0.6.0`, invest diary는 `0.5.2`다. 새 에러 메시지는 앱이 버전을 올려야 보인다.
- **문장 lint는 붙이지 않았다.** 다음에 금지어가 다시 스며드는 것이 실제로 관측되면 그때 CI 게이트를 연다 — 지금은 `writing-ko.md`의 `grep` 명령과 PR 설명이 그 자리를 진다.
