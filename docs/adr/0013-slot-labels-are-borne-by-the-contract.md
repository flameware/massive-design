# 슬롯의 이름표는 선택자가 스스로 말할 때만 전역 표가, 아니면 계약이 진다

[#181](https://github.com/flameware/massive-design/issues/181)이 닫으려던 무리는 **자손 선택자가 지목하는 슬롯**이었다. 자손을 가리키는 수식자 중 전역 `MODIFIER_POLICY`가 아는 것은 `[&_svg]` 계열뿐이라, 나머지는 전부 *"수식자를 아직 다루지 않는다"*로 `unresolved`에 떨어져 있었다.

| 자산 | 수식자 | 지목된 노드가 계약에서 갖는 지위 |
|---|---|---|
| `SidebarMenuButton` · `SidebarMenuSubButton` | `[&>span:last-child]` | anatomy에도 `parts`에도 없다 — 소비처가 넣는 라벨 |
| `TableHeader` · `TableBody` | `[&_tr]` · `[&_tr:last-child]` | `TableRow`는 **등록된 파트**이고 자기 셀이 `border-b`를 그린다 |
| `Switch` | `[&_[data-slot=switch-thumb]]` | `Thumb`은 anatomy에 있으나 **파트 셀이 없다** — [#155](https://github.com/flameware/massive-design/issues/155)의 열 계약 |
| `ItemMedia` · `EmptyDescription` · `ButtonGroup` | `[&_img]` · `[&>a]` · `[&>*]` | anatomy에도 `parts`에도 없다 — 소비처가 넣는 내용 |

**티켓이 한 무리로 묶었지만 한 무리가 아니었다.** 지목된 노드의 지위가 갈리면 그 선언이 갈 자리도 갈린다 — 파트가 있으면 그 파트의 자산이 이미 그리고 있고(`elsewhere:`), 파트가 있어야 하는데 없으면 이 티켓이 아니라 파트를 등록하는 티켓의 몫이며, 아무것도 없으면 그때야 슬롯을 논할 수 있다.

남은 자리에서 실제 질문은 **누가 슬롯에 이름을 주는가**였다.

## 결정

**선택자가 자기 역할을 스스로 말하면 전역 `MODIFIER_POLICY`가, 말하지 않으면 계약이 이름표를 진다.**

`[&_svg]`는 *"svg는 어디서나 아이콘"*이라 전역 표가 이름을 줄 수 있다 — 그 표는 자기 주석에 *"컴포넌트를 가리지 않는 뜻만 온다"*고 적어 두었고 이 뜻은 그 조건을 만족한다. `[&>span:last-child]`는 그럴 수 없다: **마지막 자식인 span이 라벨인 것은 그 파트의 사실이지 51개 컴포넌트의 사실이 아니다.** 전역 표에 넣으면 다음 컴포넌트에서 조용히 빗나가고, 그때는 아무 게이트도 보지 않는다.

그래서 파트 계약이 `slots`로 지목한다.

```ts
SidebarMenuButton: { config, className, slots: { label: "[&>span:last-child]" } }
```

**세 번째로 같은 방향이다.** [#147](https://github.com/flameware/massive-design/issues/147)이 *"이름표는 계약이 진다 — DOM 속성 이름이 선언 이름과 거의 언제나 다르다"*를 세웠고, `drawnBy`([#148](https://github.com/flameware/massive-design/issues/148))와 `inheritedAxes`([#179](https://github.com/flameware/massive-design/issues/179))가 그것을 각각 구성 상태와 축에서 실행했다. 이 결정은 같은 규칙을 **슬롯**에서 실행하고, 그 규칙에 처음으로 **반대쪽 선**을 그어 준다 — `slot-icon`이 전역 표에 남아 있는 것은 예외가 아니라 조건을 만족하는 경우다.

### 매니페스트에 앉는 자리

`cell.slots.<역할>`, 즉 `slots.icon`이 이미 앉아 있던 자리다. **주입은 두 경로를 구분하지 않는다** — 도착한 것은 같은 모양이다.

**키는 CSS 속성 이름 그대로 담는다.** `slots.icon`의 개명(`height` → `size`)은 *"정사각형의 한 변"*이라는 사실을 담느라 필요했던 것이지 이 필드의 규약이 아니다. `truncate`가 내는 세 선언을 `truncate: true`로 접으면 매니페스트가 CSS보다 앞서 해석하게 되므로, 접는 것은 **번역표(`figma-components.md` §7)의 몫**으로 남긴다 — 거기서 `overflow` + `text-overflow`가 함께 왔을 때 `textTruncation = 'ENDING'`이 된다.

### 게이트

[ADR-0009](0009-drawn-but-not-carried.md)가 `carriedBy`에 세운 것과 같은 모양으로, **거짓 선언**만 본다.

- 지목한 선택자가 **그 자산의 className에 실재하는가.** 선언은 손으로 적히고 className은 리팩터링으로 움직이므로, 선택자가 사라지면 매니페스트는 조용히 슬롯 하나를 잃는다.
- 역할 이름이 파생 채널의 **역할 어휘**(§7의 `label`·`icon`)에 있는가. 어휘 밖 이름은 주입이 놓을 노드를 찾지 못한다.
- 전역 표가 **이미 판정한 선택자**를 계약이 지목하지 않는가. 조립은 계약을 먼저 보므로 겹치면 전역 정책이 조용히 가려지고 두 자리가 같은 선택자에 다른 뜻을 적게 된다.
- 한 선택자를 **두 역할이** 지목하지 않는가. 조회표가 뒤집힌 방향이라 하나가 조용히 진다.

## 기각한 것

**전역 표에 `[&>span:last-child]` → `slot-label` 한 줄.** 3 keys/12 cells를 스키마도 게이트도 건드리지 않고 닫는다. 기각하는 이유는 값어치가 아니라 방향이다 — [#140](https://github.com/flameware/massive-design/issues/140)의 destination이 *"계약이 **선언한** 것을 파생 채널이 담게 한다"*인데, 이 안은 선언을 계약 **밖** 전역 표에 두는 것이다. 오늘 이 선택자를 쓰는 것이 sidebar 둘뿐이라 당장 빗나가지는 않지만, 빗나가는 날 아무 게이트도 보지 않는다는 것이 `MODIFIER_POLICY`가 자기 주석에 그 조건을 적어 둔 이유다.

**`[&_img]`·`[&>a]`·`[&>*]`에 새 역할을 주기.** 셋 다 소비처가 넣는 내용이고, 담으려면 §7의 역할 어휘를 늘려야 한다. 그것은 **계약을 여는** 방향이라 [#140](https://github.com/flameware/massive-design/issues/140)이 이미 Out of scope로 갈라낸 방향이고, 셋 다 그럴 필요도 없다 — 그림을 틀에 채우는 것은 Figma에서 **틀 자신의 clip과 image fill**이 하는 일이라 옮길 자식이 없고(그 틀은 셀이 이미 담고 있다), 링크의 밑줄은 노드가 아니라 **텍스트 범위**의 장식이며, `[&>*]`는 모든 자식을 가리켜 **이름 붙일 슬롯 자체가 없다**. 셋 다 `ignore:`로, 이유는 셋 다 따로 적는다.

**`[&_tr:last-child]`의 "저기"를 `TableRow`로 지목하기.** `[&_tr]`은 참인 지목이다 — `TableRow`의 셀이 `border-b`를 실제로 그린다. 그러나 *"끝 행에는 테두리가 없다"*는 사실은 그 셀에 **없다**(언제나 `border-b`다). 지목하면 거짓 지목이고 [ADR-0012](0012-drawn-elsewhere.md)의 규약이 그것을 금하므로, 이쪽만 **무리 안 위치**로 보낸다 — 그 사실이 사는 곳은 조립된 표다. 축약이 `last`로 접지 못하는 것은 도달 경로가 자손 지목이라서이지 뜻이 달라서가 아니다([#180](https://github.com/flameware/massive-design/issues/180)이 남긴 ⚠️가 가리키던 자리).

**반응형을 `elsewhere:`로 보내기.** `md:p-12`는 **그려진다** — 넓은 뷰포트에서. 그래도 `elsewhere:`가 아닌 것은 그 등급의 규약이 *"저기가 **어디인지**를 지목한다"*이고 그 "어디"가 언제나 **다른 자산**이기 때문이다. 뷰포트도 컨테이너도 자산 그래프의 자리가 아니므로 `ignore:`가 맞고, 이유 문자열이 그 선을 명시한다.
