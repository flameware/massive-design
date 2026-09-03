# 포인터 대상의 크기는 히트 영역이 지고, 시각 치수는 움직이지 않는다

터치 화면이 1급 대상이라면([#97](https://github.com/flameware/massive-design/issues/97)) 최소 대상 크기 규칙이 있어야 하는데, 카탈로그는 **한 번도 기준을 세운 적이 없다**. 코드에 `touch`·`coarse`가 걸리는 자리는 전부 제스처 쪽이고(Popover의 `pointerType` 가드, Slider·ScrollArea의 `touch-none`), 최소 히트 영역 규칙도 `pointer: coarse` 분기도 `min-h`/`min-w` 하한도 없다. 없는 것을 처음 세우는 결정이라 [#111](https://github.com/flameware/massive-design/issues/111)이 map으로 나간다.

지금 값은 이렇다. Button 기본값 `h-9`(36px)·`sm` `h-8`(32px), icon `size-9`/`size-8`, Checkbox·Radio `size-4`(16px), Switch `h-5 w-9`(20×36)·`sm` `h-4 w-7`(16×28). `size` 축을 가진 컴포넌트는 16개다.

## 결정

### 1. 하한은 WCAG 2.5.8 (AA) 24×24 CSS px이고, 2.5.5 (AAA) 44는 소비처 권고다

AAA 44를 계약이 지면 **통과하는 것이 하나도 없다** — Button 기본값 36px조차 떨어지므로 이것은 규칙을 세우는 일이 아니라 카탈로그를 다시 그리는 일이다. AA 24를 지면 Button 계열은 통과하고 Checkbox·Radio·Switch가 남는다.

2.5.8의 **spacing 예외**(24px 지름 원이 서로 겹치지 않으면 통과)에는 기대지 않는다. 그 조건은 **소비처의 레이아웃이 만드는 것**이라 라이브러리가 주장할 수 없고, 예외를 못 쓰면 하한은 대상 자체가 채워야 한다. 44를 계약이 아니라 권고로 두는 것도 같은 이유다 — 24는 게이트가 잴 수 있고 44는 소비처 레이아웃 없이 잴 수 없다([ADR-0006](0006-uncontracted-surfaces.md): 게이트가 못 보는 것을 게이트가 주장하지 않는다).

### 2. 규칙은 발행된 시각 치수를 움직이지 않는다

`size` 축의 기본값은 그대로 두고 **히트 영역만** 넓힌다. [#139](https://github.com/flameware/massive-design/issues/139)의 규칙 — *새 축의 기본값은 발행된 인스턴스를 보존하는 값* — 을 축이 아니라 하한에 적용한 것이고, 이것이 있어야 Figma 43개 세트가 무사하고 밀도 높은 `ListRow`·`Table`이 살아남는다. 시각을 올리는 안은 24를 "덧붙이기"가 아니라 "재해석"으로 만든다.

이 결정이 **포인터 대상**과 **히트 영역**을 갈라 세운 근거다(`CONTEXT.md`). 그리는 면과 누름을 받는 면이 다를 수 있다는 것이 규칙이 성립하는 자리 전체다.

### 3. 모든 포인터에 무조건 걸리고, `pointer: coarse` 분기를 두지 않는다

셋이 같은 곳을 가리킨다. `pointer: coarse`는 하이브리드 기기·터치 노트북·정밀 터치패드에서 틀리게 답하고, WCAG 2.5.8은 애초에 입력 방식을 조건으로 걸지 않는다. 그리고 **파생 채널이 두 갈래 중 어느 쪽도 나르지 않아 구분이 불가능하다** — [#97](https://github.com/flameware/massive-design/issues/97)의 규칙(파생 채널이 구분 못 하는 항목은 제 자리를 갖지 않는다)을 축이 아니라 **분기**에 적용한다. 결정 2가 시각을 얼렸으므로 무조건으로 걸어도 데스크톱이 잃는 것이 없다.

### 4. 기제는 `after:` 투명 의사 요소이고, 외부 소유 표면에는 비켜선다

레이아웃 상자를 건드리지 않는 유일한 길이며 **선례가 이미 있다** — `resizable.tsx`가 1px 하이라인 위에 `after:`로 히트 영역을 얹고, `classify.mjs`의 정책표가 `["after", "ignore:포인터 히트 영역 — 투명한 의사 요소라 Figma에 그릴 것이 없다(#124)"]`로 등급까지 갖고 있다.

라이브러리가 자기 히트 영역을 파라미터로 갖는 자리(`react-resizable-panels`의 `hitAreaMargins`)에는 우리 규칙이 들어가지 않는다 — [#122](https://github.com/flameware/massive-design/issues/122)의 외부 소유 표면 규칙 그대로다.

### 5. 겹침은 해결이 아니라 선언이다

히트 영역을 시각 상자 밖으로 넓히면 촘촘한 목록에서 이웃과 겹치고, 겹친 자리를 누르면 의도하지 않은 대상이 활성화된다. 크기 미달보다 나쁜 결함일 수 있다. 그런데 **우리는 이것을 풀 수 없다** — 히트 영역은 정의상 소비처의 이웃 간격이 함께 정하는 것이다.

그러므로 확장은 시각 상자의 **중심 대칭**으로만 하고, 초과분을 문서가 명시하며, 겹침 판정은 그 값을 근거로 소비처가 한다. [ADR-0010](0010-behaviors-are-declared-and-human-verified.md)과 같은 모양이다 — 파생 채널이 못 나르는 것은 선언하고 사람이 판정한다.

**선언은 계약의 새 필드가 아니라 계산으로 얻는다.** 히트 영역은 축이 아니다 — 조합으로 갈리지 않고 값이 연속이라 셀에 담기지 않는다. 실측 게이트가 재는 값이 곧 그 선언이고, `schemaVersion`은 오르지 않으며 51개 계약을 만지지 않는다.

### 6. 정책표 등급은 유지하고, 실측 게이트를 따로 만든다

`after`는 `ignore:`로 둔다 — Figma에 그릴 것이 없다는 판단은 옳다. 그러나 그 등급의 뜻은 **어떤 게이트도 24px 하한을 보지 않는다**는 것이고, 규칙만 세우고 검사를 안 만들면 [#109](https://github.com/flameware/massive-design/issues/109)가 당한 그대로가 된다 — 세 게이트가 나란히 침묵했고 1.09:1이 통과했다.

정책표는 *"Figma가 그리는가"* 에 답하는 도구이지 *"규칙이 지켜지는가"* 에 답하는 도구가 아니다. **두 질문을 한 도구에 맡긴 것이 #109의 실패였다.** 그래서 새 게이트는 렌더 뒤 실효 히트 영역을 재는 별도 도구이고, 하한 미달과 미신고 겹침을 문다.

### 7. 모집단은 눈으로 읽지 않는다 — 이름은 코드가, 치수는 계산된 스타일이 준다

두 단계다. **식별자**는 상호작용 노드(Trigger·Item·Thumb·Handle…)의 코드 스캔에서, **치수**는 Storybook 렌더 뒤 실측에서 얻는다. `h-9`을 눈으로 36px이라 읽는 것이 바로 [#165](https://github.com/flameware/massive-design/issues/165)가 금지한 "눈으로 읽은 모집단"이다.

**매니페스트 `anatomy`+`parts`는 도구로 쓰지 않는다.** `parts`가 아직 10개 계약에 없어([#155](https://github.com/flameware/massive-design/issues/155)) 구멍이 있는 계기이고, 그것이 [#162](https://github.com/flameware/massive-design/issues/162)가 당한 실패 모양 그대로다. 그리고 [#176](https://github.com/flameware/massive-design/issues/176)의 순서를 따른다 — **계기를 먼저 돌려 검사한 뒤에 읽는다.**

### 8. 호환성은 `breaking`이고, 첫 npm 발행 전이므로 지금 실행한다

픽셀은 그대로인데 **누르면 다른 것이 눌릴 수 있다** — 소비처의 기존 촘촘한 레이아웃에서 어느 요소가 클릭을 받는지가 바뀐다. 시각이 안 움직인다는 이유로 `in-place safe`라 적으면, 발행 이후에 같은 모양의 변경이 소리 없이 나간다.

[ADR-0018](0018-anatomy-is-the-consumer-assembly.md)의 따름정리에 따라 `breaking`은 패키지가 비공개·미발행·미소비인 동안 그냥 실행할 수 있고, 그 경로를 닫는 것은 날짜가 아니라 **첫 npm 발행이라는 사건**이다. 지금 비용은 0이다.

## 고려한 대안

- **AAA 44를 계약이 진다** — 통과하는 컴포넌트가 0이라 규칙이 아니라 재설계다. 발행된 43개 Figma 세트가 전부 재해석된다.
- **`size` 축의 기본값을 올린다** — 가장 곧은 길이지만 밀도 높은 데스크톱 화면을 잃고, [#139](https://github.com/flameware/massive-design/issues/139)의 인스턴스 보존 규칙과 정면으로 부딪힌다.
- **`pointer: coarse`에서만 건다** — 확인이 두 배가 되는데 파생 채널이 두 갈래를 구분하지 못해 어느 쪽을 봤는지 기록에 남지 않는다.
- **초과분을 계약의 새 필드로 선언한다** — 소비처가 채널로 받는 이점이 있으나 `schemaVersion`이 오르고 51개 계약을 만진다. 축이 아닌 연속값을 셀에 담는 일이라 조합으로 갈리지도 않는다.
- **`after`의 정책표 등급을 바꿔 기존 게이트가 보게 한다** — Figma 채널 판단이 옳은데 그것을 틀리게 만들어 다른 질문에 답하게 하는 일이다. #109의 실패를 반복한다.
- **게이트를 첫 세대부터 CI로 건다** — 계기를 믿을 수 있는지 알기 전에 기준선을 커밋하면 게이트가 스스로 침묵을 제조한다([ADR-0017](0017-dependency-weight-is-a-floor-cost.md)이 floor-cost 게이트를 미룬 것과 같은 이유).

## 파급

**`overflow-hidden` 조상이 히트 영역을 잘라낸다.** `accordion`·`collapsible`·`avatar`·`carousel`·`item`·`progress`·`scroll-area`·`sidebar`·`slider` 아홉이 그 유틸리티를 갖고 있고, 여기에 `slider`의 thumb와 `scroll-area`의 thumb가 들어 있다 — **규칙이 가장 필요한 자리가 곧 가장 안 되는 자리다.** `::after`를 이미 쓰는 `resizable`·`sidebar`도 한 노드에 의사 요소가 하나뿐이라 같은 벽에 걸린다. 이 자리들은 **이 map이 뚫지 않는다**: 구조를 바꿔야 하고 그러면 결정 2와 부딪히며, 다른 계기가 필요한 모집단을 한 map에 섞는 것이 [#121](https://github.com/flameware/massive-design/issues/121)이 틀린 지점이다. 이름과 이유가 적힌 **예외 목록**으로 남고, 정확한 수는 결정 7의 계기가 준다.

> **정정 (2026-09-04, [#231](https://github.com/flameware/massive-design/issues/231), 근거 [#228](https://github.com/flameware/massive-design/issues/228) 실측 — [`pointer-targets-2026-09.md`](../research/pointer-targets-2026-09.md)).** 위 문단은 실측 전 파일 grep 추정이었고 세 곳이 틀렸다. ① `slider`의 thumb는 `overflow-hidden`인 Track의 **형제**(Root의 직계 자식)이며 잘리지 않는다 — Track 자신은 별도 이유(WCAG 2.5.8 Equivalent 예외, 조건부)로 예외 목록에 있다. ② 실제로 `overflow` 조상에 잘리는 자리는 **Scroll Area의 thumb·scrollbar 둘뿐**이다 — 나머지 여섯 파일의 `overflow-hidden`은 대상 노드를 자르지 않는다. ③ `resizable`이 걸리는 벽은 `::after` 점유 충돌이 아니다 — 그 컴포넌트의 `after:w-1`은 이미 히트 영역 확장 그 자체로 쓰이고 있어 경합이 없다. 진짜 벽은 **외부 소유**(`hitAreaMargins`, [#122](https://github.com/flameware/massive-design/issues/122))다. 결론("이 자리들은 이 map이 뚫지 않는다")은 정정 뒤에도 바뀌지 않는다. 확정된 예외 목록은 [`pointer-target-exceptions-2026-09.md`](../research/pointer-target-exceptions-2026-09.md)에 있다.

**검증 규약에 예외가 하나 열린다.** `docs/agents/design-system-sync.md`는 *"확인 범위를 좁히지 않는다: 선언한 자리를 매 세대 전부 찍는다"* 를 원칙으로 갖는데, 뷰포트 확인은 **포인터 대상을 건드린 세대에만** 들어온다. 51개 컴포넌트에 영구적인 반복 비용을 붙이지 않기 위한 판단이고, **원칙에 대한 명시적 예외라는 사실이 규약에 적혀야 한다** — 적지 않으면 다음 세대가 원칙을 어기는 것으로 읽는다.

**[#97](https://github.com/flameware/massive-design/issues/97)이 미뤄 둔 항목이 이제 판정이 된다.** *"기준이 없는 상태의 뷰포트 확인은 판정이 아니라 인상만 남긴다"* 는 이유로 보류됐던 자리에 결정 1이 기준을 놓는다.
