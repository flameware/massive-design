# @flameware/storybook

`@flameware/ui`의 문서이자 워크벤치, 그리고 **주 seam**이다. 컴포넌트를 여기 세우는 것이 곧 그것을 재는 것이다 (ADR-0023 §8·§12, [#279](https://github.com/flameware/massive-design/issues/279)).

```bash
bun run --filter @flameware/storybook storybook        # 개발 서버 (6006)
bun run --filter @flameware/storybook build-storybook  # 정적 빌드
bun run --filter @flameware/storybook test             # 빌드 + 스토리 테스트
```

## 컴포넌트를 하나 더할 때

1. `stories/<component>/<Component>.stories.tsx`를 만들고 meta를 적는다.

   ```tsx
   const meta = {
     title: "Overlays/Dialog",           // 첫 마디가 분류 — 사이드바 묶음과 순서가 여기서 난다
     component: Dialog,
     parameters: { ds: { status: "preview", since: "0.2.0" } },
   } satisfies Meta<typeof Dialog> & ComponentMeta
   ```

   분류가 열 개(`stories/meta.ts`의 `CATEGORIES`) 밖이면 `satisfies`가 컴파일에서 죽인다. 상태 표는 이 meta를 스스로 읽는다 — 표를 갱신하는 단계는 없다.

2. `stories/<component>/<Component>.mdx`를 쓴다. 뼈대는 `stories/button/Button.mdx`다 — 한 줄 설명 · 언제 쓰는가 / 언제 쓰지 않는가 · 변형 · 상태 · props 표(`<Controls />`).

3. 키보드 계약이 있으면 스토리의 `parameters.keyboard`에 적는다. 포커스 트랩·화살표 이동·Esc 닫기가 모두 같은 어휘로 표현된다:

   ```ts
   { name: "Esc가 닫는다", focus: "[data-testid=content]", press: ["Escape"],
     expect: { focused: "[data-testid=trigger]" } }
   ```

   어휘는 `stories/meta.ts`의 `KeyboardContract`이고, 실행하는 것은 `test/stories.test.mjs`다. 계약을 더하면 테스트가 저절로 그것을 돈다.

## 스토리 테스트가 재는 것

`test/stories.test.mjs`가 정적 빌드를 띄우고 **모든 스토리**를 Chromium으로 열어 셋을 잰다.

| 무엇 | 어떻게 |
| --- | --- |
| axe 접근성 위반 0 | `axe-core`를 주입해 스토리 캔버스에서 돌린다. 페이지 단위 규칙(landmark·h1·region)만 끈다 |
| 포인터 히트 영역 ≥ 24×24 | `document.elementFromPoint`로 실효 히트 영역을 1px 걸음으로 잰다 — 클래스 이름이 아니라 실측이라 `after:`가 넓힌 영역·`overflow-hidden`이 자른 영역·이웃이 가린 영역이 한 계기에 잡힌다 |
| 키보드 계약 | 스토리가 선언한 것을 그대로 눌러 보고, 포커스가 어디 있는지와 화면에 무엇이 적혔는지를 잰다 |

계기를 먼저 검증한다 — 알려진 기하 다섯을 렌더해 계기가 그것을 그대로 읽지 못하면 스토리를 하나도 재기 전에 실패한다. 읽은 값을 믿기 전에 계기를 믿을 수 있어야 한다.

기준선 파일도 예외 목록도 없다. 하한은 하한이고, 미달은 커밋되기 전에 고친다.
