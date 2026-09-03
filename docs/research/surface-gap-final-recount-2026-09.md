# 맵 #165를 닫는 재측정 — SHA를 고정하고 공백을 측정으로 말한다

- 티켓: [#177](https://github.com/flameware/massive-design/issues/177) (맵 [#165](https://github.com/flameware/massive-design/issues/165)의 마지막 하위 항목)
- **측정일: 2026-09-03**
- 절차: [`docs/agents/upstream-surface-recount.md`](../agents/upstream-surface-recount.md) ([#176](https://github.com/flameware/massive-design/issues/176)) — **그대로 실행했고 한 자리를 고쳤다**(§6)
- 이전 기준선: [#162](https://github.com/flameware/massive-design/issues/162) / `docs/research/surface-gap-recheck-2026-09.md` (브랜치 `research/surface-gap-recheck-2026-09`, 조사일 2026-09-01)
- **이 문서가 다음 기준선이다.** 다음 재조회는 §2의 SHA 둘에서 `git log` 한 번으로 diff를 낸다.

**이 문서는 결정하지 않는다.** [ADR-0006](../adr/0006-uncontracted-surfaces.md)의 관문 ⓐ·ⓑ로 각 항목을 가르고 근거를 적을 뿐이며, 계약·코드·Storybook은 한 줄도 움직이지 않았다(§8). 여는 것은 새 티켓이 진다.

---

## 0. 한 줄 결론

**공백은 0이 아니다. 여섯 항목이 남았고, 그중 넷은 오늘 아무도 소유하지 않는다.**

맵 [#165](https://github.com/flameware/massive-design/issues/165)의 destination — *"#162가 찾은 종류 ② 22표면과 근거 없는 어긋남 2건을 가른다"* — 은 **그 로스터에 대해서는 도달했다**(§5가 열한 판정을 기계로 확인했다: 계약에 적힌 셀이 매니페스트에 닿지 않은 자리가 **하나도 없다**). 그러나 **도달 선언을 "표면 공백 0"으로 넓히면 거짓이다.**

남은 여섯:

| # | 항목 | 성격 | 소유자 |
|---|---|---|---|
| 1 | `DropdownMenuItem`의 `variant: default\|destructive` | **종류 ② — 미기록** | 없음 |
| 2 | `SelectTrigger`의 `size: sm\|default` | **종류 ② — 미기록** | 없음 |
| 3 | `SidebarMenuSubButton`의 `size: sm\|md` | **종류 ② — 미기록** | 없음 |
| 4 | 우리 `CalendarDay` ↔ upstream `CalendarDayButton` | **이름 어긋남 — 미기록** | 없음 |
| 5 | `ToastContent` | 종류 ② — **판정 보류** | [#152](https://github.com/flameware/massive-design/issues/152) (맵이 이미 선언) |
| 6 | `ToastPortal` | 종류 ② — **판정 보류** | [#152](https://github.com/flameware/massive-design/issues/152) (맵이 이미 선언) |

**1·2·3은 이번 세대에 처음 보인 것이고, 보이게 만든 것은 [#176](https://github.com/flameware/massive-design/issues/176)이 런북에 더한 `PROP` 추출이다.** 셋 다 upstream이 `cva`가 아니라 **문자열 리터럴 유니온 prop + `data-*`** 로 내는 축이라, `cva`만 보던 [#162](https://github.com/flameware/massive-design/issues/162)의 모집단에 들어간 적이 없다. #176이 *"고치지 않았으면 #177의 '공백 0'이 근거 없는 선언이 됐다"* 고 적은 것은 **예측이 아니라 사실이었다** — 고치지 않았으면 이 문서는 오늘 0을 적었을 것이다.

그리고 이것이 맵 #165가 열한 티켓 동안 여덟 번 반복한 것과 같은 모양이다: **기록이 사실과 어긋난 자리는 항상 "다 봤다"고 믿은 자리에 있었다.**

---

## 1. 실행한 절차

런북 §1 → §2.0 → §2.1 → §2.2 → §2.3 → §2.4 → §3.1 → §3.2 → §3.3 → §3.4 → §4를 순서대로 돌렸다. 명령은 런북에 있는 것을 그대로 썼고, 바꾼 것은 §6에 적은 한 자리뿐이다.

```sh
bun install                         # 644 packages
git status --porcelain              # 비어 있음 — 매니페스트가 계약과 일치(런북 §1의 전제)
ls packages/ui/dist/manifest/*.gen.json | wc -l   # 52 (51 계약 + index.gen.json)
```

작업 디렉터리는 리포 밖에 잡았다(런북 §1).

---

## 2. 고정한 SHA — **대조 대상은 움직이지 않았다**

```sh
gh api repos/shadcn-ui/ui/commits/main --jq '.sha[0:12]'
gh api "repos/shadcn-ui/ui/commits?path=apps/v4/registry/bases/base/ui&sha=$UPSTREAM_SHA&per_page=8" \
  --jq '.[] | "\(.sha[0:12])\t\(.commit.committer.date)\t\(.commit.message | split("\n")[0])"'
```

| | 저장소 head | `apps/v4/registry/bases/base/ui` 마지막 변경 |
|---|---|---|
| #162 기준선 (2026-09-01) | `63c1308d112b` | `503a3a57aec9` |
| #176 실측 (2026-09-02) | `b2a1ec864a87` | `503a3a57aec9` |
| **이 문서 (2026-09-03)** | **`71e50952fbb7`** | **`503a3a57aec9`** |

`503a3a57aec9`는 2026-08-31T09:43:41Z, *fix(react): hide MessageScroller until the opening position applies (#11720)* 이고 우리 카탈로그 밖이다. 그 앞은 `9846e22ce52c`(2026-08-06)로 한 달 가까이 떨어져 있다.

**head는 사흘에 두 번 움직였지만 레지스트리 디렉터리는 한 번도 움직이지 않았다.** 런북 §2.0이 둘을 따로 재게 한 이유가 이것이고, 오늘 실측으로 다시 확인됐다 — 둘을 하나로 적었으면 오늘 재조회가 "upstream이 움직였다"로 시작했을 것이다.

**따라서 §0의 여섯은 전부 우리 쪽 기록의 공백이다.** upstream이 그 사이 새 표면을 낸 것이 아니다. 그리고 다음 재조회가 `503a3a57aec9` 이후의 diff에서 새 표면을 찾으면, **그것은 이 맵의 미도달이 아니라 그 재조회의 일이다** — 이 맵이 잰 upstream은 여기 고정된 이 디렉터리 SHA이고, 그 뒤의 변화는 이 맵이 존재하지 않던 시점의 것이기 때문이다. 경계는 **디렉터리 SHA**이지 head도 날짜도 아니다.

---

## 3. 양쪽 식별자 집합의 규모

| | 값 | (2026-09-02, #176) |
|---|---|---|
| upstream 레지스트리 `.tsx` 파일 | **62** | 62 |
| upstream `EXPORT` 행(대문자 식별자) | **354** | — |
| upstream `AXIS` + `PROP` 행 | **49** | — |
| 우리 계약 | **51** | 51 |
| 우리 `publicExports`(대문자) | **269** | 269 |
| 우리 매니페스트 축 행(루트 + 파트) | **64** | 64 |
| **§3.1 식별자 차집합 (수정된 필터)** | **37** | 40 (필터 결함, §6) |
| §3.2 우리 slug에 걸리는 upstream 축 행 | **36** | — |

**네 수(62·269·64·그리고 필터 전 40)가 #176의 값과 글자 하나 다르지 않다.** 런북은 쓴 사람이 아닌 실행에서 재현되었다.

37은 **모집단이지 공백이 아니다.** ⓐ·ⓑ는 §4 뒤에 온다.

---

## 4. 차집합을 판정한다

### 4.1 식별자 37 — `limits` 조인 (런북 §3.3)

37 중 **22개는 자기 계약의 `limits`가 이름을 축자로 적고 있다**(기계 조인). 나머지 15개를 한 건씩 읽었다 — 런북이 경고한 대로 `limits`는 산문이라 표면을 이름 없이 가리킨다.

| 항목 | 결과 |
|---|---|
| `combobox`의 열 식별자 (`ComboboxList`·`Item`·`Group`·`Empty`·`Input`·`Label`·`Collection`·`Chip`·`Chips`·`ChipsInput`) | **기록됨.** 앞 일곱은 *"목록 안쪽의 나머지 표면과 같이 소비처가 `@massive/ui`에서 `Command*`를 직접 import해 조립한다"*(#91의 소비 규칙), 뒤 셋은 *"다중 선택과 값 생성(새 항목 추가)은 계약하지 않는다"* — 칩은 그 다중 선택의 표면이다 |
| `CommandDialog` | **기록됨** — *"팝오버·모달 안에 넣는 것과 닫기 … 소비처가 조립한다"* |
| `Toaster` | **기록됨** — *"전역 toast 큐와 명령형 호출 API는 소비처가 소유한다"*. upstream의 `Toaster`는 정확히 그 배선(`toastManager` + `ToastList` + Provider/Portal/Viewport 조립)이다. **런북 §3.3이 "이름 없이 가리키는 산문"의 예로 든 바로 그 문장이 실제로 이 자리를 덮었다** |
| **`CalendarDayButton`** | **미기록 — §0의 4번** |
| **`ToastContent`·`ToastPortal`** | **미기록 — §0의 5·6번**(맵이 판정 보류로 이미 선언) |

### 4.2 축 36 — 양쪽을 붙여 읽기 (런북 §3.2)

36행 중 33행은 일치·상위집합이거나 `limits`·ADR이 이미 진 자리다.

- **일치/상위집합**: `button` size·variant, `avatar` size, `button-group` orientation, `carousel` orientation, `chart` indicator, `field` orientation, `sheet` side, `sidebar` side·variant·`SidebarMenuButton.size`, `switch` size, `toggle` size·variant, `toggle-group` orientation, `native-select` size(우리가 `lg` 하나 더 넓다), `alert` variant(우리가 둘 더 넓다), `item` variant
- **ADR-0008의 이름 갈림 넷** — 전부 가짜 공백이다: `inputGroupAddonVariants.align` → 우리 `InputGroupAddon.placement`, `emptyMediaVariants.variant` → `EmptyMedia.frame`, `tabsListVariants.variant` → `TabsList.indicator`, `field` PROP `variant` → `FieldLegend.rank`
- **`limits`가 이미 닫은 자리**: `card` size, `alert-dialog` size, `inputGroupButtonVariants.size`, `input-group`의 `block-start`·`block-end`, `item` size의 `xs`([#174](https://github.com/flameware/massive-design/issues/174)), `badge` variant 값 집합([#173](https://github.com/flameware/massive-design/issues/173), [ADR-0019](../adr/0019-what-variant-names.md)), `sidebar` collapsible의 `none`, `SidebarMenuButton`의 `outline`
- **잡음**: `input-group` PROP `type: button|submit|reset`(HTML 속성), `sidebar` PROP `state: expanded|collapsed`(우리 구성 상태). 런북 §2.2가 *"걸러내지 않는다 — 좁히는 일은 사람이 한다"* 고 한 자리다

**남은 셋이 §0의 1·2·3이다.** `limits` 51개 전문에 `destructive`라는 낱말이 **0회**, `SubButton`이 **0회** 나온다 — 이름 없이 가리키는 산문도 없다.

### 4.3 항목별 판정

#### 1. `DropdownMenuItem`의 `variant: default | destructive` — **여는 쪽이 유력하나 이름 결정이 선행한다. 티켓.**

upstream `dropdown-menu.tsx`가 `variant?: "default" | "destructive"`를 `data-variant`로 내고 `.cn-dropdown-menu-item`이 그 갈래를 선언한다. 우리 `dropdown-menu.tsx`에는 `destructive`라는 문자열이 **하나도 없다**.

- **[ADR-0018](../adr/0018-anatomy-is-the-consumer-assembly.md)**: 노드가 아니라 이미 선 파트의 축이므로 관문을 걸 대상이다. `DropdownMenuItem`은 [#154](https://github.com/flameware/massive-design/issues/154)가 등록한 파트라 축이 앉을 자리가 이미 있다.
- **관문 ⓐ — 통과.** `data-variant` 두 값이 서로 다른 선언을 고른다. 매니페스트에 `DropdownMenuItem.variant` 축과 셀 하나가 늘고 Figma가 두 상태를 그린다. [#146](https://github.com/flameware/massive-design/issues/146)의 `indicator`와 같은 모양이다.
- **관문 ⓑ — 통과.** 소비처가 스스로 하려면 "삭제 항목은 어떤 빨강인가"(글자·호버 면·글리프 색 세 자리)를 `className`으로 다시 정해야 한다. `Button`의 `destructive`를 베끼는 길이 있지만 그건 **다른 노드의 결정을 복제하는 것**이고, 메뉴 항목의 호버 면은 버튼의 채움과 같지 않다.
- **그런데 이름이 걸린다.** [ADR-0019](../adr/0019-what-variant-names.md)는 `variant`를 **루트가 어떤 표면으로 서는가**로 정의했고, `AGENTS.md`가 적은 대로 *파트 층위 축이 `variant`를 **도입**하지 않는다* — `ToggleGroupItem.variant`는 루트 축의 **상속**이라 예외가 아니다. `dropdown-menu`의 루트에는 `variant` 축이 없으므로 상속할 것이 없고, 그대로 열면 **파트가 `variant`를 도입하는 첫 사례**가 된다. 그래서 판정은 *열 것인가*가 아니라 **무엇으로 부를 것인가**이고, 그건 [ADR-0008](../adr/0008-axis-and-value-name-spaces.md)·ADR-0019를 다시 여는 판정이라 이 문서가 혼자 정할 자리가 아니다.
- **티켓이 물을 것**: ① 이 축의 이름(`tone`? `intent`? 아니면 루트에 `variant`를 세우고 상속?) ② 우리가 흡수한 Context Menu(`openOn="context"`)에도 같은 축이 서는가 — upstream은 `context-menu.tsx`에도 같은 prop을 두었고 우리는 그 컴포넌트를 Dropdown Menu의 모드로 흡수했으므로 자동으로 함께 온다 ③ `Menubar`에는 upstream에도 이 축이 없다 — [#119](https://github.com/flameware/massive-design/issues/119)의 비대칭 판정이 다시 걸리는지. **정정([#224](https://github.com/flameware/massive-design/issues/224)): 틀렸다 — upstream `menubar.tsx`의 `MenubarItem`도 같은 `variant` prop을 갖는다(L89–103). #224가 소스로 재확인했다.**

#### 2. `SelectTrigger`의 `size: sm | default` — **여는 쪽이 기본값. 티켓. 셋 중 가장 날카롭다.**

upstream `select.tsx`가 `size?: "sm" | "default"`를 `data-size`로 낸다. 우리 `select.tsx`에는 `size`라는 낱말이 **하나도 없다**.

- **관문 ⓐ — 통과.** 높이 한 단이 `data-size`로 갈리고 선언이 갈린다.
- **관문 ⓑ — 통과, 그리고 [#174](https://github.com/flameware/massive-design/issues/174)가 이미 이 모양을 판정했다.** 소비처가 작은 Select를 원하면 우리 `h-9`와 그에 맞춘 패딩·글자 단을 **덮어써야** 한다. #174가 `Item`의 `size: xs`에서 세운 갈림선이 그대로 선다 — *덮어쓴 값은 매니페스트에 닿지 않아 파생 채널에 없는 크기가 코드에 돌아다닌다.* `Card`·`AlertDialog`의 `size`를 닫은 문장(*"소비처가 유틸리티로 정하면 된다"*)은 **축이 아예 없는** 자리라 성립했는데 — 여기도 축이 없으니 그 선례가 걸리는 것처럼 보인다. **걸리지 않는다**: #174의 진짜 갈림선은 "축이 있는가"가 아니라 **같은 뜻의 축을 카탈로그가 이미 발행했는가**이고, 우리 `NativeSelect`가 `size: sm|default|lg`를 **이미 발행하고 있다**. 형제 컨트롤 둘이 같은 자리에서 하나는 세 단, 하나는 단이 없는 것은 카탈로그 내부의 비대칭이다(`Input`·`Textarea`·`Button`·`Switch`·`Toggle`·`Slider`가 전부 `size`를 갖는다).
- **호환성**: 기본값을 `default`로 두면 오늘 렌더가 한 픽셀도 움직이지 않는다 — 맵 규칙 3의 교과서적 자리이고 `additive`다.
- **선행 조건이 둘 있다.** `select`는 오늘 **`parts`가 0개**라 [#155](https://github.com/flameware/massive-design/issues/155)의 모집단 아홉 중 하나이고, `SelectTrigger`가 파트로 서지 않으면 이 축이 앉을 곳이 없다. 그리고 [#130](https://github.com/flameware/massive-design/issues/130)이 `select`에 `DropdownMenuSeparator`와 같은 계열 위반이 기다린다고 적었다 — `parts`를 세우는 순간 그것이 함께 드러난다([#154](https://github.com/flameware/massive-design/issues/154)의 재현). **그러므로 이 티켓은 #155(또는 그 select 갈래)와 한 세대여야 하고, 혼자 나가면 반쯤 메우게 된다**([#143](https://github.com/flameware/massive-design/issues/143)이 avatar에서 세운 규약).

#### 3. `SidebarMenuSubButton`의 `size: sm | md` — **닫는 쪽이 유력하다. 그러나 기록이 없다. 티켓(기록).**

upstream이 `size?: "sm" | "md"`를 `useRender`의 `state`로 넘겨 `data-size`로 낸다. 우리 `SidebarMenuSubButton`은 `staticPart`로 등록돼 있고 축이 없다.

- **관문 ⓐ — 통과한다.** `data-size`가 선언을 고른다.
- **관문 ⓑ — 약하다.** 갈리는 것이 **글자 한 단**(`text-sm` → `text-xs`)이다. 카탈로그가 "한 단 차이로 표면을 늘리지 않는다"를 세 번 적용했다 — `FieldTitle`([#175](https://github.com/flameware/massive-design/issues/175)), `Card`의 `size`([#121](https://github.com/flameware/massive-design/issues/121)), `Item`의 `size: xs`([#174](https://github.com/flameware/massive-design/issues/174)). 여기도 같은 자리로 보인다.
- **그러나 #174가 세운 단서가 여기에도 걸린다**: `SidebarMenuButton`(형제 파트)이 이미 `size: default|sm|lg`를 발행하고 있으므로, 소비처는 sub 버튼에서만 **덮어써야** 한다. #2와 같은 논리라 ⓑ가 보기보다 세다.
- **값 이름**: upstream의 `md`는 우리 `default`다(값 이름은 축 지역, ADR-0008). 열면 `default|sm`으로 형제와 맞춘다.
- **판정**: 실측 수요가 확인되기 전에는 **닫되, 닫은 근거를 `limits`에 문장으로 남긴다** — #175가 다섯 행에 한 것과 같은 모양이고, *수요가 확인되면 여는 것이 기본값*이라는 조건부 닫기다(#173·#174의 모양). **기록이 없으면 다음 재조회가 같은 자리를 또 발견한다**는 것이 ADR-0006의 원칙이고, 이 항목이 오늘 여기 있는 이유가 정확히 그것이다.

#### 4. `CalendarDay` ↔ `CalendarDayButton` — **공백이 아니다. 미기록 이름 어긋남. 티켓(기록).**

upstream `CalendarDayButton`은 react-day-picker의 `DayButton` 슬롯에 들어가는 날짜 버튼이고, 우리 `CalendarDay`는 **같은 노드**다(`<button>`, `day` 축 여섯 값, 파트로 등록됨). 표면 공백이 아니라 런북 §3.2의 읽는 기준 ③(**이름만 다르다**)이다.

- 기준선의 *"기록되지 않은 어긋남 2건"* 중 하나였던 `NativeSelectOptGroup`↔`NativeSelectGroup`과 **같은 모양**이고, [#173](https://github.com/flameware/massive-design/issues/173)이 그 자리를 *"`*Group`이 카탈로그 전역 규칙이라 유지한다"* 로 기록해 닫았다. 여기도 같다: `CalendarDay`는 `CalendarCell`·`CalendarHeadCell`과 한 이름 계열이고 `Button` 접미사를 붙이면 카탈로그에서 `Button`이 뜻하는 것과 충돌한다.
- **바꾸지 않는다. 문장 하나를 `calendar`의 `limits`에 남기는 것이 남은 선택지다.** 지금 바꾸면 발행된 인스턴스를 깨는 `breaking`이고 얻는 것이 없다.

#### 5·6. `ToastContent`·`ToastPortal` — **판정 보류. 맵이 이미 소유자를 적었다. 새 티켓 없음.**

맵 #165의 「Not yet specified」가 *"Base UI 갈래에만 있는 표면이라 [#152](https://github.com/flameware/massive-design/issues/152)가 정해지기 전에는 판정 자체가 불가능하다"* 고 이미 적었다. 오늘 재측정이 그 둘이 여전히 우리 `publicExports`·`limits` 어디에도 없음을 확인했다 — **선언이 사실과 어긋나지 않았다.** #152는 [ADR-0016](../adr/0016-primitive-base-stays-radix.md)으로 *조건부 stay*가 됐으므로, 네 계기 중 하나가 걸릴 때까지 이 둘은 열리지 않고 그때 티켓 하나로 졸업하거나 `limits` 한 문장으로 끝난다.

---

## 5. 이 맵이 연 표면이 파생 채널에 닿았는가 — **13/13 닿았다**

`publicExports` · `anatomy` · 매니페스트 `parts` · 파트 축을 계약과 매니페스트에서 직접 읽어 대조했다(`bun` 스크립트, 소스 grep 아님).

| 컴포넌트 | 표면 | `publicExports` | `anatomy` | 매니페스트 `parts` | 파트 축 |
|---|---|---|---|---|---|
| progress | `ProgressLabel` | ✅ | ✅ | ✅ | — |
| progress | `ProgressValue` | ✅ | ✅ | ✅ | — |
| progress | `ProgressIndicator` | ❌ **의도** | ✅ | ✅ | — |
| field | `FieldSeparator` | ✅ | ✅ | ✅ | — |
| field | `FieldSeparatorContent` | ❌ **의도** | ✅ | ✅ | — |
| command | `CommandSeparator` | ✅ | ✅ | ✅ | — |
| table | `TableFooter` | ✅ | ✅ | ✅ | — |
| input-group | `InputGroupText` | ✅ | ✅ | ✅ | — |
| input-group | `InputGroupTextarea` | ✅ | ✅ | ✅ | — |
| button-group | `ButtonGroupSeparator` | ✅ | ✅ | ✅ | **`orientation: horizontal,vertical`** |
| popover | `PopoverHeader` | ✅ | ✅ | ✅ | — |
| popover | `PopoverTitle` | ✅ | ✅ | ✅ | — |
| popover | `PopoverDescription` | ✅ | ✅ | ✅ | — |

**계약에 적혔는데 매니페스트에 닿지 않은 셀은 하나도 없다.** [#154](https://github.com/flameware/massive-design/issues/154)가 잡은 침묵(`DropdownMenuSeparator`가 43세대 동안 매니페스트에 없던 것)은 재현되지 않았다.

신설된 `parts` 셋도 확인했다: `progress` 3개, `popover` 3개, `field` 9개.

`ButtonGroupSeparator.orientation`은 루트 축과 파트 축 **양쪽**에 선다([#171](https://github.com/flameware/massive-design/issues/171)이 루트 상속을 거부하고 파트 고유 축으로 세운 결과가 매니페스트에 그대로 나타난다 — 두 축이 같은 이름이지만 기본값이 반대다).

### 5.1 export 없이 `anatomy`·`parts`에만 서는 둘 — 결함이 아니지만 기록해 둔다

`ProgressIndicator`와 `FieldSeparatorContent`는 **의도적으로** export하지 않는다. 각각 `limits`가 근거를 진다:

- `ProgressIndicator` — *"오늘도 그리던 노드에 이름이 붙은 것이라 렌더가 한 픽셀도 움직이지 않는다"*. 루트가 자동으로 그리므로 소비처가 조립할 자리가 아니다.
- `FieldSeparatorContent` — *"`children`으로만 들어오므로 export하지 않는다"*.

ADR-0006의 게이트 규칙은 *"대문자 공개 export는 `anatomy`에 있어야 한다"* 한 방향만 지키므로 둘 다 통과한다. 다만 **`ProgressIndicator`는 [ADR-0018](../adr/0018-anatomy-is-the-consumer-assembly.md)이 정의한 `anatomy`(*소비처가 조립하는 것*)와 문자 그대로는 어긋나 있다** — 자동 렌더되는 노드인데 `anatomy`에 이름이 있다. 이건 맵 #165가 「Not yet specified」에 적어 둔 **`Overlay` 셋과 그 모집단**과 같은 계열이고, 방향만 반대다(Overlay는 자동 렌더 + **공개**, 여기는 자동 렌더 + **비공개**). **그 안개를 걷는 훑기가 실행될 때 모집단에 이 자리도 들어간다** — 규칙 1에 따라 이 문서가 로스터에 손으로 더하지 않고 관찰만 남긴다.

---

## 6. 런북에서 고친 것 — 한 자리, 두 곳

**절차는 재현되었다.** §3의 네 수(62·269·64, 그리고 필터 수정 전 §3.1의 40)가 [#176](https://github.com/flameware/massive-design/issues/176)의 값과 정확히 같고, §2.4의 SIGPIPE 경고와 §1의 서브셸 전제도 그대로 작동했다.

고친 것은 하나다: **§3.1·§3.2의 층위 필터 `grep -Ff "$WORK/ours-slugs.txt"`가 부분 문자열로 맞힌다.**

- **§3.1** — upstream의 `hover-card`가 우리 slug `card`에 걸려 모집단에 들어왔다. Hover Card는 [#118](https://github.com/flameware/massive-design/issues/118)이 Popover의 트리거 모드로 흡수해 **우리에게 계약이 없는** 컴포넌트다. 즉 이 절차가 재지 않기로 한 **컴포넌트 층위**가 표면 층위 모집단에 섞였다. 2026-09-02에 보고된 40 중 셋(`HoverCard`·`HoverCardContent`·`HoverCardTrigger`)이 이것이었고, **오늘 정확한 수는 37이다.**
- **§3.2** — 더 나쁘다. `grep -F`가 줄 전체를 보므로 upstream 전용 컴포넌트 `marker`의 `markerVariants.variant default,separator,border` 줄이 **값** `separator`에 걸려 들어왔다. slug 열이 아니라 값에 걸린 것이라, 우리에게 없는 컴포넌트의 축이 "우리 축과 붙여 읽을 목록"에 앉았다.

**고친 방식**: 두 자리 다 `awk -F'\t' 'NR==FNR{s[$1];next} ($1 in s)'`로 **첫 열 정확 일치** 조인으로 바꾸고, 왜 `grep -Ff`를 쓰지 않는지를 문서에 박았다.

**왜 이것이 사소하지 않은가**: 이 필터의 유일한 임무가 **층위를 가르는 것**인데 그 필터가 층위를 섞었다. 방향이 과다 포함이라 공백을 놓치지는 않지만, 모집단에 가짜 항목을 넣는 것은 [#121](https://github.com/flameware/massive-design/issues/121)이 표의 행을 단위로 삼은 것과 **뜻이 반대이고 병이 같다** — 비교의 단위가 식별자가 아니라 문자열이었다. 그리고 이 절차가 세운 약속(*"모집단은 사람이 만들지 않는다"*)은 기계가 만든 목록이 **옳다**는 전제에 서 있으므로, 기계의 필터가 헐거우면 그 약속이 정확히 그만큼 헐겁다.

**절차를 쓴 사람이 아닌 실행이 한 번 돌아야 런북이 런북이다** — #177이 그것을 확인했고, 확인의 산출이 이 한 줄이다.

---

## 7. [#155](https://github.com/flameware/massive-design/issues/155)의 오늘 수 — **9. 이 맵의 잠식은 0이다.**

티켓 #177의 본문은 *"#155의 모집단이 실제로 셋 줄었는지 확인"* 하라고 적었다. **그 전제는 틀렸고 [#166](https://github.com/flameware/massive-design/issues/166)이 이미 정정했다** — `popover`·`progress`는 #155의 16행 표에 **들어 있던 적이 없고**, `field` 하나만 있었으며 그마저 [#164](https://github.com/flameware/massive-design/issues/164)가 이 맵보다 먼저 메웠다. 맵의 규칙 2도 그래서 정정됐다. 그래서 *"셋 줄었는지"* 를 확인하지 않고 **오늘 수를 직접 셌다.**

#155 표의 16행 중 일곱은 이미 취소선이다(`field`·`empty`·`tabs`·`alert`·`avatar`·`dropdown-menu`·`toggle-group`). 남은 아홉을 매니페스트에서 기계로 확인했다:

| `card` | `accordion` | `dialog` | `sheet` | `toast` | `list-row` | `select` | `collapsible` | `radio-group` |
|---|---|---|---|---|---|---|---|---|
| parts 0 | parts 0 | parts 0 | parts 0 | parts 0 | parts 0 | parts 0 | parts 0 | parts 0 |

**아홉 전부 오늘도 `parts`가 0이다. 오늘 수는 9이고, 이 맵이 그것을 줄이지 않았다** — #166의 정정이 실측으로 확인됐다.

참고로 **`parts`가 0인 계약은 51개 중 22개**다(9가 아니다). 차이는 #155의 표가 *"anatomy 노드 둘 이상 + `cn(...)`을 내는 노드 둘 이상"* 이라는 더 좁은 기준을 썼기 때문이고, **그 기준이 첫 문장의 의도와 어긋난다는 것을 [#195](https://github.com/flameware/massive-design/issues/195)(맵 [#194](https://github.com/flameware/massive-design/issues/194))가 이미 판정 대기로 걸어 #155를 블로킹하고 있다**(의도대로 세면 14).

**그러므로 이 문서는 수를 손으로 고치지 않는다.** 이 맵은 #155의 모집단에 대해 잠식 0이고, 그 모집단의 기준을 다시 긋는 일은 #194의 것이다. 여기 적는 것은 **오늘의 실측 세 수**뿐이다: 표 기준 **9**, `parts` 0 기준 **22**, #195가 의도 기준으로 제시한 **14**.

---

## 8. 코드 변경 0 · 매니페스트 해시 불변

```sh
bun run check   # ✅ tokens/ui/storybook 전부 통과, manifest:verify "커밋된 매니페스트가 소스와 일치한다"
bun run test    # ✅ 105 pass / 0 fail
git status --porcelain   # 이 문서와 런북 수정 외에 비어 있음 — packages/ui/dist/ 변경 0
```

`bun run sync:preflight`는 실행하지 않았고 `verification/repo-verification.json`은 건드리지 않았다(#177의 규약). 이 세대는 **문서만** 움직인다.

---

## 9. 다음 기준선 (런북 §4가 적으라고 한 것)

| 항목 | 값 |
|---|---|
| 측정일 | **2026-09-03** |
| upstream 저장소 head | **`71e50952fbb7`** |
| `apps/v4/registry/bases/base/ui` 마지막 변경 | **`503a3a57aec9`** (2026-08-31T09:43:41Z) |
| upstream 레지스트리 `.tsx` | 62 |
| 우리 계약 | 51 |
| §3.1 식별자 차집합(모집단) | **37** |
| §3.2 우리 slug에 걸리는 upstream 축 행 | 36 |
| **표면 층위 공백: 종류 ②** | **4개 컴포넌트 5표면** (dropdown-menu·select·sidebar의 축 셋, toast의 노드 둘) |
| 기록되지 않은 이름 어긋남 | **1건** (`CalendarDay`↔`CalendarDayButton`) |
| 판정 보류 | **2건** (`ToastContent`·`ToastPortal`, [#152](https://github.com/flameware/massive-design/issues/152)) |
| 소유자 없는 항목 | **4건** (§0의 1·2·3·4) |

---

## 10. 티켓으로 내야 할 것 (이 문서는 티켓을 만들지 않는다)

소유자와 정할 자리다. 넷을 제안한다.

1. **`SelectTrigger`의 `size` 축을 연다** — 셋 중 가장 날카롭고, 관문 ⓐ·ⓑ 둘 다 서며, `NativeSelect`가 이미 `size`를 발행하고 있어 카탈로그 내부 비대칭이다. **[#155](https://github.com/flameware/massive-design/issues/155)의 `select` 갈래·[#130](https://github.com/flameware/massive-design/issues/130)과 한 세대여야 한다** — `select`는 `parts`가 0이라 축이 앉을 자리가 없고, `parts`를 세우면 #130이 예고한 계열 위반이 함께 드러난다. 기본값 `default`로 `additive`.
2. **`DropdownMenuItem`의 `destructive` 축을 판정한다** — 관문은 서지만 **이름이 걸린다**: 루트에 `variant`가 없어 그대로 열면 파트가 `variant`를 도입하는 첫 사례가 되고, 그건 [ADR-0019](../adr/0019-what-variant-names.md)·[ADR-0008](../adr/0008-axis-and-value-name-spaces.md)을 다시 여는 판정이다. **구현 티켓이 아니라 판정 티켓**이며, 흡수한 Context Menu 모드와 Menubar의 비대칭([#119](https://github.com/flameware/massive-design/issues/119))을 함께 묻는다.
3. **`SidebarMenuSubButton`의 `size`를 닫고 `limits`에 남긴다** — 한 단 차이라 ⓑ가 약하고 `FieldTitle`·`Card`·`Item`의 선례가 서지만, **형제 파트가 이미 `size`를 발행한다**는 #174의 단서가 걸리므로 조건부 닫기(*수요가 확인되면 여는 것이 기본값*)로 적는다. [#175](https://github.com/flameware/massive-design/issues/175)의 다섯 행과 같은 모양의 기록 티켓.
4. **`CalendarDay`↔`CalendarDayButton` 이름 어긋남을 `calendar`의 `limits`에 남긴다** — 표면 공백이 아니라 이름 갈림이고 바꾸지 않는다. [#173](https://github.com/flameware/massive-design/issues/173)이 `NativeSelectGroup`에서 한 것과 같은 한 문장이며, 3번과 한 티켓으로 묶어도 된다(둘 다 기록 전용, 코드 변경 0).

`ToastContent`·`ToastPortal`은 **새 티켓을 내지 않는다** — [#152](https://github.com/flameware/massive-design/issues/152)가 소유자이고 맵이 이미 그렇게 적었다.

---

## 11. 한계 — 지킬 수 없는 것을 지킨다고 적지 않는다

런북 §5의 셋이 그대로 선다. 이 문서에 걸리는 형태로 다시 적는다.

1. **이것은 게이트가 아니다.** 남의 리포와 네트워크를 읽어야 하므로 CI가 지킬 수 없고([ADR-0006](../adr/0006-uncontracted-surfaces.md)), 재조회의 **계기**는 여전히 사람이 만든다. 기계가 만드는 것은 모집단뿐이다.
2. **upstream 문서가 여덟 style CSS 갈래 중 무엇을 렌더하는지 확정되지 않았다.** `apps/v4/registry/styles/`에 여덟이 있고 이 문서가 인용한 선언은 전부 `style-lyra.css` 기준이다. §4.3의 판정은 *"결정이 존재하는가"* 를 물었지 *"값이 몇인가"* 를 묻지 않았으므로 갈래가 정해져도 판정은 갈리지 않는다. 갈리는 것은 §10의 티켓이 인용할 **값**이다.
3. **추출은 종류 ②의 하한이지 상한이 아니다.** §2.2는 `cva`와 문자열 리터럴 유니온 prop 둘만 본다. `boolean` prop, `cn()` 인라인 삼항, 스타일 CSS에만 있고 TSX에 이름이 없는 선언은 오늘도 잡히지 않는다. **이 문서가 보장하는 것은 "두 기계 판독 목록의 차집합이 완결이다"이지 "upstream의 모든 결정을 봤다"가 아니다.** 그리고 오늘의 §0 1·2·3이 그 한계가 실재한다는 증거다 — 추출의 단위를 `cva`에서 `PROP`으로 한 걸음 넓혔더니 세 항목이 나왔다. **다음에 단위를 한 걸음 더 넓히면 또 나올 수 있다고 읽는 것이 정직한 독해다.**

이 세 한계 위에서, §0의 문장을 다시 적는다: **재지 않고 0을 선언하지 않았다. 재었고, 0이 아니었다.**
