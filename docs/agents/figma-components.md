# Figma 컴포넌트 규약과 주입 절차

확정: 2026-08-20 · 근거 티켓 [#25](https://github.com/flameware/massive-design/issues/25) · 맵 [#14](https://github.com/flameware/massive-design/issues/14)

`@massive/ui`의 React 컴포넌트를 Figma 컴포넌트 세트로 주입하고, 그 둘이 **같은 세대인지** 판정하는 규약. 대상 파일은 토큰과 같다 — `wxz7M6txDvlvH6Z95JzDHJ` ([Massive Design](https://www.figma.com/design/wxz7M6txDvlvH6Z95JzDHJ/Massive-Design)), 단 **Foundations와 별개 페이지**.

**[`figma-injection.md`](figma-injection.md)를 먼저 읽는다.** 그 문서의 §2.3~§2.7(폰트 잠금, 바인딩 순서, 3회 재시도, 값 표현)은 여기서 **그대로 유효하고 복사하지 않는다.** 이 문서는 컴포넌트에만 있는 것 — 대조·이름·해시·번역표·발행 확인 — 을 다룬다.

Code Connect는 Pro에서 쓸 수 없다. 이 문서가 그 자리를 메우는 것이고, 그래서 **규약이지 도구가 아니다.**

---

## 1. 소비자가 에이전트라는 것이 요구를 줄인다

Figma가 들고 있어야 하는 것은 **매니페스트 항목으로 가는 짧은 문자열 하나 + 세대 해시 하나**뿐이다. variant·prop·토큰을 Figma에 다시 적지 않는다 — 진실은 `packages/ui/dist/manifest/*.gen.json`에 있고, 에이전트는 Figma에 들어가기 전에 이미 그걸 손에 들고 있다([#19](https://github.com/flameware/massive-design/issues/19) §4).

이 축소가 이 문서 전체의 전제다. Dev Mode에 사람이 읽을 스니펫을 띄우는 일은 **하지 않는다.**

---

## 2. 동일성 — 이름 규약 단독

**컴포넌트 세트의 이름은 React export 이름 그대로다.** `Button`. 접두사도 경로도 없다.

| 규칙 | 근거 |
|---|---|
| `Components/Button` 같은 **경로형 금지** | 경로형을 쓰는 순간 그것이 네 번째 번역표다. 그룹핑은 **페이지 이름**으로 한다 |
| `_`·`.` 로 시작하는 이름 **금지** | Figma가 Assets 패널과 **발행 목록에서 조용히 숨긴다** ([#31](https://github.com/flameware/massive-design/issues/31) §8.1에서 실제로 당했다). 오류가 아니라 침묵이라 눈에 안 띈다 |
| `key` 표를 리포에 두지 **않는다** | 이름은 **이미 주입 멱등성의 키**다 — 이름이 바뀌면 매핑이 아니라 컴포넌트가 깨진다(재생성 → 인스턴스 전멸). 매핑을 이름에 얹어도 새 위험이 0이므로, `key` 표가 살 이유는 "사람이 이름을 바꿈"뿐인데 그 경우엔 이미 늦었다. 게다가 `key`는 **재생성하면 바뀐다**([#31](https://github.com/flameware/massive-design/issues/31) §8.6) |

**컴포넌트는 이름으로 찾아 제자리에서 고친다. 재생성 금지.** 이것이 이 문서에서 가장 비싼 규칙이다.

---

## 3. 낡음 — `description`의 마지막 줄

### 3.0 세대 해시의 입력 경계

컴포넌트 해시는 Figma에 대응하는 매니페스트 입력만으로 계산한다. 해시
payload는 다음 구조로 고정한다:

```js
{
  axes,
  base,
  cells: cells.map(({ props, properties, slots, state }) => ({
    props,
    properties,
    ...(slots ? { slots } : {}),
    ...(state ? { state } : {}),
  })),
}
```

셀의 `className`은 CSS 컴파일에서 나온 파생값이며 Figma에 주입되지 않으므로
해시 입력에서 제외한다. 따라서 CSS 클래스 문자열만 바뀌어도 Figma 세대는
낡지 않는다. 반대로 축, base, `properties`, `slots`, `state`가 바뀌면 해시가
바뀌어 재주입 대상이 된다. 새 매니페스트 필드는 이 목록에 명시적으로
추가하기 전까지 해시에 들어가지 않는다.

### 3.1 형식

세트(변종이 아니라 **세트**)의 `description` **마지막 줄**이 정확히 이 모양이다:

```
massive:<component>@<hash12>
```

정규식 `^massive:([a-z0-9-]+)@([0-9a-f]{12})$`. 예:

```
massive-design 디자인 시스템의 Button. 원본은 코드이고 이 컴포넌트는 파생이다.
massive:button@52bcaeb2ef99
```

- `<component>`는 `index.gen.json`의 `component` 필드, `<hash12>`는 같은 항목의 `hash`
- 한 줄에 **동일성과 세대가 같이** 실린다 — 이름이 `Button`인데 꼬리가 `massive:badge@…`면 사람이 손댄 것이다. §2의 이름 규약과 서로 교차 검증된다
- **세트에 싣는다.** `/components`가 내는 것은 변종이고 변종의 `description`은 `""`다([#31](https://github.com/flameware/massive-design/issues/31) §8.2). 우리 컴포넌트는 전부 variant 세트다

⚠️ `<!-- massive:sha=… -->` 같은 HTML 주석 형태를 **쓰지 않는다.** `description`은 평문이라 꺾쇠까지 자산 패널에 그대로 뜬다 — 숨김 이득 0에 못생김만 얻는다.

### 3.2 `descriptionMarkdown`은 영원히 쓰지 않는다

두 필드를 따로 쓰는 설계는 **불가능하다.**

- `descriptionMarkdown`을 쓰면 `description`이 **덮인다** — 해시가 날아간다([#19](https://github.com/flameware/massive-design/issues/19) §1.4)
- 역방향 미러링은 **없다.** `description`을 쓰면 `descriptionMarkdown`은 `""`로 남는다([#31](https://github.com/flameware/massive-design/issues/31) §8.6). 덮어쓰기는 마크다운 → 평문 한 방향뿐

### 3.3 "해시 없음"과 "해시 불일치"는 다른 결과다

| 읽은 것 | 판정 | 조치 |
|---|---|---|
| 꼬리가 매니페스트 해시와 **같다** | 최신 | 주입 생략 |
| 꼬리가 **다르다** | **낡음** | 재주입 |
| 꼬리가 **없다** / 형식이 깨졌다 | **판정 불가** | 재주입하되 보고에 명시. 사람이 설명을 지웠거나 Figma의 재발행 버그다 |
| 세트를 이름으로 **못 찾았다** | 미존재 | 신규 생성 |

가르는 이유는 Figma에 [공식 문서가 인정한 버그](https://developers.figma.com/docs/plugins/api/properties/nodes-descriptionmarkdown/)가 있기 때문이다 — 설명이 사라진 것처럼 보이는 증상. 이걸 "낡음"으로 뭉뚱그리면 Figma의 버그가 곧바로 오탐이 된다.

---

## 4. 어긋남은 주입 세션이 발견한다 — CI가 아니다

**CI는 Figma를 열지 않는다.** GitHub Secret도 Figma PAT도 발행하지 않는다.

근거 둘:

1. **알림의 수신자가 결국 주입 세션이다.** CI가 빨개져도 고칠 수 있는 건 `use_figma`를 부르는 에이전트뿐이다. CI 경로는 신호를 한 단계 일찍 낼 뿐이고, 그 대가로 상시 인프라와 **사람 계정에 매달린 PAT**을 산다(만료·revoke가 곧 CI 실패이며 Figma에 서비스 계정 개념이 없다)
2. 컴포넌트가 아직 1개다

대신 **대조가 주입 절차의 0단계로 못박힌다**(§7). CI가 지키는 것은 리포 안 — `bun run check`가 매니페스트와 소스의 어긋남을 잡는 것([#23](https://github.com/flameware/massive-design/issues/23)) — 까지다.

이 결정의 부수 효과: [#31](https://github.com/flameware/massive-design/issues/31) §8.2가 갈라놓은 REST 두 시야(`/nodes` vs `/component_sets`) 중 **어느 쪽을 쓸지 고를 필요가 없다.** 둘 다 REST이고 우리는 MCP로 간다. `use_figma`는 언제나 살아 있는 문서를 본다.

---

## 5. 발행 낡음은 판정하되 고치지 않는다

주입 세션의 **마지막 단계**가 세트의 `getPublishStatusAsync()`를 읽는다. 제3의 상태 `CHANGED`가 *"발행된 라이브러리가 문서보다 낡았다"*를 한 번에 답한다([#31](https://github.com/flameware/massive-design/issues/31) §8.6).

| 상태 | 보고 |
|---|---|
| `PUBLISHED` | 조용 |
| `CHANGED` · `UNPUBLISHED` | **"사람이 Figma에서 발행 버튼을 눌러야 한다"를 산출 보고에 명시** |

발행은 사람이 눌러야 한다 — 플러그인 API에 경로가 없다. 그래도 판정에 넣는 이유는 이게 **조용히 썩는 종류**이기 때문이다: 주입은 성공했는데 소비 파일은 옛 컴포넌트를 계속 본다.

⚠️ **getter를 `try/catch`로 감싼다.** [#32](https://github.com/flameware/massive-design/issues/32)가 실측한 것 — `use_figma`가 atomic이라 **감싸지 않은 getter 하나가 throw하면 주입 전체가 롤백된다.** 진단하러 부른 호출이 성과를 지운다.

⚠️ `TextStyle`·`EffectStyle`에는 `getPublishStatusAsync`가 **없다**(`undefined`). 스타일 발행 여부는 이 경로로 못 묻는다.

---

## 6. variant 축·값 — 항등함수

**cva의 이름을 그대로 쓴다.** 소문자·하이픈 전부 그대로.

| cva | Figma component property | 자식 이름 문자열 |
|---|---|---|
| `variant: "destructive"` | `variant` = `destructive` | `variant=destructive, size=icon-xs` |
| `size: "icon-xs"` | `size` = `icon-xs` | |

Title Case(`Variant=Destructive`)를 쓰지 않는 이유:

- 그것이 **세 번째 번역표**가 된다. [#19](https://github.com/flameware/massive-design/issues/19) §4의 ②가 "이름을 같게 만들면 매핑이 항등함수가 된다"이고 그 이득이 규약의 전부다
- `icon-xs`·`icon-sm` 같은 하이픈 값에서 규칙 자체가 애매하다 (`Icon Xs`? `Icon XS`?)
- 관객에게 보이는 것은 Storybook이지 Figma property 피커가 아니다

⚠️ variant property는 API가 아니라 **자식 컴포넌트의 `name` 문자열**이다([#20](https://github.com/flameware/massive-design/issues/20)). 위 표의 셋째 열이 실제로 노드에 적히는 것이고, 그래서 이 규약은 **문자열 규약**이다.

### 6.1 축 없는 단일 variant도 `variant=default`로 이름 붙인다

매니페스트의 `axes`가 비어 있고 셀이 하나뿐이어도 Figma component set의 유일한
자식 이름은 반드시 `variant=default`다. `combineAsVariants([component], page)` 전에
자식 이름을 `default`처럼 값만 적거나 비워 두면 Figma가 이를 `=`로 정규화할 수
있다. 이 상태는 `variantProperties`와 `componentPropertyDefinitions` getter를
throw하게 만들고 Library publish에서 **Corrupt layer names**로 거부된다.

이 `variant` 축은 코드의 공개 variant가 아니라 Figma component set을 유효하게
유지하기 위한 합성 축이다. 따라서 매니페스트 `axes`나 세대 해시에는 추가하지
않는다. 기존 단일 variant 자산을 고칠 때는 세트를 재생성하지 말고 같은 자식
컴포넌트의 이름만 `variant=default`로 제자리 수정해 원격 인스턴스 연결을 보존한다.

주입 뒤에는 이름 문자열만 보지 말고 두 getter가 실제로 읽히는지 확인한다:

```js
const child = set.children[0]
if (child.name !== "variant=default") throw new Error("invalid single variant name")
if (child.variantProperties?.variant !== "default") throw new Error("invalid variant property")
if (set.componentPropertyDefinitions.variant?.defaultValue !== "default") {
  throw new Error("invalid component property definition")
}
```

### 6.2 상태는 축이 아니다

[#24](https://github.com/flameware/massive-design/issues/24)가 확정했다 — hover/pressed/disabled는 **컴포넌트 세트의 축이 아니다.** 정적 시안은 hover를 꺼내지 않는다. 상태는 **컴포넌트별 견본 한 장**(매니페스트에서 생성)으로만 보인다.

### 6.3 아이콘 슬롯 — leading 고정, 조합은 만들지 않는다

`cva`는 children에 대해 아무 말도 하지 않으므로 규약이 필요하다.

- **아이콘 슬롯은 `leading`(앞)이 기본.** `trailing`은 명시할 때만
- **텍스트 + 아이콘 조합 variant를 Figma에 만들지 않는다.** 세트는 텍스트 size와 아이콘 전용 size(`icon`·`icon-*`)만 갖는다

BOOLEAN property로 아이콘을 토글하지 않는 이유가 결정적이다 — **BOOLEAN은 `visible`만 건드린다**([#20](https://github.com/flameware/massive-design/issues/20)). 그런데 매니페스트는 `slots.icon.paddingInline`(`has-[>svg]:px-3` = 12px)를 들고 있고 기본 `padding-inline`은 16px이다. 아이콘을 켜도 **패딩이 안 따라온다.** 그건 근사가 아니라 [#24](https://github.com/flameware/massive-design/issues/24)가 거부한 **부패**다 — 틀린 값을 캔버스에 남긴다.

조립 시 아이콘이 필요하면 인스턴스에 **노드를 넣으면 된다**(자식 추가는 override라 보존된다).

---

## 7. 번역표 ① — CSS 속성 → (노드 역할, Figma 속성)

매니페스트의 셀 하나는 CSS 한 벌이지만 Figma에서는 **노드 여러 개**가 된다. `background-color`는 프레임의 `fills`인데 `color`는 자식 TEXT의 `fills`다. 그래서 표의 오른쪽은 속성이 아니라 **쌍**이다.

**노드 역할 어휘는 셋 — `root` · `label` · `icon`.** 컴포넌트 무관하다.

| CSS 속성 | 역할 | Figma |
|---|---|---|
| `display: inline-flex` | `root` | `layoutMode = 'HORIZONTAL'` |
| `align-items` | `root` | `counterAxisAlignItems` |
| `justify-content` | `root` | `primaryAxisAlignItems` |
| `gap` | `root` | `itemSpacing` |
| `padding-inline` | `root` | `paddingLeft` + `paddingRight` |
| `padding-block` | `root` | `paddingTop` + `paddingBottom` |
| `padding` | `root` | `paddingTop` + `paddingRight` + `paddingBottom` + `paddingLeft` |
| `margin-top` | `root` | 부모 auto layout의 앞 간격 또는 전용 spacer — 형제 간 공통 간격과 다를 때만 |
| `height` | `root` | `resize(w, h)` + `layoutSizingVertical = 'FIXED'` |
| `border-radius` | `root` | `cornerRadius` |
| `background-color` | `root` | `fills[0]` |
| (상태 견본) | `root` | `state-colors.gen.json`이 base + `state/layer` @ 8%/12%를 oklab으로 합성한 리터럴 fill — [`figma-injection.md`](figma-injection.md) §2.8 |
| `color` | `label` | `fills[0]` |
| `font-size` | `label` | `fontSize` |
| `line-height` | `label` | `lineHeight` — ⚠️ §8.1 |
| `font-weight` | `label` | `fontName.style` — ⚠️ 아래 |
| `text-align` | `label` | `textAlignHorizontal` |
| `vertical-align` | `root` | auto layout의 교차축 정렬 |
| (`type/family/sans`) | `label` | `fontFamily` — **에이전트가 걸지 않는다.** 셰이핑 런타임의 사람 단계가 건다 — §9.4 |
| `slots.icon.size` | `icon` | `resize(n, n)` |
| `border-width` | `root` | `strokeWeight` + `strokes[0]` = **`base`의 `border-color`** — ⚠️ 아래 |

합성 컴포넌트는 루트 `cells`만 읽으면 안 된다. `parts`의 각 이름은 `anatomy`에 있는 **파트**이고, 파트마다 `axes`·`defaults`·`cells`가 루트와 같은 방식으로 존재한다. 먼저 파트의 조합을 해당 하위 프레임에 적용한 뒤, 그 프레임 내부의 `root`·`label`·`icon` 역할에 위 번역표를 적용한다. `TableHead`의 40px 높이·8px 좌우 패딩과 `TableCell`의 8px 패딩처럼 자식에서 선언된 값은 루트로 끌어올리거나 손으로 복사하지 않는다.

Table의 시각 검토와 Figma 참조 콘텐츠는 `apps/storybook/stories/fixtures/table.json`을 함께 사용한다. fixture는 공개 컴포넌트 계약이 아니라 채널 간 비교를 위한 repo-owned 견본이다. 기본 공개 자산에서는 선택적인 `TableCaption`을 강제로 넣지 않으며, 사용하면 `margin-top: 16px`를 보존한다.

Item의 시각 검토와 Figma 참조 콘텐츠는 `apps/storybook/stories/fixtures/item.json`을 함께 사용한다. Figma의 `ItemMedia`·`ItemTitle`·`ItemDescription`·`ItemActions` 견본은 이 값을 사용하고, `ItemActions`에는 `Button size=sm, variant=outline` 인스턴스를 넣어 Storybook의 실행 참조와 같은 조립을 보존한다.

⚠️ **stroke 색은 셀이 아니라 `base` 블록에 있다** ([#36](https://github.com/flameware/massive-design/issues/36)). 매니페스트는 `schemaVersion: 2`부터 셀 밖에 블록 하나를 더 낸다:

```json
{ "schemaVersion": 2,
  "base": { "border-color": { "tier": "token", "token": "--ds-border-default", "from": "@layer base" } },
  "cells": [ … ] }
```

`base`는 **모든 셀에 앞서 적용되는 기저**다 — `dist/tokens.css`의 `@layer base`에 있는 `*` 규칙에서 파생하며, 클래스가 아니라 규칙에서 오기 때문에 셀 안에 없다. 조립은 CSS 의미 그대로다:

```
strokes     = base["border-color"]
strokeWeight = cell["border-width"] ?? 0        // 없으면 stroke를 아예 걸지 않는다
```

**셀에 복사해 두지 않은 것이 의도다.** Button 48칸 중 `border-width`를 가진 것은 `outline` 8칸뿐인데, 40칸에 stroke 색만 실어 두면 그걸 읽고 폭 1px를 칠하게 된다. `border-width`가 없는 칸은 **테두리가 없는 것**이다.

⚠️ **`base`에 `outline-color`는 없다.** `tokens.css`의 규칙은 내지만 매니페스트의 무시 화이트리스트가 거른다 — 포커스는 [#24](https://github.com/flameware/massive-design/issues/24)가 Figma에서 뺐고 `outline-style`·`outline-offset`이 이미 같은 이유로 걸러진다. `base` 블록이 일반적인 것은 **구조이지 통과하는 속성이 아니다.**

---

⚠️ **`font-weight`는 이 표의 유일한 값 매핑 행이다.** Figma에 weight 변수가 없고(`type/weight/*`는 **존재하지 않는다**) 매니페스트도 `tier: "literal", value: "500"`을 낸다. 문자열 `fontName.style`로 간다:

| CSS | Figma style |
|---|---|
| `400` | `Regular` |
| `500` | `Medium` |
| `600` | `Semi Bold` (**띄어쓰기 있음**) |
| `700` | `Bold` |

---

## 8. 번역표 ② — CSS 변수 → Figma 변수 경로 (생성물)

**이 표는 문서에 손으로 적지 않는다.** `@massive/tokens`가 `dist/figma/var-map.gen.json`으로 낸다.

### 8.1 왜 생성물인가

세 가지가 겹친다.

1. **빌드가 이미 양쪽 이름을 다 안다.** 같은 원본에서 `tokens.css`와 `dist/figma/0*.js`를 둘 다 낸다. 문서에 적으면 **세 번째 사본**이 되고 조용히 낡는다. [#24](https://github.com/flameware/massive-design/issues/24)가 8·12% 사다리를 "세 번째 사본이 아니라 생성물"로 만든 것과 같은 판단이고, shadow alpha의 전례가 있다
2. **문자열 규칙으로 복원되지 않는다.** `--ds-fg-on-solid` → `fg/on-solid`에서 첫 대시는 경로 구분자이고 둘째 대시는 이름 내부다. 기계적 변환이 불가능하다
3. ⚠️ **값을 복사하면 틀린다.** `--text-sm--line-height`의 CSS 값은 **비율 `1.6`**인데 Figma `type/line-height/sm`은 **px `22.4`**다(14 × 1.6). `setBoundVariable('lineHeight', …)`가 단위를 PIXELS로 강제 변환하기 때문에 빌드가 사이즈별 px를 선계산해 두었다([`figma-injection.md`](figma-injection.md) §2.6). **이름만 옮기고 값은 절대 복사하지 않는다**

### 8.2 형태

키가 **둘**이다. 매니페스트가 두 가지로 말하기 때문 — 색은 `token`만, 스케일은 `token: "--spacing"` + `scale: "space.2"` + `multiple`. **`--spacing` 단독으로는 아무것도 못 찾는다**(모든 간격이 같은 이름을 쓴다).

```json
{
  "$generated": "scripts/build.mjs — 손대지 말 것. 사양은 docs/agents/figma-components.md §8",
  "$consume":   "…",

  "space.2":               { "kind": "variable",    "collection": "palette",  "name": "space/2" },
  "radius.md":             { "kind": "variable",    "collection": "palette",  "name": "radius/md" },
  "type.size.sm":          { "kind": "variable",    "collection": "palette",  "name": "type/size/sm" },
  "borderWidth.1":         { "kind": "variable",    "collection": "palette",  "name": "border-width/1" },
  "--text-sm--line-height":{ "kind": "variable",    "collection": "palette",  "name": "type/line-height/sm" },
  "--font-sans":           { "kind": "variable",    "collection": "palette",  "name": "type/family/sans" },
  "--ds-bg-accent-solid":  { "kind": "variable",    "collection": "semantic", "name": "bg/accent/solid" },
  "--ds-fg-on-solid":      { "kind": "variable",    "collection": "semantic", "name": "fg/on-solid" },
  "shadow.xs":             { "kind": "effectStyle",                           "name": "shadow/xs" }
}
```

**소비 규칙: 셀에 `scale`이 있으면 그걸로 찾고, 없으면 `token`으로 찾는다.** `$`로 시작하는 키는 메타이지 표의 칸이 아니다 — `tokens/**`의 DTCG 규약과 같다.

`collection`을 값에 넣는 이유는 조회를 한 번에 끝내기 위해서다 — 에이전트가 컬렉션 둘을 뒤지지 않는다. 그리고 스케일 변수의 컬렉션 이사가 미결 fog로 남아 있으므로(§10), 그날 이 필드가 **한 글자 변경**으로 흡수한다.

⚠️ **`kind`는 [#41](https://github.com/flameware/massive-design/issues/41)이 이 절에 더한 필드다.** 매니페스트는 `box-shadow`를 `scale: "shadow.xs"`로 내는데 Figma에서 그림자는 **변수가 아니라 Effect Style**이라 컬렉션이 없다 — 조회 채널 자체가 다르다(`getLocalEffectStylesAsync`). 화이트리스트로 침묵시키는 대신 표가 말하게 했다. 조립은 `kind`를 먼저 읽는다.

`tier: "literal"`인 값은 이 표에 없다. 그대로 박는다. **primitive 색(`--ds-palette-*`)도 없다** — Tailwind `@theme`에 없어 컴포넌트가 애초에 집을 수 없고([#7](https://github.com/flameware/massive-design/issues/7)), 새면 `@massive/ui` check 규칙 1이 먼저 잡는다. Text Style도 없다: 타이포 role 어휘가 아직 없어 매니페스트가 스타일 이름으로 말하지 않고 `font-size`·`line-height`를 변수로 따로 집는다.

### 8.3 게이트

`@massive/ui`의 `check` 규칙 4가 **매니페스트가 가리키는 모든 `token`/`scale`이 이 표에 있는지** 본다. 표에 없는 이름은 주입 때 **조용히 리터럴로 떨어진다** — 바인딩이 안 걸린 값은 Figma에서 정상으로 보이고 모드 전환에서만 죽는다. 검사하는 키는 소비하는 키와 같다(`scale` 우선). 게이트가 `packages/ui`에 있는 이유는 표는 토큰 패키지가 갖고 매니페스트는 UI 패키지가 갖기 때문이고, 표가 낡는 것은 `@massive/tokens`의 `tokens:verify`가 따로 막는다.

---

## 9. 절차

각 단계를 **별도 `use_figma` 호출**로. 실패 시 재실행 범위를 좁히기 위해서다.

### 0. 대조 — 주입 전에 반드시

1. `bun run check` · `bun run manifest`로 **리포 안이 먼저 일관**한지 확인한다. 매니페스트가 소스와 어긋난 채로 Figma에 가면 틀린 것을 정본으로 박는다
2. 컴포넌트 페이지에서 **이름으로** 세트를 찾는다
3. `description` 마지막 줄을 §3.1의 정규식으로 파싱해 §3.3의 표대로 판정한다
4. "최신"이면 컴포넌트 구조 주입은 생략하되, §9.7의 카탈로그 배치 검사·정규화는 생략하지 않는다

### 1. 읽기 전용 조사

컬렉션·변수·페이지 상태를 확인하고 들어간다. `var-map.gen.json`의 모든 `name`이 실제로 존재하는지 이때 확인한다 — 없는 변수 바인딩은 조용히 무효가 된다.

### 2. 구조 조립

- 텍스트는 **로드 가능한 face로 남긴다**(부트스트랩 폰트 Inter). `fontFamily`를 바인딩하지 않는다 — 저작 런타임에서 바인딩된 노드는 한글을 잃고 `characters` 재기록도 `appendChild`도 못 한다([`figma-injection.md`](figma-injection.md) §2.5)
- **기존 자산이 이미 바인딩돼 있으면 `fontName`을 로드 가능한 face로 되돌린 뒤** 구조를 만진다. 재생성이 아니므로 인스턴스는 끊기지 않는다
- 세트 조립은 `combineAsVariants`. `createComponentSet()`은 **없다**([#20](https://github.com/flameware/massive-design/issues/20))
- 축 추가는 `addComponentProperty(node, 'VARIANT', …)` 한 줄 — 자식 이름이 자동 갱신된다([#32](https://github.com/flameware/massive-design/issues/32))
- 세트 Auto Layout은 **한 줄만** 된다. `GRID`는 1px도 안 움직인다 — 격자는 수동 좌표 계산이다

### 3. 값 바인딩

§7의 역할별로. 색·space는 **리터럴이 아니라 변수 바인딩**이다. `setBoundVariableForPaint`·`setBoundVariableForEffect`는 **새 객체를 반환**하므로 받아서 재할당한다.

### 4. `fontFamily` — 걸지 않고, 폰트 미완 상태로 넘긴다

`loadFontAsync({family: 'Pretendard'})`를 **부르지 않는다.** 이 런타임에 Pretendard는 없고 앞으로도 없다([#9](https://github.com/flameware/massive-design/issues/9)).

**그렇다고 `type/family/sans`를 바인딩하지도 않는다.** 여기가 [#115](https://github.com/flameware/massive-design/issues/115)가 고친 자리다 — 이 문서는 오랫동안 바인딩이 "유일한 경로이고 동작한다"고 적어 왔지만, 저작 런타임에서 로드 불가 패밀리를 바인딩한 노드는 **한글 셰이핑을 얻지 못한다.** 라틴 라벨만 있는 컴포넌트에서는 눈에 띄지 않으므로 규약으로 막는다.

에이전트가 남기는 상태는 **Inter · 바인딩 없음** = 폰트 미완 상태다. 그 세대의 사람 단계가 셰이핑 런타임에서 `scripts/figma-font-bind`를 돌려 해소한다([ADR-0004](../adr/0004-font-shaping-runtime.md)).

보고에는 **바인딩 없는 TEXT 노드 수**를 남긴다 — 그것이 사람 단계의 작업 큐다.

### 5. 해시 기록

세트의 `description`을 §3.1 형식으로 쓴다. `descriptionMarkdown`은 건드리지 않는다.

### 6. 검증과 보고

1. **두 번 돌린다.** 세트·변종·노드 수가 그대로여야 한다(증분 0)
2. `getPublishStatusAsync()`를 **`try/catch`로 감싸** 읽고 §5대로 보고한다
3. 보고에 남길 것: 노드 수, 스크립트 크기(50,000자까지의 여유), 소요 시간, 새 함정

### 7. 카탈로그 배치 — 항상 마지막

컴포넌트별 구조 주입이 끝난 뒤 `dist/manifest/catalog-layout-check.gen.js`를 읽기 전용으로 실행한다. 결과가 `FAIL`이면 drift와 구조 오류를 보고한다. 명시적 sync에서는 이어서 `catalog-layout-sync.gen.js`를 실행해 전체 최상위 자산을 정규화하고, 다시 sync payload를 실행해 `movedCount: 0`을 확인한다.

- 순서: `index.gen.json`의 registry 순서
- 좌표: `x = 2000`, 첫 `y = 0`, 다음 `y = 이전 y + 이전 height + 120`
- 대상: `description` 마지막 줄의 `massive:<component>@<hash>`가 registry의 `component`와 일치하는 최상위 `COMPONENT` 또는 `COMPONENT_SET`. 이 식별은 기존 세대 규약을 재사용하며 별도의 이름 번역표를 만들지 않는다
- Components page는 정식 자산 전용이다. registry 밖 최상위 노드는 위치를 바꾸지 않고 실패로 보고한다
- 누락·중복·잘못된 타입은 자동 복구하지 않는다. 기존 이름 기반 주입 또는 사람 판단으로 원인을 해결한 뒤 다시 실행한다
- 컴포넌트 내부 variant 좌표는 카탈로그 배치의 대상이 아니다

일반 검사는 `catalog-layout-check.gen.js`만 실행하며 Figma 문서를 변경하지 않는다. sync payload는 구조 오류가 하나라도 있으면 좌표를 하나도 바꾸지 않고 중단한다.

---

## 10. 금지 목록

한 줄씩 전부 실측 근거가 있다.

| 금지 | 결과 |
|---|---|
| 컴포넌트 **재생성** | 캔버스의 인스턴스가 전부 끊긴다 |
| 컴포넌트/변종 **삭제** | 인스턴스를 끊지 않는 대신 `parent === null` **고아**를 만든다 — 페이지 순회로 못 찾고 VARIANT 축이 전멸하며 TEXT property 키가 재발급된다. 끊기는 것보다 나쁠 수 있다([#32](https://github.com/flameware/massive-design/issues/32)) |
| 같은 페이지에 **중복 이름** | 조용히 허용되고 세트를 error 상태로 만들어 property getter가 전부 throw한다. 이름을 되돌리면 복구된다 |
| `descriptionMarkdown` 쓰기 | `description`이 덮여 해시가 날아간다 |
| `_`·`.` 접두 이름 | 발행 목록에서 조용히 사라진다 |
| `setPluginData` · `addDevResourceAsync` · `getDevResourcesAsync` · `loadAllPagesAsync` · `createImageAsync` | MCP 호스트 런타임이 막는다. dev resources는 **REST 전용 채널**이다 |
| 감싸지 않은 getter | throw 하나가 atomic 롤백으로 주입 전체를 되돌린다 |
| `loadFontAsync({family: 'Pretendard'})` | 이 런타임에 없다. 폰트 선택은 [#9](https://github.com/flameware/massive-design/issues/9)에서 닫힌 문제다 |
| TEXT 노드에 `setBoundVariable('fontFamily', …)` | 한글 셰이핑이 사라지고 노드가 로드 불가가 되어 `appendChild`·`characters`가 막힌다. 바인딩은 셰이핑 런타임의 사람 단계 몫이다 ([#115](https://github.com/flameware/massive-design/issues/115), §9.4) |
| `figma.createComponent()` 직후 기존 `fills[0]`을 재사용해 `setBoundVariableForPaint` | 그 기본 paint는 `visible: false`로 온다(`createFrame()`과 다르다) — 바인딩은 정확한데 **칠이 안 보인다**. `createComponent()`에서 나온 노드의 paint를 건드릴 땐 `.visible`을 명시로 확인/설정할 것 ([#26](https://github.com/flameware/massive-design/issues/26), 32칸이 실제로 이렇게 비어 보였다) |

---

## 11. 아직 안 본 것

- **스케일 변수가 사는 컬렉션.** 노출([#41](https://github.com/flameware/massive-design/issues/41)이 되돌렸다)과 **별개 문제**다 — 노출은 플래그이고 컬렉션은 그룹핑이다. 섞으면 되돌리기 어려운 쪽(변수 ID가 바뀌어 기존 바인딩이 전부 재지정된다)이 쉬운 쪽에 묻어 들어온다. fog에 남는다
- ~~**`fontFamily` 바인딩 순서가 컴포넌트 세트에서도 성립하는가.**~~ [#26](https://github.com/flameware/massive-design/issues/26)이 밟았다 — `combineAsVariants` **완료 후** 24개 label을 일괄 바인딩했고 전부 **1회 시도로 성공**했다(재시도 0회). §2.4가 예고한 "첫 시도는 반드시 throw"가 여기선 재현되지 않았다 — 콜드 파일이 아니었거나(§0의 01~07 재실행 규칙과 무관하게 이 세션이 이미 Pretendard 페이스를 한 번 건드린 뒤였을 가능성) 컴포넌트 세트 경로가 Text Style/평범한 텍스트 노드 경로와 다르게 동작하는 것일 수 있다. 재시도 루프는 안전망으로 유지하되, "항상 1회 실패"를 전제로 코드를 짜지 말 것. **[#115](https://github.com/flameware/massive-design/issues/115) 이후 이 항목은 컴포넌트에서 소멸했다** — 에이전트가 노드에 바인딩하지 않으므로 순서 문제 자체가 없다. 재시도 루프가 남아 있는 곳은 Text Style을 만드는 `05-text-styles.js` 하나뿐이다
- **매니페스트가 CSS 상속으로 오는 `color`를 못 잡는다.** `outline`·`ghost` 셀은 `properties`에 `color` 키가 아예 없다(shadcn이 `text-foreground` 상속에 기대기 때문 — §7 표는 셀 하나를 클래스 집합으로 읽으므로 상속은 안 보인다). [#26](https://github.com/flameware/massive-design/issues/26)은 판단으로 `fg/default`에 바인딩해 메웠다(실제 렌더 색과 일치) — 매니페스트 스키마가 이 경우를 언제 정식으로 흡수할지는 fog로 남긴다
- **`description` 재발행 버그의 발현 조건.** [#31](https://github.com/flameware/massive-design/issues/31)의 왕복에서 발현하지 않았다. §3.3이 대비만 해 두었다
- **`sharedPluginData`로의 이전.** 발행 경계를 넘는 것은 확인됐다([#31](https://github.com/flameware/massive-design/issues/31) §8.3). `description`의 가시성 오염이 실제 문제로 드러나면 옮겨갈 자리다. 지금 병행하지 않는 이유는 **같은 값이 두 자리에 있으면 어긋났을 때 정본 규약이 또 필요**하기 때문
- **컴포넌트 계층 토큰.** [#23](https://github.com/flameware/massive-design/issues/23)이 센 대로 Button 48칸에서 Figma에 대응 변수가 없는 값은 36px(`h-9`·`size-9`) 하나뿐이다. 표본이 커지면 다시 본다
