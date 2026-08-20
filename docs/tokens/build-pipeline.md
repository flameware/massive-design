# 리포 구조와 빌드 파이프라인

확정: 2026-08-19 · 근거 티켓 [#11](https://github.com/flameware/massive-design/issues/11) · 맵 [#1](https://github.com/flameware/massive-design/issues/1)

입력: [#6](https://github.com/flameware/massive-design/issues/6) 생성기 파라미터 · [#7](https://github.com/flameware/massive-design/issues/7) semantic 30개·컬렉션 구조 · [#8](https://github.com/flameware/massive-design/issues/8) 비색상 스케일 · [#5](https://github.com/flameware/massive-design/issues/5) Tailwind·shadcn · [#4](https://github.com/flameware/massive-design/issues/4) Figma API · [#13](https://github.com/flameware/massive-design/issues/13) 알파

이 문서는 **다음 사람이 이대로 만들면 되는** 수준을 목표로 한다.

---

## 0. 뒤집힌 결정 하나

**Style Dictionary v4를 쓰지 않는다.** 맵 차팅 때 "SD 유지"로 기울었으나 #11에서 뒤집었다.

| SD를 버린 이유 | |
|---|---|
| 출력물 3종이 **전부 커스텀 포맷** | Tailwind `@theme inline` + shadcn raw 34 + `@custom-variant`, Figma 주입 JS, TS 타입 — SD 내장 포맷으로 나오는 게 하나도 없다. SD의 기여가 "커스텀 format 3개를 등록할 자리" 로 축소된다 |
| **transform 파이프라인이 논다** | SD의 핵심 가치는 px→dp→pt 같은 플랫폼별 단위 변환인데 우리는 단일 플랫폼이다. 색은 hex/oklch, 치수는 rem 하나 |
| **다크 모델이 안 맞는다** | 우리는 Primer식 토큰 옆 인라인 override(`$extensions`)인데 SD 토큰은 값이 하나다. preprocessor를 직접 써야 한다 |
| **램프 생성은 이미 SD 바깥** | SD가 받는 건 이미 계산이 끝난 값이다 |
| **alias 그래프가 1단 깊이** | #7에서 component 계층을 없앴으므로 `semantic → palette` 한 단계뿐. 해석기가 50줄이 안 된다 |

**대가**: alias 해석과 DTCG 검증을 직접 쓴다(`scripts/lib/resolve.mjs`).
**되돌리는 조건**: 플랫폼이 둘 이상이 될 때(iOS/Android). 그때의 이주 비용이 지금 SD를 떠안는 비용보다 작다.

---

## 1. 디렉터리 트리

> **[#12](https://github.com/flameware/massive-design/issues/12) 갱신**: 리포가 모노리포가 되면서 아래 트리는 통째로 **`packages/tokens/`** 밑으로 내려간다([ADR-0001](../adr/0001-monorepo-over-split-repos.md)). 구조·파일명·역할은 한 줄도 바뀌지 않고 위치만 바뀐다. 루트에는 워크스페이스 선언(`workspaces: ["packages/*", "apps/*"]`)과 `docs/`만 남는다. 설치는 `bun install`, 빌드 런타임은 node 그대로.

```
packages/tokens/                       # name: "@massive/tokens"
├── package.json                       # type: module, node >= 22
├── tokens/                            # ── 원본 (source of truth)
│   ├── ramp.config.json               # 키 컬러 4종 + 생성기 파라미터 (#6)
│   ├── primitive/
│   │   ├── color.gen.json             # ⚙ 생성물 · 커밋함 · 손대지 말 것 (96색)
│   │   ├── color.literal.json         # base.white/black + alpha 3 = 5개 (#13)
│   │   └── scale.json                 # 비색상 전부 (#8)
│   ├── semantic/
│   │   └── color.json                 # 30개 + 다크 인라인 override (#7)
│   └── alias/
│       └── shadcn.json                # shadcn 34개 → 우리 semantic 매핑
├── scripts/
│   ├── ramp.mjs                       # ramp.config → color.gen.json
│   ├── build.mjs                      # tokens/** → dist/**
│   ├── lint.mjs                       # 3개 규칙군
│   ├── contrast.mjs                   # AA 게이트 + APCA 병기
│   ├── verify.mjs                     # 재생성 후 git diff --exit-code
│   └── lib/
│       ├── oklch.mjs                  # culori 래퍼 + cusp 탐색
│       ├── resolve.mjs                # DTCG `{a.b.c}` alias 해석
│       └── emit/{css,figma,types}.mjs
├── dist/                              # ⚙ 생성물 · 커밋함 (= 배포 채널)
│   ├── tokens.css
│   ├── tokens.d.ts
│   └── figma/
│       ├── 01-collections.js
│       ├── 02-palette-color.js
│       ├── 03-palette-scale.js
│       ├── 04-semantic.js
│       ├── 05-text-styles.js
│       └── 06-effect-styles.js
├── docs/  (research · adr · tokens · agents)
└── prototypes/ramp-generator.prototype.html   # 버릴 코드. 승격하지 않는다
```

**규약: `.gen.json` 접미사 = 생성물.** 손편집 금지, `tokens:verify`가 감시한다.
프로토타입은 culori 대신 변환 행렬을 직접 넣어 의존성 0으로 만든 **버릴 코드**다(파일 상단에 그렇게 적혀 있다). `scripts/lib/oklch.mjs`는 culori 위에 새로 쓴다 — 수학은 같지만 검증된 라이브러리를 쓴다.

### 의존성

`culori`(OKLCH·cusp·감마), `apca-w3`(APCA 병기). **이 둘뿐이다.** 테스트는 `node --test` 내장.

---

## 2. 생성물을 커밋한다

| 대상 | 커밋 | 이유 |
|---|---|---|
| `tokens/primitive/color.gen.json` | ✅ | 키 컬러 한 줄 수정의 파급이 **PR diff에 hex로 뜬다.** #6에서 `chromaRefCap` 수정의 타당성을 판단한 근거가 정확히 이 diff(`#92f0a5 → #a6ebb2`)였다 |
| `dist/**` | ✅ | npm 배포가 out of scope이므로 **커밋이 곧 배포 채널이다.** 소비처(invest diary)가 `dist/tokens.css`를 복사해 간다 |
| Figma 주입 기록 | ❌ | Figma가 상태를 갖고 있다. 리포가 중복 보관할 이유가 없다 |

어긋남은 `tokens:verify`가 잡는다(§4.5). 이 결정을 뒤집으려면 npm 배포를 도입해야 하고, 그건 맵의 out-of-scope를 다시 여는 일이다.

---

## 3. 원본 파일 형식

### 3.1 `tokens/ramp.config.json`

```jsonc
{
  "defaults": {
    "steps": 12,
    "lightnessAnchors": {
      "light": [[0, 0.993], [5, 0.865], [11, 0.320]],
      "dark":  [[0, 0.155], [2, 0.235], [5, 0.375], [11, 0.930]]
    },
    "lightnessEasing": "smoothstep",
    "satPeakStep": 8, "satPeak": 0.90, "satSigma": 4.2,
    "satBgEnd": 0.05, "satTextEnd": 0.45,
    "dark": { "backgroundL": 0.155, "satBiasBg": 1.9, "satBiasText": 0.60, "anchorStep": 8 },
    "textChromaCap": true,
    "chromaRefCap": true,
    "minStepDelta": 0.012,
    "minLGapPerStep": 0.018,
    "minTailGapPerStep": 0.055
  },
  "families": {
    "brand":   { "key": "#0f5fed" },
    "neutral": { "key": "#727272",
                 "params": { "satPeak": 0, "satBgEnd": 0, "satTextEnd": 0 },
                 "_why": "순수 회색. brand hue 혼합 없음 — #6" },
    "danger":  { "key": "#db2931" },
    "success": { "key": "#20823e" }
  }
}
```

> **[#16](https://github.com/flameware/massive-design/issues/16) 정정**: neutral의 `satPeak: 0` 하나로는 순수 회색이 되지 않는다. 채도 벨 커브는 `endVal + (satPeak − endVal) × g` 이므로 peak만 0으로 두면 **양 끝값(`satBgEnd` 0.05 / `satTextEnd` 0.45)이 꼬리에 그대로 남아** 1·12단에 색이 실린다. 세 값을 모두 0으로 두어야 전 단계 C=0이 된다.

**index 8(step 9)의 L은 앵커 상수가 아니라 키 컬러의 L이 보간 *전에* 심긴다**(#6 결함 (a)). `lightnessAnchors`에 index 8이 없는 건 누락이 아니다.

### 3.2 override 규약 — ①만 구현한다

조사 §7.5의 3계층 중 **① 패밀리 파라미터만 v1에 구현한다.** 현재 실제 필요는 neutral의 `satPeak: 0` 하나뿐이고, #6에서 4패밀리 8램프가 ②③ 없이 lint를 통과했다.

**②를 지금 안 만드는 이유는 YAGNI가 아니다** — 만들면 쓸 자리가 없어 **검증되지 않은 채 남는다.** warning(노랑)을 추가하는 세션이 ②의 첫 사용자이자 첫 검증자가 되는 편이 낫고, 그 세션은 조사 §5(노랑은 L/C/H override + 밝기 단조 예외 필요)라는 명세를 이미 갖고 있다.

도입이 **설계가 아니라 구현**이 되도록 지금 못박아 두는 것:

- ② 자리는 `families.<name>.overrides.<mode>.<step> = { l?, c?, h?, _why }`
- 적용 지점은 알고리즘 **1g** — 텍스트 채도 상한 뒤, 감마 매핑 앞. override 값도 감마 검증을 받는다
- **모든 override에 `_why` 필수.** 키 컬러를 바꿨을 때 그 override가 아직 유효한지 판단할 유일한 근거다. `_why` 없으면 lint 에러
- **`ramp.mjs`는 미구현 키를 만나면 조용히 무시하지 말고 에러를 던진다.** 조용한 무시가 이 설계의 유일한 실패 양상이다

### 3.3 `tokens/primitive/color.gen.json` (생성물)

```jsonc
{
  "$extensions": {
    "design.massive.source": {
      "generator": "scripts/ramp.mjs",
      "config": "tokens/ramp.config.json",
      "configHash": "sha256:…"
    }
  },
  "palette": {
    "brand": {
      "light": { "1": { "$type": "color", "$value": "#fcfdfd",
                        "$extensions": { "design.massive.oklch": "oklch(99.2% 0.002 247.9)" } },
                 "…": {}, "12": {} },
      "dark":  { "1": {}, "…": {}, "12": {} }
    },
    "neutral": {}, "danger": {}, "success": {}
  }
}
```

**모드가 이름에 들어간다**(`palette.brand.dark.9`). #7이 확정한 Figma 구조 — `palette` 컬렉션은 **모드 1개**이고 96변수가 mode-explicit 이름을 갖는다. 모드 전환은 `semantic` 컬렉션(모드 2개)에서만 일어난다.

> ⚠️ 맵 확정 표의 "primitive 램프는 한 벌" 문구는 **낡았다.** 실제로는 **램프가 모드별 2벌, semantic 매핑이 (거의) 한 벌**이다 — 라이트만 `bg.canvas`/`bg.surface`가 교차하고 나머지 28개는 양 모드가 같은 단계 번호를 쓴다. #11에서 문구를 고쳤다.

`configHash`가 diff에 뜨는 시점은 config가 바뀐 시점뿐이고, 그건 값이 바뀌는 시점과 정확히 같다.

### 3.4 `tokens/semantic/color.json`

```jsonc
{
  "color": { "bg": { "accent": { "solid": {
    "$type": "color",
    "$value": "{palette.brand.light.9}",
    "$extensions": { "org.primer.overrides": { "dark": "{palette.brand.dark.9}" } }
  }}}}
}
```

### 3.5 `tokens/primitive/scale.json`

#8의 값 전부. 카테고리: `type.size`(9) · `type.lineHeight`(3) · `type.tracking`(3) · `type.family`(1) · `space`(13) · `radius`(base + 7) · `shadow`(5) · `borderWidth`(2) · `duration`(3) · `easing`(2) · `opacity`(3).

`type.*`와 `space`는 **CSS와 Figma에서 서로 다른 부분집합**이 나간다(#8 §3.2) — 이건 결함이 아니라 매체 차이다. `borderWidth`·`duration`·`opacity`는 **CSS 출력이 없고 Figma·TS에만** 나간다.

### 3.6 `tokens/alias/shadcn.json`

```jsonc
{ "primary": "color.bg.accent.solid",
  "primary-foreground": "color.fg.on-solid",
  "accent": "color.bg.subtle",          // ⚠ 브랜드가 아니라 hover 배경 (#5)
  "…": "…" }
```
34줄. **순수하게 기계적인 매핑 테이블**이다.

---

## 4. 스크립트

```jsonc
{
  "scripts": {
    "tokens:ramp":     "node scripts/ramp.mjs",
    "tokens:build":    "node scripts/build.mjs",
    "tokens:lint":     "node scripts/lint.mjs",
    "tokens:contrast": "node scripts/contrast.mjs",
    "tokens:verify":   "node scripts/verify.mjs",
    "check":           "npm run tokens:lint && npm run tokens:contrast && npm run tokens:verify"
  }
}
```

**`figma:push`는 존재하지 않는다.** 이유는 §5.

### 4.1 `tokens:ramp`

| | |
|---|---|
| 입력 | `tokens/ramp.config.json` |
| 출력 | `tokens/primitive/color.gen.json` (96색) |
| 실패 | 미구현 override 키 · `_why` 누락 · 램프 lint 위반(§4.3 A) |

램프 lint를 **생성 직후 인라인으로** 돌린다. 깨진 램프가 파일로 떨어지면 diff가 오염된다.

### 4.2 `tokens:build`

| | |
|---|---|
| 입력 | `tokens/**` 전부 |
| 출력 | `dist/tokens.css` · `dist/tokens.d.ts` · `dist/figma/0*.js` |

`dist/tokens.css`의 블록 순서 — **이 순서가 곧 #5의 4계층 alias 체인이다**:

```css
@custom-variant dark (&:where(.dark, .dark *));   /* Tailwind 공식형. shadcn CLI의 &:is(.dark *)는 토글 자신을 놓친다 */

:root {
  --ds-palette-brand-light-1: #fcfdfd;   /* devtools 추적용. @theme에 등록하지 않는다 (#7) */
  …
  --ds-bg-accent-solid: var(--ds-palette-brand-light-9);   /* semantic 30 */
  …
  --primary: var(--ds-bg-accent-solid);                     /* shadcn raw 34 */
  --radius: 0.625rem;
}

.dark { --ds-bg-accent-solid: var(--ds-palette-brand-dark-9); … }   /* semantic만 재선언 */

@theme inline {
  --color-primary: var(--primary);        /* shadcn 이름 34 */
  --spacing: 0.25rem;                     /* 비색상 26 (#8) */
  --text-sm--line-height: 1.6;
  --radius-md: 0.5rem;                    /* 곱셈 7단, 빌드 시점 선계산 */
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / .10), 0 2px 4px -2px rgb(0 0 0 / .10);
  …
}
```

- **`@theme inline`은 선택이 아니다**(#5 실측). 그냥 `@theme`이면 중첩 `.dark` 서브트리가 **조용히** 깨진다
- **`.dark`는 semantic만 재선언한다.** palette와 shadcn raw는 재선언하지 않는다 — 체인이 semantic 지점에서 갈리므로 아래는 자동으로 따라온다
- shadcn 34개를 `:root`에 **raw로** 내는 건 필수다. `style-nova.css`가 `color-mix(in oklch, var(--secondary), …)`로 `@theme`를 우회해 직접 읽는다(#5)

`dist/tokens.d.ts`:
```ts
export type SemanticColorToken = 'bg.canvas' | 'bg.surface' | … ;   // 30
export type PaletteToken = 'brand.light.1' | … ;                     // 96
export type ScaleToken   = 'space.4' | 'radius.md' | … ;
export declare const cssVar: Record<SemanticColorToken, string>;      // 'bg.canvas' → '--ds-bg-canvas'
export declare const palette: Record<PaletteToken, string>;           // hex. 모드가 이름에 있어 모호하지 않다
```
**semantic의 값은 타입으로 내보내지 않는다** — 모드 의존이라 런타임 CSS만이 정답을 안다.

### 4.3 `tokens:lint` — 3개 규칙군

**A. 램프** (`color.gen.json`)
1. 인접 단계 deltaEOK ≥ `minStepDelta`(0.012)
2. L 단조 — **방향을 램프에서 읽는다**(#6 결함 (d): 라이트 하드코딩이 다크 램프를 통째로 건너뛰었다). `allowNonMonotonicL` 플래그로 해제 가능
3. 전 단계가 sRGB 감마 안
4. step 9의 hex == 키 컬러 hex (앵커가 실제로 물렸는지)

**B. 계층·네이밍** (`tokens/**`)
5. semantic `$value`는 반드시 `{palette.*}` 참조 — 리터럴 금지
6. primitive는 참조 금지 — 리터럴만
7. semantic 이름에 색상명 금지: `blue|red|green|gray|grey|yellow|brand`. (`accent`/`danger`/`success`는 의미어라 허용)
8. semantic 색 토큰 **정확히 30개**. 늘리려면 무엇을 뺄지 함께 정한다(#7 회계 규칙)
9. 모든 override에 `_why` 존재

**C. 출력물** (`dist/tokens.css`)
10. `@theme` / `@theme inline` 블록 안에 `--ds-`로 시작하는 선언이 있으면 **에러** (#7)
11. `@theme`가 `inline` 없이 쓰이면 **에러** (#5)
12. `--color-X`와 `--text-X` 이름 충돌 (#5의 함정 — `text-X`가 색으로 해석된다)
13. shadcn 정본 34개가 `:root`에 전부 존재
14. `@custom-variant dark`가 `&:where(.dark, .dark *)` 형태

> 규칙 10·12는 **현재 구조상 위반이 불가능하다**(#7·#8). 그래도 남긴다 — 이 lint의 값은 위반을 잡는 게 아니라 **구조가 무너졌을 때 알려주는 것**이다.

**구현 수단**(맵 fog에서 미결이던 항목): 별도 도구를 도입하지 않는다. A·B는 JSON을 읽는 평범한 JS, C는 `dist/tokens.css`에 대한 정규식·괄호 스캔이다. Stylelint 플러그인을 쓸 만큼 규칙이 많지 않고, 규칙 10·11·13은 **Stylelint가 원래 모르는 도메인 규칙**이라 어차피 직접 써야 한다.

### 4.4 `tokens:contrast`

| | |
|---|---|
| 입력 | `tokens/semantic/color.json` + `color.gen.json` |
| 출력 | stdout 표 (`--report` 시 파일) |
| 판정 | **WCAG 2 AA가 게이트, APCA는 병기**(#6 확정) |

- 텍스트 42조합 ≥ **4.5** (현재 최저 4.80)
- 비텍스트 6조합 ≥ **3:1** (현재 최저 3.04)
- 두 모드 전부. 실패 시 exit 1

APCA로 게이트하지 않는 이유: APCA는 아직 WCAG 3 드래프트이고, 소비처의 접근성 요구가 실제로 걸리는 기준은 AA다. 병기는 나중에 게이트를 옮길 때의 기준선 데이터다.

### 4.5 `tokens:verify`

`tokens:ramp` + `tokens:build`를 임시 디렉터리에 재실행하고 커밋된 산출물과 비교한다. 다르면 exit 1 + 어느 파일인지 출력. **생성물 커밋(§2)이 성립하려면 이게 있어야 한다.**

---

## 5. Figma 주입은 스크립트가 아니라 절차다

**`npm run figma:push`는 존재할 수 없다.** 주입 경로는 MCP `use_figma`이고 그건 에이전트가 호출한다. Variables REST 쓰기는 Enterprise 전용이라 막혀 있다(#4 확정).

그래서 **빌드가 `use_figma`의 `code` 파라미터에 그대로 들어갈 JS를 생성한다.** flat JSON만 내고 주입할 때 에이전트가 코드를 새로 쓰는 방식은 택하지 않았다 — 그러면 주입할 때마다 다른 코드가 돌고, #10에서 한 번 뚫은 순서를 다음 주입 때 다시 뚫어야 한다.

**파일명 번호가 곧 실행 순서다** (#4가 확정한 6단계):

| 파일 | 내용 | 인코딩된 제약 |
|---|---|---|
| `01-collections.js` | `palette`(1모드) · `semantic`(Light/Dark 2모드) 생성 | 컬렉션당 모드 상한 10 |
| `02-palette-color.js` | 96색 + 리터럴 5 | Variable 값은 **RGB/RGBA만**, 파일 프로파일 sRGB |
| `03-palette-scale.js` | 수치·타이포 FLOAT/STRING | `scopes` 명시 필수 — space는 `GAP, WIDTH_HEIGHT`, radius는 `CORNER_RADIUS`. `ALL_SCOPES`는 모든 피커를 오염시킨다 |
| `04-semantic.js` | 30 × 2모드 크로스 컬렉션 alias | |
| `05-text-styles.js` | 9 스타일 + 변수 바인딩 | `lineHeight`는 `{unit:'PERCENT', value}` 객체 — 맨 숫자는 throw. **텍스트를 다 쓴 뒤 마지막에 바인딩**(#9). `fontFamily`는 STRING 변수 바인딩(로컬 폰트를 못 보는 실행 컨텍스트 우회) |
| `06-effect-styles.js` | 5 그림자 | `effects`는 read-only 배열이라 통째로 재할당. 색은 리터럴 RGBA(변수화 안 함, #8) |

- 빌드가 각 파일을 **50,000자**(`code` 파라미터 상한, #4) 안으로 유지한다. 넘으면 `02a`/`02b`로 쪼개고, 상한 초과가 런타임이 아니라 **빌드 타임에** 드러난다
- 모든 파일은 **멱등**하게 쓴다 — 이름으로 조회해 있으면 갱신, 없으면 생성(#4 샘플의 `upsert` 패턴). 재주입이 중복을 만들면 안 된다
- 단계마다 별도 호출로 쪼개는 진짜 이유는 성능이 아니라 **실패 시 재실행 범위를 좁히기 위해서**다(#4)

주입 절차 자체는 #10이 실제로 관통시킨 뒤 `docs/agents/`에 적는다.

---

## 6. 소비처로 가는 길

npm 배포는 out of scope다. 소비 경로가 둘로 갈린다([#12](https://github.com/flameware/massive-design/issues/12)):

- **리포 안(`packages/ui`·`apps/storybook`)**: 복사하지 않고 **패키지 경로로 import** 한다 — `@massive/tokens/dist/tokens.css`. 워크스페이스가 로컬 폴더로 링크하므로 토큰을 고치면 즉시 반영된다
- **리포 밖(invest diary)**: 여전히 **`dist/tokens.css`를 복사**해 간다

어느 쪽이든 `@import "tailwindcss";` **뒤에** import 한다. shadcn의 `globals.css`를 이 파일로 대체하는 게 아니라, shadcn이 만든 `:root`/`.dark`/`@theme inline` 블록을 **우리 파일이 통째로 대신한다** — shadcn 34개를 전부 내고 있으므로 성립한다(#5).

소비처가 v4 마이그레이션 중이라 실제 충돌은 그때 드러난다(맵 fog).

---

## 7. CI

`npm run check` 하나. 순서는 lint → contrast → verify.

verify가 마지막인 이유: lint·contrast가 **원본**을 검사하므로 먼저 실패해야 원인이 명확하다. verify는 "생성물이 원본과 어긋났다"만 말할 수 있어 진단 정보가 가장 적다.
