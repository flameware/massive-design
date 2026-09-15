# massive-design

[![check](https://github.com/flameware/massive-design/actions/workflows/check.yml/badge.svg)](https://github.com/flameware/massive-design/actions/workflows/check.yml)
[![deploy-storybook](https://github.com/flameware/massive-design/actions/workflows/deploy-storybook.yml/badge.svg)](https://github.com/flameware/massive-design/actions/workflows/deploy-storybook.yml)

한국어 앱을 위한 React 디자인 시스템이에요. 토큰부터 컴포넌트, Storybook까지 담았어요.

A Korean-first React design system — tokens, components, Storybook.

**[Storybook에서 바로 보기](https://flameware.github.io/massive-design/)**

## 무엇이 들어 있나요

| 패키지 | 무엇을 하나요 |
| --- | --- |
| [`@flameware/tokens`](packages/tokens/README.md) | 색과 크기 토큰이에요. 기준 색 하나로 12단계 색 배열(램프)을 만들어 CSS 한 장을 내요 |
| [`@flameware/ui`](packages/ui/README.md) | React 컴포넌트예요. 컴포넌트마다 서브패스 하나로 들어와요 |
| [`apps/storybook`](apps/storybook/README.md) | 컴포넌트 문서이자 작업대예요. 접근성과 포인터 크기와 키보드 동작을 여기서 측정해요 |

## 특징

- **Base UI + Tailwind v4 + cva.** 동작은 Base UI가 담당하고, 모양은 Tailwind v4와 cva로 얹었어요. 여러 조각으로 이뤄진 컴포넌트는 `Menu.Item`처럼 이름 하나 아래로 묶여요.
- **기준 색 하나로 입히는 브랜드 색.** OKLCH로 램프를 만들어서, 앱이 브랜드 색 하나만 넘기면 강조색이 모두 그 색으로 바뀌어요.
- **라이트와 다크, 그리고 자동 대비 검사.** 두 모드의 램프를 함께 만들고, 대비가 기준에 못 미치면 빌드에서 에러가 나요.
- **모든 스토리를 자동으로 측정해요.** axe 접근성 위반 0, 포인터 히트 영역 24×24 하한, 스토리가 선언한 키보드 동작을 Chromium에서 그대로 눌러 봐요.
- **한국어 우선.** 본문 글꼴은 Pretendard이고, 문서와 에러 메시지를 한국어로 써요.

## 컴포넌트

`@flameware/ui`가 내보내는 컴포넌트예요. 분류는 Storybook 사이드바와 같아요.

| 분류 | 컴포넌트 |
| --- | --- |
| 기본 | Icon |
| 동작 | Button, Toggle, ToggleGroup |
| 폼 | Field, Form, Input, Textarea, Checkbox, Radio, RadioGroup, Select, Combobox, NumberField, Switch, Slider |
| 내비게이션 | Tabs, Pagination |
| 오버레이 | Dialog, AlertDialog, Drawer, Menu, Tooltip |
| 피드백 | Alert, Toast, Progress, Spinner, Skeleton |
| 데이터 표시 | Table, Badge, Avatar, ListRow |
| 레이아웃 | Card, Separator |
| 타이포그래피 | Text, Heading |
| 패턴 | PageShell, ThemeToggle, EmptyState, ConfirmDialog |

컴포넌트가 아닌 것으로는 클래스 이름을 합치는 `cn` 함수가 패키지 루트에 있어요.
각 컴포넌트의 옵션과 예시는 [`@flameware/ui` README](packages/ui/README.md)와
[Storybook](https://flameware.github.io/massive-design/)에 있어요.

## 써 보기

두 패키지는 GitHub Packages에 있어서 `read:packages` 권한을 가진 개인 액세스 토큰이
필요해요. 설치와 CSS 순서, 다크 모드, 브랜드 색까지의 순서는
[온보딩 가이드](docs/consumer-onboarding.md)에 있어요.

## 로컬에서 실행하기

```sh
bun install
bun run --filter @flameware/storybook storybook   # 개발 서버 (6006)
bun run check                                     # 토큰 검사, 타입, 빌드
bun run test                                      # 단위 테스트 + 스토리 테스트
```

`test`는 Storybook을 빌드하고 Chromium으로 모든 스토리를 여니까 몇 분 걸려요.
Chromium은 `bun run --filter @flameware/storybook playwright:install`로 한 번 받아요.

이슈는 환영해요. PR은 먼저 이슈에서 이야기를 나눈 뒤에 올려 주세요.

## 어떻게 만들었나요

이 레포는 에이전트가 대부분의 코드를 쓰고, 사람이 방향과 결정을 맡는 방식으로
자라 왔어요. 에이전트가 따르는 규칙은 [`AGENTS.md`](AGENTS.md)와
[`docs/agents/`](docs/agents/)에 있고, 되돌리기 어려운 결정은
[ADR](docs/adr/)로 남겨요. 1세대는 shadcn/ui를 베껴 와 51개 컴포넌트와 그것을
서술하는 메타데이터 층을 쌓았고, 지금은 태그
[`v1-shadcn`](https://github.com/flameware/massive-design/tree/v1-shadcn)에만
있어요. 2세대는 그 메타데이터 층을 걷어내고 Base UI 위에서 다시 시작했는데,
그 결정의 전부는 [ADR-0023](docs/adr/0023-second-generation-base-ui.md)에 적혀
있어요.

## 라이선스

개인 프로젝트라서 라이선스가 없어요. 코드를 쓰려면 먼저 이슈로 물어봐 주세요.
