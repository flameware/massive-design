# Figma 컴포넌트 저작 API — variant · property · 제자리 수정

- 티켓: [#20](https://github.com/flameware/massive-design/issues/20) (맵 [#14](https://github.com/flameware/massive-design/issues/14), blocking [#24](https://github.com/flameware/massive-design/issues/24))
- 조사일: 2026-08-20
- 1차 출처: **`@figma/plugin-typings` v1.134.0** (Figma가 npm에 발행하는 공식 타입 정의), [Figma Plugin API 문서](https://developers.figma.com/docs/plugins/api/api-reference/), Figma 공식 스킬 번들 [`figma/mcp-server-guide`](https://github.com/figma/mcp-server-guide)
- **라이브 파일에 아무것도 실행하지 않았다.** 이 문서의 모든 항목은 문서·타입 정의 근거이거나 미검증이다

각 항목은 **CONFIRMED**(공식 타입 정의 또는 문서 인용) / **DERIVED**(확정된 사실에서 논리적으로 따라 나오나 실행으로 확인 안 함) / **UNVERIFIED**(확인 못 함, 추측 금지)로 표시한다. §7이 UNVERIFIED만 모아둔 절이다.

---

## 0. 질문

토큰은 관통했지만([#10](https://github.com/flameware/massive-design/issues/10)) 컴포넌트는 밟아본 적이 없다. 컴포넌트는 노드를 만들고, **노드에는 인스턴스가 달린다.** 그래서 변수 주입에서 통했던 "지우고 다시 만든다"가 여기서는 금지된다 — [`docs/handoff/component-map.md`](../handoff/component-map.md) §3.4.

> **에이전트가 `use_figma`로 variant를 가진 Figma 컴포넌트를 저작하고, 그 다음 실행에서 인스턴스를 끊지 않고 제자리에서 갱신하려면 정확히 어떤 호출 순서를 밟아야 하는가.**

---

## 1. 컴포넌트와 ComponentSet — 생성 절차

### 1.1 `createComponent()` — 그냥 프레임이다

**CONFIRMED — 타입 정의.** `figma.createComponent(): ComponentNode`이고 `ComponentNode extends DefaultFrameMixin, PublishableMixin, VariantMixin, ComponentPropertiesMixin`이다. 즉 **Auto Layout·fills·cornerRadius·appendChild가 프레임과 완전히 동일하게 동작한다.** 컴포넌트 저작의 대부분은 프레임 저작이고, 컴포넌트 고유 API는 얇은 껍질 하나다.

```js
const c = figma.createComponent();
c.name = 'variant=primary, size=md';   // ← 이 문자열이 variant 정의의 전부다 (§1.2)
c.layoutMode = 'HORIZONTAL';
c.primaryAxisAlignItems = 'CENTER';
c.counterAxisAlignItems = 'CENTER';
c.layoutSizingHorizontal = 'HUG';
c.layoutSizingVertical = 'HUG';
```

`figma.createComponentFromNode(node)`도 있다(기존 노드를 컴포넌트로 승격). 우리 파이프라인은 코드에서 새로 짓는 방향이라 쓸 일이 없다.

### 1.2 variant property는 **자식 컴포넌트의 이름으로 선언한다** — 이게 핵심이다

가장 많이 오해되는 지점이라 못을 박는다. **variant property를 만드는 API 호출은 없다.** `Name=Value, Name2=Value2` 라는 **자식 `ComponentNode`의 `name` 문자열**이 곧 선언이고, `componentPropertyDefinitions`는 그 이름들을 파싱해 보여주는 **읽기 전용 결과물**이다.

**CONFIRMED — Figma 공식 스킬 번들** [`component-patterns.md`](https://github.com/figma/mcp-server-guide/blob/main/skills/figma-use/references/component-patterns.md):

> Variant names use a `Property=Value` format. Every unique combination must exist as a child component — missing ones show as blank gaps in the variant picker.

**CONFIRMED — 같은 번들** [`wwds-components.md`](https://github.com/figma/mcp-server-guide/blob/main/skills/figma-use/references/working-with-design-systems/wwds-components.md):

> These permutations create different variants implicitly in Figma and it is handled through layer naming (`Variant=Primary,Size=Small,State=Disabled`).

따라서:

- 축(axis) 이름 = `=` 왼쪽. 값 = `=` 오른쪽. 구분자는 `, `(쉼표+공백)
- **모든 자식이 같은 축 집합을 가져야 한다.** 한 자식만 `state=`를 달면 나머지 전부에 대해 그 축의 값이 비게 되고 피커에 구멍이 뚫린다
- **조합은 폭발한다.** 축의 곱만큼 실제 노드가 canvas에 생긴다. 중복돼 보이는 조합도 노드로 존재해야 한다 — 조건부 제외 수단이 없다

### 1.3 `combineAsVariants` — 세트를 만드는 유일한 길

**CONFIRMED — 타입 정의 및 [공식 문서](https://developers.figma.com/docs/plugins/api/properties/figma-combineasvariants/).**

```ts
combineAsVariants(nodes: ReadonlyArray<ComponentNode>, parent: BaseNode & ChildrenMixin, index?: number): ComponentSetNode
```

- **`figma.createComponentSet()`은 존재하지 않는다.** 타입 정의 원문: *"Why is there no `figma.createComponentSet()` function? It would create an empty component set, and empty component sets are not supported in Figma."*
- `nodes`는 **반드시 `ComponentNode`**여야 한다. `FrameNode`를 넘기면 throw ([gotchas.md](https://github.com/figma/mcp-server-guide/blob/main/skills/figma-use/references/gotchas.md))
- `parent`는 생성 시점에 지정한다. 나중에 `appendChild`로 옮기는 게 아니다
- reparenting이므로 재부모화 제약 전부를 받는다 — 같은 페이지에 있어야 하고, 잠긴 노드·인스턴스 내부 노드는 안 된다

### 1.4 `combineAsVariants` 직후 반드시 배치·리사이즈해야 한다

**CONFIRMED — [gotchas.md](https://github.com/figma/mcp-server-guide/blob/main/skills/figma-use/references/gotchas.md) "combineAsVariants does NOT auto-layout in `use_figma`".** 자식이 전부 `(0,0)`에 겹쳐 쌓이고 세트 크기는 **variant 하나 크기**가 된다.

```js
const set = figma.combineAsVariants(comps, figma.currentPage);
set.name = 'Button';

// 이름을 파싱해 격자 좌표를 잡는다
const COL = 160, ROW = 64;
for (const child of set.children) {
  const p = Object.fromEntries(child.name.split(', ').map(s => s.split('=')));
  child.x = SIZES.indexOf(p.size) * COL;
  child.y = VARIANTS.indexOf(p.variant) * ROW;
}
// 공식대로 계산하지 말고 실제 자식 bounds에서 리사이즈한다
let maxX = 0, maxY = 0;
for (const ch of set.children) { maxX = Math.max(maxX, ch.x + ch.width); maxY = Math.max(maxY, ch.y + ch.height); }
set.resizeWithoutConstraints(maxX + 40, maxY + 40);
```

`ComponentSetNode`는 `BaseFrameMixin`을 상속하므로 `layoutMode`(Auto Layout / GRID)를 **가질 수는 있다**(타입상 CONFIRMED). 그걸로 수동 좌표 계산을 대체할 수 있는지는 **UNVERIFIED**(§7).

### 1.5 `ComponentSetNode`가 스스로 지워지는 조건

**CONFIRMED — [공식 문서](https://developers.figma.com/docs/plugins/api/ComponentSetNode/):** *"In Figma, component sets must always have children. A component set with no children will delete itself."*

→ 제자리 수정에서 **자식을 전부 지우면 세트가 사라지고, 세트가 사라지면 인스턴스가 전부 깨진다.** 삭제는 항상 "먼저 새 자식을 넣고, 그 다음 낡은 자식을 지운다" 순서여야 한다.

---

## 2. componentPropertyDefinitions — 4+1 타입

### 2.1 타입과 소유자

**CONFIRMED — 타입 정의:**

```ts
type ComponentPropertyType = 'BOOLEAN' | 'TEXT' | 'INSTANCE_SWAP' | 'VARIANT' | 'SLOT'
```

`ComponentPropertiesMixin`은 `ComponentNode`와 `ComponentSetNode` **양쪽에** 붙어 있다. 하지만 실제 소유 규칙이 있다:

| 노드 | `componentPropertyDefinitions` |
|---|---|
| `ComponentSetNode` | 소유. VARIANT를 포함한 전부 |
| variant 자식 `ComponentNode` | **읽으면 throw한다.** 부모 세트로 올라가야 한다 |
| 세트에 속하지 않은 단독 `ComponentNode` | 소유. **VARIANT는 절대 안 나온다** |

**CONFIRMED — [component-patterns.md](https://github.com/figma/mcp-server-guide/blob/main/skills/figma-use/references/component-patterns.md):** *"`componentPropertyDefinitions` throws when read from a variant `COMPONENT`, including through optional chaining."* 타입 정의도 *"componentPropertyDefinitions and componentProperties work similarly for main components and their instances but will never have 'VARIANT' properties"* 라고 적는다.

```js
// 소유자 판별은 항상 이 한 줄을 거친다
const owner = node.type === 'COMPONENT' && node.parent.type === 'COMPONENT_SET' ? node.parent : node;
const defs = owner.componentPropertyDefinitions;
```

### 2.2 `addComponentProperty`는 **키 문자열을 반환한다**

**CONFIRMED — 타입 정의 + gotchas.** BOOLEAN·TEXT·INSTANCE_SWAP·SLOT은 이름 뒤에 `#`+고유 ID가 붙는다(`"Label#4:0"`). **접미사는 예측 불가**다.

```js
const labelKey = comp.addComponentProperty('Label', 'TEXT', 'Button');
// labelKey === "Label#4:0" — 반환값이 곧 키다. 하드코딩·추측 금지
// ❌ Object.keys(labelKey)[0] → '0' (문자열의 첫 글자 인덱스!)
```

VARIANT property는 접미사가 붙지 않는다(`Size`, `Variant` 그대로). 타입 정의의 예시 출력이 그렇다.

### 2.3 property는 **자식 노드에 묶어야 존재한다**

**CONFIRMED — [component-patterns.md](https://github.com/figma/mcp-server-guide/blob/main/skills/figma-use/references/component-patterns.md):** *"A property that is added but not linked to a child node does nothing."*

`componentPropertyReferences`가 유일한 연결 수단이고, **키가 4개뿐이다.** 타입 정의:

```ts
componentPropertyReferences: { [nodeProperty in 'visible' | 'characters' | 'mainComponent']?: string } | null
```

(+ SLOT용 `slotContentId` — 스킬 번들에 문서화돼 있으나 위 타입 유니온에는 없다. §7)

| property 타입 | 묶이는 노드 프로퍼티 | 대상 노드 |
|---|---|---|
| TEXT | `characters` | TextNode |
| BOOLEAN | `visible` | 아무 노드 |
| INSTANCE_SWAP | `mainComponent` | InstanceNode |
| SLOT | `slotContentId` | 직속 자식 프레임 / `createSlot()` 자동 |
| VARIANT | — (묶지 않는다. 이름이 곧 선언) | — |

> ⚠️ **BOOLEAN은 `visible`밖에 못 건드린다.** "색이 바뀌는 상태"는 BOOLEAN으로 표현할 수 없다. 뒤에 §3.2·§6에서 다시 걸린다.

### 2.4 cva 축의 매핑

[`component-map.md`](../handoff/component-map.md) §2.3이 "shadcn을 그대로 쓴다"로 확정했으므로 property 표면은 shadcn Button의 `cva` 호출이 그대로 결정한다. **어느 축을 실제로 만들지는 [#24](https://github.com/flameware/massive-design/issues/24)·[#25](https://github.com/flameware/massive-design/issues/25)의 결정이다.** 여기서는 API가 허용하는 매핑만 적는다.

| cva / React | Figma property 타입 | 노드 수에 미치는 영향 |
|---|---|---|
| `variant`: default·destructive·outline·secondary·ghost·link (6) | **VARIANT** 축 `Variant` | ×6 |
| `size`: default·sm·lg·icon (4) | **VARIANT** 축 `Size` | ×4 |
| hover / pressed / disabled / focus | **VARIANT** 축 `State` 밖에 방법이 없다 (§2.3 — 색이 바뀌므로 BOOLEAN 불가) | ×5 → 위 둘과 곱하면 **120 노드** |
| `children` (라벨) | **TEXT** | 곱하지 않음 |
| 아이콘 유무 | **BOOLEAN** (`visible`) | 곱하지 않음 |
| 어떤 아이콘인지 | **INSTANCE_SWAP** | 곱하지 않음 |
| `asChild` | 표현 불가. 버린다 | — |
| `className` | 표현 불가. 버린다 | — |

**CONFIRMED — [wwds-components--creating.md](https://github.com/figma/mcp-server-guide/blob/main/skills/figma-use/references/working-with-design-systems/wwds-components--creating.md):** *"lean toward fewer variants and more boolean/text properties where possible. Variants multiply combinatorially; the other property types do not."*

### 2.5 property의 기본값에 변수를 바인딩할 수 있다

**CONFIRMED — 타입 정의.** `VariableBindableComponentPropertyDefinitionField = 'defaultValue'`, `VariableBindableComponentPropertyField = 'value'`. `addComponentProperty`의 `defaultValue`가 `string | boolean | VariableAlias`를 받고, `instance.setProperties`도 `VariableAlias`를 받는다. 즉 **TEXT property의 기본값을 STRING 변수로, BOOLEAN을 BOOLEAN 변수로 물릴 수 있다.** 우리에게 당장 쓸 데는 없다. 기록만 해둔다.

---

## 3. 제자리 수정 패턴 — 이 티켓의 본체

### 3.0 전제: 왜 재생성이 금지인가 (근거 인용)

**CONFIRMED — `ComponentSetNode.clone()` 타입 정의:** *"Its children will be duplicated as **new** components with no instances of them."*
**CONFIRMED — `ComponentNode.clone()`:** *"Duplicates the component node as a **new** component with no instances of it."*
**CONFIRMED — [wwds-components--creating.md](https://github.com/figma/mcp-server-guide/blob/main/skills/figma-use/references/working-with-design-systems/wwds-components--creating.md):** *"restructuring a component after instances exist is destructive."*

인스턴스는 **자식 `ComponentNode`의 노드 ID**를 붙잡고 있다. 세트가 아니라 자식이다. 그래서 "같은 이름으로 다시 만든다"가 통하지 않는다 — 이름은 같아도 ID가 다르다.

### 3.1 발견 — 이름으로 찾고 중복이면 throw

토큰의 `upsertCollection`(figma-injection.md §2.1)과 같은 형태를 컴포넌트에 그대로 옮긴다.

```js
// ⚠️ figma.root.findAllWithCriteria 는 use_figma에서 못 쓴다 (§5.4)
const page = figma.currentPage;               // 또는 await figma.setCurrentPageAsync(p)
const hits = page.findAllWithCriteria({ types: ['COMPONENT_SET'] })
                 .filter(n => n.name === 'Button');
if (hits.length > 1) throw new Error('duplicate ComponentSet: Button');
const set = hits[0] || null;                  // null이면 최초 생성 경로 (§1.3)
```

`findAllWithCriteria`는 **타입 인덱스 조회**라 `findAll` 전체 스캔보다 훨씬 싸다(gotchas). 컴포넌트를 한 페이지에 몰아두면 이 조회가 항상 O(페이지 하나)로 끝난다.

### 3.2 낡음 판정 — `description`에 매니페스트 해시를 박는다

`component-map.md` §3.4가 정한 방식인데, **`use_figma`가 `setPluginData`를 금지하므로 사실상 유일한 선택지이기도 하다.**

**CONFIRMED — `use_figma` 도구 설명 원문:** *"MUST NEVER use `loadAllPagesAsync`, `setPluginData`, `createImageAsync`. They are not supported API"*
**CONFIRMED — 타입 정의:** `PublishableMixin`이 쓰기 가능한 `description: string`과 `descriptionMarkdown: string`을 준다. `ComponentNode`·`ComponentSetNode`만 이 mixin을 갖는다(프레임·인스턴스에서 `description`을 읽으면 throw).

```js
const MARK = /\n<!--md:([0-9a-f]{12})-->$/;
const stamped = (set.description || '').match(MARK);
if (stamped && stamped[1] === MANIFEST_HASH) return { skipped: 'Button' };  // 멱등 조기 탈출
// ... 수정 ...
set.description = HUMAN_DOC + '\n<!--md:' + MANIFEST_HASH + '-->';
```

**세트에 찍는다. 자식 variant에 찍지 않는다** — wwds-components.md: *"Set it on the component set, not on individual variant nodes."*

### 3.3 무엇이 인스턴스를 끊고, 무엇이 안 끊는가

| 작업 | 인스턴스 | 근거 |
|---|---|---|
| `set.name` 변경 | **안전** | 이름은 참조가 아니다 · DERIVED |
| `set.description` 쓰기 | **안전** | 순수 메타데이터 · DERIVED |
| 자식의 fills·padding·cornerRadius·바인딩 수정 | **안전** | 노드 ID 불변 · DERIVED |
| 자식의 자손 노드 추가/삭제 | **안전하나 override가 깨질 수 있다** | 인스턴스 override는 자손 ID에 붙는다 · DERIVED |
| 자식 `name`을 `Name=Value` 규칙 안에서 변경 (= variant 값 이름 변경) | **안전** — 인스턴스의 variant 값이 따라 바뀐다 | UNVERIFIED (§7-1) |
| `set.appendChild(newComponent)` (= variant 추가) | **안전** | 기존 자식 ID 불변 · DERIVED |
| `set.editComponentProperty(k, {name})` (= 축 이름 변경) | **안전** | 타입 정의가 name을 모든 타입에 허용 · DERIVED |
| `set.addComponentProperty(n,'BOOLEAN'|'TEXT'|'INSTANCE_SWAP',...)` | **안전** | DERIVED |
| `set.deleteComponentProperty(k)` (BOOLEAN/TEXT/INSTANCE_SWAP) | 그 property를 쓰던 override만 소실 | DERIVED |
| 자식 `child.remove()` (= variant 삭제) | **위험** — 그 자식의 인스턴스가 어떻게 되는지 미확인 | UNVERIFIED (§7-2) |
| **마지막** 자식 `remove()` | **파괴적** — 세트가 자멸한다 (§1.5) | CONFIRMED |
| `set.remove()` 후 재생성 | **전부 끊긴다** | CONFIRMED |
| `set.clone()` / `child.clone()`으로 교체 | **전부 끊긴다** — 복제본은 인스턴스 0개인 새 컴포넌트 | CONFIRMED |
| `instance.mainComponent = x` | override 전부 소실 | CONFIRMED (타입 정의) |
| `instance.detachInstance()` | 정의상 끊는다. 추가로 **조상 인스턴스의 ID까지 무효화**된다 | CONFIRMED (gotchas) |

### 3.4 시나리오 A — variant 값 하나 추가 (`size=xl`)

기존 축은 그대로고 값만 는다. 축이 2개면 **다른 축의 값 수만큼** 자식을 새로 만들어야 한다(빈칸 금지, §1.3).

```js
const existing = new Set(set.children.map(c => c.name));
const added = [];
for (const v of VARIANTS) {                       // 다른 축 전부 순회
  const name = `variant=${v}, size=xl`;
  if (existing.has(name)) continue;               // 멱등
  const c = buildVariant(v, 'xl');                // 구조·characters까지 전부 여기서 (§5)
  set.appendChild(c);                             // ← 폰트 바인딩 전에 append
  added.push(c);
}
relayout(set);                                    // §1.4 — 새 자식은 (0,0)에 떨어진다
bindFontFamilyToAllText(set);                     // ← 맨 마지막 (§5)
```

`set.appendChild`가 가능한 근거: **CONFIRMED** — `ComponentSetNode extends BaseFrameMixin extends ChildrenMixin`.

### 3.5 시나리오 B — variant 값 하나 이름 변경 (`size=md` → `size=base`)

**API가 없다.** 자식 이름 문자열을 고치는 것이 유일한 수단이다.

```js
for (const c of set.children) {
  c.name = c.name.replace(/(^|, )size=md(?=,|$)/, '$1size=base');
}
```

`editComponentProperty`는 **축 이름**만 바꾼다. 타입 정의: *"`defaultValue` is supported for 'BOOLEAN', 'TEXT', and 'INSTANCE_SWAP' properties, **but not for 'VARIANT'**"* — VARIANT는 `name`만 허용된다. 즉 `Size` → `size`(축 이름)는 `editComponentProperty`로, `md` → `base`(값)는 자식 이름 문자열로. **두 개가 서로 다른 경로다.**

### 3.6 시나리오 C — variant 값 하나 삭제

```js
const doomed = set.children.filter(c => /(^|, )size=xs(?=,|$)/.test(c.name));
if (doomed.length === set.children.length) throw new Error('would self-delete the set');
// ⚠️ 인스턴스가 있으면 지우기 전에 보고한다 — figma-injection.md §3의 "고아는 삭제 말고 보고" 규약과 같은 형태
for (const c of doomed) {
  const inst = await c.getInstancesAsync();
  if (inst.length) { report.push({ variant: c.name, instances: inst.length }); continue; }
  c.remove();
}
relayout(set);
```

`ComponentNode.getInstancesAsync(): Promise<InstanceNode[]>`가 **CONFIRMED**로 존재한다(동기 `.instances`는 deprecated). **삭제 전에 이걸 반드시 호출한다** — 인스턴스가 0개면 안전하다는 것만은 확실하다.

### 3.7 시나리오 D — 축 자체를 추가/삭제

**추가.** 두 경로가 있고 어느 쪽이 옳은지 실행으로 갈라야 한다:

```js
// 경로 1 — API. 타입 정의상 addComponentProperty가 'VARIANT'를 지원한다. UNVERIFIED (§7-3)
set.addComponentProperty('State', 'VARIANT', 'Default');

// 경로 2 — 결정적. 모든 자식 이름에 새 쌍을 덧붙인 뒤, 새 값의 조합을 자식으로 추가한다
for (const c of set.children) c.name = c.name + ', state=default';
for (const v of VARIANTS) for (const s of SIZES) for (const st of ['hover','disabled'])
  set.appendChild(buildVariant(v, s, st));
```

경로 2가 **API에 기대는 게 없어 안전하다.** 경로 1이 통하면 훨씬 짧아진다.

**삭제.** **CONFIRMED — 타입 정의: `deleteComponentProperty`는 *"only supports properties with type 'BOOLEAN', 'TEXT', 'INSTANCE_SWAP' or 'SLOT'"*.** VARIANT 축을 지우는 API는 **없다.**

축을 지우려면 이름 문자열에서 그 쌍을 떼야 하는데, 떼는 순간 N개 자식의 이름이 **서로 같아진다.** 그래서 순서가 강제된다:

1. 남길 값 하나를 고른다 (예: `state=default`)
2. 나머지 값의 자식을 **먼저 `remove()`** 한다 (§3.6의 인스턴스 검사를 거쳐)
3. 남은 자식들의 이름에서 `, state=default`를 뗀다

**이 순서를 어기면 중복 이름 상태를 거치게 되고, 그 상태에서 Figma가 뭘 하는지 모른다(§7-4).**

### 3.8 자식 컴포넌트 안의 내용을 고치는 것 — 가장 흔한 갱신

토큰 값이 바뀌었거나 padding 규칙이 바뀌었을 때. **자식을 새로 만들지 않고 자식 안을 고친다.**

```js
for (const c of set.children) {
  const p = Object.fromEntries(c.name.split(', ').map(s => s.split('=')));
  const spec = SPEC[p.variant][p.size];
  c.setBoundVariable('paddingLeft',  V[spec.px]);
  c.setBoundVariable('paddingRight', V[spec.px]);
  c.setBoundVariable('itemSpacing',  V[spec.gap]);
  c.setBoundVariable('cornerRadius', V[spec.radius]);
  c.fills = [figma.variables.setBoundVariableForPaint(
    { type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', V[spec.bg])];
}
```

여기엔 인스턴스 위험이 없다. **제자리 수정의 90%가 이 형태여야 한다.**

---

## 4. 변수 바인딩 — Auto Layout · 색

### 4.1 바인딩 가능한 필드의 **정확한 전체 목록**

**CONFIRMED — 타입 정의 v1.134.0.** 추측할 필요가 없다. 이게 전부다:

```ts
type VariableBindableNodeField =
  | 'height' | 'width' | 'characters' | 'itemSpacing'
  | 'paddingLeft' | 'paddingRight' | 'paddingTop' | 'paddingBottom'
  | 'visible' | 'cornerRadius'
  | 'topLeftRadius' | 'topRightRadius' | 'bottomLeftRadius' | 'bottomRightRadius'
  | 'minWidth' | 'maxWidth' | 'minHeight' | 'maxHeight'
  | 'counterAxisSpacing' | 'strokeWeight'
  | 'strokeTopWeight' | 'strokeRightWeight' | 'strokeBottomWeight' | 'strokeLeftWeight'
  | 'opacity' | 'gridRowGap' | 'gridColumnGap'
```

티켓이 물은 것에 대한 답:

| 필드 | FLOAT 바인딩 | 비고 |
|---|---|---|
| `itemSpacing` | ✅ | space 스케일이 여기로 들어간다 |
| `paddingLeft/Right/Top/Bottom` | ✅ | 4개 각각 별도 바인딩. 묶음 API 없음 |
| `cornerRadius` | ✅ | 아래 §4.2 주의 |
| `counterAxisSpacing` | ✅ | `layoutWrap='WRAP'`일 때의 행간 |
| `strokeWeight` | ✅ | border 두께도 토큰화 가능 |
| **`layoutMode`** | ❌ | **목록에 없다.** enum이라 애초에 FLOAT가 아니다. 리터럴로 쓴다 |
| `primaryAxisAlignItems` 등 정렬 | ❌ | 전부 리터럴 |
| `layoutSizingHorizontal/Vertical` | ❌ | 전부 리터럴 |

### 4.2 `cornerRadius` 바인딩은 읽을 때 이름이 4개로 갈라진다

**CONFIRMED — 타입 정의 `boundVariables` 주석:**

> *"On nodes with independent corner radii (e.g. rectangles, frames), a `cornerRadius` binding sets all four corners and appears in `boundVariables` as `topLeftRadius`/`topRightRadius`/`bottomLeftRadius`/`bottomRightRadius` rather than `cornerRadius`."*

컴포넌트는 프레임이므로 **항상 이쪽**이다. 쓸 때는 `cornerRadius`, 읽을 때는 네 코너. **멱등 검사를 `boundVariables.cornerRadius`로 짜면 항상 "안 걸려 있음"으로 읽혀 매번 다시 바인딩한다.**

### 4.3 fills / strokes — `setBoundVariable('fills', ...)`는 **없다**

`'fills'`도 `'strokes'`도 `VariableBindableNodeField`에 없다. **CONFIRMED.** 색은 paint 객체 안의 `color` 필드에 거는 것이고, 전용 헬퍼를 쓴다:

```ts
figma.variables.setBoundVariableForPaint(paint: SolidPaint, field: 'color', variable: Variable | null): SolidPaint
```

- **새 객체를 반환한다.** 반환값을 받아 `node.fills = [bound]`로 재할당해야 한다 (figma-injection.md §2.7과 같은 함정)
- **SOLID paint에만 동작한다.** gradient·image는 throw (gotchas)
- **`fills`가 빈 배열이면 걸 데가 없다.** 플레이스홀더 SOLID를 먼저 넣고 바인딩한다 (gotchas)
- stroke도 같은 헬퍼로 만들어 `node.strokes = [bound]`

### 4.4 `variableConsumptionMap`은 Plugin API에 존재하지 않는다

**CONFIRMED — 부재 확인.** `@figma/plugin-typings` v1.134.0 전체에서 `variableConsumptionMap` 식별자가 **0회** 등장한다. 공식 문서·포럼 검색에서도 나오지 않는다. 노드가 소비하는 변수를 읽는 수단은 `node.boundVariables`(명시적 바인딩)와 `node.inferredVariables`(값이 일치하는 변수 추론) 두 개다. **이 이름을 쓰는 코드를 짜지 말 것.**

### 4.5 variant마다 모드를 다르게 보이려면 명시적으로 지정해야 한다

**CONFIRMED — gotchas "Explicit variable modes must be set per component".** semantic 컬렉션이 `Light`/`Dark` 2모드인데, 아무것도 안 하면 **모든 variant가 기본 모드(Light)로 렌더된다.** 다크 프리뷰를 canvas에 보이려면:

```js
component.setExplicitVariableModeForCollection(semanticCollection, darkModeId);
```

→ 이건 곧바로 설계 질문이 된다: **다크를 `mode=dark` variant 축으로 만들 것인가, 아니면 세트는 라이트 하나만 두고 다크는 프레임 레벨 모드 전환으로 볼 것인가.** [#24](https://github.com/flameware/massive-design/issues/24)의 결정이다. 여기서는 두 경로가 다 API상 가능하다는 것만 확정한다. (축으로 만들면 노드 수가 ×2 된다.)

---

## 5. 컴포넌트 안의 텍스트 — 순서 규칙은 그대로 유효하고, **한 단계 더 엄해진다**

### 5.1 이전 맵의 규칙은 그대로다

**CONFIRMED — 공식 스킬 번들이 우리가 실측으로 얻은 것과 같은 말을 한다.** [gotchas.md "Canonical text-edit recipe"](https://github.com/figma/mcp-server-guide/blob/main/skills/figma-use/references/gotchas.md):

> *"Font loading is also required for **any** operation on nodes that contain unloaded fonts — `appendChild`, `insertChild`, `setBoundVariable`, `setExplicitVariableModeForCollection`, `setValueForMode`, and even `findAll` callbacks that touch text properties."*

figma-injection.md §2.5의 "구조 먼저, 폰트 나중"이 여기서 재확인된다. 3회 재시도(§2.4)는 공식 문서에 근거가 없는 **우리 파일의 실측**이고, 그대로 유지한다.

### 5.2 컴포넌트 고유의 주름 — **`combineAsVariants`가 reparenting이다**

이게 이번 조사의 새 사실이다. `combineAsVariants`도 `set.appendChild`도 **노드를 옮기는 작업**이고, 위 인용에 따르면 **폰트가 잠긴 노드는 reparenting 대상이 될 수 없다.**

→ **`fontFamily` 바인딩은 `combineAsVariants` / `appendChild` 보다도 뒤로 가야 한다.** 순서가 이렇게 확정된다:

```
1. loadFontAsync({family:'Inter', style:<weight>})   ← 부트스트랩용 리터럴 폰트
2. 모든 variant ComponentNode 생성 + Auto Layout + fills/padding 변수 바인딩
3. TEXT 노드 생성 · characters 기록 · fontSize/lineHeight 변수 바인딩
4. component.appendChild(textNode)
5. figma.combineAsVariants([...]) / set.appendChild(newVariant)
6. 배치 · resizeWithoutConstraints
7. componentPropertyReferences 연결 (TEXT/BOOLEAN/INSTANCE_SWAP)
8. setExplicitVariableModeForCollection (쓴다면)
9. ★ 맨 마지막에 모든 TEXT 노드에 fontFamily 일괄 바인딩 — 3회 재시도로 감싼다
10. set.description = ... (해시 스탬프)
```

**9를 5보다 앞에 두면 5가 throw한다.** 이건 예측이지 실측이 아니다(§7-5) — 하지만 인용된 문장이 `appendChild`를 명시적으로 열거하므로 위험을 안고 갈 이유가 없다.

### 5.3 TEXT property를 쓰면 `characters` 직접 쓰기와 충돌한다

**CONFIRMED — [component-patterns.md](https://github.com/figma/mcp-server-guide/blob/main/skills/figma-use/references/component-patterns.md):** *"Direct `node.characters` changes on property-managed text may be overridden by the component property system on render."*

즉 라벨을 TEXT property로 만들 거라면 **인스턴스 쪽 텍스트는 `setProperties`로 바꾼다.** 마스터 컴포넌트를 지을 때 `characters`를 쓰는 것은 정상이다(기본값을 눈에 보이게 만드는 것).

### 5.4 `figma.root.findAllWithCriteria`는 `use_figma`에서 못 쓴다

**CONFIRMED — 두 출처가 맞물린다.** 타입 정의: `DocumentNode.findAllWithCriteria`는 *"If the manifest contains `\"documentAccess\": \"dynamic-page\"`, you must first call `figma.loadAllPagesAsync()`"*. 그런데 `use_figma` 도구 설명: *"MUST NEVER use `loadAllPagesAsync`"*.

→ **문서 전체를 한 번에 훑는 컴포넌트 조회는 불가능하다.** wwds-components.md가 예시로 보여주는 `figma.root.findAllWithCriteria({types:['COMPONENT_SET']})`는 **`use_figma` 안에서는 실패한다** — 공식 스킬 문서의 예시가 자기 도구 제약과 어긋나는 지점이다. 대안:

1. 1회차 호출: `return figma.root.children.map(p => ({id:p.id, name:p.name}))`
2. 2회차부터: 페이지별로 `setCurrentPageAsync` → `page.findAllWithCriteria`

**우리 파일에서는 애초에 컴포넌트를 페이지 하나에 몰아두면 이 문제가 사라진다.** 이게 가장 싼 대응이고 [#24](https://github.com/flameware/massive-design/issues/24)가 정할 일이다.

---

## 6. 스크립트 크기 예산 — 50,000자

### 6.1 상한은 확정 사실이다

**CONFIRMED — `use_figma` 도구 스키마:** `code` 파라미터에 `"maxLength": 50000`. 도구 호출 자체가 검증에서 거부되므로 **넘으면 Figma에 도달조차 못 한다.**

### 6.2 variant 하나의 API 호출 비용

버튼 한 variant를 짓는 데 실제로 필요한 호출:

```
createComponent · name · layoutMode · primaryAxisAlignItems · counterAxisAlignItems
· layoutSizingHorizontal · layoutSizingVertical
· setBoundVariable ×4 (padding) · ×1 (itemSpacing) · ×1 (cornerRadius)
· setBoundVariableForPaint + fills=  (배경)
· createText · characters · setBoundVariable ×2 (fontSize·lineHeight)
· setBoundVariableForPaint + fills=  (텍스트 색)
· appendChild · x= · y=
≈ 22 statement
```

### 6.3 두 가지 작성 방식, 열 배 차이

| 방식 | variant당 문자 | 24 variant | 50,000자에 들어가는 수 |
|---|---|---|---|
| **풀어쓰기** (variant마다 22줄 반복) | ~1,400 | ~34 KB | **약 33개** |
| **데이터 주도** (`buildVariant(spec)` + spec 배열) | ~110 (spec 한 줄) | ~5 KB | **약 400개** |

데이터 주도 방식의 고정비: 헬퍼 함수 + 변수 조회 + 배치/리사이즈 + 재시도 래퍼 ≈ **3,000~4,000자**. 그 뒤로는 spec 한 줄씩만 는다.

```js
const SPEC = [
  ['default','sm','bg/primary','fg/on-solid','space/3','space/1-5','radius/md','type/size/sm'],
  ['default','md','bg/primary','fg/on-solid','space/4','space/2',  'radius/md','type/size/sm'],
  // ... 한 줄 ≈ 110자
];
```

**결론: 문자 수는 병목이 아니다.** 데이터 주도로 짜면 shadcn 컴포넌트 서너 개의 전체 variant가 한 호출에 들어간다. 토큰 61개가 4KB였던 실측과 자릿수가 같다.

### 6.4 그럼에도 **컴포넌트 세트 하나 = 호출 하나**로 쪼갤 것

이유는 크기가 아니라 세 가지다:

1. **`use_figma`의 atomic 롤백 범위가 호출 단위다.** Button 24개를 짓다 20번째에서 throw하면 앞의 19개도 사라진다. 세트별로 쪼개면 재실행 범위가 세트 하나다 — figma-injection.md §1이 파일을 쪼갠 것과 정확히 같은 논리
2. **`fontFamily` 3회 재시도의 부수효과가 호출 경계를 넘어 살아남는다**(figma-injection.md §2.4). 재시도 대상이 적을수록 콜드 파일 첫 실행이 예측 가능하다
3. **제자리 수정이 세트 단위로 이뤄진다.** 매니페스트 해시 비교도 세트 단위(§3.2)라 호출 경계를 세트에 맞추면 "안 바뀐 세트는 호출 자체를 건너뛴다"가 공짜로 된다

### 6.5 진짜 병목은 문자가 아니라 노드 수일 가능성이 높다

이전 맵 실측: 텍스트 59개 포함 스와치 페이지가 **~2.4초**. variant 하나가 노드 2~3개이므로 24 variant ≈ 60~70 노드로 같은 자릿수다. 하지만 §2.4의 `State` 축을 넣으면 **120 variant ≈ 350 노드**가 되고, 여기가 미지의 영역이다(§7-7).

---

## 7. 함정 모음 (한 줄씩)

1. **`figma.createComponentSet()`은 없다.** 컴포넌트를 먼저 만들고 `combineAsVariants`로 묶는 길뿐이다
2. **variant property는 API가 아니라 자식 이름 문자열 `Name=Value, Name2=Value2`로 선언된다.** `componentPropertyDefinitions`는 그걸 읽는 창일 뿐 쓰는 창이 아니다
3. **`combineAsVariants` 뒤 자식이 전부 `(0,0)`에 겹친다.** 배치하고 `resizeWithoutConstraints`까지 하지 않으면 세트가 variant 하나 크기로 남는다. 리사이즈는 공식이 아니라 **실제 자식 bounds**에서 계산한다
4. **variant 자식에서 `componentPropertyDefinitions`를 읽으면 throw한다.** optional chaining으로도 못 막는다. 항상 부모 세트로 올라간다
5. **`addComponentProperty`의 반환값은 키 **문자열**이다.** `Object.keys(ret)[0]`은 `'0'`을 준다
6. **연결하지 않은 property는 아무 일도 안 한다.** `componentPropertyReferences`의 키는 `visible`·`characters`·`mainComponent`(+`slotContentId`) **넷뿐**이다
7. **BOOLEAN은 `visible`만 건드린다.** 색이 바뀌는 상태(hover/disabled)는 VARIANT 축으로 갈 수밖에 없고, 그건 노드 수를 곱한다
8. **VARIANT 축은 `deleteComponentProperty`로 못 지운다.** 자식 이름에서 쌍을 떼는 수동 경로뿐이고, 순서를 틀리면 중복 이름 상태를 거친다
9. **VARIANT는 `editComponentProperty`로 `defaultValue`를 못 바꾼다.** `name`만 된다. 값 이름 변경은 자식 이름 문자열 편집이라는 **완전히 다른 경로**다
10. **자식을 전부 지우면 세트가 자멸한다.** "먼저 넣고 나중에 뺀다" 순서를 강제한다
11. **`clone()`은 인스턴스 0개인 새 컴포넌트를 만든다.** 백업/교체 용도로 쓰면 안 된다
12. **`setBoundVariable('fills', …)`는 없다.** `setBoundVariableForPaint`가 **새 객체를 반환**하고, 빈 `fills`에는 걸 수 없다
13. **`cornerRadius`는 쓸 때 하나, 읽을 때 네 코너.** 멱등 검사를 `boundVariables.cornerRadius`로 짜면 영원히 다시 바인딩한다
14. **`layoutMode`는 바인딩 불가**(enum). 리터럴로 쓴다
15. **`use_figma`는 `setPluginData`·`loadAllPagesAsync`·`createImageAsync`를 금지한다.** 낡음 판정을 plugin data에 둘 수 없고(→ `description`), `figma.root.findAllWithCriteria` 전체 조회도 불가능하다
16. **다크는 저절로 안 보인다.** `setExplicitVariableModeForCollection`을 variant마다 명시해야 한다
17. **폰트 잠긴 노드는 `appendChild`/`combineAsVariants`의 대상이 될 수 없다.** `fontFamily` 바인딩을 세트 조립보다 **뒤로** 미룬다
18. **TEXT property가 붙은 노드에 `characters`를 직접 쓰면 렌더 시 덮일 수 있다.** 인스턴스는 `setProperties`로 고친다
19. **50,000자는 데이터 주도로 짜면 여유가 크다**(≈400 variant). 그래도 세트 하나 = 호출 하나로 쪼갠다 — 이유는 크기가 아니라 atomic 롤백 범위다

---

## 8. 검증 안 된 것 — 프로토타입 왕복이 필요하다

`use_figma` 실행 없이는 **확정할 수 없는** 것들이다. 번호는 §3.3 표에서 참조된다. 순서가 곧 우선순위다.

1. **variant 값 이름 변경이 인스턴스를 유지하는가.** 자식 `name`을 `size=md` → `size=base`로 바꿨을 때, 그 자식의 인스턴스가 (a) 그대로 살아 `size=base`로 읽히는지 (b) 값이 비는지 (c) 끊기는지. **이 티켓에서 가장 값진 미지수다** — 코드의 cva 값 이름이 바뀔 때마다 밟게 될 경로다
2. **variant 삭제가 인스턴스에 하는 일.** `child.remove()`를 인스턴스가 달린 자식에 했을 때. UI에서는 "삭제된 컴포넌트"로 남아 복구 가능한 것으로 알려져 있으나 **Plugin API 경로가 같은지 확인 안 됨.** 확인 전까지 §3.6처럼 **인스턴스가 있으면 삭제하지 않고 보고**한다
3. **`addComponentProperty(name, 'VARIANT', default)`가 실제로 하는 일.** 타입 정의는 VARIANT를 지원한다고 적지만, 그게 **모든 자식 이름에 쌍을 덧붙이는지** 아니면 정의만 만들고 이름과 어긋난 상태를 만드는지 모른다. §3.7 경로 1의 성립 여부
4. **중복 이름 자식이 잠깐 존재할 때의 동작.** 축 제거 과정에서 필연적으로 스쳐 가는 상태. Figma가 자동으로 접미사를 붙이는지, throw하는지, 조용히 깨지는지
5. **`fontFamily` 바인딩 → `appendChild` 순서가 정말 throw하는가.** 인용문이 `appendChild`를 열거하므로 그렇게 가정했지만 실측이 아니다. 반대로 통한다면 §5.2의 순서 제약이 느슨해진다
6. **`ComponentSetNode`에 `layoutMode`를 걸어 배치를 대신할 수 있는가.** 타입상 `AutoLayoutMixin`을 갖지만, 세트의 격자 의미론과 Auto Layout이 어떻게 상호작용하는지 미확인. 되면 §1.4의 좌표 계산이 통째로 사라진다
7. **노드 수 상한.** 120 variant × 3 노드 ≈ 350 노드 규모에서 `use_figma` 한 호출이 타임아웃하는지. 이전 맵의 최대 실측은 59 텍스트 노드·2.4초였다. 이전 맵이 남긴 fog와 같은 항목이다
8. **`slotContentId`가 `componentPropertyReferences` 타입 유니온에 없다.** 스킬 번들은 쓰라고 하는데 타입 정의의 유니온은 `'visible' | 'characters' | 'mainComponent'` 셋뿐이다(v1.134.0). 타입 정의가 뒤처진 것인지 스킬 문서가 앞서간 것인지 미확인. **SLOT을 쓸 계획이 없으면 무시해도 되는 항목**
9. **`ComponentSetNode`에 property를 직접 추가해도 되는가.** 타입 정의는 세트가 `ComponentPropertiesMixin`을 갖는다고 하는데, 스킬 번들은 *"Add component properties to each variant component **before** calling `combineAsVariants`. … Do not add properties to the `ComponentSetNode` directly"* 라고 금지한다. **제자리 수정에서는 세트가 이미 존재하므로 이 금지를 지킬 수가 없다** — §3.3 표에서 "안전"으로 적은 `set.addComponentProperty`가 여기 걸려 있다. **2번 다음으로 중요한 미지수다**
10. **`hiddenFromPublishing`·라이브러리 발행이 컴포넌트에 미치는 영향.** 이전 맵의 fog가 그대로 이어진다

### 프로토타입 티켓이 밟을 최소 코스

한 번의 왕복으로 1·2·3·4·9를 전부 가른다:

```
① Button 2×2 (variant × size) 4 variant 세트를 짓는다 → 인스턴스 2개를 canvas에 꽂는다
② 자식 이름 하나를 size=md → size=base 로 바꾼다        → 인스턴스 상태 확인 (미지수 1)
③ set.addComponentProperty('Label','TEXT','Button')     → 세트 직접 추가 가능? (미지수 9)
④ set.addComponentProperty('State','VARIANT','Default') → 자식 이름이 따라 바뀌나? (미지수 3)
⑤ 자식 하나를 remove()                                   → 그 인스턴스 상태 확인 (미지수 2)
⑥ 두 번 실행해 세트 수·자식 수가 그대로인지 본다          → 멱등 확인
```

⑥은 figma-injection.md §3의 검증 규약을 컴포넌트로 옮긴 것이다. **인스턴스 2개를 미리 꽂아두는 것이 이 프로토타입의 전부다** — 그게 없으면 무엇이 끊기는지 볼 수가 없다.
