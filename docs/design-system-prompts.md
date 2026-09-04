> **역사 문서.** 2026-08 착수 전에 쓴 단계별 프롬프트다. 아래 "확정된 결정사항"의 기술 선택(DTCG JSON·Style Dictionary·CSS Modules·Base UI·자체 Figma 플러그인)은 대부분 착수 뒤 뒤집혔다 — 현재 결정은 `CONTEXT.md`와 `docs/adr/`이 정본이고, 이 파일은 왜 그렇게 출발했는지를 보려는 때에만 읽는다.

# 디자인 시스템 구축 — Claude Code 프롬프트 세트

개인 프로젝트용 디자인 시스템을 토큰부터 컴포넌트, Storybook까지 구축하기 위한
단계별 Claude Code 지시 프롬프트 모음.

## 사용법

1. `Phase 0`의 내용은 **프롬프트가 아니라 파일**이다. 저장소 루트에 `CLAUDE.md`로 저장한다.
2. Phase 1부터는 각 세션에서 **해당 Phase 블록 하나만** 복사해 붙여넣는다.
3. 각 Phase는 "완료 조건"에서 멈추도록 설계되어 있다. 사람이 리뷰한 뒤 다음 Phase로 넘어간다.
4. 한 세션에서 두 Phase를 진행하지 않는다. 컨텍스트가 길어질수록 규칙 준수율이 떨어진다.

## 확정된 결정사항

| 항목 | 결정 |
|---|---|
| 토큰 원본 | DTCG 형식 JSON (`tokens/`) — 단방향으로 Figma·코드에 파생 |
| 빌드 | Style Dictionary v4 |
| 스타일링 | CSS Variables + CSS Modules |
| 프레임워크 | React + TypeScript |
| 문서화 | Storybook (CSF3 + autodocs + addon-a11y) |
| Figma | 빈 파일에서 시작, 자체 플러그인으로 Variables 주입 |
| 복합 컴포넌트 | Base UI(headless) 위에 스타일을 얹음 |
| 1차 컴포넌트 범위 | Button, Input, Select, Checkbox, Radio, Modal, Toast, Tabs |

## 진행 단계

```
Phase 0   리포 셋업 + CLAUDE.md 규칙 확정
Phase 1   DTCG 토큰 정의 + Style Dictionary 빌드 파이프라인
Phase 2   Figma Variables 주입 플러그인
Phase 3a  Button, Input — 컴포넌트 패턴 확정
Phase 3b  나머지 컴포넌트 (3a 결과를 보고 작성)
Phase 4   Figma 컴포넌트 작성 + Code Connect 연결
Phase 5   시각 회귀 테스트 + 문서화 + 배포
```

---

# Phase 0 — `CLAUDE.md`

> 아래 내용을 저장소 루트에 `CLAUDE.md`로 저장한다. 프롬프트로 붙여넣는 것이 아니다.

```markdown
# 디자인 시스템 프로젝트 규칙

## 이 저장소는 무엇인가
개인 프로젝트용 디자인 시스템. 유지보수자는 1명.
토큰 → Figma → React 컴포넌트 → Storybook 순으로 파생된다.

## 절대 원칙
1. Source of truth는 `tokens/` 아래 DTCG JSON이다.
   Figma와 코드는 모두 여기서 파생된다. 역방향 동기화는 없다.
2. 하드코딩된 색·간격·폰트 값은 컴포넌트에 등장할 수 없다.
   반드시 CSS 변수를 경유한다.
3. 범위 밖의 파일은 건드리지 않는다. 리팩터링을 자발적으로 하지 않는다.

## 디렉토리
tokens/{primitive,semantic,component}/*.json   토큰 원본
build/style-dictionary.config.js               빌드 설정
dist/{css,ts,json}/                            빌드 산출물 (git 추적함)
figma-plugin/                                  토큰 → Figma Variables 주입 플러그인
src/components/<Name>/                         컴포넌트 1개당 1폴더
  <Name>.tsx  <Name>.module.css  <Name>.stories.tsx  <Name>.test.tsx  index.ts

## 네이밍
- 토큰 키: dot-case 소문자 (`color.bg.surface`)
- Figma Variable: 토큰 키의 `.`을 `/`로 치환 (`color/bg/surface`)
- CSS 변수: `--ds-` 접두사 + kebab-case (`--ds-color-bg-surface`)
- 컴포넌트: PascalCase / props: camelCase / CSS Module 클래스: camelCase

## 토큰 계층
primitive → semantic → component 방향 참조만 허용.
- component 토큰이 primitive를 직접 참조하면 lint 실패
- semantic 토큰 이름에 색상명(blue, red)이 들어가면 lint 실패
- light/dark 차이는 semantic 계층에서만 발생

## 컴포넌트 작성 규칙
- 함수 컴포넌트 + TypeScript. props 타입은 export한다.
- DOM을 렌더하는 컴포넌트는 ref를 전달한다.
- `className`과 나머지 props는 루트 엘리먼트로 전달한다(확장 가능성 확보).
- 스타일은 CSS Modules. 조건부 클래스는 clsx.
- 상태 계층은 default / hover / active / focus-visible / disabled 전부 정의한다.
- focus는 `:focus-visible`만 사용한다. outline을 제거하지 않는다.
- 인터랙티브 컴포넌트는 키보드만으로 조작 가능해야 한다.
- Modal, Select, Tabs 등 복합 위젯은 WAI-ARIA Authoring Practices를 따른다.

## Storybook
- CSF3 형식. 각 컴포넌트마다 Default / 모든 variant / 모든 상태 / a11y 케이스.
- autodocs 사용. props 설명은 TSDoc 주석에서 끌어온다.
- @storybook/addon-a11y 위반이 있으면 그 컴포넌트는 미완성으로 간주한다.

## 금지
- 토큰 값을 나의 승인 없이 새로 만들지 않는다.
- 컴포넌트 라이브러리를 임의로 도입하지 않는다.
  필요하다고 판단되면 먼저 제안하고 승인을 받는다.
- `!important`, 인라인 style, 매직넘버 금지.
- 테스트를 통과시키려고 테스트를 수정하지 않는다.

## 작업 방식
- 작업 전 계획을 제시하고 승인을 받는다. 승인 없이 파일을 생성하지 않는다.
- 한 번에 한 Phase만 진행한다. 다음 Phase로 스스로 넘어가지 않는다.
- 브랜치는 GitHub Flow. `feat/`, `fix/`, `chore/` 접두사.
- 커밋은 Conventional Commits.
- 불확실하면 추측하지 말고 질문한다.
```

---

# Phase 1 — 토큰 정의 + 빌드 파이프라인

```markdown
## 역할
너는 디자인 시스템 엔지니어다. 이 저장소의 토큰 레이어를 구축한다.

## 컨텍스트
- 개인 프로젝트용 디자인 시스템. 나 혼자 유지보수한다.
- 토큰의 source of truth는 `tokens/` 아래 DTCG 형식 JSON이다.
  Figma와 코드는 모두 여기서 파생된다. 반대 방향은 없다.
- 최종 소비처는 React + TypeScript + Storybook이다.

## 이번 단계 범위
Phase 1: 토큰 정의와 빌드 파이프라인까지만. 컴포넌트는 건드리지 않는다.

## 토큰 계층
3계층으로 분리하고, 계층 간 참조는 아래 방향으로만 허용한다.

1. primitive — 원시값. 의미 없음. `color.blue.500`, `space.4`, `size.font.16`
2. semantic — 역할. primitive만 참조. `color.bg.surface`, `color.text.muted`
3. component — 컴포넌트 전용. semantic만 참조. `button.primary.bg.default`

primitive를 컴포넌트에서 직접 쓰는 것은 금지한다.
semantic에 색 이름(blue, red)이 들어가는 것도 금지한다.

## 카테고리
color / space / size / typography(family, size, weight, lineHeight, letterSpacing)
/ radius / border / shadow / opacity / zIndex / duration / easing

## 테마
light / dark 두 모드. 모드 차이는 semantic 계층에서만 발생한다.
primitive는 모드와 무관하게 단일 값이다.

## 산출물
- `tokens/primitive/*.json`, `tokens/semantic/*.json`, `tokens/component/*.json`
- Style Dictionary v4 설정 (`build/style-dictionary.config.js`)
- 빌드 결과:
  - `dist/css/variables.css` — `:root`와 `[data-theme="dark"]`
  - `dist/ts/tokens.ts` — 토큰 이름 union 타입 + 값 객체
  - `dist/json/tokens.flat.json` — Figma 동기화용 평탄화 결과
- `npm run tokens:build` 스크립트

## 제약
- 토큰 값을 임의로 지어내기 전에, 스케일 체계를 먼저 제안하고 내 승인을 받는다.
  (색 램프 단계 수, space 스케일 배수, type scale 비율)
- 색은 OKLCH로 정의하고 CSS 출력 시에도 oklch()를 유지한다.
- semantic 토큰은 30개를 넘기지 않는다. 부족하면 나에게 물어라.
- 접근성: semantic의 text/bg 조합은 WCAG AA를 만족해야 하며,
  빌드 시 대비율을 검증하는 스크립트를 함께 만든다.

## 완료 조건
1. `npm run tokens:build`가 에러 없이 통과한다.
2. 대비율 검증 스크립트가 전부 통과한다.
3. 계층 위반(component→primitive 직접 참조)을 잡는 lint 스크립트가 있다.
4. 위 3개가 통과한 상태에서 멈추고, 토큰 트리 요약을 나에게 보고한다.

## 작업 방식
계획을 먼저 제시하고 내 승인을 받은 뒤 파일을 생성한다.
```

---

# Phase 2 — Figma Variables 주입 플러그인

> **배경**: Figma의 Variables REST API는 Enterprise 플랜 전용이라 개인 계정에서는 403이 떨어진다.
> Plugin API(`figma.variables.*`)에는 플랜 제한이 없으므로 이쪽 경로를 쓴다.

```markdown
## 이번 단계 범위
Phase 2: 토큰 JSON을 Figma Variables로 주입하는 플러그인을 만든다.
React 컴포넌트는 아직 건드리지 않는다.

## 배경 제약
Figma Variables REST API는 Enterprise 전용이라 사용할 수 없다.
Plugin API(figma.variables.*)를 쓴다. 이 경로는 플랜 제한이 없다.

## 만들 것
`figma-plugin/` 아래 Figma 플러그인 1개.
- manifest.json / code.ts / ui.html
- `dist/json/tokens.flat.json`을 UI에 붙여넣으면 파싱해서 Variables를 생성/갱신
- TypeScript + esbuild 번들. `npm run plugin:build`

## 생성 규칙
1. 컬렉션 3개: `Primitive`, `Semantic`, `Component`
2. 모드
   - Primitive: `Default` 단일 모드
   - Semantic: `Light`, `Dark` 두 모드
   - Component: `Default` 단일 모드
3. 변수명은 토큰 키의 `.`을 `/`로 치환한다. (color.bg.surface → color/bg/surface)
4. 토큰 참조는 Figma alias로 연결한다. 값을 복사해 넣지 않는다.
   - Semantic은 Primitive 변수를 alias
   - Component는 Semantic 변수를 alias
   - alias 대상이 아직 없으면 생성 순서를 Primitive→Semantic→Component로 강제한다
5. 타입 매핑
   - color → COLOR / space, size, radius, borderWidth → FLOAT
   - fontFamily, fontWeight → STRING
   - duration, easing, zIndex, opacity → FLOAT 또는 STRING

## Variables로 표현 불가능한 것
아래는 같은 플러그인에서 Style로 생성한다.
- shadow → Effect Style (`shadow/sm` 형태)
- typography 조합 → Text Style (`text/heading/lg` 형태),
  내부 fontSize·fontWeight는 가능한 한 Variable에 바인딩
- easing/duration은 Figma에 대응 개념이 없으므로 변수로만 남기고 스타일은 만들지 않는다

## 멱등성
같은 JSON으로 두 번 실행해도 중복이 생기지 않아야 한다.
- 이름이 같은 변수/컬렉션이 있으면 새로 만들지 않고 값만 갱신한다
- JSON에 없는데 Figma에만 있는 변수는 삭제하지 말고 목록으로 보고만 한다

## 실행 결과 리포트
플러그인 UI에 생성/갱신/스킵 개수와 실패 목록을 출력한다.

## 완료 조건
1. `npm run plugin:build` 성공
2. 빈 Figma 파일에서 실행 시 3개 컬렉션이 정상 생성되고 alias가 연결된다
3. 두 번 실행해도 결과가 동일하다
4. 여기서 멈추고, 내가 Figma에서 육안 확인할 때까지 대기한다

## 참고
Figma Plugin API 스펙이 불확실한 부분은 추측하지 말고
공식 문서를 확인하거나 나에게 질문한다.
```

---

# Phase 3a — Button, Input (패턴 확정)

> 8개를 한 번에 시키면 첫 컴포넌트의 어설픈 패턴이 나머지에 그대로 복제된다.
> 두 개만 만들어 패턴을 확정하고 리뷰한 뒤 3b로 넘어간다.

```markdown
## 이번 단계 범위
Phase 3a: Button, Input 두 개만 구현한다.
이 둘로 이 저장소의 컴포넌트 패턴을 확정하는 것이 목적이다.
나머지 컴포넌트는 절대 만들지 않는다.

## 전제
- 토큰과 CSS 변수는 Phase 1에서 완료되었다. `dist/css/variables.css`를 사용한다.
- 복합 컴포넌트는 Base UI 위에 스타일을 얹는다.
  Button, Input은 Base UI가 필요 없다면 순수 구현해도 된다. 판단해서 제안하라.

## 셋업 (아직 없다면)
- Vite + React + TypeScript
- Storybook 최신 안정 버전 + addon-a11y + autodocs
- Vitest + Testing Library
- 위 도구들의 현재 안정 버전과 권장 셋업 방식을 먼저 확인한 뒤 진행한다.
  기억에 의존해 설정 파일을 작성하지 않는다.

## 스타일링 패턴
- CSS Modules. 값은 전부 `var(--ds-*)` 경유.
- 상태 스타일은 data 속성 셀렉터로 건다. (`[data-disabled]`, `[data-pressed]` 등)
  Base UI가 노출하는 data 속성 규약을 그대로 따른다.
- variant/size는 data 속성으로 표현한다. 클래스 이름 조합을 늘리지 않는다.
  예: `<button data-variant="primary" data-size="md">`

## Button 요구사항
- variant: primary / secondary / ghost / danger
- size: sm / md / lg
- 상태: default / hover / active / focus-visible / disabled / loading
- loading 시 `aria-busy`, 클릭 차단, 레이아웃 시프트 없음
- 아이콘 전용 버튼 지원 시 `aria-label` 없으면 개발 환경에서 경고

## Input 요구사항
- size: sm / md / lg
- 상태: default / hover / focus-visible / disabled / readonly / invalid
- label, description, error message와의 연결을 `aria-describedby`,
  `aria-invalid`로 처리. id는 useId로 자동 생성하되 외부 주입도 허용
- prefix/suffix 슬롯

## component 토큰
이 두 컴포넌트에 필요한 component 계층 토큰이 부족하면,
`tokens/component/`에 추가할 항목을 목록으로 제안하고 내 승인을 받은 뒤 추가한다.
승인 없이 토큰을 추가하지 않는다.

## 산출물 (컴포넌트당)
Button.tsx / Button.module.css / Button.stories.tsx / Button.test.tsx / index.ts

## Storybook 스토리
- Default
- 모든 variant를 한 화면에 나열하는 Matrix 스토리
- 모든 상태를 한 화면에 나열하는 States 스토리
- 키보드 조작 시나리오 (play 함수 사용)

## 완료 조건
1. `npm run build`, `npm run test`, `npm run storybook` 전부 통과
2. addon-a11y 위반 0건
3. 컴포넌트 CSS에 하드코딩된 색·px 값이 0건
4. 여기서 멈추고, 아래를 보고한다.
   - 확정된 파일 구조와 그 이유
   - 다른 컴포넌트에도 적용할 공통 패턴 (props 규약, data 속성 규약, 스토리 구성)
   - Phase 3b에서 주의해야 할 지점

## 작업 방식
계획을 먼저 제시하고 승인을 받은 뒤 코드를 작성한다.
```

---

# Phase 3b 이후 — 작성 예정

## Phase 3b (나머지 컴포넌트)
3a의 리포트를 받은 뒤 작성한다. 뼈대는 다음과 같다.

- 3a에서 확정된 패턴을 프롬프트에 그대로 인용한다
- 대상: Checkbox, Radio, Select, Tabs, Modal, Toast
- Base UI의 현재 컴포넌트 목록을 먼저 확인시킨다.
  Toast가 없으면 직접 구현하되 설계안을 먼저 제시하도록 한다
  (포털 + `aria-live` 영역 + 타이머 큐)
- 2~3개씩 배치로 끊어 진행한다

## Phase 4 (Figma 컴포넌트 + Code Connect)
- Figma에 컴포넌트를 작성하고 Variables를 바인딩
- Code Connect로 Figma 컴포넌트 ↔ React 컴포넌트 연결
- Dev Mode에서 실제 코드가 노출되는지 확인

## Phase 5 (검증 + 배포)
- 시각 회귀 테스트 (Chromatic 또는 Playwright 스냅샷)
- Storybook 정적 빌드 배포
- 토큰 변경 시 자동 빌드되는 GitHub Actions 워크플로
