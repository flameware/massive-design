# upstream 스타일 갈래 여덟 중 무엇을 인용하는가 — 값을 베끼는가 차이를 옮기는가

- 티켓: [#196](https://github.com/flameware/massive-design/issues/196) (맵 [#221](https://github.com/flameware/massive-design/issues/221))
- **조사일: 2026-09-03**
- 출처: **레지스트리 소스만** — `shadcn-ui/ui` 리포의 `apps/v4/registry/config.ts`, `apps/v4/registry/styles.tsx`, `apps/v4/registry/README.md`, `apps/v4/components/component-preview.tsx`, `apps/v4/app/layout.tsx`, `apps/v4/app/style-registry.css`, `apps/v4/registry/styles/style-*.css` 여덟, `apps/v4/registry/bases/base/ui/*.tsx`
- 절차의 근거: [`docs/agents/upstream-surface-recount.md`](../agents/upstream-surface-recount.md) §5 한계 ② — 이 문서가 그 한계를 닫는다
- 출처가 된 보류: [`surface-gap-recheck-2026-09.md`](https://github.com/flameware/massive-design/blob/research/surface-gap-recheck-2026-09/docs/research/surface-gap-recheck-2026-09.md) §7.2 보류 2

**이 문서는 계약을 움직이지 않는다.** 코드·Storybook·매니페스트는 한 줄도 바뀌지 않았다. 산출은 **인용의 정본으로 삼을 갈래**와 **값을 어떻게 옮기는가의 원칙 한 문장**이며, 그것을 [#223](https://github.com/flameware/massive-design/issues/223)이 집어 쓴다.

**발행 페이지를 눈으로 보지 않았다.** §2의 확정은 전부 소스 세 자리에서 나왔고, 각 자리의 고정 SHA를 §1에 적었다.

---

## 0. 한 줄 결론

**정본은 `lyra`가 아니라 `nova`다. 그리고 #164가 "한 단 차이를 옮겼다"고 적은 것은, `nova`로 재면 옮긴 것이 아니라 그냥 맞은 값이었다.**

셋이 나왔다.

1. **발행 문서의 기본은 `base-nova`다** — 소스 세 자리가 독립적으로 같은 답을 준다(§2). 지금까지 우리가 인용한 값은 전부 `style-lyra.css`의 것이고, **lyra는 여덟 중 정본이 아니다.**
2. **갈래는 값을 가른다 — 그것도 크게.** 425개 `.cn-*` 선언 중 여덟이 전부 같은 것은 **111개(26%)**뿐이고 **314개(74%)가 갈린다.** lyra와 nova가 일치하는 것은 425 중 **214개(50%)**다. 즉 **lyra를 인용하면 두 번에 한 번 틀린 값을 베낀다.** 이 질문의 무게는 줄지 않았다 — 커졌다.
3. **#164가 발견했다는 "체계적 한 단 차이"는 우리와 upstream 사이가 아니라 `lyra`와 `nova` 사이에 있다.** lyra는 카탈로그 전역이 `text-xs` 기준(`text-xs` 121회 / `text-sm` 10회)이고 nova는 `text-sm` 기준(27 / 91)이다. **우리 카탈로그는 nova 족이다**(22 / 69). 그래서 #164가 "우리 스케일에서 같은 한 단 차이를 낸다"며 고른 `text-base`/`text-sm`은 **nova의 `.cn-field-legend`와 토큰 단위로 같다.** 옮기지 않고 베꼈어도 같은 답이 나왔다.

**그러므로 원칙은 "차이를 옮긴다"가 아니라 "베낀다"이고, 옮기는 것은 값이 아니라 축의 간격이며, 그것도 기본값이 발행된 인스턴스에 묶여 있을 때뿐이다**(§6).

---

## 1. 고정한 SHA

| 무엇 | SHA | 마지막 변경 |
|---|---|---|
| `shadcn-ui/ui` head | **`71e50952fbb7`** | — ([#177](https://github.com/flameware/massive-design/issues/177)이 고정한 값에서 **움직이지 않았다**) |
| `apps/v4/registry/bases/base/ui` | `503a3a57aec9` | 2026-08-31T09:43Z (#177과 같다) |
| `apps/v4/registry/styles` (여덟 CSS) | **`5c8f5b06746a`** | 2026-08-18T05:50Z — *fix(styles): unify questionnaire and field choice-card styles (#11436)* |
| `apps/v4/registry/config.ts` | **`2b89d67e19ce`** | 2026-07-17T15:20Z — *feat: aria (#11208)* |
| `apps/v4/components/component-preview.tsx` | **`da43f5a12bea`** | 2026-08-30T10:19Z — *fix(docs): restore sidebar block preview on mobile (#11715)* |

읽은 모든 파일은 `71e50952fbb7`로 고정해 받았다. 스타일 CSS 디렉터리는 **2026-08-18 이후 움직이지 않았고** 기본값을 정하는 `config.ts`는 **2026-07-17 이후 움직이지 않았다** — 다음 재조회는 이 두 SHA에서 diff 한 번으로 이 문서의 유효성을 판정할 수 있다.

---

## 2. 발행 문서의 기본 갈래 — **`base-nova`** (소스 세 자리가 독립적으로 같은 답을 준다)

### 2.1 `apps/v4/registry/config.ts` — 기본 구성

```ts
export const DEFAULT_CONFIG: DesignSystemConfig = {
  base: "base",
  style: "nova",
  baseColor: "neutral",
  theme: "neutral",
  …
}
```

[소스](https://github.com/shadcn-ui/ui/blob/71e50952fbb7/apps/v4/registry/config.ts). `base`와 `style`은 **직교하는 두 축**이고(§2.4), 기본은 `base` × `nova` = **`base-nova`**다.

> `apps/v4/registry/styles.tsx`의 `STYLES` 배열은 `vega`가 첫 원소지만 **그것은 UI 나열 순서일 뿐 기본값이 아니다.** `styles.tsx`는 이름·제목·설명·아이콘만 들고 기본값을 정하는 코드가 없다. 배열의 첫 원소를 기본으로 읽는 것이 이 리포가 반복해서 잡은 "기록이 아니라 소스" 실패의 한 모양이라, 기본값은 `config.ts`의 `DEFAULT_CONFIG`에서만 읽었다.

### 2.2 `apps/v4/components/component-preview.tsx` — 문서가 실제로 렌더하는 것

`/docs/components/*` 페이지의 모든 미리보기는 이 컴포넌트를 거치고, **스타일 인자의 기본값이 매개변수 자리에 축자로 있다**:

```tsx
export function ComponentPreview({
  name, type, className, previewClassName,
  align = "center",
  hideCode = false,
  chromeLessOnMobile = false,
  styleName = "base-nova",     // ←
  …
```

[소스](https://github.com/shadcn-ui/ui/blob/71e50952fbb7/apps/v4/components/component-preview.tsx). `styleName`은 `getRegistryComponent(name, styleName)`로 렌더할 컴포넌트를 고르고, 코드 탭의 `ComponentSource`와 블록의 `<iframe src={`/view/${styleName}/${name}`}>`도 같은 값을 받는다. **미리보기·소스·블록 셋이 한 값에 걸려 있다.**

### 2.3 `apps/v4/app/layout.tsx` — 사이트 자신이 쓰는 것

```tsx
import { Toaster as BaseToaster } from "@/styles/base-nova/ui/toast"
```

[소스](https://github.com/shadcn-ui/ui/blob/71e50952fbb7/apps/v4/app/layout.tsx). 문서 사이트의 루트 레이아웃이 자기 Toaster를 `base-nova` 조합에서 가져온다.

### 2.4 스타일 모델 — `base`와 `style`은 다른 축이다

`apps/v4/registry/README.md`([소스](https://github.com/shadcn-ui/ui/blob/71e50952fbb7/apps/v4/registry/README.md))가 모델을 축자로 적었다.

- **authored(사람이 쓴 것)**: `bases/base/`·`bases/radix/`(그리고 `aria`) — primitive 갈래별 TSX. `styles/style-*.css` 여덟 — "각각이 한 스타일의 디자인 토큰을 정의한다".
- **generated(생성물)**: 모든 base × 모든 style 조합이 `base-nova`·`radix-sera` 같은 **조합**을 만든다. `../styles/<조합>/ui/*`가 문서 앱이 import하는 컴파일 산출이다.
- RTL 변종은 **`base-nova`와 `radix-nova`에만** 생성된다.

즉 **`nova`는 두 primitive 갈래 모두에서 기본 스타일이고**, 우리 리포가 primitive 기반을 `radix-ui`로 고정한 것([ADR-0016](../adr/0016-primitive-base-stays-radix.md))과 무관하게 스타일 정본은 같은 `nova`다. `base`↔`radix`가 가르는 것은 TSX(어느 primitive를 쓰는가)이고 `style`이 가르는 것은 CSS(어떤 값으로 그리는가)라 **둘은 섞이지 않는다.**

### 2.5 이 확정이 뒤집는 것

`docs/agents/upstream-surface-recount.md` §5 한계 ②는 *"upstream 문서가 여덟 style CSS 갈래 중 무엇을 렌더하는지 확정되지 않았다"*, `surface-gap-recheck-2026-09.md` §7.2 보류 2는 *"발행 문서가 기본으로 렌더하는 스타일이 어느 것인지 페이지에서 확인되지 않았다"* 라고 적었다. **둘 다 해소됐다 — 그리고 답은 지금까지 인용해 온 `lyra`가 아니다.**

---

## 3. 여덟이 무엇을 가르는가

### 3.1 값의 두 층 — TSX는 갈래와 무관하고 CSS만 갈린다

upstream 컴포넌트의 클래스는 **두 층으로 나뉘어 있다.**

```tsx
// apps/v4/registry/bases/base/ui/select.tsx — 갈래와 무관 (authored, base별로 하나)
className={cn(
  "cn-select-trigger flex w-fit items-center justify-between whitespace-nowrap outline-none disabled:cursor-not-allowed disabled:opacity-50 …",
  className
)}
```

```css
/* apps/v4/registry/styles/style-nova.css — 갈래마다 다름 */
.cn-select-trigger {
  @apply border-input … rounded-lg border bg-transparent py-2 pr-2 pl-2.5 text-sm … data-[size=default]:h-8 data-[size=sm]:h-7 …;
}
```

**TSX 층은 구조와 동작**(flex 방향, `whitespace-nowrap`, disabled 커서, `data-*` 방출)이고 **CSS 층은 표면과 스케일**(색·테두리·모서리·간격·타입·치수)이다. 갈래는 **CSS 층만** 가른다.

**이것이 `surface-gap-recheck-2026-09.md` §5.1이 잘못 귀속한 자리다.** ②-8 `ButtonGroupSeparator`의 근거로 인용된 `data-horizontal:mx-px data-horizontal:w-auto data-vertical:my-px data-vertical:h-auto`는 **`button-group.tsx`의 TSX 기본 클래스**이고 여덟 갈래 어디에도 없다. 그 값은 lyra의 취향이 아니라 **갈래 불변**이다. 반대로 §5.1의 다른 행들(`text-xs`·`text-sm`을 인용한 것 전부)은 CSS 층이라 실제로 lyra의 값이었다.

### 3.2 CSS 층의 구조 — 완전히 평평하다

여덟 CSS는 전부 `.style-<이름> { .cn-*{@apply …} × N }` 한 겹이다. `style-nova.css`는 여는 중괄호 423개 = 바깥 하나 + 규칙 422개이고, `@apply` 줄이 정확히 422개다. **`:root`도 `@theme`도 중첩 규칙도 그룹 선택자도 없다.**

따라서 **갈래는 토큰을 바꾸지 않는다** — 반경 스케일·색·글꼴은 `radius`·`baseColor`·`theme`·`font`라는 **별개의 구성 축**이고 `DEFAULT_CONFIG`가 각각 `default`·`neutral`·`neutral`·`inter`로 고정한다. 갈래가 바꾸는 것은 **컴포넌트 클래스가 어떤 유틸리티를 쓰는가**뿐이다.

### 3.3 같은 결정의 다른 값인가, 결정 자체가 있고 없는가 — **거의 전자, 그러나 완전히는 아니다**

선택자 합집합은 **425개**이고 갈래별 선언 수는 이렇다.

| 갈래 | 선언 수 | 합집합에 없는 것 |
|---|---:|---|
| mira | 422 | `cn-alert-dialog-footer` `cn-calendar-caption` `cn-tabs-trigger-aria` |
| **nova** | **422** | `cn-accordion` `cn-calendar-caption` `cn-input-group-button-size-sm` |
| luma·maia·rhea·vega | 421 | 각 4개 |
| sera | 418 | 6개 |
| **lyra** | **416** | **9개 — 여덟 중 가장 적다** |

**9개(425의 2.1%)에서 결정의 존재 자체가 갈린다.** 성격이 다른 셋이 섞여 있다.

- **한 갈래만 결정을 갖는 것** — `.cn-alert-dialog-footer`는 **nova에만** 있다(`bg-muted/50 -mx-4 -mb-4 rounded-b-xl border-t p-4`). `.cn-tabs-trigger-aria`는 nova·vega에만 있다.
- **축의 값 하나에만 걸린 것** — `.cn-input-group-button-size-sm`(`gap-1`)은 **lyra·mira에만** 있다. 축은 여덟 모두 TSX에 있으나 그 값에 딸린 선언은 둘에만 있다.
- **lyra만 결정을 버린 것** — `.cn-button-group-orientation-horizontal`/`-vertical`은 **lyra에만 없다**(나머지 일곱은 방향별 모서리 처리를 갖는다). `.cn-dialog-footer`·`.cn-carousel-next`/`-previous`·`.cn-accordion`도 같은 계열이다.

**그래서 관문 ⓑ는 갈래에 의존한다 — 작지만 0이 아니고, 방향이 한쪽이다.** ⓑ는 *"소비처가 `className`으로 우리 스타일 결정을 복제해야 하는가"* 를 묻는데, 갈래에 그 선언이 없으면 "복제할 결정이 없다"로 읽혀 **거짓 음성**이 난다. **lyra는 선언이 가장 적은 갈래**이므로 지금까지의 ⓑ 판정은 **거짓 음성 쪽으로 치우쳐 있었다.** `AlertDialogFooter`가 그 실물이다 — lyra로 재면 "결정 없음", nova로 재면 "면·경계·음수 여백을 가진 명백한 결정"이다.

> **거짓 양성은 이 방향으로 나지 않는다.** nova는 422개로 최다 급이므로 nova로 재서 "결정이 있다"고 나온 것이 다른 갈래에서 사라질 일은 사실상 없다. 정본을 nova로 옮기는 것이 ⓑ의 치우침도 함께 고친다.

---

## 4. 값이 실제로 갈리는가 — **갈린다. 74%가 갈린다**

이 질문은 "갈리지 않으면 무게가 준다"는 조건부였다. **전수로 쟀고, 무게는 줄지 않았다.**

| | 개수 | 비율 |
|---|---:|---:|
| 합집합 선택자 | 425 | |
| **여덟이 전부 같은 선언** | **111** | **26%** |
| **갈리는 선언** | **314** | **74%** |
| 그중 lyra만 다른 것 | 2 | — |

**nova와 일치하는 선언 수**(425 기준):

| 갈래 | 일치 | 비율 |
|---|---:|---:|
| vega | 272 | 64% |
| rhea | 219 | 51% |
| maia | 216 | 50% |
| **lyra** | **214** | **50%** |
| luma | 197 | 46% |
| mira | 178 | 41% |
| sera | 151 | 35% |

**lyra를 인용하면 두 번에 한 번 정본과 다른 값을 베낀다.** 이것이 이 티켓의 실제 무게다.

### 4.1 §5.1의 여덟 행 — 표본 대조

이 맵이 인용할 표면들을 여덟 갈래에 나란히 놓았다. `L`=lyra(지금까지 인용한 값), `N`=nova(정본).

| §5.1 | 선택자 | lyra | nova | 갈리는가 |
|---|---|---|---|---|
| ②-1 | `.cn-field-separator` | `-my-2 h-5 **text-xs** …` | `-my-2 h-5 **text-sm** …` | **갈림** (타입 한 단) |
| ②-2 | `.cn-table-footer` | `bg-muted/50 border-t font-medium [&>tr]:last:border-b-0` | 동일 | **여덟 전부 동일** |
| ②-3 | `.cn-progress-label` | `**text-xs**` | `**text-sm** font-medium` | **갈림** (타입 + 굵기) |
| ②-3 | `.cn-progress-value` | `text-muted-foreground ml-auto **text-xs** tabular-nums` | `… **text-sm** tabular-nums` | **갈림** |
| ②-4 | `.cn-popover-header` | `flex flex-col gap-1 **text-xs**` | `flex flex-col **gap-0.5** **text-sm**` | **갈림** |
| ②-4 | `.cn-popover-title` | `**text-sm** font-medium` | `font-medium` (header의 `text-sm` 상속) | **갈림** |
| ②-4 | `.cn-popover-description` | `text-muted-foreground **text-xs/relaxed**` | `text-muted-foreground` (상속) | **갈림** |
| ②-5 | `.cn-input-group-textarea` | `rounded-none border-0 … py-2 …` | 동일 | 동일(둘은) |
| ②-6 | `.cn-input-group-text` | `text-muted-foreground gap-2 **text-xs** …` | `… **text-sm** …` | **갈림** |
| ②-7 | `.cn-command-separator` | `bg-border -mx-1 h-px` | 동일 | 동일(둘은) |
| ②-8 | `ButtonGroupSeparator` 방향 | **TSX 층** — 갈래 불변 | 같음 | **갈래 무관**(§3.1) |
| ②-12 | `.cn-item-size-xs` | `gap-2 px-2.5 py-2 …` | 동일 | 동일(둘은) |

**여덟 행 중 여섯이 갈리고, 갈리는 자리는 전부 타입 스케일과 간격이다.** 색·구조·의사상태는 갈리지 않는다. §5.1이 ⓑ 판정 근거로 든 것 자체(결정의 **존재**)는 흔들리지 않지만, **인용된 값은 절반 이상이 정본이 아니다.**

---

## 5. 우리 스케일과 upstream 스케일 — `field` 국한이 아니라, 애초에 우리와 upstream 사이의 일이 아니다

### 5.1 #164가 잰 것은 무엇이었나

[#164](https://github.com/flameware/massive-design/issues/164)와 `field.tsx`의 `limits`는 이렇게 적었다.

> `style-lyra.css`의 `.cn-field-legend`는 `data-[variant=label]:text-xs data-[variant=legend]:text-sm`로 **한 단** 차이만 낸다 … 우리는 같은 한 단 차이를 우리 스케일에서 낸다: `legend`는 `text-base font-semibold`, `label`은 `text-sm font-medium`이다.

**여덟 갈래의 `.cn-field-legend`를 전부 놓으면 이렇다.**

| 갈래 | legend | label |
|---|---|---|
| luma | `text-base` | `text-sm` |
| **lyra** | `text-sm` | `text-xs` |
| maia | `text-base` | `text-sm` |
| mira | `text-sm` | `text-xs/relaxed` |
| **nova** | **`text-base`** | **`text-sm`** |
| rhea | `text-base` | `text-sm` |
| sera | `text-xs`(uppercase) | `text-xs` |
| vega | `text-base` | `text-sm` |

**#164가 "우리 스케일로 옮겼다"며 고른 `text-base`/`text-sm`은 nova의 값과 토큰 단위로 같다.** 다섯 갈래(luma·maia·nova·rhea·vega)가 그 값에 모여 있고 lyra·mira만 한 단 아래다. **#164가 옮긴 "한 단"은 우리와 upstream 사이의 간격이 아니라 lyra와 nova 사이의 간격이었다.** 정본을 nova로 놓으면 그 간격은 **0**이고, `legend`/`label`은 그냥 베끼면 되는 값이었다.

> **#164의 결론은 옳았다. 근거가 틀렸다.** 그리고 이 리포가 여덟 번 잡은 병과 같은 모양이다 — 값은 소스에서 왔지만 **어느 소스인지가 기록에서 왔다.**

### 5.2 그러면 "체계적 한 단 차이"는 어디에 있었나 — **lyra와 nova 사이에, 카탈로그 전역에**

각 갈래 CSS의 타입 스케일 유틸리티 출현 수다.

| 갈래 | `text-xs` | `text-sm` | `text-base` | `text-lg` | 성격 |
|---|---:|---:|---:|---:|---|
| **lyra** | **121** | **10** | 0 | 0 | **xs 기준** |
| mira | 108 | 12 | 0 | 0 | **xs 기준** |
| sera | 55 | 71 | 3 | 6 | 혼합(editorial) |
| luma | 27 | 88 | 10 | 2 | sm 기준 |
| maia | 27 | 88 | 10 | 2 | sm 기준 |
| **nova** | **27** | **91** | **10** | 0 | **sm 기준** |
| rhea | 26 | 89 | 10 | 2 | sm 기준 |
| vega | 27 | 90 | 6 | 2 | sm 기준 |

**#196이 물은 "field 국한인가 카탈로그 전역인가"의 답: 카탈로그 전역이다 — 다만 그것은 `lyra`라는 갈래의 성질이다.** lyra는 `styles.tsx`가 스스로 *"Boxy and sharp. For mono fonts."* 라고 적은 갈래이고, 실제로 카탈로그 전역에서 `text-sm`을 `text-xs`로 한 단 내려 쓴다. mira(*"Made for compact interfaces."*)도 같다. **upstream 전체가 xs 기준인 것이 아니라, 우리가 인용해 온 갈래 하나가 그랬다.**

### 5.3 우리는 어느 족인가 — **nova 족이다**

우리 51개 계약 소스(`packages/ui/src/components/ui/*.tsx`, 한국어 산문 줄 제외)의 같은 수치다.

| | `text-xs` | `text-sm` | `text-base` | `text-lg` |
|---|---:|---:|---:|---:|
| **우리 카탈로그** | 22 | 69 | 3 | 4 |
| nova | 27 | 91 | 10 | 0 |
| lyra | 121 | 10 | 0 | 0 |

`sm:xs` 비가 우리 3.1, nova 3.4, lyra 0.08이다. **우리 스케일은 nova와 같은 족이고 lyra와는 다른 족이다.**

### 5.4 이름을 맞춰 1:1로 댄 표본 — **어긋난 자리는 lyra를 인용한 자리뿐이다**

이름이 1:1로 대응하는 노드만 골라 우리 값과 nova 값을 나란히 놓았다.

| 우리 표면 | 우리 값 | nova | lyra | 판정 |
|---|---|---|---|---|
| `FieldLegend` `rank=legend` | `text-base font-semibold` | `text-base` | `text-sm` | **nova와 같다** |
| `FieldLegend` `rank=label` | `text-sm font-medium` | `text-sm` | `text-xs` | **nova와 같다** |
| `FieldDescription` | `text-sm` | `text-sm` | `text-xs/relaxed` | **nova와 같다** |
| `FieldError` | `text-sm` | `text-sm` | `text-xs` | **nova와 같다** |
| `FieldSeparatorContent` | `text-sm` | `text-sm` | `text-xs` | **nova와 같다** |
| `TableCaption` | `text-sm` | `text-sm` | `text-xs` | **nova와 같다** |
| `ItemDescription` | `text-sm` | `text-sm` | `text-xs/relaxed` | **nova와 같다** |
| `PopoverTitle` | `text-sm font-medium` | `text-sm`(상속) `font-medium` | `text-sm font-medium` | **nova와 같다** |
| `PopoverDescription` | `text-sm` | `text-sm`(상속) | `text-xs/relaxed` | **nova와 같다** |
| `SelectLabel` | `text-xs` | `text-xs` | `text-xs` | **여덟 전부 `text-xs`** |
| `DropdownMenuLabel` | `text-xs` | `text-xs` | `text-xs` | **여덟 전부 `text-xs`** |
| `Badge` | `text-xs` | `text-xs` | `text-xs` | **일곱이 `text-xs`**(mira만 `text-[0.625rem]`) |
| `ProgressLabel` | `text-sm font-medium` | `text-sm font-medium` | `text-xs` | **nova와 같다** |
| **`ProgressValue`** | **`text-xs`** | **`text-sm`** | **`text-xs`** | **어긋남 — lyra를 베꼈다** |
| **`InputGroupText`** | **`text-xs`** | **`text-sm`** | **`text-xs`** | **어긋남 — lyra를 베꼈다** |

**어긋난 둘은 정확히 `surface-gap-recheck-2026-09.md` §5.1이 lyra 값을 축자로 인용해 연 두 표면이다**(②-3의 `ml-auto tabular-nums text-xs`, ②-6의 `text-xs`). 나머지 열셋은 우리가 upstream을 인용하지 않고 우리 본문 단으로 결정한 자리인데 **전부 nova와 일치한다.**

> **이 둘을 이 티켓에서 고치지 않는다.** 조사 티켓이고, 발행된 인스턴스의 클래스를 바꾸는 것은 additive가 아니다. **`ProgressValue`와 `InputGroupText`의 `text-xs`는 오늘부터 "발행된 인스턴스를 지키는 값"이며**(맵 #221 규칙 3), 바꾸려면 breaking 세대가 필요하다. 여기서는 **정본이 nova이고 이 둘이 lyra에서 온 값이라는 사실만** 기록한다. 다음 재조회가 같은 자리를 "어긋남"으로 다시 발견하지 않게 하는 것이 이 문단의 목적이다(ADR-0006의 원칙).

### 5.5 기록이 소스와 어긋난 다른 한 자리 — `FieldTitle`

`field.tsx`의 `limits`가 [#175](https://github.com/flameware/massive-design/issues/175)의 판정을 이렇게 적었다.

> 선언도 … `.cn-field-title`의 `gap-2 text-xs/relaxed group-data-[disabled=true]/field:opacity-50`인데 … 소비처가 복제할 결정으로 남는 것은 **글자 한 단**(`text-xs`)뿐이다(ⓑ).

`text-xs/relaxed`는 **lyra의 값**이다. nova는 `gap-2 leading-snug text-sm font-medium group-data-[disabled=true]/field:opacity-50`이고, 우리 `labelVariants`는 `flex items-center gap-2 text-sm leading-none font-medium …`이다. **정본으로 재면 남는 차이는 `leading-snug` 하나뿐이라 ⓑ가 더 강하게 실패한다.**

**판정은 뒤집히지 않는다 — 오히려 굳는다.** 다만 `limits`에 적힌 근거의 값이 정본의 값이 아니므로, 이 문장은 **다음에 `field` 계약을 여는 티켓이 지나가며 고친다.** 이 티켓은 계약을 만지지 않는다.

---

## 6. 판정

### 6.1 인용의 정본

**인용의 정본은 `base-nova`다** — `apps/v4/registry/config.ts`의 `DEFAULT_CONFIG.style = "nova"`, `component-preview.tsx`의 `styleName = "base-nova"`, `app/layout.tsx`의 `@/styles/base-nova/ui/toast` 셋이 독립적으로 같은 답을 준다(§2). 값의 정본 파일은 **`apps/v4/registry/styles/style-nova.css`**(디렉터리 SHA `5c8f5b06746a`)이고, TSX 층의 정본은 **`apps/v4/registry/bases/base/ui/*.tsx`**(SHA `503a3a57aec9`) — §3.1이 가른 두 층 그대로다.

`style-lyra.css`는 **더 이상 인용하지 않는다.** 이미 인용해 놓은 자리는 §5.4·§5.5에 목록으로 남았고, 계약을 여는 티켓이 그 자리를 지날 때 근거 문장을 정본으로 바꾼다.

### 6.2 값을 베끼는가 차이를 옮기는가 — 원칙 한 문장

> **upstream 값은 `base-nova`에서 그대로 베끼되, 새 축의 기본값이 발행된 인스턴스에 묶여 있으면 값이 아니라 여덟 갈래가 공유하는 축의 간격을 옮긴다.**

**#164의 선례는 일반화하지 않는다.** #164는 "한 단을 옮겼다"고 적었지만 정본으로 재면 옮긴 것이 아니라 맞은 값이었고(§5.1), 옮기기를 일반 규칙으로 세우면 **정본과 일치하는 값을 굳이 한 단 밀어 내는 규칙**이 된다. 옮기기가 필요한 자리는 **하나뿐이다** — 맵 [#221](https://github.com/flameware/massive-design/issues/221) 규칙 3(*"새 축의 기본값은 발행된 인스턴스를 지키는 값이다"*)이 기본값을 upstream과 다른 값으로 못 박아, **그 축의 나머지 값이 upstream 절대값을 그대로 쓰면 축이 무너지는** 자리다. 그때 옮기는 것은 **값이 아니라 간격**이고, 간격은 **여덟 갈래가 공유할 때만** 옮길 자격이 있다(§7이 그 실물이다).

세 갈래로 풀면 이렇다.

1. **기본값이 자유로우면 nova의 값을 그대로 쓴다.** (`TableFooter`의 `bg-muted/50 border-t font-medium`, `FieldLegend`의 `text-base`/`text-sm`)
2. **기본값이 발행된 인스턴스에 묶여 있으면** 기본값은 우리 값을 지키고, 나머지 값은 **여덟 갈래 전부에서 같은 간격을 확인한 뒤** 그 간격을 우리 기본값에 얹는다. **여덟이 공유하지 않는 간격은 옮기지 않는다** — 한 갈래의 취향이다.
3. **갈래마다 다른 결정은 인용하지 않는다.** nova에만 있고 다른 일곱에 없는 선언(`.cn-alert-dialog-footer`, `.cn-tabs-trigger-aria`, `.cn-select-trigger`의 `data-[size=sm]:rounded-…`)은 nova의 취향이지 upstream의 결정이 아니다. ⓑ의 근거로는 쓰되(결정은 존재한다) **값을 베껴 오지는 않는다.**

그리고 이 리포가 이미 세운 규칙들은 그대로 이긴다 — **인용은 게이트를 이기지 못한다.** 구분선을 `h-px bg-*`로 인용해 오지 않고 `h-0 border-t` + 맨 `border-color`로 그리는 것([#154](https://github.com/flameware/massive-design/issues/154)·[#168](https://github.com/flameware/massive-design/issues/168)·[#169](https://github.com/flameware/massive-design/issues/169)), 새 토큰을 선제 공개하지 않는 것(규칙 5)이 인용보다 위다.

---

## 7. [#223](https://github.com/flameware/massive-design/issues/223)이 그대로 집어 쓸 것 — `SelectTrigger`의 `size`

### 7.1 upstream 실재 (SHA `503a3a57aec9`)

`apps/v4/registry/bases/base/ui/select.tsx`:

```tsx
function SelectTrigger({ className, size = "default", children, ...props }:
  SelectPrimitive.Trigger.Props & { size?: "sm" | "default" }) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn("cn-select-trigger flex w-fit items-center justify-between whitespace-nowrap …", className)}
```

**`cva`가 아니라 prop + `data-size`다.** [#176](https://github.com/flameware/massive-design/issues/176)의 교훈이 그대로 걸리는 자리이고, 런북 §2.2의 `PROP` 추출이 이 축을 잡는다. 값은 **`default`·`sm` 둘**이고 upstream 기본값은 `default`다.

### 7.2 그 축이 갈래마다 무엇을 바꾸는가 — **전수**

`.cn-select-trigger`에서 `data-[size=…]`가 붙은 선언만 뽑았다.

| 갈래 | `size=default` | `size=sm` | 그 밖 |
|---|---|---|---|
| luma | `h-9` | `h-8` | — |
| lyra | `h-8` | `h-7` | `data-[size=sm]:rounded-none` |
| maia | `h-9` | `h-8` | — |
| mira | `h-7` | `h-6` | — |
| **nova** | **`h-8`** | **`h-7`** | `data-[size=sm]:rounded-[min(var(--radius-md),10px)]` |
| rhea | `h-8` | `h-7` | — |
| sera | `h-10` | `h-9` | — |
| vega | `h-9` | `h-8` | — |

**두 가지가 나온다.**

- **여덟 갈래 전부에서 `sm`은 `default`의 높이 정확히 한 단 아래다**(`h-N` → `h-(N-1)`, 즉 0.25rem). 절대값은 `h-6`부터 `h-10`까지 흩어지지만 **간격은 불변이다.**
- **이 축은 높이만 바꾼다.** 타입 크기(`text-sm`)·안쪽 여백·아이콘 크기·색은 여덟 어디에서도 `size`에 걸리지 않는다. 모서리를 함께 바꾸는 것은 **nova·lyra 둘뿐**이라 §6.2의 갈래 3에 걸린다 — **인용하지 않는다.**

### 7.3 그러므로 #223이 쓸 값

우리 `select.tsx`의 `selectVariants` 기본 클래스는 오늘 `flex h-9 w-full … rounded-md border bg-background px-3 py-2 text-sm shadow-xs …`이고 **`size` 축이 없다**(`selectVariantsConfig = { variants: {}, defaultVariants: {} }`).

| | 값 | 근거 |
|---|---|---|
| 축 이름 | `size` | 축 이름의 이름 공간은 카탈로그 전역이고([ADR-0008](../adr/0008-axis-and-value-name-spaces.md)) `size`는 이미 그 뜻으로 쓰인다. upstream과도 같다 |
| 값 이름 | `default` · `sm` | 값 이름은 축 지역(ADR-0008). upstream과 같고 `Item`·`Toggle`이 이미 쓰는 어휘다 |
| **`default`** | **`h-9`**(오늘의 값을 그대로 둔다) | 맵 #221 규칙 3 — **발행된 인스턴스를 지키는 값**이다. nova의 `h-8`을 베끼면 발행된 트리거의 높이가 바뀌어 additive가 아니다 |
| **`sm`** | **`h-8`** | §6.2 갈래 2 — **여덟 갈래 전부가 공유하는 한 단 간격**을 우리 기본값 `h-9`에 얹은 값이다. luma·maia·vega의 절대값과 우연히 같지만 **근거는 그 셋이 아니라 간격의 불변성**이다 |
| 그 밖 | **없다** | 모서리·타입·여백은 이 축이 건드리지 않는다. nova의 `data-[size=sm]:rounded-…`는 여덟 중 둘뿐이라 인용하지 않는다 |
| 새 토큰 | **0개** | `h-8`은 Tailwind 스케일이고 새 `--ds-*`가 필요 없다. 맵 #221 규칙 5의 기준선(여덟 세대 연속 0개)이 유지된다 |
| 호환성 | **additive** | 기본값이 오늘의 클래스와 같고, `size`를 주지 않은 소비처의 렌더가 한 픽셀도 움직이지 않는다 |

**같은 티켓에서 함께 걸리는 것**(이 문서가 판정하지 않는다, 알리기만 한다):

- `select`는 `parts`가 없는 계약이라 `size`를 트리거에 걸려면 `parts`를 세워야 하고, 세우는 순간 `SelectSeparator`의 `-mx-1 my-1 h-px bg-border`가 게이트에 걸린다([#130](https://github.com/flameware/massive-design/issues/130)). **여덟 갈래 전부 `h-px` + `bg-border*`이므로 인용할 답이 upstream에 없다** — `h-0 border-t` + 맨 `border-color`로 그린 #154·#168·#169의 답을 그대로 쓴다(§6.2 마지막 문단).
- 우리 `SelectTrigger`의 `data-slot`은 `"select"`이고 upstream은 `"select-trigger"`다. 우리 루트가 `w-full`인 반면 upstream TSX 층은 `w-fit`이다. **둘 다 이 문서의 조사 범위 밖이고 #223의 판단 사항이다.**

---

## 8. 이 추출이 못 보는 것

**잡히지 않은 것을 없다고 적지 않는다**(런북 §5 ③의 규칙을 이 문서에도 건다).

1. **CSS 층만 전수로 쟀다.** §3.2에서 확인한 대로 여덟 CSS는 완전히 평평해서(`.style-X { .cn-*{@apply …} }` 한 겹, 그룹 선택자·중첩·`:root` 없음, 규칙 수 = `@apply` 수) **CSS 층 안에서는 추출이 완결이다.** 그러나 **TSX 층은 전수로 대조하지 않았다** — §3.1은 `select`·`button-group` 두 파일에서 층이 갈린다는 것을 보였을 뿐이고, "어떤 결정이 TSX에 있고 어떤 것이 CSS에 있는가"의 전수 목록은 만들지 않았다. **§5.1의 다른 행에도 ②-8과 같은 잘못된 귀속이 더 있을 수 있다.**
2. **갈래 사이 값 비교는 문자열 동일성이다.** `text-xs/relaxed`와 `text-xs`, `focus-visible:ring-3`과 `focus-visible:ring-[3px]`을 다른 값으로 센다. 그래서 §4의 "74%가 갈린다"는 **상한**이다 — 렌더가 같은데 표기만 다른 쌍이 그 안에 있다. 반대로 §4의 "26%가 동일"은 **하한**이고, 이 문서가 결론에 쓴 방향(값이 갈린다)에는 안전한 쪽이다.
3. **타입 스케일 수치(§5.2·§5.3)는 유틸리티 출현 수이지 렌더되는 글자 크기의 분포가 아니다.** 한 규칙 안에 `text-sm`이 두 번 나오면 두 번 센다. 갈래 사이 비교로는 유효하지만(같은 방식으로 여덟을 쟀다), **우리 카탈로그와의 비교(§5.3)는 파일 구조가 달라 절대 수를 맞댈 수 없다** — 그래서 §5.3은 절대 수가 아니라 `sm:xs` **비**로만 결론을 냈고, 그 결론은 §5.4의 이름 맞춘 1:1 표본이 따로 받친다.
4. **우리 쪽 수치는 한국어가 없는 줄만 셌다.** 계약의 `guidance` 산문이 클래스 이름을 축자로 인용해 수치를 부풀리기 때문인데, **클래스와 산문이 한 줄에 섞여 있으면 그 줄이 통째로 빠진다.** 51개 파일에서 실제로 그런 줄은 계약 블록 안뿐이라 클래스 정의는 살아남지만, 이것도 검증된 것이 아니라 구조에서 추정한 것이다.
5. **`radius`·`baseColor`·`theme`·`font`는 갈래 축이 아니다.** §3.2가 CSS에 토큰 정의가 없음을 확인했으므로 이 문서의 비교는 그 넷을 `DEFAULT_CONFIG`의 값(`default`·`neutral`·`neutral`·`inter`)에 고정한 상태의 비교다. **`rounded-lg`가 어떤 픽셀이 되는가는 이 문서가 재지 않았다.**
6. **`aria` base를 읽지 않았다.** `bases.ts`는 `base`·`aria`·`radix` 셋을 갖는데 이 문서의 TSX 인용은 전부 `bases/base/`다. 우리 primitive 기반은 `radix-ui`이므로([ADR-0016](../adr/0016-primitive-base-stays-radix.md)) **`bases/radix/`의 TSX가 `bases/base/`와 다른 자리가 있다면 §3.1의 TSX 층 인용이 흔들린다.** 다만 README가 *"Shared surfaces should stay in sync across both bases"* 라고 적고 있고, 스타일 CSS는 base와 무관하게 공유되므로 **§4·§5의 결론(CSS 층)은 이 한계에 걸리지 않는다.**

---

## 9. 다음 기준선

| | |
|---|---|
| 조사일 | **2026-09-03** |
| upstream head | **`71e50952fbb7`** (#177에서 움직이지 않음) |
| `apps/v4/registry/styles` 마지막 변경 | **`5c8f5b06746a`** (2026-08-18T05:50Z) |
| `apps/v4/registry/config.ts` 마지막 변경 | **`2b89d67e19ce`** (2026-07-17T15:20Z) |
| `apps/v4/registry/bases/base/ui` 마지막 변경 | `503a3a57aec9` (2026-08-31T09:43Z) |
| 확정한 정본 갈래 | **`base-nova`** |
| 갈래 CSS 선택자 합집합 | 425 (nova 422, lyra 416) |
| 여덟이 전부 같은 선언 | 111 (26%) |
| lyra ↔ nova 일치 | 214 (50%) |
| 우리 계약과 nova가 어긋난 자리 | **2**(`ProgressValue`·`InputGroupText` — 둘 다 lyra 인용) |
| 기록이 소스와 어긋난 자리 | **3**(§5.1 ②-8의 층 귀속, `field.tsx` `limits`의 `FieldTitle` 값, #164의 근거 문장) |

**다음 재조회는 `5c8f5b06746a`와 `2b89d67e19ce` 둘에서 `git log` 한 번으로 이 문서의 유효성을 판정한다** — 전자가 움직이면 값이, 후자가 움직이면 정본 갈래가 다시 걸린다.
