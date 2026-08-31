---
name: 기능 요청
about: 새 컴포넌트·토큰·variant를 제안하거나 기존 표면의 개선을 요청한다
title: ""
labels: "enhancement, needs-triage"
assignees: ""
---

어휘는 [`CONTEXT.md`](../../CONTEXT.md)를 따른다. 정본에 있는 용어를 다른 말로 부르지 말 것. 필요한 개념이 어휘에 없다면 그 사실을 적는다 — 어휘 공백 자체가 신호다.

## 무엇을

제안하는 표면을 한 문단으로. 새 컴포넌트인지, 기존 컴포넌트의 새 조합(`variant × size`)인지, 새 semantic 토큰인지, alias 공백인지 밝힌다.

## 왜

- 요청을 만든 실제 상황:
- 소비처 근거 (현재 소비처는 invest diary 하나, 리포 밖):

## 기존 표면 확인

- 이미 있는 컴포넌트·토큰으로 조립되지 않는 이유:
- 찾아본 곳:

## 파생 채널이 구분할 수 있는가

매니페스트와 Figma는 anatomy와 구성 상태를 담고 동작은 담지 않는다. 파생 채널이 구분하지 못하는 항목은 자체 컴포넌트를 갖지 않는다 ([#97](https://github.com/flameware/massive-design/issues/97)) — 동작만 다른 variant는 "코드·Storybook·Figma 한 세대" 완료 정의를 만족할 수 없다.

- 코드에서 무엇이 달라지는가:
- 매니페스트·Figma에서 무엇이 달라 보이는가:

합성 컴포넌트라면 원본을 복사하지 않고 소비한다 ([#91](https://github.com/flameware/massive-design/issues/91)). 소비할 기존 컴포넌트:

## 토큰 계층

토큰이 걸린다면 어느 계층인가. component 계층에는 규칙만 있고 토큰은 0개다.

- [ ] primitive
- [ ] semantic
- [ ] alias
- [ ] 토큰 변경 없음

## 호환성

- 예상 분류: `additive` / `in-place safe` / `breaking` / 모름
- 공개 기준선의 기존 인스턴스·property·override에 미치는 영향:

## 대안

받아들여지지 않으면 무엇으로 대신할 수 있는가.
