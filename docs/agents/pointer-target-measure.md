# 포인터 대상 재계수·실측 절차

확정: 2026-09-04 · 근거 티켓 [#228](https://github.com/flameware/massive-design/issues/228) · 맵 [#111](https://github.com/flameware/massive-design/issues/111) · 결정 [ADR-0020](../adr/0020-pointer-target-size-is-borne-by-the-hit-area.md) 결정 7 · 정본 [`docs/research/pointer-targets-2026-09.md`](https://github.com/flameware/massive-design/blob/research/pointer-target-instrument-228/docs/research/pointer-targets-2026-09.md)

**"카탈로그의 포인터 대상이 무엇이고 각각의 실효 히트 영역이 몇 px인가"의 모집단과 값을 만드는 절차다.** 24×24 하한([ADR-0020](../adr/0020-pointer-target-size-is-borne-by-the-hit-area.md) 결정 1)에 대한 판정을 걸 대상이 여기서 나오고, 이후 모든 포인터 대상 재계수([#230](https://github.com/flameware/massive-design/issues/230)·[#231](https://github.com/flameware/massive-design/issues/231)·[#232](https://github.com/flameware/massive-design/issues/232))가 여기서 시작한다.

**이 절차는 결정하지 않는다.** 낱말(포인터 대상·히트 영역)은 `CONTEXT.md` `## 포인터 기하`가, 하한과 기제는 ADR-0020이 정했다. 여기 있는 것은 **그 판정을 걸 대상과 값을 무엇으로 만드는가** 둘뿐이다.

## 0. 이 절차가 서는 이유 — 이름은 코드가, 치수는 렌더가 준다

두 가지를 하지 않는다.

- **매니페스트 `anatomy`·`parts`로 모집단을 만들지 않는다.** `parts`가 없는 계약이 있어([#155](https://github.com/flameware/massive-design/issues/155)) 구멍 난 계기이고, 그것이 [#162](https://github.com/flameware/massive-design/issues/162)가 당한 실패 모양이다. Slider의 thumb·Resizable의 handle처럼 공개되지 않은 노드도 포인터는 겨냥한다.
- **클래스 이름을 눈으로 픽셀로 옮기지 않는다.** `h-9`을 36px이라 읽는 것이 [#165](https://github.com/flameware/massive-design/issues/165)가 금지한 "눈으로 읽은 모집단"이다. 실제로 `size-4`(16px) Checkbox가 실측에서 16×17로 읽히고, `w-1`(4px) 히트 영역이 5로 읽힌다 — 반 픽셀에 앉은 상자를 브라우저가 스냅하기 때문이며, 그 ±1이 이 계기의 해상도다(§3).

그리고 **계기를 먼저 검사한 뒤에 읽는다**([#176](https://github.com/flameware/massive-design/issues/176)의 순서). 실측 스크립트는 알려진 기하 아홉 개의 self-test를 통과하지 못하면 카탈로그를 재지 않는다(§2.2). self-test가 처음 잡은 것은 계기 자신의 오차였다 — Chromium이 `elementFromPoint`의 소수 좌표를 반올림해서 모든 치수가 +1로 읽혔다.

## 1. 준비

- `bun install`이 끝나 있어야 한다. 코드 스캔은 `@babel/parser`(`typescript@7`은 컴파일러 JS API를 싣지 않는다), 실측은 `playwright`의 Chromium을 쓴다 — 둘 다 이미 설치돼 있다.
- Storybook 정적 빌드가 **현재 소스로** 있어야 한다. 실측은 `apps/storybook/storybook-static`을 읽으므로, 소스를 바꿨으면 다시 빌드한다.

```sh
bun run --filter '@massive/storybook' build-storybook   # apps/storybook/storybook-static
```

`bun run check`가 다른 이유로 빨간 상태라도([#236](https://github.com/flameware/massive-design/issues/236)) 빌드와 실측은 돈다 — 두 계기는 `check`를 거치지 않는다.

## 2. 두 단계를 기계로 돌린다

### 2.1 코드 스캔 — 식별자

```sh
(cd packages/ui && node scripts/pointer-targets/scan.mjs) > "$WORK/pointer-targets-scan.tsv"
wc -l < "$WORK/pointer-targets-scan.tsv"   # 2026-09-04 기준 71 (머리글 포함) — 70행, slot 64종
```

`src/components/ui/*.tsx`의 **JSX 요소 하나하나**를 파서로 보고, 아래 규칙 중 하나라도 걸리면 행을 낸다. 열은 `component function slot tag rules line`.

| 규칙 | 걸리는 것 |
|---|---|
| `primitive:*` | radix-ui의 Trigger·SubTrigger·Item·CheckboxItem·RadioItem·Thumb·Close·Cancel·Action·Link·Scrollbar, 그리고 컨트롤 자체가 루트인 Checkbox·Switch·Toggle·Label·Toast의 Root |
| `primitive:press-surface` | 누름이 값을 옮기는 `SliderPrimitive.Track` |
| `external:*` | `ResizablePrimitive.Separator`(react-resizable-panels) · `OTPInput`(input-otp) |
| `native:*` | `button` `a` `input` `select` `textarea` `label` `summary` — `const Comp = asChild ? Slot.Root : "button"`의 문자열 쪽을 따라간다 |
| `handler:*` | `onClick` `onPointerDown` `onPointerUp` `onMouseDown` `onTouchStart` `onKeyDown` |
| `role:*` | `role="button|link|checkbox|radio|switch|tab|menuitem*|option|slider|scrollbar|combobox|spinbutton|gridcell|treeitem"` |
| `tabindex` | `tabIndex` 속성 — 값 불문(-1도 포인터는 겨냥한다) |
| `composed:*` | 안에서 다시 쓰는 우리 컴포넌트가 **그 자체로 대상일 때만**(Button·Input·Textarea·Label·PopoverTrigger) — 대상 함수의 집합은 첫 패스 결과에서 기계로 얻는다 |

컨테이너인데 이름이 겹치는 둘(`AccordionPrimitive.Item`, `NavigationMenuPrimitive.Item`)은 스크립트의 `PRIMITIVE_CONTAINER`에 이유와 함께 적혀 빠진다. **규칙은 넓게 걸고 좁히는 일은 §3의 사람이 한다** — 추출 단계에서 거르면 그 필터가 곧 [#121](https://github.com/flameware/massive-design/issues/121)의 diff 열이 된다.

`slot`이 `-`인 행(JSX에 `data-slot` 리터럴이 없는 자리)은 §2.2가 DOM에서 **찾지 못한다.** 2026-09-04 기준 넷이며 전부 상위 함수가 같은 노드를 slot 붙여 다시 그리는 자리다(`Calendar` 안의 `<CalendarNav onClick>`·`<CalendarDay onClick>`·`<CalendarGrid onKeyDown>`, 그리고 `Combobox` 안의 `<Popover>`). 새로 `-`가 생기면 그 노드에 `data-slot`을 달거나 이 문서에 이유를 적는다.

### 2.2 렌더 실측 — 치수

```sh
(cd apps/storybook && node scripts/pointer-targets.mjs --out "$WORK")
#   → $WORK/pointer-targets.tsv  (행 = 셀 × DOM 노드)
#   → $WORK/pointer-targets.json (scan + rows + cellsRun)
# 2026-09-04 기준: 398 셀 — 51 스토리의 축 × 구성 상태 곱 전부
```

스크립트는 **먼저 self-test를 돌리고**, 하나라도 틀리면 카탈로그를 재지 않고 종료한다(`--self-test`로 그것만 돌릴 수 있고, `--skip-self-test`는 디버깅용이다). self-test는 인라인 HTML의 알려진 기하 아홉 개다: 16px 상자 · 16px + 32px `::after` · 같은 것이 `overflow:hidden` 20px 상자에 잘림 · 0폭 + 4px `::after`(resizable 식) · 형제가 절반을 덮음 · 60×12 · 0높이 + 4px 띠 + 가운데 손잡이 자식 · L꼴(중심을 벗어난 자리에만 24가 들어감) · `display:none`.

**치수는 `document.elementFromPoint`로 얻는다.** 노드의 중심에서 상하좌우로 1px씩 걸으며 "이 점을 누르면 이 노드(또는 자손)가 받는가"를 묻고, 받는 점의 연속 구간이 `hitW`·`hitH`다. 그래서 다음 셋이 한 계기에 잡힌다 — `::after`가 넓힌 영역(의사 요소의 점은 originating element로 해석된다), `overflow`가 잘라낸 영역(잘린 점은 조상이 받는다), 이웃·오버레이가 가린 영역(가린 요소가 받는다). `square24`는 그와 별개로 **24×24 정사각형이 히트 영역 안 어디든 들어가는가**(WCAG 2.5.8의 물음 그대로)를 아홉 점으로 판정한다 — 중심에 먼저 놓아 보고, 안 되면 상자 ±48px을 4px 걸음으로 훑는다.

열은 스크립트 머리말에 있다. 읽을 때 중요한 넷:

- `hitW`·`hitH` — **중심선**의 구간이다. 히트 영역이 직사각형이 아니면(Resizable의 손잡이 자식이 중심선만 두껍게 만든다) 중심선은 두꺼운 쪽을 읽는다. 그 자리는 `after` 열(`::after`의 계산된 크기)과 `square24`로 함께 읽는다.
- `clipAncestor`·`clipRoom` — `overflow`가 `visible`이 아닌 가장 가까운 조상과, 그 padding box까지 네 방향 여유의 최솟값. **24까지 대칭 확장에 필요한 폭이 `clipRoom`을 넘으면 확장이 잘린다.** `hidden`뿐 아니라 `auto`·`scroll`·`clip`도 자른다 — Radix의 Content 뷰포트가 `overflow-y-auto`인 자리가 여기 걸린다.
- `note` — `center-miss`(중심을 다른 노드가 받아 격자로 찾음) · `no-hit-point`(어디도 받지 않음, 예: `pointer-events:none`) · `not-rendered` · `reach-limit`(48px 밖까지 이어짐) · `square24-off-center`.
- `inScan`·`nativeInteractive` — 이 DOM 노드가 §2.1의 slot 목록에 있는가 / DOM에서 본성상 상호작용(`button`·`a[href]`·`[role=…]`·`[tabindex]`…)인가. 두 열의 교차가 §3.1의 대조다.

> 두 명령의 출력을 파이프로 `head`에 넘기지 않는다 — 잘린 모집단은 이 절차가 막으려는 바로 그 실패다. 파일로 받고 그 파일을 본다.

## 3. 대조하고, 그 다음에 판정한다

### 3.1 스캔 ↔ DOM 대조 — 계기 검증의 둘째 층

self-test는 "재는 함수가 맞는가"다. 둘째 층은 "**모집단이 맞는가**"이고, 두 계기가 서로를 대조한다.

```sh
# 스캔은 냈는데 어느 셀에서도 렌더되지 않은 slot — 참조 스토리가 그 노드를 안 그리거나, 구성 상태 밖에 있다
# DOM에서는 상호작용 노드인데 스캔 목록에 없는 slot — 스캔 규칙의 구멍이거나, 소비처 자리의 노드
```

실측 스크립트가 끝에 둘을 그대로 찍는다. **둘 다 0이 아니면 이유를 §4의 문서에 한 건씩 적는다** — 첫 실행에서 `Button`이 통째로 빠져 있었고(`const Comp = asChild ? Slot.Root : "button"`을 규칙이 못 따라갔다), DOM 대조가 그것을 잡아 규칙이 고쳐졌다. 그 규칙이 없었으면 스캔은 70행이 아니라 그 아래였을 것이다.

### 3.2 그 다음에 하한을 건다

`inScan`이 참이고 렌더된 행에만 건다. `square24`가 거짓인 행이 **미달**이다. 한 slot이 여러 셀에서 여러 값으로 읽히면(`size` 축) 전부 적는다 — 값이 셀마다 다르다는 것이 곧 초과분 결정([#111](https://github.com/flameware/massive-design/issues/111) Fog "초과분의 값")의 입력이다.

판정은 세 갈래로 나뉜다(ADR-0020 §파급).

1. **확장 가능** — `clipAncestor`가 없거나 `clipRoom`이 필요한 확장 폭 이상이다. [#230](https://github.com/flameware/massive-design/issues/230)의 모집단.
2. **잘린다** — `clipRoom`이 부족하다. [#231](https://github.com/flameware/massive-design/issues/231)의 예외 목록으로 가고, 이름과 잘라내는 조상을 함께 적는다.
3. **외부 소유** — 라이브러리가 자기 히트 영역을 파라미터로 갖는 자리(`react-resizable-panels`의 `hitAreaMargins`). [#122](https://github.com/flameware/massive-design/issues/122)의 규칙대로 우리 규칙이 들어가지 않는다.

## 4. 새 기준선을 적는다

이 절차를 돌린 티켓·문서가 자기 산출물에 적는다.

- 측정일, 저장소 SHA
- 스캔 행 수 · slot 종 수 · `slot = -` 행과 그 이유
- 실측 셀 수 · 렌더된 행 수 · 스캔↔DOM 대조의 두 목록과 각각의 이유
- 미달 목록(컴포넌트·slot·셀·`hitW×hitH`·`clipAncestor`·`clipRoom`)과 세 갈래 판정
- self-test 결과 — 통과했다면 "통과", 아니면 무엇이 틀렸고 계기를 어떻게 고쳤는지

## 5. 한계 — 지킬 수 없는 것을 지킨다고 적지 않는다

**① 참조 스토리가 그리는 것만 잰다.** 계기는 `Components/Manifest references`의 셀을 렌더한다. 참조 예시가 어떤 노드를 안 쓰면(예: `AlertDialogTrigger`를 스토리가 `open` 상태로만 그린다면) 그 노드는 코드 스캔에는 있고 실측에는 없다 — §3.1의 첫 목록이 그 자리이고, "재지 않았다"이지 "통과했다"가 아니다.

**② 해상도는 ±1px이다.** Chromium은 히트 테스트를 정수 픽셀로 스냅한다. 반 픽셀에 앉은 16px 상자는 17로 읽힌다. 23·24·25 근처의 판정은 `visualW`·`visualH`(`getBoundingClientRect`)와 함께 읽는다.

**③ 중심선은 최댓값을 읽는다.** 히트 영역이 직사각형이 아니면 `hitW`·`hitH`는 중심을 지나는 선의 길이이고, 얇은 부분은 `after` 열이나 `square24`로만 보인다. 직사각형이 아닌 히트 영역은 2026-09-04 기준 Resizable의 손잡이뿐이다.

**④ 이웃 간격은 재지 않는다.** 겹침(ADR-0020 결정 5)은 소비처의 레이아웃이 만드는 것이라 참조 스토리에서 잰 값이 소비처의 값이 아니다. 계기가 보는 것은 "이 노드가 받는가"이지 "이웃이 24 안에 있는가"가 아니다.

**⑤ 이 스크립트 자신은 게이트가 아니다.** 판정은 `scripts/pointer-target-gate.mjs`(§6)가 이 계기 위에서 진다 — 계기를 먼저 검사한 뒤에 읽었기 때문에(#176) 이제 그 판정을 믿을 수 있다.

## 6. 게이트 — 하한 미달과 미신고 겹침을 문다 ([#232](https://github.com/flameware/massive-design/issues/232))

이 계기가 낸 실측 위에 `scripts/pointer-target-gate.mjs`가 서서 두 가지를 문다. **정책표(`classify.mjs`)는 건드리지 않는다** — "Figma가 그리는가"와 "규칙이 지켜지는가"는 다른 질문이고, 하나로 섞은 것이 [#109](https://github.com/flameware/massive-design/issues/109)의 실패였다(ADR-0020 결정 6).

1. **하한 미달** — `square24`가 거짓인 대상 중 예외 목록에 없는 것
2. **미신고 겹침** — 히트 영역이 시각 상자를 넘는데(overage) 그 오버리지가 **커밋된 기준선에 없던 것**. ADR-0020 결정 5의 "선언은 계약 필드가 아니라 계산"을 그대로 따른다 — 계산이 사는 자리는 커밋된 기준선(`docs/research/pointer-targets-2026-09.md`의 TSV)이고, 실측을 다시 돌려 기준선을 갱신하는 행위 자체가 선언이다. `::after` 계산 스타일 유무 하나만으로 판정하지 않는다 — 참조 스토리의 구성(같은 행에 놓인 다른 대상, 겹치는 툴팁 등)이 `after:` 없이도 오버리지처럼 읽히는 잡음이 있고(§4.3의 "계기가 가림을 읽는다"와 같은 종류), 그 잡음도 기준선에 똑같이 찍혀 있어 기준선 대조가 잡음과 신규 오버리지를 갈라 준다.

두 검사 다 **기준선과 diff**한다. 지금 main은 [#230](https://github.com/flameware/massive-design/issues/230)·[#249](https://github.com/flameware/massive-design/issues/249)가 아직 안 끝나 하한 미달이 남아 있으므로, 같은 미달이라도 **기준선 대비 새 미달(regression)**과 **기준선에도 있던 미달(known gap)**을 갈라 보고한다 — 예외 목록에 없으면 둘 다 게이트를 실패시킨다. 구분은 보고를 읽는 사람이 "내 변경이 악화시켰는가"를 바로 알기 위한 것이지 판정을 봐주는 것이 아니다.

세 번째로, 코드 스캔이 낸 slot 중 **참조 스토리가 어느 셀에서도 그리지 않는 것**을 문다(예: `menubar-item`·`menubar-sub-trigger` — 연구 문서 §2.2). "재지 않음"이지 "통과"가 아니므로 예외 목록에 없으면 실패로 센다.

### 예외 목록

경로는 하드코딩하지 않는다 — `--exceptions <path>` 로 주거나 기본값 `docs/research/pointer-target-exceptions.json`을 읽는다. 파일이 없으면 빈 목록으로 돈다. [#231](https://github.com/flameware/massive-design/issues/231)이 `belowFloor`(24×24 하한이 닿지 못하는 자리)를 채운다. `unmeasuredSlots`는 이 티켓이 시드로 채웠다 — `menubar-item`·`menubar-sub-trigger`(참조 스토리가 안 엶)·`switch-thumb`(pointer-events:none, Switch의 겨냥 단위는 Root).

```json
{
  "belowFloor": [{ "component": "scroll-area", "slot": "scroll-area-thumb", "reason": "..." }],
  "unmeasuredSlots": [{ "component": "menubar", "slot": "menubar-item", "reason": "..." }]
}
```

`component`·`slot`은 `pointer-targets.tsv`의 `story`·`slot` 열과 맞춘다. `belowFloor` 항목은 그 (component, slot)의 모든 셀·size를 면제한다 — 셀 단위로 더 좁히고 싶으면 이 게이트를 여는 다음 티켓의 일이다.

### 실행

```sh
bun run pointer-gate                                    # Storybook 빌드 + 실측(self-test 포함) + 게이트, 약 7분
node scripts/pointer-target-gate.mjs --skip-build --measured <tsv>   # 이미 실측한 TSV로 게이트만(빠르다)
node scripts/pointer-target-gate.mjs --exceptions <path>             # 예외 목록 경로를 바꾼다
node scripts/pointer-target-gate.mjs --baseline <tsv>                # 기준선을 바꾼다(기본은 §정본)
```

### CI로 승격하지 않는다 — 언제 손으로 돌리는가

맵 #111 결정 6과 이 티켓의 out of scope다. `bun run check`·`bun run sync:preflight` 사슬에 **넣지 않는다** — Storybook 빌드 + Playwright 실측이 약 7분이라 preflight 예산을 넘는다. 지금은 **포인터 대상을 건드린 세대에 손으로 돈다**: 그 판정 기준(어떤 변경이 "포인터 대상을 건드렸다"로 세는가 — 예를 들어 §2.1 스캔 slot을 가진 파일이 diff에 있는가)은 [#233](https://github.com/flameware/massive-design/issues/233)이 검증 규약 개정으로 적는다.

### 게이트 자신의 self-test

`scripts/pointer-target-gate.test.mjs`(`bun run test`가 돈다)가 알려진 미달·겹침·미측정 slot 케이스를 fixture TSV로 만들어 게이트가 실제로 무는지 확인한다 — 침묵하는 게이트를 커밋하지 않는다는 원칙을 이 스크립트 자신에도 적용한 것이다.
