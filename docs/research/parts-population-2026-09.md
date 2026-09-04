# parts 공백 모집단 — 기계 계수 (2026-09)

확정: 2026-09-04 · 근거 티켓 [#195](https://github.com/flameware/massive-design/issues/195) · 맵 [#221](https://github.com/flameware/massive-design/issues/221) · 기준선 `df8246756485` (main, 2026-09-04)

**"클래스를 내면서 `parts` 없이 선 계약"의 모집단을 만드는 절차와 그 결과다.** [#155](https://github.com/flameware/massive-design/issues/155)의 표(9)·[#195](https://github.com/flameware/massive-design/issues/195)의 의도 계수(14)·`parts` 키 부재(22) 세 수가 갈렸고, 셋 다 사람이 센 것이라 어느 것도 믿을 수 없었다(맵 규칙 1). 여기서는 **세 기준을 전부 기계로 다시 내고**, 그 위에서 어느 정의가 맞는지를 정했다.

이 문서는 [`docs/agents/upstream-surface-recount.md`](../agents/upstream-surface-recount.md)의 자매다 — 저쪽은 *upstream에 있는데 우리에게 없는 표면*(anatomy 층위)을, 여기는 *우리에게 이름은 있는데 매니페스트에 닿지 않는 클래스*(parts 층위)를 잰다. 둘 다 판정하지 않고 **판정을 걸 대상**만 만든다.

## 1. 기준 — 무엇이 침묵인가

[ADR-0006](../adr/0006-uncontracted-surfaces.md)이 `Card`에서 잡은 것은 *"`parts` 키가 없다"*가 아니라 **우리 노드가 내는 클래스가 어느 매니페스트 셀에도 없다**는 사실이다. 게이트·린트·파생 채널은 셀만 보므로, 셀에 없는 클래스는 통과가 아니라 침묵이다. 그래서 기준은 셋 중 어느 것도 아니고 **침묵의 정의 그 자체**다:

> **한 계약의 소스에서 `className`을 받는 JSX 노드의 클래스 토큰이, 그 계약의 매니페스트(루트 셀 ∪ `parts.*` 셀)의 `className` 토큰 합집합에 전부 들어 있지 않으면 그 노드는 닿지 않은 것이다.** 모집단은 닿지 않은 노드가 **anatomy에 이름을 가진** 계약이다.

- **단위는 노드이고 표기가 아니다.** `className={cn(…)}`도 맨 문자열도 변수도 클래스를 낸다 — #155가 한 표기로 걸러서 `checkbox`·`switch`를 놓쳤고([#162](https://github.com/flameware/massive-design/issues/162)의 실패 모드), `alert-dialog`는 표기까지 맞는데 그냥 빠졌다.
- **정본은 매니페스트다.** `scripts/manifest/build.mjs`가 컴파일하는 클래스 집합이 정확히 루트·parts 셀 `className`의 토큰 합집합이므로, "닿는다"를 그 집합으로 정의하면 스크립트가 게이트와 같은 것을 본다.
- **`parts` 키의 유무는 기준이 아니다.** 키가 없어도 루트 하나짜리 계약은 `config`·`className`으로 이미 닿아 있고(10개), 키가 있어도 절반만 채운 계약은 남는다(`scroll-area`·`sidebar`). 22는 필드의 수이지 침묵의 수가 아니다.
- **anatomy 밖 노드는 따로 센다.** `svg`·`sr-only span`·`ItemIndicator` 같은 내부 노드는 [ADR-0018](../adr/0018-anatomy-is-the-consumer-assembly.md)이 anatomy가 아니라고 정했고, 로더가 `parts ⊆ anatomy`를 강제하므로 `parts`가 담을 수 없다. 침묵은 맞지만 **층이 다르다**(§4).

## 2. 절차 — 재현 명령

**정본은 게이트다** ([#246](https://github.com/flameware/massive-design/issues/246)). 이 문서의 첫 판을 낸 계수기(`parts-population-2026-09.count.mjs`)는 `packages/ui/scripts/manifest/parts-coverage.mjs`가 같은 기준·같은 알고리즘으로 대체했고 `bun run check`(check.mjs 규칙 6)가 매 세대 돌린다. 프로토타입 파일은 지웠다 — 두 자리에 같은 계수가 있으면 갈린다.

```sh
bun run check                                              # 규칙 6 — 모집단이 0이 아니면 빨갛다
(cd packages/ui && node scripts/manifest/parts-coverage.mjs)          # 요약 한 줄: 모집단·예외·anatomy 밖 미도달
(cd packages/ui && node scripts/manifest/parts-coverage.mjs --nodes)  # 노드 한 줄씩 → parts-population-2026-09.nodes.tsv 와 같은 열
```

매니페스트는 커밋된 것을 읽는다(같은 `check` 사슬의 `manifest:verify`가 소스와의 일치를 보증한다). 계약 모듈을 import하지 않으므로 node에서 돌고 1초 안에 끝난다.

게이트가 하는 일은 셋이다. ① 각 `dist/manifest/<name>.gen.json`에서 닿은 토큰 합집합(루트 셀 ∪ `parts.*` 셀)을 만든다. ② 매니페스트의 `source`를 `@babel/parser`(`scripts/tsx-ast.mjs`, #228의 포인터 대상 스캔과 공유)로 파싱해 `className` 속성을 가진 JSX 노드마다 **클래스 자리**의 문자열을 토큰으로 모은다(`cn()` 인자, `cva` base 와 `variants.*.*`, 같은 파일·`@/components/ui/*`의 선언, 리터럴 인자로 고른 변형만 — 비교식·삼항 조건·`defaultVariants`·변형 선택 인자는 클래스가 아니므로 내려가지 않는다). ③ 둘을 대조해 노드별 `carried`와 빠진 토큰을 낸다. 노드는 `data-slot`으로 anatomy 이름에 대응한다(`checkbox-indicator` → `Indicator`처럼 컴포넌트 접두를 뗀 이름도 본다 — #243의 규칙).

**묻는 것과 세는 것을 가른다.** anatomy 이름이 있는 미도달 노드는 게이트를 실패시키고, anatomy 밖 노드(§4)는 요약에 수로만 나온다. 해석 못 한 식별자도 실패다 — 게이트가 못 보는 클래스는 침묵이므로, 같은 파일·`@/components/ui/*`의 선언으로 풀리게 쓴다.

**기록된 제외는 예외 파일에 산다** — `packages/ui/scripts/manifest/parts-coverage.exceptions.json`. §3.2의 등급표에서 "기록된 결정"·"측정 한계"로 제외한 둘이 항목이고, 항목마다 이유와 함께 **검사 가능한 주장**을 하나 얹는다: `elsewhere: "button"`(빠진 토큰 전부가 그 계약의 셀에 있다 — [ADR-0012](../adr/0012-drawn-elsewhere.md)의 `elsewhere:` 등급)·`overriddenBy: "min-w-0 px-3"`(빠진 토큰 각각이 tailwind-merge로 덮인다 — §2의 한계였던 것을 게이트가 직접 확인한다). 게이트는 이유를 믿지 않고 주장이 거짓인지만 본다(rules.md — *the gate only ever checks the declaration for falsehood*). 노드가 닿게 되면 항목이 낡았다고 알리므로 목록이 게이트보다 오래 살지 못한다. #232의 포인터 게이트 예외 JSON과 모양은 같고, 다른 것은 이유 옆의 주장 하나다.

## 3. 결과

51개 계약, `className`을 받는 노드 290개. 닿지 않은 노드 95개 = anatomy 이름이 있는 56개 + 없는 39개.

### 3.1 다섯 기준의 수

| 기준 | 수 | 계약 |
|---|---|---|
| [A] `parts` 키가 없다 | **22** | accordion alert-dialog badge button card checkbox collapsible dialog input label list-row radio-group select separator sheet skeleton spinner switch textarea toast toggle tooltip |
| [B] #155 표의 기준 — parts 없음 ∧ anatomy≥2 ∧ `className={cn(…)}` 노드≥2 | **10** | accordion alert-dialog card collapsible dialog list-row radio-group select sheet toast |
| [C] #155 첫 문장의 의도 — parts 없음 ∧ 클래스를 내는 노드≥2, 표기 불문 | **12** | [B] + checkbox switch |
| [D] 매니페스트에 닿지 않는 클래스를 내는 anatomy 노드가 있다 (**채택 기준**) | **16** | [C] + pagination scroll-area sidebar toggle-group |
| [D′] anatomy 밖 노드가 닿지 않는 클래스를 낸다 | 14 (39 노드) | accordion breadcrumb calendar carousel combobox command dropdown-menu input-otp menubar native-select navigation-menu pagination select sidebar |

세 옛 수와의 대조:

- **#155의 9는 [B]의 10에서 `alert-dialog` 하나가 빠진 것이다** — 기준을 그대로 만족하는데 표에 없었다. #195의 "누락" 지적이 맞다.
- **#195의 14는 오늘 [C]의 12다** — 그때 더한 다섯 중 `progress`([#167](https://github.com/flameware/massive-design/issues/167))·`popover`([#166](https://github.com/flameware/massive-design/issues/166))가 그 뒤 `parts`를 세웠다. 남은 셋(`alert-dialog`·`checkbox`·`switch`)은 전부 실재한다.
- **22의 [A]에서 10개(badge button input label separator skeleton spinner textarea toggle tooltip)는 침묵이 아니다** — 클래스를 내는 노드가 루트 하나뿐이고 루트는 `config`·`className`으로 이미 닿아 있다. 키의 부재를 침묵으로 읽으면 열 계약을 헛되이 연다.

### 3.2 [D]의 16을 한 건씩 — parts가 있는 넷의 등급

[C]의 12는 전부 `parts`가 없고, 닿지 않은 anatomy 노드가 3·7·6·1·1·5·6·2·4·5·1·5 = **46개**다(계약별 목록은 §3.3). [D]가 더한 넷은 `parts`가 **있는데** 남은 것이라 §3.3 런북과 같은 자리에서 등급을 매긴다 — 기록된 결정인가, 측정 한계인가, 진짜 공백인가.

| 계약 | 노드 | 빠진 토큰 | 등급 |
|---|---|---|---|
| `toggle-group` | `ToggleGroupItem` | `min-w-8 px-1.5 min-w-9 px-2 min-w-10 px-2.5` | **측정 한계** — `toggleVariants`의 size 값을 `toggleGroupItemVariants`의 `min-w-0 px-3`이 tailwind-merge로 덮는다. 렌더에도 셀에도 없는 토큰이라 침묵이 아니다. 제외 |
| `pagination` | `PaginationLink` | Button `outline` variant의 토큰 + `size: default` 토큰 | **기록된 결정** — `drawnBy.currentPage`가 *"현재 페이지에서 Button의 `outline` variant로 바뀐다 — 그리는 것은 Button 계약의 축이다"*라고 적었다([ADR-0012](../adr/0012-drawn-elsewhere.md)의 `elsewhere:` 등급). `size` prop(`default·icon`)의 `default` 쪽이 셀에 없는 것은 같은 문장의 그늘에 있으나 적히지는 않았다 — **`limits` 한 줄이 필요하다.** 모집단에서는 제외 |
| `scroll-area` | `ScrollAreaViewport` | `size-full rounded-[inherit] outline-none focus-visible:ring-[3px] focus-visible:ring-ring` | **공백** — anatomy 둘째 노드이고 포커스 링을 그리는데 `parts`에 없다. `limits`·`drawnBy` 어디에도 문장이 없다. 포함 |
| `sidebar` | `Sidebar`(데스크톱 바깥 `div`·모바일 `SheetContent`), `SidebarTrigger`·`SidebarRail`·`SidebarSeparator`·`SidebarGroupAction`·`SidebarMenuAction` | 7 노드 | **공백** — 루트 셀은 `data-slot="sidebar-container"`의 `sidebarVariants`에서 오고, `data-slot="sidebar"`인 바깥 노드의 클래스(`w-(--sidebar-width) … data-[state=collapsed]:…:w-0`)는 어디에도 없다. 파트 다섯도 `parts`(14개) 밖이다. 포함 |

그래서 **채택 기준의 모집단은 14개 계약, 닿지 않은 anatomy 노드 54개**다.

> **14는 #195가 잠정으로 적은 14와 같은 수이지만 같은 집합이 아니다.** 저쪽은 9 + alert-dialog·progress·checkbox·switch·popover, 여기는 [C]의 12 + scroll-area·sidebar다. 수가 같다고 기록을 맞는 것으로 읽지 않는다 — 규칙 원장의 마지막 규칙이다.

### 3.3 모집단 14 — 계약별 닿지 않은 anatomy 노드

| 계약 | `parts` | 노드 | 무엇이 안 닿는가 |
|---|---|---|---|
| `card` | 없음 | 6 | CardHeader · CardTitle · CardDescription · CardAction · CardContent · CardFooter |
| `list-row` | 없음 | 6 | ListRowLeading · ListRowContent · ListRowTitle · ListRowDescription · ListRowMeta · ListRowTrailing |
| `alert-dialog` | 없음 | 7 | AlertDialogOverlay · Header · Footer · Title · Description · **Action · Cancel**(둘은 `buttonVariants` 호출 — `pagination`의 `PaginationLink` 선례대로 `staticPart(buttonVariants({…}))`) |
| `dialog` | 없음 | 5 | DialogOverlay · Header · Footer · Title · Description |
| `sheet` | 없음 | 5 | SheetOverlay · Header · Footer · Title · Description |
| `toast` | 없음 | 5 | ToastViewport · Title · Description · Action · Close |
| `select` | 없음 | 4 | SelectContent · SelectItem · SelectLabel · **SelectSeparator**(`h-px bg-border` — [#130](https://github.com/flameware/massive-design/issues/130)이 예고한 계열 위반) |
| `accordion` | 없음 | 3 | AccordionItem · AccordionTrigger · AccordionContent |
| `radio-group` | 없음 | 2 | RadioGroupItem · Indicator |
| `checkbox` | 없음 | 1 | Indicator(맨 문자열) |
| `switch` | 없음 | 1 | Thumb(맨 문자열) |
| `collapsible` | 없음 | 1 | CollapsibleContent |
| `sidebar` | 14 | 7 | Sidebar(바깥 `div`·모바일 `SheetContent`) · SidebarTrigger · SidebarRail · SidebarSeparator · SidebarGroupAction · SidebarMenuAction |
| `scroll-area` | 2 | 1 | ScrollAreaViewport |

노드별 행(파일·줄·표기·빠진 토큰)은 [`parts-population-2026-09.nodes.tsv`](parts-population-2026-09.nodes.tsv)에 290줄 전부 있다 — `carried` 열이 `NO`이고 `anatomy` 열이 `-`가 아닌 행이 위 54개다. 이 TSV는 **2026-09-04 기준선의 기록**이고 갱신하지 않는다 — 현재 값은 §2의 `--nodes`가 낸다.

## 4. anatomy 밖의 39 — 이 맵 밖이다

[D′]의 39개 노드는 `svg` 16 · `span` 10(대부분 `sr-only`) · `div` 4 · `ItemIndicator` 5 · 그 밖 4다. 전부 컴포넌트가 스스로 렌더하는 내부 노드라 ADR-0018의 정의로 anatomy가 아니고, 로더가 `parts ⊆ anatomy`를 강제하므로 **`parts`로는 닿게 할 수 없다.** 침묵은 맞다 — `SelectItem`의 `ItemIndicator`(`absolute right-2`)나 `input-otp`의 캐럿(`h-4 w-px animate-pulse bg-foreground`)은 색과 크기를 내는데 어느 셀에도 없다.

닿게 하는 길은 둘인데 둘 다 이 맵의 층이 아니다: 부모 셀의 슬롯 선택자로 끌어올리거나(`[&_svg]` — [ADR-0013](../adr/0013-slot-labels-are-borne-by-the-contract.md)이 "아이콘 어디든"으로 정한 한 줄), 매니페스트 생성기가 내부 노드를 담게 하거나([#140](https://github.com/flameware/massive-design/issues/140)의 후속 — 맵 #221의 Out of scope 첫 항목과 같은 층). 여기 적어 두는 것은 **다음 재조회가 발견이 아니라 기록에서 시작하게** 하기 위해서다(ADR-0006).

## 5. 새 기준선

- 측정일 2026-09-04 · 리포 `df8246756485`(main) · 매니페스트 `manifest:verify` 통과
- 계약 51 · `className` 노드 290 · 닿지 않은 노드 95(anatomy 56 / 밖 39)
- **모집단(채택 기준 [D], 등급 뒤): 14 계약 · 54 노드** — 맵 #221의 destination은 이 수가 0이 되는 것이다
- 기록된 결정으로 제외: `pagination.PaginationLink`(drawnBy) · 측정 한계로 제외: `toggle-group.ToggleGroupItem`(tw-merge)
- 판정 보류: 없음. `PaginationLink`의 `size: default`에 `limits` 한 줄이 빠져 있다(§3.2) — [#246](https://github.com/flameware/massive-design/issues/246)이 채웠다

### 5.1 맵을 닫는 계수 — 2026-09-04, main `887e4cb` + #246

여섯 배치(#240·#241·#242·#243·#244·#245)와 #222가 병합된 뒤 게이트가 낸 값이다(`bun run check` 규칙 6의 요약 그대로):

> parts 모집단 0 (노드 290, 예외로 통과 2: pagination.PaginationLink toggle-group.ToggleGroupItem, anatomy 밖 미도달 38)

- **모집단(채택 기준 [D]): 0** — 맵 [#221](https://github.com/flameware/massive-design/issues/221)의 destination 도달. 기록된 제외 둘은 예외 파일의 검사 가능한 주장으로 통과한다.
- anatomy 밖 미도달: 39 → **38** — `accordion`의 `AccordionPrimitive.Header`(`flex`)가 #242가 `AccordionTrigger`를 등록하며 셀에 들어왔다. 나머지 38은 §4 그대로이고 여전히 이 층 밖이다.
- 이 수는 이 문서가 아니라 게이트가 유지한다 — 다음 재조회는 `bun run check`에서 시작한다.

## 부록 — 계약별 요약 (스크립트 요약 출력 그대로)

| component | hash | anatomy | parts? | partKeys | emittingNodes | cnNodes | uncarried(all) | uncarried(anatomy) | uncarried(other) | uncarriedNames |
|---|---|---|---|---|---|---|---|---|---|---|
| `accordion` | `4f3463aca5d6` | 4 | no | 0 | 7 | 4 | 6 | 3 | 3 | AccordionItem,(AccordionPrimitive.Header),AccordionTrigger,(svg),AccordionContent,(div) |
| `alert` | `6b88a734dc1b` | 4 | yes | 3 | 4 | 4 | 0 | 0 | 0 | - |
| `alert-dialog` | `c9af7f17e33a` | 10 | no | 0 | 8 | 8 | 7 | 7 | 0 | AlertDialogOverlay,AlertDialogHeader,AlertDialogFooter,AlertDialogTitle,AlertDialogDescription,AlertDialogAction,AlertDialogCancel |
| `avatar` | `756a033048b3` | 6 | yes | 5 | 6 | 6 | 0 | 0 | 0 | - |
| `badge` | `37c940c4d831` | 1 | no | 0 | 1 | 1 | 0 | 0 | 0 | - |
| `breadcrumb` | `28e34b93c508` | 7 | yes | 6 | 9 | 7 | 2 | 0 | 2 | (svg),(span) |
| `button` | `6ec13ce8b0c2` | 1 | no | 0 | 1 | 1 | 0 | 0 | 0 | - |
| `button-group` | `5a1d4c7c81d6` | 4 | yes | 2 | 3 | 3 | 0 | 0 | 0 | - |
| `calendar` | `391ec5e6e100` | 8 | yes | 7 | 10 | 8 | 2 | 0 | 2 | (svg),(span) |
| `card` | `82d2063c2dba` | 7 | no | 0 | 7 | 7 | 6 | 6 | 0 | CardHeader,CardTitle,CardDescription,CardAction,CardContent,CardFooter |
| `carousel` | `c2666ff27501` | 6 | yes | 5 | 10 | 6 | 4 | 0 | 4 | (svg),(span),(svg),(span) |
| `chart` | `1e10e7cac154` | 9 | yes | 8 | 9 | 4 | 0 | 0 | 0 | - |
| `checkbox` | `49611f71f120` | 2 | no | 0 | 2 | 1 | 1 | 1 | 0 | Indicator |
| `collapsible` | `4b115285961c` | 3 | no | 0 | 2 | 2 | 1 | 1 | 0 | CollapsibleContent |
| `combobox` | `378d48951e29` | 11 | yes | 3 | 5 | 4 | 1 | 0 | 1 | (Command) |
| `command` | `b5123b0d147e` | 8 | yes | 7 | 9 | 8 | 1 | 0 | 1 | (span) |
| `dialog` | `8cbe1a36cc9e` | 9 | no | 0 | 6 | 6 | 5 | 5 | 0 | DialogOverlay,DialogHeader,DialogFooter,DialogTitle,DialogDescription |
| `dropdown-menu` | `6fbac9bfcf45` | 13 | yes | 7 | 14 | 7 | 5 | 0 | 5 | (ItemIndicator),(svg),(ItemIndicator),(svg),(svg) |
| `empty` | `4dc424478a50` | 6 | yes | 5 | 6 | 6 | 0 | 0 | 0 | - |
| `field` | `1a2e02b81836` | 11 | yes | 9 | 10 | 9 | 0 | 0 | 0 | - |
| `input` | `238507ed3be1` | 1 | no | 0 | 1 | 1 | 0 | 0 | 0 | - |
| `input-group` | `b0c644a4b024` | 6 | yes | 5 | 6 | 6 | 0 | 0 | 0 | - |
| `input-otp` | `05e041a813e9` | 5 | yes | 4 | 6 | 4 | 2 | 0 | 2 | (div),(div) |
| `item` | `a0042739cb1c` | 10 | yes | 9 | 10 | 10 | 0 | 0 | 0 | - |
| `kbd` | `5842eb5fef55` | 2 | yes | 1 | 2 | 2 | 0 | 0 | 0 | - |
| `label` | `12a012388cca` | 1 | no | 0 | 1 | 1 | 0 | 0 | 0 | - |
| `list-row` | `318cb36fbbd1` | 7 | no | 0 | 7 | 6 | 6 | 6 | 0 | ListRowLeading,ListRowContent,ListRowTitle,ListRowDescription,ListRowMeta,ListRowTrailing |
| `menubar` | `717e9b70857e` | 14 | yes | 9 | 15 | 10 | 5 | 0 | 5 | (MenubarPrimitive.ItemIndicator),(svg),(MenubarPrimitive.ItemIndicator),(svg),(svg) |
| `native-select` | `d6531f02868f` | 4 | yes | 1 | 3 | 2 | 1 | 0 | 1 | (native-select-root) |
| `navigation-menu` | `af3c3587734c` | 6 | yes | 5 | 7 | 6 | 1 | 0 | 1 | (svg) |
| `pagination` | `d4c46e1ca5f0` | 7 | yes | 5 | 12 | 6 | 7 | 1 | 6 | PaginationLink,(svg),(span),(span),(svg),(svg),(span) |
| `popover` | `dce574a7ca7d` | 7 | yes | 3 | 5 | 3 | 0 | 0 | 0 | - |
| `progress` | `9a2746f492c7` | 4 | yes | 3 | 4 | 4 | 0 | 0 | 0 | - |
| `radio-group` | `acaf77f3dfa2` | 3 | no | 0 | 3 | 2 | 2 | 2 | 0 | RadioGroupItem,Indicator |
| `resizable` | `889a182cd242` | 4 | yes | 3 | 4 | 4 | 0 | 0 | 0 | - |
| `scroll-area` | `b913c1235a75` | 5 | yes | 2 | 4 | 4 | 1 | 1 | 0 | ScrollAreaViewport |
| `select` | `306160b2cb63` | 8 | no | 0 | 6 | 5 | 5 | 4 | 1 | SelectContent,SelectItem,(SelectPrimitive.ItemIndicator),SelectLabel,SelectSeparator |
| `separator` | `5397c850ef60` | 1 | no | 0 | 1 | 1 | 0 | 0 | 0 | - |
| `sheet` | `c3e0784ff1ea` | 9 | no | 0 | 6 | 6 | 5 | 5 | 0 | SheetOverlay,SheetHeader,SheetFooter,SheetTitle,SheetDescription |
| `sidebar` | `f8b696d95ea6` | 21 | yes | 14 | 27 | 22 | 12 | 7 | 5 | (sidebar-wrapper),(sidebar-inner),Sidebar,(SheetHeader),Sidebar,SidebarTrigger,(svg),(span),SidebarRail,SidebarSeparator,SidebarGroupAction,SidebarMenuAction |
| `skeleton` | `9c2250c043f6` | 1 | no | 0 | 1 | 1 | 0 | 0 | 0 | - |
| `slider` | `e2a8080a65c8` | 4 | yes | 3 | 4 | 4 | 0 | 0 | 0 | - |
| `spinner` | `5880705d6f03` | 1 | no | 0 | 1 | 1 | 0 | 0 | 0 | - |
| `switch` | `c33616592c82` | 2 | no | 0 | 2 | 1 | 1 | 1 | 0 | Thumb |
| `table` | `aaafe040c4a6` | 8 | yes | 7 | 8 | 7 | 0 | 0 | 0 | - |
| `tabs` | `41af970533cb` | 4 | yes | 3 | 4 | 4 | 0 | 0 | 0 | - |
| `textarea` | `7760687906f5` | 1 | no | 0 | 1 | 1 | 0 | 0 | 0 | - |
| `toast` | `15536a1ef2f6` | 7 | no | 0 | 6 | 6 | 5 | 5 | 0 | ToastViewport,ToastTitle,ToastDescription,ToastAction,ToastClose |
| `toggle` | `4aaf46275096` | 1 | no | 0 | 1 | 1 | 0 | 0 | 0 | - |
| `toggle-group` | `a2a397c6cac4` | 2 | yes | 1 | 2 | 2 | 1 | 1 | 0 | ToggleGroupItem |
| `tooltip` | `ec053f2fcb72` | 4 | no | 0 | 1 | 1 | 0 | 0 | 0 | - |
