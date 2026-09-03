# 포인터 대상 첫 실측 — 모집단·히트 영역·계기 검증

- 티켓: [#228](https://github.com/flameware/massive-design/issues/228) (맵 [#111](https://github.com/flameware/massive-design/issues/111)의 첫 티켓)
- **측정일: 2026-09-04**, 저장소 `fcc2cc2` (브랜치 `research/pointer-target-instrument-228`, main `ce82eca` 위)
- 절차: [`docs/agents/pointer-target-measure.md`](../agents/pointer-target-measure.md) — 이 문서를 쓰며 처음 돌렸고, 계기를 세 번 고쳤다(§2)
- 원자료: [`pointer-targets-2026-09.tsv`](pointer-targets-2026-09.tsv) — 렌더된 스캔 대상 행 전부(셀 × 노드)
- **이 문서가 기준선이다.** 다음 실측은 같은 절차를 돌려 이 표와 diff를 낸다.

**이 문서는 결정하지 않는다.** [ADR-0020](../adr/0020-pointer-target-size-is-borne-by-the-hit-area.md)이 하한(24×24)과 기제(`after:`)를 정했고, 여기 있는 것은 **모집단과 값**, 그리고 그것을 낸 **계기가 믿을 만한가**다. 적용은 [#230](https://github.com/flameware/massive-design/issues/230), 예외 목록은 [#231](https://github.com/flameware/massive-design/issues/231), 게이트는 [#232](https://github.com/flameware/massive-design/issues/232)가 진다.

---

## 0. 한 줄 결론

**포인터 대상 slot 68종 중 렌더로 잰 것이 66종, `square24`가 거짓인 slot은 15종 — 계기의 해상도 경계(Input Group 버튼 24×24)와 참조 스토리의 가림(Kbd의 Button) 둘을 빼면 **13종**(라벨·Slider track 제외)이고, 그중 `overflow` 조상에 잘려 `after:` 확장이 닿지 못하는 자리는 둘(Scroll Area의 thumb·scrollbar)뿐이다.** 맵이 "아홉"이라 적은 `overflow-hidden` 자리는 **대상이 그 안에 있는 곳**으로 세면 넷이고, 그중 Slider의 thumb는 잘리지 않는다 — thumb는 `overflow-hidden`인 Track의 **형제**이지 자손이 아니다.

그리고 계기가 먼저 틀렸다. self-test가 없었으면 모든 치수가 +1로 읽혔고([§2.1](#21-self-test--계기가-처음-잡은-것은-계기-자신이었다)), DOM 대조가 없었으면 `Button`과 Dropdown Menu의 항목 넷이 모집단에서 통째로 빠졌다([§2.2](#22-스캔--dom-대조--모집단의-구멍-둘)). [#176](https://github.com/flameware/massive-design/issues/176)의 순서 — 계기를 먼저 검사한 뒤에 읽는다 — 가 이 티켓에서 세 번 값을 했다.

---

## 1. 무엇을 만들었나

| 계기 | 위치 | 하는 일 |
|---|---|---|
| 코드 스캔 | `packages/ui/scripts/pointer-targets/scan.mjs` | `src/components/ui/*.tsx`의 JSX 요소를 `@babel/parser`로 읽어 primitive·native·handler·role·tabindex·composed 규칙으로 후보를 낸다. `parts`·`anatomy`는 읽지 않는다(결정 7) |
| 렌더 실측 | `apps/storybook/scripts/pointer-targets.mjs` | 정적 Storybook의 참조 스토리 **398셀**(축 × 구성 상태 곱 전부)을 Playwright로 열어 `elementFromPoint` 1px 걸음으로 실효 히트 영역·24 정사각형 적합·`overflow` 조상의 여유를 잰다. **self-test를 통과해야 실측에 들어간다** |
| 런북 | `docs/agents/pointer-target-measure.md` | 재현 명령과 읽는 법, 한계 |

`bun run --filter @massive/storybook pointer-targets` / `pointer-targets:self-test`로 돈다. `typescript@7`이 컴파일러 JS API를 싣지 않아 `@babel/parser`가 `@massive/ui`의 devDependency로 들어왔다(이미 `bun.lock`에 있던 것이라 새 다운로드는 없다).

```sh
bun run --filter '@massive/storybook' build-storybook
(cd packages/ui && node scripts/pointer-targets/scan.mjs) > scan.tsv        # 74행 + 머리글
(cd apps/storybook && node scripts/pointer-targets.mjs --out "$WORK")       # 398셀, self-test 9/9 ok
```

`bun run check`는 이 실행 경로에 없다 — 실측 당시 main의 `check`가 [#236](https://github.com/flameware/massive-design/issues/236)으로 빨갰지만 빌드·실측에는 걸리지 않았다(#236은 그 뒤 병합됐다).

---

## 2. 계기 검증 — 읽기 전에 계기를 검사했다

### 2.1 self-test — 계기가 처음 잡은 것은 계기 자신이었다

실측 스크립트는 알려진 기하 아홉 개(16px 상자 · 16px+32px `::after` · 그것이 `overflow:hidden` 20px에 잘림 · 0폭+4px `::after` · 형제가 절반을 덮음 · 60×12 · 0높이 띠+손잡이 자식 · L꼴 · `display:none`)를 인라인 HTML로 만들어 기대값과 대조한다. 첫 실행에서 **여섯이 실패했다** — 전부 +1.

원인은 Chromium이 `elementFromPoint`의 소수 좌표를 **가장 가까운 정수로 반올림**한다는 것이었다. 0.5 걸음으로 걷던 계기는 경계 픽셀을 두 번 셌다. 정수 픽셀로 걷게 고친 뒤 통과했고, 그 결과 **해상도는 ±1px**이다 — 반 픽셀에 앉은 16px Checkbox는 17로 읽힌다(§5 ②). 이 사실을 몰랐으면 아래 표의 모든 값이 1씩 컸고, 23.x인 것이 24로 통과했을 것이다.

두 번째 실패는 계기가 아니라 **fixture**였다 — 가림 사례의 덮개를 대상의 자식으로 놓아 "자손은 가림이 아니다"라는 계기의 정의와 어긋났다. 형제로 옮겼다. 세 번째는 L꼴 — 중심선 둘이 다 24 미만이면 정사각형 탐색을 건너뛰던 지름길이 틀렸고, 지름길을 뺐다.

### 2.2 스캔 ↔ DOM 대조 — 모집단의 구멍 둘

실측은 스캔이 준 slot과 별개로 DOM에서 본성상 상호작용인 노드(`button`·`a[href]`·`[role=…]`·`[tabindex]`…)를 전부 모아 두 집합을 대조한다.

**스캔에 없던 것.** 첫 실행에서 `button`(Button 자신!)과 `breadcrumb-link`가 빠져 있었다 — `const Comp = asChild ? Slot.Root : "button"`을 규칙이 못 따라갔다. 둘째 실행에서 `dropdown-menu-item`·`-checkbox-item`·`-radio-item`·`-sub-trigger` 넷이 빠져 있었다 — `const Item = isContext ? ContextMenuPrimitive.Item : DropdownMenuPrimitive.Item`. 두 번 다 태그가 **변수**인 자리였고, 스캔은 이제 조건식의 문자열 쪽 또는 뒤쪽(기본 모드) 멤버를 따라간다. 규칙을 손으로 넓힌 것이 아니라 **대조가 구멍을 가리켰다** — 그것이 이 절차의 유일한 개선 경로다.

고친 뒤 남은 "DOM에는 있고 스캔에는 없는" 14종은 전부 대상이 아니다: Radix가 `tabindex=-1`을 다는 포커스 범위(`dialog-content`·`alert-dialog-content`·`sheet-content`·`popover-content`·`select-content`·`combobox-content`·`menubar-content`·`dropdown-menu`(Content)·`toast-viewport`), `role`을 가진 루트 컨테이너(`menubar`·`radio-group`·`toggle-group`·`tabs-list`), 그리고 `tabindex=0`인 `tabs-content`. 스캔 규칙에 `tabindex`가 있어도 이들이 안 걸린 것은 tabindex를 **Radix가 런타임에** 달기 때문이다 — 소스에는 없다.

**DOM에 없던 것.** 스캔 slot 68종 중 `menubar-item`·`menubar-sub-trigger` 둘은 어느 셀에서도 렌더되지 않았다. 참조 스토리의 `open` 셀이 여는 메뉴는 checkbox·radio 항목이 든 메뉴이고 "거래 추가" 메뉴는 닫혀 있다. **재지 않은 것이지 통과한 것이 아니다** — Menubar의 항목은 Dropdown Menu 항목과 같은 클래스(`ITEM`)를 쓰므로 값은 같으리라 짐작하지만, 짐작을 표에 적지 않는다.

### 2.3 알려진 사실의 재현

| 알려진 것 | 계기가 읽은 것 | |
|---|---|---|
| `resizable.tsx`의 handle이 `after:w-1`(4px)로 0폭 하이라인 위에 히트 영역을 얹는다 | 가로: visual **1**×90 → hit **5**×92 (`after` 열 `4px×90px`) · 세로: visual 510×**1** → hit 510×13 (`after` `510px×4px`, 13은 가운데 손잡이 자식을 중심선이 읽은 것) | 재현 — 의사 요소가 넓힌 영역을 읽는다 |
| Checkbox·Radio는 `size-4`(16px) | 16×17 / 16×17·17×17 | 재현(±1) |
| Switch `h-5 w-9`·`sm` `h-4 w-7` | 36×21 / 28×17 | 재현(±1) |
| Button 기본 `h-9`(36)·`sm` 32·`xs` 24·icon 36/32/24/40 | 37·33·25·37/33/25/41 | 재현(±1) |
| Scroll Area의 thumb가 `overflow-hidden` 안에 있다 | `clip scroll-area[xy] room 1` | 재현 |
| Slider의 thumb가 `overflow-hidden` 안에 있다(맵 Notes) | `clip -` — **없다.** thumb는 `overflow-hidden`인 Track의 형제다 | **기록이 틀렸다**(§4.2) |

---

## 3. 모집단

스캔 **74행**(같은 노드를 두 모드로 그리는 자리가 있어 slot **68종**). slot이 `-`인 행 넷은 상위 함수가 같은 노드를 slot 붙여 다시 그리는 자리(`Calendar` 안의 `<CalendarNav onClick>`·`<CalendarDay onClick>`·`<CalendarGrid onKeyDown>`, `Toast`의 Root)라 잃는 것이 없다. 규칙별 분포와 컨테이너 제외 둘(`AccordionPrimitive.Item`·`NavigationMenuPrimitive.Item`)은 런북 §2.1에 있다.

실측 **398셀 / 4,348행**(셀 × DOM 노드) 중 렌더돼 값이 나온 행 **1,331**, 그중 스캔 대상 행 **1,181**(원자료 TSV의 행). 스캔 slot 중 렌더된 것 **66종**.

셀에서 잴 수 없었던 자리와 이유 — 전부 다른 셀에서는 잰 것이다:

| 자리 | 이유 |
|---|---|
| Dialog·Alert Dialog·Sheet·Dropdown Menu·Select·Combobox의 trigger, `open` 셀 | Radix가 모달 밖 `body`에 `pointer-events:none`을 건다 — 닫힌 셀에서 잰다 |
| Button Group·Input Group·Native Select의 `disabled` 셀, Calendar의 선택 불가 날짜, Command의 disabled 항목 | `pointer-events:none` — 비활성 컨트롤은 대상이 아니다 |
| Sidebar `offcanvas`+`collapsed` 셀 | 화면 밖(`w-0`) |
| `switch-thumb` | `pointer-events:none` — Switch의 대상은 Root다 |

---

## 4. 값

### 4.1 24×24 미달 — 라벨·트랙 제외 13종

`square24`가 거짓인 스캔 대상. 값은 `hit W×H`(중심선 실효 구간, ±1) 옆에 `visual W×H`(`getBoundingClientRect`). 셀마다 값이 다르면 전부 적었다 — 그것이 초과분 결정의 입력이다.

| 컴포넌트 | slot | 셀 | hit | visual | 잘림 | 갈래 |
|---|---|---|---|---|---|---|
| Checkbox | `checkbox` | — | 16×17 | 16×16 | 없음 | ① 확장 |
| Radio Group | `radio-group-item` | — | 16×17 | 16×16 | 없음 | ① 확장 |
| Switch | `switch` | `size:default` | 36×21 | 36×**20** | 없음 | ① 확장(세로만) |
| Switch | `switch` | `size:sm` | 28×17 | 28×**16** | 없음 | ① 확장(세로만) |
| Slider | `slider-thumb` | `size:sm` / `default` / `lg` | 14×15 / 16×17 / 20×21 | 14 / 16 / 20 | 없음 (root는 `overflow` 없음) | ① 확장 |
| Scroll Area | `scroll-area-thumb` | `orientation:vertical` / `horizontal` | **8**×165 / 171×**9** | 8×164 / 171×8 | `scroll-area[xy]` room **1** | ② 잘림 |
| Scroll Area | `scroll-area-scrollbar` | vertical / horizontal | **10**×190 / 286×**11** | 10×190 / 286×10 | `scroll-area[xy]` room **0** | ② 잘림 |
| Resizable | `resizable-handle` | `orientation:horizontal` | **5**×92 (`after` 4px) | 1×90 | `resizable-panel-group[xy]` room 0 | ③ 외부 소유(`hitAreaMargins`) |
| Resizable | `resizable-handle` | `orientation:vertical` | 510×13 (`after` 4px; 13은 손잡이) | 510×1 | 같음 | ③ 외부 소유 |
| Sidebar | `sidebar-group-action` | `state:expanded` | **20**×25 | 20×24 | `sidebar-content[xy]` room 20 | ① 확장(가로만) |
| Sidebar | `sidebar-menu-action` | `state:expanded` | **20**×23 | 20×**22.4** | 같음, room 20 | ① 확장 |
| Sidebar | `sidebar-menu-button` | `collapsible:icon;state:collapsed` | **16**×29·33 | 16×28·32 | `sidebar-content[xy]` room 7–15 | ④ 아이콘 모드 미구현(§4.3) |
| Sidebar | `sidebar-menu-sub-button` | `collapsible:icon;state:collapsed` | **16**×29 | 16×28 | room 0 | ④ |
| Sidebar | `sidebar-group-action`·`-menu-action` | `collapsible:icon;state:collapsed` | **2**×25 / 2×21 (`center-miss`) | 20×24 | room **−8** — 상자 자체가 밖에 있다 | ④ |
| Sidebar | `sidebar-rail` | — | 8·16×319 | 16×1800 | 스토리 래퍼 `div[xy]` | — 세로는 래퍼가 자른 것, 가로 16은 실제 |
| Toast | `toast-close` | — | 25×23 | 24.2×**22.4** | 없음 | ① 확장(세로만) |

**해상도 경계** — `square24`는 참인데 `visual`이 24 미만인 것. ±1 스냅이 통과시킨 자리라 사람이 `visual`로 읽는다.

| 컴포넌트 | slot | hit | visual |
|---|---|---|---|
| Breadcrumb | `breadcrumb-link` | 53×24 · 61×24 | 51.9×**22.4** · 60.5×22.4 |
| Toast | `toast-action` | 24×45 | **23.3**×44.8 |
| Input Group | `input-group-button` | 25×25 | 24×24 (딱 하한 — 반 픽셀 위치라 `square24`가 거짓으로 읽힌 한 셀이 있다) |
| Button | `size:xs`·`icon-xs` | 25 | 24 (딱 하한) |

**판정을 넘기는 둘.**

- **라벨** — `label`·`field-label` 열 종은 높이 14–16(`text-sm` 한 줄)이고, 가로 라벨(`orientation:horizontal`)에서는 12–20×28–42로 한 축이 더 좁다. `<label>`은 누르면 컨트롤이 활성화되므로 스캔이 넓게 넣었지만, WCAG 2.5.8의 **inline 예외**(문장 안의 텍스트 대상)에 해당하는지는 판정이다. 계기는 값만 준다.
- **Slider의 track** — 두께 4/6/8(`size`), 누르면 값이 옮겨진다. 겨냥 단위는 thumb이고 track은 press surface다. `hit` 폭이 `visual`의 절반쯤인 것(222/384)은 중심선 걷기가 thumb에 막힌 것 — 히트 영역이 연속이 아니다(§5 ③).

### 4.2 `overflow` 조상 — 맵의 "아홉"은 넷이고, 잘리는 자리는 둘이다

맵 Notes는 `overflow-hidden` 유틸리티를 가진 파일 아홉을 적었다(`accordion`·`collapsible`·`avatar`·`carousel`·`item`·`progress`·`scroll-area`·`sidebar`·`slider`). 파일 단위 grep이다. 계기가 보는 것은 **대상 노드의 조상에 `overflow≠visible`이 있는가**이고, 그 답은 다르다.

| 조상 | 안에 있는 대상 | room | 24까지 필요한 확장 | 잘리는가 |
|---|---|---|---|---|
| `scroll-area` (`overflow-hidden`) | thumb 8px · scrollbar 10px | 0–1 | 각 방향 7–8 | **잘린다** |
| `resizable-panel-group` (라이브러리) | handle `after` 4px | 0 | 각 방향 10 | 잘리지만 **외부 소유** |
| `sidebar-content` (`overflow-auto`) | group-action·menu-action 20px | 20 (expanded) | 각 방향 2 | 안 잘린다 |
| `command-list`·Select viewport (`overflow-y-auto`) | item 34px | 0–4 | 0 | 이미 통과 |
| `sheet-content`·`body`(모달 스크롤 잠금) | 안의 Button 36px | 24 이상 | 0 | 이미 통과 |

**Slider thumb는 어느 `overflow` 조상 아래에도 없다.** `sliderTrackVariants`의 `overflow-hidden`은 Track에 걸리고 Thumb는 Root의 직계 자식이다(`slider.tsx`). 맵과 ADR-0020 §파급이 *"`slider`·`scroll-area`의 thumb가 들어 있다"* 고 적은 것은 파일 grep을 노드로 읽은 것이다 — 기록이 아니라 소스를 읽어야 한다는 [#165](https://github.com/flameware/massive-design/issues/165)의 규칙이 여기서도 한 번 더 값을 했다. `accordion`·`collapsible`·`avatar`·`carousel`·`item`·`progress`의 `overflow-hidden`은 그 안에 **대상이 없다**(Accordion의 trigger는 Content 밖, Carousel의 prev/next는 `overflow-hidden` 래퍼 밖).

따라서 [#231](https://github.com/flameware/massive-design/issues/231)의 예외 목록 후보는 **Scroll Area thumb·scrollbar 둘**이고, Resizable은 예외가 아니라 외부 소유([#122](https://github.com/flameware/massive-design/issues/122))다.

### 4.3 계기가 덤으로 찾은 것 — 계기의 결함이 아닌 카탈로그의 결함

- **Sidebar의 아이콘 모드가 그려지지 않는다.** `sidebar.tsx`에 `group-data-[collapsible=icon]:` 규칙이 **0개**다. 그래서 `collapsible:icon;state:collapsed` 셀에서 폭 48px 사이드바 안의 menu-button은 16px로 접히고(`w-full` + `p-2` 안의 아이콘만), 오른쪽에 absolute로 붙은 group-action·menu-action은 `sidebar-content`의 padding box **밖**(room −8)에 앉아 2px만 누를 수 있다. upstream은 `group-data-[collapsible=icon]:size-8!`로 버튼을 정사각형으로 만들고 action은 `group-data-[collapsible=icon]:hidden`으로 감춘다. 이것은 히트 영역 규칙이 아니라 **구성 상태가 안 그려진** 것이고, 이 맵의 destination 밖이다 — 별도 티켓 제안(§6).
- **참조 스토리의 툴팁이 이웃 버튼을 가린다.** Kbd 스토리의 `Tooltip defaultOpen` 내용이 위쪽 "거래 저장" Button의 아래 15px를 덮어 그 Button이 114×**21**로 읽힌다. 컴포넌트 결함이 아니라 스토리 조립이고, 계기가 **가림을 읽는다**는 증거로 남긴다(ADR-0020 결정 5가 소비처에 넘긴 겹침 판정이 바로 이 모양이다).

### 4.4 분포 — 초과분의 값을 정하는 입력

미달 대상의 시각 치수(짧은 축)와 24까지의 부족분, 중심 대칭 확장 시 한쪽 초과분:

| 짧은 축 | 대상 | 부족 | 한쪽 초과분 |
|---|---|---|---|
| 8 | Scroll Area thumb | 16 | 8 — 잘린다 |
| 10 | Scroll Area scrollbar | 14 | 7 — 잘린다 |
| 14 | Slider thumb `sm` | 10 | 5 |
| 16 | Checkbox · Radio · Switch `sm`(세로) · Slider thumb `default` · Sidebar icon-mode button | 8 | 4 |
| 20 | Switch(세로) · Slider thumb `lg` · Sidebar group-action·menu-action(가로) | 4 | 2 |
| 22.4 | Toast close(세로) · Sidebar menu-action(세로) · Breadcrumb link(세로) | 1.6 | 0.8 |
| 23.3 | Toast action(가로) | 0.7 | 0.35 |

세 덩어리다: **16px 계열**(4px씩), **20px 계열**(2px씩), **한 줄 텍스트 계열**(22.4 — `text-sm` 줄높이 20 + 여백, 1px 안팎). 맵 Fog의 물음 — *"16px 대상은 4px씩, 20px 대상은 2px씩인가, 아니면 모두 같은 폭인가"* — 에 계기가 주는 사실은 **셋째 계열이 있다**는 것이다. 22.4 계열은 `after:`가 아니라 줄높이·패딩의 문제일 수 있고, 그 판정은 [#230](https://github.com/flameware/massive-design/issues/230)이 한다.

---

## 5. 한계 — 지킬 수 없는 것을 지킨다고 적지 않는다

① **참조 스토리가 그리는 것만 잰다.** `menubar-item`·`menubar-sub-trigger`가 그 자리다. 소비처가 조립하는 다른 모양은 재지 않는다.

② **해상도 ±1px.** Chromium의 히트 테스트가 정수 픽셀로 스냅한다. 경계 판정은 `visual`로 한다(§4.1 둘째 표).

③ **중심선은 연속 구간의 최댓값을 읽는다.** 히트 영역이 직사각형이 아니면(Resizable의 손잡이, thumb에 막힌 Slider track) `hit`는 그 자리의 두께이고, 얇은 부분은 `after` 열이나 `square24`로만 보인다. 2026-09-04 기준 두 자리뿐이다.

④ **이웃 간격은 재지 않는다.** 겹침(ADR-0020 결정 5)은 소비처 레이아웃의 일이다. 계기가 가림을 읽기는 하지만(Kbd의 툴팁) 그것은 참조 스토리의 겹침이지 소비처의 겹침이 아니다.

⑤ **게이트가 아니다.** 판정과 기준선 커밋은 [#232](https://github.com/flameware/massive-design/issues/232)가 한다. 이 문서의 표가 그 첫 기준선 후보다.

⑥ **런타임 속성은 스캔이 못 본다.** Radix가 다는 `tabindex`·`role`은 소스에 없다. DOM 대조가 그 자리를 보완하지만, DOM 대조는 렌더된 셀 안에서만 돈다.

---

## 6. 다음 티켓에 넘기는 것

- **[#230](https://github.com/flameware/massive-design/issues/230) 규칙 적용** — 갈래 ①: Checkbox·Radio·Switch(2 size)·Slider thumb(3 size)·Sidebar group-action·menu-action·Toast close, 그리고 경계의 Breadcrumb link·Toast action. 라벨은 판정 먼저. §4.4의 세 계열이 두 배치로 가를 근거다 — **16/20px 계열(`after:` 확장, 8종)** 과 **22.4px 텍스트 계열(줄높이·패딩, 3–4종)** 은 기제가 다를 수 있다.
- **[#231](https://github.com/flameware/massive-design/issues/231) 예외 목록** — Scroll Area thumb·scrollbar(잘림), Resizable handle(외부 소유), 그리고 라벨의 inline 예외 판정. Slider thumb는 예외가 **아니다**.
- **[#232](https://github.com/flameware/massive-design/issues/232) 실측 게이트** — `apps/storybook/scripts/pointer-targets.mjs`가 씨앗. 게이트가 되려면 (a) 이 문서의 표를 기준선으로 갖고 diff를 내고, (b) `pointer-events:none`·offcanvas 셀을 "재지 않음"으로 거르고, (c) `menubar-item`처럼 참조 스토리가 안 그리는 slot을 실패로 문다(지금은 목록만 찍는다).
- **[#233](https://github.com/flameware/massive-design/issues/233) 검증 규약** — 뷰포트 확인이 들어오는 "포인터 대상을 건드린 세대"의 판정 기준을 이 스캔의 slot 집합으로 둘 수 있다: 그 slot을 가진 파일이 diff에 있으면 그 세대다.
- **새 티켓 제안(맵 밖)** — Sidebar 아이콘 모드 미구현(§4.3). 구성 상태 `collapsible:icon`이 계약에 있는데 그리지 않으므로 [ADR-0010](../adr/0010-behaviors-are-declared-and-human-verified.md)·[#149](https://github.com/flameware/massive-design/issues/149)의 "선언했으면 그린다"에 걸린다.
