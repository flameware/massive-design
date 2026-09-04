# 2026-09 점검 기록 — 목적 대비 상태와 이슈를 여는 기준

점검일 2026-09-04 · 기준: **코드 중심 개인 디자인 시스템**(shadcn 기반 `@massive/ui` + `@massive/tokens` + Storybook). Figma는 있으면 좋은 파생 채널로 평가했다.

## 결론

초기 메모(`initial-prompt-scribble.md`)의 사용자 목표는 8월 말에 전부 달성됐다 — 토큰 다섯 종, Pretendard, 키 컬러에서 OKLCH 램프 자동 생성, 키 컬러만 바꾸면 전체가 따라오는 구조, Storybook 공개 배포, 컴포넌트 51개(목표 8개). 9월부터 열린 이슈 95건 중 신규 컴포넌트는 0건이고 54건은 자체 검증 기계(계약·매니페스트·게이트)의 빈틈을 다시 세는 일이었다. 같은 51개 컴포넌트를 네 맵(#139 → #165 → #194 → #221)이 재측정해 실제 시각 결함 1건(`SelectSeparator`)을 찾았다. 그 기계가 먹이는 채널인 Figma는 8세대 뒤처져 있고 동기화는 선택 사항(ADR-0002)이다.

| 층 | 손으로 쓴 줄 수 |
| --- | --- |
| DS 본체 (컴포넌트 코드·토큰 원본·램프 생성기·Storybook UI) | 약 5,400 |
| 검증·동기화 툴링 | 약 10,000 |
| 거버넌스 문서 | 약 13,700 |

값을 하는 것: 토큰 생성기와 lint·contrast·verify 게이트, ui check의 R1·R2, 계약 객체에서 스토리 51개가 자동 생성되는 것, 0.3초에 도는 단위 테스트 234개, AGENTS.md의 80줄 상한.

## 이 점검이 실행한 것

- `bun install` 뒤 `bun run check` 통과(로컬 실패는 `@babel/parser` 미링크 환경 문제였다).
- [#250](https://github.com/flameware/massive-design/issues/250) Sidebar 아이콘 모드 수정, [#268](https://github.com/flameware/massive-design/issues/268) `sideEffects`·`react-is` 선언.
- [#111](https://github.com/flameware/massive-design/issues/111) 완료 기록([`pointer-target-map.md`](pointer-target-map.md))과 규칙 이관.
- [#266](https://github.com/flameware/massive-design/issues/266)·[#267](https://github.com/flameware/massive-design/issues/267) 닫음 — 다섯 번째 재측정과 여섯 번째 공백 맵은 열지 않는다.
- 스테일 문서 정리(AGENTS.md 라이브 문단, 핸드오프의 빈 콜론 문장, 외부 스킬 템플릿 잔재, 프롬프트 문서의 역사 표시).

## 앞으로 이슈를 열 때

이슈는 다음 셋 중 하나를 바꿔야 열린다.

1. **소비처가 쓰는 컴포넌트·토큰의 모양이나 API.**
2. **소비 앱에서 실제로 부딪힌 결함.**
3. **배포·패키징.**

게이트·스키마·용어를 바꾸는 이슈는 위 셋 중 하나가 그것 때문에 막혔을 때만 연다. "재측정"·"공백 닫기"·"전수 대조"라는 제목은 한 번 더 생각한다 — 같은 모집단을 네 번 셌다. 에이전트 실수의 재발 방지는 규칙 한 문단보다 테스트 한 줄이 낫다. 개인 DS의 다음 검증은 게이트가 아니라 **사용**이다 — 소비 앱 쪽 이슈를 먼저 배치한다.

## Figma 방침 — 결정됨

소유자가 **Figma는 요청 시 스냅숏**으로 정했다([ADR-0002 개정](../adr/0002-separate-repo-verification-from-figma-sync.md)). 그에 따라 같은 점검에서 실행한 것:

- [#138](https://github.com/flameware/massive-design/issues/138) 닫음. `verification/figma-baseline.json`은 마지막 스냅숏 기록으로만 남는다.
- 검증 원장 제거 — `sync:preflight`·`sync:review-storybook`·`repo-verification.json`·Storybook System 페이지·Figma Sync 이슈 템플릿의 상태 기계. `sync:checklist`는 `behaviors`의 사람 확인 항목을 찍는 도구로 남되 매니페스트 인덱스를 읽는다.
- `bun run check` 규칙 6(parts 모집단)을 경고로 내림.
- 규칙 원장을 DS 결정 중심으로 줄이고, 게이트 내부 규약은 `packages/ui/scripts/manifest/README.md`로 옮김. ADR 0009~0015는 매니페스트 스키마 결정이라 `packages/ui/scripts/manifest/decisions/`로 옮기고 `docs/adr/`에는 포인터만 남김.
- `CONTEXT.md`의 "세대와 검증" 절을 네 항목으로 줄임.

`.design-sync/`는 이 원장이 아니라 Claude Design Sync 도구의 설정이라 그대로 둔다.
