# 공개 디자인 시스템의 토큰 계층·네이밍 비교 조사

- 티켓: [#2](https://github.com/flameware/massive-design/issues/2) (맵 [#1](https://github.com/flameware/massive-design/issues/1))
- 조사일: 2026-08-19
- 조사 대상: Material 3, Radix Colors / Radix Themes, GitHub Primer Primitives, Shopify Polaris
- 범위: 토큰 **계층 구조·어휘·네이밍**만. 컴포넌트 API 규약은 범위 밖.
- 출처 원칙: 블로그가 아니라 **각 시스템이 실제로 배포하는 토큰 소스 파일**을 직접 읽었다. 인용한 파일 경로를 그대로 남긴다.

---

## 0. 한 줄 결론

네 시스템 모두 **primitive(원시 값) → semantic(역할) 참조 방향은 단방향**이고, 차이는 (a) semantic 위에 component 계층을 두는가, (b) semantic 이름을 **속성 접두사(bg/fg/border)** 로 구성하는가 **역할 쌍(primary/on-primary)** 으로 구성하는가, (c) 상태(hover/pressed)를 토큰 이름에 넣는가 두 가지 축으로 갈린다.

우리(2계층 + Tailwind v4 + shadcn)에게 가장 이식성이 높은 건 **Primer의 `bgColor / fgColor / borderColor` 속성 접두사 + Radix의 "역할별 단계 의미" 사고방식**의 조합이다. Polaris식 상태 폭발(`-hover`/`-active`를 모든 토큰에 곱하기)과 M3식 `on-*` 쌍은 각각 부분 채택만 권한다.

---

## 1. 시스템별 조사

### 1.1 Material 3 (M3)

**출처(1차)**: `material-components/material-web` 리포의 생성된 토큰 소스.
- <https://github.com/material-components/material-web/tree/main/tokens>
- `tokens/_md-ref-palette.scss`, `tokens/_md-sys-color.scss`, `tokens/_md-sys-shape.scss`, `tokens/_md-sys-typescale.scss`, `tokens/versions/v0_192/_md-sys-state.scss`, `tokens/versions/v0_192/_md-comp-filled-button.scss`
- (m3.material.io 문서 페이지는 JS 렌더라 정적 fetch가 비어서 나온다. 그래서 스펙 대신 **생성된 토큰 파일 자체**를 근거로 삼았다.)

**계층: 3단계 — `md.ref` → `md.sys` → `md.comp`**

| 계층 | 예시 | 참조 규칙 |
|---|---|---|
| reference (`md-ref-palette`) | `primary40`, `neutral6`, `neutral98`, `neutral-variant50`, `error80` | 값만 가진다. 아무것도 참조하지 않음 |
| system (`md-sys-color/shape/typescale/state/elevation`) | `primary`, `surface`, `on-surface`, `outline` | ref만 참조 |
| component (`md-comp-*`) | `filled-button.container-color` | **sys만 참조**. `_md-comp-filled-button.scss`의 모든 값이 `map.get($deps, 'md-sys-color', 'primary')` 형태다 |

ref 팔레트의 단계 이름은 **톤 값 그 자체**다(`primary0`~`primary100`, neutral은 `neutral4/6/12/17/22/24/87/92/94/96` 같은 중간 톤까지 추가). 즉 primitive 단계는 "순서 번호"가 아니라 "L\* 톤 수치"에 가깝다.

**semantic(sys) 컬러 어휘** — `tokens/_md-sys-color.scss`의 `$supported-tokens`에 정확히 49개가 열거돼 있다:

```
background, error, error-container, inverse-on-surface, inverse-primary, inverse-surface,
on-background, on-error, on-error-container, on-primary, on-primary-container,
on-primary-fixed, on-primary-fixed-variant, on-secondary, on-secondary-container,
on-secondary-fixed, on-secondary-fixed-variant, on-surface, on-surface-variant,
on-tertiary, on-tertiary-container, on-tertiary-fixed, on-tertiary-fixed-variant,
outline, outline-variant, primary, primary-container, primary-fixed, primary-fixed-dim,
scrim, secondary, secondary-container, secondary-fixed, secondary-fixed-dim, shadow,
surface, surface-bright, surface-container, surface-container-high,
surface-container-highest, surface-container-low, surface-container-lowest,
surface-dim, surface-tint, surface-variant, tertiary, tertiary-container,
tertiary-fixed, tertiary-fixed-dim
```

구성 원리는 두 가지다.
1. **`X` / `on-X` 쌍** — 채움색과 그 위에 올라가는 전경색을 항상 짝으로 정의한다. shadcn의 `primary` / `primary-foreground`가 이 계보다.
2. **surface 고도 사다리** — `surface-container-lowest → low → (container) → high → highest`. 배경 위계를 5단계로 명시적으로 이름 붙인다.

`bg`/`text`/`border` 같은 **속성 접두사가 없다**. 대신 `outline`(=border), `on-surface`(=text)처럼 역할어로 속성을 암시한다.

**다크모드**: `_md-sys-color.scss`가 `values-light()`와 `values-dark()` 두 함수를 노출한다. **sys 토큰 이름은 완전히 동일**하고 ref 팔레트의 **톤 번호만 바뀐다**. `tokens/versions/v0_192/_md-sys-color.scss`에서 직접 확인:

| sys 토큰 | light | dark |
|---|---|---|
| `background` | `neutral98` | `neutral6` |
| `surface` | `neutral98` | `neutral6` |
| `surface-container` | `neutral94` | `neutral12` |
| `on-surface` | `neutral10` | `neutral90` |
| `primary` | `primary40` | `primary80` |
| `on-primary` | `primary100` | `primary20` |
| `outline` | `neutral-variant50` | `neutral-variant60` |

→ **맵 #1에 이미 적힌 "primitive 램프는 한 벌, semantic에서 단계 매핑만 전환" 결정과 정확히 같은 모델이다.** M3가 그 방식의 가장 순수한 사례다.

**색 이외 스케일 명명**
- shape: **t-shirt형** — `corner-none / extra-small / small / medium / large / extra-large / full` + 방향 변형(`corner-large-top`, `corner-large-start/end`).
- typescale: **역할 + 크기 복합형** — `display|headline|title|body|label` × `large|medium|small`, 각각 `-font / -size / -weight / -line-height / -tracking` 하위 속성. 즉 텍스트는 낱개 값이 아니라 **composite 스타일**로 이름 붙인다.
- elevation: `level0`~`level5` **숫자형**.
- spacing 토큰은 sys 계층에 아예 없다(컴포넌트가 하드코딩 px).

**색상명 사용 여부**: sys 계층에는 `blue`/`red`가 전혀 없다. ref 계층에도 없다 — `primary/secondary/tertiary/neutral/neutral-variant/error`라는 **역할명이 이미 ref 단계부터 쓰인다**(M3의 특징. Radix와 정반대).

**상태를 이름에 넣는가**: 색 토큰에는 **넣지 않는다**. 대신 `md-sys-state`에 **불투명도만** 둔다 — `hover-state-layer-opacity: 0.08`, `focus-state-layer-opacity: 0.12`, `pressed-state-layer-opacity: 0.12`, `dragged-state-layer-opacity: 0.16`. 상태는 "색 위에 state layer를 얹는다"는 **메커니즘**으로 처리되지, 상태별 색 토큰을 만들지 않는다. (단 comp 계층에는 `focus-container-elevation`, `disabled-label-text-opacity` 처럼 상태가 이름에 들어간다.)

---

### 1.2 Radix Colors / Radix Themes

**출처(1차)**
- 스케일 의미: <https://www.radix-ui.com/colors/docs/palette-composition/understanding-the-scale>
- 별칭 가이드: <https://www.radix-ui.com/colors/docs/overview/aliasing>
- 토큰 소스: <https://github.com/radix-ui/themes/tree/main/packages/radix-ui-themes/src/styles/tokens> (`color.css`, `space.css`, `radius.css`, `shadow.css`, `typography.css`, `colors/*.css`)

**계층: 사실상 2계층 + 얇은 테마 별칭**

| 계층 | 예시 | 비고 |
|---|---|---|
| primitive (Radix Colors) | `--blue-1` … `--blue-12`, 알파 `--blue-a1` … `--blue-a12` | `tokens/colors/{amber,blue,gray,…}.css`. **파일 이름부터 색상명** |
| semantic 별칭 (Radix Themes) | `--accent-1`…`--accent-12`, `--gray-1`…`--gray-12` | 선택한 색상 스케일을 `accent`/`gray`로 재바인딩 |
| 역할 토큰 | `--color-background`, `--color-surface`, `--color-panel-solid`, `--color-panel-translucent`, `--color-overlay`, `--color-transparent`, `--accent-contrast`, `--accent-surface`, `--accent-indicator`, `--accent-track`, `--gray-contrast/surface/indicator/track`, `--focus-1`…`--focus-12` | `tokens/color.css`에서 확인 |

Radix의 진짜 기여는 **토큰 이름이 아니라 "단계 번호에 역할을 고정한 것"** 이다. 12단계 각각의 의미가 스펙으로 못 박혀 있다:

| 단계 | 역할 |
|---|---|
| 1 | App background |
| 2 | Subtle background |
| 3 | UI element background (rest) |
| 4 | Hovered UI element background |
| 5 | Active / selected UI element background |
| 6 | Subtle border, separator (비인터랙티브) |
| 7 | UI element border, focus ring |
| 8 | Hovered UI element border (강한 테두리) |
| 9 | Solid background (**채도 최고 단계**) |
| 10 | Hovered solid background |
| 11 | Low-contrast text |
| 12 | High-contrast text |

→ **semantic 어휘를 정의할 때 "이 이름은 램프 몇 번을 가리키는가"의 기본값 표를 그대로 빌려올 수 있다.** 우리 램프 단계 수(맵의 "Not yet specified") 결정에도 직접 입력이 된다.

**다크모드**: 토큰 **이름은 동일**하고 `.dark` 스코프에서 `--gray-1`…`--gray-12` 등 **primitive 별칭의 값 자체를 다크 스케일로 갈아끼운다**(`tokens/colors/*.css`가 light/dark 두 벌을 정의). 즉 M3(=semantic이 다른 단계를 가리킴)와 달리 **primitive 이름이 곧 역할이라 단계 번호는 고정되고 값이 바뀐다**. 다크 스케일이 별도로 손튜닝돼 있기 때문에 가능한 방식이다.

> 우리는 램프를 **계산 생성**하기로 이미 정했으므로(맵 #1), Radix식 "다크 램프 별도 한 벌"보다 M3식 "semantic 단계 매핑 전환"이 맞다. 다만 **Radix의 단계별 역할 표는 그 매핑을 짤 때의 기준표**로 쓰인다.

**색 이외 스케일 명명**: 전부 **숫자형**이다 — `--space-1`~`--space-9`, `--radius-1`~`--radius-6`(+`--radius-full`, `--radius-thumb`, `--radius-factor`), `--shadow-1`~`--shadow-6`, `--font-size-1`~`--font-size-9`, `--line-height-1`~`-9`, `--letter-spacing-1`~`-9`. 예외는 `--font-weight-light/regular/medium/bold`(t-shirt 아님, 의미명). 타이포는 낱개 스케일 + `--heading-*`, `--code-*`, `--default-*` 역할 그룹을 따로 둔다.

숫자형의 근거는 명시적이진 않지만 구조에서 읽힌다: `--radius-factor`, `--scaling` 같은 **전역 배율 변수**로 스케일 전체를 늘였다 줄였다 하는 설계라, 단계가 순서 있는 정수여야 한다.

**색상명 사용 여부**: primitive는 **대놓고 색상명**(`blue-9`). Aliasing 문서는 "스케일 이름을 그대로 참조해도 잘 동작한다"고 하면서도, 테마를 다룰 때는 `accent / primary / neutral / brand`, 그리고 `--success-*`(green), `--warning-*`(yellow), `--danger-*`(red), `--info-*`(blue) 같은 **의미 별칭**을 권한다. 반대로 `CardBg`, `Tooltip` 같은 **컴포넌트 이름 별칭은 명시적으로 비권장**하고, 적절한 의미 별칭이 없으면 원래 스케일 이름을 쓰라고 한다.

**상태를 이름에 넣는가**: 안 넣는다. 상태는 **단계 번호로 표현**한다(3=rest, 4=hover, 5=active / 9=solid, 10=solid hover). 예외적으로 Themes의 `--accent-indicator`, `--accent-track`, `--accent-contrast`처럼 용도 역할명은 존재한다.

---

### 1.3 GitHub Primer Primitives

**출처(1차)**: <https://github.com/primer/primitives/tree/main/src/tokens>
- `src/tokens/base/color/light/light.json5`, `base/size/size.json5`, `base/size/z-index.json5`
- `src/tokens/functional/color/{bgColor,fgColor,borderColor,control,display,selection,syntax,data-vis}.json5`
- `src/tokens/functional/spacing/space.json5`, `functional/size/{radius,border,breakpoints,size,size-coarse,size-fine,viewport,z-index}.json5`
- `src/tokens/component/*.json5` (avatar, button, card, menu, overlay, tooltip … 27개 파일)

**계층: 4단계 — `base` → `functional` → `component` (+ `fallback`)**

| 계층 | 예시 | 참조 규칙 |
|---|---|---|
| `base` | `base.color.neutral.0`, `base.size.2`, `base.color.black` | 원시 값(`{colorSpace:'hsl', components:[…], hex:'#1f2328'}` 형태의 DTCG 색). 단계는 **숫자** |
| `functional` | `bgColor.default`, `fgColor.muted`, `borderColor.emphasis`, `space.md` | base만 참조. `$value: '{base.color.neutral.0}'` |
| `component` | `button.*`, `overlay.*`, `tooltip.*` | functional 참조 |
| `fallback` | — | 브라우저 폴백용 |

DTCG JSON5로 쓰고 `$value/$type/$description/$extensions`를 쓴다. **우리가 DTCG JSON을 source of truth로 잡은 것과 같은 포맷이다.** `$extensions`에 벤더 네임스페이스를 3종 둔다:
- `org.primer.figma` — `collection`(Figma 변수 컬렉션), `scopes`(`['bgColor','borderColor']` 같은 Figma 변수 스코프), `group: 'semantic'`, `codeSyntax.web`
- `org.primer.overrides` — 모드별 오버라이드(아래 다크모드 항목)
- `org.primer.llm` — `usage: ['page-background','card-background']`, `rules: 'Do NOT use for emphasis…'` — **에이전트가 토큰을 오용하지 않게 하려는 필드**. 최근에 들어간 것으로 보이고, 우리 리포에도 그대로 베낄 만하다.

**semantic(functional) 컬러 어휘** — 실제 `$value`가 있는 토큰 경로를 세면 `bgColor` 26개, `fgColor` 19개, `borderColor` 22개 + `control.*` 계열이 별도다.

- `bgColor`: `default, muted, inset, emphasis, inverse, disabled, transparent, white, black` + **의미 패밀리 × {muted, emphasis}**: `neutral, accent, success, attention, severe, danger, done, upsell, sponsors, open, closed, draft`
- `fgColor`: `default, muted, onEmphasis, onInverse, disabled, link, white, black` + 패밀리 단일값 `neutral, accent, success, attention, severe, danger, done, upsell, sponsors, open, closed, draft`
- `borderColor`: `default, muted, emphasis, disabled, transparent, translucent` + 패밀리 × {muted, emphasis}

**핵심 패턴 3개**
1. **속성 접두사가 최상위** — `bgColor.* / fgColor.* / borderColor.*`. "이 토큰을 어느 CSS 속성에 쓰는가"가 이름 첫 마디다. Figma `scopes`와 그대로 맞물린다.
2. **강도 어휘가 딱 두 개** — `muted`(연한 배경/테두리) vs `emphasis`(진한 채움). 우리 램프로 치면 soft/solid.
3. **전경 대비 짝** — `fgColor.onEmphasis`, `fgColor.onInverse`. M3의 `on-primary`를 속성 접두사 문법으로 옮긴 형태.

**상태는 별도 네임스페이스로 격리** — `functional/color/control.json5`에 인터랙티브 컨트롤 전용 토큰을 몰아넣고 거기서만 상태를 이름에 쓴다:

```
control.bgColor.{rest, hover, active, selected, disabled}
control.fgColor.{rest, placeholder, disabled}
control.borderColor.{rest, emphasis, selected, disabled, danger, success, warning}
control.checked.{bgColor,borderColor,fgColor}.{rest,hover,active,disabled}
control.transparent.bgColor.{rest,hover,active,selected,disabled}
control.danger.{bgColor,fgColor}.{rest,hover,active}
controlKnob.*, controlTrack.*
```

즉 **일반 semantic 토큰에는 상태가 없고, `control.*`라는 서브그룹에만 `rest/hover/active/selected/disabled`가 붙는다.** Polaris처럼 전 토큰에 상태를 곱하지 않으면서도 상태 토큰을 확보하는 절충안이다. `rest`를 기본 상태의 **명시적 이름**으로 쓰는 것도 눈여겨볼 점.

**다크모드**: 파일 분리가 아니라 **같은 토큰 안의 `$extensions['org.primer.overrides']`** 에 모드별 값을 적는다.

```json5
bgColor: { default: {
  $value: '{base.color.neutral.0}',
  $extensions: { 'org.primer.overrides': {
    dark: '{base.color.neutral.1}',
    'dark-dimmed': '{base.color.neutral.3}',
    'light-high-contrast': '{base.color.neutral.3}',
    'dark-protanopia-deuteranopia-high-contrast': '{base.color.neutral.0}',
  }}
}}
```

base 램프는 light/dark 두 벌(`base/color/light/`, `base/color/dark/`)이 있고, functional 토큰이 **모드별로 어느 base 단계를 가리킬지만 바꾼다**. M3와 같은 모델이되 오버라이드를 토큰 옆에 인라인으로 둔 형태 — **한 파일에서 light/dark 대응을 눈으로 비교할 수 있다는 게 실무적 장점**이다.

**색 이외 스케일 명명 — 계층별로 갈린다(중요)**
- `base` 계층: **숫자형** — `base.size.2`, `base.size.4`, `base.size.8`, `base.color.neutral.0`
- `functional` 계층: **t-shirt형** — `space.xxs(2px) / xs(4px) / sm(8px) / md(12px) / lg / xl …`, `borderRadius.small(3px) / medium(6px) / large(12px) / full(9999px) / default(→medium)`
- 근거는 `$description`에 노골적으로 적혀 있다: `space.sm` = "Default spacing for most UI elements", `space.md` = "Relaxed spacing for breathing room". **숫자는 값, t-shirt는 의도**라는 분업이다.
- `borderRadius.default`처럼 **다른 semantic 토큰을 가리키는 기본값 별칭**을 둔다.

**색상명 사용 여부**: `base` 계층에만 있고(`base.color.neutral.*`, `base.color.blue.*`), functional 이상에서는 전부 역할명(`accent`, `danger`, `success`, `attention`, `severe`, `done`, `upsell`, `sponsors`, `open`, `closed`, `draft`). 뒤쪽 6개는 **GitHub 도메인 어휘**(이슈 open/closed, PR draft, 스폰서)로, "semantic 계층은 제품 도메인을 반영한다"는 좋은 예시다.

---

### 1.4 Shopify Polaris

**출처(1차)**: <https://github.com/Shopify/polaris/tree/main/polaris-tokens/src>
- `src/themes/base/{color,space,border,font,text,shadow,zIndex,height,width,breakpoints,motion}.ts`
- `src/themes/{light,dark,light-high-contrast,light-mobile}.ts`
- `src/size.ts`, `src/colors.ts`

**계층: 2계층 (원시 팔레트 → 토큰) + 테마 부분 오버라이드**

| 계층 | 예시 |
|---|---|
| 원시 팔레트 (`src/colors.ts`) | `colors.gray[1]`…`gray[16]`, `whiteAlpha[…]` — 코드 상수이지 토큰이 아니다 |
| 토큰 (`themes/base/*.ts`) | `color-bg-surface-brand-hover`, `space-100`, `text-heading-lg-font-size` |
| 테마 (`themes/{light,dark,…}.ts`) | base 토큰의 **부분 오버라이드 맵** |

**semantic 컬러 어휘 — 문법이 완전히 규칙적이다**

```
color-<property>[-<layer>][-<role>][-<variant>][-<state>]
```

- property: `bg`, `text`, `border`, `icon`
- layer(배경 전용): `surface`(면) vs `fill`(채움) — **Polaris 고유의 핵심 구분**. `color-bg-surface-*`는 카드/패널 같은 "면", `color-bg-fill-*`는 버튼/뱃지 같은 "칠해진 덩어리"
- role: `brand, info, success, caution, warning, critical, emphasis, magic, inverse, transparent, secondary, tertiary`
- state: `hover, active, selected, disabled`
- 전경 대비: `color-text-brand-on-bg-fill`, `color-text-emphasis-on-bg-fill-hover` — **"어느 배경 위에 얹히는지"를 이름에 명시**(`-on-bg-fill`)

실제 토큰 수는 색만 **200개 이상**이다. `caution`과 `warning`을 둘 다 두고, `magic`(AI 기능), `emphasis`, 아바타 색 7종(`color-avatar-one-bg-fill` … `-seven-`)까지 있다.

→ **상태를 전 토큰에 곱한 결과가 이 규모다.** 우리처럼 소비처 하나짜리 시스템이 따라갈 모델이 아니다. 다만 **문법(속성-레이어-역할-변형-상태 순서)** 자체는 매우 배울 만하다.

**다크모드**: `themes/dark.ts`가 `createMetaThemePartial`로 **base 대비 바뀌는 토큰만** 나열한다. 이름은 동일하고 값(`colors.gray[16]`, `colors.whiteAlpha[9]` 등)만 다르다. light 대비 다크에서 `whiteAlpha`(반투명 흰색)를 hover/active에 많이 쓰는 게 특징 — 다크에서 상태 변화를 **알파 오버레이**로 처리한다.

**색 이외 스케일 명명 — 숫자형, 그것도 "값 파생 숫자"**

`src/size.ts`가 마스터 스케일이고 **키 = px × 25**다:

```
'025': 1px, '050': 2px, '100': 4px, '150': 6px, '200': 8px, '300': 12px,
'400': 16px, '500': 20px, '600': 24px, '800': 32px, '1000': 40px, '1600': 64px, '3200': 128px
```

여기서 `space-*`, `border-radius-*`, `border-width-*`, `font-size-*`, `font-line-height-*`가 전부 파생된다. `shadow-0`~`shadow-600`, `z-index-0`~`z-index-12`도 숫자형.

**예외가 두 군데**: (1) `border-radius-full`, (2) **텍스트 스타일 `text.ts`는 t-shirt형** — `text-heading-{3xl,2xl,xl,lg,md,sm,xs}-*`, `text-body-{lg,md,sm,xs}-*`. 즉 **낱개 값은 숫자, 조합된 타이포 스타일은 t-shirt**. Primer의 base/functional 분업과 결론이 같다.

또 `space-card-gap`, `space-card-padding`, `space-table-cell-padding`, `shadow-button-primary-critical-hover` 같은 **컴포넌트 별칭 토큰이 space/shadow 안에 섞여 있다** — 계층 경계가 새는 부분이고, 우리가 "component 계층 토큰 0개" 규칙을 세운 이유를 반증이 아니라 방증해 준다.

**색상명 사용 여부**: 토큰에는 없다. 원시 `colors.gray[…]`는 TS 상수라 토큰 이름에 노출되지 않는다.

**상태를 이름에 넣는가**: **전면적으로 넣는다.** `-hover / -active / -selected / -disabled`가 대부분의 bg/text/border/icon 토큰에 곱해진다.

---

## 2. 비교표

| 항목 | Material 3 | Radix Colors / Themes | Primer Primitives | Shopify Polaris |
|---|---|---|---|---|
| 계층 수 | 3 (`ref` → `sys` → `comp`) | 2 + 얇은 역할 별칭 | 4 (`base` → `functional` → `component` + `fallback`) | 2 + 테마 부분 오버라이드 |
| 참조 방향 | 엄격 단방향, comp는 sys만 참조 | primitive → 별칭 | 엄격 단방향 | 느슨(별칭 토큰이 스케일에 섞임) |
| semantic 이름 축 | 역할 쌍 `X` / `on-X` | 단계 번호(1–12) + 소수 역할 토큰 | **속성 접두사** `bgColor/fgColor/borderColor` | **속성-레이어-역할-변형-상태** 완전 문법 |
| semantic 컬러 토큰 수 | 49 | 역할 토큰 ~15 + `accent/gray` 12단계 | ~67 (+ `control.*` 별도) | 200+ |
| 강도 어휘 | `container` / base / `on-*` | 단계 3–5(soft) vs 9–10(solid) | `muted` / `emphasis` | `surface`(면) / `fill`(채움) |
| 배경 위계 | `surface-container-lowest→highest` 5단 | 단계 1(app) / 2(subtle) / 3–5(component) | `default / muted / inset / emphasis / inverse` | `bg / bg-surface / -secondary / -tertiary` |
| 다크모드 처리 위치 | **sys 계층에서 ref 톤 매핑 전환** (`values-light/dark`) | primitive 별칭 값 자체를 다크 스케일로 교체 | **functional 토큰의 `$extensions.overrides.dark`** 인라인 | 테마 파일의 부분 오버라이드 맵 |
| 다크 램프 | ref 팔레트 한 벌, 톤만 다르게 선택 | 손튜닝된 다크 스케일 별도 한 벌 | `base/color/light` + `base/color/dark` 두 벌 | `colors.gray` 한 벌 + `whiteAlpha` |
| space 명명 | (없음) | 숫자 `--space-1..9` | base 숫자 → functional **t-shirt** `space.xs/sm/md` | 숫자 `space-100`(=4px, px×25) |
| radius 명명 | t-shirt `corner-small/medium/large/full` | 숫자 `--radius-1..6` + `full` | t-shirt `small/medium/large/full` + `default` 별칭 | 숫자 `border-radius-100` + `full` |
| typography 명명 | 역할×크기 복합 `body-large-size` | 숫자 `--font-size-1..9` + `--heading-*` 그룹 | (base 숫자 + functional 그룹) | 낱개 숫자 `font-size-400` + 스타일 t-shirt `text-heading-lg-*` |
| shadow 명명 | `level0..5` | `--shadow-1..6` | — | `shadow-0..600` + 컴포넌트 별칭 |
| z-index | (없음) | — | `base/size/z-index.json5`, `functional/size/z-index.json5` | `z-index-0..12` |
| 이름에 색상명 | ref/sys 모두 없음(역할명이 ref부터) | **primitive는 색상명 그대로**, 별칭에서 제거 | base에만 있음, functional부터 없음 | 없음 |
| 이름에 상태 | 색 토큰엔 없음. `state-layer-opacity`로 분리 | 없음(단계 번호가 상태) | **`control.*` 서브그룹에만** `rest/hover/active/selected/disabled` | **전면 사용** |
| 특이점 | state layer 불투명도 모델 | 12단계 역할 스펙 | `$extensions['org.primer.llm']` 사용 규칙 필드 | `surface` vs `fill` 구분 |

---

## 3. 우리 결정에 직접 걸리는 함의

1. **다크모드 모델**: M3(`values-light/dark`)와 Primer(`overrides.dark`)가 우리가 맵에서 정한 모델과 동일하다. 둘 중 **표현 형식은 Primer 쪽(토큰 옆 인라인 오버라이드)** 을 권한다 — light/dark 대응을 한 파일에서 diff할 수 있고, Style Dictionary v4에서 `$extensions`로 그대로 통과시킬 수 있다.
2. **속성 접두사 채택**: `bg / fg / border` 접두사는 (a) Figma 변수 `scopes`와 1:1로 붙고, (b) "semantic 이름에 색상명 금지" lint를 쓰기 쉽고, (c) shadcn alias로 내릴 때 매핑이 기계적이다. M3식 `on-X` 쌍은 `fg.on-solid` **하나**만 빌려온다.
3. **상태 토큰**: 전면 곱하기(Polaris)는 금지. Primer식으로 **`control.*` 서브그룹에만** 두거나, 아예 1차에서는 만들지 않고 램프 단계 이동(Radix 3→4→5)으로 처리한 뒤 필요해질 때 추가한다. 후자를 권한다.
4. **강도 어휘는 `soft` / `solid` 2단**을 권한다. Primer의 `muted/emphasis`와 같은 뜻이지만, Radix의 "step 3 soft / step 9 solid" 어휘가 더 널리 통용되고 `bg.muted`(중립 배경)와 `bg.accent.muted`(연한 브랜드 배경)의 의미 충돌을 피할 수 있다.
5. **space/radius 명명**: 네 시스템이 갈리지만 **결론은 "값 스케일은 숫자, 의도 스케일은 t-shirt"** 로 수렴한다. 우리 소비처가 Tailwind v4라는 사실이 결정적이다 — Tailwind v4는 `--spacing` 배수와 `--radius-sm/md/lg/xl`, `--text-sm/base/lg`를 이미 규약으로 갖고 있다. 따라서 **primitive는 숫자(`size.4`), semantic은 Tailwind 규약과 같은 t-shirt**로 두는 게 마찰이 가장 적다.
6. **타이포는 낱개가 아니라 composite**: M3(`body-large-*`)·Polaris(`text-body-md-*`) 둘 다 `font-family/size/weight/line-height/letter-spacing` 5종을 묶은 스타일 단위로 이름을 준다. Figma Text Style로 내보내야 하는 우리에겐 이 형태가 사실상 강제다.
7. **`org.primer.llm` 패턴을 훔칠 것**: 토큰마다 `usage`/`rules`를 `$extensions`에 넣어두면 이 리포를 읽는 에이전트(그리고 미래의 우리)가 토큰을 오용하지 않는다. 비용이 거의 없다.
8. **도메인 어휘 자리를 비워둘 것**: Primer의 `open/closed/draft/sponsors`, Polaris의 `magic`처럼 semantic 계층은 제품 도메인을 반영한다. 소비처가 invest diary라면 나중에 `profit`/`loss` 같은 도메인 색이 붙을 자리가 생긴다 — 단, 지금 만들지는 않는다(맵의 4패밀리 결정 유지).

---

## 4. 우리 semantic 어휘 후보 목록 (30개 이내)

**전제**
- 컬러 패밀리는 `brand / neutral / danger / success` 4개(맵 #1 결정). 아래 목록에서 `accent`는 brand 패밀리를 가리킨다.
- 표기는 DTCG 경로 형태. CSS 변수로는 `--bg-canvas`, `--fg-on-solid` 처럼 평탄화한다.
- **상태(hover/active)는 토큰 이름에 포함하지 않는다.** 필요해지면 아래 30개 중 인터랙티브 서브셋에만 `.hover` / `.active` 수식을 붙이는 별도 규칙으로 확장한다(Primer `control.*` 방식). 1차 어휘에는 넣지 않는다.
- "Radix 단계"는 12단계 기준 권장 출발점이다. 램프 단계 수가 확정되면 재매핑한다.

### bg (14)

| # | 토큰 | 의미 | Radix 단계(기본값 후보) | 유래 |
|---|---|---|---|---|
| 1 | `bg.canvas` | 페이지 최하단 배경 | neutral 1 | Radix `--color-background` / M3 `background` / Primer `bgColor.default` |
| 2 | `bg.surface` | 카드·패널 등 올라온 면 | neutral 2 | Polaris `color-bg-surface` / Radix `--color-panel-solid` / M3 `surface-container-low` |
| 3 | `bg.subtle` | 2차 그룹핑 배경 (테이블 헤더, 사이드바) | neutral 3 | Primer `bgColor.muted` / M3 `surface-container` |
| 4 | `bg.inset` | 파묻힌 영역 (코드블록, 입력 내부) | neutral 2 | Primer `bgColor.inset` |
| 5 | `bg.overlay` | 다이얼로그·팝오버 | neutral 1~2 | Radix `--color-overlay` / M3 `surface-container-high` / Primer `overlay.*` |
| 6 | `bg.neutral.soft` | 중립 뱃지·태그 배경 | neutral 3 | Primer `bgColor.neutral.muted` |
| 7 | `bg.neutral.solid` | 중립 채움 (secondary 버튼) | neutral 9 | Primer `bgColor.neutral.emphasis` / Radix step 9 |
| 8 | `bg.accent.soft` | 연한 브랜드 배경 | brand 3 | Primer `bgColor.accent.muted` / Polaris `color-bg-surface-brand` |
| 9 | `bg.accent.solid` | 브랜드 채움 (primary 버튼) | brand 9 | Radix step 9 / M3 `primary` / Polaris `color-bg-fill-brand` |
| 10 | `bg.danger.soft` | 연한 위험 배경 (에러 배너) | danger 3 | Primer `bgColor.danger.muted` / Polaris `color-bg-surface-critical` |
| 11 | `bg.danger.solid` | 위험 채움 (destructive 버튼) | danger 9 | Primer `bgColor.danger.emphasis` / M3 `error` |
| 12 | `bg.success.soft` | 연한 성공 배경 | success 3 | Primer `bgColor.success.muted` |
| 13 | `bg.success.solid` | 성공 채움 | success 9 | Primer `bgColor.*.emphasis` 패턴 / Polaris `color-bg-fill-success` |
| 14 | `bg.disabled` | 비활성 채움 | neutral 3 | Primer `bgColor.disabled` / Polaris `color-bg-surface-disabled` |

### fg (9)

| # | 토큰 | 의미 | Radix 단계 | 유래 |
|---|---|---|---|---|
| 15 | `fg.default` | 본문 텍스트 | neutral 12 | Primer `fgColor.default` / Radix step 12 / M3 `on-surface` |
| 16 | `fg.muted` | 보조 텍스트 | neutral 11 | Primer `fgColor.muted` / Radix step 11 / Polaris `color-text-secondary` |
| 17 | `fg.subtle` | 플레이스홀더·최약 텍스트 | neutral 10~11 | Primer `control.fgColor.placeholder` / M3 `on-surface-variant` |
| 18 | `fg.on-solid` | `*.solid` 배경 위 전경색 | contrast | M3 `on-primary` / Primer `fgColor.onEmphasis` / Radix `--accent-contrast` / shadcn `*-foreground` |
| 19 | `fg.accent` | 브랜드 텍스트·아이콘 | brand 11 | Primer `fgColor.accent` / Polaris `color-text-brand` |
| 20 | `fg.danger` | 에러 텍스트 | danger 11 | Primer `fgColor.danger` / Polaris `color-text-critical` |
| 21 | `fg.success` | 성공 텍스트 | success 11 | Primer `fgColor.success` |
| 22 | `fg.disabled` | 비활성 텍스트 | neutral 8~9 | Primer `fgColor.disabled` / Polaris `color-text-disabled` |
| 23 | `fg.link` | 링크 | brand 11 | Primer `fgColor.link` / Polaris `color-text-link` |

### border (7)

| # | 토큰 | 의미 | Radix 단계 | 유래 |
|---|---|---|---|---|
| 24 | `border.default` | 기본 구분선·컨테이너 테두리 | neutral 6 | Primer `borderColor.default` / Radix step 6 / M3 `outline-variant` |
| 25 | `border.muted` | 더 옅은 구분선 | neutral 5~6 | Primer `borderColor.muted` / Polaris `color-border-secondary` |
| 26 | `border.strong` | 인터랙티브 요소의 강한 테두리 | neutral 8 | Radix step 8 / Primer `borderColor.emphasis` / M3 `outline` |
| 27 | `border.accent` | 브랜드 테두리 | brand 8 | Primer `borderColor.accent.emphasis` / Polaris `color-border-brand` |
| 28 | `border.danger` | 에러 필드 테두리 | danger 8 | Primer `control.borderColor.danger` / Polaris `color-border-critical` |
| 29 | `border.success` | 유효 필드 테두리 | success 8 | Primer `control.borderColor.success` |
| 30 | `border.focus` | 포커스 링 | brand 8 (또는 `--focus-8`) | Radix `--focus-1..12` / Polaris `color-border-focus` / Primer `focus.json5` |

**합계 30개.**

### shadcn alias 매핑 초안 (참고 — 확정 아님)

우리 semantic이 원본이고 shadcn 이름은 얇은 별칭이라는 맵 결정에 따른 대응. shadcn 변수 목록 출처: <https://ui.shadcn.com/docs/theming>

| shadcn | 우리 |
|---|---|
| `--background` / `--foreground` | `bg.canvas` / `fg.default` |
| `--card` / `--card-foreground` | `bg.surface` / `fg.default` |
| `--popover` / `--popover-foreground` | `bg.overlay` / `fg.default` |
| `--primary` / `--primary-foreground` | `bg.accent.solid` / `fg.on-solid` |
| `--secondary` / `--secondary-foreground` | `bg.neutral.soft` / `fg.default` |
| `--muted` / `--muted-foreground` | `bg.subtle` / `fg.muted` |
| `--accent` / `--accent-foreground` | `bg.accent.soft` / `fg.accent` |
| `--destructive` | `bg.danger.solid` |
| `--border` | `border.default` |
| `--input` | `border.strong` |
| `--ring` | `border.focus` |

주의: shadcn의 `--accent`는 브랜드색이 아니라 "hover 강조 배경"으로 쓰이는 자리라 우리 `bg.accent.soft`와 의미가 미묘하게 어긋난다. `--secondary`/`--accent`가 실제 shadcn 컴포넌트에서 어디에 쓰이는지는 별칭 티켓에서 컴포넌트 소스로 재확인해야 한다.

### 열려 있는 질문 (후속 티켓 입력)

- `bg.surface`와 `bg.subtle`이 실사용에서 구분되는가, 아니면 하나로 합칠 수 있는가 — 램프 단계 수가 정해져야 판단 가능.
- `fg.subtle`을 유지할지(3단 텍스트) `fg.muted`로 합칠지.
- `border.success`는 지금 쓸 데가 없을 수 있다. 4패밀리 대칭성 vs 실사용 사이 선택.
- `bg.inverse` / `fg.on-inverse`(토스트, 툴팁)를 30개 안에 넣을지 — Primer·M3·Polaris 셋 다 갖고 있어서 유력한 31번째 후보다. 넣으려면 `border.success`를 빼는 게 자연스럽다.
- 알파(반투명) 토큰을 둘지. Radix `a1..a12`, Polaris `whiteAlpha`, Primer `borderColor.translucent`가 전부 갖고 있고, **다크모드 hover 표현에 특히 유용**하다. 상태 토큰 결정과 묶어서 판단할 것.
