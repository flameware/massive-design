# 축을 되읽는 수식자는 셀의 축 값에 대고 해소하고, 파트는 물려받을 root 축을 계약이 지목한다

[#147](https://github.com/flameware/massive-design/issues/147)이 `unresolved` 145건을 여섯 무리로 가를 때, 한 무리는 조인 대상이 `configurationStates`가 **아니었다.** 이미 선언된 cva 축을 DOM 속성으로 되읽어 그리는 수식자들이다.

카탈로그 전체에서 정확히 8 keys / 38 decls, 두 컴포넌트뿐이다.

| 계약 | 수식자 | 자리 | keys | decls |
|---|---|---|---|---|
| `sidebar` | `data-[variant=sidebar]` | 루트 셀 | 4 | 24 |
| `slider` | `data-[orientation=horizontal\|vertical]` | `SliderTrack` · `SliderRange` 파트 셀 | 4 | 14 |

**중복이 아니라 진짜 공백이다.** sidebar의 12개 셀 전부가 `data-[variant=sidebar]:border-r`를 달고 있고 어느 셀도 평범한 `border-right-width`를 갖지 않았다 — 파생 채널은 **어떤 sidebar variant에도 테두리를 그리지 않고 있었다.** `SliderTrack`은 더 나쁘다: `height`도 `width`도 6개 셀 어디에도 없어 두께 없는 트랙이 발행됐다.

## 재 본 사실

**두 자리는 한 문제가 아니다.**

sidebar의 것은 **셀 자신의 축**을 읽는다. 축은 셀로 전개되므로 셀이 `variant`를 **이미 고정하고 있고**, 그래서 판정이 정적이다 — 12칸 중 4칸에서 참이고 8칸에서 거짓이다. 계약에 적을 것이 하나도 없다.

slider의 것은 **root의 축**을 파트 셀에서 읽는다. `SliderTrack`의 축은 `size`뿐이라 **대고 해소할 값이 없다.** 물려받는 것은 값을 주기 위해서이고, 값을 얻고 나면 해소는 sidebar와 **똑같은 규칙**이다.

## 결정

**해소된 축 되읽기는 `properties`에 접히거나 사라진다 — `configurations`가 아니다.**

`configurations`는 셀이 **고르지 않은** 상태의 차이를 담는 자리인데([#148](https://github.com/flameware/massive-design/issues/148)), 축은 셀이 **이미 골랐다.** 값이 같으면 그 선언은 이 셀의 쉬는 상태이고, 다르면 이 셀에는 그 규칙이 아예 적용되지 않는다. Figma 쪽에서도 이것은 component property가 아니라 **이미 존재하는 variant 축**이며, 조합 수는 늘지 않는다. [#147](https://github.com/flameware/massive-design/issues/147)이 A1과 A2를 다른 티켓으로 가른 이유가 이것이다.

**파트는 물려받을 root 축을 지목한다.**

```js
SliderTrack: { config: …, className: …, inheritedAxes: ["orientation"] },
```

값과 기본값은 root의 것 그대로다 — 파트가 다시 적으면 두 자리가 갈린다. 게이트는 두 가지를 본다: 지목한 축이 root에 실재하는가, 그리고 **이 파트가 그 축을 실제로 되읽는가.** 뒤가 이 검사의 값어치다 — 되읽지 않는 축을 물려받으면 아무것도 얻지 못한 채 셀만 배로 늘고, [#147](https://github.com/flameware/massive-design/issues/147)이 막으려던 조합 폭발이 정확히 그 모양이다.

**축 이름과 DOM 속성 이름은 같다고 본다.** 대응표를 두지 않는다. 축의 이름 공간은 우리 것이고([ADR-0008](../../../../../docs/adr/0008-axis-and-value-name-spaces.md)) 되읽히는 속성도 우리가 쓴다(`data-variant={variant}`). 언젠가 갈리면 조회가 빗나가 `unresolved`로 뜨는데, **그것이 [#140](https://github.com/flameware/massive-design/issues/140)이 지키려는 신호이므로 안전한 실패다.** 구성 상태에서 이름표를 계약이 진 이유는 DOM 이름이 upstream의 말이라 선언 이름과 거의 언제나 달랐기 때문인데(`data-[state=on]` ↔ `pressed`), 축에는 그 사실이 없다.

따라오는 제약이 하나 있고 게이트가 지킨다: **구성 상태의 DOM 속성 이름은 축 이름과 겹칠 수 없다.** 겹치면 한 수식자가 두 뜻을 갖고, 조립이 축 되읽기를 먼저 보므로 그 구성 상태가 조용히 `configurations`에서 사라진다. ADR-0008이 축 이름에 그은 선이 DOM 이름 공간까지 닿는 자리다.

## 발행된 인스턴스는 어떻게 되는가

`SliderTrack` 3 → 6칸, `SliderRange` 1 → 2칸. **[#139](https://github.com/flameware/massive-design/issues/139)의 규칙은 이 경우를 문언대로는 판정하지 못한다** — *"새 축의 기본값은 이미 발행된 인스턴스를 보존하는 값"*인데, 발행된 `SliderTrack`은 두께를 **아예 갖지 않았다.** 어떤 기본값도 그것을 보존하지 못한다.

**그 규칙은 축의 기본값을 묶지 셀의 완결성을 묶지 않는다.** 규칙이 막는 것은 **재해석**이고, `horizontal`은 브라우저가 이미 그리던 값이므로 축은 `additive`다(`CONTEXT.md`가 *"기본값이 정해진 새 variant 축·값"*을 additive로 적는다). 빈 자리가 채워지는 것은 따로 `in-place safe`로 판정한다 — 구멍을 메우는 것은 인스턴스를 재해석하는 것이 아니고, 발행된 Figma 인스턴스는 무엇의 충실한 기록도 아니었다.

## 고려한 대안

- **`inheritedAxes`를 `drawnBy` 모양(`{ attribute, values }`)으로 둔다.** 모양이 하나로 유지되고 DOM 이름이 갈리는 날을 지금 표현할 수 있다. 버린 이유는 오늘 8건 전부가 항등이고, **항등인 정보를 복사하면 그 자리가 낡을 수 있기 때문이다** — [ADR-0009](0009-drawn-but-not-carried.md)가 정책표를 복사하지 않고 되물은 것과 같은 판단이다. 갈리는 날에는 `unresolved`가 떠서 알려 준다.
- **암묵 상속 — 파트가 되읽는 root 축은 계약 없이 물려받는다.** 선언이 0이고 결과 셀도 똑같이 6칸이다. 버린 이유는 **셀 수가 발행되는 Figma 자산의 크기**이기 때문이다. 암묵이면 파트 클래스에 `data-[orientation=vertical]:…` 한 줄을 더하는 것만으로 발행된 자산이 조용히 배가 되고, 리뷰에 보이지 않는다. [#139](https://github.com/flameware/massive-design/issues/139)의 관심사가 정확히 발행된 인스턴스다.
- **파트의 cva에 `orientation` 축을 직접 넣는다.** `slider` root의 `size: { sm: "", … }`처럼 빈 문자열을 내는 축의 선례가 이미 있다. 버린 이유는 그것이 **파트가 소유한 축**을 뜻하게 되기 때문이다 — 소비처가 `SliderTrack`에 `orientation`을 넘길 수 있다는 말이 되고 `VariantProps`에도 뜨는데, 실제로는 Radix가 root에서 내려 준다. 아무 일도 하지 않는 prop을 공개 타입에 내는 거짓 선언이다(ADR-0006).
- **아무것도 하지 않는다** — sidebar가 파생 채널에서 테두리 없이, `SliderTrack`이 두께 없이 계속 발행된다.

## 파급

**해시는 `sidebar`·`slider` 둘만 움직인다.** 티켓이 예고한 폭 그대로다. 나머지 49개는 `schemaVersion`만 바뀐다.

**`schemaVersion`은 7 → 8이다.** 소비처가 새로 해야 하는 일은 **파트의 축을 다시 읽는 것**이다 — `part.axes`에 그 파트의 cva에 없는 이름이 올 수 있고(`SliderTrack.orientation`), 그만큼 파트의 셀이 는다. 주입은 물려받은 축을 파트 자신의 축과 구분하지 않되, root의 인스턴스가 파트를 놓을 때 **root의 축 값과 같은 값**을 골라 준다.

**복합 수식자는 이 ADR 밖이다.** sidebar의 `data-[state=collapsed]:data-[side=left]`(2 keys / 12 decls)는 축과 구성 상태를 함께 읽으므로 조회를 넓히는 [#182](https://github.com/flameware/massive-design/issues/182)가 판정한다. A2의 census가 10이 아니라 8인 이유가 이것이다.
