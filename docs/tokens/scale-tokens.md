# 비색상 스케일 토큰

확정: 2026-08-19 · 근거 티켓 [#8](https://github.com/flameware/massive-design/issues/8) · 맵 [#1](https://github.com/flameware/massive-design/issues/1)

입력: [#5](https://github.com/flameware/massive-design/issues/5) Tailwind v4 · shadcn 정본 · [#4](https://github.com/flameware/massive-design/issues/4) Figma API 실측 · [#13](https://github.com/flameware/massive-design/issues/13) 알파·state 전략 · [#9](https://github.com/flameware/massive-design/issues/9) Pretendard

---

## 0. 회계 규칙

색 토큰과 달리 **개수 상한을 두지 않는다.** 색은 어휘를 발명하므로 상한이 규율이었지만, 비색상은 대부분 Tailwind 정본 이름을 그대로 쓰므로 발명이 없다. 대신 다른 규율이 적용된다 — **Tailwind 기본값과 다른 값만 토큰이다.**

**총계**(§7 집계): CSS override **26개** + DTCG·Figma에만 사는 값 **8개** + Figma 전용 space 프리셋 **13개**. **신규 어휘 0개.**

---

## 1. 뿌리 결정 4개

| # | 결정 | 근거 |
|---|---|---|
| 1 | **비색상은 Tailwind 정본 이름으로 직접 `@theme`에 등록한다.** `--ds-*` 미러를 만들지 않는다 | 색에는 shadcn이라는 alias 레이어가 있어 `--ds-*`가 `@theme` 밖에 머물 수 있었다. 비색상엔 그 상대가 없다 — `@theme`에 안 들어가면 유틸리티가 생성되지 않는다. 미러를 두면 `--radius-md: var(--ds-radius-md)`라는 무의미한 한 단계가 전 카테고리에 생긴다 |
| 2 | **수치 스케일은 primitive 단일 계층.** semantic 층 없음 | `space.gutter` / `radius.card`류는 컴포넌트가 있어야 정해진다. 컴포넌트는 이 맵 밖 — 지금 정하면 공상이다 |
| 3 | **소비처가 shadcn이라는 사실이 대체를 금지한다.** `--text-*: initial` / `--spacing` 제거는 선택지가 아니다 | shadcn 컴포넌트는 `px-3` `gap-1.5` `h-9` `text-sm` `text-xs`를 코드에 박아 쓴다. 기본 스케일을 끄면 그 자리에서 깨진다 |
| 4 | **따라서 우리 일은 "새 어휘 추가"가 아니라 "기본값 튜닝"이다** | #8 Q1(a). 결과적으로 실제 override는 **line-height/tracking · radius · shadow 알파 세 곳뿐**이다 |

**#7의 lint 규칙과의 관계**: "`@theme` / `@theme inline` 블록에 `--ds-`로 시작하는 선언이 있으면 에러"는 그대로 유효하다. 비색상이 `--ds-*`를 아예 만들지 않으므로 위반 경로 자체가 없어진다.

---

## 2. Typography

### 2.1 방식

**Tailwind 기본 t-shirt 스케일의 값만 덮는다.** 새 이름 0개. role 어휘(`text-body`, `text-heading-1`)는 만들지 않는다.

결정적 근거: role 어휘를 **추가**하면 `text-sm`이 Tailwind 기본 line-height(1.25rem)로 남는다. 그런데 버튼·라벨·테이블·인풋 등 화면 면적의 대부분은 shadcn 컴포넌트 내부이고 거기는 `text-sm`이다. 즉 role 어휘 노선에서는 **한국어 line-height 결정이 정작 실제 화면 대부분에 닿지 않는다.** 값 override만이 shadcn 내부까지 미친다.

role 어휘를 영영 안 만든다는 뜻은 아니다 — **컴포넌트 맵으로 미룬다**(#12 인계).

### 2.2 사이즈 사다리

우리가 고른 사다리가 Tailwind v4 기본과 **정확히 일치한다**. 따라서 `--text-*`(사이즈) 자체는 **한 개도 덮지 않는다.**

| 이름 | px | rem | 비고 |
|---|---|---|---|
| `xs` | 12 | 0.75 | 캡션, 배지 |
| `sm` | 14 | 0.875 | **shadcn 기본 본문** — 버튼·인풋·테이블 |
| `base` | 16 | 1 | 문서 본문 |
| `lg` | 18 | 1.125 | 강조 본문 |
| `xl` | 20 | 1.25 | 소제목 |
| `2xl` | 24 | 1.5 | |
| `3xl` | 30 | 1.875 | |
| `4xl` | 36 | 2.25 | |
| `5xl` | 48 | 3 | |

`6xl` 이상(60px~)은 기본값을 그대로 두고 서브키도 덮지 않는다 — 소비처에 쓸 자리가 없다.

### 2.3 line-height / letter-spacing (실제 override)

크기가 커질수록 시각적 밀도가 높아지므로 3단 tier로 나눈다.

| tier | 단계 | line-height | letter-spacing | 근거 |
|---|---|---|---|---|
| 본문 | `xs` `sm` `base` `lg` | **1.6** | 0 | 한국어는 라틴보다 글자 밀도가 높고 받침으로 세로 공간을 더 쓴다. Tailwind 기본(sm=1.43, base=1.5)은 라틴 기준이라 국문에서 답답하다. 본문 tracking을 음수로 주면 한글이 뭉친다 |
| 중간 | `xl` `2xl` | **1.4** | **-0.01em** | |
| 제목 | `3xl` `4xl` `5xl` | **1.25** | **-0.02em** | 큰 글자는 자간이 과해 보이므로 조인다 |

```css
@theme {
  --text-xs--line-height: 1.6;
  --text-sm--line-height: 1.6;
  --text-base--line-height: 1.6;
  --text-lg--line-height: 1.6;
  --text-xl--line-height: 1.4;   --text-xl--letter-spacing: -0.01em;
  --text-2xl--line-height: 1.4;  --text-2xl--letter-spacing: -0.01em;
  --text-3xl--line-height: 1.25; --text-3xl--letter-spacing: -0.02em;
  --text-4xl--line-height: 1.25; --text-4xl--letter-spacing: -0.02em;
  --text-5xl--line-height: 1.25; --text-5xl--letter-spacing: -0.02em;
}
```

line-height는 **무단위 비율**로 쓴다. px로 못박으면 Figma PERCENT 변환에서 반올림 차이가 생긴다(§2.5).

### 2.4 `--text-*--font-weight` 서브키는 쓰지 않는다

문법은 존재하지만(검증됨) 설정하지 않는다. `--text-3xl--font-weight: 700`을 두면 **크기 이름이 굵기를 함의**하게 되어 t-shirt 스케일이 몰래 role 어휘가 된다. 뿌리 결정 4와 충돌한다.

굵기는 `--font-weight-*` 기본값(`normal` 400 / `medium` 500 / `semibold` 600 / `bold` 700)을 그대로 쓴다. **신규 토큰 0개.** Pretendard가 실제로 지원하는 웨이트이고 shadcn이 이미 이 넷만 쓴다.

### 2.5 Figma Text Style

`fontSize` / `lineHeight` / `fontFamily`는 Variable 바인딩이 된다(#4 실측). 따라서 **변수가 원본, Text Style은 껍데기** 구조로 간다.

- 스타일 이름 = t-shirt 이름(`xs` … `5xl`). 9개.
- `lineHeight`는 **`{unit:'PERCENT', value: 160|140|125}`**. PIXELS로 쓰면 12×1.6=19.2 같은 값에서 반올림이 생겨 코드와 갈린다. PERCENT는 CSS 무단위 비율과 무손실 대응한다.
- `letterSpacing`도 `{unit:'PERCENT', value: -1|-2}`. 맨 숫자를 넣으면 throw(#4).
- `fontFamily`는 **STRING 변수 바인딩**(#9). 로컬 폰트를 못 보는 실행 컨텍스트를 우회하는 유일한 경로다.
- 주입 순서: 텍스트를 다 쓴 뒤 마지막에 바인딩(#9 제약).

FLOAT 변수: `type/size/{xs..5xl}` 9개 + `type/line-height/{body,mid,heading}` 3개. STRING 변수: `type/family/sans` 1개.

---

## 3. Space / Size

### 3.1 코드: 배수 단일 변수

```css
@theme { --spacing: 0.25rem; }   /* Tailwind 기본과 동일 = 실질 무변경 */
```

이름 붙은 `--spacing-*` 단계는 **0개**. `p-4` `gap-1.5` `h-9` `size-4`가 전부 동적 생성된다. 4px 기반, 2px는 `p-0.5`로 커버된다.

**아이콘 등 size 스케일도 별도로 두지 않는다** — `size-4`(16px)가 `--spacing` 배수로 이미 나온다.

### 3.2 Figma: 프리셋 13개

Figma는 동적 생성이 없어 FLOAT 변수를 열거해야 간격 피커에 뜬다.

| 변수 | px | | 변수 | px |
|---|---|---|---|---|
| `space/0` | 0 | | `space/6` | 24 |
| `space/1` | 4 | | `space/8` | 32 |
| `space/2` | 8 | | `space/10` | 40 |
| `space/3` | 12 | | `space/12` | 48 |
| `space/4` | 16 | | `space/16` | 64 |
| `space/5` | 20 | | `space/20` | 80 |
| | | | `space/24` | 96 |

이름은 px가 아니라 **배수**다 — `space/4`가 코드의 `p-4`와 1:1로 읽힌다.

> **이 목록의 성격은 "Figma 편의용 프리셋"이지 파리티가 아니다.** 코드는 이 목록 밖 배수도 자유롭게 쓴다(shadcn이 `gap-1.5`를 쓰므로 강제할 수 없다). 한쪽만 안내되는 비대칭을 의도적으로 수용한다.
>
> **이 결정이 틀렸다는 신호**: #10 주입 왕복에서 "피커에 없는 값을 계속 손으로 친다"가 나오는 것. 그때 목록을 늘린다.

`scopes`는 `GAP, WIDTH_HEIGHT`로 한정한다 — `ALL_SCOPES`는 모든 피커를 오염시킨다(#4).

---

## 4. Radius

`--radius: 0.625rem`(10px) 유지. shadcn CLI가 여기서 **곱셈 7단**을 파생시킨다(덧셈 4단은 낡은 정보 — #5).

**7단을 빌드 시점에 선계산해 확정 값으로 출력한다.** `calc`로 남기지 않는 이유: Figma Variable은 숫자만 받으므로 계산은 어차피 어딘가에서 확정돼야 하고, 그 지점을 빌드로 당기면 코드와 Figma가 같은 값을 본다.

| 토큰 | 배수 | px | rem |
|---|---|---|---|
| `--radius-sm` | ×0.6 | 6 | 0.375 |
| `--radius-md` | ×0.8 | 8 | 0.5 |
| `--radius-lg` | ×1.0 | 10 | 0.625 |
| `--radius-xl` | ×1.4 | 14 | 0.875 |
| `--radius-2xl` | ×1.8 | 18 | 1.125 |
| `--radius-3xl` | ×2.2 | 22 | 1.375 |
| `--radius-4xl` | ×2.6 | 26 | 1.625 |

`--radius: 0.625rem`은 shadcn 호환을 위해 그대로 출력한다(컴포넌트가 참조). `--radius-xs`(2px) / `--radius-none` / `--radius-full`은 Tailwind 기본을 덮지 않는다.

7단 전부를 우리가 쓰진 않지만 **전부 존재해야 한다** — shadcn 컴포넌트가 `rounded-2xl` 등을 직접 참조한다.

Figma FLOAT 변수 `radius/{sm..4xl}` 7개, `scopes: CORNER_RADIUS`.

---

## 5. Shadow

### 5.1 값

Tailwind v4의 **기하(offset/blur/spread)는 그대로 두고 알파만 우리 사다리로 덮는다.** 5단, v4 이름 기준(v3 이름으로 정하면 즉시 레거시 — #5).

| 토큰 | 알파 | 값 |
|---|---|---|
| `--shadow-xs` | 0.05 | `0 1px 2px 0 rgb(0 0 0 / .05)` |
| `--shadow-sm` | 0.08 | `0 1px 3px 0 rgb(0 0 0 / .08), 0 1px 2px -1px rgb(0 0 0 / .08)` |
| `--shadow-md` | 0.10 | `0 4px 6px -1px rgb(0 0 0 / .10), 0 2px 4px -2px rgb(0 0 0 / .10)` |
| `--shadow-lg` | 0.12 | `0 10px 15px -3px rgb(0 0 0 / .12), 0 4px 6px -4px rgb(0 0 0 / .12)` |
| `--shadow-xl` | 0.16 | `0 20px 25px -5px rgb(0 0 0 / .16), 0 8px 10px -6px rgb(0 0 0 / .16)` |

그림자 알파는 `alpha.*` primitive 3개에 포함되지 않았으므로 **shadow 카테고리가 자체 값으로 갖는다**(#13 인계 사항 처리 완료).

`--inset-shadow-*` / `--drop-shadow-*` / `--text-shadow-*`는 정의하지 않는다 — 소비처에 쓸 자리가 없다.

### 5.2 다크모드: 한 벌 유지

**라이트/다크 동일 값.** 다크에서 그림자를 바꾸거나 없애지 않는다.

근거: Figma에서 shadow는 Effect Style이라 **Variable이 아니고 모드 전환이 안 된다**(#4 확정). 두 벌을 만들면 Figma에 `Shadow/md`와 `Shadow/md Dark`가 나란히 서고 어느 쪽이 정본인지 규약이 필요해진다.

> ⚠️ **인계(#12)**: 이건 "다크에서 elevation을 그림자가 아니라 border로 표현한다"는 **시각 언어의 결정**이다. #13이 연 다크 border 알파 예외(`border.field` 등)가 여기서 **elevation 시스템의 절반을 떠맡는다.** 컴포넌트 맵이 이 사실을 알고 있어야 한다 — 다크 카드/팝오버를 그림자로 띄우려 하면 안 된다.

### 5.3 Figma Effect Style

5개. **그림자 색은 변수화하지 않고 리터럴 RGBA로 둔다.** 단계마다 알파가 다르므로 변수화하면 색 primitive가 5개 늘어나는데, 그 5개는 그림자 밖에서 쓰일 일이 없다. #4 샘플이 `color/neutral/900`에 바인딩한 것은 프로브였을 뿐 설계가 아니다.

`sm`~`xl`은 DROP_SHADOW 레이어 2장짜리 스타일이다. `effects`는 read-only 배열이므로 통째로 재할당한다(#4).

---

## 6. 나머지 카테고리

| 카테고리 | 개수 | 값 | 근거 |
|---|---|---|---|
| **border-width** | 2 | `1px`, `2px` | Tailwind v4에서 border-width는 `@theme` 네임스페이스가 **아니다**(`border-2`는 정적 유틸). 따라서 이 둘은 **DTCG + Figma에만 존재**하고 CSS 출력은 없다. 4px는 실사용이 없다 |
| **opacity** | 3 | `state.hover .08` / `state.pressed .12` / `state.disabled .5` | #13에서 확정된 것뿐. **신규 0개.** 앞의 둘은 M3 실측값, `.5`는 shadcn `disabled:opacity-50`과 일치 |
| **z-index** | **0** | — | 컴포넌트가 없으므로 레이어 순서를 정할 근거가 없다. 소비처의 Radix 포털은 이미 자체 스택 컨텍스트를 갖는다. **컴포넌트 맵으로 인계** |
| **duration** | 3 | `fast 150ms` / `base 200ms` / `slow 300ms` | v4에서 duration 유틸리티는 동적(`duration-150`)이라 space와 같은 구조다 — CSS는 `--default-transition-duration: 150ms` 하나만 쓰고, 세 값은 DTCG + Figma에 산다 |
| **easing** | 2 | `out` = `cubic-bezier(0,0,.2,1)` / `in-out` = `cubic-bezier(.4,0,.2,1)` | **둘 다 Tailwind 기본 `--ease-out`/`--ease-in-out`과 정확히 동일 — override 0개.** 우리가 하는 일은 "이 둘만 승인한다"는 문서화뿐. `ease-in` 단독은 UI에서 거의 안 쓴다 |
| **size** | 0 | — | `--spacing` 배수가 커버(`size-4`) |
| **breakpoint / container** | 0 | — | 소비처 하나가 정해지기 전엔 공상. Tailwind 기본 사용 |

---

## 7. 집계: 실제로 무엇이 바뀌는가

**Tailwind 기본값과 다른 것만 세면:**

| 항목 | 개수 |
|---|---|
| `--text-*--line-height` | 9 |
| `--text-*--letter-spacing` | 5 |
| `--radius-*` (base 제외 7단, 값은 shadcn 공식과 동일하나 `calc`→확정값) | 7 |
| `--shadow-*` (알파만 변경) | 5 |
| **CSS override 합계** | **26** |

**CSS에 나가지 않고 DTCG + Figma에만 사는 값**: border-width 2 + duration 3 + opacity 3 = 8

**Figma 전용 프리셋**: space 13

**신규 어휘**: **0개.** 이름은 전부 Tailwind 정본이다.

---

## 8. 검산

- **네임스페이스 충돌 없음.** `--color-X`와 `--text-X`가 겹치면 `text-X`가 color로 해석되는 함정(#5)이 있는데, 우리 색 토큰은 `@theme`에 shadcn 이름으로만 들어가고(`--color-primary` 등) 타이포는 t-shirt 이름(`--text-sm`)이라 교집합이 없다.
- **`@theme inline` 유지.** 비색상 override는 다른 변수를 참조하지 않는 리터럴이므로 plain `@theme`에 두어도 되지만, shadcn 색 블록과 분리하면 블록이 둘로 늘어난다. **색·비색상 모두 `@theme inline` 한 블록**에 둔다.
- **shadcn 무손상.** `text-sm` `px-3` `gap-1.5` `h-9` `rounded-md` `shadow-xs` 전부 살아 있고, 값만 우리 것으로 해석된다.
- **Figma ↔ 코드 대응**: 타이포 9 스타일 / radius 7 / shadow 5는 1:1. space 13은 의도적 부분집합(§3.2).
