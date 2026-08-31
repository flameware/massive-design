# shadcn/ui 카탈로그 재조회 — 2026-08-23 기준선 대비 diff

- 티켓: [#120](https://github.com/flameware/massive-design/issues/120) (wayfinder 맵 [#118](https://github.com/flameware/massive-design/issues/118)의 하위 항목)
- 이전 기준선: [#71](https://github.com/flameware/massive-design/issues/71) / `docs/research/shadcn-component-gap.md` (브랜치 `research/shadcn-component-gap`, 조사일 **2026-08-23**, 카탈로그 64개)
- **조사일: 2026-08-31**
- 대상: https://ui.shadcn.com/docs/components (공식 문서, 1차 출처)

**이 문서는 결정하지 않는다.** 우선순위를 매기거나 추천하지 않는다. [#74](https://github.com/flameware/massive-design/issues/74)가 정한 대로 새 항목을 자동 편입하지 않는다. 여기서는 "지금 upstream이 무엇을 제공하는가"와 "2026-08-23 이후 무엇이 바뀌었는가"만 사실로 적는다.

---

## 0. 방법

1. `https://ui.shadcn.com/docs/components`의 사이드바 컴포넌트 목록을 **두 번 독립적으로** 조회했다. 캐시로 인한 동일 응답을 배제하기 위해 두 번째 조회는 사이드바가 동일하게 렌더되는 **다른 URL**(`https://ui.shadcn.com/docs/components/base/accordion`)에서 수행했다. 두 결과가 항목·순서·개수까지 일치했다.
2. 공식 changelog(`https://ui.shadcn.com/docs/changelog`)를 조회해 2026-08-20 이후 카탈로그 변경 항목이 있는지 확인했다.
3. massive-design에 이미 구현된 컴포넌트에 대응하는 개별 문서 페이지(`https://ui.shadcn.com/docs/components/base/<slug>`)를 각각 직접 조회해 이름·설명·구현 기반(Base UI / React Aria / Radix UI)·variant/size/주요 서브컴포넌트를 확인하고 2026-08-23 기록과 대조했다.
4. `packages/ui/src/components/ui/`를 `ls`로 나열하고, 각 파일의 `import` 문을 grep해 실제 사용 중인 프리미티브 라이브러리를 확인했다.
5. `packages/ui/components.json`을 재확인했다(2026-08-23 기록과 동일: `style: new-york`, `baseColor: neutral`, `rsc: false`, `iconLibrary: lucide`).

---

## 1. 결론 요약 (2026-08-23 → 2026-08-31)

| 축 | 결과 |
|---|---|
| 카탈로그 총 개수 | **64 → 64 (변동 없음)** |
| 추가된 컴포넌트 | **없음** |
| 제거된 컴포넌트 | **없음** |
| 이름이 바뀐 컴포넌트 | **없음** |
| 사이드바 항목 순서 | 동일 (Accordion … Typography, 알파벳순) |
| changelog상 신규 컴포넌트 엔트리 | **없음** (최상단 3개 엔트리는 "Private GitHub Registries", "Human in the Loop", "Questionnaire". 앞 두 개는 컴포넌트가 아니라 레지스트리/워크플로 기능이고, Questionnaire는 2026-08-23 기준선 64개에 이미 포함돼 있다. changelog는 **월 단위 표기만** 하고 일자를 적지 않아 2026-08-20 이후인지 자체로는 판정 불가 — 다만 카탈로그 목록 자체가 불변이므로 신규 컴포넌트가 없다는 결론은 §2로 독립 확인된다) |

즉 **8일간 shadcn/ui 공식 카탈로그의 항목 집합에는 변화가 없다.** 새 항목이 없으므로 이 티켓의 "새 항목에 대한 기반성 분류 후보 제시" 조건은 **해당 사항 없음**이다.

massive-design 쪽은 같은 기간에 크게 늘었다: **10개 파일(비교 대상 9개) → 43개 파일(비교 대상 42개)**. 아래 §4 참고.

---

## 2. 2026-08-31 shadcn/ui 공식 카탈로그 (64개)

출처: https://ui.shadcn.com/docs/components — 2회 독립 조회 교차 확인.

Accordion, Alert, Alert Dialog, Aspect Ratio, Attachment, Avatar, Badge, Breadcrumb, Bubble, Button, Button Group, Calendar, Card, Carousel, Chart, Checkbox, Collapsible, Combobox, Command, Context Menu, Data Table, Date Picker, Dialog, Direction, Drawer, Dropdown Menu, Empty, Field, Hover Card, Input, Input Group, Input OTP, Item, Kbd, Label, Marker, Menubar, Message, Message Scroller, Native Select, Navigation Menu, Pagination, Popover, Progress, Questionnaire, Radio Group, Resizable, Scroll Area, Select, Separator, Sheet, Sidebar, Skeleton, Slider, Spinner, Switch, Table, Tabs, Textarea, Toast, Toggle, Toggle Group, Tooltip, Typography.

2026-08-23 목록과 **문자열 단위로 동일**하다.

- `Typography`는 사이드바 표기이고 실제 문서 페이지 타이틀은 여전히 **"Typeset"**이다(기준선과 동일). 페이지 설명: "A styling system for HTML and rendered markdown, from blog posts to streaming chat. One CSS file you own." preset 클래스 `.typeset`, `.typeset-docs`, `.typeset-chat`, `.typeset-reading`, `.typeset-compact`, `.typeset-large`, `.typeset-scroll`, opt-out `.not-typeset` / `data-not-typeset`; 변수 `--typeset-font-body/-heading/-mono`, `--typeset-size`, `--typeset-leading`, `--typeset-flow`. 기준선에는 preset·변수 일부만 기록돼 있었는데, 이는 문서 변경이 아니라 **기준선 기록의 상세도 차이**다.

---

## 3. massive-design의 현재 컴포넌트 세트 (43개 파일)

`ls packages/ui/src/components/ui/`로 직접 확인:

```
accordion.tsx      collapsible.tsx    label.tsx          slider.tsx
alert-dialog.tsx   combobox.tsx       list-row.tsx       spinner.tsx
alert.tsx          command.tsx        native-select.tsx  switch.tsx
avatar.tsx         dialog.tsx         pagination.tsx     table.tsx
badge.tsx          dropdown-menu.tsx  popover.tsx        tabs.tsx
breadcrumb.tsx     empty.tsx          progress.tsx       textarea.tsx
button-group.tsx   field.tsx          radio-group.tsx    toast.tsx
button.tsx         input-group.tsx    scroll-area.tsx    toggle-group.tsx
calendar.tsx       input.tsx          select.tsx         toggle.tsx
card.tsx           item.tsx           separator.tsx      tooltip.tsx
checkbox.tsx                          sheet.tsx
                                      skeleton.tsx
```

- `list-row.tsx`는 shadcn/ui 카탈로그에 대응 항목이 없는 massive-design 자체 컴포넌트다(기준선과 동일하게 비교 대상에서 제외).
- 따라서 shadcn/ui와 비교 가능한 "present" 집합은 **42개**.
- 2026-08-23 기준선의 present 집합은 9개(badge, button, card, checkbox, dropdown-menu, input, label, select, table)였다. 이후 **33개가 추가**되었다: accordion, alert, alert-dialog, avatar, breadcrumb, button-group, calendar, collapsible, combobox, command, dialog, empty, field, input-group, item, native-select, pagination, popover, progress, radio-group, scroll-area, separator, sheet, skeleton, slider, spinner, switch, tabs, textarea, toast, toggle, toggle-group, tooltip.
- 미구현 gap: 64 − 42 = **22개** (Aspect Ratio, Attachment, Bubble, Carousel, Chart, Context Menu, Data Table, Date Picker, Direction, Drawer, Hover Card, Input OTP, Kbd, Marker, Menubar, Message, Message Scroller, Navigation Menu, Questionnaire, Resizable, Sidebar, Typography). 2026-08-23의 55개에서 22개로 줄었다. **이 감소는 upstream 변화가 아니라 전적으로 massive-design 측 구현 증가 때문이다.**

---

## 4. 우리가 이미 구현한 42개의 upstream 현황 (호환성 계약에 영향)

각 행은 `https://ui.shadcn.com/docs/components/base/<slug>` 페이지를 **2026-08-31에 개별 조회**한 결과다. "기준선 대비" 열은 2026-08-23 기록(`docs/research/shadcn-component-gap.md` §3/§4)과의 차이만 적는다.

### 4.1 구현 기반(implementation basis) — 전 항목 공통

조회한 42개 페이지 **전부**에서 문서가 **Base UI / React Aria / Radix UI** 세 가지 구현을 전환 스위처로 제공한다. `/docs/components/base/<slug>` URL에서는 **Base UI 구현이 활성(primary)** 이다. 이는 2026-08-23 기록과 **동일하며, 변경 없음**이다.

- 단, 페이지가 "Base UI가 기본"이라고 **문자로 선언하지는 않는다.** 스위처에서 Base UI가 첫 번째이자 활성 상태라는 사실에서 도출한 것이다.
- 예외: `command`는 세 프리미티브가 아니라 **`cmdk`** 기반이라고 페이지가 명시한다. `calendar`는 **React DayPicker** 기반이다. `table`은 프리미티브 없는 순수 마크업이며 정렬/필터/페이지네이션은 `@tanstack/react-table`을 권한다. `typography(Typeset)`은 CSS 전용이다. 모두 기준선과 동일하다.

**massive-design 측 대비.** `packages/ui/src/components/ui/*.tsx`의 `import`를 grep한 결과, 우리 구현 중 프리미티브를 쓰는 것은 **전부 `radix-ui`** 패키지다(accordion, alert-dialog, avatar, breadcrumb, button, checkbox, collapsible, dialog, dropdown-menu, label, popover, progress, radio-group, scroll-area, select, separator, sheet, slider, switch, tabs, toast, toggle, toggle-group, tooltip = 24개). 나머지 18개는 프리미티브 없이 자체 마크업이다(alert, badge, button-group, calendar, card, combobox, command, empty, field, input, input-group, item, native-select, pagination, skeleton, spinner, table, textarea). 즉 **우리는 upstream이 primary로 제시하는 Base UI가 아니라 Radix UI 갈래를 따르고 있다.** 이는 2026-08-23 이후 생긴 변화가 아니라 이 기간에 33개를 구현하며 일관되게 선택된 상태이며, upstream 문서가 세 갈래를 모두 계속 제공하므로 **현시점 upstream 변경으로 인한 파손 요인은 확인되지 않는다.**

### 4.2 항목별 확인 결과

| 컴포넌트 | upstream 이름 (2026-08-31) | 문서 설명 | variant / size / 주요 prop | 기준선(2026-08-23) 대비 |
|---|---|---|---|---|
| Accordion | Accordion | "A vertically stacked set of interactive headings that each reveal a section of content." | `defaultValue`, `multiple`, `disabled`, item `value`; Accordion/Item/Trigger/Content | 변경 없음 |
| Alert | Alert | "Displays a callout for user attention." | `variant`: default, destructive | 변경 없음. 서브컴포넌트 `AlertAction`이 문서에 있음(기준선에는 미기록 — 기록 누락으로 보이며 신규 여부 미확정) |
| Alert Dialog | Alert Dialog | "A modal dialog that interrupts the user with important content and expects a response." | `size`: default, sm; Trigger/Content/Header/Media/Title/Description/Footer/Cancel/Action | 변경 없음 |
| Avatar | Avatar | "An image element with a fallback for representing the user." | `size`: default, sm, lg; AvatarImage/Fallback/Badge/Group/GroupCount | 변경 없음 (`AvatarGroupCount`는 기준선 미기록) |
| Badge | Badge | "Displays a badge or a component that looks like a badge." | `variant`: default, secondary, destructive, outline, ghost, link | 변경 없음 |
| Breadcrumb | Breadcrumb | "Displays the path to the current resource using a hierarchy of links." | List/Item/Link(`render`)/Page/Separator/Ellipsis | 변경 없음 |
| Button | Button | "Displays a button or a component that looks like a button." | `variant`: default, outline, ghost, destructive, secondary, link / `size`: default, xs, sm, lg, icon, icon-xs, icon-sm, icon-lg | 변경 없음 |
| Button Group | Button Group | "A container that groups related buttons together with consistent styling." | `orientation`: horizontal(기본), vertical; ButtonGroupSeparator, ButtonGroupText | 변경 없음 |
| Calendar | Calendar | "A calendar component that allows users to select a date or a range of dates." | `mode`: single/range, `selected`, `onSelect`, `captionLayout="dropdown"`, `timeZone`; React DayPicker 기반 | 변경 없음. 페르시아/히즈리/잘랄리력은 `variant` prop이 아니라 **import 교체**로 제공됨(기준선의 "페르시아력 옵션" 표현을 정정) |
| Card | Card | "Displays a card with header, content, and footer." | `size`: default, sm; Header/Title/Description/Action/Content/Footer, `--card-spacing` | 변경 없음 |
| Checkbox | Checkbox | "A control that allows the user to toggle between checked and not checked." | `checked`/`defaultChecked`/`onCheckedChange`/`disabled`/`aria-invalid` | 변경 없음 |
| Collapsible | Collapsible | "An interactive component which expands/collapses a panel." | `open`, `onOpenChange` | 변경 없음 |
| Combobox | Combobox | "Autocomplete input with a list of suggestions." | `items`, `multiple`, `value`/`onValueChange`, `itemToStringValue`, `showClear`, `autoHighlight`, `render`, `disabled`; Chips 계열 서브컴포넌트 | 변경 없음 |
| Command | Command | "Command menu for search and quick actions." | Input/List/Empty/Group/Item/Separator/Shortcut/Dialog; `cmdk` 기반 | 변경 없음 |
| Dialog | Dialog | "A window overlaid on either the primary window or another dialog window, rendering the content underneath inert." | `showCloseButton` | 변경 없음 |
| Dropdown Menu | Dropdown Menu | "Displays a menu to the user — such as a set of actions or functions — triggered by a button." | 아이템 `variant="destructive"`; Checkbox/Radio 아이템, Sub 메뉴, Shortcut | 변경 없음 |
| Empty | Empty | "Use the Empty component to display an empty state." | `EmptyMedia` `variant`: default, icon; Header/Title/Description/Content | 변경 없음 |
| Field | Field | "Combine labels, controls, and help text to compose accessible form fields and grouped inputs." | `orientation`: vertical(기본)/horizontal/responsive; `FieldLegend` `variant`: legend(기본)/label; `FieldError` `errors`; FieldSet/Group/Content/Label/Title/Description/Separator | 변경 없음. `FieldLegend`의 `variant`(legend/label)는 기준선 미기록 |
| Input | Input | (설명 문구는 조회 시 요약형으로 반환되어 **축자 인용 미확보**) | `disabled`, `aria-invalid`, `type`(`file` 포함), `required` | 변경 없음 |
| Input Group | Input Group | "Add addons, buttons, and helper content to inputs." | `InputGroupAddon` `align`: inline-start(기본)/inline-end/block-start/block-end · `InputGroupButton` `variant`: default/destructive/outline/secondary/ghost/link(기본 ghost), `size`: xs(기본)/icon-xs/sm/icon-sm | 변경 없음. `InputGroupButton`의 variant·size 집합은 기준선 미기록 |
| Item | Item | "A versatile component for displaying content with media, title, description, and actions." | `variant`: default/outline/muted · `size`: default/sm/xs · `ItemMedia` `variant`: default/icon/**image** · `render` | 변경 없음. `ItemMedia`의 `image` 값은 기준선 미기록 |
| Label | Label | "Renders an accessible label associated with controls." | `htmlFor`; API는 Base UI Label 문서로 위임 | 변경 없음 |
| Native Select | Native Select | "A styled native HTML select element with consistent design system integration." | NativeSelectOption(`value`,`disabled`), NativeSelectOptGroup(`label`,`disabled`) | 변경 없음 |
| Pagination | Pagination | "Pagination with page navigation, next and previous links." | `PaginationLink` `isActive`; `PaginationPrevious`/`Next` `text`; Content/Item/Ellipsis | 변경 없음. `text` prop은 기준선 미기록 |
| Popover | Popover | "Displays rich content in a portal, triggered by a button." | `PopoverContent` `align`: start/center/end; Header/Title/Description | 변경 없음 |
| Progress | Progress | "Displays an indicator showing the completion progress of a task, typically displayed as a progress bar." | `value`; ProgressLabel/Value/Track/Indicator | 변경 없음 |
| Radio Group | Radio Group | "A set of checkable buttons—known as radio buttons—where no more than one of the buttons can be checked at a time." | `defaultValue`, `disabled`, `aria-invalid`; RadioGroupItem | 변경 없음. **주의:** 문서의 Default/Comfortable/Compact 예시는 **prop이 아니라 클래스 조합 예시**이며 해당 prop 이름은 문서에 명시돼 있지 않다(기준선이 "간격 variant"처럼 적은 것을 정정) |
| Scroll Area | Scroll Area | "Augments native scroll functionality for custom, cross-browser styling." | `ScrollBar` `orientation`(예: horizontal) | 변경 없음. `orientation`이 `ScrollArea`가 아니라 **`ScrollBar`** 에 있다는 점이 기준선 표현과 다르다 |
| Select | Select | "Displays a list of options for the user to pick from—triggered by a button." | Trigger/Value/Content(`alignItemWithTrigger`)/Group/Label/Item/Separator | 변경 없음. `alignItemWithTrigger`는 기준선 미기록 |
| Separator | Separator | "Visually or semantically separates content." | `orientation`(기본 horizontal, `vertical` 지정 가능) | 변경 없음 |
| Sheet | Sheet | "Extends the Dialog component to display content that complements the main content of the screen." | `side`: top/right/bottom/left; `showCloseButton`(기본 true) | 변경 없음 |
| Skeleton | Skeleton | "Use to show a placeholder while content is loading." | `className`만 | 변경 없음 |
| Slider | Slider | "An input where the user selects a value from within a given range." | `defaultValue`(배열), `max`, `step`, `orientation="vertical"`, `disabled`; 범위·다중 썸 | 변경 없음 |
| Spinner | Spinner | "An indicator that can be used to show a loading state." | 명명된 `size` 값 없음 — `size-*` 유틸리티 사용. 기본 `role="status"`, `aria-label="Loading"`, 아이콘 교체 가능(기본 lucide `LoaderIcon`) | 변경 없음 |
| Switch | Switch | "A control that allows the user to toggle between checked and not checked." | size: Small / Default; `disabled`, `aria-invalid` | 변경 없음 |
| Table | Table | "A responsive table component." | Table/Caption/Header/Row/Head/Body/Cell/Footer | 변경 없음 |
| Tabs | Tabs | "A set of layered sections of content—known as tab panels—that are displayed one at a time." | `TabsList` `variant="line"`; `defaultValue`, `orientation="vertical"` | 변경 없음 |
| Textarea | Textarea | "Displays a form textarea or a component that looks like a textarea." | `disabled`, `aria-invalid` | 변경 없음 |
| Toast | Toast | "A succinct message that is displayed temporarily." | **`type`**: success/info/warning/error/loading · `title`, `description`, `actionProps` · 명령형 API `toast.add()`, `toast.close()`, `toast.promise()` | 아래 §5 참고 — **표기 차이 1건** |
| Toggle | Toggle | "A two-state button that can be either on or off." | `variant="outline"`; size 섹션은 Small / Default / Large 세 예시 | 아래 §5 참고 — **미확정 1건** |
| Toggle Group | Toggle Group | "A set of two-state buttons that can be toggled on or off." | `type="single"`, `variant="outline"`, `orientation="vertical"`, **`spacing`**(숫자; 기본값이 2026-05-17 업데이트에서 `2`로 변경, 붙은 형태는 `spacing={0}`) | `spacing` prop은 기준선 미기록. 문서상 변경일(2026-05-17)이 **기준선 이전**이므로 이번 기간의 신규 변경은 아니다 |
| Tooltip | Tooltip | "A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it." | `side`: left/top/bottom/right; TooltipProvider 필요 | 변경 없음 |

---

## 5. 기준선 기록과 문구가 어긋나는 2건 (판정 보류)

이 둘은 **upstream이 바뀐 것인지, 2026-08-23 기록이 부정확했던 것인지 이번 조회만으로는 구분되지 않는다.** 사실만 남긴다.

1. **Toast의 상태 prop 이름.** 2026-08-31 문서는 축자로 이렇게 적는다: "Set the `type` option to render a status icon. The built-in renderer recognizes `success`, `info`, `warning`, `error`, and `loading`." → prop 이름은 **`type`**. 2026-08-23 기준선 문서는 같은 값 집합을 `status:`로 적었다. 값 집합(success/info/warning/error/loading)은 양쪽이 동일하다. **값은 변하지 않았고 이름 표기만 다르다.**
2. **Toggle의 `size` 값 문자열.** 2026-08-31 페이지는 Size 섹션에 "Small / Default / Large" 세 예시를 보여주지만 **JSX에 쓰이는 문자열 값을 명시하지 않고** 전체 API를 Base UI Toggle 문서로 위임한다. 기준선은 `sm / default / lg`로 기록했다. 페이지에서 문자열을 확인할 수 없으므로 **upstream 값이 바뀌었다는 근거도, 바뀌지 않았다는 근거도 이 페이지에는 없다.**

### 5.1 우리 구현과의 대조(사실만)

- `packages/ui/src/components/ui/toggle.tsx`의 `size`는 **`sm` / `default` / `lg`** 이다(cva 설정에서 직접 확인). 즉 기준선 기록과 일치한다.
- `packages/ui/src/components/ui/toast.tsx`는 upstream의 명령형 `toast.add()` 매니저 API가 아니라 **Radix Toast 프리미티브 기반의 컴포넌트 집합**(`Toast`, `ToastViewport`, `ToastTitle`, `ToastDescription`, `ToastAction`, `ToastClose`)이다. `type`/`status` prop도, `actionProps`도, `toast.promise()`도 존재하지 않는다. 이 구조 차이는 이번 기간에 생긴 upstream 변경이 아니라 **처음부터의 구현 갈래 차이**다.
- `packages/ui/src/components/ui/toggle-group.tsx`에는 `spacing` prop이 없다(grep 결과 0건).

---

## 6. 새 항목 분류 후보

**해당 사항 없음.** 2026-08-23 이후 추가된 컴포넌트가 없으므로 "범용 화면 조립에 필요한 기반성" 기준의 분류 후보를 제시할 대상이 존재하지 않는다.

---

## 7. 다음 기준선 (이 문서가 대체하는 값)

- **기준선 일자: 2026-08-31**
- **shadcn/ui 카탈로그: 64개** (§2 목록)
- **massive-design 구현: 43개 파일 / 비교 대상 42개** (§3 목록), **gap 22개**
- **구현 기반: upstream은 Base UI(primary) / React Aria / Radix UI 3갈래 병기, massive-design은 Radix UI 갈래**

## 8. 조회 URL

조사일 **2026-08-31**. 모두 1차 출처(공식 문서)다.

- https://ui.shadcn.com/docs/components — 카탈로그 사이드바 (1차 조회)
- https://ui.shadcn.com/docs/components/base/accordion — 동일 사이드바 교차 확인용 (2차 독립 조회)
- https://ui.shadcn.com/docs/changelog — 2026-08-20 이후 변경 항목 확인
- 개별 컴포넌트 문서 페이지 `https://ui.shadcn.com/docs/components/base/<slug>` — 우리가 구현한 42개에 대응하는 slug 전체:
  `accordion`, `alert`, `alert-dialog`, `avatar`, `badge`, `breadcrumb`, `button`, `button-group`, `calendar`, `card`, `checkbox`, `collapsible`, `combobox`, `command`, `dialog`, `dropdown-menu`, `empty`, `field`, `input`, `input-group`, `item`, `label`, `native-select`, `pagination`, `popover`, `progress`, `radio-group`, `scroll-area`, `select`, `separator`, `sheet`, `skeleton`, `slider`, `spinner`, `switch`, `table`, `tabs`, `textarea`, `toast`, `toggle`, `toggle-group`, `tooltip`
- https://ui.shadcn.com/docs/components/base/typography — Typeset 페이지 (사이드바 표기명과 페이지 타이틀 불일치 재확인)

리포지토리 직접 확인: `packages/ui/src/components/ui/`(파일 목록 및 각 파일 `import` grep), `packages/ui/components.json`.

## 9. 조사 한계

- 컴포넌트 문서 페이지는 렌더된 마크다운을 요약 모델이 추출하는 방식으로 조회했다. 따라서 표의 "미기록/명시 없음"은 **"페이지에 없다"가 아니라 "추출된 텍스트에서 확인되지 않았다"** 를 뜻한다. §5의 2건은 그래서 별도 재조회로 축자 확인을 시도했고, Toast는 확인됐으나 Toggle의 `size` 문자열은 페이지 자체에 없어 확인되지 않았다.
- 여러 페이지(Collapsible, Command, Dialog, Label, Toggle, Toggle Group, Toast)가 전체 API를 Base UI 또는 cmdk 문서로 위임한다. 이 문서는 **shadcn/ui 페이지에 적힌 것만** 사실로 기록했고, 위임 대상 문서까지는 조회하지 않았다.
- 우리가 구현하지 않은 22개(Aspect Ratio, Attachment, Bubble, Carousel, Chart, Context Menu, Data Table, Date Picker, Direction, Drawer, Hover Card, Input OTP, Kbd, Marker, Menubar, Message, Message Scroller, Navigation Menu, Questionnaire, Resizable, Sidebar, Typography)는 **카탈로그 존재 여부만** 확인했고 variant 수준의 재검증은 하지 않았다. 이름이 모두 기준선과 동일하고 신규/삭제가 없으므로 호환성 계약에 영향이 없기 때문이다. Typography만 예외적으로 페이지 타이틀 불일치를 재확인했다.
