# 용어

massive-design의 어휘. 다른 말로 부르지 말 것.

## 토큰 계층

- **primitive** — 값을 직접 갖는 토큰. 컬러 램프 12단계와 비색상 스케일. 소비처에 노출되지 않는다(Tailwind `@theme`에 등록하지 않는다).
- **semantic** — primitive를 참조하는, 용도로 이름 붙인 토큰. 현재 목록과 총계의 정본은 `packages/tokens/tokens/semantic/color.json`이며 `tokens:lint`가 상한을 감시한다. 라이트/다크 모드 전환은 **오직 이 계층에서만** 일어난다.
- **component** — semantic만 참조하는 계층. **규칙만 존재하고 토큰은 0개다.**
- **alias** — shadcn이 정한 이름을 우리 semantic에 이어 붙인 호환 레이어. 우리가 발명한 어휘가 아니므로 어휘 상한 계산에 넣지 않는다. 상한 밖인 근거는 정확히는 "**소비처가 이미 아는 이름, 그리고 그와 같은 모양으로 파생된 이름**"이다 — `success`·`link`처럼 정본에 없는 항목도 여기 산다. 컴포넌트 색은 원칙적으로 alias를 통해 소비한다. 단, `state.layer`는 완성된 색 유틸리티가 아니라 상태 합성 전용 입력이므로 `packages/ui/src/state.css`가 `--ds-state-layer`를 직접 읽는 **명시적 예외**다.

## 램프

- **램프(ramp)** — 한 패밀리의 12단계 색 배열. 패밀리·모드마다 한 벌(`brand/light`, `brand/dark`, …).
- **키 컬러(key color)** — 램프를 생성하는 입력 색. **step 9에 앉는다** — light/dark가 동일한 유일한 단계이기 때문.
- **패밀리(family)** — brand / neutral / danger / success. warning·info는 아직 없다.
- **cusp** — 주어진 hue에서 sRGB 안에 담기는 chroma가 최대가 되는 밝기. 램프의 채도 상한을 정한다.
- **override** — 생성된 램프를 손으로 덮는 것. ①패밀리 파라미터(구현됨) / ②단계별 L·C·H(자리만 있고 미검증).

## 상태 표현

- **Figma 컴포넌트 자산** — 정적 화면 조립에 쓰이는 공개 재사용 자산. 여러 variant를 가진 component set뿐 아니라 variant가 하나인 단일 component도 포함하며, 상태 견본·데모 프레임과 구분한다.
- **구성 상태(configuration state)** — 정적 화면을 조립할 때 선택해야 하는 의미 상태. `checked / unchecked / indeterminate`, 행의 `selected`, Select·메뉴의 `open / closed`가 여기에 속한다. 코드에서는 네이티브·Radix 상태이고 Figma에서는 component property 또는 별도의 공개 조립 표면으로 표현한다. hover·pressed·focus·disabled 같은 상호작용 상태와 구분하며, 새 토큰 계층을 만들지 않는다.
- **state layer** — 상태별 완성 색 토큰을 두는 대신, 기본 색 위에 반투명 층을 `color-mix`로 얹어 hover·pressed·disabled를 만드는 방식. `state.layer`는 semantic 계층에 있는 **상태 합성 전용 입력**이며 alias 소비 규칙의 유일한 예외다. Figma에는 `color-mix`가 없어 코드와 같은 oklab 합성 결과를 빌드가 미리 계산한 hex로 상태 견본에 넣는다. 이 hex는 파생값이지 새 토큰이 아니다.
- **상태 견본(state sample)** — 상태를 Figma에 보여주는 단위. **컴포넌트 세트의 축이 아니다** — 축으로 두면 조합 수에 곱해지고, 정적 시안을 조립하는 데는 쓰이지 않는다. 컴포넌트마다 한 장씩 매니페스트에서 생성되는 프레임이다.

## 출력과 주입

- **주입(injection)** — 빌드가 낸 JS를 MCP `use_figma`로 실행해 Figma에 Variables·Style·Component를 만드는 것. 파일을 밀어 넣는 push가 아니라 **에이전트가 수행하는 절차**다.
- **매니페스트(manifest)** — `@massive/ui`가 내는, 컴포넌트 구조를 기계가 읽을 형태로 담은 생성물. 출처는 `cva` 정의이지 스토리 파일이 아니다. 담는 단위는 축이 아니라 **조합**이며(그 밖에 모든 조합의 기저인 `base` 블록이 하나 있다), 어휘는 **코드 쪽**(`border-radius`·`--radius-md`)이다 — Figma 어휘로의 번역은 매니페스트 밖에 있다(아래 **번역표**).
- **base 계층(base layer)** — `dist/tokens.css`가 내는 `@layer base`의 두 규칙(`*`·`body`). 변수가 아니라 **규칙**이라 "shadcn 34개를 전부 낸다"는 점검이 못 잡았고, 그게 [#36](https://github.com/flameware/massive-design/issues/36)의 결함이었다. 매니페스트에서는 **셀 밖의 `base` 블록**으로 나온다 — 클래스가 아니라 규칙에서 오므로 조합 안에 없고, 조립할 때 모든 조합에 **앞서** 적용된다.
- **조합(combination)** — `variant × size`의 한 칸. 매니페스트의 기본 단위이자 Figma variant의 단위. 축별 값은 `tailwind-merge`가 정리하기 전의 값이라 최종 값과 다를 수 있으므로 어휘에 넣지 않는다.
- **3단(token / literal / unresolved)** — 매니페스트가 값을 적는 세 등급. `token`은 `--ds-*` 또는 Figma에 실재하는 스케일 변수까지 내려간 것, `literal`은 대응 변수가 없어 계산값으로 남은 것(실패가 아니다), `unresolved`는 아직 못 다룬 것. Figma에 대응물이 없는 축은 무시 화이트리스트로 걸러 `unresolved`에 섞이지 않게 한다.
- **번역표(translation table)** — 매니페스트의 코드 어휘를 Figma 어휘로 옮기는 표. **둘이고 사는 곳이 다르다.** ①CSS 속성 → (노드 역할, Figma 속성)은 손으로 적는 규약이라 절차 문서([`figma-components.md`](docs/agents/figma-components.md) §7)가 갖는다 — 오른쪽이 속성이 아니라 **쌍**이다(셀 하나가 Figma에선 노드 여럿). ②CSS 변수 → Figma 변수 경로는 **생성물**이다(`@massive/tokens`의 `dist/figma/var-map.gen.json`) — 빌드가 이미 양쪽 이름을 알고, 문자열 규칙으로 복원되지 않으며(`--ds-fg-on-solid` → `fg/on-solid`), **값을 복사하면 틀리기** 때문이다(`--text-sm--line-height`는 비율 `1.6`, `type/line-height/sm`은 px `22.4`). ②의 칸은 변수만이 아니다 — 그림자는 Figma에서 **Effect Style**이라 컬렉션이 없고, 그래서 칸마다 `kind`가 붙는다.
- **생성물(generated artifact)** — 원본에서 파생돼 **커밋되는** 파일. `.gen.json` 접미사나 `dist/` 위치로 표시한다. 손편집 금지이고 `verify`가 감시한다.

## 세대와 검증

- **디자인 의도(design intent)** — 컴포넌트가 사용자에게 보여야 하고 동작해야 하는 프로젝트 소유자가 승인한 목표. 자동 정합성 검증 뒤의 시각 판단으로 확정하며, 현재 코드 렌더링과 다르면 구현 정본을 고치는 판정 기준이다.
- **구현 정본(implementation source of truth)** — 디자인 의도를 구현하고 Storybook과 Figma 파생 채널로 변경을 전파하는 단일 출발점인 코드. 현재 렌더링을 무조건 올바른 디자인 의도로 간주한다는 뜻은 아니다.
- **세대(generation)** — 한 컴포넌트의 Figma 대응 구조 해시와 그 구조가 참조하는 토큰 산출물 해시의 쌍. 디자인 시스템 전체 세대는 검증 대상 컴포넌트 세대의 집계다.
- **같은 세대(same generation)** — 코드, Storybook, Figma 문서, 발행된 Figma 라이브러리가 대상 컴포넌트별로 같은 세대를 가리키는 상태. 어느 한 채널만 앞선 정상적인 중간 상태와 구분한다.
- **누적 검증 상태(cumulative verification state)** — `CODE_VERIFIED` → `STORYBOOK_VERIFIED` → `FIGMA_DOCUMENT_SYNCED` → `FIGMA_LIBRARY_CURRENT` 순서로 증거가 쌓이는 상태. 마지막 상태까지 충족해야 같은 세대 검증 완료다.
- **검증 결과(verification result)** — 각 누적 검증 상태의 증거를 `PASS`·`FAIL`·`PENDING_HUMAN`·`UNKNOWN` 중 하나로 표현한 값. 사람 작업 대기, 확인된 위반, 없거나 낡은 증거를 서로 구분한다.

## 경계

- **소비처(consumer)** — 이 디자인 시스템을 가져다 쓰는 앱. 현재는 invest diary 하나이고 **리포 밖**이다. `packages/ui`는 소비처가 아니라 시스템의 일부다.

## 호환성

- **호환성 계약(compatibility contract)** — 코드 소비처의 기존 호출, 매니페스트 계약, 발행된 Figma 라이브러리의 기존 원격 인스턴스·override·property 값을 함께 보호하는 채널 횡단 계약. 한 채널이라도 깨지면 가장 엄격한 변경 분류를 적용한다.
- **공개 기준선(public baseline)** — 마지막 `FIGMA_LIBRARY_CURRENT` 세대. 외부 호환성은 이 세대를 기준으로 판정하며, 아직 발행되지 않은 문서 변경은 외부 호환성 대상이 아니다.
- **additive 변경** — 공개 기준선의 기본값·조합·호출·Figma 인스턴스를 재해석하지 않고 선택적 표면을 추가하는 변경. 새 컴포넌트·토큰, 선택적 prop, 기본값이 정해진 새 variant 축·값이 여기에 속한다.
- **in-place safe 변경** — 공개 이름과 의미를 유지하면서 기존 인스턴스의 연결·property·override·토큰 바인딩·접근성·상호작용 계약이 실증적으로 보존되는 제자리 변경. 구조 해시나 토큰 값의 변화만으로 breaking이 되지는 않는다.
- **breaking 변경** — 호환성 계약의 어느 한 채널이라도 깨거나 보존 여부를 입증하지 못한 변경. 공개 이름의 변경·제거와 semantic 역할·모드 의미·값 타입 변경이 여기에 속한다.
- **폐기(deprecation)** — 공개 항목의 제거를 예고하면서 이전 이름과 대체 항목을 함께 제공하는 additive 호환 세대. 기본 경로이지만, 모든 소비처를 식별하고 원자적 전환·검증·rollback이 가능한 별도 migration effort에서는 이 세대를 생략할 수 있다.
