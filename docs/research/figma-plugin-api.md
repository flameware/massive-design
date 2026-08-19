# Figma Pro 제약과 MCP 경유 Variables·Style 생성 방법

- 티켓: [#4](https://github.com/flameware/massive-design/issues/4) (맵 [#1](https://github.com/flameware/massive-design/issues/1))
- 조사일: 2026-08-19
- 대상 파일: https://www.figma.com/design/wxz7M6txDvlvH6Z95JzDHJ/Massive-Design (fileKey `wxz7M6txDvlvH6Z95JzDHJ`, 조사 시점에 비어 있음)

각 항목은 **CONFIRMED**(공식 문서 인용 또는 이 파일에서 직접 실행한 프로브) / **UNVERIFIED**(확인 못 함, 추측 금지)로 표시한다.

---

## 0. 계정·플랜 사실

`whoami` MCP 도구 출력 (**CONFIRMED — 프로브**):

```json
{ "handle": "Seongki Sohn", "email": "flameware@gmail.com",
  "plans": [
    { "name": "Massive Void",     "seat": "Full", "tier": "pro" },
    { "name": "NAVER FINANCIAL",  "seat": "View", "tier": "org" } ]}
```

- `Massive Void` = **Pro 티어 / Full seat**. 맵의 전제와 일치한다.
- `NAVER FINANCIAL`은 org 티어지만 **View seat**이라 쓰기·Code Connect 어느 쪽에도 쓸 수 없다. Pro의 제약을 우회하는 경로가 아니다.

---

## 1. 플랜 제약 (가장 중요한 답)

### 1-1. 컬렉션당 모드 개수 상한 = **10** (Pro)

**CONFIRMED — 이 파일에서 직접 프로브.** 임시 컬렉션을 만들고 `addMode()`를 반복 호출한 결과:

```
maxModesPerCollection: 10
modeLimitError: "in addMode: Limited to 10 modes only"
```

공식 문서도 일치한다 — [Figma plans and features](https://help.figma.com/hc/en-us/articles/360040328273): Professional "Up to 10 modes per collection", Organization 20, Enterprise "unlimited modes with extended collections", Starter 사용 불가. 타입 정의(`VariableCollection.addMode`)에도 `Limited to N modes only` 에러가 문서화돼 있다.

> ⚠️ **주의**: `figma-use` 스킬 번들의 `references/variable-patterns.md`는 아직 "Professional = up to 4"라고 적어놨다. **이건 낡은 정보다.** Figma가 4 → 10으로 올렸고, 우리 계정의 실측값은 10이다. 스킬 문서보다 프로브 결과를 믿을 것.

**결론: Light/Dark 2모드는 여유롭게 가능.** 맵의 "다크모드는 semantic에서 단계 매핑만 전환" 결정에 아무 제약이 없다. 나중에 브랜드 테마 모드 몇 개를 더 얹어도 8칸 남는다.

### 1-2. Variables REST API 쓰기 = **Enterprise 전용, 여전히 맞음**

**CONFIRMED — 공식 문서.** [Variables REST API](https://developers.figma.com/docs/rest-api/variables/):

- `GET .../variables/local`, `GET .../variables/published`: Enterprise, `file_variables:read`
- `POST /v1/files/:key/variables`: Enterprise, **Full seats·admins**, `file_variables:write`
- 원문: *"To use this API, you must have a Full seat in an Enterprise org; guests cannot use the API."*

**결론: Pro에서 REST 쓰기 경로는 완전히 막혀 있다. Plugin API(= MCP `use_figma`)가 유일한 주입 경로다.** 맵의 결정 그대로.

### 1-3. Code Connect = **Pro에서 못 쓴다**

**CONFIRMED — 공식 문서.** [Code Connect 문서](https://developers.figma.com/docs/code-connect/): *"Available on a Dev or Full seat on the Organization, and Enterprise plans"*. [plans and features](https://help.figma.com/hc/en-us/articles/360040328273) 표에서도 Starter/Professional은 미포함, Organization/Enterprise만 ✓.

**결론: 맵의 "Code Connect는 out of scope" 결정이 옳았음이 확정됐다.** 플랜 제약이 확정이므로 이건 "나중에 다시 볼 것"이 아니라 영구 제외다.

### 1-4. Extended collections = Enterprise 전용

**CONFIRMED — 타입 정의.** `VariableCollection.extend()` / `figma.variables.extendLibraryCollectionByKeyAsync()`는 *"This API is limited to the Enterprise plan"*이고, 실패 시 `in extend: Cannot create extended collections outside of enterprise plan.`을 던진다. 우리는 안 쓴다.

### 1-5. MCP 레이트리밋

**CONFIRMED — Figma MCP 플러그인 README + [REST API rate limits](https://developers.figma.com/docs/rest-api/rate-limits/).**

- **쓰기 도구(`use_figma` 포함)는 레이트리밋에서 면제된다.** 원문: *"Some tools, such as those that write to Figma files, are exempt from the rate limits."*
- 읽기 도구는 Tier 1 한도를 따른다. Pro + Full seat = **15 req/min**.
- 참고: 쓰기 도구는 현재 베타 기간 동안 무료지만, Figma가 *"will eventually be a usage-based paid feature"*라고 명시했다. 장기적 리스크로만 기록.

**결론: 100~200개 변수 주입은 레이트리밋 대상이 아니다.**

---

## 2. Plugin API — Variables 정확한 사용법

### 2-1. 컬렉션과 모드

```js
const c = figma.variables.createVariableCollection("primitive");
c.renameMode(c.modes[0].modeId, "Value");   // 새 컬렉션은 항상 "Mode 1" 1개로 시작 → 반드시 rename
const darkId = c.addMode("Dark");            // 새 modeId 문자열을 반환
```

**CONFIRMED — 프로브.** `defaultModeId`는 첫 모드. `removeMode(modeId)`, `remove()`도 정상 동작(프로브에서 정리에 사용).

### 2-2. 변수 생성과 값

```js
const v = figma.variables.createVariable("color/brand/500", collection, "COLOR");
v.scopes = ["FRAME_FILL", "SHAPE_FILL", "TEXT_FILL", "STROKE_COLOR"];
v.setValueForMode(modeId, { r: 0.2, g: 0.36, b: 0.96, a: 1 });   // 0–1, 알파 포함
v.setVariableCodeSyntax("WEB", "var(--color-brand-500)");
```

- `resolvedType`: `"COLOR" | "FLOAT" | "STRING" | "BOOLEAN"` (**CONFIRMED — 타입 정의**)
- 두 번째 인자는 컬렉션 **객체**를 넘긴다. ID 문자열 오버로드는 deprecated.
- **COLOR 값은 `{r,g,b,a}` (알파 포함) 0–1.** Paint의 `color`는 `{r,g,b}` (알파 없음, 불투명도는 paint 레벨). 둘을 섞지 말 것. (**CONFIRMED — 타입 정의 + 프로브**)
- `scopes`는 항상 명시. 기본값 `ALL_SCOPES`는 모든 속성 피커를 오염시킨다. 전체 목록: `ALL_SCOPES, TEXT_CONTENT, CORNER_RADIUS, WIDTH_HEIGHT, GAP, ALL_FILLS, FRAME_FILL, SHAPE_FILL, TEXT_FILL, STROKE_COLOR, STROKE_FLOAT, EFFECT_FLOAT, EFFECT_COLOR, OPACITY, FONT_FAMILY, FONT_STYLE, FONT_WEIGHT, FONT_SIZE, LINE_HEIGHT, LETTER_SPACING, PARAGRAPH_SPACING, PARAGRAPH_INDENT`

### 2-3. OKLCH → **sRGB로 변환해야 한다**

**CONFIRMED.** `VariableValue`는 `boolean | number | string | RGB | RGBA | VariableAlias`뿐이다. OKLCH·LCH·HSL 어떤 색공간 리터럴도 받지 않는다. 프로브에서 확인한 이 파일의 `figma.root.documentColorProfile`은 **`"SRGB"`** 다 (가능한 값: `LEGACY | SRGB | DISPLAY_P3`).

**설계 영향**:
- 램프 생성기가 OKLCH로 계산하되, **Figma 주입 직전에 sRGB로 변환하고 gamut clamp**해야 한다. 이건 CSS 출력(Tailwind `@theme`에 `oklch()` 그대로 쓸 수 있음)과 **Figma 출력이 서로 다른 값 표현을 갖는다**는 뜻이다.
- OKLCH sRGB gamut 밖 색은 Figma에서 clamp되어 **CSS와 Figma 사이에 시각적 차이가 생길 수 있다.** 램프 생성기가 처음부터 sRGB gamut 안에 머무르도록 채도를 제한하는 편이 안전하다.
- Display P3는 문서 색 프로파일을 바꾸면 이론상 가능하지만, 이 파일은 SRGB이고 굳이 건드릴 이유가 없다. (**UNVERIFIED** — P3로 바꿨을 때 값 해석이 어떻게 달라지는지는 확인 안 함)

### 2-4. Alias — semantic → primitive

```js
semVar.setValueForMode(lightId, { type: "VARIABLE_ALIAS", id: primVar.id });
semVar.setValueForMode(darkId,  { type: "VARIABLE_ALIAS", id: primDarkVar.id });
```

**CONFIRMED — 프로브.** 읽어보면 `{"type":"VARIABLE_ALIAS","id":"VariableID:4:3"}`로 그대로 돌아온다.

- **컬렉션을 가로지르는 alias가 동작한다.** 프로브에서 `__probe_semantic`(2모드)의 변수가 `__probe_primitive`(1모드)의 변수를 참조하는 데 성공했다. 맵의 "primitive 램프는 한 벌, semantic에서 모드 전환" 구조가 그대로 구현 가능하다.
- `figma.variables.createVariableAlias(variable)`는 존재하지만(**CONFIRMED — 프로브에서 `typeof === "function"`**) 용도는 `node.setProperties()`로 **컴포넌트 프로퍼티**에 변수를 꽂을 때다. `setValueForMode`에는 alias 객체 리터럴을 직접 넘기면 된다.

### 2-5. 노드 바인딩 (스와치 페이지용)

```js
const paint = figma.variables.setBoundVariableForPaint(
  { type: "SOLID", color: { r: 0, g: 0, b: 0 } }, "color", colorVar);
node.fills = [paint];        // ⚠️ 새 paint를 반환한다. 반환값을 반드시 받을 것
node.setBoundVariable("itemSpacing", spacingVar);
frame.setExplicitVariableModeForCollection(collection, darkModeId);  // 서브트리 모드 고정
```

`setBoundVariable`이 받는 필드 (**CONFIRMED — 타입 정의**):
- 노드: `height width characters itemSpacing paddingLeft/Right/Top/Bottom visible topLeftRadius topRightRadius bottomLeftRadius bottomRightRadius minWidth maxWidth minHeight maxHeight counterAxisSpacing strokeWeight strokeTop/Right/Bottom/LeftWeight opacity gridRowGap gridColumnGap`
- 텍스트: `fontFamily fontSize fontStyle fontWeight letterSpacing lineHeight paragraphSpacing paragraphIndent`

SOLID paint만 색 변수 바인딩을 지원한다. 그라디언트·이미지는 throw.

---

## 3. Style — Text Style / Effect Style

### 3-1. Text Style의 fontSize·lineHeight를 Variable에 바인딩할 수 있는가 → **된다**

**CONFIRMED — 프로브.** `TextStyle`은 `setBoundVariable(field: VariableBindableTextField, variable)`를 갖는다. 이 파일에서 실제로 실행한 결과:

```json
{ "bindFontSize": "OK", "bindLineHeight": "OK", "bindFontFamily": "OK",
  "textStyleBoundVariables": {
    "fontSize":   {"type":"VARIABLE_ALIAS","id":"VariableID:5:150"},
    "lineHeight": {"type":"VARIABLE_ALIAS","id":"VariableID:5:151"},
    "fontFamily": {"type":"VARIABLE_ALIAS","id":"VariableID:5:152"} }}
```

> ⚠️ `figma-use` 스킬의 `variable-patterns.md`에 *"Not bindable via setBoundVariable: fontSize, fontWeight, lineHeight"*라고 적혀 있는데 **틀렸다.** 그건 `VariableBindableNodeField`(프레임 등)에 대한 얘기고, TEXT 노드와 TextStyle은 `VariableBindableTextField`를 통해 전부 바인딩된다.

**설계 영향**: 타이포 토큰(font-size, line-height, letter-spacing, font-family)을 **FLOAT/STRING Variable로 만들고 Text Style이 그걸 참조**하게 할 수 있다. 즉 타이포도 컬러와 같은 "변수가 원본, 스타일은 껍데기" 구조로 갈 수 있다. 맵의 산출물 목록("Variables + Text Style")을 그대로 유지하되, 둘이 **연결된** 형태로 만드는 게 가능하다.

주의: `lineHeight` FLOAT 변수를 바인딩할 때 스타일 쪽 `lineHeight`는 `{unit:'PIXELS'|'PERCENT', value}` 또는 `{unit:'AUTO'}` 객체여야 한다. 맨 숫자를 넣으면 throw. `letterSpacing`도 같다.

### 3-2. Text Style 생성

```js
await figma.loadFontAsync({ family: "Inter", style: "Regular" });  // 반드시 먼저
const ts = figma.createTextStyle();
ts.name = "body/base";                       // 슬래시가 그룹 구분자
ts.fontName = { family: "Inter", style: "Regular" };
ts.fontSize = 16;
ts.lineHeight = { unit: "PIXELS", value: 24 };
ts.letterSpacing = { unit: "PERCENT", value: 0 };
ts.description = "CSS: var(--font-body-base)";
ts.setBoundVariable("fontSize", sizeVar);
```

### 3-3. Effect Style

**CONFIRMED — 프로브.** 그림자는 Variable이 될 수 없고 Effect Style이어야 한다. 단 **개별 필드는 변수 바인딩이 된다**:

```js
const es = figma.createEffectStyle();
es.name = "elevation/100";
const base = { type: "DROP_SHADOW", color: {r:0,g:0,b:0,a:0.12},
               offset: {x:0,y:2}, radius: 8, spread: 0,
               visible: true, blendMode: "NORMAL" };
es.effects = [ figma.variables.setBoundVariableForEffect(base, "color", shadowColorVar) ];
// → es.boundVariables = { effects: [ {type:"VARIABLE_ALIAS", id:"..."} ] }
```

바인딩 가능 필드: `color`(COLOR), `radius | spread | offsetX | offsetY`(FLOAT). `setBoundVariableForEffect`는 **새 effect를 반환**하므로 반환값을 반드시 받아야 한다. `effects`는 read-only 배열이라 통째로 재할당한다.

---

## 4. 폰트 — Pretendard는 **없다**

**CONFIRMED — 프로브.** 이 환경에서 `listAvailableFontsAsync()`는 1938개 패밀리를 반환하는데, `/pretendard/i`로 매치되는 항목은 **0개**다.

`loadFontAsync({ family: "Pretendard", style: "Regular" })`의 실제 에러:

```
The font "Pretendard Regular" could not be loaded.
The font family "Pretendard" does not exist.

Visually similar fonts:
- Inter (Black, Black Italic, Bold, ...)

Fonts with similar names:
- Preahvihear (Regular)
- Press Start 2P (Regular)

Call figma.listAvailableFontsAsync() for the full list.
To upload a local font, see: https://help.figma.com/hc/articles/360039956894-Add-a-font-to-Figma
```

**맵의 "Figma에서 Pretendard를 못 쓰면 Inter로 넣고 목록으로 보고" 규칙이 발동한다.** Inter 사용 가능 스타일 (**CONFIRMED — 프로브**):

`Thin, Thin Italic, Extra Light, Extra Light Italic, Light, Light Italic, Regular, Italic, Medium, Medium Italic, Semi Bold, Semi Bold Italic, Bold, Bold Italic, Extra Bold, Extra Bold Italic, Black, Black Italic`

> 스타일 문자열 함정: Inter는 `"Semi Bold"`(공백 있음)이지 `"SemiBold"`가 아니다. `"Extra Bold"`도 마찬가지.

**감지 후 fallback하는 올바른 방법** — try/catch로 `loadFontAsync`를 찔러보지 말고, 먼저 목록을 조회한다:

```js
const fonts = await figma.listAvailableFontsAsync();
const families = new Set(fonts.map(f => f.fontName.family));
const FAMILY = families.has("Pretendard") ? "Pretendard" : "Inter";
```

Pretendard를 쓰려면 사용자가 [로컬 폰트를 Figma에 추가](https://help.figma.com/hc/articles/360039956894-Add-a-font-to-Figma)해야 한다 (데스크톱 앱 + Font Helper). 에이전트가 할 수 없는 일이므로 **사용자에게 넘길 항목**이다.

---

## 5. MCP 경유의 실제 한계

| 항목 | 값 | 근거 |
|---|---|---|
| `use_figma` `code` 파라미터 최대 길이 | **50,000자** | CONFIRMED — MCP 도구 스키마의 `maxLength: 50000` |
| 한 번의 호출로 만든 변수 개수 | **140개 + 2모드 semantic + Text Style + Effect Style, 총 467ms** | CONFIRMED — 프로브 |
| 쓰기 도구 레이트리밋 | **없음(면제)** | CONFIRMED — Figma MCP README |
| 읽기 도구 레이트리밋 | 15 req/min (Pro + Full seat, Tier 1) | CONFIRMED — [rate-limits](https://developers.figma.com/docs/rest-api/rate-limits/) |
| 실패 시 부분 적용 | **일어나지 않는다. 스크립트는 atomic** — 에러가 나면 아예 실행되지 않고 파일은 무변경 | CONFIRMED — figma-use 스킬 §7 ("failed scripts are atomic ... no changes are made to the file") |

**프로브 실측 (한 번의 `use_figma` 호출 안에서 전부):**

```json
{ "primitiveVarCount": 140, "tAfterPrimitives_ms": 321,
  "semanticModes": ["Light","Dark"], "crossCollectionAliasOK": true,
  "bindFontSize": "OK", "bindLineHeight": "OK", "bindFontFamily": "OK",
  "bindEffectColor": "OK", "documentColorProfile": "SRGB",
  "totalElapsed_ms": 467 }
```

**결론: 100~200개 규모의 토큰 주입은 단일 `use_figma` 호출로 충분히 들어간다.** 병목은 API가 아니라 **스크립트 소스 50KB 제한**이다. 토큰 값을 코드에 하드코딩해 인라인하면 색 하나당 대략 100~150바이트라 300~400개쯤에서 한계에 닿는다.

**권장 전략**:
1. 컬렉션·모드 생성 → 2. primitive 색 → 3. primitive 수치/타이포 → 4. semantic alias → 5. Text Style → 6. Effect Style. **단계마다 별도 호출**로 쪼갠다. figma-use 스킬도 "at most 10 logical operations per call"을 권하지만, 변수 생성처럼 균질하고 노드를 안 만드는 작업은 수백 개를 한 번에 넣어도 실측상 문제없다. 쪼개는 진짜 이유는 **실패 시 재실행 범위를 좁히기 위해서**다.
2. 각 호출이 만든 컬렉션 ID·변수 ID를 **반드시 `return`** 해서 다음 호출의 입력으로 넘긴다.
3. 스크립트 소스가 50KB에 근접하면 값 배열을 압축된 형태(예: `[["brand/500","#3b5bfa"],...]` + 런타임 hex→rgb 변환)로 넣어 길이를 줄인다.

**UNVERIFIED**: 500개 이상, 또는 50KB에 실제로 육박하는 스크립트가 어디서 깨지는지는 확인하지 않았다. 이 규모가 필요해지면 티켓 #10에서 실측할 것.

---

## 6. 멱등성 — 이름으로 찾아 갱신하는 표준 패턴

프로브로 확인한 사실 (**CONFIRMED**):

- **같은 컬렉션 안의 중복 변수명은 throw한다**: `in createVariable: duplicate variable name`
- **중복 컬렉션명은 허용된다.** `createVariableCollection("x")`를 두 번 부르면 같은 이름의 컬렉션 2개가 생긴다. → **컬렉션은 반드시 이름으로 먼저 조회하고 재사용해야 한다.** 안 그러면 재실행할 때마다 유령 컬렉션이 쌓인다.
- `variable.name = "..."` 재할당과 `setValueForMode` 재호출 둘 다 정상 동작한다. 즉 **갱신 경로가 존재한다.**

표준 패턴:

```js
async function upsertCollection(name) {
  const all = await figma.variables.getLocalVariableCollectionsAsync();
  return all.find(c => c.name === name) ?? figma.variables.createVariableCollection(name);
}

async function upsertMode(collection, modeName) {
  const found = collection.modes.find(m => m.name === modeName);
  if (found) return found.modeId;
  if (collection.modes.length === 1 && /^Mode 1$/.test(collection.modes[0].name)) {
    collection.renameMode(collection.modes[0].modeId, modeName);
    return collection.modes[0].modeId;
  }
  return collection.addMode(modeName);   // 11번째부터 throw
}

// 컬렉션 단위 name→Variable 인덱스를 먼저 만들고, 그걸로 upsert
async function indexVariables(collection) {
  const vars = await Promise.all(
    collection.variableIds.map(id => figma.variables.getVariableByIdAsync(id)));
  return new Map(vars.filter(Boolean).map(v => [v.name, v]));
}

function upsertVariable(index, collection, name, type) {
  const existing = index.get(name);
  if (existing) {
    if (existing.resolvedType !== type) {        // 타입은 사후 변경 불가
      existing.remove();                          // 재생성이 유일한 길
    } else {
      return existing;
    }
  }
  const v = figma.variables.createVariable(name, collection, type);
  index.set(name, v);
  return v;
}
```

**고아 정리(orphan pruning)**: 코드가 source of truth이므로, 주입할 토큰 집합에 없는 기존 변수는 삭제하는 게 원칙이다. 다만 삭제된 변수를 참조하던 노드가 깨지므로 **첫 왕복(#10)에서는 삭제 대신 목록으로 보고만 하고**, 규약이 안정된 뒤에 자동 삭제를 켜는 편이 안전하다.

**UNVERIFIED**: `variable.resolvedType`을 사후에 바꾸는 API가 정말 없는지는 타입 정의에서 setter가 안 보인다는 근거뿐이다(readonly). 실제로 시도해보진 않았다.

---

## 7. 맵 결정에 미치는 영향 (요약)

| 맵 항목 | 조사 결과 |
|---|---|
| Figma 주입 경로 = MCP `use_figma` | ✅ **유효.** REST 쓰기는 Enterprise 전용이 확정이라 대안이 없기도 하다 |
| 다크모드 = semantic 모드 전환 | ✅ **유효.** Pro는 컬렉션당 10모드, 2모드는 여유 |
| Code Connect = out of scope | ✅ **확정.** Org/Enterprise 전용이라 플랜상 아예 불가. "가능성이 높음"이 아니라 확정으로 갱신 가능 |
| 산출물 = Variables + Text Style + Effect Style | ✅ **유효.** 게다가 Text Style의 fontSize/lineHeight/fontFamily를 Variable에 **바인딩할 수 있다**(신규 사실) → 타이포도 변수 원본 구조로 갈 수 있음 |
| 램프를 OKLCH로 계산 | ⚠️ **조건부.** Figma는 sRGB만 받는다. 주입 직전 변환 + gamut clamp 필요. CSS(`oklch()`)와 Figma 값이 서로 다른 표현이 되고, gamut 밖 색은 시각 차이가 생길 수 있음 |
| 폰트 = Pretendard 기본 | ⚠️ **발동.** Pretendard는 이 환경에 없다 → **Inter로 주입하고 사용자에게 보고.** 사용자가 Font Helper로 로컬 설치해야 해결 |
| Figma 색 스와치 페이지 | 제약 없음. 노드 생성 + `setBoundVariableForPaint`로 가능 |

---

## 8. 주입 스크립트 뼈대

`use_figma`의 `code` 파라미터에 그대로 넣는 형태. 자동으로 async 컨텍스트에 감싸지므로 IIFE로 감싸지 말 것. `figma.notify()`·`console.log()` 금지, 출력은 `return`으로만.

```ts
// ---------------------------------------------------------------------------
// STEP 1 — 컬렉션 + 모드 (멱등)
// 별도의 use_figma 호출. 반환된 ID를 이후 단계에 문자열 리터럴로 넘긴다.
// ---------------------------------------------------------------------------
type Hex = string;

async function upsertCollection(name: string) {
  const all = await figma.variables.getLocalVariableCollectionsAsync();
  return all.find(c => c.name === name) ?? figma.variables.createVariableCollection(name);
}

function upsertMode(col: VariableCollection, modeName: string): string {
  const hit = col.modes.find(m => m.name === modeName);
  if (hit) return hit.modeId;
  if (col.modes.length === 1 && col.modes[0].name === "Mode 1") {
    col.renameMode(col.modes[0].modeId, modeName);
    return col.modes[0].modeId;
  }
  return col.addMode(modeName);   // Pro: 11번째부터 "Limited to 10 modes only"
}

const primitive = await upsertCollection("primitive");
const semantic  = await upsertCollection("semantic");
const primValue = upsertMode(primitive, "Value");
const semLight  = upsertMode(semantic, "Light");
const semDark   = upsertMode(semantic, "Dark");

return {
  primitiveId: primitive.id, semanticId: semantic.id,
  primValue, semLight, semDark,
};

// ---------------------------------------------------------------------------
// STEP 2 — primitive 컬러 램프
// 값은 빌드 스크립트가 OKLCH로 계산한 뒤 **sRGB hex로 변환해서** 인라인한다.
// hex→{r,g,b,a} 변환은 스크립트 소스 길이를 아끼기 위해 런타임에서 수행.
// ---------------------------------------------------------------------------
function hexToRgba(hex: Hex): RGBA {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16) / 255,
    g: parseInt(h.slice(2, 4), 16) / 255,
    b: parseInt(h.slice(4, 6), 16) / 255,
    a: h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1,
  };
}

const COLOR_SCOPES: VariableScope[] = ["FRAME_FILL", "SHAPE_FILL", "TEXT_FILL", "STROKE_COLOR"];

// [name, hex] — 빌드 스크립트가 생성해 주입
const PRIMITIVE_COLORS: [string, Hex][] = [
  ["color/brand/50",  "#eef2ff"],
  ["color/brand/500", "#3b5bfa"],
  ["color/brand/900", "#111a4d"],
  // ... neutral / danger / success
];

const primitiveCol = (await figma.variables.getVariableCollectionByIdAsync("PRIMITIVE_ID"))!;
const primIndex = new Map(
  (await Promise.all(primitiveCol.variableIds.map(id => figma.variables.getVariableByIdAsync(id))))
    .filter((v): v is Variable => !!v).map(v => [v.name, v] as const)
);

const created: string[] = [], updated: string[] = [];
for (const [name, hex] of PRIMITIVE_COLORS) {
  let v = primIndex.get(name);
  if (v) { updated.push(name); }
  else {
    v = figma.variables.createVariable(name, primitiveCol, "COLOR");  // 중복명은 throw
    primIndex.set(name, v);
    created.push(name);
  }
  v.scopes = COLOR_SCOPES;
  v.setValueForMode("PRIM_VALUE_MODE_ID", hexToRgba(hex));
  v.setVariableCodeSyntax("WEB", `var(--${name.replace(/[\s\/]+/g, "-")})`);
}
return { created: created.length, updated: updated.length,
         variableIds: [...primIndex.values()].map(v => v.id) };

// ---------------------------------------------------------------------------
// STEP 3 — semantic alias (Light/Dark 각 모드에서 서로 다른 primitive 단계를 가리킨다)
// ---------------------------------------------------------------------------
// [semanticName, lightPrimitiveName, darkPrimitiveName]
const SEMANTIC_MAP: [string, string, string][] = [
  ["bg/default", "color/neutral/50",  "color/neutral/950"],
  ["bg/subtle",  "color/neutral/100", "color/neutral/900"],
  ["fg/default", "color/neutral/900", "color/neutral/50"],
  ["fg/muted",   "color/neutral/600", "color/neutral/400"],
  ["border/default", "color/neutral/200", "color/neutral/800"],
];

const semanticCol = (await figma.variables.getVariableCollectionByIdAsync("SEMANTIC_ID"))!;
const allPrim = new Map(
  (await figma.variables.getLocalVariablesAsync("COLOR")).map(v => [v.name, v] as const)
);
const semIndex = new Map(
  (await Promise.all(semanticCol.variableIds.map(id => figma.variables.getVariableByIdAsync(id))))
    .filter((v): v is Variable => !!v).map(v => [v.name, v] as const)
);

for (const [name, lightRef, darkRef] of SEMANTIC_MAP) {
  const light = allPrim.get(lightRef), dark = allPrim.get(darkRef);
  if (!light || !dark) throw new Error(`missing primitive for ${name}: ${lightRef} / ${darkRef}`);
  const v = semIndex.get(name)
    ?? figma.variables.createVariable(name, semanticCol, "COLOR");
  v.scopes = COLOR_SCOPES;
  // 컬렉션을 가로지르는 alias — 프로브로 동작 확인됨
  v.setValueForMode("SEM_LIGHT_MODE_ID", { type: "VARIABLE_ALIAS", id: light.id });
  v.setValueForMode("SEM_DARK_MODE_ID",  { type: "VARIABLE_ALIAS", id: dark.id });
  v.setVariableCodeSyntax("WEB", `var(--${name.replace(/[\s\/]+/g, "-")})`);
  semIndex.set(name, v);
}
return { semanticCount: semIndex.size };

// ---------------------------------------------------------------------------
// STEP 4 — 타이포 변수 + Text Style (스타일이 변수를 참조하게 바인딩)
// ---------------------------------------------------------------------------
const fonts = await figma.listAvailableFontsAsync();
const families = new Set(fonts.map(f => f.fontName.family));
const FAMILY = families.has("Pretendard") ? "Pretendard" : "Inter";   // Pretendard 부재 시 fallback
const fontFallbackUsed = FAMILY !== "Pretendard";

// [styleName, fontStyle, size, lineHeightPx]
const RAMP: [string, string, number, number][] = [
  ["heading/xl", "Bold",    48, 56],
  ["heading/lg", "Bold",    36, 44],
  ["body/base",  "Regular", 16, 24],
  ["body/sm",    "Regular", 14, 20],
];

await Promise.all(
  [...new Set(RAMP.map(r => r[1]))].map(style => figma.loadFontAsync({ family: FAMILY, style }))
);

const typoCol = await upsertCollection("typography");
const typoMode = upsertMode(typoCol, "Value");
const typoIndex = new Map(
  (await Promise.all(typoCol.variableIds.map(id => figma.variables.getVariableByIdAsync(id))))
    .filter((v): v is Variable => !!v).map(v => [v.name, v] as const)
);

function upsertNum(name: string, scope: VariableScope, value: number): Variable {
  const v = typoIndex.get(name) ?? figma.variables.createVariable(name, typoCol, "FLOAT");
  v.scopes = [scope];
  v.setValueForMode(typoMode, value);
  typoIndex.set(name, v);
  return v;
}

const existingStyles = new Map((await figma.getLocalTextStylesAsync()).map(s => [s.name, s]));
const styleIds: string[] = [];

for (const [name, fontStyle, size, lh] of RAMP) {
  const sizeVar = upsertNum(`font-size/${name}`, "FONT_SIZE", size);
  const lhVar   = upsertNum(`line-height/${name}`, "LINE_HEIGHT", lh);

  const ts = existingStyles.get(name) ?? figma.createTextStyle();
  ts.name = name;
  ts.fontName = { family: FAMILY, style: fontStyle };   // "Semi Bold" — 공백 주의
  ts.fontSize = size;
  ts.lineHeight = { unit: "PIXELS", value: lh };        // 맨 숫자는 throw
  ts.description = `CSS: var(--font-${name.replace(/[\s\/]+/g, "-")})`;
  ts.setBoundVariable("fontSize", sizeVar);             // 프로브로 동작 확인됨
  ts.setBoundVariable("lineHeight", lhVar);
  styleIds.push(ts.id);
}
return { styleIds, family: FAMILY, fontFallbackUsed };

// ---------------------------------------------------------------------------
// STEP 5 — Effect Style (그림자는 변수가 될 수 없으므로 스타일 + 색 바인딩)
// ---------------------------------------------------------------------------
const shadowVar = allPrim.get("color/neutral/900")!;
const ELEVATION: [string, number, number, number][] = [
  // [name, offsetY, radius, alpha]
  ["elevation/100", 1,  2,  0.06],
  ["elevation/200", 2,  8,  0.12],
  ["elevation/300", 8, 24,  0.16],
];

const existingEffects = new Map((await figma.getLocalEffectStylesAsync()).map(s => [s.name, s]));
const effectIds: string[] = [];

for (const [name, y, radius, alpha] of ELEVATION) {
  const es = existingEffects.get(name) ?? figma.createEffectStyle();
  es.name = name;
  const base: DropShadowEffect = {
    type: "DROP_SHADOW", color: { r: 0, g: 0, b: 0, a: alpha },
    offset: { x: 0, y }, radius, spread: 0, visible: true, blendMode: "NORMAL",
  };
  // 새 effect를 반환한다 — 반환값을 반드시 받아 재할당
  const bound = figma.variables.setBoundVariableForEffect(base, "color", shadowVar);
  es.effects = [bound];
  effectIds.push(es.id);
}
return { effectIds };
```

### 뼈대에 박아둔 규칙 요약

- 각 STEP은 **별개의 `use_figma` 호출**. ID는 `return`으로 넘기고 다음 호출에 **문자열 리터럴**로 박는다 (스크립트 간 변수 공유 없음).
- 스크립트는 atomic이다 — 실패해도 반쯤 적용되지 않는다. 에러가 나면 **즉시 재시도하지 말고** 메시지를 읽고 고친 뒤 재실행.
- `setBoundVariableForPaint` / `setBoundVariableForEffect`는 **새 객체를 반환**한다. 반환값을 안 받으면 조용히 아무 일도 안 일어난다.
- 컬렉션은 이름으로 upsert(중복 생성 허용됨), 변수는 컬렉션 안에서 이름으로 upsert(중복 생성 throw).
- 색은 전부 0–1. COLOR 변수 값은 `{r,g,b,a}`, paint의 color는 `{r,g,b}`.
