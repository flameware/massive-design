# Figma 주입 절차

확정: 2026-08-19 · 근거 티켓 [#10](https://github.com/flameware/massive-design/issues/10) · 맵 [#1](https://github.com/flameware/massive-design/issues/1)

`dist/figma/0*.js`를 Figma에 싣는 절차. **`npm run figma:push`는 존재하지 않는다** — 주입 경로가 MCP `use_figma`이고 그건 에이전트가 호출한다(REST 쓰기는 Enterprise 전용). 그래서 이것은 스크립트가 아니라 절차다.

대상 파일: `wxz7M6txDvlvH6Z95JzDHJ` (https://www.figma.com/design/wxz7M6txDvlvH6Z95JzDHJ/Massive-Design)

## 0. 진입 조건

- **`use_figma`를 부르기 전에 `/figma-use` 스킬을 읽는다.** 예외 없음.
- 첫 호출은 **읽기 전용 조사**로 시작한다 — 컬렉션·스타일·페이지·`documentColorProfile`. 파일이 예상 상태인지 확인하고 들어간다.
- 스킬 번들의 `variable-patterns.md`가 *"Not bindable: fontSize, fontWeight, lineHeight"* 라고 적은 것은 **틀렸다**(#4). TextStyle은 `VariableBindableTextField`로 전부 바인딩된다.

## 1. 실행 순서 — 파일명 번호가 곧 순서

각 파일을 **별도 `use_figma` 호출**로 실행한다. 쪼개는 이유는 성능이 아니라 실패 시 재실행 범위를 좁히기 위해서다.

| # | 파일 | 실측 소요 |
|---|---|---|
| 01 | `01-collections.js` — `palette`(1모드 `Value`) · `semantic`(`Light`/`Dark`) | 5ms |
| 02 | `02-palette-color.js` — 램프 + 리터럴 | 53개 / 164ms |
| 03 | `03-palette-scale.js` — FLOAT/STRING | 7개 / 25ms |
| 04 | `04-semantic.js` — 크로스 컬렉션 alias × 2모드 | 5개 / 35ms |
| 05 | `05-text-styles.js` — Text Style + 변수 바인딩 | 5개 / 216ms |
| 06 | `06-effect-styles.js` — 그림자 | 5개 / 30ms |
| 07 | 스와치 페이지 (선택) | 텍스트 59개 포함 ~2.4s |

전체 재실행(멱등 확인 포함) 144ms. **성능은 병목이 아니다** — 병목은 `code` 파라미터의 50,000자다.

## 2. 반드시 지킬 것

### 2.1 컬렉션은 이름으로 조회해 재사용

같은 컬렉션 안의 중복 변수명은 throw하지만 **중복 컬렉션명은 조용히 허용된다.** 조회 없이 `createVariableCollection`을 부르면 재실행마다 유령 컬렉션이 쌓인다. `upsertCollection`은 같은 이름이 2개 이상이면 **throw해서 오염을 조기에 드러낸다.**

### 2.2 기본 모드는 고를 수 없다 — 순서로 정한다

`collection.defaultModeId`는 **setter가 없다**(`TypeError: no setter for property`). 첫 모드가 곧 기본 모드이므로 **`Light`를 먼저 만든다.** 새 컬렉션은 항상 `Mode 1` 하나로 시작하므로 첫 모드는 `addMode`가 아니라 `renameMode`로 만든다.

### 2.3 Text Style은 순서가 제약이다

`fontFamily` 바인딩이 노드/스타일을 **폰트 잠금** 상태로 만든다. 잠긴 뒤에는 `characters`뿐 아니라 `lineHeight`·`letterSpacing` 재기록도 막힌다(`Cannot write to node with unloaded font`). 따라서:

1. `loadFontAsync({family:'Inter', style:<weight>})` → `fontName` 부트스트랩
2. 폰트 의존 속성을 **리터럴로 전부** 기록
3. `fontSize` · `lineHeight` 변수 바인딩
4. **마지막에** `fontFamily` 바인딩

고칠 일이 생기면 스타일을 **지우고 다시 만든다.** 잠긴 스타일을 수정하는 경로는 없다.

### 2.4 `fontFamily` 바인딩은 3회 재시도로 감싼다

런타임이 처음 보는 `(family, style)` 쌍은 **첫 시도가 반드시 throw**한다:

```
in setBoundVariable: unloaded font "Pretendard Medium".
```

두 번째 시도에서 통과한다. `Regular`만 예외(항상 1회에 성공). `use_figma`의 atomic 롤백은 **파일 상태만** 되돌리므로 실패한 스크립트가 남긴 face 등록은 살아남는다 — 재시도 없이는 콜드 파일에서 100% 실패한다.

웨이트 9종(`Thin`~`Black`, Inter 표기법 — `Semi Bold`·`Extra Bold`는 **띄어쓰기 있음**) 전부 `Pretendard <style>`로 해석되는 것이 사람 눈으로 확인됐다.

### 2.5 노드에는 스타일이 아니라 변수를 바인딩한다

`setTextStyleIdAsync`로 Pretendard 스타일을 노드에 **적용하는 것은 실패한다**(#9). 스와치 페이지처럼 실제 텍스트를 만들 때는:

1. 구조를 **전부** 만들고 (`appendChild`·`resize`·`characters` 포함)
2. **맨 마지막에** 모든 TEXT 노드에 `fontFamily`를 일괄 바인딩

바인딩된 노드는 `appendChild` 대상도 될 수 없으므로 구조가 먼저다.

### 2.6 `lineHeight` 변수는 px여야 한다

`setBoundVariable('lineHeight', floatVar)`가 **단위를 PIXELS로 강제 변환**한다(`PERCENT 160` → `PIXELS 160`). 비율을 담은 변수를 바인딩하면 16px 폰트에 160px 행간이 붙는다. 빌드가 사이즈별 px를 선계산해 낸다(`docs/tokens/scale-tokens.md` §2.5).

### 2.7 값 표현

- Variable COLOR 값은 `{r,g,b,a}` 0–1. Paint의 `color`는 `{r,g,b}`(알파 없음) — **섞지 말 것**
- hex → 0–1 왕복은 **무손실**(`#0f5fed` → `0.0588/0.3725/0.9294` = 15/95/237)
- FLOAT는 float32라 `22.4` → `22.399999618530273`. 시각적으로 무의미하나 `tokens:verify`가 문자열 비교하면 걸린다 — **비교는 반올림 후에** 한다
- `scopes`는 **항상 명시**한다. 기본값 `ALL_SCOPES`는 모든 속성 피커를 오염시킨다
- palette 변수는 `hiddenFromPublishing = true` — primitive를 Tailwind `@theme`에 등록하지 않는 결정(#7)의 Figma 쪽 대응물
- `setBoundVariableForPaint`·`setBoundVariableForEffect`는 **새 객체를 반환**한다. 반환값을 받아 재할당할 것

## 3. 검증

주입 뒤 반드시:

1. **두 번 실행한다.** 컬렉션·변수·스타일 **수가 그대로여야** 한다
2. 스와치 페이지를 `screenshot()`으로 눈으로 본다 — 특히 다크 `bg/canvas`(neutral 1)와 `bg/surface`(neutral 2)의 분리
3. 고아 변수는 **삭제하지 말고 목록으로 보고**한다. 삭제하면 참조하던 노드가 깨진다. 규약이 안정된 뒤에 자동 삭제를 켠다

## 4. 아직 안 본 것

- 변수 500개 이상 / 50,000자에 육박하는 스크립트의 실제 한계점. 이번 왕복의 최대는 61변수·약 4KB
- `resolvedType` 사후 변경 — 타입이 다르면 `remove()` 후 재생성하는 경로만 구현돼 있고, 실제로 그 경로를 밟아본 적은 없다
- Display P3 값 의미. 이 파일은 `SRGB`이고 바꿀 이유가 없다
