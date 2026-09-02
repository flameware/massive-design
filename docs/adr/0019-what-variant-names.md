# `variant`가 이름하는 것 — 루트의 표면이고, 컴포넌트는 해당하는 차원만 채운다

[#162](https://github.com/flameware/massive-design/issues/162) §6.2가 `Badge`의 `variant`를 **근거 없는 어긋남**으로 잡았다. 우리 넷은 `neutral`·`accent`·`success`·`danger`로 전부 soft 채움의 색인데 upstream 여섯에는 `outline`·`ghost`·`link`가 섞여 있다 — 색이 아니라 **채움의 종류**다. `badge.tsx`의 `limits`는 한 줄뿐이었고 **우리가 다른 값 집합을 골랐다는 사실 자체를 계약이 몰랐다.**

[#173](https://github.com/flameware/massive-design/issues/173)이 판정하며 전제 두 개가 무너졌다.

**첫째, 티켓이 인용한 근거가 그 말을 하지 않는다.** 티켓은 *"한 축에 성질이 다른 값을 섞는 것은 [ADR-0008](0008-axis-and-value-name-spaces.md) 규칙 3에 걸린다"* 고 적었다. 규칙 3의 실제 내용은 **기본값 이름 짓기**다 — *"기본값의 이름을 '클래스를 안 내니까 `none`'으로 고르지 않는다. 그 축이 이름 붙인 것이 기본 상태에서 무엇인지를 보고 고른다."* 값의 **동질성**을 요구하는 규칙은 우리에게 없었다.

**둘째, 우리 카탈로그에 살아 있는 반례가 있다.** `Button`의 `variant`는 `default`·`destructive`·`outline`·`secondary`·`ghost`·`link`다 — 의미(`destructive`)와 채움 종류(`outline`·`ghost`·`link`)와 강조(`secondary`)가 **한 축에 섞여 발행돼 있다.** 금지된다고 말한 그 모양이 이미 우리 것이다.

전수로 재면 `variant`는 카탈로그 전역에서 한 뜻이 아니었다.

| 무엇을 채웠나 | 컴포넌트 |
|---|---|
| **의미** | `badge`(`neutral`·`accent`·`success`·`danger`) · `alert`·`toast`(`default`·`success`·`warning`·`destructive`) |
| **강조** | `empty`·`toggle`·`toggle-group`(`default`·`outline`) · `item`(`default`·`outline`·`muted`) |
| **의미 + 강조** | `button` |
| **형태** | `sidebar`(`sidebar`·`floating`·`inset`) |

## 결정

### 1. `variant`는 **루트 자신이 어떤 표면으로 서는가**를 이름한다

파트가 아니라 **루트**의 축이다 — 그것이 이 이름을 카탈로그 전역에서 한 뜻으로 묶는 것이고, [#145](https://github.com/flameware/massive-design/issues/145)가 `ItemMedia`의 축을 `frame`으로 돌린 것도 그래서다(파트가 `variant`를 쓰면 한 파일에서 한 단계 떨어진 두 축이 같은 이름으로 다른 뜻이 된다).

관찰되는 차원은 셋이다 — **의미**(이 표면이 무엇을 뜻하는가) · **강조**(얼마나 세게 서는가) · **형태**(어떤 모양으로 서는가).

### 2. 컴포넌트는 **자기에게 해당하는 차원만** 채우고, 그것은 어긋남이 아니다

`Badge`가 의미만 채운 것은 `alert`·`toast`와 같고, `Item`이 강조만 채운 것은 `empty`·`toggle`과 같다. **차원을 덜 채웠다는 이유로 어긋남이라 부르지 않는다** — 그러면 위 표의 열 컴포넌트 중 아홉이 어긋남이 된다.

그리고 **한 축에 두 차원이 함께 오는 것도 금지하지 않는다.** `Button`이 그렇게 발행돼 있고, 여섯 값을 강조 사다리로 읽으면(`default` → `secondary` → `outline` → `ghost` → `link`) 한 축에서 일관된다. 금지하는 규칙을 지금 만들면 `Button`이 그 자리에서 위반이 되고, 되돌리는 비용이 실체 없는 순수성에 쓰인다.

### 3. 차원을 **더하는** 데는 실측 수요가 필요하다

그러므로 `Badge`에 `outline`·`ghost`·`link`를 더하지 않는 근거는 *"성질이 다른 값이라서"* 가 아니라 **실측 수요가 없어서**다([#123](https://github.com/flameware/massive-design/issues/123), [#118](https://github.com/flameware/massive-design/issues/118) 규칙 2 — *upstream이 앞장선다는 것은 그 자체로 근거가 아니다*). [#174](https://github.com/flameware/massive-design/issues/174)가 `Item`의 `size: xs`를 닫은 것과 같은 모양이고, 같은 이유로 **조건부 닫기**다.

수요가 확인되면 **같은 축에 오는가 두 번째 축으로 오는가는 그때 정한다.** 지금 미리 정하지 않는 것은 두 길 다 선례가 있기 때문이다 — `Button`은 같은 축에 담았고, `Toggle Group`의 `spacing`·`Tabs`의 `indicator`는 별도 축으로 열렸다. 정하는 기준은 **파생 채널이 두 차원을 곱해야 하는가**다: 곱해야 하면 별도 축이고(셀이 곱만큼 늘어난다), 실제로는 하나만 고르는 것이면 같은 축이다.

## 고려한 대안

- **`Button`을 위반으로 보고 고친다** — 값 여섯이 전부 발행돼 있고 소비처가 `variant`로 고르고 있다. 되돌리는 것은 발행된 인스턴스의 재해석이며, 얻는 것은 규칙의 순수성뿐이다.
- **`Badge`의 축 이름을 바꾼다**(예: `tone`) — 어긋남이 있다는 전제 위에 선 안이다. 전제가 틀렸고, 바꾸면 의미만 채운 `alert`·`toast`도 함께 바꿔야 하며 그러면 `variant`가 남는 곳은 강조를 채운 넷뿐이 된다.
- **`Badge`의 `limits`에만 문장을 남긴다** — 가장 싸다. 그러나 이 정의는 Badge 하나가 아니라 **열 컴포넌트**에 걸리고, `variant`를 여는 다음 컴포넌트마다 같은 질문이 온다. Badge를 볼 때만 보이는 규칙은 [#162](https://github.com/flameware/massive-design/issues/162)가 잡아낸 병 그대로다.
- **[ADR-0008](0008-axis-and-value-name-spaces.md)을 개정해 절을 더한다** — 저쪽은 *이름 공간*의 문서(축 이름은 전역, 값 이름은 축 지역)이고 이것은 *한 축의 뜻*이라 층이 다르다. [ADR-0018](0018-anatomy-is-the-consumer-assembly.md)을 [ADR-0006](0006-uncontracted-surfaces.md)에 끼워 넣지 않은 것과 같은 판단이다.

## 파급

**`sidebar`가 유일하게 형태를 채운다.** `sidebar`·`floating`·`inset`은 의미도 강조도 아니다. 결정 2가 *"해당하는 차원만 채운다"* 이므로 이것도 어긋남이 아니지만, **차원이 셋이라는 사실이 이 한 컴포넌트에만 걸려 있다**는 것은 기록해 둘 만하다. 형태 차원을 쓰는 컴포넌트가 하나 더 생기면 그때 이 정의를 다시 본다. 이 자리는 [#162](https://github.com/flameware/massive-design/issues/162)의 기계적 집합 차집합에서 나오지 않았고(upstream도 같다 — **카탈로그 내부**의 관찰이다) [#165](https://github.com/flameware/massive-design/issues/165)의 안개가 가리킨다.

**게이트는 두지 않는다.** 어떤 차원을 채웠는지는 의미 판정이라 기계가 못 한다 — [ADR-0008](0008-axis-and-value-name-spaces.md)이 같은 자리에서 같은 결론을 냈고, [ADR-0006](0006-uncontracted-surfaces.md)의 *"지킬 수 없는 것을 지킨다고 적지 않는다"* 가 그대로 적용된다.

**`limits`의 공백 대장 성격이 또 한 겹 두꺼워진다.** [ADR-0006](0006-uncontracted-surfaces.md)이 그 성격을 갈랐고 [ADR-0018](0018-anatomy-is-the-consumer-assembly.md)이 일곱 계약에 문장을 더했으며, 여기서 `badge`가 자기 조건부 닫기를 진다. 근거가 이 ADR에 있으므로 문장은 짧다.
