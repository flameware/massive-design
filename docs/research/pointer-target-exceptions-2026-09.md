# 포인터 대상 예외 목록 — 규칙이 닿지 못하는 자리 (2026-09)

- 티켓: [#231](https://github.com/flameware/massive-design/issues/231) (맵 [#111](https://github.com/flameware/massive-design/issues/111)의 네 번째 티켓)
- 확정일: 2026-09-04
- 정본: 이 문서. 판정 근거는 [ADR-0020](../adr/0020-pointer-target-size-is-borne-by-the-hit-area.md)(하한·기제·용어)과 [`pointer-targets-2026-09.md`](pointer-targets-2026-09.md)(모집단·실측, [#228](https://github.com/flameware/massive-design/issues/228))
- **이 문서가 예외 목록의 정본이다.** `CONTEXT.md` `## 포인터 기하`와 ADR-0020 §파급은 포인터만 두고 내용을 복제하지 않는다.
- 다음 실측(#232가 게이트를 만든 뒤)이 이 표와 diff를 낸다 — 항목이 늘거나 줄면 이 문서를 갱신한다.

**이 문서는 새 결정을 내리지 않는다.** ADR-0020이 정한 하한(24×24)·기제(`after:`)·용어(포인터 대상·히트 영역) 위에서, 실측이 미달로 낸 항목 하나하나가 **왜 규칙이 닿지 못하는가**를 판정한다. 두 항목(라벨, Slider track)은 연구 문서가 판정을 이 티켓에 넘겼다 — §4가 그 판정이다.

---

## 0. 한 줄 결론

실측 미달 15항목(라벨·트랙 포함) 중 **예외로 확정되는 것은 5항목**이다 — 구조(`overflow` 조상에 잘림) 2, 외부 소유 1, WCAG 2.5.8 예외 조항(Equivalent) 2(라벨·Slider track, 둘 다 [#230](https://github.com/flameware/massive-design/issues/230) 완료가 조건). 나머지는 [#230](https://github.com/flameware/massive-design/issues/230)이 규칙을 적용하거나(9항목), 이 map 밖의 별도 결함(Sidebar 아이콘 모드 미구현, 4항목·§5)으로 갈린다. 원래 이슈 본문이 적은 "세 종류"(overflow 조상/`::after` 점유/외부 소유) 중 **`::after` 점유는 실측으로 폐기된다** — 그 자리라고 지목됐던 Resizable은 자기 `after:`가 이미 원하는 히트 영역을 주고 있어 충돌이 없고, 실제 벽은 외부 소유다(§2.2).

---

## 1. 판정 갈래 — 넷

| 갈래 | 뜻 | 뚫는 데 필요한 것 |
|---|---|---|
| **구조** | 대상의 히트 영역이 `overflow≠visible`인 조상(또는 자기 자신) 안에 있고, 24까지 대칭 확장에 필요한 폭이 조상의 padding box까지 남은 여유(`clipRoom`)를 넘는다 | `overflow` 클리핑을 걷어내는 구조 변경 — ADR-0020 결정 2(시각 불변)와 충돌 여부를 먼저 검토해야 하는 별도 effort |
| **외부 소유** | 서드파티 라이브러리가 히트 영역을 자기 파라미터로 갖는다([#122](https://github.com/flameware/massive-design/issues/122)의 외부 소유 표면 규칙) | 그 라이브러리의 API(예: `hitAreaMargins`)를 우리 계약이 받아 소비처에 노출하는 변경 — 계약 필드 추가라 별도 effort |
| **WCAG 예외 조항** | SC 2.5.8이 이 대상에 24×24를 아예 요구하지 않는다 — named exception(Equivalent) 충족 | 요구되지 않으므로 "뚫는다"가 성립하지 않는다. 다만 예외의 **전제**(동등 컨트롤이 24×24를 만족)가 깨지면 재판정한다 |
| **(폐기) `::after` 점유** | 원 이슈 본문의 셋째 갈래. 실측 뒤 이 갈래에 속하는 항목이 하나도 없었다 — Resizable은 외부 소유로, Sidebar rail은 §5에서 다른 이유로 갈린다 | — |

WCAG 2.5.8의 다섯 named exception 중 **Equivalent**만 여기서 쓴다: *"같은 기능이 이 페이지의 다른 컨트롤로 달성되고 그 컨트롤이 이 기준을 만족한다."* Spacing은 ADR-0020 결정 1이 이미 기대지 않기로 했고, User Agent Control·Essential·Inline은 §4가 각 항목에서 기각한다.

---

## 2. 구조·외부 소유 — 실측이 낸 셋

### 2.1 구조 — `overflow` 조상에 잘림 (2)

| 컴포넌트 | slot | 셀 | hit (짧은 축) | 잘라내는 조상 | `clipRoom` | 24까지 필요한 확장 |
|---|---|---|---|---|---|---|
| Scroll Area | `scroll-area-thumb` | `orientation:vertical`/`horizontal` | 8 / 9 | `scroll-area[xy]`(`overflow-hidden`) | **1** | 편측 8 |
| Scroll Area | `scroll-area-scrollbar` | `orientation:vertical`/`horizontal` | 10 / 11 | 동일 | **0** | 편측 7 |

Scroll Area의 뷰포트 클리핑은 콘텐츠가 스크롤 영역 밖으로 넘치는 것을 막는 존재 이유 그 자체라, `overflow-hidden`을 걷어내는 것은 컴포넌트를 재설계하는 일이다(ADR-0020 결정 2와 정면으로 부딪힌다). 뚫으려면 스크롤 영역 **바깥**에 별도 히트-오버레이 레이어를 얹는 구조 변경이 필요하고, 이는 이 map이 다루는 "발행된 시각을 그대로 두고 히트 영역만 넓힌다"는 전제를 벗어난 별도 effort다.

### 2.2 외부 소유 (1)

| 컴포넌트 | slot | 셀 | hit | `clipRoom` | 이유 |
|---|---|---|---|---|---|
| Resizable | `resizable-handle` | `orientation:horizontal`/`vertical` | 5×92(`after` 4px) / 510×13 | 0 | `react-resizable-panels`가 히트 영역을 자기 prop `hitAreaMargins`로 갖는다. `resizable.tsx`가 이미 `externalSurfaces`에 이 경계를 적어 뒀다([#122](https://github.com/flameware/massive-design/issues/122)) |

**정정 — `::after` 점유가 아니다.** 맵 Notes·ADR-0020 §파급은 Resizable이 "의사 요소가 하나뿐이라" 벽에 걸린다고 적었지만, 실측을 보면 Resizable의 `after:w-1`은 **이미 히트 영역 확장 그 자체**로 쓰이고 있다 — 다른 용도와 경합하지 않는다. 진짜 벽은 `clipRoom 0`(패널 그룹이 여유를 안 준다)과 **라이브러리가 정답 경로를 이미 갖고 있다**는 것 둘이다. 우리 `after:` 기제로 더 확장하기 전에 라이브러리의 `hitAreaMargins`를 쓰는 것이 맞으므로 갈래는 **외부 소유**로 확정한다.

---

## 3. 원 이슈의 "아홉"과 실측의 "둘" — 계산

이슈 본문은 `overflow-hidden` 유틸리티를 가진 파일 아홉 개(`accordion`·`collapsible`·`avatar`·`carousel`·`item`·`progress`·`scroll-area`·`sidebar`·`slider`)를 적었다. 실측이 **대상 노드의 조상에 실제로 `overflow≠visible`이 있는가**로 다시 물은 결과는 다르다.

- `accordion`·`collapsible`·`avatar`·`carousel`·`item`·`progress`의 `overflow-hidden`은 대상 노드를 **자르지 않는다** — 그 안에 포인터 대상이 없다(Accordion trigger는 Content 밖, Carousel prev/next는 `overflow-hidden` 래퍼 밖).
- `slider`의 `overflow-hidden`은 Track에 걸리고, Thumb는 Track의 **형제**(Root의 직계 자식)라 잘리지 않는다. Track 자신은 §4.2에서 다른 이유(WCAG)로 갈린다.
- `sidebar`의 `overflow-auto`(`sidebar-content`)는 group-action·menu-action(20px)을 자르지 않는다 — room 20으로 24까지 필요한 확장(편측 2)보다 넉넉하다. 이 둘은 [#230](https://github.com/flameware/massive-design/issues/230)의 일감이다.
- `scroll-area`만 실제로 자른다 — §2.1의 둘.

**구조 예외는 아홉이 아니라 둘이다.** 이 사실 확인은 실측 문서(§4.2)가 이미 낸 것이고, 이 문서는 그 결과를 예외 목록으로 착지한다.

---

## 4. 판정 보류 둘

### 4.1 라벨(`label`·`field-label`) — WCAG 예외 조항, 조건부

**측정값.** 높이 14–16(`text-sm` 한 줄), 가로 방향 라벨(`orientation:horizontal`)은 한 축이 12–20으로 더 좁다.

**Inline 예외는 기각한다.** SC 2.5.8의 Inline 예외 문구는 "대상이 **문장 안에** 있거나, 그 크기가 **비-대상 텍스트의 줄높이로 달리 제약**될 때"다. `Label`·`FieldLabel`은 문장 속에 섞인 링크가 아니라 컨트롤에 붙는 **독립된 캡션**이고, 그 옆에 있는 것은 컨트롤(체크박스 등, 텍스트가 아니다)이지 "비-대상 텍스트"가 아니다. 둘 다 성립하지 않는다.

**Equivalent 예외가 성립한다 — 조건부.** 라벨의 유일한 기능은 연결된 컨트롤을 활성화(토글/포커스)하는 것이고, **같은 기능을 컨트롤 자신을 눌러도 얻는다.** 페어링 대상별로:

| 페어링 컨트롤 | 24×24 충족 | 근거 |
|---|---|---|
| Checkbox·Radio·Switch | [#230](https://github.com/flameware/massive-design/issues/230) 착지 후 | 이 셋은 #230의 규칙 적용 대상(§6) — 지금은 16–20px |
| Input·Textarea·Native Select 등 | 지금 이미 충족 | 이 컨트롤들은 미달 목록(§2·연구 문서 §4.1)에 없다 |

`FieldLabel`은 어느 컨트롤과도 짝지어질 수 있는 범용 파트라, 예외가 **컨트롤에 의존한다**는 조건을 명시한다. **#230이 Checkbox·Radio·Switch를 24×24로 올리기 전까지는 이 예외의 전제가 완성되지 않는다** — 그때까지 라벨 자체는 여전히 미달이지만, 라벨을 뚫는 별도 작업은 필요 없다: 짝 컨트롤이 뚫리면 라벨은 자동으로 예외 조건을 만족한다.

### 4.2 Slider track(`slider-track`) — WCAG 예외 조항, 조건부

**측정값.** 두께 4/6/8(`size` sm/default/lg), 길이 384(가로)/176(세로). `overflow-hidden`은 Track 자기 자신에 걸려 있다(Range의 둥근 모서리를 자르는 용도, `sliderTrackVariants`).

**포인터 대상인가?** 그렇다 — 스캔이 `primitive:press-surface` 규칙으로 이미 후보에 넣었고(연구 문서가 판정을 미룬 것도 그 전제 위에서다), Track을 누르면 값이 그 위치로 옮겨진다. `CONTEXT.md`의 정의("포인터 한 번의 누름으로 활성화되거나 끌리는 최소 단위 노드")를 만족한다.

**24×24를 채우는 방향은 기각한다.** Track 두께를 올리는 것은 ADR-0020 결정 2(시각 치수 불변)와 정면으로 부딪힌다 — Track의 시각 두께가 곧 슬라이더의 시각 정체성이다.

**Equivalent 예외가 성립한다 — 조건부, 이중 경로.** Track이 주는 기능(값 설정)은 이미 두 개의 다른 경로로 동등하게 제공된다.

1. **Thumb 드래그** — [#230](https://github.com/flameware/massive-design/issues/230)이 Slider thumb(14/16/20 → 24)를 규칙 적용 대상으로 이미 갖고 있다. Thumb가 24×24에 닿으면 이 경로가 기준을 만족한다.
2. **키보드** — Thumb 포커스 후 화살표·Home·End·PageUp·PageDown이 Radix가 이미 주는 경로이고, 키보드 조작에는 "크기"라는 속성 자체가 없다.

부가로, `rules.md`(대비 규칙)가 이미 Track을 **잔여**로 다뤄 왔다 — *"채워진 부분이 의미를 나른다"*는 이유로 Track은 대비 의무도 지지 않는다(#109). 크기 판정에서도 Track이 "겨냥의 단위"가 아니라 "드래그 가능한 배경"이라는 같은 결이 반복된다. `CONTEXT.md`의 포인터 대상/컨트롤 어포던스 구분이 두 낱말을 섞지 말라고 경고한 것과 마찬가지로, 여기서도 판정의 근거(Equivalent)와 Track의 역할(잔여)은 다른 질문이라는 점을 밝혀 둔다 — 예외의 근거는 어디까지나 Equivalent이지 "잔여라서 안 세도 된다"가 아니다.

**#230 착지 전까지는 이 예외도 전제가 미완성이다** — 라벨과 같은 모양의 조건부다.

---

## 5. 목록에 없는 것 — Sidebar 아이콘 모드 (제외, 별도 티켓)

미달 13종(연구 문서 §4.1) 중 넷은 이 예외 목록에도 [#230](https://github.com/flameware/massive-design/issues/230)에도 넣지 않는다.

| 컴포넌트 | slot | 셀 | 이유 |
|---|---|---|---|
| Sidebar | `sidebar-menu-button` | `collapsible:icon;state:collapsed` | Sidebar의 아이콘 모드가 애초에 안 그려진다 — `sidebar.tsx`에 `group-data-[collapsible=icon]:` 규칙이 없다(연구 문서 §4.3) |
| Sidebar | `sidebar-menu-sub-button` | 동일 | 동일 |
| Sidebar | `sidebar-group-action`·`sidebar-menu-action` | `collapsible:icon;state:collapsed`(`center-miss`, room **−8**) | 상자 자체가 `sidebar-content`의 padding box 밖에 있다 — 히트 영역이 아니라 레이아웃 자체의 결함 |

이 넷은 **포인터 대상 크기 규칙이 닿지 못하는 자리가 아니라, 그리기 자체가 안 된 자리**다. 규칙을 적용할 대상(#230)도, 규칙이 구조·외부 소유·WCAG로 막힌 자리(#231)도 아니다 — 아이콘 모드가 정상적으로 그려진 뒤에야 이 위치들의 실제 치수가 나오고, 그때 다시 재측정해서 셋 중 어디로 갈지 정한다. 연구 문서 §6이 이미 새 티켓을 제안했다: **"Sidebar 아이콘 모드 미구현"**, 맵 밖(`ADR-0010`의 "선언했으면 그린다" 위반).

`sidebar-rail`(폭 16, 부족분 8)은 §4.1의 미달 표에 있지만 세로 방향의 잘림은 스토리 래퍼의 측정 artifact이고 실제 결함은 폭뿐이다 — 이것은 아이콘 모드 결함이 아니라 **[#230](https://github.com/flameware/massive-design/issues/230)의 일감**이다(16px 계열, `after:` 확장). 다만 `sidebar-rail`은 이미 `after:`를 hover 강조선(`after:w-[2px]`)에 쓰고 있어 그대로 재사용할 수 없다 — `before:`를 쓰거나 두 목적을 한 `after:` 규칙에 합치는 구현 선택이 필요하다는 점만 여기 적어 둔다(#230의 구현 메모이지 예외가 아니다 — 두 의사 요소를 동시에 쓸 수 있어 구조적으로 막힌 자리가 아니다).

---

## 6. 전체 계정 — 15항목이 어디로 가는가

| # | 컴포넌트 | slot | 갈래 | 상세 |
|---|---|---|---|---|
| 1 | Checkbox | `checkbox` | #230 규칙 적용 | §7 |
| 2 | Radio Group | `radio-group-item` | #230 규칙 적용 | §7 |
| 3 | Switch | `switch`(default·sm) | #230 규칙 적용 | §7 |
| 4 | Slider | `slider-thumb`(sm·default·lg) | #230 규칙 적용 | §7, §4.2의 Equivalent 전제이기도 하다 |
| 5 | Scroll Area | `scroll-area-thumb` | **예외 — 구조** | §2.1 |
| 6 | Scroll Area | `scroll-area-scrollbar` | **예외 — 구조** | §2.1 |
| 7 | Resizable | `resizable-handle` | **예외 — 외부 소유** | §2.2 |
| 8 | Sidebar | `sidebar-group-action`(expanded) | #230 규칙 적용 | room 20, §3 |
| 9 | Sidebar | `sidebar-menu-action`(expanded) | #230 규칙 적용 | room 20, §3 |
| 10 | Sidebar | `sidebar-menu-button`(icon-mode) | 별도 티켓(맵 밖) | §5 |
| 11 | Sidebar | `sidebar-menu-sub-button`(icon-mode) | 별도 티켓(맵 밖) | §5 |
| 12 | Sidebar | `sidebar-group-action`·`-menu-action`(icon-mode) | 별도 티켓(맵 밖) | §5 |
| 13 | Sidebar | `sidebar-rail` | #230 규칙 적용 | §5, `before:` 구현 메모 |
| 14 | Toast | `toast-close` | #230 규칙 적용 | §7 |
| 15 | Label/FieldLabel | `label`·`field-label` | **예외 — WCAG(Equivalent), 조건부** | §4.1 |
| 16 | Slider | `slider-track` | **예외 — WCAG(Equivalent), 조건부** | §4.2 |

**16행이다** — 연구 문서의 "미달 13종"에 라벨·Slider track(둘 다 판정 보류였다)을 더하면 15항목인데, Sidebar의 icon-mode 셋(#10–12)을 한 줄로 셀지 셋으로 셀지에 따라 13 또는 15로 갈렸던 것과 같은 이유로 표는 슬롯 단위로 16행을 낸다. **예외로 확정되는 것은 5행(#5·6·7·15·16)** — 이 문서의 결론이다.

---

## 7. #230으로 가는 항목의 요약 (참고, #230의 소유는 아니다)

이 문서는 예외 목록이 아닌 항목의 작업을 지시하지 않는다 — 아래는 연구 문서 §4.4·§6이 이미 낸 내용을 이 문서의 전체 계정표(§6)와 잇기 위한 참고일 뿐이다.

- **16px 계열**(편측 4px): Checkbox·Radio·Switch(세로)·Slider thumb(default)·Sidebar rail
- **20px 계열**(편측 2px): Switch(세로, sm 예외)·Slider thumb(lg)·Sidebar group-action·menu-action(가로)
- **22.4px 텍스트 계열**(편측 약 0.8px, 기제가 다를 수 있음): Toast close, 그리고 경계의 Breadcrumb link·Toast action

---

## 8. 한계

- `overflow` 여지(`clipRoom`)와 라벨·트랙의 Equivalent 판정은 모두 [`pointer-targets-2026-09.md`](pointer-targets-2026-09.md)가 낸 실측값 위에서 내렸다 — 그 문서의 한계(참조 스토리만 잰다·±1px·중심선은 두꺼운 쪽을 읽는다·이웃 간격은 재지 않는다·게이트가 아니다)가 그대로 이어진다.
- 라벨·Slider track의 예외는 **조건부**다 — [#230](https://github.com/flameware/massive-design/issues/230)이 Checkbox·Radio·Switch·Slider thumb를 24×24로 올리지 못하면 이 둘의 Equivalent 전제가 무너지고 재판정이 필요하다. #230 착지 뒤 이 문서의 §4를 다시 확인한다.
- Sidebar 아이콘 모드(§5)가 다른 형태로 그려지도록 고쳐지면 그 넷의 실측값이 통째로 바뀐다 — 지금 표의 값은 재판정의 입력이 아니라 "왜 지금 재지 않는가"의 기록이다.
