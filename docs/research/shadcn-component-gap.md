# shadcn/ui 카탈로그 대비 massive-design 컴포넌트 공백 조사

- 티켓: [#71](https://github.com/flameware/massive-design/issues/71) (massive-design 카탈로그 확장 gap 맵 [#70](https://github.com/flameware/massive-design/issues/70)의 하위 항목)
- 조사일: 2026-08-23
- 대상: https://ui.shadcn.com/docs/components (공식 문서, 1차 출처)

**이 문서는 결정하지 않는다.** 무엇을 다음에 만들지 우선순위를 매기거나 추천하지 않는다 — 그것은 이 티켓에 막혀 있는 [#74](https://github.com/flameware/massive-design/issues/74)의 몫이다. 여기서는 "shadcn/ui가 지금 무엇을 제공하는가"와 "massive-design에 지금 무엇이 있는가"만 사실로 정리한다.

---

## 0. 방법

1. `https://ui.shadcn.com/docs/components`를 WebFetch로 두 번 독립적으로 가져와 컴포넌트 목록이 일치하는지 확인했다(공식 문서 사이드바 기준 64개).
2. 목록에 없던 이름들(Attachment, Bubble, Direction, Empty, Field, Item, Kbd, Marker, Message, Message Scroller, Native Select, Questionnaire, Spinner, Button Group, Input Group 등)이 실재하는지 각 컴포넌트의 개별 문서 페이지(`/docs/components/base/<slug>`)를 직접 가져와 확인했다.
3. `packages/ui/src/components/ui/`를 직접 `ls`로 나열해 실제 존재하는 파일과 대조했다.
4. `packages/ui/components.json`을 확인해 shadcn CLI 설정(스타일 `new-york`, `baseColor: neutral`, RSC 비활성, 아이콘 라이브러리 `lucide`)을 기록했다 — 별도로 설치되었지만 다른 위치로 옮겨진 컴포넌트를 가리키는 특별한 설정은 없었다.

**주의 — 문서 URL 구조.** 현재 shadcn/ui 문서의 컴포넌트 경로는 `/docs/components/base/<slug>` 형태다(예: `/docs/components/base/button`). 이는 shadcn/ui가 Radix UI 기반 구현 외에 **Base UI**(및 React Aria) 구현을 문서 전반에 병기하는 최신 체계로 보인다(각 페이지가 "Built on Base UI, alternative React Aria/Radix UI implementations" 식으로 언급). CLI 설치 명령 자체는 여전히 `pnpm dlx shadcn@latest add <slug>` 형태로 `base/` 접두어 없이 짧은 slug를 쓴다.

---

## 1. massive-design의 현재 컴포넌트 세트

`packages/ui/src/components/ui/`에 실제로 존재하는 파일(직접 `ls`로 확인):

```
badge.tsx
button.tsx
card.tsx
checkbox.tsx
dropdown-menu.tsx
input.tsx
label.tsx
list-row.tsx
select.tsx
table.tsx
```

- **`list-row.tsx`는 shadcn/ui 카탈로그에 없는 massive-design 자체 추가 컴포넌트다.** 이 조사의 "present" 집합에서 제외한다(과제 지시 사항).
- 따라서 shadcn/ui 카탈로그와 비교 가능한 "present" 컴포넌트는 9개: **badge, button, card, checkbox, dropdown-menu, input, label, select, table**.
- `packages/ui/components.json`은 shadcn CLI 표준 설정 파일이며 별도로 설치되었지만 리네임/재배치된 컴포넌트를 가리키는 단서는 없었다(별칭은 표준 `@/components/ui` 등).

---

## 2. shadcn/ui 공식 카탈로그 (2026-08-23 기준, 64개)

출처: https://ui.shadcn.com/docs/components (사이드바 전체 목록, 두 번 독립 조회로 교차 확인)

Accordion, Alert, Alert Dialog, Aspect Ratio, Attachment, Avatar, Badge, Breadcrumb, Bubble, Button, Button Group, Calendar, Card, Carousel, Chart, Checkbox, Collapsible, Combobox, Command, Context Menu, Data Table, Date Picker, Dialog, Direction, Drawer, Dropdown Menu, Empty, Field, Hover Card, Input, Input Group, Input OTP, Item, Kbd, Label, Marker, Menubar, Message, Message Scroller, Native Select, Navigation Menu, Pagination, Popover, Progress, Questionnaire, Radio Group, Resizable, Scroll Area, Select, Separator, Sheet, Sidebar, Skeleton, Slider, Spinner, Switch, Table, Tabs, Textarea, Toast, Toggle, Toggle Group, Tooltip, Typography(현재 문서 페이지 타이틀은 "Typeset"으로 표시됨, 아래 §3의 해당 항목 참고).

**참고 — 사전 제공된 목록과의 차이.** 과제에 예시로 제시된 사전 목록(Accordion~Tooltip, 46개 안팎)에는 없던 항목이 다수 확인됐다: Attachment, Bubble, Button Group, Direction, Empty, Field, Input Group, Item, Kbd, Marker, Message, Message Scroller, Native Select, Questionnaire, Spinner. 반대로 사전 목록에 있던 "Sonner (toast)"는 현재 공식 사이드바에서 단순히 **"Toast"**로 표기된다. 이는 shadcn/ui가 조사 시점 이전에 카탈로그를 확장한 것으로 보인다 — 날짜 정합성 확인 필요 시 https://ui.shadcn.com/docs/components 직접 재조회 권장.

---

## 3. shadcn/ui 컴포넌트 중 massive-design에 아직 없는 것 (55개)

각 항목은 해당 컴포넌트의 개별 공식 문서 페이지(`https://ui.shadcn.com/docs/components/base/<slug>`)에서 직접 확인한 설명/variant다.

| 컴포넌트 | 목적(공식 문서 인용/요약) | 주요 variant / prop |
|---|---|---|
| Accordion | "a vertically stacked set of interactive headings that each reveal a section of content" | `multiple`, `disabled`, 카드 래핑, RTL |
| Alert | "display a callout for user attention" | `variant`: default, destructive |
| Alert Dialog | "interrupts the user with important content and expects a response" | `size`: default, sm; destructive 액션, 미디어 포함 |
| Aspect Ratio | "displays content within a desired ratio" | `ratio`(number, 필수) |
| Attachment | 파일/이미지 미리보기, 메타데이터, 업로드 상태, 액션 표시 | `state`: idle/uploading/processing/error/done; `size`: default/sm/xs; `orientation`: horizontal/vertical |
| Avatar | "An image element with a fallback for representing the user" | `size`: default/sm/lg; `AvatarGroup`, `AvatarBadge` |
| Breadcrumb | "Displays the path to the current resource using a hierarchy of links" | 커스텀 구분자, 드롭다운 통합, 축약(ellipsis) |
| Bubble | 대화형 콘텐츠를 메시지 버블로 표시 | `variant`: default/secondary/muted/tinted/outline/ghost/destructive; `align`: start/end |
| Button Group | 관련 버튼을 그룹으로 묶는 컨테이너 | `orientation`: horizontal(기본)/vertical; `ButtonGroupSeparator` |
| Calendar | 단일/범위 날짜 선택 컴포넌트 (React DayPicker 기반) | `mode`: single/range, `captionLayout: "dropdown"`, 페르시아력 옵션 |
| Carousel | Embla Carousel 기반 슬라이더 | `orientation`, `opts`, `setApi`, `plugins` |
| Chart | "Beautiful charts. Built using Recharts." | `ChartTooltipContent`의 `indicator`: dot/line/dashed 등 |
| Collapsible | "An interactive component which expands/collapses a panel" | `open`/`onOpenChange` 제어 |
| Combobox | "autocomplete input with a list of suggestions" | `multiple`, `showClear`, `autoHighlight` |
| Command | `cmdk` 기반 검색·퀵액션 메뉴 | `CommandInput/List/Empty/Group/Item/Separator/Shortcut` |
| Context Menu | 우클릭/롱프레스로 트리거되는 액션 메뉴 | `variant: "destructive"`, checkbox/radio 아이템, 서브메뉴 |
| Data Table | TanStack Table v9 기반 커스텀 데이터 테이블 구축 가이드(단일 사전제작 컴포넌트가 아님) | 정렬, 필터링, 컬럼 가시성, 행 선택, 페이지네이션 빌딩블록 |
| Date Picker | "a date picker component with range and presets" (Popover+Calendar 조합) | 기본/범위/생년월일/시간 포함/자연어 입력(chrono-node) |
| Dialog | "A window overlaid on either the primary window..." | 커스텀/숨김 닫기 버튼, 고정 푸터, 스크롤 콘텐츠 |
| Direction | `ltr`/`rtl` 텍스트 방향 프로바이더 | `DirectionProvider`, `useDirection` |
| Drawer | 뷰포트 가장자리에서 슬라이드되는 드로어(Base UI 기반, 구 Vaul 대체) | `swipeDirection`, `snapPoints`, `modal` |
| Empty | 빈 상태(empty state) 표시 | 미디어 variant: default/icon; `EmptyHeader/Content` |
| Field | 레이블+컨트롤+도움말을 결합해 접근성 있는 폼 필드 구성 | `orientation`: vertical/horizontal/responsive; `FieldSet/Group/Label/Description/Error` |
| Hover Card | "preview content available behind a link" | `delay`/`closeDelay`, `side`/`align` |
| Input Group | 입력창에 addon/버튼/도움말 콘텐츠 추가 | `align`: inline-start/inline-end/block-start/block-end |
| Input OTP | 접근성 있는 일회용 비밀번호(OTP) 입력 (input-otp 라이브러리 기반) | `REGEXP_ONLY_DIGITS` 등 패턴, `InputOTPGroup/Slot/Separator` |
| Item | 미디어/제목/설명/액션을 가진 범용 flex 컨테이너 | `variant`: default/outline/muted; `size`: default/sm/xs |
| Kbd | 키보드 입력을 텍스트로 표시 | `Kbd`, `KbdGroup` |
| Marker | 상태 업데이트/시스템 노트/구분선 등 인라인 대화 마커 | default/border/separator 레이아웃 |
| Menubar | "a visually persistent menu common in desktop applications" | `MenubarCheckboxItem`, `MenubarRadioGroup`, 서브메뉴 |
| Message | 대화 중 메시지(아바타/헤더/푸터/정렬 포함) 표시 | `align`: start/end; `MessageGroup` |
| Message Scroller | 스트리밍 메시지를 위한 채팅 스크롤 컨테이너 | 턴 앵커링, 자동 스크롤, `useMessageScroller` 훅 |
| Native Select | 디자인 시스템과 일관된 스타일의 네이티브 HTML `<select>` | `NativeSelectOption`, `NativeSelectOptGroup` |
| Navigation Menu | "A collection of links for navigating websites" | `render` prop으로 커스텀 링크 구성(Next.js 등) |
| Pagination | 페이지 이동/이전·다음 링크 | standard/simple/아이콘 전용 |
| Popover | "displays rich content in a portal, triggered by a button" | `align`: start/center/end |
| Progress | 작업 완료 진행률 표시(진행 막대) | `ProgressLabel`, `ProgressValue`, `ProgressTrack/Indicator` |
| Questionnaire | 단일/다중 선택, 자유 응답, 진행률 추적을 갖춘 다단계 폼 | `required`, `multiple`, `shortcuts` |
| Radio Group | 상호 배타적 선택지 집합(라디오 버튼) | Default/Comfortable/Compact 간격; Choice Card, Fieldset 변형 |
| Resizable | 키보드 접근 가능한 크기 조절 패널 그룹 (react-resizable-panels 기반) | 수평/수직, 드래그 핸들 표시 여부 |
| Scroll Area | 네이티브 스크롤을 커스텀 스타일로 보강 | `orientation`: vertical(기본)/horizontal |
| Separator | 콘텐츠를 시각적/의미적으로 구분 | `orientation="vertical"` |
| Sheet | Dialog를 확장해 화면 옆에서 나타나는 보조 콘텐츠 표시 | `side`: top/right/bottom/left |
| Sidebar | 구성 가능하고 테마 적용 가능한 접이식 사이드바 | variant: sidebar/floating/inset; collapsible: offcanvas/icon/none |
| Skeleton | 콘텐츠 로딩 중 플레이스홀더 표시 | 크기·모양은 `className`으로 제어 |
| Slider | 범위 내에서 값을 선택하는 입력 | 단일/범위(2값)/다중 썸, `orientation="vertical"` |
| Spinner | 로딩 상태 표시(LoaderIcon + `animate-spin`) | 크기는 `size-*` 유틸리티, 아이콘 교체 가능 |
| Switch | 체크/비체크를 토글하는 컨트롤 | size: small/default; `aria-invalid` |
| Tabs | "A set of layered sections of content...displayed one at a time" | `variant="line"`, `orientation="vertical"` |
| Textarea | 폼 텍스트 영역 | Field 조합, disabled/invalid 상태 |
| Toast | 일시적으로 표시되는 간결한 메시지 (구 "Sonner") | status: success/info/warning/error/loading; `actionProps`; promise 기반 |
| Toggle | 켜짐/꺼짐 두 상태를 갖는 버튼 | `variant="outline"`, size: sm/default/lg |
| Toggle Group | 두 상태 버튼의 집합 | `type`: single/multiple(추정, single 확인); `orientation="vertical"` |
| Tooltip | 포커스/호버 시 관련 정보를 표시하는 팝업 | `side`: left/top/bottom/right |
| Typography (문서 페이지 타이틀 "Typeset") | 렌더링된 마크다운/HTML을 위한 CSS 기반 타이포그래피 시스템 | preset 클래스(`typeset-docs` 등), `--typeset-size/leading/flow` |

합계: **55개** shadcn/ui 컴포넌트가 `packages/ui/src/components/ui/`에 없음.

---

## 4. massive-design에 이미 있는 shadcn/ui 컴포넌트 (교차 확인용, 9개)

| 컴포넌트 | 파일 | 공식 문서 요약 |
|---|---|---|
| Badge | `packages/ui/src/components/ui/badge.tsx` | "display a badge or a component that looks like a badge." variant: default/secondary/destructive/outline/ghost/link |
| Button | `packages/ui/src/components/ui/button.tsx` | "Displays a button or a component that looks like a button." variant: default/outline/ghost/destructive/secondary/link; size: default/xs/sm/lg/icon/icon-xs/icon-sm/icon-lg |
| Card | `packages/ui/src/components/ui/card.tsx` | "Displays a card with header, content, and footer." size: default/sm |
| Checkbox | `packages/ui/src/components/ui/checkbox.tsx` | "a control that allows the user to toggle between checked and not checked" |
| Dropdown Menu | `packages/ui/src/components/ui/dropdown-menu.tsx` | "Displays a menu...triggered by a button" — 서브메뉴, 체크박스/라디오 아이템 지원 |
| Input | `packages/ui/src/components/ui/input.tsx` | 폼용 텍스트 입력 컴포넌트 |
| Label | `packages/ui/src/components/ui/label.tsx` | "render an accessible label associated with controls" |
| Select | `packages/ui/src/components/ui/select.tsx` | "Displays a list of options for the user to pick from—triggered by a button." |
| Table | `packages/ui/src/components/ui/table.tsx` | "A responsive table component." |

이 외에 `list-row.tsx`가 존재하지만 shadcn/ui 카탈로그에 대응 항목이 없는 massive-design 자체 컴포넌트다.

---

## 5. 출처

- https://ui.shadcn.com/docs/components (전체 카탈로그 목록, 2회 독립 조회로 교차 확인)
- 각 컴포넌트 개별 문서 페이지: `https://ui.shadcn.com/docs/components/base/<slug>` (accordion, alert, alert-dialog, aspect-ratio, attachment, avatar, badge, breadcrumb, bubble, button, button-group, calendar, card, carousel, chart, checkbox, collapsible, combobox, command, context-menu, data-table, date-picker, dialog, direction, drawer, dropdown-menu, empty, field, hover-card, input, input-group, input-otp, item, kbd, label, marker, menubar, message, message-scroller, native-select, navigation-menu, pagination, popover, progress, questionnaire, radio-group, resizable, scroll-area, select, separator, sheet, sidebar, skeleton, slider, spinner, switch, table, tabs, textarea, toast, toggle, toggle-group, tooltip, typography)
- 리포지토리 직접 확인: `packages/ui/src/components/ui/`(파일 목록), `packages/ui/components.json`(shadcn CLI 설정)
