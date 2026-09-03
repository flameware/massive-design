# 용어

massive-design의 어휘. 다른 말로 부르지 말 것.

## 토큰 계층

- **primitive** — 값을 직접 갖는 토큰. 컬러 램프 12단계와 비색상 스케일. 소비처에 노출되지 않는다(Tailwind `@theme`에 등록하지 않는다).
- **semantic** — primitive를 참조하는, 용도로 이름 붙인 토큰. 현재 목록과 총계의 정본은 `packages/tokens/tokens/semantic/color.json`이며 `tokens:lint`가 상한을 감시한다. 라이트/다크 모드 전환은 **오직 이 계층에서만** 일어난다.
- **component** — semantic만 참조하는 계층. **규칙만 존재하고 토큰은 0개다.**
- **alias** — shadcn이 정한 이름을 우리 semantic에 이어 붙인 호환 레이어. 우리가 발명한 어휘가 아니므로 어휘 상한 계산에 넣지 않는다. 상한 밖인 근거는 정확히는 "**소비처가 이미 아는 이름, 그리고 그와 같은 모양으로 파생된 이름**"이다 — `success`·`link`처럼 정본에 없는 항목도 여기 산다. 컴포넌트 색은 원칙적으로 alias를 통해 소비한다. 단, `state.layer`는 완성된 색 유틸리티가 아니라 상태 합성 전용 입력이므로 `packages/ui/src/state.css`가 `--ds-state-layer`를 직접 읽는 **명시적 예외**다.
- **계열** — 토큰 이름의 `--ds-<bg|fg|border>-` 앞자리. 색 **패밀리**(brand/neutral/…)와 다른 축이다 — 패밀리는 어느 램프에서 왔는지를, 계열은 어느 자리에 쓰이는지를 말한다. **값이 아니라 역할을 가른다** — 두 계열이 같은 primitive를 가리키는 것은 정상이며(`border.strong`과 `bg.neutral.solid`는 둘 다 neutral 9다), 그때도 소비는 값이 아니라 역할을 따른다. 이것이 매니페스트 lint 규칙 3의 전제다: 시각적으로 같아 보이는 것이 곧 옳은 소비가 되지 않는다.
- **컨트롤 어포던스(control affordance)** — 채움 자체가 조작 가능한 대상을 나타내는 자리. Scroll Area의 thumb, Switch의 off 트랙이 여기다. 사용자가 잡는 것이므로 앉는 면에 대해 **비텍스트 대비 3:1**(WCAG 1.4.11)을 만족해야 하고, 그래서 solid 계열 중립 배경(`bg.neutral.solid`, alias `neutral-solid` — [ADR-0003](docs/adr/0003-neutral-solid-alias-name.md))을 집는다. `tokens:contrast`의 비텍스트 게이트가 이 쌍을 5면 × 2모드로 잰다.
- **잔여 트랙(track remainder)** — 값이 아직 닿지 않은 바닥. Progress·Slider의 트랙이 여기다. 의미는 채워진 부분이 나르므로 대비 요구가 없고 바닥으로 남는다 — 컨트롤 어포던스와 요구가 정반대라 같은 토큰을 쓰지 않는다. 두 자리가 **한 이름**(`bg.neutral.soft`, alias `secondary`)을 집는다.

## 램프

- **램프(ramp)** — 한 패밀리의 12단계 색 배열. 패밀리·모드마다 한 벌(`brand/light`, `brand/dark`, …).
- **키 컬러(key color)** — 램프를 생성하는 입력 색. **step 9에 앉는다** — light/dark가 동일한 유일한 단계이기 때문.
- **패밀리(family)** — brand / neutral / danger / success. warning·info는 아직 없다.
- **cusp** — 주어진 hue에서 sRGB 안에 담기는 chroma가 최대가 되는 밝기. 램프의 채도 상한을 정한다.
- **override** — 생성된 램프를 손으로 덮는 것. ①패밀리 파라미터(구현됨) / ②단계별 L·C·H(자리만 있고 미검증).

## 상태 표현

- **Figma 컴포넌트 자산** — 정적 화면 조립에 쓰이는 공개 재사용 자산. 여러 variant를 가진 component set뿐 아니라 variant가 하나인 단일 component도 포함하며, 상태 견본·데모 프레임과 구분한다.
- **구성 상태(configuration state)** — 정적 화면을 조립할 때 선택해야 하는 의미 상태. `checked / unchecked / indeterminate`, 행의 `selected`, Select·메뉴의 `open / closed`가 여기에 속한다. 코드에서는 네이티브·Radix 상태이고 Figma에서는 component property 또는 별도의 공개 조립 표면으로 표현한다. hover·pressed·focus·disabled 같은 상호작용 상태와 구분하며, 새 토큰 계층을 만들지 않는다.
- **그리는 자리(drawnBy)** — 한 구성 상태를 **무엇이 그리는가**를 계약이 함께 선언한 것. 세 갈래다: 우리 클래스가 그리고 조립이 셀의 `configurations`에 담으면 DOM 속성과 값 대응(`data-state`의 `on` ↔ `pressed`)이고, 그리지 않으면 이유 문자열이며 — 표면의 존재·부재, 내용, 또는 그리는 파트가 아직 계약에 없다는 사실 — **그리는데 파생 채널이 나르지 않기로 판정됐으면** `{ modifiers, carriedBy: "none" }`이다([ADR-0009](docs/adr/0009-drawn-but-not-carried.md)). 셋째만 주장이 검사된다: `carriedBy: "none"`은 정책표가 그 수식자를 `ignore:`로 판정했다는 뜻이고 게이트가 `policyFor`로 되묻는다 — 이유를 계약에 복사하지 않으므로 정책이 뒤집히면 게이트가 깨진다. **이름표는 계약이 진다**: DOM 속성 이름은 선언 이름과 거의 언제나 다르고([ADR-0008](docs/adr/0008-axis-and-value-name-spaces.md)이 선언 이름을 DOM에 맞추는 쪽을 막는다), 중앙 대응표를 두면 51개 컴포넌트의 DOM 사실이 계약 밖에 쌓여 새 컴포넌트의 누락을 아무 게이트도 못 본다. 게이트가 지키는 것은 **선언한 수식자가 실제로 우리 클래스에 붙어 있는가**까지이고 이유 문자열이 참인지는 사람이 진다([#148](https://github.com/flameware/massive-design/issues/148)).
- **state layer** — 상태별 완성 색 토큰을 두는 대신, 기본 색 위에 반투명 층을 `color-mix`로 얹어 hover·pressed·disabled를 만드는 방식. `state.layer`는 semantic 계층에 있는 **상태 합성 전용 입력**이며 alias 소비 규칙의 유일한 예외다. Figma에는 `color-mix`가 없어 코드와 같은 oklab 합성 결과를 빌드가 미리 계산한 hex로 상태 견본에 넣는다. 이 hex는 파생값이지 새 토큰이 아니다.
- **상태 견본(state sample)** — 상태를 Figma에 보여주는 단위. **컴포넌트 세트의 축이 아니다** — 축으로 두면 조합 수에 곱해지고, 정적 시안을 조립하는 데는 쓰이지 않는다. 컴포넌트마다 한 장씩 매니페스트에서 생성되는 프레임이다.
- **열림 계기(open cause)** — 표면을 여는 상호작용. press(클릭·탭), hover(포인터 머무름), context(우클릭·롱프레스)로 가른다. 구성 상태가 아니라 **동작**이므로 파생 채널이 나르지 않는다 — `cva` 축에도 `configurationStates`에도 두지 않으며, 코드에서는 기본값이 정해진 선택적 prop(`openOn`)으로만 존재하고, 계약에서는 `behaviors`가 **동작**으로 담는다 — 우리가 만든 계기든 upstream이 갖고 온 것이든(터치 롱프레스, hover 지연) 같은 자리에 앉는다. hover·pressed 같은 상호작용 상태가 "지금 어떤 상태인가"라면 열림 계기는 "무엇이 열었는가"이고, 둘을 같은 말로 부르면 상태 견본이 그려야 할 것과 그리지 말아야 할 것이 섞인다.

## 출력과 주입

- **주입(injection)** — 빌드가 낸 JS를 MCP `use_figma`로 실행해 Figma에 Variables·Style·Component를 만드는 것. 파일을 밀어 넣는 push가 아니라 **에이전트가 수행하는 절차**다.
- **카탈로그 배치(catalog layout)** — `Components` page에서 최상위 **Figma 컴포넌트 자산**의 순서와 좌표를 결정하는 파생 배치. 매니페스트 registry 순서의 단일 세로 열이며 컴포넌트 내부 variant 배열과 구분한다. 이 page는 정식 자산 전용이고 실험물은 별도 page에 둔다.
- **매니페스트(manifest)** — `@massive/ui`가 내는, 컴포넌트 구조를 기계가 읽을 형태로 담은 생성물. 출처는 `cva` 정의이지 스토리 파일이 아니다. 담는 단위는 축이 아니라 **조합**이며(그 밖에 모든 조합의 기저인 `base` 블록이 하나 있다), 어휘는 **코드 쪽**(`border-radius`·`--radius-md`)이다 — Figma 어휘로의 번역은 매니페스트 밖에 있다(아래 **번역표**).
- **base 계층(base layer)** — `dist/tokens.css`가 내는 `@layer base`의 두 규칙(`*`·`body`). 변수가 아니라 **규칙**이라 "shadcn 34개를 전부 낸다"는 점검이 못 잡았고, 그게 [#36](https://github.com/flameware/massive-design/issues/36)의 결함이었다. 매니페스트에서는 **셀 밖의 `base` 블록**으로 나온다 — 클래스가 아니라 규칙에서 오므로 조합 안에 없고, 조립할 때 모든 조합에 **앞서** 적용된다.
- **조합(combination)** — `variant × size`의 한 칸. 매니페스트의 기본 단위이자 Figma variant의 단위. 축별 값은 `tailwind-merge`가 정리하기 전의 값이라 최종 값과 다를 수 있으므로 어휘에 넣지 않는다.
- **축(axis)** — 한 조합을 고르기 위해 선택해야 하는 차원. `cva`의 `variants` 한 항목이고, 매니페스트의 `axes`를 거쳐 Figma variant property가 된다. **이름 공간이 두 층이고 서로 비대칭이다**: **축 이름의 이름 공간은 카탈로그 전체**라 한 이름이 두 뜻을 갖지 않지만(`align`이 버려진 근거), **값 이름의 이름 공간은 축**이라 축이 다르면 값 이름은 다시 시작한다(`chart.indicator`의 `line`과 `tabs.indicator`의 `line`은 충돌이 아니다). 값 이름은 **축이 이름 붙인 것의 상태**를 말하며 클래스 방출 여부를 말하지 않는다 — `frame: none`은 틀이 없다는 뜻이지 클래스가 없다는 뜻이 아니다([ADR-0008](docs/adr/0008-axis-and-value-name-spaces.md)).
- **파트(part)** — 합성 컴포넌트가 공개하는 이름 있는 하위 조립 단위. `TableHead`·`TableCell`처럼 `anatomy`에 등장하며, 매니페스트의 `parts`에서 각자의 축·기본값·조합별 스타일을 갖는다. CSS→Figma 번역의 노드 역할 `root`·`label`·`icon`과는 다른 층이다.
- **구성 상태별 차이(cell configurations)** — 셀의 `properties`가 **쉬는 상태**를 그리고, 계약이 이름표를 준 수식자가 낸 값은 `configurations[구성 상태][값]`에 **차이**로 앉는다. 차이가 없는 값은 `properties`가 그대로 그린다는 뜻이다. 축이 아니므로 조합 수를 곱하지 않는다 — Figma 쪽에서 이 자리는 component property이고 상태 견본이 아니다. 차이가 자손 슬롯에 걸리면 그 안의 `slots.<역할>`에 앉는다 — 구성 상태가 바깥이고 슬롯이 안쪽인 이유는 **한 번의 property 전환이 여러 노드를 함께 바꾸기** 때문이다([ADR-0014](docs/adr/0014-modifier-chains-are-paths.md)).
- **수식자 사슬(modifier chain)** — 한 클래스에 붙은 수식자 여럿(`data-[state=collapsed]:data-[side=left]`). 뜻은 항의 합이 아니라 **경로**다: 항은 그 자리의 **주어**에 걸리고, 주어를 옮기는 것은 슬롯 지목뿐이라 **순서가 뜻을 바꾸는 것은 오직 주어 이동을 통해서다**(`[&_svg]:disabled`는 svg가, `disabled:[&_svg]`는 이 요소가 disabled일 때다). 그래서 정책표는 항 하나의 뜻만 갖고 합성은 조립이 한다 — 표를 복합 키로 늘리면 조합만큼 커진다. 합성의 우선순위는 **떨어뜨리는 항 → 모르는 항 → 앉는 자리**이고, 모르는 항이 하나라도 있으면 전체가 `unresolved`다: 아는 쪽만 적용하면 반쪽만 그린 채 통과한다([ADR-0014](docs/adr/0014-modifier-chains-are-paths.md)).
- **3단(token / literal / unresolved)** — 매니페스트가 값을 적는 세 등급. `token`은 `--ds-*` 또는 Figma에 실재하는 스케일 변수까지 내려간 것, `literal`은 대응 변수가 없어 계산값으로 남은 것(실패가 아니다), `unresolved`는 아직 못 다룬 것. Figma에 대응물이 없는 축은 무시 화이트리스트로 걸러 `unresolved`에 섞이지 않게 한다.
- **셀에서 안 보이는 네 등급** — 3단이 값의 등급이라면 이것은 **선언이 셀에 나타나지 않는 이유**의 등급이고 넷이며 서로 겹치지 않는다: `unresolved`("아직 못 다뤘다", 셀에 뜬다) · `ignore:`("영영 거기 없다") · **외부 소유 표면**("우리 것이 아니다") · **다른 자리(elsewhere)**("여기가 아니라 저기다"). 한 등급이 남의 몫까지 삼키면 `unresolved`가 무엇을 가리키는지 알 수 없게 되고 다음 세대가 진짜 공백을 발견하지 못하므로, 이 넷을 가르는 것이 [#140](https://github.com/flameware/massive-design/issues/140)의 일이다. ②와 ④를 가르는 것은 **그려지는가**이고, ③과 ④를 가르는 것은 **소유자냐 자리냐**다([ADR-0012](docs/adr/0012-drawn-elsewhere.md)).
- **다른 자리(elsewhere)** — 우리 클래스가 **그리기는 하는데** 그것이 개별 컴포넌트 자산이 아니라 그 자산을 **조립한 그룹**에 그려지는 선언. 붙은 Toggle Group·Input OTP의 바깥 모서리, Button Group이 자식에게 얹는 겹친 테두리가 여기다. `ignore:`("영영 거기 없다")를 쓰면 거짓이 되고 남은 `ignore:` 항목 전부의 신뢰가 깎이므로 `MODIFIER_POLICY`가 `elsewhere:`로 판정한다 — **이유가 저기가 *어디인지*를 지목해야 한다**는 것이 이 등급의 규약이다. 외부 소유 표면과 갈리는 자리는 소유자가 아니라 **그려지는 자리**이고, 축과 갈리는 자리는 고르는 주체다 — 항목은 자기가 첫째인지 모르고 조립이 정하므로 축으로 열지 않는다. 매니페스트에는 문서 단위 `elsewhere`로 나가되 `externalSurfaces`와 달리 **파생값이다**: 이유의 정본은 정책표이고 자리(`declaredOn`)는 조립이 실측하므로 손으로 적을 것이 없다. 값은 담지 않는다 — 이 필드는 조립된 그룹의 명세가 아니라 *"이 자산의 셀에서 찾지 마라"*는 부인이다([ADR-0012](docs/adr/0012-drawn-elsewhere.md)).
- **외부 소유 표면(external surface)** — 서드파티 라이브러리가 DOM과 스타일을 소유해 **우리 `cva`가 설명하지 못하는** 컴포넌트 표면. 매니페스트는 우리가 낸 클래스만 컴파일해 줍기 때문에 이런 표면은 아예 나타나지 않고, 없는 것은 통과가 아니라 **침묵**이다. 그래서 계약의 `externalSurfaces`에 **항목마다 이유와 함께** 손으로 적고 게이트가 지킨다 — `IGNORED_PROPERTIES`와 같은 모양이며 값이 이유다. 3단의 `unresolved`("아직 못 다뤘다")와 등급이 다르다: 외부 소유는 **영영 우리 것이 아니다**. 경계는 **클래스 소유**로 긋는다 — 우리가 `className`을 주는 노드는 계약이고, 라이브러리가 스스로 만드는 노드는 아니다.
- **번역표(translation table)** — 매니페스트의 코드 어휘를 Figma 어휘로 옮기는 표. **둘이고 사는 곳이 다르다.** ①CSS 속성 → (노드 역할, Figma 속성)은 손으로 적는 규약이라 절차 문서([`figma-components.md`](docs/agents/figma-components.md) §7)가 갖는다 — 오른쪽이 속성이 아니라 **쌍**이다(셀 하나가 Figma에선 노드 여럿). ②CSS 변수 → Figma 변수 경로는 **생성물**이다(`@massive/tokens`의 `dist/figma/var-map.gen.json`) — 빌드가 이미 양쪽 이름을 알고, 문자열 규칙으로 복원되지 않으며(`--ds-fg-on-solid` → `fg/on-solid`), **값을 복사하면 틀리기** 때문이다(`--text-sm--line-height`는 비율 `1.6`, `type/line-height/sm`은 px `22.4`). ②의 칸은 변수만이 아니다 — 그림자는 Figma에서 **Effect Style**이라 컬렉션이 없고, 그래서 칸마다 `kind`가 붙는다.
- **생성물(generated artifact)** — 원본에서 파생돼 **커밋되는** 파일. `.gen.json` 접미사나 `dist/` 위치로 표시한다. 손편집 금지이고 `verify`가 감시한다.

## 동작

- **동작(behavior)** — 파생 채널이 나르지 않고 **사람만 판정하는** 상호작용. dismiss 제스처·컨트롤 제스처·열림 계기·우발 변경 넷이 여기 속한다. 파생 채널이 나르는 것은 anatomy와 구성 상태뿐이라 동작은 매니페스트에도 상태 견본에도 자리가 없고, 생성된 Storybook 스토리는 `axes ∪ configurationStates`에서만 나오므로 axe도 동작을 한 번도 렌더하지 않는다 — **자동 검증이 0인 것이 이 낱말의 정의다.** 계약은 넷을 두 필드에 나눠 담는데 가르는 것은 **계약이 지는 무게**다: `gestures`는 dismiss 제스처만 담고 접근성 동등 경로를 **요건으로** 지며(표면이 사라지고 되돌릴 수단이 없다), `behaviors`는 나머지 종류를 담고 존재만 선언한다. 어느 쪽이든 확인은 사람이 하고 그 항목은 `bun run sync:checklist`가 찍는다([ADR-0010](docs/adr/0010-behaviors-are-declared-and-human-verified.md)).
- **dismiss 제스처(dismiss gesture)** — 포인터 이동만으로 표면을 닫는 상호작용. 표면이 사라지고 되돌릴 수단이 없으므로 **접근성 동등 경로가 필수 요건**이다. 계약이 지는 것은 존재·시각 피드백·동등 경로 셋이며, 방향이나 임계값 같은 물리 파라미터는 계약하지 않는다.
- **컨트롤 제스처(control gesture)** — 드래그가 컨트롤의 기능 그 자체인 상호작용. Slider의 값 변경, Scroll Area의 thumb, Carousel의 슬라이드 이동이 여기다. 값만 바뀌고 표면은 남으므로 각 컴포넌트가 자기 축으로 소유하며, dismiss 제스처의 계약을 물려받지 않는다 — 그러나 **밖에 있다는 것이 어디에도 없다는 뜻은 아니라서** `behaviors`가 존재를 담는다. 둘을 같은 말로 부르면 이미 해결된 것과 안 된 것이 섞인다.
- **우발 변경(implicit change)** — 사용자가 아무것도 활성화하지 않았는데 값이나 위치가 바뀌는 상호작용. 계기가 초점의 도착이거나(Tabs의 `activationMode="automatic"`, Radio Group의 화살표 체크, Carousel의 `watchFocus`), **닫힌** 컨트롤에 타이핑이거나(Select 트리거의 typeahead), 그냥 시간이다(Toast의 자동 닫힘). 앞의 두 종류와 갈리는 것은 **확인하는 방법**이다 — 끌어 보는 것도 계기를 주고 표면을 기다리는 것도 아니라 손이 하는 일이 없어서, 확인 절차가 스스로 그것을 하러 가지 않는다. 그래서 가장 늦게 발견된다([ADR-0015](docs/adr/0015-behaviors-boundary-is-the-cause.md)).
- **상속 표면(inherited surface)** — upstream 라이브러리가 기본값으로 갖고 와서, 우리가 끄지 않는 한 **우리 이름으로 출하되는** 동작이나 표면. 외부 소유 표면과 방향이 반대다 — 그쪽은 영영 우리 것이 아닌 노드이고, 이쪽은 우리 것으로 나가는데 계약이 모르는 것이다. 계약이 침묵하면 없는 것이 아니라 **새는 것**이라, 끄거나 선언하거나 둘 중 하나다. 상속 여부는 계약에서 `origin`이 지며, 그것이 확인표를 가른다 — 상속이면 사람이 upstream 기본값이 그대로인지까지 보고, 우리 값이면 의도대로인지만 본다.

## 포인터 기하

- **포인터 대상(pointer target)** — 포인터 한 번의 누름으로 활성화되거나 끌리는 **최소 단위 노드**. Button·`MenuItem`·`TabsTrigger`처럼 공개된 것도, Slider의 thumb·Resizable의 handle처럼 공개되지 않은 내부 노드도 같은 자격으로 여기 속한다 — 가르는 것은 공개 여부가 아니라 **포인터가 그것을 겨냥하는가**이다. **컨트롤 어포던스와 다른 집합이다**: 그쪽은 *채움 자체가 조작 가능함을 나타내는 자리*라 대비를 지고, 이쪽은 *겨냥의 단위*라 크기를 진다 — Button은 포인터 대상이지만 컨트롤 어포던스가 아니고, Switch의 off 트랙은 둘 다이다. 두 낱말을 겹쳐 쓰면 [#109](https://github.com/flameware/massive-design/issues/109)의 대비 판정이 크기 판정에 오염된다. 이름에 입력 방식을 넣지 않는 것은 의도다 — 규칙이 coarse 포인터에만 걸리는지가 이름이 아니라 결정으로 정해져야 하기 때문이다.
- **히트 영역(hit area)** — 포인터 대상이 **누름을 받는 면**. 그것이 **그려지는 면**(시각 치수)과 같지 않을 수 있고, 둘을 가르는 것이 크기 규칙이 발행된 시안을 움직이지 않고도 성립하는 근거다. 시각 치수는 `size` 축이 정하고 파생 채널이 나르지만, 히트 영역은 축이 아니다 — 조합으로 갈리지 않고 값이 연속이며, 무엇보다 **소비처의 이웃 간격이 함께 정하는 것**이라 계약 혼자 확정할 수 없다.

## 런타임

Figma 파일을 고치는 주체가 둘이고, **로드할 수 있는 폰트가 서로 다르다.** 이 축이 없으면 폰트 규약을 적을 말이 없다.

- **저작 런타임(authoring runtime)** — `use_figma`가 도는 Figma 클라우드 런타임. 로드 가능한 폰트가 Figma 클라우드 폰트 세트뿐이라 Pretendard가 없다. 에이전트의 주입은 전부 여기서 일어난다.
- **셰이핑 런타임(shaping runtime)** — Pretendard가 설치된 사람의 Figma 데스크톱 클라이언트. 한글 셰이핑과 `fontFamily` 변수 바인딩이 성립하는 유일한 런타임이다.
- **구워진 셰이핑(baked shaping)** — 텍스트 노드가 저작 시점 런타임에서 얻은 셰이핑이 파일에 남아 복제와 열람을 따라 이동하는 성질. 보는 런타임은 결과를 바꾸지 못하므로 **어느 런타임이 만들었는지**가 렌더 결과를 정한다. 폰트가 없는 런타임에서도 남의 셰이핑을 물려받은 노드는 정상 렌더되고, 폰트가 있는 런타임에서도 셰이핑 없이 만들어진 노드는 비어 보인다.
- **폰트 미완 상태(font-pending)** — 텍스트 노드가 `type/family/sans` 바인딩을 갖지 않은 상태. 저작 런타임이 남길 수 있는 유일한 상태이며 결함이 아니라 **정상 중간 상태**다. 셰이핑 런타임의 사람 단계가 해소한다. `fontName`이 무엇인지와 무관하게 바인딩 유무만으로 판정한다 — 두 축을 섞으면 폰트 이름만 맞고 토큰을 따르지 않는 상태를 놓친다.

## 세대와 검증

- **Repo verification** — 구현 정본에서 토큰·매니페스트·Storybook 생성물을 만들고 코드 검사·테스트·Storybook build·axe·사람 시각 확인까지 통과시켜 `CODE_VERIFIED`와 `STORYBOOK_VERIFIED`를 획득하는 독립 작업. 여기서 완료되며 Figma Sync를 자동으로 이어서 수행하지 않는다.
- **Figma Sync** — 사용자가 명시적으로 요청해 시작하고, 선택한 Repo verification 세대를 Figma 문서에 주입·검증한 뒤 라이브러리 발행과 재확인까지 수행하는 독립 작업. 실행 전용 GitHub issue가 범위와 증거를 소유한다.
- **디자인 의도(design intent)** — 컴포넌트가 사용자에게 보여야 하고 동작해야 하는 프로젝트 소유자가 승인한 목표. 자동 정합성 검증 뒤의 시각 판단으로 확정하며, 현재 코드 렌더링과 다르면 구현 정본을 고치는 판정 기준이다.
- **구현 정본(implementation source of truth)** — 디자인 의도를 구현하고 Storybook과 Figma 파생 채널로 변경을 전파하는 단일 출발점인 코드. 현재 렌더링을 무조건 올바른 디자인 의도로 간주한다는 뜻은 아니다.
- **세대(generation)** — 한 컴포넌트의 Figma 대응 구조 해시와 그 구조가 참조하는 토큰 산출물 해시의 쌍. 디자인 시스템 전체 세대는 검증 대상 컴포넌트 세대의 집계다.
- **같은 세대(same generation)** — 코드, Storybook, Figma 문서, 발행된 Figma 라이브러리가 대상 컴포넌트별로 같은 세대를 가리키는 상태. 어느 한 채널만 앞선 정상적인 중간 상태와 구분한다.
- **누적 검증 상태(cumulative verification state)** — `CODE_VERIFIED` → `STORYBOOK_VERIFIED` → `FIGMA_DOCUMENT_SYNCED` → `FIGMA_LIBRARY_CURRENT` 순서로 증거가 쌓이는 상태. 마지막 상태까지 충족해야 같은 세대 검증 완료다.
- **검증 결과(verification result)** — 각 누적 검증 상태의 증거를 `PASS`·`FAIL`·`PENDING_HUMAN`·`UNKNOWN` 중 하나로 표현한 값. 사람 작업 대기, 확인된 위반, 없거나 낡은 증거를 서로 구분한다.

## 참조 화면

Storybook이 내는 화면의 낱말을 적을 말. 두 페이지의 독자가 다르고, 그래서 같은 것을 부르는 층이 다르다([ADR-0021](docs/adr/0021-reference-screen-words-are-two-layers.md)).

- **참조 화면(reference screen)** — Storybook의 `Components` 페이지가 컴포넌트마다 내는 한 장. 독자는 **소비처 개발자**이고, 그가 내리는 결정은 "이 자리에 이것을 쓸까"다. `System` 페이지 셋은 독자가 유지보수자라 같은 화면이 아니다.
- **실재 문자열(real string)** — 코드·매니페스트·검증 기록·Figma에 그 철자로 실재해서 번역하면 찾을 수 없게 되는 문구. anatomy 이름·축 이름과 값·`CODE_VERIFIED`·파일 경로·해시·명령·스토리 ID가 여기 속한다. **스토리 `title`이 여기 앉는 것이 놀라운 자리다** — 화면에는 라벨로 보이지만 스토리 ID가 그것에서 파생되고 그 ID가 검증 기록에 박혀 있다.
- **화면 이름(screen name)** — 실재하지 않고 화면에서만 태어난 이름. 한국어로 옮기는 것은 이쪽뿐이며, **글로서리에 이미 이름이 있는 것을 화면에서만 다르게 부르지 않는다.**
- **경계(boundary)** — 계약의 `limits`가 지는 것. *언제 쓰지 않는가*와 *그럼 대신 무엇을*이며 대안 지목이 요건이다. 판정 기록과 구분한다 — 가르는 것은 독자가 아니라 **문장이 무엇에 답하는가**이고, "이 자리에 쓸까?"에 답하면 경계다([ADR-0022](docs/adr/0022-guidance-is-for-the-consumer.md)).
- **소비처 근거(consumer evidence)** — 계약의 `evidence`가 지는 것. 소비처의 어떤 필요가 이 컴포넌트를 열게 했는가. 유지보수자의 정보라 참조 화면에서 주인공이 아니다. 화면이 이것을 `Invest Diary evidence`로 부르던 것이 화면 이름 규칙의 위반이었다.
- **판정 기록(rationale)** — *왜 이렇게 만들었는가*에 답하는 글. 계약 밖에 살고, 기본 자리는 판정이 걸린 **그 선언 옆 소스 주석**이며 ADR이 있으면 계약에는 포인터 한 줄만 남는다. 계약 안에 두면 경계와 섞여 소비처가 읽을 것을 덮는다.

## 경계

- **소비처(consumer)** — 이 디자인 시스템을 가져다 쓰는 앱. 현재는 invest diary 하나이고 **리포 밖**이다. `packages/ui`는 소비처가 아니라 시스템의 일부다.
- **primitive 기반(primitive base)** — 우리가 접근성 동작·키보드 계약·포커스 관리를 맡기는 서드파티 primitive 라이브러리. **하나여야 한다** — 둘이면 그 계약들이 컴포넌트마다 갈리고, 그 갈라짐은 판단을 거쳐 일어나지 않고 사고로 일어난다. 현재는 `radix-ui`이며 24개 컴포넌트가 여기 기댄다([ADR-0016](docs/adr/0016-primitive-base-stays-radix.md)). 다른 기반을 들이는 것은 의존성 하나를 더하는 일이 아니라 그 ADR의 재판정을 여는 일이다.
- **바닥값(floor cost)** — 소비처가 `@massive/ui`에서 컴포넌트를 **하나도 쓰지 않을 때** 무는 바이트. 서드파티 의존성의 무게를 재는 단위이며, 라이브러리가 아니라 우리 패키지의 성질이다 — 같은 `recharts`가 쓰는 표면에 따라 8,371 B이기도 407,702 B이기도 해서 **라이브러리에 붙일 하나의 수는 존재하지 않는다.** 설치 수와도 거의 무관하다: 딸린 것이 0개인 의존성이 오염의 원인이고 37개인 의존성이 0바이트를 얹는다. 바닥값을 올리는 것은 의존성 선택이 아니라 **패키징**이라(`sideEffects` 미선언) 처방도 그쪽이다 — 걷어내기가 아니라 선언과 진입점. 소비처가 스스로 import해서 무는 것은 정의상 여기 들어오지 않는다([ADR-0017](docs/adr/0017-dependency-weight-is-a-floor-cost.md)).

- **미계약 표면(uncontracted surface)** — upstream에는 있고 우리 계약에는 없는 표면. 두 등급이 있고 성격이 다르다: `limits`가 **닫는다고 적어 둔** 것은 판단을 거친 자리이고, `limits`가 **언급한 적조차 없는** 것은 고려된 적 없는 자리다. 후자가 한 겹 더 깊다 — 앞은 근거를 재검토하는 일이고 뒤는 **근거가 있었는지부터** 확인하는 일이다. 여는 근거는 두 관문으로 판정한다: 파생 채널이 구분하는가, 그리고 소비처가 스스로 하면 우리 스타일 결정을 복제하게 되는가. **열지 않기로 한 것도 `limits`에 남긴다** — 기록이 없으면 다음 재조회가 같은 자리를 다시 발견한다. 외부 소유 표면·상속 표면과 나란한 세 번째 공백이며, 그 둘과 달리 **언젠가 우리 것이 될 수 있다.**

## 호환성

- **호환성 계약(compatibility contract)** — 코드 소비처의 기존 호출, 매니페스트 계약, 발행된 Figma 라이브러리의 기존 원격 인스턴스·override·property 값을 함께 보호하는 채널 횡단 계약. 한 채널이라도 깨지면 가장 엄격한 변경 분류를 적용한다.
- **공개 기준선(public baseline)** — 마지막 `FIGMA_LIBRARY_CURRENT` 세대. 외부 호환성은 이 세대를 기준으로 판정하며, 아직 발행되지 않은 문서 변경은 외부 호환성 대상이 아니다.
- **additive 변경** — 공개 기준선의 기본값·조합·호출·Figma 인스턴스를 재해석하지 않고 선택적 표면을 추가하는 변경. 새 컴포넌트·토큰, 선택적 prop, 기본값이 정해진 새 variant 축·값이 여기에 속한다.
- **in-place safe 변경** — 공개 이름과 의미를 유지하면서 기존 인스턴스의 연결·property·override·토큰 바인딩·접근성·상호작용 계약이 실증적으로 보존되는 제자리 변경. 구조 해시나 토큰 값의 변화만으로 breaking이 되지는 않는다.
- **breaking 변경** — 호환성 계약의 어느 한 채널이라도 깨거나 보존 여부를 입증하지 못한 변경. 공개 이름의 변경·제거와 semantic 역할·모드 의미·값 타입 변경이 여기에 속한다.
- **폐기(deprecation)** — 공개 항목의 제거를 예고하면서 이전 이름과 대체 항목을 함께 제공하는 additive 호환 세대. 기본 경로이지만, 모든 소비처를 식별하고 원자적 전환·검증·rollback이 가능한 별도 migration effort에서는 이 세대를 생략할 수 있다.
