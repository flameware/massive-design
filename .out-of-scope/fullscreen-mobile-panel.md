# 전체 화면 모바일 패널

이 디자인 시스템은 **화면 전체를 덮는 모바일 전용 전환 표면**을 컴포넌트로도
축으로도 두지 않는다. 오버레이 세트는 Dialog(중앙 모달)·Drawer(바닥 시트) 둘이고,
전체 화면 전환이 필요한 화면은 **소비처가 라우트로 푼다.**

## 왜 범위 밖인가

판정 잣대는 [ADR-0023](../docs/adr/0023-second-generation-base-ui.md) §10 —
**소비처가 필요의 잣대다.** 실측하면 착지 자리가 한 곳뿐이다.

- **invest diary**: 같은 모양(종목 상세·노트 상세)을 오버레이가 아니라 **라우트**로
  푼다. `stock-detail-view.tsx`·`note-detail-view.tsx` 어디에도 `Drawer` import가
  없다 — 쓰는 것은 `ConfirmDialog`뿐이다.
- **숲마루(apt-finder)**: 공개 화면의 모바일 단지 상세 한 곳. 여기가 라우트를 못 쓰는
  이유는 지도 화면이 단일 라우트라 상세가 페이지가 아니기 때문이고
  ([apt-finder#15](https://github.com/flameware/apt-finder/issues/15)), 그건
  그 앱의 사정이지 DS가 축을 여는 근거가 아니다.

  **그 뒤 숲마루가 이 우회를 스스로 철회했다**([apt-finder#61](https://github.com/flameware/apt-finder/issues/61)):
  단지 상세를 폭 분기 없는 **중앙 모달 하나**로 수렴시키면서 `useIsMobile` 분기와
  Drawer 재도색이 통째로 사라졌다. 아래에 실린 우회 코드는 이제 그 레포에 없다 —
  기록으로만 읽는다. 판정은 그대로 서고, 근거는 더 강해졌다: 전체 화면 오버레이를
  그리던 유일한 자리가 **오버레이를 포기하는 쪽**으로 갔다.

한 곳이 우회한다는 사실만으로 축을 열지 않는 것은 이 리포가 이미 정한 방식이다:

- **축을 여는 것과 우회를 발견하는 것은 다른 티켓이다**
  ([#351](https://github.com/flameware/massive-design/issues/351)). 우회가 축이 짧다는
  신호인 것은 맞지만, 넓힐지 다른 문제로 볼지는 별도 판정이다.
- **모바일 전환은 앱이 고르고, 프리셋은 반복이 확인된 뒤다**
  ([#284](https://github.com/flameware/massive-design/issues/284)). 같은 자리에서 이미
  한 번 참은 판정이다.

그리고 축을 지금 열면 데이터 한 개로 정해야 하는 것이 너무 많다 — 표면 토큰
(떠 있는 `bg-overlay`인가 화면을 차지한 `bg-surface`인가,
[#387](https://github.com/flameware/massive-design/issues/387)), 상단 safe-area,
`Viewport`의 `justify-end`, 스와이프 닫기 유지 여부.

```tsx
// 소비처의 우회는 전부 클래스 층이고, `cn`이 tailwind-merge라 정상적으로 이긴다.
// 즉 "DS가 다음에 바꾸면 조용히 깨진다"는 걱정은 이 줄들에는 해당하지 않는다.
<Drawer.Popup className="h-[100dvh] max-h-none rounded-none border-0 bg-surface shadow-none" />
// Backdrop은 override가 아니라 조립에서 빠지는 것이다 — 렌더링하지 않으면 그만이다.
```

## 여기 들어오지 않는 것 — 손잡이 마크업

위 우회 중 **딱 하나**, 손잡이를 지우는 `[&>div:first-child]:hidden`은 클래스가 아니라
`Drawer.Popup`의 자식 순서에 기댄다. 그것은 축이 없어서 생긴 부채가 아니라 **DS가
장식 마크업을 끌 방법을 주지 않아서** 생긴 부채이고, 이 판정과 무관하게 [#455](https://github.com/flameware/massive-design/issues/455)가 따로 다뤘다.

**#455도 범위 밖으로 닫혔다** — 판정과 재판단 계기는
[`drawer-handle-axis.md`](drawer-handle-axis.md)에 있다. 위와 같은 이유(소비처가
Drawer를 걷어내 우회가 0곳이 됐다)로 닫혔지만 **개념이 다르므로 문서도 다르다**:
이쪽은 전체 화면 전환 표면이고, 저쪽은 장식 마크업을 끄는 축이다.

## 다시 판단할 계기

두 번째 소비처가 **라우트를 쓸 수 있는데도** 전체 화면 오버레이를 고르는 날. 그때는
전환 자체가 패턴이라는 뜻이고, 위에 적은 네 가지 결정에 데이터가 둘 이상 생긴다.

## 지금까지의 요청

- [#410](https://github.com/flameware/massive-design/issues/410) — 전체 화면 모바일 패널 — Drawer의 바닥 시트 전제와 맞지 않는 자리
