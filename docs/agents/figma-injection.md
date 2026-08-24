# Figma 주입 절차

확정: 2026-08-19 · 근거 티켓 [#10](https://github.com/flameware/massive-design/issues/10) · 맵 [#1](https://github.com/flameware/massive-design/issues/1)

`dist/figma/0*.js`를 Figma에 싣는 절차. **`npm run figma:push`는 존재하지 않는다** — 주입 경로가 MCP `use_figma`이고 그건 에이전트가 호출한다(REST 쓰기는 Enterprise 전용). 그래서 이것은 스크립트가 아니라 절차다.

대상 파일: `wxz7M6txDvlvH6Z95JzDHJ` (https://www.figma.com/design/wxz7M6txDvlvH6Z95JzDHJ/Massive-Design)

## 0. 진입 조건

> **컴포넌트를 주입하러 왔다면 [`figma-components.md`](figma-components.md)로 간다.** 이 문서는 토큰(변수·스타일) 전용이다. §2.3~§2.7의 폰트·바인딩 순서·값 표현은 컴포넌트에서도 그대로 유효하므로 그쪽이 여기를 참조한다.

- **`use_figma`를 부르기 전에 `/figma-use` 스킬을 읽는다.** 예외 없음.
- 첫 호출은 **읽기 전용 조사**로 시작한다 — 컬렉션·스타일·페이지·`documentColorProfile`. 파일이 예상 상태인지 확인하고 들어간다.
- **파일을 열었으면 01~07을 먼저 통째로 다시 돌린다.** 01~06은 Variables·Style, 07은 그 변수에 바인딩된 `Foundations` 시각 검증 표면이다. 토큰이 바뀌었는지 따지지 않는다 — 전체 재실행이 멱등이고 확인 비용이 실행 비용보다 비싸다. 이 규칙이 없으면 "코드 토큰이 바뀐 걸 다음 Figma 세션이 기억해야 한다"가 되는데, 그건 사람에게 맡길 수 없는 종류의 상태다. 변수에는 컴포넌트의 `description` 해시([`figma-components.md`](figma-components.md) §3) 같은 낡음 표식이 없다는 점이 이 규칙의 근거다.
- 스킬 번들의 `variable-patterns.md`가 *"Not bindable: fontSize, fontWeight, lineHeight"* 라고 적은 것은 **틀렸다**(#4). TextStyle은 `VariableBindableTextField`로 전부 바인딩된다.

## 1. 실행 순서 — 파일명 번호가 곧 순서

각 파일을 **별도 `use_figma` 호출**로 실행한다. 쪼개는 이유는 성능이 아니라 실패 시 재실행 범위를 좁히기 위해서다.

| # | 파일 | 개수 |
|---|---|---|
| 01 | `01-collections.js` — `palette`(1모드 `Value`) · `semantic`(`Light`/`Dark`) | 컬렉션 2 |
| 02 | `02-palette-color.js` — 램프 + 리터럴 | 101개 |
| 03 | `03-palette-scale.js` — FLOAT/STRING | 47개 |
| 04 | `04-semantic.js` — 크로스 컬렉션 alias × 2모드 | 31개 |
| 05 | `05-text-styles.js` — Text Style + 변수 바인딩 | 9개 |
| 06 | `06-effect-styles.js` — 그림자 | 5개 |
| 07 | 스와치 페이지 (선택) | 생성물이 아니다 — §3.2 |

**성능은 병목이 아니다** — 병목은 `code` 파라미터의 50,000자다.

> ⚠️ **이 표의 개수는 [#41](https://github.com/flameware/massive-design/issues/41)이 실제 파일에서 맞춘 값이다.** 그 전까지 여기 적혀 있던 것은 [#10](https://github.com/flameware/massive-design/issues/10) 프로브의 수(53·7·5·5·5)였고 [#17](https://github.com/flameware/massive-design/issues/17)이 정적 산출물을 세운 뒤로 **아무도 갱신하지 않았다** — 파일도 그 상태였다. 실측 ms는 그때 값이라 뺐다(이번 왕복은 MCP가 소요를 돌려주지 않는다). **수를 적을 때는 코드가 아니라 파일에서 읽을 것.**

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

> ⚠️ **2026-08-20 실측([#32](https://github.com/flameware/massive-design/issues/32) §8-5): `loadFontAsync({family:'Pretendard', style:'Regular'})`는 이 런타임에서 실패한다.** *"The font family \"Pretendard\" does not exist"*와 함께 *"Fonts from text styles: Pretendard (Regular, Medium, Semi Bold, Bold)"*를 뱉는다 — Text Style이 런타임에 없는 폰트를 참조하고 있다는 뜻이다.
>
> **이것은 새 사실이 아니라 [#9](https://github.com/flameware/massive-design/issues/9)가 이미 전제한 조건이다.** `use_figma`는 사용자 머신이 아니라 Figma 클라우드 폰트 세트만 가진 별도 런타임에서 돌고(1,938 패밀리 중 Pretendard 0건), **그래서** 로드를 거치지 않는 변수 바인딩 경로를 택한 것이다. 로컬 설치로도 폰트 교체로도 바뀌지 않는다 — 판단은 끝나 있다.
>
> 실무적으로 남는 주의는 §2.5의 순서뿐이다: **`characters`를 쓰거나 노드를 옮기는 일은 전부 `fontFamily` 바인딩 *전에* 끝낸다.** 컴포넌트 저작에서는 이 순서가 `combineAsVariants`와 어떻게 맞물리는지가 아직 미검증이다 — [#26](https://github.com/flameware/massive-design/issues/26)이 기록한다.

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
- palette **색** 변수는 `hiddenFromPublishing = true` — primitive를 Tailwind `@theme`에 등록하지 않는 결정([#7](https://github.com/flameware/massive-design/issues/7))의 Figma 쪽 대응물이다. **같은 컬렉션의 스케일 변수 47개는 반대로 `false`를 명시한다**([#41](https://github.com/flameware/massive-design/issues/41)) — `--spacing`·`--radius-md`·`--text-sm`은 `@theme`에 등록돼 있어 코드에서 공개이므로 Figma에서만 숨기면 디자이너가 피커에서 집을 수 없다. ⚠️ **`true`를 지우는 게 아니라 `false`를 쓴다**: `upsert`가 기존 변수를 재사용하므로 줄만 지우면 이미 숨겨진 채 주입된 파일은 영영 안 돌아온다
- `setBoundVariableForPaint`·`setBoundVariableForEffect`는 **새 객체를 반환**한다. 반환값을 받아 재할당할 것

### 2.8 컴포넌트 상태 견본은 생성된 oklab 계산 hex로 그린다

코드의 hover·pressed는 semantic base 색 위에 `state/layer`를 8%·12% `color-mix(in oklab, …)`로 합성한다. Figma Variable은 이 합성을 표현하지 못하므로 빌드가 같은 색 공간에서 결과를 계산해 `packages/tokens/dist/figma/state-colors.gen.json`으로 낸다. 상태 견본은 이 표의 hex를 리터럴 fill로 쓴다. 이 값은 코드와 같은 입력에서 나온 파생값이지 새 토큰이 아니다.

- 계산 hex는 모드를 따라갈 수 없으므로 Light·Dark 견본을 나란히 두 벌 생성한다
- 각 견본 셀에 semantic 모드를 명시하고, 변수에 바인딩한 paint의 fallback 색도 해당 모드의 실제 값으로 적는다. 상위 프레임의 모드 상속만 믿으면 새로 생성한 텍스트 paint가 검정 fallback으로 렌더될 수 있다
- `ghost`는 base가 transparent이므로 견본 면을 `bg/canvas`에 바인딩하고, 그 canvas 색 위에 state layer를 합성한다
- `link`는 state layer 대신 hover·pressed에 밑줄을 쓴다. pressed는 hover와 같다
- disabled는 색 합성이 아니라 견본 노드 `opacity = 0.5`다
- focus는 상태 견본에 넣는다. 기존 `border.focus`를 바깥 링으로 유지하고 `border.focus-contrast`를 안쪽 링으로 겹친다. 컴포넌트 축은 늘리지 않고 Light·Dark 각각 6 variant × 5상태 = 30칸으로 만든다([#43](https://github.com/flameware/massive-design/issues/43), [#54](https://github.com/flameware/massive-design/issues/54)).

**오버레이 fill 폴백과 주입 시점 재계산은 쓰지 않는다.** 이 `use_figma` 런타임에서 변수에 바인딩된 fill은 paint `opacity`를 무시하고 완전 불투명으로 렌더됐다. 따라서 `state/layer` 변수 fill에 0.08·0.12 opacity를 주는 구조는 구현하지 않는다. 계산 주체는 빌드 하나로 고정한다.

## 3. 검증

주입 뒤 반드시:

1. **01~07을 두 번 실행한다.** 컬렉션·변수·스타일 수와 `Massive Foundations · generated`의 정규화 구조가 그대로여야 한다
2. 생성된 스와치 root를 `screenshot()`으로 눈으로 본다. palette 125개와 semantic 35개 × Light/Dark가 대상이며, 특히 다크 `bg/canvas`(neutral 1)와 `bg/surface`(neutral 2)의 분리를 확인한다
3. 고아 변수는 **삭제하지 말고 목록으로 보고**한다. 삭제하면 참조하던 노드가 깨진다. 규약이 안정된 뒤에 자동 삭제를 켠다

## 4. 아직 안 본 것

- 변수 500개 이상 / 50,000자에 육박하는 스크립트의 실제 한계점. [#41](https://github.com/flameware/massive-design/issues/41)의 왕복이 최대치를 **palette 148변수 · 최대 스크립트 9KB**(02, 상한의 1/5)로 올렸고 여전히 아무 데도 안 닿았다
- `resolvedType` 사후 변경 — 타입이 다르면 `remove()` 후 재생성하는 경로만 구현돼 있고, 실제로 그 경로를 밟아본 적은 없다
- Display P3 값 의미. 이 파일은 `SRGB`이고 바꿀 이유가 없다
