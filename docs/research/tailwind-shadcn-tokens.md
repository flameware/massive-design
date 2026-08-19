# Tailwind v4 `@theme` 규약과 shadcn 토큰 변수 조사

- 티켓: [#5](https://github.com/flameware/massive-design/issues/5) (map: [#1](https://github.com/flameware/massive-design/issues/1))
- 조사일: 2026-08-19
- 검증 환경: `tailwindcss@4.3.3` (npm latest), `@tailwindcss/cli` 로 실제 빌드해서 산출 CSS를 확인함
- shadcn 소스 기준: `shadcn-ui/ui` `main` 브랜치 (2026-08 시점)

> 이 문서의 결론 중 "검증됨"이라고 표시한 것은 실제로 Tailwind v4 CLI를 돌려 산출 CSS를 눈으로 확인한 것이다.
> 문서에만 있고 4.3.3에서 재현되지 않은 것은 그렇게 표시했다.

---

## 0. 세 줄 요약 (결론 먼저)

1. **`--primary: var(--ds-color-bg-brand)` 식 alias는 정상 동작한다. 단 `@theme inline`이 필수다.**
   plain `@theme`을 쓰면 다크모드가 **조용히 깨진다** (루트 토글은 우연히 동작하고, 중첩 `.dark` 서브트리에서만 깨진다 — 최악의 실패 양상).
2. shadcn CLI는 이미 `@theme inline`을 **하드코딩**해서 쓴다 (`upsertThemeNode`가 `params === "inline"`을 찾고 없으면 `@theme inline`으로 생성). 우리가 규약을 새로 발명할 필요 없이 그대로 따르면 된다.
3. shadcn의 원시 변수(`--primary`, `--secondary` …)는 **theme 키(`--color-primary`)와 별개로 반드시 존재해야 한다.** shadcn 스타일 CSS 안에 `color-mix(in oklch, var(--secondary), …)`처럼 raw `var(--원시명)`을 직접 참조하는 곳이 있기 때문. `@theme inline`에 바로 우리 ds 변수를 꽂고 원시 변수를 생략하는 지름길은 **불가**.

---

## 1. Tailwind v4 `@theme` 네임스페이스 표

출처: <https://tailwindcss.com/docs/theme> (Theme variable namespaces) + `node_modules/tailwindcss/theme.css` (4.3.3 실물) + 아래 빌드 검증.

| 네임스페이스 | 생성되는 유틸리티 / 변형 | 4.3.3 빌드 검증 |
|---|---|---|
| `--color-*` | `bg-*`, `text-*`, `border-*`, `fill-*`, `stroke-*`, `ring-*`, `divide-*`, `outline-*`, `accent-*`, `caret-*`, `shadow-*`(색), `from/via/to-*` | ✅ `bg-ds` |
| `--font-*` | `font-sans` 같은 font-family | ✅ `font-ds` |
| `--text-*` | `text-xl` 같은 font-size. `--text-X--line-height` / `--letter-spacing` / `--font-weight` 서브키 동반 가능 | ✅ (아래 §1.1) |
| `--font-weight-*` | `font-bold` 같은 font-weight | ✅ `font-heavy` |
| `--tracking-*` | `tracking-wide` | ✅ |
| `--leading-*` | `leading-tight` | ✅ |
| `--breakpoint-*` | 반응형 변형 `sm:*` | ✅ `ds:flex` → `@media (width >= 900px)` |
| `--container-*` | 컨테이너 쿼리 변형 `@sm:*` **및** `max-w-md` 사이즈 유틸 | ✅ `@ds:flex` + `max-w-ds` |
| `--spacing-*` | `px-4`, `max-h-16`, `gap-*` 등 대부분의 간격/사이즈 | ✅ `p-ds` |
| `--radius-*` | `rounded-sm` | ✅ `rounded-ds` |
| `--shadow-*` | `shadow-md` | ✅ |
| `--inset-shadow-*` | `inset-shadow-xs` | ✅ |
| `--drop-shadow-*` | `drop-shadow-md` | ✅ |
| `--text-shadow-*` | `text-shadow-sm` | ✅ `text-shadow-ds` (docs 표에는 누락, 실물에는 존재) |
| `--blur-*` | `blur-md` | ✅ |
| `--perspective-*` | `perspective-near` | ✅ |
| `--aspect-*` | `aspect-video` | ✅ |
| `--ease-*` | `ease-out` | ✅ |
| `--animate-*` | `animate-spin` | ✅ |
| `--tab-size-*` | docs 표에 `tab-github` 예시로 기재 | ⚠️ 4.3.3에서 재현 실패 (docs가 미출시 버전 선행일 가능성). **의존하지 말 것** |
| `--zoom-*` | docs 표에 `zoom-compact` 예시로 기재 | ⚠️ 동일하게 재현 실패 |

기타 특수 키 (네임스페이스 아님, 단일 값): `--spacing`(기본 간격 단위 0.25rem), `--default-font-family`, `--default-mono-font-family`, `--default-transition-duration`, `--default-ring-width`, `--default-ring-color`.

### 1.1 `--text-*` 서브프로퍼티 (검증됨)

```css
@theme {
  --text-body: 1.125rem;
  --text-body--line-height: 1.6;
  --text-body--letter-spacing: -0.01em;
  --text-body--font-weight: 500;
}
```

산출:

```css
.text-body {
  font-size: var(--text-body);
  line-height: var(--tw-leading, var(--text-body--line-height));
  letter-spacing: var(--tw-tracking, var(--text-body--letter-spacing));
  font-weight: var(--tw-font-weight, var(--text-body--font-weight));
}
```

우리 타이포 semantic 토큰(size+lineHeight+tracking+weight 묶음)을 **한 클래스로** 떨어뜨릴 수 있다는 뜻. Style Dictionary 출력 설계 시 이 문법을 타깃으로 잡을 가치가 있다.

### 1.2 ⚠️ 이름 충돌 함정 (검증됨)

`--color-ds`와 `--text-ds`를 동시에 정의하면 `text-ds` 클래스는 **color로 해석된다** (font-size가 아니라). `text-` 접두사에서 `--color-*`가 `--text-*`를 이긴다.

→ **네이밍 규칙에 반영할 것**: semantic 컬러 이름과 타이포 스케일 이름의 suffix가 겹치면 안 된다. (예: `--color-body`와 `--text-body`를 동시에 쓰지 말 것.)

### 1.3 네임스페이스 리셋

```css
@theme {
  --color-*: initial;   /* 기본 컬러 팔레트 전부 제거, 우리 것만 남김 */
  --color-brand: oklch(...);
}
```

`--*: initial;`이면 전체 기본 테마 삭제. 소스: <https://tailwindcss.com/docs/theme#overriding-the-default-theme>
구현 근거: `packages/tailwindcss/src/theme.ts`의 `add()` — 키가 `-*`로 끝나면 `clearNamespace`, `--*`면 `values.clear()`.

우리 토큰 시스템은 "brand/neutral/danger/success 4패밀리만" 이므로 `--color-*: initial`을 **쓸지 말지가 실제 결정 사항**이다. 단, 끄면 `bg-blue-500` 같은 것도 다 사라지고, shadcn 기본 globals.css의 `--chart-N: var(--color-blue-300)` 같은 참조도 깨진다. → 초기엔 켜두고, lint 규칙으로 막는 편이 안전 (map의 "토큰 lint 규칙" 미결 항목과 연결).

---

## 2. `@theme` vs `@theme inline` — 정확한 차이

### 2.1 Tailwind 공식 설명

> "When defining theme variables that reference other variables, use the `inline` option"
> — <https://tailwindcss.com/docs/theme#referencing-other-variables>

plain `@theme`이면 유틸리티가 **theme 변수 자체**를 참조하고, `inline`이면 **theme 변수의 값**을 인라인한다.

### 2.2 실제 빌드로 확인 (tailwindcss 4.3.3)

입력 (양쪽 동일, `@theme` / `@theme inline`만 다름):

```css
@import "tailwindcss";
@custom-variant dark (&:is(.dark *));

:root {
  --ds-color-bg-brand: oklch(0.55 0.20 265);
  --ds-color-fg-on-brand: oklch(0.98 0 0);
  --ds-radius-md: 0.625rem;
}
.dark {
  --ds-color-bg-brand: oklch(0.72 0.16 265);
  --ds-color-fg-on-brand: oklch(0.20 0 0);
}
:root {
  --primary: var(--ds-color-bg-brand);
  --primary-foreground: var(--ds-color-fg-on-brand);
  --radius: var(--ds-radius-md);
}
@theme inline {          /* ← 여기만 바꿔가며 비교 */
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --radius-md: calc(var(--radius) - 2px);
}
```

마크업: `<div class="bg-primary text-primary-foreground rounded-md border-primary/50">`

**`@theme inline` 산출:**

```css
.rounded-md            { border-radius: calc(var(--radius) - 2px); }
.border-primary\/50    { border-color: var(--primary);
                         @supports (color: color-mix(in lab, red, red)) {
                           border-color: color-mix(in oklab, var(--primary) 50%, transparent); } }
.bg-primary            { background-color: var(--primary); }
.text-primary-foreground { color: var(--primary-foreground); }
```

→ `--color-primary`는 **아예 출력되지 않는다.** 유틸리티가 `var(--primary)`를 직접 들고 있으므로, 변수 치환이 **요소 위치에서** 일어난다. 따라서 `.dark`가 어디에 붙든 그 위치의 `--ds-color-bg-brand`가 잡힌다. ✅

**plain `@theme` 산출:**

```css
@layer theme {
  :root, :host {
    --radius-md: calc(var(--radius) - 2px);
    --color-primary: var(--primary);
    --color-primary-foreground: var(--primary-foreground);
  }
}
...
.bg-primary            { background-color: var(--color-primary); }
.text-primary-foreground { color: var(--color-primary-foreground); }
.rounded-md            { border-radius: var(--radius-md); }
```

→ `--color-primary`가 **`:root, :host`에 고정 emit**된다. `var(--primary)`는 그 `:root` 위치에서 한 번 계산된다.

### 2.3 plain `@theme`의 실패 양상 — 왜 위험한가

CSS custom property는 **선언이 붙은 요소에서 치환**된다. `--color-primary: var(--primary)`가 `:root`에 있으므로 `--primary`는 항상 `:root`(=`<html>`)의 값으로 굳는다.

| 다크모드 방식 | plain `@theme` | `@theme inline` |
|---|---|---|
| `<html class="dark">` — 루트 토글 | 우연히 **동작함** (`:root` == `html`이라 `.dark`가 같은 요소에서 `--primary`를 덮음) | 동작 |
| `<div class="dark">` — 중첩/부분 다크 섹션, 프리뷰 패널, 다크 툴바 | **깨짐** — `--color-primary`가 `:root`에서 이미 라이트 값으로 계산됨 | 동작 |
| 카드/서브트리 단위 테마 스코핑 (`.theme-brand` 등) | **깨짐** | 동작 |

루트 토글에서는 멀쩡히 돌아가다가 컴포넌트 프리뷰나 부분 다크 섹션에서만 터진다. **가장 나쁜 종류의 버그**다. Tailwind 문서도 같은 함정을 `--font-sans: var(--font-inter)` 예시로 설명한다:

> "`var(--font-sans)` is resolved where `--font-sans` is defined *(on `#parent`)*, and `--font-inter` has no value there…"

### 2.4 `@theme inline`의 대가

`--color-primary`가 CSS에 emit되지 않으므로, **손으로 쓴 CSS에서 `var(--color-primary)`를 참조하면 깨진다.** 참조하려면 `var(--primary)`(원시 변수)를 써야 한다.

→ 우리 규약: **`@theme inline`은 "Tailwind에 유틸리티를 만들어달라고 등록하는 곳"일 뿐, 값의 저장소가 아니다.** 값의 저장소는 언제나 `:root` / `.dark`의 `--ds-*`.

### 2.5 다크모드 변수를 `@theme` 안에서 처리할 수 있는가

**아니다.** `@theme`은 셀렉터 스코프를 갖지 않는다 — `:root, :host`에 한 벌만 emit된다. 다크 값은 반드시 별도 `:root` / `.dark` (또는 `[data-theme=dark]`) 블록에 둔다. Tailwind 다크모드 문서도 `@custom-variant`로 *트리거*만 정의하고 값 위치는 다루지 않는다: <https://tailwindcss.com/docs/dark-mode>

권장 트리거 (Tailwind 공식):

```css
@custom-variant dark (&:where(.dark, .dark *));
```

⚠️ shadcn CLI가 실제로 써넣는 것은 이것과 다르다:

```css
@custom-variant dark (&:is(.dark *));
```

(출처: `packages/shadcn/src/utils/updaters/update-css-vars.ts:94` — `addCustomVariant({ params: "dark (&:is(.dark *))" })`)

`&:is(.dark *)`는 **`.dark`가 붙은 요소 자기 자신은 매칭하지 않고 자손만** 매칭한다. `<html class="dark">`이면 body 이하 전부 자손이라 문제없지만, `<div class="dark bg-white dark:bg-black">`처럼 토글 요소 자신에 `dark:` 유틸을 걸면 안 먹는다. **우리 출력물에서는 Tailwind 공식형 `&:where(.dark, .dark *)`을 쓰는 것을 권한다** (`:where`라 명시도 0으로 유지되는 이점도 동일).

---

## 3. shadcn/ui (Tailwind v4 대응) 변수 정본 목록

### 3.1 정본 소스

`apps/v4/registry/themes.ts` — CLI가 `registry:theme` 아이템으로 실제로 주입하는 값.
<https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/themes.ts>

이것이 **정본**이다. 리포 안의 다음 파일들은 정본이 아니니 주의:
- `apps/v4/public/r/themes/*.json`, `apps/v4/public/r/themes.css`, `apps/v4/app/legacy-themes.css` → **v3 시절 HSL 삼중항 레거시** (`"background": "0 0% 100%"`). 검색하면 먼저 걸리는데 옛날 것이다.
- `packages/shadcn/src/utils/templates.ts`의 `TAILWIND_CONFIG_WITH_VARIABLES` → v3용 `tailwind.config.js` 템플릿, `hsl(var(--border))` 방식. 역시 레거시.
- `apps/v4/app/globals.css` → **문서 사이트 전용**. `--surface`, `--code`, `--code-highlight`, `--code-number`, `--selection` 등 docs 전용 변수가 섞여 있다. 우리가 따라 쓸 목록이 아니다.

### 3.2 OKLCH 전환 — 사실이다 ✅

`themes.ts`의 모든 컬러 값이 `oklch(...)` 리터럴이다. shadcn 문서도 "HSL colors are now converted to OKLCH"라고 명시 (<https://ui.shadcn.com/docs/tailwind-v4>).

v3의 `--background: 0 0% 100%` + `hsl(var(--background))` 래핑 패턴은 **폐기**되었다. 이제 변수 값 자체가 완전한 컬러 함수다. → **우리 OKLCH 램프 출력이 shadcn과 정확히 같은 형식**이라는 뜻. 래핑/변환 어댑터가 필요 없다. 좋은 소식.

### 3.3 정본 변수 목록 (총 34개 + `--radius`)

`neutral` 테마 기준. 라이트/다크 값은 예시.

#### 코어 서피스 (2)
| 변수 | light | dark | 컴포넌트 사용 지점 |
|---|---|---|---|
| `--background` | `oklch(1 0 0)` | `oklch(0.145 0 0)` | `body`, 페이지 바탕. `bg-background` |
| `--foreground` | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` | 기본 텍스트. `text-foreground` |

#### 컨테이너 서피스 (4)
| 변수 | light | dark | 사용 지점 |
|---|---|---|---|
| `--card` | `oklch(1 0 0)` | `oklch(0.205 0 0)` | `Card`, `Table` 컨테이너 |
| `--card-foreground` | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` | ↑ 위 텍스트 |
| `--popover` | `oklch(1 0 0)` | `oklch(0.205 0 0)` | `Popover`, `DropdownMenu`, `Select`, `Command`, `Tooltip`, `HoverCard`, `ContextMenu`, `Combobox` |
| `--popover-foreground` | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` | ↑ 위 텍스트 |

#### 인터랙션 롤 (8)
| 변수 | light | dark | 사용 지점 |
|---|---|---|---|
| `--primary` | `oklch(0.205 0 0)` | `oklch(0.922 0 0)` | `Button` default, `Switch` checked, `Checkbox` checked, `Badge` default, `Slider` range, `Progress` indicator, `Link` |
| `--primary-foreground` | `oklch(0.985 0 0)` | `oklch(0.205 0 0)` | ↑ 위 텍스트/아이콘 |
| `--secondary` | `oklch(0.97 0 0)` | `oklch(0.269 0 0)` | `Button` secondary, `Badge` secondary |
| `--secondary-foreground` | `oklch(0.205 0 0)` | `oklch(0.985 0 0)` | ↑ |
| `--muted` | `oklch(0.97 0 0)` | `oklch(0.269 0 0)` | `Skeleton`, `TableHead`, 비활성 서피스 |
| `--muted-foreground` | `oklch(0.556 0 0)` | `oklch(0.708 0 0)` | 보조 텍스트, placeholder, `CardDescription`, 아이콘 |
| `--accent` | `oklch(0.97 0 0)` | `oklch(0.269 0 0)` | **hover/focus 하이라이트** — 메뉴 아이템, `Tabs` 활성, `Calendar` 선택일, `Command` 하이라이트 |
| `--accent-foreground` | `oklch(0.205 0 0)` | `oklch(0.985 0 0)` | ↑ |

> ⚠️ `--accent`는 "브랜드 강조색"이 아니라 **hover 배경**이다. v3부터 흔한 오해. 우리 semantic에서 `bg-interactive-hover` 같은 이름에 매핑해야 한다. 브랜드 강조는 `--primary`.

#### 상태 (1)
| 변수 | light | dark | 사용 지점 |
|---|---|---|---|
| `--destructive` | `oklch(0.577 0.245 27.325)` | `oklch(0.704 0.191 22.216)` | `Button` destructive, `Alert` destructive, form 에러, `AlertDialog` |

> ⚠️ **`--destructive-foreground`는 정본 목록에서 빠졌다.** `themes.ts`에 없고, shadcn 문서의 `@theme inline` 블록에도 `--color-destructive` 다음 바로 `--color-border`가 온다. 현재 Button destructive 변형은 `@apply bg-destructive/10 … text-destructive`처럼 **알파 믹스 + 같은 색 텍스트**로 처리한다 (`apps/v4/registry/styles/style-nova.css`). docs 사이트의 `globals.css`에는 아직 남아 있지만 그건 docs 잔재다.
> → 우리 alias 레이어에서 `--destructive-foreground`를 **넣어도 무해**(아무도 안 읽음)하고, 안 넣어도 된다. 호환 보험으로 넣어두는 쪽을 권한다.
> → `success` / `warning` / `info`는 shadcn 정본에 **아예 없다.** 우리가 4패밀리를 갖는다면 danger→`--destructive`로만 매핑되고 success는 alias 대상이 없다. shadcn 규약 위에 우리가 `--success` 등을 **추가**하고 `@theme inline`에 등록하는 형태가 된다 (shadcn 문서가 권하는 확장 방식과 동일).

#### 보더/폼 (3)
| 변수 | light | dark | 사용 지점 |
|---|---|---|---|
| `--border` | `oklch(0.922 0 0)` | `oklch(1 0 0 / 10%)` | 전역 `* { @apply border-border }`, 모든 구분선 |
| `--input` | `oklch(0.922 0 0)` | `oklch(1 0 0 / 15%)` | `Input`/`Textarea`/`Select` 보더 |
| `--ring` | `oklch(0.708 0 0)` | `oklch(0.556 0 0)` | focus-visible 링 |

> 다크에서 `--border`/`--input`이 **불투명 색이 아니라 알파 화이트**(`oklch(1 0 0 / 10%)`)라는 점 주목. 우리 램프 생성기가 다크 보더를 "neutral 램프의 한 단계"로 매핑하면 shadcn 기본과 시각적으로 달라진다. **알파 기반 보더를 semantic으로 표현할지**가 미결 결정 사항 (map의 "다크모드 semantic 매핑" 항목에 추가할 가치 있음).

#### 차트 (5)
`--chart-1` ~ `--chart-5`. neutral 테마에선 무채색 램프 (`oklch(0.87 0 0)` → `oklch(0.269 0 0)`), 라이트/다크 동일값. `ChartContainer`가 `var(--chart-N)`을 시리즈 색으로 읽는다.

#### 사이드바 (8)
`--sidebar`, `--sidebar-foreground`, `--sidebar-primary`, `--sidebar-primary-foreground`, `--sidebar-accent`, `--sidebar-accent-foreground`, `--sidebar-border`, `--sidebar-ring`.

`Sidebar` 컴포넌트 전용 서브테마. `bg-sidebar text-sidebar-foreground` 형태로 쓰인다.

> `--sidebar-width`, `--sidebar-width-icon`, `--sidebar-width-mobile`은 **테마 변수가 아니다** — `sidebar.tsx`가 `style={{ "--sidebar-width": … }}`로 인라인 주입하는 컴포넌트 로컬 변수. alias 대상 아님.
> (참고: v3 시절 이름은 `--sidebar-background`였고 CLI에 `--color-sidebar-background` → `--color-sidebar` 마이그레이션 코드가 남아 있다.)

#### 기하 (1 + 파생 7)
`--radius: 0.625rem`. CLI가 여기서 7단 스케일을 **곱셈으로** 파생시킨다 (`update-css-vars.ts:432-439`):

```css
--radius-sm:  calc(var(--radius) * 0.6);
--radius-md:  calc(var(--radius) * 0.8);
--radius-lg:  var(--radius);
--radius-xl:  calc(var(--radius) * 1.4);
--radius-2xl: calc(var(--radius) * 1.8);
--radius-3xl: calc(var(--radius) * 2.2);
--radius-4xl: calc(var(--radius) * 2.6);
```

> ⚠️ 예전 shadcn v4 globals.css는 **덧셈** 스케일이었다 (`calc(var(--radius) - 4px)` / `- 2px` / `var(--radius)` / `+ 4px`, 4단). 현재는 **곱셈 7단**. 인터넷의 대부분 예제와 블로그는 옛날 것이다. 우리 radius 토큰은 곱셈 7단에 맞춰야 최신 shadcn 컴포넌트가 의도대로 렌더된다.

### 3.4 `@theme inline` 정본 블록

shadcn CLI가 각 컬러 변수마다 `--color-<name>: var(--<name>)`을 `@theme inline` 노드에 append한다 (`update-css-vars.ts:459-470`). 결과:

```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);
  --radius-sm: calc(var(--radius) * 0.6);
  --radius-md: calc(var(--radius) * 0.8);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) * 1.4);
  --radius-2xl: calc(var(--radius) * 1.8);
  --radius-3xl: calc(var(--radius) * 2.2);
  --radius-4xl: calc(var(--radius) * 2.6);
}
```

`upsertThemeNode` 코드 (`update-css-vars.ts:497-517`)가 `node.name === "theme" && node.params === "inline"`을 찾고, 없으면 `postcss.atRule({ name: "theme", params: "inline" })`로 만든다. **`@theme inline`은 shadcn의 명시적 규약이다.**

### 3.5 shadcn 컴포넌트가 토큰을 읽는 두 경로 (중요)

최신 shadcn(스타일 시스템 도입 후)의 Button은 variant 문자열이 `cn-button-variant-default` 같은 **CSS 클래스명**이고, 실제 스타일은 `apps/v4/registry/styles/style-*.css`에 있다:

```css
.cn-button-variant-default {
  @apply bg-primary text-primary-foreground hover:bg-primary/80;
}
.cn-button-variant-secondary {
  @apply bg-secondary text-secondary-foreground
         hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] …;
}
```

두 경로가 섞여 있다:

1. **유틸리티 경로** — `bg-primary` → `--color-primary` (theme 키) → `@theme inline` 덕에 `var(--primary)`로 인라인.
2. **raw var 경로** — `color-mix(in oklch, var(--secondary), var(--foreground) 5%)` → **`--secondary` 원시 변수를 직접 읽는다.**

→ **결론: 원시 변수(`--primary`, `--secondary`, …)를 `:root`/`.dark`에 반드시 실제로 선언해야 한다.** `@theme inline { --color-secondary: var(--ds-color-bg-secondary) }`만 쓰고 `--secondary`를 생략하면 유틸리티는 되고 `color-mix` 경로는 무너진다. shadcn이 정한 2단 구조(`원시 변수` + `theme 키 alias`)를 그대로 지켜야 한다.

---

## 4. alias 레이어 — 동작하는 매핑 예시 ★

이 티켓의 핵심 산출물. **검증 완료**.

### 4.1 3계층 구조

```
[1] primitive  --ds-palette-brand-600      ← 램프 생성기 산출물
[2] semantic   --ds-color-bg-brand          ← 우리 semantic (라이트/다크 단계 매핑 전환 지점)
[3] alias      --primary: var(--ds-color-bg-brand)   ← shadcn 규약 이름
[4] theme key  @theme inline { --color-primary: var(--primary) }  ← Tailwind 유틸리티 등록
```

CSS 변수 참조는 깊이 제한이 없다. `@theme inline`은 [4]→[3] 한 단계만 인라인하고, [3]→[2]→[1]은 브라우저가 요소 위치에서 런타임 해석한다. 그래서 `.dark`가 어느 노드에 붙어도 정확히 동작한다.

### 4.2 전체 예시 (`tokens.css` — 우리 빌드 산출물)

```css
@import "tailwindcss";

/* Tailwind 공식형 권장. shadcn CLI가 써넣는 &:is(.dark *)는 토글 요소 자신을 놓친다 */
@custom-variant dark (&:where(.dark, .dark *));

/* ───────────── [1] primitive: 램프 생성기 산출물 (한 벌, 모드 무관) ───────────── */
:root {
  --ds-palette-brand-50:  oklch(0.971 0.014 265);
  --ds-palette-brand-100: oklch(0.936 0.032 265);
  --ds-palette-brand-500: oklch(0.623 0.188 265);
  --ds-palette-brand-600: oklch(0.546 0.199 265);
  --ds-palette-brand-700: oklch(0.481 0.176 265);
  --ds-palette-brand-900: oklch(0.334 0.115 265);

  --ds-palette-neutral-0:   oklch(1 0 0);
  --ds-palette-neutral-50:  oklch(0.985 0 0);
  --ds-palette-neutral-100: oklch(0.970 0 0);
  --ds-palette-neutral-200: oklch(0.922 0 0);
  --ds-palette-neutral-500: oklch(0.556 0 0);
  --ds-palette-neutral-700: oklch(0.371 0 0);
  --ds-palette-neutral-800: oklch(0.269 0 0);
  --ds-palette-neutral-900: oklch(0.205 0 0);
  --ds-palette-neutral-950: oklch(0.145 0 0);

  --ds-palette-danger-500: oklch(0.577 0.245 27.3);
  --ds-palette-danger-400: oklch(0.704 0.191 22.2);

  --ds-radius-base: 0.625rem;
}

/* ───────────── [2] semantic: 라이트 = 램프 단계 매핑 ───────────── */
:root {
  --ds-color-bg-canvas:        var(--ds-palette-neutral-0);
  --ds-color-bg-surface:       var(--ds-palette-neutral-0);
  --ds-color-bg-subtle:        var(--ds-palette-neutral-100);
  --ds-color-bg-brand:         var(--ds-palette-brand-600);
  --ds-color-bg-danger:        var(--ds-palette-danger-500);
  --ds-color-bg-interactive-hover: var(--ds-palette-neutral-100);

  --ds-color-fg-default:       var(--ds-palette-neutral-950);
  --ds-color-fg-muted:         var(--ds-palette-neutral-500);
  --ds-color-fg-on-brand:      var(--ds-palette-neutral-50);
  --ds-color-fg-on-subtle:     var(--ds-palette-neutral-900);

  --ds-color-border-default:   var(--ds-palette-neutral-200);
  --ds-color-border-field:     var(--ds-palette-neutral-200);
  --ds-color-border-focus:     var(--ds-palette-brand-500);
}

/* ───────────── [2'] semantic: 다크 = 단계 매핑만 전환 ───────────── */
.dark {
  --ds-color-bg-canvas:        var(--ds-palette-neutral-950);
  --ds-color-bg-surface:       var(--ds-palette-neutral-900);
  --ds-color-bg-subtle:        var(--ds-palette-neutral-800);
  --ds-color-bg-brand:         var(--ds-palette-brand-500);
  --ds-color-bg-danger:        var(--ds-palette-danger-400);
  --ds-color-bg-interactive-hover: var(--ds-palette-neutral-800);

  --ds-color-fg-default:       var(--ds-palette-neutral-50);
  --ds-color-fg-muted:         oklch(0.708 0 0);
  --ds-color-fg-on-brand:      var(--ds-palette-neutral-950);
  --ds-color-fg-on-subtle:     var(--ds-palette-neutral-50);

  /* shadcn 기본은 다크 보더를 알파 화이트로 둔다. 램프 단계로 갈지는 미결 */
  --ds-color-border-default:   oklch(1 0 0 / 10%);
  --ds-color-border-field:     oklch(1 0 0 / 15%);
  --ds-color-border-focus:     var(--ds-palette-brand-500);
}

/* ───────────── [3] shadcn alias 레이어 (얇게, 이름만 바꿔 가리킴) ─────────────
   여기 있는 값은 전부 var() 한 줄. 실제 색은 위 semantic이 소유한다.
   라이트/다크 분기가 이 레이어에는 없다는 점이 핵심 — [2]에서 이미 갈렸다. */
:root {
  --background:               var(--ds-color-bg-canvas);
  --foreground:               var(--ds-color-fg-default);
  --card:                     var(--ds-color-bg-surface);
  --card-foreground:          var(--ds-color-fg-default);
  --popover:                  var(--ds-color-bg-surface);
  --popover-foreground:       var(--ds-color-fg-default);
  --primary:                  var(--ds-color-bg-brand);
  --primary-foreground:       var(--ds-color-fg-on-brand);
  --secondary:                var(--ds-color-bg-subtle);
  --secondary-foreground:     var(--ds-color-fg-on-subtle);
  --muted:                    var(--ds-color-bg-subtle);
  --muted-foreground:         var(--ds-color-fg-muted);
  --accent:                   var(--ds-color-bg-interactive-hover);
  --accent-foreground:        var(--ds-color-fg-on-subtle);
  --destructive:              var(--ds-color-bg-danger);
  --destructive-foreground:   var(--ds-color-fg-on-brand); /* 호환 보험. 현재 shadcn은 안 읽음 */
  --border:                   var(--ds-color-border-default);
  --input:                    var(--ds-color-border-field);
  --ring:                     var(--ds-color-border-focus);
  --radius:                   var(--ds-radius-base);

  --chart-1: var(--ds-palette-brand-100);
  --chart-2: var(--ds-palette-brand-500);
  --chart-3: var(--ds-palette-brand-600);
  --chart-4: var(--ds-palette-brand-700);
  --chart-5: var(--ds-palette-brand-900);

  --sidebar:                        var(--ds-color-bg-surface);
  --sidebar-foreground:             var(--ds-color-fg-default);
  --sidebar-primary:                var(--ds-color-bg-brand);
  --sidebar-primary-foreground:     var(--ds-color-fg-on-brand);
  --sidebar-accent:                 var(--ds-color-bg-interactive-hover);
  --sidebar-accent-foreground:      var(--ds-color-fg-on-subtle);
  --sidebar-border:                 var(--ds-color-border-default);
  --sidebar-ring:                   var(--ds-color-border-focus);
}

/* ───────────── [4] Tailwind 유틸리티 등록. inline 필수 ───────────── */
@theme inline {
  /* shadcn 규약 이름 → 유틸리티 */
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);

  --radius-sm:  calc(var(--radius) * 0.6);
  --radius-md:  calc(var(--radius) * 0.8);
  --radius-lg:  var(--radius);
  --radius-xl:  calc(var(--radius) * 1.4);
  --radius-2xl: calc(var(--radius) * 1.8);
  --radius-3xl: calc(var(--radius) * 2.2);
  --radius-4xl: calc(var(--radius) * 2.6);

  /* 우리 semantic을 직접 쓰는 유틸리티도 같이 등록 가능 (앱 코드가 bg-brand로 쓸 수 있게) */
  --color-brand:            var(--ds-color-bg-brand);
  --color-fg-muted:         var(--ds-color-fg-muted);
  --color-success:          var(--ds-color-bg-success);
  --color-success-foreground: var(--ds-color-fg-on-success);
}

@layer base {
  * { @apply border-border outline-ring/50; }
  body { @apply bg-background text-foreground; }
}
```

### 4.3 왜 동작하는가 — 산출 CSS로 확인 (검증됨)

`bg-primary`가 만들어내는 것:

```css
.bg-primary { background-color: var(--primary); }
```

브라우저가 요소에서 해석하는 체인:
`var(--primary)` → `var(--ds-color-bg-brand)` → (요소 위치 기준 `:root` 또는 `.dark`) → `var(--ds-palette-brand-600 | 500)` → `oklch(...)`.

알파 modifier도 살아 있다 — `border-primary/50`:

```css
.border-primary\/50 {
  border-color: var(--primary);
  @supports (color: color-mix(in lab, red, red)) {
    border-color: color-mix(in oklab, var(--primary) 50%, transparent);
  }
}
```

`color-mix`가 `var()` 체인을 받아 런타임에 해석하므로 `bg-primary/80`, `bg-destructive/10` 같은 shadcn 내부 사용도 전부 정상.

### 4.4 하면 안 되는 것 (안티패턴)

```css
/* ❌ plain @theme — 중첩 .dark에서 조용히 깨짐 */
@theme { --color-primary: var(--primary); }

/* ❌ 원시 변수 생략 — @apply는 되지만 color-mix(in oklch, var(--secondary), …) 경로가 깨짐 */
@theme inline { --color-secondary: var(--ds-color-bg-subtle); }
/* --secondary 선언이 없음 */

/* ❌ @theme 안에서 다크 분기 시도 — @theme은 셀렉터 스코프가 없다 */
@theme inline {
  --color-primary: var(--primary);
  .dark & { --color-primary: ...; }   /* 무의미 */
}

/* ❌ 손으로 쓴 CSS에서 theme 키 참조 — inline이라 emit되지 않음 */
.my-thing { background: var(--color-primary); }  /* 값 없음 */
.my-thing { background: var(--primary); }        /* ✅ 이렇게 */
```

### 4.5 이 구조의 좋은 성질

- alias 레이어([3])에 **라이트/다크 분기가 없다.** 한 벌만 생성하면 된다. 모드 전환은 [2]가 전담 → map의 "다크모드는 semantic에서 단계 매핑만 전환" 결정과 정확히 맞물린다.
- alias 레이어는 순수하게 기계적이다 (shadcn 이름 → 우리 semantic 이름 매핑 테이블 34줄). **Style Dictionary custom format 하나로 생성 가능**하고, 매핑 테이블은 JSON 한 파일로 관리하면 된다.
- shadcn 컴포넌트 파일을 **한 글자도 안 건드린다.**

---

## 5. v3 → v4 마이그레이션 — 토큰 관점 체크리스트

출처: <https://tailwindcss.com/docs/upgrade-guide>

토큰/테마에 직접 영향 있는 것만:

| 변경 | v3 | v4 | 우리 영향 |
|---|---|---|---|
| 진입점 | `@tailwind base/components/utilities;` | `@import "tailwindcss";` | 출력 CSS 헤더 변경 |
| 설정 위치 | `tailwind.config.js` 자동 탐지 | CSS의 `@theme`. JS config는 `@config "…"` 명시 필요 | **`tailwind.config.js`에 컬러를 넣는 출력 타깃은 폐기.** CSS만 낸다 |
| 컬러 표현 | `--background: 0 0% 100%` + `hsl(var(--background))` 래핑 | 변수 값이 완전한 컬러 함수 (`oklch(…)`) | 우리 OKLCH 램프를 **그대로** 출력하면 된다. 래퍼 불필요 |
| 임의값의 CSS 변수 | `bg-[--brand]` | `bg-(--brand)` | 소비처 코드 일괄 치환 필요 |
| `theme()` 함수 | `theme(colors.red.500)` | `var(--color-red-500)` (미디어쿼리에선 `theme(--breakpoint-xl)`) | 우리 문서/예제에서 `theme()` 쓰지 말 것 |
| 기본 보더색 | `gray-200` | `currentColor` | shadcn 기본 globals의 `* { @apply border-border }`가 이를 덮으므로 실질 영향 없음. 다만 우리가 그 줄을 반드시 출력해야 한다 |
| 기본 ring | `3px` / `blue-500` | `1px` / `currentColor` | `--default-ring-width` / `--default-ring-color`로 복원 가능. shadcn v4는 `ring-*`을 명시하므로 대개 무관 |
| shadow/blur/radius 스케일 리네임 | `shadow-sm`→`shadow-xs`, `shadow`→`shadow-sm`, `rounded-sm`→`rounded-xs`, `rounded`→`rounded-sm`, `blur`→`blur-sm`, `drop-shadow`→`drop-shadow-sm` (backdrop 동일) | | **우리 shadow/radius 토큰 이름 확정 시 v4 스케일 기준으로 잡을 것.** v3 이름으로 정하면 즉시 레거시 |
| `corePlugins` / `safelist` / `separator` | 지원 | **제거** | 팔레트 끄기는 `--color-*: initial`로 |
| `container` 설정 | `theme.container.center/padding` | 제거. `@utility container { … }` | 컨테이너 토큰은 `--container-*`로 |
| space/divide 셀렉터 | `> :not([hidden]) ~ :not([hidden])` | `> :not(:last-child)` | 토큰 무관, 소비처 레이아웃 회귀 가능성만 |
| 그리드 임의값 콤마 | `grid-cols-[max-content,auto]` | `grid-cols-[max-content_auto]` | 토큰 무관 |

shadcn 쪽 v4 변경 (<https://ui.shadcn.com/docs/tailwind-v4>):
- HSL → OKLCH
- `@layer base` 안의 변수 정의 → `:root`/`.dark` + `@theme inline`
- `forwardRef` 제거, 타입 조정
- `w-4 h-4` → `size-4`
- 모든 프리미티브에 `data-slot` 속성 추가 (→ **우리가 나중에 스타일 후킹할 때 유용한 안정적 셀렉터**)

---

## 6. map에 반영할 만한 것

1. **`@theme inline`을 규약으로 확정.** 우리 alias 출력은 반드시 `@theme inline`. plain `@theme`은 중첩 다크에서 깨진다 (실측 확인).
2. **shadcn 원시 변수 34개를 전부 출력해야 한다.** theme 키만 내는 지름길 불가 (raw `var()` 참조 경로 존재).
3. **radius 스케일은 곱셈 7단** (`×0.6 / ×0.8 / ×1 / ×1.4 / ×1.8 / ×2.2 / ×2.6`). 인터넷의 덧셈 4단 예제는 옛날 것.
4. **`--destructive-foreground`는 정본에서 빠졌고, `success`/`warning`/`info`는 shadcn에 애초에 없다.** 우리 4패밀리 중 success는 alias 대상이 없으므로 shadcn 규약 *위에 추가*하는 형태가 된다.
5. **`--accent`는 브랜드 강조가 아니라 hover 배경이다.** semantic 어휘 확정 시 이 매핑을 틀리면 UI 전체가 이상해진다.
6. **다크 `--border`/`--input`이 알파 화이트**(`oklch(1 0 0 / 10%)`, `/ 15%`)라는 점. "다크는 램프 단계 전환만"이라는 결정과 충돌한다 — 알파 보더를 semantic으로 허용할지 결정 필요. (map의 "Not yet specified"에 추가 가치 있음)
7. **네임스페이스 이름 충돌**: `--color-X`와 `--text-X`가 동시에 있으면 `text-X`는 color로 해석된다. 네이밍 규칙에 금지 조항 필요.
8. **`--text-*--line-height/--letter-spacing/--font-weight` 서브키 문법**으로 타이포 semantic 묶음을 한 클래스에 담을 수 있다. Style Dictionary 타이포 출력 타깃으로 유력.
9. **`@custom-variant dark`는 Tailwind 공식형 `&:where(.dark, .dark *)`을 쓸 것.** shadcn CLI가 넣는 `&:is(.dark *)`는 토글 요소 자신을 놓친다.
10. **shadcn 소스 탐색 시 함정**: `public/r/themes/*.json`, `public/r/themes.css`, `templates.ts`, `legacy-themes.css`, `apps/v4/app/globals.css`는 전부 정본이 아니다. 정본은 `apps/v4/registry/themes.ts` + `packages/shadcn/src/utils/updaters/update-css-vars.ts`.

---

## 7. 출처

Tailwind CSS (공식 문서 + 소스)
- <https://tailwindcss.com/docs/theme> — 네임스페이스 표, `@theme inline`, `--*: initial`
- <https://tailwindcss.com/docs/dark-mode> — `@custom-variant dark`
- <https://tailwindcss.com/docs/upgrade-guide> — v3→v4 breaking changes
- <https://github.com/tailwindlabs/tailwindcss/blob/main/packages/tailwindcss/src/theme.ts> — `ThemeOptions.INLINE`, `add()`의 `-*: initial` 처리
- `tailwindcss@4.3.3` 의 `theme.css` (실물 기본 테마)

shadcn/ui (소스)
- <https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/themes.ts> — **변수 정본 (OKLCH)**
- <https://github.com/shadcn-ui/ui/blob/main/packages/shadcn/src/utils/updaters/update-css-vars.ts> — `@theme inline` 강제, radius 곱셈 스케일, `dark (&:is(.dark *))`
- <https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/styles/style-nova.css> — variant가 실제로 읽는 토큰 (`@apply bg-primary`, `color-mix(… var(--secondary) …)`)
- <https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/bases/radix/ui/button.tsx> — variant → CSS 클래스 구조
- <https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/bases/radix/ui/sidebar.tsx> — `--sidebar-width` 인라인 주입
- <https://github.com/shadcn-ui/ui/blob/main/packages/shadcn/src/tailwind.css> — CLI가 import시키는 base utilities
- <https://ui.shadcn.com/docs/theming>, <https://ui.shadcn.com/docs/tailwind-v4>

실측
- `tailwindcss@4.3.3` + `@tailwindcss/cli`로 `@theme` / `@theme inline` 두 벌 빌드 후 산출 CSS 비교 (§2.2)
- 21개 네임스페이스 전수 유틸리티 생성 확인 (§1)
