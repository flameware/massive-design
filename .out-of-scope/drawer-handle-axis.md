# 장식 마크업을 끄는 축 — Drawer 손잡이

`Drawer.Popup`이 그리는 **잡는 손잡이**를 끄는 축(prop)을 두지 않는다. 손잡이는
항상 그려지고, 지우고 싶은 소비처는 `className`으로 지운다.

이 문서는 손잡이 하나에 대한 기록이지만 규칙은 그보다 넓다: **DS가 그린 장식
마크업을 끄는 축은 그것을 끄려는 소비처가 실측될 때 연다.**

## 왜 범위 밖인가

판정 잣대는 [ADR-0023](../docs/adr/0023-second-generation-base-ui.md) §10 —
**소비처가 필요의 잣대다.** [#455](https://github.com/flameware/massive-design/issues/455)가
열릴 때 근거는 숲마루(apt-finder)의 한 자리였다:

```tsx
// ApartmentDetailPanel.tsx — 지금은 없는 파일이다
className="... [&>div:first-child]:hidden"   // 손잡이 지우기
```

그 자리가 **소비처 쪽에서 스스로 사라졌다.** 숲마루는
[apt-finder#61](https://github.com/flameware/apt-finder/issues/61)에서 단지 상세를
폭 분기 없는 **중앙 모달 하나**로 수렴시키며 Drawer를 통째로 걷어냈다
(`ApartmentDetailModal.tsx`의 머리 주석: "`useIsMobile` 분기와 Drawer 재도색이
통째로 사라진다"). 그 레포에 남은 `Drawer` 문자열은 그 주석 두 줄뿐이다.

남은 Drawer 소비처는 invest diary의 `responsive-dialog.tsx` **한 곳**이고,
거기는 손잡이를 **그대로 그린다** — 우회가 없다.

**그래서 이 축의 실측 수요는 1이 아니라 0이다.** 한 곳이 우회한다는 사실만으로도
축을 열지 않는 것이 이 리포가 이미 세 번 지킨 방식인데
([#351](https://github.com/flameware/massive-design/issues/351)·[#284](https://github.com/flameware/massive-design/issues/284)·[#322](https://github.com/flameware/massive-design/issues/322)의
Badge `wrap`), 0곳에서 여는 것은 그 판정들과 정면으로 어긋난다.

그리고 지금 열면 **데이터 0개로 판정 둘을 내려야 한다:**

1. **이름.** `handle`은 쓸 수 없다 — Base UI Drawer에서 `handle`은 잡는 손잡이가
   아니라 명령형 제어 핸들(`Drawer.createHandle()`)이고 `Root`·`Trigger`가 그
   prop을 받는다(`drawer/root/DrawerRoot.d.ts:61`,
   `drawer/trigger/DrawerTrigger.d.ts:19`). 같은 컴포넌트 API 안에서 뜻이 둘이 되어
   [ADR-0008](../docs/adr/0008-axis-and-value-name-spaces.md) 규칙 1(축 이름의 이름
   공간은 카탈로그 전체)에 걸린다.
2. **`Drawer.Close`의 `top-3`.** 그 값은 손잡이(`mt-2 h-1.5`)만큼 Dialog보다 낮춘
   것이다(`packages/ui/src/drawer/drawer.tsx`). 손잡이를 끄면 닫기 버튼이 4px 뜨는데,
   `Close`는 `Popup`의 prop을 볼 수 없으므로 data 속성 + CSS라는 **새 패턴**을 열거나
   소비처가 `className`으로 지게 해야 한다.

## 부채의 정체는 "못 끈다"가 아니라 "자식 순서에 기댄다"

`[&>div:first-child]:hidden`이 위험했던 이유는 축이 없어서가 아니라 **선택자가
마크업 위치를 짚기 때문**이다. DS가 그 자리에 요소를 하나 끼우면 에러 없이 엉뚱한
것이 지워진다. 그 위험은 축이 아니라 **안정적인 선택자 훅**(예: 손잡이에 `data-*`)
하나로도 사라지고, 훅은 이름 공간 충돌도 닫기 버튼 판정도 만들지 않는다.

둘은 비용이 다르므로 계기도 다르다 — 아래 두 단계가 그것이다.

## 다시 판단할 계기

- **소비처가 한 곳이라도** 손잡이를 다시 마크업 위치로 지우면(`:first-child` 류의
  선택자가 소비처 코드에 나타나면) → **훅 판정을 연다.** 축이 아니라 안정적인
  선택자를 주는 쪽이 그 수요에 맞는 값이다.
- **두 곳이 되면** → **축 판정을 연다.** 그때 위의 이름과 닫기 버튼 오프셋을 함께
  정한다.
- **소비처와 무관하게**, `Drawer.Popup`의 자식 순서를 바꾸거나 첫 자식 자리에 무언가를
  끼우는 변경을 하는 날 이 문서를 다시 읽는다. 지금은 기대는 코드가 0곳이라 그
  변경이 안전하지만, 그 사실은 이 문서가 보장하는 것이 아니라 그날 다시 세어야 하는
  것이다.

전체 화면 모바일 패널 축 자체는 별도 판정이다 —
[`fullscreen-mobile-panel.md`](fullscreen-mobile-panel.md).

## 지금까지의 요청

- [#455](https://github.com/flameware/massive-design/issues/455) — Drawer 손잡이를 끌 수 있게 한다 — 근거였던 소비처 자리가 티켓이 열린 뒤 사라졌다
