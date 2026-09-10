import * as React from "react"
import type { Preview } from "@storybook/react-vite"
import "@flameware/ui/styles.css"

import theme from "./theme"
import { CATEGORIES } from "../stories/meta"

const preview: Preview = {
  parameters: {
    /* 문서 페이지도 매니저와 같은 테마를 쓴다 — 껍데기만 DS이고 본문은 기본
     * 테마이면 "개발 도구로 읽힌다"는 문제가 그대로 남는다 (ADR-0023 §8).
     *
     * 이 테마는 light 고정이다. 아래 툴바로 dark를 켜면 **스토리는** dark로
     * 그려지고(토큰이 `.dark`를 따른다) 문서의 껍데기는 light로 남는다 — 지금은
     * 그것이 맞다: 문서를 읽는 자리와 컴포넌트를 보는 자리가 다르기 때문이다.
     * 문서 껍데기까지 따라가게 하는 것은 Foundations 챕터(#280)의 몫이다. */
    docs: { theme },
    options: {
      /* 사이드바 순서는 meta에서 온다 (#279, 스토리 33·37). CSF title의 첫 마디가
       * 분류이고, 그 순서를 이 배열이 쥔다 — 알파벳순이면 역할로 찾는 사이드바에서
       * Actions가 Data display 뒤에 온다.
       *
       * 세 가지가 이 모양을 강제한다. Storybook은 이 `options` 하위 트리를 소스에서
       * **정적으로** 읽어 매니저로 넘긴다 — 그래서 (1) 비교 함수를 주면 타입 주석이
       * SyntaxError를 내고, (2) `[...CATEGORIES]`는 "Unknown node type SpreadElement"로
       * 죽는다. 값 리터럴만 건너간다. 그 대가로 목록이 여기 한 번 더 적히므로,
       * (3) `satisfies typeof CATEGORIES`가 둘의 일치를 컴파일 시점에 문다 —
       * 분류를 하나 더하고 여기를 잊으면 tsc가 먼저 죽는다. */
      storySort: {
        order: [
          "Foundations",
          "Actions",
          "Forms",
          "Navigation",
          "Overlays",
          "Feedback",
          "Data display",
          "Layout",
          "Typography",
          "Patterns",
        ] satisfies typeof CATEGORIES,
      },
    },
  },
  globalTypes: {
    theme: {
      description: "Color theme",
      toolbar: {
        title: "Theme",
        icon: "circlehollow",
        items: [
          { value: "light", icon: "sun", title: "Light" },
          { value: "dark", icon: "moon", title: "Dark" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: "light",
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme ?? "light"
      /* 테마 클래스는 문서 루트에 건다. 오버레이 컴포넌트는 내용을 document.body로
       * portal하므로, 클래스를 아래 래퍼에만 걸면 포털로 나간 표면이 테마 범위 밖에
       * 착지해 dark에서도 light로 렌더된다. 배경·글자색은 tokens.css의 base 규칙이
       * body에 칠한다. */
      React.useEffect(() => {
        const root = document.documentElement
        root.classList.toggle("dark", theme === "dark")
        return () => root.classList.remove("dark")
      }, [theme])

      /* 키보드 계약을 DOM으로 내보내는 자리. 스토리 테스트는 Playwright로 이
       * iframe을 열 뿐이라 스토리의 parameters를 볼 길이 없다 — Storybook의 내부
       * 객체(`__STORYBOOK_PREVIEW__`)를 들여다보는 대신, 계약을 문서 루트의
       * data 속성 하나로 **명시적으로** 건네준다. 판이 바뀌어도 이 한 줄만 산다. */
      const keyboard = context.parameters.keyboard
      React.useEffect(() => {
        const root = document.documentElement
        if (keyboard) root.dataset.dsKeyboard = JSON.stringify(keyboard)
        else delete root.dataset.dsKeyboard
        return () => {
          delete root.dataset.dsKeyboard
        }
      }, [keyboard])

      return (
        <div style={{ padding: "1rem", minHeight: "100vh" }}>
          <Story />
        </div>
      )
    },
  ],
}

export default preview
