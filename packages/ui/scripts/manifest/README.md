# 매니페스트 생성기

`componentContract`(각 `src/components/ui/*.tsx`의 마지막 export)에서 `dist/manifest/*.gen.json`을 만든다. 매니페스트는 Figma 스냅숏([`docs/agents/design-system-sync.md`](../../../../docs/agents/design-system-sync.md) §2)과 Storybook 카탈로그(`apps/storybook/scripts/catalog.mjs`)가 소비한다. 컴포넌트 코드를 고친 뒤에는 `bun run manifest`로 재생성하고 커밋한다 — `manifest:verify`가 CI에서 일치를 확인한다.

| 파일 | 하는 일 |
| --- | --- |
| `build.mjs` | 계약 전부를 읽어 매니페스트를 메모리에서 조립한다 |
| `compile.mjs` · `css.mjs` | 각 cva 조합을 Tailwind로 컴파일해 낸 CSS를 읽는다 |
| `assemble.mjs` | 조합 하나를 "조립 명세"(root·label·icon 노드 역할, 구성 상태별 값)로 바꾼다 |
| `classify.mjs` | 선언 하나를 `token` / `literal` / `unresolved`로 등급 매기고, 수식자 정책표를 갖는다 |
| `theme.mjs` | 값 → 토큰 역조회표 |
| `lint.mjs` | 토큰 계열 ↔ CSS 속성, 번역표 커버리지, `reference.guidance` 길이 |
| `parts-coverage.mjs` | 규칙 6 — 클래스를 내는 anatomy 노드가 `parts`에 있는가(경고) |
| `hash.mjs` · `catalog-layout.mjs` | 정규화 JSON 해시, Figma 페이지 배치 열 |
| `decisions/` | 이 스키마의 결정 기록 (아래) |

## 스키마 결정 기록

원래 `docs/adr/0009`~`0015`였다. 디자인 시스템의 결정이 아니라 **이 생성기 한 산출물의 스키마** 결정이라 2026-09 점검에서 코드 옆으로 옮겼다. `docs/adr/`에는 포인터만 남아 있다.

| 파일 | 결정 |
| --- | --- |
| [`0009-drawn-but-not-carried.md`](decisions/0009-drawn-but-not-carried.md) | 우리 클래스가 그리지만 파생 채널이 나르지 않는 자리는 `drawnBy: { modifiers, carriedBy: "none" }`으로 적고, 게이트가 정책표를 되묻는다 |
| [`0010-behaviors-are-declared-and-human-verified.md`](decisions/0010-behaviors-are-declared-and-human-verified.md) | `behaviors` 필드 — 파생 채널이 나르지 않는 동작은 계약이 선언하고 사람이 확인한다; 확인표는 `sync:checklist`가 생성한다 |
| [`0011-axis-readback-and-part-axis-inheritance.md`](decisions/0011-axis-readback-and-part-axis-inheritance.md) | 축 되읽기 수식자(`data-[variant=x]`)는 셀의 `properties`로 접히고, 파트는 루트의 이름 붙은 축을 상속한다 |
| [`0012-drawn-elsewhere.md`](decisions/0012-drawn-elsewhere.md) | 셀에서 안 보이는 네 등급 — `unresolved` · `ignore:` · `externalSurfaces` · `elsewhere:` — 와 각각의 뜻 |
| [`0013-slot-labels-are-borne-by-the-contract.md`](decisions/0013-slot-labels-are-borne-by-the-contract.md) | 슬롯 이름표는 선택자가 스스로 말할 때(`[&_svg]`)만 전역 표가, 아니면 계약의 `slots`가 진다 |
| [`0014-modifier-chains-are-paths.md`](decisions/0014-modifier-chains-are-paths.md) | 수식자 사슬은 경로다 — 항은 그 자리의 주어에 걸리고, 주어를 옮기는 것은 슬롯 지목뿐 |
| [`0015-behaviors-boundary-is-the-cause.md`](decisions/0015-behaviors-boundary-is-the-cause.md) | `behaviors`의 경계는 계기다 — 명시적 활성화가 아닌 것만 담고, 역할이 요구하는 것과 사람이 계기가 아닌 변화는 담지 않는다 |

## 게이트가 지키는 규약

`docs/agents/rules.md`에 있던 규칙 중 **이 생성기와 게이트의 내부 동작**에 관한 것을 옮겨 왔다. 원문 그대로다.

- **A grade of "not in this cell" is not one thing but four** ([#180](https://github.com/flameware/massive-design/issues/180), [0012](decisions/0012-drawn-elsewhere.md)). `unresolved` (not handled yet) · `ignore:` (never there) · `externalSurfaces` (not ours) · `elsewhere:` (there, not here). ② and ④ are split by **whether it is drawn**, ③ and ④ by **owner versus place**, and `elsewhere:` must name *where* that place is. Its corollary is the map's own method: when a signal mixes grades you cannot read what it points at, so the fix is always to add the grade, never to widen `ignore:`.
- **"Not in this cell" is silence, and the gate measures it against source, never against a `parts` key** ([#195](https://github.com/flameware/massive-design/issues/195), [#246](https://github.com/flameware/massive-design/issues/246)). The definition is the union: a node's class token is reached only if it sits in the manifest's root cell ∪ `parts` cell, so having a `parts` key at all proves nothing by itself. A recorded exclusion from that count only enters as a claim the gate can disprove — `elsewhere:` (the missing tokens live in another contract's cell) or `overriddenBy:` (a listed class wins over them through `tailwind-merge`) in `parts-coverage.exceptions.json` — never as a bare name a gate takes on faith; a node that starts reaching makes its own exception stale, and a stale exception is red. Since 2026-09 this gate **warns** rather than fails — the population is Figma precision, read before a snapshot.
- **An unprefixed anatomy name gets an unprefixed `parts` key** ([#243](https://github.com/flameware/massive-design/issues/243)). The gate compares the anatomy string verbatim, so `Indicator`·`Thumb` register without a component prefix.
- **The policy table holds meanings; shape is peeled off before lookup, and a chain is a path** ([#178](https://github.com/flameware/massive-design/issues/178), [#182](https://github.com/flameware/massive-design/issues/182), [0014](decisions/0014-modifier-chains-are-paths.md)). A term binds the **subject** at that position and only a slot designator moves the subject, so order changes meaning only through subject movement (`[&_svg]:disabled` ≡ `svg:disabled`). Never widen the table to compound keys — it grows with the combinations and leaks at the next chain.
- **The contract bears the label, and the gate only ever checks the declaration for falsehood** ([#148](https://github.com/flameware/massive-design/issues/148), [#181](https://github.com/flameware/massive-design/issues/181), [#184](https://github.com/flameware/massive-design/issues/184), [0009](decisions/0009-drawn-but-not-carried.md), [0013](decisions/0013-slot-labels-are-borne-by-the-contract.md)). `drawnBy` says what draws each configuration state and `slots` names a designated descendant — except where **the selector states the role itself** (`[&_svg]` means "an icon anywhere"), which is the one line on the other side. Where a hand-written sentence could diverge from the policy table, the gate asks the table back rather than trusting a copy.
- **A population is what the gate produces each generation, not what a document freezes** ([#195](https://github.com/flameware/massive-design/issues/195), [#246](https://github.com/flameware/massive-design/issues/246)). A research document is a snapshot; the gate is the re-derivation, and only the gate's number is load-bearing once work starts.
