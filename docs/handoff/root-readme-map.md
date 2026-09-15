# 루트 README 맵 완료 기록

맵 [#445](https://github.com/flameware/massive-design/issues/445) · 글쓰기 규칙은 [`../agents/writing-ko.md`](../agents/writing-ko.md) · 규칙 원장은 [`../agents/rules.md`](../agents/rules.md) · 선행 [`korean-writing-map.md`](korean-writing-map.md)

## Destination (#445 요약)

공개 레포인데 루트 README가 없다. 레포를 처음 찾은 방문자에게 이 DS가 무엇이고 어디서 보는지 알려주는 README를 둔 상태. 아래 Decisions는 grilling 세션에서 확정했다.

## Decisions (#445에서 그대로 옮김)

- **독자**: 1순위는 구경꾼·포트폴리오 독자("무엇을, 어떻게 만들었나"), 2순위는 앱 개발자. GitHub Packages 인증 장벽과 라이선스 부재 때문에 "쓰세요"보다 "보세요"에 맞춘다.
- **글쓰기 규칙**: 한국어 글쓰기 규칙(해요체)을 따르고, 규칙의 대상 목록에 루트 README를 더한다. 버전 숫자와 이슈 번호는 본문에 쓰지 않는다.
- **역할은 허브**: 설치·CSS 설정·API는 옮겨 적지 않고 패키지 README·온보딩 가이드·Storybook으로 링크한다.
- **절 순서**: 제목 → 배지(CI, Storybook 배포) → 한 줄 요약 → 영어 한 줄 → Storybook 링크 → 무엇이 들어 있나요 → 특징 → 컴포넌트 → 써 보기 → 로컬에서 실행하기 → 어떻게 만들었나요 → 라이선스.
- **한 줄 요약**: "한국어 앱을 위한 React 디자인 시스템이에요. 토큰부터 컴포넌트, Storybook까지 담았어요." 영어: "A Korean-first React design system — tokens, components, Storybook."
- **이미지**: 스크린샷·GIF는 두지 않는다(낡기 쉽다). Storybook 링크가 그 역할을 맡는다.
- **특징 불릿**: Base UI + Tailwind v4 + cva와 네임스페이스형 API / OKLCH 램프 생성과 브랜드 키 컬러 하나로 입히는 오버라이드 / 라이트·다크와 대비 자동 게이트 / 모든 스토리의 axe·24px 포인터 하한·키보드 자동 측정 / 한국어 우선(Pretendard, 한국어 문서·에러 메시지).
- **컴포넌트 목록**: 분류별 이름만 나열한다(상태 열 없음). 컴포넌트를 더할 때 목록을 갱신하는 단계를 Storybook의 컴포넌트 추가 체크리스트에 둔다.
- **써 보기**: 한두 문장. GitHub Packages에 있어 `read:packages` 토큰이 필요하다는 것과 온보딩 가이드 링크만.
- **로컬에서 실행하기**: 설치, Storybook 실행, `check`/`test`. 이슈는 환영, PR은 사전 협의.
- **어떻게 만들었나요**: 3~5문장. 에이전트 중심 개발, ADR, 1세대(`v1-shadcn`)→2세대(Base UI) 이력을 링크로.
- **라이선스**: 개인 프로젝트이고 라이선스가 없다고 명시한다. 라이선스 도입은 이 작업 범위가 아니다.
- **주변 정리**: 루트의 초기 요청 메모를 handoff 아래로 옮긴다. README 머지 후 레포 설명·토픽·Homepage를 README와 맞춘다.

## 티켓별 결과

| 티켓 | PR | 머지 | 무엇을 했나 | 남긴 것 |
| --- | --- | --- | --- | --- |
| [#446](https://github.com/flameware/massive-design/issues/446) 루트 README와 그것을 유지시킬 두 자리 | [#451](https://github.com/flameware/massive-design/pull/451) | `1019cdc` | 루트 [`README.md`](../../README.md)를 #445의 절 순서대로 썼다. Storybook 링크는 https://flameware.github.io/massive-design/ 이고, 컴포넌트 표는 열 분류에 `@flameware/ui` 서브패스 39개를 담는다. 라이선스 절은 개인 프로젝트이고 라이선스가 없다고 밝힌다 | 컴포넌트 표를 `@flameware/ui` 서브패스와 **기계로 대조**해 missing 0 · extra 0을 확인했다. 같은 PR에서 [`../agents/writing-ko.md`](../agents/writing-ko.md) §대상과 루트 `AGENTS.md`의 같은 목록에 루트 README를 더하고, [`apps/storybook/README.md`](../../apps/storybook/README.md)의 "컴포넌트를 하나 더할 때" 체크리스트에 컴포넌트 표를 갱신하는 4번 단계를 더했다 |
| [#447](https://github.com/flameware/massive-design/issues/447) 초기 요청 메모 이동 | [#450](https://github.com/flameware/massive-design/pull/450) | `642cb8a` | 루트의 `initial-prompt-scribble.md`를 `git mv`로 [`initial-prompt-scribble.md`](initial-prompt-scribble.md)(이 디렉터리)로 옮겼다. 내용은 기록이라 한 글자도 고치지 않았고 이력은 그대로 따라왔다 | 이 파일을 가리키던 곳은 [`repo-review-2026-09.md`](repo-review-2026-09.md) 한 자리뿐이라 같은 디렉터리 안의 상대 링크로 고쳤다 |
| [#448](https://github.com/flameware/massive-design/issues/448) 레포 설명·토픽·Homepage | (코드 변경 없음, `gh repo edit`) | — | 설명 "한국어 앱을 위한 React 디자인 시스템 — 토큰·컴포넌트·Storybook", Homepage는 README와 같은 Storybook 주소, 토픽 7개(`design-system`·`react`·`base-ui`·`tailwindcss`·`storybook`·`design-tokens`·`oklch`) | 외부에 곧바로 보이는 변경이라 실행 전에 메인테이너가 문구를 확인했다. 레포 카드의 소개와 README 첫 화면이 이제 같은 말을 한다 |

## 규칙과 어긋난 것

- **영어 한 줄 요약의 대시는 예외로 남았다.** 글쓰기 규칙의 금지 패턴 넷 중 하나가 본문 대시(" — ")인데, #445가 영어 한 줄을 "A Korean-first React design system — tokens, components, Storybook."으로 문구까지 확정해 두었다. 규칙을 어기는 대신 [`../agents/writing-ko.md`](../agents/writing-ko.md) §대상의 루트 README 줄에 이 예외를 적었다 — 금지 표현 `grep`이 잡는 1건은 이 줄이다.
- **Text와 Heading은 서브패스 하나를 같이 쓴다.** 컴포넌트 표는 이름을 세지만 서브패스는 39개라 수가 어긋나 보인다. 표 아래 한 문장으로 밝혔다.
- **`AGENTS.md`의 대상 목록도 #446이 함께 고쳤다.** 글쓰기 규칙 대상은 두 곳(`writing-ko.md`와 `AGENTS.md` 머리말)에 적혀 있어 한쪽만 고치면 어긋난다.

## What outlives the map

- **루트 README는 허브다** — 설치·CSS 설정·API를 옮겨 적지 않고 패키지 README·[온보딩 가이드](../consumer-onboarding.md)·Storybook으로 링크한다. 본문에 버전 숫자·이슈 번호를 쓰지 않고, 낡는 스크린샷·GIF도 두지 않는다(Storybook 링크가 그 역할이다).
- **컴포넌트 표는 손으로 유지되므로 갱신 단계가 작업 폴더 가까이에 있다** — `apps/storybook/README.md`의 "컴포넌트를 하나 더할 때" 4번. 규칙이 작업 폴더 가까이에서 링크되지 않으면 읽히지 않는다는 [#425](https://github.com/flameware/massive-design/issues/425)의 관찰과 같은 장치다.
- **레포 설명·토픽·Homepage는 README와 같은 말을 한다** — README 첫 화면을 고치면 레포 카드도 함께 본다.

규칙 문장은 [`../agents/rules.md`](../agents/rules.md) 방법론에 있다. 문체·금지 패턴은 `writing-ko.md`가 이미 지고 있어 여기 옮겨 적지 않는다.

## 넘기는 것

- **라이선스는 없는 채로 남았다.** README가 그 사실을 밝힐 뿐, 라이선스 도입은 #445의 범위가 아니었다. 레포가 공개이므로 언젠가 판단이 필요하지만 지금 아무것도 막고 있지 않아 이슈를 열지 않는다.
- **컴포넌트 표의 정확성을 재는 게이트는 없다.** 이번에는 `@flameware/ui` 서브패스와 기계로 대조했지만 CI에 붙이지는 않았다. 표가 실제로 낡는 것이 관측되면 그때 연다 — 지금은 Storybook 체크리스트가 그 자리를 진다.
