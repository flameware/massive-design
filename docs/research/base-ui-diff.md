# Base UI와 `radix-ui`의 차이 전수 — 계약 표면·접근성 동작·이행 비용

- 티켓: [#150](https://github.com/flameware/massive-design/issues/150) (map: [#141](https://github.com/flameware/massive-design/issues/141))
- 조사일: 2026-09-01
- 브랜치: `research/base-ui-diff`
- 리포 기준: `main` `53bb383` — `@massive/ui` 매니페스트 51개, primitive 기반 24개, `radix-ui@^1.6.7`
- 1차 출처: [base-ui.com](https://base-ui.com), [radix-ui.com](https://www.radix-ui.com), [ui.shadcn.com](https://ui.shadcn.com), 그리고 각 GitHub 리포

> **이 문서는 판정하지 않는다.** [Base UI 이행 판정](https://github.com/flameware/massive-design/issues/152)이 쓸 사실만 모은다.
> 권고도, 결론도 없다.
>
> **확인하지 못한 것은 "확인하지 못했다"고 적는다.** 추정으로 빈칸을 메우지 않았다.
> 맵 [#141](https://github.com/flameware/massive-design/issues/141)의 규칙대로 "upstream이 1차로 내세운다"는 사실 자체는
> 이 문서에서 근거로 쓰이지 않는다 — 그냥 사실 하나로 §7에 적혀 있다.

---

## 0. 다섯 줄 요약 (사실만)

1. **`asChild`와 `render`는 어휘만 다른 것이 아니다.** Base UI의 `render`는 함수형을 받고 그 함수는 `(props, state)`를 받는다 — 내부 상태에 따라 마크업을 가르는 일이 가능하다. Radix의 `asChild`는 boolean이라 구조적으로 불가능하다. 우리 계약이 `asChild`로 공개한 확장점은 **상위 호환 방향**이다.
2. **part 이름은 광범위하게 움직인다.** Base UI는 떠 있는 표면에 `Positioner` 층을 하나 더 두고(`Content` → `Positioner` + `Popup`), `Content`를 `Panel`(Accordion·Collapsible)·`Popup`(떠 있는 것 전부)으로 부른다. Radix의 `DropdownMenu`는 Base UI에 없다 — 일반 `Menu`로 통합돼 있다.
3. **`data-*` 어휘가 체계적으로 다르다.** Radix는 열거값(`data-state="open"`), Base UI는 존재형 boolean(`data-open`/`data-closed`). 이것이 **우리 매니페스트 해시를 직접 움직이는 유일한 축**이다 — 아래 §5.2에 그 자리 여섯 곳을 셌다.
4. **`--radix-*` 의존은 리포 전체에 세 자리뿐이다**(§5.1). 그중 Navigation Menu의 viewport 치수 변수는 우리가 **쓰지 않는다**(산문에만 등장). Base UI에 대응물이 없다는 사실은 확인했지만 우리에게는 걸리지 않는다.
5. **24개 등급(§9): 그대로 1 · prop 이름만 5 · 계약 표면이 움직임 10 · 동작이 다름 8.** "동작이 다름" 여덟 중 넷(`menubar`·`navigation-menu`·`popover`·`dropdown-menu`)은 **Base UI 문서에 대응 문장이 없어 확인하지 못한** 것이고, 넷(`accordion`·`tabs`·`label`·`toast`)은 **문서로 확인된 진짜 차이**다.

---

## 1. 계약 표면 — `asChild` 대 `render`

| | Radix `asChild` | Base UI `render` |
|---|---|---|
| 타입 | `boolean` | 엘리먼트(`render={<MyLink />}`) **또는** 함수 `(props, state) => ReactElement` |
| 내부 상태 접근 | 없음 — 자식이 컴포넌트 내부 상태를 읽을 방법이 없다 | **있음** — 함수형의 두 번째 인자가 `state`다(예: Switch의 `state.checked`) |
| prop 병합 | Radix가 자기 prop·핸들러를 자식에 내려보내고, 자식은 그것을 전부 자기 DOM 노드에 펴야 한다 | 같은 요구 — 받은 prop 전부를 펴고 `ref`를 전달해야 한다 |
| ref | `React.forwardRef` 필요("ref를 받지 않는 컴포넌트는 깨진다") | 같음 |
| 병합 유틸 | Radix `Slot` | Base UI `mergeProps` |

출처: [Radix — Composition](https://www.radix-ui.com/primitives/docs/guides/composition), [Base UI — Composition handbook](https://base-ui.com/react/handbook/composition), [Base UI llms.txt](https://base-ui.com/llms.txt).

**의미도 다르다.** `asChild`는 "내 엘리먼트 대신 자식을 렌더한다"는 스위치이고, `render`는 그것의 상위집합이다 —
함수형을 받아 열림·체크·비활성 같은 내부 상태에 따라 마크업 자체를 가를 수 있다. `asChild`는 함수를 아예 받지 않으므로
이 능력이 없다.

**우리에게 걸리는 자리.** [#127](https://github.com/flameware/massive-design/issues/127)이 `NavigationMenuLink`의 확장점을 계약하며 이름을 `asChild`로 정했다.
카탈로그가 이미 `BreadcrumbLink`·`PaginationLink`·`DropdownMenuTrigger`·`Button`·`SidebarInset`에서 같은 이름을 쓴다.
`asChild → render`는 **prop 이름 변경**이고, 값 어휘는 `boolean → 엘리먼트|함수`로 바뀐다 — 소비처 호출이
`asChild`(값 없음)에서 `render={<a />}`(값 필수)로 바뀌므로 **호출 형태 자체가 달라진다.** 우리 `button.tsx`·`breadcrumb.tsx`는
Radix `Slot.Root`를 직접 쓰는데(§5.3), Base UI에 `Slot` 대응물이 있는지는 **확인하지 못했다** — 공개 문서 나열에 없고,
`render`/`useRender`가 그 자리를 대신하는 것으로 보이지만 이는 추정이라 사실로 적지 않는다.

---

## 2. part 이름과 anatomy

Base UI의 떠 있는 컴포넌트는 일관되게 `Root → Trigger → Portal → Backdrop? → Positioner → Popup → Arrow? → Viewport?`다.
Radix는 `Root → Trigger → Portal → Overlay? → Content → Arrow?`이고 **`Positioner` 층이 없다** — 위치 계산이 `Content` 안에 있다.

| 컴포넌트 | Radix parts | Base UI parts |
|---|---|---|
| Dialog | Root, Trigger, Portal, Overlay, Content, Title, Description, Close | Root, Trigger, Portal, **Backdrop**, **Viewport**, **Popup**, Title, Description, Close |
| Alert Dialog | … + **Cancel**, **Action** | … + **Close** 하나 (Cancel/Action 의미 분리 없음) |
| Dropdown Menu | 독립 컴포넌트 | **없음** — 일반 `Menu`로 통합. Root, Trigger, Portal, Backdrop, **Positioner**, Popup, Viewport, Arrow, Item, **LinkItem**, **SubmenuRoot/SubmenuTrigger**, Group, **GroupLabel**, RadioGroup, RadioItem, CheckboxItem, Separator |
| Context Menu | Root, Trigger, Portal, Content, … | Root, Trigger, Portal, **Positioner**, Popup, Arrow, … |
| Menubar | Root, Menu, Trigger, Portal, Content, Item, … | Root가 `Menu.Root`들을 감싼다 — 자체 Content/Item 파트 없이 `Menu.*`를 재사용 |
| Navigation Menu | Root, List, Item, Trigger, Content, Link, **Indicator**, **Viewport**, Sub | Root, List, Item, Trigger, **Icon**, Content, Link, Portal, **Positioner**, **Popup**, Viewport, Backdrop, Arrow — **`Indicator` 파트는 문서에 없다** |
| Popover | Root, Trigger, **Anchor**, Portal, Content, Close, Arrow | Root, Trigger, Portal, Backdrop, **Positioner**, **Popup**, Arrow, Viewport, **Title**, **Description**, Close |
| Select | Root, Trigger, Value, Icon, Portal, Content, Viewport, Item, ItemText, ItemIndicator, ScrollUp/DownButton, Group, Label, Separator, Arrow | Root, **Label**, Trigger, Value, Icon, Backdrop, Portal, **Positioner**, **Popup**, **List**, Arrow, Item, ItemText, ItemIndicator, Group, **GroupLabel**, **ScrollUpArrow/ScrollDownArrow**, Separator |
| Tooltip | Provider, Root, Trigger, Portal, Content, Arrow | Provider, Root, Trigger, Portal, **Positioner**, **Popup**, Arrow, Viewport |
| Tabs | Root, List, **Trigger**, **Content** | Root, List, **Tab**, **Panel**, **Indicator**(Radix에 없음) |
| Accordion | Root, Item, Header, Trigger, **Content** | Root, Item, Header, Trigger, **Panel** |
| Collapsible | Root, Trigger, **Content** | Root, Trigger, **Panel** |
| Checkbox | Root, Indicator | Root, Indicator (같음) |
| Radio Group | Root, **Item**, Indicator | `RadioGroup` + 별도 컴포넌트 **`Radio.Root`**, **`Radio.Indicator`** |
| Switch | Root, Thumb | Root, Thumb (같음) |
| Slider | Root, Track, **Range**, Thumb | Root, **Label**, **Value**, **Control**, Track, **Indicator**(=Range), Thumb |
| Progress | Root, Indicator | Root, **Track**, Indicator, **Value**, **Label** |
| Scroll Area | Root, Viewport, Scrollbar, Thumb, Corner | Root, Viewport, **Content**, Scrollbar, Thumb, Corner |
| Avatar | Root, Image, Fallback | 같음 |
| Toggle | 단일 `Toggle` | `Toggle.Root` 단일 |
| Toggle Group | Root, **Item** | Root만 — 항목은 독립 `Toggle`을 안에 조립 |
| Hover Card | Root, Trigger, Portal, Content, Arrow | 이름 없음 — **Preview Card**가 같은 기능 |
| Label | 독립 `Label.Root` | **독립 컴포넌트 없음** — `Field`/`Fieldset` 안이나 컴포넌트별 하위 Label |
| Aspect Ratio | Root | **없음** — 기능 요청이 "won't fix"로 닫혔다 |
| Separator | Root | Root — 세부 속성 집합은 **확인하지 못했다** |

출처: 각 컴포넌트의 공식 문서 페이지(radix-ui.com/primitives/docs/components/*, base-ui.com/react/components/*),
[Base UI AspectRatio 이슈 #2189](https://github.com/mui/base-ui/issues/2189).

### 2.1 우리 anatomy가 그대로 서는가

**우리 공개 anatomy는 Radix의 part 이름이 아니라 우리 이름이다.** `PopoverContent`·`AccordionContent`·`TabsTrigger`는
우리가 지은 것이고 매니페스트의 `anatomy` 배열에 그 이름으로 들어간다. 따라서 위 표의 이름 이동이
**자동으로 우리 anatomy를 움직이지는 않는다** — 내부에서 `<Popover.Popup>`을 부르면서 바깥 이름을 `PopoverContent`로
유지할 수 있다.

우리 anatomy가 실제로 움직이는 자리는 **Base UI가 노드 하나를 둘로 나눈 곳**이다:

| 우리 컴포넌트 | 현재 anatomy | Base UI에서 노드가 늘거나 사라지는 자리 |
|---|---|---|
| Popover | `Popover, PopoverTrigger, PopoverAnchor?, PopoverContent` | `Positioner`가 `Content`와 `Popup` 사이에 낀다. `Anchor` 파트가 Base UI Popover 문서에 없다 — **확인 필요**(§9) |
| Dialog / Sheet / Alert Dialog | `…Overlay, …Content, …Title, …` | `Overlay` → `Backdrop`, `Content` → `Viewport` + `Popup` (두 노드) |
| Dropdown Menu | `DropdownMenu…Content, …Item, …` | `Content` → `Positioner` + `Popup` |
| Menubar | 14개 파트 | `Content` → `Positioner` + `Popup`, `Label` → `GroupLabel` |
| Navigation Menu | `…Trigger?, …Content?, …Link*` | `Content`가 `Portal`+`Positioner`+`Popup` 뒤에 앉는다 |
| Select | `SelectContent, SelectItem*, …` | `Content` → `Positioner` + `Popup` + `List` (세 노드) |
| Tooltip | `TooltipContent` | `Positioner` + `Popup` |
| Slider | `Slider, SliderTrack, SliderRange, SliderThumb*` | `Control`이 `Root`와 `Track` 사이에 낀다, `Range` → `Indicator` |
| Progress | `Progress, ProgressIndicator` | `Track`이 `Root`와 `Indicator` 사이에 낀다 |
| Scroll Area | `ScrollArea, ScrollAreaViewport, ScrollBar?, …` | `Content`가 `Viewport` 안에 낀다 |
| Toggle Group | `ToggleGroup, ToggleGroupItem*` | `Item` 파트가 없다 — 독립 `Toggle`을 조립 |
| Radio Group | `RadioGroup, RadioGroupItem*, Indicator` | `Item`이 별도 컴포넌트 `Radio.Root`다 |

**여기서 anatomy가 실제로 바뀌는지는 구현 선택에 달렸다** — 낀 노드를 공개 파트로 낼지 내부에 숨길지는 우리가 정한다.
숨기면 anatomy는 불변이고 매니페스트 해시도 그 항목에서는 움직이지 않는다. 이 문서는 그 선택을 하지 않는다.

---

## 3. `data-*` 속성 이름

Radix는 **열거된 `data-state`**, Base UI는 **상태 이름 자체가 속성인 존재형 boolean**이다.

| 개념 | Radix | Base UI |
|---|---|---|
| 열림/닫힘 | `data-state="open"` / `"closed"` | `data-open` / `data-closed` |
| 체크 | `data-state="checked"/"unchecked"/"indeterminate"` | `data-checked` / `data-unchecked` / `data-indeterminate` |
| 선택된 항목 | `data-state="checked"`(Select) | `data-selected`(Select.Item) / `data-checked`(Menu) |
| 강조 항목 | `data-highlighted` | `data-highlighted` (같음) |
| 비활성 | `data-disabled` | `data-disabled` (같음) |
| 방향/정렬 | `data-side`, `data-align` | `data-side`, `data-align` (같음, `Positioner`/`Popup`/`Arrow`에) |
| 방위 | `data-orientation` | `data-orientation` (같음, 일부 파트는 내지 않음) |
| 트리거의 열림 | `data-state` | **`data-popup-open`** |
| 눌림(Toggle) | `data-state="on"/"off"` | **`data-pressed`** |
| 진입/퇴장 애니메이션 | 표준화 없음(NavigationMenu만 `data-motion`) | `data-starting-style` / `data-ending-style` (전역 규약) |
| Tooltip 3상태 | `data-state="closed"/"delayed-open"/"instant-open"` | `data-open`/`data-closed` 2상태 — 지연/즉시 구분 속성은 확인되지 않음 |
| 활성 링크 | `data-active` | `data-active` (같음) |
| 폼 검증 | 계약 밖 | `data-valid`·`data-invalid`·`data-dirty`·`data-touched`·`data-filled`·`data-focused`·`data-required`·`data-readonly` (`Field.Root` 안에서) |

출처: §2와 같은 컴포넌트 문서 페이지들.

---

## 4. `--radix-*` CSS 변수의 대응물

| 용도 | Radix | Base UI |
|---|---|---|
| transform origin | `--radix-{c}-content-transform-origin` | `--transform-origin` (Positioner) |
| 경계까지 남은 폭·높이 | `--radix-{c}-content-available-width/height` | `--available-width` / `--available-height` |
| 트리거 치수 | `--radix-{c}-trigger-width/height` | `--anchor-width` / `--anchor-height` |
| Positioner 자기 상자 | 없음 | `--positioner-width` / `--positioner-height` |
| Popup 상자 | 없음 | `--popup-width` / `--popup-height` |
| Collapsible 패널 치수 | `--radix-collapsible-content-height/width` | `--collapsible-panel-height` / `--collapsible-panel-width` |
| Accordion 패널 치수 | `--radix-accordion-content-height/width` | `--accordion-panel-height` / `--accordion-panel-width` |
| 중첩 다이얼로그 깊이 | 없음 | `--nested-dialogs` |
| Tabs 활성 탭 좌표 | 없음(Indicator 자체가 없다) | `--active-tab-top/bottom/left/right/width/height` |
| **Navigation Menu viewport 치수** | `--radix-navigation-menu-viewport-width/height`, `--radix-navigation-menu-indicator-translate-x/y` | **대응물 없음(확인됨)** — Base UI Navigation Menu 문서에는 일반 Positioner/Popup 변수만 있다 |
| **Toast 스와이프 오프셋** | `--radix-toast-swipe-move-x` / `--radix-toast-swipe-end-x` | **확인하지 못했다** — Base UI Toast 문서에서 대응 변수를 찾지 못했다(§9) |

출처: §2와 같은 문서 페이지들.

---

## 5. 우리 코드의 실측 — 24개가 primitive에 무엇을 맡기고 있는가

`packages/ui/src/components/ui/`가 정본이다. `radix-ui`를 import 하는 파일은 **26개**이고, 그중
`button.tsx`·`breadcrumb.tsx`는 `Slot`만 쓴다. 남는 **24개**가 티켓이 세는 primitive 기반 컴포넌트다.

```
accordion  alert-dialog  avatar     checkbox   collapsible  dialog
dropdown-menu  label     menubar    navigation-menu  popover  progress
radio-group    scroll-area  select   separator  sheet   slider
switch     tabs      toast      toggle     toggle-group  tooltip
```

간접 의존(자기 파일에는 `radix-ui`가 없지만 위 24개를 조립한다): `combobox`(Popover+Command),
`field`(Label), `sidebar`(Sheet), `input-group`·`pagination`·`calendar`(Button→`Slot`).

### 5.1 `--radix-*` CSS 변수 의존 — 리포 전체에 **세 자리**

| 자리 | 변수 | Base UI 대응물 |
|---|---|---|
| `combobox.tsx:52` — `w-[var(--radix-popover-trigger-width)]` | `--radix-popover-trigger-width` | `--anchor-width` (이름만 다름, 의미 동일) |
| `toast.tsx:25` — `data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]` | `--radix-toast-swipe-move-x` | **확인하지 못했다** |
| `toast.tsx:27` — `data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)]` | `--radix-toast-swipe-end-x` | **확인하지 못했다** |

**티켓이 예로 든 Navigation Menu의 viewport 치수 변수는 우리가 쓰지 않는다.** `navigation-menu.tsx:20`의
산문에만 등장하고, [#127](https://github.com/flameware/massive-design/issues/127)이 `Viewport`를 공개하지 않기로 판정하면서 viewport 없는 경로를 택했기 때문이다.
Base UI에 그 변수의 대응물이 없다는 사실(§4)은 **우리에게 걸리지 않는다.**

부수 사실 하나: `accordion.tsx`·`collapsible.tsx`가 부르는 `animate-accordion-up/down`·
`animate-collapsible-up/down`은 **리포 어디에도 정의가 없다**(`--animate-*` 테마 변수도, `@keyframes`도 없다).
즉 지금도 동작하지 않는 클래스다. Base UI 이행과 무관한 기존 상태이고, 이 티켓이 고칠 자리는 아니다.

### 5.2 매니페스트 해시를 직접 움직이는 자리 — 여섯 컴포넌트

해시의 입력은 `figmaPayload`(`scripts/manifest/hash.mjs`)가 정한다: `anatomy`, `axes`, `base`,
`cells{props, properties, slots, state}`, `parts`, `configurationStates`. `className` 자체는 **입력이 아니다.**

그런데 `properties`의 **키**가 클래스 문자열에서 파생된다. `scripts/manifest/classify.mjs`의
`MODIFIER_POLICY`에 없는 수식자는 `unresolved` 항목으로 남되 **키에 수식자 문자열이 그대로 박힌다**:

```json
"data-[state=checked]:--ds-state-base": {
  "from": "data-[state=checked]:[--ds-state-base:var(--primary)]",
  "why": "수식자 data-[state=checked]를 아직 다루지 않는다"
}
```

따라서 **primitive가 내는 `data-*` 이름이 바뀌면 그 클래스를 `cva`에 담은 컴포넌트의 해시가 움직인다.**
`cva`가 아니라 인라인 `cn(...)`에 있는 클래스는 `className()`이 내지 않으므로 해시 입력이 아니다.

전수 대조 결과, primitive가 소유하는 `data-*`가 **해시되는 `properties`에 들어 있는 컴포넌트는 여섯 개**다:

| 컴포넌트 | 해시에 박힌 primitive 소유 `data-*` | Base UI에서의 이름 |
|---|---|---|
| `checkbox` | `data-[state=checked]`, `data-[state=indeterminate]` | `data-checked`, `data-indeterminate` |
| `switch` | `data-[state=checked]` | `data-checked` |
| `toggle` | `data-[state=on]` | `data-pressed` |
| `menubar` | `data-[state=open]`, `data-[disabled]` | `data-open`(트리거는 `data-popup-open`), `data-disabled`(동일) |
| `navigation-menu` | `data-[state=open]`, `data-[active=true]` | `data-open`/`data-popup-open`, `data-active`(값 없는 형태) |
| `slider` | `data-[orientation=horizontal]`·`data-[orientation=vertical]`, `data-[disabled]` | `data-orientation`(동일), `data-disabled`(동일) |

**우리 것이라 영향이 없는 자리**(이행해도 움직이지 않는다): `sidebar`의 `data-[state=collapsed]`·
`data-[side]`·`data-[variant]`, `table`·`list-row`·`item`의 `data-[state=selected]`,
`field`의 `data-[invalid=true]`, `input-otp`의 `data-[active=true]`, `combobox`의 `data-[placeholder=true]`,
`command`의 `data-[highlighted=true]`(cmdk 소유이며 Radix가 아니다).

`toast`의 `data-[swipe=move|cancel|end]`는 `MODIFIER_POLICY`에 **명시적 `ignore`**로 등록돼 있어
`properties`에 들어가지 않는다 — 해시는 움직이지 않고, 클래스 문자열만 다시 쓰면 된다.

### 5.3 우리 공개 표면이 Radix 타입에서 파생된 정도

24개 중 **26개 파일에서 `React.ComponentProps<typeof …Primitive.…>`가 총 116곳** 쓰인다.
즉 **우리 공개 prop 타입의 대부분이 Radix의 prop 표면을 그대로 상속한다.** 우리가 좁히거나 덮은 것은
아래 정도다:

| 자리 | 우리가 한 것 |
|---|---|
| `dropdown-menu.tsx` | `openOn` 판별 유니온으로 Root 타입을 모드별로 가른다. Trigger의 `ref`·`onKeyDown`만 넓힌다 |
| `popover.tsx` | `openOn?: "press"\|"hover"`를 얹는다. `PopoverHoverRoot`가 `open`/`onOpenChange`를 가로챈다 |
| `separator.tsx` | `decorative = true` 기본값을 우리가 정하고 계약 `limits`에 적었다 |
| `select.tsx` | `position = "popper"` 기본값을 우리가 정한다 (Radix 전용 prop) |
| `tooltip.tsx` | `delayDuration = 300` 기본값 |
| `scroll-area.tsx` | 루트의 `aria-label`/`aria-labelledby`를 뷰포트로 옮기고 `role="group"`·`tabIndex={0}`을 직접 준다 |
| `menubar.tsx`·`navigation-menu.tsx` | `aria-label`을 **필수 prop**으로 만든다 |
| `progress.tsx` | `value`를 0–100으로 클램프하고 Indicator의 `transform`을 직접 계산한다 |
| `toast.tsx` | `React.forwardRef` + `ElementRef`/`ComponentPropsWithoutRef` (다른 파일은 React 19 스타일) |

Radix 전용 prop을 우리가 공개 기본값으로 쥐고 있는 자리 둘(`select`의 `position`, `separator`의 `decorative`)은
Base UI에 대응 prop이 있는지 **확인하지 못했다.**

### 5.4 우리가 primitive 위에 얹은 것들

| 얹은 것 | 어디에 | 무엇에 기대고 있는가 | Base UI 대응물 |
|---|---|---|---|
| `openOn="context"` ([#126](https://github.com/flameware/massive-design/issues/126)) | `dropdown-menu.tsx` | Radix `ContextMenu` primitive로 내부 교체. `ContextMenuTrigger`가 `tabIndex`·`role`·`onKeyDown`을 **주지 않는다**는 사실 위에서 Shift+F10·컨텍스트 메뉴 키를 우리가 직접 잇고, `MouseEvent("contextmenu")`를 합성해 흘린다. 롱프레스 700ms는 Radix가 갖고 오는 상속 표면 | Base UI에 Context Menu가 **있다**(`Root/Trigger/Portal/Positioner/Popup/…`). 그 Trigger가 포커스를 받는지, 롱프레스 임계값이 얼마인지는 **확인하지 못했다** |
| `openOn="hover"` ([#126](https://github.com/flameware/massive-design/issues/126)) | `popover.tsx` | **primitive를 갈아 끼우지 않았다.** Radix `HoverCard`가 `Anchor`·`Close`를 안 내보내고 터치를 배제하며 콘텐츠의 tabbable을 눕힌다는 세 손실 때문. 제어된 `open`을 타이머(300/300ms)로 밀고, `onOpenAutoFocus`를 `preventDefault`해 hover로 연 표면이 포커스를 뺏지 않게 한다 | Base UI의 대응은 **Preview Card**이고 Radix HoverCard와 같은 "터치·스크린리더 비대상" 단서를 문서가 명시한다. 우리 우회는 Popover primitive의 `open`·`onOpenChange`·`onOpenAutoFocus`에 기대는데, Base UI Popover에 같은 세 확장점이 있는지는 **확인하지 못했다** |
| Sidebar의 쿠키 영속화·`Cmd/Ctrl+B` | — | **없다.** `sidebar.tsx`의 `limits`가 명시적으로 계약 밖으로 밀어냈다: "쿠키 열림 상태 영속화와 `Cmd/Ctrl+B` 단축키는 동작이라 파생 채널이 나르지 못하므로 계약 밖이고, 저절로 따라오는 상속 표면도 아니라 소비처가 `defaultOpen`·`open`·`onOpenChange`로 배선한다." | 해당 없음 — 우리 코드에 그 기능이 없다 |
| Toast 스와이프 피드백 ([#110](https://github.com/flameware/massive-design/issues/110), ADR-0005) | `toast.tsx` | Radix Toast의 `swipeDirection: "right"`·`swipeThreshold: 50` 기본값과 `data-[swipe=*]`·`--radix-toast-swipe-*-x` | **확인하지 못했다** |
| Menubar·Navigation Menu의 `aria-label` 필수화 ([#127](https://github.com/flameware/massive-design/issues/127)) | 두 파일 | primitive가 아니라 우리 것 — 이행과 무관 | 해당 없음 |
| Navigation Menu의 viewport 없는 경로 ([#127](https://github.com/flameware/massive-design/issues/127)) | `navigation-menu.tsx` | Radix가 문서화한 두 경로 중 하나(`Viewport`를 렌더하지 않으면 콘텐츠가 항목 안에서 제자리 렌더된다) | Base UI Navigation Menu에 **같은 두 경로가 있는지 확인하지 못했다.** Base UI는 `Portal`+`Positioner`+`Popup`+`Viewport`를 모두 파트로 가진다 |
| ScrollArea 뷰포트의 `role="group"`·`tabIndex={0}`·이름 이전 | `scroll-area.tsx` | Radix가 뷰포트를 포커스 가능하게 만들지 **않는다**는 사실 | Base UI Scroll Area 문서에 키보드 스크롤 관련 문장을 **찾지 못했다** |
| `asChild` 확장점 계약 ([#127](https://github.com/flameware/massive-design/issues/127)) | `navigation-menu.tsx`·`breadcrumb.tsx`·`button.tsx`·`pagination.tsx`·`dropdown-menu.tsx`·`sidebar.tsx` | Radix `Slot.Root` | §1 — `render`가 상위집합. `Slot` 단독 유틸의 존재는 **확인하지 못했다** |

---

## 6. 우리가 primitive에 맡기고 있는 접근성 동작 — 24개 전수

읽는 법: **Radix 열**은 Radix 공식 문서의 "Keyboard Interactions"·"Accessibility" 절이 **명시한** 것만 적는다.
**Base UI 열**도 같은 기준이다. Base UI 문서는 대체로 키 단위 표를 **내지 않고** prop 이름
(`loopFocus`·`activateOnFocus`·`largeStep`·`closeParentOnEsc`)과 산문으로만 말하므로,
문서에 문장이 없으면 **"문서 없음"**으로 적었다 — "없다"가 아니라 **확인하지 못했다**는 뜻이다.

| # | 우리 컴포넌트 | primitive에 맡긴 것(Radix 문서가 명시) | Base UI | 판정 |
|---|---|---|---|---|
| 1 | `accordion` | roving focus, 트리거 사이 화살표·Home/End | 문서가 **"APG 지침 변경에 따라 roving focus를 제거했다"**고 명시 | **다르다 — 확인된 회귀** |
| 2 | `alert-dialog` | 포커스 트랩, 트리거로 포커스 반환, Esc 닫기 | 있음. `initialFocus`/`finalFocus`, `'outside-press'`/`'escape-key'` 닫힘 사유를 명시 | 같음(Base UI가 더 명시적) |
| 3 | `avatar` | 없음(비대화형) | 없음 | 같음 |
| 4 | `checkbox` | Space 토글 | 키 문장 없음 — 데이터 속성·접근 가능한 이름 안내만 | **문서 없음** |
| 5 | `collapsible` | Space/Enter 토글 | 키 문장 없음 | **문서 없음** |
| 6 | `dialog` | 포커스 트랩·반환, Esc 닫기 | 있음 + **`modal`일 때 문서 스크롤 잠금을 산문으로 명시**(Radix 페이지에는 그 문장이 없다) | 같음 |
| 7 | `dropdown-menu` (press 모드) | roving tabindex, 화살표로 서브메뉴 열고 닫기, typeahead(Features 절), Esc→트리거 | `Menu`로 통합. 같은 roving focus·typeahead(항목 `label` prop) 모델 + `closeParentOnEsc` | 같음(이름·API가 다름) |
| 8 | `dropdown-menu` (context 모드) | Radix `ContextMenuTrigger`는 `tabIndex`·`role`·`onKeyDown`을 **주지 않는다** → 우리가 Shift+F10·컨텍스트 키를 직접 이었다. 롱프레스 700ms는 상속 | Base UI Context Menu는 존재하고 roving focus·`loopFocus`·typeahead·`closeParentOnEsc`를 문서화한다. **Trigger의 포커스 가능 여부와 롱프레스 임계값은 문서 없음** | **문서 없음** |
| 9 | `label` | 네이티브 `<label>`/`htmlFor` 자동 연결 | **독립 컴포넌트 없음** — `Field.Label`로 흡수, `nativeLabel` 탈출구 있음 | **표면이 사라진다** |
| 10 | `menubar` | **ArrowLeft/Right가 최상위 트리거 사이를 이동**하고, 열린 Content **안에서도** 메뉴 사이를 건너뛴다. roving tabindex, Esc 닫고 포커스 반환 | 컴포넌트는 **존재한다**. 그러나 그 페이지에 키보드·ARIA 명세가 **하나도 없다**(Home/End·typeahead·roving·Arrow*·aria-* 검색 결과 0) | **문서 없음 — 이번 조사에서 가장 큰 공백** |
| 11 | `navigation-menu` | `menu` role이 **아님**을 명시(사이트 탐색이므로), 화살표로 트리거·링크 이동, **Home/End**, Esc 닫고 트리거로 포커스 반환 | 컴포넌트 존재. anatomy는 대응되지만 **키보드·포커스 관리 산문을 찾지 못했다** | **문서 없음** |
| 12 | `popover` | Space/Enter/Tab/Esc→트리거 | `escape-key`/`outside-press` 사유 명시, **`modal`에서 스크롤 잠금 명시**, `Popover.Close` 렌더 여부에 따라 포커스 트랩이 조건부 | **다르다(Base UI가 더 설정 가능)** |
| 13 | `progress` | `progressbar` role만, 키 없음 | 같음 + `getAriaValueText`/`aria-valuetext` prop | 같음 |
| 14 | `radio-group` | roving tabindex 명시, 화살표가 **이동과 동시에 선택** | 컴포넌트 이름이 **`Radio`**이고 `RadioGroup`이 그 하위. 접근 가능한 이름 안내만 있고 roving·화살표 선택 문장을 찾지 못했다 | **문서 없음** |
| 15 | `scroll-area` | "네이티브 스크롤에 기댄다 — 키보드 스크롤이 기본으로 동작한다"고 **의도를 명시**(키 표가 없는 것이 설계) | 대응 문장을 찾지 못했다. 상태 데이터 속성만 | **문서 없음** |
| 16 | `select` | ListBox 패턴. Space/Enter/화살표/Esc 표. **Home/End·typeahead 행은 없다** | **typeahead를 명시적 기능으로** 문서화, **`modal`에서 스크롤 잠금 명시**(iOS 단서 포함) | 다르다(문서화 깊이) |
| 17 | `separator` | `separator` role, 비대화형 | 같음, `data-orientation` | 같음 |
| 18 | `sheet` (Dialog) | #6과 동일 | #6과 동일. Base UI에는 별도 **Drawer** 컴포넌트도 있다 | 같음 |
| 19 | `slider` | 화살표 = step, PageUp/Down·Shift+화살표 = large step, **Home=min, End=max** | `largeStep` prop이 Page/Shift 동작을 확인해 준다. **Home/End 언급을 찾지 못했다** | step은 같음, **Home/End 문서 없음** |
| 20 | `switch` | `switch` role, Space/Enter 토글 | role·키보드 문장을 찾지 못했다 | **문서 없음** |
| 21 | `tabs` | 화살표로 포커스가 옮겨가면 **자동 활성화**(옵트아웃 언급 없음), **Home/End** | **`activateOnFocus` prop, 기본값 `false`** — 즉 **수동 활성화가 기본**. `loopFocus` 기본 `true` | **다르다 — 문서로 확인된 진짜 분기** |
| 22 | `toast` | `swipeDirection`·`swipeThreshold` 기본값, `data-[swipe=*]` | 컴포넌트는 있으나 스와이프 관련 문서를 찾지 못했다. [#120](https://github.com/flameware/massive-design/issues/120) 재조회는 upstream Base UI Toast가 **명령형 `toast.add()` 매니저**이고 `type`·`actionProps`·`toast.promise()`를 갖는다고 기록했다 — 우리 Toast는 처음부터 그 갈래가 아니다 | **다르다** |
| 23 | `toggle` | Space/Enter | 키보드 문장 없음. `pressed` 상태 API만 | **문서 없음** |
| 24 | `toggle-group` | roving tabindex 명시, "WAI-ARIA radio button 패턴", 화살표 + **Home/End** | `loopFocus`+`orientation`이 화살표 roving을 확인해 준다. "roving tabindex" 용어는 쓰지 않고 **Home/End를 찾지 못했다** | 화살표는 같을 것, **Home/End 문서 없음** |
| — | `tooltip` | Tab이 지연 없이 열고 닫는다, Space/Enter/Esc가 지연 없이 닫는다 | `escape-key` 사유는 확인. 추가로 **"터치·스크린리더 사용자에게 접근 불가"**를 명시하고 트리거에 같은 `aria-label`을 요구한다 | Esc는 같음, 문서화 깊이가 다름 |

### 6.1 축을 가로지르는 사실

- **roving focus.** Radix는 Accordion·ContextMenu·DropdownMenu·RadioGroup·ToggleGroup·Tabs·Menubar·NavigationMenu에서 **이름을 대며** 문서화한다. Base UI는 "roving tabindex"라는 용어를 어느 페이지에서도 쓰지 않고 `loopFocus`·`orientation`·`activateOnFocus` prop으로 **효과만** 노출한다 — Menu·ContextMenu·Tabs·ToggleGroup에서는 확인되고, **RadioGroup·Menubar·NavigationMenu는 확인하지 못했다.** Accordion만 **확인된 회귀**다.
- **typeahead.** Radix는 ContextMenu·DropdownMenu의 Features 목록에 적지만 키 표에는 없다(**Radix 쪽도 키 단위는 확인 불가**). Base UI는 Menu·ContextMenu에서 항목 `label` prop으로, Select에서 명시적 기능으로 문서화한다.
- **Home/End.** Radix가 명시하는 곳: Accordion·NavigationMenu·Slider(min/max)·Tabs·ToggleGroup. **그 다섯 전부 Base UI 쪽에서는 확인하지 못했다.**
- **다이얼로그의 포커스 트랩·반환.** 양쪽 동등이 확인된다 — Radix는 산문, Base UI는 `initialFocus`/`finalFocus` prop과 터치로 열었을 때의 예외(가상 키보드 회피)까지 명시.
- **스크롤 잠금.** Base UI가 Dialog·AlertDialog·Popover·Select에서 산문으로 명시한다. **Radix 페이지에는 그 문장이 없다** — 내부적으로 `react-remove-scroll`로 동작하지만 문서 사실로는 확인되지 않는다.
- **`aria-haspopup`·`aria-expanded`·`aria-controls`·`aria-labelledby` 자동 부여.** **양쪽 문서 모두 대부분의 컴포넌트에서 이 속성 이름을 문자 그대로 적지 않는다.** 둘 다 "해당 WAI-ARIA 패턴을 따른다"고만 말한다. [#127](https://github.com/flameware/massive-design/issues/127)이 Menubar·Navigation Menu에 대해 적은 문장은 그 패턴 서술에서 나온 것이고, **1차 문서에서 속성 이름 단위로 재확인되지 않는다.** 이행 판정이 이 축에 기대려면 문서가 아니라 **실물 DOM 대조**가 필요하다.

---

## 7. upstream shadcn/ui가 세 갈래를 다루는 방식

| 사실 | 출처 |
|---|---|
| 컴포넌트 문서 페이지가 **Base UI / React Aria / Radix UI** 3-way 스위처를 낸다. URL은 각각 `/docs/components/base/*`, `/aria/*`, `/radix/*`이고 **접두어 없는 URL은 Base UI로 해석된다** | [Accordion 문서](https://ui.shadcn.com/docs/components/accordion), [schema.json](https://ui.shadcn.com/schema.json) |
| **2026년 7월부터 Base UI가 기본값이다** — "Starting today, Base UI is the default component library in shadcn/ui." 같은 항목이 `shadcn create`에서 Base UI를 primary로 보이고 Radix는 `-b radix`로 선택한다고 적는다 | [Changelog: 2026-07-base-ui-default](https://ui.shadcn.com/docs/changelog/2026-07-base-ui-default) |
| 같은 항목이 **"Radix remains fully supported and not deprecated; existing projects need not migrate."**라고 적는다 | 같은 곳 |
| 이전 이정표: 2026-01 Base UI 문서 추가, 2026-02 Radix+Base UI 블록 병기 및 통합 `radix-ui` npm 패키지 + 마이그레이션 명령 | [Changelog: 2026-02-radix-ui](https://ui.shadcn.com/docs/changelog/2026-02-radix-ui) |
| CLI가 갈래를 고른다: `-b, --base <base>` = "the component library to use. (base, radix, aria)". `components.json`의 `style` 필드가 `base-*`/`radix-*`/`aria-*` 접두어로 갈래를 인코딩한다. **별도의 top-level 필드는 없다** | [`packages/shadcn/src/commands/init.ts`](https://github.com/shadcn-ui/ui/blob/main/packages/shadcn/src/commands/init.ts), [components.json 문서](https://ui.shadcn.com/docs/components-json) |

### 7.1 Radix 갈래를 언제까지 문서화하는가 — **공개된 근거가 없다**

**deprecation 시점이나 지원 종료에 대한 공개 약속을 찾지 못했다.** 찾은 것은 위의
"not deprecated" 문장 하나뿐이고 그것은 **현재 상태의 서술이지 일정이 아니다.**

찾아본 곳(전부 결과 없음):

- `gh issue list --repo shadcn-ui/ui --search "radix deprecat"` / `"base-ui default"` / `"radix support timeline"` / `"when will radix be removed"`
- `gh api repos/shadcn-ui/ui/discussions`
- WebSearch `site:github.com/shadcn-ui/ui/discussions radix deprecat`
- [Discussion #9562](https://github.com/shadcn-ui/ui/discussions/9562) (커뮤니티가 쓴 마이그레이션 가이드이며 메인테이너 발언이 아니다)
- [Issue #9191](https://github.com/shadcn-ui/ui/issues/9191), [Discussion #6248](https://github.com/shadcn-ui/ui/discussions/6248)

**맵 [#141](https://github.com/flameware/massive-design/issues/141)의 규칙대로, "upstream이 Base UI를 1차로 낸다"는 사실은 그 자체로 근거가 아니다.**
이 절은 그 사실을 기록할 뿐이고 무게를 매기지 않는다.

---

## 8. 두 라이브러리가 한 트리에 공존할 수 있는가

| 축 | 사실 | 출처 |
|---|---|---|
| 패키지 이름 | 현재 npm 이름은 **`@base-ui/react`**(v1.7.0, 2026-08-04)다. `@base-ui-components/react`는 v1.0.0-rc.0에서 멈춘 옛 이름이고 shadcn의 마이그레이션 문서 마크다운에만 남아 있다 | `npm view`, [Base UI Releases](https://base-ui.com/react/overview/releases) |
| 이름 충돌 | `radix-ui`와 `@base-ui/react`는 **이름이 겹치지 않는 별개 패키지**이고 의존 이름도 겹치지 않는다 | `npm view` |
| React peer 범위 | `radix-ui`: `^16.8 || ^17 || ^18 || ^19` / `@base-ui/react`: `^17 || ^18 || ^19` — **겹친다** | 같은 곳 |
| 실제 공존 사례 | **shadcn/ui 리포 자신이 한 파일에서 둘을 동시에 의존한다** — `apps/v4/package.json`에 `"@base-ui/react": "1.6.0"`과 `"radix-ui": "^1.4.3"`이 함께 있다 | [`apps/v4/package.json`](https://github.com/shadcn-ui/ui/blob/main/apps/v4/package.json) |
| React context 충돌 | **확인하지 못했다.** 두 라이브러리 모두 자기 context를 쓰지만, 실제 설치 트리에서 싱글턴이 겹치는지는 선언된 `dependencies`/`peerDependencies`만 본 것으로는 판정할 수 없다 | — |
| 번들 중복 | **확인하지 못했다.** 실측하려면 실제 설치와 번들 분석이 필요하고 이 조사에서 하지 않았다. [#151](https://github.com/flameware/massive-design/issues/151)(의존성 실측)이 같은 종류의 측정을 다룬다 | — |

**컴포넌트별 점진 이행의 가능성은 여기에 달려 있다**는 티켓의 전제에 대해, 확인된 것은
"패키지 이름과 peer 범위는 공존을 막지 않고, upstream 자신이 동시 설치 상태로 개발한다"까지다.
같은 화면 안에서 Radix Dialog와 Base UI Dialog가 스크롤 잠금·포커스 트랩을 각자 걸었을 때
어떻게 되는지는 **확인하지 못했다.**

---

## 9. 이행 비용의 크기 — 24개 등급

등급 넷의 뜻:

- **그대로** — part 구조·prop·동작·매니페스트 해시가 모두 서고, import 경로만 바뀐다.
- **prop 이름만** — 내부 호출 이름이나 prop 이름이 바뀌지만 우리 공개 표면과 해시는 그대로다.
- **계약 표면이 움직임** — 우리 anatomy 또는 매니페스트 해시가 움직인다. 파생 채널(Figma) 기준선이 뒤처진다.
- **동작이 다름** — 코드를 다시 쓰거나 동등물이 없다. 사람이 확인해야 한다.

`H` 표시는 [§5.2](#52-매니페스트-해시를-직접-움직이는-자리--여섯-컴포넌트)의 해시 이동이 확정된 컴포넌트다.

| # | 컴포넌트 | 등급 | 근거 |
|---|---|---|---|
| 1 | `accordion` | **동작이 다름** | Base UI가 roving focus를 **제거했다고 문서가 명시**. `Content`→`Panel`, `--radix-accordion-content-height`→`--accordion-panel-height`(우리는 그 변수를 쓰지 않는다) |
| 2 | `alert-dialog` | **계약 표면이 움직임** | Base UI에 `Cancel`/`Action` 의미 분리가 없고 `Close` 하나다. 우리 anatomy 11개 중 `AlertDialogCancel`·`AlertDialogAction`이 정확히 그 자리다. `Overlay`→`Backdrop`, `Content`→`Viewport`+`Popup` |
| 3 | `avatar` | **그대로** | `Root/Image/Fallback` 동일, 우리 클래스에 primitive `data-*`가 없다 |
| 4 | `checkbox` | **계약 표면이 움직임 (H)** | `data-[state=checked]`·`data-[state=indeterminate]`가 `checkboxVariants`의 base에 있어 해시에 박혀 있다 → `data-checked`/`data-indeterminate` |
| 5 | `collapsible` | **prop 이름만** | `Content`→`Panel`. 우리 애니메이션 클래스는 `cva` 밖이라 해시 입력이 아니고, 애초에 정의도 없다(§5.1) |
| 6 | `dialog` | **계약 표면이 움직임** | `DialogOverlay`·`DialogPortal`·`DialogContent`가 공개 anatomy인데 Base UI는 `Backdrop`·`Portal`·`Viewport`+`Popup`이다 |
| 7 | `dropdown-menu` | **동작이 다름** | 두 모드가 Radix `DropdownMenu`/`ContextMenu`를 갈아 끼우는 구조 전체가 Radix 사실 위에 서 있다 — 특히 `ContextMenuTrigger`가 포커스를 못 받는다는 사실 위에서 Shift+F10을 우리가 이었다. Base UI Context Menu의 Trigger 동작은 **확인하지 못했다**. Base UI에 `DropdownMenu`라는 이름 자체가 없다(일반 `Menu`) |
| 8 | `label` | **동작이 다름** | Base UI에 독립 Label 컴포넌트가 **없다**. `Field.Label`로 가거나 네이티브 `<label>`로 내려앉는다 — 어느 쪽도 현재 `label.tsx`의 형태가 아니다 |
| 9 | `menubar` | **동작이 다름 (H)** | 컴포넌트는 있으나 **키보드 명세가 문서에 하나도 없다.** [#127](https://github.com/flameware/massive-design/issues/127)이 계약의 근거로 삼은 좌우 이동·typeahead가 서는지 문서로 확인 불가. 더해 14개 anatomy 중 `Content`·`Label`이 `Positioner`+`Popup`·`GroupLabel`로 갈린다. 해시에 `data-[state=open]`·`data-[disabled]`가 박혀 있다 |
| 10 | `navigation-menu` | **동작이 다름 (H)** | 키보드·포커스 산문을 찾지 못했다. viewport 없는 경로가 Base UI에도 있는지 **확인하지 못했다** — [#127](https://github.com/flameware/massive-design/issues/127)이 `Viewport`·`Indicator`를 닫은 판정이 그 경로 위에 서 있다. 해시에 `data-[state=open]`·`data-[active=true]` |
| 11 | `popover` | **동작이 다름** | `openOn="hover"`가 `open`/`onOpenChange`/`onOpenAutoFocus`를 직접 미는 구조다. Base UI Popover에 세 확장점이 다 있는지, `Anchor` 파트가 있는지 **확인하지 못했다**. 포커스 트랩이 `Popover.Close` 렌더 여부에 조건부라는 것은 우리 press 모드 전제와 다르다 |
| 12 | `progress` | **prop 이름만** | Base UI가 `Track`을 하나 더 두지만 우리 anatomy는 `Progress`/`ProgressIndicator` 둘이고 내부에 숨길 수 있다. `transform` 계산은 우리 것 |
| 13 | `radio-group` | **계약 표면이 움직임** | `Item`이 별도 컴포넌트 `Radio.Root`다. 우리 anatomy `RadioGroupItem*`이 그 자리. roving·화살표 선택은 **확인하지 못했다** |
| 14 | `scroll-area` | **prop 이름만** | `Content` 노드가 하나 낀다(내부에 숨길 수 있다). 뷰포트 포커스는 원래 우리가 붙였다. 다만 Base UI의 네이티브 스크롤 위임 여부는 **확인하지 못했다** |
| 15 | `select` | **계약 표면이 움직임** | `Content`가 `Positioner`+`Popup`+`List` 셋으로, `Label`→`GroupLabel`, `ScrollUp/DownButton`→`ScrollUp/DownArrow`. 우리가 기본값으로 쥔 Radix 전용 `position="popper"`의 대응물은 **확인하지 못했다** |
| 16 | `separator` | **prop 이름만** | 양쪽 다 단일 `Root`. 우리가 기본값으로 쥔 `decorative`의 Base UI 대응은 **확인하지 못했다** |
| 17 | `sheet` | **계약 표면이 움직임** | `dialog`와 같다. Base UI에 별도 `Drawer`가 있다는 사실은 [#97](https://github.com/flameware/massive-design/issues/97)이 Drawer를 Sheet에 대해 배제한 판정과 만나는 자리지만, 그 재판정은 이 티켓의 일이 아니다 |
| 18 | `slider` | **계약 표면이 움직임 (H)** | `Control`이 낀다, `Range`→`Indicator`. 해시에 `data-[orientation=*]`·`data-[disabled]`가 박혀 있다(둘 다 Base UI에서 **이름이 같다** — 값 형태만 확인 필요). **Home/End는 확인하지 못했다** |
| 19 | `switch` | **계약 표면이 움직임 (H)** | `Root`/`Thumb` 동일이지만 해시에 `data-[state=checked]`가 박혀 있다 → `data-checked`. role·키보드는 **확인하지 못했다** |
| 20 | `tabs` | **동작이 다름** | Radix는 화살표 이동 시 **자동 활성화**, Base UI는 `activateOnFocus` 기본 `false`(**수동 활성화**). 우리 계약의 `selected: inactive|active`가 나르는 의미는 같지만 사용자가 보는 동작이 바뀐다. `Trigger`→`Tab`, `Content`→`Panel`, Base UI에는 `Indicator`도 있다 |
| 21 | `toast` | **동작이 다름** | 가장 큰 자리. Radix Toast의 스와이프 기본값·`data-[swipe=*]`·`--radix-toast-swipe-*-x` 위에 ADR-0005의 `gestures`가 서 있다. Base UI 대응 변수는 **확인하지 못했고**, upstream Base UI Toast는 명령형 `toast.add()` 매니저라 우리 컴포넌트 집합과 형태 자체가 다르다([#120](https://github.com/flameware/massive-design/issues/120) 기록) |
| 22 | `toggle` | **계약 표면이 움직임 (H)** | `data-[state=on]` → **`data-pressed`**. 해시에 박혀 있고 이름 자체가 다른 축이다 |
| 23 | `toggle-group` | **계약 표면이 움직임** | Base UI Toggle Group에 `Item` 파트가 **없다** — 독립 `Toggle`을 안에 조립한다. 우리 anatomy `ToggleGroupItem*`이 그 자리. Home/End는 **확인하지 못했다** |
| 24 | `tooltip` | **prop 이름만** | `Content`→`Positioner`+`Popup`(내부에 숨길 수 있다), `Provider` 있음. Radix의 3상태 `data-state`를 우리는 쓰지 않는다 |

### 9.1 집계

| 등급 | 개수 | 컴포넌트 |
|---|---|---|
| 그대로 | 1 | `avatar` |
| prop 이름만 | 5 | `collapsible`, `progress`, `scroll-area`, `separator`, `tooltip` |
| 계약 표면이 움직임 | 10 | `alert-dialog`, `checkbox`, `dialog`, `radio-group`, `select`, `sheet`, `slider`, `switch`, `toggle`, `toggle-group` |
| 동작이 다름 | 8 | `accordion`, `dropdown-menu`, `label`, `menubar`, `navigation-menu`, `popover`, `tabs`, `toast` |

합계 1 + 5 + 10 + 8 = 24다.

**매니페스트 해시가 확정적으로 움직이는 것은 여섯 개**(`checkbox`·`switch`·`toggle`·`menubar`·`navigation-menu`·`slider`)이고,
그중 `slider`의 두 속성은 Base UI에서 **이름이 같다**(`data-orientation`·`data-disabled`) — 값 형태가 같은지만 확인하면
움직이지 않을 수도 있다. **확정적으로 움직이는 것은 다섯 개**로 좁혀질 여지가 있다.

anatomy가 움직이면 그 컴포넌트 해시도 함께 움직이므로, **해시가 움직이는 최대 집합은 위 "계약 표면이 움직임" 10개 + 해시 6개의 합집합**이다.
정확한 수는 anatomy를 어디까지 공개할지 정하기 전에는 셀 수 없다 — 이 문서는 그 선택을 하지 않는다.

`AGENTS.md`가 P2 맵의 열린 질문으로 적어 둔 "configuration-state modifiers landing as `unresolved` in manifests"가
바로 §5.2의 그 자리다. **그 공백을 먼저 닫으면(수식자를 `MODIFIER_POLICY`로 다루면) 여섯 개 중 몇 개는
`data-*` 이름 변경에 면역이 된다.** 이 사실은 판정의 입력이지 판정이 아니다.

---

## 10. 확인하지 못한 것 전부

이 목록이 §0–§9의 "확인하지 못했다"를 한자리에 모은 것이다. 판정([#152](https://github.com/flameware/massive-design/issues/152))이 이 중 어느 것에 기대려 한다면
그 항목을 먼저 실측해야 한다.

**Base UI 문서에 문장이 없어 확인 못한 접근성 동작**

1. Menubar의 키보드·ARIA 명세 **전부** — 좌우 이동, 열린 메뉴 안에서의 건너뛰기, Home/End, typeahead. 이번 조사에서 가장 큰 공백이다.
2. Navigation Menu의 키보드·포커스 관리 산문 전부 — 화살표 이동, Home/End, Esc 후 트리거 포커스 반환.
3. Radio Group의 roving tabindex와 "화살표가 이동과 동시에 선택".
4. Slider의 Home/End(min/max).
5. Tabs·ToggleGroup·Accordion·NavigationMenu의 Home/End.
6. Checkbox·Collapsible·Switch·Toggle의 Space/Enter 키 동작과 `switch` role.
7. Scroll Area가 네이티브 스크롤에 위임하는지.
8. `aria-haspopup`·`aria-expanded`·`aria-controls`·`aria-labelledby`의 자동 부여 — **Radix 쪽도 문서에 속성 이름이 없다.** 양쪽 다 문서가 아니라 실물 DOM으로만 확인된다.
9. Base UI Context Menu Trigger가 포커스를 받는지, 롱프레스 임계값이 얼마인지.

**Base UI의 API·변수 대응물**

10. `--radix-toast-swipe-move-x`/`--radix-toast-swipe-end-x`의 대응물.
11. Base UI Popover에 `Anchor` 파트가 있는지.
12. Base UI Popover에 `onOpenAutoFocus` 대응 확장점이 있는지(`openOn="hover"`의 전제).
13. Base UI Navigation Menu에 viewport 없는 렌더 경로가 있는지([#127](https://github.com/flameware/massive-design/issues/127)의 판정 전제).
14. Base UI Select에 `position="popper"` 대응 prop이 있는지.
15. Base UI Separator에 `decorative` 대응 prop이 있는지.
16. Base UI Separator의 정확한 속성 집합.
17. Base UI에 `Slot` 단독 유틸이 있는지(`button.tsx`·`breadcrumb.tsx`가 `Slot.Root`를 직접 쓴다).
18. Base UI에 `VisuallyHidden` 유틸이 있는지.
19. Radix `Password Toggle Field`의 Base UI 대응물(우리는 쓰지 않는다).

**공존**

20. `radix-ui`와 `@base-ui/react`가 한 트리에 있을 때의 React context 충돌 — 선언된 의존만 봤고 실제 설치 트리를 풀지 않았다.
21. 번들 중복의 크기 — 실측하지 않았다.
22. 한 화면에서 두 라이브러리의 모달이 동시에 스크롤 잠금·포커스 트랩을 걸었을 때의 동작.

**upstream**

23. Radix 갈래의 문서화·지원 종료 시점 — **공개된 근거를 찾지 못했다**(§7.1에 찾아본 곳을 적었다). "없다고 적는다"가 티켓의 요구였고 그대로 적는다.

---

## 11. 조사 방법과 한계

- 1차 출처만 썼다: base-ui.com, radix-ui.com, ui.shadcn.com, 그리고 `mui/base-ui`·`radix-ui/primitives`·`shadcn-ui/ui` 리포. 2차 정리 글은 쓰지 않았다.
- 문서 페이지는 렌더된 텍스트를 추출해 읽었다. 따라서 §6의 "문서 없음"은 **"추출된 텍스트에서 확인되지 않았다"**는 뜻이지 "그 동작이 없다"가 아니다. [#120](https://github.com/flameware/massive-design/issues/120) 재조회가 같은 한계를 기록했다.
- **실물 실행 확인은 하지 않았다.** 이 리포에 `node_modules`가 없어 설치된 `radix-ui` 소스에서 `--radix-*` 변수 이름을 대조하는 것도 하지 못했다. `@base-ui/react`는 설치조차 되어 있지 않다. 프로토타입은 [#152](https://github.com/flameware/massive-design/issues/152)가 필요하다고 판단하면 그쪽에서 만든다(맵 [#141](https://github.com/flameware/massive-design/issues/141)이 허용한 유일한 코드다).
- 리포 쪽 사실(§5·§9)은 전부 소스와 커밋된 매니페스트(`packages/ui/dist/manifest/*.gen.json`)를 직접 읽어 셌다. 해시 입력의 판정은 `packages/ui/scripts/manifest/hash.mjs`의 `figmaPayload`와 `classify.mjs`의 `MODIFIER_POLICY`를 읽고 생성된 매니페스트에서 실제 키를 확인한 것이다.
