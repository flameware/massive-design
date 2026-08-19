# OKLCH 프로그래매틱 컬러 램프 생성 기법 조사

> 티켓: [flameware/massive-design#3](https://github.com/flameware/massive-design/issues/3) (맵 #1)
> 조사일: 2026-08-19
> 산출물: 마지막 절 [램프 생성기 설계안](#7-램프-생성기-설계안)

조사는 1차 출처 위주로 했다. Radix는 실제 제너레이터 소스, Tailwind는 실제 팔레트 CSS, culori/colorjs.io는 소스와 API 문서, 감마 클리핑은 Björn Ottosson 원문. 램프의 실패 영역(노랑·청록)은 블로그 요약 대신 sRGB 감마 경계를 직접 계산해서 수치로 확인했다.

---

## 1. 먼저: OKLCH에서 "선형 램프"가 왜 안 되는가

OKLCH의 L은 지각적으로 균등하지만, **C(chroma)의 상한이 L과 H에 따라 격렬하게 변한다.** sRGB 감마는 OKLCH 안에서 원기둥이 아니라 hue마다 모양이 다른 찌그러진 삼각형이다. Ottosson 본인의 표현:

> "the sRGB gamut has a quite irregular shape in these color spaces. As a result, changing one parameter, such as hue, can easily create a color outside the target gamut."
> — [Okhsv and Okhsl, bottosson.github.io](https://bottosson.github.io/posts/colorpicker/)

이게 얼마나 심한지 직접 계산했다. hue별로 sRGB 안에 들어가는 최대 chroma를 이분탐색으로 찾고, 그 최대값이 나오는 L(= **cusp**)을 구한 결과:

| hue (°) | cusp L | cusp C | C@L=0.30 | C@L=0.50 | C@L=0.70 | C@L=0.85 |
|---|---|---|---|---|---|---|
| red 25 | 0.630 | **0.255** | 0.122 | 0.203 | 0.191 | 0.082 |
| orange 47 | 0.710 | 0.196 | 0.083 | 0.138 | 0.194 | 0.089 |
| amber 70 | 0.790 | 0.171 | 0.065 | 0.108 | 0.152 | 0.117 |
| yellow 95 | **0.884** | 0.182 | 0.062 | 0.103 | 0.144 | 0.175 |
| lime 120 | **0.938** | 0.223 | 0.071 | 0.119 | 0.166 | 0.202 |
| green 145 | 0.868 | 0.273 | 0.094 | 0.157 | 0.220 | 0.267 |
| teal 180 | 0.896 | 0.162 | 0.054 | 0.091 | 0.127 | 0.154 |
| cyan 210 | 0.840 | **0.145** | 0.052 | 0.086 | 0.121 | 0.137 |
| blue 250 | 0.662 | 0.187 | 0.085 | 0.142 | 0.163 | 0.077 |
| violet 290 | **0.518** | 0.293 | 0.170 | 0.283 | 0.169 | 0.080 |
| pink 350 | 0.658 | 0.275 | 0.125 | 0.209 | 0.230 | 0.097 |

(Ottosson의 OKLab↔linear sRGB 행렬로 직접 계산. 스크립트는 이 문서 부록 참고)

읽어야 할 세 가지:

1. **cusp L이 hue마다 0.52 ~ 0.94로 흩어진다.** violet은 중간 밝기에서 가장 진하고, lime은 거의 흰색 근처에서 가장 진하다. 따라서 "모든 패밀리에 같은 L 곡선 + 같은 C 곡선"을 적용하면 어떤 hue는 감마 밖으로 밀려나고 어떤 hue는 쓸 수 있는 chroma를 버린다.
2. **hue마다 최대 chroma 자체가 2배 차이 난다.** violet 0.293 vs cyan 0.145. 같은 `chromaPeak` 상수를 쓰면 cyan은 항상 sRGB 벽에 부딪히고, violet은 항상 밍밍하다. → **chroma는 절대값이 아니라 cusp 대비 비율(0~1)로 다뤄야 한다.**
3. **어두운 쪽에서는 모든 hue의 chroma 여유가 급감한다.** L=0.30에서는 가장 진한 violet도 0.170, cyan은 0.052밖에 안 된다. 어두운 단계에서 chroma를 유지하려는 곡선은 반드시 감마 밖으로 나간다.

**결론: 램프 생성기의 chroma 파라미터는 "정규화된 saturation(0~1)"이어야 하고, 실제 C는 `cuspC(L, H) × sat`로 매 단계 재계산해야 한다.** 이건 Ottosson이 Okhsl에서 한 것과 정확히 같은 발상이다 — C₀ / C_mid / C_max 세 점으로 chroma를 정규화. 다만 그는 정규화의 대가로 지각 균등성을 조금 포기했다고 명시한다("This step makes the space less uniform perceptually, but is needed to fit the sRGB gamut to a cylinder exactly").

---

## 2. 선례 조사

### 2.1 Radix Colors — 생성기가 있지만, "생성"이 아니라 "전조(transpose)"다

이게 이번 조사에서 가장 중요한 발견이다. Radix의 커스텀 팔레트 생성기 소스([`radix-ui/website/components/generate-radix-colors.tsx`](https://github.com/radix-ui/website/blob/main/components/generate-radix-colors.tsx))를 통째로 읽었는데, **수식으로 램프를 만들지 않는다.**

동작 순서:

1. 손으로 큐레이션한 25개 스케일(`gray, mauve, slate, sage, olive, sand, tomato, red, ruby, crimson, pink, plum, purple, violet, iris, indigo, blue, cyan, teal, jade, green, grass, brown, orange, sky, mint, lime, yellow, amber`)의 P3 버전을 전부 OKLCH로 변환해 메모리에 올린다.
2. 입력 키 컬러와 **모든 스케일의 모든 단계**에 대해 `deltaEOK` 거리를 잰다. 가장 가까운 스케일 A, 두 번째 B를 뽑는다.
3. 삼각법으로 A·B·source가 이루는 삼각형의 각을 계산한다. 둔각이면 A만, 예각이면 tangent 비율만큼 A와 B를 섞는다. 소스 주석이 ASCII 다이어그램까지 그려가며 설명한다.
4. 섞어 만든 12단 기준 스케일의 **hue를 소스의 hue로 전부 덮어쓰고**, chroma는 `min(source.C × 1.5, scaleColor.C × ratioC)`로 비례 조정한다. (`ratioC = source.C / baseColor.C`)
5. lightness는 `transposeProgressionStart(backgroundL, lightnessScale, easing)` — 배경색 L에 맞춰 곡선 전체를 베지어 가중치로 평행이동시킨다. easing 상수는 하드코딩:
   - `lightModeEasing = [0, 2, 0, 2]`
   - `darkModeEasing  = [1, 0, 1, 0]`
6. step 9는 **키 컬러 자체를 그대로 꽂는다** (배경과 deltaEOK×100 < 25이면 예외 처리). step 10은 step 9에서 파생한 hover 색: `L > 0.4 ? L - 0.03/(L+0.1) : L + 0.03/(L+0.1)`, `C × 0.93`.
7. step 11·12(텍스트)의 chroma는 `min(max(C₉, C₈), C₁₁)`로 **상한을 건다.** 텍스트가 너무 쨍한 걸 막는 명시적 안전장치.

즉 Radix의 "생성기"는 **사람이 만든 램프의 모양(L 곡선·C 곡선의 상대적 형태)을 자산으로 보고, 거기에 새 hue/chroma를 입히는 도구**다. 12단 램프의 곡선 자체는 여전히 수작업 산물이다.

Radix 문서가 밝히는 설계 규약([Understanding the scale](https://www.radix-ui.com/colors/docs/palette-composition/understanding-the-scale)):
- 1–2 배경, 3–5 인터랙티브 컴포넌트, 6–8 보더·구분선, 9–10 solid, 11–12 텍스트
- **step 11·12는 같은 스케일의 step 2 배경 위에서 APCA Lc 60 / Lc 90을 보장한다.** WCAG가 아니라 APCA다.
- step 9는 "chroma가 가장 높은 순수 단계"
- step 9 위 텍스트는 대부분 흰색이지만 **Sky, Mint, Lime, Yellow, Amber는 어두운 텍스트용으로 설계** ← 밝은 hue의 예외를 규칙이 아니라 목록으로 처리했다는 뜻

텍스트 색 결정 로직도 소스에 있다 — APCA 기반이다:

```ts
function getTextColor(background: Color) {
  const white = new Color("oklch", [1, 0, 0]);
  if (Math.abs(white.contrastAPCA(background)) < 40) {
    const [, C, H] = background.coords;
    return new Color("oklch", [0.25, Math.max(0.08 * C, 0.04), H]);
  }
  return white;
}
```

### 2.2 Radix의 light vs dark — "다크는 채도를 낮춘다"는 반은 틀렸다

맵 #1에 "dark 채도 보정 파라미터"가 적혀 있어서, Radix의 실제 light/dark 스케일을 OKLCH로 변환해 비교했다([`radix-ui/colors` src/light.ts, src/dark.ts](https://github.com/radix-ui/colors/blob/main/src/light.ts)).

**blue** (L / C / H)

| step | light | dark |
|---|---|---|
| 1 | 0.993 / 0.003 / 248 | 0.194 / **0.025** / 256 |
| 3 | 0.960 / 0.020 / 239 | 0.274 / **0.066** / 254 |
| 6 | 0.863 / 0.068 / 243 | 0.416 / **0.113** / 252 |
| 8 | 0.734 / 0.121 / 243 | 0.541 / 0.140 / 253 |
| **9** | **0.649 / 0.193 / 252** | **0.649 / 0.193 / 252** |
| 10 | 0.622 / 0.183 / 252 | 0.688 / 0.169 / 251 |
| 11 | 0.556 / 0.162 / 252 | 0.764 / **0.126** / 249 |
| 12 | 0.324 / 0.096 / 259 | 0.907 / **0.051** / 238 |

읽어야 할 것:

- **step 9는 light와 dark가 완전히 동일하다** (0.649 / 0.193 / 252). Radix는 브랜드 solid 색을 모드 간 앵커로 고정한다.
- **배경 쪽(1–7)은 다크가 오히려 chroma가 높다.** light step 3의 C=0.020 vs dark step 3의 C=0.066 — 3배 이상. 어두운 배경에서는 같은 색조를 느끼게 하려면 chroma를 더 넣어야 한다.
- **텍스트 쪽(11–12)은 다크가 chroma가 낮다.** light 12의 C=0.096 vs dark 12의 C=0.051.

> ⚠️ 맵 #1의 "dark 채도 보정 파라미터"를 **단일 스칼라 감쇠 계수로 두면 안 된다.** 실제 관행은 "다크에서 전체적으로 채도를 낮춤"이 아니라 **"배경 끝은 채도를 올리고, 텍스트 끝은 채도를 낮춘다"** — 즉 램프 위치에 따라 부호가 뒤집히는 보정이다. 아래 설계안에서는 `darkChromaBias: { bg: +, text: − }` 형태의 2점 보정으로 둔다.

### 2.3 Tailwind v4 — 순수 수작업, 자동 생성 아님

Tailwind v4의 실제 팔레트([`packages/tailwindcss/theme.css`](https://github.com/tailwindlabs/tailwindcss/blob/main/packages/tailwindcss/theme.css))를 그대로 읽었다.

```css
--color-red-50:  oklch(97.1% 0.013  17.38);
--color-red-500: oklch(63.7% 0.237  25.331);
--color-red-950: oklch(25.8% 0.092  26.042);

--color-yellow-50:  oklch(98.7% 0.026 102.212);
--color-yellow-400: oklch(85.2% 0.199  91.936);
--color-yellow-950: oklch(28.6% 0.066  53.813);

--color-cyan-500: oklch(71.5% 0.143 215.221);
```

블로그 원문은 방법론을 말하지 않는다:

> "We've upgraded the entire default color palette from `rgb` to `oklch`, taking advantage of the wider gamut... We've tried to keep the balance between all the colors the same as it was in v3."
> — [Tailwind CSS v4.0](https://tailwindcss.com/blog/tailwindcss-v4)

하지만 숫자를 보면 생성기 산물이 아님이 분명하다:

- **hue가 단계마다 움직이고, 그 움직임이 hue마다 다르다.** red는 17.38 → 27.5 → 26.0 (약 10° 이동 후 되돌아옴). **yellow는 102.2 → 53.8, 무려 48° 이동** — 어두운 노랑이 갈색/올리브 방향으로 완전히 이동한다. cyan은 200.9 → 229.7 (29°). 순수 hue 고정 램프면 이런 값이 나올 수 없다.
- chroma 피크 위치도 hue마다 다르다. red는 600에서 0.245로 최대, yellow는 400에서 0.199, cyan은 400에서 0.154.
- 소수점 셋째 자리까지 hue가 흩어져 있는 건 기존 v3 hex를 OKLCH로 변환한 뒤 손으로 다듬은 흔적이다.

**Tailwind가 우리에게 주는 교훈: 그들도 hue shift를 넣는다. 그리고 그 값을 알고리즘이 아니라 눈으로 정했다.**

### 2.4 Adobe Leonardo — 대비율이 입력이다

[`@adobe/leonardo-contrast-colors`](https://github.com/adobe/leonardo/blob/main/packages/contrast-colors/README.md)의 발상은 다른 도구들과 근본적으로 다르다. **"몇 단계 램프"가 아니라 "이 배경 위에서 대비 3:1, 4.5:1, 8:1인 색을 내놔라"가 입력이다.**

```js
let blue = new Color({
  name: 'blue',
  colorKeys: ['#5CDBFF', '#0000FF'],
  colorspace: 'LCH',
  ratios: [3, 4.5],
  smooth: true,          // 베지어 스무딩, 기본 false
});
let theme = new Theme({ colors: [gray, blue], backgroundColor: gray, lightness: 97 });
```

- `colorKeys`: 보간할 키 컬러들 (여러 개 가능 — 램프가 hue를 타고 휘어질 수 있다)
- `colorspace`: `CAM02`, `CAM02p`, `LCH`, `LAB`, `HSL`, `HSLuv`, `RGB` 등. **OKLCH는 목록에 없다** (내부적으로 chroma.js + d3-cam02 기반)
- `smooth`: 베지어 스무딩 on/off
- `lightness`: 테마 배경 밝기 0–100. 다크모드는 이 값만 바꿔서 (예: 8 또는 11) 램프 전체를 재생성한다 — **이게 Leonardo의 다크 대응 방식이다. 별도 다크 램프가 없다.**

README가 인정하는 한계:

> "You may notice the tool takes an input (target ratio) but most often outputs a contrast ratio slightly higher. This has to do with the available colors in the RGB color space... This is exaggerated by the various colorspace interpolations."

**우리에게 유효한 부분:** "단계 번호"를 1차 개념으로 두지 말고, 최소한 semantic 텍스트 단계에는 **대비 목표를 명시하고 검증**하라는 것. 다만 Leonardo를 라이브러리로 쓰기엔 OKLCH 미지원 + chroma.js 의존이 걸린다.

### 2.5 Huetone — 도구이지 라이브러리가 아니다

[`ardov/huetone`](https://github.com/ardov/huetone)은 OKLCH/CIELCH에서 여러 스케일의 **L·C·H 곡선을 그래프로 동시에 편집**하는 웹 툴이다. APCA와 WCAG 대비를 동시에 표시하고, sRGB / Display P3 / Rec.2020 감마 경계를 표시한다.

우리 맵에서 hihayk/scale에 배정한 "눈 검증 도구" 역할에 Huetone이 더 적합하다. 특히 **L 곡선을 패밀리 간에 겹쳐 보는 뷰**는 brand/neutral/danger/success 4개 램프의 단계 정합성을 맞출 때 직접 쓸모가 있다. 곡선 값을 뽑아 JSON에 override로 붙여넣는 워크플로가 자연스럽다.

---

## 3. 라이브러리 비교 — culori / colorjs.io / chroma-js

세 라이브러리의 소스·문서를 직접 확인했다.

| | **culori** | **colorjs.io** | **chroma-js** |
|---|---|---|---|
| OKLCH | `oklch` 모드 1급 지원 | `oklch` 1급 지원 | 객체 입력으로 지원 |
| Okhsl/Okhsv | **있음** (`src/okhsl`, `src/okhsv`) | 없음 | 없음 |
| CSS Color 4 감마 매핑 | **`toGamut()` 기본값이 곧 CSS 알고리즘** | `toGamut({method:'css'})` (기본) | **없음** (`.clipped()`만) |
| 단순 chroma 축소 | `clampChroma(color, 'oklch')` | `toGamut({method:'oklch.c'})` | 없음 |
| 채널 클리핑 | `clampRgb`, `clampGamut(mode)` | `toGamut({method:'clip'})` | 자동 클리핑 |
| 감마 판정 | `inGamut(mode)`, `displayable()` | `inGamut()` | `.clipped()` |
| WCAG 대비 | `wcagContrast`, `wcagLuminance` | `contrast(c, 'WCAG21')` | `chroma.contrast()` |
| **APCA** | **없음** (`src/wcag.js`만 존재) | **`contrastAPCA()` 있음** | `chroma.contrastAPCA()` (3.1+) |
| 색차 | `differenceEuclidean`, `differenceCiede2000`, deltaEOK 등 | `deltaEOK`, `deltaE2000`, `deltaEITP` | `chroma.deltaE` |
| 보간·이징 | `interpolate`, `samples`, `easingSmoothstep`, `easingGamma`, `easingMidpoint`, `easingInOutSine` | `range`, `steps` | `chroma.scale`, `chroma.bezier`, `correctLightness` |
| 트리셰이킹 | 모드별 개별 import (`culori/fn`) | 서브모듈 import 가능 | 전부 로드 |
| 번들 | 가장 작음 | 중간 | 중간 |

### culori의 감마 매핑 두 갈래 (소스 확인)

[`Evercoder/culori/src/clamp.js`](https://github.com/Evercoder/culori/blob/main/src/clamp.js) 실제 코드:

`clampChroma(color, mode='lch', rgbGamut='rgb')` — 순수 이분탐색으로 감마에 들어가는 최대 chroma를 찾는다. 해상도는 `(range[1]-range[0]) / 2^13`. c=0조차 감마 밖이면 RGB 클리핑으로 폴백.

`toGamut(dest='rgb', mode='oklch', delta=differenceEuclidean('oklch'), jnd=0.02)` — 소스 주석이 목적을 그대로 말한다:

> "To address the shortcomings of `clampChroma`, which can sometimes produce colors more desaturated than necessary, the test used in the binary search is replaced with 'is color is roughly in gamut', by comparing the candidate to the clipped version... **The default arguments for this function correspond to the gamut mapping algorithm defined in CSS Color Level 4.**"

colorjs.io 문서도 같은 얘기를 하며 노랑을 콕 집어 지목한다:

> "This hybrid strategy avoids excessive chroma reduction (particularly problematic for yellows) that plagued earlier methods like `lch.c`."
> — [colorjs.io / Gamut Mapping](https://colorjs.io/docs/gamut-mapping)

CSS Color 4 §14는 클리핑, Closest Color(MINDE), Chroma Reduction, **Chroma Reduction with Local Clipping**, hue curvature 편차를 항목으로 나열하고, "Binary Search Gamut Mapping with Local MINDE", "EdgeSeeker", "Ray Trace" 세 구현을 의사코드와 함께 제시한다([CSS Color 4 §14](https://www.w3.org/TR/css-color-4/#gamut-mapping)).

### 판정

**culori를 쓴다.** 이유:

1. `toGamut()` 기본값이 CSS Color 4 알고리즘 그 자체 — 우리가 clamp 정책을 직접 구현할 필요가 없다.
2. **Okhsl/Okhsv 모드를 내장한 유일한 라이브러리.** §1에서 결론 낸 "chroma를 cusp 대비 비율로 다뤄야 한다"를 라이브러리가 이미 제공한다. cusp 계산 코드를 직접 짜지 않아도 된다.
3. 함수형 API + 트리셰이킹 → 빌드 스크립트에 넣기 가볍다.
4. 플레인 오브젝트 `{mode:'oklch', l, c, h}`를 다뤄서 override JSON 병합이 자연스럽다. colorjs.io는 클래스이고 `.toGamut()`이 **원본을 mutate**한다(문서 명시 caveat) — 파이프라인에서 지뢰다.

**단, APCA는 culori에 없다.** 대비 검증 단계에서만 `apca-w3` 패키지(Somers 공식 구현)를 따로 붙인다. chroma-js는 후보에서 뺀다 — 감마 매핑이 없어서 OKLCH 작업의 핵심을 못 채운다. Leonardo도 OKLCH 미지원으로 제외.

---

## 4. 실패 영역: 노랑과 청록에서 정확히 무슨 일이 일어나는가

### 4.1 노랑 — cusp가 흰색에 붙어 있어서 램프가 단조롭게 어두워질 수 없다

§1 표: yellow(95°)의 cusp는 **L=0.884**. 즉 가장 진한 노랑은 거의 흰색 근처에 있다. L=0.50에서 쓸 수 있는 최대 chroma는 0.103 — cusp의 57%밖에 안 된다. L=0.30에서는 0.062, 34%.

결과적으로 **"L을 균등하게 내리면서 chroma를 유지"하는 램프는 노랑에서 성립하지 않는다.** 어두운 노랑은 물리적으로 존재하지 않고, 억지로 만들면 올리브/갈색이 된다.

Radix가 이걸 어떻게 처리하는지 실제 값으로 확인했다 — **램프의 단조성을 깨버린다:**

| yellow (light) | L | C | H |
|---|---|---|---|
| 7 | 0.835 | 0.120 | 93 |
| 8 | 0.766 | 0.137 | 90 |
| **9** | **0.918** | **0.184** | **101** |
| **10** | **0.897** | 0.185 | 97 |
| 11 | 0.569 | 0.119 | **77** |
| 12 | 0.358 | 0.046 | 87 |

step 9·10이 step 8보다 **밝다.** L이 0.766 → 0.918로 튄다. 단조 감소하는 L 곡선이 아니다. 그리고 step 11에서 hue가 **101° → 77°로 24° 이동** — 어두운 노랑을 성립시키려고 주황 쪽으로 밀었다. step 12는 chroma가 0.046으로 사실상 붕괴한다.

Tailwind도 같은 짓을 한다: yellow hue 102.2(50) → **53.8**(950). 48° 이동.

**즉 노랑에 대한 업계 관행은 "알고리즘을 고친다"가 아니라 "override한다"이다.** 그리고 override 대상은 chroma 하나가 아니라 **L·C·H 셋 다**이며, 심지어 램프의 단조성 자체다.

### 4.2 청록 — 램프가 죽는 게 아니라 처음부터 흐리다

cyan(210°)의 cusp C는 **0.145** — violet(0.293)의 절반, red(0.255)의 57%. 어느 L에서도 진한 청록은 없다.

Radix cyan의 최대 chroma는 step 9의 0.122. 같은 위치 blue는 0.193이다. 즉 **cyan 램프는 blue 램프와 같은 파라미터를 줘도 눈에 띄게 밍밍하다.** 이건 감마 클램핑 실패가 아니라 hue 자체의 성질이다.

여기서 고정 절대 chroma 파라미터의 문제가 드러난다. `chromaPeak = 0.19`를 상수로 두면:
- blue: 잘 나옴
- violet: 낼 수 있는 0.293을 34% 버림
- **cyan: 0.145 벽에 부딪혀 감마 매핑이 계속 걸림 → 여러 단계가 같은 색으로 뭉개짐**

마지막 증상이 특히 나쁘다. `clampChroma`는 감마 밖 색들을 전부 감마 경계로 밀어붙이므로, 인접 단계가 시각적으로 구분되지 않게 된다. **감마 클램핑은 램프의 "단계 구별성"을 조용히 파괴한다.**

### 4.3 대응 원칙

1. **정규화된 saturation을 쓴다.** `C = cuspC(L, H) × sat[i]`. cyan은 자동으로 낮은 절대 chroma를, violet은 높은 절대 chroma를 갖는다. 램프의 *상대적 형태*가 hue 간에 일관된다.
2. **클램핑은 최후 방어선이지 설계 수단이 아니다.** 생성 단계에서 이미 감마 안에 있어야 하고, `toGamut()`은 부동소수 오차 정리용으로만 걸린다. 클램핑이 실제로 chroma를 크게 깎았다면 **경고를 띄운다** (아래 lint).
3. **단계 구별성을 검증한다.** 인접 단계의 `differenceEuclidean('oklch')`가 임계값 미만이면 실패로 본다.
4. **hue shift를 파라미터로 넣는다.** 안 넣으면 노랑 램프가 성립하지 않는다.

---

## 5. hue shift — 넣는가, 왜 넣는가

**넣는다. Tailwind도 Radix도 넣는다.** (§2.3, §4.1의 실측치)

이유는 두 가지고, 서로 다르다:

1. **감마상의 필요.** 노랑처럼 cusp가 극단에 있는 hue는 hue를 옮기지 않으면 어두운 단계에서 chroma가 붕괴한다. 노랑 → 주황/올리브 방향(hue 감소)으로 밀면 cusp L이 내려오면서(yellow 0.884 → orange 0.710) 어두운 쪽에 chroma 여유가 생긴다. 이게 Tailwind yellow의 48° 이동의 정체다.
2. **지각적 자연스러움 (Abney 효과 / Bezold–Brücke).** OKLCH는 Abney 효과를 완전히 보정하지 않는다. CSS Color 4 §14가 감마 매핑 논의에서 "Deviations from Perceptual Uniformity: **Hue Curvature**"를 별도 항목으로 두는 것도 같은 맥락이다. 특히 파랑 계열은 chroma를 줄이면 hue가 보라 쪽으로 밀려 보이는데, 이를 상쇄하려면 반대로 미세 보정을 넣어야 한다.

실측된 관행:
- Radix blue: 239 → 259, 어두워질수록 **+20°** (보라 방향)
- Radix cyan: 203 → 222, 어두워질수록 **+19°**
- Radix yellow: 101(step 9) → 77(step 11), 어두워질수록 **−24°** (주황 방향)
- Tailwind red: 17.4 → 27.5, **+10°**

**패턴: 파랑/청록은 어두울수록 hue를 늘리고(보라 쪽), 노랑/주황은 어두울수록 hue를 줄인다(빨강 쪽).** 둘 다 "어두워질수록 cusp L이 낮은 이웃 hue로 이동"으로 설명된다.

설계상 이걸 자동으로 유도하려 하면 과설계다. **`hueShift: [dark, light]` 두 값(도 단위)으로 두고 곡선으로 보간하는 게 실측 관행과 정확히 맞는다.** 기본값 0, 노랑 계열만 override.

---

## 6. 대비 검증 — WCAG 2 vs APCA

### 차이

APCA 저자 Andrew Somers의 문서([Why APCA](https://git.apcacontrast.com/documentation/WhyAPCA))가 지적하는 WCAG 2.x의 결함:

- CRT 시대 기준이고 현대 디스플레이/모바일에 갱신되지 않음
- 이진 pass/fail인데 "contrast does not apply in a binary way across perception nor impairments"
- **결정적: 어두운 색에서 대비를 과대평가한다.** 4.5:1이 "can be functionally unreadable when a color is near black" — 다크모드 설계에 부적합
- 극성(polarity) 무시. 밝은 배경 위 어두운 글씨와 그 반대는 지각이 다른데 WCAG 2는 같게 본다

APCA의 Lc 척도는 지각적으로 선형이다 ("halving or doubling the APCA value relates to a halving or doubling of the perceived contrast"). 임계:

| Lc | 용도 |
|---|---|
| 90 | 본문 텍스트 권장 (14px+ normal) |
| 75 | 본문 텍스트 최소 (18px+) |
| 60 | 일반 읽기 콘텐츠 최소 |
| 45 | 헤드라인·픽토그램 최소 |

상태: WCAG 3 후보. **아직 표준이 아니다.**

### 현실적 판정

**둘 다 계산하되, 게이트는 WCAG 2 AA, 리포트는 APCA.**

- **WCAG 2 (4.5:1 / 3:1)를 CI 실패 조건으로 둔다.** 법적·계약적 요구사항으로 실재하는 건 이쪽뿐이다. APCA로만 검증하면 "AA 준수"를 주장할 근거가 없다.
- **APCA Lc를 병기해서 출력한다.** 다크모드 램프를 다듬을 때 WCAG 2는 거짓 통과를 준다 (§어두운 색 과대평가). Radix가 step 11/12 보장을 APCA Lc 60/90으로 표현한 것도, Radix 생성기의 `getTextColor`가 `contrastAPCA() < 40`을 분기로 쓰는 것도 이 때문이다.
- **검증 대상 조합을 명시적으로 좁힌다.** 전조합 검사는 노이즈다. 실제로 semantic이 만들어내는 쌍만 검사한다:
  - `text.primary` on `bg.default` / `bg.subtle`
  - `text.muted` on `bg.default`
  - `text.onSolid` on `solid` (각 패밀리, light·dark 양쪽)
  - `border.default` on `bg.default` (비텍스트, 3:1)

라이브러리: WCAG는 `culori.wcagContrast`, APCA는 `apca-w3`. (culori에 APCA 없음 — §3 확인)

---

## 7. 램프 생성기 설계안

다음 프로토타입 티켓(#6)이 그대로 구현할 수 있는 수준으로 적는다.

### 7.1 결정 요약

| 항목 | 결정 |
|---|---|
| 라이브러리 | **culori** (`culori/fn`, 트리셰이킹 import) |
| 보조 | **`apca-w3`** (APCA Lc 리포트 전용) |
| 작업 공간 | OKLCH. chroma는 **cusp 대비 정규화 saturation(0–1)** 으로 파라미터화 |
| cusp 계산 | 자체 이분탐색 (`culori.displayable` 사용). Okhsl 변환은 쓰지 않음 — 우리가 원하는 건 cusp 값이지 Okhsl 좌표계가 아님 |
| L 곡선 | 앵커 기반 + `easingSmoothstep`/베지어 보간 |
| 감마 | 생성 시 이미 in-gamut. 마지막에 `toGamut('rgb','oklch')` (CSS Color 4) 로 정리 + 클램프량 경고 |
| 출력 | 램프당 sRGB hex + OKLCH 문자열 둘 다 |
| 다크 | 램프 한 벌 + `darkChromaBias` 2점 보정 (배경 끝 +, 텍스트 끝 −) |
| 단계 수 | **12단 (Radix 규약)** ← 아래 근거 |

**12단을 권고하는 근거:** 맵의 semantic 계층이 shadcn alias를 출력해야 하고, shadcn/Radix 어휘(`background / muted / border / primary / foreground`)가 Radix 12단의 용도 구획(1–2 배경, 3–5 컴포넌트, 6–8 보더, 9–10 solid, 11–12 텍스트)과 1:1로 대응한다. Tailwind의 11단(50–950)은 semantic 매핑 시 "어느 단계가 보더인가"에 대한 규약이 없다. 다만 Tailwind 소비처와의 친화성을 위해 **12단 램프에 Tailwind식 별칭(50…950)을 부여하는 alias 테이블을 함께 출력**한다.

### 7.2 입력 파라미터

```jsonc
// tokens/ramps.config.json
{
  "steps": 12,

  // 모든 패밀리의 공통 기본값. 패밀리에서 부분 덮어쓰기 가능
  "defaults": {
    // --- lightness ---
    // 앵커: [단계인덱스(0-based), L]. 사이는 곡선 보간.
    "lightnessAnchors": [[0, 0.993], [5, 0.865], [8, 0.650], [11, 0.320]],
    "lightnessEasing": "smoothstep",     // linear | smoothstep | bezier
    "lightnessBezier": [0.0, 2.0, 0.0, 2.0],  // Radix lightModeEasing 참고

    // --- chroma (cusp 대비 정규화, 0..1) ---
    // 벨 커브: peak 위치와 폭 + 양 끝 값
    "satPeakStep": 8,        // step 9 (0-based 8) 가 가장 진함 — Radix 규약
    "satPeak": 0.90,         // cusp의 90%
    "satBgEnd": 0.05,        // step 1 쪽
    "satTextEnd": 0.45,      // step 12 쪽
    "satCurve": "gaussian",  // gaussian | bezier
    "satSigma": 4.2,         // gaussian 폭 (단계 단위)

    // --- hue ---
    "hueShift": [0, 0],      // [가장어두운단계, 가장밝은단계] 도(°) 오프셋
    "hueEasing": "linear",

    // --- 안전장치 ---
    "textChromaCap": true,   // step 11,12 의 C <= max(C9, C8)  (Radix 로직)
    "minStepDelta": 0.012    // 인접 단계 최소 deltaEOK — 미만이면 lint 경고
  },

  // 다크 보정. 단일 스칼라가 아니라 2점. §2.2 참고
  "dark": {
    "backgroundL": 0.155,        // 다크 캔버스 L
    "lightnessBezier": [1, 0, 1, 0],   // Radix darkModeEasing
    "satBiasBg":   1.9,          // 배경 쪽(step1~5) sat 배수  — 다크가 더 진함
    "satBiasText": 0.60,         // 텍스트 쪽(step11~12) sat 배수 — 다크가 덜 진함
    "anchorStep": 8              // 이 단계는 light/dark 동일 (브랜드 앵커)
  },

  "families": {
    "brand":   { "key": "#3B82F6" },
    "neutral": { "key": "#71717A", "satPeak": 0.06, "satTextEnd": 0.03 },
    "danger":  { "key": "#EF4444" },
    "success": { "key": "#16A34A" },

    // 노랑을 추가하는 순간 필요해지는 형태 — 미리 규약을 박아둔다
    "warning": {
      "key": "#EAB308",
      "hueShift": [-26, 4],          // 어두울수록 주황 쪽 (§5)
      "satPeakStep": 8,
      "overrides": {                  // §7.5
        "light": {
          "9":  { "l": 0.918, "c": 0.184, "h": 101 },
          "10": { "l": 0.897 },
          "11": { "l": 0.569, "h": 77 },
          "12": { "c": 0.046 }
        }
      },
      "allowNonMonotonicL": true      // 노랑은 단조 L 검사를 면제
    }
  },

  "contrast": {
    "gate": "wcag2",        // CI 실패 기준
    "wcagText": 4.5,
    "wcagLarge": 3.0,
    "wcagNonText": 3.0,
    "reportApca": true,
    "apcaTargets": { "body": 75, "secondary": 60, "nonText": 45 }
  }
}
```

### 7.3 알고리즘 (의사코드)

```
import { converter, displayable, toGamut, differenceEuclidean,
         wcagContrast, formatHex, formatCss } from 'culori/fn'

const toOklch = converter('oklch')
const fitGamut = toGamut('rgb', 'oklch')      // CSS Color 4 기본값

// ── 헬퍼: 주어진 (L,H)에서 sRGB 안에 들어가는 최대 chroma ──────────
function cuspChroma(L, H):
    lo = 0; hi = 0.5
    repeat 24 times:                          // 2^-24 * 0.5 ≈ 3e-8, 충분
        mid = (lo + hi) / 2
        if displayable({mode:'oklch', l:L, c:mid, h:H}): lo = mid
        else: hi = mid
    return lo

// ── 1. 램프 생성 ────────────────────────────────────────────────
function buildRamp(family, cfg, mode /* 'light' | 'dark' */):
    key   = toOklch(family.key)
    N     = cfg.steps
    p     = merge(cfg.defaults, family)       // 패밀리가 defaults를 덮어씀

    // 1a. L 곡선
    //     앵커 사이를 easing으로 보간해 N개 L값 생성
    L = interpolateAnchors(p.lightnessAnchors, N, p.lightnessEasing)

    //     다크: 배경 L에 맞춰 곡선 전체를 베지어 가중치로 평행이동
    //     (Radix transposeProgressionStart 와 동일한 발상)
    if mode == 'dark':
        L = transposeToBackground(L, cfg.dark.backgroundL, cfg.dark.lightnessBezier)
        L = reverse(L)                        // 다크는 1이 어둡고 12가 밝음
        L[p.satPeakStep] = key.l              // 앵커 단계는 light와 동일하게 (§2.2)

    // 1b. hue 곡선 — 어두운 끝 → 밝은 끝 선형/이징 보간
    H = []
    for i in 0..N-1:
        t = i / (N-1)                          // 0 = step1, 1 = stepN
        H[i] = key.h + lerp(p.hueShift[0], p.hueShift[1], ease(t, p.hueEasing))
        H[i] = mod(H[i], 360)

    // 1c. 정규화 saturation 곡선 (벨 커브)
    sat = []
    for i in 0..N-1:
        if p.satCurve == 'gaussian':
            g = exp(-((i - p.satPeakStep)^2) / (2 * p.satSigma^2))
        else:
            g = bezierBell(i, N, p)
        // 양 끝값으로 재매핑
        endVal = (i < p.satPeakStep) ? p.satBgEnd : p.satTextEnd
        sat[i] = endVal + (p.satPeak - endVal) * g

        // 다크 보정 — 단일 스칼라가 아니라 위치 의존 (§2.2)
        if mode == 'dark':
            w = i / (N-1)
            bias = lerp(cfg.dark.satBiasBg, cfg.dark.satBiasText, w)
            if i != cfg.dark.anchorStep: sat[i] = clamp(sat[i] * bias, 0, 1)

    // 1d. sat → 절대 chroma. 여기가 핵심 (§1, §4)
    C = []
    for i in 0..N-1:
        C[i] = cuspChroma(L[i], H[i]) * sat[i]

    // 1e. 키 컬러 앵커링 — 사용자가 준 색이 램프 안에 실제로 존재해야 한다
    //     (Radix가 step9에 키 컬러를 그대로 꽂는 것과 같은 취지)
    a = p.satPeakStep
    if mode == 'light' or a == cfg.dark.anchorStep:
        L[a] = key.l; C[a] = key.c; H[a] = key.h

    // 1f. Radix 텍스트 채도 상한 (§2.1 step7)
    if p.textChromaCap:
        cap = max(C[a], C[a-1])
        C[N-2] = min(C[N-2], cap)
        C[N-1] = min(C[N-1], cap)

    // 1g. 수동 override 주입 — 감마 매핑 전 (§7.5)
    applyOverrides(L, C, H, family.overrides?[mode])

    // 1h. 감마 정리 + 클램프량 측정
    ramp = []
    for i in 0..N-1:
        raw    = {mode:'oklch', l:L[i], c:C[i], h:H[i]}
        fitted = fitGamut(raw)
        clampAmount = C[i] - fitted.c
        ramp.push({ step: i+1, oklch: fitted, clampAmount })

    return ramp
```

### 7.4 lint / 검증 패스 (생성 직후, 빌드 실패 조건)

```
function lintRamp(ramp, family, cfg, mode):
    issues = []

    // L1. 감마 클램핑이 실제로 색을 깎았는가
    for s in ramp:
        if s.clampAmount > 0.005:
            issues.warn(`${family}.${mode}.${s.step}: chroma가 감마 매핑으로
                         ${s.clampAmount.toFixed(3)} 깎임. satPeak를 낮추거나
                         override를 넣을 것 (§4)`)

    // L2. 단계 구별성 — 클램핑이 인접 단계를 뭉갰는지 (§4.2)
    for i in 1..N-1:
        d = differenceEuclidean('oklch')(ramp[i-1].oklch, ramp[i].oklch)
        if d < cfg.defaults.minStepDelta:
            issues.error(`${family}.${mode}.${i}↔${i+1}: deltaEOK ${d} — 구별 불가`)

    // L3. L 단조성 (노랑류는 면제)
    if not family.allowNonMonotonicL:
        assert L이 단조 감소(light) / 단조 증가(dark)
        // 위반 시 error + "allowNonMonotonicL 를 켜고 override 하라" 안내

    // L4. 대비 게이트 (§6) — semantic이 실제로 만드는 쌍만
    for [fg, bg] in contrastPairsFor(mode):
        r = wcagContrast(fg, bg)
        lc = apcaContrast(fg, bg)                 // apca-w3
        if r < cfg.contrast.wcagText: issues.error(...)
        report(`${fg}/${bg}  WCAG ${r.toFixed(2)}:1   APCA Lc ${lc.toFixed(0)}`)

    return issues
```

`clampAmount > 0` 인데 lint를 통과하는 경우는 부동소수 오차뿐이어야 한다. **감마 클램핑이 설계를 대신하고 있으면 반드시 시끄럽게 알린다** — 이게 §4.2에서 본 "조용한 뭉개짐"을 막는 유일한 장치다.

### 7.5 override 지점 — 어디에, 어떤 문법으로

override는 **세 계층**으로 두고, 아래로 갈수록 좁고 강하다.

**① 패밀리 파라미터 override** — 곡선 자체를 바꾼다. 가장 선호.
```jsonc
"warning": { "key": "#EAB308", "satPeak": 0.82, "hueShift": [-26, 4] }
```

**② 단계 값 override** — 특정 단계의 L/C/H를 직접 못박는다. 노랑처럼 곡선으로 해결 불가한 경우.
```jsonc
"warning": {
  "overrides": {
    "light": { "11": { "l": 0.569, "h": 77 } },
    "dark":  { "12": { "c": 0.075 } }
  }
}
```
- 부분 지정 가능 (`l`만, `h`만). 미지정 채널은 계산값 유지.
- 알고리즘 파이프라인의 **1g** 위치 — 텍스트 채도 상한 뒤, 감마 매핑 앞. 즉 override 값도 감마 검증은 받는다.

**③ 완전 하드코딩 escape hatch** — 램프 전체를 손으로 넣는다. 최후수단.
```jsonc
"brand": { "hardcode": { "light": ["#fbfdff", ...12개], "dark": [...] } }
```
`hardcode`가 있으면 생성기를 완전히 우회하되 **lint는 그대로 돈다.**

**규약:** ①로 안 되면 ②, ②가 3단계 이상 필요하면 ③을 검토한다. 모든 override는 JSON에 `"_why"` 필드로 이유를 남긴다 — 나중에 키 컬러를 바꿨을 때 이 override가 아직 유효한지 판단할 근거가 된다.

### 7.6 출력 형태

```
build/ramps.json
{
  "brand": {
    "light": [
      { "step": 1, "hex": "#fbfdff", "oklch": "oklch(99.3% 0.003 248)", "sat": 0.05 },
      ...
    ],
    "dark":  [ ... ]
  },
  ...
}
```

- `hex`: sRGB 폴백 (Figma Variables가 이걸 먹는다 — Figma는 OKLCH를 모른다)
- `oklch`: Tailwind v4 `@theme` 출력용
- `sat`: 디버깅/Huetone 왕복용 (§2.5)
- Tailwind 별칭 테이블(`50…950` → 12단 인덱스)을 별도 파일로 함께 출력

### 7.7 다음 티켓(#6)이 해야 할 검증

1. brand(파랑) 램프를 생성해 Radix blue와 OKLCH 좌표를 나란히 놓고 비교
2. **warning(노랑)을 override 없이 먼저 돌려서 lint가 실제로 실패하는지 확인** — 실패하지 않으면 lint 임계값이 헐거운 것
3. cyan 계열 키 컬러를 하나 넣어 `clampAmount`와 `minStepDelta` 경고가 뜨는지 확인 (§4.2)
4. 다크 램프의 배경 끝 chroma가 라이트보다 **높게** 나오는지 확인 (§2.2 — 낮게 나오면 `satBiasBg` 부호를 잘못 이해한 것)
5. Huetone에 붙여넣어 4개 패밀리의 L 곡선이 겹치는지 눈으로 확인

---

## 8. 맵 #1에 반영할 사항

| 맵의 기존 서술 | 조사 결과 |
|---|---|
| "dark 채도 보정 파라미터를 램프 생성기에 둔다" | **단일 감쇠 계수로 두면 안 됨.** Radix 실측상 다크는 배경 끝 chroma가 라이트보다 **3배 높고** 텍스트 끝은 낮다. `satBiasBg` / `satBiasText` 2점 보정으로 정정 (§2.2) |
| "hihayk/scale은 생성기가 아니라 눈 검증 도구" | 유효. 다만 **Huetone이 그 역할에 더 적합** — L/C/H 곡선을 패밀리 간 겹쳐 보고 APCA를 동시에 표시 (§2.5) |
| "램프 단계 수 미정" | **12단 (Radix 규약) 권고.** shadcn alias 매핑이 Radix 용도 구획과 1:1 대응. Tailwind 별칭 테이블 병행 출력 (§7.1) |
| "대비 검증 기준 WCAG AA vs APCA 미정" | **게이트는 WCAG 2 AA, 리포트는 APCA 병기.** APCA는 아직 표준이 아니지만 다크모드에서 WCAG 2가 거짓 통과를 준다 (§6) |
| "override 문법 미정" | 3계층 규약 제안 (§7.5) |
| "빌드 스크립트가 OKLCH로 계산 생성" | 유효하되 **chroma는 절대값이 아니라 cusp 대비 정규화 비율**이어야 함. 이게 이 조사의 가장 중요한 설계 제약 (§1) |

---

## 부록: cusp 계산 스크립트

§1 표를 만든 코드. culori 없이 Ottosson 행렬만으로 돈다.

```js
function oklabToLrgb(L, a, b) {
  const l_ = L + 0.3963377774*a + 0.2158037573*b;
  const m_ = L - 0.1055613458*a - 0.0638541728*b;
  const s_ = L - 0.0894841775*a - 1.2914855480*b;
  const l = l_**3, m = m_**3, s = s_**3;
  return [ 4.0767416621*l - 3.3077115913*m + 0.2309699292*s,
          -1.2684380046*l + 2.6097574011*m - 0.3413193965*s,
          -0.0041960863*l - 0.7034186147*m + 1.7076147010*s];
}
function inSrgb(L, C, H) {
  const a = C*Math.cos(H*Math.PI/180), b = C*Math.sin(H*Math.PI/180);
  const [r, g, bl] = oklabToLrgb(L, a, b), e = 1e-6;
  return r>=-e && r<=1+e && g>=-e && g<=1+e && bl>=-e && bl<=1+e;
}
function maxC(L, H) {
  let lo=0, hi=0.5;
  for (let i=0;i<40;i++){ const m=(lo+hi)/2; inSrgb(L,m,H) ? lo=m : hi=m; }
  return lo;
}
```

## 출처

- [culori API](https://culorijs.org/api/) / [`src/clamp.js`](https://github.com/Evercoder/culori/blob/main/src/clamp.js) / [src 트리](https://github.com/Evercoder/culori/tree/main/src)
- [colorjs.io — Gamut Mapping](https://colorjs.io/docs/gamut-mapping)
- [chroma.js 문서](https://gka.github.io/chroma.js/)
- [CSS Color Module Level 4 §14 Gamut Mapping](https://www.w3.org/TR/css-color-4/#gamut-mapping)
- [Radix — `generate-radix-colors.tsx`](https://github.com/radix-ui/website/blob/main/components/generate-radix-colors.tsx)
- [Radix Colors — `src/light.ts`](https://github.com/radix-ui/colors/blob/main/src/light.ts) / [`src/dark.ts`](https://github.com/radix-ui/colors/blob/main/src/dark.ts)
- [Radix Colors — Understanding the scale](https://www.radix-ui.com/colors/docs/palette-composition/understanding-the-scale)
- [Tailwind CSS — `packages/tailwindcss/theme.css`](https://github.com/tailwindlabs/tailwindcss/blob/main/packages/tailwindcss/theme.css)
- [Tailwind CSS v4.0 발표](https://tailwindcss.com/blog/tailwindcss-v4)
- [Adobe Leonardo — `@adobe/leonardo-contrast-colors` README](https://github.com/adobe/leonardo/blob/main/packages/contrast-colors/README.md)
- [ardov/huetone](https://github.com/ardov/huetone)
- [Björn Ottosson — sRGB gamut clipping](https://bottosson.github.io/posts/gamutclipping/)
- [Björn Ottosson — Okhsv and Okhsl](https://bottosson.github.io/posts/colorpicker/)
- [Andrew Somers — Why APCA](https://git.apcacontrast.com/documentation/WhyAPCA)
