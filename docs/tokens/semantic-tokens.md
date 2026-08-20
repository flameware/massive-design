# semantic 토큰 어휘·네이밍과 shadcn alias 매핑

확정: 2026-08-19 · 근거 티켓 [#7](https://github.com/flameware/massive-design/issues/7) · 맵 [#1](https://github.com/flameware/massive-design/issues/1)

입력: [#2](https://github.com/flameware/massive-design/issues/2) 후보 30개 · [#5](https://github.com/flameware/massive-design/issues/5) shadcn 정본 · [#13](https://github.com/flameware/massive-design/issues/13) 알파 전략 · [#6](https://github.com/flameware/massive-design/issues/6) 램프 4종 확정값

---

## 0. 회계 규칙

- **30개 상한은 `--ds-*` semantic 색 토큰만 센다.** shadcn 이름은 기계적으로 파생되는 호환 레이어이므로 카운트 밖이다. 우리가 발명한 어휘가 아니라 소비처가 이미 아는 어휘다.
- 비색상 토큰(`state.*.opacity`)은 색 상한에 포함하지 않는다.
- **현재 정확히 30개.** 늘리려면 무엇을 뺄지 함께 정한다.

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
palette   (컬렉션, 모드 1개)   96 변수 + 리터럴 5개
          brand/light/1..12, brand/dark/1..12, neutral/…, danger/…, success/…
          base/white, base/black, alpha/white/10, alpha/white/15, alpha/black/50

semantic  (컬렉션, 모드 2개: Light / Dark)   30 변수
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

## 4. semantic 토큰 30개

`palette.<family>.<mode>.<step>`을 `<family> <step>`으로 줄여 적는다. 대비값은 WCAG 2.

### bg (15)

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
| 14 | `bg.inverse` | 토스트·툴팁 반전 면 | neutral 12 `#333333` | neutral 12 `#e8e8e8` |
| 15 | `bg.scrim` | 모달 뒷배경 딤 | `alpha.black.50` | `alpha.black.50` |

### fg (8)

| # | 토큰 | 의미 | light | dark |
|---|---|---|---|---|
| 16 | `fg.default` | 본문 텍스트 | neutral 12 `#333333` | neutral 12 `#e8e8e8` |
| 17 | `fg.muted` | 보조 텍스트·플레이스홀더 | neutral 10 `#616161` | neutral 10 `#8f8f8f` |
| 18 | `fg.on-solid` | 모든 `*.solid` 배경 위 전경 | `base.white` | `base.white` |
| 19 | `fg.on-inverse` | `bg.inverse` 위 전경 | neutral 1 `#fdfdfd` | neutral 1 `#0c0c0c` |
| 20 | `fg.accent` | 브랜드 텍스트·아이콘 | brand 10 `#1553c6` | brand 10 `#5989e2` |
| 21 | `fg.danger` | 에러 텍스트 | danger 10 `#b92429` | danger 10 `#e76760` |
| 22 | `fg.success` | 성공 텍스트 | success 10 `#1c6f35` | success 10 `#569e65` |
| 23 | `fg.link` | 링크 | brand 10 `#1553c6` | brand 10 `#5989e2` |

### border (6)

| # | 토큰 | 의미 | light | dark |
|---|---|---|---|---|
| 24 | `border.default` | 구분선·컨테이너 테두리 | neutral 6 `#d2d2d2` | `alpha.white.10` |
| 25 | `border.field` | 폼 필드 테두리 | neutral 7 `#b8b8b8` | `alpha.white.15` |
| 26 | `border.strong` | 인터랙티브 요소의 강한 테두리 | neutral 8 `#8a8a8a` | neutral 8 `#656565` |
| 27 | `border.accent` | 브랜드 테두리 | brand 8 `#4581f1` | brand 8 `#0d55d4` |
| 28 | `border.danger` | 에러 필드 테두리 | danger 8 `#f34c4b` | danger 8 `#c41a26` |
| 29 | `border.focus` | 포커스 링 | brand 8 `#4581f1` | brand 8 `#0d55d4` |

### 상태 메커니즘 (1)

| # | 토큰 | 의미 | light | dark |
|---|---|---|---|---|
| 30 | `color.state.layer` | 컴포넌트가 `color-mix`로 얹는 상태 레이어 | `base.black` | `base.white` |

**합계 30.**

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
  /* … semantic만 재선언. shadcn 층은 semantic을 가리키므로 자동으로 따라온다 */
}

@theme inline {
  --color-background: var(--background);
  /* … --ds-* 는 여기 절대 들어가지 않는다 */
}
```

`.dark`에서 재선언하는 건 **semantic 30줄뿐**이다. shadcn 층과 palette 층은 건드리지 않는다.

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
| `--radius` | `0.625rem` | 곱셈 7단 파생은 shadcn CLI 규약 그대로 |

**`--sidebar-background`는 출력하지 않는다.** v3 잔재이고 shadcn CLI에 `--color-sidebar-background` → `--color-sidebar` 마이그레이션 코드가 있다. invest diary에 남은 참조를 `--sidebar`로 바꾸는 작업이 1회 필요하다.

**`--warning` / `--info`는 만들지 않는다.** 패밀리 자체가 없다.

### 7.1 success 확장

shadcn 정본에 `success`가 없다. danger는 `--destructive`로 깨끗이 떨어지지만 success는 alias 대상이 없다.

`--success` / `--success-foreground` 원시 변수를 추가하고 `@theme inline`에 `--color-success` / `--color-success-foreground`를 등록한다. shadcn 문서가 권하는 확장 방식과 같다.

**원시 변수를 반드시 실제로 선언해야 하는 이유**: 최신 shadcn 스타일 시스템은 `color-mix(in oklch, var(--secondary), var(--foreground) 5%)`처럼 **원시 변수를 직접 읽는다.** `@theme inline`의 theme 키만 만들고 원시 변수를 생략하면 유틸리티 경로는 살고 `color-mix` 경로는 무너진다.

### 7.2 chart-1..5는 플레이스홀더다

무채색 neutral 램프 5단계로 채우고 **"시각화 팔레트는 이 맵 밖"이라고 선언한다.** shadcn 정본 neutral 테마도 무채색 플레이스홀더를 넣어두고 테마가 덮어쓰게 한다.

이유: 4패밀리(brand/neutral/danger/success)에서 **범주형 5색을 뽑는 건 원래 잘 안 된다.** danger/success를 차트 시리즈로 쓰면 "빨강=나쁨 / 초록=좋음"이 데이터에 잘못 실린다. invest diary는 손익 색을 자기가 소유한다(ADR-0008). 여기서 어설픈 5색을 확정하면 그게 굳는다.

## 8. 대비 검증

전 조합 자동 검산 결과 — 스크립트는 #7 코멘트 참조.

- **텍스트 42조합 전부 WCAG AA(4.5:1) 통과.** 최저 4.80 (`fg.on-solid` on `bg.danger.solid`)
- **비텍스트 6조합 전부 3:1 통과.** 최저 3.04 (dark `border.focus` on `bg.canvas`)
- `fg.on-solid`는 4패밀리 solid 위에서 4.80~5.41 — **단일 토큰으로 유지된다.** 순백 리터럴을 쓴다 (`neutral.1`을 쓰면 danger에서 4.72까지 떨어져 여유가 얇다). `color.state.layer`가 어차피 흑/백 리터럴을 요구하므로 추가 비용이 없다

다크 보더는 알파 합성이라 대비값이 낮다(`border.default` 1.31 / `border.field` 1.56 on `bg.surface`). 이건 shadcn 정본과 같은 성질이고, 보더는 비텍스트 3:1 요건 대상이 아니다(요건은 "상태를 나타내는 UI 컴포넌트"에 걸린다).

## 9. 다음 티켓으로 넘기는 것

- **`--sidebar-background` 정리** — invest diary 쪽 1회 작업
- **시각화 팔레트** — 범주형 5색은 별도 설계 대상
- **step 11 미사용** — 12단 결정(#6)의 대가. 램프를 다시 뽑을 일이 생기면 함께 본다
- **lint 도구 선정** — 규칙은 §1에서 확정됐으나 무엇으로 구현할지는 미정
