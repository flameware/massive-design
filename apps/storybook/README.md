# @flameware/storybook

`@flameware/ui`의 문서이자 작업대예요. 컴포넌트를 여기 세우면 접근성과 포인터 크기와
키보드 동작이 함께 측정돼서, 이 앱이 DS의 주요 검사 경로이기도 해요.

## 실행하기

```bash
bun run --filter @flameware/storybook storybook          # 개발 서버 (6006)
bun run --filter @flameware/storybook build-storybook    # 정적 빌드
bun run --filter @flameware/storybook playwright:install  # Chromium 한 번 받기
bun run --filter @flameware/storybook test               # 빌드 + 스토리 테스트
```

`playwright:install`은 이 패키지의 playwright로 실행해요. `bunx playwright`는 npm에서
최신 버전을 받아 와서, 락파일이 고정한 클라이언트가 찾는 브라우저 리비전과 어긋나요.

## 컴포넌트를 하나 더할 때

1. `stories/<component>/<Component>.stories.tsx`를 만들고 meta를 적어요.

   ```tsx
   const meta = {
     title: "Overlays/Dialog",           // 첫 마디가 분류예요. 사이드바 묶음과 순서가 여기서 나요
     component: Dialog,
     parameters: { ds: { status: "preview", since: "0.2.0" } },
   } satisfies Meta<typeof Dialog> & ComponentMeta
   ```

   분류가 `stories/meta.ts`의 `CATEGORIES` 열 개 밖이면 `satisfies`가 컴파일에서
   막아요. 상태 표는 이 meta를 스스로 읽으니 표를 따로 갱신하지 않아도 돼요.

2. `stories/<component>/<Component>.mdx`를 써요. 뼈대는 `stories/button/Button.mdx`와
   같아요. 한 줄 설명, 언제 쓰는가와 언제 쓰지 않는가, 변형, 상태, props 표
   (`<Controls />`) 순서예요. 문장은
   [한국어 글쓰기 규칙](../../docs/agents/writing-ko.md)을 따라요.

3. 키보드 동작이 있으면 스토리의 `parameters.keyboard`에 적어요. 포커스 가둠, 화살표
   이동, Esc 닫기가 모두 같은 형식으로 표현돼요.

   ```ts
   { name: "Esc가 닫는다", focus: "[data-testid=content]", press: ["Escape"],
     expect: { focused: "[data-testid=trigger]" } }
   ```

   형식은 `stories/meta.ts`의 `KeyboardContract`이고, 실행하는 것은
   `test/stories.test.mjs`예요. 항목을 더하면 테스트가 그것을 그대로 눌러 봐요.

4. 루트 [`README.md`](../../README.md)의 컴포넌트 표에 같은 묶음으로 이름을 더해요.
   이 표는 `@flameware/ui`가 내보내는 컴포넌트를 빠짐없이 담는 곳이라, 손으로 고치지
   않으면 새 컴포넌트가 빠져요.

## 스토리 테스트가 재는 것

`test/stories.test.mjs`가 정적 빌드를 띄우고 모든 스토리를 Chromium으로 열어 셋을
재요.

| 무엇 | 어떻게 |
| --- | --- |
| axe 접근성 위반 0 | `axe-core`를 주입해 스토리 캔버스에서 실행해요. 페이지 단위 규칙(landmark, h1, region)만 꺼요 |
| 포인터 히트 영역 24×24 이상 | `document.elementFromPoint`로 실제 히트 영역을 1px 걸음으로 재요. 클래스 이름이 아니라 실측이라 `after:`가 넓힌 영역, `overflow-hidden`이 자른 영역, 이웃이 가린 영역이 한 번에 잡혀요 |
| 키보드 동작 | 스토리가 선언한 키를 그대로 눌러 보고, 포커스가 어디 있는지와 화면에 무엇이 적혔는지를 재요 |

측정 도구를 먼저 검증해요. 알려진 기하 다섯 개를 렌더해 도구가 그 값을 그대로 읽지
못하면 스토리를 하나도 재기 전에 실패해요. 읽은 값을 믿으려면 도구를 먼저 믿을 수
있어야 하기 때문이에요.

기준선 파일도 예외 목록도 없어요. 하한은 하한이고, 미달은 커밋되기 전에 고쳐요.

## 배경

이 앱을 DS의 주요 검사 경로로 삼은 결정은
[ADR-0023](../../docs/adr/0023-second-generation-base-ui.md) §8·§12와
[#279](https://github.com/flameware/massive-design/issues/279)에 있어요.
