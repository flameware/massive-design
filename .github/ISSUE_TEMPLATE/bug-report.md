---
name: 버그
about: 코드·Storybook·소비처 중 한 채널이 의도대로 동작하지 않는다
title: ""
labels: "bug, needs-triage"
assignees: ""
---

어휘는 [`CONTEXT.md`](../../CONTEXT.md)를 따른다. 정본에 있는 용어를 다른 말로 부르지 말 것.

## 어느 채널인가

- [ ] 코드 (`packages/tokens`, `packages/ui`)
- [ ] Storybook (`apps/storybook`)
- [ ] 소비처 (리포 밖)

대상 컴포넌트·토큰:

## 세대

- 관측한 commit 또는 배포:
- 알고 있다면 재현된 commit:

한 채널만 앞선 정상적인 중간 상태인지 먼저 의심한다. 채널 간 불일치가 곧 버그는 아니다.

## 재현

1.
2.
3.

- 기대한 동작:
- 실제 동작:
- 라이트/다크 모드 모두에서 나타나는가:

재현 절차가 없으면 triage에서 `needs-info`로 되돌아온다.

## 증거

스크린샷, 검사 출력, 실패한 명령(`bun run check`, `bun run test`)의 결과를 붙인다.

## 호환성

고치면 소비처의 기존 호출이 재해석되는가. 아는 만큼만 적는다.
