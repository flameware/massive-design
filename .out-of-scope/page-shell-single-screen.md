# 탭 없는 한 화면 앱을 위한 PageShell — 선택 `nav`와 헤더 면 축

`PageShell`은 **탭 내비가 있는 대시보드 셸**로 남는다. `nav`를 선택 prop으로
바꾸지 않고, 헤더(와 셸 루트)의 면을 고르는 축(`headerSurface`·`headerClassName`
류)도 두지 않는다. 탭이 없거나 페이지를 `bg-canvas`로 칠하는 앱은 헤더와 본문
폭을 **직접 조립한다** — 컴포넌트 문서의 "언제 쓰지 않는가"가 이미 그렇게 안내한다.

## 왜 범위 밖인가

판정 잣대는 [ADR-0023](../docs/adr/0023-second-generation-base-ui.md) §10 —
**소비처가 필요의 잣대다.** 판정 시점(0.9.0)에 실측하면 수요는 0이다.

- **PageShell을 import하는 소비처가 0곳이다.** invest diary는 git 이력 전체에
  `PageShell`이 한 번도 없고(`git log -S PageShell`), 숲마루(apt-finder)도 없다.
- **wherebus**가 처음 썼다가 걷어냈다(wherebus `6300ba1`, "PageShell 대신 헤더를
  앱에서 조립해 흰 띠를 없앰"). 우회(빈 `nav` + `[&_[role=tablist]]:hidden`)는
  그 레포에 남아 있지 않다 — 이 문서의 근거는 기록으로만 읽는다.

한 곳의 우회만으로 축을 열지 않는 것은 이 리포가 이미 여러 번 지킨 방식이다
([#351](https://github.com/flameware/massive-design/issues/351)·[#284](https://github.com/flameware/massive-design/issues/284)·
[`drawer-handle-axis.md`](drawer-handle-axis.md)·[`fullscreen-mobile-panel.md`](fullscreen-mobile-panel.md)).
여기는 그 한 곳마저 스스로 철회했다.

그리고 두 제안은 보이는 것보다 무겁다.

1. **`nav?`만 떼어 받으면 컴포넌트의 정체가 바뀐다.** 탭 없는 PageShell은
   "헤더 좌우 슬롯 + 본문 폭"인데, 그건 Stack/Grid를 열지 않은
   [#375](https://github.com/flameware/massive-design/issues/375) 판정(레이아웃
   조립은 소비처의 몫)과 같은 자리다. 게다가 이것만으로는 wherebus가 걷어낸 원인(흰
   띠)이 그대로 남아 요청한 소비처조차 돌아오지 않는다.
2. **면 축은 면 사다리 규칙을 건드린다.** `rules.md`([#387](https://github.com/flameware/massive-design/issues/387))는
   PageShell을 "흐름 안 → `bg-surface`"로 둔다. 그리고 `surface`인 것은 헤더만이
   아니라 **셸 루트 전체**다(`page-shell.tsx`의 `min-h-screen bg-surface`) — 이슈가
   제안한 `headerSurface`만으로는 canvas 앱의 문제가 풀리지 않고 루트 면까지 열어야
   한다. 그 축의 값 집합, `border-b`를 함께 끄는지, 다크에서의 대비를 데이터 0개로
   정해야 한다.

루트의 `min-h-screen`은 축이 필요 없다. `className`으로 `min-h-0`을 덮으면
풀리고(`cn`이 뒤의 클래스를 이기게 병합한다), 이슈도 그렇게 적었다.

## 다시 판단할 계기

- **두 소비처가** 탭 없는 화면에 PageShell을 쓰려고 우회(빈 `nav`, tablist 숨김)를
  넣으면 → `nav?` 판정을 연다. 그때 탭 없는 셸이 PageShell인지 별도 이름인지도
  함께 정한다.
- **두 소비처가** canvas 바탕 위에서 PageShell의 면을 덮으면 → 면 축 판정을 연다.
  헤더만이 아니라 루트 면까지 한 번에 본다.
- PageShell의 소비처가 계속 0이면 그 자체가 별도 질문이다(유지할지) — 이 문서의
  몫은 아니다.

## 지금까지의 요청

- [#493](https://github.com/flameware/massive-design/issues/493) — PageShell에서 nav를 선택으로 하고 헤더 면을 고를 수 있게 한다 — 근거였던 wherebus가 티켓 전에 이미 직접 조립으로 옮겼다
