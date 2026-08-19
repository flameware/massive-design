# Code Connect 없이 코드↔Figma 매핑과 낡음 판정을 무엇에 실을 것인가

- 티켓: [#19](https://github.com/flameware/massive-design/issues/19) (맵 [#14](https://github.com/flameware/massive-design/issues/14), 결정은 [#25](https://github.com/flameware/massive-design/issues/25))
- 조사일: 2026-08-20
- 대상 파일: https://www.figma.com/design/wxz7M6txDvlvH6Z95JzDHJ/Massive-Design (fileKey `wxz7M6txDvlvH6Z95JzDHJ`)

각 항목은 **CONFIRMED**(공식 문서 인용 또는 이 파일에서 직접 실행한 프로브) / **UNVERIFIED**(확인 못 함, 추측 금지)로 표시한다.

**이 문서는 결정하지 않는다.** 후보와 사실만 늘어놓는다.

---

## 0. 질문

컴포넌트 맵의 destination은 "에이전트가 우리 Figma 컴포넌트를 인스턴스로 꺼내 화면 시안을 조립한다"이다([`docs/handoff/component-map.md`](../handoff/component-map.md) §1). 그러려면 에이전트가 Figma 안에서 두 가지를 알아야 한다.

1. **동일성** — "이 Figma 컴포넌트는 어느 React 컴포넌트인가"
2. **낡음** — "이 Figma 컴포넌트는 지금 코드와 같은 세대인가"

Code Connect가 업계 표준 답이지만 **Pro에서 쓸 수 없다.** 지금은 (1)을 이름 규약에, (2)를 "매니페스트 해시를 `description`에 박는다"는 미검증 계획에 기대고 있다(핸드오프 §3.4).

**한 가지 중요한 축소가 이 조사의 전제다.** 우리는 코드→Figma 단방향이고, 매핑의 소비자는 **Dev Mode에서 스니펫을 읽는 사람 개발자가 아니라 인스턴스를 조립하는 LLM 에이전트**다. 즉 매핑이 Figma UI에 예쁘게 렌더될 필요가 없다. **기계가 읽을 수 있으면 끝난다.** §4가 이걸 자세히 나눈다.

---

## 1. 프로브 — 이 조사에서 가장 값진 사실들

핸드오프 §3.4가 계획으로 적어둔 것 중 **두 개가 프로브에서 뒤집혔다.** 실제 대상 파일에 임시 `COMPONENT`를 만들어 전부 시도하고 지웠다(순변화 0).

### 1.1 `setPluginData`는 MCP 경유로 **쓸 수 없다** (CONFIRMED — 프로브)

```
Error: in setPluginData: figma.setPluginData is not supported in this host runtime
(only private plugins on web can use it). Use figma.setSharedPluginData(namespace, key, value)
instead — shared plugin data works across plugins and host runtimes.
```

`use_figma` 도구 설명도 같은 말을 한다: *"MUST NEVER use loadAllPagesAsync, setPluginData, createImageAsync. They are not supported API."*

이유는 구조적이다. `setPluginData`는 **호출한 플러그인의 ID로 네임스페이스가 잡히는데**([setPluginData](https://developers.figma.com/docs/plugins/api/properties/nodes-setplugindata/): *"The data is specific to your plugin ID. Plugins with other IDs won't be able to read this data"*, *"Data will become inaccessible if your plugin ID changes"*), 우리는 우리 플러그인을 갖고 있지 않다. 프로브가 읽어낸 호스트 런타임의 `figma.pluginId`는 **`500ec198-a71f-4559-b376-d9806fd5d79d`** — Figma MCP 플러그인의 ID다. 거기에 데이터를 쓰면 우리 것이 아니라 **Figma MCP 플러그인의 사물함**에 넣는 것이고, Figma가 그 ID를 바꾸면 조용히 사라진다.

또한 Pro에서는 사설 플러그인을 배포할 수 없다 — [Figma plans and features](https://help.figma.com/hc/en-us/articles/360040328273)의 *"Private widgets and plugins"* 행이 Organization/Enterprise에만 체크돼 있다. **`setPluginData`는 우리에게 존재하지 않는 API로 취급하면 된다.**

### 1.2 `setSharedPluginData`는 **된다** (CONFIRMED — 프로브)

```js
comp.setSharedPluginData('massive', 'component', 'Button');
comp.setSharedPluginData('massive', 'hash', 'a1b2c3d4');
comp.getSharedPluginDataKeys('massive');  // → ["hash", "component"]
```

왕복 성공. 네임스페이스는 **우리가 고른다**(플러그인 ID와 무관, 3자 이상 영숫자/`_`/`.`). [setSharedPluginData](https://developers.figma.com/docs/plugins/api/properties/nodes-setsharedplugindata/): *"Any data you write using this API will be readable by any plugin"*. 항목당 상한은 100 kB.

### 1.3 dev resources는 MCP 경유로 **쓸 수 없다** (CONFIRMED — 프로브)

```
Error: in addDevResourceAsync: "addDevResourceAsync" is not a supported API
```

읽기 쪽(`getDevResourcesAsync`)은 함수로 존재하지만 쓰기(`addDevResourceAsync`)는 호스트 런타임이 막아뒀다. **핸드오프가 후보로 올려둔 "dev resources로 GitHub 소스를 가리킨다"는 우리 주입 경로에서 불가능하다** — §3이 남은 경로를 정리한다.

### 1.4 `descriptionMarkdown`을 쓰면 `description`이 **덮인다** (CONFIRMED — 프로브)

```js
comp.description = 'probe#sha=abc123';        // description === 'probe#sha=abc123'
comp.descriptionMarkdown = '`probe` **md**';  // description === 'probe md'   ← 덮였다
```

둘은 **별개의 두 필드가 아니라 같은 한 필드의 두 표현**이다. 마크다운이 원본이고 `description`은 마크업을 벗긴 파생물이다. → **해시를 `description`에 박아놓고 나중에 `descriptionMarkdown`으로 문서를 쓰면 해시가 날아간다.** 둘 중 하나만 쓰거나, 마크다운 쪽에 해시를 포함시켜야 한다.

### 1.5 `documentationLinks`는 **1개까지** (CONFIRMED — 프로브)

```
Error: in set_documentationLinks: Documentation links API takes a list of size 0 or 1
```

문서와 일치한다([documentationLinks](https://developers.figma.com/docs/plugins/api/properties/nodes-documentationlinks/): *"This API currently only supports setting a single documentation link"*). `{ uri }` 하나. 쓰기는 정상 동작했다.

### 1.6 `key`는 발행 전에도 있다 (CONFIRMED — 프로브)

발행되지 않은 임시 컴포넌트의 `key`가 `4d3e251b62218cd10bdd491c0db6d15e472b910b`(40자 hex)였고, 같은 호출에서 `getPublishStatusAsync()`는 `"UNPUBLISHED"`를 냈다. 문서와 일치한다([ComponentNode](https://developers.figma.com/docs/plugins/api/ComponentNode/)): *"while this key is present on local and published components, you can only import components that are already published"*.

---

## 2. 후보 비교표

세로축이 후보, 가로축이 우리가 물어야 할 것.

| 후보 | MCP `use_figma`로 쓰기 | 플러그인 없이 읽기 | 발행 시 생존 | 다른 파일 인스턴스에 전파 | 사람 눈에 보임 |
|---|---|---|---|---|---|
| `description` / `descriptionMarkdown` | ✅ (§1.4 주의) | ✅ REST `GET /v1/files/:key/components` | ✅ (⚠️ 재발행 버그) | ✅ 라이브러리 자산 패널·Dev Mode | ✅ 강제로 보임 |
| `documentationLinks` | ✅ 1개만 | ❌ REST 컴포넌트 응답에 없음 | ⚠️ UNVERIFIED | ⚠️ UNVERIFIED | ✅ |
| `setSharedPluginData` | ✅ | ✅ REST `?plugin_data=shared` | ⚠️ UNVERIFIED (반증 보고 있음) | ⚠️ UNVERIFIED (반증 보고 있음) | ❌ 완전 비가시 |
| `setPluginData` | ❌ 호스트 런타임 차단 | ✅ REST `?plugin_data=<pluginId>` | — | — | ❌ |
| `key` | 읽기 전용 | ✅ REST 컴포넌트 엔드포인트 | ✅ 발행의 정본 식별자 | ✅ `instance.mainComponent.key` | ❌ |
| dev resources | ❌ 호스트 런타임 차단 | ✅ REST `dev_resources` | ⚠️ UNVERIFIED | ✅ 문서가 명시 (단, API 읽기 버그) | ✅ Dev Mode `Links` |
| 컴포넌트 이름 규약 | ✅ | ✅ 어디서나 | ✅ | ✅ | ✅ |
| Code Connect | ❌ 플랜 | — | — | — | ✅ |

### 2.1 `description` / `descriptionMarkdown`

- **쓰기**: `ComponentNode`·`ComponentSetNode`·모든 Style에 있다. 프로브에서 둘 다 정상 기록.
- **플러그인 없이 읽기**: **된다.** [`GET /v1/files/:file_key/components`](https://developers.figma.com/docs/rest-api/component-endpoints/)가 `key`, `node_id`, `name`, `description`, `updated_at`을 낸다(scope `library_content:read`). 즉 **CI가 Figma를 열지 않고 해시를 대조할 수 있다.** `documentation_links`는 이 응답에 **없다.**
- **⚠️ Figma의 공식 경고**: [descriptionMarkdown](https://developers.figma.com/docs/plugins/api/properties/nodes-descriptionmarkdown/) 문서가 *"There is currently a bug in Figma where the description field will appear to be missing or not up to date. Until this is fixed, the workaround is to re-publish nodes for which the description is missing"* 라고 적어놨다. **낡음 판정을 여기에 실으면, Figma의 버그가 곧바로 "낡음" 오탐이 된다.** 판정 로직이 "해시 불일치"와 "해시 없음"을 구분해야 하는 이유다.
- **사람 눈에 보인다**는 게 양날이다. 컴포넌트 설명은 자산 패널에 그대로 뜬다 — `a1b2c3d4` 같은 raw 해시가 디자이너 화면에 노출된다. 규약이 필요하다(예: 설명 본문 뒤 `<!-- massive:sha=... -->` 같은 꼬리, 또는 마크다운 코드 스팬).

### 2.2 `setSharedPluginData`

- **쓰기**: §1.2에서 확인. 구조화된 데이터를 여러 키로 나눠 담을 수 있는 유일한 후보다(`component`, `hash`, `variantMap`, …).
- **플러그인 없이 읽기**: **된다.** [File endpoints](https://developers.figma.com/docs/rest-api/file-endpoints/)의 `plugin_data` 쿼리 파라미터 — *"A comma separated list of plugin IDs and/or the string `shared`. Any data present in the document written by those plugins will be included in the result in the `pluginData` and `sharedPluginData` properties."* 즉 `GET /v1/files/:key?plugin_data=shared`. 다만 이건 **파일 트리 전체를 받는 무거운 호출**이고 `.../nodes?ids=...&plugin_data=shared`로 좁힐 수 있다.
- **⚠️ 발행 경계**: 여기가 이 후보의 급소다. 커뮤니티에 **반증 보고**가 있다. [setPluginData between files on ComponentSet/Component](https://forum.figma.com/ask-the-community-7/setplugindata-between-files-on-componentset-component-27364)에서 라이브러리 파일의 ComponentSet에 심은 데이터를 소비 파일에서 `instance.mainComponent.parent.getPluginData()`로 읽으니 계속 `undefined`였고, 질문자는 결국 **`addDevResourceAsync`로 우회**했다. Figma 직원 답변은 없다. [스타일 쪽에도 같은 증상 보고](https://forum.figma.com/t/custom-data-on-effectstyle-using-setplugindata-not-working-when-published/14915)가 있다(본문 확인 실패 — 403).
  - 단 그 사례는 `sharedPluginData`가 아니라 `pluginData`이고, 소비 파일에서 실행된 플러그인 ID가 라이브러리 파일에 쓴 플러그인 ID와 같았는지도 불명확하다. **우리 조건(sharedPluginData + 우리 네임스페이스)에서 재현되는지는 UNVERIFIED.**
  - 구조적 제약 하나는 확실하다: [ComponentSetNode.remote](https://developers.figma.com/docs/plugins/api/ComponentSetNode/) — *"Remote components are read-only."* 즉 **쓰기는 반드시 라이브러리 파일(=우리 주입 대상 파일)에서 해야 한다.** 소비 파일에서 원본 컴포넌트에 메타데이터를 붙이는 경로는 없다.
- **비가시성**이 장점이다. 디자이너 화면을 오염시키지 않는다. 동시에 단점이다 — 사람이 확인할 방법이 사실상 없다.

### 2.3 `key`

컴포넌트 동일성 문제의 **정본 답**이다. 40자 hex, 발행을 넘어 안정적이고, 소비 파일의 인스턴스에서 `instance.mainComponent.key`로 항상 얻을 수 있으며, `figma.importComponentByKeyAsync(key)`의 입력이다.

**결정적 성질**: `key`는 **우리가 정하지 않는다.** Figma가 준다. 따라서 `key → React 컴포넌트`의 방향은 **리포에 커밋된 표**로만 표현된다. 이건 약점이 아니라 성질이다 — 우리는 이미 매니페스트를 커밋하고 있고(핸드오프 §2.5), 표를 하나 더 커밋하는 것은 그 결정의 연장이다. 대신 **주입 절차가 왕복이 된다**: 컴포넌트를 만들고 → `key`를 회수해 → 리포에 기록하고 → 커밋한다. 지금의 단방향 주입 절차([`docs/agents/figma-injection.md`](../agents/figma-injection.md))에 없던 단계다.

또 하나: 리포가 "Figma 주입 기록을 보관하지 않는다"(핸드오프 §3.4)는 원칙과 **정면으로 부딪힌다.** key 표는 정확히 Figma 주입 기록이다.

### 2.4 dev resources

Dev Mode의 `Links` 섹션. GitHub·Jira·Storybook 링크를 레이어에 단다.

- **플랜**: [Link Dev resources to layers in Dev Mode](https://help.figma.com/hc/en-us/articles/15023231995927-Link-Dev-resources-to-layers-in-Dev-Mode) — *"Available on all paid plans"*, *"Requires a Full or Dev seat."* **Pro + Full seat인 우리는 자격이 있다.** 플랜이 막는 게 아니다.
- **전파**: [Guide to Dev Mode](https://help.figma.com/hc/en-us/articles/15023124644247-Guide-to-Dev-Mode)가 명시한다 — *"Dev resources added to components propagate to all the instances of that component."* 인스턴스에 직접 단 링크는 그 인스턴스에만 남는다. **후보 중 전파가 공식 문서로 보장된 유일한 것이다.**
- **그런데 두 개가 막는다:**
  1. **쓰기 경로가 없다.** `addDevResourceAsync`가 MCP 호스트 런타임에서 차단됨(§1.3). 남는 건 (a) 사람이 Dev Mode UI에서 손으로 단다 — 자동화 destination과 정면 충돌, (b) REST [`POST /v1/dev_resources`](https://developers.figma.com/docs/rest-api/dev-resources-endpoints/) (scope `file_dev_resources:write`). REST 경로는 문서에 플랜 제한 문구가 **없다**(Variables REST와 대조적이다 — 그쪽은 Enterprise라고 명시돼 있다). **Pro에서 실제로 되는지는 UNVERIFIED이고, 이 조사에서 가장 값어치 있는 미검증 항목이다.**
  2. **읽기가 인스턴스에서 깨져 있다.** [getDevResourcesAsync returns empty on instances in Dev Mode (regression)](https://forum.figma.com/report-a-problem-6/bug-getdevresourcesasync-returns-empty-on-instances-in-dev-mode-despite-resources-being-visible-in-ui-regression-50333) — 2026-01-30 보고, UI에는 상속된 링크가 보이는데 플러그인 API는 `[]`를 낸다. Figma 답변 없음, 미해결. **소비자가 에이전트인 우리에게는 "UI에 보인다"가 아무 값도 아니다.**

### 2.5 컴포넌트 이름 규약

지금 기대고 있는 것. 비용 0, 어디서든 읽히고, 발행·전파 걱정이 없고, 사람도 읽는다.

깨지는 조건은 하나뿐이지만 그게 현실적이다 — **누가 Figma에서 컴포넌트 이름을 바꾸면 매핑이 조용히 끊긴다.** 그리고 우리 주입 절차는 "이름으로 찾아 제자리에서 고친다"(핸드오프 §3.4)이므로, **이름이 매핑 키인 동시에 멱등성의 키다.** 이름을 바꾸면 다음 주입이 매핑을 잃는 게 아니라 **컴포넌트를 새로 만든다** — 캔버스의 인스턴스가 전부 끊긴다. 즉 이름은 이미 지금도 치명적 식별자이고, 매핑을 이름에 얹는 것은 **새 위험을 만들지 않는다.** 이 사실이 "이름 규약은 임시방편"이라는 직관보다 중요하다.

---

## 3. 플랜 게이팅 — 정확히 무엇이 막히는가

| 기능 | Professional | Org / Enterprise | 출처 |
|---|---|---|---|
| Code Connect | ❌ | ✅ (Full 또는 Dev seat) | [Code Connect 헬프](https://help.figma.com/hc/en-us/articles/23920389749655-Code-Connect): *"Available on the Organization and Enterprise plans"* / [개발자 문서](https://developers.figma.com/docs/code-connect/): *"Available on a Dev or Full seat on the Organization, and Enterprise plans"* |
| Dev Mode 자체 | ✅ | ✅ | [Guide to Dev Mode](https://help.figma.com/hc/en-us/articles/15023124644247-Guide-to-Dev-Mode): *"Available on all paid plans"*, *"Requires a Full or a Dev seat"* |
| dev resources (링크) | ✅ | ✅ | [Link Dev resources](https://help.figma.com/hc/en-us/articles/15023231995927-Link-Dev-resources-to-layers-in-Dev-Mode): *"Available on all paid plans"* |
| 사설 플러그인 배포 | ❌ | ✅ | [Figma plans and features](https://help.figma.com/hc/en-us/articles/360040328273) — *"Private widgets and plugins"* 행 |
| Variables REST API | ❌ | Enterprise만 | 같은 페이지, *"REST API for variables"* 행 (이전 조사 [#4](https://github.com/flameware/massive-design/issues/4)에서 확인) |
| 컴포넌트/라이브러리 REST 읽기 | 플랜 문구 없음 | — | [Component endpoints](https://developers.figma.com/docs/rest-api/component-endpoints/) — 플랜 요구 문구 없음. Pro 실측은 UNVERIFIED |
| dev resources REST | 플랜 문구 없음 | — | [Dev resources endpoints](https://developers.figma.com/docs/rest-api/dev-resources-endpoints/) — 플랜 요구 문구 없음. Pro 실측은 UNVERIFIED |

**요약: 우리를 막는 플랜 장벽은 Code Connect와 사설 플러그인 둘뿐이다.** Dev Mode도 dev resources도 Pro에서 쓸 수 있다. dev resources가 막힌 건 **플랜이 아니라 MCP 호스트 런타임**이고, 이건 플랜을 올려도 안 풀리고 REST를 쓰면 풀릴 수 있는 종류의 벽이다. 이 구분이 중요하다 — "Pro라서 안 된다"와 "우리 주입 경로라서 안 된다"는 해결책이 다르다.

---

## 4. Code Connect가 푸는 것 중 우리에게 필요한 부분

Code Connect의 실제 산출물은 **Dev Mode에 진짜 코드 스니펫을 띄우는 것**이다([헬프](https://help.figma.com/hc/en-us/articles/23920389749655-Code-Connect)): *"Dev Mode shows real-world code snippets defined by your design system instead of the auto-generated ones."* 이걸 위해 `.figma.tsx` 파일에서 `figma.connect(Button, '<figma-url>', { props: { size: figma.enum('Size', ...) } })` 식으로 Figma prop과 코드 prop을 매핑하고 `figma connect publish`로 올린다.

이걸 네 조각으로 쪼개면:

| Code Connect가 주는 것 | 우리에게 필요한가 |
|---|---|
| ① Figma 컴포넌트 ↔ 코드 컴포넌트 **동일성** | **필요하다.** 이 티켓의 질문 자체다 |
| ② Figma variant/prop ↔ 코드 prop **값 매핑** | **이미 매니페스트가 갖고 있다.** `cva` 정의에서 뽑은 variant·size가 리포에 커밋돼 있다(핸드오프 §2.5). Figma 쪽 variant 이름을 매니페스트와 같게 만들면 매핑이 항등함수가 된다 |
| ③ Dev Mode에 **사람이 읽을 코드 스니펫 렌더링** | **필요 없다.** 소비자가 에이전트다. 에이전트는 Figma에서 스니펫을 읽는 게 아니라 리포에서 소스를 읽는다. 게다가 우리 방향은 코드→Figma라 "Figma를 보고 코드를 쓴다"는 상황 자체가 없다 |
| ④ **양방향** 검증 (연결이 끊기면 CLI가 알림) | **절반만.** "낡았다"는 필요하지만 Code Connect의 방식(Figma가 진실을 갖고 CLI가 대조)은 우리와 반대다. 우리는 코드가 진실이다 |

**→ 실제로 남는 요구는 ①과 ④의 절반, 즉 "동일성 + 세대 표시"뿐이다.** 그리고 ①은 **양방향으로 필요하지도 않다.** 갈라서 보면:

- **코드 → Figma** (주입 시): 에이전트가 "Button을 어디에 쓸 것인가"를 알아야 한다. 이건 **이름 조회**로 이미 해결돼 있다(핸드오프 §3.4의 "이름으로 찾아 제자리에서 고친다").
- **Figma → 코드** (조립 시): 에이전트가 "이 컴포넌트로 무엇을 조립할 수 있나"를 알아야 한다. 그런데 **에이전트는 리포도 읽는다.** 매니페스트를 손에 들고 Figma에 들어가므로, Figma 쪽에 필요한 건 "이 노드가 매니페스트의 어느 항목인가"를 잇는 **한 개의 짧은 문자열**이지 자기완결적인 메타데이터 블록이 아니다.

이것이 이 조사의 핵심 축소다. **소비자가 에이전트라는 사실이 요구를 "메타데이터를 심는다"에서 "매니페스트로 가는 포인터를 심는다"로 줄인다.**

---

## 5. 낡음 해시를 실을 자리

해시가 만족해야 할 것: (a) 주입 때 MCP로 쓸 수 있다, (b) 다음 주입 때 같은 경로로 읽을 수 있다, (c) 이왕이면 Figma를 열지 않고 CI가 읽을 수 있다.

| 자리 | (a) 쓰기 | (b) 읽기 | (c) CI 대조 | 비고 |
|---|---|---|---|---|
| `description` 꼬리 (`<!-- massive:sha=… -->`) | ✅ | ✅ | ✅ REST components | Figma 재발행 버그가 오탐원 (§2.1). 디자이너에게 노출 |
| `descriptionMarkdown` 코드 스팬 | ✅ | ✅ | ✅ (평문화된 `description`으로) | `description`을 덮는다(§1.4) — 둘을 동시에 쓰지 말 것 |
| `sharedPluginData('massive','hash')` | ✅ | ✅ 같은 파일 내 확실 | ✅ `?plugin_data=shared` | 비가시. 발행 경계 UNVERIFIED |
| `documentationLinks[0].uri`의 fragment (`…/button.tsx#sha=…`) | ✅ | ✅ | ❌ REST components 응답에 없음 | 슬롯이 하나뿐이라 링크 용도와 해시 용도가 경쟁한다 |
| 문서 루트 `figma.root.setSharedPluginData` | ✅ | ✅ | ✅ | 컴포넌트별이 아니라 **파일 전체 세대** 하나. 컴포넌트 단위 낡음을 못 잡는 대신 값이 하나뿐이라 실패 지점이 적다 |
| dev resource URL | ❌ MCP 차단 | ⚠️ 인스턴스 읽기 버그 | ✅ REST | §2.4 |

**두 층으로 나눌 수 있다는 점이 표에 안 드러난다.** 파일 루트에 매니페스트 전체 해시 하나(= "이 Figma 파일은 코드 커밋 X 세대") + 컴포넌트마다 그 컴포넌트 항목만의 해시. 전자는 "다시 돌릴 필요가 있나?"를 1회 읽기로 답하고, 후자는 "무엇을 다시 돌리나?"를 답한다. 컴포넌트가 10개 남짓인 동안은 전자만으로도 충분할 수 있다.

---

## 6. 권고 — 세 층을 겹치되 각각 다른 일을 시킨다

**단일 후보로 다 되는 것은 없다.** 표의 어느 행도 (동일성 + 낡음 + 발행 생존 + 플러그인 없이 읽기)를 혼자 만족하지 못한다. 그래서 권고는 "무엇을 고르나"가 아니라 **"무엇에 무엇을 시키나"**다.

### 층 1 — 동일성: 이름 규약을 **유지**하고, `key` 표를 그 위에 덧댄다

이름 규약을 임시방편 취급해 버리는 것이 반사적 반응이지만 §2.5가 그걸 뒤집는다 — **이름은 이미 주입 멱등성의 키라서, 이름이 바뀌면 매핑이 아니라 컴포넌트가 깨진다.** 매핑을 이름에 얹어도 새 위험이 없다.

그 위에 `key` 표(`packages/ui/figma-keys.gen.json` 같은 생성물)를 얹는 것을 **선택지로** 남긴다. 얻는 것은 이름 변경 내성과 소비 파일에서의 조회(`instance.mainComponent.key`)이고, 치르는 것은 **주입 절차가 왕복이 되는 것**과 "리포는 Figma 주입 기록을 보관하지 않는다"는 원칙을 깨는 것이다(§2.3).

### 층 2 — 낡음: `description`이 1순위, `sharedPluginData`가 2순위

핸드오프 §3.4의 계획(`description`)이 살아남는다. 근거는 **REST `GET /v1/files/:key/components`가 `description`을 내주기 때문**이다 — CI가 Figma를 열지 않고 대조할 수 있는 유일한 후보이면서 발행 생존이 확실한 유일한 후보다.

대가 두 개를 알고 택해야 한다:
- Figma의 재발행 버그가 "설명 없음"을 만든다(§2.1) → 판정이 **"해시 없음"과 "해시 불일치"를 구분**해야 한다. 없음은 "재발행 필요", 불일치가 "낡음"이다.
- `descriptionMarkdown`을 쓰는 순간 덮인다(§1.4) → 컴포넌트 문서를 마크다운으로 쓸 거면 **해시를 마크다운 본문에 넣어야** 한다. 두 필드를 따로 쓰는 설계는 불가능하다.

`sharedPluginData`는 **가시성 오염이 실제 문제로 드러나면** 옮겨갈 자리다. 지금 1순위로 두지 않는 이유는 발행 경계 생존이 미검증이고 반증 보고가 있기 때문이다(§2.2).

### 층 3 — 구조: 매니페스트가 진실을 갖는다. Figma에는 포인터만 심는다

§4의 결론. Figma에 variant·prop·토큰을 다시 적지 않는다. Figma가 들고 있어야 할 것은 **매니페스트 항목으로 가는 짧은 문자열 하나 + 세대 해시 하나**뿐이다.

### 열어두는 것

- **dev resources는 REST 경로가 검증되면 유력해진다.** 전파가 공식 문서로 보장된 유일한 후보이고(§2.4) Pro에서 쓸 수 있다. 막는 건 MCP 런타임이지 플랜이 아니다. 다만 인스턴스 읽기 버그가 미해결이라, "쓸 수 있다"가 확인돼도 **에이전트가 읽을 수 있다**는 별개로 검증해야 한다.
- **`documentationLinks`는 해시 운반체로 쓰지 않는 편이 낫다.** 슬롯이 1개뿐이라 GitHub 소스 링크와 경쟁하고, REST 컴포넌트 응답에 안 나온다. 소스 링크 용도로만 쓰는 게 자연스럽다.

---

## 7. 확인하지 못한 것

**결정([#25](https://github.com/flameware/massive-design/issues/25))이 이 목록을 무시하면 안 된다.** 위 권고 중 두 개가 여기 걸려 있다.

1. **`sharedPluginData`가 라이브러리 발행을 넘는가.** 커뮤니티 반증 보고는 `pluginData`(shared 아님) 사례이고 Figma 답변이 없다. 우리 조건에서 재현되는지 모른다. → **검증법**: 이 파일에 컴포넌트 하나를 만들고 `sharedPluginData`를 심어 라이브러리로 발행 → 다른 파일에서 인스턴스를 놓고 `instance.mainComponent.getSharedPluginData('massive','hash')`를 읽는다. 우리는 아직 **라이브러리 발행을 한 번도 해본 적이 없다**(핸드오프 §5).
2. **dev resources REST 쓰기가 Pro에서 되는가.** `POST /v1/dev_resources`에 플랜 문구가 없지만, Variables REST가 문서 어딘가에서 Enterprise로 명시된 것과 달리 그냥 안 적힌 것일 수도 있다. → **검증법**: PAT에 `file_dev_resources:write` 스코프를 붙여 실제 호출.
3. **`GET /v1/files/:key/components`가 Pro에서 되는가.** 그리고 **발행되지 않은 파일**에서도 컴포넌트를 내는지(엔드포인트 이름은 file 단위지만 scope가 `library_content:read`다 — 발행된 라이브러리 자산만 낼 가능성이 있다). 이게 안 되면 **층 2의 CI 대조 근거가 통째로 무너진다.**
4. **`?plugin_data=shared`가 Pro에서 되는가.** 파일 엔드포인트 자체는 모든 플랜에서 열려 있지만 실측하지 않았다.
5. **`description` 재발행 버그의 실제 발현 조건.** Figma가 문서에 적어놨을 뿐 재현 조건·빈도를 모른다. 오탐 빈도가 곧 이 방식의 운용 비용이다.
6. **`documentationLinks`가 발행을 넘어 인스턴스에 전파되는가.** 문서에 아무 말이 없다.
7. **Figma MCP의 읽기 도구(`get_metadata` / `get_design_context` / `search_design_system`)가 `description`·`sharedPluginData`를 노출하는가.** 노출한다면 에이전트가 `use_figma` 스크립트를 짜지 않고도 매핑을 읽는다 — 조립 단계의 비용이 크게 갈린다.
8. **`descriptionMarkdown`의 길이 상한과 자산 패널에서의 렌더 방식.** 해시 꼬리를 눈에 덜 띄게 넣는 방법이 있는지가 여기 달렸다.
9. **컴포넌트를 재생성하면 `key`가 바뀌는가.** 거의 확실히 바뀐다(인스턴스가 끊기는 것과 같은 이유)지만 실측하지 않았다. 층 1의 `key` 표 선택지가 이것에 의존한다.
