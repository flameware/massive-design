# semantic 토큰 어휘·네이밍과 shadcn alias 매핑

확정: 2026-08-19 · 근거 티켓 [#7](https://github.com/flameware/massive-design/issues/7) · 맵 [#1](https://github.com/flameware/massive-design/issues/1)

입력: [#2](https://github.com/flameware/massive-design/issues/2) 후보 30개 · [#5](https://github.com/flameware/massive-design/issues/5) shadcn 정본 · [#13](https://github.com/flameware/massive-design/issues/13) 알파 전략 · [#6](https://github.com/flameware/massive-design/issues/6) 램프 4종 확정값

---

## 0. 회계 규칙

- **semantic 색 토큰은 `--ds-*` 계층에서 센다.** shadcn 이름은 기계적으로 파생되는 호환 레이어이므로 카운트 밖이다. 우리가 발명한 어휘가 아니라 소비처가 이미 아는 어휘다.
- 비색상 토큰(`state.*.opacity`)은 색 상한에 포함하지 않는다.
- **현재 목록의 정본은 `packages/tokens/tokens/semantic/color.json`이다.** 총계는 생성물에서 파생되며 `tokens:lint`의 B8과 `test/tokens.test.mjs`가 어휘 상한을 감시한다. 두 겹 포커스 링의 안쪽 대비 경계 역할은 [#54](https://github.com/flameware/massive-design/issues/54)에서 추가됐다.

## 1. 이름 규약

| 층 | 형태 | 예 |
|---|---|---|
| DTCG 경로 | dot-case | `color.bg.accent.solid` |
| CSS 변수 | `--ds-` 접두사, `color.` 세그먼트 탈락, `.`→`-` | `--ds-bg-accent-solid` |
| Figma 변수 | `.`→`/` | `bg/accent/solid` |

**`--ds-*`는 Tailwind `@theme` / `@theme inline` 블록에 절대 들어가지 않는다.** `@theme inline`에 등록되는 건 shadcn이 정한 이름뿐이다. 이 규칙 하나가 맵이 경고한 `--color-X`/`--text-X` 네임스페이스 충돌을 원천 차단한다 — 우리 이름이 Tailwind 네임스페이스에 진입할 경로 자체가 없어진다.

→ **lint 규칙**: `@theme` 또는 `@theme inline` 블록 안에 `--ds-`로 시작하는 선언이 있으면 에러.

## 2. primitive 노출 범위

| 층 | 정책 |
|---|---|
| DTCG JSON에 존재 | ✅ semantic이 alias해야 하므로 필수 |
| CSS에 `--ds-palette-*` 출력 | ✅ devtools 추적용 |
| Tailwind `@theme`에 등록 (`bg-brand-500` 유틸리티) | ❌ **하지 않는다** |

**결과**: 조사 문서 §7.1이 예고한 "Tailwind식 11단 별칭 테이블"이라는 산출물이 **소멸한다.** 12단↔11단 마찰이 발생할 지점이 없다. #6에서 12 vs 11의 실질적 갈림길이라고 지목했던 질문이 여기서 닫힌다.

**#11 영향**: 별칭 테이블이 #11의 범위에서 빠진다.

## 3. 컬렉션·모드 구조

`docs/research/figma-plugin-api.md:114-120, 246`에서 프로브로 확인된 구조를 그대로 쓴다.

```
palette   (컬렉션, 모드 1개)   tokens/primitive/*에서 파생
          brand/light/1..12, brand/dark/1..12, neutral/…, danger/…, success/…, warning/…
          base/white, base/black, alpha/white/10, alpha/white/15, alpha/black/50

semantic  (컬렉션, 모드 2개: Light / Dark)   tokens/semantic/color.json에서 파생
          각 모드가 palette의 해당 변수를 alias
```

primitive를 1모드로 두고 mode-explicit 이름(`brand/dark/9`)을 쓴다. 크로스 컬렉션 alias는 실측으로 동작이 확인됐다.

DTCG에서는 다크 값을 Primer 형식으로 토큰 옆에 인라인한다:

```jsonc
"color.bg.accent.solid": {
  "$value": "{palette.brand.light.9}",
  "$extensions": { "org.primer.overrides": { "dark": "{palette.brand.dark.9}" } }
}
```

## 4. semantic 토큰 목록

`palette.<family>.<mode>.<step>`을 `<family> <step>`으로 줄여 적는다. 대비값은 WCAG 2.

### bg (17)

| # | 토큰 | 의미 | light | dark |
|---|---|---|---|---|
| 1 | `bg.canvas` | 페이지 최하단 배경 | neutral 2 `#f8f8f8` | neutral 1 `#0c0c0c` |
| 2 | `bg.surface` | 카드·패널 등 올라온 면 | neutral 1 `#fdfdfd` | neutral 2 `#151515` |
| 3 | `bg.subtle` | 2차 그룹핑 (테이블 헤더, 사이드바 hover) | neutral 3 `#eeeeee` | neutral 3 `#1e1e1e` |
| 4 | `bg.inset` | 파묻힌 영역 (코드블록, 입력 내부) | neutral 3 `#eeeeee` | neutral 3 `#1e1e1e` |
| 5 | `bg.overlay` | 다이얼로그·팝오버 면 | neutral 1 `#fdfdfd` | neutral 3 `#1e1e1e` |
| 6 | `bg.neutral.soft` | 중립 뱃지·태그 배경 | neutral 3 `#eeeeee` | neutral 3 `#1e1e1e` |
| 7 | `bg.neutral.solid` | 중립 채움 | neutral 9 `#727272` | neutral 9 `#727272` |
| 8 | `bg.accent.soft` | 연한 브랜드 배경 | brand 3 `#eaeef4` | brand 3 `#0d1d3b` [^gen] |
| 9 | `bg.accent.solid` | 브랜드 채움 (primary) | brand 9 `#0f5fed` | brand 9 `#0f5fed` |
| 10 | `bg.danger.soft` | 에러 배너 | danger 3 `#f4eceb` | danger 3 `#341210` |
| 11 | `bg.danger.solid` | destructive 채움 | danger 9 `#db2931` | danger 9 `#db2931` |
| 12 | `bg.success.soft` | 연한 성공 배경 | success 3 `#e0f4e3` | success 3 `#102314` |
| 13 | `bg.success.solid` | 성공 채움 | success 9 `#20823e` | success 9 `#20823e` |
| 14 | `bg.warning.soft` | 연한 경고 배경 | warning 3 `#f4eddf` | warning 3 `#241d0e` |
| 15 | `bg.warning.solid` | 경고 채움 | warning 9 `#eab308` | warning 9 `#eab308` |
| 16 | `bg.inverse` | 토스트·툴팁 반전 면 | neutral 12 `#333333` | neutral 12 `#e8e8e8` |
| 17 | `bg.scrim` | 모달 뒷배경 딤 | `alpha.black.50` | `alpha.black.50` |

### fg (10)

| # | 토큰 | 의미 | light | dark |
|---|---|---|---|---|
| 18 | `fg.default` | 본문 텍스트 | neutral 12 `#333333` | neutral 12 `#e8e8e8` |
| 19 | `fg.muted` | 보조 텍스트·플레이스홀더 | neutral 10 `#616161` | neutral 10 `#8f8f8f` |
| 20 | `fg.on-solid` | neutral/accent/danger/success solid 위 전경 | `base.white` | `base.white` |
| 21 | `fg.on-inverse` | `bg.inverse` 위 전경 | neutral 1 `#fdfdfd` | neutral 1 `#0c0c0c` |
| 22 | `fg.on-warning` | `bg.warning.solid` 위 전경 | `base.black` | `base.black` |
| 23 | `fg.accent` | 브랜드 텍스트·아이콘 | brand 10 `#1553c6` | brand 10 `#5989e2` |
| 24 | `fg.danger` | 에러 텍스트 | danger 10 `#b92429` | danger 10 `#e76760` |
| 25 | `fg.success` | 성공 텍스트 | success 10 `#1c6f35` | success 10 `#569e65` |
| 26 | `fg.warning` | 경고 텍스트 | warning 11 `#665019` | warning 10 `#edc467` |
| 27 | `fg.link` | 링크 | brand 10 `#1553c6` | brand 10 `#5989e2` |

### border (7)

| # | 토큰 | 의미 | light | dark |
|---|---|---|---|---|
| 28 | `border.default` | 구분선·컨테이너 테두리 | neutral 6 `#d2d2d2` | `alpha.white.10` |
| 29 | `border.field` | 폼 필드 테두리 | neutral 7 `#b8b8b8` | `alpha.white.15` |
| 30 | `border.strong` | 인터랙티브 요소의 강한 테두리 | neutral 8 `#8a8a8a` | neutral 8 `#656565` |
| 31 | `border.accent` | 브랜드 테두리 | brand 8 `#4581f1` | brand 8 `#0d55d4` |
| 32 | `border.danger` | 에러 필드 테두리 | danger 8 `#f34c4b` | danger 8 `#c41a26` |
| 33 | `border.focus` | 포커스 링 | brand 8 `#4581f1` | brand 8 `#0d55d4` |
| 34 | `border.focus-contrast` | 포커스 링 안쪽 대비 경계 | neutral 12 `#333333` | neutral 12 `#e8e8e8` |

### 상태 메커니즘 (1)

| # | 토큰 | 의미 | light | dark |
|---|---|---|---|---|
| 35 | `color.state.layer` | 컴포넌트가 `color-mix`로 얹는 상태 레이어 | `base.black` | `base.white` |

현재 총계는 `dist/tokens.d.ts`의 `SemanticColorToken`과 `dist/figma/04-semantic.js`의 생성 로그에서 확인한다. 두 생성물의 개수 일치는 `test/build.test.mjs`가 검증한다.

비색상 (상한 밖, #13에서 확정): `state.hover.opacity` 0.08 · `state.pressed.opacity` 0.12 · `state.disabled.opacity` 0.5

[^gen]: 이 표의 hex는 [#6](https://github.com/flameware/massive-design/issues/6) 프로토타입이 낸 값이고, [#16](https://github.com/flameware/massive-design/issues/16)에서 램프 생성기를 culori로 다시 지으면서 **96색 중 이 한 칸만 `#0c1d3b` → `#0d1d3b`로 바뀌었다.** 프로토타입은 의존성 0을 목표로 Oklab 변환 행렬을 손으로 넣은 코드였고, 이 단계의 R 채널이 12.49/255 대 12.52/255라는 반올림 경계에 앉아 있었다. ΔE ≈ 0.0005로 눈에 보이지 않고 대비 판정에도 영향이 없다. **정본은 이제 `tokens/primitive/color.gen.json`이다.**

### 값이 겹치는 토큰들 — 의도적이다

`bg.subtle` / `bg.inset` / `bg.neutral.soft`가 neutral 3으로 같고, `fg.accent` / `fg.link`가 brand 10으로 같고, `border.accent` / `border.focus`가 brand 8로 같다.

**합치지 않는다.** 값이 같은 것과 의미가 같은 것은 다르다. 나중에 갈라야 할 때 semantic 이름을 바꾸는 건 소비처가 깨지는 변경이지만, 이미 이름이 나뉘어 있으면 값 한 줄만 고치면 된다.

### 후보 목록에서 바뀐 것

| 변경 | 이유 |
|---|---|
| `bg.disabled` · `fg.disabled` 삭제 | #13 — `state.disabled.opacity` 하나로 처리 |
| `fg.subtle` 삭제 | 3단 텍스트가 우리 램프에서 성립하지 않는다 (아래 §5) |
| `border.success` 삭제 | 실사용처 없음. "유효 필드 초록 테두리"를 쓰는 화면이 소비처에 없다 |
| `border.muted` 삭제 | neutral 5(CR 1.41)와 neutral 6(CR 1.49)이 **구분되지 않는다.** ΔCR 0.08 |
| `color.state.layer` 추가 | #13 |
| `bg.scrim` 추가 | #13. `bg.overlay`는 팝오버 **면**이라 별개다 |
| `bg.inverse` · `fg.on-inverse` 추가 | shadcn `Tooltip`이 실제로 반전 배경을 쓴다. Primer·M3·Polaris 셋 다 보유 |
| `border.field` 추가 | #13이 이름을 붙였으나 후보 목록에 없었다. 다크 알파 예외(`alpha.white.15`)를 걸 자리 |
| `fg.muted` 및 유채 텍스트 **11 → 10** | 아래 §5 |
| `bg.canvas`/`bg.surface` 라이트에서 **단계 교차** | 아래 §6 |

## 5. 텍스트 단계를 11에서 10으로 내린 이유

초안은 Radix 관례(11 = 저대비 텍스트, 12 = 고대비 텍스트)를 그대로 가져왔다. **우리 램프에서는 성립하지 않는다.** #6이 확정한 꼬리 앵커가 step 12를 L 0.320에 두는 바람에 11과 12가 둘 다 고대비 영역에 몰렸다.

라이트 캔버스(`#f8f8f8`) 대비:

| step | hex | CR |
|---|---|---|
| 10 | `#616161` | 5.83 |
| 11 | `#424242` | 9.46 |
| 12 | `#333333` | 11.90 |

`fg.default`=12 / `fg.muted`=11이면 **ΔCR 2.43** — 본문과 보조 텍스트가 육안으로 구분되지 않는다. step 10으로 내리면 11.90 / 5.83으로 벌어진다.

**step 10은 라이트/다크 × 4패밀리 전부에서 CR 5.8~6.4로 균일하다.** 유채 텍스트도 같이 내린다.

**대가**: step 11에 소비처가 없다. #6이 12단을 택한 근거가 "용도가 지정된 슬롯"이었으므로 그 근거를 일부 갉아먹는다. **11단이었으면 이 문제가 생기지 않았다** — 기록해둔다. 램프를 다시 뽑는 대신 semantic 매핑에서 흡수한 것은, #6의 8개 램프가 lint clean으로 확정된 상태를 흔들지 않기 위해서다.

## 6. 라이트 모드에서 canvas/surface가 교차한다

**semantic → primitive 단계 번호가 모드마다 달라지는 유일한 예외다.** 나머지 29개는 두 모드에서 같은 단계 번호를 쓴다.

| | light | dark |
|---|---|---|
| `bg.canvas` | neutral **2** `#f8f8f8` | neutral **1** `#0c0c0c` |
| `bg.surface` | neutral **1** `#fdfdfd` | neutral **2** `#151515` |

Radix 정석 순서(1=앱 배경, 2=올라온 면)를 그대로 쓰면 라이트에서 **카드가 배경보다 어두워진다.** shadcn 컴포넌트는 흰 카드를 전제로 그림자·테두리를 잡아놨고, 소비처가 shadcn이다. 뒤집으면 두 모드 모두 "카드가 캔버스보다 밝다"가 성립한다.

## 7. shadcn alias 매핑표

우리 semantic이 원본, shadcn 이름은 얇은 별칭이다.

### 출력 형태

```css
:root {
  /* palette (참조용, @theme 미등록) */
  --ds-palette-brand-light-9: oklch(53.6% 0.226 261.5);
  /* … */

  /* semantic */
  --ds-bg-canvas: var(--ds-palette-neutral-light-2);
  /* … */

  /* shadcn 원시 변수 — 반드시 실제 선언. color-mix 경로가 직접 읽는다 */
  --background: var(--ds-bg-canvas);
  /* … */
}

.dark {
  --ds-bg-canvas: var(--ds-palette-neutral-dark-1);
  /* … semantic + alias를 원본에서 파생해 **통째로** 재선언한다 (#35, #54) */
}

@theme inline {
  --color-background: var(--background);
  /* … --ds-* 는 여기 절대 들어가지 않는다 */
}
```

`.dark`에서는 **semantic과 모드 의존 alias 전부**를 원본에서 파생해 재선언한다. palette 층은 건드리지 않는다. 현재 줄 수를 문서에 복제하지 않고 `dist/tokens.css`와 cascade 테스트를 정본으로 삼는다.

> **정정 이력** — 이 숫자는 세 번 고쳐졌다. 고쳐진 방향이 매번 "더 많이"였다는 게 요점이다.
>
> - 위 예시의 `--ds-palette-*`는 `oklch()`로 적혀 있으나 **실제 출력은 hex다**([#17](https://github.com/flameware/massive-design/issues/17)). 램프는 전 단계가 이미 sRGB 감마 안으로 정리돼 있어 두 표기가 같은 색이고, 토큰 원본의 `$value`가 hex다.
> - ~~30줄~~ → **35줄**([#17](https://github.com/flameware/massive-design/issues/17)): `--chart-1..5`만 semantic을 거치지 않고 palette를 직참조하므로(§7.2 플레이스홀더) 함께 재선언해야 한다.
> - ~~35줄~~ → **64줄**([#35](https://github.com/flameware/massive-design/issues/35)): `chart` 5개만 특별 취급한 것이 결함의 자리였다. 커스텀 속성은 **선언된 그 요소에서 치환이 끝나므로**, `:root`의 `--background: var(--ds-bg-canvas)`는 `:root`에서 라이트로 확정되고 자손은 그 확정된 값을 상속한다. 중첩 `.dark`가 `--ds-*`만 덮으면 alias 34개는 라이트에 남는다 → **alias를 통째로 재선언한다.**
> - ~~64줄~~ → **65줄**([#37](https://github.com/flameware/massive-design/issues/37)): alias에 `--link`가 늘었다(§7.3).
> - **67줄**([#54](https://github.com/flameware/massive-design/issues/54)): semantic `border.focus-contrast`와 alias `--focus-contrast`가 두 겹 포커스 링을 위해 추가됐다.

### 매핑

| shadcn | 우리 semantic | 비고 |
|---|---|---|
| `--background` | `bg.canvas` | |
| `--foreground` | `fg.default` | |
| `--card` | `bg.surface` | |
| `--card-foreground` | `fg.default` | |
| `--popover` | `bg.overlay` | |
| `--popover-foreground` | `fg.default` | |
| `--primary` | `bg.accent.solid` | shadcn 기본은 무채색이지만 우리는 브랜드 |
| `--primary-foreground` | `fg.on-solid` | |
| `--secondary` | `bg.neutral.soft` | |
| `--secondary-foreground` | `fg.default` | |
| `--muted` | `bg.subtle` | |
| `--muted-foreground` | `fg.muted` | |
| `--accent` | `bg.subtle` | **hover 배경 슬롯.** 브랜드색 아님 |
| `--accent-foreground` | `fg.default` | |
| `--destructive` | `bg.danger.solid` | |
| `--destructive-foreground` | `fg.on-solid` | 정본에서 빠졌으나 **호환 보험으로 출력** |
| `--border` | `border.default` | |
| `--input` | `border.field` | |
| `--ring` | `border.focus` | |
| `--chart-1` … `--chart-5` | neutral 12 / 10 / 8 / 6 / 4 | **플레이스홀더** (§7.2) |
| `--sidebar` | `bg.surface` | shadcn 정본에서 `--sidebar` ≈ `--card` |
| `--sidebar-foreground` | `fg.default` | |
| `--sidebar-primary` | `bg.accent.solid` | |
| `--sidebar-primary-foreground` | `fg.on-solid` | |
| `--sidebar-accent` | `bg.subtle` | 사이드바 hover. `--sidebar`(surface)와 단계가 갈려야 hover가 보인다 |
| `--sidebar-accent-foreground` | `fg.default` | |
| `--sidebar-border` | `border.default` | |
| `--sidebar-ring` | `border.focus` | |
| `--success` | `bg.success.solid` | **shadcn 관례 위의 확장** (§7.1) |
| `--success-foreground` | `fg.on-solid` | 확장 |
| `--warning` | `bg.warning.solid` | **shadcn 관례 위의 확장** (#82) |
| `--warning-foreground` | `fg.on-warning` | 밝은 warning solid 전용 검정 전경 |
| `--link` | `fg.link` | **확장** (§7.3). 이 표에서 유일하게 `*-foreground` 없이 홀로 서는 전경색이다 |
| `--radius` | `0.625rem` | 곱셈 7단 파생은 shadcn CLI 규약 그대로 |

**`--sidebar-background`는 출력하지 않는다.** v3 잔재이고 shadcn CLI에 `--color-sidebar-background` → `--color-sidebar` 마이그레이션 코드가 있다. invest diary에 남은 참조를 `--sidebar`로 바꾸는 작업이 1회 필요하다.

**`--info`는 만들지 않는다.** info family는 이 노력의 범위 밖이다.

### 7.1 success 확장

shadcn 정본에 `success`가 없다. danger는 `--destructive`로 깨끗이 떨어지지만 success는 alias 대상이 없다.

`--success`와 `--warning` 묶음은 원시 변수를 추가하고 `@theme inline`에 consumer alias를 등록한다. shadcn 문서가 권하는 확장 방식과 같다. 각 묶음은 `*-soft`와 `*-text`도 제공해 Alert·Toast가 primitive를 직접 소비하지 않게 한다.

**원시 변수를 반드시 실제로 선언해야 하는 이유**: 최신 shadcn 스타일 시스템은 `color-mix(in oklch, var(--secondary), var(--foreground) 5%)`처럼 **원시 변수를 직접 읽는다.** `@theme inline`의 theme 키만 만들고 원시 변수를 생략하면 유틸리티 경로는 살고 `color-mix` 경로는 무너진다.

### 7.2 chart-1..5는 플레이스홀더다

무채색 neutral 램프 5단계로 채우고 **"시각화 팔레트는 이 맵 밖"이라고 선언한다.** shadcn 정본 neutral 테마도 무채색 플레이스홀더를 넣어두고 테마가 덮어쓰게 한다.

이유: 의미 패밀리에서 **범주형 5색을 뽑는 건 원래 잘 안 된다.** danger/success/warning을 차트 시리즈로 쓰면 상태 의미가 데이터에 잘못 실린다. invest diary는 손익 색을 자기가 소유한다(ADR-0008). 여기서 어설픈 5색을 확정하면 그게 굳는다.

### 7.3 link 확장 — 그리고 이 표가 배경 중심이라는 사실

[#37](https://github.com/flameware/massive-design/issues/37)이 Button `link` variant에서 `color → var(--primary) → bg.accent.solid`를 발견했다. **배경용 solid 색(램프 9단)을 글자색에 쓰고 있었다** — 다크 `bg.canvas` 위에서 CR **3.61**, 본문 게이트 4.5 미달이다. `fg.link`(램프 10단)는 같은 자리에서 5.68이다.

원인은 오타가 아니라 **어휘의 구멍**이다. 이 표는 **배경 중심**이다 — `*-foreground`가 전부 "짝이 되는 면 위의 전경"(`on-solid`/`default`/`muted`)이고, 면과 짝지어지지 않은 **유채색 텍스트 토큰 4개(`fg.accent`·`fg.danger`·`fg.success`·`fg.link`)에는 shadcn 이름이 하나도 없었다.** `@theme inline`은 이 표의 이름만 등록하므로(§7 출력 형태, `--ds-*` 금지) 그 넷은 **Tailwind 유틸리티가 아예 존재하지 않았고**, 브랜드색 글자를 칠할 수단이 `text-primary`뿐이었다.

`--link`(→ `fg.link`) 하나만 연다. 나머지 셋은 요구하는 컴포넌트가 생길 때 연다 — 지금 열면 소비처 0개인 이름 셋이 생긴다.

**`fg.accent`가 아니라 `fg.link`인 이유**: 값은 라이트·다크 양쪽 `brand.10`으로 **완전히 동일**하다. 화면은 어느 쪽이든 같다. 갈리는 건 Figma가 무슨 변수를 무느냐([#26](https://github.com/flameware/massive-design/issues/26))와 나중에 링크색만 분리할 자리가 있느냐다. §4가 두 토큰을 "값은 같지만 의미가 다르다"며 일부러 갈라 놨는데 컴포넌트가 다시 합치면 그 구분이 죽는다. `fg.accent`가 필요한 컴포넌트가 오면 그때 **추가로** 연다.

**게이트가 못 잡은 이유와 대책**: `tokens:contrast`는 **semantic 조합표**를 검사한다. 표에는 `fg.link on bg.canvas`가 이미 있고 5.68로 통과한다. 그런데 컴포넌트가 잘못된 이름을 **선택**하면 그 조합은 표에 나타나지도 않는다 — [#33](https://github.com/flameware/massive-design/issues/33)과 같은 종류의 침묵이다. 대책은 `packages/ui`의 새 게이트 **`scripts/manifest/lint.mjs`**(check 규칙 3): 매니페스트에서 `color`↔`--ds-fg-*`, `background-color`↔`--ds-bg-*`, `border-color`↔`--ds-border-*` **계열 일치**를 본다. 어떤 컴포넌트가 어떤 토큰을 집는지는 매니페스트([#23](https://github.com/flameware/massive-design/issues/23))가 처음으로 기계가 읽게 적어 준 정보라, 이 검사는 `packages/tokens`에서는 원리적으로 불가능하다.

⚠️ **계열 검사이지 대비 검사가 아니다.** 이름은 맞는데 대비가 안 나오는 조합은 못 잡고, `color` 항목 자체가 없는 칸(`ghost`·`outline` — [#36](https://github.com/flameware/massive-design/issues/36)의 `body` 규칙에서 상속)은 볼 것이 없어 침묵한다.

## 8. 대비 검증

전 조합 자동 검산 결과 — 스크립트는 #7 코멘트 참조.

- **텍스트 74조합 전부 WCAG AA(4.5:1) 통과.** 최저 4.80 (`fg.on-solid` on `bg.danger.solid`)
- **비텍스트 40조합 전부 3:1 통과.** 최저 3.08 (dark `border.focus`·`border.accent` on `bg.overlay`)
- `fg.on-solid`는 어두운 4패밀리 solid 위에서 4.80~5.41로 유지한다. warning 9는 밝아 흰 전경이 실패하므로 `fg.on-warning`의 검정을 쓴다.

다크 보더는 알파 합성이라 대비값이 낮다(`border.default` 1.31 / `border.field` 1.56 on `bg.surface`). 이건 shadcn 정본과 같은 성질이고, 보더는 비텍스트 3:1 요건 대상이 아니다(요건은 "상태를 나타내는 UI 컴포넌트"에 걸린다).

### 8.1 비텍스트 게이트는 5면 전부를 본다 ([#33](https://github.com/flameware/massive-design/issues/33))

#7이 확정한 원래 6조합은 **전부 `bg.canvas` 위**만 봤다. [#17](https://github.com/flameware/massive-design/issues/17)이 `bg.surface`를 재며 구멍을 열었고, #33이 나머지 면까지 재자 **바닥이 `bg.surface`가 아니었다**: 다크 `bg.subtle`·`bg.inset`·`bg.overlay`는 전부 `#1e1e1e`이고 그 위에서 인터랙티브 테두리 **4종이 전부** 3:1 아래였다 — `focus`/`accent` 2.59 · `danger` 2.80 · `strong` 2.86. 라이트도 `border.strong` on `bg.subtle`이 2.98이었다.

그래서 게이트는 **인터랙티브 테두리 4종 × 면 5종 × 2모드 = 40조합**이 됐다. 곱집합이 무의미한 쌍을 만든다는 #7의 우려는 텍스트 조합의 이야기다 — 이 5면은 전부 "무언가가 그 위에 놓이는 면"이라 해당되지 않는다. 그중 `bg.overlay`가 다이얼로그·팝오버 안의 인풋과 버튼이 실제로 놓이는 면이라 가장 중요하다.

**고친 방법: 네 토큰의 참조를 팔레트 8단 → 9단으로 올렸다**(양 모드). 파급이 정확히 네 칸인 이유는 **semantic 계층에서 8단을 참조하던 것이 이 네 토큰뿐**이었기 때문이다 — 램프는 건드리지 않았다.

⚠️ 8단이 죽은 것은 **아니다.** alias 계층의 `chart-3`이 `palette.neutral.*.8`을 여전히 직참조한다(`chart-1..5`는 palette를 직접 집는 유일한 무리고, 지금은 무채색 플레이스홀더다). 램프에서 8단을 빼거나 값을 옮기면 그쪽이 조용히 따라 움직인다.

| dark, 최악 면 `bg.overlay` | 이전 (8단) | 이후 (9단) |
|---|---|---|
| `border.focus` · `border.accent` | 2.59 | **3.08** |
| `border.danger` | 2.80 | **3.47** |
| `border.strong` | 2.86 | **3.47** |

brand의 3.08은 얇다. 그건 값이 아슬아슬한 게 아니라 **다크 중간 회색면 위 파랑의 물리적 한계**다 — 10단(`#5989e2`, 4.84)은 여유를 주지만 라이트 10단은 반대로 더 어두워져(`#1553c6`) 양 모드의 인상이 갈린다. 여유가 더 필요하면 답은 램프가 아니라 **두 겹 링 구조**이고, 그건 별건이다.

### 8.2 상태 테두리는 토큰을 불투명도 없이 칠한다

이 게이트가 재는 것은 **토큰 원색**이다. `scripts/contrast.mjs`는 `packages/tokens` 안에 살아 `packages/ui`를 원리적으로 볼 수 없으므로, 컴포넌트가 토큰 색을 불투명도로 깎으면 게이트가 약속한 3:1이 화면에서 성립하지 않는데도 초록으로 통과한다.

shadcn 원본의 `focus-visible:ring-ring/50`이 정확히 그 경우였다. 실측하면 **`/50`은 어떤 면·어떤 모드에서도 3:1을 못 넘는다 — 최댓값이 라이트 `bg.subtle` 위 2.36**이다. 그래서 규약으로 막는다:

> **상태를 나타내는 테두리(포커스 링, 에러 테두리)는 semantic 토큰을 불투명도 없이 칠한다.**

`packages/ui/src/components/ui/button.tsx`에서 `ring-ring/50` → `ring-ring`, `ring-destructive/20` → `ring-destructive`로 걷어냈다. `aria-invalid:ring-destructive/20`은 남겼다 — 그 상태를 지는 것은 같이 걸린 `aria-invalid:border-destructive`(원색, 게이트 대상)이고 링은 그 위의 글로우다.

⚠️ **딸려 오는 결과: `border.focus`가 `bg.accent.solid`와 같은 hex가 됐다**(양 모드 다 9단). primary 버튼은 링이 면과 동색이라 포커스가 "조금 커진 덩어리"로 보인다 — 실제 렌더로 확인했다. 바깥 경계(링 대 배경면)가 3.08로 요건을 지므로 성립하지만, 다섯 variant 중 `default`만 눈에 띄게 약하다. 구조로 고치려면 두 겹 링이고, 그건 아직 안 연 항목이다.

## 9. 다음 티켓으로 넘기는 것

- **`--sidebar-background` 정리** — invest diary 쪽 1회 작업
- **시각화 팔레트** — 범주형 5색은 별도 설계 대상
- **step 11 미사용** — 12단 결정(#6)의 대가. 램프를 다시 뽑을 일이 생기면 함께 본다
- **lint 도구 선정** — 규칙은 §1에서 확정됐으나 무엇으로 구현할지는 미정
