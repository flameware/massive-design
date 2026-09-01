# 승격 8건을 다 연 뒤의 표면 공백 재측정 — 2026-09-01

- 티켓: [#162](https://github.com/flameware/massive-design/issues/162) (맵 [#139](https://github.com/flameware/massive-design/issues/139)의 마지막 하위 항목)
- 이전 기준선: [#120](https://github.com/flameware/massive-design/issues/120) / `docs/research/shadcn-catalog-recheck-2026-08.md` (브랜치 `research/shadcn-catalog-recheck-2026-08`, 조사일 **2026-08-31**, upstream 카탈로그 64개)
- **조사일: 2026-09-01**
- 대상: 우리 51개 계약(`packages/ui/src/components/ui/*.tsx`)의 공개 표면 × upstream shadcn/ui
- 1차 출처: `https://ui.shadcn.com/docs/components/base/<slug>`, `https://ui.shadcn.com/docs/changelog`, 그리고 **레지스트리 소스**(`shadcn-ui/ui` 리포 `apps/v4/registry/bases/base/ui/*.tsx`, `apps/v4/registry/styles/style-lyra.css`)

**이 문서는 결정하지 않는다.** ADR-0006의 세 판정으로 각 차이를 **가르고 근거를 적을 뿐**이며, 계약·코드·Storybook은 한 줄도 움직이지 않았다. 판정 3으로 제안한 것은 §8의 티켓 초안으로 나가고, 여는 결정은 그 티켓이 진다.

---

## 0. 한 줄 결론

**공백은 0이 아니다.** 맵 [#139](https://github.com/flameware/massive-design/issues/139)의 destination("51개 카탈로그의 표면 층위 공백이 사라진다")은 **도달하지 않았다.**

두 가지가 나왔고, 성격이 다르다.

1. **로스터 이탈 1건** — [#121](https://github.com/flameware/massive-design/issues/121)이 승격시킨 8건 중 **Field의 `FieldLegend.variant`에는 구현 티켓이 배정된 적이 없다.** #139의 자식 일곱(#142·#143·#144·#145·#146·#154·#161) 어디에도 Field가 없고, `field.tsx`의 `limits`는 오늘도 *"열 근거는 있으나 별도 effort로 미뤘다(#121)"* 라고 적혀 있다. 맵은 여덟을 열었다고 적었지만 실제로 연 것은 **일곱**이다.
2. **종류 ② 재발 — 14개 컴포넌트 22개 표면.** 그중 **9개 컴포넌트 15개 표면**은 upstream에 실재하는 노드·축인데 우리 계약의 `publicExports`·`parts`·`limits` 어디에도 이름이 없다. `FieldTitle`·`FieldSeparator`·`TableFooter`·`ProgressLabel`·`ProgressValue`·`PopoverHeader`·`PopoverTitle`·`PopoverDescription`·`InputGroupText`·`InputGroupTextarea`·`CommandSeparator`·`SelectScrollUpButton`·`SelectScrollDownButton`·`ButtonGroupSeparator`의 `orientation` 축·`Item`의 `size: xs`.

그리고 이 조사의 실제 산출은 목록이 아니라 **§3**이다: #121의 모집단이 어떻게 만들어졌는지가 재현 가능하고, **Dropdown Menu의 세 파트는 우연히 빠진 것이 아니라 규칙적으로 빠졌다.** 위 15개 중 **11개는 기준선 문서가 이름을 축자로 적어 놓은 것**이고, 전부 같은 필터에 걸려 모집단 밖으로 나갔다.

upstream은 기준선 이후 **움직이지 않았다**(§2). 즉 이 공백은 남의 변화가 아니라 전부 우리 쪽 기록의 공백이다.

---

## 1. 방법 — #121과 어디서 갈랐는가

#162가 명시한 대로 이건 "같은 방법으로 한 번 더 세는 일"이 아니다. 방법을 바꾼 자리가 이 조사의 신뢰도 전부다.

1. **모집단을 문서가 아니라 식별자 집합으로 만들었다.** upstream 레지스트리 소스 50개 파일의 `export { … }` 블록과 `cva` `variants` 키·값을 기계적으로 뽑고, 우리 51개 계약의 `publicExports`와 `packages/ui/dist/manifest/*.gen.json`의 `axes`를 같은 방식으로 뽑아 **집합 차집합**을 냈다. 사람이 표를 읽어서 만든 목록이 아니다.
2. **문서는 뜻을 위해, 소스는 모집단을 위해 읽었다.** 공식 문서 페이지 50개를 개별 조회해 설명·기본값·서술을 확인했지만, "무엇이 있는가"의 정본은 소스로 잡았다. 기준선 문서가 §9에서 스스로 적어 둔 한계 — *"미기록은 '페이지에 없다'가 아니라 '추출된 텍스트에서 확인되지 않았다'"* — 를 모집단 산정에서 제거하기 위해서다.
3. **차집합을 낸 다음에야 판정했다.** ADR-0006의 두 관문(ⓐ 파생 채널이 구분하는가 / ⓑ 소비처가 스스로 하면 계약이 새는가)은 목록이 완결된 뒤에 걸었다. #121은 순서가 반대였다(§3).
4. **`limits` 전문을 51개 전부에서 추출해 대조했다.** "이미 판정했는가"의 정본은 계약이므로, 차집합의 각 항목이 어느 `limits` 문장에 걸리는지 한 건씩 확인했다.

### 재현 절차

```sh
# upstream 소스 (Base UI 갈래 — 문서의 /docs/components/base/* 와 같은 갈래)
gh api "repos/shadcn-ui/ui/contents/apps/v4/registry/bases/base/ui" --jq '.[].name'
gh api "repos/shadcn-ui/ui/contents/apps/v4/registry/bases/base/ui/<slug>.tsx" --jq '.content' | base64 -d

# 우리 쪽
grep -n "publicExports:" packages/ui/src/components/ui/*.tsx
node -e '…' packages/ui/dist/manifest/*.gen.json   # axes / parts.*.axes
```

두 목록을 `export` 식별자 기준으로 차집합하면 이 문서의 §4 표가 그대로 재생된다.

### 이 조사의 한계

- **upstream의 스타일 값은 갈래가 여덟이다.** `apps/v4/registry/styles/`에 `style-luma`·`lyra`·`maia`·`mira`·`nova`·`rhea`·`sera`·`vega` 여덟 개가 있고, 컴포넌트 TSX는 `cn-table-footer` 같은 **클래스 이름만** 들고 실제 선언은 각 스타일 CSS에 있다. ⓑ("우리 스타일 결정을 복제하는가")를 재려면 값이 필요해 `style-lyra.css`를 읽었고, 인용한 선언은 전부 그 파일의 것이다. **다른 스타일에서는 값이 다를 수 있다** — 다만 ⓑ가 묻는 것은 "결정이 존재하는가"이지 "값이 몇인가"가 아니므로 판정은 갈리지 않는다.
- **레지스트리 소스는 리포 `main`이고 문서는 발행본이다.** 둘이 어긋날 수 있어 §4의 각 행은 **양쪽에서 확인된 것만** 실었다. 어느 한쪽에서만 보인 것은 §7의 판정 보류로 내렸다.
- **`list-row`는 대조 대상이 아니다.** upstream에 대응 항목이 없는 우리 자체 컴포넌트다(기준선과 같은 처리). 따라서 비교 대상은 **50개**다.

---

## 2. upstream이 기준선 이후 움직였는가 — 아니다 (확인함)

기준선은 2026-08-31, 오늘은 2026-09-01이라 움직였을 리 적지만, **가정하지 않고 쟀다.**

| 축 | 결과 | 근거 |
|---|---|---|
| 카탈로그 총 개수 | **64 → 64** | `https://ui.shadcn.com/docs/components` 사이드바 재조회. 항목·순서·문자열이 기준선 §2 목록과 동일 |
| 추가·제거·개명 | **없음** | 위와 동일 |
| changelog 최상단 엔트리 | **동일** | Private GitHub Registries / Human in the Loop / Questionnaire — 기준선이 기록한 3건이 그대로 최상단이고 그 뒤가 July 2026의 Dynamic Search·Toast·React Aria다 |
| 레지스트리 소스 | **우리 50개에 변경 없음** | `apps/v4/registry/bases/base/ui`의 마지막 커밋이 `503a3a57aec9`(2026-08-31T09:43Z, *"hide MessageScroller until the opening position applies"*)이고 MessageScroller는 우리 카탈로그 밖이다. 리포 head는 `63c1308d112b`(2026-08-31T09:54Z) |

**즉 이 문서가 찾은 공백은 전부 우리 쪽 기록의 공백이다.** 기준선이 8일간 upstream 불변을 확인한 것과 같은 결론이 하루 더 연장됐고, 이번에는 문서 목록만이 아니라 **소스 커밋 SHA**로도 확인됐다.

---

## 3. #121의 모집단 산정 방법 — 구멍은 우연이 아니었다

#162가 "재현 가능한지 확인한다"고 적은 자리다. **재현 가능하다. 그리고 재현해 보니 규칙이 정확하다.**

### 3.1 실패 모드 — 모집단이 *문서에 대한 문서의 diff 열*에서 나왔다

#121의 종류 ② 목록은 upstream 문서를 새로 읽어 만든 것이 아니라 **기준선 문서(§4.2 표)를 읽어 만들었다.** 그 표에는 열이 둘 있다.

- **내용 열** — "variant / size / 주요 prop": 그 컴포넌트가 upstream에서 **무엇을 갖는가**
- **diff 열** — "기준선(2026-08-23) 대비": 2026-08-23 기록과 **무엇이 달라졌는가**

#121 본문의 종류 ② 목록은 **diff 열이 "기준선 미기록"이라고 표시한 항목과 정확히 일치한다.** 한 건씩 맞는다.

| #121 본문에 실린 종류 ② | 기준선 §4.2의 diff 열 |
|---|---|
| Avatar `AvatarGroupCount` | "…(`AvatarGroupCount`는 기준선 미기록)" |
| Alert `AlertAction` | "…`AlertAction`이 문서에 있음(기준선에는 **미기록**…)" |
| Pagination `text` | "…`text` prop은 기준선 **미기록**" |
| Toggle Group `spacing` | "`spacing` prop은 기준선 **미기록**" |
| Select `alignItemWithTrigger` | "…`alignItemWithTrigger`는 기준선 **미기록**" |
| Field `FieldLegend.variant` | "…`FieldLegend`의 `variant`(legend/label)는 기준선 **미기록**" |
| Item `ItemMedia`의 `image` | "…`ItemMedia`의 `image` 값은 기준선 **미기록**" |

**그래서 "우리 계약에 없는가"는 애초에 물어지지 않았다.** 물어진 것은 "남의 조사 기록이 이걸 전에 적었는가"였고, 그건 [#121](https://github.com/flameware/massive-design/issues/121)이 스스로 판정 코멘트에서 정확히 지적한 문제다 — *"티켓이 쓴 종류 ②의 모집단은 '기준선 문서가 기록했는가' 축이었다. 그건 남의 문서의 기록 누락 여부이지 우리 계약이 언급했는가가 아니다."*

### 3.2 그런데 축을 다시 그은 2차 통과도 같은 표를 읽었다

#121은 축을 "upstream 문서에 있고 우리 계약에 없음"으로 다시 긋고 7개 표면을 더 찾았다(Card `size`, Alert Dialog `size`·`AlertDialogMedia`, Tabs `TabsList variant="line"`, Empty `EmptyMedia.variant`, Input Group `InputGroupAddon.align`·`InputGroupButton` variant·size). **축은 옳게 다시 그었지만 읽는 대상은 같은 표였고, 읽는 방식이 기계적이지 않았다.**

증거는 남은 것들이다. 기준선 §4.2의 **내용 열이 이름을 축자로 적어 두었는데** diff 열이 "변경 없음"이어서 두 통과 모두를 빠져나간 표면들:

| 기준선 §4.2가 내용 열에 적은 것 | diff 열 | #121 모집단 | 오늘 상태 |
|---|---|---|---|
| Dropdown Menu: "…**Checkbox/Radio 아이템, Sub 메뉴**, Shortcut" | 변경 없음 | 없음 | [#127](https://github.com/flameware/massive-design/issues/127)이 발견 → [#142](https://github.com/flameware/massive-design/issues/142)·[#154](https://github.com/flameware/massive-design/issues/154)가 해소 |
| Field: "FieldSet/Group/Content/Label/**Title**/Description/**Separator**" | 변경 없음 | 없음 | **오늘도 공백** (§5) |
| Table: "Table/Caption/Header/Row/Head/Body/Cell/**Footer**" | 변경 없음 | 없음 | **오늘도 공백** |
| Popover: "…**Header/Title/Description**" | 변경 없음 | 없음 | **오늘도 공백** |
| Progress: "`value`; **ProgressLabel/Value/Track/Indicator**" | 변경 없음 | 없음 | **오늘도 공백** |
| Command: "Input/List/Empty/Group/Item/**Separator**/Shortcut/Dialog" | 변경 없음 | 없음 | **오늘도 공백**(Shortcut·Dialog는 [#123](https://github.com/flameware/massive-design/issues/123)이 다른 경로로 닫았다) |
| Item: "…`size`: default/sm/**xs**…" | 변경 없음 | 없음 | **오늘도 공백** |
| Badge: "`variant`: default, **secondary**, destructive, **outline**, **ghost**, **link**" | 변경 없음 | 없음 | **오늘도 어긋남**(§6.2) |

**Dropdown Menu는 예외가 아니라 이 규칙의 눈에 띈 사례였다.** #127이 그 하나를 찾은 것은 Menubar를 구현하다 같은 파트를 손으로 만졌기 때문이지, 방법이 그것을 잡아낸 것이 아니다. 그래서 나머지 일곱은 오늘까지 살아남았다.

### 3.3 실패 모드에 이름을 붙이면

**비교의 단위가 식별자가 아니라 표의 행이었다.** 한 행을 "봤다"고 판단하는 순간 그 행이 담은 이름 전부가 처리된 것으로 취급됐고, 행 안의 어느 이름도 개별적으로 "우리 계약에 있는가"를 통과하지 않았다. 여기에 diff 열이 주의를 끄는 표식으로 작동해 **"변경 없음" = "볼 것 없음"** 이라는 두 번째 필터가 겹쳤다.

두 번째 실패 모드도 있다. 기준선 §4.2의 내용 열 자체가 완결이 아니었다 — `InputGroupText`·`InputGroupTextarea`·`SelectScrollUpButton`·`ButtonGroupSeparator`의 `orientation`은 **기준선에도 없다.** 기준선이 §9에서 스스로 적었듯 그 표는 요약 모델이 렌더된 마크다운에서 추출한 것이고 "미기록"은 "페이지에 없다"가 아니었다. **그래서 기준선을 더 꼼꼼히 읽는 것으로는 이 넷을 찾을 수 없다.**

### 3.4 같은 구멍을 다시 내지 않는 방법

**모집단을 사람이 만들지 않는다.** 두 기계 판독 목록의 집합 차집합으로 만든다.

- upstream 쪽 — 레지스트리 소스의 `export { … }` 식별자와 `cva`의 `variants` 키·값 (`apps/v4/registry/bases/base/ui/*.tsx`, GitHub API로 접근 가능)
- 우리 쪽 — 계약의 `publicExports`와 생성된 매니페스트의 `axes`·`parts.*.axes`

차집합의 **완결성이 누구의 독해에도 의존하지 않는다**는 것이 요점이다. 판정(ⓐ·ⓑ)은 그 뒤에 사람이 한 건씩 걸고, 산문 문서는 **뜻**을 정하는 데만 쓴다. 그리고 다음 재조회가 diff를 낼 수 있도록 **upstream 커밋 SHA를 기록한다**(§9).

**이건 게이트가 아니다.** [ADR-0006](../adr/0006-uncontracted-surfaces.md)이 적은 대로 게이트는 "upstream에 있는데 우리에게 없다"를 볼 수 없고, 위 절차도 네트워크와 남의 리포를 읽어야 하므로 CI가 지킬 수 있는 규칙이 아니다. 바뀌는 것은 **재조회가 사람의 주의력에 기대지 않게 된다**는 것뿐이며, 그건 ADR-0006이 이미 세운 한계 안에서의 개선이다. **지킬 수 없는 것을 지킨다고 적지 않는다**([ADR-0008](../adr/0008-axis-and-value-name-spaces.md)의 파급과 같은 자리).

---

## 4. 전수 대조 — 50개 컴포넌트

우리 `publicExports`(대문자로 시작하는 것만)와 upstream `export` 블록의 차집합이다. **차이가 없는 27개는 표에서 뺐다** — accordion, avatar, badge(export 기준), breadcrumb, button, button-group(export 기준), card, checkbox, collapsible, dialog, empty, input, input-otp, item(export 기준), kbd, label, pagination, radio-group, separator, sheet, skeleton, slider, spinner, switch, tabs, textarea, tooltip.

| 컴포넌트 | upstream에만 있음 | 우리에만 있음 | 판정 |
|---|---|---|---|
| alert-dialog | `AlertDialogMedia` | — | **닫는다 — 이미 기록됨** (#121 판정 2, `limits`) |
| calendar | `CalendarDayButton` | `CalendarHeader`·`Nav`·`Caption`·`Grid`·`HeadCell`·`Cell`·`Day` | **이미 열렸다** — 우리 분해가 더 촘촘하고 `CalendarDay`가 같은 자리다 |
| carousel | `CarouselApi`(타입) | — | **닫는다 — 미기록** (ⓐ 실패: 타입 export는 노드도 축도 아니다) |
| chart | `ChartTooltip`·`ChartLegend`·`ChartStyle` | — | 앞 둘 **닫는다 — 이미 기록됨**(`limits`). `ChartStyle`은 **이미 열렸다** — `ChartContainer`가 `--color-<key>` 주입을 흡수한다. 단 이름이 `limits`에 없다 |
| combobox | `ComboboxInput`·`List`·`Item`·`Group`·`Label`·`Collection`·`Empty`·`Separator`·`Chips`·`Chip`·`ChipsInput` | `ComboboxIcon` | **이미 열렸다** — [#91](https://github.com/flameware/massive-design/issues/91) 합성으로 `Command*`가 그 자리를 진다(anatomy에 축자로 있다). `Chips` 계열은 다중 선택이라 `limits`가 이미 닫았다. `ComboboxSeparator`는 `CommandSeparator` 공백으로 굴러간다 |
| command | `CommandDialog`·`CommandShortcut`·`CommandSeparator` | `CommandGroupHeading` | 앞 둘 **이미 기록됨**. **`CommandSeparator`는 종류 ②** |
| dropdown-menu | `DropdownMenuPortal`·`DropdownMenuShortcut` | — | `Shortcut` **이미 기록됨**. `Portal`은 **종류 ②(경량)** |
| field | `FieldSeparator`·`FieldTitle` | — | **둘 다 종류 ②** |
| input-group | `InputGroupText`·`InputGroupTextarea` | — | **둘 다 종류 ②** |
| menubar | `MenubarPortal`·`MenubarShortcut` | — | `Shortcut` **이미 기록됨**. `Portal`은 **종류 ②(경량)** |
| native-select | `NativeSelectOptGroup` | `NativeSelectIcon`·`NativeSelectGroup` | **이름 어긋남 — 미기록** (§6.2) |
| navigation-menu | `NavigationMenuIndicator`·`NavigationMenuPositioner` | — | **이미 기록됨** — `limits`가 Radix 이름 `NavigationMenuViewport`로 같은 노드를 닫았다. Base UI 이름이 `Positioner`인 것만 기록이 없다 |
| popover | `PopoverHeader`·`PopoverTitle`·`PopoverDescription` | `PopoverAnchor` | **셋 다 종류 ②** |
| progress | `ProgressTrack`·`ProgressIndicator`·`ProgressLabel`·`ProgressValue` | — | **넷 다 종류 ②** (Track·Indicator는 실질이 이미 있고 이름이 없다, §5) |
| resizable | — | `ResizableHandleGrip` | 차이 없음(우리가 `withHandle`을 파트로 세웠다) |
| scroll-area | — | `ScrollAreaViewport`·`Thumb`·`Corner` | 차이 없음 |
| select | `SelectScrollUpButton`·`SelectScrollDownButton` | — | **둘 다 종류 ②** |
| sidebar | `SidebarInput`·`SidebarMenuSkeleton` | — | **닫는다 — 이미 기록됨**(`limits`가 둘 다 이름으로 닫았다) |
| table | `TableFooter` | — | **종류 ②** |
| toast | `Toaster`·`ToastContent`·`ToastPortal` | — | `Toaster`/명령형 큐 **이미 기록됨**. `ToastContent`·`ToastPortal`은 **판정 보류**(§7) |

### 4.1 축·값 층위의 대조

`cva`의 `variants` 키·값을 같은 방식으로 대조했다. **차이가 나는 자리만** 싣는다.

| 컴포넌트·파트 | upstream | 우리 | 판정 |
|---|---|---|---|
| `Item` `size` | `default`·`sm`·**`xs`** | `default`·`sm` | **종류 ②** — `xs` 값이 없다 |
| `Badge` `variant` | `default`·`secondary`·`destructive`·`outline`·`ghost`·`link` | `neutral`·`accent`·`success`·`danger` | **어긋남 — 미기록** (§6.2) |
| `ButtonGroupSeparator` `orientation` | `horizontal`·`vertical`(기본 `vertical`) | 축 없음(`staticPart("self-stretch")`) | **종류 ②** — 파트 축 |
| `FieldLegend` `variant` | `legend`·`label`(기본 `legend`) | 축 없음 | **로스터 이탈** (§5.0) |
| `InputGroupAddon` `align`/`placement` | `inline-start`·`inline-end`·`block-start`·`block-end` | `auto`·`start`·`end` | **기록된 결정** (§6.1) |
| `ItemMedia`/`EmptyMedia` `variant`/`frame` | `default`·`icon`(·`image`) | `none`·`icon`(·`image`) | **기록된 결정** (§6.1) |
| `TabsList` `variant`/`indicator` | `default`·`line` | `pill`·`line` | **기록된 결정** (§6.1) |
| `ToggleGroup` `spacing` | 숫자(기본 `2`) | `separate`·`attached` | **기록된 결정** (§6.1) |
| `Sidebar` `collapsible` | `offcanvas`·`icon`·`none` | `offcanvas`·`icon` | **닫는다 — 이미 기록됨** |
| `SidebarMenuButton` `variant` | `default`·`outline` | `default` | **닫는다 — 이미 기록됨**(토큰 선행 필요) |
| `Card` `size`, `AlertDialog` `size` | `default`·`sm` | 축 없음 | **닫는다 — 이미 기록됨** |
| `InputGroupButton` `variant`·`size` | 각각 6값·4값 | 축 없음 | **닫는다 — 이미 기록됨** |
| `Alert` `variant` | `default`·`destructive` | `default`·`success`·`warning`·`destructive` | 차이가 **더 넓은 쪽**이라 공백이 아니다 |
| `Toast` `variant` | 명령형 API의 `type` 5값 | `default`·`success`·`warning`·`destructive` | 구현 갈래 차이 — `limits`가 명령형 API를 닫았다 |
| `Switch` `size` | `sm`·`default` | `sm`·`default` | **일치**(기준선의 미확정을 소스로 해소, §7.1) |
| `Toggle` `size`·`variant` | `sm`·`default`·`lg` / `default`·`outline` | 동일 | **일치**(기준선의 판정 보류 1건 해소, §7.1) |

---

## 5. 이 조사의 실제 산출 — 로스터 이탈 1건과 종류 ② 재발

### 5.0 로스터 이탈 — Field `FieldLegend.variant`

**성격이 종류 ②와 반대다.** 이건 "고려된 적 없음"이 아니라 **판정을 다 받고 로스터에 오른 뒤 실행 티켓이 배정되지 않은** 자리다.

- #121이 두 관문을 다 통과시켜 **판정 3**을 줬다: *"Field `FieldLegend.variant` | ⓐ ✅ | ⓑ ✅ label 모양이 `FieldLabel` 복제 | **3**"*
- #139의 destination이 로스터를 여덟으로 적었다: *"승격시킨 **8건**(Avatar·Alert·Toggle Group·**Field**·Item·Empty·Input Group·Tabs)"*
- #139의 자식은 일곱이고(#142·#143·#144·#145·#146·#154·#161) **Field를 다루는 티켓이 없다.** #143=Avatar, #144=Alert+Input Group, #145=Item+Empty, #146=Toggle Group+Tabs, #142·#154=Dropdown Menu, #161=어휘. 여덟 중 일곱만 배치에 들어갔다.
- `field.tsx`의 `limits`는 오늘도 그대로다: *"`FieldLegend`의 legend/label 표현 축(upstream의 `variant`)은 계약하지 않는다 — … 열 근거는 있으나 별도 effort로 미뤘다(#121)."*

upstream 실재도 확인했다 — `FieldLegend({ className, variant = "legend", … }: … & { variant?: "legend" | "label" })`이고, `style-lyra.css`의 `.cn-field-legend`가 `data-[variant=label]:text-xs data-[variant=legend]:text-sm`로 두 모양을 실제로 갈라 그린다. **ⓐ·ⓑ 판정은 오늘도 유효하다.**

**판정: 연다.** #121의 판정 3이 그대로 서고, 이 맵이 도달을 선언하려면 이 하나가 남는다.

### 5.1 종류 ② — 판정 3을 제안하는 것

각 행의 upstream 실재는 레지스트리 TSX로, 스타일 결정의 존재는 `style-lyra.css`로 확인했다.

| # | 컴포넌트 | upstream 표면 | ⓐ | ⓑ | 판정 |
|---|---|---|:-:|:-:|---|
| ② -1 | field | `FieldSeparator` | ✅ 파트 신설 | ✅ `-my-2 h-5 text-xs` + `absolute inset-0 top-1/2`의 Separator + 가운데 내용 칩 — 소비처가 전부 다시 짠다 | **연다** |
| ② -2 | table | `TableFooter` | ✅ 파트 신설(`<tfoot>`) | ✅ `bg-muted/50 border-t font-medium [&>tr]:last:border-b-0` — 합계 행의 면·경계 결정 | **연다** |
| ② -3 | progress | `ProgressLabel`·`ProgressValue` | ✅ 파트 둘 | ✅ `ml-auto tabular-nums text-xs`의 라벨/값 한 줄 — 우리 계약에 진행률 텍스트 자리가 아예 없다 | **연다** |
| ② -4 | popover | `PopoverHeader`·`PopoverTitle`·`PopoverDescription` | ✅ 파트 셋 | ✅ `text-sm font-medium` / `text-muted-foreground text-xs/relaxed` — **Dialog·Sheet·Alert Dialog는 이미 Header/Title/Description 셋을 다 갖는다.** Popover만 없는 것은 카탈로그 내부 비대칭이다 | **연다** |
| ② -5 | input-group | `InputGroupTextarea` | ✅ 파트 신설 | ✅ 껍데기 안에서 테두리·링·배경을 무력화하는 결정 — 우리 `CONTROL` 상수가 `InputGroupInput`에 대해 이미 내린 것과 같은 결정을 여러 줄짜리로 다시 내려야 한다 | **연다** |
| ② -6 | input-group | `InputGroupText` | ✅ 파트 신설 | ✅ `text-muted-foreground gap-2 text-xs [&_svg:not([class*='size-'])]:size-4` — 부가물 안의 글자·글리프 크기 결정. 오늘 우리 `InputGroupAddon`은 자식 텍스트를 위한 자리를 갖지 않아 소비처가 매번 이 넷을 다시 쓴다 | **연다** |
| ② -7 | command | `CommandSeparator` | ✅ 파트 신설 | ✅ 1px 선의 색과 그리는 법. **여기에 함정이 있다** — upstream `.cn-command-separator`가 `@apply bg-border -mx-1 h-px`이고, 그건 [#154](https://github.com/flameware/massive-design/issues/154)가 `DropdownMenuSeparator`에서 잡은 `--ds-border-default`를 `background-color`에 올리는 위반 그대로다. 열면 `border-t`로 그려야 한다(Menubar·Resizable의 답) | **연다** |
| ② -8 | button-group | `ButtonGroupSeparator`의 `orientation` 축 | ✅ 파트 축 신설 → 셀 2배 | ✅ `data-horizontal:mx-px data-horizontal:w-auto data-vertical:my-px data-vertical:h-auto` — 방향마다 다른 여백·치수 | **연다** |

### 5.2 종류 ② — 기록하되 열지 않기를 제안하는 것

ADR-0006이 세운 대로 **열지 않기로 한 것도 `limits`에 문장이 남아야** 다음 재조회가 같은 자리를 다시 발견하지 않는다.

| # | 컴포넌트 | upstream 표면 | 제안 판정과 근거 |
|---|---|---|---|
| ② -9 | field | `FieldTitle` | **닫는다.** `.cn-field-title`이 `gap-2 text-xs/relaxed group-data-[disabled]/field:opacity-50`뿐이고 `data-slot`이 `field-label`로 같다 — 우리 `FieldLabel`이 그 자리를 지고 ⓑ가 복제할 결정이 남지 않는다 |
| ② -10 | progress | `ProgressTrack`·`ProgressIndicator` | **이미 열렸다(다른 이름).** 우리 `Progress` 루트가 트랙(`bg-secondary rounded-full`)이고 안쪽 노드가 `data-slot="progress-indicator"`로 이미 있다. 다만 **`publicExports`에도 `parts`에도 없다** — `progress`는 클래스를 내면서 `parts` 없이 선 계약이라 [#155](https://github.com/flameware/massive-design/issues/155)의 모집단이고, 그 티켓이 `parts`를 세울 때 이름을 함께 정하는 것이 옳다 |
| ② -11 | select | `SelectScrollUpButton`·`SelectScrollDownButton` | **닫는다.** 목록이 넘칠 때만 나타나는 노드라 정적 시안에 `overflow` 구성 상태가 없으면 그릴 것이 없다(ScrollArea의 `overflow: fits\|overflowing`을 Select에는 두지 않았다). ⓐ가 약하다 |
| ② -12 | item | `size`의 `xs` 값 | **닫는다.** `.cn-item-size-xs`가 `gap-2 px-2.5 py-2`로 간격 한 단계이고, `Card`의 `size`를 판정 2로 닫은 것과 같은 근거다(#121: "축은 늘지만 소비처가 패딩 유틸 한 줄로 끝낸다"). 다만 `default`·`sm`은 이미 우리 것이라 **선례를 그대로 적용할지 다시 볼 여지가 있다** — 티켓 하나로 묶어 판정한다 |
| ② -13 | dropdown-menu·menubar | `DropdownMenuPortal`·`MenubarPortal` | **닫는다.** 클래스도 셀도 없는 구조 노드라 ⓐ가 실패한다. 다만 **`Dialog`·`Sheet`·`AlertDialog`는 Portal을 공개한다** — 카탈로그 안에서 같은 성질의 노드가 절반만 공개되는 비대칭이므로, 닫든 열든 **한 번에 같은 근거로** 정하는 것이 맞다 |
| ② -14 | carousel | `CarouselApi` 타입 | **닫는다.** 타입 export는 노드도 축도 아니라 파생 채널에 자리가 없다. `setApi`는 우리 코드에 이미 있다 |
| ② -15 | chart | `ChartStyle` | **이미 열렸다(다른 이름).** `ChartContainer`가 `--color-<key>` 주입을 흡수한다고 `limits`가 이미 적었다. 이름만 기록하면 된다 |
| ② -16 | navigation-menu | `NavigationMenuPositioner` | **이미 판정됨.** `limits`가 Radix 이름 `NavigationMenuViewport`로 같은 노드를 닫았다. Base UI 갈래의 이름이 `Positioner`라는 사실만 문장에 더한다 |

---

## 6. 기록된 결정과 실제 어긋남 — 섞지 않는다

#162가 "이 조사의 정확도"라고 부른 자리다. 기준은 하나다 — **어긋남의 근거가 계약의 `limits`(또는 ADR)에 문장으로 있는가.**

### 6.1 기록된 결정 (= 차이가 아니다)

여섯 티켓이 연 표면 중 upstream과 이름·값이 갈리는 자리 전부다. **하나도 빠짐없이 근거가 `limits`에 있다.**

| 자리 | upstream | 우리 | 근거의 위치 |
|---|---|---|---|
| Input Group 부가물 배치 축의 **이름** | `align` | `placement` | `input-group.tsx` `limits`: *"이름이 `align`이 아닌 것은 우리 카탈로그에서 `align`이 이미 Radix의 prop 이름 공간에 속해…"* ([#144](https://github.com/flameware/massive-design/issues/144), [#125](https://github.com/flameware/massive-design/issues/125)의 선례, [ADR-0008](../adr/0008-axis-and-value-name-spaces.md) 규칙 1) |
| Input Group 부가물 배치 축의 **기본값** | `inline-start` | `auto` | 같은 `limits`: *"`order-first`가 컨트롤 뒤에 쓴 기존 부가물을 앞으로 옮겨 발행된 인스턴스를 재해석하기 때문"* |
| Input Group `block-start`·`block-end` **미개방** | 있음 | 없음 | 같은 `limits`: *"루트가 줄바꿈하는 auto 높이 컨테이너가 되어야 하고, 그건 `h-9` 한 줄과 `h-full` 컨트롤을 재해석하는 breaking… 조건부 클래스로 피하면 `unresolved`"* |
| 미디어 슬롯 축의 **이름** | `variant` | `frame` | `item.tsx` `limits`: *"우리 카탈로그에서 `variant`는 루트의 의미·강조 축이고 `Item` 자신이 이미 그 이름을 쓰므로…"* ([#145](https://github.com/flameware/massive-design/issues/145)) |
| `ItemMedia`/`EmptyMedia` 중립값의 **이름** | `default` | `none` | `empty.tsx`·`item.tsx` `limits` + [ADR-0008](../adr/0008-axis-and-value-name-spaces.md) 규칙 3(*"`frame: none`은 틀이 없다는 뜻이고 클래스가 없다는 뜻이 아니다"*) |
| `EmptyMedia`의 **기본값이 서로 다름** | `default` | `icon` | `empty.tsx` `limits`: *"오늘의 `EmptyMedia`가 이미 upstream의 `icon` 값이기 때문… 기본값은 발행된 인스턴스를 지키는 값이다"* |
| `EmptyMedia`의 `image` **미개방** | 없음(upstream에도) | 없음 | `empty.tsx` `limits`: *"upstream에도 없고, 이 슬롯이 제목 위 가운데 `size-10`이라 40px 틀은 빈 상태 일러스트가 아니라 글리프 칩"* |
| Tabs 활성 표식 축의 **이름** | `variant` | `indicator` | `tabs.tsx` `limits`: *"우리 카탈로그에서 `variant`가 Button·Badge·Alert·Toggle의 면의 계열 이름이라 한 이름이 두 뜻을 갖기 때문"* ([#146](https://github.com/flameware/massive-design/issues/146)) |
| Tabs 기본값의 **이름** | `default` | `pill` | 같은 `limits`: *"`line`을 기본으로 두면 발행된 탭이 트랙을 잃어 인스턴스가 재해석되기 때문"* |
| Toggle Group `spacing`의 **값 타입** | 숫자(기본 `2`) | `separate`·`attached` | `toggle-group.tsx` `limits`: *"이름은 upstream을 따르되 값은 우리 어휘다(upstream의 `spacing={0}`은 숫자라 파생 채널이 그릴 이름이 되지 못한다)"* |
| Avatar 겹침 링 축 | 없음(고정 `ring-background`) | `knockout: none\|ring` | `avatar.tsx` `limits` + [ADR-0007](../adr/0007-knockout-border.md) ([#143](https://github.com/flameware/massive-design/issues/143)) |
| `AlertAction`의 위치 축 **미개방** | 없음 | 없음 | `alert.tsx` `limits`: *"upstream이 위치 prop 없이 오른쪽 위로 고정하고 실측 수요 없이 축을 열지 않는다(#123)"* |
| Alert 아이콘 컬럼 **미개방** | 2열 격자 | 1열 | `alert.tsx` `limits`: *"이 Alert이 1열 그리드라 도입하면 기존 인스턴스의 격자를 재해석하는 breaking"* |
| Dropdown Menu `ItemIndicator` **미개방** | primitive에 있음 | 파트 아님 | `dropdown-menu.tsx`·`menubar.tsx` `limits`: *"켜졌을 때만 나타나는 글리프라 정적 시안이 그리는 것은 `checked` 구성 상태이지 별도 노드가 아니다"* |
| `chart.indicator`와 `tabs.indicator`의 `line` **중복** | — | 둘 다 `line` | [ADR-0008](../adr/0008-axis-and-value-name-spaces.md) 규칙 2 — *"값 이름의 이름 공간은 축이다… 충돌이 아니다"* ([#161](https://github.com/flameware/massive-design/issues/161)) |

**#161이 다섯 축을 가로질러 다시 본 결과 이름을 하나도 바꾸지 않았고, 오늘 upstream과 다시 대조해도 그 판정을 무르게 할 새 사실은 없다.** 위 열다섯 자리는 전부 "차이"가 아니라 **기록된 결정**이다.

### 6.2 실제 어긋남 — 근거가 기록되지 않은 자리

**둘뿐이다.** 그리고 둘 다 §5의 종류 ②와 성격이 다르다 — 표면이 **없는** 것이 아니라 **다르게 있는** 것이다.

| 자리 | upstream | 우리 | 왜 기록되지 않았나 |
|---|---|---|---|
| `Badge`의 `variant` **값 집합** | `default`·`secondary`·`destructive`·`outline`·`ghost`·`link` (여섯) | `neutral`·`accent`·`success`·`danger` (넷) | `badge.tsx`의 `limits`는 *"도메인 값을 variant 이름으로 추가하지 않는다"* 한 줄뿐이다. 우리 넷은 semantic 토큰 계열(`secondary`/`primary-soft`/`success-soft`/`destructive-soft`)에 정확히 대응하는 **의도된 어휘**로 보이지만, **그 의도가 계약에도 ADR에도 문장으로 없다.** 그리고 upstream의 `outline`·`ghost`·`link`는 값 이름이 아니라 **면의 종류가 셋 더 있다**는 뜻이라, 이름 갈림과 표면 공백이 한 칸에 겹쳐 있다 |
| `NativeSelect` 옵션 그룹의 **이름** | `NativeSelectOptGroup` | `NativeSelectGroup` | `native-select.tsx`의 `limits`에 이름 선택에 관한 문장이 없다. `<optgroup>`을 그리는 같은 노드이고 upstream 이름이 자유로웠으므로(카탈로그에서 `OptGroup`은 쓰인 적 없다) [ADR-0008](../adr/0008-axis-and-value-name-spaces.md) 규칙 1의 근거로는 갈릴 이유가 없었다. 지금 바꾸면 breaking이므로 **오늘 결정을 기록하는 것이 남은 선택지다** |

**이 둘을 §6.1과 섞으면 안 되는 이유**는 방향이 반대이기 때문이다. §6.1은 "왜 upstream과 다른지 계약이 답한다"이고, §6.2는 **"다르다는 사실 자체를 계약이 모른다"** 이다. 후자는 종류 ②와 같은 병이며 처방도 같다 — 결과와 무관하게 `limits`에 문장을 남긴다.

---

## 7. 판정 보류

### 7.1 기준선의 보류 2건은 해소됐다

기준선 §5가 남긴 두 건을 소스로 확인했다. **이건 §3.4가 제안한 방법이 실제로 무엇을 갚는지 보여주는 사례이기도 하다** — 문서가 답하지 못한 것을 소스가 답했다.

1. **Toast의 상태 prop 이름** — upstream 소스는 명령형 매니저(`createToastManager`·`toast`·`useToastManager`)와 `Toaster`를 export하고, 문서가 축자로 적은 대로 옵션 이름은 **`type`**이다. 우리 `toast.tsx`는 Radix Toast primitive 기반의 컴포넌트 집합이라 대응하는 prop이 없고, `limits`가 *"전역 toast 큐와 명령형 호출 API는 소비처가 소유한다"* 로 이미 닫았다. **표기 차이가 아니라 구현 갈래 차이이고, 그 갈래는 기록돼 있다.**
2. **Toggle의 `size` 값 문자열** — 문서 페이지는 "Small / Default / Large"만 보이고 문자열을 적지 않아 기준선이 확인하지 못했다. **레지스트리 소스의 `cva`가 `sm`·`default`·`lg`다.** 우리와 일치한다. 같은 방법으로 `Switch`의 `sm`·`default`도 확인했다(문서는 "small"이라는 산문 표기만 준다).

### 7.2 오늘 새로 남기는 보류 2건

1. **`ToastContent`·`ToastPortal`** — Base UI 갈래 Toast의 구조 노드다. 우리 Toast는 Radix 갈래라 대응 노드의 성격 자체가 다르고, **Base UI 이행 판정([#152](https://github.com/flameware/massive-design/issues/152))이 나기 전에는 "우리에게 없는 표면"인지 "다른 갈래의 이름"인지 가릴 수 없다.** 가르려면 Base UI Toast의 anatomy가 Radix의 `Root`/`Viewport`와 어떻게 대응하는지 두 primitive 문서를 나란히 읽어야 한다.
2. **upstream 스타일 갈래 여덟 중 우리가 무엇과 대조해야 하는가** — `style-lyra.css`를 읽어 ⓑ를 쟀지만, 발행 문서가 기본으로 렌더하는 스타일이 어느 것인지 페이지에서 확인되지 않았다. ⓑ 판정(결정이 존재하는가)은 갈리지 않지만, **값을 인용해야 하는 티켓**은 자기 스타일 갈래를 먼저 정해야 한다. 가리려면 `apps/v4`의 스타일 해석 코드(`registry/styles.tsx`·`config.ts`)를 읽는다.

---

## 8. 낼 티켓 — 제안 (이 문서는 열지 않는다)

#139의 destination을 실제로 닫으려면 여덟이다. **1은 맵 안이고**(로스터에 이미 있던 항목이다), **2–7은 새 발견이라 맵이 삼킬지 별도 effort로 낼지는 맵의 판단**이다. 8은 기록만 하는 일이다.

| # | 제목(안) | 내용 | 호환성 |
|---|---|---|---|
| 1 | **승격 표면 확장 — Field `FieldLegend`의 legend/label 축** | #121의 판정 3 여덟 번째. `FieldLegend`에 `parts`와 축을 세우고 기본값은 `legend`(발행된 인스턴스를 지키는 값). `label` 모양이 `FieldLabel` 클래스를 복제하지 않도록 상수 공유 여부를 #154의 선례로 판정 | additive |
| 2 | **Popover의 Header·Title·Description 세 파트** | Dialog·Sheet·Alert Dialog가 이미 갖는 셋을 Popover만 갖지 않는 카탈로그 내부 비대칭. `popover`는 `parts`가 없는 계약이라 [#155](https://github.com/flameware/massive-design/issues/155)와 같은 세대에서 하면 게이트 위반 점검이 함께 붙는다 | additive |
| 3 | **Progress의 라벨·값과 `parts` 신설** | `ProgressLabel`·`ProgressValue`를 열고, 같은 티켓에서 `ProgressTrack`·`ProgressIndicator`의 이름 문제를 `parts` 신설로 해소한다. **#155의 모집단과 겹치므로 그쪽에 붙이는 편이 쌀 수 있다** | additive |
| 4 | **구분선 파트 둘 — `CommandSeparator`·`FieldSeparator`** | 한 티켓으로 묶는 근거: 둘 다 1px 선이고, upstream이 둘 다 `bg-*`로 그려 [#154](https://github.com/flameware/massive-design/issues/154)가 `DropdownMenuSeparator`에서 잡은 계열 위반을 그대로 갖고 온다. `border-t`로 그리는 답이 이미 있다 | additive |
| 5 | **`TableFooter`와 Input Group의 `InputGroupText`·`InputGroupTextarea`** | 셋 다 기존 껍데기 안에 새 노드 하나를 세우는 일이고 새 축이 없다. 묶는 근거는 검증 컨텍스트(셋 다 `parts` 있는 계약에 파트 추가) | additive |
| 6 | **`ButtonGroupSeparator`의 `orientation` 축** | 파트 축이라 셀이 2배가 된다. 기본값은 upstream과 같은 `vertical`이 **아니라** 발행된 인스턴스를 지키는 값이어야 한다 — 오늘 `self-stretch`가 무엇을 그리는지 먼저 재고 정한다(#143·#144의 규칙) | 기본값 선택에 따라 갈림 |
| 7 | **`Item`의 `size: xs`와 `Badge`의 면 종류** | 둘 다 "축은 늘지만 소비처가 유틸리티로 끝내는가"를 다시 묻는 자리라 `Card` `size` 선례(판정 2)와 정면으로 부딪친다. **판정 티켓이지 구현 티켓이 아니다** | 판정에 따라 갈림 |
| 8 | **열지 않기로 한 것을 `limits`에 남긴다** | §5.2의 여덟 항목(표면 11개) + §6.2의 두 항목. ADR-0006이 세운 원칙 그대로 — 기록이 없으면 다음 재조회가 같은 자리를 다시 발견한다. 코드 변경 0, 매니페스트 해시 불변 | 비-breaking |

**그리고 §3.4의 절차를 어디에 남길 것인가**는 이 문서가 정하지 않는다. 게이트가 될 수 없으므로 `docs/agents/`의 재조회 절차거나 다음 재조회 티켓의 본문이며, ADR을 새로 낼 만한 결정인지는 맵이 판단한다.

---

## 9. 다음 기준선 (이 문서가 대체하는 값)

- **기준선 일자: 2026-09-01**
- **shadcn/ui 카탈로그: 64개** (2026-08-31 목록과 문자열 단위로 동일)
- **upstream 레지스트리 커밋: `63c1308d112b`** (`shadcn-ui/ui` head, 2026-08-31T09:54Z). `apps/v4/registry/bases/base/ui`의 마지막 변경은 `503a3a57aec9` (2026-08-31T09:43Z, MessageScroller — 우리 카탈로그 밖)
- **massive-design 구현: 51개 파일 / 비교 대상 50개**, 컴포넌트 층위 gap 64 − 50 = 14개
- **표면 층위 공백: 0이 아님** — 로스터 이탈 1건 + 종류 ② **22개 표면 / 14개 컴포넌트**(§5.1의 판정 3 제안 8행 11표면, §5.2의 판정 1·2·흡수 8행 11표면)
- **기록되지 않은 어긋남: 2건** (Badge `variant` 값 집합, `NativeSelectOptGroup` 이름)
- **판정 보류: 2건** (§7.2)

## 10. 조회한 곳

조사일 **2026-09-01**. 전부 1차 출처다.

- `https://ui.shadcn.com/docs/components` — 카탈로그 사이드바 (64개 확인)
- `https://ui.shadcn.com/docs/changelog` — 기준선 이후 신규 엔트리 확인
- `https://ui.shadcn.com/docs/components/base/<slug>` — 우리가 구현한 50개에 대응하는 slug 전체
- `github.com/shadcn-ui/ui` `apps/v4/registry/bases/base/ui/<slug>.tsx` — 50개 소스(export 블록·`cva` variants). GitHub API로 조회
- `github.com/shadcn-ui/ui` `apps/v4/registry/styles/style-lyra.css` — `cn-*` 클래스 선언 (ⓑ 판정용)
- 리포 직접 확인: `packages/ui/src/components/ui/*.tsx`(51개의 `publicExports`·`anatomy`·`parts`·`configurationStates`·`limits` 전문), `packages/ui/dist/manifest/*.gen.json`(`axes`·`parts.*.axes`), `verification/repo-verification.json`
- 선행 기록: [#121](https://github.com/flameware/massive-design/issues/121), [#127](https://github.com/flameware/massive-design/issues/127), [#139](https://github.com/flameware/massive-design/issues/139), [#142](https://github.com/flameware/massive-design/issues/142)·[#143](https://github.com/flameware/massive-design/issues/143)·[#144](https://github.com/flameware/massive-design/issues/144)·[#145](https://github.com/flameware/massive-design/issues/145)·[#146](https://github.com/flameware/massive-design/issues/146)·[#154](https://github.com/flameware/massive-design/issues/154)·[#161](https://github.com/flameware/massive-design/issues/161), [ADR-0006](../adr/0006-uncontracted-surfaces.md)·[ADR-0007](../adr/0007-knockout-border.md)·[ADR-0008](../adr/0008-axis-and-value-name-spaces.md), `docs/research/shadcn-catalog-recheck-2026-08.md`(브랜치 `research/shadcn-catalog-recheck-2026-08`)
