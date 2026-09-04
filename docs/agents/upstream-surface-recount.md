# upstream 표면 공백 재측정 절차

확정: 2026-09-02 · 근거 티켓 [#176](https://github.com/flameware/massive-design/issues/176) · 맵 [#165](https://github.com/flameware/massive-design/issues/165) · 정본 [`docs/research/surface-gap-recheck-2026-09.md`](https://github.com/flameware/massive-design/blob/research/surface-gap-recheck-2026-09/docs/research/surface-gap-recheck-2026-09.md) §3.4

**"upstream에 있는데 우리 계약에 없는 표면"의 모집단을 만드는 절차다.** [#120](https://github.com/flameware/massive-design/issues/120)·[#162](https://github.com/flameware/massive-design/issues/162)류의 재조회가 시작하는 자리이고, 재조회 티켓 없이 혼자 돌 일은 없다.

**자매 절차 — parts 층위는 게이트가 지킨다.** *우리에게 이름은 있는데 매니페스트에 닿지 않는 클래스*(parts 층위)는 upstream을 읽을 필요가 없어 CI가 지킬 수 있고, `bun run check`(규칙 6, `packages/ui/scripts/manifest/parts-coverage.mjs`)가 매 세대 센다. 기준·예외·재실행은 [`docs/research/parts-population-2026-09.md`](../research/parts-population-2026-09.md) §2([#246](https://github.com/flameware/massive-design/issues/246)). 아래 절차는 upstream 층위만 잰다.

**이 문서는 결정하지 않는다.** [ADR-0006](../adr/0006-uncontracted-surfaces.md)이 이미 판정 기준(관문 ⓐ·ⓑ)과 기록 위치(`limits`)를 정했고, [ADR-0018](../adr/0018-anatomy-is-the-consumer-assembly.md)이 판정 대상(`anatomy`는 소비처가 조립하는 것)을 정했다. 여기 있는 것은 **그 판정을 걸 대상을 무엇으로 만드는가** 하나뿐이다.

## 0. 이 절차가 서는 이유 — 모집단은 사람이 만들지 않는다

[#121](https://github.com/flameware/massive-design/issues/121)의 구멍은 우연이 아니라 **규칙적이었다**([#162](https://github.com/flameware/massive-design/issues/162) §3). 종류 ②의 모집단이 upstream이 아니라 **기준선 문서의 diff 열**에서 나왔고, 축을 옳게 다시 그은 2차 통과도 같은 표를 눈으로 읽어 "변경 없음" 행에 실린 이름들이 통째로 빠졌다. 이름을 붙이면 **비교의 단위가 식별자가 아니라 표의 행이었다.** 한 행을 "봤다"고 판단하는 순간 그 행이 담은 이름 전부가 처리된 것으로 취급됐다. Dropdown Menu([#127](https://github.com/flameware/massive-design/issues/127))는 예외가 아니라 그 규칙의 눈에 띈 한 사례였을 뿐이고, 나머지 일곱은 [#162](https://github.com/flameware/massive-design/issues/162)까지 살아남았다.

그리고 이건 한 번의 실수가 아니다. 맵 [#165](https://github.com/flameware/massive-design/issues/165)가 남긴 네 자리가 같은 계열이다.

- [#166](https://github.com/flameware/massive-design/issues/166) — 지시받은 "[#155](https://github.com/flameware/massive-design/issues/155) 모집단 9 → 8"을 그대로 적지 않고 표와 대조해 `popover`가 그 표에 있던 적이 없음을 찾았다.
- [#174](https://github.com/flameware/massive-design/issues/174) — 산문이 *"Card 선례와 정면으로 부딪친다"* 고 적은 것이 전수 확인에서 거짓이었다(그 근거는 축이 **없는** 자리에만 쓰였다).
- [#172](https://github.com/flameware/massive-design/issues/172) — 티켓 자신의 전제가 사실에서 무너졌다.
- **맵 [#165](https://github.com/flameware/massive-design/issues/165) 자신** — 규칙 1로 *"모집단은 사람이 만들지 않는다"* 를 세우고도 [#155](https://github.com/flameware/massive-design/issues/155)의 모집단만은 눈으로 읽어 잠식을 3으로 계산했다(실제 0). **규칙이 자기 자신에게 적용되지 않은 자리이고, 이 문서가 존재하는 가장 강한 근거다.**

그래서 **모집단은 두 기계 판독 목록의 집합 차집합으로 만든다.** 차집합의 완결성이 누구의 독해에도 의존하지 않는다는 것이 요점이다.

**산문 문서는 뜻에만 쓴다. 모집단에 쓰지 않는다.** 공식 문서 페이지·기준선 조사 문서·이슈 본문은 "이 축이 무엇을 뜻하는가", "기본값이 무엇인가"를 정하는 데 읽는다. **"무엇이 있는가"의 정본은 소스다.** 기준선 문서가 스스로 적어 둔 한계 — *"미기록은 '페이지에 없다'가 아니라 '추출된 텍스트에서 확인되지 않았다'"* — 는 뜻을 읽을 때는 감수할 수 있지만 모집단에서는 그대로 구멍이 된다.

**판정은 차집합 뒤에 온다.** #121은 순서가 반대였다 — 판정 축을 먼저 세우고 그 축으로 표를 읽어 목록을 만들었기 때문에, 목록이 완결됐는지를 아무도 물을 수 없었다. ⓐ·ⓑ는 §3에서, 목록이 다 나온 뒤에 한 건씩 건다.

## 1. 준비

- `bun install`이 끝나 있어야 한다(§2.3·§2.4가 계약 모듈을 실제로 import한다).
- `packages/ui/dist/manifest/*.gen.json`이 현재 계약과 일치해야 한다. 재측정은 **읽기 전용**이므로 여기서 매니페스트를 다시 생성하지 않는다 — 어긋나면 그건 재측정이 아니라 미커밋 변경이고, 먼저 `git status`로 확인한다.
- `gh`가 인증돼 있어야 한다(upstream 소스는 GitHub API로 읽는다).
- 작업 디렉터리를 하나 잡는다. 리포 안에 만들지 않는다.

```sh
WORK=$(mktemp -d)
```

**§2·§3의 명령은 전부 리포 루트에서, `$WORK`와 `$UPSTREAM_SHA`를 들고 있는 한 셸에서 이어서 돌린다.** 셸을 새로 열었으면 §1과 §2.0을 다시 돌린다 — `$UPSTREAM_SHA`를 다시 잡으면 그때의 head가 잡히므로, 같은 재조회를 이어 가는 중이면 새로 잡지 말고 **처음 고정한 값을 그대로 쓴다.**

아래 명령은 전부 2026-09-02에 이 리포에서 실제로 실행해 출력을 확인한 것이다([#176](https://github.com/flameware/massive-design/issues/176)). 주석의 개수는 그날의 값이다.

## 2. 두 목록을 기계로 만든다

### 2.0 기준선 SHA를 고정한다

**먼저 고정하고, 그 SHA로만 읽는다.** 브랜치 이름(`main`)으로 읽으면 재조회 도중에 upstream이 움직여도 알 수 없고, 다음 재조회가 diff를 낼 기준점도 남지 않는다.

```sh
# 오늘의 head를 잡는다
UPSTREAM_SHA=$(gh api repos/shadcn-ui/ui/commits/main --jq '.sha[0:12]')

# 직전 기준선과 같은지 먼저 본다 — 같으면 upstream은 움직이지 않았고, 이번 공백은 전부 우리 쪽 기록의 공백이다
gh api "repos/shadcn-ui/ui/commits?path=apps/v4/registry/bases/base/ui&sha=$UPSTREAM_SHA&per_page=5" \
  --jq '.[] | "\(.sha[0:12])\t\(.commit.committer.date)\t\(.commit.message | split("\n")[0])"'
```

**직전 기준선: `63c1308d112b`** (`shadcn-ui/ui` head, 2026-08-31T09:54Z). `apps/v4/registry/bases/base/ui`의 마지막 변경은 `503a3a57aec9`(2026-08-31T09:43Z, *MessageScroller* — 우리 카탈로그 밖). 이 값들은 정본 조사 문서 §9에 있고, **이 절차를 돌린 티켓이 새 값을 자기 산출물에 적는다**(§4).

**head와 레지스트리 디렉터리의 마지막 변경을 따로 잰다.** 이 문서를 쓰며 절차를 돌려 본 2026-09-02에 head는 `b2a1ec864a87`로 움직였지만 `apps/v4/registry/bases/base/ui`의 마지막 변경은 여전히 `503a3a57aec9`였다 — **head가 움직였다는 것은 대조 대상이 움직였다는 뜻이 아니다.** 둘을 하나로 적으면 다음 재조회가 움직이지 않은 것을 다시 전부 읽는다. 그래도 §2.1은 **head SHA로 고정해서 읽는다** — 읽는 시점을 못 박는 것이 목적이고, 디렉터리 SHA는 "다시 읽을 필요가 있는가"를 답한다.

### 2.1 upstream 레지스트리 소스를 내려받는다

정본은 **문서가 아니라 레지스트리 소스**다(`apps/v4/registry/bases/base/ui/*.tsx`, Base UI 갈래 — 발행 문서의 `/docs/components/base/*`와 같은 갈래).

```sh
mkdir -p "$WORK/upstream"
gh api "repos/shadcn-ui/ui/contents/apps/v4/registry/bases/base/ui?ref=$UPSTREAM_SHA" --jq '.[].name' \
  | grep '\.tsx$' > "$WORK/upstream-files.txt"
xargs -P 8 -I{} curl -sSfL -o "$WORK/upstream/{}" \
  "https://raw.githubusercontent.com/shadcn-ui/ui/$UPSTREAM_SHA/apps/v4/registry/bases/base/ui/{}" \
  < "$WORK/upstream-files.txt"
wc -l < "$WORK/upstream-files.txt"   # 2026-09-02 기준 62
```

### 2.2 upstream의 식별자와 축을 뽑는다

셋을 뽑는다.

- **`EXPORT`** — `export { … }` 블록의 **대문자로 시작하는 식별자**. `cva` 헬퍼는 소문자라 저절로 빠진다(ADR-0006이 게이트에 세운 것과 같은 규칙).
- **`AXIS`** — `cva`의 `variants` 키·값.
- **`PROP`** — **문자열 리터럴 유니온 prop.** `cva`만 뽑으면 축의 절반을 놓친다: upstream은 축을 `cva`로 내기도 하고 `size?: "default" | "sm"` 같은 prop과 `data-size`로 내기도 한다. `Card`·`AlertDialog`의 `size`, `FieldLegend`의 `variant`, `Select`·`Switch`의 `size`, `Sidebar`의 `collapsible`이 전부 **`cva`에 없다.** [#121](https://github.com/flameware/massive-design/issues/121)이 표의 행을 단위로 삼아 구멍을 냈듯, `cva`만 단위로 삼으면 같은 모양의 구멍이 다시 난다.

```sh
cat > "$WORK/extract-upstream.mjs" <<'MJS'
import { readdirSync, readFileSync } from "node:fs"

const dir = process.argv[2]
const block = (text, open) => {                     // open = 여는 "{"의 인덱스
  let depth = 0
  for (let i = open; i < text.length; i++) {
    if (text[i] === "{") depth++
    else if (text[i] === "}" && --depth === 0) return text.slice(open + 1, i)
  }
  return ""
}

for (const file of readdirSync(dir).filter((f) => f.endsWith(".tsx")).sort()) {
  const slug = file.replace(/\.tsx$/, "")
  const text = readFileSync(`${dir}/${file}`, "utf8")

  for (const m of text.matchAll(/export\s*\{([^}]*)\}/g))
    for (const raw of m[1].split(",")) {
      const name = raw.trim().split(/\s+as\s+/).pop()?.trim()
      if (name && /^[A-Z]/.test(name)) console.log(`${slug}\tEXPORT\t${name}`)
    }

  for (const m of text.matchAll(/const\s+(\w+)\s*=\s*cva\(/g)) {
    const body = block(text, text.indexOf("{", m.index + m[0].length - 1))
    const at = body.search(/\bvariants\s*:\s*\{/)
    if (at < 0) continue
    let rest = block(body, body.indexOf("{", at))
    while (true) {
      const key = rest.match(/(["']?)(\w[\w-]*)\1\s*:\s*\{/)
      if (!key) break
      const open = rest.indexOf("{", key.index)
      const inner = block(rest, open)
      const values = [...inner.matchAll(/(?:^|\n)\s*(?:"([^"]+)"|'([^']+)'|([\w-]+))\s*:/g)]
        .map((v) => v[1] ?? v[2] ?? v[3])
      console.log(`${slug}\tAXIS\t${m[1]}.${key[2]}\t${values.join(",")}`)
      rest = rest.slice(open + inner.length + 2)
    }
  }

  for (const m of text.matchAll(/(\w+)\??\s*:\s*("[\w-]+"(?:\s*\|\s*"[\w-]+")+)/g)) {
    const values = [...m[2].matchAll(/"([\w-]+)"/g)].map((v) => v[1])
    console.log(`${slug}\tPROP\t${m[1]}\t${values.join(",")}`)
  }
}
MJS
node "$WORK/extract-upstream.mjs" "$WORK/upstream" > "$WORK/upstream.tsv"
awk -F'\t' '$2=="EXPORT"{print $1"\t"$3}' "$WORK/upstream.tsv" | sort > "$WORK/upstream-exports.tsv"
awk -F'\t' '$2!="EXPORT"{print $1"\t"$2"\t"$3"\t"$4}' "$WORK/upstream.tsv" | sort > "$WORK/upstream-axes.tsv"
```

**`AXIS` 줄은 `<cva 변수>.<축>` 꼴로 나온다** — `item`처럼 한 파일에 `itemVariants`와 `itemMediaVariants`가 함께 있고 둘 다 `variant`를 갖는 경우가 있어서, 축 이름만으로는 루트와 파트가 겹친다.

**`PROP` 줄에는 축이 아닌 것이 섞인다** — `type?: "button" | "submit" | "reset"` 같은 HTML 속성이 그대로 걸린다. 걸러내지 않는다. **모집단은 넓게 만들고 좁히는 일은 §3.3·§3.4의 사람이 한다** — 추출 단계에서 거르면 그 필터가 곧 #121의 diff 열이 된다.

### 2.3 우리 쪽 `publicExports`를 뽑는다

**소스 파일을 `grep`하지 않는다.** 계약을 실제로 로드해서 뽑는다 — 게이트가 보는 것과 같은 값이어야 하고, 로드는 `publicExports`가 source에 실재하는지까지 검사한다.

```sh
(cd packages/ui && bun -e '
import { loadComponentContracts } from "./scripts/component-contracts.mjs"
const contracts = await loadComponentContracts(process.cwd())
for (const c of contracts)
  for (const name of c.publicExports)
    if (/^[A-Z]/.test(name)) console.log(`${c.name}\t${name}`)
') | sort > "$WORK/ours-exports.tsv"
cut -f1 "$WORK/ours-exports.tsv" | sort -u > "$WORK/ours-slugs.txt"
wc -l < "$WORK/ours-exports.tsv"   # 2026-09-02 기준 269 (51개 계약)
```

### 2.4 우리 쪽 `axes`·`parts.*.axes`를 뽑는다

축의 정본은 **생성된 매니페스트**다. 계약의 `config`가 아니라 매니페스트를 읽는 이유는 파생 채널이 보는 것이 그것이고, 파트 축 상속([ADR-0011](../adr/0011-axis-readback-and-part-axis-inheritance.md))이 여기서 해소돼 있기 때문이다.

```sh
(cd packages/ui && bun -e '
import { readdirSync, readFileSync } from "node:fs"
for (const file of readdirSync("dist/manifest").filter((f) => f.endsWith(".gen.json")).sort()) {
  const m = JSON.parse(readFileSync(`dist/manifest/${file}`, "utf8"))
  for (const [axis, values] of Object.entries(m.axes ?? {}))
    console.log(`${m.component}\t.\t${axis}\t${values.join(",")}`)
  for (const [part, def] of Object.entries(m.parts ?? {}))
    for (const [axis, values] of Object.entries(def.axes ?? {}))
      console.log(`${m.component}\t${part}\t${axis}\t${values.join(",")}`)
}') | sort > "$WORK/ours-axes.tsv"
wc -l < "$WORK/ours-axes.tsv"   # 2026-09-02 기준 64
```

> 위 두 명령을 파이프로 `head`에 넘기지 않는다 — `bun -e`가 SIGPIPE로 죽어 목록이 **조용히 잘린다**. 잘린 모집단은 이 절차가 막으려는 바로 그 실패다. 항상 파일로 받고 그 파일을 본다.

## 3. 차집합을 내고, 그 다음에 판정한다

### 3.1 식별자 차집합

```sh
comm -23 "$WORK/upstream-exports.tsv" "$WORK/ours-exports.tsv" \
  | awk -F'\t' 'NR==FNR{s[$1];next} ($1 in s)' "$WORK/ours-slugs.txt" - > "$WORK/diff-exports.tsv"
wc -l < "$WORK/diff-exports.tsv"   # 2026-09-03 기준 37 — 이 37이 **모집단**이지 공백이 아니다
```

이 필터가 하는 일은 **층위를 가르는 것**이다. 우리에게 대응 컴포넌트가 아예 없는 slug(upstream 64개 중 우리에게 없는 것들)는 **컴포넌트 층위 공백**이고 [#118](https://github.com/flameware/massive-design/issues/118)이 끝낸 영역이다. 이 절차는 **표면 층위**만 잰다. `list-row`는 반대 방향 — upstream에 대응 항목이 없는 우리 자체 컴포넌트라 대조 대상이 아니다.

> **`grep -Ff`를 쓰지 않는다 — slug는 부분 문자열로 맞히면 안 된다.** 이 자리는 원래 `grep -Ff "$WORK/ours-slugs.txt"`였고, [#177](https://github.com/flameware/massive-design/issues/177)이 절차를 돌리며 실측으로 고쳤다. `grep -F`는 **줄 어디에서든** 부분 문자열을 맞히므로 upstream의 `hover-card`가 우리 slug `card`에 걸려 모집단에 들어왔다 — Hover Card는 [#118](https://github.com/flameware/massive-design/issues/118)이 Popover의 트리거 모드로 흡수해 **우리에게 계약이 없는** 컴포넌트라, 이 절차가 재지 않기로 한 컴포넌트 층위가 표면 층위 모집단에 섞인 것이다(2026-09-02에 40으로 보고된 수 중 셋이 이것이었다). 층위를 가르는 필터가 층위를 섞으면 필터가 아니다. **slug는 첫 열과 정확히 같을 때만 맞힌다.**

### 3.2 축·값 차집합

**축은 자동 차집합이 성립하지 않는다.** 이름이 갈리는 것이 정상이기 때문이다 — [ADR-0008](../adr/0008-axis-and-value-name-spaces.md)이 왜 갈리는지를 정했고(`align` → `placement`, `variant` → `frame`·`indicator`·`rank`), 이름으로 빼면 그 넷이 전부 가짜 공백으로 나온다. 그래서 **한 컴포넌트의 양쪽 축을 한 화면에 붙여 놓고 사람이 읽는다.**

```sh
awk -F'\t' '{print $1"\tUP  \t"$2"\t"$3"\t"$4}' "$WORK/upstream-axes.tsv"  > "$WORK/axes-both.tsv"
awk -F'\t' '{print $1"\tOURS\t\t"$2"."$3"\t"$4}' "$WORK/ours-axes.tsv"    >> "$WORK/axes-both.tsv"
awk -F'\t' 'NR==FNR{s[$1];next} ($1 in s)' "$WORK/ours-slugs.txt" "$WORK/axes-both.tsv" | sort
```

§3.1과 **같은 이유로 여기도 첫 열 정확 일치**다. `grep -Ff`였을 때는 값 열까지 맞혀서 upstream 전용 컴포넌트 `marker`의 `markerVariants.variant default,separator,border` 줄이 우리 slug `separator`에 걸려 들어왔다 — slug 열이 아니라 **값**에 걸린 것이라 §3.1의 `hover-card`보다 한 걸음 더 나쁘다([#177](https://github.com/flameware/massive-design/issues/177) 실측).

읽는 기준은 셋이다. ① upstream에 있고 우리에게 **축 자체가 없다** ② 축은 있는데 **값이 모자란다** — `item UP itemVariants.size default,sm,xs` 옆에 `item OURS ..size default,sm`이 서는 자리가 [#174](https://github.com/flameware/massive-design/issues/174)가 판정한 그 꼴이다 ③ **이름만 다르다** — 공백이 아니고, §3.3이 `limits`로 확인한다.

### 3.3 `limits`와 조인한다 — "이미 판정했는가"의 정본은 계약이다

차집합의 각 항목이 어느 `limits` 문장에 걸리는지 **한 건씩** 확인한다. 걸리면 그건 **기록된 결정**이지 공백이 아니다(ADR-0006이 `limits`를 공백 대장으로 만든 이유가 이것이다). 걸리지 않으면 **종류 ②** — 고려된 적 없는 표면이다.

```sh
(cd packages/ui && bun -e '
import { loadComponentContracts } from "./scripts/component-contracts.mjs"
const needle = process.argv[1]
for (const c of await loadComponentContracts(process.cwd())) {
  const limits = c.reference?.guidance?.limits ?? ""
  if (limits.includes(needle)) console.log(`${c.name}\n  ${limits}\n`)
}' FieldTitle)
```

**이름이 문장에 없다고 곧바로 종류 ②로 넘기지 않는다.** `limits`는 산문이라 표면을 이름 없이 가리키기도 한다(*"전역 toast 큐와 명령형 호출 API는 소비처가 소유한다"*). 그래서 이 단계는 **기계가 만든 목록을 사람이 한 건씩 읽는 자리**이고, 그것이 이 절차가 사람에게 남기는 유일한 독해다. 모집단을 만드는 데 쓰지 않고 **이미 만들어진 목록을 분류하는 데만** 쓴다.

### 3.4 그 다음에 ADR의 판정을 건다

목록이 완결된 뒤에, 종류 ②로 남은 것에만 건다.

1. **[ADR-0018](../adr/0018-anatomy-is-the-consumer-assembly.md)로 먼저 잰다** — 소비처가 JSX에 직접 쓰는 노드인가. 아니면 `anatomy`가 아니고, 관문을 걸 대상도 아니다(`*Portal` 일곱이 여기서 걸러진다).
2. **관문 ⓐ** — 파생 채널이 구분하는가(anatomy가 늘거나 `cva` 축이 생기는가).
3. **관문 ⓑ** — 소비처가 스스로 하면 계약이 새는가(`className`으로 우리 스타일 결정을 복제해야 하는가).
4. **판정 결과는 열지 않기로 한 것까지 `limits`에 문장으로 남긴다.** 기록이 없으면 다음 재조회가 같은 자리를 다시 발견한다 — 그것이 ADR-0006의 원칙이고, 이 절차가 그 원칙을 매번 확인해 주는 장치다.

## 4. 새 기준선을 적는다

재측정을 돌린 티켓·조사 문서가 **자기 산출물에** 다음 값을 적는다. 다음 재조회가 `git log` 한 번으로 diff를 낼 수 있게 하는 것이 목적이다.

- 측정일
- **upstream 레지스트리 커밋 SHA** — head와, `apps/v4/registry/bases/base/ui`의 마지막 변경 SHA 둘 다
- upstream 카탈로그 개수 / 우리 계약 개수 / 비교 대상 개수
- 표면 층위 공백: 종류 ② 건수(컴포넌트 수·표면 수)
- 기록되지 않은 어긋남 / 판정 보류

## 5. 한계 — 지킬 수 없는 것을 지킨다고 적지 않는다

**① 이건 게이트가 아니다.** [ADR-0006](../adr/0006-uncontracted-surfaces.md)이 적은 대로 게이트는 *"upstream에 있는데 우리에게 없다"* 를 판정할 수 없다 — 남의 리포를 읽어야 알기 때문이다. 위 절차도 네트워크와 남의 리포를 요구하므로 CI가 지킬 수 있는 규칙이 아니고, CI에 넣으면 upstream이 움직일 때마다 우리 리포가 우리 변경 없이 빨개진다. 바뀌는 것은 **재조회가 사람의 주의력에 기대지 않게 된다**는 것뿐이다. 재조회 자체는 여전히 사람이 계기를 만든다.

**② upstream 문서가 여덟 style CSS 갈래 중 무엇을 렌더하는지 확정되지 않았다.** `apps/v4/registry/styles/`에 `style-luma`·`lyra`·`maia`·`mira`·`nova`·`rhea`·`sera`·`vega` 여덟이 있고, 컴포넌트 TSX는 `cn-table-footer` 같은 **클래스 이름만** 들고 실제 선언은 각 스타일 CSS에 있다([#162](https://github.com/flameware/massive-design/issues/162) §7.2). **소스를 모집단의 정본으로 삼는 이유가 여기에도 있다** — 이름과 축은 갈래와 무관하게 TSX에 있고, 갈래가 정해지지 않아도 "무엇이 있는가"는 흔들리지 않는다. 흔들리는 것은 **값**이므로, 값을 인용해야 하는 티켓은 자기 스타일 갈래를 먼저 정하고 그것을 적는다(지금까지 인용한 것은 전부 `style-lyra.css`다). 관문 ⓑ가 묻는 것은 *"결정이 존재하는가"* 이지 *"값이 몇인가"* 가 아니므로 판정은 갈리지 않는다.

**③ 추출은 종류 ②의 하한이지 상한이 아니다.** §2.2는 `cva`와 문자열 리터럴 유니온 prop 둘을 본다. 그 둘 밖에서 갈리는 축 — `boolean` prop, `cn()` 인라인 삼항, 스타일 CSS에만 있고 TSX에 이름이 없는 선언 — 은 잡히지 않는다. **잡히지 않은 것을 없다고 적지 않는다.** 이 절차가 보장하는 것은 *"두 기계 판독 목록의 차집합이 완결이다"* 이지 *"upstream의 모든 결정을 봤다"* 가 아니다. 실제로 `cva`만 보던 첫 판이 `Card`·`AlertDialog`의 `size`와 `FieldLegend`의 `variant`를 통째로 놓쳤고, 그것이 `PROP` 추출이 붙은 이유다 — **추출의 단위를 넓힌 것이 이 절차의 유일한 개선 경로다.**
