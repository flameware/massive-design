# 우리 클래스가 그리지만 파생 채널이 나르지 않는 자리는 계약이 검사 가능한 모양으로 적는다

[#148](https://github.com/flameware/massive-design/issues/148)이 `drawnBy`를 세울 때 모양은 둘이었다 — 우리 클래스가 그리면 `{ attribute, values }`, 아니면 이유 문자열. 다섯 계약이 그 둘 중 어느 것도 참이 아닌 자리에 앉았고, 넷은 **오지 않을 세대를 가리키는 약속**을 이유 문자열에 적어 두었다.

> `input-otp.validity`: *"`aria-invalid` 수식자가 그리는데 지금 정책이 그것을 버린다 — 뜻 단위 정규화가 다룬다(#178)"*

[#178](https://github.com/flameware/massive-design/issues/178)이 도착했고 답은 반대였다. `aria-invalid`는 `ignore:`다 — *"검증 상태 — Figma에 대응물이 없다(#22 §5)"*. 버려지던 것이 계속 버려지되 이제 근거를 갖고 버려진다. 약속은 지켜지지 않았고, **약속이 낡은 것을 아무 게이트도 보지 못했다.**

## 재 본 사실

세 자리가 같은 모양이다. 우리 클래스가 **실재하고**(`aria-invalid:border-destructive`), 정책이 **나르지 않기로 판정했다**.

| 계약 | 구성 상태 | 그리는 수식자 | 정책 |
|---|---|---|---|
| `input-group` | `validity` | `has-[[aria-invalid=true]]` · `aria-invalid` | `ignore:` |
| `input-otp` | `validity` | `aria-invalid` | `ignore:` |
| `native-select` | `validity` | `aria-invalid` | `ignore:` |

기존 두 모양이 **둘 다 거짓**이다. 이유 문자열은 *"우리 클래스가 그리지 않는다"*고 말하는데 그리고 있고, `{ attribute, values }`는 조립이 셀의 `configurations`에 담는다고 말하는데 담기지 않는다.

## 결정

**세 번째 모양을 세운다. 값이 이유인 것이 아니라 정책표를 되묻는 것이 요점이다.**

```js
drawnBy: { validity: { modifiers: ["aria-invalid"], carriedBy: "none" } }
```

`carriedBy: "none"`은 *"`MODIFIER_POLICY`가 이 수식자를 `ignore:`로 판정했다"*는 뜻이고, **게이트가 `policyFor`로 그것을 실제로 확인한다.** 이유는 계약에 복사하지 않는다 — 정본은 정책표의 `ignore:` 값이고, 복사하면 두 자리가 갈린다.

**그리고 선언은 거두지 않는다.** `configurationStates`는 Figma 전용이 아니다 — `Components.stories.tsx:12`가 `{ ...axes, ...configurationStates }`로 Storybook 컨트롤을 만들고, `validity`를 선언했기 때문에 사람이 invalid 상태를 본다. **계약이 선언하는 층과 파생 채널이 나르는 층은 다르고 둘 다 참이다.** `ignore:`는 후자의 사실이지 전자를 무르는 근거가 아니다.

## 왜 이 모양인가

**이 모양이 사는 이유는 낡음 하나다.** 앞의 두 모양에서 이유 문자열은 `externalSurfaces`·`IGNORED_PROPERTIES`와 같은 등급의 손으로 적은 근거라 뒤집혀도 아무 게이트가 못 본다. 이 모양의 주장은 **검사 가능한 사실**이다 — [#24](https://github.com/flameware/massive-design/issues/24)가 상태 축을 정해 `aria-invalid`의 `ignore:`가 뒤집히면 게이트가 깨지고 누군가 반드시 이 자리를 다시 본다. `ignore:`의 값에는 그 뒤집힘이 이미 예고되어 있다(`hover` 항목이 *"#24가 상태 축을 정하면 다뤄진다"*고 적었다).

이것은 [#140](https://github.com/flameware/massive-design/issues/140)이 *"이유 문자열이 낡는 것을 잡는 방법이 지금은 없다"*고 적은 병의 **첫 치료**다. 세 사례가 알려져 있다 — 파트 미등록 넷([#155](https://github.com/flameware/massive-design/issues/155)), `ignore:` 뒤집힘 셋(여기), runbook의 고정 해시([#178](https://github.com/flameware/massive-design/issues/178)이 낡은 것을 발견했다). 이 ADR은 **둘째만** 고친다: 나머지 둘은 정책표처럼 되물을 정본이 없다.

**`carriedBy`에 `"state"`(상태 사다리가 담는다)는 두지 않는다.** 사다리는 셀 단위이고 같은 계약 안에서도 셀마다 있고 없다 — `input-group`은 루트 셀에 `has-[:disabled]`가 있는데 사다리는 `InputGroupButton` 파트에만 있어 루트의 불투명도는 버려진다. 계약은 셀을 가리켜 말할 어휘가 없으므로 그 주장을 참으로 만들 수 없고, [ADR-0006](../../../../../docs/adr/0006-uncontracted-surfaces.md)대로 **참으로 쓸 계약이 하나도 없는 모드를 열어 두면 거짓 선언을 부른다.** `input-group.disabled`와 `native-select.disabled`는 그래서 이유 문자열로 남되, 약속이 아니라 사실을 적는다 — *"조립이 담을 자리가 없다"*.

## 고려한 대안

- **이유 문자열만 사실로 고친다.** 가장 싸고 어휘가 늘지 않으며 `native-select.disabled`가 선례처럼 보였다. 버린 이유는 그 선례 자체가 **거짓이었기 때문이다** — *"조립은 그것을 상태 사다리의 `disabled`로 담는다"*고 적혀 있었는데 `native-select`에는 사다리가 없어 불투명도가 버려지고 있었다. 아무도 못 본 채로 서 있던 문장이고, 문자열만 고치는 길은 그것을 또 한 번 재생산한다.
- **선언을 거둔다** — `validity`가 Figma에 없으니 `configurationStates`에서 뺀다. 버린 이유는 층을 접기 때문이다. Storybook 컨트롤이 사라져 사람이 invalid 상태를 볼 자리를 잃고, 계약이 *"이 컴포넌트에 검증 상태가 있다"*는 참인 사실을 말하지 못하게 된다.
- **`attribute`의 `data-*` 제약을 열어 `{ attribute: "aria-invalid", values: {...} }`를 쓴다.** 모양이 하나로 유지되어 매력적이었다. 버린 이유는 그 모양의 뜻이 *"조립이 `configurations`에 담는다"*이고, 담기지 않으므로 거짓이 되기 때문이다. 모양의 통일보다 뜻의 정확이 앞선다.
- **아무것도 적지 않는다** — 네 문자열이 도착하지 않을 세대를 계속 가리키고, #24가 정책을 뒤집으면 셋이 조용히 더 낡는다.

## 파급

**해시는 움직이지 않는다.** `drawnBy`는 `hash.mjs`가 명시적으로 뺀 코드 쪽 사실이라 Figma 노드를 만드는 입력이 아니다. 이 ADR이 만드는 세대는 Repo verification을 지나지만 Figma 기준선을 뒤처지게 하지 않는다.

**`schemaVersion`은 6 → 7이다.** 소비처가 새로 해야 하는 일은 **판별**이다 — 이제 이유 문자열과 `{ attribute, values }` 둘로 가르면 안 되고, `carriedBy`를 만난 주입은 `unresolved`처럼 "아직 못 다룬 것"으로 읽지 말고 **그릴 것이 없는 것**으로 읽는다.

**새 구성 상태를 선언하는 티켓이 지는 것.** 그리는 자리가 우리 클래스인데 조립이 담지 않으면 이유 문자열을 쓰지 않는다 — 정책이 `ignore:`로 판정한 것이면 `carriedBy: "none"`으로 적어 게이트가 되묻게 하고, 담을 자리가 없어서면 그 **사실**을 적되 오지 않을 세대를 가리키지 않는다.
