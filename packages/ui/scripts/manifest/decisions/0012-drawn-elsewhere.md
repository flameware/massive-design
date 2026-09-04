# 무리 안 위치는 `ignore:`가 아니라 제4의 등급 `elsewhere:`로 판정한다

[#140](https://github.com/flameware/massive-design/issues/140)이 존재하는 이유는 `classify.mjs`가 약속한 불변식이 깨져 있다는 것이었다 — 무시 화이트리스트에는 Figma에 대응물이 **아예 없는** 축만 적혀야 남은 `unresolved`가 "아직 못 다룬 것"만 가리킨다. [#147](https://github.com/flameware/massive-design/issues/147)이 145건을 여섯 무리로 가르면서 한 무리가 그 불변식에 정면으로 걸렸다.

붙은 무리의 **첫·끝 항목만** 모서리를 둥글게 하는 26 keys(90 decls)다.

| 계약 | 선언한 자리 | 수식자 | keys |
|---|---|---|---|
| `toggle-group` | `ToggleGroupItem` 파트 | `first` · `last` | 10 |
| `input-otp` | `InputOTPSlot` 파트 | `first` · `last` | 6 |
| `button-group` | 루트 | `[&>*:not(:first-child)]` · `[&>*:not(:last-child)]` | 10 |

이것은 Figma에 **없는 것이 아니다.** 붙은 Toggle Group의 바깥 모서리는 실재하고, 다만 개별 컴포넌트 자산이 아니라 그 자산을 **조립한 그룹**에 있다. `ignore:`의 뜻은 *"영영 거기 없다"*로 못 박혀 있으므로([#110](https://github.com/flameware/massive-design/issues/110)·[#124](https://github.com/flameware/massive-design/issues/124)의 항목들이 그 뜻이다) 여기에 쓰면 거짓말이고, **이 맵이 고치려던 병을 `ignore:`로 옮기는 것**이다 — 다음 세대가 `ignore:`를 못 믿게 된다.

## 결정

**제4의 등급 `elsewhere:`("여기가 아니라 저기에 그려진다")를 세운다.** 셀에서 안 보이는 선언의 등급은 이제 넷이고 서로 겹치지 않는다.

| 등급 | 뜻 | 어디에 적히나 |
|---|---|---|
| `unresolved` | 아직 못 다뤘다 | 셀에 뜬다 |
| `ignore:` | 영영 거기 없다 | `MODIFIER_POLICY`·`IGNORED_PROPERTIES` |
| `externalSurfaces` | 우리 것이 아니다(소유자가 다르다) | 계약 — 손으로, 매니페스트로 나간다([#122](https://github.com/flameware/massive-design/issues/122)) |
| `elsewhere:` | 여기가 아니라 저기다(그려지는 자리가 다르다) | `MODIFIER_POLICY` — 매니페스트로 나간다 |

②와 ④를 가르는 것은 **그려지는가**이고, ③과 ④를 가르는 것은 **소유자냐 자리냐**다. [#122](https://github.com/flameware/massive-design/issues/122)가 소유자가 다르다는 이유로 등급을 갈랐던 것과 같은 모양이다.

**규약: 이유가 저기가 *어디인지*를 지목해야 한다.** `elsewhere:`는 "언젠가 그린다"가 아니라 "저기에 이미 있다"이므로, 그 자리를 대지 못하는 이유는 `unresolved`를 다르게 적은 것에 지나지 않는다. 지금 네 항목의 자리는 전부 **조립된 그룹**이다.

**매니페스트로 내보낸다 — 문서 단위 `elsewhere`이고 해시의 입력이 아니다.**

```json
"elsewhere": {
  "first": {
    "reason": "무리 안 위치(첫 항목) — 이 자산이 아니라 조립된 그룹이 그린다",
    "declaredOn": { "ToggleGroupItem": ["border-left-width", "border-top-left-radius", "..."] }
  }
}
```

**`externalSurfaces`와 달리 파생값이다.** 이유의 정본은 정책표의 `elsewhere:` 값이고 자리는 조립이 실측하므로 손으로 적을 것이 없다 — [ADR-0009](0009-drawn-but-not-carried.md)가 `carriedBy`에서, [ADR-0011](0011-axis-readback-and-part-axis-inheritance.md)이 `inheritedAxes`에서 택한 것과 같은 판단이다. 복사가 없으면 낡을 자리도 없다.

**전역 표에 앉는 것은 뜻이고, 컴포넌트마다 다른 것은 조립이 적는다.** "무리 안 위치"는 컴포넌트를 가리지 않는 뜻이라 `MODIFIER_POLICY`의 자격이 있지만, *어느* 조립인지는 컴포넌트마다 다르다. 그 절반을 `declaredOn`이 파생으로 진다.

## 왜 매니페스트로 내보내는가

[ADR-0006](../../../../../docs/adr/0006-uncontracted-surfaces.md)이 `notContracted`를 기각한 근거는 **소비할 파생 채널도 게이트도 없다**는 것이었고, [ADR-0005](../../../../../docs/adr/0005-inherited-dismiss-gestures.md)가 `gestures`를 내보내지 않은 근거는 **파생 채널에 그 모호함이 애초에 없다**는 것이었다. 여기서는 둘 다 반대다.

모호함이 실재한다. 주입 에이전트가 `ToggleGroupItem`을 `spacing: attached`로 생성하면 12개 셀이 전부 `border-radius: 0`이고, 그 자산은 **중간 항목으로서 옳다**. 그런데 사람이 그것으로 그룹을 조립하면 바깥 모서리가 각진 채로 남고, 매니페스트에는 그것을 말하는 문장이 하나도 없다 — `ignore:`처럼 조용히 버리면 *"여기 없다"*가 *"어디에도 없다"*로 읽힌다. `CONTEXT.md`가 `externalSurfaces`의 근거로 든 **침묵**이 바로 이것이고, 그래서 같은 자리에 같은 종류의 필드로 앉는다.

해시의 입력이 아닌 이유는 이 필드가 말하는 것이 *이 컴포넌트의 Figma 자산이 무엇을 그리는가*가 아니라 **무엇을 그리지 않는가**이기 때문이다 — 자산을 만드는 입력이 아니다. `externalSurfaces`·`drawnBy`·`reference`가 이미 그 자리에 있다.

## 실측

- E 26 keys / 90 decls가 `unresolved`에서 빠졌다. 수식자 unresolved **59 keys / 151 decls → 33 keys / 61 decls**.
- **호환성 분류 `in-place safe`.** className도 cva config도 움직이지 않았다 — 판정만 바뀐다.
- **해시 3개 이동**: `button-group` · `input-otp` · `toggle-group`. 티켓의 예측 그대로다.
- `schemaVersion` 8 → 9.

## 가려낸 사실

**`first`/`last`는 두 계약에서 한 뜻이다.** `input-otp`의 `first`(칸 그룹의 첫 칸)와 `toggle-group`의 `first`(버튼 무리의 첫 버튼)는 같은 관용구이고 — `toggle-group`의 소스 주석이 `InputOTPSlot`을 **선례로 지목하며** 붙은 형태를 그렸다 — 둘 다 항목 자산이 자기 위치를 묻는다. 같은 등급이다.

**`button-group`은 형태가 반대인데 같은 등급이다.** 그쪽은 컨테이너가 자식을 고른다(`[&>*:not(:first-child)]`). 그리고 이것은 고칠 수 있는 불일치가 **아니다** — `button-group`의 경계 ①이 *"그룹은 자식의 props를 건드리지 않는다"*이고 자식은 남의 컴포넌트(`Button`)라, `toggle-group`처럼 항목의 셀로 옮길 자리가 구조적으로 없다. 두 모양이 둘 다 정당하고, 그려지는 자리는 같은 조립된 그룹이다. 그래서 한 등급에 담고 `declaredOn`이 어느 자산이 그 클래스를 선언했는지만 가른다.

**표에 오는 것은 형태가 아니라 뜻이라 키가 넷이다.** "나는 첫째다"와 "나는 첫째가 아니다"는 반대 뜻이므로 `first`·`last`·`not(:first-child)`·`not(:last-child)`이고, 컨테이너 형태는 [#178](https://github.com/flameware/massive-design/issues/178)의 축약이 요소부를 벗겨 도달한다 — `[&>button:not(:first-child)]`도 같은 자리로 온다.

**`last-child`는 이 등급이 아니다.** `[&>span:last-child]`(sidebar)·`[&_tr:last-child]`(table)는 무리의 끝 항목이 아니라 **자손을 지목**한다([#147](https://github.com/flameware/massive-design/issues/147)의 판정 규칙 4). `last`로 접었다면 [#181](https://github.com/flameware/massive-design/issues/181)의 무리가 통째로 조용해졌을 것이다.

## 게이트

**새 게이트를 세우지 않는다.** [ADR-0009](0009-drawn-but-not-carried.md)의 게이트가 필요했던 이유는 계약에 **손으로 적은 문장**이 정책표와 갈릴 수 있기 때문이었는데, 여기에는 그 문장이 없다 — 정책표가 유일한 자리이고 매니페스트는 파생이라 구조적으로 참이다.

*이유가 저기를 지목하는가*는 게이트가 볼 수 없다. 뜻의 판단이고, [ADR-0006](../../../../../docs/adr/0006-uncontracted-surfaces.md)이 **게이트가 못 보는 것을 본다고 적지 않는다**고 정한 그대로 사람이 진다.

## 고려한 대안

- **`ignore:`로 흡수한다.** 가장 싸고 등급이 늘지 않는다. 버린 이유가 이 ADR의 출발점이다 — `ignore:`의 뜻이 *"영영 거기 없다"*로 못 박혀 있어 거짓이 되고, 등급을 하나 아끼는 대가로 남은 `ignore:` 항목 전부의 신뢰를 깎는다.
- **`declaredOn`에 해소된 값까지 담는다.** 정보를 버리지 않아 매력적이었다(`first:rounded-l-md`는 `radius.md`로 이미 해소된다). 버린 이유는 그러면 이 필드가 **부인이 아니라 조립된 그룹의 명세**로 읽히기 때문이다 — 우리는 그 그룹을 자산으로 발행하지 않으므로 아무도 지키지 않는 명세가 하나 생기고, 셀마다 다를 수 있는 값을 문서 단위로 접으면서 조용히 하나만 남긴다. 값이 필요하면 소스 클래스가 정본이다.
- **셀마다 담는다.** `configurations`의 선례가 있고 값이 셀마다 갈리는 것을 담을 수 있다. 버린 이유는 셋이다 — 세 파일에 같은 사실이 90번 복사되고, 이 사실은 셀의 성질이 아니라 **자산의 성질**이며, 해시 밖에 두려면 `figmaPayload`에서 셀 필드 하나를 명시적으로 빼야 해서 "새 파생 필드가 조용히 해시를 바꾸지 않는다"는 `hash.mjs`의 규약이 한 겹 얇아진다.
- **계약이 손으로 선언한다** — `externalSurfaces`와 똑같은 모양. 컴포넌트마다 *어느* 조립인지를 구체적으로 적을 수 있어 규약(이유가 자리를 지목한다)을 가장 잘 만족한다. 버린 이유는 [ADR-0009](0009-drawn-but-not-carried.md)가 이미 겪은 낡음이다 — 조립이 아는 것을 손으로 다시 적으면 클래스가 바뀔 때 갈리고, 그것을 볼 게이트가 없다.
- **위치를 축으로 연다**(`position: first | middle | last`). Figma가 세 모서리 모양을 전부 발행하게 된다. 버린 이유는 [#24](https://github.com/flameware/massive-design/issues/24)가 상태를 축에서 뺀 것과 같다 — 조합 수가 곱해지고, 무엇보다 **거짓이다**: 항목은 자기가 첫째인지 모르고 조립이 정한다. 축은 조립할 때 **고르는** 것인데 이것은 자리가 정해 주는 것이다.
