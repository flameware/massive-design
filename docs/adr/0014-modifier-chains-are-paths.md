# 수식자 사슬은 경로다 — 항은 그 자리의 주어에 걸리고, 주어를 옮기는 것은 슬롯 지목뿐이다

[#182](https://github.com/flameware/massive-design/issues/182)까지 조립은 `modifiers.length === 1`일 때만 정책표를 봤다. 그래서 [#178](https://github.com/flameware/massive-design/issues/178)·[#179](https://github.com/flameware/massive-design/issues/179)·[#180](https://github.com/flameware/massive-design/issues/180)·[#181](https://github.com/flameware/massive-design/issues/181)이 정책을 다 세워도 **수식자가 둘 이상인 사슬은 하나도 걸리지 않았다** — 셋 다 두 무리의 교차였다.

| 사슬 | 자산 | 교차 |
|---|---|---|
| `data-[state=collapsed]:data-[side=left]` · `:right` | `Sidebar` | 구성 상태 × 축 되읽기 |
| `[&[data-state=open]>svg]` | `NavigationMenuTrigger` | 구성 상태 × 슬롯 |
| `[&_[data-slot=switch-thumb]]:data-[state=checked]` | `Switch` | 슬롯 × 구성 상태 |

**조회를 넓히는 것만으로는 답이 안 나온다.** 두 항이 셀에서 하는 일이 서로 다르기 때문이다 — 축 되읽기는 셀이 이미 고른 값과 대조하는 **거름망**이고([ADR-0011](0011-axis-readback-and-part-axis-inheritance.md)), 구성 상태는 값이 앉을 **자리**를 고르며([#148](https://github.com/flameware/massive-design/issues/148)), 슬롯 지목은 **주어를 옮긴다**([ADR-0013](0013-slot-labels-are-borne-by-the-contract.md)).

표를 복합 키로 늘리는 길은 [#178](https://github.com/flameware/massive-design/issues/178)이 이미 막아 두었다. `A:B`를 적으면 `B:A`도 `A:C:B`도 적어야 하고, 표가 조합만큼 커지면서 다음 사슬이 하나 더 생길 때 또 뚫린다 — **표에는 뜻이 오고 형태는 축약이 감당한다**는 규칙의 사슬 판이다.

## 결정

**사슬은 경로다.** 항은 그 자리의 **주어**에 걸리고, 주어를 옮기는 것은 슬롯 지목뿐이다.

CSS가 그것을 증명한다 — 두 표기는 서로 다른 선택자로 컴파일된다.

```
[&_svg]:disabled:opacity-50   →  .cls svg:disabled      (svg가 disabled일 때)
disabled:[&_svg]:opacity-50   →  .cls:disabled svg      (이 요소가 disabled일 때)
```

그래서 **순서가 뜻을 바꾸는 것은 오직 주어 이동을 통해서다.** 술어끼리는 교환법칙이 성립하고(`data-[state=collapsed]:data-[side=left]`와 그 역순은 같은 선택자다), 이동이 사슬을 가른다.

같은 이유로 `[&[data-state=open]>svg]`와 `data-[state=open]:[&>svg]`는 **표기가 둘일 뿐 뜻이 하나**다 — 컴파일 결과가 글자 하나까지 같다. 임의 변형 안에 주어 이동이 들어 있으면 사슬로 펴서 같은 자리에 앉힌다. 펴지 않으면 매니페스트의 신호가 **철자에 좌우된다.**

### 판정의 우선순위

1. **떨어뜨리는 항이 이긴다.** 선언은 모든 항이 참일 때만 그려지므로, 한 항이 거짓 축이거나 `ignore:`·`elsewhere:`면 나머지를 몰라도 결론이 난다. 모르는 항이 섞였다고 `unresolved`로 올리면 **아는 사실을 그 신호에 잡음으로 붓는다.**
2. **모르는 항이 하나라도 있으면 전체가 `unresolved`다.** 아는 쪽만 적용하면 반쪽만 그린 채 통과한다 — `Switch`가 그 증거다: 상태만 읽어 담으면 매니페스트가 *루트가* 움직인다고 말하는데 실제로 움직이는 것은 thumb이다. 안전한 실패가 거짓 통과보다 낫다.
3. **남으면 주어 × 구성 상태가 앉는 자리를 정한다.**

**원형을 먼저 본다**([#178](https://github.com/flameware/massive-design/issues/178)의 규칙 그대로). 항 하나는 `policyFor`가 축약해 가며 표를 본 뒤에야 쪼개진다 — 먼저 쪼개면 `[&>*:not(:first-child)]`가 `[&_*]`(`ignore:`)로 떨어져 [ADR-0012](0012-drawn-elsewhere.md)가 세운 항등(`elsewhere`에 오는 속성 집합 = 그 등급이 없었다면 `unresolved`로 떴을 것)이 깨진다.

### 매니페스트에 앉는 자리

`configurations[구성 상태][값].slots.<역할>`. 셀의 `slots`와 같은 종류의 값이고, 다른 것은 쉬는 상태가 아니라 그 구성 상태의 **차이**라는 것뿐이다.

**구성 상태가 바깥이고 슬롯이 안쪽인 이유는 한 번의 property 전환이 여러 노드를 함께 바꾸기 때문이다.** `NavigationMenuTrigger`가 열리면 트리거의 면과 그 안 아이콘의 회전이 같이 움직인다. 슬롯을 바깥에 두면 그 한 사실이 서로 모르는 두 자리에 흩어지고, 소비처는 *"켜지면 무엇이 달라지는가"*를 슬롯마다 훑어 다시 모아야 한다 — 이 맵이 세대마다 닫아 온 종류의 누수다.

`slots`는 CSS 속성 이름이 될 수 없으므로 이 자리에서 예약 키로 서도 속성과 섞이지 않는다.

### 옮겨진 주어에는 이 자산의 축도 구성 상태도 걸리지 않는다

계약의 `drawnBy`도 `config.variants`도 **이 자산**이 무엇을 그리는지를 선언한 것이지 자손의 DOM 사실을 선언한 것이 아니다. 옮겨진 주어에까지 그 이름표를 주면 매니페스트가 계약이 말한 적 없는 사실을 주장하게 되고, 그것이 [#148](https://github.com/flameware/massive-design/issues/148)이 진단한 병 — **DOM 사실이 계약 밖에 사는 것** — 이다.

지금 그런 사슬은 `Switch` 하나뿐이고 어차피 슬롯 쪽도 미지라 규칙 2로 `unresolved`에 선다. 이 선이 실제로 걸리는 것은 [#155](https://github.com/flameware/massive-design/issues/155)가 `Thumb`을 파트로 등록하는 세대이고, **그때 다시 판정된다** — thumb의 `data-state`가 컴포넌트의 구성 상태와 같은 것인지는 그 세대가 계약에 적을 일이지 지금 조립이 추측할 일이 아니다.

## 기각한 것

**아는 항만 적용하기.** X가 처음 물은 것이 이것이다 — 복합의 한쪽만 정책에 있을 때 아는 쪽만 쓰면 4 keys가 전부 닫힌다. `Switch`가 그 값어치를 부순다: 매니페스트가 루트의 위치를 바꾼다고 말하고, 그 거짓말을 볼 게이트가 없다. 규칙 2는 티켓의 완료 조건보다 신호를 택한 것이다.

**`ignore:`가 섞이면 전체를 `unresolved`로 올리기.** 안전해 보이지만 반대로 신호를 망친다 — `focus-visible:…`은 **영영** Figma에 없고 그것은 나머지 항을 몰라도 참이다. ①에 붓는 것은 "아직 못 다뤘다"를 다시 잡동사니로 만드는 일이다.

**표를 복합 키로 늘리기.** 위의 조합 폭발. [#178](https://github.com/flameware/massive-design/issues/178)이 같은 이유로 형태 나열을 기각했다.

**`sidebar`의 `left`/`right` 값을 여기서 고치기.** 사슬이 풀리자 값이 `calc(var(--sidebar-width) * -1)`로 드러났고, `classifyValue`는 `var()`가 `calc()` 안에 있으면 못 보고 **`literal`로 통과시킨다.** 이것은 [#140](https://github.com/flameware/massive-design/issues/140)이 *"수식자가 아니라 `resolveVarChain`의 문제"*로 Out of scope에 둔 자리이고, 고치면 같은 모양의 자리 15개(대부분 `--tw-*` 내부 변수)를 함께 재판정하게 된다. 여기서는 **드러내고 세어서 넘긴다.**
